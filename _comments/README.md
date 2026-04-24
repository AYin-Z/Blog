# 留言收集：Formspree → GitHub Actions → 留言文件

此方案将 Formspree 收到的留言自动同步到仓库的 `_comments/` 目录。

## 工作流

```
访客提交留言
    ↓
Formspree 转发到 GitHub Actions webhook
    ↓
GitHub Actions 创建 _comments/{timestamp}-{slug}.md
    ↓
Obsidian 拉取更新
    ↓
你在 Obsidian 中编辑 approved: true
    ↓
GitHub Action 生成精选留言 → featured-comments.json
```

## 配置步骤

### 1. 生成 GitHub Personal Access Token

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 生成新令牌，权限：
   - Repository access: 此仓库
   - Contents: Read and write
3. 复制令牌备用

### 2. 配置 Formspree

1. 登录 [Formspree](https://formspree.io)
2. 创建或选择你的表单
3. Settings → Webhooks → Add webhook
4. Webhook URL 填写：
   ```
   https://api.github.com/repos/AYin-Z/Blog/dispatches
   ```
5. Payload format 选择 `form-data` 或 `json`
6. 添加自定义 headers：
   - `Accept`: `application/vnd.github+json`
   - `X-GitHub-Token`: `你的PAT令牌`
   - `Content-Type`: `application/json`
7. Payload 内容：
   ```json
   {"event_type": "new-comment"}
   ```

### 3. 简化方案：用 Formspree Email + 手动同步

如果不想配置 webhook，也可以：

1. Formspree 把留言发到你邮箱
2. 你手动创建 `_comments/` 中的 .md 文件
3. Obsidian 同步后你编辑 approved 字段

## 留言文件格式

```markdown
---
name: 访客称呼
email: visitor@example.com
date: 2026-04-24T20:00:00Z
approved: false
---
留言内容在这里，支持 Markdown 格式。
```

## 精选流程

1. `_comments/` 中新增留言，`approved: false`
2. Obsidian 拉取后，你可以看到这条留言
3. 如果想精选，改为 `approved: true`
4. 提交到 main 分支
5. GitHub Action 自动更新 `data/featured-comments.json`
6. 博客留言板显示精选内容
