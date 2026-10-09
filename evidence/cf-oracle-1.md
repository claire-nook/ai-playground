# CF-ORACLE-1｜Cloudflare Connector、D1 與 Netlify 換殼證據

- 日期：2026-10-09
- 狀態：Completed（功能驗證）
- 主紀錄：[Cloudflare Oracle 實驗](../experiments/cloudflare-oracle/README.md)
- Cloudflare：https://cf-lab-oracle.claire-nook.workers.dev/
- Netlify：https://ai-playground-lab.netlify.app/cloudflare-oracle/

## 證據區分

AI 的 Connector／API 操作回應、GitHub 提交結果，與 Claire 在 iPad Safari 實際看到的畫面，是不同層級的證據，不可混為一談。

## 階段一｜Worker API

**AI 操作：** 透過 Cloudflare Connector 部署 `cf-lab-oracle`，提供 `/health`、`/oracle`；最初由 Worker 內建八支籤文。

**Claire 實機：** iPad Safari 確認 JSON 回應與隨機結果。

## 階段二｜Cloudflare 同源網頁

**AI 操作：** 同一 Worker 根路徑提供 HTML／CSS／JavaScript，前端呼叫同源 API。

**Claire 實機：** Safari 成功顯示網頁、按鈕與籤文結果。

## 階段三｜D1 整合

**AI 操作：** 曾建立臨時 `cf-lab-oracle-db`；後改在共用 `lab-smoke-db` 建立 `oracle_fortunes`、`oracle_draws` 與索引，保留既有 `lab_smoke_items`，刪除臨時資料庫。建立 200 支測試籤文，四類各 50 支；Worker v1.2.0 綁定 `DB`，完成抽籤、寫入及 `/stats` 統計。

**Claire 實機：** Safari 連續求籤六次，顯示今日／本月／累計各六次。統計為事件數而非訪客數。

## 階段四｜Netlify 換殼

**AI 操作：**
- 直接從 Cloudflare 讀回目前 Worker 原始碼，取得原版 HTML。
- 確認 JSON API 原本已有 `Access-Control-Allow-Origin: *` 及 `OPTIONS` 支援；本次未修改 Worker。
- 新增 `public/cloudflare-oracle/index.html`，將兩個 API 呼叫改為原 Worker 的完整網址。
- GitHub commit：`94c4cec9abbcefdc461e53d5ec765ee83333297c`。
- 沿用既有 Netlify Git 自動部署，不搬移 D1、不新增第二套 API。

**Claire iPad Safari 實機：**
- 2026-10-09 15:19 左右，Netlify 網頁成功顯示第 63 籤（system），畫面顯示今日／本月／累計 9 次。
- 2026-10-09 15:20 左右，Cloudflare 原站成功顯示第 199 籤（health），畫面顯示今日／本月／累計 10 次。
- 兩站求籤成功，累計統計連續增加，支持共用 Worker API 與 D1 的跨 Hosting 整合已運作。

**證據界線：** 截圖為前端顯示與累計數字的證據，未同步逐列檢查 D1 原始紀錄；但已知 Worker 程式中成功抽籤會寫入 `oracle_draws`。兩站端到端功能驗證成立，不等於併發、負載或資安驗收。

## 結論與不涵蓋範圍

本次確認 AI 透過 Connector 操作 Cloudflare Worker／D1，以及 Cloudflare 原站與 Netlify 新殼共用 API／資料庫的技術可行性。使用者以 iPad Safari 完成關鍵功能驗證。

本實驗不研究 API 存取保護。現有 API 公開、CORS 允許所有來源，且 `/oracle` 成功呼叫會寫入一筆事件。Authentication、Authorization、Rate Limiting、CORS 白名單或其他安全策略應列入**獨立第二實驗**，不將尚未進行的安全工作混入本次 Completed 結論。

保留 `schema.sql` 結構 DDL；不留存測試資料 INSERT 腳本，也不宣稱正式產品可上線。
