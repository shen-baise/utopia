const rawPathPrefix = process.env.PATH_PREFIX || "/";
const pathPrefix = rawPathPrefix === "/" ? "/" : `/${rawPathPrefix.replace(/^\/|\/$/g, "")}/`;

const withPathPrefix = (value) => {
  if (!value || typeof value !== "string") return value;
  if (/^(https?:)?\/\//.test(value) || value.startsWith("mailto:") || value.startsWith("#")) return value;
  if (!value.startsWith("/")) return value;
  if (pathPrefix === "/") return value;
  return `${pathPrefix.replace(/\/$/, "")}${value}`;
};

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/fonts": "fonts" });
  eleventyConfig.addPassthroughCopy({ "src/cursors": "cursors" });
  eleventyConfig.addPassthroughCopy({ "node_modules/mathjax-full/es5": "vendor/mathjax/es5" });

  eleventyConfig.addFilter("dateCN", (value) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date).replaceAll("/", "-");
  });

  eleventyConfig.addFilter("readableDate", (value) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  });

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("head", (items, count) => (items || []).slice(0, count));
  eleventyConfig.addFilter("url", withPathPrefix);
  eleventyConfig.addFilter("wordCount", (value) => {
    const text = String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, "");
    return text.length;
  });
  eleventyConfig.addFilter("readingTime", (value) => {
    const words = String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, "").length;
    return Math.max(1, Math.ceil(words / 400));
  });

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tags = collectionApi.getFilteredByGlob("src/posts/*.md").flatMap((item) => item.data.tags || []);
    return [...new Set(tags)].sort((a, b) => a.localeCompare(b, "zh-CN"));
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk"],
    pathPrefix
  };
}
