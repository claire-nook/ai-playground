# Short-term Work Items

> 無交期。依 Claire 有空研究的時間逐項進行。
> 這不是正式開發排程，也不是 Nook Works Specification；只記錄 Playground **目前仍值得放在手邊的近期研究工作**。
>
> **Human-facing Research Navigation：** `short-term-work.md` 的主要用途之一，是讓 Claire 在長對話或跨對話後，不必重新翻閱多個 Repository 目錄，就能直接理解「現在研究到哪裡、接下來要研究什麼、為什麼值得研究」。因此 Current / Next / Candidate 等仍在手邊的研究主題與目的，必須使用 Claire 可直接理解的描述；Technical Term 可以保留英文作為精確術語，但不得只用 Agent / Engineer shorthand 當作研究主題。中文本身不等於可讀，應優先表達實際問題與研究目的。
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
- Experiment C-DB-1 — Database-centric Custom API：`Verified`
- Experiment C-EXT-1 — External API Orchestration：`Verified`
- Netlify Git Deployment Boundary：`Verified`
- Netlify Git Trigger Boundary：`Verified`

Netlify Publish Boundary 已驗證：`public/` 是 Static Public Artifact boundary，Browser Artifact 已與 `experiments/**/README.md` Experiment Record 分離。完整記錄：`experiments/netlify-deployment-boundary/README.md`。

跨 Provider 的 Boundary Pitfall 已另外整理於：`evidence/provider-boundary-pitfalls.md`。

這些 Completed items 的完整脈絡、Evidence、Constraint 與 Current Judgment 請回到 Knowledge Base / Experiment Record 閱讀，不在 Short-term 重複維護。

## Current Judgment — Custom API Runtime Feasibility｜Supabase-first 已具可信度

### Claire-readable summary

> **目前 Nook Works 可合理預期的普通 Custom API workload，Supabase Edge Functions 已經具備足夠高的可信度作為 Primary Custom API Runtime Candidate。現階段沒有必要為了把研究清單全部打勾，刻意製造一支不存在真實需求的「長工作 API」。**

目前已實際驗證：

- Database-centric / Application-side Processing：`Verified C-DB-1`
- PostgreSQL Function / RPC orchestration path：`Verified C-DB-1`
- Browser → JWT → Custom API → DB / RLS：`Verified C-DB-1`
- Custom API → Custom API composition：`Verified C-EXT-1`
- External API Orchestration / normalization：`Verified C-EXT-1`

基於目前已知 dependency：Database、Supabase Auth、PostgreSQL Function / RPC、Application Access Boundary 多數集中於 Supabase，因此 **Supabase Edge Functions 仍是目前 Nook Works Primary Custom API Runtime Candidate**。

這是 Research Judgment，不是 Production Architecture Decision。Netlify Functions 仍保留為 credible secondary candidate，較可能適用於 standalone repo、獨立小工具、frontend-adjacent API，或 Supabase runtime 被實驗證明存在實質限制的 workload。

### Deferred — Pure Compute / Longer-running Processing

較耗運算或執行時間較長的 API workload 尚未驗證，可能涉及 duration、CPU / memory、timeout、concurrency、free-tier / cost model 等限制。

目前暫緩原因不是「不重要」，而是 **尚未出現足夠真實的 Nook Works workload 可以代表這類 responsibility**。若只為測試而刻意製造長時間 sleep / compute Probe，得到的 Evidence 對實際 Architecture placement 幫助有限。

Evolution Trigger：當 Nook Works 出現實際的 longer-running / compute-heavy use case，或 provider runtime limit 開始影響真實設計時，再把此題拉回 Current 並設計 representative Probe。

## Current — Batch Runtime / Scheduling｜先研究 Supabase 排程能力

### Claire-readable summary

> **下一個研究問題改成：既然目前 Nook Works 的 API / Database / Auth responsibility 都高度集中在 Supabase，那麼定時批次工作能不能也先由 Supabase 提供的 scheduling mechanism 承擔？如果實驗結果不理想，再研究 Netlify 或其他 runtime。**

這一階段先做 **Provider capability research → 選擇最符合 Nook Works 使用方式的最小實驗**，不是把所有排程機制一個個測完。

### Current Research Question

> Nook Works 常見的 scheduled / batch responsibility，是否可以用 Supabase-managed scheduling path，以 iPad-first、Git-traceable、可觀察且維護成本合理的方式實作？

優先研究 Supabase 的原因：

- Custom API Primary Candidate 已偏向 Supabase Edge Functions。
- Database / Auth / RPC / RLS 等 backend gravity 已在 Supabase。
- 如果 Batch 只是定時觸發既有 Edge Function / Database operation，優先保持 responsibility boundary 集中，比無理由拆到另一個 Provider 更自然。

### Research Scope

先確認 Supabase 目前提供哪些與 scheduling / batch 相關的 mechanism，以及它們各自的適用 boundary，例如：

- 定時觸發 Edge Function
- Database-side scheduling / cron 類能力
- Scheduled task 的 source / configuration 是否可被 Git / migration / repository 管理
- Secret / Auth / permission handling
- Retry / failure behavior
- Logs / observability
- Free-tier / quota / cost boundary
- iPad-first 情境下是否能部署、修改、停用與檢查

研究目的不是先選「功能最多」的方式，而是找出 **Nook Works 實際可維護的 default batch pattern**。

### Secondary Candidates

只有當 Supabase-managed path 出現具體限制、維護成本不合理，或某個 batch responsibility 本身屬於不同 project boundary，再研究：

- GitHub Actions Schedule
- Netlify-managed scheduling / runtime
- 其他適合的 Provider path

Netlify 近期也持續擴張 backend capability；可保留為後備研究方向，但現階段不因 Provider 新功能就主動把 Nook Works backend responsibility 拆散。免費仔可以有逃生門，不必把家蓋成迷宮。

## Next Major Track — Application UI Maintenance Pattern｜單檔 / 主從 / 多檔維護介面一致性

Batch / Scheduling 完成第一輪研究後，下一條值得進入 Playground 的 major track 是 Nook Works 的 Application UI Pattern。

這不是單純做畫面美化，而是建立一致的 maintenance interaction contract，避免未來出現：A 功能的新增在左邊、B 功能在右邊；這裡叫「取消」、那裡叫「放棄」；同一件事有時叫「存檔」、有時叫「儲存」這類長期維護污染。

預期研究方向包含：

- 單檔維護畫面
- 主從雙檔 / 多檔維護畫面
- 新增 / 編輯 / 刪除 / 儲存 / 取消的 naming 與 placement
- Search / List / Detail / Edit state transition
- Validation / error presentation
- Toolbar / action hierarchy
- iPad-first 操作與 responsive behavior

UI Pattern 預期需要多個 Prototype / Browser Artifact 做比較，不急著在 Batch 研究尚未展開時同時開工。先讓一條研究線活著走完，人類已經很會同時開十個分頁，不需要 Repository 也學。

## Candidate — Explicit Business Contract / Authorization

C-DB-1 與 C-EXT-1 已驗證 caller identity / RLS visibility，但 TU01 / TU02 仍可出現 Authentication Success + HTTP 200 + empty data。

若未來 API 需要明確區分：

- No Data
- No Application Access
- Validation Error
- Conflict
- Not Found
- Transaction / downstream failure

再設計 explicit Business Authorization / Error Contract Probe。這題目前保留 Candidate，不阻擋 Batch / Scheduling 研究。

## Candidate — PostgreSQL RPC｜Application Operation Contract

PostgreSQL Function + RPC 已在 C-DB-1 中成為可用 mechanism，但「哪些 Application Operation 應優先由 Database Function 提供明確 Contract」仍是另一層 Pattern 問題。

等正式 Nook Works operation 出現足夠代表性的 use case，再比較 Native CRUD、RPC 與 Custom API 的責任分工；目前不為了完成舊清單另開抽象 Experiment。
