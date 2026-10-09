# CF-CONNECTOR-1｜Cloudflare Connector × Worker API × D1 × Netlify 換殼

- 日期：2026-10-09
- 狀態：Completed（功能與實機驗證）
- 研究類型：AI Connector 雲端操作能力、API／前端／資料庫分層、跨 Hosting 換殼
- 具體實驗：[CF-ORACLE-1](../cloudflare-oracle/README.md)
- 實驗證據：[CF-ORACLE-1 Evidence](../../evidence/cf-oracle-1.md)

## 研究問題

AI 是否能直接透過 Cloudflare Connector 完成 Worker API、D1 與網頁的建立和部署，並讓 Netlify 靜態前端沿用原 Worker API／D1，而不搬動後端？

## 實驗路徑

1. AI 透過 Connector 部署無 D1 的 Worker JSON API。
2. 同一 Worker 增加 HTML／CSS／JavaScript 同源求籤網頁。
3. Worker 綁定共用 D1 `lab-smoke-db`，使用 `oracle_fortunes` 讀取 200 支籤文，以 `oracle_draws` 記錄成功求籤，提供 `/stats`。
4. 從 Cloudflare 取回原網頁，提交至 `ai-playground/public/cloudflare-oracle/index.html`，由 Netlify 自動部署。新殼改用跨來源呼叫同一 Worker API，原 Cloudflare 網頁保留不變。
5. Claire 在 iPad Safari 驗證兩站求籤與共用統計，累計由 9 次增至 10 次。

原先規劃的「先以 Netlify 測試無 DB API，再測試 D1 API」兩階段已合併：直接使用完成 D1 整合的既有 Worker API 換殼，避免重複測試。

## 實驗網站

- Cloudflare 原站：https://cf-lab-oracle.claire-nook.workers.dev/
- Netlify 新殼：https://ai-playground-lab.netlify.app/cloudflare-oracle/

## 研究結論

- AI 在已授權範圍內，可直接透過 Cloudflare Connector 操作 Worker 與 D1，降低 iPad-first 開發對本機 CLI 的依賴。
- Cloudflare Worker API 與 D1 可供 Cloudflare、Netlify 兩個不同 Hosting 的網頁共用。
- Netlify 換殼只改前端 API 呼叫位置，無須重新部署後端或搬移資料。
- Cloudflare JSON API 當時已允許跨來源讀取，故換殼不需調整 Worker CORS；這不是 API 存取保護的證明。
- 功能已經 Safari 實機驗證，但不代表通過正式產品安全、效能或可靠性驗收。

## 後續獨立研究

**API Security 為第二個實驗**：另行研究 Authentication（身分驗證）、Authorization（授權）、Rate Limiting（速率限制）及 CORS 存取政策。此處不混入安全方案設計或尚未驗證的結論。

本案僅保留已執行的 Connector／API／UI／D1／換殼實驗範圍。
