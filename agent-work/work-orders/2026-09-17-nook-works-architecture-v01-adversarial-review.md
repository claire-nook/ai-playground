# Work Order — Nook Works Architecture v0.1 Adversarial Review

## Metadata

- Work Order ID: `2026-09-17-nook-works-architecture-v01-adversarial-review`
- Date: `2026-09-17`
- Type: `Review`
- Work Weight: `High-Risk`
- Primary Objective: `從 Architecture Reviewer 與 Implementer 雙視角 adversarially challenge Nook Works Application Architecture v0.1，找出責任邊界錯置、過早抽象、不可施工契約、隱藏假設與缺漏。`
- Requested By: `Primary Agent / Claire`
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Source Baseline: `main，至少包含 knowledge/platform/nook-works-application-architecture.md 的 v0.1 commit 03406661aa30301a33755419f56f2a44599f710f`
- Execution Profile: `Codex Product UI`
- Related Phase: `Nook Works Platform Architecture Synthesis`
- Related Experiment / Research: `S-SHELL-1 / D-BATCH-1 / F-QUERY-1 / F-DETAIL-1 / F-MAINT-1`
- Related Specification: `None`
- Related Evidence / Report: `evidence/s-shell-1-application-shell-findings.md; evidence/f-detail-1-findings.md; evidence/f-maint-1-findings.md`
- Related PR / Issue: `GitHub Issue #44`
- Supersedes: `None`

## Objective｜目標

對 `knowledge/platform/nook-works-application-architecture.md` v0.1 做真正的 adversarial review，而不是替 Primary 的文件鼓掌。

請同時使用兩個視角：

1. **Architecture Reviewer**：檢查責任邊界、抽象層級、Evidence strength、security / transaction / state ownership、Open Contract 是否合理。
2. **Implementer**：假設下一步真的要把這套架構落地到 Nook Works，找出模糊、互相矛盾、會導致 implementation guessing、重工或 provider coupling 的地方。

主要輸出應回答：

> 這份 v0.1 哪些地方可以留下、哪些地方需要降級成 Open Contract、哪些地方其實錯了、哪些地方看起來合理但實作者根本不知道怎麼照著做？

## Why / Context｜為什麼做

Playground 已完成目前 Nook Works 常見四個場景的第一輪研究：

```text
Scheduled / Cron
Query
Query → Detail
Single-record Maintenance
```

Primary 因此第一次把 Shell、Feature Pattern、Operation Contract、Data Access / Backend、Batch 與 Cross-cutting responsibility 收斂成 Nook Works Application Architecture v0.1。

目前刻意 deferred：Master-detail / one-to-many、many-to-many、Workflow / Approval、Advanced Query、Distributed Transaction 等 requirement-driven extension。

這次 Review 的目的不是要求架構「功能齊全」，而是攻擊目前 baseline 是否真的足以作為下一階段 formal Nook Works platform design input。

Claire 特別希望 reviewer 從 **攻擊角度 / 實作者角度** 進行，不要只做文件校稿。

## Read First｜先讀這些

必讀：

1. `README.md`
2. `agent-work/README.md`
3. `knowledge/platform/nook-works-application-architecture.md`
4. `knowledge/platform/application-platform-architecture.md`
5. `knowledge/maps/nook-technical-platform.md`
6. `notes/short-term-work.md`
7. `knowledge/platform/record-detail-pattern.md`
8. `knowledge/platform/single-record-maintenance-pattern.md`
9. `evidence/f-detail-1-findings.md`
10. `evidence/f-maint-1-findings.md`
11. `experiments/feature-query/README.md`
12. `experiments/batch-scheduling/README.md`
13. `evidence/c-bsa-1-consolidated-findings.md`

`playground.md` 是 ChatGPT Project-level context，不是 repository file；Implementation Agent / Codex 不應被要求從 repository snapshot 讀取它。Repository-local governance / Playground identity 以 `README.md` 與 `agent-work/README.md` 為本次 executor context。

若文件中引用的 Evidence / Implementation Guide 對某個 finding 是必要依據，可再按需閱讀；不要為儀式掃完整 repo。

## Context Preflight｜執行環境確認

開始 Review 前確認：

- 可讀到本 Work Order 與全部 repository-local 必讀文件。
- `knowledge/platform/nook-works-application-architecture.md` 確實為 v0.1，且包含四個 baseline archetype：Scheduled / Batch、Query、Query + Detail、Maintenance。
- Source snapshot 至少包含 commit `03406661aa30301a33755419f56f2a44599f710f`。
- 若 workspace snapshot 缺少上述 architecture commit 或任一 repository-local 必讀文件，停止並回報 `Cannot Complete`；不要 review 舊版並假裝沒差。

## Must｜必須做到

1. 對 v0.1 做 adversarial review，不以「整體合理」取代逐項攻擊。
2. 明確檢查下列 architecture boundaries：
   - Application Shell vs Feature state。
   - Feature Activation Contract 是否仍然過度抽象或責任不足。
   - Interaction Pattern vs Operation Contract vs Execution Mechanism。
   - Native Data API / View / Custom API / RPC 的 selection guidance 是否足夠、是否有誤導。
   - Maintenance Mutation Policy / Last Write Wins default 是否適合作為 Platform default candidate。
   - Validation ownership 是否會造成 browser/backend 重複或 authoritative gap。
   - Authorization separation 是否足夠支撐 implementation，而沒有把真正 Business Authorization 留成一句漂亮口號。
   - Transaction ownership guidance 是否一致且可施工。
   - Error Contract minimum categories 是否合理。
   - Audit vs Operational Observability 是否分得乾淨。
   - Batch 與 interactive operation 共用 / 不共用 responsibility 是否合理。
   - State ownership table 是否有錯置或漏掉的重要 state。
3. 從 Implementer 角度指出：若明天開始做正式 Nook Works Platform，哪些段落會讓實作者需要自己猜。
4. 主動尋找 **over-generalization**：某個 Pattern-specific conclusion 是否被偷升格成整體 Architecture Rule。
5. 主動尋找 **under-specification**：架構雖然畫了 seam，但沒有 minimum contract，導致每個 Feature 最後各寫各的。
6. 主動尋找 **provider coupling**：是否表面寫 general responsibility，實際已暗中綁死 Supabase / Netlify implementation。
7. 檢查 Deferred list 是否真的可以 deferred；如果有一個看似 deferred 的問題其實會阻擋 baseline implementation，要明確指出。
8. 對每個重要 finding 標示 impact：`Critical / High / Medium / Low`，並說明原因。
9. Findings 必須區分：
   - Evidence contradiction；
   - Architecture judgment disagreement；
   - Missing contract；
   - Implementation ambiguity；
   - Optional improvement。
10. 完整 Review 寫入 `agent-work/reports/2026-09-17-nook-works-architecture-v01-adversarial-review.md`。

## Must Not｜不得做

- 不直接修改 `knowledge/platform/nook-works-application-architecture.md`。
- 不替 Primary 做 Architecture Decision；可以 challenge / recommend，但不能直接把 Candidate 改成 Rule。
- 不開始 Nook Works production implementation。
- 不新增 Supabase / Netlify / DB object。
- 不把「我覺得業界通常如此」偽裝成 Evidence；若引用 external general knowledge，明確標示為 reviewer reasoning。
- 不因為 Master-detail / Workflow 尚未做就單純判架構不完整；只有它確實阻擋目前 baseline 成立時才列 blocker。
- 不把 UI layout / button placement 拉回 Platform Architecture scope。
- 不重寫 Playground governance / Agent Work governance。

## Suggested Method｜建議方法

1. 先用 responsibility graph 重畫一次 v0.1，看各 box 是否同一 abstraction level。
2. 逐一拿四個 baseline archetype 穿過 architecture：
   - Scheduled / Batch
   - Query
   - Query → Detail
   - Maintenance
3. 對每條 runtime path 問：
   - 誰擁有 state？
   - 誰做 authoritative validation？
   - 誰做 authorization？
   - 誰擁有 transaction？
   - error 怎麼回來？
   - provider-specific detail 在哪一層停止？
4. 再從 formal implementer 的角度做一次「假設我要開始切 module / API contract」檢查。
5. 最後整理：Keep / Revise / Downgrade to Open Contract / Remove / Need New Evidence。

## Acceptance｜可驗收條件

- [ ] Report 明確列出 overall architecture judgment，但不只給一句 PASS / FAIL。
- [ ] 至少逐一檢查四個 baseline archetype。
- [ ] 至少逐一檢查 Shell、Feature、Operation Contract、Execution Mechanism、Batch、Cross-cutting responsibility。
- [ ] 每個重要 finding 有 impact + category + evidence / reasoning。
- [ ] 有獨立的 Implementer Ambiguity section。
- [ ] 有 `Keep / Revise / Open Contract / Remove / New Evidence` summary。
- [ ] 若沒有 Critical / High finding，也必須說明為何，不得為了「有攻擊感」硬湊問題。
- [ ] Report 內不得把 reviewer opinion 寫成 Verified Evidence。
- [ ] final diff 僅新增 Review Report，不修改 architecture source 或其他 knowledge baseline。
- [ ] 有可追溯 commit identity，並形成 GitHub-visible handoff surface 供 Primary Technical QC。

## Executor Judgment｜執行者裁量

可以自行決定：

- Review 的章節順序、表格 / Mermaid 使用方式。
- 是否需要閱讀額外 Evidence 以驗證某個 claim。
- finding 的具體措辭與 severity，只要 reasoning 透明。

不得自行決定：

- Architecture / Platform Rule 的最終採用。
- 把 Deferred capability 擴成新的 Experiment / Implementation。
- 修改 Architecture source。
- 修改 formal Nook Works repository。

## External Gates｜外部驗證 Gate

- Primary Agent 必須對 Review Report 做 Technical QC。
- Claire / Primary 再共同決定哪些 finding 進 v0.2。
- Reviewer Completion 不等於 Architecture Accepted。

## Deliverables｜交付物

- Artifact / Code / Document: `agent-work/reports/2026-09-17-nook-works-architecture-v01-adversarial-review.md`
- Report: 同上
- Commit: `required`
- GitHub-visible PR / Commit: `required via Codex Product UI publication adapter`
- Other: `None`

### Durable Report Handoff Rule｜長篇回報不得丟給 Human Relay 搬運

完整 substantive review 必須寫入指定 Report path。Codex response 只保留短 handoff summary：Result、Report path、Commit SHA / change identity、publication state、External Gates Remaining。

## Report Contract｜執行後回報

完整 Report 至少包含：

1. Executive Judgment。
2. Architecture strengths worth keeping。
3. Findings，含 Severity / Category / Impact / Evidence or Reasoning / Recommendation。
4. Four-archetype walkthrough findings。
5. Implementer Ambiguities。
6. Hidden assumptions / provider coupling。
7. Deferred items that may actually block baseline, if any。
8. Summary table：`Keep / Revise / Downgrade to Open Contract / Remove / Need New Evidence`。
9. Limitations / Unknowns。

Final response 只提供短 handoff，不重貼整份 Report。

## Completion Contract｜固定結案準則

### A. Cannot Complete｜無法完成

若缺少 architecture v0.1 snapshot、任一 repository-local 必讀 context 或 execution surface 無法安全產出 durable report：停止，不猜測；回報 blocker、已完成步驟、workspace residue 與需要 Primary / Claire 處理的事項。

### B. Completed｜Executor Completion

1. 完成全部 `Must`，確認沒有違反 `Must Not`。
2. 完成指定 Review Report。
3. 檢查 final diff，確認只含授權 report artifact。
4. 建立可追溯 commit。
5. 依 Codex Product UI adapter 形成 GitHub-visible handoff surface。
6. 回報 Result、Report path、commit identity、publication state、External Gates Remaining。
7. 停止，等待 Primary Technical QC。
