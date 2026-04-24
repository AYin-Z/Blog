(function () {
  var grid = document.getElementById("category-grid");
  var errEl = document.getElementById("categories-error");

  async function run() {
    try {
      var posts = await loadPosts();
      var map = {};
      posts.forEach(function (p) {
        var c = p.category || "孤岛";
        map[c] = (map[c] || 0) + 1;
      });
      var cats = Object.keys(map).sort(function (a, b) {
        return map[b] - map[a] || a.localeCompare(b, "zh-CN");
      });
      grid.innerHTML = "";
      cats.forEach(function (cat) {
        var n = map[cat];
        var hue = tagHue(cat);
        var a = document.createElement("a");
        a.className = "tag-card tag-card--category";
        a.href = categoryPageUrl(cat);
        a.style.setProperty("--tag-hue", String(hue));
        a.innerHTML =
          '<div class="tag-card__name">' +
          escapeHtml(cat) +
          "</div>" +
          '<div class="tag-card__count">' +
          n +
          " 篇</div>" +
          '<div class="tag-card__arrow" aria-hidden="true">→</div>';
        grid.appendChild(a);
      });
    } catch (e) {
      errEl.hidden = false;
      errEl.textContent = e.message || "加载失败";
    }
  }

  run();
})();
