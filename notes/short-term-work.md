# Short-term Work Items

> 無交期。依 Claire 有空研究的時間逐項進行。
> 這不是正式開發排程，也不是 Nook Works Specification；只記錄 Playground **目前仍值得放在手邊的近期研究工作**。
>
> Completed work 的長期意義應畢業到 `knowledge/`、`evidence/` 與 Experiment Record，不讓 Short-term 變成一整排 Completed 墓碑。

## Knowledge Base Bootstrap — Completed

2026-09-13 已把 2026-09-12 的第一批 Playground Experiments 整理成可持續生長的 Knowledge Architecture。

- Knowledge Model / Capture Protocol：`knowledge/README.md`
- Nook Technical Platform Research Map：`knowledge/maps/nook-technical-platform.md`
- Open Exploration / Potential Clusters：`knowledge/open-exploration.md`
- Evidence Index：`evidence/index.md`

後續每次 Experiment 形成有效 Evidence 時，應順手更新 Experiment Record、Evidence Index、相關 Research Map 或 Open Exploration，以及必要的 Links / Tags。

Short-term 只保存「現在正在做什麼」；Research Context 與 Evidence 不再依賴這份檔案長期存活。

## Current Research Front｜目前研究前緣

目前主要 Research Map：`knowledge/maps/nook-technical-platform.md`

已完成並畢業到 Knowledge Base 的 baseline：

- Experiment A — Supabase Auth：`Verified`
- Experiment B — Native Data API CRUD / Application Access：`Verified`
- Experiment B-1 — View Read / Security / Read Model：`Verified`
- GitHub Actions Remote Execution Environment：`Verified`
- Experiment C-0 — Supabase Edge Function Deployment Lifecycle：`Verified`

這些 Completed items 的完整脈絡、Evidence、Constraint 與 Current Judgment 請回到 Knowledge Base / Experiment Record 閱讀，不在 Short-term 重複維護。

## Candidate — Custom API Runtime Sibling Probe

### Netlify Functions Deployment Lifecycle

Research Context：C-0 已驗證 Supabase Edge Functions 的 minimal Deployment Lifecycle，但 `Custom API Runtime` 這個 Platform Responsibility 同時存在另一個與現有 Stack 高度相關的 Candidate：Netlify Functions。

目的不是進行「Supabase vs Netlify 全面評測」，而是在同一 Architecture node 取得 sibling implementation Evidence，避免未來比較時一邊是實作 Evidence、另一邊只有 Provider documentation。

暫定 Question：

> 在 Claire 現有 iPad-first / GitHub / Netlify workflow 下，能否用與 C-0 相近的 minimal API probe 完成 Netlify Function 的 source → deployment → HTTP invocation → inspect / cleanup lifecycle？其 deployment ownership、credential path、source traceability 與 Supabase Edge Functions 有哪些實際差異？

Status：`Candidate`。尚未開始 Experiment。

## Candidate — Custom API Invocation

C-0 只驗證 Deployment，不代表 Browser Application 已驗證 Custom API integration。

後續可沿著 Research Map 逐步拆開：

- Browser → Custom API `fetch()` / cross-origin / CORS
- Supabase Auth JWT propagation
- Application Authorization
- Database access / caller-scoped RLS
- Business validation / transaction / error contract

不要一次把所有東西塞進同一隻 API。那不叫 Integration Test，那叫召喚儀式。

## Candidate — PostgreSQL RPC

Experiment D 的原始目的仍成立：驗證 PostgreSQL Function + RPC 是否能在某些 Application Operation responsibility 下提供比 Native CRUD 更明確的 contract，並與 Custom API / Native Data API 形成 mechanism comparison Evidence。

Status：`Candidate`。尚未開始 Experiment。

## Open — Batch Runtime / Scheduling

Batch Runtime 已被辨識為未來 Nook Technical Platform 的 Responsibility，但目前不急著宣布 Provider winner。

Research Map 暫列：

- GitHub Actions Schedule
- Supabase-managed path
- Netlify-managed path

等 Batch Platform Question 真正進入研究前緣，再設計最小 Experiment Scope。
