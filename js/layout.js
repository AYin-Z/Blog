(function () {
  var cfg = window.SITE_CONFIG;
  if (!cfg) return;

  var page = document.body.getAttribute("data-page") || "";
  var headerEl = document.getElementById("site-header");
  var footerEl = document.getElementById("site-footer");

  function navHtml() {
    var items = cfg.nav
      .map(function (item) {
        var section = ["categories", "category", "tags", "tag"].indexOf(page) !== -1 ? "posts" : page;
        var active = item.id === section ? ' class="is-active" aria-current="page"' : "";
        return '<a href="' + item.href + '"' + active + ">" + escapeHtml(item.label) + "</a>";
      })
      .join("");
    return (
      '<div class="site-header__inner">' +
      '<a class="logo" href="index.html">' +
      cfg.logoHtml +
      "</a>" +
      '<span class="site-tagline">文字的自留地</span>' +
      '<nav class="nav" aria-label="主导航">' +
      items +
      "</nav>" +
      '<button type="button" class="theme-toggle" id="theme-toggle" title="切换浅色/深色" aria-label="切换主题">' +
      '<span class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">☀</span>' +
      '<span class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">☾</span>' +
      "</button>" +
      "</div>"
    );
  }

  function footerHtml() {
    if (!footerEl || !footerEl.classList.contains("site-footer--rich")) {
      if (footerEl && cfg.footerNote) {
        footerEl.innerHTML = "<p>" + escapeHtml(cfg.footerNote) + "</p>";
      }
      return;
    }
    var cols = (cfg.footerColumns || [])
      .map(function (col) {
        var links = (col.links || [])
          .map(function (l) {
            return (
              "<li><a href=\"" +
              escapeAttr(l.href) +
              '" rel="noopener noreferrer" target="_blank">' +
              escapeHtml(l.label) +
              "</a></li>"
            );
          })
          .join("");
        return (
          '<div class="footer-col">' +
          '<div class="footer-col__title">' +
          escapeHtml(col.title) +
          "</div>" +
          "<ul>" +
          links +
          "</ul>" +
          "</div>"
        );
      })
      .join("");
    footerEl.innerHTML =
      '<div class="footer-signature"><span>YINZ7032 · 一个文字记录者</span><span>欢迎停留，也欢迎再来。</span></div>' +
      '<div class="footer-grid">' +
      cols +
      "</div>" +
      '<p class="footer-note">' +
      escapeHtml(cfg.footerNote) +
      '<span id="busuanzi_container_site_uv"> · 本站访客 <span id="busuanzi_value_site_uv"></span> 人</span>' +
      "</p>";
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  if (headerEl) headerEl.innerHTML = navHtml();
  var main = document.querySelector("main");
  if (main) {
    main.id = "main-content";
    var skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#main-content";
    skip.textContent = "跳到正文";
    document.body.insertBefore(skip, document.body.firstChild);
  }
  footerHtml();

  function applyTheme(mode) {
    if (mode === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    var themeButton = document.getElementById("theme-toggle");
    if (themeButton) {
      var label = mode === "light" ? "切换深色阅读" : "切换浅色阅读";
      themeButton.setAttribute("aria-label", label);
      themeButton.title = label;
    }
    try {
      localStorage.setItem("blog-theme", mode);
    } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent("blog-theme-change", { detail: { mode: mode } }));
    } catch (e) {}
  }

  try {
    var saved = localStorage.getItem("blog-theme");
    applyTheme(saved === "light" ? "light" : "dark");
  } catch (e) {}

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var isLight = document.documentElement.getAttribute("data-theme") === "light";
      applyTheme(isLight ? "dark" : "light");
    });
  }
})();
