# Short-term Work Items

> 無交期。這不是正式開發排程；只保存近期 Research Front 與 deliberate deferred branches。

## Active Research Front — CF-CONNECTOR-1 / Cloudflare Direct Control

- Status: **Candidate / Planning**（2026-10-09；Phase 1–5 尚未執行）
- Experiment Record: [CF-CONNECTOR-1](../experiments/cloudflare-direct-control/README.md)
- Catalog: [Cloudflare experiment entry](../knowledge/experiments.md)
- Purpose: 驗證 AI 能否透過 Cloudflare Connector 直接部署與測試 Worker，並逐步驗證 D1 binding、Cloudflare / Netlify UI shell、跨來源 Browser API 呼叫。這是 iPad + AI-first 的雲端開發協作能力研究，不是正式系統開發。

### Execution queue｜按順序引入變因

1. **Pending — Phase 1:** Connector 直接建立 / 部署 / 測試 API A（無 UI、無 DB、無 Git）；先確認目前 Connector 是否真的提供 Worker deployment / invocation 能力。
2. **Pending — Phase 2:** Cloudflare UI shell 呼叫同一 API A；確認實際 origin 與 Browser 行為。
3. **Pending — Phase 3:** Cloudflare UI shell 呼叫 API B（D1 binding）；在專用測試資料上驗證 DB 路徑。
4. **Pending — Phase 4:** GitHub `public/` → Netlify UI shell 呼叫原 API A；檢查跨來源 / CORS。
5. **Pending — Phase 5:** 同一 Netlify UI shell 呼叫原 API B；驗證跨來源 + D1 路徑。

只建立 **兩支 API（A 無 DB、B 有 D1）與兩種 UI shell（Cloudflare、Netlify）**，不隨 Phase 增加而重建 API。Zero Trust / Cloudflare Access / Authentication 另案處理，避免污染變因。

### Existing baseline / next action

- 已有 Cloudflare Free account、`claire-nook.workers.dev` namespace、測試 D1 `lab-smoke-db`。
- 先前對話交接記錄 Connector OAuth Full access 後可直接執行 D1 SQL CRUD；**不是本次五階段 Worker 實驗的驗證結果**。
- **下一步：** 先確認 Cloudflare Connector 目前的 Worker 操作權限與部署能力，再執行 Phase 1。未取得直接執行證據前，不宣稱可行。
- 每個 Phase 完成或遇到有價值的 Failure Boundary，更新 Experiment Record、`knowledge/experiments.md` 與必要的 `evidence/index.md`；不要把 Pending 寫成 Verified。
- Repo 為公開研究資產，禁止提交 Token、Secret、私密資料。Cloudflare 直接部署的原始碼與設定在形成 Evidence 後應回存 Repo，以免平台與 Git 內容漂移。

---

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