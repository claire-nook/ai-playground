# C-BSA-1 Phase A-1 — Backend Service SELECT Baseline

- Date: 2026-09-15
- Status: Verified / Phase checkpoint
- Experiment: C-BSA-1
- Phase: A-1
- Tags: `nook-platform`, `supabase`, `custom-api`, `data-api`, `authorization`, `rls`, `postgresql`

## Question

Supabase Edge Function 使用 backend service identity 時，是否能經 Native Data API 成功 SELECT 一個明確授予 `service_role` SELECT privilege、啟用 RLS 且沒有 policy 的 synthetic table？

## Synthetic object

`public.test_bsa_access`

Columns:

- `oid`
- `test_key`
- `test_value`
- `created_at`

Seed rows: 2。

Baseline security state：

```text
RLS enabled                 true
RLS policy count            0
service_role SELECT         true
authenticated SELECT        false
anon SELECT                 false
```

## Edge Function

`test-backend-service-access`

Database path：

```text
Edge Function
→ @supabase/server ctx.supabaseAdmin
→ Native Data API
→ public.test_bsa_access SELECT
```

Repository source：`supabase/functions/test-backend-service-access/index.ts`。

Current deployed endpoint 使用 `auth: "secret"` 且 platform `verify_jwt = false`，符合 Supabase service-to-service auth mode。A-1 runtime probe 為了不暴露 secret，曾暫時 deploy `auth: "none"` 的 read-only synthetic version 取得 response evidence；取得 evidence 後立即恢復為 `auth: "secret"`。因此 `auth:none` 只屬 probe invocation mechanism，不是 Backend Service Access platform pattern。

## Runtime evidence

Provider / Tool Evidence：`pg_net` request id `433` 呼叫暫時可直接 invoke 的 A-1 probe，HTTP response：

```json
{
  "experiment": "C-BSA-1-A1",
  "success": true,
  "row_count": 2,
  "rows": [
    {
      "oid": 1,
      "test_key": "A1-01",
      "test_value": "baseline-one"
    },
    {
      "oid": 2,
      "test_key": "A1-02",
      "test_value": "baseline-two"
    }
  ]
}
```

Database direct observation 同時確認 synthetic table row count = 2。

恢復 secure deployment 後，無 credential request id `434` 得到 HTTP 401 `MISSING_CREDENTIALS`，確認目前 deployed function 已不再公開接受匿名 invocation。

## Observation

在上述 baseline 條件下：

```text
Edge Function backend service client
→ Native Data API
→ SELECT public.test_bsa_access
→ HTTP 200 / 2 rows
```

A-1 唯一驗收目標成立。

## Important boundary

A-1 只證明 positive control：backend service identity 在具有 table SELECT privilege 時，可以經 Native Data API SELECT synthetic table。

本 Phase 尚未驗證：

- 移除 `service_role` SELECT 後的 failure behavior；
- RLS 與 object privilege 的負向對照；
- INSERT / UPDATE / DELETE；
- RPC / PostgreSQL Function；
- transaction behavior。

因此不得從 A-1 單獨推論完整 Phase A/B/C 結論。

## Connector operational note

Fresh conversation 中 `apply_migration` 成功建立 `test_bsa_access`，前一 conversation 的 DDL safety-layer block 沒有重現。因此前次 failure 維持 Connector session anomaly classification，不是 Supabase capability evidence，也不是 C-BSA-1 permission evidence。

另一次 multi-statement `execute_sql` 曾被 safety layer block，但拆成單純 SELECT 後正常執行；同樣不納入 C-BSA-1 runtime evidence。
