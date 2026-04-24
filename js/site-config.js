/**
 * 站点配置：导航、页脚外链、留言表单。
 * Formspree：https://formspree.io 注册表单后，把提交 URL 填到 formspreeMessageUrl（仅你收邮件，访客看不到历史留言）。
 * 精选展示：编辑 data/featured-comments.json 后提交仓库。
 */
window.SITE_CONFIG = {
  title: "YINZ7032's Blog",
  /** 显示在左上角 logo 内，可用 <span> 高亮一节 */
  logoHtml: 'YINZ<span>7032</span>',
  nav: [
    { id: "home", label: "首页", href: "index.html" },
    { id: "categories", label: "分类", href: "categories.html" },
    { id: "tags", label: "标签", href: "tags.html" },
    { id: "archives", label: "归档", href: "archives.html" },
    { id: "posts", label: "文章", href: "posts.html" },
    { id: "guestbook", label: "留言", href: "guestbook.html" },
    { id: "about", label: "关于", href: "about.html" },
  ],
  /** 页脚多列外链，可按需增删改 */
  footerColumns: [
    {
      title: "链接",
      links: [
        { label: "GitHub", href: "https://github.com/AYin-Z" },
        {
          label: "YINZ7032",
          href: "https://www.luogu.com.cn/space/show?username=YINZ7032",
        },
        { label: "知乎", href: "https://www.zhihu.com/people/chuan-qi-yz" },
        { label: "哔哩哔哩", href: "https://space.bilibili.com/571856369" },
      ],
    },
  ],
  footerNote: "Per aspera ad astra. · 静态托管 GitHub Pages",
  /** 留空则留言表单隐藏，仅显示说明与精选区 */
  formspreeMessageUrl: "",
};
