# Short-term Work Items

> 無交期。依 Claire 有空研究的時間逐項進行。
> 這不是正式開發排程，也不是 Nook Works Specification；只是 Playground 的近期實驗清單，避免跨對話後遺失上下文。

## Playground Execution Capability

### GitHub Actions Remote Execution — Completed / Verified

2026-09-12 已完成 GitHub Actions Remote Execution Environment 實驗。

這項結果不只服務後續 Supabase deployment。Playground 已實證 GitHub Actions 可以作為 AI 可使用的外部 Remote Execution Environment：

```text
AI modifies Repo
→ commit to controlled path
→ push trigger
→ GitHub-hosted Runner executes
→ AI independently reads Run / Job / Log
→ AI obtains runtime result
```

同時已驗證 Manual Approval Mode：Claire 可由 iPad Safari 手動啟動 `workflow_dispatch`，AI 負責後續 Run / Job / Log retrieval 與分析。

未來 AI 若在自身 sandbox 缺少 Linux / CLI / runtime / build / CI-CD execution context，先查 `experiments/github-actions/README.md`，不要重新從零猜 GitHub Actions 能不能用。正式或高影響操作仍應依風險保留適當 Human Approval Gate。

- Evidence Record：`experiments/github-actions/README.md`
- Evidence Index：`evidence/index.md`
- Manual Workflow：`.github/workflows/hello-action.yml`
- Autonomous Push Workflow：`.github/workflows/push-playground.yml`

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

### B-1. Supabase Data API — View Read / Security — Completed / Verified

目的：延伸 B 的 Native Data API baseline，但保持 B Artifact 封箱不修改；專門驗證 PostgreSQL View 作為 Read Model 的 Data API 與 Security 行為。

結果：已於 2026-09-12 由 Claire 在 iPad Safari 完成 Claire / TU01 / TU02 / Anonymous Browser Evidence。

已驗證：
- `test_vw_r8n3q5` 可由 Supabase Native Data API 直接 SELECT。
- View 可 join `test_k7m4x2` + `app_user`，並輸出 `app_user_name AS happy_name`。
- `security_invoker = true` 在本次實驗中保留 invoking identity 的 underlying Base Table privilege / RLS security behavior。
- Claire active `app_user`：View SELECT success，3 rows。
- TU01 inactive `app_user`：technical success，0 rows。
- TU02 no `app_user`：technical success，0 rows。
- Anonymous：View privilege layer 直接 `42501 permission denied`。
- View privilege 與 Base Table RLS / Application Access 是可觀察到的不同 security boundaries。
- View join / alias 可形成不直接等於 Physical Table Schema 的 Browser Read Contract。

Experiment Limitation：
- 只測 View SELECT，不評估 View C/U/D。
- 不把單一實驗推廣成「所有 View 自動安全」；未來仍需 review `security_invoker`、View privilege、underlying grants、RLS 與 exposed columns。

Platform Candidate：

```text
Write Model → Base Table
Read Model  → Table or security-reviewed View → Native Data API
```

此 Candidate 仍需後續 C / D 的 Custom API / RPC Evidence 一起比較，才適合形成 Technical Platform Rule。

- Evidence Record：`experiments/data-api-view/README.md`
- Evidence Index：`evidence/index.md`
- Artifact：`experiments/data-api-view/index.html`

### C-0. Supabase Edge Function Deployment Lifecycle — Completed / Verified

目的：先不碰 Database / Auth / Business Logic，單獨驗證 iPad-first workflow 能否把 Supabase Edge Function 真正部署、HTTP 呼叫、刪除，並比較 GitHub Actions + Supabase CLI 與 ChatGPT Supabase Connector 兩條 deployment path。

結果：2026-09-12 已完成。

已驗證：
- GitHub Actions `workflow_dispatch` → temporary Linux Runner → Supabase CLI → Nook Core deployment 成功。
- Claire 可由 iPad Safari 直接 GET Edge Function URL 並取得預期 JSON。
- GitHub Actions Delete workflow 可刪除 Action-deployed function，Connector 可確認 function list 為空。
- AI 可從 GitHub 讀取同一份 function source，直接透過 Supabase Connector deployment 到 Nook Core，不需 Claire 再建立或提供 PAT。
- Connector-deployed function 可由 Safari GET 同一份 JSON。
- GitHub Actions Delete workflow 可刪除 Connector-deployed function；兩次 deletion CLI success message 相同。
- 第二次刪除後 Connector 再確認 `functions=[]`。

重要 Environment Evidence：

```text
需要 Supabase Edge Function deployment
≠
Claire 必須擁有 Mac / PC
```

截至本次實驗，iPad-first workflow 可把 CLI / Linux execution 委派給 GitHub-hosted Runner，並可使用 Supabase Connector 直接 deployment。Supabase Edge Function deployment 本身不再構成購買 Mac mini 的技術必要理由。

Credential / Security Trade-off：
- GitHub Actions 路線本次使用 1-hour Classic PAT + GitHub Actions Secret；Secret injection / masking 實測正常。
- 但 Classic PAT 權限為 broad account-level authority。Private Development Repo 可降低 Repo / Workflow 暴露機率，不能縮小 credential 本身的 blast radius。
- Connector deployment 不需要 Claire 自管另一顆 PAT，也不需要 `PAT → GitHub Secret → Workflow → Runner` 路徑，因此在目前沒有可用 Scoped PAT 的條件下具有明顯 credential-management 優勢。
- 不因此宣告 Connector 永遠較安全；Connector lifecycle 目前缺少 delete action，audit / authorization / governance 仍需正式比較。

Decision Triggers：
- Supabase Scoped PAT 若對 Claire 可用，尤其可限制 Nook Core + Edge Functions 權限，重新評估 GitHub Actions security priority。
- Connector 若增加 Edge Function delete / lifecycle / audit / approval / fine-grained authorization，重新評估 Connector 作為主要 deployment mechanism。

- Evidence Record：`experiments/custom-api/README.md`
- Evidence Index：`evidence/index.md`
- Function Source：`supabase/functions/hello-action/index.ts`
- Deploy Workflow：`.github/workflows/deploy-hello-action.yml`
- Delete Workflow：`.github/workflows/delete-hello-action.yml`

### C. Supabase Custom API — Read Test Data

下一階段目的：在 C-0 deployment baseline 已成立後，開始驗證自行開發 API 的 Browser / Auth / Database / Response path。

暫定範圍：
- 使用與 Experiment B 相同的語意中立 `test_` Database Object 與 Test Data。
- 驗證 Browser Application → Custom API 的實際呼叫路徑，包含 cross-origin / CORS。
- 後續再驗證 DB Access、Authentication Context、Application Authorization 與 JSON Response semantics。
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

A 已完成 Authentication baseline；B 已完成 Native Data API CRUD / Application Access baseline；B-1 已完成 View Read / Security / Read Model baseline；C-0 已完成 Edge Function deployment lifecycle baseline。

C 後續階段與 D 再以相同 Test Object 延伸 Custom API / RPC 實驗，避免 Business Logic 與正式 Business Semantic 污染 Technical Mechanism 的比較。

B / B-1 / C-0 的結果提醒後續比較不能只問「能不能讀寫資料」，還要比較：
- Business Result semantics 是否清楚。
- Authorization failure / Not Found / affected rows 是否可被 Application 正確判讀。
- Read 是否可由 Table / View Native Data API 提供合適 Contract。
- Business Validation 與 Transaction 應由哪一層負責。
- Native Data API、Custom API、RPC 各自適合負責什麼。
- Deployment mechanism 的 credential scope、approval、audit、rollback 與 lifecycle ownership。
- RPC vs Custom API 是否需要二選一，或應形成不同適用情境的 Platform Rule。

目前不預設 Production Architecture，也不把任何單一 Playground 成功實驗直接升格成正式 Platform Rule。
