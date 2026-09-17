# Experiment Catalog

這份 Catalog 回答：**我們曾經做過哪些 Experiment，而且當時為什麼要做？**

完整 Method / Evidence 留在 Experiment Record 與 Evidence Index，這裡只保存短摘要、Status、Tags 與 Links。

---

## 2026-09-17

### F-DETAIL-1 — General Master → Detail Interaction Prototype

- Status: `Completed / Pattern Candidate Established`
- Verification: `Partial — Functional / Interaction Evidence`
- Card: [`../experiments/feature-detail/f-detail-1.catalog.json`](../experiments/feature-detail/f-detail-1.catalog.json)
- Record: [`../experiments/feature-detail/README.md`](../experiments/feature-detail/README.md)
- Findings: [`../evidence/f-detail-1-findings.md`](../evidence/f-detail-1-findings.md)
- Pattern Synthesis: [`platform/record-detail-pattern.md`](platform/record-detail-pattern.md)
- Predecessor: [`../experiments/feature-query/README.md`](../experiments/feature-query/README.md)
- Live Demo: [`/feature-detail/`](/feature-detail/)
- Primary Intent: `General Record Detail / Query → Detail → Return lifecycle`
- Tags: `nook-platform`, `feature-ui`, `master-detail`, `read-only-detail`, `query-context`, `stable-identity`, `audit-pattern`, `pagination`, `ipad-first`, `rwd`

**Why it existed**

F-QUERY-1 已把 List-only Query 與 Master → Detail 明確拆開，並留下 stable row identity、return-context restoration 與 Browser History 作下一輪 design pressure。F-DETAIL-1 研究 User 從 Query Result 選取單筆資料、閱讀完整資訊、再返回原工作上下文時，Platform 與 Feature 的責任如何拆分。

**What was established**

- v1 因 Requirement Carrier leakage 過度擬合 Batch-specific content，保留為 negative evidence。
- v2 改用 Synthetic Business Object，收斂成 Feature-defined Business Content + Platform-standard Detail conventions。
- Common Pattern 不等於 auto-generated page；正式 Feature 仍由 Specification 決定 business composition。
- 固定一列三欄不是 Platform Rule；`normal / wide / full` 目前只作 layout capability / guideline candidate。
- Long Text 應與普通短欄位區分，並保持 `Long Text ≠ Rich Text`。
- Audit 應作 Platform Standard sub-pattern，普通 Record Detail 使用一致的 Created / Updated semantics 與 presentation。
- Query Context 不等於舊 page number。返回時應以 stable record identity 在 current result ordering 重新定位，再衍生 current page / scroll anchor。
- Browser prototype 的 full-fixture scan 不代表 Production Backend strategy；bounded anchor-position / cursor resolution 仍是 Open Contract。

**What it unlocked**

Read-only General Master → Detail 第一輪可以關閉，下一個 Pattern challenge 進入 Maintenance：Create / Update / Read 的共同 contract、separate surfaces vs mode-based implementation、capability / authorization、Save / Cancel / Dirty State、Browser History 與 concurrent update conflict。

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

Read-only Query 第一輪 research cycle 可以關閉，Current Judgment 已進入 `knowledge/platform/application-platform-architecture.md` v0.3。下一個真實 Requirement 可以重用、延伸或打壞這個 Candidate；Master → Detail、Maintenance、Export、Cursor / Keyset Pagination、Multi-column Sort 等不在 F-QUERY-1 假裝完成。

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

下一個 Browser research front 是 Feature UI / Maintenance Interaction：List/Table、query、CRUD/Form、Save/Cancel、Browser History、unsaved changes、query-state restoration 等。

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
