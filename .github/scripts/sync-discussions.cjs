const fs = require('node:fs/promises');
const path = require('node:path');

const fields = 'id body createdAt author { login }';
const discussionsQuery = `query($owner:String!, $repo:String!, $cursor:String) {
  repository(owner:$owner, name:$repo) {
    discussions(first:100, after:$cursor) {
      nodes { number ${fields} }
      pageInfo { hasNextPage endCursor }
    }
  }
}`;
const commentsQuery = `query($id:ID!, $cursor:String) {
  node(id:$id) { ... on Discussion {
    comments(first:100, after:$cursor) {
      nodes { ${fields} }
      pageInfo { hasNextPage endCursor }
    }
  } }
}`;
const repliesQuery = `query($id:ID!, $cursor:String) {
  node(id:$id) { ... on DiscussionComment {
    replies(first:100, after:$cursor) {
      nodes { ${fields} }
      pageInfo { hasNextPage endCursor }
    }
  } }
}`;

async function pages(graphql, query, variables, select) {
  const nodes = [];
  let cursor = null;
  do {
    const connection = select(await graphql(query, { ...variables, cursor }));
    if (!connection || !Array.isArray(connection.nodes)) {
      throw new Error('GitHub returned an incomplete discussion connection');
    }
    nodes.push(...connection.nodes);
    const next = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
    if (connection.pageInfo.hasNextPage && (!next || next === cursor)) {
      throw new Error('GitHub returned an invalid pagination cursor');
    }
    cursor = next;
  } while (cursor);
  return nodes;
}

async function sync(graphql, repo, directory = '_comments') {
  // Fetch everything first: API errors must fail the run before writing files.
  const discussions = await pages(graphql, discussionsQuery, repo,
    result => result.repository?.discussions);
  const imports = [];
  for (const discussion of discussions) {
    imports.push({ ...discussion, key: `discussion-${discussion.number}` });
    const comments = await pages(graphql, commentsQuery, { id: discussion.id },
      result => result.node?.comments);
    for (const comment of comments) {
      imports.push({ ...comment, key: `comment-${comment.id}` });
      const replies = await pages(graphql, repliesQuery, { id: comment.id },
        result => result.node?.replies);
      imports.push(...replies.map(reply => ({ ...reply, key: `comment-${reply.id}` })));
    }
  }
  let created = 0;
  for (const item of imports) {
    const body = (item.body || '').trim();
    if (!body) continue;
    const date = item.createdAt;
    if (!/^\d{4}-\d{2}-\d{2}T/.test(date) || !/^[\w-]+$/.test(item.key)) {
      throw new Error('Invalid GitHub comment identity or timestamp');
    }
    const author = item.author?.login || 'anonymous';
    if (!/^[\w\[\]-]+$/.test(author)) throw new Error('Invalid GitHub author login');
    await fs.mkdir(directory, { recursive: true });
    const filename = path.join(directory, `${date.slice(0, 10)}-${item.key}.md`);
    const content = `---\nname: ${author}\ndate: ${date}\napproved: false\n---\n\n${body}\n`;
    try {
      // Existing files belong to the curator: never reset approval or edits.
      await fs.writeFile(filename, content, { encoding: 'utf8', flag: 'wx' });
      created++;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  console.log(`Imported ${created} new files from ${discussions.length} discussions`);
  return created;
}

module.exports = { sync, pages };
