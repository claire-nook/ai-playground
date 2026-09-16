# Short-term Work Items

> 無交期。依 Claire 有空研究的時間逐項進行。
> 這不是正式開發排程，也不是 Nook Works Specification；只記錄 Playground **目前仍值得放在手邊的近期研究工作**。
>
> Completed work 的長期意義應畢業到 `knowledge/`、`evidence/` 與 Experiment Record，不讓 Short-term 變成一整排 Completed 墓碑。

## Knowledge Base Bootstrap — Completed

2026-09-13 已建立可持續生長的 Knowledge Architecture：

- Knowledge Model / Capture Protocol：`knowledge/README.md`
- Experiment Catalog：`knowledge/experiments.md`
- Experiment Record Template：`knowledge/experiment-template.md`
- Nook Technical Platform Research Map：`knowledge/maps/nook-technical-platform.md`
- Open Exploration / Potential Clusters：`knowledge/open-exploration.md`
- Evidence Index：`evidence/index.md`

## Current Research Front｜目前研究前緣

目前主要 Research Map：`knowledge/maps/nook-technical-platform.md`

已完成並畢業到 Knowledge Base 的 baseline：

- Experiment A — Supabase Auth：`Verified`
- Experiment B — Native Data API CRUD / Application Access：`Verified`
- Experiment B-1 — View Read / Security / Read Model：`Verified`
- GitHub Actions Remote Execution Environment：`Verified`
- Experiment C-0 — Supabase Edge Function Deployment Lifecycle：`Verified`
- Experiment C-NF-0 — Netlify Functions Deployment Lifecycle：`Verified`
- Experiment C-DB-1 — Database-centric Custom API：`Verified`
- Experiment C-EXT-1 — External API Orchestration：`Verified`
- C-BSA-1 — Backend Service Database Access / Transaction Ownership：`Verified / Completed`
- Netlify Git Deployment / Trigger Boundary：`Verified`
- D-BATCH-1 — Supabase Cron / Scheduling：`Verified / Completed`
- P-CODEX-PHONE — ChatGPT → Codex Autonomous Dispatch Reconnaissance：`Verified Provider Gap / Deferred`

Supabase Edge Functions 仍是目前 Nook Works Primary Custom API Runtime Candidate；Netlify Functions 保留為 credible secondary candidate。這是 Research Judgment，不是 Production Architecture Decision。

2026-09-15 Primary review 與 independent Codex Blind Spot Review 均判斷：Backend / Data / Integration core feasibility 已足以開始形成 Platform Architecture draft，目前沒有新的 technical Blocking Gap。近期研究因此不再以 broad backend capability probing 為主。

## Graduated — D-BATCH-1 / C-BSA-1

D-BATCH-1 與 C-BSA-1 已完成，不再佔用近期施工前緣。

D-BATCH-1 durable records：

- `experiments/batch-scheduling/README.md`
- `knowledge/implementation/supabase-cron.md`
- `evidence/d-batch-1-phase-1.md`
- `evidence/d-batch-1-parameter-invocation.md`

C-BSA-1 durable records：

- `experiments/custom-api/c-bsa-1.md`
- `experiments/custom-api/c-bsa-1.catalog.json`
- `evidence/c-bsa-1-phase-a.md`
- `evidence/c-bsa-1-phase-b.md`
- `evidence/c-bsa-1-phase-c.md`
- `evidence/c-bsa-1-phase-d.md`
- `evidence/c-bsa-1-consolidated-findings.md`

重要治理原則：

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

平台初期可以只納入少量標準 Pattern，其他已知能力保留為 Deferred / Future Expansion Candidate，待需求與平台成熟度成長時再 Promote。

C-BSA-1 的 Evidence-backed Current Judgment：

```text
Transaction owner = layer owning complete Business Operation.
```

它是未來 Platform Architecture 的 input，不是已自動生效的 Production Rule。

## Next Major Track A — Application Shell

Experiment Card：`experiments/application-shell/README.md`

Application Shell 從一般 UI Pattern 拆出，視為 browser-side composition layer。它的研究目的已從通用 Shell Draft 收斂為 **Nook Works Application Runtime 的 integration / composition probe**。

既有 A / B / B-1 / C-DB-1 / C-EXT-1 已分別驗證 Auth、Native Data API、View Read、authenticated Custom API 與 API composition；Shell 不重新證明這些零件，而是第一次把它們組成一個真的可登入、可進 Feature、可取得資料的微型 Application。

### Current experiment shape

一個 disposable-but-realistic Live Demo，三個 Evidence Phase：

```text
Login / Session Restore
→ Supabase Auth Identity
→ app_user
→ is_active / Application Eligibility
→ Application User Context
→ Route Resolution
→ Shell Ready
→ Feature
→ Data Access
→ Rendered Result
→ Sign-out / Invalidation
```

Phase A — Bootstrap / Application Context：

- 真實 Supabase Auth normal trunk。
- 真實 `app_user` mapping / `is_active` / `user_type`。
- `admin` 與 `user` Application Context。
- no app_user / inactive app_user / representative invalid-session or context-failure outcome。
- sign-out / invalidation 不留下 stale privileged state 或 redirect loop。

Phase B — Feature Composition / Navigation / Route：

- `/home`：Shell landing content，不是 Dashboard Feature。
- `/business`：admin / user 都可見、可用，且必須實際取得並呈現資料。
- `/common`：admin 可見、可用並實際取得資料；user Navigation hidden。
- user direct `/common`、deep link、refresh、unknown route、Back / Forward 都有 deterministic Shell outcome。
- Business Feature 優先使用已驗證 Native Data API；Common Feature 若有安全且可直接重用的既有 Custom API，可刻意使用不同 mechanism 觀察 Shell 是否保持 Feature implementation neutral。不得為了 Demo 完整感擴張 backend scope。

Phase C — iPad-first Responsive / Browser Interaction：

- iPad landscape / portrait primary。
- iPhone narrow primary responsive target。
- desktop sanity。
- iPad Split View exploratory。
- touch navigation、orientation、refresh、Back / Forward、sign-out、loading/error、overlay/overflow/stale state。

### User scope

本輪只實作兩種 Application User：

- `admin`：Claire；Business + Common Feature。
- `user`：第二測試使用者；Business Feature，Common Navigation hidden。
- `guest`：Schema Reserved / Out of Scope。尚無具體 Business Use Case，不替不存在的需求定義 behavior。

### Boundary to preserve

```text
Authentication Identity
≠ Application Identity / Eligibility
≠ Navigation Visibility
≠ Route Handling / Feature Entry
≠ Feature Data Access
≠ Authoritative Backend Authorization
```

Shell Experiment 不建立 Role / Permission / RBAC，也不為了讓 user 無法讀 Common data 而臨時發明 Production Authorization。這個缺口若仍存在，留在 Authorization / Error Contract design queue。

### Stop condition

當同一 Live Demo 已能在實際 iPad Safari 上證明：

- real login → `app_user` → Application Context → Shell Ready；
- admin/user coarse Feature Entry deterministic；
- Business/Common Feature 具真實 data retrieval / render vertical slice；
- direct route / deep link / refresh / history / unknown route deterministic；
- sign-out / invalidation 無 stale privileged state；
- iPad landscape/portrait 與 iPhone narrow Shell interaction usable；
- hidden Navigation 未被冒充 Backend Authorization；
- Runtime Evidence 與 Platform Design Candidate 清楚分離；

即停止，不把 disposable Shell 順手養成 Production Application。

## Next Major Track B — Application UI Maintenance Pattern

Shell boundary 之外，再研究 Nook Works Feature UI Pattern：

- 單檔維護畫面。
- 主從雙檔 / 多檔維護畫面。
- 新增 / 編輯 / 刪除 / 儲存 / 取消 naming 與 placement。
- Search / List / Detail / Edit state transition。
- Validation / error presentation。
- Toolbar / action hierarchy。
- iPad-first responsive behavior。
- Form / Table / Dialog 等 visual / interaction pattern。

Shell 解決「Application 怎麼活著、怎麼進入 Feature」；Feature UI 解決「進去以後人類怎麼操作」。人類很喜歡把兩件事都叫畫面，然後 architecture 就開始受苦，所以這裡正式拆開。

## Platform Rule / Design Queue｜不是立即 Experiment

Independent Blind Spot Review 提醒的幾項工作應進 Architecture / Rule design，而不是看到名詞就再養一批實驗：

- **Transaction Pattern Selection**：依 Business Operation owner / atomicity 選 Native Data API、Database-owned RPC 或 Backend-owned Transaction。
- **Authorization / Error Contract**：區分 provider security semantics 與 Business Operation result semantics；Shell 只驗 visibility / route responsibility，不替 backend `user_type` authorization 做決策。
- **Batch Execution Contract**：logical run ID、business date、idempotency、retry ownership、failure persistence、manual rerun / reconciliation。
- **Production Identity / Secret / Connection Governance**：restricted DB role、least privilege、secret custody / rotation、Transaction Pooler / connection lifecycle。
- **Observability Contract**：operation / run correlation、layered status、durable outcome、redaction / retention / alert ownership。
- **Requirement-to-platform traceability**：Platform Architecture 定稿前，抽樣 Nook Works representative Specifications，確認 requirement responsibility 都有 architecture 落點。

## Deferred / Candidate

- **P-CODEX-PHONE / Autonomous ChatGPT → Codex Dispatch**：WAIT / Deferred by Provider Gap。
- **Pure Compute / Longer-running Processing**：等 representative workload 再驗證 duration、CPU / memory、timeout、concurrency、cost。
- **Concurrency / Isolation / Deadlock / Load**：等 formal correctness requirement、concurrent writer 或 quantified workload 出現。
- **Distributed Transaction / Compensation**：等 Business Operation 真正要求 external side effect 與 DB state 跨系統一致。
- **Advanced Workflow Orchestration**：等 durable waits、branching、human approval、跨日 resume 等 requirement 出現。
- **Batch Retry / Idempotency Experiment**：先完成 formal contract；只有 chosen execution model 真的允許 duplicate / retry / concurrent invocation 時再 focused verify。
