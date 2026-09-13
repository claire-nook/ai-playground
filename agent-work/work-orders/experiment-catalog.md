# Work Order｜Metadata-driven Experiment Catalog

## Metadata

- Work Order: `experiment-catalog`
- Status: `Ready`
- Work Type: `Playground Infrastructure / Implementation`
- Requested By: Primary Agent
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Related Area: Experiment Gallery / Netlify static build / Browser Experiment UX

## Objective｜目標

把目前 `public/index.html` 內手寫 Experiment Cards 的 Gallery，改造成由 Experiment metadata 驅動的 **Experiment Catalog**，並完成目前 Gallery Experiment 的 Catalog migration，建立未來新增 Experiment / Probe 時可持續沿用的 Catalog Convention。

目標不是導入 CMS，也不是把 Playground 改造成第二套 Eleventy Site。核心原則：

> Experiment 應描述自己；Gallery 應自動收集，不應在每新增一個 Experiment 時再手動修改首頁 Card。

> Experiment README / Record 保存研究內容；`*.catalog.json` 保存 Catalog 所需的結構化索引。Generator 不解析自由文字 README 來猜 metadata。

預期流程：

```text
Experiment Record + *.catalog.json
        ↓
small Node build generator
        ↓
public/experiment-catalog.json   (generated artifact, not Source of Truth)
        ↓
public/index.html
        ↓
Search + Tag Filter + Status Filter + Pagination
        ↓
Browser Experiment Page (optional)
        ↓
← AI Playground
```

本次也建立 Browser Experiment Page 的導覽 Convention：現存與未來的 Browser Experiment Page 應提供清楚的「← AI Playground」回主頁入口，不依賴 Browser Back history。

## Architecture Decision｜已決定，不要重新發明

### 1. Catalog Source of Truth

Experiment Catalog metadata 跟著 Experiment Record 存在於 `experiments/`，不是放在 `public/` 當第二份人工首頁清單。

使用 recursive filename convention：

```text
experiments/**/*.catalog.json
```

例如：

```text
experiments/auth/auth.catalog.json
experiments/data-api/data-api.catalog.json
experiments/data-api-view/data-api-view.catalog.json
experiments/custom-api/c-db-1.catalog.json
experiments/custom-api/c-ext-1.catalog.json
experiments/custom-api/c-nf-0.catalog.json
```

現有 `experiments/` 研究目錄只是 Repository organization，不是 Catalog Category。**Catalog 不提供 category 欄位，也不以目錄作 UI 分類。**

同一研究目錄可以有多個 `*.catalog.json`，因此不要假設「一個資料夾 = 一個 Experiment」。像 `experiments/custom-api/README.md` 可同時承載多個 Probe 的研究脈絡，而各 Probe 以自己的 Catalog entry 被獨立索引。

### 2. Experiment Record 與 Catalog Metadata 的責任邊界

- `README.md` / Experiment Record：Research Question、Conditions、Process、Evidence、Observation、Conclusion、Failure / Unknown 等研究內容，維持人類與 AI 可讀的自由文件。
- `*.catalog.json`：只保存 Gallery / Catalog 所需的穩定結構化 metadata。
- Generator **不得解析 README 正文來推論** title、status、tags、demo path 或 verification state。
- README 不需要為 Catalog 全面改造成 machine-readable 格式。
- Catalog metadata 不是第二份研究結論；若 metadata 與 Experiment Record / Evidence 衝突，停止並回報 Primary，不要自行改寫研究結論。

### 3. Tag-only Classification

Catalog 不建立 Category Tree。分類全部使用 `tags[]`。

Tag 規則：

- Tag 是技術 / capability / concern 的多維描述，不是唯一分類。
- Status 不當 Tag 使用；例如 `Verified`、`Live Demo` 不放進 tags。
- 新增 Tag 前先重用既有語義，不建立同義異名。
- 大小寫、單複數、縮寫應固定，例如只保留一種 `Edge Function`，不要同時出現 `Edge Functions` / `edge-function` / `EdgeFunction`。
- UI filtering 可以使用 normalized key，但 metadata 顯示值維持一致 canonical label。
- `tags` 必須是至少包含一個項目的 array；每個項目必須是非空且已 trim（`tag === tag.trim()`）的 string。Generator 不得接受 scalar、空 array、空字串、只含 whitespace、含前後 whitespace 或 non-string 的 Tag。
- Generator 至少應拒絕同一 Experiment 內 case-insensitive duplicate tags；語義重複由既有 vocabulary reuse rule 控制，不需要做 NLP 猜同義詞。
- Tag vocabulary 可以隨真正的新技術概念成長，不做僵硬 enum；但新增前必須先檢查既有 Catalog tags 是否已有同義語義。

本次現有 Catalog 使用以下 canonical tags，除非 source inspection 證明不合適，不要自行創造同義版本：

- `Supabase`
- `Netlify`
- `Auth`
- `Data API`
- `RLS`
- `CRUD`
- `View`
- `Custom API`
- `Edge Function`
- `RPC`
- `External API`
- `Orchestration`
- `Functions`
- `Deployment`
- `Lifecycle`

初始 6 個 Gallery Experiment 建議：

| Experiment | Tags |
| --- | --- |
| A · Supabase Auth | `Supabase`, `Auth` |
| B · Supabase Native Data API CRUD | `Supabase`, `Data API`, `RLS`, `CRUD` |
| B-1 · Supabase View Read | `Supabase`, `Data API`, `View`, `RLS` |
| C-DB-1 · Database-centric Custom API | `Supabase`, `Custom API`, `Edge Function`, `RPC`, `RLS` |
| C-EXT-1 · Custom API Orchestration | `Supabase`, `Custom API`, `Edge Function`, `External API`, `Orchestration`, `RLS` |
| C-NF-0 · Netlify Functions Lifecycle | `Netlify`, `Functions`, `Deployment`, `Lifecycle` |

### 4. Status is multi-dimensional

不要用單一 `status` 同時塞 Demo state 與 Evidence state。C-NF-0 已證明兩者可以不同：Demo 已退休，但 Runtime Evidence 仍然 Verified。

Metadata 至少分開：

- `demoStatus`: `live` | `retired` | `none`
- `verificationStatus`: `verified` | `partial` | `candidate`

目前 Gallery 六個 Experiment 的 `verificationStatus` 皆可依 repository 現有 Verified record 設為 `verified`；Demo state 依目前 Gallery 現況：

- A / B / B-1 / C-DB-1 / C-EXT-1: `live`
- C-NF-0: `retired`

不要把「Demo Retired」解讀成研究結論失效。

## Metadata Contract｜資料格式

每個 `*.catalog.json` 至少遵守：

```json
{
  "id": "C-EXT-1",
  "title": "Custom API Orchestration",
  "summary": "驗證 Custom API → Custom API → RLS-backed data → external weather provider 的 orchestration path。",
  "tags": ["Supabase", "Custom API", "Edge Function", "External API", "Orchestration", "RLS"],
  "demoStatus": "live",
  "demoPath": "/custom-api-orchestration/",
  "verificationStatus": "verified",
  "flow": "Browser → Weather API → Valid Place API → RLS → Open-Meteo → Browser"
}
```

Rules：

- `id` 必填且全 Catalog 唯一。
- `title`、`summary`、`tags`、`demoStatus`、`verificationStatus` 必填。
- `tags` 必須符合上述 non-empty string array 與 duplicate 規則；欄位存在但型別或內容不合法仍須 fail build。
- `demoPath` 只在 `demoStatus = live` 時必填；`retired` / `none` 不得因缺少 Browser page 而讓 Experiment 從 Catalog 消失。
- `flow` optional，但目前既有 Gallery 已有 flow 的 Experiment可保留。
- 不新增 `category`。
- 不新增純粹為了人工排序的 `sortOrder`，除非實作證明沒有 deterministic sort 會造成實際問題。預設用 Experiment `id` natural sort 即可。
- implementation-level validation 可補強，但不得改變上述責任與 status semantics。

## Future Experiment Catalog Convention｜未來新增實驗的固定規則

本次 implementation 必須把以下規則補入**既有適當的 repository guidance**，優先更新既有 README，不要為此另起大型文件體系：

1. 新增一個可獨立識別、未來需要在 Catalog 中被找到的 Experiment / Probe 時，建立或更新對應 `*.catalog.json`。
2. Experiment Record 與 Catalog metadata 是不同責任：研究內容寫在 Record；Gallery 索引寫在 metadata。不要把完整研究內容複製進 JSON。
3. 一個研究目錄可以有多個 Probe / Catalog entries；不要為了 Catalog 強迫「一個 folder = 一個 Experiment」。
4. 新 Experiment 不需要 Browser Demo 才能進 Catalog。沒有 Demo 使用 `demoStatus = none`；Demo 後來拆除則改為 `retired`，不要因此刪掉 Catalog entry 或歷史 Evidence。
5. 有 Browser Experiment Page 時，使用 `demoStatus = live` + `demoPath`，並提供 `← AI Playground` 回主頁入口。
6. Experiment 從 Candidate / Partial 升格為 Verified 時，才依 Primary / Evidence judgment 更新 `verificationStatus`；Implementation Agent 不因 source/test 自行把研究結論升格。
7. Tag 由建立 / 維護 Experiment 的 Agent 依內容選擇。新增 Tag 前先掃既有 Catalog vocabulary，語義相同必須重用既有 canonical label；只有真正的新概念才增加新 Tag。
8. 不建立 Category Tree，不以資料夾名稱作 Catalog taxonomy。
9. 新增或修改 Catalog metadata 必須能觸發 Gallery build；純 Research README / Evidence-only 變更仍遵守 repository-only skip 原則。
10. 未來 Work Order 若新增可獨立 Catalog 的 Experiment / Browser Test Page，Acceptance 應包含對應 metadata 與 home navigation，不再另外手動修改 Gallery Card。

本次 Codex 可以把上述規則沉澱到現有 `README.md` 或最合適的既有 guidance section；Primary Agent 會在 PR Review 時確認文字是否與實際 implementation contract 一致。

## Existing Experiment Migration｜既有實驗遷移

本次不是只把六張 Card 換成 JSON，而是要做一次**有來源依據的 Catalog migration**：

- 以現有 Experiment Record、Evidence 與目前 Gallery 為來源，建立六個 `*.catalog.json`。
- 不要求重寫現有 Experiment README；只有在缺少必要、且不補會造成未來維護誤解的 convention 說明時才做最小文件調整。
- 不假設 folder 與 Catalog entry 一對一；尤其 `custom-api` 下的多個 Probe 必須保持獨立 Catalog identity。
- 如果現有 README / Evidence 與目前 Gallery 對某個 status、demo path 或名稱互相矛盾，標記 `Decision Needed`，不要自行選一個版本假裝一致。
- 本次只 migration 目前首頁已展示的六個 Experiment，不趁機把所有歷史研究一股腦塞進 Catalog。

## Context / Read First｜施工前閱讀

請以 repository 現況為準，至少閱讀：

- `playground.md`
- `README.md`
- `agent-work/README.md`
- `agent-work/report-language-guideline.txt`
- `public/index.html`
- `netlify.toml`
- `experiments/auth/README.md`
- `experiments/data-api/README.md`
- `experiments/data-api-view/README.md`
- `experiments/custom-api/README.md`
- `experiments/netlify-trigger-boundary/README.md`

並掃描 `public/` 目前 Browser Experiment Pages，確認實際路徑，不要只依 Work Order 猜。

## Execution Context Preflight｜施工前確認

1. 確認 target repository 為 `claire-nook/ai-playground`。
2. 確認 repository root 是否已有 `package.json`；若與 Work Order 預期不同，以現況為準並在 Report 說明。
3. 確認 `netlify.toml` 目前 publish directory 為 `public`，且 deployment trigger whitelist 尚未包含 Catalog metadata / generator path。
4. 確認 `public/index.html` 目前 Cards 為手寫 static HTML。
5. 確認現有 Live Browser Experiment Pages 與其 URLs。
6. 確認六個 Catalog entries 的研究來源足以支持 metadata；遇到矛盾停止該 entry 的猜測並回報。
7. working tree 若有與本任務無關的未提交修改，停止並回報，不要覆蓋。

不要把 Git remote / local `main` / `gh auth` 當 repository identity 的必要條件。

## Scope｜可以做

1. 為目前 Gallery 六個 Experiment 建立 `*.catalog.json` metadata，完成 Catalog migration。
2. 在既有 repository guidance 補入 Future Experiment Catalog Convention，讓未來新增 Experiment / Probe 時知道何時建立 metadata、如何選 Tag、如何處理 Demo / Verification status 與 Browser home navigation。
3. 新增一支**無外部 dependency**的小型 Node generator，例如 `scripts/build-experiment-catalog.mjs`。
4. Generator recursive 掃描 `experiments/**/*.catalog.json`，validate metadata，輸出 Catalog artifact 到 `public/` 供 Browser 使用。
5. Generated catalog artifact 必須被視為 build output，不是人工維護 Source of Truth。優先避免 commit generated JSON；需要時更新 `.gitignore`。
6. 修改 `public/index.html`，不再手寫 Experiment Cards，runtime 讀取 generated catalog data 並提供 Search、Tag filter、Demo / Verification status filter、Pagination。
7. Pagination default 每頁 **12** 個；Filter / Search 變更後 reset 到第 1 頁；不足一頁時不顯示多餘 pagination noise。
8. Search 至少比對：`id`、`title`、`summary`、`tags`。
9. Tag filter 至少支援單一 Tag；若低風險可支援 multi-tag AND filtering，但不是必要條件，不要為此做複雜 state framework。
10. Status filtering 要能分辨 Live Demo / Retired / No Demo，以及 Verified / Partial / Candidate。
11. 保留目前 Experiment Gallery 的主要視覺語言與「Demo 是 display surface、Evidence 才是研究依據」的說明，不需要重新設計成全新產品。
12. 為現有 Browser Experiment Pages 增加一致的 `← AI Playground` 回主頁入口，連到 `/`。
13. 更新 Netlify build flow，使 deploy 時在 publish 前執行 generator。
14. 更新 Netlify trigger boundary，使 Catalog metadata、Catalog build script、既有 deploy surfaces 的變更能合理觸發 deploy。
15. 不要把整個 `experiments/` 一律加入 trigger surface；Research README / Evidence-only 變更仍不應因為 Catalog build 而喚醒 Netlify。請使用足夠窄的 path/pattern。
16. 執行 local build / generator / static verification，並保留 Report。
17. 建立 local commit，並更新既有 PR #18 供 Primary Agent 重新 review。

## Build / Netlify Constraint｜很重要，別順手把已驗證邊界踩爛

目前 Netlify Trigger Boundary 是已驗證的 Playground 行為。這次允許**有意識地擴充 current trigger surface**，但不得把既有 Research-only skip 原則整片拆掉。

Preferred implementation：

- 不因本需求導入 Eleventy / Vite / React / bundler。
- Generator 使用 Netlify runtime 已可執行的 Node，且不依賴 npm package。
- 可在 `netlify.toml [build]` 增加類似 `command = "node scripts/build-experiment-catalog.mjs"` 的 build step。
- Trigger whitelist 應新增 catalog metadata pattern 與 generator path，而不是 `experiments/` / `scripts/` 全開。
- 若 shell regex 對 `**` path pattern 的處理需調整，請以實際 changed path matching 為準，不要照字面搬 glob。
- Build generation failure 應 fail deploy，不要默默產生空 Gallery。

若現況迫使導入 `package.json`，必須在 Report 說明原因；不要只是因為習慣先 `npm init`。

## UX / Browser Rules

### Gallery

- iPad Safari 仍是主要 human test surface；保留 responsive layout。
- Catalog data 載入中可有簡單 loading state。
- Catalog fetch / parse failure 必須顯示可理解 error state，不要空白頁。
- Retired Experiment 不提供假 Live Demo link。
- Live Demo card 必須能直接進入其 Browser Experiment Page。
- 顯示 Tag chips。
- 顯示 Demo status 與 Verification status，兩者語義不要混成一個 badge。
- Search / Filter / Pagination 不需 server-side state，也不需 URL router framework；plain JS 足夠。

### Browser Experiment Pages

現有 Live Browser Experiment Page 頂部加入一致入口：

```text
← AI Playground
```

連到 `/`。

不要寫「上一頁」；這是 Information Architecture link，不是 Browser history action。

未來 Browser Experiment Page 應沿用此 convention。

## Out of Scope｜不要把 Catalog 變成 CMS 王國

- 不導入 Eleventy、Next.js、React、Vue、Vite、Astro 或其他 Site Generator / SPA framework。
- 不做後台管理介面。
- 不做 DB-backed catalog。
- 不做 authentication / permissions for Gallery。
- 不做 drag-and-drop sorting。
- 不做 category / nested taxonomy / directory-based classification UI。
- 不做 tag synonym AI classifier。
- 不新增全文搜尋服務。
- 不把 existing Experiment README 全部重構成新的文件格式。
- 不把所有歷史 Experiment 都一次 catalog 化；本次只遷移目前首頁已展示的六個 Experiment。
- 不刪除或改變現有 Experiment runtime / API / DB implementation。
- 不自行改寫 Knowledge Catalog / Evidence conclusion；若發現文件因 Trigger Boundary current-state 改變而會誤導，可做最小必要 current-state note，保留歷史 Verified Evidence。
- 不另外建立大型 Catalog Governance / Tag Dictionary 文件；規則優先沉澱在既有 repository guidance，避免文件增生。

## Required Validation / Acceptance｜必要驗收

Codex Report 提供 observation；最終 ACCEPTED 由 Primary Agent Review GitHub-visible PR 決定。

### Metadata / Migration / Convention

- [ ] 六個既有 Gallery Experiment 都有 `*.catalog.json`，且 metadata 可追溯到現有 Experiment Record / Evidence / Gallery state。
- [ ] `custom-api` 多 Probe 不被錯誤壓成單一 Catalog entry。
- [ ] Repository guidance 已記錄未來 Experiment Catalog Convention，至少涵蓋 metadata 建立時機、Tag reuse、Demo / Verification status、Browser home navigation。
- [ ] Convention 明確說明 README / Record 與 `*.catalog.json` 的責任不同，Generator 不靠解析 README 猜 metadata。
- [ ] 未來新增 Experiment 不需要手動修改 Gallery Card。

### Generator

- [ ] Generator recursive 掃描 metadata，不 hard-code 六個檔名或 Experiment IDs。
- [ ] Duplicate `id` 會 fail build。
- [ ] Invalid required fields / invalid status values 會 fail build。
- [ ] `tags` 為 scalar、空 array、含空字串、whitespace-only string、前後帶 whitespace 的 string 或 non-string item 時會 fail build。
- [ ] 同一 Experiment case-insensitive duplicate tags 會 fail build 或被明確拒絕，不可默默重複顯示。
- [ ] `demoStatus = live` 且缺 `demoPath` 會 fail build。
- [ ] Retired / no-demo Experiment 可以正常存在 Catalog，不需要假 path。
- [ ] Generated output ordering deterministic，優先 natural sort by `id`。
- [ ] Negative tests 至少涵蓋 duplicate `id`、缺少 required field、invalid status、上述 invalid `tags`、case-insensitive duplicate tags，以及 live demo 缺少 `demoPath`；每一 case 都必須驗證 generator 回傳 non-zero，不可只比對 error message。
- [ ] Negative tests 使用 temporary fixture / isolated copy，不修改六個 canonical metadata；失敗 case 不得覆寫最後一次成功產生的 Catalog artifact，測試後須重跑正常 build 證明 valid input 仍成功。

### Gallery

- [ ] `public/index.html` 不再含六個 Experiment 的手寫 Card source-of-truth。
- [ ] Search 可依 ID / title / summary / tag 找到 Experiment。
- [ ] Tag filtering 可運作。
- [ ] Demo / Verification status filtering 可運作。
- [ ] Pagination 每頁 12，且 filter/search 後頁碼 reset 合理。
- [ ] Live Demo 正確連到既有 test pages。
- [ ] C-NF-0 顯示 Retired + Verified，但沒有死掉的 Live Demo link。
- [ ] Catalog load failure 顯示 error state。
- [ ] iPad-width responsive layout 沒有明顯破版。

### Navigation

- [ ] 現有 Live Browser Experiment Pages 有 `← AI Playground`。
- [ ] Link 指向 `/`，不使用 history back。

### Build / Trigger Boundary

- [ ] Netlify build 可在無額外 secret 下產生 Catalog artifact。
- [ ] Catalog generator 不需要 external package dependency。
- [ ] Metadata change 可觸發 Netlify deploy。
- [ ] Generator change 可觸發 Netlify deploy。
- [ ] Research README-only change 仍可被 current trigger logic 判定為 repository-only / skip，而不是因為整個 `experiments/` 被 whitelist。
- [ ] Existing `public/`, `netlify/functions/`, `netlify/edge-functions/`, `netlify.toml` 等 trigger semantics 不被意外移除。
- [ ] Build failure 不會降級成空 Gallery success。

### Regression

- [ ] 不修改 Supabase Function / Netlify Function runtime behavior。
- [ ] 不修改 Database Object / Auth / RLS。
- [ ] 既有 Browser Experiment Pages 主要測試功能仍保留。

## Deliverables｜交付物

預期至少包含：

- `agent-work/work-orders/experiment-catalog.md` 的 Report section 更新
- 六個 `experiments/**/*.catalog.json`
- `scripts/build-experiment-catalog.mjs`（或等價單一 generator）
- 必要 `.gitignore` 調整（若 generated artifact 不 commit）
- `public/index.html`
- 現有 Live Browser Experiment Pages 的 home navigation update
- `netlify.toml`
- 既有 repository guidance 的 Future Experiment Catalog Convention update
- local build / verification result
- local commit
- 更新既有 PR #18，供 Primary Agent 依 GitHub-visible head / diff / checks 重新 review

## Decision Boundary｜弟弟可以決定到哪裡

Codex 可以自行決定：

- Generator helper function / internal naming。
- Generated catalog filename，只要明確是 build artifact 且 `public/index.html` 使用一致。
- Search / filter / pagination 的小型 plain-JS implementation detail。
- UI spacing / badge layout 等不改變資訊架構的小型視覺調整。
- 最小的 `.gitignore` 實作。
- 在既有 README 中選擇最合理 section 放置已指定的 Future Experiment Catalog Convention。

Codex 不得自行決定：

- 改用中央人工 Manifest 取代 recursive Experiment-owned metadata。
- 新增 Category 欄位或 directory-based taxonomy。
- 導入 Site Generator / SPA framework / external dependency。
- 把 generated artifact 當人工 Source of Truth 維護。
- 解析 README 自動猜 metadata / verification judgment。
- 把整個 `experiments/` 或整個 `scripts/` 無差別加入 Netlify trigger whitelist。
- 改變 Demo / Verification 雙 status semantics。
- 修改既有 Experiment technical conclusion、API、DB 或 security semantics。
- 自行創造與既有 Tag 同義的新 label。
- 因為某個 Live Demo runtime 暫時失敗就刪掉其 Verified Evidence；若 runtime regression 被觀察到，保留 Failure / Unknown 並回報 Primary。

## Report｜執行後填寫

Report 遵守 `agent-work/report-language-guideline.txt`。

### Result

待執行。

### Files Changed

待執行。

### Build / Test

待執行。

### Trigger Boundary Observation

待執行。

### Migration / Convention Observation

待執行。

### Failure / Unknown

待執行。

### Human Gate

本 Work Order 已有既有 PR #18；不要再建立另一張 PR。完成 local commit 與指定 checks 後，將新 commit 更新到 **PR #18**。若此 execution surface 無法更新 GitHub-visible PR，由 Claire 在 Codex Product UI 完成既有 PR 的更新；Primary Agent 再依 PR #18 最新 head / diff / checks 做 Technical QC。不要把 local SHA 當最終 review identity，也不要宣稱 local commit 已完成 GitHub-visible 更新。
