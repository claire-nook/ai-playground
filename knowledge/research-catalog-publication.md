# Research Catalog Publication Contract｜實驗成立與站台發布

> **必讀時機：** 新增 Experiment / Wall Research Output、修改 Catalog 狀態、宣稱站台已發布之前。這是 authoring / publication contract，不是 Formal Specification。

## 現行 Web 架構與自助檢查｜新增實驗前先讀（2026-10-11）

本節是 Primary 自助理解站台的入口，不必每次請 Implementation Agent 重做架構 Review。**以下描述已從目前 Repo 的 `netlify.toml`、`scripts/build-experiment-catalog.mjs`、`scripts/check-experiment-integrity.mjs`、`public/index.html` 讀取確認；若原始碼改變，以當前原始碼為準。**

```text
experiments/**/README.md        → 人類可讀的實驗主紀錄
knowledge/experiments.md        → 人工維護的研究目錄
experiments/**/*.catalog.json  ┐
knowledge/wall/**/*.catalog.json ┴→ scripts/build-experiment-catalog.mjs
                                    → public/research-catalog.json
                                    → public/experiment-catalog.json（相容輸出）
public/index.html               → 站台首頁／研究成果入口
public/assets/                 → 前端樣式與閱讀器腳本
public/                         → Netlify 靜態發布根目錄
```

- **建置來源與部署：** `netlify.toml` 指定 `node scripts/build-experiment-catalog.mjs`，發布 `public/`；`*.catalog.json` 才是站台研究卡片的機器可讀來源。`public/research-catalog.json` 是建置產物，不是手工資料庫。
- **觸發邊界：** `netlify.toml` 的 ignore 規則依變更路徑判斷是否需要部署。單純修改研究 Markdown 通常不觸發站台更新；`public/`、Catalog metadata、Builder、Netlify 設定等部署相關路徑會觸發，遇到無法判斷的 Git 狀態有保守部署分支。**這是程式設定，不等於已觀察到本次實際部署。**
- **網站閱讀器：** `public/index.html` 載入 `public/assets/markdown-reader.js`、樣式，以及 marked、DOMPurify、Mermaid 等前端函式庫。不要把 Markdown 文件本身誤認成站台卡片資料來源，也不要未看原始碼就宣稱所有 Markdown 都會自動公開成卡片。
- **完整性檢查：** `scripts/check-experiment-integrity.mjs` 是唯讀檢查，確認明確宣告的實驗 ID、Catalog 與人工索引的部分對應；**不保證**所有延伸連結、內容品質、實測證據、部署或網站呈現正確。
- **Primary 的自助閱讀順序：** 本文件 → `netlify.toml` → Builder → Checker → `public/index.html`／相關 `public/assets/`。只有涉及具體異常或架構改造、需要額外獨立驗證時才委派 Review；不為了回想目前 Web 架構而例行派工。

## 實驗知識保存與可審閱性｜2026-10-11

- 一個正式實驗以一份主 Record 為閱讀入口。主檔應讓沒有參與當時對話的 Primary 與參與實驗的 Claire 都能理解：**目的、實際過程、失敗／否決理由、觀察證據、未驗證部分與目前結論**。
- Findings／Evidence 保存詳細觀察與可追溯條件；跨實驗可重用的 Platform Pattern／Knowledge 保存歸納後的設計規則。**分工不同就保留獨立文件**，不因文字有交集便強制合併；同一事實重複貼成多份平行主紀錄則應整理。
- 將「實際觀察」「候選設計」「正式採納」清楚分開。負面結果與 Claire 的反對理由也是研究成果，不得在整理時洗成成功故事。
- 文件應以 Claire 能審閱的方式撰寫，技術識別碼、路徑與程式介面保留原樣。**是否將繁體中文升為全 Repo 強制規則仍待 Claire 決定**；本次不追溯改寫所有歷史文件。
- 更新主檔或延伸文件後，人工確認彼此連結、結論一致且無不必要的重複；Checker 不能代替這項人工審閱。

## Two catalogs, different jobs

- `knowledge/experiments.md`：人與 AI 閱讀的研究目錄，記錄 Why / Status / Links。
- `experiments/<topic>/*.catalog.json`（Wall 類在 `knowledge/wall/`）：**站台目錄的唯一機器可讀輸入**。
- `scripts/build-experiment-catalog.mjs`：實際驗證規則與排序的 executable source of truth；本文件只說明操作方式，若程式變更應同步更新本文件。
- Build 輸出：`public/research-catalog.json` 與相容性 `public/experiment-catalog.json`。不要把這兩個產物當成應手動編輯的 source。

**建立 Experiment Record + 更新 Markdown Catalog，不會自動讓站台顯示新實驗。** 缺少 `*.catalog.json` 時，建置程式可能正常成功但沒有該項目。無效的 JSON / 狀態則會令 build fail。這是不同故障型態。

## Establish an experiment｜成立實驗最小步驟

1. 建立主 Experiment Record；可以是持續更新的 README，也可以是連結其他文件的摘要／目錄。不強制拆計畫、日誌、結論或 Evidence。
2. 主 Record 宣告穩定 ID 與卡片／索引意圖（下節）。新正式實驗即使不設卡片也須宣告；沿用既有 ID，不重新編號。
3. 若 `card=required`，同批新增 `<id>.catalog.json`。若 `card=none`，不建獨立卡片；不是隱私分類，Repo 本身公開，非公開討論留 Notion。
4. 人工維護 `knowledge/experiments.md` 的 Why / Status / Links；short-term 依工作狀態、有新 Evidence 才維護 Evidence Index。不要自動覆蓋摘要。
5. 從 repo root 執行 `node scripts/check-experiment-integrity.mjs`；需要卡片時再跑 `node scripts/build-experiment-catalog.mjs`，確認輸出含預期 ID。Checker 唯讀；Builder 寫產生的 Catalog，不修改人工 Index。
6. 按 Delivery Contract 完成遠端交付／QC，再分別確認下方四道證據 gate。未取得部署／站台證據前不能宣稱網站發布完成。

## Primary Record vs supporting Markdown｜主檔與延伸文件

正常情況 **1 個正式 Experiment ID 對應 1 份 Primary Experiment Record**；實驗成立到結案持續更新同一主 Markdown。主檔可承載完整紀錄，也可只保存摘要與閱讀入口，Catalog 的 `recordPath` 與人工 Experiment Index 都指向它。

內容需要延伸時，用普通 Markdown links 連到第二、第三份或更深的文件；可以是 Evidence、實驗總結、測試紀錄或技術說明，沒有固定檔數／類型／深度。**延伸文件不需要獨立 ID、metadata 或 Experiment Index entry；Checker 不追蹤主 Record／延伸文件的 link graph，也不勾稽延伸 target 的存在性或內容。** 即使延伸檔名為 README.md，仍不從檔名推斷它是正式實驗。人工 Index 中附帶的普通延伸 link 也不納管；必要的主 Record／Catalog 對應仍須正確。閱讀連結是否可用由作者／人工 QC 確認，沒有第二／三層檢查器或附件管理系統。

只有**另有明確獨立 Experiment ID 宣告**的真正子實驗，才有自己的 primary Record 與必要登錄，並可用 `indexId` 登錄在父項目下。一般 Evidence／附件不是子實驗，不放 Experiment 宣告或套用 `indexId`。Checker 搜尋 Markdown 中的明確宣告以發現 identity，不代表對沒有宣告的普通文件建立身分／登錄要求；不從標題或目錄層級猜子實驗。

歷史 C-DB-1 / C-EXT-1 共用 Record 保留相容，不強制遷移；未來預設一實驗一主檔。Evidence / Evidence Record 不新增強制分類或身分管理，歷史雙文件實驗不在本次歸併。

## Canonical Experiment ID｜明確宣告與相容邊界

在主 Record 的 Markdown code fence **外**放 HTML comment；其中 JSON 必須完整，不從標題猜 ID：

```html
<!-- experiment: {"id":"EXAMPLE-1","card":"required","index":"required"} -->
```

`EXAMPLE-1` 僅為示意，不新增到 Repo。ID 使用英數與連字號（`[A-Za-z0-9][A-Za-z0-9-]*`），大小寫敏感、穩定且全 Repo 唯一；存在 Catalog 時以原 `id` 為準。宣告所在檔案就是 primary Record，Catalog `recordPath` 必須相同，不另造一份中央 ID 表。

- `card`: `required`（明確要求卡片；沒有 metadata 即 ERROR）、`none`（明確不設獨立卡片）、`unknown`（尚未決定，只 WARN）。設卡片與正式實驗身分分開。
- `index`: `required`（需人類 Index heading + Record link）、`unknown`（歷史登錄意圖待確認，只 WARN）。新正式實驗應使用 `required`，不以 `unknown` 規避新實驗登錄。
- 人類 Index 格式維持 `### ID — 名稱` 與其下明確的 repo-relative 主 Record link。保留研究摘要；不能只放 metadata link。
- 共用 Record：在同一檔放多個不同 ID 宣告，各自對應原 Catalog。如 C-DB-1 / C-EXT-1，不要求一實驗一檔。
- 子實驗可以無卡，並以 `indexId` 明確指定既有人類 Index 的父項目。示意（非現存實驗）：`{"id":"EXAMPLE-CHILD-1","card":"none","index":"required","indexId":"EXAMPLE-PARENT-1"}`；父 heading 必須連結子 Record，父 ID 也須已宣告或有既有 Catalog。不冒充另有獨立 Index entry。

唯讀 CLI：`node scripts/check-experiment-integrity.mjs [--root <repository>]`。Exit 0 = 無 ERROR（仍可能有 WARN）；1 = 勾稽錯誤；2 = 用法／讀取失敗。檢查宣告重複、Catalog ID 重複、recordPath 存在／一致、必要的主 Record／Catalog Index 對應斷連結／身分與 target 不符、以及**有明確意圖**的漏 metadata／Index。它不評估 Evidence 強度、摘要品質或站台部署，也沒有新 Action／排程／自動 commit。Builder 的 target 存在防呆仍無法發現整份 metadata 漏建。

**本次漸進採用，不假裝歷史全覆蓋：**11 個已知 ID 已在 10 份 Record 宣告（9 個現有人類 Index 主項目、Custom API 的 2 個共用 ID；CF-ORACLE-1 已併入 CF-CONNECTOR-1）。其餘 7 個 Catalog ID：A、B、B-1、C-BSA-1、C-NF-0、D-BATCH-1、P-CODEX-PHONE，暫保留 `LEGACY_CATALOG_ID` WARN，下一次編輯時由作者確認登錄意圖。C-DB-1 / C-EXT-1 尚無獨立人類 Index entry，明確 `index=unknown`，不自動補摘要。GitHub Actions、Netlify Deployment Boundary、Netlify Trigger Boundary 的 3 份歷史 README 尚無明確 ID／卡片意圖，作為既知歷史未明項目由人工保留，不再對未宣告 README 輸出 `UNCLASSIFIED_RECORD`（避免普通延伸文件誤報）；不要猜 ID 或因此自動建卡。現有基準：18 experiment Catalog、0 ERROR / 9 WARN；這是例外清單，**不是允許新實驗免宣告**。完全漏建 Record 仍需派工／人工 QC 發現。

## Required metadata & status semantics

`*.catalog.json` 的必要非空字串：`id`、`title`、`summary`、`recordPath`、`demoStatus`、`verificationStatus`；`tags` 必須是非空、沒有空字串或大小寫不敏感重複值的字串陣列。

| Field | Allowed values / rule |
| --- | --- |
| `verificationStatus` | **`candidate` / `partial` / `verified`**（小寫，沒有 `in-progress`、`completed`） |
| `demoStatus` | **`planned` / `none` / `live` / `retired`**（描述 Demo，不描述 Evidence 強度） |
| `completedDate` | `candidate` 時省略或 `null`；`partial` / `verified` 時必須為真實有效的 `YYYY-MM-DD` |
| `outputType` | `experiment` / `commentary` / `technical-note` / `knowledge`；省略預設 `experiment` |
| `researchMethod` | `controlled-experiment` / `field-verification` / `analysis` / `synthesis`；省略預設 `controlled-experiment` |
| `recordPath` | Repo-relative `.md` path，不得 absolute 或含 `..`；experiment 類須以 `experiments/` 開頭 |
| `demoPath` | `demoStatus=live` 必填站內絕對路徑（不可 `//` 開頭）或外部 HTTPS URL；其他狀態須省略或 `null`。禁止 HTTP 與其他 scheme。 |
| `flow` | 選填；有填則必須是非空字串 |

**Experiment Record 的人類工作狀態 ≠ 網站 `verificationStatus`。** Record 可以寫 `Candidate / In Progress / Completed / Verified / Partial / Superseded`；網站狀態則是 Evidence strength，不能機械一對一翻譯。正在進行但沒有足夠證據可標示 `candidate`；已有部分可支持的結果才標 `partial`；有直接證據支持定義範圍才標 `verified`。是否已完成管理工作也不等於已驗證。

## Minimal Candidate example

```json
{
  "id": "EXAMPLE-1",
  "title": "Example Experiment",
  "summary": "研究問題已成立，尚未取得直接執行證據。",
  "recordPath": "experiments/example/README.md",
  "tags": ["ipad-first", "deployment"],
  "outputType": "experiment",
  "researchMethod": "controlled-experiment",
  "demoStatus": "planned",
  "verificationStatus": "candidate",
  "completedDate": null
}
```

此為示意，**不要直接新增 `EXAMPLE-1` 到 Repo**。

## Publication failure diagnosis

- **站台沒新卡片、Deploy 成功：** 先查是否缺少 `*.catalog.json`、檔名 suffix、catalogRoots 掃描路徑，及生成輸出是否含 ID。
- **Build 失敗：** 先查 JSON parse、必要欄位、enum 大小寫、`completedDate`、重複 ID、`recordPath` / `demoPath`。
- **GitHub 有卡片 JSON，但站台仍舊：** 查建置是否執行、Deploy 是否成功、站台載入哪份 Catalog 與 cache；不要直接假設成功。
- **有卡片但沒有 Demo：** `planned` / `none` 合法；不需要為了展示卡片虛構 Live Demo。

## Agent handoff gate

下一世 AI 若被要求「成立實驗」「發布心得」「新增 Wall 研究項目」「修改站台狀態」，先讀本文件，再對照 Builder 契約。交付四項獨立證據，未知就標 Unknown：

1. **Remote Record**：遠端 commit SHA + Record 路徑／讀回；本機檔案或本機 commit 不等於遠端交付。
2. **Metadata / human Index**：預期 ID、卡片意圖、metadata（或明確無卡）、人類 Index heading/link、Checker 與 Builder 結果。WARN 要列出，不把 exit 0 稱為歷史全覆蓋。
3. **Deployed catalog / card**：實際 deploy identity/status、部署站台 Catalog 的 ID 與卡片；build PASS 不等於 deployed。無卡項目明確註記不適用。
4. **Browser / human path**：卡片 → 主 Record → 必要延伸文件／Live Demo 的實際觀測，註明誰驗證；未實測留待 Claire。

Reader runtime 固定讀 GitHub **main**；PR Preview 的 JS／卡片可來自分支，但未 merge 的 Record 仍不會由分支讀入。不要把 Preview 上的 main 正文當作分支 README 驗證。Reader 將明確的同 Repo main `.md` link 留在 Reader，以「返回」沿使用者閱讀路徑連續閱讀，延伸文件不要求 ID／metadata；PDF／ZIP／Live Demo 使用一般瀏覽器連結。目錄請改明確 README，repo-relative image／artifact 仍讀 raw Repo，`/dayone-reader/`、`/downloads/...` 等 site-root 路徑走目前站台 origin。外部 URL 保持原導航。

正式 Work Order 的 `agent-work/work-orders/index.md` 是另一份人工交付索引，按既有 Maintenance Rule 登錄，不使用 Experiment ID 宣告或要求網站卡片。Executor completion ≠ QC acceptance ≠ merge/deploy ≠ Claire human acceptance。
