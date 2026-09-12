# Experiment A — Supabase Auth

- Date: 2026-09-12
- Status: Completed / Verified
- Topics: Authentication, Session, Supabase Auth, Browser, Netlify, iPadOS

## Question

驗證部署於 Netlify 的 Browser UI，是否可以直接使用 Supabase Auth 完成 Nook Works 所需的基本 Authentication Path：

Browser → Supabase Auth → `auth.users` Identity → Session

此 Experiment 只驗證 Authentication Mechanism，不處理 `app_user`、Application User Context、Role、Menu 或 Permission。

## Environment

- Frontend Hosting: Netlify / AI Playground
- Browser Evidence Environment: iPad Safari
- Backend Provider: Supabase / Nook Core
- Authentication Method: Email + Password
- Browser SDK: `@supabase/supabase-js`
- Browser Configuration: Supabase Project URL + Publishable Key

## Implementation / Mechanism

Browser 使用 Supabase JavaScript Client 直接呼叫 Supabase Auth：

1. 使用 Email + Password 執行 `signInWithPassword`。
2. Authentication 成功後取得 Supabase Auth Session 與 `auth.users` Identity。
3. UI 僅顯示遮罩後的 User ID 與 Email。
4. Access Token、Refresh Token 與完整 Session 不顯示，也不寫入 Console。
5. Client 設定 `persistSession: true`、`autoRefreshToken: true`。
6. Logout 使用 local scope，只登出目前 Browser Session。

Experiment Artifact：`experiments/auth/index.html`

## Result

**Success.**

已實際確認以下 Authentication Path 可以成立：

Netlify Browser UI → Supabase Auth → Authentication Success → `auth.users` Identity → Active Session

在此基本 Authentication Path 中，不需要自行建立 Login API 來包裝 Supabase Auth。

## Evidence

### AI Direct Evidence

- Experiment source 已建立並保存在 Playground Repository。
- Browser implementation 使用 Supabase Project URL 與 Publishable Key，不包含 Database Password、secret key 或 `service_role` key。
- Source 對 User ID / Email 做 Masking，且未輸出 Token / 完整 Session。

### Provider / Tool Evidence

- Nook Core Supabase Project 可取得 Project URL 與 Browser 可用的 Publishable Key。
- Playground source 已提交至 GitHub，供 Netlify Deployment 使用。

### Claire Environment Evidence

Claire 於 iPad Safari 實際操作並提供 Browser 畫面，確認：

- Login UI 可正常載入與操作。
- 使用既有 Supabase Auth User 的 Email + Password 可成功 Authentication。
- Authentication 成功後顯示 Active Session。
- 可取得並顯示遮罩後的 `auth.users` User ID。
- 可取得並顯示遮罩後的 Email。
- Experiment UI 在該 iPad Safari Viewport 下正常呈現。

### Inference

上述 Evidence 支持 Supabase Auth 作為 Nook Works Authentication 的可行候選方案，但不足以單獨決定完整 Authentication / Authorization Platform Architecture。

## Observations

### Identity / Credential Boundary

Experiment 過程確認需要清楚區分三種 Credential / Identity Context：

1. **Supabase Platform Account**  
   Claire 使用 GitHub OAuth 登入 Supabase Platform，用於管理 Supabase Project。這不是 Nook Works Application Login Credential。

2. **Database Password**  
   用於 PostgreSQL Database Connection，不參與 Browser → Supabase Auth 的 Application Authentication。

3. **Supabase Auth User**  
   `auth.users` 中的 Application Authentication Identity。Experiment A 使用此 User 的 Email + Password 登入。

因此：

Supabase Project Administrator Identity ≠ Database Credential ≠ Nook Works Application Authentication Identity

### Application Identity Boundary

Authentication 成功目前只代表 Supabase Auth 已確認 `auth.users` Identity 並建立 Session。

Experiment A 尚未驗證 Nook Works 的 Application Business Identity。

正式 Application Shell 設計仍需後續處理：

`auth.users.id` → `app_user.id_auth_user` → `app_user.oid` → Application User Context

因此 Authentication Success 不應直接等同 Application Access Granted。

### Browser Configuration

此 Experiment 證明 Browser Authentication Path 可以只使用 Supabase Project URL + Publishable Key。Publishable Key 是 Browser-side identifier，不應與 Secret / `service_role` Credential 混淆。

## Constraints / Pitfalls

- Public Playground 不得放入 Password、Access Token、Refresh Token、Database Password、secret key 或 `service_role` key。
- Authentication Identity 即使不是 Secret，也應避免在 Public Evidence 中無必要地暴露完整值。
- Supabase Auth 能 Authentication，不代表 Nook Works 已完成 Authorization。
- Experiment 成功不能推導所有 Browser / Device / Session lifecycle 都已驗證。

## Not Tested / Not Verified

本次 Experiment 尚未形成 Evidence 的項目包括：

- Reload 後 Session persistence 的實際 Browser 驗證
- Session expiration / token refresh lifecycle
- Logout 的實際 Browser 驗證
- Invalid password / invalid account UX
- Supabase Auth service unavailable 情境
- iPhone / Android / Desktop Browser compatibility
- Passkey
- OAuth Application Login
- `app_user` Application User Context
- Active / inactive `app_user` 判斷
- Role / Menu / Permission
- RLS / Authorization

## Platform Relevance

此 Experiment 提供以下 Technical Platform Evidence：

- Supabase Auth 可作為 Nook Works Authentication Provider 的候選方案。
- Netlify-hosted Browser 可以直接與 Supabase Auth 建立 Authentication Path。
- 基本 Email / Password Authentication 不需要額外 Custom Login API。
- Supabase Platform Account、Database Credential 與 Application Authentication Identity 應維持清楚責任邊界。
- Authentication 與 Application Business Identity / Authorization 應分層處理。

此 Experiment **不決定**：

- 最終 Authentication Method
- Session Policy
- Application User Context 的取得方式
- Authorization Architecture
- Browser 是否直接存取其他 Supabase Data API
- Internal API Runtime
- Technical Platform 最終 Responsibility Mapping
