(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const root = document.documentElement;
  const header = $("#page-header");
  const nav = $("#nav");
  const rightside = $("#rightside");
  const toast = $("#toast");
  const favicon = $("#site-favicon");
  const siteBase = document.body.dataset.base || "/";
  const withBase = (path) => new URL(path.replace(/^\//, ""), new URL(siteBase, location.origin)).pathname;
  const normalTitle = document.title;
  const normalFavicon = favicon?.getAttribute("href") || withBase("/img/pic.jpg");
  const awayFavicon = withBase("/img/dtcat.png");
  let toastTimer;
  let titleTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  };

  const syncGiscusTheme = () => {
    const frame = $("iframe.giscus-frame");
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({
      giscus: { setConfig: { theme: root.dataset.theme === "dark" ? "dark" : "light" } }
    }, "https://giscus.app");
  };

  const setTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    $("meta[name='theme-color']").content = theme === "dark" ? "#0d0d0d" : "#ffffff";
    if (persist) localStorage.setItem("deepwhite-theme", theme);
    syncGiscusTheme();
  };

  $("#darkmode")?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
    showToast(next === "dark" ? "已切换为夜间模式" : "已切换为日间模式");
  });

  document.addEventListener("visibilitychange", () => {
    clearTimeout(titleTimer);
    if (document.hidden) {
      document.title = "👀跑哪里去了~";
      favicon?.setAttribute("href", awayFavicon);
      return;
    }
    document.title = "🐖抓到你啦～";
    favicon?.setAttribute("href", normalFavicon);
    titleTimer = setTimeout(() => { document.title = normalTitle; }, 2000);
  });

  const updateScrollUi = () => {
    const top = window.scrollY;
    const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    const percent = Math.min(100, Math.round((top / max) * 100));
    $(".scroll-percent")?.replaceChildren(document.createTextNode(`${percent}%`));
    rightside?.classList.toggle("is-visible", top > 180);
    header?.classList.toggle("nav-fixed", top > 60);
    nav?.classList.add("show");

    const nekoScroll = $("#neko-scroll");
    const nekoCat = $("#neko-cat");
    if (nekoScroll && nekoCat) {
      const desktop = innerWidth > 992;
      const visible = desktop && top > 2;
      const travel = Math.max(innerHeight * 0.9 - 56, 0);
      const progress = max ? top / max : 0;
      const catTop = Math.min(travel, Math.max(0, travel * progress));
      nekoScroll.classList.toggle("is-visible", visible);
      nekoScroll.style.height = `${Math.max(0, catTop + 8)}px`;
      nekoCat.style.top = `${catTop}px`;
      nekoCat.dataset.msg = percent >= 99 ? "到底啦~" : "喵喵喵~";
      nekoCat.classList.toggle("show-msg", percent >= 99);
    }
  };

  updateScrollUi();
  addEventListener("scroll", updateScrollUi, { passive: true });
  addEventListener("resize", updateScrollUi, { passive: true });

  $("#scroll-down")?.addEventListener("click", () => {
    window.scrollTo({ top: Math.max(header.offsetHeight - 20, 0), behavior: "smooth" });
  });
  $("#go-up")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  $("#go-down")?.addEventListener("click", () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
  $("#neko-cat")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const sidebar = $("#sidebar");
  const toggleMenu = $("#toggle-menu");
  const closeMenu = () => {
    sidebar?.classList.remove("is-open");
    toggleMenu?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  const openMenu = () => {
    sidebar?.classList.add("is-open");
    toggleMenu?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };
  toggleMenu?.addEventListener("click", () => sidebar?.classList.contains("is-open") ? closeMenu() : openMenu());
  $("#menu-mask")?.addEventListener("click", closeMenu);
  $$("#sidebar-menus a").forEach((link) => link.addEventListener("click", closeMenu));

  const searchModal = $("#local-search");
  const searchInput = $("#search-input");
  const searchResults = $("#search-results");
  const searchStats = $("#search-stats");
  let searchIndex = [];

  const escapeHtml = (value) => value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
  })[char]);

  const loadSearch = async () => {
    if (searchIndex.length) return;
    try {
      const response = await fetch(withBase("/search-index.json"), { cache: "force-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      searchIndex = await response.json();
    } catch {
      searchStats.textContent = "搜索索引加载失败，请刷新页面后重试";
    }
  };

  const openSearch = async () => {
    searchModal.hidden = false;
    document.body.style.overflow = "hidden";
    await loadSearch();
    setTimeout(() => searchInput.focus(), 0);
  };

  const closeSearch = () => {
    searchModal.hidden = true;
    document.body.style.overflow = sidebar?.classList.contains("is-open") ? "hidden" : "";
  };

  $("#search-button")?.addEventListener("click", openSearch);
  $("#search-mask")?.addEventListener("click", closeSearch);
  $(".search-close-button")?.addEventListener("click", closeSearch);

  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLocaleLowerCase("zh-CN");
    if (!query) {
      searchResults.replaceChildren();
      searchStats.textContent = "输入关键词开始搜索";
      return;
    }
    const hits = searchIndex.filter((item) => [item.title, item.description, ...(item.tags || [])]
      .join(" ").toLocaleLowerCase("zh-CN").includes(query));
    searchStats.textContent = `共找到 ${hits.length} 篇文章`;
    searchResults.innerHTML = hits.length
      ? hits.map((item) => `<a class="search-result-item" href="${encodeURI(item.url)}"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p></a>`).join("")
      : '<p class="comment-fallback">没有找到匹配的文章</p>';
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSearch();
      closeMenu();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
  });

  const subtitle = $("#subtitle");
  if (subtitle && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let lines = [];
    try { lines = JSON.parse(subtitle.dataset.lines || "[]"); } catch { lines = []; }
    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const type = () => {
      const line = lines[lineIndex] || "欢迎来到我的小破站";
      charIndex += deleting ? -1 : 1;
      subtitle.textContent = line.slice(0, Math.max(charIndex, 0));
      let delay = deleting ? 55 : 110;
      if (!deleting && charIndex >= line.length) { deleting = true; delay = 1800; }
      if (deleting && charIndex <= 0) { deleting = false; lineIndex = (lineIndex + 1) % Math.max(lines.length, 1); delay = 450; }
      setTimeout(type, delay);
    };
    type();
  } else if (subtitle) {
    try { subtitle.textContent = JSON.parse(subtitle.dataset.lines)[0]; } catch { subtitle.textContent = "欢迎来到我的小破站"; }
  }

  $$('img[data-fallback]').forEach((image) => image.addEventListener("error", () => {
    if (image.dataset.failed) return;
    image.dataset.failed = "true";
    image.src = image.dataset.fallback;
  }));

  const runtime = $("#site-runtime");
  if (runtime) {
    const started = new Date("2023-01-01T00:00:00+08:00");
    const days = Math.max(1, Math.floor((Date.now() - started.getTime()) / 86400000));
    runtime.textContent = `${days} 天`;
  }
  $("#current-year")?.replaceChildren(document.createTextNode(String(new Date().getFullYear())));

  const giscusStatus = $(".giscus-status");
  if (giscusStatus) {
    const observer = new MutationObserver(() => {
      const frame = $("iframe.giscus-frame");
      if (!frame) return;
      giscusStatus.hidden = true;
      frame.addEventListener("load", syncGiscusTheme, { once: true });
      syncGiscusTheme();
      observer.disconnect();
    });
    observer.observe($(".giscus-container"), { childList: true, subtree: true });
    setTimeout(() => {
      if (!$("iframe.giscus-frame")) {
        giscusStatus.hidden = false;
        giscusStatus.classList.add("is-error");
        giscusStatus.textContent = "评论服务暂时没有响应，请检查网络后刷新页面。";
      }
    }, 10000);
  }

  document.addEventListener("click", (event) => {
    if (event.button !== 0 || event.target.closest("input, textarea, .giscus-container")) return;
    const heart = document.createElement("span");
    heart.className = "click-heart";
    heart.textContent = "♥";
    heart.style.left = `${event.clientX - 7}px`;
    heart.style.top = `${event.clientY - 10}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 800);
  });

  const canvas = $("#snow-canvas");
  if (canvas && innerWidth > 768 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const context = canvas.getContext("2d");
    let flakes = [];
    let animationId;
    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * ratio;
      canvas.height = innerHeight * ratio;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      flakes = Array.from({ length: Math.min(90, Math.floor(innerWidth / 16)) }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 2.2 + 0.8,
        speed: Math.random() * 0.65 + 0.25,
        drift: Math.random() * 0.35 - 0.175
      }));
    };
    const draw = () => {
      context.clearRect(0, 0, innerWidth, innerHeight);
      context.fillStyle = "rgba(255,255,255,.82)";
      for (const flake of flakes) {
        context.beginPath();
        context.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        context.fill();
        flake.y += flake.speed;
        flake.x += flake.drift;
        if (flake.y > innerHeight + 4) { flake.y = -4; flake.x = Math.random() * innerWidth; }
      }
      animationId = requestAnimationFrame(draw);
    };
    resize();
    draw();
    addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(animationId);
      else draw();
    });
  }
})();
