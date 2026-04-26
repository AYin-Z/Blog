/**
 * busuanzi 容错 + localStorage PV 备用计数
 *
 * 不蒜子加载成功 → 显示真实数据
 * 不蒜子加载失败 → 用 localStorage 近似计数，优雅降级
 */
(function () {
  var BUSUANZI_URL = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
  var TIMEOUT = 5000; // 5s 超时

  // localStorage 近似计数
  function localPV(key) {
    try {
      var k = "blog_pv_" + key;
      var n = parseInt(localStorage.getItem(k) || "0", 10) + 1;
      localStorage.setItem(k, String(n));
      return n;
    } catch (e) {
      return 1;
    }
  }

  function fallback() {
    // 全站 UV
    var siteEl = document.getElementById("busuanzi_container_site_uv");
    var siteVal = document.getElementById("busuanzi_value_site_uv");
    if (siteEl && siteVal) {
      siteVal.textContent = localPV("site_uv");
      siteEl.style.display = "";
    }
    // 文章 PV
    var pageEl = document.getElementById("busuanzi_container_page_pv");
    var pageVal = document.getElementById("busuanzi_value_page_pv");
    if (pageEl && pageVal) {
      var slug = new URLSearchParams(window.location.search).get("slug") || "_index";
      pageVal.textContent = localPV("page_" + slug);
      pageEl.style.display = "";
    }
  }

  // 尝试加载不蒜子
  var loaded = false;
  var script = document.createElement("script");
  script.src = BUSUANZI_URL;
  script.async = true;
  script.onload = function () {
    loaded = true;
    // 不蒜子会自动填充值并显示 container
    // 但某些情况下 container 仍然隐藏，强制显示
    setTimeout(function () {
      var els = document.querySelectorAll('[id^="busuanzi_container_"]');
      els.forEach(function (el) {
        if (el.style.display === "none" || el.style.display === "") {
          var val = el.querySelector('[id^="busuanzi_value_"]');
          if (val && val.textContent && val.textContent !== "0") {
            el.style.display = "";
          }
        }
      });
      // 如果还是没有值，fallback
      var siteVal = document.getElementById("busuanzi_value_site_uv");
      if (siteVal && (!siteVal.textContent || siteVal.textContent === "")) {
        fallback();
      }
    }, 2000);
  };
  script.onerror = function () {
    fallback();
  };
  document.head.appendChild(script);

  // 超时 fallback
  setTimeout(function () {
    if (!loaded) fallback();
  }, TIMEOUT);
})();
