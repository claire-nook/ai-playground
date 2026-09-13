(() => {
  const repository = "claire-nook/ai-playground";
  const branch = "main";
  const rawRoot = `https://raw.githubusercontent.com/${repository}/${branch}/`;
  const githubRoot = `https://github.com/${repository}/blob/${branch}/`;

  function safeRepositoryPath(path) {
    return (
      typeof path === "string" &&
      !path.startsWith("/") &&
      !path.split("/").includes("..")
    );
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

  async function renderMarkdown({ path, container, fallback }) {
    if (!safeRepositoryPath(path))
      throw new Error("Invalid repository document path");
    fallback.href = `${githubRoot}${path}`;
    const state = container.querySelector(".reader-state");
    const article = container.querySelector(".markdown-body");
    state.hidden = false;
    state.classList.remove("error");
    state.textContent = "正在從 GitHub 讀取最新 Markdown…";
    article.hidden = true;
    try {
      const response = await fetch(`${rawRoot}${path}`, {
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
      resolveDocumentUrls(article, path);
      state.hidden = true;
      article.hidden = false;
      await upgradeMermaid(article);
    } catch (error) {
      state.classList.add("error");
      state.innerHTML = `無法載入這份文件：${String(error.message)}。<br><a href="${fallback.href}">改在 GitHub 查看原始 Record</a>`;
    }
  }

  // Human View collaboration signature belongs to the Primary collaboration layer,
  // not to generated Experiment metadata or an Implementation Agent identity.
  const footer = document.querySelector("footer");
  if (footer) {
    footer.innerHTML =
      "<strong>Claire &amp; 墨衡</strong><br>Human × AI Technical Research Collaboration<br><span>Experiment Demo is disposable; Evidence should not be.</span>";
  }

  window.PlaygroundReader = { renderMarkdown, repository, branch };
})();
