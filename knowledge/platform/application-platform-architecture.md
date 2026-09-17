# General Application Platform Architecture

> Status: Constructible Architecture Baseline Candidate v0.4  
> Date: 2026-09-17  
> Scope: General internal-enterprise browser application platform baseline  
> Maturity: Architecture / Pattern / Contract guidance；不是 Nook Works formal production architecture  
> Basis: S-SHELL-1、D-BATCH-1、F-QUERY-1、F-DETAIL-1、F-MAINT-1、兩輪 Implementation-agent adversarial review

## 1. Purpose

本文件回答的是：

> 一個 internal-enterprise browser application platform，至少要有哪些責任邊界與 minimum contracts，才能讓實作者開始施工而不用自行發明安全、狀態、錯誤與 mutation semantics？

它不是 Nook Works production specification，也不直接決定 Supabase / Netlify 的 formal schema、module、role、route 或 deployment configuration。

正式採用關係是：

```text
General Platform Architecture
→ Product / System-specific Platform Architecture
→ Formal Technical Design / Specification
→ Implementation
```

因此本文件允許寫「責任與可施工準則」，但不把目前 Playground provider choice 偽裝成 universal law。

---

## 2. Constructibility Definition

Architecture 達到「可施工」不是因為圖畫完，而是至少同時具備：

```text
Responsibility Boundary
+ Pattern Contract
+ Minimum Operation Contract
+ Security / Validation / Error obligations
+ Mechanism eligibility rules
+ State ownership / lifecycle
+ Implementation Guidance
+ Explicit Open Contracts
```

實作者應可以回答：

- 我現在實作的是哪一種 Pattern？
- 這個 operation 的 input / output / error / lifecycle 是什麼？
- 哪些 rule 只做 interaction feedback，哪些必須 authoritative enforcement？
- Native CRUD / View / RPC / Custom API 何時可用、何時不應使用？
- Authorization 語意在哪裡定義、在哪裡 enforcement？
- state 由誰擁有、多久有效、何時 invalidated？
- provider-specific behavior 到哪一層停止？

「可施工」不等於已完成 visual design、component library 或 production provider profile。

---

## 3. Architecture Principle — Responsibility Before Abstraction

```text
Shared technical lifecycle / invariant
→ Platform responsibility candidate

Business-operation semantics
→ Feature / Requirement

Feature-facing operation contract
→ explicit seam

Execution / storage mechanism
→ technical selection

Library / component / framework
→ implementation detail unless responsibility requires standardization
```

Common Pattern 不等於 Common Page、Common Class 或 Auto-generated UI。

---

## 4. Two Orthogonal Views

### 4.1 Application Lifecycle View

```text
Browser Entry / Deep Link
→ Application Shell
→ Authentication / Session
→ Application User Context
→ Route / Feature Entry
→ Feature Activation
→ Active Feature
```

Shell 擁有 application-wide lifecycle；Feature business state 不因被 Shell 包住就變成 global state。

### 4.2 Business Operation View

```text
Feature / Scheduler Invocation
→ Business / Feature Operation Contract
→ Selected Execution Mechanism
→ Trusted Enforcement / Backend
→ Data / External Dependency
→ Classified Outcome
```

Feature Activation 與 Operation Contract 是不同 seam。前者處理 application control transfer；後者處理一次 business/data operation。

---

## 5. Application Shell Contract

Shell minimum responsibility：

- Authentication / Session restore / refresh / invalidation / explicit logout。
- Authentication Identity → Application User Context bootstrap。
- Application eligibility。
- Navigation / Route / Feature Entry。
- deep link / reload / Back / Forward integration。
- browser-safe runtime configuration boundary。
- session-invalid escalation 與 shell-level fatal state。

Shell 不擁有：

- Query criteria/result。
- Form draft / dirty state。
- Business validation semantics。
- Business Authorization decision。
- workflow state。
- batch run state。

### 5.1 Feature Activation minimum obligations

Feature Activation 不要求 `FeatureRuntime` class，但必須定義：

- canonical Feature identity / route context；
- current Application User Context access；
- authenticated invocation dependency，必須取得 current auth context，不由 Feature 長期保存 credential snapshot；
- activation / supersession / disposal owner；
- late-result suppression / abort ownership；
- session-invalid signal → Shell。

Feature 不負責 Auth refresh，也不應把 token persistence 變成自己的 lifecycle。

---

## 6. Baseline Interaction Patterns

目前 baseline coverage：

```text
Scheduled / Batch
Query
Query → Detail
Single-record Maintenance
```

Master-detail / one-to-many / many-to-many、Workflow / Approval、Advanced Query、Distributed Compensation 都保持 requirement-driven extension。

### 6.1 Query

```text
Feature Identity
→ Criteria
→ Query Action
→ Filter / Sort / Page
→ Bounded Result + Metadata
→ Result Interaction
```

Minimum semantics：criteria、sort、page、pageSize、loading、empty、recoverable error、bounded result、stable identity when downstream interaction requires it。

### 6.2 Query → Detail

```text
Query Context
→ Stable Record Identity
→ Read Detail
→ Return
→ Restore useful work context
```

`Query Context ≠ old page number`。

Exact current-rank resolution 仍是 Open Contract。Baseline 只要求 deterministic fallback：refresh current query；若 anchor 仍存在則 highlight / relocate；不存在、失權限或離開 result 時提供明確 outcome，不做昂貴全表 rank scan 假裝 architecture 已解。

### 6.3 Single-record Maintenance

```text
Query / Worklist
├─ Read   → Return        → Query Context
├─ Create → Save / Cancel → Query Context
└─ Update → Save / Cancel → Query Context
```

Minimum semantics：Effective Capability、editable/immutable/read-only field state、validation lifecycle、dirty state、unsaved-change guard、Save/Cancel、Mutation Policy、return context。

### 6.4 Scheduled / Batch

```text
Schedule / Manual Trigger
→ Invocation Adapter
→ Batch Operation Contract
→ Backend Operation
→ Outcome Recording
```

Batch 與 Browser 不共享 UI lifecycle，但若 semantic Business Operation 相同，應重用同一 authoritative operation，而不是各自發明 validation / authorization / transaction semantics。

---

## 7. Operation Contract Families

不建立一個萬用 DTO。至少分成：

- Query Operation
- Read Operation
- Mutation Operation
- Business Operation
- Batch Operation

共同 minimum envelope：

```text
Invocation Context
+ Operation Identity
+ Operation-specific Input
→ Success | Failure
```

每一個 contract 必須顯式定義：

- input representation / nullability / normalization；
- output shape / stable identity；
- authorization obligation；
- authoritative validation owner；
- transaction need / owner；
- error classification；
- correlation identity；
- cancellation / supersession when relevant；
- retry / idempotency when relevant；
- outcome certainty for mutation (`not-applied / applied / unknown`) when relevant。

詳細施工規格見 `knowledge/implementation/operation-contract-guide.md`。

---

## 8. Authorization Contract

Architecture 只保留必要 semantic contract，不在 General layer 決定 RBAC/RLS schema。

Minimum decision input：

```text
Authenticated Subject
+ Application User Context
+ Operation Identity
+ Resource / Scope Inputs
→ Authoritative Authorization Decision
```

Minimum obligations：

1. Browser visibility / Feature Entry / Effective Capability 不是 authoritative proof。
2. trusted boundary 必須知道真正 caller / service identity。
3. operation permission 與 row/scope authorization 不得只靠 Browser 傳入的 claim。
4. deny-by-default 行為要明確。
5. provider enforcement（grant / RLS / RPC / backend policy）可以不同，但 semantic obligation 不變。
6. `session-invalid`、`forbidden`、`not-found` 是否刻意 conceal record existence 要由 system-specific policy 決定。

正式 Product Architecture 必須把這些 semantics 映射到自己的 identity / role / scope / provider profile。

---

## 9. Validation and Mutation Eligibility

每個 mutation 必須把 rule 分成三類：

```text
Interaction / Input Rule
→ Browser may validate early

Authoritative Business Precondition
→ trusted boundary must validate against current authoritative state

Database Invariant
→ DB constraint / trusted data boundary
```

Browser validation 可以重複提示，但不能取代 authoritative enforcement。

### 9.1 Native CRUD eligibility

Native CRUD 只有在以下條件成立時才是安全 candidate：

- caller authorization 可由 approved data-access profile enforcement；
- mutation invariants 可由 grants / RLS / constraints / atomic row predicate 完整保護；
- 不需要跨多筆 / 多物件 atomic business rule；
- 不需要 current-state-dependent rule 的 custom error semantics；
- mutation policy 已明確宣告。

任一條不成立，就升級成 RPC / Custom Operation / backend-owned transaction candidate。

### 9.2 Mutation Policy

Concurrency handling 必須是 explicit decision，不再由 omission 自動變成 Platform Default。

允許：

```text
Last Write Wins
Stale-update Detection
Business-state-sensitive Mutation
```

普通低風險 Feature 可以選 `Last Write Wins`，但需在 Feature / Technical Design 顯式記載「overwrite impact accepted」。

`created_at/by`、`updated_at/by` 只是 Record Provenance Metadata，不是 silent overwrite 的 mitigation，也不是完整 Audit Trail。

---

## 10. Transaction Ownership

原則保留：

> Transaction 由擁有完整 semantic Business Operation 的 trusted layer 持有。

施工順序必須是：

```text
先定義 Business Operation invariants / effects
→ 再選 transaction owner
→ 再選 mechanism
```

Minimum prohibitions：

- Browser 不擁有 multi-call DB transaction。
- Sequential Data API calls 不可被當成 atomic transaction。
- 不在 DB transaction 中持有 slow external I/O。
- Backend-owned transaction 必須有 connection / timeout / cleanup / restricted identity governance。
- external side effect + DB consistency 需要 explicit idempotency / recovery / compensation decision。

---

## 11. Batch Minimum Contract

只要 Batch 要進 production，不論 scheduler 多簡單，至少必須定義：

- stable Operation Identity；
- logical Run Identity；
- Attempt Identity；
- overlap policy；
- idempotency policy，或明確接受 at-most-once / duplicate risk；
- timeout；
- retry owner / limit / backoff policy class；
- input provenance；
- outcome recording；
- correlation；
- safe manual replay behavior；
- scheduler success / transport success / business success 的分離。

Exact retry 次數與 long-running orchestration 可以等 Requirement；decision points 本身不能 deferred。

---

## 12. Error Contract

General top-level categories可維持簡潔，但每個 Feature-facing failure 至少應提供：

```text
category
stableCode
safeMessage / safeDetails
fieldErrors? 
retryable?
outcomeCertainty?
correlationId?
```

Candidate categories：

- validation
- session-invalid
- forbidden
- not-found
- conflict / stale-state
- boundedness
- cancelled / superseded
- dependency / backend failure
- unexpected

Raw provider diagnostics 不直接顯示給 User。

對 Mutation，timeout / transport failure 之後若無法判斷是否已 commit，必須回 `unknown` outcome，而不是鼓勵 User 無腦重按。

---

## 13. Record Provenance vs Audit vs Observability

Baseline common metadata：

```text
created_at / created_by
updated_at / updated_by
```

正式名稱：**Record Provenance Metadata**。

它只回答「這筆目前資料最後由誰/何時建立與修改」。

它不等於：

- immutable change history；
- approval history；
- security audit；
- access audit；
- compliance retention；
- operational logs / traces / metrics。

Provenance actor 必須由 authoritative boundary 取得，不能信任 Browser 自填。

---

## 14. State Ownership v2

State 必須區分 semantic owner 與 transport/storage custodian。

| State | Semantic owner | Typical custodian | Invalidation |
| --- | --- | --- | --- |
| Session | Shell/Auth lifecycle | Auth provider/browser storage | logout / invalidation / expiry |
| Application User Context | Shell | memory/cache | session/user-context change |
| Route / Feature Entry | Shell | router/history | navigation |
| Query criteria/sort/page | Query Feature | memory / optional URL/history | new query/reset/leave policy |
| Query result | Query Feature | memory/cache | criteria/sort/page/auth change |
| Request abort/supersession | active operation | browser/runtime | new request/leave/session change |
| Detail stable identity | Detail/Query interaction | route or feature state | navigation/auth change |
| Return anchor/context | Query/Detail interaction | feature/history transport | query context invalidation |
| Form draft/dirty | Maintenance Feature | memory | save/cancel/discard |
| Loaded record/version snapshot | Maintenance Feature | memory | reload/save/conflict |
| Validation errors | Feature | memory | edit/revalidate/new operation |
| Save outcome certainty | active mutation | feature/operation result | resolved/reload |
| Authorization decision | trusted boundary | server/DB/provider policy | identity/scope/policy change |
| Batch logical run | Batch operation | durable backend state | terminal outcome |
| Batch attempt | Batch runtime | durable backend state | attempt completion |

URL/history 可以承載 state，不因此取得 semantic ownership。Sensitive criteria 不應因方便而無條件序列化進 URL。

---

## 15. Provider Assumption Boundary

General Architecture 不追求「假裝 provider-neutral」。

真正要求是：

> SDK 可以替換不代表 semantics 可以替換。只有 replacement 保持 operation / authorization / consistency / lifecycle contract 時，mechanism 才算可替換。

Provider-specific assumptions 應集中登記，不偷藏在 Feature code。見：

`knowledge/implementation/provider-assumption-register.md`

---

## 16. Implementation Guidance Boundary

Architecture 與 Pattern contract 決定 WHAT / WHO / MINIMUM OBLIGATIONS。

Implementation Guidance 負責 HOW within allowed choices，例如：

- Feature 應持有哪些 state；
- operation invocation flow；
- mechanism selection checklist；
- error mapping；
- accessibility / responsive obligations；
- tests / acceptance baseline。

它不固定：

- final visual design；
- color / typography / spacing；
- exact component library；
- mandatory filename/class hierarchy；
- universal service/repository layer。

Pattern Implementation Guide：

`knowledge/implementation/pattern-implementation-guide.md`

---

## 17. Visual Design Boundary

目前 Visual System / Design Language 尚未定型，不阻擋 Architecture Constructibility。

```text
Architecture Semantics
→ stable enough for implementation guidance

Interaction Pattern
→ baseline candidate established

Visual System / Design Tokens / Component appearance
→ replaceable / deferred
```

Pattern 只規定 presentation obligation：哪些 state/action/feedback 必須能被使用者理解；不規定現在 Playground Prototype 的 HTML/CSS 就是 formal UI contract。

---

## 18. Deferred Extensions

保持 deferred：

- Master-detail / one-to-many / many-to-many Maintenance。
- Workflow / Approval。
- Delete / Void generic pattern。
- Cursor/Keyset / Infinite Scroll / generic Data Grid。
- full Design System。
- pessimistic locking。
- long-running orchestration framework。
- distributed compensation framework。

但「deferred mechanism」不等於「decision point 可以省略」。例如 Batch 可以不做 orchestrator，但不能沒有 retry/idempotency decision。

---

## 19. Constructibility Gate

一個 Feature / Batch 可以進入 formal implementation 前，至少應能回答：

```text
Pattern?
Operation Contract?
Authorization semantics?
Validation classification?
Execution mechanism eligibility?
Transaction owner?
Error contract?
State ownership/lifetime?
Mutation or retry/idempotency policy?
Provider assumptions?
Acceptance/test obligations?
```

若回答是「PG 到時候自己看著辦」，那不是 agile，是 architecture 漏水。

---

## 20. Current Judgment

v0.4 將 General Platform 從 Architecture Shape 推進到 **Constructible Baseline Candidate**：

```text
Architecture Shape
→ Minimum Constructible Contracts
→ Pattern Implementation Guidance
→ Product-specific Platform Architecture
```

它仍不是 Production Rule，也沒有替 Nook Works 做正式 provider/security/module/schema 決策。

下一個合理 graduation step 是把這份 General baseline 帶入 formal Nook Works repository，形成真正的 Nook Works Platform Architecture，而不是繼續把 Playground 當正式系統祖厝。
