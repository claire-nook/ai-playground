# D-BATCH-1 — Supabase Batch Runtime / Scheduling

- Date: 2026-09-14
- Status: `Partial`
- Primary Intent: `Nook Technical Platform / Batch Runtime / Scheduling Feasibility`
- Tags: `nook-platform`, `batch-runtime`, `supabase`, `postgresql`, `data-api`, `observability`

## Research Question

Nook Works 常見的 scheduled / batch responsibility，能否由 Supabase-managed scheduling 在 iPad-first 環境中，以合理的管理成本與 observability 承擔？

優先研究 Supabase 不是因為已做出 Production Architecture Decision，而是目前已驗證的 Auth、Database、RPC、RLS 與主要 Custom API candidate 都集中在 Supabase。最小實驗先測試同一個 provider 內的 scheduling path，只有觀察到實質限制時才值得把 responsibility 拆到其他 runtime。

## Minimal Experiment Shape

兩條 path 共用 Playground synthetic table `public.test_b8c3q1`：

```text
Cron A → PostgreSQL Database Function → INSERT PENDING test row
```

```text
Cron B → test-cron-edge-worker
       → Supabase Native Data API SELECT test row / formal place data
       → Open-Meteo
       → Supabase Native Data API UPDATE test row to SUCCESS or FAILED
```

Cron A 是 producer；Cron B 與 Edge Function worker 是 consumer。這個 shape 只用 test table 寫入實驗結果。Worker 對 formal `public.place` data 只有 read，不建立或修改正式 Nook Works batch object。

## Why This Is Minimal

- Producer 只建立 `PENDING` row，不承載正式 business batch semantics。
- Consumer 只讀取 Place coordinates、取得一個足以觀察 orchestration 的 temperature，並更新 synthetic row。
- Worker 的 table interaction 以 Supabase client `.from(...)` 走 Native Data API；repository implementation 沒有把這段改成 direct SQL、RPC 或 Database Function。
- 不實作正式 `daily_weather`、`batch_log`、retry queue、locking 或 job-management framework。

因此這是 scheduling responsibility probe，不是提早施工的 Nook Works Batch Specification。

## Evidence

### Cron A — Verified for the tested path

Primary runtime observation 已確認 `test-cron-db-probe-01` 能依排程呼叫 `public.test_f8c3q1(...)`，並在 synthetic table 建立 `PENDING` row。因此可將以下**受測 path**記為 `Verified`：

```text
Supabase Cron → PostgreSQL Database Function → test-table INSERT
```

這項 Evidence 不會自動驗證 Cron B、Edge Function invocation、retry 或其他 scheduling behavior。

### Cron B — Partial / runtime confirmation pending

Repository 已有 `test-cron-edge-worker` implementation 與 manual deployment workflow。Source 顯示 worker 在任何 Data API access 前檢查 server-side `apikey` contract，之後使用 Native Data API 讀取 `test_b8c3q1` / `place`、呼叫 Open-Meteo，並嘗試把 test row 更新為 `SUCCESS` 或 `FAILED`。

既有 C-0 Evidence 支援一般 Supabase Edge Function deployment lifecycle；它不等於這支 worker 已由 Cron B scheduled invocation 跑通。Repository 目前沒有足以確認以下完整 chain 的 runtime observation：

```text
Cron B → scheduled Edge Function invocation → Native Data API processing
       → external provider → resulting test-row state transition
```

所以 Cron B 與整體 Experiment 必須保持 `Partial`。Source presence、deployability 與預期 behavior 都不能取代 runtime Evidence。

## Human Evidence Surface — Authenticated Browser Observer

`/cron-edge-observer/` 是本實驗的 Live Demo / Human Evidence Surface。它重用 Supabase Auth；登入後以 Native Data API 唯讀顯示 test rows、狀態計數與更新時間，並提供 Refresh / auto refresh。未登入時設計上不執行 test-table SELECT。

Observer 的用途是讓 Claire 不需手動執行 SQL，就能觀察 producer / consumer state transition。它的 route 與 browser artifact 已存在於 repository 的 `public/` deploy surface；但 Observer 的存在，或它能顯示 `PENDING` row，均不代表 Cron B 已完成 scheduled processing。只有實際觀察 scheduled invocation 導致對應 row 轉成 `SUCCESS` / `FAILED`，才能補足該段 Evidence。

Observer 不含 server-side credential，也不提供 write、Cron management 或 Scheduler management UI。

## Security and Data Boundary

- 所有寫入只落在 synthetic `test_b8c3q1`；formal `place` table 僅供 worker / authenticated Observer 所需的 read。
- Browser Observer 使用 caller session 與既有 RLS / access boundary；server-side worker credential 不可進入 browser artifact。
- Deployment credential 與 Edge Function runtime authorization credential 是不同角色，不應混為同一個設定概念。
- Repository 只記錄 credential role 與 identifier，不保存 value，也不推測 provider 如何內部保存 credential。

## Operational Lessons Supported by Current Artifacts

1. **Human observation needs a first-class surface.** Authenticated read-only Observer 比要求 Claire 反覆進 Dashboard 或手動 SQL 更適合 iPad-first evidence collection。
2. **Source、deployment 與 runtime evidence 是三個不同層次。** Worker source 與 deploy workflow 可供 review；只有 provider-side scheduled invocation 與 state transition observation 才能驗證 Cron B。
3. **Server caller authorization must remain server-side.** Worker 以 runtime secret 比對 `apikey`，deployment 使用 `--no-verify-jwt`；普通 authenticated-user JWT 不是 privileged batch invocation 的替代品。
4. **Provider configuration traceability 尚未回答。** Current artifacts 可描述 workflow 與 expected contract，但還不能證明 Dashboard / Git / migration 哪一處應成為 Cron 與 secret reference 的 canonical source of truth。

## Known Unknowns / Next Evidence

- Cron B 是否能穩定 scheduled invoke worker，並留下可對應的 execution / row-transition evidence。
- Scheduled request failure、provider timeout、partial row failure與 retry semantics。
- Concurrent invocations、duplicate processing、locking / idempotency boundary。
- Supabase Cron、Edge Function、Native Data API 與 external provider 的 quota、duration 與 cost boundary。
- Scheduler / Vault / Dashboard 設定與 Git / migration 的 source-of-truth policy，以及 deployment traceability。
- Logs 是否足以由一筆 Cron execution 追到 worker invocation、provider result 與 table mutation。
- Observer 的 deployed authenticated / unauthenticated behavior與 iPad Safari experience 尚需 runtime QC；不得由 source inspection 宣稱已觀察成功。

## Current Judgment

**Partial.** Supabase-managed scheduling 已有一條直接 Evidence：Cron A 的 `Cron → Database Function → test-table INSERT` tested path 為 `Verified`。Cron B 所需 worker、authorization contract、deployment workflow與 authenticated Observer 已形成可檢視 artifacts，但完整 scheduled Edge Function path 尚無 runtime Evidence，不能升格為 `Verified`。

> Playground Evidence is not a Production Architecture Decision.

正式 Nook Works batch implementation 仍應回到正式 repository，依 Specification、Security、Operations、Cost 與後續 runtime Evidence 形成決策；不可把本 synthetic experiment 當作 production design。

## Related Records

- Research Map: [`../../knowledge/maps/nook-technical-platform.md`](../../knowledge/maps/nook-technical-platform.md)
- Evidence Index: [`../../evidence/index.md`](../../evidence/index.md)
- Worker implementation note: [`../../agent-work/implementation-notes/supabase-cron-edge-observer.md`](../../agent-work/implementation-notes/supabase-cron-edge-observer.md)
- Supabase Edge Function lifecycle baseline: [`../custom-api/README.md`](../custom-api/README.md)

