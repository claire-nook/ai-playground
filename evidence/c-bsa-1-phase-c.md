# C-BSA-1 Phase C — Atomic Business Transaction

- Date: 2026-09-15
- Status: **VERIFIED**
- Scope: synthetic representative transaction only
- Parent experiment: [`experiments/custom-api/c-bsa-1.md`](../experiments/custom-api/c-bsa-1.md)

## Purpose

Phase C 驗證一個包含多個 database statements 的 Business Operation，在不同 invocation pattern 下實際擁有什麼 transaction / rollback boundary。

Representative semantics 取自 Nook Works repository 已存在的 Daily Weather Batch Specification：Delete + Insert 必須視為同一個 Business Operation；若 replacement 失敗，不可留下「舊資料已刪除、新資料未建立」的 partial state。

實驗只使用 synthetic table / Function，不重製任何私人歷史業務程式。

## Synthetic Case

Baseline：

```text
business_key = DAILY-WEATHER
payload      = OLD
```

Synthetic table constraint 刻意拒絕：

```text
payload = FORCE_FAIL
```

比較兩種 transaction ownership：

```text
Pattern A — Separate Native Data API requests
DELETE OLD
request completes
INSERT FORCE_FAIL
request fails
```

```text
Pattern B — One RPC / PostgreSQL Function
DELETE OLD
INSERT replacement
one database operation succeeds or rolls back
```

驗收依據一律包含 independent database-state verification，不以 Edge Function response 單獨判定 transaction outcome。

## C-1 — Separate Data API Requests + Forced DB Failure

Initial state：`OLD` exists.

Execution：

```text
Data API DELETE OLD       → success
Data API INSERT FORCE_FAIL → constraint violation
```

Runtime response confirmed the DELETE request completed before INSERT failed.

Independent DB verification after failure：

```text
DAILY-WEATHER row = missing
```

### Evidence

兩個獨立 Native Data API operations 不共享可跨 request rollback 的 transaction boundary。第二個 INSERT failure 無法 rollback 已完成的第一個 DELETE。

這會留下 representative Business Operation 不接受的 partial state。

## C-2 — One Atomic RPC + Forced DB Failure

Baseline restored：`OLD` exists.

One RPC operation executed：

```text
DELETE OLD
INSERT FORCE_FAIL
→ constraint violation
```

Independent DB verification after failure：

```text
DAILY-WEATHER = OLD
```

### Evidence

DELETE 與 INSERT 位於同一 PostgreSQL operation / transaction boundary。後續 statement 發生 database constraint failure 時，preceding DELETE 一併 rollback。

## C-3 — Atomic RPC Success Positive Control

Baseline：`OLD` exists.

One RPC operation executed without forced failure：

```text
DELETE OLD
INSERT NEW
→ success
```

Runtime response：

```text
success = true
result  = NEW
```

Independent DB verification：

```text
DAILY-WEATHER = NEW
```

### Evidence

Atomic Function 不只是「失敗時沒有改資料」。在 success path 下，DELETE + INSERT 能完整 commit，證明 C-2 的 OLD preservation 是 rollback behavior，而非 Function 未正常執行 replacement operation。

## C-4 — Atomic RPC + Explicit Business Exception

Baseline restored：`OLD` exists.

Synthetic Function executed：

```text
DELETE OLD
RAISE EXCEPTION
'C-BSA-1 synthetic business rule rejected replacement'
```

Runtime response reported the explicit business exception.

Independent DB verification after failure：

```text
DAILY-WEATHER = OLD
```

### Evidence

Atomic rollback 不限於 database constraint failure。Function 內 Business Logic 主動 abort operation 時，preceding DELETE 同樣 rollback，恢復 operation 開始前的 database state。

## Consolidated Result

```text
C-1 Separate Data API + DB failure
    → DELETE persists
    → OLD missing
    VERIFIED

C-2 Atomic RPC + DB failure
    → whole operation rollback
    → OLD preserved
    VERIFIED

C-3 Atomic RPC success
    → DELETE + INSERT commit
    → NEW exists
    VERIFIED

C-4 Atomic RPC + Business Exception
    → whole operation rollback
    → OLD preserved
    VERIFIED
```

## Phase C Current Judgment

Phase C provides runtime evidence that **transaction ownership is materially different from merely sequencing API calls**.

For a Business Operation whose correctness requires multiple statements to commit or rollback together:

```text
multiple Native Data API requests
→ multiple request-scoped database operations
→ no shared rollback across completed requests
```

while:

```text
one PostgreSQL RPC operation
→ one transaction boundary around the composed database operation
→ success commits the complete replacement
→ database failure rolls back the complete replacement
→ explicit Business Logic exception also rolls back the complete replacement
```

This strongly supports the working hypothesis:

> **Transaction boundary should be owned by the layer owning the complete Business Operation.**

At this checkpoint the statement remains **Evidence-backed Current Judgment, not yet a Nook Works Platform Decision**.

Phase C proves that a PostgreSQL Function can own the required atomic boundary for a database-contained Business Operation. It does not prove that every Business Operation belongs in PostgreSQL, nor that RPC should replace ordinary Native Data API CRUD.

The remaining architectural question is whether a Backend Service can itself own a multi-statement PostgreSQL transaction without encapsulating the complete database operation in one RPC. That question is promoted to Phase D because it creates a meaningful third transaction-ownership pattern rather than merely repeating Phase C.

## Phase D Research Handoff

Phase D should compare:

```text
1. Multiple Native Data API requests
   → request-level transaction boundaries

2. One RPC / PostgreSQL Function
   → database-owned composed transaction

3. Backend Service direct PostgreSQL connection/session
   → candidate backend-owned transaction
```

The key Phase D question is:

> Can an Edge Function own a multi-statement PostgreSQL transaction without encapsulating the complete operation in one RPC, and if so, what access/security/operational cost does that introduce in the Supabase deployment model?

Do not treat direct PostgreSQL connectivity as preferred merely because it is technically possible. Phase D must produce feasibility and boundary evidence first.
