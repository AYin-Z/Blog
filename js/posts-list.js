(function () {
  var listEl = document.getElementById("all-posts");
  var errEl = document.getElementById("list-error");

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
      listEl.innerHTML = "";
      posts.forEach(function (p, i) {
        var li = document.createElement("li");
        if (i === 0) li.className = "v2-card--featured";
        li.appendChild(makeCard(p));
        listEl.appendChild(li);
      });
    } catch (e) {
      errEl.hidden = false;
      errEl.textContent = e.message || "加载失败";
      listEl.innerHTML = "";
    }
  }

  run();
})();
