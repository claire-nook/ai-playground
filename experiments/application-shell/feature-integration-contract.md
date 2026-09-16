# S-SHELL-1 Feature Integration Contract

這份文件是 S-SHELL-1 implementation-scoped contract。它不是 Nook Works Production API Specification，也不把 Playground probe 升格為 Platform Rule。

## Purpose

S-SHELL-1 不只驗證 Shell 能顯示 Navigation，而要證明同一個 Application Shell 可以承載不同 integration shape 的 Feature，同時保持 Feature classification 與 data source / integration mechanism 解耦。

本輪固定三個 Feature：

| Feature Code | Classification | Route | Integration Shape |
|---|---|---|---|
| `FUNC_BUSINESS_PLACE` | business | `/business/places` | Browser → Supabase Native Data API → `place` |
| `FUNC_BUSINESS_WEATHER` | business | `/business/weather` | Browser → Native Data API `place` → Open-Meteo External API |
| `FUNC_COMMON_PLACE_COUNTRY` | common | `/common/place-country` | Browser → Supabase Edge Function `test-place-country` |

`business` / `common` 是 Feature classification，不是 table classification。Feature 可以讀 Basic Data、synthetic data、Custom API 或 External API；不要從資料來源反推 Feature 類型。

## Shared Boundary

- 所有 Feature 都是 read-only probe。
- 不新增正式 Business table，也不讀取 `app_user` 作為 Feature data source。
- 大量資料 navigation 不在本實驗處理。Pagination / Search / Sort / Filter 延後到 Platform UI Experiment。
- 所有 query 必須 bounded；UI 只需要足夠證明 real retrieval + render 的少量資料。
- Navigation Visibility / Feature Entry 不是 Backend Authorization。
- 不因 Demo 需要而新增 Role / Permission / RBAC。

## Feature A — Business / Place Native

### Goal

證明 Business Feature 可以在 authenticated Shell 內直接使用 Supabase Native Data API 讀取 formal Basic Data。

### Data source

`public.place`

可用欄位：

- `oid`
- `place_code`
- `place_name`
- `latitude`
- `longitude`
- `timezone`
- `is_active`

### Query contract

- 只讀 `is_active = true`。
- 使用 deterministic order，例如 `place_code`。
- bounded read，最多顯示少量 rows；不實作 Pagination。
- UI 至少呈現 `place_name`、latitude / longitude、timezone，讓 Human Evidence 能辨識確實取得 real data。

## Feature B — Business / Place Weather

### Goal

證明單一 Feature 可以在 browser application layer composition internal Native Data 與 direct External API，而不是條件反射再包一層自家 Custom API。

### Step 1 — Select places

從 `public.place` 取得少量 active places，必須具有效 numeric latitude / longitude。選 2 個即可。

本實驗不要求真正 random SQL ordering；可以從 bounded candidate set 在 browser 隨機選 2 個，避免為 Demo 製造昂貴或不可重現的 query pattern。

### Step 2 — Direct External API

Provider: Open-Meteo Weather Forecast API

Official documentation: `https://open-meteo.com/en/docs`

Endpoint:

`GET https://api.open-meteo.com/v1/forecast`

Required request inputs for this probe:

- `latitude`
- `longitude`
- `timezone=auto`
- `daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weather_code,sunrise,sunset`
- `forecast_days=1`

Open-Meteo current documentation confirms `/v1/forecast` accepts WGS84 latitude / longitude, `daily` variable lists, `forecast_days`, and `timezone=auto`. No credential is introduced by this Playground contract.

### Response subset

UI only depends on:

- `timezone`
- `daily.time[0]`
- `daily.temperature_2m_min[0]`
- `daily.temperature_2m_max[0]`
- `daily.precipitation_sum[0]`
- `daily.weather_code[0]`
- `daily.sunrise[0]`
- `daily.sunset[0]`

Combine those values with the selected Place identity in application code.

### Failure behavior

- Place query failure: Feature shows a bounded Feature-level error state; do not call provider.
- One provider call fails: keep the successful Place result visible and show a failure state for the failed Place.
- Both provider calls fail: Feature remains inside Shell and shows Feature-level failure; do not collapse the entire Shell.
- Loading state must be visible while composition is in progress.

## Feature C — Common / Place-Country Custom API

### Goal

證明 Common Feature 可以在 authenticated Shell 內 consume an existing Custom API without knowing its internal RPC / Native Data implementation details。

### Existing API

Supabase Edge Function: `test-place-country`

Runtime fact checked before dispatch:

- status: ACTIVE
- `verify_jwt = true`
- method supported by implementation: GET / POST / OPTIONS
- Browser call must carry the current caller Authorization header / session JWT.
- CORS headers are already implemented by the existing function.

Endpoint shape:

`<SUPABASE_URL>/functions/v1/test-place-country`

### Response contract

Success JSON contains:

- `experiment`
- `rpc_row_count`
- `country_row_count`
- `place_detail_row_count`
- `rows[]`

Each row currently contains:

- `oid`
- `place_code`
- `place_name`
- `country_code`
- `country_name`
- `country_name_en`
- `latitude`
- `longitude`
- `timezone`

Feature UI only needs a bounded subset of returned rows. It must not modify the Edge Function merely to add server-side pagination for S-SHELL-1.

### Failure behavior

- Missing/invalid session or non-success response becomes Feature-level error presentation.
- Do not substitute privileged credentials.
- Do not modify `test-place-country` architecture unless implementation discovers a verified blocker; stop and report the blocker instead.

## Feature Entry Matrix

| user_type | Place Native | Place Weather | Place-Country Custom | Home |
|---|---:|---:|---:|---:|
| admin | yes | yes | yes | yes |
| user | yes | yes | no | yes |
| guest | no | no | no | yes |

An active `guest` is Application Eligible but has no Feature Entry mapping in this experiment.

## Deferred to Platform UI Experiment

The following are explicitly not S-SHELL-1 acceptance requirements:

- Pagination
- Search
- Sort controls
- Filter controls
- reusable Data Grid / Table abstraction
- CRUD interaction patterns
- generic List / Detail / Edit framework

S-SHELL-1 uses bounded reads only. Shell answers「Feature 怎麼被平台承載與進入」；Platform UI answers「進入 Feature 後，大量資料與共用互動怎麼操作」。不要讓一個 disposable Shell 背著整套 ERP UI 出生。
