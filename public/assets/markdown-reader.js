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
      node.setAttribute(attribute, new URL(value, base).href);
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
    if (!url.startsWith(rawRoot)) return null;
    const path = decodeURIComponent(url.slice(rawRoot.length));
    return safeRepositoryPath(path) && path.endsWith(".md") ? path : null;
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

  async function renderMarkdown({ path, container, fallback }) {
    const recordPath = canonicalDocumentPath(path, container);
    if (!safeRepositoryPath(recordPath))
      throw new Error("Invalid repository document path");
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
      state.hidden = true;
      article.hidden = false;
      await upgradeMermaid(article);
    } catch (error) {
      state.classList.add("error");
      state.innerHTML = `無法載入這份文件：${String(error.message)}。<br><a href="${fallback.href}">改在 GitHub 查看原始 Record</a>`;
    }
  }

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

  window.PlaygroundReader = { renderMarkdown, repository, branch };
})();