# Utopia

深白色的个人博客。站点使用 Eleventy 构建，文章使用 Markdown 编写，部署目标是 GitHub Pages 项目站点：

```text
https://shen-baise.github.io/utopia/
```

## 本地开发

```powershell
npm install
npm run dev
```

本地预览地址：

```text
http://127.0.0.1:8080/
```

## 构建与检查

```powershell
npm run build
npm run check
npm test
```

构建产物输出到 `dist/`。

## 写文章

在 `src/posts/` 下新建 Markdown 文件：

```markdown
---
layout: post.njk
title: 文章标题
description: 首页显示的摘要
date: 2026-07-27
cover: /img/cover.jpg
tags:
  - 随笔
permalink: /posts/my-post/
---

正文从这里开始。
```

封面图放到 `src/img/`，然后在 `cover` 中使用 `/img/文件名`。

## 发布

项目自带 GitHub Actions。推送到 `main` 或 `master` 后会自动构建并发布到 GitHub Pages。

线上部署使用：

```text
PATH_PREFIX=/utopia/
```

如果以后改成独立域名或根路径部署，把 `.github/workflows/deploy.yml` 里的 `PATH_PREFIX` 改成 `/`。

## 评论

评论使用 Giscus。配置集中在：

```text
src/_data/site.json
```

部署前需要在 GitHub 仓库中启用 Discussions，并安装 Giscus GitHub App。
