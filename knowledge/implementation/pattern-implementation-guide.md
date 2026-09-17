# Pattern Implementation Guide

> Scope: General Platform implementation guidance  
> Status: Candidate  
> Visual design system is intentionally not fixed here

## 1. Purpose

這份 Guide 把 Pattern contract 轉成「實作者可以開始切功能」的 minimum implementation guidance。

它不指定 framework、class hierarchy、component library、檔名或最終 UI 美術。

---

## 2. Shared Feature Rules

所有 interactive Feature baseline：

- Shell 提供 route / Feature Activation / Application User Context。
- Feature 擁有自身 business interaction state。
- Feature 呼叫 Operation Contract，不直接把 provider diagnostics 當 business semantics。
- session-invalid 回 Shell；forbidden / validation / conflict 等留在 Feature operation lifecycle。
- 新 operation 取代舊 operation 時，舊結果不得覆蓋新 state。
- accessibility、touch usability、loading / empty / error / success feedback 必須可理解。
- Visual component appearance 可替換，不是 Pattern Contract。

---

## 3. Query Pattern

### Feature-owned state

```text
criteria
sort
page / cursor
pageSize
loading
result
error
activeRequest identity
```

### Implementation flow

```text
User edits criteria
→ functional validation
→ submit
→ cancel/supersede older request semantics
→ invoke Query Operation
→ classified result
→ render bounded result / empty / error
```

### Minimum tests

- criteria reset / submit；
- deterministic sort + pagination；
- page-size change behavior；
- empty result；
- validation error；
- forbidden/session-invalid；
- late old response 不覆蓋較新的 query；
- provider row limit 不被誤當完整結果。

---

## 4. Query → Detail Pattern

### Query context minimum

```text
criteria
sort
pageSize
current paging state
stable record identity
optional focus/scroll hint
```

### Return flow

```text
Detail Return
→ restore query semantics
→ refresh/re-resolve bounded result
→ anchor found: relocate/highlight
→ anchor absent/out-of-scope/forbidden: explicit fallback + notice
```

不要承諾 exact rank restoration，除非正式 backend contract 已提供 bounded resolution。

### Minimum tests

- normal return；
- result ordering changed；
- selected record disappeared；
- selected record no longer matches criteria；
- selected record no longer authorized；
- page size / criteria context preserved per policy；
- Browser Back / reload behavior符合 formal route design。

---

## 5. Single-record Maintenance Pattern

### Feature-owned state

```text
mode: read/create/update
draft
baseline snapshot
loaded identity/version if relevant
dirty
validation errors
save state
save outcome certainty
return context
```

### Entry

```text
Worklist
├─ Read
├─ Create
└─ Update when Effective Capability allows
```

Browser Effective Capability 只控制 interaction，不是 backend authorization proof。

### Save eligibility

施工前先分類：

```text
simple invariant-safe mutation
→ Native CRUD candidate

stale detection required
→ conditional update / custom operation

current business state decides validity
→ Business Operation / RPC / Custom API

multi-object atomic invariant
→ DB-owned or backend-owned transaction
```

### Cancel / dirty

- Cancel 回 Worklist context。
- meaningful dirty state 離開前需 guard。
- Browser/tab close guard 能力依 runtime 限制實作，不假裝所有離開都可完全攔截。

### Minimum tests

- Create validation / success / cancel；
- Update field state：editable / immutable / readonly；
- dirty guard；
- Save success → Worklist；
- record 修改後離開 current criteria；
- authorization/record state changed before Save；
- declared Mutation Policy 行為；
- timeout/unknown outcome recovery strategy；
- provenance actor 不由 Browser 任意寫入。

---

## 6. Batch Pattern

### Durable state minimum

```text
operationId
runId
attemptId
input provenance
started/finished timestamps
outcome
correlation
```

### Execution flow

```text
Schedule / Manual Replay
→ establish run identity
→ apply overlap policy
→ validate input provenance
→ invoke authoritative operation
→ record attempt outcome
→ retry or terminate by explicit policy
```

### Minimum tests

- normal scheduled run；
- duplicate trigger；
- overlap；
- timeout before/after side effect boundary；
- retry；
- manual replay；
- scheduler success but business failure；
- external dependency failure；
- idempotent or explicitly accepted duplicate behavior。

---

## 7. Mechanism Selection Checklist

選 Native Data API / View / RPC / Custom API / direct DB 前問：

1. authorization 能否在該 mechanism authoritative enforce？
2. validation 是否依賴 current authoritative state？
3. operation 是否需要 transaction？
4. error semantics 是否需要 business-specific mapping？
5. 是否有 external side effect？
6. retry / idempotency 是否會改變 correctness？
7. provider behavior 是否已登記並足以支撐 contract？

「比較快寫」不是第 8 條。它可以是成本考量，但不能吃掉前七條。

---

## 8. UI / Visual Boundary

正式 UI 還沒磨出 visual language 時，Implementation 仍可以進行 semantic skeleton：

```text
state regions
action semantics
feedback obligations
responsive behavior
accessibility
```

不要在 General Pattern Guide 固定：

- exact spacing；
- colors；
- typography；
- card/table skin；
- button shape；
- component framework。

當 Product Design System 成熟後，可在不改 Pattern semantics 的前提下替換 presentation implementation。

---

## 9. Implementation Readiness Checklist

Feature 開始施工前：

- [ ] Pattern 已選定
- [ ] Business fields / operations 有 Specification
- [ ] Operation Contract 已具體化
- [ ] Authorization semantic owner 明確
- [ ] Validation rules 已分類
- [ ] Execution mechanism 通過 eligibility check
- [ ] Transaction owner 明確或確定不需要
- [ ] Error / outcome contract 明確
- [ ] State ownership / lifetime 明確
- [ ] Mutation policy 或 Batch retry/idempotency policy 明確
- [ ] Provider assumptions 已記錄
- [ ] Test / acceptance cases 已列出

這份 Checklist 的用途不是讓文件變胖，是避免 PG 在開發時被迫當臨時 SA + 架構師 + 資安官三合一。