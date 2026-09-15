# C-BSA-1 — Consolidated Findings

- Date: 2026-09-15
- Research Status: **CORE EXPERIMENT COMPLETE**
- Phases: A / B / C / D **VERIFIED**
- Parent experiment: [`experiments/custom-api/c-bsa-1.md`](../experiments/custom-api/c-bsa-1.md)

## Why this document exists

C-BSA-1 started as a database-access question for Supabase Edge Functions, but the runtime evidence separated the problem into three different architectural concerns:

```text
Access Boundary
Who may access which database objects / operations?
        ↓
Phase A

Operation Boundary
Can an approved Business Operation be authorized separately from direct table writes?
        ↓
Phase B

Transaction Boundary
Which layer can own atomicity for a multi-statement Business Operation?
        ↓
Phase C + Phase D
```

This document consolidates those findings for future Nook Works platform design. It records Evidence-backed Architecture Candidates and implementation considerations. It is **not an automatic Platform Standard**.

---

## Phase A — Access Boundary

### Verified

PostgreSQL object privilege and Row Level Security (RLS) are distinct authorization boundaries.

Backend Service Identity does not imply unrestricted database object access. Native Data API SELECT / INSERT / UPDATE / DELETE can be allowed or denied through PostgreSQL grants. For non-bypass-RLS identities, having table privilege does not itself guarantee row visibility or row operability.

### Architectural meaning

Backend components can be designed around least privilege instead of receiving blanket database access merely because they are trusted server-side code.

```text
Backend identity
   ↓
Object privilege
   ↓
RLS where applicable
   ↓
Actual permitted data operation
```

---

## Phase B — Operation Boundary

### Verified

A Backend Service can be denied direct table UPDATE while receiving EXECUTE on an approved PostgreSQL Function.

With `SECURITY DEFINER`, the approved Function can perform the constrained modification even though the caller cannot issue the equivalent direct Native Data API UPDATE. Removing Function EXECUTE blocks the approved operation.

### Architectural meaning

Authorization can distinguish:

```text
May directly modify this table
```

from:

```text
May execute this approved Business Operation
```

This makes RPC / PostgreSQL Function a viable operation-level authorization boundary where such encapsulation is useful.

### Important limitation

`SECURITY DEFINER` is powerful and must be hardened. Production use requires explicit ownership, safe `search_path`, narrow Function body, deliberate EXECUTE grants, schema exposure review, and least-privilege access to underlying objects.

RPC feasibility is not a reason to convert ordinary CRUD into Functions by default.

---

## Phase C — Database-owned Transaction

### Verified

Separate Native Data API operations do not form one shared rollback boundary. A completed DELETE remained committed when a later independent INSERT failed.

One RPC / PostgreSQL Function containing DELETE + INSERT behaved atomically:

- database constraint failure rolled back the preceding DELETE;
- explicit Business Logic exception rolled back the preceding DELETE;
- success committed the complete DELETE + INSERT replacement.

### Architectural meaning

For a Business Operation naturally contained within the database, a PostgreSQL Function can own its complete transaction boundary.

```text
Backend
   ↓ one RPC
PostgreSQL Function
   ├─ statement A
   ├─ statement B
   └─ COMMIT / ROLLBACK as one operation
```

---

## Phase D — Backend-owned Transaction

### Verified

Edge Function can connect through a PostgreSQL client using Supabase Transaction Pooler and own a multi-statement transaction.

The Backend Service successfully demonstrated both paths:

```text
BEGIN
DELETE OLD
Business Logic exception
ROLLBACK
→ OLD preserved
```

and:

```text
BEGIN
DELETE OLD
INSERT NEW-D
COMMIT
→ NEW-D persisted
```

### Architectural meaning

A Business Operation whose orchestration belongs in Backend Service does not have to be moved into PostgreSQL merely to obtain atomic database writes. Backend Service can own the PostgreSQL transaction when it uses the appropriate database connection pattern.

### Important limitation

The Phase D Playground connection authenticated as `postgres`. This is acceptable only as feasibility evidence in the synthetic experiment. It is not an acceptable production authorization model.

---

# Evidence-backed Architecture Candidates

## Candidate 1 — Native Data API for independent CRUD

Use Native Data API when the operation is naturally one independent database action and does not require caller-owned atomicity across several database statements.

```text
Business Operation
≈ one independent CRUD operation
        ↓
Native Data API
```

Benefits include simpler implementation, less connection management, and direct use of PostgreSQL grants / RLS boundaries.

Do not sequence several Data API calls and assume they share a transaction.

## Candidate 2 — RPC for database-contained atomic operation

Use RPC / PostgreSQL Function when the complete atomic Business Operation belongs naturally in database logic and should be exposed as one approved operation.

```text
Backend
   ↓ EXECUTE approved Function
Database-owned Business Operation
   ↓
Atomic transaction
```

This can combine operation-level authorization with transaction ownership, but increases Function governance responsibilities.

## Candidate 3 — Backend-owned PostgreSQL transaction

Use a PostgreSQL client from Backend Service when Business Operation orchestration belongs in backend application logic but several database statements must commit or rollback together.

```text
Backend Business Operation
   ├─ application logic
   ├─ BEGIN
   ├─ database statement A
   ├─ database statement B
   └─ COMMIT / ROLLBACK
```

This keeps orchestration out of PostgreSQL while preserving database atomicity, at the cost of database credential, connection, pooling and transaction lifecycle responsibilities in the backend layer.

---

# Transaction Ownership Selection Model

```text
Does the Business Operation require multiple DB statements
that must commit / rollback together?

NO
│
└─ Native Data API is the simplest candidate.

YES
│
├─ Does the complete operation naturally belong in database logic?
│     │
│     └─ YES → RPC / PostgreSQL Function is a candidate.
│
└─ Does orchestration belong in Backend Service?
      │
      └─ YES → Backend-owned PostgreSQL transaction is a candidate.
```

The deciding question is not "Which API do we prefer?" but:

> **Which layer owns the complete Business Operation?**

The evidence from C-BSA-1 strongly supports the working principle:

> **Transaction boundary should be owned by the layer owning the complete Business Operation.**

This principle is now supported by runtime comparison, but should still be promoted to a formal Nook Works Platform Decision only when platform architecture work explicitly adopts it.

---

# Future Platform Implementation Considerations

## 1. Preserve least privilege across every pattern

Phase D must not nullify Phase A. If Backend Service uses direct PostgreSQL connectivity, create a restricted application database role rather than using `postgres` or an equivalently broad owner credential.

The role should receive only the table/schema/sequence/Function privileges required by that backend responsibility.

## 2. Separate endpoint authentication from database identity

Who may invoke an Edge Function and what database identity the Function uses are different security decisions.

```text
Caller → Edge Function authentication
≠
Edge Function → PostgreSQL authorization
```

A strong caller secret does not compensate for an over-privileged database credential.

## 3. Do not mistake RLS bypass for universal privilege

RLS and PostgreSQL object privilege are separate controls. A privileged backend client that bypasses RLS can still be constrained by object grants, depending on database identity and access path.

## 4. Treat SECURITY DEFINER as privileged code

Production Functions should explicitly control owner, `search_path`, schema references, Function EXECUTE grants and underlying object privileges. Avoid broad `PUBLIC` EXECUTE where the Function performs privileged writes.

## 5. Do not RPC-ify ordinary CRUD without a reason

RPC is justified by an operation boundary, transaction boundary, database-local computation or another concrete requirement. A table read or independent CRUD operation does not become architecturally superior merely because it was wrapped in a Function.

## 6. Never model multi-request Data API sequences as one transaction

If partial state is unacceptable, several independent Data API operations are not sufficient. The atomic boundary must move into one database operation or into a backend-owned PostgreSQL transaction.

## 7. Backend-owned transactions introduce operational responsibility

Direct PostgreSQL client usage requires deliberate handling of connection string secrets, restricted DB role, connection pooling, transaction lifetime, timeout behavior, error cleanup and connection release.

For Supabase Edge/serverless deployment, connection strategy must be compatible with the platform pooler and client behavior. The Phase D probe used Transaction Pooler-compatible client settings; production implementation must preserve that discipline.

## 8. Keep transactions short

Do not hold a database transaction open while waiting on slow external APIs or human interaction. External I/O and database atomic sections should be separated where possible.

If a future Business Operation requires atomicity across PostgreSQL and an external service, that is a different distributed-consistency problem and is outside C-BSA-1 evidence.

## 9. Error handling must reflect Business Operation semantics

HTTP status, Edge Function invocation success and database transaction success are separate concepts. Production APIs should map validation, authorization, business rejection, database failure and unexpected backend failure deliberately rather than returning experimental `500` mappings unchanged.

## 10. Add reliability experiments only when a real workload requires them

Isolation levels, concurrent writers, deadlocks, retries, savepoints, connection exhaustion and performance benchmarking are valid future topics, but C-BSA-1 does not need to become a PostgreSQL encyclopedia. Open targeted experiments when a concrete Nook Works workload creates the requirement.

---

# Research Boundary / What C-BSA-1 Does Not Decide

C-BSA-1 does not establish that:

- all writes should use RPC;
- all Backend Services should use direct PostgreSQL connections;
- RLS should or should not be used for every backend access path;
- `postgres` is an acceptable application identity;
- every Business Operation must be one SQL transaction;
- external API work can be rolled back by PostgreSQL;
- one transaction pattern should be globally standardized without workload analysis.

It establishes the available boundaries and verified behavior needed to make those later architecture decisions consciously.

---

# Final Research Judgment

C-BSA-1 verifies that Supabase / PostgreSQL supports three separable design dimensions for Nook Works backend architecture:

```text
ACCESS
PostgreSQL privilege + RLS

OPERATION
Direct object operation vs approved Function EXECUTE

TRANSACTION
Request-owned vs database-owned vs backend-owned
```

The platform therefore does not need one universal database-access pattern. It can select an access and transaction model according to component responsibility and Business Operation semantics while preserving least privilege.

**Research conclusion:** the core feasibility questions are answered. Further work should be opened as focused production-governance or reliability experiments only when a concrete platform decision requires them.
