# Work Order — Public Research Presentation Architecture Review

## Metadata
- Work Order ID: `2026-10-09-public-research-presentation-architecture-review`
- Date: `2026-10-09`
- Type: `Review`
- Work Weight: `Standard`
- Primary Objective: `Independently audit and challenge the complete Repository-to-Public-Website research output, catalog, evidence, and presentation architecture.`
- Requested By: `Primary Agent / Claire`
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Source Baseline: `main containing this Work Order`
- Execution Profile: `New Codex Cloud`
- Related Phase: `Public Research Presentation Contract / discovery`
- Related Experiment / Research: `Repository-wide research publication; CF-CONNECTOR-1 as context only`
- Related Specification: `knowledge/research-catalog-publication.md`
- Related Evidence / Report: `None`
- Related PR / Issue: `None`
- Supersedes: `None`

## Objective｜目標
獨立盤點、驗證並批判 AI Playground 研究資料從 Repository 到 Public Website 的完整資訊架構與發布流程，提交有證據、有替代方案、可供 Primary 與 Claire 決策的 Architecture Review。**不要預設只需要補文件，也不要預設必須修改網站。**

分開檢查：
1. Repository / AI maintainer perspective：新接手 Agent 只依 repository-local context 能否理解研究、證據、Catalog、發布與驗證？
2. Public reader perspective：人類從網站首頁、Output 篩選、研究卡片、Result Reader、Evidence links、Live Demo 能否合理理解並追溯成果？

## Why / Context｜為什麼做
Cloudflare Connector 實驗引出 external HTTPS Live Demo 支援；其後發現「查看研究成果」實際透過 catalog `recordPath` 讀 Experiment README，不是自動開啟獨立 Evidence。既有 Experiment 有 README 內嵌 Evidence、單份獨立 Findings、多份 Evidence 等不同形態。過早提出 `evidencePath` 可能錯誤強制一對一關係。

Public Gallery 的 Output 下拉選單有 Experiment、Commentary、Technical Note、Knowledge；尚需完整確認分類的實際 Metadata、Repository content、build output 與網站展示，不得因 UI 有選項就推論已發布，也不得因 Markdown 存在就認定應成為公開卡片。

這是研究發布架構的獨立 Review，不是 Cloudflare Phase 3、UI redesign 或內容遷移任務。

## Read First｜先讀這些
1. `README.md`、`knowledge/README.md`、`agent-work/README.md`
2. `knowledge/research-catalog-publication.md`
3. `knowledge/experiment-template.md`、`knowledge/evidence-backed-technical-writing.md`、`knowledge/experiments.md`、`evidence/index.md`
4. `scripts/build-experiment-catalog.mjs`、`public/index.html`、`public/result/index.html`、`public/assets/markdown-reader.js`
5. `experiments/dayone-reader/README.md`、`experiments/dayone-native-reader/README.md`、`experiments/feature-query/README.md`、`experiments/feature-maintenance/README.md`、`experiments/application-shell/README.md`
6. `knowledge/wall/README.md` 與實際存在的 `*.catalog.json`，再按證據追讀相關 Evidence / Findings / Wall / Knowledge。
7. `agent-work/templates/work-order.md`、`agent-work/dispatch-handoff.md`（本工單治理與新版 Cloud profile）。

`playground.md` 是 ChatGPT Project File，不預設 Codex Workspace 可讀；本次以 repository-local context 為準。

## Context Preflight｜執行環境確認
- 確認 repository、source baseline 與本 Work Order 在同一可讀 snapshot；記錄 HEAD SHA。
- 確認上述必要文件存在；若個別路徑因版本差異不存在，清楚記錄並判斷是否阻斷 Review，不得假裝讀過。
- 本 Review 不需 Provider credential、Cloudflare account、Supabase mutation 或 Netlify deployment。
- 區分 Workspace static analysis、GitHub main、Netlify production、真實 Browser runtime 四種不同 evidence surface。

## Must｜必須做到
1. 盤點所有 `*.catalog.json`，列出每種 `outputType` 的實際數量、ID、來源路徑、`recordPath`，檢查 duplicate / missing / stale references；區分 metadata source、generated catalog 與 deployed catalog。
2. 追查四種 Output taxonomy 的來源、schema / validation、builder、homepage filters 與各自實際內容；特別回答 Technical Note、Knowledge 是已發布、未發布內容還是僅支援的類型。不能把未建 Catalog 的 Markdown 自動認定為漏發。
3. 追蹤 Repository → Catalog Builder → Public Catalog → Homepage → Result Reader → Markdown links / Evidence → Live Demo 的資料流；記錄 local / external demo 行為與 build-time vs runtime version boundary。
4. 抽查足夠多的不同 Experiment / Wall / Evidence 組織案例，明確分析 0、1、多份獨立 Evidence 的可能性及既有導覽能力。
5. 逐項比較 existing documented contracts 與 actual implementation，區分 already covered、documentation gap、behavioral mismatch、intentional flexibility、unknown。
6. 以新接手 AI 與 Public Reader 兩個視角提出具體 Findings，包含可追溯 file:line、影響、嚴重度、證據或 reviewer reasoning；標示尚未實測的 Browser / Deploy claims。
7. 提交獨立 Recommendations：至少比較維持現狀、補既有 Publication Contract、獨立 Presentation Contract、強化 Bootstrap / reading path 等可行方案；可提出其他有證據支持的方案。
8. Recommendations 必須分成 must-fix、worth-improving、defer / needs evidence、keep-as-is；列出替代方案、相容性與 migration impact、最小必要修改範圍。
9. 主動挑戰 Primary 既有偏好，不以 `evidencePath`、新 UI、新分類或新文件為預設答案；指出現有設計值得保留的部分。
10. 完整報告寫入 `agent-work/reports/2026-10-09-public-research-presentation-architecture-review.md`。

## Must Not｜不得做
- 不修改任何既有 Repository source、README、Contract、Catalog、Experiment、Evidence、Website、Builder、workflow 或設定。
- 不新增 `evidencePath`、不建立新 UI、不重新分類或遷移既有研究、不實作建議。
- 不接手 Cloudflare Worker / D1 / SQL / Phase 3、Supabase 或 Netlify 實驗。
- 不執行 deployment、正式資料 mutation 或 provider configuration change。
- 不把 reviewer preference、靜態推論、Agent report 偽裝成 browser / deployment verified evidence。
- 不為了湊 finding 而要求 speculative framework；不要擅自做 Architecture Decision。
- final diff 只允許新增本 Work Order 指定的 Review Report。

## Suggested Method｜建議方法
1. 先建立 machine-readable inventory（file paths / JSON types / links），再人工抽查異常。
2. 從 Catalog metadata / builder / homepage / reader 雙向追查每條資料流。
3. 按不同 outputType、Evidence 組織方式及 Demo 模式選取代表案例。
4. 以兩種讀者視角做 adversarial pass，將缺口與現有能力分開。
5. 最後比較最小文件補強、獨立 Contract、無需修改與需要進一步實驗的情況。
此方法為建議，executor 可採更有效的安全方式。

## Acceptance｜可驗收條件
- [ ] 完整 Catalog inventory 與四種 Output 分類統計，含來源與 baseline。
- [ ] 明確說明 Technical Note / Knowledge 的實際現況及未公開文件的判斷限制。
- [ ] Repository-to-Public data flow、Reader link behavior、Demo / build / runtime boundaries 可追溯到 source。
- [ ] 代表性 Experiment / Evidence / Wall 組織案例與多對多／非一對一分析。
- [ ] Existing coverage vs true gaps 的逐項對照。
- [ ] 兩種視角的 findings，有 severity、impact、source evidence / reasoning、unknown。
- [ ] 有獨立方案比較、prioritized recommendations、keep / defer / no-change 選項。
- [ ] 對 browser / deployment 未實測項目沒有過度宣稱。
- [ ] final diff 僅新增 Review Report；有 traceable commit 與 GitHub-visible handoff。

## Executor Judgment｜執行者裁量
可自行選擇盤點工具、review technique、抽查樣本、章節與圖表，以及獨立提出替代架構。不得自行修改正式設計、擴大實作範圍或升格 reviewer opinion。

## External Gates｜外部驗證 Gate
- Primary 以 GitHub-visible Report 做 Technical QC、抽查關鍵 Evidence 與分類統計。
- Claire 與 Primary 共同決定是否採納建議、是否需要 Browser / Netlify live verification、以及後續 Contract 修改。
- Review Completed 不等於 Architecture Accepted、Production Verified 或 Browser Verified。

## Deliverables｜交付物
- Artifact / Code / Document: `agent-work/reports/2026-10-09-public-research-presentation-architecture-review.md`（僅此新增檔案）
- Report: 同上
- Commit: required
- GitHub-visible PR / Commit: required，依 New Codex Cloud adapter 由 Claire 使用「建立草稿 PR」完成 publication gate
- Other: None

### Durable Report Handoff Rule
完整 Review 必須存在上述 repository report path；executor final response 僅回報 Result、Report path、local commit / publication state、limitations 與 External Gates Remaining。Claire 不負責複製長篇報告。

## Report Contract｜執行後回報
報告至少包含：Executive Assessment；Baseline / Method / Coverage；Catalog Inventory & Output Taxonomy；As-Is Data Flow；Experiment / Evidence / Wall Cases；Existing Contract Coverage vs Gaps；AI Maintainer Findings；Public Reader Findings；Strengths to Preserve；Prioritized Recommendations & Alternatives；Unknown / Verification Boundaries。重要 finding 標示 severity、category、source:line evidence 與 reasoning；不要將 opinion 偽裝成 fact。

## Completion Contract｜固定結案準則
### A. Cannot Complete｜無法完成
若必要 source snapshot、context、workspace 或 durable report publication capability 不足，停止，不猜測；回報 blocker、attempt、已觀察 evidence、workspace residue 與需要決策事項。不為製造 commit 而亂改其他檔案。

### B. Completed｜Executor Completion
完成 Must / Acceptance、檢查 Must Not、完成完整 Report，確認 final diff 僅新增授權 report，建立 traceable local commit，依 New Codex Cloud execution profile 交付 publication handoff，然後停止等待 Primary Technical QC。Completed 不代表 External Gates 已通過。
