# Experiment B-1 — Supabase Native Data API View Read / Security

Status: Completed / Verified

## Purpose

延伸 Experiment B，但不修改已完成的 B Artifact。

本實驗只回答 View Read 相關問題：

- PostgreSQL View DDL / alias / join 實際怎麼寫。
- Supabase Native Data API 是否能直接 SELECT View。
- `security_invoker = true` 時，View 是否依 invoking user 的 Base Table privilege / RLS 執行。
- View 是否可作為 Read Model，讓 Data API Contract 不必等於 Physical Table Column。

本實驗不測 View INSERT / UPDATE / DELETE。Nook Works 目前沒有透過 View C/U/D 的需求。

## Result

**YES.**

在本次 PostgreSQL / Supabase / Browser 條件下，`security_invoker = true` 的 PostgreSQL View 可由 Supabase Native Data API 直接 SELECT，並保留 invoking identity 對 underlying tables 的 privilege / RLS security semantics。

View 亦可透過 join 與 alias 形成 Read Model，使 Browser Data API Contract 不必直接等於 Physical Table Column。

本結果是 Technical Evidence，不代表所有 Nook Works Read 都應使用 View，也不直接建立 Production Platform Rule。

## Database Setup

Base object: `public.test_k7m4x2`

B-1 額外加入：

- `oid_ooxx bigint`
- 既有測試 rows 以 fabricated linkage 指向 `public.app_user.oid`
- linkage 只用於 View join / security observation，不代表正式 Business Schema Design

View: `public.test_vw_r8n3q5`

核心定義：

```sql
create view public.test_vw_r8n3q5
with (security_invoker = true)
as
select
    t.t01,
    t.t02,
    t.t03,
    t.t04,
    t.oid_ooxx,
    u.app_user_name as happy_name
from public.test_k7m4x2 as t
left join public.app_user as u
    on u.oid = t.oid_ooxx;
```

Access：

- `anon`: no View privilege
- `authenticated`: View SELECT only
- View uses `security_invoker = true`
- Base tables keep their existing RLS / grants

Direct DB inspection additionally confirmed this join View is not updatable / insertable in the current definition. This was an observation only; B-1 intentionally does not evaluate View C/U/D.

## Provider / PostgreSQL Research

PostgreSQL documents that `security_invoker = true` makes access to underlying relations use the invoking user's permissions. If underlying relations use RLS, invoking-user policies and permissions are used as if the base relations were referenced directly.

Supabase currently recommends `security_invoker = true` for Postgres 15+ Views that must obey underlying table RLS. Supabase Data API routes are automatically created for Views once the required grants make the View reachable.

Provider / PostgreSQL documentation was treated as research evidence; Browser behavior was separately verified by Claire Environment Evidence rather than inferred from documentation.

## Direct Database Evidence

Direct database inspection confirmed:

- View exists with `security_invoker=true`.
- View join and alias work.
- `app_user_name` is returned as `happy_name`.
- Current fabricated rows resolve to Claire / TU01 linkage as expected.
- Only `authenticated SELECT` is granted on the View.
- `anon` has no View SELECT privilege.

Direct privileged database queries were not treated as Browser RLS proof.

## Browser Artifact

Artifact: `experiments/data-api-view/index.html`

The page provides:

- Supabase Auth login
- Anonymous mode
- masked Identity display
- View SELECT only
- Grid for returned View rows
- structured Last API Result
- Copy Result button for iPad → AI Evidence transfer

## Claire Environment Evidence

Environment: iPad Safari → Netlify-hosted Playground → Supabase Native Data API.

### Claire — Authenticated + Active app_user

Result:

```json
{
  "operation": "VIEW SELECT",
  "error": null,
  "count": 3,
  "rows": [
    {
      "t01": 1,
      "t02": "A-001",
      "t03": "Alpha",
      "t04": true,
      "oid_ooxx": 1,
      "happy_name": "Claire"
    },
    {
      "t01": 3,
      "t02": "C-003",
      "t03": "Gamma claire update",
      "t04": true,
      "oid_ooxx": 2,
      "happy_name": "TU01"
    },
    {
      "t01": 6,
      "t02": "D-004",
      "t03": "claire test",
      "t04": true,
      "oid_ooxx": 1,
      "happy_name": "Claire"
    }
  ]
}
```

Observation:

- View SELECT succeeds.
- Three rows are visible.
- View join succeeds through Native Data API.
- `app_user.app_user_name` is exposed through the View as `happy_name`.
- Claire can see a row whose joined `happy_name` is TU01 even though TU01 itself is inactive. This is consistent with current `can_access_application()` semantics: it gates the current invoking user's Application Access; it is not a target-row `app_user.is_active` filter.

### TU01 — Authenticated + Inactive app_user

Result:

```json
{
  "operation": "VIEW SELECT",
  "error": null,
  "count": 0,
  "rows": []
}
```

Observation:

- TU01 is authenticated and therefore has View SELECT privilege.
- Request succeeds technically.
- Underlying Base Table RLS / Application Access returns no visible rows because TU01's `app_user` is inactive.

### TU02 — Authenticated + No app_user

Result:

```json
{
  "operation": "VIEW SELECT",
  "error": null,
  "count": 0,
  "rows": []
}
```

Observation:

- TU02 is authenticated and therefore has View SELECT privilege.
- Request succeeds technically.
- Underlying Base Table RLS / Application Access returns no visible rows because no valid `app_user` mapping exists.

### Anonymous — No Auth Session

Result:

```json
{
  "operation": "VIEW SELECT",
  "error": {
    "code": "42501",
    "message": "permission denied for view test_vw_r8n3q5"
  },
  "count": null,
  "rows": []
}
```

Observation:

- Anonymous is denied at the View privilege layer.
- This request does not need Base Table RLS to provide the first denial boundary.

## Browser Evidence Matrix

| Identity | Application state | Browser Evidence | Observed boundary |
| --- | --- | --- | --- |
| Claire | authenticated + active app_user | Success, 3 rows | View privilege + Base Table RLS allow |
| TU01 | authenticated + inactive app_user | Success, 0 rows | View privilege allows; Base Table RLS filters |
| TU02 | authenticated + no app_user | Success, 0 rows | View privilege allows; Base Table RLS filters |
| Anonymous | no Auth session | `42501 permission denied for view` | View privilege denies |

## Key Findings

### 1. View can be a Native Data API Read Model

Browser can SELECT a View directly through Supabase Native Data API. The View can perform join and alias work before returning the response.

Observed contract:

```text
Physical Tables
    ↓
PostgreSQL View
    ↓ join / alias
Read Model
    ↓
Supabase Native Data API
    ↓
Browser
```

This demonstrates that Browser Read Contract does not need to mirror the physical table schema one-to-one.

### 2. `security_invoker = true` preserved the tested security boundary

The Browser Evidence differentiates two layers:

```text
Anonymous
→ View privilege DENY
→ 42501

Authenticated but no Application Access
→ View privilege ALLOW
→ underlying Base Table RLS
→ success + 0 rows

Authenticated + active Application Access
→ View privilege ALLOW
→ underlying Base Table RLS ALLOW
→ rows returned
```

This is consistent with `security_invoker = true` executing underlying-relation access under the invoking identity in this experiment.

### 3. Authentication and Application Access remain separate

TU01 and TU02 both authenticate successfully but receive no View rows because `private.can_access_application()` evaluates false for both cases.

The View does not need to know why Application Access failed. It consumes the same fail-closed security boundary as the Base Table path.

### 4. Joined row state is not invoking-user state

Claire can join and display TU01's `app_user_name` even though TU01 is inactive. Current RLS asks whether the invoking Claire identity may access application data; it does not hide joined `app_user` rows based on each target row's active state.

This distinction matters for historical / reference display semantics.

## Constraints / Not Proven

- Only SELECT was tested. No claim is made about View INSERT / UPDATE / DELETE suitability.
- Only this View shape, current grants, current RLS policies, current PostgreSQL / Supabase environment, and iPad Safari path were verified.
- The experiment does not prove that every future View is automatically secure. Future Views must still define and review privilege, `security_invoker`, underlying table grants, RLS, and exposed columns deliberately.
- View Read Model suitability does not eliminate the need for Custom API / RPC where Business Operation Semantics, explicit result contracts, transactions, business validation, or other responsibilities require them.

## Platform Relevance

B-1 supports the following architecture candidate for later Nook Works Technical Platform discussion:

```text
Write Model → Base Table
Read Model  → Table or security-reviewed View → Native Data API
```

A View is therefore a credible option when Read requires joins, aliases, computed/display-oriented structure, or hiding physical schema details, without automatically introducing a custom API merely for data shaping.

This remains Evidence rather than a Platform Rule. The later C / D experiments should compare Custom API and RPC against this Native Data API baseline, especially where Read or Update acquires Business Operation Semantics.
