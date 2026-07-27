# Utopia 博客使用教程

Utopia 是深白色的个人博客，建议部署为 GitHub Pages 项目站点：

```text
https://shen-baise.github.io/utopia/
```

这样不会覆盖个人主页：

```text
https://shen-baise.github.io/
```

## 第一次部署

推荐新建一个 GitHub 仓库：

```text
shen-baise/utopia
```

把 `utopia` 文件夹中的内容作为这个新仓库的根目录，然后执行：

```powershell
npm install
npm run build
npm run check
git init
git add .
git commit -m "init utopia"
git branch -M main
git remote add origin https://github.com/shen-baise/utopia.git
git push -u origin main
```

进入 GitHub 仓库设置：

```text
Settings -> Pages -> Build and deployment -> Source
```

选择：

```text
GitHub Actions
```

项目自带 `.github/workflows/deploy.yml`，每次推送到 `main` 或 `master` 都会自动部署。线上构建使用：

```text
PATH_PREFIX=/utopia/
```

## 写文章

在 `src/posts/` 下新建 Markdown 文件，例如：

```text
src/posts/a-new-day.md
```

文章模板：

```markdown
---
layout: post.njk
title: 新的一天
description: 首页文章卡片会显示这段摘要。
date: 2026-07-27
cover: /img/a-new-day.jpg
tags:
  - 随笔
permalink: /posts/a-new-day/
---

这里开始写正文。
```

封面图放到：

```text
src/img/a-new-day.jpg
```

本地预览：

```powershell
npm run dev
```

打开：

```text
http://127.0.0.1:8080/
```

发布文章：

```powershell
npm run build
npm run check
git add src/posts/a-new-day.md src/img/a-new-day.jpg
git commit -m "新增文章：新的一天"
git push
```

部署完成后，文章地址是：

```text
https://shen-baise.github.io/utopia/posts/a-new-day/
```

## 删除文章

删除对应 Markdown：

```powershell
Remove-Item .\src\posts\a-new-day.md
```

如果封面没有其他文章使用，也可以删除：

```powershell
Remove-Item .\src\img\a-new-day.jpg
```

提交删除：

```powershell
npm run build
npm run check
git add -u
git commit -m "删除文章：新的一天"
git push
```

## 修改站点信息

站点标题、作者、邮箱和评论配置在：

```text
src/_data/site.json
```

如果仓库从 `shen-baise.github.io` 换成 `utopia`，Giscus 评论配置也要重新生成。需要在 `shen-baise/utopia` 仓库中开启 Discussions、安装 Giscus App，然后把新的 `repoId`、`categoryId` 写回 `site.json`。

## 常用命令

```powershell
npm install
npm run dev
npm run build
npm run check
npm test
```
