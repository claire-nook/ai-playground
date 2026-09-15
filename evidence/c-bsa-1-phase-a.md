# C-BSA-1 Phase A — Backend Service Access Model

- Date: 2026-09-15
- Status: Verified / Phase checkpoint
- Experiment: C-BSA-1
- Phase: A
- Tags: `nook-platform`, `supabase`, `custom-api`, `backend-service`, `data-api`, `authorization`, `rls`, `postgresql`

## Purpose

驗證 Supabase backend service 經 Native Data API 存取 PostgreSQL table 時，service identity、PostgreSQL object privilege 與 RLS boundary 的實際關係。

本 Phase 使用 synthetic table `public.test_bsa_access`，不碰正式 Nook Works data。

## A-1 — Backend service SELECT positive control

條件：

```text
service_role SELECT = true
RLS = ON
policy count = 0
```

Backend path：

```text
Edge Function
→ @supabase/server ctx.supabaseAdmin
→ Native Data API
→ test_bsa_access SELECT
```

結果：HTTP 200，成功取得 2 rows。

詳細 evidence：`evidence/c-bsa-1-a1.md`。

## A-2 — PostgreSQL object privilege negative control

只撤除 `service_role` SELECT privilege，其他條件維持。

結果：

```text
service_role SELECT = false
→ Native Data API SELECT
→ permission denied for table test_bsa_access
```

詳細 evidence：`evidence/c-bsa-1-a2.md`。

## A-3 — RLS boundary

改用 non-bypass-RLS Data API identity，並明確授予 table SELECT privilege。

### A-3.1 No policy

```text
anon SELECT = true
RLS = ON
policy count = 0
→ SELECT request success
→ row_count = 0
```

### A-3.2 Allow policy

只新增一條允許 anon SELECT 的 RLS policy：

```text
anon SELECT = true
RLS = ON
policy count = 1 / allow
→ SELECT request success
→ row_count = 2
```

因此在相同 table privilege 下，只改變 RLS policy 即使資料可見性由 0 rows 變為 2 rows。

## A-4 — CUD object privilege boundary

使用 backend service identity / `ctx.supabaseAdmin`，逐項驗證 INSERT、UPDATE、DELETE privilege。

Positive controls：

```text
INSERT privilege = true → INSERT success
UPDATE privilege = true → UPDATE success
DELETE privilege = true → DELETE success
```

Negative controls 每次只撤除目標 operation privilege，並保留其餘 privilege：

```text
INSERT privilege = false → INSERT → permission denied
UPDATE privilege = false → UPDATE → permission denied
DELETE privilege = false → DELETE → permission denied
```

UPDATE / DELETE negative controls 執行前均確認 target synthetic row 存在，避免把 zero-row behavior 誤判成 privilege evidence。

## Phase A evidence-level model

Phase A 支持以下 access model：

```text
Backend / Data API request
        │
        ├─ PostgreSQL Object Privilege
        │    決定 database role 是否可對 object 執行 SELECT / INSERT / UPDATE / DELETE
        │
        └─ Row Level Security (RLS)
             對 non-bypass-RLS identity 再決定哪些 rows 可見 / 可操作
```

Backend service identity 本身不等於無條件 database object access。即使使用 privileged backend client，缺少對應 table object privilege 時，Native Data API operation 仍會得到 PostgreSQL `permission denied`。

對 non-bypass-RLS identity，具有 table SELECT privilege 仍不代表能看到 rows；RLS policy 是另一個獨立 boundary。

## Current Judgment

Phase A 的實驗結果支持「權限最小化」在 Supabase backend service 架構中具備可操作性：backend service 可以透過 PostgreSQL object privilege 被限制到特定 table / operation，而 RLS 可對需要 row-level authorization 的 identity 提供第二層控制。

這表示未來 Nook Works 不需要因為某 component 是 backend service，就把它視為天然的 database superuser。可以依 component responsibility 授予所需 object / operation privilege。

但此處仍是 Evidence / Current Judgment，不是正式 architecture decision。是否讓特定 Business Operation 直接持有 table CUD privilege，或改以 RPC / PostgreSQL Function 的 EXECUTE privilege 收斂操作面，需由 Phase B 繼續驗證。

## Operational notes

- Edge Function caller authentication 與 database identity 是不同 boundary。`auth: "secret"` 決定誰能 invoke Function；Function 內使用哪個 Data API client / database role，決定 DB access path。
- Supabase Dashboard Edge Function Test UI 的 `Add secret key` 可直接使用 project custom secret 進行 secret-authenticated test，不需要把 secret value 寫入 evidence。
- A-3 建立的 anon RLS policy 已在 Phase A 收尾時移除。
- Phase A 收尾 baseline 已恢復：service_role SELECT/INSERT/UPDATE/DELETE = true；anon/authenticated table privilege = none；test table RLS policy count = 0。

## Next

Phase B：RPC / PostgreSQL Function Operation Model。

核心問題：backend service 是否能不持有直接 table CUD privilege，而只持有特定 PostgreSQL Function 的 EXECUTE privilege，透過明確 Business Operation boundary 完成資料操作；並比較 `SECURITY INVOKER` / `SECURITY DEFINER` 的權限語意。
