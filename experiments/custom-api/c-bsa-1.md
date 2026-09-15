# C-BSA-1 — Custom API / Backend Service Database Access

- Started: 2026-09-15
- Overall Status: **In Progress**
- Current checkpoint: **Phase C Verified**
- Representative workload: Nook Works Daily Weather Batch transaction semantics

> Phase A Access、Phase B Operation、Phase C Transaction 已完成 runtime verification。Phase D 已從 optional placeholder 收斂為 caller-owned transaction 對照實驗，尚待驗證。

## Research Question

Supabase Edge Function 作為 trusted backend service 時，應如何以明確、最小且可治理的權限存取 PostgreSQL objects？當一個 Business Operation 需要多個 SQL statement 時，transaction boundary 又應落在哪一層？

本實驗只使用 synthetic / formal-style secured objects，不為實驗直接放寬 Nook Works 正式資料表。

## Research Model

```text
C-BSA-1
├─ Phase A / Access Model                 VERIFIED
│  ├─ service identity
│  ├─ PostgreSQL object privilege
│  └─ RLS boundary
├─ Phase B / Operation Model              VERIFIED
│  ├─ Native Data API CRUD
│  ├─ RPC / PostgreSQL Function
│  ├─ EXECUTE privilege
│  └─ SECURITY INVOKER / SECURITY DEFINER
├─ Phase C / Transaction Model            VERIFIED
│  ├─ separate Data API requests
│  ├─ atomic PostgreSQL operation
│  ├─ database failure rollback
│  └─ explicit business exception rollback
└─ Phase D / Caller-owned Transaction     PLANNED
   ├─ Data API transaction-context capability
   ├─ Edge Function direct PostgreSQL session feasibility
   └─ backend-owned BEGIN / COMMIT / ROLLBACK boundary
```

核心原則目前是 Evidence-backed Current Judgment，不是 Platform Decision：

> **Transaction boundary 應由擁有完整 Business Operation 的那一層決定。**

---

## Phase A — Backend Service Access / Privilege Boundary

**Status: VERIFIED — 2026-09-15**

完整 checkpoint：[`evidence/c-bsa-1-phase-a.md`](../../evidence/c-bsa-1-phase-a.md)。

Phase A 驗證 PostgreSQL object privilege 與 RLS 是可獨立觀察的 authorization boundaries；Backend Service Identity 不等於 unrestricted database access，SELECT / INSERT / UPDATE / DELETE 可以依 object privilege 明確收斂。

---

## Phase B — RPC / PostgreSQL Function Operation Boundary

**Status: VERIFIED — 2026-09-15**

完整 checkpoint：[`evidence/c-bsa-1-phase-b.md`](../../evidence/c-bsa-1-phase-b.md)。

Phase B 驗證 Function `EXECUTE` 可以形成 operation-level authorization boundary：Backend Service 可沒有 direct table UPDATE privilege，卻能 EXECUTE 經批准的 `SECURITY DEFINER` operation；同一 identity 的 direct Native Data API UPDATE 仍被拒絕。

這證明「允許執行特定 Business Operation」與「允許直接修改 underlying table」可被分離治理，但不自動代表所有寫入都應改成 RPC。

---

## Phase C — Atomic Business Transaction

**Status: VERIFIED — 2026-09-15**

完整 checkpoint：[`evidence/c-bsa-1-phase-c.md`](../../evidence/c-bsa-1-phase-c.md)。

以 synthetic Daily Weather-like replacement case 比較 separate Native Data API requests 與 one RPC / PostgreSQL Function transaction。

```text
C-1 Separate Data API + forced DB failure
    DELETE commits
    INSERT fails
    → OLD missing

C-2 Atomic RPC + forced DB failure
    DELETE executes
    INSERT fails
    → whole operation rollback
    → OLD preserved

C-3 Atomic RPC success
    DELETE + INSERT NEW
    → complete operation commits
    → NEW exists

C-4 Atomic RPC + explicit Business Logic exception
    DELETE executes
    Function raises exception
    → whole operation rollback
    → OLD preserved
```

### Phase C Current Judgment

Phase C proves that transaction ownership is not equivalent to sequencing API calls.

Multiple completed Native Data API requests do not provide a shared rollback boundary. A single PostgreSQL RPC operation can own the complete database transaction and preserve atomicity across multiple statements for both database failure and explicit Business Logic abort.

This strongly supports the working hypothesis that the layer owning the complete Business Operation should own its transaction boundary.

However, Phase C only proves the **database-owned RPC transaction** pattern. It does not prove that every Business Operation should be implemented in PostgreSQL. That remaining distinction is the purpose of Phase D.

---

## Phase D — Caller-owned / Backend-owned Transaction

**Status: PLANNED**

### Research Question

Can an Edge Function own a multi-statement PostgreSQL transaction without encapsulating the complete operation in one RPC?

Phase D exists to determine whether Nook Works has a meaningful third transaction-ownership pattern for operations whose orchestration belongs in Backend Service rather than PostgreSQL.

### D-1 — Native Data API Transaction Context Capability

Determine whether Supabase Native Data API provides a caller-controlled transaction context that can span multiple client operations / requests.

Expected comparison point from Phase C: ordinary separate Data API operations behaved as independent transaction boundaries.

D-1 should distinguish documented/runtime capability from assumptions; lack of a public caller-owned transaction mechanism is itself useful architecture evidence.

### D-2 — Edge Function Direct PostgreSQL Session Feasibility

If Native Data API cannot expose a reusable transaction context, verify whether an Edge Function can establish a direct PostgreSQL connection/session suitable for explicit transaction ownership.

The experiment must consider Supabase-supported connection mechanism, Edge Runtime compatibility, credential handling, pooling / connection lifetime, and least-privilege database identity. Technical connectivity alone is not sufficient evidence of operational suitability.

### D-3 — Backend-owned Atomic Failure Control

Using the same synthetic representative semantics:

```text
Edge Function owns DB session
BEGIN
DELETE OLD
attempt forced failure / explicit abort
ROLLBACK
```

Independent DB verification must prove whether OLD is preserved.

A positive success control should also prove:

```text
BEGIN
DELETE OLD
INSERT NEW
COMMIT
→ NEW exists
```

### Phase D Comparison Target

```text
Pattern 1 — Multiple Native Data API requests
Transaction owner: individual request
Evidence: VERIFIED in Phase C

Pattern 2 — One RPC / PostgreSQL Function
Transaction owner: database operation
Evidence: VERIFIED in Phase C

Pattern 3 — Direct PostgreSQL session from Backend Service
Transaction owner: Backend Service
Evidence: Phase D pending
```

Phase D should stop once feasibility, rollback behavior, and operational/security cost are clear. Nested transactions, savepoints, isolation-level benchmarking, distributed transactions, and general PostgreSQL transaction research are out of scope unless a concrete Nook Works requirement later demands them.

---

## Evidence Discipline

C-BSA-1 必須保留 successful access、intentionally denied access、RLS / object privilege 差異、RPC INVOKER / DEFINER behavior，以及 transaction forced-failure 前後 database state。HTTP success、scheduler invocation success 或 Function invocation success 都不能單獨當成 authorization / transaction evidence。

## Privacy / Provenance

Transaction semantics 只引用 Nook Works repository 中既有 Daily Weather Batch Specification 作為 representative workload。私人、非 repository 的歷史業務程式與內容不得寫入 Playground、Evidence 或後續公開文件。
