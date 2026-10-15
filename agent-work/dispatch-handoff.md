# Dispatch Handoff｜Execution Adapter 研究與歷史證據

> **Historical technical reference.** 本文件保存不同 Agent execution surface 的已觀察行為與交接設計；**不是現行跨專案派工規範，也不提供私人授權**。原有 2026-09-14、2026-10-05、2026-10-09、2026-10-11 的操作敘述僅作 dated evidence，不能用來判定今天的權限或 UI。

## 研究問題

當同一份 Work Order 交給不同執行環境時，哪些資訊應該固定，哪些操作必須因 Runtime 而調整？

**Work Order 保存施工需求；Dispatch Handoff 只提供最小必要的執行入口。**

## 最小 Dispatch 資訊

- Target Repository 與 Source Baseline（可重現的 commit / ref）
- Work Order 路徑、Read First 與必要的 context access
- Task Mode：New Task 或 Existing Task continuation / REWORK
- Execution Profile：Product UI、CLI、GitHub-integrated 或 Human-supervised
- 交付目的地、需要的 GitHub-visible handoff、適用的驗收 Gate
- 本次例外與已知限制

這是**研究中的可重現資訊模型**，不是對任何私人工作流程的強制命令。實際派工必須遵守當次授權與目標 Repository 的規範。

## Context / Snapshot Boundary

```text
Work Order + Required Context + Source Baseline
                    │
                    ▼
            Execution Workspace
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
     New Task            Existing REWORK
          │                    │
          ▼                    ▼
 Read current source     Check original lineage
          │                    │
          └─────────┬──────────┘
                    ▼
             Traceable Change
                    │
                    ▼
           GitHub-visible Handoff
                    │
                    ▼
             Independent QC
```

- `Source baseline: main` 描述 dispatch 時指定的 GitHub-visible source，不表示 workspace local branch 必須叫 `main`。
- Prompt Access、Tool Access、Workspace Access 與 Provider Credential 不可混為一談。
- Existing Task 不應假設後續修改的 Repository 檔案、PR comment 或私人 Context 自動同步到原 workspace。
- 若必要 context 無法確認，應保留 blocker 與失敗證據，不猜測補齊。
- GitHub-visible commit、remote branch 與 PR 是不同發布階段；Push 成功不能推定 PR、部署或 QC 成功。

## Execution Profiles｜觀察與限制

| Profile | 可研究的 publication adapter | 必須重新確認 |
| --- | --- | --- |
| Codex Product UI | 歷史測試出現 local commit / report，再由使用者操作 Create PR 或 Update Branch | 產品 UI、workspace snapshot、權限及可用操作 |
| Codex Cloud / Git-integrated Agent | 2026-10-05 及後續測試觀察到特定環境可進行原生 Git commit / push | 本次是否真的可 push、能否建立 PR、遠端 SHA |
| CLI Agent | 在具備授權時可由執行者操作 Git 與 publication | CLI 是否存在、授權範圍與 workspace 狀態 |
| Human-supervised Agent | 由人類完成必要的 push / PR publication | 人類 Gate 是否已完成，不得假裝自動發布 |

這些是 **adapter categories 與 dated observations**，不是某個 provider 的永久功能保證。

## Historical Direct Evidence

### 2026-09-14｜Work Order 不在 execution surface

曾觀察到執行者啟動時未取得後續指定的 Work Order。這支持一項保守結論：**Primary 看得到的檔案，不保證執行者在自己的 snapshot 中也看得到。** 應驗證真正可讀的來源，而不是以連結存在當作已讀。

### 2026-09-14｜PR continuation / Update Branch

當時 Product UI 的 PR continuation 與 Update Branch 行為顯示，原工作階段和後續 GitHub 變更之間存在同步邊界。這是特定產品版本的觀察，不可擴張成所有 Agent runtime 的限制。

### 2026-10-05｜Codex Cloud execution profile

在特定 Workspace 的測試中，觀察到原生 Git commit / push 的可用性。它能縮短人工傳遞步驟，但不能推定 PR、獨立 QC 或實機驗收已完成。

## 可重用的技術判斷

1. **Governance Contract ≠ Execution Adapter.** 穩定的需求與驗收語義，不必隨每個工具介面重新發明。
2. **Executor Completion ≠ External Acceptance.** 完成回報不等於驗證通過。
3. **Historical Evidence ≠ Current Permission.** 任何過去成功的操作，仍需在當次環境重新確認。
4. **No invisible context.** 必要資料必須存在執行者實際能讀取的位置。

延伸閱讀：[Agent Work 公開索引](README.md) · [Work Order Template](templates/work-order.md) · [Experience](experience/)
