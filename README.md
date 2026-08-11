# Kamito's Notes

记录技术、生活与思考的中文个人博客。站点使用 Vinext、React 与 MDX，面向 Cloudflare Workers / OpenAI Sites 构建。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

## 写一篇文章

在 `content/posts/` 新建 `.mdx` 文件，文件名会成为文章地址中的 slug。每篇文章必须包含以下 frontmatter：

```yaml
---
title: "文章标题"
description: "文章摘要"
publishedAt: "2026-08-12"
category: "技术"
tags:
  - "示例标签"
featured: false
draft: false
---
```

可选字段为 `updatedAt` 和 `cover`。日期格式固定为 `YYYY-MM-DD`；缺少字段、日期无效或 slug 重复时，构建会失败。`draft: true` 的文章不会出现在页面、RSS 或站点地图中。

正文支持 GFM、代码高亮、LaTeX、标题锚点和自动目录。

## 验证

```bash
npm run build
npm test
```
