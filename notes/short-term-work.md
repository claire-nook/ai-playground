# Short-term Work Items

> 無交期。這不是正式開發排程；只保存近期 Research Front 與 deliberate deferred branches。

## Current Research Front — Business Feature → Technical Platform Pattern

S-SHELL-1 已於 2026-09-16 完成，Application Shell lifecycle 不再是 current technical blocking gap。Consolidated Findings：`evidence/s-shell-1-application-shell-findings.md`。

下一個 Research Front 不是先做 UI Design System，也不是先決定 Table、按鈕、Dialog 等視覺 / component pattern。目標是從 Nook Works 可預期的 Business / Functional Requirement 出發，補上過去由 Technical Leader / Framework 承擔的 technical decomposition，形成可重用的 Technical Platform Pattern。

```text
Business / Functional Requirement
→ Interaction Semantics
→ Technical Responsibility Decomposition
→ Platform Pattern Candidate
→ Existing Evidence Mapping
→ Gap / Open Decision
→ 必要時才開 Minimal Experiment
```

Claire 可以繼續用企業系統 SA 熟悉的語言描述需求，例如單檔維護、主從維護、條件查詢、查詢後進明細、唯讀、修改存檔、刪除、批次操作、權限差異、回查詢頁保留條件；Primary Agent 的責任是把這些 Functional Pattern 對應到 technical layer，而不是要求 Business Specification 自己決定底層架構。

### Business Specification ↔ Platform responsibility

Business Specification 應描述 Business Operation 與必要 contract；Platform 應提供穩定的 technical interpretation。

例如，同樣是畫面上的 `Save`：

- 單純單一資料物件維護，可能對應 Standard Maintenance / Native CRUD。
- 有 feature-specific business rule 的作業，可能由 Business Spec 指向明確 Custom API 與 input contract。
- 跨物件、必須 all-or-nothing 的 operation，可能需要 Custom API / RPC 與明確 Transaction Owner。

Business Spec 不需要因此描述 Edge Function、PostgreSQL Client 或 transaction implementation detail；這些由 Platform Pattern / Technical Contract 決定。

```text
Business Specification
        ↓
Business Operation Contract
        ↓
Platform Pattern
        ↓
Native Data API / View / Custom API / RPC / DB
        ↓
Authorization / Transaction / Error / Lifecycle Contract
```

### Research dimensions

研究 representative Business Feature / Operation 時，至少檢查：

- Query / Mutation 的 operation shape。
- Native Data API、View Read Model、Custom API、RPC 的適用 responsibility。
- Authentication Identity、Application Context、Feature Entry、Feature Data Access、Business Authorization 的 boundary。
- Token / current Session propagation 是否涉及 Feature invocation。
- Transaction ownership 與 Business Operation boundary。
- Feature state 與 Shell state 的 boundary。
- Browser History、Save / Cancel、unsaved state、query-state restoration 的 lifecycle。
- Error / validation / partial failure contract。

既有 Verified Evidence 必須優先拿來支撐 pattern analysis；只有 mechanism 或 runtime behavior 仍有不確定性時才新增 Experiment。不要把 Architecture / Rule design 偽裝成實驗，否則 Playground 最後會變成「凡事都做個 demo」博物館。

### UI research position

UI / interaction 仍是 Platform research 的必要部分，但放在 technical responsibility / operation pattern 釐清之後。後續仍需研究：List / Table、Pagination、Sort、Filter / Search、Loading / Empty / Error、responsive presentation、Create / Edit / Delete / Save / Cancel、Validation、Dialog、Toolbar，以及 Query → Detail/Edit → Return lifecycle。

這些研究要回答的是：UI interaction 如何承載已定義的 Platform Contract，而不是先建立視覺規範或 Design System。按鈕大小、顏色、圓角不是 current Research Front。

## Graduated Baseline

已完成並可作 Architecture input：Supabase Auth、Native Data API / View Read、GitHub Actions execution、Supabase / Netlify Custom API runtime、Database-centric Custom API、External API Orchestration、Backend Service Access / Transaction Ownership、Netlify Trigger Boundary、Supabase Cron / Scheduling、**Application Shell lifecycle / composition**。

S-SHELL-1 verified baseline：

```text
Login / Session Restore
→ Auth Identity
→ app_user / Application Eligibility
→ Application User Context
→ metadata-driven Navigation / Route
→ Shell Ready
→ Feature Entry
→ Native / Custom / External integration
→ Render
→ explicit Logout / Invalidation
```

已驗證 deep link、reload、same-browser persisted Session、cross-browser unauthenticated entry、Back/Forward、explicit Logout、iPad/iPhone responsive behavior。Formal Nook Works 應把這些 Evidence 當 Platform Shell design input，不直接複製 Playground monolithic implementation。

S-SHELL-1 另已建立 synthetic Feature Registry、Navigation Definition、`user_type → Feature Entry` mapping，驗證 metadata-driven Navigation / Feature Entry 的 conceptual separation；它不是 Production Role / Permission / RBAC schema。

重要治理原則：

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

Completed work 的 durable meaning 應留在 `knowledge/`、`evidence/`、Experiment Record；Short-term 不養 Completed 墓碑。

## Platform Rule / Design Queue

這些是 Architecture / Rule design，不因看到名詞就立刻養新 Experiment：

- Formal Nook Works Platform Shell design / module boundary extraction。
- Business Feature → Technical Platform Pattern taxonomy / contract。
- Transaction Pattern Selection。
- Authorization / Error Contract。
- Batch Execution Contract / retry / idempotency ownership。
- Production Identity / Secret / Connection Governance。
- Observability Contract。
- Requirement-to-platform traceability。

## Deferred / Candidate

- UI component / Design System / visual styling：等 Technical Platform Pattern 與 representative interaction contract 較清楚後再研究。
- A-SAFARI-LIFECYCLE intermittent explicit-logout Session restoration：Known Observation / root cause Unknown；只有 anomaly 再出現時帶 diagnostic purpose 重開，不反覆逼 Safari 表演靈異現象。
- P-CODEX-PHONE autonomous dispatch：Deferred by Provider Gap。
- Pure Compute / Longer-running Processing：等 representative workload。
- Concurrency / Isolation / Deadlock / Load：等 quantified correctness/load requirement。
- Distributed Transaction / Compensation：等 external side effect + DB consistency requirement。
- Advanced Workflow Orchestration：等 durable waits / branching / human approval requirement。
