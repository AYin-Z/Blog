(function () {
  var listEl = document.getElementById("recent-posts");
  var errEl = document.getElementById("home-error");
  var featureSection = document.getElementById("home-featured");
  var featureEl = document.getElementById("featured-post");

  function textElement(tag, className, text) {
    var element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }

  function postLink(post, featured) {
    var link = document.createElement("a");
    link.className = featured ? "night-feature" : "night-post";
    link.href = postDetailUrl(post.slug);
    if (featured) {
      link.appendChild(textElement("span", "night-feature__mark", "✦"));
      link.firstChild.setAttribute("aria-hidden", "true");
    }
    var content = document.createElement("div");
    content.className = "night-post__content";
    var meta = textElement("div", "night-post__meta", post.category + " / ");
    var time = textElement("time", "", formatPostDate(post.date));
    time.dateTime = post.date;
    meta.appendChild(time);
    content.appendChild(meta);
    content.appendChild(textElement("h3", "night-post__title", post.title));
    if (post.excerpt) content.appendChild(textElement("p", "night-post__excerpt", post.excerpt));
    if (featured) content.appendChild(textElement("span", "night-feature__read", "读这篇文字 ↗"));
    link.appendChild(content);
    if (!featured) {
      var arrow = textElement("span", "night-post__arrow", "↗");
      arrow.setAttribute("aria-hidden", "true");
      link.appendChild(arrow);
    }
    return link;
  }

  async function run() {
    try {
      var posts = await loadPosts();
      listEl.replaceChildren();
      if (!posts.length) {
        errEl.hidden = false;
        errEl.textContent = "第一篇手记，正在路上。";
        return;
      }
      var preferred = window.SITE_CONFIG && window.SITE_CONFIG.homeFeaturedSlug;
      var featured = posts.find(function (post) { return post.slug === preferred; }) ||
        posts.find(function (post) { return post.pinned; }) || posts[0];
      featureEl.replaceChildren(postLink(featured, true));
      featureSection.hidden = false;
      // Recent writing is chronological, independent of the archive's pinned ordering.
      var recent = posts.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 5);
      recent.forEach(function (post) {
        var item = document.createElement("li");
        item.appendChild(postLink(post, false));
        listEl.appendChild(item);
      });
    } catch (error) {
      listEl.replaceChildren();
      featureSection.hidden = true;
      errEl.hidden = false;
      errEl.classList.add("msg--error");
      errEl.textContent = "暂时无法打开手记，请稍后刷新重试。";
    }
  }
  run();
})();
