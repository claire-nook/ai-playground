# C-BSA-1 Phase A-2 — PostgreSQL Object Privilege Negative Control

- Date: 2026-09-15
- Status: Verified / Phase checkpoint
- Experiment: C-BSA-1
- Phase: A-2
- Tags: `nook-platform`, `supabase`, `custom-api`, `data-api`, `authorization`, `rls`, `postgresql`

## Question

在 A-1 相同 backend service identity、Native Data API、synthetic table 與 RLS 狀態下，若只移除 `service_role` 對 table 的 SELECT privilege，SELECT 是否會被 PostgreSQL object privilege 拒絕？

## Controlled change

Synthetic object：`public.test_bsa_access`

A-1 baseline：

```text
service_role SELECT         true
RLS enabled                 true
RLS policy count            0
→ SELECT success
```

A-2 唯一刻意變更：

```sql
revoke select on table public.test_bsa_access from service_role;
```

變更後直接確認：

```text
service_role SELECT         false
RLS enabled                 true
RLS policy count            0
```

Edge Function source、database access path 與 synthetic rows 均未修改。

## Runtime evidence

Supabase Dashboard Edge Function Test 使用 project custom secret `PLAYGROUND_CRON_EDGE_WORKER_KEY`，透過 Test UI 的 `Add secret key` 將 secret credential 放入 `apikey` header，成功通過 Function 的 `withSupabase({ auth: "secret" })` caller authentication。

Function 執行到 Native Data API SELECT 後回傳 HTTP 500：

```json
{
  "experiment": "C-BSA-1-A1",
  "success": false,
  "error": "baseline_select_failed",
  "detail": "permission denied for table test_bsa_access"
}
```

`experiment` value 仍為 `C-BSA-1-A1`，因為 A-2 刻意重用完全相同的 A-1 probe implementation，避免改動 Function source 成為額外實驗變因；A-2 的 phase identity 由本 evidence record 與 database privilege state 界定。

## Observation

```text
Caller authentication
→ PASS

Edge Function backend service client
→ Native Data API
→ SELECT public.test_bsa_access
→ FAIL: permission denied for table test_bsa_access
```

與 A-1 對照：

```text
A-1: service_role SELECT = true  → SELECT SUCCESS
A-2: service_role SELECT = false → SELECT FAIL / permission denied
```

A-2 negative control 成立。

## Evidence-level conclusion

在本 synthetic test 條件下，Backend Service Identity 並不等於無條件擁有 PostgreSQL table object privilege。使用 `ctx.supabaseAdmin` 的 backend service client 經 Native Data API 存取 table 時，移除 `service_role` SELECT privilege 會使 SELECT 被 PostgreSQL 拒絕。

此結論屬 C-BSA-1 Access Model evidence，不等於正式 Nook Works authorization design decision。

## Important boundary

A-2 沒有獨立驗證 RLS policy 對不同 database identity 的效果。A-1 / A-2 都維持：

```text
RLS enabled = true
policy count = 0
```

因此 A-2 隔離的是 PostgreSQL object privilege boundary，不應被描述成 RLS negative test。

尚未驗證：

- non-bypass-RLS identity 在相同 table privilege 下的 RLS behavior；
- INSERT / UPDATE / DELETE object privileges；
- RPC / PostgreSQL Function；
- transaction behavior。

## Operational note

先前 Vault 中 `playground_cron_edge_worker_key` 的值無法通過目前 Function secret auth，回傳 `INVALID_API_KEY`；此為 credential/configuration operational issue，不納入 A-2 database permission evidence。

Supabase Dashboard Edge Function Test UI 可使用 `Add secret key` 直接選 project custom secret，避免將 secret value 暴露到實驗紀錄或對話內容。這是可重用的 operational knowledge，後續可再整理至 implementation knowledge。
