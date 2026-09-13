# Experiment C — Supabase Custom API

## C-0 — Supabase Edge Function Deployment Lifecycle

- Date: 2026-09-12
- Status: Completed / Verified

GitHub source → GitHub Actions → Supabase CLI → Edge Function，以及 GitHub source → ChatGPT Supabase Connector → Edge Function 均已驗證。iPad-first lifecycle 不要求 Local Desktop / Mac。完整 lifecycle Evidence 延續既有 C-0 結論。

---

## C-DB-1 — Database-centric Custom API

- Date: 2026-09-13
- Status: Completed / Verified
- API: `supabase/functions/test-place-country/index.ts`
- Browser: `public/custom-api/index.html`
- PostgreSQL Function: `public.test_get_valid_places()`

### Verified chain

```text
Netlify Browser
→ Supabase Auth JWT
→ test-place-country Edge Function
→ RPC / PostgreSQL Function
→ Native Data API SELECT
→ application-side mapping
→ Browser result
```

具有效 Application Access 的 Claire 測試帳號得到 HTTP 200、2 個 Place；TU01 / TU02 均 Authentication Success，但因 tested RLS / Application Access behavior 得到 HTTP 200 + `rows=[]`。這支持 caller-scoped RLS boundary 在 tested chain 中被保留。

RLS empty rows 仍不能區分 `No Data` 與 `No Application Access`。Explicit Business Authorization / 403 semantics 尚未驗證。Custom API 內 Native INSERT / UPDATE / DELETE 也不屬於本 Probe；Native CRUD 已由 Experiment B 驗證。

---

## C-EXT-1 — Custom API Orchestration / External API

- Date: 2026-09-13
- Status: Completed / Runtime Verified
- Weather API: `supabase/functions/test-weather-orchestrator/index.ts`
- Internal API: `supabase/functions/test-place-country/index.ts`
- Browser: `public/custom-api-orchestration/index.html`
- Deployment: `.github/workflows/deploy-test-weather-orchestrator.yml`
- External Provider: Open-Meteo Weather Forecast API

### Research Question

Supabase Edge Function 是否能承擔 Nook Works 常見的 orchestration workload：一支 Custom API 以 caller identity 呼叫另一支 Custom API，取得 RLS-filtered application data，再呼叫 External API，最後 normalize 成 Browser 可使用的 response？

### Probe design

```text
Netlify Browser
→ Supabase Auth JWT
→ test-weather-orchestrator
→ forward same Authorization header
→ test-place-country
→ PostgreSQL / RLS valid places
→ Weather Orchestrator
→ Open-Meteo per Place
→ application-side normalization
→ Browser
```

Weather Orchestrator 刻意不直接碰 DB / RPC。`test-place-country` 負責「caller 可見的有效 Place」，Weather API 負責「取得這些 Place 的外部天氣並 normalize」。本 Probe 不寫 DB、不測 CUD、不加 scheduler / queue / retry framework，也不做 Open-Meteo Multiple Locations optimization。

### Deployment Evidence

PR #16 經 Primary Agent Technical QC 後 merge 至 `main`，merge commit：

`08cdadb027490e298ae72f9ff0ba1d5440cdc8de`

Claire 由 GitHub UI 觸發 `Deploy Test Weather Orchestrator` workflow。GitHub Actions Run `34762954904` completed / success；checkout 正是上述 main commit。Supabase CLI `2.117.0` 實際輸出：

```text
Deploying Function: test-weather-orchestrator (script size: 4.5 kB)
Deployed Functions on project cctonymfrxneonxryqei: test-weather-orchestrator
```

Workflow 使用 GitHub Actions secret `SUPABASE_ACCESS_TOKEN`，log 中值被 masking；deploy command 沒有 `--no-verify-jwt`。

### Runtime Evidence

#### 1. No Authorization header

直接開 Weather endpoint，未攜帶 Authorization：

```json
{"code":"UNAUTHORIZED_NO_AUTH_HEADER","message":"Missing authorization header"}
```

這證明未取得 / 未攜帶 caller JWT 的 request 不會進入正常 orchestration path。精確語意是 Authentication 未成立，不應寫成「登入後但未授權」。

#### 2. Valid Application Access identity

具有效 Application Access 的 Claire 測試帳號由 Netlify Browser UI 實測：

```text
HTTP 200
valid_place_api_status = 200
place_count = 2
weather_success_count = 2
weather_failure_count = 0
```

札幌與雪梨兩筆均 `provider_status = 200`，並成功 normalize temperature min/max、precipitation、weather code、sunrise、sunset、daylight duration 與 timezone。

因此下列完整 runtime chain 已實際成立：

```text
Browser → Custom API A → Custom API B → RLS-filtered data
        → Custom API A → External API → normalization → Browser
```

#### 3. TU01 / TU02

TU01 與 TU02 均能正常 Authentication，但兩者 observable result 相同：

```json
{
  "experiment": "custom-api-orchestration",
  "valid_place_api_status": 200,
  "place_count": 0,
  "weather_success_count": 0,
  "weather_failure_count": 0,
  "rows": []
}
```

Browser UI 顯示沒有可見有效地點，因此沒有發出 Open-Meteo request。這與 C-DB-1 Evidence 一致，並進一步支持 caller identity / RLS visibility behavior 在 `Weather API → Valid Place API` 的 API composition 中仍被保留。

這仍不是 explicit Business Authorization Evidence：`HTTP 200 + rows=[]` 無法區分真正無資料與沒有 Application Access。

### Place-local D-1 observation

本次同一個 request 中：

- Sapporo / `Asia/Tokyo` → `weather_date = 2026-09-12`
- Sydney / `Australia/Sydney` → `weather_date = 2026-09-13`

Open-Meteo request 使用 `timezone=auto`，因此「D-1」應理解為 **each Place timezone based previous local calendar date**，而不是 Browser、Claire 所在地或 server 的單一全域昨天。

這是未來 Daily Weather Batch Specification 必須明確寫出的 Business / Time Semantics，否則「昨天」會成為一顆很有文化底蘊的時區地雷。

### Verified capability baseline

```text
Supabase Edge Function outbound HTTP                         VERIFIED
Custom API → Custom API composition                         VERIFIED
Caller Authorization forwarding through tested API chain   VERIFIED
Caller-scoped RLS visibility through composition            VERIFIED
External API per-Place calls                                VERIFIED
Application-side external response normalization            VERIFIED
Zero-visible-place short-circuit                            VERIFIED
GitHub Actions → Supabase deployment                        VERIFIED
Explicit Business Authorization / 403 semantics             NOT YET
DB CUD inside Custom API                                     NOT TESTED HERE
Retry / queue / scheduling / long-running behavior           NOT TESTED HERE
Secret management for external provider credential           NOT TESTED (Open-Meteo probe needs no key)
```

### Architecture implication, not Production Decision

C-DB-1 與 C-EXT-1 合併後，Supabase Edge Functions 已對兩種 Nook Works 預期主要 workload class 留下 runtime Evidence：

1. Database-centric / application processing.
2. Internal API composition + External API orchestration.

因此 `Supabase = Auth + Primary Custom API + PostgreSQL/RLS` 的候選架構可信度進一步提高；Netlify 可自然維持 Web/UI delivery responsibility。這仍不是 Production Architecture Decision，Pure Compute / longer-running、runtime limits、observability、cost 與需要時的 explicit Business Contract 仍待後續研究。