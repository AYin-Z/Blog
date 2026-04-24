(function () {
  var listEl = document.getElementById("featured-messages");
  var errEl = document.getElementById("guestbook-error");
  var formWrap = document.getElementById("guestbook-form-wrap");
  var cfg = window.SITE_CONFIG;

  async function loadFeatured() {
    try {
      var res = await fetch("data/featured-comments.json");
      if (!res.ok) throw new Error("无法加载精选留言");
      var data = await res.json();
      listEl.innerHTML = "";
      if (!data.length) {
        listEl.innerHTML = '<p class="page-desc">暂无精选留言。你可以在仓库中编辑 data/featured-comments.json 添加展示内容。</p>';
        return;
      }
      data.forEach(function (item) {
        var card = document.createElement("blockquote");
        card.className = "featured-msg";
        card.innerHTML =
          '<p class="featured-msg__text">' +
          escapeHtml(item.message || "") +
          "</p>" +
          '<footer class="featured-msg__meta">— ' +
          escapeHtml(item.author || "匿名") +
          " · " +
          escapeHtml(item.date || "") +
          "</footer>";
        listEl.appendChild(card);
      });
    } catch (e) {
      errEl.hidden = false;
      errEl.textContent = e.message || "加载失败";
    }
  }

  function setupForm() {
    if (!formWrap) return;
    var url = cfg && cfg.formspreeMessageUrl;
    if (!url) {
      formWrap.innerHTML =
        '<div class="msg">' +
        "<strong>私密留言</strong>：在 <code>js/site-config.js</code> 中填写 <code>formspreeMessageUrl</code>（Formspree 表单地址）后，访客可通过下方表单给你发消息，内容仅发送到你的邮箱，不会公开展示。你可将愿意展示的条目手动写入 <code>data/featured-comments.json</code>。" +
        "</div>";
      return;
    }
    formWrap.innerHTML =
      '<form class="guestbook-form" action="' +
      escapeAttr(url) +
      '" method="POST">' +
      '<label class="form-field"><span>称呼（可选）</span><input type="text" name="name" autocomplete="nickname" /></label>' +
      '<label class="form-field"><span>邮箱（可选，便于回复）</span><input type="email" name="email" autocomplete="email" /></label>' +
      '<label class="form-field"><span>留言</span><textarea name="message" rows="5" required placeholder="仅站长可见；精选内容由站长手动发布。"></textarea></label>' +
      '<input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />' +
      '<button type="submit" class="btn-primary">发送</button>' +
      "</form>";
  }

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  setupForm();
  loadFeatured();
})();
