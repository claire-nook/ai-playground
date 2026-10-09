# CF-ORACLE-1 — Cloudflare Connector / Cloud Oracle

- Date: 2026-10-09（紀錄整理日期；Phase 1–2 實驗早於本次整理）
- Status: In Progress / Phase 1–2 Verified by AI runtime + Claire iPad Safari
- Environment: ChatGPT Cloudflare Connector、Cloudflare Workers、iPad Safari
- Live Demo: https://cf-lab-oracle.claire-nook.workers.dev/
- Phase 3 candidate database: `cf-lab-oracle-db`（尚未建立）
- Tags: cloudflare, connector, workers, d1, direct-deployment, ipad-first, api

## 為什麼做

研究 AI 能否不經本機 CLI、GitHub Actions 或人工複製程式碼，直接透過 Cloudflare Connector 建立與更新公開雲端服務。這是 Connector 能力實驗，不是傳統 Git-based deployment 實驗；Phase 1–2 不以歸檔 Worker 原始碼為驗證條件。

## Research Questions

1. Connector 能否建立 Worker、部署 API、開啟 workers.dev 路由？
2. 能否更新同一 Worker，直接提供 HTML/CSS/JS 前端與 API？
3. 能否操作 D1：建表、seed、SELECT、INSERT、JOIN、每日/月統計？
4. 後續可否以 Netlify 當前端殼，與 Cloudflare Worker API 進行跨來源整合？

## Phase 1 — Worker API（已驗證）

- AI 透過 Cloudflare Connector 建立並部署 `cf-lab-oracle`。
- 啟用公開 workers.dev route。
- `/health` 回傳健康狀態 JSON；`/oracle` 從八支 hard-coded 籤文隨機回傳 JSON。
- Claire 在 iPad Safari 實際開啟兩個 API，並觀察重新請求可能出現不同籤文。
- Boundary：不是 D1 查詢、不是 AI 即時生成籤文；隨機不保證連續兩次不重複。

## Phase 2 — Same-origin Worker Frontend（已驗證）

- AI 經 Connector 更新同一 Worker，根路徑 `/` 提供深色科技神廟 HTML/CSS/JS。
- Browser 按「啟動神諭」→ fetch `/oracle` → JSON → DOM 顯示籤文。
- Claire 提供 iPad Safari 首頁及成功求籤截圖，確認畫面與互動。
- 保留「廟公・墨衡 × 創廟人・Claire」與 CC LAB 識別。
- Boundary：尚未驗證 D1、獨立 Netlify 前端、手機直式版；Cloudflare 直接部署 source 不以 GitHub 原始碼歸檔為本 Phase 目的。

## Phase 3 — D1 資料庫（Candidate / 尚未執行）

目標：兩張表 `oracle_fortunes`（籤文及分類）、`oracle_draws`（每次**成功求籤**才寫入一筆事件）。開首頁、切分類、看歷史紀錄都不新增求籤事件。

- [schema.sql](schema.sql)：可重建的 D1 Schema 草案。
- [seed.sql](seed.sql)：籤文種子資料草案，與既有八籤並非完整逐字對應，正式執行前須確認。
- [queries.sql](queries.sql)：查詢及寫入驗證 SQL 草案。
- Database candidate: `cf-lab-oracle-db`；名稱公開不代表具備存取權。
- 預計驗證：D1 建表、seed、分類抽籤、求籤 INSERT、JOIN、每日/月 COUNT。
- UI：求籤期間停用按鈕，儀式進度條約 90% 等待 API 真實結果；成功後才 100%，失敗不可假裝成功。
- IP：討論過只留 IPv4 第一組，但沒有必要用它計算求籤次數；**本版 Schema 不存 IP**。若未來另有研究目的，需重新確認隱私及 IPv6 規則。
- Unknown：寫入失敗時是否仍發籤、重試造成重複 INSERT 的 idempotency 策略、實際 D1 API/Connector 支援情況。
- **此階段尚未建立 D1、未執行 SQL、未驗證 Worker 寫入。**

## Future — Netlify frontend（Planned）

候選架構：Netlify HTML/JS → Cloudflare Worker API → D1，與目前 same-origin Worker 方案比較 CORS 與部署責任。可能有兩個 Demo；研究網站 Catalog 仍只提供一個主要 Live Demo，其他 URL 由本 Experiment / Evidence 保留。尚未實測。

## Evidence / Boundaries

- [Evidence](../../evidence/cf-oracle-1.md)
- [Evidence Index](../../evidence/index.md)
- 目前實際 Demo：https://cf-lab-oracle.claire-nook.workers.dev/
- Phase 1–2 是 Connector 直接操作的 runtime / human-environment evidence，不等於 source archive 或 production architecture。
