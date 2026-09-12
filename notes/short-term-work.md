# Short-term Work Items

> 無交期。依 Claire 有空研究的時間逐項進行。
> 這不是正式開發排程，也不是 Nook Works Specification；只是 Playground 的近期實驗清單，避免跨對話後遺失上下文。

## Login / API Platform Experiments

### A. Supabase Auth — Completed / Verified

目的：驗證由 Netlify 上的 Browser UI 直接使用 Supabase Auth 的基本 Authentication Path。

結果：已於 2026-09-12 完成，並由 Claire 在 iPad Safari 實際驗證 Browser → Supabase Auth → `auth.users` Identity → Session 成功。

- Evidence Record：`experiments/auth/README.md`
- Evidence Index：`evidence/index.md`
- Artifact：`experiments/auth/index.html`

### B. Supabase Data API — CRUD / Application Access — Completed / Verified

目的：驗證 Supabase 自動提供的 Native CRUD / Data API 是否可作為 Browser Data Access baseline，並實際驗證 Nook Works Application Access Boundary。

結果：已於 2026-09-12 由 Claire 在 iPad Safari 完成 Browser Evidence。

已驗證：
- Claire active `app_user` 可透過 Browser Native Data API 完成 SELECT / INSERT / UPDATE / DELETE。
- TU01 有 Auth + inactive `app_user`，無 Application Data Access。
- TU02 有 Auth + no `app_user`，無 Application Data Access。
- Authentication Success 不等於 Application Access。
- RLS 對 SELECT / INSERT / UPDATE / DELETE 的 observable response semantics 不完全相同。
- `error = null` 不等於 Business Operation Success；UPDATE / DELETE 空結果不能單靠 response 區分 target 不存在與不可見。
- Anonymous INSERT 可在 table privilege layer 直接被拒絕；authenticated Identity 則可進一步由 RLS 判斷。
- INSERT PK 由 Database Identity 自動產生，UI 不輸入 OID。

Experiment Limitation：
- Probe UPDATE / DELETE 使用不存在 OID，未直接驗證「existing row 被 RLS 擋」的可區分 response。
- Anonymous 未逐項完成完整 CRUD response matrix。

Playground Experience：
- API Result / JSON Evidence 應提供 Copy Result，方便 Claire 從 iPad Browser 將結構化 Evidence 帶回 AI 分析。
- Evidence UI 應兼顧可觀察與可搬運，不只把 debug output 丟進 `<pre>` 就假裝人類手指不存在。

- Evidence Record：`experiments/data-api/README.md`
- Evidence Index：`evidence/index.md`
- Artifact：`experiments/data-api/index.html`

### B-1. Supabase Data API — View Read / Security — In Progress

目的：延伸 B 的 Native Data API baseline，但保持 B Artifact 封箱不修改；專門驗證 PostgreSQL View 作為 Read Model 的 Data API 與 Security 行為。

目前範圍：
- `test_k7m4x2` 額外加入語意中立 linkage `oid_ooxx`。
- 建立 `test_vw_r8n3q5`，join `app_user` 並輸出 `app_user_name AS happy_name`。
- View 明確使用 `security_invoker = true`。
- `authenticated` 僅授予 View SELECT；不測 View C/U/D。
- Browser 驗證 Claire / TU01 / TU02 / Anonymous 的 View SELECT observable result。
- 驗證 View alias / join 是否能形成不直接等同 Physical Table Column 的 Read Contract。
- Artifact 內提供 Copy Result，方便 iPad 將結構化 Evidence 帶回 AI。

目前狀態：
- Database test object / View 已完成。
- Direct DB inspection 已確認 View join / alias 與 `security_invoker=true` 設定。
- Browser Artifact 已建立，等待 Claire iPad Safari Evidence。
- Direct privileged DB query 不視為 Browser RLS Evidence。

- Experiment Record：`experiments/data-api-view/README.md`
- Artifact：`experiments/data-api-view/index.html`

### C. Supabase Custom API — Read Test Data

目的：驗證自行開發的 API 是否能部署於 Supabase，並完成 Browser → API → Database → Response 的完整路徑。

暫定範圍：
- 自行實作一支最小 API。
- 使用與 Experiment B 相同的語意中立 `test_` Database Object 與 Test Data。
- 驗證 API 的開發、部署、呼叫、DB Access、Authentication Context 與 JSON Response。
- 暫時不加入 Role、Menu、Permission、複雜 Business Rule、Transaction。
- 暫時不評估 Netlify Function。

### D. Supabase RPC — Read Test Data

目的：驗證 PostgreSQL Function + RPC 是否能完成與 B / C 相同的資料讀取需求。

暫定範圍：
- 建立實驗用 `test_` PostgreSQL Function / RPC。
- 使用與 B / C 相同的語意中立 Test Object 與 Test Data。
- 觀察 RPC Authentication Context、Permission、RLS 與 Function Security Mode。
- 不以 `SECURITY DEFINER` 作為繞過權限問題的預設解法。

## 後續比較

A 已完成 Authentication baseline；B 已完成 Native Data API CRUD / Application Access baseline；B-1 正在補 View Read / Security Evidence。

C、D 再以相同 Test Object 延伸 Custom API / RPC 實驗，避免 Business Logic 與正式 Business Semantic 污染 Technical Mechanism 的比較。

B / B-1 的結果提醒後續比較不能只問「能不能讀寫資料」，還要比較：
- Business Result semantics 是否清楚。
- Authorization failure / Not Found / affected rows 是否可被 Application 正確判讀。
- Read 是否可由 Table / View Native Data API 提供合適 Contract。
- Business Validation 與 Transaction 應由哪一層負責。
- Native Data API、Custom API、RPC 各自適合負責什麼。
- RPC vs Custom API 是否需要二選一，或應形成不同適用情境的 Platform Rule。

目前不預設結論，也不把實驗結果直接視為 Production Architecture。
