(function () {
  var grid = document.getElementById("tag-grid");
  var errEl = document.getElementById("tags-error");

  async function run() {
    try {
      var posts = await loadPosts();
      var map = {};
      posts.forEach(function (p) {
        (p.tags || []).forEach(function (t) {
          if (!t) return;
          map[t] = (map[t] || 0) + 1;
        });
      });
      var tags = Object.keys(map).sort(function (a, b) {
        return map[b] - map[a] || a.localeCompare(b, "zh-CN");
      });
      grid.innerHTML = "";
      tags.forEach(function (tag) {
        var n = map[tag];
        var hue = tagHue(tag);
        var a = document.createElement("a");
        a.className = "tag-card";
        a.href = tagPageUrl(tag);
        a.style.setProperty("--tag-hue", String(hue));
        a.innerHTML =
          '<div class="tag-card__name">' +
          escapeHtml(tag) +
          "</div>" +
          '<div class="tag-card__count">' +
          n +
          " 篇</div>" +
          '<div class="tag-card__arrow" aria-hidden="true">→</div>';
        grid.appendChild(a);
      });
      if (!tags.length) grid.innerHTML = '<p class="page-desc">暂无标签，请在 posts.json 为文章添加 tags 字段。</p>';
    } catch (e) {
      errEl.hidden = false;
      errEl.textContent = e.message || "加载失败";
    }
  }

  run();
})();
