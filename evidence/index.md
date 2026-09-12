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
