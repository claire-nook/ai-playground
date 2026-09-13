# Experiment Catalog

這份 Catalog 回答：**我們曾經做過哪些 Experiment，而且當時為什麼要做？**

完整 Method / Evidence 留在 Experiment Record 與 Evidence Index，這裡只保存短摘要、Status、Tags 與 Links。

---

## 2026-09-13

### C-DB-1 — Database-centric Supabase Custom API

- Status: `Verified`
- Record: [`../experiments/custom-api/README.md`](../experiments/custom-api/README.md)
- Primary Intent: `Nook Technical Platform / Custom API Runtime Feasibility`
- Tags: `nook-platform`, `custom-api`, `supabase`, `rpc`, `data-api`, `rls`, `cors`, `browser`, `netlify`

**Why it existed**

C-0 只證明 Edge Function 能部署，不代表它能承擔 Nook Works 真正的 Database-centric API。這次刻意讓一支 API 同時走過 JWT、RPC、RLS、Native Data API 與 application-side mapping。

**What it unlocked**

`Netlify Browser → Supabase Auth JWT → Edge Function → RPC / PostgreSQL Function → Native Data API SELECT → mapping` 已實測成功。Claire 得到 2 筆結果；TU01 / TU02 均得到 HTTP 200 + empty rows，支持 caller-scoped RLS behavior，也再次證明 row visibility 不等於完整 Business Authorization semantics。

### C-NF-0 — Netlify Functions Deployment Lifecycle

- Status: `Verified`
- Record: [`../experiments/custom-api/netlify-functions-lifecycle.md`](../experiments/custom-api/netlify-functions-lifecycle.md)
- Tags: `nook-platform`, `custom-api`, `deployment`, `netlify`, `ipad-first`

Git source → Deploy Preview → invoke / logs → Production → source delete / function absent 已驗證。Netlify 保留為 credible secondary runtime candidate。

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

Edge Function deployment lifecycle 已在 iPad-first workflow 驗證，並成為 C-DB-1 的 runtime baseline。

---

## Current Candidate Experiments

- **External API Orchestration**：outbound API、secret、timeout / retry、normalize / aggregate。
- **Pure Compute / Longer-running**：duration、CPU / memory、timeout、concurrency、cost。
- **Explicit API Authorization / Business Contract**：需要時研究 `200 + []` 與 explicit `403` 等 semantics。

---

## Maintenance Rule

Catalog 維持短小，只回答「為什麼做、打開什麼下一步」。完整 Evidence 不在這裡再養一份分身。