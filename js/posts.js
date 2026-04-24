/**
 * Load and sort posts index (posts.json).
 */
async function loadPosts() {
  const res = await fetch("posts.json");
  if (!res.ok) throw new Error("无法加载文章索引 posts.json");
  const data = await res.json();
  return data.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function formatPostDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function postDetailUrl(slug) {
  return `post.html?slug=${encodeURIComponent(slug)}`;
}
