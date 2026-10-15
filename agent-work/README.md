# Agent Work｜公開委派工程研究與歷史紀錄

本目錄保存 AI Agent 工程委派的**公開方法、實驗、交付證據與歷史 Work Order**。它不是私人協作總部、即時派工入口、個人授權規範或跨 Repository 的唯一契約來源。

## 研究主題

- **Work Order as Handoff Contract**：用明確的任務目標、Source Baseline、Read First、Must / Must Not、Acceptance 與 Executor Judgment，減少執行者猜測。
- **Execution Profile**：區分 Codex Product UI、CLI、GitHub-integrated Agent 與人類協助的執行環境；不要把單一介面的限制當成所有 Agent 的定律。
- **Observable Handoff**：Commit、Branch、Pull Request（PR）與可持久閱讀的報告，提供獨立檢查的依據。
- **Evidence Boundary**：Executor Completed、Technical QC、部署、實機驗收與研究 Verified 是不同階段。
- **Failure as Evidence**：保留 blocker、attempt、failure evidence、workspace residue 與未知事項。

> **Experiment Ownership ≠ Experiment Execution.**  
> **Agent Report ≠ Verified Evidence.**  
> **Reduce ceremony, not boundaries.**

## 公開文件導覽

| 資源 | 用途 |
| --- | --- |
| [Work Order Catalog](work-orders/index.md) | 已發布的歷史任務與相關報告 |
| [Work Order Template](templates/work-order.md) | 依正式 Master 段落同步的公開範例；不自行制定跨專案規範 |
| [Delivery Contract](delivery-contract.md) | 公開交付類型與可驗證交接的技術說明 |
| [Dispatch Handoff](dispatch-handoff.md) | 有日期的 execution adapter、snapshot 與歷史觀察 |
| [Experience](experience/) | 實際執行環境、工具行為與研究回饋 |
| [Report Language Guideline](report-language-guideline.txt) | 本 Repository 歷史報告的語言約定 |

## Work Order 的技術結構

```text
Research / Requirement / Scope
              │
              ▼
     Reproducible Work Order
              │
              ▼
    Executor Context Preflight
              │
       ┌──────┴──────┐
       ▼             ▼
 Cannot Complete   Implementation / Investigation
       │             │
       ▼             ▼
 Failure Evidence   Traceable Handoff
                     │
                     ▼
                Technical QC
                     │
                     ▼
          External Gates（如適用）
```

Work Order 用來保存**當時授權的任務範圍與可驗收條件**，不是進度看板，也不是 Worker KPI。歷史文件保留原本的 execution profile、當時的限制與已知結果，不追溯套用後來的制度。

## 技術判斷與限制

1. `Completed` 只代表執行者完成自身範圍，不自動證明 QC、部署或人類驗收通過。
2. Source Baseline 是可重現的來源狀態，不要求每種 workspace 的本機分支名稱一致。
3. Prompt Access、Tool Access、Workspace Access 與授權憑證是不同能力。
4. Commit、Push、PR、Preview、Runtime Test 與 Browser Verification 應各自取得證據，不可互相推定。
5. Execution adapter 隨產品版本與權限改變。過去的 UI 操作是 dated evidence，不是今天的能力保證。
6. 正式工作若涉及私人規範，應由當次任務的授權來源提供必要 context；公開研究範例不替任何私人規範背書。

## Repository 邊界

本目錄的歷史 Work Order、Report 與 Experience 可供研究引用，但不因此成為其他 Repository 的正式實作規格。實際施工以目標 Repository 的現行規則、任務授權與當次工具能力為準。

研究結論要能追溯來源；未驗證的推論保持 Candidate / Open。這比讓每份文件都自稱 canonical 可靠得多。
