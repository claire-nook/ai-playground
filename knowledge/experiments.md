# Experiment Catalog

這份 Catalog 回答：**我們曾經做過哪些 Experiment，而且當時為什麼要做？**

完整 Method / Evidence 留在 Experiment Record 與 Evidence Index，這裡只保存短摘要、Status、Tags 與 Links。

---

## 2026-09-17

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

一般 Markdown → PDF 不需要人工接管 pagination；只有少數特殊交付文件需要 Claire 明確指定某個章節從新頁開始。研究目標因此不是建立 PDF Engine，而是在不影響原生 automatic pagination 的前提下加入 opt-in manual page break。

**What is verified**

- Markdown `<!-- pagebreak -->` 可由 Textastic custom `markdown_head.html` 轉成 `.page-break` DOM node。
- Textastic Preview 可顯示 `PAGE BREAK` 作者提示，Print media 可隱藏提示並在該位置強制換頁。
- A4 / 100% iPadOS Print Preview minimal probe 驗證成功。
- 真實 15 頁長文件驗證：人工 marker 與 WebKit / iPadOS 原生 automatic pagination 可共存。
- 沒有 marker 時，不建立 page-break node，也不加入 page-level pagination intervention。

**What it unlocked**

保留一套可直接安裝的 Textastic Markdown Preview customization：森林霧綠 theme、Mermaid rendering 與 opt-in manual print page break。特殊 PDF 文件可透過 Print Preview → 人工插入 `<!-- pagebreak -->` → 再 Preview 的方式逐頁微調，不需要為 1% 的需求改造 99% 的 Markdown workflow。

## 2026-09-15

### P-CODEX-PHONE — ChatGPT → Codex Autonomous Dispatch Reconnaissance

- Status: `Verified / Deferred by Provider Gap`
- Record: [`../experiments/codex-dispatch/README.md`](../experiments/codex-dispatch/README.md)
- Research Map: [`maps/ai-agent-collaboration.md`](maps/ai-agent-collaboration.md)
- Primary Intent: `AI Engineering / Multi-Agent Collaboration / Remove Human Relay`
- Tags: `ai-engineering`, `codex`, `agent-collaboration`, `remote-execution`, `github-actions`, `authentication`, `credential`, `ipad-first`

**Why it existed**

Claire 目前仍需在 ChatGPT Primary 與 Codex 之間手動複製 Work Order、啟動 Task、再回報完成。研究目標不是移除人類判斷，而是消除這段沒有判斷價值的 Human Relay / middleware responsibility。

**What is verified**

- GitHub 可以承擔 Work Order / Report / PR / Evidence 的 durable collaboration state。
- `codex exec` 可作 non-interactive execution primitive；Codex Cloud Task 與 `codex exec` 的 workspace / repository / credential boundary 不同。
- ChatGPT sign-in 與 API-key sign-in 是不同 billing boundary；API key route 會進 API pricing，不符合本案「使用既有 Plus Codex allowance」的成本條件。
- Current provider gap 是缺少 supported subscription-backed unattended workload identity / stable task invocation。Device auth 仍需人類；restore personal auth state 到 CI 不符合 credential custody；persistent runner 維運成本不合理。

**What it unlocked**

研究沒有進入 Phase 3 implementation。Current Architecture Judgment 是 `WAIT`：保留 Claire 一次 per-task dispatch gate，持續使用 OpenAI-managed Codex Cloud + GitHub evidence + Primary QC。未來若出現 stable Cloud Task API、subscription workload identity、GitHub OIDC federation、official short-lived CI credential helper 或 direct ChatGPT→Codex tool，再重新開啟，不必從零研究。

### D-BATCH-1 — Supabase Batch Runtime / Scheduling

- Status: `Verified / Completed`
- Record: [`../experiments/batch-scheduling/README.md`](../experiments/batch-scheduling/README.md)
- Phase Evidence: [`../evidence/d-batch-1-phase-1.md`](../evidence/d-batch-1-phase-1.md)
- Parameter Evidence: [`../evidence/d-batch-1-parameter-invocation.md`](../evidence/d-batch-1-parameter-invocation.md)
- Live Demo: [`/cron-edge-observer/`](/cron-edge-observer/)
- Primary Intent: `Nook Technical Platform / Batch Runtime / Scheduling Feasibility`
- Tags: `nook-platform`, `batch-runtime`, `supabase`, `postgresql`, `data-api`, `external-api`, `parameterized-invocation`, `observability`, `platform-pattern`

**Why it existed**

Auth、Database 與主要 Custom API candidate 已集中於 Supabase，因此以最小 producer / consumer experiment 確認 Supabase-managed scheduling 是否能合理承擔 Nook Works 常見 batch responsibility，並進一步驗證 scheduled API parameter preparation 的責任邊界。

**What is verified**

```text
Cron → PostgreSQL Database Function → synthetic row
Cron → pg_net → Edge Function
Edge Function → Native Data API SELECT / UPDATE on authorized synthetic table
Cron-scheduled Edge Function → Open-Meteo → synthetic SUCCESS + temperature
Cron HTTP body ← static literal
Cron HTTP body ← execution-time SQL expression
Cron HTTP body ← PostgreSQL Function return value
```

Cron job lifecycle 也已實測：`cron.schedule / cron.alter_job / cron.unschedule`，並可從 `cron.job` inspect runtime definition。

**What it unlocked**

Batch parameter preparation 的已知 capability ladder：

```text
Static Literal
→ SQL Runtime Expression
→ DB Helper Function
→ Launcher / Preparation API
→ Orchestrator
```

前三層有直接 runtime Evidence。`Cron → Launcher API → Core API` 的 building blocks 已由既有 Custom API composition / Native Data API / External API evidence 支持，因此不另做重複 probe。

Platform adoption 必須區分：`Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule`。平台初期可只標準化少數 Pattern，其他已知能力保留為 Deferred / Future Expansion Candidate，隨需求與平台成熟度再 Promote。

Formal `place` SELECT 曾因 current `service_role` 缺少 table SELECT privilege 而失敗。這不是 Cron limitation；該問題已抽離並由 C-BSA-1 完成驗證。

### C-BSA-1 — Custom API / Backend Service Database Access

- Status: `Verified / Completed`
- Card: [`../experiments/custom-api/c-bsa-1.catalog.json`](../experiments/custom-api/c-bsa-1.catalog.json)
- Record: [`../experiments/custom-api/c-bsa-1.md`](../experiments/custom-api/c-bsa-1.md)
- Consolidated Findings: [`../evidence/c-bsa-1-consolidated-findings.md`](../evidence/c-bsa-1-consolidated-findings.md)
- Primary Intent: `Nook Technical Platform / Backend Service Access / Database Authorization & Transaction`
- Tags: `nook-platform`, `custom-api`, `backend-service`, `data-api`, `rpc`, `postgresql`, `authorization`, `transaction`

**Why it existed**

D-BATCH-1 已證明 service-authenticated Edge Function 可讀寫有權限的 synthetic table，但 formal `place` read 暴露了 service identity、table privilege 與 RLS 是不同層次。C-BSA-1 因此獨立回答 Backend Service 如何存取 PostgreSQL objects，以及完整 Business Operation 的 transaction boundary 可以由哪一層持有。

**What is verified**

- Backend Service Identity 不等於 unrestricted DB object access；PostgreSQL object privilege 與 RLS 是可分離的 authorization boundaries。
- Function `EXECUTE` 可以形成 operation-level authorization boundary，與 direct table CUD 分離。
- Separate Native Data API requests 不共享 rollback boundary。
- One RPC / PostgreSQL Function 可以持有 Database-owned Transaction。
- Edge Function PostgreSQL client 可以持有 Backend-owned Transaction，並完成 controlled rollback / commit。

**What it unlocked**

C-BSA-1 支持三種可供未來 Platform Architecture 選擇的 operation / transaction placement：Native Data API、RPC / PostgreSQL Function、Backend-owned PostgreSQL Transaction。核心 Evidence-backed Current Judgment 是：

> `Transaction owner = layer owning complete Business Operation.`

這仍不是自動生效的 Platform Rule。Phase D 使用 `postgres` credential 只證明 technical feasibility，不是 Production least-privilege credential design。

## 2026-09-13

### C-EXT-1 — Custom API Orchestration / External API

- Status: `Verified`
- Record: [`../experiments/custom-api/README.md`](../experiments/custom-api/README.md)
- Primary Intent: `Nook Technical Platform / External API Orchestration Feasibility`
- Tags: `nook-platform`, `custom-api`, `supabase`, `api-composition`, `external-api`, `open-meteo`, `jwt`, `rls`, `netlify`, `github-actions`

`Netlify Browser → Weather Edge Function → same caller JWT → Valid Place Edge Function → RLS-filtered places → Open-Meteo → normalization → Browser` 已 runtime verified。

### C-DB-1 — Database-centric Supabase Custom API

- Status: `Verified`
- Record: [`../experiments/custom-api/README.md`](../experiments/custom-api/README.md)
- Primary Intent: `Nook Technical Platform / Custom API Runtime Feasibility`
- Tags: `nook-platform`, `custom-api`, `supabase`, `rpc`, `data-api`, `rls`, `cors`, `browser`, `netlify`

`Netlify Browser → Supabase Auth JWT → Edge Function → RPC / PostgreSQL Function → Native Data API SELECT → mapping` 已實測成功。caller-scoped user path 不等同 backend service identity 對正式 table 的完整 CRUD / authorization model；後者已由 C-BSA-1 補齊 Evidence。

### C-NF-0 — Netlify Functions Deployment Lifecycle

- Status: `Verified`
- Record: [`../experiments/custom-api/netlify-functions-lifecycle.md`](../experiments/custom-api/netlify-functions-lifecycle.md)
- Tags: `nook-platform`, `custom-api`, `deployment`, `netlify`, `ipad-first`

Git source → Deploy Preview → invoke / logs → Production → source delete / function absent 已驗證。Netlify Functions 保留為 credible secondary runtime candidate。

### Netlify Git Deployment Boundary

- Status: `Verified`
- Record: [`../experiments/netlify-deployment-boundary/README.md`](../experiments/netlify-deployment-boundary/README.md)
- Related Evidence: [`../evidence/provider-boundary-pitfalls.md`](../evidence/provider-boundary-pitfalls.md)
- Tags: `nook-platform`, `deployment`, `netlify`, `browser`

建立 `public/` Static Public Artifact boundary；後續 Trigger Boundary 亦已驗證 relevant path deploy / docs-only skip。

---

## 2026-09-12

### Experiment A — Supabase Auth
- Status: `Verified`
- Record: [`../experiments/auth/README.md`](../experiments/auth/README.md)

### Experiment B — Supabase Native Data API CRUD
- Status: `Verified`
- Record: [`../experiments/data-api/README.md`](../experiments/data-api/README.md)

### Experiment B-1 — Supabase Native Data API View Read / Security
- Status: `Verified`
- Record: [`../experiments/data-api-view/README.md`](../experiments/data-api-view/README.md)

### GitHub Actions Remote Execution Environment
- Status: `Verified`
- Record: [`../experiments/github-actions/README.md`](../experiments/github-actions/README.md)

### Experiment C-0 — Supabase Edge Function Deployment Lifecycle
- Status: `Verified`
- Record: [`../experiments/custom-api/README.md`](../experiments/custom-api/README.md)

---

## Current Candidate Experiments

- **Application UI Maintenance / Master → Detail Pattern**：F-QUERY-1 已完成 Read-only Query baseline；下一個真實 Requirement 若需要 Detail / Edit，研究 return-context restoration、stable row anchor、Validation、Toolbar/action hierarchy、Save/Cancel、Browser History、unsaved changes 與 iPad-first responsive behavior。
- **Pure Compute / Longer-running**：等 representative workload 再驗證 duration、CPU / memory、timeout、concurrency、cost。
- **Explicit API Authorization / Business Contract**：目前優先視為 Platform Rule / Design；只有 provider semantics 真正成為決策疑義時才補 Experiment。
- **Batch Retry / Idempotency**：先由 formal Business Specification / Platform Rule 定義 logical run、retry ownership、failure persistence；只有 chosen contract 需要 duplicate / concurrent / timeout-after-commit assurance 時才做 focused experiment。
- **External Provider Secrets / Failure Policy**：只有當 credential、timeout / retry / rate-limit semantics 成為決策因素時再補。
- **A-SAFARI-LIFECYCLE Re-open**：historical explicit-logout Session restoration 為 intermittent Known Observation；只有 anomaly 再出現且能取得 diagnostic trace 時重開。
- **P-CODEX-PHONE Re-open**：只在 OpenAI 提供 stable subscription-backed unattended identity / task invocation 等 provider trigger 後重開，不以 API key 額外計費、personal OAuth escrow 或 persistent runner 硬補。
