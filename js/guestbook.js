(function () {
  var wrap = document.querySelector(".giscus");
  var errEl = document.getElementById("guestbook-error");

  function giscusTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function sendGiscusTheme() {
    var iframe = document.querySelector("iframe.giscus-frame");
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme() } } },
        "https://giscus.app"
      );
    } catch (e) {}
  }

  if (!wrap) return;

  // Theme sync
  window.addEventListener("blog-theme-change", sendGiscusTheme);
  var tries = 0;
  var tid = setInterval(function () {
    tries++;
    if (document.querySelector("iframe.giscus-frame")) {
      sendGiscusTheme();
      clearInterval(tid);
    } else if (tries > 75) {
      clearInterval(tid);
    }
  }, 200);

  // Load featured comments
  var featuredEl = document.getElementById("featured-messages");
  if (featuredEl) {
    fetch("data/featured-comments.json")
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (comments) {
        if (!comments.length) { featuredEl.hidden = true; return; }
        featuredEl.innerHTML = "<h2 class='section-title'>精选留言</h2>" +
          comments.map(function (c) {
            return '<div class="featured-item">' +
              '<p class="featured-author">' + escapeHtml(c.author || "匿名") + '</p>' +
              '<p class="featured-text">' + escapeHtml(c.text || "") + '</p>' +
              "</div>";
          }).join("");
      })
      .catch(function () { featuredEl.hidden = true; });
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
})();
