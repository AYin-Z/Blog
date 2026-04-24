(function () {
  var params = new URLSearchParams(window.location.search);
  var tag = params.get("tag");
  var bcEl = document.getElementById("tag-bc");
  var h1El = document.getElementById("tag-heading");
  var listEl = document.getElementById("tag-posts");
  var errEl = document.getElementById("tag-error");

  if (!tag) {
    if (bcEl) bcEl.textContent = "未指定";
    if (h1El) h1El.textContent = "未指定标签";
    errEl.hidden = false;
    errEl.textContent = "请在地址栏带上 ?tag=标签名";
    return;
  }

  if (bcEl) bcEl.textContent = tag;
  if (h1El) h1El.textContent = "标签 · " + tag;
  document.title =
    "标签：" + tag + " · " + (window.SITE_CONFIG && window.SITE_CONFIG.title ? window.SITE_CONFIG.title : "Blog");

  async function run() {
    try {
      var posts = await loadPosts();
      var filtered = posts.filter(function (p) {
        return (p.tags || []).indexOf(tag) !== -1;
      });
      listEl.innerHTML = "";
      if (!filtered.length) {
        errEl.hidden = false;
        errEl.textContent = "该标签下还没有文章。";
        return;
      }
      filtered.forEach(function (p) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "post-card";
        a.href = postDetailUrl(p.slug);
        a.innerHTML =
          '<div class="post-card__meta">' +
          formatPostDate(p.date) +
          "</div>" +
          '<h2 class="post-card__title">' +
          escapeHtml(p.title) +
          "</h2>" +
          '<p class="post-card__excerpt">' +
          escapeHtml(p.excerpt || "") +
          "</p>";
        li.appendChild(a);
        listEl.appendChild(li);
      });
    } catch (e) {
      errEl.hidden = false;
      errEl.textContent = e.message || "加载失败";
    }
  }

  run();
})();
