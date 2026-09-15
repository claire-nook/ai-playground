# C-BSA-1 — Custom API / Backend Service Database Access

- Started: 2026-09-15
- Completed: 2026-09-15
- Overall Status: **CORE EXPERIMENT COMPLETE**
- Current checkpoint: **Phase A / B / C / D Verified**
- Representative workload: Nook Works Daily Weather Batch transaction semantics

> C-BSA-1 core research is complete. Access、Operation、database-owned transaction 與 backend-owned transaction boundaries 均已完成 runtime verification。後續 production governance / reliability topics 應依具體平台需求另開 focused experiment，不再擴充 Phase E。

## Research Question

Supabase Edge Function 作為 trusted backend service 時，應如何以明確、最小且可治理的權限存取 PostgreSQL objects？當一個 Business Operation 需要多個 SQL statements 時，transaction boundary 又應落在哪一層？

本實驗只使用 synthetic / formal-style secured objects，不為實驗直接放寬 Nook Works 正式資料表。

## Research Model

```text
C-BSA-1
├─ Phase A / Access Model                 VERIFIED
├─ Phase B / Operation Model              VERIFIED
├─ Phase C / Database-owned Transaction   VERIFIED
└─ Phase D / Backend-owned Transaction    VERIFIED
```

核心研究判斷：

> **Transaction boundary 應由擁有完整 Business Operation 的那一層決定。**

這已是 runtime Evidence-backed Current Judgment，但仍需在正式平台 architecture work 中明確採納後，才升格為 Platform Decision。

## Evidence

- [`evidence/c-bsa-1-phase-a.md`](../../evidence/c-bsa-1-phase-a.md) — Access / privilege boundary
- [`evidence/c-bsa-1-phase-b.md`](../../evidence/c-bsa-1-phase-b.md) — RPC / operation authorization boundary
- [`evidence/c-bsa-1-phase-c.md`](../../evidence/c-bsa-1-phase-c.md) — database-owned atomic transaction
- [`evidence/c-bsa-1-phase-d.md`](../../evidence/c-bsa-1-phase-d.md) — backend-owned PostgreSQL transaction
- [`evidence/c-bsa-1-consolidated-findings.md`](../../evidence/c-bsa-1-consolidated-findings.md) — A/B/C/D consolidated findings, architecture candidates and future implementation considerations

## Consolidated Result

```text
ACCESS
PostgreSQL object privilege + RLS
→ separable authorization boundaries

OPERATION
Direct table privilege vs approved Function EXECUTE
→ separable operation authorization

TRANSACTION
Multiple Native Data API operations
→ individual operation/request boundaries

One RPC / PostgreSQL Function
→ database-owned transaction

Edge Function PostgreSQL client
→ backend-owned transaction
```

## Architecture Candidates

```text
Independent CRUD
→ Native Data API

Database-contained multi-statement atomic operation
→ RPC / PostgreSQL Function

Backend-orchestrated multi-statement atomic operation
→ Backend-owned PostgreSQL transaction
```

These are Evidence-backed candidates, not a rule that every workload must use one specific pattern.

## Critical Production Notes

Phase D Playground connection authenticated as `postgres`; this proves feasibility only. Production backend-owned transactions require a restricted application DB role, explicit grants, secret lifecycle and connection/pooling governance.

`SECURITY DEFINER` Functions require ownership / `search_path` / EXECUTE / underlying privilege hardening.

Multiple Data API operations must never be treated as one shared transaction merely because application code executes them sequentially.

Caller authentication to Edge Function and database authorization used by Edge Function are separate security boundaries.

See consolidated findings for the complete implementation considerations.

## Why there is no Phase E

C-BSA-1 has answered its core feasibility questions. Isolation levels, deadlocks, retries, savepoints, connection exhaustion, restricted production DB-role design and distributed consistency are legitimate future research topics, but they are distinct production-governance / reliability problems.

They should be opened as focused experiments only when a concrete Nook Works platform requirement creates the decision need. C-BSA-1 therefore stops at Phase D rather than becoming a general PostgreSQL transaction encyclopedia.

## Evidence Discipline

HTTP success、Function invocation success 或 scheduler success 不能單獨作為 authorization / transaction evidence。C-BSA-1 conclusions rely on controlled privilege changes, intentional failures and independent database-state verification.

## Privacy / Provenance

Transaction semantics 只引用 Nook Works repository 中既有 Daily Weather Batch Specification 作為 representative workload。私人、非 repository 的歷史業務程式與內容不得寫入 Playground、Evidence 或後續公開文件。
