---
title: 欢迎来到我的博客
date: 2026-04-24
categories:
  - 摆渡
tags:
  - 博客
  - GitHub Pages
pinned: true
excerpt: 第一篇示例：站点结构、GitHub Pages 与 Obsidian 协作提示。
---

# 欢迎来到我的博客

这是一个部署在 **GitHub Pages** 上的静态个人博客，页面由纯 HTML、CSS 与 JavaScript 构成，文章以 Markdown 形式存放在 `posts` 目录中。

## 插图示例

使用**相对网站根目录**的路径引用图片（与 Obsidian 同仓时便于对齐）：

![](posts/welcome/demo.svg)

## 你可以这样使用

1. 在 `posts` 文件夹里新增 **顶层** `.md` 文件（例如 `posts/我的笔记.md`），顶部写 YAML（见「关于」页）；附件可放在子文件夹，但文章本身需为 `posts/*.md` 以便生成索引。
2. `posts.json` 由 GitHub Actions 根据各篇 front matter **自动同步**（推送到 `main` 后约 1～3 分钟更新）。
3. 将改动推送到 GitHub；Pages 使用 `main` 分支根目录。

## 页面说明

- **首页**：简介与最近文章。
- **分类 / 标签 / 归档**：按结构浏览。
- **文章详情**：`post.html?slug=文章slug`，支持 LaTeX、图片与嵌入 HTML 媒体标签。

祝写作愉快。
