(() => {
  const repository = "claire-nook/ai-playground";
  const branch = "main";
  const rawRoot = `https://raw.githubusercontent.com/${repository}/${branch}/`;
  const githubRoot = `https://github.com/${repository}/blob/${branch}/`;
  const mapIndexPath = "knowledge/maps/README.md";
  const legacyMapPath = "knowledge/maps/nook-technical-platform.md";

  function safeRepositoryPath(path) {
    return (
      typeof path === "string" &&
      !path.startsWith("/") &&
      !path.split("/").includes("..")
    );
  }

  // The current Human View still asks for the historical single-map path on its
  // first load. Redirect only that first request to the new index. After the index
  // is initialized, clicking the Nook map must open the real map rather than loop
  // back to the index.
  function canonicalDocumentPath(path, container) {
    if (
      container?.id === "view-knowledge-map" &&
      path === legacyMapPath &&
      container.dataset.mapIndexInitialized !== "true"
    ) {
      container.dataset.mapIndexInitialized = "true";
      return mapIndexPath;
    }
    return path;
  }

  // Repository-relative links remain useful from raw Markdown, including images.
  function resolveDocumentUrls(root, recordPath) {
    const base = new URL(recordPath, rawRoot);
    root.querySelectorAll("a[href], img[src]").forEach((node) => {
      const attribute = node.tagName === "IMG" ? "src" : "href";
      const value = node.getAttribute(attribute);
      if (!value || value.startsWith("#") || /^(?:[a-z]+:|\/\/)/i.test(value))
        return;
      // Site-root links belong to this deployment, including Deploy Previews.
      const targetBase = value.startsWith("/") ? window.location.origin : base;
      node.setAttribute(attribute, new URL(value, targetBase).href);
    });
  }

  // Highlight only explicitly labeled fenced blocks after Markdown sanitization.
  // Preserve original text on CDN/grammar errors; never touch Mermaid or inline code.
  const highlightLanguages = Object.freeze({
    sql: "sql", json: "json", javascript: "javascript", js: "javascript",
    typescript: "typescript", ts: "typescript", html: "xml", xml: "xml",
    css: "css", bash: "bash", shell: "bash", sh: "bash",
    yaml: "yaml", yml: "yaml",
  });

  function upgradeCodeHighlighting(root) {
    const highlighter = window.hljs;
    if (!highlighter?.highlight || !highlighter?.getLanguage || !window.DOMPurify) return;
    root.querySelectorAll("pre > code").forEach((code) => {
      const match = [...code.classList].map((name) => /^language-([a-z0-9_-]+)$/i.exec(name)).find(Boolean);
      const language = match && highlightLanguages[match[1].toLowerCase()];
      if (!language || !highlighter.getLanguage(language)) return;
      const original = code.textContent;
      try {
        const highlighted = highlighter.highlight(original, { language, ignoreIllegals: true }).value;
        // Highlight.js emits span tokens. Sanitize its HTML before inserting it.
        const safe = window.DOMPurify.sanitize(highlighted, {
          ALLOWED_TAGS: ["span"],
          ALLOWED_ATTR: ["class"],
        });
        code.innerHTML = safe;
        code.classList.add("hljs");
      } catch (error) {
        code.textContent = original;
        console.warn("Code highlighting unavailable", language, error);
      }
    });
  }

  async function upgradeMermaid(root) {
    const blocks = [...root.querySelectorAll("pre > code.language-mermaid")];
    blocks.forEach((code) => {
      const diagram = document.createElement("div");
      diagram.className = "mermaid";
      diagram.textContent = code.textContent;
      code.parentElement.replaceWith(diagram);
    });
    if (!blocks.length) return;
    if (!window.mermaid) {
      root
        .querySelectorAll(".mermaid")
        .forEach((node) => node.classList.add("mermaid-error"));
      return;
    }
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "strict",
      });
      await window.mermaid.run({ nodes: root.querySelectorAll(".mermaid") });
    } catch (error) {
      // Keep readable diagram source while allowing the rest of the article to survive.
      console.error("Mermaid render error", error);
      root
        .querySelectorAll(".mermaid:not([data-processed])")
        .forEach((node) => node.classList.add("mermaid-error"));
    }
  }

  function repositoryPathFromRawUrl(url) {
    try {
      const target = new URL(url);
      // Explicit main-branch Markdown only; directories, artifacts and other repos
      // or branches retain normal browser navigation.
      const prefix = [rawRoot, githubRoot].find((root) => target.href.startsWith(root));
      if (!prefix) return null;
      const path = decodeURIComponent(target.pathname.slice(new URL(prefix).pathname.length));
      return safeRepositoryPath(path) && path.endsWith(".md") ? path : null;
    } catch {
      return null;
    }
  }

  function updateMapNavigation(container, recordPath) {
    if (container.id !== "view-knowledge-map") return;
    const toolbar = container.querySelector(".reader-toolbar");
    let indexLink = toolbar.querySelector(".map-index-link");
    if (!indexLink) {
      indexLink = document.createElement("a");
      indexLink.className = "map-index-link";
      indexLink.href = "#";
      indexLink.textContent = "回到 Map Index";
      toolbar.insertBefore(indexLink, toolbar.querySelector(".github-record"));
    }
    indexLink.hidden = recordPath === mapIndexPath;
  }

  function updateReaderNavigation(container) {
    if (container.id !== "reader") return;
    const toolbar = container.querySelector(".reader-toolbar");
    let backLink = toolbar.querySelector(".reader-back-link");
    if (!backLink) {
      backLink = document.createElement("a");
      backLink.className = "reader-back-link";
      backLink.href = "#";
      backLink.textContent = "← 返回";
      toolbar.insertBefore(backLink, toolbar.firstChild);
    }
    backLink.hidden = (container.dataset.readerDepth || "0") === "0";
  }

  async function renderMarkdown({ path, container, fallback, pushHistory = false }) {
    const recordPath = canonicalDocumentPath(path, container);
    if (!safeRepositoryPath(recordPath))
      throw new Error("Invalid repository document path");

    if (container.id === "reader") {
      const currentPath = container.dataset.recordPath;
      const history = JSON.parse(container.dataset.readerHistory || "[]");
      if (pushHistory && currentPath && currentPath !== recordPath) history.push(currentPath);
      container.dataset.readerHistory = JSON.stringify(history);
      container.dataset.readerDepth = String(history.length);
      container.dataset.recordPath = recordPath;
      updateReaderNavigation(container);
    }

    fallback.href = `${githubRoot}${recordPath}`;
    updateMapNavigation(container, recordPath);
    const state = container.querySelector(".reader-state");
    const article = container.querySelector(".markdown-body");
    state.hidden = false;
    state.classList.remove("error");
    state.textContent = "正在從 GitHub 讀取最新 Markdown…";
    article.hidden = true;
    try {
      const response = await fetch(`${rawRoot}${recordPath}`, {
        headers: { Accept: "text/plain" },
        cache: "no-cache",
      });
      if (!response.ok) throw new Error(`GitHub 回應 HTTP ${response.status}`);
      if (!window.marked || !window.DOMPurify)
        throw new Error("Markdown Reader library 未能載入");
      const html = window.marked.parse(await response.text(), { gfm: true });
      article.innerHTML = window.DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
      });
      resolveDocumentUrls(article, recordPath);
      upgradeCodeHighlighting(article);
      state.hidden = true;
      article.hidden = false;
      await upgradeMermaid(article);
    } catch (error) {
      state.classList.add("error");
      state.innerHTML = `無法載入這份文件：${String(error.message)}。<br><a href="${fallback.href}">改在 GitHub 查看原始 Record</a>`;
    }
  }

  // Keep every repository Markdown link inside the same reader shell. The document
  // graph may have many inbound references, so navigation history represents the
  // user's path instead of pretending each document has one fixed parent.
  document.addEventListener("click", async (event) => {
    const readerBack = event.target.closest("#reader .reader-back-link");
    const readerLink = event.target.closest("#reader .markdown-body a[href]");
    if (!readerBack && !readerLink) return;

    const container = document.getElementById("reader");
    if (!container) return;

    if (readerBack) {
      event.preventDefault();
      const history = JSON.parse(container.dataset.readerHistory || "[]");
      const path = history.pop();
      if (!path) return;
      container.dataset.readerHistory = JSON.stringify(history);
      container.dataset.readerDepth = String(history.length);
      await renderMarkdown({
        path,
        container,
        fallback: container.querySelector("#github-record, .github-record"),
      });
      updateReaderNavigation(container);
      container.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        readerLink.hasAttribute("download") || readerLink.target === "_blank") return;
    const path = repositoryPathFromRawUrl(readerLink.href);
    if (!path) return;
    event.preventDefault();
    await renderMarkdown({
      path,
      container,
      fallback: container.querySelector("#github-record, .github-record"),
      pushHistory: true,
    });
    const fragment = new URL(readerLink.href).hash;
    let anchor;
    try { anchor = fragment && document.getElementById(decodeURIComponent(fragment.slice(1))); } catch { /* malformed fragment: show document */ }
    (anchor && container.contains(anchor) ? anchor : container).scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Let Research Map links behave like an in-page reader instead of ejecting the
  // user to raw.githubusercontent.com. The canonical Markdown files remain the
  // source of truth; this is only a Human View navigation layer.
  document.addEventListener("click", async (event) => {
    const indexLink = event.target.closest("#view-knowledge-map .map-index-link");
    const mapLink = event.target.closest("#view-knowledge-map .markdown-body a[href]");
    if (!indexLink && !mapLink) return;

    const path = indexLink ? mapIndexPath : repositoryPathFromRawUrl(mapLink.href);
    if (!path || !path.startsWith("knowledge/maps/")) return;

    event.preventDefault();
    const container = document.getElementById("view-knowledge-map");
    await renderMarkdown({
      path,
      container,
      fallback: container.querySelector(".github-record"),
    });
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // The original page predates multiple Research Maps. Adjust the visible labels
  // here while preserving the existing DOM ids and tab contract.
  const mapTab = document.getElementById("tab-knowledge-map");
  if (mapTab) mapTab.textContent = "Knowledge Maps";
  const mapToolbar = document.querySelector("#view-knowledge-map .reader-toolbar strong");
  if (mapToolbar) mapToolbar.textContent = "Research Maps Index";

  // Human View collaboration signature belongs to the Primary collaboration layer,
  // not to generated Experiment metadata or an Implementation Agent identity.
  const footer = document.querySelector("footer");
  if (footer) {
    footer.innerHTML =
      "<strong>Claire &amp; 墨衡</strong><br>Human × AI Technical Research Collaboration<br><span>Experiment Demo is disposable; Evidence should not be.</span>";
  }

  window.PlaygroundReader = { renderMarkdown, repository, branch, resolveDocumentUrls, repositoryPathFromRawUrl, upgradeCodeHighlighting };
})();
