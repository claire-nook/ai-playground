# Experiment Catalog

這份 Catalog 回答：**我們曾經做過哪些 Experiment，而且當時為什麼要做？**

完整 Method / Evidence 留在 Experiment Record 與 Evidence Index，這裡只保存短摘要、Status、Tags 與 Links。

---

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
- Codex Cloud Task 應 operationally 視為 selected repository/source snapshot + separate publication flow，不假設 ambient cross-repo GitHub authority。
- ChatGPT sign-in 與 API-key sign-in 是不同 billing boundary；API key route 會進 API pricing，不符合本案「使用既有 Plus Codex allowance」的成本條件。
- Current provider gap 是缺少 supported subscription-backed unattended workload identity / stable task invocation。Device auth 仍需人類；restore personal auth state 到 CI 不符合 credential custody；persistent runner 維運成本不合理。

**What it unlocked**

研究沒有進入 Phase 3 implementation。Current Architecture Judgment 是 `WAIT`：保留 Claire 一次 per-task dispatch gate，持續使用 OpenAI-managed Codex Cloud + GitHub evidence + Primary QC。未來若出現 stable Cloud Task API、subscription workload identity、GitHub OIDC federation、official short-lived CI credential helper 或 direct ChatGPT→Codex tool，再重新開啟，不必從零研究。

## 2026-09-14

### D-BATCH-1 — Supabase Batch Runtime / Scheduling

- Status: `Partial`（scheduled runtime chain verified; parameterized invocation remains）
- Record: [`../experiments/batch-scheduling/README.md`](../experiments/batch-scheduling/README.md)
- Phase Evidence: [`../evidence/d-batch-1-phase-1.md`](../evidence/d-batch-1-phase-1.md)
- Live Demo: [`/cron-edge-observer/`](/cron-edge-observer/)
- Primary Intent: `Nook Technical Platform / Batch Runtime / Scheduling Feasibility`
- Tags: `nook-platform`, `batch-runtime`, `supabase`, `postgresql`, `data-api`, `external-api`, `parameterized-invocation`, `observability`

**Why it existed**

Auth、Database 與主要 Custom API candidate 已集中於 Supabase，因此以最小 producer / consumer experiment 確認 Supabase-managed scheduling 是否能合理承擔 Nook Works 常見 batch responsibility。

**What is verified**

```text
Cron → PostgreSQL Database Function → synthetic row
Cron → pg_net → Edge Function
Edge Function → Native Data API SELECT / UPDATE on authorized synthetic table
Cron-scheduled Edge Function → Open-Meteo → synthetic SUCCESS + temperature
```

Formal `place` SELECT 曾因 current `service_role` 缺少 table SELECT privilege 而失敗。這不是 Cron limitation；該問題已抽離為 C-BSA-1。

**Remaining gate**

由 Nook Works Daily Weather Batch Specification 暴露出的最後 Cron capability：parameterized invocation。

需驗證固定參數與 execution-time 動態參數，例如 `executor_oid = -1`、固定 `process_mode`、`query_date = current_date - 1` 能在 Cron 執行時正確組入 Edge Function request body，並由 runtime evidence 證明接收值正確。

複雜參數若需要 DB query / business rules / orchestration，預期由 Launcher / Preparation API 準備後再呼叫 Main Batch API，不把複雜 business logic 放進 Cron。

### C-BSA-1 — Custom API / Backend Service Database Access

- Status: `Planned`
- Card: [`../experiments/custom-api/c-bsa-1.catalog.json`](../experiments/custom-api/c-bsa-1.catalog.json)
- Record family: [`../experiments/custom-api/README.md`](../experiments/custom-api/README.md)
- Primary Intent: `Nook Technical Platform / Backend Service Access / Database Authorization & Transaction`
- Tags: `nook-platform`, `custom-api`, `backend-service`, `data-api`, `rpc`, `postgresql`, `authorization`, `transaction`

**Why it exists**

D-BATCH-1 已證明 service-authenticated Edge Function 可讀寫有權限的 synthetic table，但 formal `place` read 暴露了 service identity、table privilege 與 RLS 是不同層次。下一步需要獨立回答「Custom API 作為 backend service，如何正確存取正式 DB objects」，而不是繼續讓 Cron Experiment 背這個問題。

**Planned scope**

- Native Data API CRUD on formal-style secured table。
- service identity / table privilege / RLS boundary。
- RPC / PostgreSQL Function `EXECUTE` 與 security context。
- representative atomic operation / transaction boundary。

Nook Works Daily Weather Batch 的 `Delete + Insert same transaction / failure rollback` 提供了真實 transaction use case，因此此題有正式需求來源，不是為了把 PostgreSQL 功能表全部點亮。

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

`Netlify Browser → Supabase Auth JWT → Edge Function → RPC / PostgreSQL Function → Native Data API SELECT → mapping` 已實測成功。此 Probe 驗證 caller-scoped user path，不等同 backend service identity 對正式 table 的完整 CRUD / authorization model；後者由 C-BSA-1 接手。

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

- **D-BATCH-1 / Parameterized Invocation**：固定 + execution-time dynamic request parameters。
- **C-BSA-1 / Backend Service Database Access**：formal-style CRUD、RPC / Function access、authorization 與 transaction boundary。
- **Pure Compute / Longer-running**：duration、CPU / memory、timeout、concurrency、cost。
- **Explicit API Authorization / Business Contract**：需要時研究 `200 + []` 與 explicit `403` 等 semantics。
- **External Provider Secrets / Failure Policy**：只有當 credential、timeout / retry / rate-limit semantics 成為決策因素時再補。
- **P-CODEX-PHONE Re-open**：只在 OpenAI 提供 stable subscription-backed unattended identity / task invocation 等 provider trigger 後重開，不以自建 persistent credential infrastructure 硬補。

---

## Maintenance Rule

Catalog 維持短小，只回答「為什麼做、打開什麼下一步」。完整 Evidence 不在這裡再養一份分身。
