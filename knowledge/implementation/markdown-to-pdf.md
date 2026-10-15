# Markdown → Human-facing PDF Rendering Pattern

- Status: Verified local pattern / reusable rendering method
- First verified: 2026-09-18
- Origin: A-ARTIFACT-1 / Markdown-to-PDF output research
- Reuses: Textastic forest-style visual language, explicit fenced-language philosophy, manual page-break contract

## Intent

這個 Pattern 解決的不是「PDF 能不能產生」，而是：

> 如何把 Repository 中的 Markdown 轉成可驗證、可交付的 Human-facing PDF，而不需要每次重新手刻一套排版。

Canonical renderer：

~~~text
scripts/render-markdown-pdf.py
~~~

Execution shape：

~~~text
GitHub Markdown source
→ renderer workspace
→ reusable Markdown renderer
→ HTML/CSS transformation
→ PDF
→ visual / structural verification
→ requested delivery surface
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

Local image embedding 已由 Conversation-uploaded JPEG control case 正式驗證：

~~~text
Conversation upload
→ Primary local workspace
→ Markdown relative image
→ PDF embed
✅ Verified
~~~

因此，**renderer 本身支援圖片**。如果 PDF 出現 missing-image placeholder，應先判斷 referenced binary 是否真的已 materialize 到 renderer workspace，不要先怪 CSS / Markdown / WeasyPrint。

Markdown source 可由 GitHub Connector 直接讀取，但 Repository binary image 與 renderer filesystem 是不同 execution surface。

如果 referenced image bytes 尚未 materialize 到 renderer workspace：

~~~text
GitHub Markdown        → renderer input text       Verified
GitHub repository PNG  → renderer input binary     Not yet established as general path
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

這是可反覆使用的 **Authoring / Publication Pattern**，不是只在本次 Experiment 使用的一次性 script。

需要產 PDF 時：

~~~text
knowledge/implementation/markdown-to-pdf.md
→ scripts/render-markdown-pdf.py
→ source Markdown + available local assets
→ render / inspect / verify
→ requested delivery surface
~~~

保留已驗證的排版方法，避免重複實作。


## Delivery boundary

PDF 的渲染與保存位置是不同責任。完成 PDF 結構與視覺驗證後，應依實際任務指定的交付位置保存；暫時性下載連結不應被當作永久存放保證。

A-ARTIFACT-1 曾驗證以雲端檔案儲存搭配 iOS Files / Preview 交付成品；該歷史案例與平台限制詳見 [Experiment Record](../../experiments/artifact-transport/README.md)。
