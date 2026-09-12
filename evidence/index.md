# Playground Evidence Index

這份 Index 是 AI Playground 已形成有效 Evidence 的集中檢索入口。

未來進行 Nook Works Technical Platform 設計、Technology Selection、Architecture Discussion、Responsibility Mapping 或 Provider Capability Evaluation 時，優先從此處搜尋相關 Technical Topics，再依需要閱讀個別 Experiment Record 與 Artifact。

Evidence 代表特定時間、環境與條件下實際觀察到的結果，不等於 Production Architecture 或永久有效的 Technical Decision。

---

## Supabase Edge Function / iPad-first Deployment Lifecycle

- Experiment: C-0 — Supabase Edge Function Deployment Lifecycle
- Date: 2026-09-12
- Status: Completed / Verified
- Topics: Supabase Edge Functions, Deployment, GitHub Actions, Supabase CLI, ChatGPT Supabase Connector, PAT, Credential, iPadOS, Remote Execution, CI/CD
- Record: `experiments/custom-api/README.md`
- Source: `supabase/functions/hello-action/index.ts`
- Workflows: `.github/workflows/deploy-hello-action.yml`, `.github/workflows/delete-hello-action.yml`

### Question

Claire 的 iPad-first 開發環境是否能在沒有本地 Desktop / Mac CLI 工作站的情況下，完成 Supabase Edge Function 的部署、HTTP 驗證與刪除生命週期？GitHub Actions + Supabase CLI 與 ChatGPT Supabase Connector 是否都能成為實際 deployment path？

### Result

**YES，在 2026-09-12 的實驗條件下已實證。**

### Key Evidence

- GitHub Actions `workflow_dispatch` → GitHub-hosted Linux Runner → Supabase CLI `2.117.0` → Nook Core → `hello-action` deployment success。
- Deploy Run ID `34700593732`，result=`success`；CLI 明確回報 function deployed。
- Claire 在 iPad Safari 直接開啟 Edge Function URL，取得預期 JSON；Supabase Dashboard 亦確認 function 存在與收到 requests。
- GitHub Actions Delete Run #1 `34701381528` 成功刪除 Action-deployed function；Connector 隨後確認 Edge Function list 為空。
- AI 從 GitHub 讀取同一份 `hello-action` source，再透過 Supabase Connector 直接部署；Connector 回傳 `ACTIVE`, version `1`, `verify_jwt=false`。
- Connector deployment 不需要 Claire 另外建立、貼給 AI 或注入一顆新的 PAT；使用既有 platform-managed Connector authorization context。
- Claire 再次由 iPad Safari 驗證 Connector-deployed function 回傳相同 JSON。
- GitHub Actions Delete Run #2 `34701914597` 成功刪除 Connector-deployed function；兩次 deletion 的 CLI success message 完全相同。
- 第二次刪除後 Connector 再次確認 `functions=[]`。

### Cross-mechanism Finding

```text
GitHub Actions Deploy → GitHub Actions Delete  ✅
Connector Deploy      → GitHub Actions Delete  ✅
```

在本次條件下，Edge Function 進入 Supabase Project state 後，刪除工具不需要與原始部署工具相同。Deployment transport 與 deployed function state 可視為可分離的 concerns，但 Provider capability 改變時仍需重驗。

### Credential / Security Finding

GitHub Actions 路線在本次實驗需要 Supabase PAT。Claire 當時的 Supabase UI 未提供可用 Scoped PAT，因此使用 1-hour temporary Classic PAT，僅存於 GitHub Actions Secret，未分享給 AI、未 commit，log 中顯示為 `***`。

即使正式 Development Repository 為 Private，Repository privacy 主要降低未授權接觸 Repo / Workflow 的機率，**不會縮小 Classic PAT 本身的 account-level credential blast radius**。因此在目前沒有 Scoped PAT 的條件下，Classic PAT 權限過大是 GitHub Actions deployment 的重要安全 Trade-off。

Connector deployment 則不需要 Claire 自行建立並注入另一顆 PAT，因而消除 `Classic PAT → GitHub Secret → Workflow → Runner` 這條 user-managed credential path。這提高 Connector 作為 deployment candidate 的評價，但不足以推出「Connector 永遠比較安全」；Connector authorization scope、auditability、available actions 與 lifecycle completeness 仍需納入正式 Decision。

### iPad-first / Hardware Relevance

本實驗支持以下結論：

> 截至 2026-09-12，Supabase Edge Function 的 source management、deployment、HTTP invocation verification 與 deletion lifecycle，不要求 Claire 擁有本地 Desktop / Mac 開發機。iPad-first workflow 可把 CLI / Linux execution 委派給 GitHub-hosted Runner，也可由 Supabase Connector 直接 deployment。

因此，「為了部署 Supabase Edge Function 必須購買 Mac mini」不再是有 Evidence 支持的技術前提。

這不代表 Mac mini 對所有未來工作都沒有價值，只代表 Supabase Edge Function deployment 本身目前不足以構成硬體購買理由。

### Decision Triggers

- 若 Claire 未來可取得 Nook Core / Edge Functions scoped credential，重新評估 GitHub Actions deployment 的 security priority。
- 若 Supabase Connector 增加 Edge Function delete、完整 lifecycle、audit / approval 或更細 authorization，重新評估 Connector 作為主要 deployment mechanism。
- Production governance、environment promotion、rollback、approval 等需求明確後，再形成正式 Technical Decision。

### Not Yet Verified

- Browser Application cross-origin `fetch()` / CORS
- Custom API Auth / JWT propagation
- Database access / RLS through Edge Function
- Business validation / transaction / error contract
- Formal Production deployment architecture

---

## GitHub Actions / AI Remote Execution Environment

- Experiment: GitHub Actions Remote Execution Environment
- Date: 2026-09-12
- Status: Completed / Verified
- Topics: GitHub Actions, GitHub-hosted Runner, Remote Execution, CI/CD, Workflow, workflow_dispatch, push trigger, AI Autonomy, iPadOS
- Record: `experiments/github-actions/README.md`
- Artifacts: `.github/workflows/hello-action.yml`, `.github/workflows/push-playground.yml`, `experiments/action-push/trigger.txt`

### Question

AI Playground 是否可以把 GitHub Actions 當成外部 Remote Execution Environment，並形成 AI 建立工作 → GitHub Runner 執行 → AI 自行讀回 runtime result 的完整閉環？

### Result

**YES，在 2026-09-12 的 GitHub / Connector 能力下已實證。**

### Key Evidence

- Manual Mode：Claire 由 iPad Safari 啟動 `workflow_dispatch`，AI 可自行找到 Run / Job / Log 並讀回事前未知的 runtime verification code `784094`。
- Autonomous Mode：AI 建立 path-filtered push Workflow、commit trigger file，GitHub 自動啟動 Runner；AI 再自行找到 Run / Job / Log 並讀回 runtime verification code `811888`。
- Push-triggered Run ID `34697965162`，event=`push`，branch=`main`，result=`success`。
- 實測 Runner 為 Linux X64；當次 image 為 Ubuntu 24.04。
- `811888` 為 Runner 執行時隨機產生，Claire 沒有提供結果，證明 runtime result 可由 AI 自行取回。

### Execution Modes

```text
Manual Approval Mode
Claire → Run workflow → Runner → AI reads result

Autonomous Playground Mode
AI → controlled commit → push trigger → Runner → AI reads result
```

Manual Mode 適合 Deployment / Migration 等希望保留 Human Approval Gate 的操作；Autonomous Mode 適合低風險 Experiment / Build / Test / CLI / PoC。

### Important Constraints / Pitfalls

- Autonomous trigger 應優先使用 branch + path filter，不應讓任何普通 commit 都無條件啟動 Runner。
- 當時 Connector 未提供直接建立全新 `workflow_dispatch` Run 的 action，因此 Manual Mode 仍由 Claire 啟動。
- Connector 可讀 Run / Job / Log，並有既有 failed / cancelled job 的 rerun 能力，但不等於能任意重新啟動成功 Run。
- Connector 未提供 GitHub Actions repository secrets 管理能力；Secret 不可寫入 public Playground repository 或 log。
- GitHub Actions 可補 execution environment / toolchain / CI-CD context 的能力缺口，不代表可以繞過 AI、GitHub 或其他 Provider 的 policy / safety / authorization boundary。
- Provider capability 會改變。此 Evidence 表示「2026-09-12 曾經實證可行」，不是永久保證。

### Playground Relevance

未來 AI 若需要暫時 Linux 工作站、特定 CLI / runtime / build environment、真實 GitHub CI/CD context，或需要把 exact commit 與 runtime evidence 綁在一起，應先把 GitHub Actions 視為候選執行環境，再依風險與時效決定是否重驗。

這項 Evidence 將 Playground 從「持久化 Experiment Repository」擴充成具有外部 Remote Execution capability 的實驗設施。

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

---

## Supabase Native Data API / View Read / Security Invoker

- Experiment: B-1 — Supabase Native Data API View Read / Security
- Date: 2026-09-12
- Status: Completed / Verified
- Topics: Data API, PostgreSQL View, Read Model, Join, Alias, security_invoker, RLS, PostgreSQL Grant, Application Access, Supabase, Browser, iPadOS
- Record: `experiments/data-api-view/README.md`
- Artifact: `experiments/data-api-view/index.html`

### Question

PostgreSQL View 是否可以透過 Supabase Native Data API 作為 Browser Read Model，使用 join / alias 重塑 Read Contract，同時在 `security_invoker = true` 下保留 invoking identity 對 underlying tables 的 privilege / RLS security semantics？

### Result

**YES，在本次實驗條件下已由 iPad Safari Browser Evidence 驗證。**

### Key Evidence

- Claire（authenticated + active `app_user`）：View SELECT 成功，回傳 3 rows。
- View join `test_k7m4x2` + `app_user` 成功，並將 `app_user_name` 以 `happy_name` 回傳。
- TU01（authenticated + inactive `app_user`）：View SELECT technical success，`count = 0`、`rows = []`。
- TU02（authenticated + no `app_user`）：View SELECT technical success，`count = 0`、`rows = []`。
- Anonymous：在 View privilege layer 得到 `42501 permission denied for view test_vw_r8n3q5`。
- 實驗結果清楚區分 View privilege boundary 與 underlying Base Table RLS / Application Access boundary。

### Security Observation

本次 observable path：

```text
Anonymous
→ View privilege DENY
→ 42501

Authenticated but no Application Access
→ View privilege ALLOW
→ security_invoker View
→ Base Table RLS / Application Access
→ success + 0 rows

Authenticated + active Application Access
→ View privilege ALLOW
→ security_invoker View
→ Base Table RLS ALLOW
→ rows returned
```

Claire 可讀到 joined `happy_name = TU01`，即使 TU01 本身 inactive。這符合目前 `can_access_application()` 的設計：它判斷 invoking user 是否有 Application Access，不是依 target `app_user` row 的 active state 做資料過濾。

### Read Model Evidence

View 可讓 Data API Response 不直接等於 Physical Table Schema：

```text
Physical Tables
→ View join / alias
→ Read Model
→ Native Data API
→ Browser
```

因此，單純為了 join、display name、alias 或 read-oriented shape，不一定需要先建立 Custom API；View + Native Data API 已具有可行性 Evidence。

### Important Constraints

- B-1 只驗證 SELECT，不評估 View C/U/D。
- 此結果不代表所有 View 自動安全；每張 View 仍需審查 `security_invoker`、View privilege、underlying table grants、RLS 與 exposed columns。
- Read 若帶有 Business Operation Semantics、Business Validation、Transaction 或明確 Result Contract，仍需與 Custom API / RPC 比較責任歸屬。

### Platform Relevance

B-1 支持以下候選方向進入後續 Technical Platform 討論：

```text
Write Model → Base Table
Read Model  → Table or security-reviewed View → Native Data API
```

這仍是 Evidence，不是 Production Platform Rule。後續 C / D 應繼續比較 Custom API / RPC 在 Business Semantics 與責任邊界上的價值。
