# CF-ORACLE-1 — Cloudflare Connector × Worker × D1

- 更新日期：2026-10-09
- 狀態：第一至第三階段功能已驗證；Netlify 換殼與登入認證待測
- 實驗網站：https://cf-lab-oracle.claire-nook.workers.dev/
- 資料庫：共用測試 D1 `lab-smoke-db`

## 研究目的

驗證 AI 在 Cloudflare Connector 完成授權後，能否不依賴本機命令列或人工複製程式碼，自行建立 Worker 網站、操作 D1 資料庫、建立資料表、完成綁定，並提供瀏覽器到資料庫的讀寫功能。

本案是能力探索，不是正式產品或資安驗收。

## 第一階段｜Worker API（已驗證）

AI 透過 Connector 建立及部署 `cf-lab-oracle`，提供公開 `/health` 與 `/oracle` API。初版隨機回傳八支內建籤文，尚未使用 D1。Claire 已在 iPad Safari 驗證 JSON 回應。

## 第二階段｜Worker 同源網頁（已驗證）

AI 更新同一 Worker，在 `/` 提供 HTML、CSS、JavaScript 網頁，透過同源 `/oracle` 取得籤文。Claire 在 iPad Safari 驗證網頁與求籤互動，不需本機 CLI 或 GitHub 部署。

## 第三階段｜D1 整合（已取得功能驗證）

1. AI 最初建立獨立的 `cf-lab-oracle-db`，建立兩張資料表並插入四筆測試籤文。
2. Claire 明確要求小型實驗共用既有測試資料庫。AI 因此在 `lab-smoke-db` 建立 `oracle_fortunes`、`oracle_draws` 與索引，保留既有 `lab_smoke_items`，並刪除多餘的 `cf-lab-oracle-db`。
3. AI 將籤文擴充至 **200 支**，四個分類 `system`、`career`、`love`、`health` 各 **50 支**；資料庫查詢確認各分類數量及標題不重複。部分籤文內容使用共用模板，並非 200 篇完全獨立創作。
4. AI 上傳 Worker v1.2.0，加入 D1 `DB` 綁定、分類求籤、`/stats` 統計、求籤事件寫入及前端模擬儀式進度條。Cloudflare API 回傳 HTTP 200。
5. Claire 在 iPad Safari 求籤六次，畫面顯示 **今日 6／本月 6／累計 6**，並看到 D1 籤文。這支持瀏覽器端讀寫整合成功，但不等於完成併發、重試及故障測試。

統計的是求籤**事件**，不是不重複訪客；今日與本月採台灣時間（UTC+8）。

### 已驗證架構

```text
iPad Safari
  → Worker 提供網頁
  → Cloudflare Worker /oracle, /stats
  → D1 綁定 DB → lab-smoke-db
       oracle_fortunes（查詢籤文）
       oracle_draws（寫入及統計）
```

## SQL 與資料留存原則

- [schema.sql](schema.sql) 保留 `CREATE TABLE`、`CREATE INDEX` 等**結構定義**。
- **不留存測試資料的 INSERT 語法**；舊 `seed.sql` 已刪除，不要求保存 200 支籤文的插入腳本。
- [queries.sql](queries.sql) 僅作早期查詢探索參考，不保證日期查詢符合台灣時區。
- 本版 Schema **沒有儲存 IP**；先前討論的粗略 IP 分組未實作。
- `lab-smoke-db` 為共用測試資料庫，不得為清理單一實驗而刪除整個資料庫。

## 已知限制與未驗證事項

- Worker 上傳 API 成功，Claire 的 Safari 畫面亦提供功能證據，但尚未執行完整自動化回歸、併發、寫入失敗、重試冪等性與資安測試。
- 單次成功求籤預期新增一筆事件，但網路重試下是否恰好寫入一次尚未驗證。
- 儀式進度條是前端模擬，不代表實際 D1 處理進度；約 1.8 秒動畫太快，已記為使用者體驗觀察。
- 尚未實作登入認證；API 目前公開。自訂網域未設定，使用 workers.dev 即可。
- 尚未驗證 Netlify 跨來源請求與 CORS（Cross-Origin Resource Sharing，跨來源資源共用）。
- AI 能在已授權範圍內操作已測試功能，不代表所有 Cloudflare 權限、網域或認證工作都能自動完成。

## 下一階段

**先換殼：** 保留 Cloudflare 原站作對照組，在 Netlify 建立前端，呼叫既有 Worker API，驗證跨來源請求及 D1 寫入。

**再加鎖：** 另行研究登入與伺服器端授權。登入畫面本身不等於 API 已受到保護。

## 相關證據

- [CF-ORACLE-1 實驗證據](../../evidence/cf-oracle-1.md)
- [Cloudflare Direct Control 主研究](../cloudflare-direct-control/README.md)
