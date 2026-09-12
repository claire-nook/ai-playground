# Experiment B — Supabase Native Data API CRUD

- Date: 2026-09-12
- Status: In Progress / Awaiting Browser Evidence
- Environment: Netlify + iPad Safari + Supabase Nook Core
- Artifact: `experiments/data-api/index.html`

## Question

Browser 是否可以直接使用 Supabase Native Data API 完成 CRUD，並由 PostgreSQL Grant + RLS + Nook Works Application Access Boundary 正確限制不同登入狀態？

## Test Object

使用語意中立的 `public.test_k7m4x2`。

- `t01`: bigint identity primary key
- `t02`: varchar(100), nullable
- `t03`: varchar(100), required
- `t04`: boolean, required

Test Object 屬 Playground 自治範圍，不是 Nook Works Formal Schema。

## Access Model Under Test

`authenticated` 具備 SELECT / INSERT / UPDATE / DELETE database grants。

RLS 已啟用，四種 operation 的 policies 均透過：

`private.can_access_application()`

判斷目前 Auth Identity 是否對應 active `app_user`。

預期矩陣：

| Identity | Auth | app_user | active | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Anonymous | No | No | N/A | Denied | Denied | Denied | Denied |
| TU02 | Yes | No | N/A | Denied | Denied | Denied | Denied |
| TU01 | Yes | Yes | No | Denied | Denied | Denied | Denied |
| Claire | Yes | Yes | Yes | Allowed | Allowed | Allowed | Allowed |

## Browser Artifact

頁面提供：

- Email / Password Login
- Anonymous mode
- Session / Identity 狀態（遮罩顯示）
- SELECT Grid
- INSERT Form，OID 由 Database Identity 自動產生
- Grid Row UPDATE
- Grid Row DELETE
- Access Probe，用於沒有可見 row 的身份仍可發出四種 operation request
- Last API Result，保留 operation、error、count 與安全的 test row response

Public Artifact 不顯示完整 User ID、Session Token、Access Token 或 Password。

## Evidence Status

目前僅完成 Provider / Database Setup 與 Browser Artifact。

尚未把「預期矩陣」標示為 Verified。需要 Claire 在真實 iPad Safari Browser Context 實際操作後，才可記錄 Browser Evidence 與 Experiment Result。

## Intended Evidence

若結果符合預期，Experiment B 將支持以下技術觀察：

Browser 可使用 Publishable Key + Supabase Auth Session 直接操作 Native Data API；Authentication Success 本身不等於 Application Access，最終 Business Data Access 可由 PostgreSQL Grant + RLS + Application Access Function 共同控制。

此 Evidence 不自動代表 Nook Works 所有 Business Function 都應使用 Native Data API，也不取代 Custom API / RPC 的後續實驗與責任分層討論。
