(function () {
  var wrap = document.getElementById("giscus-container");
  var errEl = document.getElementById("guestbook-error");
  var cfg = window.SITE_CONFIG && window.SITE_CONFIG.giscus;

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

  if (!cfg || !cfg.repo || !String(cfg.repoId || "").trim() || !String(cfg.categoryId || "").trim()) {
    if (errEl) {
      errEl.hidden = false;
      errEl.innerHTML =
        "请先在 GitHub 仓库启用 <strong>Discussions</strong>，再打开 " +
        '<a href="https://giscus.app/zh-CN" rel="noopener noreferrer" target="_blank">giscus.app</a> ' +
        "生成配置，将 <code>data-repo-id</code>、<code>data-category-id</code> 填入 " +
        "<code>js/site-config.js</code> 的 <code>giscus.repoId</code> 与 <code>giscus.categoryId</code>。";
    }
    wrap.innerHTML =
      '<p class="page-desc">留言基于 GitHub Discussions，访客需登录 GitHub 评论；你可以在 Discussion 里回复、加标签或锁定话题。</p>';
    return;
  }

  if (errEl) errEl.hidden = true;

  var script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.setAttribute("crossorigin", "anonymous");
  script.setAttribute("data-repo", cfg.repo);
  script.setAttribute("data-repo-id", String(cfg.repoId).trim());
  script.setAttribute("data-category", cfg.category || "Announcements");
  script.setAttribute("data-category-id", String(cfg.categoryId).trim());
  script.setAttribute("data-mapping", cfg.mapping || "pathname");
  script.setAttribute("data-strict", String(cfg.strict != null ? cfg.strict : 0));
  script.setAttribute("data-reactions-enabled", cfg.reactionsEnabled === false ? "0" : "1");
  script.setAttribute("data-emit-metadata", cfg.emitMetadata ? "1" : "0");
  script.setAttribute("data-input-position", cfg.inputPosition || "bottom");
  script.setAttribute("data-theme", giscusTheme());
  script.setAttribute("data-lang", cfg.lang || "zh-CN");
  wrap.appendChild(script);

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
})();
