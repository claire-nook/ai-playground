# Experiment C — Supabase Custom API

## C-0 — Supabase Edge Function Deployment Lifecycle

- Date: 2026-09-12
- Status: Completed / Verified
- Question: iPad-first workflow 能否在沒有 Local Desktop / Mac CLI 的情況下部署、呼叫、檢查與移除 Supabase Edge Function？

### Result

C-0 已驗證兩條可行 deployment path：

```text
GitHub source → GitHub Actions → Supabase CLI → Edge Function
GitHub source → ChatGPT Supabase Connector → Edge Function
```

GitHub Actions + CLI 完成 deploy / invoke / delete；Connector 完成 deploy / inspect，Connector-deployed function 亦可由 Actions delete。Claire 以 iPad Safari 實際取得 `hello-action` 預期 JSON。

因此在已測條件下，Supabase Edge Function lifecycle 不要求 Claire 擁有 Local Desktop / Mac。正式 Production deployment mechanism 尚未決定。

### Credential observation

GitHub Actions route 在當時需要 Supabase PAT；Claire 可用的是 temporary Classic PAT，權限範圍偏大。Connector deployment 不需要 Claire 另外建立並注入 user-managed PAT，但當時 Connector 沒有 Edge Function delete action。這是 deployment governance / credential trade-off，不是 provider winner 結論。

### C-0 scope boundary

C-0 刻意使用無 DB、Auth、RLS、CORS、Business Logic 的 Hello World，只回答 deployment lifecycle。後續 Database-centric probe 已補上這些 Application Integration Evidence。

---

## C-DB-1 — Database-centric Custom API

- Date: 2026-09-13
- Status: Completed / Verified
- Runtime: Supabase Edge Functions
- Browser Host: Netlify
- API source: `supabase/functions/test-place-country/index.ts`
- Browser artifact: `public/custom-api/index.html`
- PostgreSQL Function: `public.test_get_valid_places()`

### Question

Supabase Edge Function 作為 Nook Works Custom API runtime 時，是否能在 authenticated Browser request 中：

1. 接受 Supabase Auth JWT；
2. 透過 RPC 呼叫 PostgreSQL Function；
3. 再由 Custom API 使用 Supabase Native Data API 讀取 Table；
4. 在 Application Layer 做 mapping / response shaping；
5. 保留 caller-scoped RLS / Application Access behavior？

### Probe design

這是一個刻意有點繞路的最小 Probe。Database 本來可以直接 join country，但本次故意拆開責任，讓一支 API 同時實際走過 RPC 與 Native Data API：

```text
Netlify Browser
→ Supabase Auth Session / JWT
→ Supabase Edge Function: test-place-country
→ RPC: test_get_valid_places()
→ place + country_code
→ Native Data API: country SELECT
→ Edge Function mapping
→ JSON response
→ Browser human-readable cards + Evidence / Debug
```

Edge Function 使用 Publishable/Anon runtime credential 加上 caller `Authorization` header，而不是 `service_role`，目的就是讓 RPC 與 Data API 在 caller identity 下執行並觀察既有 RLS / Application Access Boundary。

### Browser / CORS

Netlify 與 Supabase Edge Function 是不同 Origin。帶 `Authorization` header 的 Browser request 會觸發 CORS preflight，因此 API 明確處理 `OPTIONS`，並回傳允許 `authorization`, `x-client-info`, `apikey`, `content-type` 的 CORS headers。

這次實測證明：

```text
Netlify-hosted Browser → cross-origin Supabase Edge Function
```

在 authenticated request 下可成功完成，不再只是 C-0 的 Safari direct navigation。

### Verified capability results

#### 1. Custom API 建立與 authenticated Browser invocation

**VERIFIED**

Supabase Edge Function `test-place-country` 已部署並由 Netlify-hosted Browser 以 Supabase Auth Session 成功呼叫。正常 request 回傳 HTTP `200`。

#### 2. Custom API → RPC → PostgreSQL Function

**VERIFIED**

Edge Function 使用：

```text
rpc("test_get_valid_places")
```

成功取得 active place rows。Claire 的有效 Application Identity 實測 `rpc_row_count = 2`。

#### 3. Custom API → Supabase Native Data API

**VERIFIED for SELECT**

Edge Function 取得 RPC 回傳的 distinct country codes 後，以一次 batched `IN` query 讀取 `country`，沒有做 N+1 request。Claire 的有效 Identity 實測 `country_row_count = 2`。

本次 Custom API probe 只驗證 Native Data API `SELECT`。INSERT / UPDATE / DELETE 的 Native CRUD capability 已由 Experiment B 在 Browser → Native Data API path 驗證，但不應偷渡成「Custom API 內 CRUD 四項都已測」。

#### 4. Application-side mapping / response shaping

**VERIFIED**

Edge Function 將 RPC place rows 與 Native Data API country rows mapping 後回傳 application result。實測 response：

```json
{
  "experiment": "database-centric-custom-api",
  "rpc_row_count": 2,
  "country_row_count": 2,
  "rows": [
    {
      "oid": 1,
      "place_code": "sapporo",
      "place_name": "札幌",
      "country_code": "JP",
      "country_name": "日本",
      "country_name_en": "Japan"
    },
    {
      "oid": 2,
      "place_code": "sydney",
      "place_name": "雪梨",
      "country_code": "AU",
      "country_name": "澳洲",
      "country_name_en": "Australia"
    }
  ]
}
```

Browser UI 亦將結果顯示為正常人類可讀的地點卡片，Raw JSON / HTTP Status 則保留在 Evidence / Debug 區，不把 SA 永久關在 `<pre>` 裡。

### Identity / RLS evidence

三種 authenticated Identity 均由同一 Netlify Browser Artifact 實測：

| Identity | Authentication | Observable API result |
| --- | --- | --- |
| Claire / active Application User | Success | HTTP 200, RPC 2 rows, Country 2 rows, final 2 rows |
| TU01 / inactive Application User | Success | HTTP 200, RPC 0 rows, Country 0 rows, `rows=[]` |
| TU02 / no effective Application User mapping | Success | HTTP 200, RPC 0 rows, Country 0 rows, `rows=[]` |

這支持 caller JWT / RLS boundary 在本次 Edge Function → RPC / Data API path 中被保留。Custom API 沒有因 server-side execution 自動取得所有資料。

### Important semantic observation

TU01 / TU02 的 observable result 是：

```text
HTTP 200
rpc_row_count = 0
country_row_count = 0
rows = []
```

因此 RLS 可以作為 Data Security Boundary，但 `rows=[]` 本身不能區分：

```text
真的沒有資料
vs
目前 Identity 沒有 Application Access
```

這與 Experiment B 的 Native Data API Evidence 一致：technical request success / row visibility 不等於完整 Business Authorization semantics。

若未來 API Contract 需要明確 `403 No Application Access` 與 `200 No Data`，Custom API 必須額外建立 Application Authorization / Business Semantics，而不能只期待 RLS 自動翻譯。

### PostgreSQL Function DDL preservation

本次 PostgreSQL Function 是 `public.test_get_valid_places()`，使用 `SECURITY INVOKER`，讓 query 以 caller context 執行。

**限制揭露：** 本次建立 Function 時的 exact DDL 沒有先寫入 Git source；之後嘗試透過 Supabase Connector 讀回 `pg_get_functiondef()` / function body 被工具安全檢查阻擋。因此目前不能誠實地在 Experiment Record 偽造一份「看起來差不多」的 DDL。

Exact DDL 尚待從 Supabase Dashboard / SQL Editor 或可讀取 function definition 的 execution surface 補回本 Record。這不影響已完成的 runtime Evidence，但 DDL preservation 這個文件要求目前仍是 **Pending**。

### Initial capability conclusion

截至本次 Probe，可以先形成以下 Supabase Custom API capability baseline：

```text
Supabase Custom API / Edge Function                       VERIFIED
Netlify Browser → authenticated Custom API + CORS         VERIFIED
Custom API → RPC → PostgreSQL Function                    VERIFIED
Custom API → Native Data API SELECT                       VERIFIED
Custom API application-side mapping / response shaping    VERIFIED
Caller-scoped RLS behavior through tested chain           VERIFIED
Explicit Business Authorization semantics                NOT YET
Custom API Native INSERT / UPDATE / DELETE                NOT TESTED IN THIS PROBE
```

### Architecture implication, not Production Decision

本次 Evidence 支持一個目前很自然的 Nook Works platform direction：

```text
Netlify
→ Web / UI delivery

Supabase
→ Auth
→ Custom API / Edge Functions
→ Native Data API / RPC
→ PostgreSQL / RLS
```

這表示 Supabase 已具備 Database-centric Custom API 所需的基本 integration path，並強化其作為 Nook Works Primary Custom API Runtime Candidate 的可信度。

這仍不是 Production Architecture Decision。External API orchestration、Pure Compute / longer-running workload、runtime limits、observability、secrets、cost 與更明確的 Business Contract 還需要後續 Evidence。
