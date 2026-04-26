---
title: 技术实现
date: 2026-04-25
categories:
  - 荒原
tags:
  - 博客
  - 技术栈
pinned: false
excerpt: 本博客的完整技术架构、自动化工作流与部署路径。
---

## 技术栈总览

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | HTML5 / CSS3 / ES6+ | 纯静态，无框架，直出 |
| 样式 | CSS Custom Properties | 深色/浅色双主题，变量驱动 |
| Markdown | marked.js v11 | 浏览器端解析渲染 |
| 数学公式 | KaTeX v0.16 | 行内 `$...$`，块级 `$$...$$` |
| 评论 | Giscus | 基于 GitHub Discussions |
| 访客统计 | 不蒜子 | 轻量 PV/UV 统计 |
| 写作工具 | Obsidian | 文章编辑 + Git 同步 |
| 构建脚本 | Python 3.12 (PyYAML) | 解析 frontmatter、整理附件 |
| CI/CD | GitHub Actions | 4 个工作流，全自动 |
| 部署 | GitHub Pages | 静态托管，自定义域名 |
| 域名 | yinz7032.com | 阿里云 DNS，CNAME 指向 GitHub |

---

## 目录结构

```
/workspace/projects/
├── index.html              # 首页：最近文章列表
├── post.html               # 文章详情（?slug=xxx）
├── posts.html              # 文章列表
├── categories.html         # 分类总览
├── category.html           # 分类详情（?category=xxx）
├── tags.html               # 标签总览
├── tag.html                # 标签详情（?tag=xxx）
├── archives.html           # 归档（按年月）
├── guestbook.html          # 留言板（Giscus）
├── about.html              # 关于
├── favicon.svg             # 浏览器标签页图标
├── CNAME                   # 自定义域名
├── posts.json              # 文章索引（自动生成，勿手动编辑）
├── css/
│   └── style.css           # 全站样式（含双主题）
├── js/
│   ├── site-config.js      # 站点配置（导航、页脚链接）
│   ├── layout.js           # 公共布局（导航栏、页脚、主题切换）
│   ├── posts.js            # 文章数据加载与工具函数
│   ├── post-detail.js      # 文章详情（MD渲染、KaTeX、Obsidian语法、Giscus）
│   ├── home.js             # 首页逻辑
│   ├── posts-list.js       # 文章列表页
│   ├── guestbook.js        # 留言板（Giscus主题同步、精选留言）
│   └── ...                 # 其他页面逻辑
├── posts/                  # Markdown 文章源文件
│   ├── welcome.md
│   ├── Thought 17Y.md
│   └── ...
├── resource/               # 文章附件（自动整理）
│   └── {slug}/             # 按文章 slug 分组
│       └── image.jpg
├── _comments/              # 访客留言源文件（从 Discussions 同步）
│   └── *.md                # 每条留言一个文件
├── data/
│   └── featured-comments.json  # 精选留言（自动生成）
├── _trash/                 # 回收站（未引用的资源）
├── scripts/
│   ├── build_posts_index.py     # 解析 MD → posts.json
│   ├── organize_resources.py    # 整理附件到 resource/
│   ├── cleanup_resources.py     # 清理未引用资源到 _trash/
│   ├── coze-preview-build.sh    # 预览构建
│   └── coze-preview-run.sh      # 预览运行（Python HTTP 服务器）
└── .github/workflows/
    ├── sync-posts.yml           # 同步文章 + 整理附件
    ├── sync-comments.yml        # 生成精选留言
    ├── sync-discussions.yml     # 同步 Discussions → _comments/
    └── cleanup-resources.yml    # 清理未引用资源
```

---

## 文章格式

每篇 `posts/xxx.md` 使用 YAML frontmatter：

```yaml
---
title: 我的第一篇博客
date: 2026-04-24
categories:
  - 孤岛
tags:
  - 随笔
  - 生活
pinned: false
excerpt: 可选摘要，不写则从正文首段自动生成
---

正文 Markdown...
```

**字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| title | 是 | 文章标题 |
| date | 是 | 发布日期（YYYY-MM-DD） |
| categories | 是 | 分类，择一：**孤岛、荒原、摆渡、圆舞**，未填默认「孤岛」 |
| tags | 否 | 标签数组，可多个 |
| pinned | 否 | 是否置顶，默认 false |
| excerpt | 否 | 摘要，不写则自动截取正文 |

**slug** 由文件名决定（去掉 `.md`），如 `240810_星.md` 的 slug 为 `240810_星`，访问路径为 `post.html?slug=240810_星`。

---

## 全流程部署路径

### 写作与发布

```
Obsidian 编辑文章（posts/xxx.md）
    ↓
Git commit + push 到 main
    ↓
GitHub Actions 自动触发（约 30s-2min）
    ↓
┌─────────────────────────────────────┐
│ sync-posts.yml                      │
│  1. organize_resources.py           │
│     扫描文章中的图片引用           │
│     从根目录移动到 resource/{slug}/ │
│     更新文章中的链接路径           │
│  2. build_posts_index.py            │
│     解析所有 MD 的 YAML 头         │
│     生成 posts.json                 │
│  3. git commit + push               │
│     rebase 推送，避免覆盖用户提交  │
└─────────────────────────────────────┘
    ↓
GitHub Pages 自动部署
    ↓
yinz7032.com 更新（约 1-3min）
```

### 留言精选流程

```
访客在博客留言（Giscus 组件）
    ↓
留言自动存入 GitHub Discussions
    ↓
sync-discussions.yml（每6小时 / 手动触发）
    ↓
通过 gh CLI 拉取 Discussions
    ↓
写入 _comments/ 目录（approved: false）
    ↓
Obsidian 拉取 → 博主编辑 approved: true
    ↓
Git push
    ↓
sync-comments.yml 自动触发
    ↓
扫描 _comments/，筛选 approved: true
    ↓
生成 data/featured-comments.json
    ↓
留言板展示精选内容
```

### 资源清理流程

```
Obsidian 删除文章中的图片引用
    ↓
push 到 main
    ↓
cleanup-resources.yml 触发（或每天凌晨3点）
    ↓
cleanup_resources.py 扫描全部文章引用
    ↓
未被引用的资源移动到 _trash/
    ↓
如果 _trash/ 中文件被重新引用
    ↓
organize_resources.py 自动移回 resource/
```

---

## 前端渲染流程

文章详情页 `post.html` 的渲染链路：

```
URL: post.html?slug=xxx
    ↓
posts.js: fetch posts.json → loadPosts()
    ↓
post-detail.js: 查找 slug 对应的 meta
    ↓
fetch posts/xxx.md → 获取 Markdown 原文
    ↓
stripYamlFrontmatter() → 去掉 YAML 头
    ↓
convertObsidianEmbeds() → <a href="post.html?slug=路径">图片</a> → ![](路径)
                         → <a href="post.html?slug=图片">文章</a> → <a href="post.html?slug=...">
    ↓
protectMath() → 保护 $...$ 和 $$...$$ 不被转义
    ↓
marked.parse() → 渲染 Markdown 为 HTML
    ↓
restoreMath() → 还原数学公式占位符
    ↓
renderMathInElement() → KaTeX 渲染公式
    ↓
initGiscus() → 加载 Giscus 评论/点赞组件
```

---

## 主题切换

```
点击 ☀/☾ 按钮
    ↓
layout.js: applyTheme("light" | "dark")
    ↓
document.documentElement.setAttribute("data-theme", "light")
    ↓
CSS 变量自动切换（--bg, --text, --accent ...）
    ↓
localStorage 持久化
    ↓
dispatchEvent("blog-theme-change")
    ↓
guestbook.js / post-detail.js 接收事件
    ↓
postMessage → Giscus iframe 同步主题
```

---

## GitHub Actions 工作流一览

| 工作流 | 触发条件 | 功能 |
|--------|----------|------|
| `sync-posts.yml` | push 到 main（paths: posts/） | 整理附件 + 生成 posts.json |
| `sync-discussions.yml` | 每6小时 / 手动 | Discussions → _comments/ |
| `sync-comments.yml` | push（paths: _comments/） | 生成精选留言 JSON |
| `cleanup-resources.yml` | push + 每天3点 + 手动 | 未引用资源 → _trash/ |

所有工作流推送时使用 `git pull --rebase`，避免与 Obsidian 同步产生冲突。

---

## Obsidian Git 配置

```
autoPullOnBoot: true      # 启动时自动拉取
autoPullInterval: 30      # 每30分钟自动拉取
pullBeforePush: true      # 推送前先拉取
syncMethod: rebase        # rebase 替代 merge
```

---

## 外部依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| marked.js | v11.1.1 | Markdown 渲染 |
| KaTeX | v0.16.9 | 数学公式渲染 |
| Giscus | latest | 评论与点赞 |
| 不蒜子 | v2.3 | PV/UV 统计 |

所有外部依赖通过 CDN 加载，无本地 node_modules。
