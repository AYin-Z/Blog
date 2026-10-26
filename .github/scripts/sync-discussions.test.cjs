const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { sync, pages } = require('./sync-discussions.cjs');
const item = (id, body) => ({ id, body, createdAt: '2026-10-25T10:00:00Z', author: { login: 'reader' } });
const connection = nodes => ({ nodes, pageInfo: { hasNextPage: false, endCursor: null } });

test('imports discussion, comment and reply, preserving approved local edits on rerun', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'discussion-sync-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const graphql = async (query, variables) => {
    if (query.includes('repository(')) return { repository: { discussions: connection([{ ...item('D_1', 'Topic'), number: 1 }]) } };
    if (query.includes('... on Discussion {')) return { node: { comments: connection([item('DC_1', 'A real visitor comment')]) } };
    assert.equal(variables.id, 'DC_1');
    return { node: { replies: connection([{ ...item('DC_2', 'Reply'), author: null }]) } };
  };
  assert.equal(await sync(graphql, { owner: 'example', repo: 'blog' }, dir), 3);
  const filename = path.join(dir, '2026-10-25-comment-DC_1.md');
  assert.match(await fs.readFile(filename, 'utf8'), /approved: false/);
  const curated = '---\nname: reader\napproved: true\n---\nEdited by owner\n';
  await fs.writeFile(filename, curated);
  assert.equal(await sync(graphql, { owner: 'example', repo: 'blog' }, dir), 0);
  assert.equal(await fs.readFile(filename, 'utf8'), curated);
  assert.match(await fs.readFile(path.join(dir, '2026-10-25-comment-DC_2.md'), 'utf8'), /name: anonymous/);
});

test('paginates every connection', async () => {
  const calls = [];
  const result = await pages(async (_, vars) => {
    calls.push(vars.cursor);
    return vars.cursor ? connection([2]) : { nodes: [1], pageInfo: { hasNextPage: true, endCursor: 'next' } };
  }, 'query', {}, value => value);
  assert.deepEqual(result, [1, 2]);
  assert.deepEqual(calls, [null, 'next']);
});

test('an API failure propagates without creating output', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'discussion-sync-error-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await assert.rejects(sync(async () => { throw new Error('API denied'); }, {}, dir), /API denied/);
  assert.deepEqual(await fs.readdir(dir), []);
});

test('empty repositories succeed without creating a comments directory', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'discussion-sync-empty-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const dir = path.join(root, '_comments');
  assert.equal(await sync(async () => ({ repository: { discussions: connection([]) } }), {}, dir), 0);
  await assert.rejects(fs.access(dir), { code: 'ENOENT' });
});
