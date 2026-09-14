# Experiment Catalog

這份 Catalog 回答：**我們曾經做過哪些 Experiment，而且當時為什麼要做？**

完整 Method / Evidence 留在 Experiment Record 與 Evidence Index，這裡只保存短摘要、Status、Tags 與 Links。

---

## 2026-09-14

### D-BATCH-1 — Supabase Batch Runtime / Scheduling

- Status: `Partial`（Phase 1 completed; Phase 2 planned）
- Record: [`../experiments/batch-scheduling/README.md`](../experiments/batch-scheduling/README.md)
- Phase Evidence: [`../evidence/d-batch-1-phase-1.md`](../evidence/d-batch-1-phase-1.md)
- Live Demo: [`/cron-edge-observer/`](/cron-edge-observer/)
- Primary Intent: `Nook Technical Platform / Batch Runtime / Scheduling Feasibility`
- Tags: `nook-platform`, `batch-runtime`, `supabase`, `postgresql`, `data-api`, `observability`, `authorization`

**Why it existed**

Auth、Database 與主要 Custom API candidate 已集中於 Supabase，因此以最小 producer / consumer experiment 確認 Supabase-managed scheduling 是否能合理承擔 Nook Works 常見 batch responsibility，而不是先把 workload 拆到另一個 Provider。

**What Phase 1 unlocked**

以下受測 path 已 runtime verified：

```text
Cron → PostgreSQL Database Function → synthetic PENDING row
Cron → pg_net → Edge Function
Edge Function → Native Data API SELECT / UPDATE on authorized synthetic table
```

Worker 對 formal `place` 的 SELECT 失敗已確認為 current `service_role` 缺少 table SELECT privilege，不是 Cron limitation，也不是 Native Data API capability failure。因 coordinates 未取得，D-BATCH-1 的 Cron-scheduled Open-Meteo path 尚未進入。

Row-level Memo (`t09`) 與 authenticated Observer 已驗證能直接呈現 failure reason。

**Phase 2**

1. Backend Service Access：研究正常採 privilege + RLS 的 table，如何讓 server-side Custom API 以明確、least-privilege 的方式讀取；不直接放寬 formal `place` 當實驗捷徑。
2. Cron-scheduled External API：以 synthetic coordinates 移除 `place` dependency，驗證 Cron 啟動的 Edge Function outbound HTTP → Open-Meteo。
3. 兩項各自通過後，只做一次最小 integration confirmation：`Cron → Edge → authorized Data API read → external API → synthetic update`。

## 2026-09-13

### C-EXT-1 — Custom API Orchestration / External API

- Status: `Verified`
- Record: [`../experiments/custom-api/README.md`](../experiments/custom-api/README.md)
- Primary Intent: `Nook Technical Platform / External API Orchestration Feasibility`
- Tags: `nook-platform`, `custom-api`, `supabase`, `api-composition`, `external-api`, `open-meteo`, `jwt`, `rls`, `netlify`, `github-actions`

**Why it existed**

C-DB-1 已證明 Database-centric API，但 Nook Works 也常見「Custom API call Custom API，再接 External API」的 orchestration。這次刻意讓 Weather API 不直接碰 DB，而是沿用 Valid Place API 的 responsibility boundary。

**What it unlocked**

`Netlify Browser → Weather Edge Function → same caller JWT → Valid Place Edge Function → RLS-filtered places → Open-Meteo → normalization → Browser` 已 runtime verified。有效 Application Access identity 得到 2 places / 2 weather success；TU01 / TU02 均得到 0 places / 0 provider calls。另觀察到 D-1 必須以各 Place local timezone 定義。

### C-DB-1 — Database-centric Supabase Custom API

- Status: `Verified`
- Record: [`../experiments/custom-api/README.md`](../experiments/custom-api/README.md)
- Primary Intent: `Nook Technical Platform / Custom API Runtime Feasibility`
- Tags: `nook-platform`, `custom-api`, `supabase`, `rpc`, `data-api`, `rls`, `cors`, `browser`, `netlify`

**Why it existed**

C-0 只證明 Edge Function 能部署，不代表它能承擔 Nook Works 真正的 Database-centric API。這次刻意讓一支 API 同時走過 JWT、RPC、RLS、Native Data API 與 application-side mapping。

**What it unlocked**

`Netlify Browser → Supabase Auth JWT → Edge Function → RPC / PostgreSQL Function → Native Data API SELECT → mapping` 已實測成功。具有效 Application Access 的 Claire 測試帳號得到 2 筆結果；TU01 / TU02 均得到 HTTP 200 + empty rows，支持 caller-scoped RLS behavior，也再次證明 row visibility 不等於完整 Business Authorization semantics。

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
- Tags: `authentication`, `session`, `supabase`, `netlify`, `browser`

Netlify Browser → Supabase Auth → Session 已驗證，基本登入不需要自行包 Custom Login API。

### Experiment B — Supabase Native Data API CRUD

- Status: `Verified`
- Record: [`../experiments/data-api/README.md`](../experiments/data-api/README.md)
- Tags: `data-api`, `authorization`, `rls`, `supabase`, `browser`, `postgresql`

Browser Native CRUD 與 Application Access Boundary 已驗證，也建立 `technical success != business success` baseline。

### Experiment B-1 — Supabase Native Data API View Read / Security

- Status: `Verified`
- Record: [`../experiments/data-api-view/README.md`](../experiments/data-api-view/README.md)
- Tags: `data-api`, `read-model`, `rls`, `supabase`, `postgresql`

`security_invoker=true` View 可作為 Native Data API Read Model，保留 tested invoking identity security behavior。

### GitHub Actions Remote Execution Environment

- Status: `Verified`
- Record: [`../experiments/github-actions/README.md`](../experiments/github-actions/README.md)
- Tags: `ipad-first`, `ai-engineering`, `remote-execution`, `github-actions`

GitHub-hosted Runner 可補 iPadOS / AI 缺少 CLI / Linux runtime 的 execution gap。

### Experiment C-0 — Supabase Edge Function Deployment Lifecycle

- Status: `Verified`
- Record: [`../experiments/custom-api/README.md`](../experiments/custom-api/README.md)
- Tags: `custom-api`, `deployment`, `supabase`, `github-actions`, `ipad-first`

Edge Function deployment lifecycle 已在 iPad-first workflow 驗證，並成為後續 Custom API probes 的 runtime baseline。

---

## Current Candidate Experiments

- **D-BATCH-1 Phase 2 / Backend Service Access**：formal-style table privilege + RLS 與 background service identity 的責任分工。
- **D-BATCH-1 Phase 2 / Scheduled External HTTP**：Cron-scheduled Edge Function outbound provider call。
- **Pure Compute / Longer-running**：duration、CPU / memory、timeout、concurrency、cost。
- **Explicit API Authorization / Business Contract**：需要時研究 `200 + []` 與 explicit `403` 等 semantics。
- **External Provider Secrets / Failure Policy**：只有當 credential、timeout / retry / rate-limit semantics 成為決策因素時再補，不為了把 checklist 填滿硬測。

---

## Maintenance Rule

Catalog 維持短小，只回答「為什麼做、打開什麼下一步」。完整 Evidence 不在這裡再養一份分身。
