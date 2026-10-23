(function () {
  var params = new URLSearchParams(window.location.search);
  var cat = params.get("cat");
  var bcEl = document.getElementById("category-bc");
  var h1El = document.getElementById("category-heading");
  var listEl = document.getElementById("category-posts");
  var errEl = document.getElementById("category-error");

  if (!cat) {
    if (bcEl) bcEl.textContent = "未指定";
    if (h1El) h1El.textContent = "未指定分类";
    errEl.hidden = false;
    errEl.textContent = "请在地址栏带上 ?cat=分类名";
    return;
  }

  if (bcEl) bcEl.textContent = cat;
  if (h1El) h1El.textContent = "分类 · " + cat;
  document.title =
    "分类：" + cat + " · " + (window.SITE_CONFIG && window.SITE_CONFIG.title ? window.SITE_CONFIG.title : "Blog");

  /** createPostCard 来自 posts.js；若脚本缓存错乱缺失，降级为旧卡片渲染 */
  function makeCard(p) {
    if (typeof createPostCard === "function") return createPostCard(p);
    var a = document.createElement("a");
    a.className = "post-card";
    a.href = postDetailUrl(p.slug);
    a.innerHTML =
      '<div class="post-card__meta">' + formatPostDate(p.date) +
      (p.pinned ? " · 置顶" : "") + "</div>" +
      '<h2 class="post-card__title">' + escapeHtml(p.title) + "</h2>" +
      postTagsHtml(p.tags);
    return a;
  }

  async function run() {
    try {
      var posts = await loadPosts();
      var filtered = posts.filter(function (p) {
        return (p.category || "孤岛") === cat;
      });
      listEl.innerHTML = "";
      if (!filtered.length) {
        errEl.hidden = false;
        errEl.textContent = "该分类下还没有文章。";
        return;
      }
      filtered.forEach(function (p, i) {
        var li = document.createElement("li");
        if (i === 0) li.className = "v2-card--featured";
        li.appendChild(makeCard(p));
        listEl.appendChild(li);
      });
    } catch (e) {
      errEl.hidden = false;
      errEl.textContent = e.message || "加载失败";
    }
  }

  run();
})();
