(function () {
  const listEl = document.getElementById("recent-posts");
  const errEl = document.getElementById("home-error");

  async function run() {
    try {
      const posts = await loadPosts();
      const recent = posts.slice(0, 5);
      listEl.innerHTML = "";
      recent.forEach((p) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "post-card";
        a.href = postDetailUrl(p.slug);
        a.innerHTML = `
          <div class="post-card__meta">${formatPostDate(p.date)}</div>
          <h2 class="post-card__title">${escapeHtml(p.title)}</h2>
          <p class="post-card__excerpt">${escapeHtml(p.excerpt || "")}</p>
        `;
        li.appendChild(a);
        listEl.appendChild(li);
      });
    } catch (e) {
      errEl.hidden = false;
      errEl.textContent = e.message || "加载失败";
      listEl.innerHTML = "";
    }
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  run();
})();
