(function () {
  var wrap = document.getElementById("archives-wrap");
  var errEl = document.getElementById("archives-error");

  async function run() {
    try {
      var posts = await loadPosts();
      var byYear = {};
      posts.forEach(function (p) {
        var y = (p.date || "").slice(0, 4) || "未知";
        if (!byYear[y]) byYear[y] = [];
        byYear[y].push(p);
      });
      var years = Object.keys(byYear).sort(function (a, b) {
        return b.localeCompare(a);
      });
      wrap.innerHTML = "";
      years.forEach(function (y) {
        var section = document.createElement("section");
        section.className = "archive-year";
        var h = document.createElement("h2");
        h.className = "archive-year__title";
        h.textContent = y + " 年";
        var ul = document.createElement("ul");
        ul.className = "archive-list";
        byYear[y].forEach(function (p) {
          var li = document.createElement("li");
          li.className = "archive-item";
          var pin = p.pinned ? '<span class="pin-badge">置顶</span> ' : "";
          li.innerHTML =
            '<time class="archive-item__date" datetime="' +
            escapeAttr(p.date) +
            '">' +
            (p.date && p.date.length >= 10 ? p.date.slice(5, 10) : "") +
            "</time>" +
            '<a class="archive-item__link" href="' +
            postDetailUrl(p.slug) +
            '">' +
            pin +
            escapeHtml(p.title) +
            "</a>";
          ul.appendChild(li);
        });
        section.appendChild(h);
        section.appendChild(ul);
        wrap.appendChild(section);
      });
    } catch (e) {
      errEl.hidden = false;
      errEl.textContent = e.message || "加载失败";
    }
  }

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  run();
})();
