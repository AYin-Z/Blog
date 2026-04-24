(function () {
  var cfg = window.SITE_CONFIG;
  if (!cfg) return;

  var page = document.body.getAttribute("data-page") || "";
  var headerEl = document.getElementById("site-header");
  var footerEl = document.getElementById("site-footer");

  function navHtml() {
    var items = cfg.nav
      .map(function (item) {
        var active = item.id === page ? ' class="is-active"' : "";
        return '<a href="' + item.href + '"' + active + ">" + escapeHtml(item.label) + "</a>";
      })
      .join("");
    return (
      '<div class="site-header__inner">' +
      '<a class="logo" href="index.html">' +
      cfg.logoHtml +
      "</a>" +
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
      '<div class="footer-grid">' +
      cols +
      "</div>" +
      '<p class="footer-note">' +
      escapeHtml(cfg.footerNote) +
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
  footerHtml();

  function applyTheme(mode) {
    if (mode === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem("blog-theme", mode);
    } catch (e) {}
  }

  try {
    var saved = localStorage.getItem("blog-theme");
    if (saved === "light") applyTheme("light");
  } catch (e) {}

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var isLight = document.documentElement.getAttribute("data-theme") === "light";
      applyTheme(isLight ? "dark" : "light");
    });
  }
})();
