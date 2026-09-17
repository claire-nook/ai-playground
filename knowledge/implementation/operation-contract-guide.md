# Operation Contract Implementation Guide

> Scope: General Platform constructibility guidance  
> Status: Candidate  
> Not a Nook Works formal API specification

## 1. Purpose

Operation Contract 是 Feature / Scheduler 與 execution mechanism 之間的 semantic seam。

它不是強迫每個 operation 多包一層 service class，也不是要求所有 operation 共用同一 DTO。

目標只有一個：

> 換 implementation mechanism 時，不可以順便換掉 operation semantics，除非 Architecture / Technical Design 明確承認這是一個不同 contract。

---

## 2. Common Invocation Context

每個 operation 至少要有可追蹤 identity：

```text
operationId
correlationId
caller/application context reference
```

其中 caller identity 的 authoritative source 由 trusted boundary 取得；Browser 不得自行宣告「我是誰」當 proof。

---

## 3. Query Operation

Minimum input：

```text
criteria
sort
page / cursor
pageSize
```

Minimum output：

```text
rows
result metadata
stable identity when downstream interaction requires it
```

Minimum contract questions：

- null / omitted / empty semantics？
- allowed sort fields？deterministic tie-breaker？
- page size maximum？
- count 是 exact、estimated、或不提供？
- response 是否完整 bounded page？
- older request 回來時誰阻止 stale result overwrite？
- authorization scope 在哪裡 enforce？

---

## 4. Read Operation

Minimum input：stable record identity。

Minimum outcomes：

```text
Success(record)
NotFound
Forbidden / Concealed NotFound
SessionInvalid
Unexpected
```

Detail 不應假設「能從 Query 點進來」就代表之後永遠有權限讀取。

---

## 5. Mutation Operation

Minimum input：

- stable record identity for Update；
- changed/business fields；
- explicit mutation policy；
- optional version/stale token when policy requires。

Minimum success：

```text
result identity
updated provenance metadata
optional current version token
```

Minimum failure information：

```text
category
stableCode
safeMessage
fieldErrors?
outcomeCertainty
retryable?
correlationId
```

`outcomeCertainty` 至少允許：

```text
not-applied
applied
unknown
```

若 request timeout 後無法證明 DB 是否 commit，不應把它包成普通 `failed` 然後叫 User 再按一次。

---

## 6. Business Operation

Business Operation 用於：

- current authoritative state 決定 mutation 是否允許；
- multi-object atomic invariant；
- business-specific error semantics；
- orchestration 需要比 Native CRUD 更完整的 trusted boundary。

Contract 應描述 business intent，不只描述 table action。

例如：

```text
ApproveClaimAmount
VoidQuotation
RecalculatePolicy
```

比：

```text
update claim_table
```

更接近真正 operation ownership。

---

## 7. Batch Operation

Minimum identity：

```text
operationId
runId
attemptId
correlationId
```

Minimum policy：

- input provenance；
- overlap；
- idempotency / duplicate acceptance；
- timeout；
- retry owner / limit class；
- safe replay；
- durable outcome。

Minimum outcome distinction：

```text
scheduler accepted
transport invoked
operation started
business/data succeeded
business/data failed
outcome unknown
```

不要把 HTTP 200 當作業完成證明。HTTP 200 很努力，但它真的沒有這麼大權力。

---

## 8. Authorization Obligation

Contract 至少要指出：

```text
operation identity
resource / scope subject
trusted enforcement owner
```

Feature Entry、button visibility、Effective Capability 都只是 presentation/input，不是 authorization result。

---

## 9. Validation Obligation

每個 mutation rule 要分類：

| Rule | Early Browser validation | Authoritative enforcement |
| --- | --- | --- |
| format / required | Yes | server/DB as needed |
| cross-field business input | Usually | trusted boundary if correctness matters |
| current-state precondition | advisory only | required |
| uniqueness / invariant | optional precheck | DB / atomic trusted boundary required |

---

## 10. Error Mapping

Provider error 不直接等於 Feature error。

```text
Provider / DB / Network Error
→ Technical Mapping
→ Stable Feature-facing Error
→ UI behavior
```

Feature-facing code 不應依賴 raw PostgREST / PostgreSQL / Edge Function message 來判斷 business flow。

---

## 11. Completion Checklist

一個 Operation Contract 在正式實作前至少要回答：

- [ ] canonical operation identity
- [ ] input semantics
- [ ] output semantics
- [ ] stable identity / version semantics if relevant
- [ ] authorization obligation
- [ ] authoritative validation owner
- [ ] transaction need / owner
- [ ] error categories + stable codes
- [ ] retry / idempotency / outcome certainty where relevant
- [ ] correlation / observability hook
- [ ] cancellation / supersession where relevant
- [ ] selected mechanism and provider assumptions

少一兩個欄位不一定世界末日；不知道誰負責卻直接開寫，通常才是。