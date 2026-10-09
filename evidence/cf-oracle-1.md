# CF-ORACLE-1 — Cloudflare Connector 直接部署 Evidence

- Recorded: 2026-10-09
- Status: Phase 1–2 Verified / Phase 3 Candidate
- Experiment: [Cloud Oracle](../experiments/cloudflare-oracle/README.md)
- Live Demo: https://cf-lab-oracle.claire-nook.workers.dev/

## 研究目標

驗證 ChatGPT 能否直接使用 Cloudflare Connector 操作 Worker 的建立、部署、公開路由與更新，不仰賴 iPad 本機 CLI 或 GitHub Actions。後續延伸 D1，但不能將計畫當成證據。

## Phase 1｜AI Direct Runtime Evidence

Cloudflare Connector 回報成功建立與部署 `cf-lab-oracle`，並啟用 workers.dev 公開路由。Worker 提供 `/health` 與 `/oracle`；籤文由 Worker 內建八支資料隨機選取，並非資料庫讀取或 AI inference。

### Claire Human Environment Evidence

Claire 在 iPad Safari 實際開啟 `/health`、`/oracle`，截圖確認 JSON 回應；重新開啟 `/oracle` 觀察到不同籤文 ID。這支持公開 API 可存取與隨機結果可能變化，不證明每次必定不同。

## Phase 2｜AI Direct Runtime Evidence

Connector 更新同一 Worker，於根路徑提供 HTML/CSS/JS，前端呼叫同來源 `/oracle` 並呈現籤文。

### Claire Human Environment Evidence

Claire 提供 iPad Safari 首頁及求籤結果截圖；可見深色科技神廟前端、求籤按鈕、籤文結果與 CC LAB 署名。這支持 Browser → Worker API → DOM 的端到端互動。

## Interpretation / Boundaries

- 已驗證：Connector 直接建立、部署、更新 Worker，以及公開 API / 前端的 iPad Safari 操作。
- 尚未驗證：D1 CREATE TABLE / INSERT / SELECT / JOIN、Netlify 前端跨來源請求、Cloudflare Worker 刪除。
- Phase 1–2 不以 GitHub 原始碼歸檔為研究目標；直接部署本身是驗證對象。
- Phase 3 Schema / SQL 已保存為 Candidate，**不是 D1 執行成功的證據**。
- 後續若有 Netlify Demo，仍保留本 Worker Demo URL 作架構對照。
