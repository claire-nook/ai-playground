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

Primary runtime observation 已確認 `test-cron-db-probe-01` 能依排程呼叫 `public.test_f8c3q1(...)`，並在 synthetic table 建立 `PENDING` row。因此可將以下受測 path 記為 `Verified`：

```text
Supabase Cron → PostgreSQL Database Function → test-table INSERT
```

後續 Human observation 亦看到 producer 持續依 3-minute cadence 建立 `PENDING` rows，支持此 path 不只是單次 probe 成功。

### Cron B — Scheduled invocation verified; processing remains Partial

2026-09-14 Claire Environment Evidence 已把 Cron B 的 scheduled invocation path 拆出來驗證：

```text
Supabase Cron → pg_net → HTTP POST → test-cron-edge-worker runtime
```

Dashboard 顯示 `test-cron-edge-probe-01` 依 5-minute cadence 執行；Edge Function runtime lifecycle logs 亦在相同 cadence 出現 Boot / Shutdown。更重要的是，Edge Function Invocations 留下由 `pg_net/0.20.4` 發出的 POST request，證明 scheduled HTTP request 確實抵達該 deployment。

該 invocation 回傳 HTTP `403`。Repository source inspection 可定位 403 為 worker 自己的 authorization boundary：incoming `apikey` 與 duplicated custom runtime secret 進行 equality check，失敗即在任何 Native Data API operation 前回 403。因此目前可判定：

- Cron scheduling：已執行。
- `pg_net` HTTP dispatch：已抵達 Edge Function。
- Edge Function runtime invocation：已觀察。
- Worker authorization：目前失敗，HTTP 403。
- Native Data API / Open-Meteo / row transition：此次 invocation 尚未進入，仍未由 Cron B runtime 驗證。

所以完整 consumer chain 仍保持 `Partial`：

```text
Cron B → Edge Function → authorization [403]
                     ↳ Native Data API → Open-Meteo → row transition [not reached]
```

這次 403 是有效 Evidence，不應被修正工作抹掉。它暴露了 duplicated credential value 必須人工同步的 operational weakness。後續 auth REWORK 應作為延伸 Evidence；在重新部署並觀察 scheduled row transition 前，不得把完整 Cron B 升格為 Verified。

## Human Evidence Surface — Authenticated Browser Observer

`/cron-edge-observer/` 是本實驗的 Live Demo / Human Evidence Surface。它重用 Supabase Auth；登入後以 Native Data API 唯讀顯示 test rows、狀態計數與更新時間，並提供 Refresh / auto refresh。

Claire 已在 iPad Safari 以 authenticated test user 實際登入 Observer 並讀到 synthetic rows。當時畫面顯示 producer 持續產生 `PENDING` rows，而 Cron B 尚未造成 `SUCCESS` / `FAILED` transition。這項 Human Evidence 驗證 Observer 可作為 runtime evidence surface，但不代表 batch administration authority，也不代表 Cron B processing 成功。

Observer 不含 server-side credential，也不提供 write、Cron management 或 Scheduler management UI。

## Observability Model Learned From the Failure

本次實驗顯示 scheduled batch 至少存在四個不同 evidence layer，不能用單一綠燈替代：

```text
Scheduler History
  → Runtime Lifecycle Logs
    → HTTP Invocations
      → Business / Data State
```

它們回答不同問題：

1. Scheduler History：scheduler 是否執行 job command。
2. Runtime Logs：Edge runtime 是否被喚醒 / 關閉。
3. Invocations：HTTP request 是否抵達，以及實際 HTTP status / duration。
4. Observer / Data State：business processing 是否真的造成預期資料狀態改變。

Supabase Cron Dashboard 的 `Succeeded` 在 HTTP job 使用 asynchronous `pg_net` 時，只能證明 scheduler 成功執行 dispatch command；本次實驗同時出現 Dashboard `Succeeded` 與 Edge Function HTTP `403`，直接證明 Scheduler Success 不等於 Batch Process Success。

同理，`Boot` / `Shutdown`（包含 `EarlyDrop`）只描述 runtime lifecycle，不能單獨判定 HTTP request 或 business processing 成敗。HTTP 結果應看 Invocations，最終處理結果仍需看 business/data evidence。

這個 distinction 對未來 Batch Monitoring / Operations 設計具有可重用價值：平台 scheduler status 與 application batch status 應視為不同責任。

## Security and Data Boundary

- 所有寫入只落在 synthetic `test_b8c3q1`；formal `place` table 僅 read。
- Browser Observer 使用 caller session 與既有 RLS / access boundary；server-side worker credential 不可進入 browser artifact。
- Deployment credential 與 Edge Function runtime authorization credential 是不同角色，不應混為同一個設定概念。
- Runtime / provider evidence 只記錄 credential role 與 key type，不保存 credential value、prefix 或 hash。
- Dashboard `Add secret key` 已由 invocation metadata 證明會讓 request 帶 `apikey` 到達 Edge Function；但 provider 如何持久化該 credential、是否會以 plaintext 出現在 underlying job command，仍未驗證，不應推論。

## Operational Lessons

1. **Human observation needs a first-class surface.** Authenticated read-only Observer 比要求 Claire 反覆手動 SQL 更適合 iPad-first evidence collection。
2. **Source、deployment、scheduler、runtime、HTTP 與 business state 是不同 evidence layers。** 任一層成功都不能自動替下一層背書。
3. **Scheduler Success ≠ Batch Success.** 本次 `Cron Succeeded + HTTP 403 + rows remain PENDING` 是直接反例。
4. **Duplicated credential values create synchronization risk.** Current manual equality design 讓 caller credential 與 worker runtime copy 必須保持一致；403 暴露了這個 weakness。後續應驗證 provider-supported service-to-service auth contract，而不是把同步問題當成正常維運負擔。
5. **Failure evidence should be preserved.** Auth REWORK 若成功，應以新的 Evidence 延伸目前 403 diagnosis，而不是改寫成「一直都能跑」。
6. **Provider configuration traceability 尚未回答。** Dashboard / Git / migration 哪一處應成為 Cron configuration canonical source of truth 仍需後續研究。

## Known Unknowns / Next Evidence

- Auth REWORK 後 scheduled invocation 是否不再回 403，並實際進入 Native Data API processing。
- Cron B 是否能讓 synthetic row 形成可重複觀察的 `SUCCESS` / `FAILED` transition。
- Scheduled request failure、provider timeout、partial row failure與 retry semantics。
- Concurrent invocations、duplicate processing、locking / idempotency boundary。
- Supabase Cron、Edge Function、Native Data API 與 external provider 的 quota、duration 與 cost boundary。
- Scheduler / Dashboard 設定與 Git / migration 的 source-of-truth policy，以及 deployment traceability。
- Dashboard-managed Secret Key 的 underlying persistence / exposure boundary。

## Current Judgment

**Partial.** Cron A 的 `Cron → Database Function → test-table INSERT` tested path 為 `Verified`。Cron B 現在也已有直接 runtime Evidence 支持 `Cron → pg_net → Edge Function invocation`，但 worker authorization 回 403，因此 Native Data API、external provider 與 resulting row transition 尚未由 scheduled consumer path 驗證。

> Playground Evidence is not a Production Architecture Decision.

正式 Nook Works batch implementation 仍應回到正式 repository，依 Specification、Security、Operations、Cost 與後續 runtime Evidence 形成決策；不可把本 synthetic experiment 當作 production design。

## Related Records

- Research Map: [`../../knowledge/maps/nook-technical-platform.md`](../../knowledge/maps/nook-technical-platform.md)
- Evidence Index: [`../../evidence/index.md`](../../evidence/index.md)
- Worker implementation note: [`../../agent-work/implementation-notes/supabase-cron-edge-observer.md`](../../agent-work/implementation-notes/supabase-cron-edge-observer.md)
- Supabase Edge Function lifecycle baseline: [`../custom-api/README.md`](../custom-api/README.md)
