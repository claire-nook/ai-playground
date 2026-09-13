# Short-term Work Items

> 無交期。依 Claire 有空研究的時間逐項進行。
> 這不是正式開發排程，也不是 Nook Works Specification；只記錄 Playground **目前仍值得放在手邊的近期研究工作**。
>
> Completed work 的長期意義應畢業到 `knowledge/`、`evidence/` 與 Experiment Record，不讓 Short-term 變成一整排 Completed 墓碑。

## Knowledge Base Bootstrap — Completed

2026-09-13 已把 2026-09-12 的第一批 Playground Experiments 整理成可持續生長的 Knowledge Architecture。

- Knowledge Model / Capture Protocol：`knowledge/README.md`
- Experiment Catalog：`knowledge/experiments.md`
- Experiment Record Template：`knowledge/experiment-template.md`
- Nook Technical Platform Research Map：`knowledge/maps/nook-technical-platform.md`
- Open Exploration / Potential Clusters：`knowledge/open-exploration.md`
- Evidence Index：`evidence/index.md`

後續每次 Experiment 形成有效 Evidence 時，應順手更新 Experiment Record、Experiment Catalog、Evidence Index、相關 Research Map 或 Open Exploration，以及必要的 Links / Tags。

Short-term 只保存「現在正在做什麼」；Research Context 與 Evidence 不再依賴這份檔案長期存活。

## Current Research Front｜目前研究前緣

目前主要 Research Map：`knowledge/maps/nook-technical-platform.md`

已完成並畢業到 Knowledge Base 的 baseline：

- Experiment A — Supabase Auth：`Verified`
- Experiment B — Native Data API CRUD / Application Access：`Verified`
- Experiment B-1 — View Read / Security / Read Model：`Verified`
- GitHub Actions Remote Execution Environment：`Verified`
- Experiment C-0 — Supabase Edge Function Deployment Lifecycle：`Verified`
- Experiment C-NF-0 — Netlify Functions Deployment Lifecycle：`Verified`
- Netlify Git Deployment Boundary：`Verified`
- Netlify Git Trigger Boundary：`Verified`

Netlify Publish Boundary 已於 2026-09-13 驗證：`public/` 是 Static Public Artifact boundary，Browser Artifact 已與 `experiments/**/README.md` Experiment Record 分離。完整記錄：`experiments/netlify-deployment-boundary/README.md`。

跨 Provider 的 Boundary Pitfall 已另外整理於：`evidence/provider-boundary-pitfalls.md`。

這些 Completed items 的完整脈絡、Evidence、Constraint 與 Current Judgment 請回到 Knowledge Base / Experiment Record 閱讀，不在 Short-term 重複維護。

## Current — Custom API Runtime Feasibility｜Supabase-first

### Current Architectural Intent

目前的初步意向不是把 Nook Works 的 Custom API 依單支 workload 分散到不同 Provider，也不是繼續做 Supabase Edge Functions 與 Netlify Functions 的逐項效能競賽。

Nook Works 應優先維持清楚的 API ownership boundary，避免同一主系統在沒有充分理由時形成大量 API 分散於 Supabase / Netlify 的雙 runtime 結構。

基於目前已知 dependency：Database、Supabase Auth、PostgreSQL Function / RPC、Application Access Boundary 多數集中於 Supabase，因此 **Supabase Edge Functions 是目前 Nook Works Primary Custom API Runtime Candidate**。

這仍是 Research Intent，不是 Production Architecture Decision。

Netlify Functions 保留為 credible secondary candidate，較可能適用於 standalone repo、獨立小工具、frontend-adjacent API，或 Supabase runtime 被實驗證明存在實質限制的 workload。

### Current Research Question

> Nook Works 可合理預期會出現的 Custom API workload，是否都能在 Supabase Edge Functions 上以可接受的 runtime、integration、operability 與 free-tier / cost constraint 實作？

研究重點因此由「兩個平台哪一個跑得比較好」調整為：

> **先驗證 Supabase 是否足以承擔 Nook Works 的主要 Custom API responsibility；只有遇到具體限制時，才需要進一步評估其他 runtime placement。**

### Representative API Workloads to Probe

後續 Experiment 應挑選能代表真實 Nook Works responsibility 的最小 Probe，而不是繼續增加 Hello World：

1. **Database-centric / Application-side Processing**
   - API 需要讀取 Database。
   - 資料無法只靠 View 或 Stored Procedure 完成最終結果。
   - API 需要進一步做較複雜的 application-side aggregation / transformation / calculation。

2. **Stored Procedure / RPC Orchestration**
   - API 呼叫 PostgreSQL Function / RPC / Stored Procedure 執行資料處理。
   - Procedure 回傳結果後，API 繼續執行後續 application logic。
   - 應觀察 DB boundary、error propagation、transaction boundary 與後續處理責任。

3. **External API Orchestration**
   - API 呼叫一個或多個 external API。
   - 可能包含 normalize、aggregate、timeout、retry、secret management 或 response shaping。
   - 用來驗證 Supabase Edge Functions 是否適合作為 Nook Works 對外服務整合 runtime。

4. **Pure Compute / Longer-running Processing**
   - 不依賴 Database，主要是 application code 運算。
   - 逐步增加 execution duration / workload，觀察 runtime duration、CPU / memory、timeout 與 free-tier / cost model 是否形成限制。

必要時可以設計組合型 Probe，例如：

`API → RPC / Stored Procedure → API processing → external API → final response`

但每個 Experiment 必須仍能回答明確問題，避免把所有 failure surface 塞進一隻 API 後再集體猜兇手。

### Evaluation Focus

這一階段主要收集：

- Database / RPC integration practicality
- Supabase Auth / JWT / Application Authorization integration
- external outbound API capability
- execution duration / timeout
- CPU / memory / concurrency constraints
- secret management
- error / failure propagation
- logs / observability
- deployment / source traceability
- free-tier 與後續 cost constraint

不要求每個 Probe 都與 Netlify 做 sibling benchmark。只有當 Supabase 在某一 responsibility 出現可疑或不可接受限制，或 workload 本身屬於另一個 standalone project boundary，才需要拉 Netlify Functions 或其他 runtime 進場比較。

## Candidate — Custom API Application Integration

C-0 與 C-NF-0 已驗證 Deployment Lifecycle，但尚未代表 Nook Works Browser Application 已完成正式 Custom API integration。

後續可依實際 Probe 需要逐步納入：

- Browser → Custom API `fetch()` / cross-origin / CORS
- Supabase Auth JWT propagation
- Application Authorization
- Database access / caller-scoped security semantics
- Business validation / transaction / error contract

這些 responsibility 不需要一次全部綁在第一隻 API 上。Research Question 要能活著走出 Experiment，比展示一隻什麼都會的怪獸 API 重要。

## Candidate — PostgreSQL RPC

Experiment D 的原始目的仍成立：驗證 PostgreSQL Function + RPC 是否能在某些 Application Operation responsibility 下提供比 Native CRUD 更明確的 contract，並與 Custom API / Native Data API 形成 mechanism comparison Evidence。

RPC 同時也是後續 `Stored Procedure / RPC Orchestration` Custom API Probe 的重要 dependency baseline。

Status：`Candidate`。尚未開始 Experiment。

## Open — Batch Runtime / Scheduling

Batch Runtime 已被辨識為未來 Nook Technical Platform 的 Responsibility，但目前不急著宣布 Provider winner。

Research Map 暫列：

- GitHub Actions Schedule
- Supabase-managed path
- Netlify-managed path

等 Batch Platform Question 真正進入研究前緣，再設計最小 Experiment Scope。
