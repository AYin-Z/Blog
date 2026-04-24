(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const titleEl = document.getElementById("article-title");
  const timeEl = document.getElementById("article-date");
  const bodyEl = document.getElementById("article-body");
  const errEl = document.getElementById("article-error");

  if (!slug) {
    errEl.hidden = false;
    errEl.classList.add("msg--error");
    errEl.textContent = "缺少文章参数。请从文章列表进入。";
    return;
  }

  async function run() {
    try {
      const posts = await loadPosts();
      const meta = posts.find((p) => p.slug === slug);

      if (meta) {
        titleEl.textContent = meta.title;
        timeEl.dateTime = meta.date;
        timeEl.textContent = formatPostDate(meta.date);
      } else {
        titleEl.textContent = slug;
        timeEl.textContent = "";
      }

      const mdRes = await fetch(`posts/${encodeURIComponent(slug)}.md`);
      if (!mdRes.ok) {
        throw new Error("找不到该文章的 Markdown 文件（posts/" + slug + ".md）。");
      }
      const md = await mdRes.text();
      bodyEl.innerHTML = marked.parse(md, { gfm: true, breaks: true });
      document.title = (meta && meta.title ? meta.title + " · " : "") + "Blog";
    } catch (e) {
      errEl.hidden = false;
      errEl.classList.add("msg--error");
      errEl.textContent = e.message || "加载失败";
      bodyEl.innerHTML = "";
    }
  }

  run();
})();
