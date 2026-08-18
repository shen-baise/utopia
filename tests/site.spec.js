import { expect, test } from "@playwright/test";

const pages = ["/", "/about/", "/link/", "/comments/", "/archives/", "/tags/", "/categories/"];

for (const path of pages) {
  test(`${path} renders without broken local assets`, async ({ page }) => {
    const consoleErrors = [];
    const failedLocalRequests = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", (request) => {
      if (request.url().startsWith("http://127.0.0.1:8080")) failedLocalRequests.push(request.url());
    });

    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    await expect(page.locator("#nav")).toBeVisible();
    await expect(page.locator("#footer")).toBeVisible();
    expect(failedLocalRequests).toEqual([]);
    expect(consoleErrors.filter((message) => !message.includes("giscus"))).toEqual([]);

    const brokenImages = await page.locator("img").evaluateAll((images) =>
      images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src)
    );
    expect(brokenImages).toEqual([]);
  });
}

test("mobile navigation and search are usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("#toggle-menu").click();
  await expect(page.locator("#sidebar")).toHaveClass(/is-open/);
  await expect(page.locator("#sidebar-menus")).toBeVisible();
  await page.locator("#menu-mask").click({ position: { x: 10, y: 10 } });
  await expect(page.locator("#sidebar")).not.toHaveClass(/is-open/);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.locator("#search-button").click();
  await expect(page.locator("#local-search")).toBeVisible();
  await page.locator("#search-input").fill("随笔");
  await expect(page.locator("#search-stats")).toContainText("共找到 0 篇文章");
  await expect(page.locator(".comment-fallback")).toContainText("没有找到匹配的文章");
  await page.locator(".search-close-button").click();
  await expect(page.locator("#local-search")).toBeHidden();
});

test("article listing and empty taxonomy states are clear", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".recent-post-item")).toHaveCount(4);
  await expect(page.locator("a.article-title").first()).toBeVisible();
  await page.goto("/tags/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".tag-cloud-list a")).toHaveCount(2);
  await page.goto("/categories/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".category-posts a")).toHaveCount(4);
});

for (const path of ["/posts/graph-engineering/", "/posts/long-horizon-agents/", "/posts/reliable-self-evolving-agents/", "/posts/loop-engineering/"]) {
  test(`${path} renders article images`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const brokenImages = await page.locator("article img").evaluateAll((images) =>
      images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src)
    );
    expect(brokenImages).toEqual([]);
  });
}

test("math formulas are rendered", async ({ page }) => {
  await page.goto("/posts/reliable-self-evolving-agents/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelectorAll("mjx-container").length > 0);
  expect(await page.locator("mjx-container").count()).toBeGreaterThan(0);
});

test("theme preference survives reload", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const before = await page.locator("html").getAttribute("data-theme");
  await page.evaluate(() => scrollTo(0, 240));
  await expect(page.locator("#rightside")).toHaveClass(/is-visible/);
  await page.locator("#darkmode").click();
  const after = before === "dark" ? "light" : "dark";
  await expect(page.locator("html")).toHaveAttribute("data-theme", after);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", after);
});

test("comments show a clear setup state", async ({ page }) => {
  await page.goto("/comments/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("iframe.giscus-frame")).toBeVisible();
});
