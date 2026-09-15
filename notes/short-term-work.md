# Short-term Work Items

> 無交期。依 Claire 有空研究的時間逐項進行。
> 這不是正式開發排程，也不是 Nook Works Specification；只記錄 Playground **目前仍值得放在手邊的近期研究工作**。
>
> **Human-facing Research Navigation：** 讓 Claire 在長對話或跨對話後，可以直接理解「現在研究到哪裡、接下來要研究什麼、為什麼值得研究」。Technical Term 可以保留，但不得只用 Agent / Engineer shorthand 當研究主題。
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

後續 Experiment 形成有效 Evidence 時，應更新 Experiment Record、Catalog、Evidence Index、相關 Research Map，以及必要的 Implementation Guide。

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
- P-CODEX-PHONE — ChatGPT → Codex Autonomous Dispatch Reconnaissance：`Verified Provider Gap / Deferred`

Supabase Edge Functions 仍是目前 Nook Works Primary Custom API Runtime Candidate；Netlify Functions 保留為 credible secondary candidate。這是 Research Judgment，不是 Production Architecture Decision。

P-CODEX-PHONE 已畢業到 `experiments/codex-dispatch/README.md`、`knowledge/maps/ai-agent-collaboration.md` 與 `evidence/index.md`。目前不進 Phase 3 implementation，也不佔用近期施工前緣；只在 provider capability 出現明確 re-open trigger 時恢復。

## Current — D-BATCH-1｜Supabase Cron / Scheduling 最後能力缺口

### Claire-readable summary

> **Supabase Cron 的主要 runtime chain 已經驗證：可排程 Database Function，也可排程呼叫 Edge Function；scheduled Edge Function 已實際完成 Native Data API read/update、Open-Meteo outbound HTTP 與 synthetic SUCCESS 寫回。現在 Cron 只剩「排程啟動時如何傳入參數」尚未直接驗證。**

完整 Experiment Record：`experiments/batch-scheduling/README.md`。Authenticated Human Evidence Surface：`/cron-edge-observer/`。

### Runtime evidence already verified

```text
Cron → PostgreSQL Database Function → synthetic row
Cron → pg_net → Edge Function
Edge Function → Native Data API synthetic SELECT / UPDATE
Edge Function → Open-Meteo → synthetic SUCCESS + temperature
```

OID 115 → 116/117 的 runtime boundary 已證明新 worker 不再依賴 formal `place` read，而是直接使用 synthetic row coordinates，並由 scheduled invocation 實際取得 external weather result。

### Remaining Cron Research Question — Parameterized Invocation

Nook Works `docs/business/specifications/batch/daily-weather.md` 的排程情境需要代表性 input：

```text
executor_oid = -1
query_date   = execution date - 1
process_mode = scheduled mode
```

因此 D-BATCH-1 結案前需直接驗證：

- **簡單固定參數**：Cron HTTP request body 能正確傳入固定值，例如 `executor_oid = -1`、固定 `process_mode`。
- **簡單動態參數**：Cron job 執行當下能計算 runtime value，例如 `current_date - 1`，並正確組入 request body。
- Edge Function 能收到與辨識實際傳入值，並留下可觀察 Evidence。

### Parameter responsibility boundary

如果參數只是固定值或簡單 execution-time expression，允許由 Cron 直接準備：

```text
Cron → Main Batch API
```

如果參數準備需要查 DB、套 business rule、組多段資料或其他 orchestration，不把這些責任塞進 Cron：

```text
Cron → Launcher / Preparation API → Main Batch API
```

Main Batch API 應接受完整 input，不因 caller 是 Cron / Manual / Retry 而內建多套啟動人格。Cron research 到「能可靠啟動帶參數 endpoint」為止；Launcher 的複雜參數準備屬 Custom API orchestration。

## Next — C-BSA-1｜Custom API / Backend Service Database Access

### Claire-readable summary

> **D-BATCH-1 的 `place` permission failure 已經把真正問題照得很亮：不是 Cron 能不能碰 DB，而是 Supabase Edge Function 作為 backend service 時，對正式 PostgreSQL objects 應如何取得明確且最小權限的存取能力。這題獨立成 C-BSA-1，不再掛在 Cron 名下。**

Experiment Card：`experiments/custom-api/c-bsa-1.catalog.json`。

### Research scope

C-BSA-1 應使用 synthetic / formal-style secured objects 驗證，不為實驗直接放寬正式 `place`：

- Native Data API `SELECT / INSERT / UPDATE / DELETE`。
- service identity 的 table privilege 與 RLS boundary。
- RPC / PostgreSQL Function 的 `EXECUTE` privilege、`SECURITY INVOKER` / `SECURITY DEFINER` 等 security context。
- Function 內部再存取 table 時，權限與 transaction 行為如何落地。
- Frontend User Access (`authenticated + RLS`) 與 Backend Service Access 的責任分離。

### Why transaction is now in scope

這不再是「PostgreSQL 有 Transaction，所以順便測一下」的功能表打勾。Nook Works Daily Weather Batch Specification 已明確要求：

```text
Delete existing row
→ Insert replacement row
→ same Transaction
→ Insert failure must rollback Delete
```

因此需要驗證 Custom API 面對這種正式 workload 時，應直接使用多次 Native Data API request，還是由 RPC / PostgreSQL Function 提供 atomic operation contract。這會直接影響 Batch implementation placement。

## Next Major Track — Application UI Maintenance Pattern

Batch / Backend Service Access 第一輪研究完成後，下一條 major track 是 Nook Works Application UI Pattern：

- 單檔維護畫面
- 主從雙檔 / 多檔維護畫面
- 新增 / 編輯 / 刪除 / 儲存 / 取消 naming 與 placement
- Search / List / Detail / Edit state transition
- Validation / error presentation
- Toolbar / action hierarchy
- iPad-first responsive behavior

UI Pattern 預期需要多個 Prototype / Browser Artifact 做比較。目前不跟 Batch / Backend Access 同時亂開十條線，Repository 不需要模仿瀏覽器分頁災難現場。

## Deferred / Candidate

- **P-CODEX-PHONE / Autonomous ChatGPT → Codex Dispatch**：2026-09-15 已完成 reconnaissance。Current verdict 是 `WAIT / Deferred by Provider Gap`。只有在 OpenAI 提供 stable Cloud Task API/tool、subscription-backed unattended identity、OIDC federation、official short-lived CI credential helper、direct ChatGPT→Codex dispatch 等新 primitive 時重開；不以 API key 額外計費、personal OAuth escrow 或 persistent runner 硬補。
- **Pure Compute / Longer-running Processing**：等出現 representative workload 再驗證 duration、CPU / memory、timeout、concurrency、cost。
- **Explicit Business Authorization / Error Contract**：當 API 真正需要區分 No Data / No Application Access / Validation / Conflict / Not Found 等 semantics 時再研究。
- **PostgreSQL RPC / Application Operation Contract**：mechanism 已在 C-DB-1 驗證；哪些正式 operation 應優先由 DB Function 提供 contract，與 C-BSA-1 的 representative workload 一起判斷，不另外為 checklist 製造抽象實驗。
