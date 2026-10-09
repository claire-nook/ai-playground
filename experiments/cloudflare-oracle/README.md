# CF-ORACLE-1｜AI Connector × Cloudflare Worker × D1 × Netlify 換殼

- 日期：2026-10-09
- 狀態：Completed（功能與跨站實機驗證完成）
- Cloudflare 原站：https://cf-lab-oracle.claire-nook.workers.dev/
- Netlify 換殼：https://ai-playground-lab.netlify.app/cloudflare-oracle/
- Worker：`cf-lab-oracle`（v1.2.0）
- 資料庫：共用測試 D1 `lab-smoke-db`
- 實驗證據：[CF-ORACLE-1](../../evidence/cf-oracle-1.md)

## 研究問題

AI 能否透過已授權的 Cloudflare Connector，直接操作 Cloudflare Worker 與 D1，完成 API、網頁及資料庫讀寫整合；再把網頁前端換到 Netlify，而不搬動 API 與 D1？

本次是技術可行性與協作能力實驗，不是正式產品上線或安全驗收。

## 實驗過程

### 1. Connector 直接建立 Worker API

AI 透過 Cloudflare Connector 建立並部署 `cf-lab-oracle`，先提供 `/health`、`/oracle` JSON API。初版由 Worker 內建八支測試籤文，不涉及 D1。Claire 在 iPad Safari 確認 API 回應。

### 2. Cloudflare 原生網頁

AI 直接更新 Worker，使根路徑提供 HTML、CSS、JavaScript 電子神廟介面。瀏覽器以同源 `/oracle` 取得籤文，Claire 實機完成求籤。

### 3. D1 綁定、查詢與寫入

AI 曾建立臨時 D1 `cf-lab-oracle-db`，後依 Claire 指示改用既有共用測試 D1 `lab-smoke-db`，保留原本 `lab_smoke_items`，刪除多餘的臨時資料庫。

在共用 D1 建立：
- `oracle_fortunes`：200 支測試籤文，四類各 50 支。
- `oracle_draws`：每次成功求籤的事件紀錄。

Worker v1.2.0 透過 `DB` binding 讀取籤文、寫入事件，並以 `/stats` 回傳今日、本月與累計次數（台灣時間）。Claire 首輪在 Safari 求籤六次，畫面統計為 6／6／6。

200 支籤文包含共用內容模板，不代表 200 篇完全獨立創作。求籤次數是事件數，不是獨立訪客數。

### 4. Netlify 換殼

AI 透過 Cloudflare Connector 讀回已部署 Worker 的原始碼，取得原版網頁；將網頁複製到 GitHub `ai-playground/public/cloudflare-oracle/index.html`，只調整前端呼叫位置，讓 `/oracle`、`/stats` 指向既有 Cloudflare Worker URL。沿用 Repository 原本的 `public/` → Netlify 自動部署方式，不新增 Netlify Function。

- GitHub commit：`94c4cec9abbcefdc461e53d5ec765ee83333297c`
- Cloudflare 原站、Worker 邏輯與 D1 均未為換殼而修改。
- Worker 當時已對 JSON API 回應設定 `Access-Control-Allow-Origin: *` 並支援 `OPTIONS`，故此次跨來源 GET 不需新增 CORS 設定。

Claire 在 iPad Safari 分別操作兩個網站：Netlify 網頁成功取得第 63 籤；Cloudflare 原站成功取得第 199 籤。畫面中的今日／本月／累計統計由 9／9／9 增至 10／10／10。這提供兩個 Hosting 前端共用同一 Worker API 與 D1 的端到端功能證據。

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

## 研究結論

1. 在已授權及本次測試的操作範圍內，AI 可透過 Connector 直接部署 Worker、操作 D1、建立綁定與更新網頁，不需使用者在 iPad 執行本機 CLI。
2. Worker API、前端 UI、D1 可明確分層；同一 API 可供不同 Hosting 的前端使用。
3. Netlify 換殼不需要複製後端或搬移資料庫。Cloudflare 原站保留為可使用的對照組。
4. AI 工具操作成功與 Safari 實機驗證是不同證據層次；本次兩者均已取得功能證據。

## 留存與邊界

- [schema.sql](schema.sql) 只保存 `CREATE TABLE`／`CREATE INDEX` 結構，不保存 200 支籤文的 INSERT 腳本。
- [queries.sql](queries.sql) 是早期查詢探索參考，不保證日期查詢符合台灣時區。
- 共用 D1 不得為單一實驗而整庫刪除；目前 Schema 不記錄 IP。
- 未執行完整負載、併發、重試冪等性、故障復原或資安驗收。
- **Authentication（身分驗證）、Authorization（授權）、Rate Limiting（速率限制）與 CORS 存取政策，屬於下一個獨立 API Security 實驗。** 本實驗僅驗證跨來源呼叫可用，不宣稱 API 已受到保護。
