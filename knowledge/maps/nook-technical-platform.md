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
│     └─ authenticated Weather Orchestration             [Verified C-EXT-1]
│
├─ Custom API Runtime
│  ├─ Supabase Edge Functions
│  │  ├─ Deployment Lifecycle                           [Verified C-0]
│  │  ├─ Database-centric workload                      [Verified C-DB-1]
│  │  └─ API composition / External API orchestration   [Verified C-EXT-1]
│  └─ Netlify Functions Deployment Lifecycle            [Verified C-NF-0]
│
├─ Application Operation Mechanism
│  ├─ Native Data API                                   [Verified baseline B/B-1]
│  ├─ Custom API → Native Data API SELECT               [Verified C-DB-1]
│  ├─ Custom API → RPC → PostgreSQL Function            [Verified C-DB-1]
│  ├─ Custom API → Custom API                           [Verified C-EXT-1]
│  └─ Custom API → External API                         [Verified C-EXT-1]
│
├─ Custom API Workload Coverage
│  ├─ Database-centric / application processing         [Verified C-DB-1]
│  ├─ External API orchestration                        [Verified C-EXT-1]
│  ├─ Pure Compute / longer-running                     [Candidate]
│  └─ Explicit business authorization / error contract  [Candidate]
│
├─ Remote Execution / Toolchain
│  └─ GitHub Actions                                    [Verified]
│
└─ Batch Runtime / Scheduling                           [Open]
```

## Current Judgment

### Browser / Backend baseline

Netlify-hosted Browser 已實測 Supabase Auth、Native CRUD、View Read Model、authenticated cross-origin Custom API invocation，以及 Custom API orchestration。`Netlify = Web/UI delivery` 與 `Supabase = Auth/API/DB` 現在已有多條實際跑通的 runtime chain。

### Supabase Custom API workload coverage

C-DB-1 已驗證 Database-centric path：

```text
Browser → JWT → Edge Function → RPC / PostgreSQL Function
        → Native Data API SELECT → mapping → Browser
```

C-EXT-1 再驗證 orchestration path：

```text
Browser → JWT → Weather Edge Function
        → same caller Authorization → Valid Place Edge Function
        → PostgreSQL / RLS
        → Open-Meteo
        → normalization → Browser
```

具有效 Application Access 的 Claire 測試帳號取得 2 places / 2 provider success；TU01 / TU02 均 Authentication Success 但 0 visible places / 0 provider calls。這支持 caller identity / RLS visibility behavior 在 tested API composition 中仍被保留。

因此 Supabase Edge Functions 作為 **Nook Works Primary Custom API Runtime Candidate** 的可信度再次提高。原因不是 provider feature checklist，而是 Auth、JWT、API composition、RPC、Native Data API、PostgreSQL/RLS 與 External API 能形成連續 backend responsibility boundary。

這仍是 Research Judgment，不是 Production Architecture Decision。

### Time semantics learned from real orchestration

同一個 Weather orchestration request 中，Sapporo 與 Sydney 因各自 timezone 得到不同 calendar `weather_date`。未來 Nook Works 的 D-1 Daily Weather 應明確定義：

> D-1 = each Place timezone based previous local calendar date.

不要把「昨天」當成全球共享的自然常數。時區早就證明人類連現在幾點都無法取得共識。

### Netlify Functions placement

C-NF-0 已驗證 Netlify Functions 的 Git-native lifecycle、Deploy Preview、Function logs 與 source delete → function absent。它仍是 credible runtime，但目前較自然的候選 placement 是 standalone repo、小工具或 frontend-adjacent responsibility；不需要為了 provider 對稱而把 Nook Core API 任意分散成雙 runtime。

## Important Behavior / Design Note

RLS 可以是最後的 Data Security Boundary，但不是完整 Business Authorization Contract。

C-DB-1 與 C-EXT-1 的 TU01 / TU02 都呈現 Authentication Success + HTTP 200 + empty data，因此 API 若需要區分 `No Data` 與 `No Application Access`，必須額外設計 explicit authorization / business semantics。

## Remaining Supabase-first Questions

External API Orchestration 已從 Candidate 升為 Verified。下一階段更值得研究：

1. **Pure Compute / Longer-running**：duration、CPU / memory、timeout、concurrency、free-tier / cost。
2. **Business Contract / Authorization**：需要時研究 explicit 403、validation、transaction / error propagation。
3. **Observability / Operations**：在更接近真實 workload 時觀察 logs、failure diagnosis 與 deployment traceability。
4. **External Provider Secrets / Failure Policy**：只有當 API credential、retry / rate limit / timeout semantics 真正影響架構決策時再補 Probe。

只有 Supabase 出現實質限制，或 workload 本身屬於獨立 project boundary，才需要拉 Netlify Functions 或其他 runtime 做進一步 placement comparison。

## Decision Boundary

`Verified` 表示「真的做過且留下 Evidence」，不是「後世不得質疑」。正式 Technical Decision 仍應回到 Nook Works formal repository，結合 Specification、Security、Operations、Provider capability、Cost 與 Playground Evidence 再形成 Platform Rule。