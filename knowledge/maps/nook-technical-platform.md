# Nook Technical Platform Research Map

- Research Topic: Nook Works Technical Platform Architecture Exploration
- Status: Active
- Started: 2026-09-12
- Tags: `nook-platform`, `ipad-first`, `supabase`, `netlify`, `browser`, `security`

## Research Intent

沿著 Nook Works 真正需要的 Platform Responsibility 取得實作 Evidence，而不是做 Supabase / Netlify 功能清單競賽。

```text
Responsibility → credible candidate → minimal experiment → evidence → later decision
```

## Current Research Graph

```text
Nook Technical Platform
│
├─ Browser Application
│  ├─ Authentication / Supabase Auth                    [Verified A]
│  ├─ Native Table CRUD                                 [Verified B]
│  ├─ Native View Read Model                            [Verified B-1]
│  └─ Custom API Invocation
│     ├─ Netlify Browser → Supabase Edge Function CORS  [Verified C-DB-1]
│     ├─ Auth JWT propagation                           [Verified C-DB-1]
│     └─ caller-scoped RLS behavior                     [Verified C-DB-1]
│
├─ Custom API Runtime
│  ├─ Supabase Edge Functions
│  │  ├─ Deployment Lifecycle                           [Verified C-0]
│  │  └─ Database-centric workload                      [Verified C-DB-1]
│  └─ Netlify Functions Deployment Lifecycle            [Verified C-NF-0]
│
├─ Application Operation Mechanism
│  ├─ Native Data API                                   [Verified baseline B/B-1]
│  ├─ Custom API → Native Data API SELECT               [Verified C-DB-1]
│  └─ Custom API → RPC → PostgreSQL Function            [Verified C-DB-1]
│
├─ Custom API Workload Coverage
│  ├─ Database-centric / application processing         [Verified C-DB-1]
│  ├─ External API orchestration                        [Candidate]
│  ├─ Pure Compute / longer-running                     [Candidate]
│  └─ Explicit business authorization / error contract  [Candidate]
│
├─ Remote Execution / Toolchain
│  └─ GitHub Actions                                    [Verified]
│
└─ Batch Runtime / Scheduling                           [Open]
```

## Current Judgment

### Browser / Data baseline

Netlify-hosted Browser 已實測 Supabase Auth、Native CRUD、View Read Model，以及 authenticated cross-origin Custom API invocation。`Netlify = Web/UI delivery` 與 `Supabase = Auth/API/DB` 現在已有一條實際跑通的 baseline，不只是 architecture sketch。

### Supabase Custom API

C-DB-1 已驗證：

```text
Netlify Browser
→ Supabase Auth JWT
→ Supabase Edge Function
→ RPC / PostgreSQL Function
→ Native Data API SELECT
→ application-side mapping
→ Browser result
```

Claire active Application Identity 得到 RPC 2 rows / Country 2 rows；TU01 / TU02 都得到 HTTP 200 + empty rows。這支持 caller identity / RLS 在 tested chain 中被保留。

因此 Supabase Edge Functions 作為 **Nook Works Primary Custom API Runtime Candidate** 的可信度已明顯提高。原因不是「Supabase 也有 Function」，而是 Auth、JWT、RPC、Native Data API、PostgreSQL、RLS 與 Custom API responsibility 能形成連續 backend boundary。

這仍是 Research Judgment，不是 Production Architecture Decision。

### Netlify Functions placement

C-NF-0 已驗證 Netlify Functions 的 Git-native lifecycle、Deploy Preview、Function logs 與 source delete → function absent。它仍是 credible runtime，但目前較自然的候選 placement 是 standalone repo、小工具或 frontend-adjacent responsibility；不需要為了 provider 對稱而把 Nook Core API 任意分散成雙 runtime。

## Important Behavior / Design Note

RLS 可以是最後的 Data Security Boundary，但不是完整 Business Authorization Contract。

C-DB-1 的 TU01 / TU02 都得到：

```text
HTTP 200 + rows=[]
```

因此 API 若需要區分 `No Data` 與 `No Application Access`，必須額外設計 explicit authorization / business semantics。這與 Experiment B 的 `technical success ≠ business success` Evidence 一致。

## Remaining Supabase-first Questions

下一階段不需要重複證明「Edge Function 能讀 DB」。更有價值的是補不同 workload class：

1. **External API Orchestration**：outbound call、secret、timeout / retry、normalize / aggregate。
2. **Pure Compute / Longer-running**：duration、CPU / memory、timeout、concurrency、free-tier / cost。
3. **Business Contract / Authorization**：需要時研究 explicit 403、validation、transaction / error propagation。
4. **Observability / Operations**：在更接近真實 workload 時觀察 logs、failure diagnosis 與 deployment traceability。

只有 Supabase 出現實質限制，或 workload 本身屬於獨立 project boundary，才需要拉 Netlify Functions 或其他 runtime 做進一步 placement comparison。

## Decision Boundary

`Verified` 表示「真的做過且留下 Evidence」，不是「後世不得質疑」。正式 Technical Decision 仍應回到 Nook Works formal repository，結合 Specification、Security、Operations、Provider capability、Cost 與 Playground Evidence 再形成 Platform Rule。