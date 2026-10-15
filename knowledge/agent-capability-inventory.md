# Capability Research Index｜工具能力與實測邊界

> **Public research navigation / historical path compatibility**  
> Updated: 2026-10-15  
> Former title: Primary Agent Capability Inventory

本文件原本混合了 AI 啟動指令、私人協作操作規範、工具狀態與公開研究成果。公開 Repository 現在只保留**研究證據與技術方法的導航**；不再將此檔案視為任何 AI 的 startup contract、即時權限清單或內部操作手冊。

保留原路徑是為了讓既有引用仍可抵達公開研究資料，而不是宣稱原有私人操作內容仍適合公開。

## 如何判斷工具能力

工具是否可用，取決於當次的連線、權限、產品版本、執行環境與可取得的驗證證據。歷史實驗只能證明**當時、在特定條件下**觀察到的行為，不能替今天的執行權限背書。

研究時可以分別檢查：

| Dimension | 研究問題 |
| --- | --- |
| Discovery | 是否存在對應的工具或 API？ |
| Read / Write | 能讀取或改變哪些資源？ |
| Authorization | 授權範圍與限制是什麼？ |
| Runtime | 操作在哪個環境執行？ |
| Evidence | 成功或失敗如何驗證？ |
| Cost / Quota | 是否受方案、用量或費用限制？ |
| Transport | 文字、檔案、二進位資料能否在不同環境之間傳遞？ |

**API 可見、權限已授予、操作成功、結果已驗證，是不同層次。**

## 已有公開研究與可重用方法

### Cloudflare Connector、Workers 與 D1

- [CF-CONNECTOR-1｜Cloudflare Connector × Worker API × D1 × Netlify](../experiments/cloudflare-direct-control/README.md)
- 記錄在特定測試條件下，以 Connector 操作 Worker 與 D1，並由網頁進行實機驗證的過程。
- Cloudflare 帳號資源清單、共用資料庫識別碼與內部資源管理政策，不屬於公開研究導航。

### Artifact Transport、Dropbox PDF 與 GitHub Actions

- [A-ARTIFACT-1｜Artifact Transport Experiment](../experiments/artifact-transport/README.md)
- [Artifact Transport and Publication Pattern](implementation/artifact-collaboration-workflow.md)
- [Dropbox PDF Reading Boundary](implementation/dropbox-pdf-reading-boundary.md)
- [Artifact Workspace Lifecycle Evidence](implementation/primary-workspace-housekeeping.md)

這些資料記錄不同資料流方向的能力邊界：能 preview 或取得 temporary URL，不代表已能把既有 binary 載入另一個處理環境；某個方向的傳輸失敗，也不等於反方向必然失敗。

公開批次發布機制的程式與契約：

- [Artifact Batch Publish Workflow](../.github/workflows/collab-artifact-batch-publish.yml)
- [Artifact Batch Publish Schema](../.github/workflow-contracts/artifact-batch-publish.schema.json)

實際執行時仍須檢查當前授權、來源 URL 有效性、目的路徑限制與結果完整性。這裡不規定私人工作區路徑、人工授權流程或內部角色分工。

### iPad-first Markdown Authoring

- [Textastic Markdown Experiment](../experiments/textastic-markdown/README.md)
- [Textastic Technical Workbench Wall](wall/textastic-markdown-technical-workbench.md)

已公開的實驗包含 Mermaid 圖表、手動列印分頁，以及明確 language fence 的 syntax highlighting。具體支援範圍以實驗紀錄與原始檔為準，不應擴大解讀為所有 Markdown renderer 都具備相同行為。

### Markdown 到 PDF

- [Markdown → PDF Rendering Pattern](implementation/markdown-to-pdf.md)
- [Renderer Source](../scripts/render-markdown-pdf.py)

可重用方法包含繁體中文排版、表格、程式碼語法標示、手動分頁、受限的 Mermaid flowchart、圖片嵌入與可見的缺圖替代。實際輸出仍需要檢查來源圖片是否可取得、字型與頁面呈現是否正確。

### GitHub Repository 到公開網站

- [從 GitHub Repository 到公開研究網站](wall/ai-playground-home-architecture.md)
- [Research Catalog Publication Contract](research-catalog-publication.md)

研究主 Markdown、Catalog metadata、建置產物與網站部署屬於不同責任層次。Repository commit、Catalog build、站台部署與瀏覽器驗收應分開驗證。

## 本文件不再負責的內容

- AI 跨對話身分恢復、啟動順序或記憶載入指令。
- 私人 Repository 的操作導覽與內部知識路由。
- 個人 Dropbox / Notion 工作區結構、資源識別碼與內部協作授權。
- 即時 Connector 權限保證、派工規則或人員分工。

上述內容如仍需使用，應由相應**私人且持續維護**的操作文件負責；不能把本公開索引當作現行權威。

## 研究原則

> **歷史能力證據，不等於當前可執行權限。**

> **公開研究保存可重現的方法，不保存私人操作身分。**

本頁是公開研究導航，不是完整安全稽核報告；其他歷史 Experiment / Wall / Agent Work 文件仍需各自檢查是否包含不適合公開的操作細節。
