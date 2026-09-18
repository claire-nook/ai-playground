# Artifact Collaboration Operating Guide

- Status: Operational collaboration guide
- First established: 2026-09-18
- Scope: Claire × Primary Agent / iPad-first artifact intake, processing, repository publication, durable human delivery
- Evidence origin: A-ARTIFACT-1
- Principle: 日常工作先照這份做；只有遇到 boundary / regression / new capability 時才回 Experiment 考古。

## 1. Why This Exists

這份文件不是 Connector 功能表。

它解決的是一個比較實際、也比較容易反覆失憶的問題：

> Claire 與 Primary 要怎麼交換圖片、PDF、Markdown 與其他 artifact，才能讓 Human 只保留必要 judgment / authorization gate，而不是被迫擔任 resize、rename、upload、commit、push、path lookup 與 delivery middleware？

新的 Conversation 若要處理 artifact，**先恢復這份 operating pattern，再做 Tool Discovery**。不要因為某一個 Provider capability 有限制，就自行推論整條 workflow 不存在。

## 2. Canonical Collaboration Surfaces

### GitHub

Role：

- canonical technical source
- versioned knowledge / implementation / experiment state
- durable Agent memory
- publication destination when artifact belongs in Repository

Primary 應自行導航 Repository。對既有 Wall / Knowledge / Experiment / script，不應先要求 Claire 提供 repo path。

### Dropbox

~~~text
/AI Inbox
= Claire → Primary intake
= Human Drop Zone
= raw source stays unchanged

/AI 工作區
= Primary-owned autonomous workspace
= staging / intermediate / operational artifacts

/AI Output
= Primary → Claire durable finished-artifact delivery
= Claire 從 iOS Files / Dropbox provider 取用
~~~

Dropbox 整體不是 Primary 的私人領地；以上三個 root 才是 canonical collaboration boundary。

Claire 提到「之前放 Dropbox 的檔案」時，Primary 應先自行搜尋 `/AI 工作區` / `/AI Output`，不要把 path discovery 丟回 Human。

### Conversation

Role：

- current collaboration session
- reliable binary intake when Claire explicitly uploads / shares artifact
- generated artifact bridge to Dropbox upload
- transient working surface，不是 durable archive

Conversation download link 不應被當成需要稍後使用的正式交付方式。人類去洗澡不是 artifact retention policy。

## 3. Daily Workflow A｜Human Artifact → Primary → GitHub

適用：

- Claire 截圖 / 照片 / image artifact 要進 Repository
- Wall / Evidence / Documentation 需要 binary asset
- artifact 需要 resize / rotate / convert / metadata strip / naming

Current operational path：

~~~text
Claire captures / selects source
→ source may live in Photos / Dropbox
→ Claire uploads required binary into Conversation
→ Primary local processing
→ Primary validates output
→ Primary uploads processed artifact to Dropbox staging
→ Primary gets temporary single-use download URL
→ Primary builds canonical batch_json
→ Claire runs [COLLAB] Artifact Batch Publish once
→ GitHub Actions fetches binary + verifies integrity
→ Repository commit
→ Primary performs repository / visual QC
~~~

Canonical collaboration tool：

~~~text
.github/workflows/collab-artifact-batch-publish.yml
.github/workflow-contracts/artifact-batch-publish.schema.json
~~~

Human responsibility：

~~~text
select / provide missing source artifact
→ public / functional judgment
→ one Run per batch
~~~

Primary responsibility：

~~~text
repository navigation
→ processing
→ canonical naming / path
→ validation
→ Dropbox staging
→ temporary URL
→ batch_json
→ post-publication QC
~~~

### Important Intake Boundary

Ideal but currently not established：

~~~text
Dropbox existing binary
→ Primary local processing workspace
~~~

Accepted operational fallback：

~~~text
Dropbox / Photos
→ Claire selects file
→ Conversation upload
→ Primary local processing
~~~

這個 fallback 已經把 Human responsibility 從「自己處理 + Working Copy + commit / push」縮到「選取 source artifact」。不要因為還有一次 Human upload 就把整條 workflow 判成失敗。

## 4. Daily Workflow B｜GitHub Source → Primary → Dropbox Human Output

適用：

- Claire 要一份階段性 PDF
- Repository Markdown / Wall / technical note 要變成人類可讀成品
- 成品不屬 canonical Repository state，不值得為了「Claire 現在想拿一份」製造奇怪 PDF commit

Current operational path：

~~~text
Claire identifies content by human-facing meaning
→ Primary locates canonical GitHub source
→ Primary materializes text / supported inputs locally
→ Primary uses reusable rendering / processing pattern
→ Primary validates finished artifact
→ Primary uploads to /AI Output/<reasonable-name>
→ Claire opens iOS Files
→ Dropbox
→ AI Output
→ native iOS Preview / other chosen app
~~~

Dropbox 在這條路是 durable storage + sync layer；iOS Files 才是 Claire 日常 discovery surface，iOS Preview 是 PDF reading surface。

### Markdown → PDF Canonical Pattern

不要每次重新發明 PDF CSS。

Canonical guide：

~~~text
knowledge/implementation/markdown-to-pdf.md
~~~

Canonical renderer：

~~~text
scripts/render-markdown-pdf.py
~~~

Current verified rendering capability：

- Traditional Chinese / mixed English typography
- headings / lists / blockquote / table
- explicit fenced-language syntax highlighting
- `<!-- pagebreak -->` manual page break
- bounded Mermaid flowchart subset → vector diagram
- local image embedding
- missing-image visible fallback
- PDF render-to-PNG visual QC

Verified image control：

~~~text
Conversation-uploaded JPEG
→ Primary local workspace
→ Markdown relative image
→ PDF embed
= Verified
~~~

因此，若 PDF 缺圖但 local image 已存在，才應調查 renderer；若 referenced binary 根本沒有 materialize 到 local workspace，則是 Artifact Transport boundary，不要亂改 PDF CSS。

## 5. Known Binary Boundaries｜不要把限制說錯方向

### Dropbox existing binary → Primary local

~~~text
metadata / preview / temporary URL
✅

direct reliable local binary materialization
❌ Not established / Deferred
~~~

### GitHub repository binary → Primary local

目前 general binary materialization 仍未建立。

實測：

~~~text
GitHub Markdown text → Primary processing
✅

GitHub referenced repository PNG → Primary local binary
❌ current runtime boundary

Conversation-uploaded image → Primary local binary → PDF
✅
~~~

因此不要把它寫成「PNG 不支援」。真正 boundary 是：

> GitHub repository binary asset → Primary local workspace 尚未形成 general path。

JPEG / PDF / other binary 都不得在沒有 Evidence 時自動假設可行。

## 6. Human Output Rule

Claire 若要求：

- 「放 Dropbox」
- 「給我一份 PDF」
- 「我要晚點看」
- 「做個成品給我」
- 或任何需要 durable file delivery 的同義需求

Primary 應優先考慮：

~~~text
/AI Output/<reasonable-filename>
~~~

不要把 Conversation temporary download 當唯一正式交付。

Primary 可自行決定合理 filename；不需要每次重新詢問 output root。

## 7. Recovery / Self-check Before Saying "Can't"

Primary 在宣稱 artifact workflow「不能做」以前，至少：

1. 讀本 Operating Guide 的 relevant path。
2. 做當前 session Tool Discovery。
3. 區分 Provider Capability 與 Validated Workflow。
4. 區分資料流方向，例如：
   - Dropbox binary → Primary local
   - Primary local → Dropbox
   不是同一個 capability。
5. 檢查 current Conversation 是否已經存在可用 artifact。
6. 檢查 canonical Dropbox surfaces / Repository source。
7. 只有真正缺 Human judgment / authorization / unavailable transport 時才交回 Claire。

禁止這種失憶式推論：

~~~text
Dropbox → local blocked
therefore
Primary → Dropbox impossible
~~~

也禁止：

~~~text
GitHub binary → local blocked
therefore
Markdown → PDF renderer cannot embed images
~~~

Case B 已證明 local image embedding 正常。

## 8. Source of Truth / Progressive Loading

日常操作：

~~~text
knowledge/implementation/artifact-collaboration-workflow.md
~~~

PDF rendering：

~~~text
knowledge/implementation/markdown-to-pdf.md
scripts/render-markdown-pdf.py
~~~

Repository binary publication：

~~~text
.github/workflows/collab-artifact-batch-publish.yml
.github/workflow-contracts/artifact-batch-publish.schema.json
~~~

研究歷史 / failure modes / Evidence：

~~~text
experiments/artifact-transport/README.md
~~~

Progressive Loading：

~~~text
Capability Inventory
→ Operating Guide
→ specific implementation pattern
→ Experiment Evidence only if needed
~~~

先恢復能力，再考古。不要每次從新手村重練。
