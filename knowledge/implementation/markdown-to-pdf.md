# Markdown → Human-facing PDF Rendering Pattern

- Status: Verified local pattern / reusable Primary capability
- First verified: 2026-09-18
- Origin: A-ARTIFACT-1 / GitHub → Primary → Dropbox output research
- Reuses: Textastic forest-style visual language, explicit fenced-language philosophy, manual page-break contract

## Intent

這個 Pattern 解決的不是「PDF 能不能產生」，而是：

> Primary 如何把 Repository 中的 Markdown 轉成可交付、可稍後打開、可存入 Dropbox 的 Human-facing PDF，而不需要每次重新手刻一套排版。

Canonical renderer：

~~~text
scripts/render-markdown-pdf.py
~~~

Execution shape：

~~~text
GitHub Markdown source
→ Primary local workspace
→ reusable Markdown renderer
→ HTML/CSS transformation
→ PDF
→ visual / structural verification
→ Dropbox Human Output
~~~

Repository 保存 durable rendering capability；local workspace 只承擔 ephemeral execution。

## Reused Design from Textastic

沒有要求 100% 複製 Textastic runtime。移植的是值得共用的 authoring contract：

- 森林霧綠 typography / table / blockquote / code visual language
- explicit language fence 才做 syntax highlighting
- `<!-- pagebreak -->` 作 opt-in manual print break
- Mermaid 作 diagram authoring surface
- enhancement 不接管正常 Markdown world

Textastic-specific DOM / CDN glue 不被視為必須照搬。

## Current Renderer

Runtime dependencies：

~~~text
Python
Mistune
Pygments
WeasyPrint
Graphviz / dot
Noto Sans CJK TC
~~~

Current verified support：

- Traditional Chinese / mixed English typography
- headings / paragraphs / lists / blockquote / horizontal rule
- tables
- inline code / fenced code
- Pygments syntax highlighting for explicit fences such as `sql`
- `<!-- pagebreak -->`
- local image references when binary is materialized in renderer workspace
- visible missing-image placeholder when referenced binary is unavailable
- bounded Mermaid flowchart subset rendered through Graphviz

### Mermaid Boundary

Current local renderer **不是完整 Mermaid engine**。

Verified subset：

~~~mermaid
flowchart LR
A[Source] --> B[Renderer]
B --> C[PDF]
~~~

支援 `flowchart` / `graph` + `TD/TB/LR/RL` 與簡單 node → node edge。超出 subset 時保留 Mermaid source fallback，不假裝自己畫對。

完整 Mermaid rendering 仍由 Textastic / browser Mermaid.js authoring surface 提供；未來若 local runtime 可穩定取得 Mermaid CLI，可替換此 adapter，而不需要重寫整個 PDF Pattern。

## Image Materialization Boundary

Markdown source 可由 GitHub Connector 直接讀取，但 Repository binary image 與 Primary local filesystem 是不同 execution surface。

如果 referenced image bytes 尚未 materialize 到 renderer workspace：

~~~text
GitHub Markdown        → Primary local text       Verified
GitHub repository PNG  → Primary local binary     Not yet established as general path
~~~

Renderer 會輸出清楚的 missing-image placeholder，而不是 silently drop image。

這個 boundary 屬 Artifact Transport concern，不是 Markdown renderer failure。

## Quality Contract

正式交付前至少：

1. PDF non-empty / page count > 0
2. render PDF to PNG
3. inspect first page、complex code / table / diagram page、last page
4. 中文字型不可缺字 / 黑框
5. 不得有 clipping / overlap
6. Mermaid unsupported 時必須可觀察 fallback
7. referenced image missing 時必須可觀察 placeholder

## First Evidence

第一份 probe 使用 Wall：

~~~text
knowledge/wall/day-7-ipados-27-developer-love.md
~~~

Export working copy 額外加入：

- Mermaid flowchart specimen
- SQL fenced block
- table
- blockquote
- `<!-- pagebreak -->`

結果：

- 7-page A4 PDF generated
- Traditional Chinese fonts embedded
- Mermaid subset rendered as vector SVG
- SQL syntax highlighting rendered
- table / blockquote / manual page break rendered
- GitHub-referenced PNG binary 未 materialize，因此 renderer 正確顯示 placeholder

這表示 Markdown → PDF Rendering Pattern 本身成立；GitHub binary → Primary local materialization 仍屬 A-ARTIFACT-1 open boundary。

## Promotion Rule

這是 Primary 可反覆使用的 **Authoring / Publication Capability**，不是只在本次 Experiment 使用的一次性 script。

新 Conversation 需要產 PDF 時：

~~~text
Capability Inventory
→ knowledge/implementation/markdown-to-pdf.md
→ scripts/render-markdown-pdf.py
→ source Markdown
→ local render / verify
→ requested delivery surface
~~~

不要每次從零重新發明 PDF CSS。人類已經付過一次排版稅。
