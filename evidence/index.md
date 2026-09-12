# Playground Evidence Index

這份 Index 是 AI Playground 已形成有效 Evidence 的集中檢索入口。

未來進行 Nook Works Technical Platform 設計、Technology Selection、Architecture Discussion、Responsibility Mapping 或 Provider Capability Evaluation 時，優先從此處搜尋相關 Technical Topics，再依需要閱讀個別 Experiment Record 與 Artifact。

Evidence 代表特定時間、環境與條件下實際觀察到的結果，不等於 Production Architecture 或永久有效的 Technical Decision。

---

## Supabase Auth / Browser Authentication

- Experiment: A — Supabase Auth
- Date: 2026-09-12
- Status: Verified
- Topics: Authentication, Session, Supabase Auth, Browser, Netlify, iPadOS
- Record: `experiments/auth/README.md`
- Artifact: `experiments/auth/index.html`

### Question

Netlify-hosted Browser UI 是否可以直接使用 Supabase Auth，完成 Email / Password Authentication、取得 `auth.users` Identity 並建立 Session？

### Result

**YES.**

已在 iPad Safari 實際確認：

Netlify Browser UI → Supabase Auth → Authentication Success → `auth.users` Identity → Active Session

基本 Authentication Path 不需要自行建立 Login API 包裝 Supabase Auth。

### Verified Scope

- Netlify-hosted Browser 可直接呼叫 Supabase Auth。
- Supabase Auth User 的 Email + Password 可完成 Authentication。
- Authentication 成功後可取得 `auth.users` Identity 與 Session。
- Browser 可使用 Supabase Project URL + Publishable Key 建立此 Authentication Path。
- User ID / Email 可在 Public Experiment UI 中 Mask 後顯示。
- iPad Safari 實測 UI 與 Authentication Path 成功。

### Important Constraints / Pitfalls

- Supabase Platform Account、Database Password、Supabase Auth User 是不同 Credential / Identity Context。
- Supabase Auth Authentication Success 不等於 Nook Works Application Access Granted。
- `auth.users` Authentication Identity 與 `app_user` Application Business Identity 仍需後續建立 Context Mapping。
- Public Browser / Repository 不得使用 Secret / `service_role` Credential，也不應暴露 Password 或 Session Token。

### Not Verified

- Reload Session persistence
- Session expiration / refresh lifecycle
- Logout Browser behavior
- Passkey / OAuth Application Login
- `app_user` Application User Context
- Authorization / Role / Menu / Permission
- RLS
- Other Browser / Device compatibility

### Platform Relevance

支持 Supabase Auth 作為 Nook Works Authentication Provider 的候選方案，並支持 Browser → Supabase Auth 直接責任路徑具有技術可行性。

此 Evidence 尚不足以決定完整 Authentication、Session、Application Context 或 Authorization Architecture。

---

## Supabase Native Data API / CRUD / Application Access

- Experiment: B — Supabase Native Data API CRUD
- Date: 2026-09-12
- Status: Completed / Verified
- Topics: Data API, CRUD, Browser, PostgreSQL Grant, RLS, Application Access, app_user, Supabase, iPadOS
- Record: `experiments/data-api/README.md`
- Artifact: `experiments/data-api/index.html`

### Question

Browser 是否可以直接使用 Supabase Native Data API 完成 CRUD，並由 PostgreSQL Grant + RLS + Nook Works Application Access Boundary 正確限制不同登入狀態？

### Result

**YES，但 technical request success 不等於 Business Operation Success。**

Claire 已在 iPad Safari 以 active `app_user` 完成 SELECT / INSERT / UPDATE / DELETE；TU01（inactive `app_user`）與 TU02（無 `app_user`）則實際驗證 Authentication Success 不會自動取得 Application Data Access。

### Key Evidence

- Active Application User 可由 Browser 直接完成 Native Data API CRUD。
- INSERT PK 可由 Database Identity 自動產生，UI 不需輸入 OID。
- TU01 / TU02 SELECT 可得到 `error = null`、0 rows。
- TU01 / TU02 INSERT 得到 RLS `42501` violation。
- Probe UPDATE / DELETE 可得到 `error = null`、`rows = []`；此 response 單獨不足以區分 target row 不存在與 row 對 Identity 不可見。
- Anonymous INSERT 在本次測試被 table privilege layer 以 `42501 permission denied` 拒絕，與 authenticated Identity 的 RLS rejection 可觀察到不同拒絕層級。

### Important Constraints / Pitfalls

- `error = null` 不可直接翻譯為 Business Operation Success。
- RLS 對 SELECT、INSERT、UPDATE、DELETE 的 observable response semantics 不必一致。
- Access Probe UPDATE / DELETE 使用不存在 OID，因此不能把空結果過度解讀為「已直接證明 existing row 被 RLS 擋時一定回空集合」。
- Native CRUD 若需要 Not Found / Not Authorized / Conflict / Business Validation / Transaction Result 等明確 Business Contract，仍需評估是否需要 Custom API / RPC 或額外 Application Semantics。
- Identity / Sequence 不保證連號；不要把 OID 缺號視為異常或 Business Meaning。

### Playground Experience

Browser Evidence 必須容易回傳給 AI。後續 Playground Artifact 若顯示 JSON / API Result / Token-safe Debug Output，應提供 Copy Result，並保留 operation、error code/message、count/affected rows/returned rows；截圖與結構化結果分別服務 UI State Evidence 與精確 Response Analysis。

### Platform Relevance

Experiment B 建立了 Native Data API 的 Internal Application Data Access baseline，也證明 `auth.users` Authentication Identity 與 `app_user` Application Business Identity 可以透過 RLS / Application Access Function 分層。

此 Evidence 不代表所有 Nook Works Business Function 都應直接使用 Native CRUD。後續 Custom API / RPC Experiment 應以 B 作為 mechanism comparison baseline，再依 Business Contract、Authorization Complexity、Transaction 與 Result Semantics 決定責任分層。
