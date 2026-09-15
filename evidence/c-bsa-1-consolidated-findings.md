# C-BSA-1 — Consolidated Findings

- Date: 2026-09-15
- Research Status: **CORE EXPERIMENT COMPLETE**
- Phases: A / B / C / D **VERIFIED**
- Parent experiment: [`experiments/custom-api/c-bsa-1.md`](../experiments/custom-api/c-bsa-1.md)

## 這份文件要回答什麼

C-BSA-1 一開始是在研究 Supabase Edge Function 作為 Backend Service 時，究竟應該怎麼存取 PostgreSQL。實驗做到最後，問題其實被拆成三個彼此不同、但會一起影響平台設計的 boundary：

```text
Access Boundary
誰可以存取哪些 database objects / operations？
        ↓
Phase A

Operation Boundary
能不能允許 Backend 執行一個 approved Business Operation，
但不允許它直接修改 underlying table？
        ↓
Phase B

Transaction Boundary
一個 multi-statement Business Operation 需要 atomicity 時，
應該由哪一層持有完整 transaction？
        ↓
Phase C + Phase D
```

這份文件把 A / B / C / D 的 Evidence 統整成未來 Nook Works platform design 可以直接使用的 Architecture Candidates 與 implementation considerations。

它是 **Evidence-backed Current Judgment**，不是自動生效的 Platform Standard。實驗證明某個 pattern 可行，不代表人類從此必須信奉它。

---

## Phase A — Access Boundary

### 驗證結果

PostgreSQL object privilege 與 Row Level Security（RLS）是兩個可以分開控制、分開觀察的 authorization boundaries。

Backend Service Identity 並不等於 unrestricted database access。Native Data API 的 SELECT / INSERT / UPDATE / DELETE 仍可透過 PostgreSQL grants 個別允許或拒絕；對不具備 RLS bypass 能力的 identity 而言，就算已經取得 table privilege，也不代表一定能看到或操作所有 rows。

### 對平台設計的意義

Backend component 即使屬於 trusted server-side code，也不應因此自動取得 blanket database privilege。仍然可以依責任範圍設計 least privilege：

```text
Backend identity
   ↓
Object privilege
   ↓
RLS（若此 access path 適用）
   ↓
實際允許的 data operation
```

換句話說，Phase A 證明「這是 Backend」不是一張 PostgreSQL 無限通行證。

---

## Phase B — Operation Boundary

### 驗證結果

Backend Service 可以沒有 direct table UPDATE privilege，但取得某個 approved PostgreSQL Function 的 EXECUTE privilege。

在 `SECURITY DEFINER` pattern 下，Function 可以執行被允許的 constrained modification；同一個 caller 若改用 Native Data API 直接 UPDATE underlying table，仍然會被拒絕。當 Function EXECUTE privilege 被移除後，approved operation 本身也會被拒絕。

因此 authorization 可以明確區分：

```text
允許直接修改這張 table
```

與：

```text
允許執行這個 approved Business Operation
```

### 對平台設計的意義

RPC / PostgreSQL Function 可以形成 operation-level authorization boundary。當平台真的需要「只能做這件事，不能任意改 underlying data」時，這是一個已經被 runtime evidence 驗證過的 candidate。

但這不代表 ordinary CRUD 應該全部包成 RPC。把每一個 SELECT 都穿上 Function 外套，並不會因此突然比較有 architecture。

### Important Limitation

`SECURITY DEFINER` 是 privileged code。Production implementation 必須明確處理 Function owner、safe `search_path`、schema reference、EXECUTE grants、Function body scope，以及 underlying object privilege。

尤其不應讓 privileged write Function 因為 default grant 而意外開放給不需要的 roles。

---

## Phase C — Database-owned Transaction

### 驗證結果

多個 separate Native Data API operations 不會因為 application code 依序呼叫，就自動形成一個 shared rollback boundary。

C-1 中，DELETE 已經完成並 commit，後續獨立 INSERT 發生 database constraint failure 時，前面的 DELETE 不會跟著 rollback，因此產生 partial state。

相對地，當 DELETE + INSERT 被封裝在 one RPC / PostgreSQL Function 中：

- database constraint failure 會 rollback 前面的 DELETE；
- explicit Business Logic exception 也會 rollback 前面的 DELETE；
- success path 則會完整 commit DELETE + INSERT replacement。

### 對平台設計的意義

如果完整 Business Operation 本來就適合存在 database logic，而且其中多個 SQL statements 必須一起成功或一起失敗，那麼 PostgreSQL Function 可以持有完整 transaction boundary：

```text
Backend
   ↓ one RPC
PostgreSQL Function
   ├─ statement A
   ├─ statement B
   └─ complete transaction boundary
```

Phase C 證明的是 **Database-owned Transaction** pattern 可行，而不是證明「所有 Business Logic 都應該搬進 PostgreSQL」。這個差異正是 Phase D 要補上的拼圖。

---

## Phase D — Backend-owned Transaction

### 驗證結果

Edge Function 可以使用 PostgreSQL client，經由 Supabase Transaction Pooler 建立 database connection，並由 Backend Service 自己持有 multi-statement transaction。

Failure control：

```text
BEGIN
DELETE OLD
Business Logic exception
ROLLBACK
→ OLD preserved
```

Success control：

```text
BEGIN
DELETE OLD
INSERT NEW-D
COMMIT
→ NEW-D persisted
```

兩條 path 都經過 independent DB verification，因此不是只相信 Edge Function 自己回報 success / failure。

### 對平台設計的意義

當完整 Business Operation 的 orchestration 屬於 Backend Service 時，不需要只為了取得 atomicity，就強迫把整個 operation 搬進 PostgreSQL Function。

Backend 可以自己持有 PostgreSQL transaction：

```text
Backend Service
   ├─ application / Business Logic
   ├─ BEGIN
   ├─ database statement A
   ├─ database statement B
   └─ COMMIT / ROLLBACK
```

這建立了與 Phase C 不同的 transaction ownership pattern：Phase C 是 Database owns transaction；Phase D 則是 Backend Service owns transaction。

### Important Limitation

Phase D Playground probe 使用的 database identity 是 `postgres`。

這只能證明 **technical feasibility**，不能證明目前 credential design 適合 Production。若 Nook Works 正式採用 Backend-owned Transaction，必須另外建立 restricted application DB role，重新設計 grants、secret lifecycle 與 connection governance。

否則 Phase A 辛苦證明 least privilege，Phase D 一進門就拿 `postgres` 萬能鑰匙，前面的研究會顯得非常有喜劇效果。

---

# Evidence-backed Architecture Candidates

## Candidate 1 — Native Data API for Independent CRUD

當 Business Operation 本質上就是一個 independent CRUD operation，而且不需要跨多個 database statements 的 caller-owned atomicity，Native Data API 是最簡單的 candidate。

```text
Business Operation
≈ one independent CRUD operation
        ↓
Native Data API
```

這個 pattern implementation 較簡單，不需要自己管理 PostgreSQL connection，也能直接使用 PostgreSQL grants / RLS boundary。

最重要的限制是：**不要把多個 Data API calls 排在一起，就想像它們已經變成同一個 transaction。**

## Candidate 2 — RPC for Database-contained Atomic Operation

當完整 Business Operation 自然屬於 database logic，而且多個 SQL statements 必須 atomic，RPC / PostgreSQL Function 是已驗證的 candidate。

```text
Backend
   ↓ EXECUTE approved Function
Database-owned Business Operation
   ↓
Atomic transaction
```

這個 pattern 可以同時取得 operation-level authorization 與 database-owned transaction，但也代表平台需要治理 Function privilege、`SECURITY DEFINER` hardening 與 database logic lifecycle。

## Candidate 3 — Backend-owned PostgreSQL Transaction

當 Business Operation 的 orchestration 應該留在 Backend application logic，但其中數個 database statements 又必須一起 commit / rollback，可以考慮由 Backend Service 使用 PostgreSQL client 持有 transaction。

```text
Backend Business Operation
   ├─ application logic
   ├─ BEGIN
   ├─ database statement A
   ├─ database statement B
   └─ COMMIT / ROLLBACK
```

這樣可以避免只為 atomicity 就把 application orchestration 搬進 PostgreSQL；代價則是 Backend 必須開始負責 database credential、connection、pooling、transaction lifecycle 與 error cleanup。

---

# Transaction Ownership Selection Model

```text
Business Operation 是否需要多個 DB statements
一起 commit / rollback？

NO
│
└─ Native Data API 是最簡單的 candidate。

YES
│
├─ 完整 operation 是否自然屬於 database logic？
│     │
│     └─ YES → RPC / PostgreSQL Function
│              Database owns transaction
│
└─ orchestration 是否屬於 Backend Service？
      │
      └─ YES → Backend-owned PostgreSQL Transaction
               Backend owns transaction
```

因此真正的 selection question 不是：

> 「我們比較喜歡哪一種 API？」

而是：

> **哪一層擁有完整的 Business Operation？**

C-BSA-1 的 runtime evidence 已經相當完整地支持目前 working principle：

> **Transaction boundary 應由擁有完整 Business Operation 的那一層決定。**

這個 principle 現在有 runtime comparison 支撐，但仍應等正式 Nook Works architecture work 明確採納後，再升格為 Platform Decision。

---

# Future Platform Implementation Considerations

## 1. 每一種 pattern 都必須維持 least privilege

Phase D 不能把 Phase A 作廢。如果 Backend Service 使用 PostgreSQL client direct database access，Production 必須建立 restricted application DB role，而不是使用 `postgres` 或其他 broad owner credential。

這個 role 只應取得該 Backend responsibility 真正需要的 schema / table / sequence / Function privileges。

## 2. Endpoint Authentication 與 Database Identity 必須分開設計

「誰可以呼叫 Edge Function」與「Edge Function 用什麼 database identity 操作 PostgreSQL」是兩個不同的 security decisions：

```text
Caller → Edge Function authentication
≠
Edge Function → PostgreSQL authorization
```

Caller secret 再強，也不能補償一個權限過大的 database credential。

## 3. RLS bypass 不等於 universal database privilege

RLS 與 PostgreSQL object privilege 是不同 controls。某個 Backend identity 即使可以 bypass RLS，也不代表 object grants 就應該無限制開放。

平台設計時應明確知道目前 access path 到底依靠哪些 authorization boundaries，而不是把「Backend」當成一種神秘免死金牌。

## 4. `SECURITY DEFINER` 必須當 privileged code 管理

Production Function 應明確控制 owner、`search_path`、schema references、EXECUTE grants 與 underlying object privileges。

若 Function 會執行 privileged writes，應避免不必要的 `PUBLIC` EXECUTE。

## 5. Ordinary CRUD 不要沒有理由地 RPC-ify

RPC 應該因為 operation boundary、transaction boundary、database-local computation 或其他具體需求而存在。

單純 table read / independent CRUD 不會因為多包一層 Function 就自動變成比較高級的 architecture。

## 6. Multi-request Data API sequence 不是一個 transaction

如果 Business Operation 不允許 partial state，就不能用 several independent Data API operations 假裝它們共享 atomicity。

需要 atomicity 時，transaction boundary 必須移到 one database operation，或由 Backend-owned PostgreSQL transaction 持有。

## 7. Backend-owned Transaction 會帶來額外 operational responsibility

一旦 Backend Service 自己使用 PostgreSQL client，就必須明確處理 connection string secret、restricted DB role、connection pooling、transaction lifetime、timeout、error cleanup 與 connection release。

對 Supabase Edge / serverless deployment 而言，connection strategy 必須符合 platform pooler 與 client behavior。Phase D 使用 Transaction Pooler-compatible settings 驗證 feasibility；Production implementation 仍需依正式 deployment model 做 hardening，而不能把 Playground probe 原封不動搬家。

## 8. Transaction 應盡量保持短小

不要在 PostgreSQL transaction 裡等待 slow external API，更不能等 human interaction。

External I/O 與 database atomic section 應盡量拆開。如果未來 Business Operation 要求 PostgreSQL 與 external service 之間也必須「一起成功或一起失敗」，那已經是 distributed consistency problem，不屬於 C-BSA-1 已驗證的 transaction model。

## 9. Error Handling 要反映 Business Operation semantics

HTTP status、Edge Function invocation success 與 database transaction success 是不同概念。

Production API 應該明確區分 validation failure、authorization failure、business rejection、database failure 與 unexpected backend failure，而不是直接沿用 Playground 為了觀察方便所使用的 experimental `500` response mapping。

## 10. Reliability research 應由真實 workload 觸發

Isolation level、concurrent writers、deadlock、retry、savepoint、connection exhaustion、performance benchmark 都是合理的研究題目，但目前沒有必要硬塞進 C-BSA-1。

當某個 Nook Works workload 真正需要這些 decisions 時，再開 focused experiment。研究要解決問題，不需要靠長度證明自己努力過。

---

# Research Boundary — C-BSA-1 沒有決定什麼

C-BSA-1 **沒有**證明或決定：

- 所有 writes 都應使用 RPC；
- 所有 Backend Services 都應使用 PostgreSQL client direct connection；
- 每一條 backend access path 都應該或不應該使用 RLS；
- `postgres` 是可接受的 application identity；
- 每一個 Business Operation 都必須包成 one SQL transaction；
- external API operation 可以被 PostgreSQL rollback；
- 平台應該不看 workload 就統一採用單一 transaction pattern。

C-BSA-1 真正提供的是：**把可用的 Access / Operation / Transaction boundaries 驗證清楚，讓後續 architecture decision 不需要靠猜。**

---

# Final Research Judgment

C-BSA-1 最後驗證出 Nook Works backend architecture 可以分成三個彼此獨立思考的 design dimensions：

```text
ACCESS
PostgreSQL privilege + RLS

OPERATION
Direct object operation
vs approved Function EXECUTE

TRANSACTION
Request-owned
vs Database-owned
vs Backend-owned
```

因此平台不需要發明一套「所有 Backend 都只能用同一種 database access pattern」的萬用教條。

比較合理的方向是：依 component responsibility、Business Operation semantics 與 atomicity requirement，選擇 Native Data API、RPC / PostgreSQL Function 或 Backend-owned PostgreSQL Transaction，同時維持 least privilege。

**Research Conclusion：**C-BSA-1 的 core feasibility questions 已經回答完成。後續只有在具體 Platform Decision 需要更多 Evidence 時，才另開 production governance / reliability focused experiment。
