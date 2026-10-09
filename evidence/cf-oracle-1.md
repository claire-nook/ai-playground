# CF-ORACLE-1｜Cloudflare Connector 直接操作實驗證據

- 紀錄日期：2026-10-09
- 狀態：第一至第三階段已取得功能驗證；後續階段待測
- 實驗主紀錄：[Cloud Oracle](../experiments/cloudflare-oracle/README.md)
- 網站：https://cf-lab-oracle.claire-nook.workers.dev/

## 證據分級原則

**AI 透過 Connector／Cloudflare API 取得的操作結果**，與 **Claire 在 iPad Safari 實際觀察的結果**，必須分開記錄。工具回報成功，不應直接視為瀏覽器端驗收或資安驗證成功。

## 第一階段｜無資料庫的 Worker API

**AI 操作：** 透過 Cloudflare Connector 建立、部署 `cf-lab-oracle`，提供公開 `/health` 與 `/oracle` JSON API。初版隨機回傳 Worker 內建八支籤文。

**Claire 實機驗證：** 在 iPad Safari 開啟 API，確認 JSON 回應，並觀察不同求籤結果。此階段沒有 D1。

## 第二階段｜同源前端

**AI 操作：** 更新同一 Worker，讓根路徑提供 HTML／CSS／JavaScript 網頁，並呼叫同來源 API。

**Claire 實機驗證：** Safari 截圖顯示電子神廟介面、求籤按鈕、籤文結果與專案識別。這支持「瀏覽器網頁 → Worker API → 畫面顯示」的完整互動，尚未涉及資料庫。

## 第三階段｜D1 建立、整併與讀寫整合

### AI 工具操作證據

1. 最初建立臨時 D1 `cf-lab-oracle-db`，建立 `oracle_fortunes`、`oracle_draws`，寫入四筆籤文並查詢。
2. Claire 確立共用測試資料庫規則後，AI 在既有 `lab-smoke-db` 建立相同兩張表及索引，保留原有 `lab_smoke_items`。
3. AI 確認共用資料庫內有四支籤文、零筆求籤紀錄，刪除多餘的臨時 D1，後續資料庫清單只剩 `lab-smoke-db`。
4. 分批新增 20 與 176 支籤文，總數達 **200 支**；四個分類各 **50 支**，每類 50 個不同標題。瀏覽器測試前求籤紀錄為零。
5. 透過 Cloudflare API 上傳 Worker v1.2.0，回應 HTTP 200。此版包含 D1 綁定、分類查詢、成功求籤寫入、台灣時間統計及前端模擬進度條。
6. 後續嘗試以工具獨立檢查 Worker 設定時，受到安全檢查阻擋。因此上傳成功回應不能冒充為獨立的部署後設定檢查。

### Claire 的 iPad Safari 實機證據

Claire 實際操作電子神廟，取得 D1 籤文結果。為了看清楚進度條上的趣味訊息，她連續求籤六次，畫面顯示 **今日 6／本月 6／累計 6**。

這支持瀏覽器至 Worker、D1 查詢及求籤事件統計的功能整合。它不保證網路重試或失敗時仍能恰好寫入一次。

進度訊息過快，是**使用者體驗觀察**，不是資料庫效能測量。

## 本次研究可以成立的結論

在 Cloudflare Connector 已完成授權、且 API 支援的範圍內，AI 能直接操作 Worker 部署、D1 資料庫建立與刪除、資料表與測試資料寫入、Worker 綁定及網頁更新。Claire 負責在 iPad Safari 進行實際功能驗證，無須手動部署程式碼。

實驗最終採用共用 D1 `lab-smoke-db`，而非每個小工具建立獨立資料庫。公開 workers.dev 網址足以完成此次測試，未驗證自訂網域設定。

## 尚未驗證的範圍

- 未建立登入認證或伺服器端授權；目前 API 公開。
- 尚未測試 Netlify 前端、跨來源請求及 CORS（Cross-Origin Resource Sharing，跨來源資源共用）。
- 尚未完成完整資安、負載、併發、重試冪等性、回復及自動化回歸測試。
- Schema 不儲存 IP；求籤數是事件次數，不是不重複訪客數。
- 200 筆籤文屬測試資料，部分內容採共用模板，不保留其 INSERT 腳本。
- GitHub 保留 `schema.sql` 的 `CREATE TABLE`、`CREATE INDEX` 結構語法，不要求保存測試資料或歷史求籤紀錄。
- 此文件是能力研究證據，不代表正式產品已具備上線條件。
