# Research Catalog Publication Contract｜實驗成立與站台發布

> **必讀時機：** 新增 Experiment / Wall Research Output、修改 Catalog 狀態、宣稱站台已發布之前。這是 authoring / publication contract，不是 Formal Specification。

## Two catalogs, different jobs

- `knowledge/experiments.md`：人與 AI 閱讀的研究目錄，記錄 Why / Status / Links。
- `experiments/<topic>/*.catalog.json`（Wall 類在 `knowledge/wall/`）：**站台目錄的唯一機器可讀輸入**。
- `scripts/build-experiment-catalog.mjs`：實際驗證規則與排序的 executable source of truth；本文件只說明操作方式，若程式變更應同步更新本文件。
- Build 輸出：`public/research-catalog.json` 與相容性 `public/experiment-catalog.json`。不要把這兩個產物當成應手動編輯的 source。

**建立 Experiment Record + 更新 Markdown Catalog，不會自動讓站台顯示新實驗。** 缺少 `*.catalog.json` 時，建置程式可能正常成功但沒有該項目。無效的 JSON / 狀態則會令 build fail。這是不同故障型態。

## Establish an experiment｜成立實驗最小步驟

1. 在 `experiments/<topic>/README.md` 建立 Experiment Record，按 `knowledge/experiment-template.md` 填入已知問題與未測限制。
2. **同一批變更**在該實驗目錄新增唯一的 `<id>.catalog.json`；可參照既有合法項目，不能只寫 Markdown Catalog。
3. 在 `knowledge/experiments.md` 建立簡短索引，並依工作狀態更新 `notes/short-term-work.md`；有新 Evidence 才更新 `evidence/index.md`。
4. 依現行 build script 驗證 JSON schema / status / date / path / ID uniqueness；若有可用 Node runtime，從 repo root 執行 `node scripts/build-experiment-catalog.mjs`，確認新 ID 出現在輸出。
5. Commit 後確認 Netlify build / deploy 狀態，並檢查 **實際站台的 research catalog** 是否有新項目。未取得部署 / 站台證據前，只能說 GitHub source 已更新，不能宣稱站台發布完成。

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
| `demoPath` | `demoStatus=live` 必填以 `/` 開頭的路徑；其他狀態須省略或 `null` |
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

下一世 AI 若被要求「成立實驗」「發布心得」「新增 Wall 研究項目」「修改站台狀態」，先讀本文件，再對照 `scripts/build-experiment-catalog.mjs` 的現行契約。**交付時分別報告：Repo commit / build validation / Netlify deploy / browser observation**，未知就標未知。不要用「已 Commit」偷換「已發布」。
