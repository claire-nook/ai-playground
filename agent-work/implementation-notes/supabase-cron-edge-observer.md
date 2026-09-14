# Supabase Cron Edge Worker + Authenticated Observer｜Implementation Note

## Artifact identity

- Edge Function：`test-cron-edge-worker`
- Observer route：`/cron-edge-observer/`
- Synthetic table：`public.test_b8c3q1`

## Current invocation contract

Worker 只接受 `POST`。Server-to-service authentication 使用 Supabase server helper：

```text
withSupabase({ auth: "secret" })
```

Handler 使用 helper 提供的 `supabaseAdmin` privileged client。先前使用非 privileged client 時曾出現 Native Data API authorization failure；改用 `supabaseAdmin` 後，synthetic table SELECT / UPDATE 已 runtime verified。

Deploy workflow：`.github/workflows/deploy-test-cron-edge-worker.yml`。

## Current worker flow

```text
POST
→ SELECT 最多 3 筆 PENDING synthetic rows
→ 逐筆 process
→ SELECT formal place coordinates
→ 若有 coordinates，呼叫 Open-Meteo
→ SUCCESS / FAILED 回寫 synthetic row
```

Synthetic row terminal update：

- `SUCCESS`：寫入 temperature / updated metadata，`t09 = null`
- `FAILED`：寫入 updated metadata，`t09 = failure reason`

Observer 已顯示 `t09` Memo。

## Phase 1 runtime evidence

已確認：

```text
Cron → pg_net → Edge Function                                  Verified
Edge Function → Native Data API SELECT synthetic table         Verified
Edge Function → Native Data API UPDATE synthetic table         Verified
```

Formal `place` SELECT 目前失敗：

```text
place_select_failed: permission denied for table place
```

Root cause 已確認為 current `service_role` 沒有 formal `place` 的 SELECT table privilege。這不是 Cron-specific failure；同一 worker 改成人工 POST，只要仍使用相同 service identity 讀 `place`，結果相同。

因此 Open-Meteo 在 D-BATCH-1 Phase 1 尚未被執行到。C-EXT-1 已另外證明一般 Edge Function outbound HTTP → Open-Meteo 可行，但 Cron-scheduled worker path 仍待驗證。

## Observer behavior

`/cron-edge-observer/`：

- Browser 使用 Supabase Auth session。
- 以 Native Data API 唯讀 synthetic rows。
- 顯示 PENDING / SUCCESS / FAILED counts。
- 顯示 `t09` Memo，讓 row-level failure reason 不必只靠 Dashboard log 追查。
- 不包含 server-side credential，不提供 write、Cron management 或 scheduler administration。

## Phase 2 implementation boundary

### P2-A — Backend Service Access

先以 synthetic / formal-equivalent object 驗證 server-side Custom API 對正常 privilege + RLS table 的 least-privilege access pattern。不要直接修改 formal `place` 來讓實驗變綠。

### P2-B — Scheduled outbound HTTP

以 synthetic coordinates 移除 `place` dependency，驗證：

```text
Cron → Edge Function → Open-Meteo → synthetic result
```

### P2-C — Minimal integration confirmation

前兩項各自成功後，再確認：

```text
Cron → Edge Function → authorized Data API read → external API → synthetic update
```

這是 integration gate，不是新框架建設。

## Scope boundary

本 Playground worker 不應擴張成 production batch framework。Retry、locking、batch log、job administration、formal table permission migration 等都必須在有明確研究或正式需求時另行決定。
