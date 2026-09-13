# Work Order｜Custom API Orchestration Probe

## Metadata

- Work Order: `custom-api-orchestration`
- Status: `Ready`
- Work Type: `Experiment / Implementation`
- Requested By: Primary Agent
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Related Research: Supabase Custom API / External API Orchestration

## Objective｜目標

實作並盡可能部署一支 Supabase Edge Function `test-weather-orchestrator`，驗證以下真實 runtime path 是否成立：

```text
Netlify Browser Test UI
  → caller JWT
  → test-weather-orchestrator
  → forward same caller JWT
  → test-place-country
  → PostgreSQL / RLS-backed valid places
  → Open-Meteo Weather Forecast API
  → application-side normalization
  → Browser response
```

本 Probe 同時觀察 Codex 是否能在自己的 execution surface 完成 implementation，並透過 GitHub Actions + Supabase CLI 推進 deployment。Experiment Ownership 與最終 Evidence 判斷仍由 Primary Agent 負責。

## Context / Read First｜先讀這些

施工前請閱讀並以 repository 現況為準：

- `agent-work/README.md`
- `agent-work/report-language-guideline.txt`
- `playground.md`
- `experiments/custom-api/README.md`
- `supabase/functions/test-place-country/index.ts`
- `.github/workflows/deploy-hello-action.yml`
- `public/custom-api/index.html`

Business external API reference 位於正式 repo `claire-nook/nook-works`：

- `docs/business/specifications/external/api/open-meteo.md`

若 Codex execution surface 無法讀取另一個 private repository，不要猜測規格；本 Work Order 已提供本 Probe 所需的最小 Open-Meteo contract。

## Execution Context Preflight｜執行環境確認

修改前確認：

- 本 Work Order 與上述 `ai-playground` target files 存在。
- `supabase/functions/test-place-country/index.ts` 已存在，且 response contract 可提供 Place 的 `latitude` / `longitude` / `timezone`。
- `.github/workflows/deploy-hello-action.yml` 存在，僅作 GitHub Actions + Supabase CLI deployment pattern 參考。
- working tree 在施工前沒有與本任務無關的未提交修改；若有，停止並回報，不要覆蓋。

不要把 Git remote、local `main`、remote-tracking branch 或 `gh auth` 當成 repository identity 的必要條件。若真正必要 Context mismatch，停止施工並回報。

## Scope｜可以做

1. 新增 `supabase/functions/test-weather-orchestrator/index.ts`。
2. 新增本 Experiment 專用的 manual GitHub Actions deployment workflow。
3. 新增或調整 Browser Test UI artifact，讓 Claire 可在 Netlify / iPad Safari 以 Supabase Auth session 呼叫 Weather Orchestrator 並查看 normalized result 與必要 debug information。
4. 在 Codex execution surface 可行範圍內執行 syntax / static / runtime / workflow 檢查。
5. 若 execution surface 能觸發 GitHub Actions，嘗試完成 deployment；若不能，將 workflow 留在可由 Claire `workflow_dispatch` 的狀態並明確回報 Human Gate。
6. 保留必要 Report / Evidence，建立 local commit，之後由 Claire 使用 Codex Product UI Create PR。

## Out of Scope｜不要順手裝修隔壁

- 不修改 DB schema、table、RLS policy、PostgreSQL Function 或 migration。
- 不做 INSERT / UPDATE / DELETE。
- 不做 weather DB persistence。
- 不做 scheduler、queue、background job 或 retry framework。
- 不做 Open-Meteo Multiple Locations optimization；本 Probe 刻意保留 per-place outbound call，以觀察 orchestration / fan-out。
- 不建立 production-grade weather service、cache、rate-limit subsystem 或 generic API framework。
- 不重構或刪除既有 C-0 `hello-action` artifacts / workflows。
- 不把 Weather Orchestrator 改成直接查 `place` / `country` / RPC。它必須透過既有 `test-place-country` Custom API 取得 valid places。
- 不自行更新 Knowledge Catalog / Evidence Index / Technical Platform Judgment；Primary Agent QC 後處理。

## Constraints｜限制與必守規則

### Security / Identity

- Browser → Weather Orchestrator 必須使用 Supabase Auth access token：`Authorization: Bearer <JWT>`。
- Weather Orchestrator → `test-place-country` 必須 forward **同一個 caller Authorization header**。
- 不得使用 `service_role`、admin client 或其他方式繞過 caller RLS。
- 不得在 UI、log、report、commit 或 artifact 顯示完整 JWT / Refresh Token。
- GitHub Actions deployment 使用 repository secret `SUPABASE_ACCESS_TOKEN`。
- 只能以 `${{ secrets.SUPABASE_ACCESS_TOKEN }}` 引用 secret；不得讀取、輸出、記錄或要求 Claire 提供 secret value。
- `SUPABASE_PROJECT_REF` 為 public project metadata，可使用既有值 `cctonymfrxneonxryqei`。

### Deployment

- `test-weather-orchestrator` 必須保留 JWT verification。**不得**因參考 C-0 workflow 而套用 `--no-verify-jwt`。
- 不得修改 `.github/workflows/deploy-hello-action.yml` 來偷換 deployment target；新增本 Probe 專用 workflow。
- Workflow 維持 `workflow_dispatch` human gate 即可，不需建立自動 production deployment policy。

### API Responsibility

- `test-place-country` 擁有「caller 看得到哪些 valid places」的責任。
- Weather Orchestrator 擁有「取得 valid places → 呼叫 weather provider → normalize response」的責任。
- Weather Orchestrator 不直接碰 DB。
- 若 valid-place downstream API non-2xx，Weather Orchestrator 應回傳清楚的 upstream failure（建議 HTTP 502）並保留 downstream status / safe diagnostic，不洩漏 credential。
- 若 valid places 為 0，應直接回傳成功且 `place_count: 0` / empty rows；不得呼叫 Open-Meteo。
- 單一 Place 的 Open-Meteo failure 不應抹掉其他 Place 的成功結果；response 應能表達 per-place `ok` / provider status / safe error information。

### CORS / Browser

- Browser → Weather Orchestrator 是 cross-origin call，需正確處理 `OPTIONS` preflight 與必要 CORS headers。
- Server-to-server Weather Orchestrator → Valid Place / Open-Meteo 不需要把 Browser CORS 當成 internal call requirement。

## Open-Meteo Contract｜本 Probe 所需最小規格

Provider：Open-Meteo Weather Forecast API

Endpoint：`https://api.open-meteo.com/v1/forecast`

Method：GET

每個 valid Place 使用：

- `latitude=<place.latitude>`
- `longitude=<place.longitude>`
- `past_days=1`
- `forecast_days=0`
- `timezone=auto`
- `daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weather_code,sunrise,sunset,daylight_duration`

本 Probe 取 daily arrays index `0` 作為 D-1 normalized result。Weather 數值屬 time-dependent Evidence，不要 hard-code 預期值。

Open-Meteo Free API 本 Probe 不需要 API Key，因此 Secret Management 不屬於本次已驗證能力。

## Tasks / Suggested Method｜工作內容

1. 讀取 Context 並完成 Preflight。
2. 實作 `test-weather-orchestrator`：
   - `OPTIONS` → CORS response。
   - 無 Authorization → explicit 401 JSON。
   - 以 `SUPABASE_URL` 組出 `/functions/v1/test-place-country` endpoint。
   - server-to-server fetch 時 forward caller Authorization。
   - 解析 valid-place response。
   - `rows.length === 0` 時不發 Open-Meteo request，直接成功返回。
   - 有 Place 時，以清楚且可維護的方式執行 per-place Open-Meteo calls；可使用 `Promise.all`，但需保留 per-place failure isolation。
   - normalize provider response。
3. 建立本 Experiment 專用 `workflow_dispatch` deployment workflow：checkout → setup Supabase CLI → deploy `test-weather-orchestrator` with project ref，**不要使用 `--no-verify-jwt`**。
4. 建立 Browser Test UI。優先沿用 `public/custom-api/index.html` 的 Auth / visual / debug pattern，但避免破壞已驗證 C-DB-1 artifact；可建立新的 experiment page。UI 至少提供：
   - Supabase email/password login / restored session。
   - masked identity，不顯示 token。
   - 呼叫 Weather Orchestrator。
   - 每個 Place 顯示 Place / Country 與 D-1 normalized weather。
   - Debug 顯示 HTTP status、endpoint、raw JSON；不得顯示 JWT。
   - iPad Safari responsive layout。
5. 執行可行的 local/static checks。
6. Deployment execution：
   - 若 Codex execution surface 能觸發 workflow，執行並保留 Action / provider result。
   - 若不能觸發 `workflow_dispatch`，不要改用不安全 workaround，也不要聲稱已部署。Report 標記 `Human Gate`，留下 Claire 可直接 Run workflow 的明確 workflow name。
7. 填寫 Report，建立 local commit。不要把 local SHA 當成未來 GitHub PR review identity。

## Expected Response Shape｜建議 contract

可依低風險 implementation detail微調，但需保留等價資訊：

```json
{
  "experiment": "custom-api-orchestration",
  "valid_place_api_status": 200,
  "place_count": 2,
  "weather_success_count": 2,
  "weather_failure_count": 0,
  "rows": [
    {
      "place_code": "sapporo",
      "place_name": "札幌",
      "country_code": "JP",
      "ok": true,
      "provider_status": 200,
      "timezone": "Asia/Tokyo",
      "weather": {
        "weather_date": "<D-1>",
        "temperature_2m_min": "<provider value>",
        "temperature_2m_max": "<provider value>",
        "precipitation_sum": "<provider value>",
        "weather_code": "<provider value>",
        "sunrise": "<provider value>",
        "sunset": "<provider value>",
        "daylight_duration": "<provider value>"
      }
    }
  ]
}
```

## Required Evidence / Acceptance｜必要 Evidence / 驗收條件

Codex 不得自行把以下項目標成正式 `Verified`；請回報 observation，交由 Primary Agent QC。

- [ ] Git diff 清楚顯示 Weather Orchestrator source。
- [ ] Git diff 清楚顯示專用 GitHub Actions deployment workflow。
- [ ] Git diff 清楚顯示 Browser Test UI artifact。
- [ ] Source inspection 可確認 caller JWT 原樣 forward 到 `test-place-country`。
- [ ] Source inspection 可確認 Weather Orchestrator 沒有 direct DB access / service_role。
- [ ] Source inspection 可確認 0 places 時不呼叫 Open-Meteo。
- [ ] Source inspection 可確認 per-place provider failure 可被單獨表達。
- [ ] Workflow inspection 可確認使用 `SUPABASE_ACCESS_TOKEN` secret 且沒有 `--no-verify-jwt`。
- [ ] 若 deployment 被執行：保留 GitHub Action run / relevant log summary 與 Supabase deployment result。
- [ ] 若 deployment 無法由 Codex 觸發：明確記錄 execution-surface limitation 與 Human Gate，不偽裝成功。
- [ ] Browser page 可供 Claire 後續在 Netlify / iPad Safari 做 active user 與 TU01/TU02 runtime verification。
- [ ] Failure / Unknown 被明確保留。

### 後續由 Primary Agent / Claire 驗證，不要求 Codex 自我認證

Active Claire 預期：valid places > 0，實際呼叫 Open-Meteo 並得到 normalized rows。

TU01 / TU02 預期：在既有 RLS/Application Access 條件下 valid places = 0，因此 Weather Orchestrator `place_count = 0`、rows empty，且不應產生 Open-Meteo fan-out。

這些只有在實際 runtime evidence 出現後才能升格，不可僅由 source 推論為 Verified。

## Deliverables｜交付物

- `supabase/functions/test-weather-orchestrator/index.ts`
- 本 Experiment 專用 `.github/workflows/*.yml`
- Browser Test UI artifact（建議獨立於既有 C-DB-1 page）
- Work Order Report：可直接在本文件 `Report` section 填寫，或依既有 agent-work convention 建立相鄰 report；不要另起大型文件體系。
- Local commit
- Claire 透過 Codex Product UI 建立 GitHub-visible PR，供 Primary Agent Review。

## Decision Boundary｜決策邊界

Codex 可以自行決定：

- Function 內 helper function / type / naming 等低風險 implementation detail。
- Browser Test UI 的小型 layout / presentation detail。
- 不改變實驗語意前提下的 error-handling implementation detail。

Codex 不得自行決定：

- 改成 Weather Orchestrator direct DB / RPC access。
- 使用 service_role 或 admin bypass RLS。
- 改動 DB / RLS / PostgreSQL Function。
- 把 per-place Open-Meteo calls 優化成 Multiple Locations request。
- 改變既有 `test-place-country` 的 responsibility / security semantics；若發現其 contract 無法支援本 Probe，停止相關部分並回報 `Decision Needed`。
- 修改 / 取代既有 C-0 deployment Evidence。
- 建立自動 production deployment policy。
- 將 Codex report 自行升格為 Provider Verified Evidence / Production Decision。

## Report｜執行後填寫

Report 遵守 `agent-work/report-language-guideline.txt`。

### Result

待 Codex 填寫。

### Evidence

待 Codex 填寫。

### Deviations

待 Codex 填寫。

### Failure / Unknown

待 Codex 填寫。

### Observation

待 Codex 填寫。

### Candidate Conclusion

待 Codex 填寫。

### Follow-up / Decision Needed

待 Codex 填寫。
