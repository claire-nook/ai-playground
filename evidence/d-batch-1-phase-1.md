# D-BATCH-1 Phase 1 Evidence / Remaining Cron Gate

- Date: 2026-09-14
- Experiment: `D-BATCH-1`
- Status: `Phase 1 completed; scheduled external HTTP confirmation pending`
- Record: `experiments/batch-scheduling/README.md`
- Reusable Implementation Guide: `knowledge/implementation/supabase-cron.md`

## Phase 1 — Confirmed Evidence

### Supabase Cron as scheduler

Supabase Cron 已持續依 cadence 執行 database job 與 HTTP job。對 HTTP job，Scheduler `Succeeded` 只代表 dispatch command 被執行，不等於 downstream HTTP 或 item processing 成功。

### Cron → Database Function

Verified：

```text
Supabase Cron → PostgreSQL Database Function → synthetic PENDING row
```

### Cron → Custom API

Verified：

```text
Supabase Cron → pg_net → HTTP POST → Supabase Edge Function
```

早期 worker custom auth 曾回 HTTP 403；改採 `withSupabase({ auth: "secret" })` 與 `supabaseAdmin` 後，scheduled invocation 已回 HTTP 200。

### Custom API → Native Data API

Verified on synthetic `public.test_b8c3q1`：

- SELECT PENDING rows
- UPDATE terminal status / metadata / Memo

因此此 worker path 實際驗證的是 Native Data API Read + Update。

### Formal `place` read

Blocked，且 root cause 已確認：

```text
place_select_failed: permission denied for table place
```

`place` 採正式 user access model：`authenticated` 有 table SELECT privilege，再受 RLS / `private.can_access_application()` 約束；目前 `service_role` 沒有 `place` SELECT table privilege。

因此：

- 這不是 Cron limitation。
- 這不是 Native Data API SELECT capability failure。
- 這是目前 Custom API service identity 對 formal table 的 PostgreSQL privilege 問題。

相同 Custom API 即使改由人工 POST，只要仍以相同 service identity SELECT `place`，結果也會相同。

這項 Evidence 已足以建立一個獨立的 Backend Service Access research question，但它不再是 D-BATCH-1 completion gate。

### Scheduled external API path

Not reached。

Worker 必須先取得 coordinates 才會呼叫 Open-Meteo；此次在 `place` SELECT 已停止，所以不能記成 Open-Meteo failure。

C-EXT-1 已獨立驗證一般 Edge Function outbound HTTP → Open-Meteo；D-BATCH-1 尚未直接驗證 Cron-scheduled worker 的 external API path。

### Memo observability

Verified。

Synthetic table `t09` 保存 row-level failure reason；Observer 已顯示 Memo。新版 FAILED rows 可直接看到：

```text
place_select_failed: permission denied for table place
```

## Reusable Lessons

```text
Scheduler History
→ Runtime Lifecycle
→ HTTP Invocation
→ Data API / PostgreSQL Result
→ Observer / Data State
```

各層不能互相代替。

另應區分：

- Batch/System Failure：整批無法開始。
- Item Failure：單筆失敗，留下 `FAILED + Memo`，其他 item 可繼續；invocation 仍可能 HTTP 200。

可重用的 Cron implementation details 已移到 `knowledge/implementation/supabase-cron.md`，避免 Evidence 同時扮演操作手冊。

## Remaining D-BATCH-1 Evidence Gate

只補 scheduled outbound HTTP：

```text
Cron A
→ Database Function
→ INSERT PENDING + synthetic latitude / longitude

Cron B
→ Edge Function
→ synthetic coordinates
→ Open-Meteo
→ synthetic Data API update
```

這一步刻意移除 formal `place` dependency，只回答：

> Cron scheduled invoke 的 Edge Function 是否能完成 outbound HTTP processing 並寫回結果？

若這條 runtime chain 有直接 evidence，D-BATCH-1 第一輪 feasibility research 即可結案。

## Separate Research Question — Backend Service Access

Formal `place` permission failure 應另行研究：

> server-side Custom API 要如何對正常 secured application table 取得明確、least-privilege access？

不要為了完成 Cron Experiment 而直接放寬 `place`。未來若正式 workload 需要，再用 synthetic / formal-equivalent object 驗證 authorization pattern。

## Current Judgment

Phase 1 已足以確認 Supabase Cron 是 Nook Works system scheduler 的 credible candidate，且實作 recipe 已可重用。D-BATCH-1 整體仍維持 `Partial`，只因 scheduled outbound external HTTP 尚缺直接 runtime confirmation。
