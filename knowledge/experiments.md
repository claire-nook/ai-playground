# Experiment Catalog

這份 Catalog 回答：**我們曾經做過哪些 Experiment，而且當時為什麼要做？**

完整 Method / Evidence 留在 Experiment Record 與 Evidence Index，這裡只保存短摘要、Status、Tags 與 Links。

---

## 2026-09-19

### D1-NATIVE-1 — Day One Native Reader

- Status: In Progress / M1 Verified
- Card: [../experiments/dayone-native-reader/d1-native-1.catalog.json](../experiments/dayone-native-reader/d1-native-1.catalog.json)
- Record: [../experiments/dayone-native-reader/README.md](../experiments/dayone-native-reader/README.md)
- Extends: [D1-READER-1](../experiments/dayone-reader/README.md)
- Private Execution: `claire-nook/apple-lab/projects/DayOneNativeReader.swiftpm/`
- Primary Intent: Open Exploration / Local-first Personal Archive
- Tags: day-one, swift, swiftui, swift-playgrounds, json, rich-text, photokit, ipad-first, local-first, data-portability

**Why it exists**

Browser Reader 已回答 Day One export 能否 local-first 閱讀；Native 路線改問 Claire 自用 iPad Reader 是否能保留 structured richText，並直接利用 Photos / iCloud 作既有照片來源，而不是維護第二份大量 exported photos。

**Current evidence / scope**

- M1 已由 Claire iPad Human Environment 驗證：Files 選取 JSON → JSONDecoder → Swift model → 3 篇 entry List / Detail → flattened readable text。
- attachment metadata / count 可被 model 辨識不等於 physical media rendering；目前沒有 15 張照片或 PDF 的 Native 顯示 Evidence。
- 下一個核心 milestone 是 M2 richText semantic reconstruction。
- M3 目標是 JSON-derived photo identifier → PhotoKit → Photos / iCloud → Native Reader image。
- PDF 明確 Out of Scope；Native Reader 不追求 Browser Reader 全功能 parity。

**Current judgment**

Native JSON ingestion / basic reading 已 Verified；richText reconstruction 與 JSON-derived PhotoKit integration 尚未驗證。Experiment 維持 In Progress。

---

### D1-READER-1 — Day One JSON Local Reader

- Status: Verified / Completed
- Card: [../experiments/dayone-reader/d1-reader-1.catalog.json](../experiments/dayone-reader/d1-reader-1.catalog.json)
- Record: [../experiments/dayone-reader/README.md](../experiments/dayone-reader/README.md)
- Live Demo: [/dayone-reader/](/dayone-reader/)
- Sample Export: [/downloads/dayone-reader/dayone-reader-sample-export.zip](/downloads/dayone-reader/dayone-reader-sample-export.zip)
- Human Guide: [/downloads/dayone-reader/dayone-reader-guide-v0.5.pdf](/downloads/dayone-reader/dayone-reader-guide-v0.5.pdf)
- Wall: [wall/dayone-reader-escape-hatch.md](wall/dayone-reader-escape-hatch.md)
- Primary Intent: Day One export → local-first, read-only long-term reader
- Tags: day-one, local-first, browser, json, privacy, ipad-first, photo-rendering, pdf-attachment, data-portability

**What was established**

- Day One structured JSON 可直接作 Browser Reader source of truth，不需要先轉成另一套 canonical archive。
- richText、metadata、search / advanced filter、原始 line structure 與主要 list / checklist / embedded media presentation 已在 Claire iPad 實機形成 Human Environment Evidence。
- JSON-only 是正式 fallback；缺少 local media 時保留 photo / PDF 原文章位置與 placeholder。
- Day One 原生 `photos/` 與 `pdfs/` 均可依 export identifier / md5 contract 對回文章，不要求重新命名或重組 media。
- Reader 使用 Browser local file selection / object URL，不要求把私人 Journal 上傳到 backend。
- 公開 Sample Export 已包含 JSON、15 photos、1 PDF，並通過 ZIP integrity 與 media reference completeness 檢查。

**Known boundaries / deferred**

- 大型 Journal performance / lazy rendering 尚未形成獨立 Evidence；真實需求出現時再重開。
- Day One 未來或尚未遇到的 richText / media capability 不被假裝成已窮舉；新 edge case 採 problem-triggered reopening。
- Native Swift / PhotoKit Reader 是另一個 Experiment，不屬於 D1-READER-1 completion criteria。

**Current judgment**

Browser local-first Reader 已回答原始 Research Question，D1-READER-1 關閉為 **Verified / Completed**。完成代表目前 scope 已有足夠 Evidence，不代表向 Day One export schema 申請永久保固。

---

## 2026-09-18

### A-ARTIFACT-1 — AI-assisted Artifact Collaboration Workflow

- Status: Completed / Operational Workflow + Known Boundaries
- Card: [../experiments/artifact-transport/a-artifact-1.catalog.json](../experiments/artifact-transport/a-artifact-1.catalog.json)
- Record: [../experiments/artifact-transport/README.md](../experiments/artifact-transport/README.md)
- Operating Guide: [implementation/artifact-collaboration-workflow.md](implementation/artifact-collaboration-workflow.md)
- Workspace Policy: [implementation/primary-workspace-housekeeping.md](implementation/primary-workspace-housekeeping.md)
- Dropbox PDF Boundary: [implementation/dropbox-pdf-reading-boundary.md](implementation/dropbox-pdf-reading-boundary.md)
- Primary Intent: Claire × Primary Agent / Artifact Intake → Processing → Routing → Delivery
- Tags: agent-collaboration, artifact-workflow, dropbox, github, ipad-first, binary-transport, privacy-boundary, human-middleware

**What was established**

- Human / Conversation artifact → Primary local processing → GitHub publication 已 operational。
- GitHub text/source → Primary processing / rendering → Dropbox `/AI Output` → iOS Files / Preview 已 operational。
- `/AI 工作區` 已定義為 Primary autonomous scratch / staging surface，並完成 create → stage → rename → verify → cleanup 真實 lifecycle probe。
- Markdown → Human-facing PDF 已有 reusable renderer：`scripts/render-markdown-pdf.py`。
- Dropbox PDF reading boundary 已用真實 2.66 MB 與 95.15 MB PDF 驗證：<=5 MiB 可 full extracted-text fetch；>5 MiB 保留 metadata / preview / temporary download link，但 full fetch 受 5 MiB hard limit，且目前沒有 page-range / partial fetch primitive。

**Known boundaries / deferred**

- Dropbox existing binary → Primary local：Deferred / not established。
- GitHub repository binary → Primary local：Deferred / not established。
- Primary autonomous workflow_dispatch：等待 future Connector surface；Claire 目前每批一次 Run。
- rollback / recovery：只在真實痛點出現時重開。
- specialized PDF / academic connector：未來有實際讀書 / research 需求時另開實驗。

**Current judgment**

日常 Artifact Collaboration 已可用；剩餘限制均已被隔離成 platform boundary 或 problem-triggered research，不再阻擋 A-ARTIFACT-1 結案。

---

## 2026-09-17

### F-MAINT-1 — Single-record Maintenance Lifecycle Prototype

- Status: `Completed / Pattern Candidate Established`
- Verification: `Partial — Functional / Interaction Evidence`
- Card: [`../experiments/feature-maintenance/f-maint-1.catalog.json`](../experiments/feature-maintenance/f-maint-1.catalog.json)
- Record: [`../experiments/feature-maintenance/README.md`](../experiments/feature-maintenance/README.md)
- Findings: [`../evidence/f-maint-1-findings.md`](../evidence/f-maint-1-findings.md)
- Pattern Synthesis: [`platform/single-record-maintenance-pattern.md`](platform/single-record-maintenance-pattern.md)
- Predecessors: [`../experiments/feature-query/README.md`](../experiments/feature-query/README.md) / [`../experiments/feature-detail/README.md`](../experiments/feature-detail/README.md)
- Live Demo: [`/feature-maintenance/`](/feature-maintenance/)
- Primary Intent: `Nook Technical Platform / Internal Enterprise Single-record Maintenance lifecycle`
- Tags: `nook-platform`, `maintenance`, `create`, `update`, `read`, `worklist`, `dirty-state`, `validation`, `mutation-policy`, `last-write-wins`, `ipad-first`, `rwd`

**What was established**

F-MAINT-1 承接 Query / Read Detail baseline，將 Nook Works ordinary single-record maintenance 收斂為 Worklist-centric lifecycle：Read / Create / Update 都是由 Query Worklist 暫時進入的 operation，Read 返回、Create/Update Save 或 Cancel 後回到 Query Context。`Update → Save → Read Detail → Return Query` 在高頻 key 單情境下被否決並保留為 negative evidence。

Concurrency 不再被當成所有 Update 的預設 optimistic locking。Current candidate 是 ordinary maintenance 預設 `Last Write Wins`，Feature 若有明確 Requirement 再升級 stale-update detection 或 business-state-sensitive mutation。Platform 應提供 decision guardrail，而不是假設每位 SA 都會主動想到這題。

**Boundary**

Maintenance 與 Workflow / Approval 是不同 Pattern；Common Pattern 也不等於 common page implementation。Prototype UI 只承載 operation semantics，不把按鈕位置或 visual layout 升格成 Platform Rule。

### F-DETAIL-1 — Master → Detail Interaction Prototype

- Status: `Completed / Pattern Candidate Established`
- Card: [`../experiments/feature-detail/f-detail-1.catalog.json`](../experiments/feature-detail/f-detail-1.catalog.json)
- Record: [`../experiments/feature-detail/README.md`](../experiments/feature-detail/README.md)
- Predecessor: [`../experiments/feature-query/README.md`](../experiments/feature-query/README.md)
- Findings: [`../evidence/f-detail-1-findings.md`](../evidence/f-detail-1-findings.md)
- Pattern Synthesis: [`platform/record-detail-pattern.md`](platform/record-detail-pattern.md)
- Live Demo: [`/feature-detail/`](/feature-detail/)
- Primary Intent: `Nook Technical Platform / Query → Detail interaction lifecycle`
- Tags: `nook-platform`, `feature-ui`, `master-detail`, `read-only-detail`, `query-context`, `stable-identity`, `audit-pattern`, `pagination`, `ipad-first`, `rwd`

**What was established**

F-DETAIL-1 從 v1 的 Requirement Carrier leakage 修正到 v2 General Detail Pattern：Business Content 由 Feature Specification 決定，Platform 提供一致 Detail lifecycle / presentation conventions；Audit 成為 Platform Standard sub-pattern candidate；Query Context 不等於舊 page number，stable record identity 是 return-context anchor candidate。Common Pattern 不等於 auto-generated page。

**What it unlocked**

Read-only Detail / Return Context baseline 可以進入後續 Maintenance challenge。Production 如何 bounded resolve anchor position / cursor 仍為 Open Contract，不因 Browser mock 可以掃完整 fixture 就假裝完成。

### F-QUERY-1 — Representative Read-only Query Vertical Prototype

- Status: `Completed / Pattern Candidate Established`
- Card: [`../experiments/feature-query/f-query-1.catalog.json`](../experiments/feature-query/f-query-1.catalog.json)
- Record: [`../experiments/feature-query/README.md`](../experiments/feature-query/README.md)
- Architecture Synthesis: [`platform/application-platform-architecture.md`](platform/application-platform-architecture.md)
- Live Demo: [`/feature-query/`](/feature-query/)
- Primary Intent: `Nook Technical Platform / Business Feature → Technical Platform Pattern`
- Tags: `nook-platform`, `feature-ui`, `read-only-query`, `pagination`, `sorting`, `ipad-first`, `rwd`

**Why it existed**

S-SHELL-1 已回答 Feature 如何進入 Application Runtime，但不回答一個最基本的 Business Feature 應承載哪些 interaction / operation responsibilities。F-QUERY-1 以 Daily Weather Batch 執行紀錄作 requirement carrier，先用 representative mock 建立可推翻的 Functional Prototype，再逐輪把 Batch-specific content、Query Pattern、Data Contract 與 Platform responsibility 拆開。

**What was established**

- Query 共通骨架收斂為 Feature Identity / Query Criteria / Query Action / Query Result。
- Result List 應是 curated business view，不等於 physical record / API payload dump。
- Nook Works 目前不把 horizontal scroll 當 Result Table 的正常設計能力；這是 Pattern-specific candidate，不是 general platform law。
- Business Query Boundary 與 Technical Result Boundary 必須分離：SA / Requirement 收斂合理查詢範圍，Technical Platform 仍需保證單次 interaction cost 有界。
- Enterprise-style Query baseline candidate 納入 server-side Filter / Sort / Pagination、total count、page navigation 與 page size；完整且明確 bounded 的小型 Result Set 才保留 Browser-side processing variant。
- Multi-select 是 field capability，不是所有 dropdown 的預設。
- Master → Detail return context 已辨識為下一 Pattern 的 known design pressure：User 返回時應恢復工作資料上下文，不能只機械還原舊 page number；stable row identity 是重要 anchor candidate。

**What it unlocked**

Read-only Query 第一輪 research cycle 可以關閉，Current Judgment 已進入 `knowledge/platform/application-platform-architecture.md` v0.3。下一個真實 Requirement 可以重用、延伸或打壞這個 Candidate。

## 2026-09-16

### S-SHELL-1 — Nook Works Application Shell Integration Probe

- Status: `Verified / Completed`
- Card: [`../experiments/application-shell/application-shell.catalog.json`](../experiments/application-shell/application-shell.catalog.json)
- Record: [`../experiments/application-shell/README.md`](../experiments/application-shell/README.md)
- Consolidated Findings: [`../evidence/s-shell-1-application-shell-findings.md`](../evidence/s-shell-1-application-shell-findings.md)
- Auth Lifecycle Evidence: [`../evidence/2026-09-16-safari-auth-session-lifecycle.md`](../evidence/2026-09-16-safari-auth-session-lifecycle.md)
- Live Demo: [`/application-shell/`](/application-shell/)
- Primary Intent: `Nook Technical Platform / Application Shell Lifecycle & Composition`
- Tags: `nook-platform`, `application-shell`, `supabase-auth`, `application-user`, `routing`, `session-lifecycle`, `data-api`, `ipad-first`, `rwd`

**Why it existed**

既有 Auth、Application Access、Native Data API、Custom API 與 External API capability 都已各自驗證，但正式 Nook Works 需要的是能把這些能力組成 coherent Application Runtime 的 Shell，而不是一桌互不相識的 Demo。S-SHELL-1 因此只研究 composition/lifecycle，不研究 CRUD、Design System 或 production framework。

**What is verified**

- Auth / persisted Session → active `app_user` → Application User Context → Shell Ready。
- metadata-driven Navigation / Route / Feature Entry，並驗證 admin/user/guest 不同 coarse classification。
- Place Native、Place Weather、Place-Country Custom API 三種 real integration shape 可共存於同一 Shell。
- iPad/iPhone responsive Shell / Navigation / Feature rendering。
- deep link、reload、same-browser new-tab persisted Session、cross-browser unauthenticated deep link、Back/Forward。
- Session refresh/invalidation lifecycle 與 explicit current-session Logout；Logout 後 re-entry 要求 Login，單純 Browser Back/leave 不等於 Logout。
- Navigation Visibility / Route Entry 與 Backend Authorization 保持不同 responsibility。

**What it unlocked**

Application Shell lifecycle 不再是 Platform technical blocking gap。Formal Nook Works 可把 verified Shell contract、portable route/navigation logic 與 implementation lifecycle traps 作 Platform Shell design input，再依正式 repository structure 重構；不要直接把 Playground monolithic `app.js` 當 Production architecture。

### T-TXT-1 — Textastic Markdown Preview / Manual Print Page Break

- Status: `Verified / Completed`
- Card: [`../experiments/textastic-markdown/t-txt-1.catalog.json`](../experiments/textastic-markdown/t-txt-1.catalog.json)
- Record: [`../experiments/textastic-markdown/README.md`](../experiments/textastic-markdown/README.md)
- Artifacts: [`markdown_head.html`](../experiments/textastic-markdown/markdown_head.html) / [`markdown.css`](../experiments/textastic-markdown/markdown.css)
- Commentary: [`wall/textastic-2290-markdown-upgrade.md`](wall/textastic-2290-markdown-upgrade.md)
- Primary Intent: `iPad-first Authoring / Textastic Markdown Preview / Manual Print Control`
- Tags: `ipad-first`, `textastic`, `markdown`, `webkit`, `print-pdf`, `manual-page-break`, `authoring-tooling`

**Why it existed**

Textastic 在 iPadOS 上是 Claire 的主要 Markdown authoring / preview surface，但原生 Preview 不支援手動 page break、Mermaid 與明確 code syntax highlighting。T-TXT-1 驗證 custom Markdown Preview 可以把這些能力補進 iPad-first authoring workflow，而不需要 Desktop toolchain。

**What is verified**

- Mermaid fenced code 可在 Textastic Preview render。
- `<!-- pagebreak -->` 可在 Preview 顯示 marker、Print 時隱藏並強制 page break。
- 明確 language fence 可由 Highlight.js 提供 syntax highlighting；未標 language 的 fenced code 保持 plain。
- 這些能力已進入 Primary Agent Capability Inventory，成為後續 Markdown authoring 可直接利用的基礎能力。
