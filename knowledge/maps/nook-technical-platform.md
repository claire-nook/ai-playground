# Nook Technical Platform Research Map

- Research Topic: Nook Works Technical Platform Architecture Exploration
- Status: Active
- Started: 2026-09-12
- Tags: `nook-platform`, `ipad-first`, `supabase`, `netlify`, `browser`, `security`

## Research Intent｜研究意圖

這張 Map 不追蹤 Nook Works Application 的開發進度，也不是 Provider 全面評測。

它追蹤的是：

> 為了逐步建立適合 Nook Works 的 Technical Platform，我們在每個 Platform Responsibility / Capability 節點已經取得哪些實作 Evidence，還有哪些合理 Candidate Branch 值得驗證？

研究方式不是先列出 Supabase、Netlify、GitHub 的全部功能再打勾，而是沿著 Architecture 所需的 Responsibility 前進。當同一個 Responsibility 有兩個以上與現有 Stack 高度相關的合理 Provider / Mechanism Candidate，而且選擇會造成實際 Architecture、Security 或 Operation 差異時，再設計 sibling experiments 取得可比較 Evidence。

因此：

```text
Platform Responsibility
→ identify credible candidates
→ minimal experiments
→ evidence
→ compare trade-offs
→ later Technical Decision
```

不是：

```text
Provider A feature list
VS
Provider B feature list
```

我們不是在經營 SaaS Consumer Reports。

---

## Research Graph｜目前研究脈絡

```text
Nook Technical Platform
│
├─ Browser Application
│  │
│  ├─ Authentication
│  │  └─ Supabase Auth
│  │     └─ Experiment A                         [Verified]
│  │
│  ├─ Internal Data Access
│  │  ├─ Native Table CRUD
│  │  │  └─ Experiment B                       [Verified]
│  │  │
│  │  └─ Native View Read Model
│  │     └─ Experiment B-1                     [Verified]
│  │
│  └─ Custom API Invocation
│     ├─ Browser → API / fetch / CORS           [Candidate]
│     ├─ Auth JWT propagation                   [Candidate]
│     └─ Application Authorization              [Candidate]
│
├─ Custom API Runtime
│  │
│  ├─ Supabase Edge Functions
│  │  └─ Deployment Lifecycle C-0              [Verified]
│  │
│  └─ Netlify Functions
│     └─ Equivalent minimal Deployment probe    [Candidate]
│
├─ Application Operation Mechanism
│  ├─ Native Data API                          [Partial Evidence: B / B-1]
│  ├─ Custom API                               [Partial Evidence: C-0 deployment only]
│  └─ PostgreSQL RPC                           [Candidate: D]
│
├─ Remote Execution / Toolchain
│  └─ GitHub Actions Remote Execution          [Verified]
│     ├─ Manual Approval Mode                  [Verified]
│     └─ Push-triggered Autonomous Mode        [Verified]
│
└─ Batch Runtime / Scheduling                  [Open]
   ├─ GitHub Actions Schedule                  [Candidate]
   ├─ Supabase-managed path                    [Candidate]
   └─ Netlify-managed path                     [Candidate]
```

這張圖會隨 Research Question 長大，不要求現在預測完整 Platform Architecture。

---

## Node A — Browser Authentication

### Question

Netlify-hosted Browser UI 是否能直接使用 Supabase Auth 建立基本 Authentication Path，而不需要先自行包一層 Login API？

### Experiment / Evidence

- Experiment: `A — Supabase Auth`
- Record: [`../../experiments/auth/README.md`](../../experiments/auth/README.md)
- Evidence: [`../../evidence/index.md`](../../evidence/index.md)
- Status: `Verified`
- Tags: `nook-platform`, `ipad-first`, `authentication`, `session`, `supabase`, `netlify`, `browser`

### Current Judgment

Browser → Supabase Auth 的基本 Email / Password Authentication Path 已取得 iPad Safari Evidence。Authentication Identity、Application Business Identity 與 Authorization 仍應分層，不因 Auth success 自動視為 Application Access。

### Open Branches

Session lifecycle、Application User Context、Authorization、其他 Authentication Method 仍未由 Experiment A 完整回答。

---

## Node B — Native Data Access

### Question

Browser 是否能直接使用 Supabase Native Data API，並讓 PostgreSQL Grant + RLS + Application Access Boundary 承擔 Internal Application Data Access？

### Experiment B — Table CRUD

- Record: [`../../experiments/data-api/README.md`](../../experiments/data-api/README.md)
- Status: `Verified`
- Tags: `nook-platform`, `ipad-first`, `data-api`, `authorization`, `rls`, `supabase`, `browser`, `postgresql`

Key Evidence：active Application User 可完成 Browser CRUD；inactive / missing `app_user` 不會因 Authentication success 自動取得資料存取權。Native request technical success 與 Business Operation Success 不能直接畫等號。

### Experiment B-1 — View Read Model

- Record: [`../../experiments/data-api-view/README.md`](../../experiments/data-api-view/README.md)
- Status: `Verified`
- Relationship: `extends` Experiment B
- Tags: `nook-platform`, `ipad-first`, `data-api`, `read-model`, `rls`, `supabase`, `browser`, `postgresql`

Key Evidence：`security_invoker = true` 的 PostgreSQL View 可在本次條件下透過 Native Data API SELECT，並保留 invoking identity 的 underlying privilege / RLS behavior。View 可作為 Read Model，不必讓 Browser Contract 等於 Physical Table Schema。

### Current Judgment

Native Data API 已建立可行 baseline，但不代表所有 Business Function 都應使用 Native CRUD。需要明確 Business Result semantics、Business Validation、Transaction 或複雜 Authorization 時，仍需與 Custom API / RPC Evidence 比較。

---

## Node C — Custom API Runtime / Deployment

### Why this node appeared

Experiment B / B-1 證明 Native Data API 可行，同時也暴露它天然的 row visibility / affected-row semantics。若 Nook Works 需要更明確的 Business Contract，就必須研究自行擁有 Custom API responsibility 的路徑。

在研究 API DB/Auth/Business Logic 之前，先回答更原始的 dependency：

> API 寫得出來，不代表 Claire 的真實 iPad-first workflow 能把它部署與管理。

因此先設計 C-0，刻意用沒有 DB / Auth / Business Logic 的 Hello World 隔離 Deployment Lifecycle。

### C-0 — Supabase Edge Function Deployment Lifecycle

- Record: [`../../experiments/custom-api/README.md`](../../experiments/custom-api/README.md)
- Status: `Verified`
- `depends-on`: GitHub Actions Remote Execution Evidence
- Tags: `nook-platform`, `ipad-first`, `custom-api`, `deployment`, `remote-execution`, `credential`, `supabase`, `github-actions`

Verified：GitHub Actions + Supabase CLI deploy/delete、Supabase Connector deploy、cross-mechanism delete、iPad Safari HTTP invocation。

Current Judgment：Supabase Edge Function Deployment Lifecycle 在已測條件下不要求 Claire 擁有本地 Desktop / Mac。正式 Production deployment mechanism 尚未決定。

### Sibling Candidate — Netlify Functions

- Status: `Candidate`
- Relationship: `compares-with` Supabase Edge Functions at the `Custom API Runtime / Deployment` responsibility
- Tags: `nook-platform`, `ipad-first`, `custom-api`, `deployment`, `netlify`

Why candidate：Netlify 已是現有 Stack 的 Frontend Hosting Provider，也提供 server-side function runtime。它與 Supabase Edge Functions 在這個節點可能承擔同一類 Custom API Runtime responsibility，因此值得做 equivalent minimal deployment probe。

這不是「Supabase vs Netlify 全面評測」。只比較這個 Architecture node 所需要的 Capability / Operational Evidence。

### Next Custom API Branches

- Browser cross-origin `fetch()` / CORS：`Candidate`
- Supabase Auth JWT propagation：`Candidate`
- Application Authorization inside API：`Candidate`
- Database access / caller-scoped RLS：`Candidate`
- Business validation / transaction / error contract：`Candidate`

後續實驗應盡量一次隔離一個 Question，不要把 CORS、JWT、RLS、Transaction、Business Rule 全塞進同一隻 API，再一起祈禱。

---

## Node D — PostgreSQL RPC

### Question

PostgreSQL Function + RPC 是否能在某些 Application Operation responsibility 下，提供比 Native CRUD 更明確的 contract，同時避免不必要地引入 Custom API Runtime？

- Status: `Candidate`
- Planned Experiment: D
- Tags: `nook-platform`, `rpc`, `authorization`, `rls`, `postgresql`, `supabase`

目前沒有 Evidence，不應因 Provider 文件說「可以」就提前形成 Platform Rule。

---

## Supporting Capability — GitHub Actions Remote Execution

這項 Experiment 原本因 Supabase deployment research 出生，但 Evidence 已超過單一 Nook Platform Intent。

- Record: [`../../experiments/github-actions/README.md`](../../experiments/github-actions/README.md)
- Status: `Verified`
- `supports`: Nook Technical Platform / Deployment
- `supports`: future iPad-first Development research
- `supports`: future AI Engineering / Remote Execution research
- Tags: `nook-platform`, `ipad-first`, `ai-engineering`, `remote-execution`, `deployment`, `github-actions`

它證明 GitHub-hosted Runner 可以補足 iPadOS / AI sandbox 缺少 CLI、Linux、build 或 CI/CD runtime 的 execution gap。這份 Evidence 不需要因不同 Research Intent 複製三份。

---

## Research Progress｜怎麼看進度

目前可以合理說：

- Browser Authentication baseline：已有 Evidence。
- Native Data API Table CRUD baseline：已有 Evidence。
- Native View Read Model baseline：已有 Evidence。
- Remote Execution baseline：已有 Evidence。
- Supabase Custom API Deployment Lifecycle：已有 Evidence。
- Netlify Custom API Runtime sibling path：已辨識 Candidate，尚未實驗。
- Browser → Custom API / CORS / Auth / DB behavior：尚待逐步實驗。
- RPC：Candidate，尚未實驗。
- Batch Runtime / Scheduling：已辨識為未來 Platform Responsibility，尚未形成完整 Experiment Plan。

這不是 Nook Works Application completion percentage。它只是目前 **Technical Platform Research Coverage**。

---

## Decision Boundary｜不要偷跑成祖訓

這張 Map 可以產生 Candidate、Evidence 與 Current Judgment，但不直接宣布正式 Architecture。

正式 Technical Decision 應回到 Nook Works formal repository，結合：

- Business / Application Specification
- Security / Governance requirement
- Operational responsibility
- Provider capability
- Playground Evidence
- Cost / Maintenance / Replacement trade-off

再形成正式 Platform Rule / Technical Decision。

今天的 `Verified` 是「我們真的做過」，不是「後世子孫不得質疑」。