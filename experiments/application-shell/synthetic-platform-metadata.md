# S-SHELL-1 — Synthetic Platform Metadata Design

- Date: 2026-09-16
- Parent Experiment: `S-SHELL-1`
- Purpose: 固定 Shell Navigation / Feature Entry probe 使用的 synthetic metadata structure 與三個 Feature fixture。
- Scope: Experiment design only；不是 Nook Works Production schema specification。

## Research Boundary

本 probe 回答：Platform metadata 是否能分開描述 Feature、Navigation Entry，以及 coarse `user_type` 可進入哪些 Feature，並讓 Shell 依 Application User Context 產生 deterministic Navigation / Feature Entry outcome？

本 probe不決定 Production table naming、Role / Permission、Backend authoritative authorization、router/framework 或 Menu Maintenance UI。

```text
Navigation Visibility
≠ Feature Entry
≠ Feature Data Access
≠ Backend Authorization
```

## Conceptual Model

### Feature Registry

描述 routable Application Feature Entry，不代表 JavaScript file、API URL 或 database table。`feature_type` 只分類 Feature 為 `business` / `common`；**Feature classification 與 data source domain / integration mechanism 彼此獨立**。

### Navigation Definition

描述 Shell Navigation group、Feature Entry、parent relationship 與 display order。Group 可沒有 Feature reference；Feature menu entry 指向 Feature Registry。

### User Classification / Feature Mapping

目前 fixture：

```text
admin → Business Place + Business Weather + Common Place-Country
user  → Business Place + Business Weather
guest → no Feature Entry; Shell Home only
```

這不是 Role / Permission architecture。

## Synthetic Object Mapping

| Synthetic Object | Experiment Concept |
| --- | --- |
| `test_k4p7x2` | routable Application Feature registry |
| `test_m8q3v6` | Shell Navigation definition |
| `test_r5n9c1` | `user_type` → Feature Entry mapping |

Synthetic object name 刻意不帶正式 Business / Platform semantic。三張 table 省略 standard audit columns，因為 audit metadata 與本 Research Question 無關。

## Relationship Shape

```text
app_user.user_type
        │
        ▼
test_r5n9c1
        │
        ▼
test_k4p7x2  ←  test_m8q3v6
   Feature        Navigation
        │
        ▼
   route_path
        │
        ▼
      Router
```

`/home` 是 Shell-owned landing，不進 Feature Registry，因此 active guest 即使沒有 Feature mapping 仍可 Shell Ready。

## Browser Access Contract

Shell browser client 以 authenticated Supabase session SELECT：

- `test_k4p7x2`
- `test_m8q3v6`
- `test_r5n9c1`

Current probe boundary：

- `anon`: no table access。
- `authenticated`: SELECT only。
- 三張 table 均啟用 RLS。
- SELECT policy 使用 `private.can_access_application()` 作 Application Access gate。
- `user_type` Feature Entry 差異由 mapping data 解析，不由 RLS 隱藏 metadata rows。

因此 active guest 可以讀 metadata，但得到 empty allowed Feature set。這刻意驗證 `Application Access ≠ Feature Eligibility`，不是 production authorization claim。

## Seed Fixture

Feature fixture：

| feature_code | feature_name | route_path | feature_type | Integration Shape |
| --- | --- | --- | --- | --- |
| `FUNC_BUSINESS_PLACE` | Place Native | `/business/places` | `business` | Native Data API |
| `FUNC_BUSINESS_WEATHER` | Place Weather | `/business/weather` | `business` | Native Data API + direct External API |
| `FUNC_COMMON_PLACE_COUNTRY` | Place-Country Custom API | `/common/place-country` | `common` | existing Custom API |

Navigation fixture：

```text
Business
├─ Place Native → FUNC_BUSINESS_PLACE
└─ Place Weather → FUNC_BUSINESS_WEATHER

Common
└─ Place-Country Custom API → FUNC_COMMON_PLACE_COUNTRY
```

User classification mapping：

| user_type | Place Native | Place Weather | Place-Country Custom API |
| --- | :---: | :---: | :---: |
| `admin` | yes | yes | yes |
| `user` | yes | yes | no |
| `guest` | no | no | no |

Direct route 仍由 Shell 做 Feature Entry check；Menu hidden 本身不是 authorization evidence。

## DDL Design Notes

- `oid` 使用 identity 模擬 Nook Core identity pattern。
- `feature_code`、`menu_code` 是 stable identifiers。
- `parent_menu_oid`、`feature_oid` 採 logical reference，不建立 FK；本次不研究 referential enforcement。
- `feature_type` 是 experiment classification，尚未升格 Platform Rule。
- `is_active` 分別存在 Feature / Menu，使 capability active 與 Navigation active 可分開觀察。
- mapping row 存在代表 coarse Feature Entry eligibility。
- Browser RLS / grants / policies 保存於 companion SQL，確保 probe 可重建。

Executable DDL / fixture / inspection queries：

`experiments/application-shell/synthetic-platform-metadata.sql`

Feature 的 Native / Custom / External API contract：

`experiments/application-shell/feature-integration-contract.md`

若後續修改 schema、fixture 或 access boundary，SQL、本文件與 Evidence 必須同步；不准拿 A 版資料解釋 B 版結果，這種事情企業系統已經示範得夠多了。