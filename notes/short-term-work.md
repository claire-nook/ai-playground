# Short-term Work Items

> 無交期。這不是正式開發排程；只保存近期 Research Front 與 deliberate deferred branches。

## Current Research Front — Constructible General Platform Baseline

S-SHELL-1、D-BATCH-1、F-QUERY-1、F-DETAIL-1、F-MAINT-1 已提供目前四個常見 internal enterprise application archetype 的第一輪 Evidence / Pattern baseline：

```text
Scheduled / Cron
Query
Query → Detail
Single-record Maintenance
```

Architecture v0.1 已接受 Codex adversarial review（PR #45）；Review 判斷方向可保留，但 minimum authorization / operation / mutation / batch / state / provider contracts 不足以直接當 formal implementation baseline。

Primary 因此把 Research Front 從「Architecture Shape」推進到 **Constructibility Hardening**，而不是繼續堆下一個 UI Prototype。

目前 General baseline：

- `knowledge/platform/application-platform-architecture.md` — Constructible Architecture Baseline Candidate v0.4。
- `knowledge/implementation/operation-contract-guide.md` — Operation Contract minimum construction guidance。
- `knowledge/implementation/pattern-implementation-guide.md` — Query / Detail / Maintenance / Batch 開發 Pattern 實作說明。
- `knowledge/implementation/provider-assumption-register.md` — Supabase / Netlify semantic dependency register。

核心 graduation path：

```text
General Platform Architecture
→ Product / System-specific Platform Architecture
→ Formal Technical Design / Specification
→ Implementation
```

目前文件仍屬 Playground General Platform Knowledge，不是 Nook Works formal production architecture。

---

## Constructibility Definition

可施工不是「架構圖看起來完整」，而是實作者至少不需要自行發明：

- Authorization semantics。
- Operation input / output / error contract。
- Validation authoritative owner。
- Mutation Policy。
- Transaction ownership。
- Batch run / retry / idempotency semantics。
- State ownership / lifecycle。
- Provider-specific security / delivery assumptions。

General baseline 不固定 visual design、component library、class hierarchy 或 framework。

---

## Business Specification ↔ Platform Responsibility

Business Specification 應描述 Business Operation 與必要 functional semantics；Platform 提供 technical interpretation。

```text
Business Specification
        ↓
Business Operation / Pattern
        ↓
Operation Contract
        ↓
Mechanism Eligibility
        ↓
Native Data API / View / RPC / Custom API / DB
        ↓
Authorization / Validation / Transaction / Error / Lifecycle
```

Business Spec 不需要決定「要寫 Edge Function 還是 RPC」，但不能省略會改變 Business correctness 的 decision，例如 mutation overwrite policy、approval requirement、business-state precondition。

---

## UI / Visual Position

Interaction Pattern 已足以支撐 semantic implementation；Visual System 尚未定型不阻擋 General Architecture constructibility。

```text
Architecture Semantics
→ current constructible candidate

Interaction Pattern
→ baseline established

Visual System / Design Tokens / Component appearance
→ deferred / replaceable
```

Pattern Guide 只規定 state/action/feedback/accessibility/responsive obligation，不把 Playground HTML/CSS 當 formal UI contract。

---

## Graduated Baseline

目前可作 General Architecture input：

- Supabase Auth / Session lifecycle。
- Native Data API / View Read。
- Custom API / RPC / direct DB transaction feasibility。
- Backend Service Access / privilege boundary。
- External API orchestration。
- Supabase Cron / Scheduling。
- Application Shell lifecycle。
- Query Pattern。
- Query → Detail / Return Context Pattern。
- Single-record Maintenance Pattern。

重要原則：

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

---

## Current Architecture Contract Queue

v0.4 已把以下項目提升為 General minimum constructibility obligation：

- Authorization semantic contract。
- Operation Contract families。
- Validation classification + mechanism eligibility。
- explicit Mutation Policy declaration。
- Transaction construction constraints。
- Batch run / attempt / overlap / retry / idempotency / outcome minimums。
- Feature-facing Error / outcome certainty contract。
- Record Provenance 與 Audit / Observability 分離。
- State ownership v2：semantic owner vs transport/storage custodian。
- Provider Assumption Register。
- Pattern Implementation Readiness Checklist。

下一步不是自動進 Nook Works production implementation。需要先把 General baseline graduation 到 formal `nook-works` repository，形成 system-specific Platform Architecture / Technical Decisions。

## Deferred / Candidate

- Master-detail / one-to-many / many-to-many Maintenance：等真實 Requirement 挑戰 single-record baseline。
- Workflow / Approval：獨立 Pattern candidate。
- Delete / Void generic Pattern：等 Requirement。
- Advanced Query：Cursor/Keyset、Infinite Scroll、Multi-column Sort、generic Data Grid。
- Full Design System / visual styling。
- Pessimistic locking mechanism。
- Long-running orchestration framework。
- Distributed compensation framework。
- Concurrency / Isolation / Deadlock / Load：等 quantified workload/correctness requirement。
- A-SAFARI-LIFECYCLE intermittent anomaly：只在可取得 diagnostic evidence 時重開。
- P-CODEX-PHONE autonomous dispatch：Deferred by Provider Gap。

Deferred mechanism 不代表 decision point 可省略。Batch 不需要現在做 orchestrator，但 production Batch 不能沒有 retry/idempotency decision。