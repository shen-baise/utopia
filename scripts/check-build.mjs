import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const required = [
  "index.html",
  "about/index.html",
  "link/index.html",
  "comments/index.html",
  "archives/index.html",
  "tags/index.html",
  "categories/index.html",
  "404.html",
  "search-index.json",
  "assets/css/site.css",
  "assets/js/site.js",
  "img/back.png",
  "img/haer.jpg",
  "img/dtcat.png"
];

const errors = [];
for (const file of required) {
  if (!existsSync(join(root, file))) errors.push(`缺少构建产物: ${file}`);
}

const walk = (directory) => readdirSync(directory).flatMap((name) => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

if (existsSync(root)) {
  for (const file of walk(root).filter((path) => path.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");
    const label = relative(root, file);
    if (/url\(url\(/.test(html)) errors.push(`${label}: 仍包含损坏的 url(url(...))`);
    if (/Valine|LeanCloud|twikoo|comment\.deepwhite\.work/i.test(html)) errors.push(`${label}: 仍包含旧评论系统`);
    if (/<script[^>]+src=["'](?:https?:)?\/\/(?!giscus\.app)/i.test(html)) errors.push(`${label}: 出现未审核的第三方脚本`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`构建检查通过，共验证 ${required.length} 个关键产物。`);
