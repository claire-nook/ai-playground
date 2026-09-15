# C-BSA-1 — Custom API / Backend Service Database Access

- Started: 2026-09-15
- Overall Status: **In Progress**
- Current checkpoint: **Phase A Verified**
- Representative workload: Nook Works Daily Weather Batch transaction semantics

> 這是 C-BSA-1 的實驗總覽與目前結果入口。完整實驗尚未結束；Phase B、Phase C 尚待驗證。

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
├─ Phase B / Operation Model              PLANNED
│  ├─ Native Data API CRUD
│  ├─ RPC / PostgreSQL Function
│  ├─ EXECUTE privilege
│  └─ SECURITY INVOKER / SECURITY DEFINER
├─ Phase C / Transaction Model            PLANNED
│  ├─ multiple Data API requests
│  ├─ atomic PostgreSQL operation
│  └─ rollback boundary
└─ Phase D / Composed Transaction         OPTIONAL / DEFERRED
```

核心原則目前仍是假說，不是 Platform Decision：

> **Transaction boundary 應由擁有完整 Business Operation 的那一層決定。**

---

## Phase A — Backend Service Access / Privilege Boundary

**Status: VERIFIED — 2026-09-15**

Phase A 已完成 A-1～A-4 runtime verification。完整 checkpoint：[`evidence/c-bsa-1-phase-a.md`](../../evidence/c-bsa-1-phase-a.md)。

### What was verified

使用 synthetic secured table `public.test_bsa_access`，刻意控制 PostgreSQL table grants 與 RLS，透過 Edge Function / Native Data API 分離觀察 object privilege 與 row-level policy。

```text
A-1  service_role SELECT = true
     RLS = ON / no policy
     backend service SELECT → SUCCESS / 2 rows

A-2  service_role SELECT = false
     backend service SELECT → FAIL / permission denied

A-3  anon SELECT = true
     RLS = ON / no policy
     SELECT → SUCCESS / 0 rows

     same identity + same table privilege
     add allow policy
     SELECT → SUCCESS / 2 rows

A-4  INSERT privilege = true  → INSERT SUCCESS
     INSERT privilege = false → permission denied

     UPDATE privilege = true  → UPDATE SUCCESS
     UPDATE privilege = false → permission denied

     DELETE privilege = true  → DELETE SUCCESS
     DELETE privilege = false → permission denied
```

### Phase A Current Judgment

Phase A 的 Evidence 支持以下模型：

```text
Backend / Data API request
        │
        ├─ PostgreSQL Object Privilege
        │    決定 database role 是否可對 object 執行 operation
        │
        └─ Row Level Security (RLS)
             對 non-bypass-RLS identity 再決定可見 / 可操作 rows
```

Backend Service Identity **不等於 unrestricted database access**。即使是 privileged backend client，缺少對應 PostgreSQL object privilege 時，Native Data API operation 仍會被拒絕。

對 non-bypass-RLS identity，table privilege 與 RLS 是可獨立觀察的 authorization boundaries：有 SELECT privilege 不代表一定能看到 rows。

因此「Backend Service 依 component responsibility 取得最小 object / operation privilege」在目前 Supabase 候選架構中具有 runtime feasibility evidence。

這仍是 **Evidence / Current Judgment，不是 Production Architecture Decision**。是否應讓 Business Operation 直接持有 table CUD privilege，或改以 RPC / PostgreSQL Function 的 EXECUTE privilege收斂操作面，交由 Phase B 驗證。

### Phase A Evidence

- [`evidence/c-bsa-1-a1.md`](../../evidence/c-bsa-1-a1.md) — backend service SELECT positive control
- [`evidence/c-bsa-1-a2.md`](../../evidence/c-bsa-1-a2.md) — object privilege SELECT negative control
- [`evidence/c-bsa-1-phase-a.md`](../../evidence/c-bsa-1-phase-a.md) — Phase A consolidated evidence + Current Judgment

---

## Phase B — RPC / PostgreSQL Function Operation Boundary

**Status: PLANNED**

建立 synthetic PostgreSQL Functions，比較 `SECURITY INVOKER`、`SECURITY DEFINER`、caller `EXECUTE` privilege，以及 caller 是否具有 underlying table write privilege。

核心研究問題：Backend Service 能否不直接取得廣泛 table write privilege，而只被允許 EXECUTE 經批准的 database operation？

Phase B 只產生 feasibility / security-boundary evidence，不預先指定 Preferred Pattern。

---

## Phase C — Atomic Business Transaction

**Status: PLANNED**

以 Daily Weather Batch 的 Delete + Insert transaction semantics 建立 synthetic representative case，刻意讓 INSERT 違反 constraint，比較：

```text
Pattern A
Edge Function
→ Native Data API DELETE
→ Native Data API INSERT
```

與：

```text
Pattern B
Edge Function
→ one RPC / PostgreSQL Function call
→ DELETE
→ INSERT
→ success or rollback as one database operation
```

驗收重點不是 API 有沒有回 200，而是 forced failure 後 synthetic database state 是否證明 atomic rollback boundary。

---

## Optional Phase D — Caller-owned / Composed Transaction

**Status: OPTIONAL / DEFERRED**

只有 Phase C 完成後仍具平台決策價值才進行，避免把 C-BSA-1 養成 PostgreSQL Transaction 百科全書。

---

## Evidence Discipline

C-BSA-1 必須保留 successful access、intentionally denied access、RLS / object privilege 差異、RPC INVOKER / DEFINER behavior，以及 forced transaction failure 前後 database state。HTTP success、scheduler invocation success 或 Function invocation success 都不能單獨當成 authorization / transaction evidence。

## Privacy / Provenance

Transaction semantics 只引用 Nook Works repository 中既有 Daily Weather Batch Specification 作為 representative workload。私人、非 repository 的歷史業務程式與內容不得寫入 Playground、Evidence 或後續公開文件。
