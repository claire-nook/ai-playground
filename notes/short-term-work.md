# Short-term Work Items

> 無交期。依 Claire 有空研究的時間逐項進行。
> 這不是正式開發排程，也不是 Nook Works Specification；只記錄 Playground **目前仍值得放在手邊的近期研究工作**。
>
> Completed work 的長期意義應畢業到 `knowledge/`、`evidence/` 與 Experiment Record，不讓 Short-term 變成一整排 Completed 墓碑。

## Knowledge Base Bootstrap — Completed

2026-09-13 已建立可持續生長的 Knowledge Architecture：

- Knowledge Model / Capture Protocol：`knowledge/README.md`
- Experiment Catalog：`knowledge/experiments.md`
- Experiment Record Template：`knowledge/experiment-template.md`
- Nook Technical Platform Research Map：`knowledge/maps/nook-technical-platform.md`
- Open Exploration / Potential Clusters：`knowledge/open-exploration.md`
- Evidence Index：`evidence/index.md`

## Current Research Front｜目前研究前緣

目前主要 Research Map：`knowledge/maps/nook-technical-platform.md`

已完成並畢業到 Knowledge Base 的 baseline：

- Experiment A — Supabase Auth：`Verified`
- Experiment B — Native Data API CRUD / Application Access：`Verified`
- Experiment B-1 — View Read / Security / Read Model：`Verified`
- GitHub Actions Remote Execution Environment：`Verified`
- Experiment C-0 — Supabase Edge Function Deployment Lifecycle：`Verified`
- Experiment C-NF-0 — Netlify Functions Deployment Lifecycle：`Verified`
- Experiment C-DB-1 — Database-centric Custom API：`Verified`
- Experiment C-EXT-1 — External API Orchestration：`Verified`
- Netlify Git Deployment / Trigger Boundary：`Verified`
- D-BATCH-1 — Supabase Cron / Scheduling：`Verified / Completed`
- P-CODEX-PHONE — ChatGPT → Codex Autonomous Dispatch Reconnaissance：`Verified Provider Gap / Deferred`

Supabase Edge Functions 仍是目前 Nook Works Primary Custom API Runtime Candidate；Netlify Functions 保留為 credible secondary candidate。這是 Research Judgment，不是 Production Architecture Decision。

## D-BATCH-1 Graduation Summary

D-BATCH-1 已完成，不再佔用近期施工前緣。

已驗證：

```text
Cron → PostgreSQL Database Function
Cron → pg_net → Edge Function
Cron-scheduled Edge → Native Data API / External API
Cron HTTP body ← static literal
Cron HTTP body ← execution-time SQL expression
Cron HTTP body ← PostgreSQL Function return value
```

Cron lifecycle 亦已實測：

```text
Create  → cron.schedule(...)
Read    → cron.job
Update  → cron.alter_job(...)
Delete  → cron.unschedule(...)
```

Durable records：

- `experiments/batch-scheduling/README.md`
- `knowledge/implementation/supabase-cron.md`
- `evidence/d-batch-1-phase-1.md`
- `evidence/d-batch-1-parameter-invocation.md`

Parameter preparation 的 platform-design ladder：

```text
Static Literal
→ SQL Runtime Expression
→ DB Helper Function
→ Launcher / Preparation API
→ Orchestrator
```

前三層直接 Verified；Launcher path 的 building blocks 已由既有 Custom API composition evidence 支持，不另做重複 probe。

重要治理原則：

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

平台初期可以只納入少量標準 Pattern，其他已知能力保留為 Deferred / Future Expansion Candidate，待需求與平台成熟度成長時再 Promote。

## Current — C-BSA-1｜Custom API / Backend Service Database Access

### Claire-readable summary

> **D-BATCH-1 的 `place` permission failure 已經把真正問題照得很亮：不是 Cron 能不能碰 DB，而是 Supabase Edge Function 作為 backend service 時，對正式 PostgreSQL objects 應如何取得明確且最小權限的存取能力。這題獨立成 C-BSA-1。**

Experiment Card：`experiments/custom-api/c-bsa-1.catalog.json`。

### Research scope

C-BSA-1 應使用 synthetic / formal-style secured objects 驗證，不為實驗直接放寬正式 `place`：

- Native Data API `SELECT / INSERT / UPDATE / DELETE`。
- service identity 的 table privilege 與 RLS boundary。
- RPC / PostgreSQL Function 的 `EXECUTE` privilege、`SECURITY INVOKER` / `SECURITY DEFINER` 等 security context。
- Function 內部再存取 table 時，權限與 transaction 行為如何落地。
- Frontend User Access (`authenticated + RLS`) 與 Backend Service Access 的責任分離。

### Why transaction is now in scope

Nook Works Daily Weather Batch Specification 已明確要求：

```text
Delete existing row
→ Insert replacement row
→ same Transaction
→ Insert failure must rollback Delete
```

因此需要驗證 Custom API 面對這種正式 workload 時，應直接使用多次 Native Data API request，還是由 RPC / PostgreSQL Function 提供 atomic operation contract。

## Next Major Track — Application UI Maintenance Pattern

Batch / Backend Service Access 第一輪研究完成後，下一條 major track 是 Nook Works Application UI Pattern：

- 單檔維護畫面
- 主從雙檔 / 多檔維護畫面
- 新增 / 編輯 / 刪除 / 儲存 / 取消 naming 與 placement
- Search / List / Detail / Edit state transition
- Validation / error presentation
- Toolbar / action hierarchy
- iPad-first responsive behavior

## Deferred / Candidate

- **P-CODEX-PHONE / Autonomous ChatGPT → Codex Dispatch**：WAIT / Deferred by Provider Gap。
- **Pure Compute / Longer-running Processing**：等 representative workload 再驗證 duration、CPU / memory、timeout、concurrency、cost。
- **Explicit Business Authorization / Error Contract**：當 API 真正需要區分 No Data / No Application Access / Validation / Conflict / Not Found 等 semantics 時再研究。
- **PostgreSQL RPC / Application Operation Contract**：mechanism 已在 C-DB-1 驗證；哪些正式 operation 應優先由 DB Function 提供 contract，與 C-BSA-1 的 representative workload 一起判斷。
