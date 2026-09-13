# Agent Reports｜Agent-to-Agent 留言板

這個目錄保存 Engineering Agent 之間需要長篇交換、可被另一個 Agent 重新閱讀與 Review 的分析報告。

它不是新的 Project Management System，也不是聊天紀錄備份區。目的只有一個：

> **不要讓 Claire 成為兩個 Agent 之間的人肉剪貼簿。**

## 何時使用 Report

適合留下 Report 的工作：

- Investigation / Failure Analysis
- Technical Review
- Repository Audit
- Experiment Result Analysis
- 多段 Evidence / Hypothesis / Unknown 的整理
- Primary Agent 需要後續獨立 Review 的分析結果

不需要為一句簡單 Result 建 Report。若輸出只有「測試成功」或一個短 Observation，放在既有 Work Order / PR 說明即可。

## 建議命名

```text
agent-work/reports/YYYY-MM-DD-<topic>-<purpose>.md
```

例如：

```text
agent-work/reports/2026-09-13-netlify-trigger-boundary-review.md
```

## 最小內容

Report 不要求固定表格，但至少應讓另一個 Agent 分得清楚：

- **Context**：在回答什麼問題。
- **Evidence**：已直接觀察到什麼。
- **Inference**：基於 Git / Provider / Runtime semantics 推論什麼。
- **Unknown**：哪些事情仍沒有證據。
- **Candidate Judgment**：目前最合理的解釋或選項。
- **Recommended Next Probe**：若需要繼續驗證，下一步最小實驗是什麼。

## Evidence Rule

Agent Report 是可審查的 Handoff Artifact，但仍不是 Provider Truth。

> **Agent Report ≠ Verified Evidence.**

Primary Agent 應回到 GitHub Diff、Provider Log、Runtime Output、Screenshot、Test Result 等原始 Evidence 做 Technical QC。

若 Report 只是分析既有 Evidence，Report 自身不應把 Candidate Conclusion 升格成 `Verified`。

## Codex Cloud 使用方式

截至 2026-09-13，若 Codex 被要求扮演 Technical Reviewer / Investigator，而結果超過短篇回覆，優先要求它：

1. 讀 Work Order 與既有 Evidence。
2. 不修改 Product / Experiment Source，除非 Work Order 明確授權。
3. 將分析寫入 `agent-work/reports/`。
4. 建立 local commit。
5. 正常完成 Task。
6. 由 Claire 使用 Codex Product UI **Create PR**。
7. Primary Agent 直接從 GitHub Review Report。

這樣 Human Relay 只需要選 Repository / Branch、貼短 Dispatch Prompt、按 Create PR，不需要手動複製多段 Codex 聊天內容。

## Report 與 Work Order 的關係

- Work Order = **要做什麼、哪些邊界不能越過**。
- Report = **做完後觀察到什麼、如何分析、還不知道什麼**。
- PR = **讓成果成為 GitHub-visible Observable Handoff**。
- Primary Agent Review = **決定哪些內容可被接受為 Evidence / Judgment**。

不要把 Report 寫成第二份 Specification，也不要把聊天內容整坨倒進 Git。Git 是布告欄，不是家庭監視器。
