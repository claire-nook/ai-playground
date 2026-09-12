# Experiment B-1 — Supabase Native Data API View Read / Security

Status: In Progress / Waiting for Browser Evidence

## Purpose

延伸 Experiment B，但不修改已完成的 B Artifact。

本實驗只回答 View Read 相關問題：

- PostgreSQL View DDL / alias / join 實際怎麼寫。
- Supabase Native Data API 是否能直接 SELECT View。
- `security_invoker = true` 時，View 是否依 invoking user 的 Base Table privilege / RLS 執行。
- View 是否可作為 Read Model，讓 Data API Contract 不必等於 Physical Table Column。

本實驗不測 View INSERT / UPDATE / DELETE。Nook Works 目前沒有透過 View C/U/D 的需求，不替不存在的需求加班。

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

## Provider / PostgreSQL Research

PostgreSQL documents that `security_invoker = true` makes access to underlying relations use the invoking user's permissions. If underlying relations use RLS, invoking-user policies and permissions are used as if the base relations were referenced directly.

Supabase currently recommends `security_invoker = true` for Postgres 15+ Views that must obey underlying table RLS. Supabase Data API routes are automatically created for Views once the required grants make the View reachable.

This is Provider / PostgreSQL documentation evidence. Browser behavior still needs Claire Environment Evidence before this experiment is considered verified.

## Current Direct Database Evidence

Direct database inspection confirms:

- View exists with `security_invoker=true`.
- View join and alias work.
- `app_user_name` is returned as `happy_name`.
- Current fabricated rows resolve to Claire / TU01 linkage as expected.
- Only `authenticated SELECT` is granted on the View.

Direct privileged database queries do **not** prove Browser RLS behavior. That remains intentionally unclaimed until Browser testing.

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

## Browser Evidence Matrix

Pending Claire iPad Safari verification:

| Identity | Expected observation | Browser Evidence |
| --- | --- | --- |
| Claire | Authenticated + active app_user; View SELECT should return rows allowed by both base-table security rules | Pending |
| TU01 | Authenticated + inactive app_user; Base Table RLS should fail closed and return no visible rows | Pending |
| TU02 | Authenticated + no app_user; Base Table RLS should fail closed and return no visible rows | Pending |
| Anonymous | No View SELECT grant; expected privilege-layer denial | Pending |

Expected results are hypotheses based on current grants/RLS and documentation, not recorded as verified facts until Browser Evidence exists.

## What This Experiment Can Decide

If Browser Evidence matches the expected security behavior, B-1 supports further discussion of this candidate pattern:

```text
Write Model → Base Table
Read Model  → View → Native Data API
```

It would demonstrate that a View can reshape joins / aliases for Browser Read without requiring a custom API merely to translate physical table structure into a read-oriented contract.

This experiment alone does not establish a Nook Works Platform Rule. It produces Evidence for the later architecture decision.
