# 欢迎来到我的博客

这是一个部署在 **GitHub Pages** 上的静态个人博客，页面由纯 HTML、CSS 与 JavaScript 构成，文章以 Markdown 形式存放在 `posts` 目录中。

## 插图示例

使用**相对网站根目录**的路径引用图片（与 Obsidian 同仓时便于对齐）：

![](posts/welcome/demo.svg)

## 你可以这样使用

1. 在 `posts` 文件夹里新增 `.md` 文件（可按文章建子文件夹放附件）。
2. 打开根目录的 `posts.json`，为每篇文章添加一条记录（`slug` 需与 `.md` 文件名一致，可补充 `category`、`tags`、`pinned`）。
3. 将改动推送到 GitHub；Pages 启用分支与根目录见「关于」页说明。

## 页面说明

- **首页**：简介与最近文章。
- **分类 / 标签 / 归档**：按结构浏览。
- **文章详情**：`post.html?slug=文章slug`，支持 LaTeX、图片与嵌入 HTML 媒体标签。

祝写作愉快。
