# CF-CONNECTOR-1｜Cloudflare Connector × Worker API × D1 × Netlify 換殼

<!-- experiment: {"id":"CF-CONNECTOR-1","card":"required","index":"required"} -->

- 日期：2026-10-09
- 狀態：Completed（功能與實機驗證）
- 研究類型：AI Connector 雲端操作能力、API／前端／資料庫分層、跨 Hosting 換殼
- SQL 結構：[schema.sql](../cloudflare-oracle/schema.sql)；早期查詢：[queries.sql](../cloudflare-oracle/queries.sql)

## 研究問題

AI 是否能直接透過 Cloudflare Connector 完成 Worker API、D1 與網頁的建立和部署，並讓 Netlify 靜態前端沿用原 Worker API／D1，而不搬動後端？

## 實驗路徑

1. AI 透過 Connector 部署無 D1 的 Worker JSON API。
2. 同一 Worker 增加 HTML／CSS／JavaScript 同源求籤網頁。
3. Worker 綁定共用 D1 `lab-smoke-db`，使用 `oracle_fortunes` 讀取 200 支籤文，以 `oracle_draws` 記錄成功求籤，提供 `/stats`。
4. 從 Cloudflare 取回原網頁，提交至 `ai-playground/public/cloudflare-oracle/index.html`，由 Netlify 自動部署。新殼改用跨來源呼叫同一 Worker API，原 Cloudflare 網頁保留不變。
5. Claire 在 iPad Safari 驗證兩站求籤與共用統計，累計由 9 次增至 10 次。

原先規劃的「先以 Netlify 測試無 DB API，再測試 D1 API」兩階段已合併：直接使用完成 D1 整合的既有 Worker API 換殼，避免重複測試。

## 實驗過程與實測｜兩個 Phase

Cloud Oracle 是唯一測試載體。Phase 1 涵蓋 Cloudflare Worker API、同源網頁與 D1；Phase 2 驗證 Netlify 跨 Hosting 換殼。


### Phase 1A｜Worker API

AI 透過 Cloudflare Connector 建立並部署 `cf-lab-oracle`，先提供 `/health`、`/oracle` JSON API。初版由 Worker 內建八支測試籤文，不涉及 D1。Claire 在 iPad Safari 確認 JSON 回應與隨機結果。

### Phase 1B｜同源網頁

AI 直接更新 Worker，使根路徑提供 HTML、CSS、JavaScript 電子神廟介面。瀏覽器以同源 `/oracle` 取得籤文，Claire 在 Safari 確認網頁、按鈕與籤文結果可正常顯示並完成求籤。

### Phase 1C｜D1 讀寫

AI 曾建立臨時 D1 `cf-lab-oracle-db`，後依 Claire 指示改用既有共用測試 D1 `lab-smoke-db`，保留原本 `lab_smoke_items`，刪除多餘的臨時資料庫。

在共用 D1 建立：
- `oracle_fortunes`：200 支測試籤文，四類各 50 支。
- `oracle_draws`：每次成功求籤的事件紀錄。

Worker v1.2.0 透過 `DB` binding 讀取籤文、寫入事件，並以 `/stats` 回傳今日、本月與累計次數（台灣時間）。Claire 首輪在 Safari 求籤六次，畫面統計為 6／6／6。

200 支籤文包含共用內容模板，不代表 200 篇完全獨立創作。求籤次數是事件數，不是獨立訪客數。

### Phase 2｜Netlify 換殼

AI 透過 Cloudflare Connector 讀回已部署 Worker 的原始碼，取得原版網頁；將網頁複製到 GitHub `ai-playground/public/cloudflare-oracle/index.html`，只調整前端呼叫位置，讓 `/oracle`、`/stats` 指向既有 Cloudflare Worker URL。沿用 Repository 原本的 `public/` → Netlify 自動部署方式，不新增 Netlify Function。

- GitHub commit：`94c4cec9abbcefdc461e53d5ec765ee83333297c`
- Cloudflare 原站、Worker 邏輯與 D1 均未為換殼而修改。
- Worker 當時已對 JSON API 回應設定 `Access-Control-Allow-Origin: *` 並支援 `OPTIONS`，故此次跨來源 GET 不需新增 CORS 設定。

Claire 在 iPad Safari 分別操作兩個網站：2026-10-09 約 15:19，Netlify 網頁取得第 63 籤（system）；約 15:20，Cloudflare 原站取得第 199 籤（health）。畫面中的今日／本月／累計統計由 9／9／9 增至 10／10／10。這提供兩個 Hosting 前端共用同一 Worker API 與 D1 的端到端功能證據。**證據界線：** Safari 截圖證明前端操作及顯示的統計連續增加；並未同步逐列檢查 D1 原始紀錄。Worker 成功求籤時會寫入 `oracle_draws`，但這不等於併發、負載或安全性驗收。

## 最終架構

```text
iPad Safari
  ├─ Cloudflare 原站 UI ── 同源 GET ──┐
  └─ Netlify 靜態 UI ─── 跨源 GET ──┤
                                      ▼
                      Cloudflare Worker cf-lab-oracle
                           /oracle · /stats
                                      │ DB binding
                                      ▼
                         D1 lab-smoke-db
                         ├─ oracle_fortunes
                         └─ oracle_draws
```


## 實驗網站

- Cloudflare 原站：https://cf-lab-oracle.claire-nook.workers.dev/
- Netlify 新殼：https://ai-playground-lab.netlify.app/cloudflare-oracle/

## 研究結論

- AI 在已授權範圍內，可直接透過 Cloudflare Connector 操作 Worker 與 D1，降低 iPad-first 開發對本機 CLI 的依賴。
- Cloudflare Worker API 與 D1 可供 Cloudflare、Netlify 兩個不同 Hosting 的網頁共用。
- Netlify 換殼只改前端 API 呼叫位置，無須重新部署後端或搬移資料。
- Cloudflare JSON API 當時已允許跨來源讀取，故換殼不需調整 Worker CORS；這不是 API 存取保護的證明。
- 功能已經 Safari 實機驗證，但不代表通過正式產品安全、效能或可靠性驗收。

## 技術留存與限制

AI Connector 操作回應、GitHub Commit 與 Claire 在 iPad Safari 的實際觀察是不同層級的證據；本 Record 僅將有實測支持的功能列為 Verified。

- [D1 Schema](../cloudflare-oracle/schema.sql) 保存 `CREATE TABLE` 與索引；[早期 SQL 查詢](../cloudflare-oracle/queries.sql) 僅供探索，日期查詢使用 UTC，與 Worker 的台灣時間統計不可混同。
- SQL 未留存 200 支籤文的 INSERT 腳本；`oracle_draws` 記錄求籤事件，不記錄訪客身分。
- 共用 `lab-smoke-db` 不得為單一實驗整庫刪除；已刪除臨時 `cf-lab-oracle-db`。
- 兩站功能驗證不等於 D1 逐列稽核、負載、併發、冪等性、故障復原或資安驗收。

## 後續獨立研究

**API Security 為第二個實驗**：另行研究 Authentication（身分驗證）、Authorization（授權）、Rate Limiting（速率限制）及 CORS 存取政策。此處不混入安全方案設計或尚未驗證的結論。

本案僅保留已執行的 Connector／API／UI／D1／換殼實驗範圍。
