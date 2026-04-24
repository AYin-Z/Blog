---
title: Markdown 写作小抄
date: 2026-04-20
categories:
  - 荒原
tags:
  - Markdown
  - LaTeX
  - 教程
pinned: false
excerpt: 常用语法、图片路径、LaTeX 公式与嵌入媒体说明。
---

# Markdown 写作小抄

下面是写博客时常用的 Markdown 语法示例。

## 标题与段落

使用 `#` 到 `######` 表示六级标题。段落之间空一行即可。

## 列表示例

无序列表：

- 第一项
- 第二项

有序列表：

1. 先做这个
2. 再做这个

## 强调与代码

这是 **粗体**，这是 *斜体*，这是 `行内代码`。

代码块：

```javascript
function hello() {
  console.log('Hello, Blog!');
}
```

## 引用与链接

> 引用块适合摘抄或补充说明。

[GitHub Pages 文档](https://docs.github.com/pages) 可查阅部署细节。

## 表格（GFM）

| 列 A | 列 B |
|------|------|
| 数据 | 数据 |

## 图片与媒体

图片路径建议从**站点根目录**写起，例如本站仓库根下的 `posts/welcome/demo.svg`：

![](posts/welcome/demo.svg)

外链图片与普通 Markdown 相同：`![](https://example.com/a.png)`。

嵌入视频可在 Markdown 中**直接写 HTML 标签**（需谨慎，仅信任来源），例如：

`<video controls width="100%" src="https://…/clip.mp4"></video>`

（本页不自动播放示例视频，避免额外流量。）

## LaTeX（KaTeX）

行内公式：Euler 公式 $e^{i\pi}+1=0$。

块级公式：

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

亦支持 `\(\)` 与 `\[\]` 写法。若美元符号与文字冲突，可用反斜杠转义或改用 `\(...\)`。

---

以上内容在站点中会通过 Markdown 与 KaTeX 渲染为 HTML。
