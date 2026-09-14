# D-BATCH-1 Phase 1 Evidence / Phase 2 Plan

- Date: 2026-09-14
- Experiment: `D-BATCH-1`
- Status: `Phase 1 completed; Phase 2 planned`
- Record: `experiments/batch-scheduling/README.md`

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

### Scheduled external API path

Not reached。

Worker 必須先取得 coordinates 才會呼叫 Open-Meteo；此次在 `place` SELECT 已停止，所以不能記成 Open-Meteo failure。

C-EXT-1 已獨立驗證一般 Edge Function outbound HTTP → Open-Meteo；D-BATCH-1 尚未驗證 Cron-scheduled worker 的 external API path。

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

## Phase 2 — Planned Evidence

### P2-A — Backend Service Access

研究正常採 PostgreSQL privilege + RLS / application access boundary 的 table，如何讓 server-side Custom API 以明確、least-privilege 的方式讀取。

原則：不直接為了實驗把 formal `place` 放寬。優先用 synthetic / formal-equivalent object 驗證 authorization pattern，再決定是否值得形成正式 migration / architecture rule。

### P2-B — Cron-scheduled Custom API → External API

移除 formal `place` dependency，直接使用 synthetic coordinates：

```text
Cron → Edge Function → synthetic coordinates → Open-Meteo → synthetic result
```

目標只驗 scheduled runtime outbound HTTP path。

### P2-C — Minimal integration confirmation

P2-A、P2-B 分別通過後，再確認：

```text
Cron
→ Edge Function
→ authorized Data API read
→ external API
→ synthetic Data API update
```

這不是第三個大型實驗，而是避免把兩個單點成功自動腦補成完整鏈成功。

## Current Judgment

Phase 1 已足以確認 Supabase Cron 是 Nook Works system scheduler 的 credible candidate；D-BATCH-1 整體仍維持 `Partial`，直到 Backend Service Access 與 Cron-scheduled external HTTP 兩個剩餘問題完成最小驗證。
