# C-BSA-1 Phase B — RPC / PostgreSQL Function Operation Boundary

- Date: 2026-09-15
- Status: **VERIFIED**
- Scope: synthetic objects only
- Parent experiment: [`experiments/custom-api/c-bsa-1.md`](../experiments/custom-api/c-bsa-1.md)

## Purpose

Phase B 驗證 Backend Service 是否可以在**沒有 underlying table UPDATE privilege** 的情況下，只透過特定 PostgreSQL Function 的 `EXECUTE` privilege 完成經批准的 Business Operation。

本階段只驗證 runtime capability / authorization boundary，不將任何 pattern 升格為 Production Architecture Decision。

## Test Objects

Synthetic table：`public.test_bsa_access`

RPC probes：

- `public.test_bsa_update_invoker(text)` — `SECURITY INVOKER`
- `public.test_bsa_update_definer(text)` — `SECURITY DEFINER`

Edge Function：`test-backend-service-rpc`

Direct Native Data API negative control：`test-backend-service-cud`

測試期間刻意逐步調整 `service_role` 的 table `UPDATE` 與 Function `EXECUTE` privilege，以一次只改變主要 authorization variable。

## B-1 — SECURITY INVOKER / No Table UPDATE

Precondition：

```text
service_role table UPDATE = false
service_role invoker function EXECUTE = true
```

Runtime result：

```json
{
  "experiment": "C-BSA-1-B",
  "operation": "invoker",
  "success": false,
  "detail": "permission denied for table test_bsa_access"
}
```

Database state verification：synthetic row remained `baseline`.

### Evidence

`SECURITY INVOKER` 沿用 caller 的 database privilege boundary。Function 可被 EXECUTE，不代表 Function 內的 table UPDATE 自動取得額外權限。

## B-2 — SECURITY DEFINER / No Table UPDATE

Precondition：

```text
service_role table UPDATE = false
service_role definer function EXECUTE = true
```

Runtime result：

```json
{
  "experiment": "C-BSA-1-B",
  "operation": "definer",
  "success": true,
  "rows": "B2-definer-updated"
}
```

Independent database state verification confirmed:

```text
B1-RPC = B2-definer-updated
```

### Evidence

Caller 不具 table UPDATE privilege，但具有該 `SECURITY DEFINER` Function 的 EXECUTE privilege 時，RPC 可以完成 Function 所封裝的 UPDATE operation。

## B-3 — SECURITY DEFINER / EXECUTE Revoked

Precondition：

```text
service_role table UPDATE = false
service_role definer function EXECUTE = false
```

Runtime result：

```json
{
  "experiment": "C-BSA-1-B",
  "operation": "definer",
  "success": false,
  "detail": "permission denied for function test_bsa_update_definer"
}
```

Independent database state verification confirmed the row remained `B2-definer-updated`.

### Evidence

`SECURITY DEFINER` 不等於 unrestricted callable operation。Function `EXECUTE` privilege 可以獨立阻擋 caller 進入該 operation。

## B-4 — Approved RPC vs Direct Native Data API UPDATE

After restoring only the approved Function EXECUTE privilege:

```text
service_role table UPDATE = false
service_role definer function EXECUTE = true
```

B-2 已證明 approved RPC operation 可完成 UPDATE。

Direct Native Data API negative control through `test-backend-service-cud` returned:

```json
{
  "experiment": "C-BSA-1-A4",
  "operation": "update",
  "success": false,
  "detail": "permission denied for table test_bsa_access"
}
```

### Evidence

在相同 backend database identity 下，可以形成：

```text
Approved RPC / Function EXECUTE  → UPDATE succeeds
Direct Native Data API UPDATE    → permission denied
```

因此「允許執行特定 Business Operation」與「允許直接 UPDATE underlying table」是可分離的 authorization boundaries。

## Consolidated Result

```text
B-1  INVOKER + EXECUTE yes + table UPDATE no
     → FAIL / permission denied for table

B-2  DEFINER + EXECUTE yes + table UPDATE no
     → SUCCESS / database row updated

B-3  DEFINER + EXECUTE no + table UPDATE no
     → FAIL / permission denied for function

B-4  DEFINER EXECUTE yes + direct table UPDATE no
     → approved RPC succeeds / direct Data API UPDATE fails
```

## Phase B Current Judgment

Phase B provides runtime evidence that Supabase Edge Function → RPC → PostgreSQL Function can act as an **operation-level authorization boundary**.

A Backend Service does not necessarily need direct write privilege on every underlying table. A narrower model is technically feasible:

```text
Backend Service
  │
  ├─ direct table UPDATE privilege = NO
  │
  └─ EXECUTE approved operation = YES
          │
          ▼
    SECURITY DEFINER Function
          │
          ▼
    constrained database operation
```

This is materially different from granting broad table write capability and relying on application discipline.

However, Phase B alone does **not** establish that `SECURITY DEFINER + EXECUTE` should become the Nook Works Preferred Pattern. Security hardening of production `SECURITY DEFINER` functions, ownership, `search_path`, schema exposure, function design, and governance remain architecture concerns rather than conclusions from this synthetic feasibility test.

Phase C must next test whether an RPC-owned Business Operation also provides the required atomic transaction / rollback boundary compared with multiple Native Data API requests.

## Operational Notes

One Dashboard request accidentally omitted the secret key and was rejected before reaching the experiment; another request sent `update` to the RPC probe and returned `unsupported_operation`. Neither was counted as Phase B evidence.

HTTP status mapping observed in the synthetic Edge Functions is application-level API behavior. Database errors are not themselves a production HTTP contract; formal APIs may map authorization failures differently.

## Privacy / Provenance

Only synthetic objects and repository-visible architectural concepts are recorded here. No confidential historical business procedure, schema, or implementation detail is reproduced.
