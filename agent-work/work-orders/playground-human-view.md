# Work Order｜Playground Human View

## Metadata
- Work Order: `playground-human-view`
- Status: `Ready`
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Related Area: Experiment Gallery / Markdown Reader / Short Term / Knowledge Map

## Objective｜目標
把目前 AI Playground 首頁從單一 Experiment Gallery 擴充成 Claire 可直接使用的 Repository Human View。

核心原則：GitHub Repository 仍是研究內容與 Knowledge 的 Source of Truth；Netlify 只提供 Application Shell / UI delivery，不建立第二份內容倉庫。

首頁中間主體提供三個視角：`Experiments | Short Term | Knowledge Map`，預設 `Experiments`。

## Architecture Decisions｜已決定

### 1. Experiments
保留現有 Gallery Search / Tag / Demo Status / Verification / Pagination。

Catalog 增加正式 completion-date metadata。Claire 的口語欄位名稱只代表 semantic intent；請依 `agent-work/README.md` Naming Rule 選擇 canonical identifier，例如 `completedDate`。

- 格式 `YYYY-MM-DD`。
- 現有六個 Catalog entries 依 Experiment Record / Evidence migration，不猜日期。
- Gallery 預設 completion date newest → oldest，同日以 Experiment `id` natural sort 作 secondary ordering。
- Card 在 Experiment identity 附近顯示日期。
- 日期代表研究完成時間，不是 deploy time 或 metadata modification time。

Catalog 另增加 repository-relative `recordPath`，例如 `experiments/custom-api/README.md`。多個 Probe 可以共用同一 Record，不為 Reader 強迫拆檔。

### 2. Browser Markdown Reader
建立 Playground Reader，例如 `/result/?id=C-EXT-1`。

流程：Catalog entry → `recordPath` → Browser runtime fetch GitHub raw Markdown on `main` → Markdown parser → Playground article → Mermaid upgrade。

限制：
- 不得在 Netlify build 時把 Experiment README 轉成 HTML article。
- 不得把 Markdown article content 複製進 `public/`。
- Experiment Record commit 本身不應因 Reader 而成為 Netlify deploy trigger。
- GitHub fetch failure 顯示可理解 error state，並提供 GitHub Record fallback。
- Reader 有 `← AI Playground`。
- Experiment Card 的「查看實驗結果」與 Live Demo 是不同 navigation。

### 3. Claire Markdown Visual Baseline
Claire 已提供兩份 Textastic Markdown Preview 資產作為 Design Source / Proven UX Preference：
- `agent-work/reference/playground-human-view/markdown.css`
- `agent-work/reference/playground-human-view/markdown_head.html`

Codex 施工前必須閱讀。不要自行改成灰白 GitHub clone。

保留核心視覺：森林霧綠色票、舒適中文 line-height / article width、heading hierarchy、blockquote / summary card、深色 code block、table card / responsive behavior、image readability、Mermaid container。

但這是 Textastic Preview reference，不要原封不動套整個 Playground `body`：
- article styling scope 到 Reader container，例如 `.markdown-body`。
- 移除 Textastic-specific 假設，例如第四欄固定當金額右對齊。
- Playground shell / tabs / Gallery 延續現有產品視覺，Reader article 再使用森林系閱讀樣式。
- 純視覺 external dependency 非必要，優先 system font。

### 4. Mermaid
`experiments/custom-api/README.md` 已有 C-DB-1 / C-EXT-1 真實 fenced `mermaid` blocks，作為 acceptance fixture。

Reader 必須讓一般 fenced code 照常顯示，`mermaid` fenced block render diagram。Mermaid render failure 不得讓整篇文章消失。Mermaid source 留在 Markdown，不產生人工維護 diagram image artifact。

可以選擇合理的 browser Mermaid delivery，但不要為此導入大型 frontend framework。

### 5. Short Term
`Short Term` Source of Truth 是 `notes/short-term-work.md`。沿用同一套 Browser Markdown Reader capability，runtime fetch / render GitHub 最新 Markdown，不 build-time 複製到 Netlify。

該文件已定義為 Human-facing Research Navigation。UI 不另外建立 `short-term.json`、CMS 或第二份手寫摘要。

### 6. Knowledge Map
Knowledge Map 回答「Experiment / Evidence 累積後，我們目前怎麼理解 Nook Technical Platform」。施工前閱讀 `knowledge/maps/nook-technical-platform.md`、`knowledge/README.md`、`knowledge/experiments.md`。

優先使用 canonical Markdown + Reader。若現有 source structure 不足以可靠產生真正 mind map，不要解析自然語言硬猜 taxonomy；先讓 tab 呈現 canonical Knowledge Map document，Report 說明後續若要 visual map 還缺什麼 source structure。不要建立 duplicated Knowledge JSON / DB / CMS。

## Context / Read First｜施工前閱讀
至少閱讀：
- `playground.md`
- `README.md`
- `agent-work/README.md`
- `agent-work/report-language-guideline.txt`
- 本 Work Order
- `public/index.html`
- `scripts/build-experiment-catalog.mjs`
- `netlify.toml`
- 所有現有 `experiments/**/*.catalog.json`
- `experiments/custom-api/README.md`
- `notes/short-term-work.md`
- `knowledge/maps/nook-technical-platform.md`
- `knowledge/README.md`
- 兩份 Claire reference assets

並掃描 `public/` 現況，避免破壞既有 Browser Experiment pages。

## Execution Context Preflight
1. 確認 target repository。
2. 確認 Work Order 與兩份 reference assets 都存在；若缺少，停止並回報，不要憑描述重建 theme。
3. 確認首頁已是 metadata-driven Gallery。
4. 確認 Catalog generator 現有 validation contract。
5. 確認 `netlify.toml` trigger boundary；Experiment README、Short Term、Knowledge Markdown 不應因 Reader 而加入 deploy trigger。
6. 確認 Custom API README 已含 Mermaid fixture。
7. working tree 若有無關未提交修改，停止並回報。

## Scope
可以做：Catalog completion date / record path、六筆 metadata migration、newest-first Gallery、Result navigation、reusable Browser Markdown Reader、Short Term tab、Knowledge Map tab、Mermaid、Reader theme、必要 frontend assets、必要 guidance 與 deployable-source trigger adjustment。

不要做：DB、CMS、Eleventy/Vite/React/Vue/Next 等大型 framework、build-time Markdown article HTML、正文複製到 JSON、自然語言 taxonomy guessing、研究結論重寫、數學 / LaTeX / KaTeX / MathJax、全面重寫現有 Browser Experiment pages。

## Acceptance Criteria
- [ ] `Experiments | Short Term | Knowledge Map` 三視角，預設 Experiments。
- [ ] Gallery 原有 filtering / pagination 不退化。
- [ ] 六個 Experiment 顯示完成日期，預設 newest-first，同日 deterministic。
- [ ] Experiment Result 與 Live Demo 為獨立 navigation。
- [ ] Result Reader 依 `recordPath` runtime fetch GitHub raw Markdown。
- [ ] `public/` 不含 Experiment article copy / generated article HTML。
- [ ] Markdown-only Record change 不需 Netlify deploy 才能被 Reader 下次取得。
- [ ] fetch failure 有 error state + GitHub fallback；Reader 有 `← AI Playground`。
- [ ] headings、list、blockquote、table、inline/fenced code、links、images在 iPad-width 可讀。
- [ ] Reader 明顯承襲 Claire 森林霧綠 reference，styles scoped 不破壞 Gallery。
- [ ] Custom API README Mermaid blocks實際可 render；Mermaid failure 不造成整篇 blank。
- [ ] Short Term runtime render canonical `notes/short-term-work.md`，無第二份 data model。
- [ ] Knowledge Map tab 讀 canonical document，無 duplicated Knowledge store。
- [ ] Generator validation 覆蓋新增 metadata；build 成功。
- [ ] Netlify trigger 對 deployable source 變更啟動，但 Markdown-only research change維持 repository-only skip。
- [ ] HTML / JS / CSS 格式化，JS / CSS 主要功能與非直覺邏輯有註解。
- [ ] 不破壞既有 Browser Experiment routes；iPad / Safari 為主要 UX 驗收面。

## Codex Report
回報 changed files / responsibilities、Catalog validation、sort test、Reader URL construction / Source-of-Truth boundary、Markdown parser / Mermaid 選擇、Mermaid fixture 結果、Short Term / Knowledge Map runtime behavior、Netlify trigger boundary、known limitations / CDN dependency、local commit SHA。無法在 workspace 驗證 browser rendering 時要明確標示，不要假裝。

## Human Gate
Codex 完成並 local commit 後停止。Claire 透過 Codex Product UI 建 PR；Primary Agent以 GitHub-visible PR 做 Technical QC。UI / Visual Acceptance 最後由 Claire 在 Deploy Preview / iPad Safari 判斷。

工程師對「森林霧綠」的理解如果最後長成企業灰，視為 Acceptance Failure。