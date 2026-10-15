# Agent Delivery Types｜公開交付與驗證模型

> **Public technical reference / historical compatibility path.**  
> 本文件說明 Agent 委派研究中使用的交付分類與可驗證交接方式。它不是跨 Repository 的私人協作契約，也不授權任何 Agent 修改資料、建立 PR 或執行部署。實際施工須依當次任務授權、可讀的現行規範及目標 Repository 的要求。

## Dispatch Channel 與 Delivery Type 是不同維度

任務透過何種介面傳遞，不會自動決定成果應放在哪裡、需要哪些驗證，也不表示執行者取得了寫入權限。

| Delivery Type | 研究中的交付目的 | 可觀察的 handoff |
| --- | --- | --- |
| `NOTION_REPORT` | 在指定的持久文件頁面交付調查、分析或審閱 | 頁面／訊息 ID、讀回確認、未知事項；不暗示有 Git 變更 |
| `DOC_DELIVERY` | Repository 中的文件或研究紀錄修改 | 變更檔案、Branch／Commit／遠端 SHA、Diff review、限制 |
| `CODE_DELIVERY` | 程式、腳本、行為、部署／基礎設施設定、資料庫遷移或安全相關變更 | 專用 Branch、Commit、Push、PR、獨立 Technical QC 與適用驗收 |

混合程式與文件的變更，應按行為相關修改評估風險。表格描述既有研究採用的分類，**不取代當次正式授權或更嚴格的 Repository 規則**。

## Publication 與驗證是不同階段

```text
Executor Scope Completed
          │
          ▼
   Traceable Artifact
          │
          ▼
 Remote Publication Confirmed
          │
          ▼
   Independent Diff / PR QC
          │
          ▼
   External Gates (if needed)
          │
          ▼
    Accepted / Verified
```

- Local commit 不等於 remote push。
- Branch push 不等於 PR 已建立。
- PR 不等於 Merge、Preview、Deployment 或 Runtime Test 通過。
- Executor report 只能證明其回報內容，不能代替獨立驗證。
- `Completed` 表示 executor 的 scope 結束，不表示其他 Gate 已通過。
- 缺少必要 Context、權限或 publication capability 時，應明確保留 blocker，不默默降級交付方式。

## 可重現交接的最小證據

- 任務的 `Delivery Type(s)`、Target Repository、Source Baseline、Scope 與驗收條件
- 執行者實際讀取的來源與無法取得的 Context
- Branch、遠端 SHA、變更路徑及 Diff／PR URL（適用時）
- Tests、observations、failure evidence 與尚未完成的 External Gates
- 無法完成時的 blocker、已嘗試步驟與 workspace residue

## 使用邊界

這些模式來自特定時期的 Agent Work 研究。不同執行環境可能不支援相同的 Git 或 PR 操作；是否需要人工協助、如何處理權限、由誰 Merge，都不能由這份公開文件推定。

本公開版本與任何私人正式契約**不是同步副本，也不宣稱擁有跨專案權威**。公開方法可供研究與參考；正式任務仍需讀取當次有效的規範。

延伸閱讀：[Agent Work Index](README.md) · [Dispatch Execution Adapter Evidence](dispatch-handoff.md) · [Work Order Template](templates/work-order.md)
