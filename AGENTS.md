# Blog 项目

## 项目概述

YINZ7032 的个人静态博客，基于纯 HTML/CSS/JS 构建，部署于 GitHub Pages。采用深色主题，支持文章分类、标签、归档、留言板等功能。

## 技术栈

- **前端**: 原生 HTML5 + CSS3 + JavaScript (ES6+)
- **主题**: 自定义深色主题 (dark theme)
- **构建**: 无（纯静态博客，无需构建工具）
- **部署**: GitHub Pages
- **辅助工具**: Obsidian（文章写作与同步）

## 目录结构

```
/workspace/projects/
├── index.html          # 首页
├── about.html          # 关于页面
├── archives.html       # 归档页面
├── categories.html     # 分类总览
├── category.html       # 分类详情
├── guestbook.html      # 留言板
├── posts.html          # 文章列表
├── post.html           # 文章详情
├── tag.html            # 标签详情
├── tags.html           # 标签总览
├── posts.json          # 文章索引数据
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── site-config.js  # 站点配置
│   ├── layout.js       # 布局组件
│   ├── posts.js        # 文章数据加载
│   ├── home.js         # 首页逻辑
│   └── ...             # 其他页面逻辑
├── posts/              # Markdown 文章源
│   ├── welcome.md
│   ├── markdown-tips.md
│   └── ...
├── data/
│   └── featured-comments.json  # 精选留言
└── scripts/
    ├── build_posts_index.py     # 生成 posts.json
    ├── coze-preview-build.sh    # 预览构建
    └── coze-preview-run.sh      # 预览运行
```

## 关键入口 / 核心模块

- **首页**: `index.html` - 展示最近文章
- **站点配置**: `js/site-config.js` - 导航、页脚外链、Formspree 留言表单
- **文章数据**: `posts.json` - 文章索引（由 `scripts/build_posts_index.py` 生成）
- **样式**: `css/style.css` - 深色主题样式

## 运行与预览

### 预览（本地开发）

项目使用 Python 内置 HTTP 服务器提供静态预览：

```bash
# 构建（可选，静态博客无需构建）
bash scripts/coze-preview-build.sh

# 启动预览服务（端口 5000）
bash scripts/coze-preview-run.sh
```

预览验证：
```bash
curl http://localhost:5000  # 应返回 200
```

### 部署

部署到 GitHub Pages：
1. 将仓库推送到 GitHub
2. 在仓库 Settings → Pages → Source 选择 `main` 分支
3. 访问 `https://username.github.io/repo-name`

## 用户偏好与长期约束

1. **文章格式**: Markdown 文件放在 `posts/` 目录
2. **文章元数据**: 在 `posts.json` 中维护（slug, title, date, excerpt, category, tags）
3. **留言功能**: 使用 Formspree，需要在 `js/site-config.js` 配置 `formspreeMessageUrl`
4. **GitHub Actions**: `.github/workflows/sync-posts-json.yml` 可能用于自动同步文章

## 常见问题和预防

1. **预览脚本幂等性**: `coze-preview-run.sh` 会清理 5000 端口残留进程，重复执行安全
2. **静态资源路径**: 所有路径相对于根目录，避免硬编码绝对路径
3. **posts.json 更新**: 新增文章后需手动或通过脚本更新 `posts.json`
4. **留言板功能**: 需要 Formspree 账号配置，否则留言表单不显示
