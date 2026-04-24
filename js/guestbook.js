(function () {
  var listEl = document.getElementById("featured-messages");
  var errEl = document.getElementById("guestbook-error");
  var cfg = window.SITE_CONFIG;

  async function loadFeatured() {
    try {
      var res = await fetch("data/featured-comments.json");
      if (!res.ok) throw new Error("无法加载精选留言");
      var data = await res.json();
      listEl.innerHTML = "";
      if (!data.length) {
        listEl.innerHTML = '<p class="page-desc">暂无精选留言。你可以在仓库中编辑 data/featured-comments.json 添加展示内容。</p>';
        return;
      }
      data.forEach(function (item) {
        var card = document.createElement("blockquote");
        card.className = "featured-msg";
        card.innerHTML =
          '<p class="featured-msg__text">' +
          escapeHtml(item.message || "") +
          "</p>" +
          '<footer class="featured-msg__meta">— ' +
          escapeHtml(item.author || "匿名") +
          " · " +
          escapeHtml(item.date || "") +
          "</footer>";
        listEl.appendChild(card);
      });
    } catch (e) {
      errEl.hidden = false;
      errEl.textContent = e.message || "加载失败";
    }
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  loadFeatured();
})();
