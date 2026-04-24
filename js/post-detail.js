(function () {
  var params = new URLSearchParams(window.location.search);
  var slug = params.get("slug");
  var titleEl = document.getElementById("article-title");
  var timeEl = document.getElementById("article-date");
  var bodyEl = document.getElementById("article-body");
  var errEl = document.getElementById("article-error");
  var bcEl = document.getElementById("breadcrumb-current");

  if (!slug) {
    errEl.hidden = false;
    errEl.classList.add("msg--error");
    errEl.textContent = "缺少文章参数。请从文章列表进入。";
    return;
  }

  function stripYamlFrontmatter(md) {
    if (typeof md !== "string" || md.substring(0, 3) !== "---") return md;
    var m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!m) return md;
    return md.slice(m[0].length).replace(/^\n+/, "");
  }

  function convertObsidianEmbeds(md) {
    // Convert ![[file]] to ![](file)
    md = md.replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function(match, filename, alias) {
      return "![" + (alias || filename) + "](" + filename + ")";
    });
    return md;
  }

  function renderMath() {
    if (typeof renderMathInElement !== "function") return;
    renderMathInElement(bodyEl, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
      strict: false,
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    });
  }

  async function run() {
    try {
      var posts = await loadPosts();
      var meta = posts.find(function (p) {
        return p.slug === slug;
      });

      if (meta) {
        titleEl.textContent = meta.title;
        timeEl.dateTime = meta.date;
        timeEl.textContent = formatPostDate(meta.date);
        if (bcEl) bcEl.textContent = meta.title;
        document.title =
          meta.title + " · " + (window.SITE_CONFIG && window.SITE_CONFIG.title ? window.SITE_CONFIG.title : "Blog");
      } else {
        titleEl.textContent = slug;
        timeEl.textContent = "";
        if (bcEl) bcEl.textContent = slug;
      }

      var tagsEl = document.getElementById("article-tags");
      if (tagsEl && meta && meta.tags && meta.tags.length) {
        tagsEl.innerHTML =
          '<span class="meta-label">标签</span> ' +
          meta.tags
            .map(function (t) {
              return '<a class="tag-pill tag-pill--link" href="' + tagPageUrl(t) + '">' + escapeHtml(t) + "</a>";
            })
            .join("");
        tagsEl.hidden = false;
      }

      var mdRes = await fetch("posts/" + encodeURIComponent(slug) + ".md");
      if (!mdRes.ok) {
        throw new Error("找不到该文章的 Markdown 文件（posts/" + slug + ".md）。");
      }
      var md = await mdRes.text();
      md = stripYamlFrontmatter(md);
      md = convertObsidianEmbeds(md);
      bodyEl.innerHTML = marked.parse(md, { gfm: true, breaks: true });
      renderMath();
    } catch (e) {
      errEl.hidden = false;
      errEl.classList.add("msg--error");
      errEl.textContent = e.message || "加载失败";
      bodyEl.innerHTML = "";
    }
  }

  run();
})();
