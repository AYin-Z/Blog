/**
 * 文章索引：posts.json；置顶、标签、分类。
 */
function normalizePost(p) {
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt || "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    category: p.category || "孤岛",
    pinned: !!p.pinned,
  };
}

async function loadPosts() {
  var res = await fetch("posts.json");
  if (!res.ok) throw new Error("无法加载文章索引 posts.json");
  var data = await res.json();
  var list = data.map(normalizePost);
  return list.sort(function (a, b) {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });
}

function formatPostDate(iso) {
  try {
    var d = new Date(iso);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return iso;
  }
}

function postDetailUrl(slug) {
  return "post.html?slug=" + encodeURIComponent(slug);
}

function tagPageUrl(tag) {
  return "tag.html?tag=" + encodeURIComponent(tag);
}

function categoryPageUrl(cat) {
  return "category.html?cat=" + encodeURIComponent(cat);
}

/** 为标签卡片生成稳定色相 */
function tagHue(name) {
  var h = 0;
  var s = String(name);
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function escapeHtml(s) {
  var d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

function postTagsHtml(tags) {
  if (!tags || !tags.length) return "";
  return (
    '<div class="post-card__tags">' +
    tags.map(function (t) {
      return '<span class="tag-pill">' + escapeHtml(t) + "</span>";
    }).join("") +
    "</div>"
  );
}
