# Experiment B — Supabase Native Data API CRUD

- Date: 2026-09-12
- Status: Completed / Verified
- Environment: Netlify + iPad Safari + Supabase Nook Core
- Artifact: `public/data-api/index.html`

## Question

Browser 是否可以直接使用 Supabase Native Data API 完成 CRUD，並由 PostgreSQL Grant + RLS + Nook Works Application Access Boundary 正確限制不同登入狀態？

## Result

**YES，但 Native Data API 的 technical request success 不等於 Business Operation Success。**

Claire 已在 iPad Safari 實際完成 Browser → Supabase Auth Session → Native Data API → PostgreSQL Grant → RLS → `private.can_access_application()` → `test_k7m4x2` 的 SELECT / INSERT / UPDATE / DELETE。

同時實測確認：Authentication Success 本身不代表 Application Access。沒有 active `app_user` 的 authenticated Identity 仍無法取得或新增受 RLS 保護的資料。

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

測試 Identity：

| Identity | Auth | app_user | active | 用途 |
| --- | --- | --- | --- | --- |
| Anonymous | No | No | N/A | 驗證無 Session / publishable key only |
| TU02 | Yes | No | N/A | 驗證 Authentication Success 但無 Application Identity |
| TU01 | Yes | Yes | No | 驗證有 Application Identity 但 inactive |
| Claire | Yes | Yes | Yes | 驗證 active Application User 的完整 CRUD |

TU01 為臨時 Experiment Data，不寫入正式 `initial_data.sql` / Seed；TU02 不建立 `app_user` mapping。

## Direct Browser Evidence

### Anonymous

Anonymous INSERT 實際被 PostgreSQL privilege layer 拒絕：

```json
{
  "error": {
    "code": "42501",
    "message": "permission denied for table test_k7m4x2"
  }
}
```

這與 authenticated Identity 的 RLS rejection 不同：Anonymous 在此案例連 table privilege layer 都未通過。

本次沒有把 Anonymous 的每一個 operation 都作為完整矩陣逐項驗證，因此不把未直接觀察的 operation 寫成 Verified。

### TU01 — Auth Identity + inactive app_user

實際觀察：

- Authentication Success。
- SELECT request success，但可見資料為 0 rows。
- INSERT 被 RLS 明確拒絕，回傳 `42501 new row violates row-level security policy`。
- 因 SELECT 無可見 Grid row，正常 CRUD UI 無法直接選取 row 做 UPDATE / DELETE。

TU01 證明：存在 `app_user` mapping 仍不足以取得 Application Access，`is_active = false` 會使 `private.can_access_application()` 為 false。

### TU02 — Auth Identity + no app_user

Access Probe 實際結果：

```json
{
  "operation": "PROBE SELECT",
  "error": null,
  "count": 0,
  "rows": []
}
```

```json
{
  "operation": "PROBE INSERT",
  "error": {
    "code": "42501",
    "message": "new row violates row-level security policy for table \"test_k7m4x2\""
  },
  "count": null,
  "rows": []
}
```

```json
{
  "operation": "PROBE UPDATE",
  "error": null,
  "count": null,
  "rows": []
}
```

```json
{
  "operation": "PROBE DELETE",
  "error": null,
  "count": null,
  "rows": []
}
```

TU02 證明：Supabase Auth Authentication Success 不等於 Nook Works Application Access。沒有 `app_user` mapping 時，RLS 不會因為使用者已是 `authenticated` 就暴露資料。

### Claire — Auth Identity + active app_user

Claire 在正常 CRUD UI 實際完成：

- SELECT：成功讀取可見 rows。
- INSERT：成功新增資料；UI 未輸入 PK，`t01` 由 Database Identity 自動產生。
- UPDATE：成功修改既有 row，重新 SELECT 後確認資料已更新。
- DELETE：成功刪除既有 row，重新 SELECT 後確認資料已消失。

因此 active Application User 的 Browser Native Data API CRUD path 已取得直接 iPad Safari Evidence。

## Observed RLS / Data API Semantics

### 1. `error = null` 不等於 Business Operation Success

SELECT / UPDATE / DELETE 可能得到 technical request success，但沒有任何可見或受影響 row。

因此 Application 不應只用 `error === null` 顯示「查詢有資料」、「修改成功」或「刪除成功」。至少必須同時判讀 returned rows / affected result，並依 Business Requirement 決定是否需要更明確的 operation semantics。

### 2. SELECT 的 RLS 行為可呈現為空集合

TU01 / TU02 已 authenticated 且具 table SELECT grant，但 `private.can_access_application()` 為 false 時，SELECT request 本身可成功，結果為 0 rows。

在這個案例中，RLS 的 observable behavior 更接近 row visibility filtering，而不是一律回傳 authorization error。

### 3. INSERT 的 RLS `WITH CHECK` failure 會明確報錯

TU01 / TU02 INSERT 實際得到：

`42501 new row violates row-level security policy`

這與 SELECT 的 0 rows 行為不同，不能假設所有 CRUD operation 遭 RLS 限制時都會使用相同 response pattern。

### 4. UPDATE / DELETE 的 `error = null` + `rows = []` 不足以判定原因

Access Probe 的 UPDATE / DELETE 刻意使用不存在的 OID `999999999`，避免合法 Claire Session 誤改資料。

因此本次 Evidence **不能**宣稱「existing row 被 RLS 擋住時一定回傳空集合」。本次能直接證明的是：

- UPDATE / DELETE 在沒有符合條件的可操作 row 時，可以 `error = null` 且 `rows = []`。
- 單靠這種 response，Application 無法區分「target row 不存在」與「target row 對目前 Identity 不可見」。

這個不可區分性本身就是重要限制。

### 5. Identity / Sequence 不保證連號

Claire INSERT 時新 row 的 OID 出現缺號。前面曾有被拒絕的 INSERT request，且 PostgreSQL identity / sequence 取號不具交易回滾式的連號保證。

此處記錄為與既有 PostgreSQL sequence 經驗一致的 Observation / Inference，不把本次缺號單獨當成完整因果證明。

## Platform Implications

### Native Data API 可行

Browser + Publishable Key + Supabase Auth Session 可以直接使用 Native Data API；搭配 PostgreSQL Grant、RLS 與 Application Access Function，可形成有效的 Internal Application Data Access baseline。

### Authentication 與 Application Access 必須分層

`auth.users` 只證明 Authentication Identity。是否可使用 Nook Works Application Data，仍應由 `app_user` / active state / Authorization Rule 決定。

TU01 與 TU02 的不同 Business Identity 狀態最後都能被同一 Application Access Boundary 正確拒絕。

### CRUD 可行不代表所有 Business Function 都適合 Native CRUD

Native Data API 對 row visibility 與 affected-row semantics 有其天然行為。若 Business Function 需要明確區分 Not Found、Not Authorized、Conflict、Business Validation Failure、Transaction Result 等狀態，不能只因 Native CRUD 技術上可呼叫就直接視為足夠的 Application Contract。

此結果將作為後續 Custom API / RPC Experiment 的比較基準，而不是提前宣布 Production Architecture。

## Experiment Limitations

- UPDATE / DELETE 的 denied-existing-row 情境沒有被獨立設計成可區分的直接測試。
- Anonymous 沒有逐項完成完整 CRUD response matrix。
- 本次只驗證單一 test table 與簡單 row-level access boundary，不包含 Role / Menu / Fine-grained Permission / Transaction / Complex Business Validation。
- 本次不驗證 Native Data API 作為 Public Integration API；Nook Works 對外 Integration Surface 仍另行設計。

## Playground Experience / Future Experiment Rule

### Evidence 必須容易帶回 AI

Browser Experiment 的 Evidence 不只是要「顯示得出來」，也必須「容易帶走」。Claire 的 iPad Safari / Magic Keyboard 是 Browser Evidence 的實際 Human Test Environment，API Result 若只能在 `<pre>` 中手動選取，會無謂增加人工搬運成本。

後續提供 JSON / API Result / Token-safe Debug Output 的 Playground Artifact，應優先提供：

- Copy Result 按鈕。
- 清楚的 operation 名稱。
- Error code / message。
- Count / affected rows / returned rows。
- 避免輸出 Password、Token、完整 Session 或不必要的 Identity Data。

截圖適合保存 Browser UI / State Evidence；可複製的結構化結果適合帶回 AI 做精確分析。兩者用途不同。

## Conclusion

Experiment B 已完成並取得直接 Browser Evidence。

核心結論不是只有「Supabase Native Data API 可以 CRUD」，而是：

1. Browser Native CRUD 技術路徑可行。
2. Authentication Success 與 Application Access 可以透過 `app_user` + RLS 正確分層。
3. RLS 對不同 CRUD operation 的 observable response semantics 不一致。
4. `error = null` 不能被 Application 直接翻譯為 Business Operation Success。
5. Native Data API 是否適合某個正式功能，仍需依 Business Contract、Result Semantics、Transaction 與 Authorization Complexity 判斷。

這些 Evidence 將保留給 Nook Works 後續 Technical Platform Design 與 B / C / D mechanism comparison 使用。
