# AI Playground

Public research factory for technical exploration, experiments, proofs of concept, and reproducible evidence.

This repository is **not** a Development, Test, UAT, or Production environment. Its durable output is research records, evidence, and reusable technical findings, not production-ready code.

## Research Factory｜研究工廠

`ai-playground` 保存公開技術研究的問題、實驗方法、測試結果、失敗經驗與目前判斷。研究結論應能從公開紀錄追溯其條件、證據與限制；實驗成功不代表已經形成正式產品決策。

本 Repository 的導覽只涵蓋自身的研究、工作與成果。不提供私人工作空間、外部帳號、內部知識庫或其他非公開資源的位置與操作指引。

## Navigation｜研究、工作與證據

| 目的 | 公開入口 |
| --- | --- |
| 研究主題、知識分類與研究地圖 | [Knowledge Index](knowledge/README.md)、[Research Maps](knowledge/maps/) |
| 實驗項目、研究目的與方法 | [Experiments Index](knowledge/experiments.md)、[Experiment Records](experiments/) |
| 實驗成立、Catalog 與公開站台發布 | [Research Catalog & Publication](knowledge/research-catalog-publication.md) |
| 實驗結果與可追溯證據 | [Evidence Index](evidence/index.md) |
| 已整理的公開實作方法 | [Implementation Knowledge](knowledge/implementation/) |
| Wall Writing：撰寫、修改、回想文章及作品記錄 | [Wall Writing & Article Index](knowledge/wall/README.md) |
| 本 Repository 的工作項目與交付紀錄 | [Agent Work](agent-work/README.md) |
| 短期研究工作紀錄 | [Short-term Work](notes/short-term-work.md) |

依研究問題按需閱讀，不需要將整個 Repository 當成必讀手冊。

## Research Method｜研究紀錄原則

```text
Research Question
    ↓
Candidate / Hypothesis
    ↓
Experiment
    ↓
Evidence
    ↓
Current Judgment
    ↓
Technical Decision Candidate
```

- **Experiment Record** 應說明目的、測試條件、方法、結果、失敗經驗與限制。
- **Evidence** 應能支持或反駁具體結論；未驗證的推測必須明確標示。
- **Current Judgment** 會隨新證據修正，不等同永久保證或正式採用。
- **Technical Decision Candidate** 仍需在實際採用環境中重新評估。

**公開報告採輕量分享原則：** 清楚說明過程、結果與心得即可，不以學術論文或稽核報告規格要求逐筆舉證；實際測試仍須誠實，不公開私人資源連結與內部識別資訊。詳見 [Research Catalog & Publication](knowledge/research-catalog-publication.md)。

研究紀錄與索引的細部規則見 [Knowledge Index](knowledge/README.md)。

## Repository Structure｜公開研究資產

| 目錄 | 用途 |
| --- | --- |
| `knowledge/` | 研究索引、研究地圖、公開方法與文章索引 |
| `experiments/` | 實驗紀錄、測試方法與結果 |
| `evidence/` | 研究證據索引 |
| `agent-work/` | 本 Repository 的工作項目、交付與可公開的執行紀錄 |
| `public/` | 瀏覽器展示與可觀察的實驗成果 |
| `scripts/`、`tests/` | 研究工具、建置與測試 |
| `netlify/`、`supabase/` | 實驗用途的部署來源 |
| `.github/workflows/` | Repository 自身的自動化工作流程 |
| `notes/` | 短期工作紀錄 |

展示頁面與暫時性執行資產可以在完成證據保存後退役；研究紀錄與證據應保留必要的可追溯性。

## Public Data Boundary｜公開資料邊界

**Treat everything in this repository as public.**

不得提交密碼、Token、API Key、Private Key、個人或機密資料、私人資源路徑、內部帳號與工作空間位置，或正式環境的敏感設定。需要使用敏感資料的研究，應改用適當的非公開環境；公開成果只保留必要且經過處理的技術方法與證據。

外部技術文件、公開標準及官方 API 文件可以作為研究引用；不應以私人資源連結作為理解本 Repository 的前提。

## Changes & Validation｜變更與驗證

對研究紀錄、實驗程式、公開展示或自動化流程的修改，應依工作範圍取得必要授權，並在交付前驗證相關索引、連結、測試與發布影響。工作項目與交付方式見 [Agent Work](agent-work/README.md)；實驗 Catalog 與站台發布方式見 [Research Catalog & Publication](knowledge/research-catalog-publication.md)。

**研究工廠負責留下可檢驗的研究成果，不負責替任何個人或助理保存身分與交接指引。**
