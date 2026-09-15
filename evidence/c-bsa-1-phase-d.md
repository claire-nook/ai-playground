# C-BSA-1 Phase D — Backend-owned Transaction

- Date: 2026-09-15
- Status: **VERIFIED**
- Scope: synthetic representative transaction only
- Parent experiment: [`experiments/custom-api/c-bsa-1.md`](../experiments/custom-api/c-bsa-1.md)

## Purpose

Phase D 驗證 Phase C 之外的第三種 transaction ownership pattern：當完整 Business Operation 的 orchestration 屬於 Backend Service 時，Supabase Edge Function 是否能透過 PostgreSQL client 自己擁有 multi-statement transaction，而不必把完整 operation 封裝成 one RPC / PostgreSQL Function。

Phase D 不研究 distributed transaction、nested transaction、isolation level tuning、deadlock/retry strategy 或 general PostgreSQL performance。那些議題只有在平台正式採用此 pattern 且出現具體 workload requirement 時才值得另開實驗。

## D-1 — Native Data API Transaction Context Capability

Phase C 已以 runtime evidence 證明兩個 separate Native Data API requests 各自完成 database operation：先完成的 DELETE 不會因後續獨立 INSERT failure 而 rollback。

Supabase JavaScript client / Data API 的 caller interface 沒有提供可由 Edge Function 持有並跨多個 ordinary Data API operations 使用的 transaction handle。需要由 caller 控制多 statement atomicity 時，不能把多個 `.from()` calls 排在一起就視為同一 transaction。

### Evidence-backed conclusion

```text
Native Data API operation A
→ request / operation transaction boundary A

Native Data API operation B
→ request / operation transaction boundary B

No caller-owned shared transaction context across the two ordinary operations.
```

D-1 與 Phase C C-1 的 runtime result 一致。

## D-2 — Edge Function PostgreSQL Client Feasibility

建立 synthetic Edge Function：

```text
test-backend-service-owned-transaction
```

Function 使用 PostgreSQL client，connection credential 由 Supabase Project Secret `PLAYGROUND_DATABASE_URL` 提供；secret value 不寫入 repository、Evidence 或 response。

Connection pattern：

```text
Edge Function
    ↓
PostgreSQL client
    ↓
Supabase Transaction Pooler
    ↓
PostgreSQL
```

Runtime `connection-check`：

```json
{
  "experiment": "C-BSA-1-D",
  "operation": "connection-check",
  "success": true,
  "database_name": "postgres",
  "database_user": "postgres"
}
```

### Evidence

Edge Function 可在目前 Supabase deployment model 中透過 PostgreSQL client 建立可工作的 database connection，Backend Service 因此具備直接持有 PostgreSQL transaction 的技術基礎。

### Important security limitation

本 Playground probe 使用的 database identity 是：

```text
current_user = postgres
```

這只證明 **technical feasibility**，不代表 production identity design 已完成。`postgres` 權限過高，不應因實驗成功而直接升格成 Nook Works production backend credential。

若平台正式採用 backend-owned PostgreSQL transaction，必須另外設計 restricted database role、object grants、Function grants、credential lifecycle 與 secret rotation，使 Phase D 不破壞 Phase A 已驗證的 least-privilege boundary。

## D-3a — Backend-owned Rollback Control

Baseline independently verified：

```text
business_key = DAILY-WEATHER
payload      = OLD
```

Edge Function transaction：

```text
BEGIN
DELETE OLD
Business Logic throws synthetic exception
ROLLBACK
```

Runtime response：

```json
{
  "experiment": "C-BSA-1-D",
  "operation": "rollback",
  "success": false,
  "detail": "C-BSA-1 synthetic backend business rule rejected replacement"
}
```

Independent DB verification after failure：

```text
DAILY-WEATHER = OLD
```

### Evidence

Transaction boundary was owned by the Edge Function PostgreSQL client. A Business Logic exception raised after DELETE caused the backend-owned transaction to rollback, preserving the pre-operation database state.

## D-3b — Backend-owned Commit Positive Control

Starting from verified `OLD` baseline, Edge Function executed：

```text
BEGIN
DELETE OLD
INSERT NEW-D
COMMIT
```

Runtime response：

```json
{
  "experiment": "C-BSA-1-D",
  "operation": "commit",
  "success": true,
  "result": "NEW-D"
}
```

Independent DB verification：

```text
business_key = DAILY-WEATHER
payload      = NEW-D
```

### Evidence

Backend-owned transaction is not merely capable of aborting. The same pattern can successfully commit a complete multi-statement replacement operation.

## Consolidated Phase D Result

```text
D-1 Native Data API caller-owned multi-operation transaction
    → no shared caller transaction context for ordinary Data API operations
    VERIFIED

D-2 Edge Function PostgreSQL client connection
    → Transaction Pooler connection succeeds
    VERIFIED

D-3a Backend-owned transaction failure
    → DELETE + Business Logic exception
    → ROLLBACK
    → OLD preserved
    VERIFIED

D-3b Backend-owned transaction success
    → DELETE + INSERT NEW-D
    → COMMIT
    → NEW-D persisted
    VERIFIED
```

## Phase D Current Judgment

Phase D provides runtime evidence that **Backend Service can own the complete PostgreSQL transaction boundary** when it uses a PostgreSQL client/session-capable connection pattern instead of ordinary Native Data API calls.

This establishes a meaningful third transaction ownership pattern:

```text
Multiple Native Data API operations
→ transaction owner: individual database/API operation

One RPC / PostgreSQL Function
→ transaction owner: database Function operation

Backend PostgreSQL client
→ transaction owner: Backend Service
```

The choice among these patterns should follow Business Operation responsibility rather than API preference.

Phase D does **not** establish the Playground `postgres` credential pattern as production-safe. Production adoption of backend-owned transactions requires a separate least-privilege identity design and operational governance.

This is **Evidence / Current Judgment, not by itself a Platform Decision**.
