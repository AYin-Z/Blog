(function () {
  var listEl = document.getElementById("all-posts");
  var errEl = document.getElementById("list-error");

  async function run() {
    try {
      var posts = await loadPosts();
      listEl.innerHTML = "";
      posts.forEach(function (p) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "post-card";
        a.href = postDetailUrl(p.slug);
        var pin = p.pinned ? '<span class="pin-badge">置顶</span> ' : "";
        a.innerHTML =
          '<div class="post-card__meta">' +
          pin +
          formatPostDate(p.date) +
          (p.category ? " · " + escapeHtml(p.category) : "") +
          "</div>" +
          '<h2 class="post-card__title">' +
          escapeHtml(p.title) +
          "</h2>" +
          postTagsHtml(p.tags) +
          '<p class="post-card__excerpt">' +
          escapeHtml(p.excerpt || "") +
          "</p>";
        li.appendChild(a);
        listEl.appendChild(li);
      });
    } catch (e) {
      errEl.hidden = false;
      errEl.textContent = e.message || "加载失败";
      listEl.innerHTML = "";
    }
  }

  run();
})();
