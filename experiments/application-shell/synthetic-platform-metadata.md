# S-SHELL-1 — Synthetic Platform Metadata Design

- Date: 2026-09-16
- Parent Experiment: `S-SHELL-1`
- Purpose: 在實作 Shell 前，先固定本次 Navigation / Feature Entry probe 實際使用的 synthetic metadata structure。
- Scope: Experiment design only；不是 Nook Works Production schema specification。

## Why This Record Exists

本次 probe 不只要留下「admin 看得到哪些 Menu、guest 看不到哪些 Feature」的結果，也必須保存產生該 Evidence 時實際使用的資料結構。

否則未來進入正式 Platform Design 時，只剩行為結論，卻無法回答「當時成功驗證的 metadata structure 到底長什麼樣」。因此本文件與 companion SQL 一起保存 Conceptual Model、Synthetic Object Mapping、Synthetic DDL、Seed Fixture、Browser Access Contract 與 Expected Navigation / Feature Entry outcome。

Synthetic tables 刻意省略正式 Nook Core 常用的四個 audit columns。這只是因為 audit metadata 與本次 Research Question 無關，不代表未來 Production Platform Table 應省略 audit design。

---

## Research Boundary

本 probe 只回答：

> Platform metadata 是否能分開描述 Feature、Navigation Entry，以及目前 coarse `user_type` 可進入哪些 Feature，並讓 Shell 依 Application User Context 產生可預期的 Navigation / Feature Entry outcome？

本 probe **不**決定 Production table name、Production Role / Permission model、Backend authoritative authorization contract、Production router / framework、Menu Maintenance UI implementation，或 Feature-level action permission。

Navigation Visibility ≠ Feature Entry ≠ Backend Authorization。

---

## Conceptual Model

### Concept A — Feature Registry

描述 Application 可被導向的 Feature Entry，而不是 JavaScript file、HTML file、API URL 或 database table。

Minimum metadata 包含 stable feature code、display name、Feature Entry Route、coarse feature classification 與 active state。

`route_path` 表示 Feature Entry Route。例如 `/business` 是 Feature 的入口；Feature 內部未來可能再擁有 detail / edit route，不需要因此增加 Menu row。

### Concept B — Navigation Definition

描述 Shell Navigation 如何呈現 Feature Entry。

Minimum metadata 包含 stable menu code、display name、parent menu reference、optional feature reference、display order 與 active state。

Menu group 可以沒有 Feature reference；可點擊的 Menu Entry 則指向 Feature。

### Concept C — User Classification / Feature Mapping

描述目前 `app_user.user_type` 與可進入 Feature 的 coarse mapping。

目前只驗證：

```text
admin → Business + Common
user  → Business
guest → no Feature Entry
```

這不是 Role / Permission architecture。若未來 Requirement 出現 multi-role 或 fine-grained permission，再另行研究，不讓本次 probe 偷偷長成 IAM 系統。

---

## Synthetic Object Mapping

Synthetic object name 刻意使用無 Business / Platform semantic 的 `test_` random name，避免公開 Playground object name 被合理推測為未來正式 schema naming。

| Synthetic Object | Experiment Concept |
| --- | --- |
| `test_k4p7x2` | Concept A — routable Application Feature registry |
| `test_m8q3v6` | Concept B — Shell Navigation definition |
| `test_r5n9c1` | Concept C — `user_type` to Feature Entry mapping |

這份 mapping 是 Experiment traceability，不代表未來正式 table name 已決定。

---

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
        │
        ▼
     Feature
```

Shell Navigation resolution 的概念流程：

```text
Application User Context
→ resolve allowed Feature set by user_type
→ load active Navigation definition
→ keep Menu groups required to present allowed Feature entries
→ render Navigation
→ click Feature Menu Entry
→ resolve Feature Entry Route
→ Router
→ Feature
```

`/home` 暫時視為 Shell-owned landing，不放入 Feature Registry，也不依賴 Feature mapping。因此 active `guest` 即使沒有任何 Feature mapping，仍可完成 Application bootstrap 並停留在 Shell Home。

---

## Browser Access Contract

本 Experiment 的 synthetic metadata 不是只給 SQL console inspection 使用。Shell browser client 預期以 authenticated Supabase session 直接 SELECT 三個 synthetic tables：

- `test_k4p7x2`
- `test_m8q3v6`
- `test_r5n9c1`

目前 live probe 與 companion SQL 固定以下 access boundary：

- `anon`: no table access。
- `authenticated`: `SELECT` only。
- 三張 table 均啟用 RLS。
- SELECT policy 均以 `private.can_access_application()` 作為 Application Access gate。
- active `app_user` 通過 Application Access 後可以讀取 metadata；`user_type` 到 Feature Entry 的差異由 mapping data 解析，而不是由三張 metadata table 的 RLS 分別隱藏 row。

因此 active `guest` 可以讀 metadata，但因 `test_r5n9c1` 沒有 `guest` mapping，最後得到 empty allowed Feature set。這是刻意驗證 `Application Access ≠ Feature Eligibility`，不是 authorization 漏洞。

這個 contract 只屬於 S-SHELL-1 synthetic probe，不自動成為 Production Platform metadata authorization model。

---

## Seed Fixture

Feature fixture：

| feature_code | feature_name | route_path | feature_type |
| --- | --- | --- | --- |
| `FUNC_BUSINESS` | Business Function | `/business` | `business` |
| `FUNC_COMMON` | Common Function | `/common` | `common` |

Navigation fixture：

```text
Business
└─ Business Function → FUNC_BUSINESS

Common
└─ Common Function → FUNC_COMMON
```

User classification mapping：

| user_type | FUNC_BUSINESS | FUNC_COMMON |
| --- | :---: | :---: |
| `admin` | yes | yes |
| `user` | yes | no |
| `guest` | no | no |

Expected Shell outcome：

| user_type | Shell Home | Business Menu / Feature | Common Menu / Feature |
| --- | :---: | :---: | :---: |
| `admin` | yes | yes | yes |
| `user` | yes | yes | no |
| `guest` | yes | no | no |

Direct route 仍必須由 Shell 做 deterministic Feature Entry check；Menu hidden 本身不是 authorization evidence。

---

## DDL Design Notes

- Synthetic tables 不包含 `created_at / created_by / updated_at / updated_by`。
- `oid` 使用 identity，方便模擬 Nook Core object identity pattern。
- `feature_code`、`menu_code` 保留 stable identifier，避免 UI display name 成為 relationship key。
- `parent_menu_oid`、`feature_oid` 在本 probe 採 logical reference，不建立 FK；本次不研究 referential enforcement。
- `feature_type` 目前只是 experiment classification，用來觀察 Business / Common metadata 是否有價值；尚未升格為 Platform Rule。
- `is_active` 分別保留在 Feature 與 Menu，讓「Feature capability 是否啟用」與「Navigation entry 是否啟用」可以被分開觀察。
- mapping table 不另外放 `is_active`；目前 mapping row 存在即代表 coarse Feature Entry eligibility。
- Browser access 所需 RLS / grants / policies 也保存在 companion SQL，避免未來只重建 table shape 卻遺失實際 probe access boundary。

實際可執行 DDL / INSERT / access policy 固定保存在：

`experiments/application-shell/synthetic-platform-metadata.sql`

若後續 probe 修改 schema 或 access boundary，應同步更新 SQL 與本文件，並在 Evidence 中標示實際驗證使用的版本，避免拿 A 版 schema 解讀 B 版結果。