# Short-term Work Items

> 無交期。依 Claire 有空研究的時間逐項進行。
> 這不是正式開發排程，也不是 Nook Works Specification；只是 Playground 的近期實驗清單，避免跨對話後遺失上下文。

## Login / API Platform Experiments

### A. Supabase Auth

目的：驗證由 Netlify 上的 Browser UI 直接使用 Supabase Auth 的基本 Authentication Path。

暫定範圍：
- 極簡 Login UI：account / password / 登入 / 取消。
- 呼叫 Supabase Auth 驗證。
- 觀察登入成功、登入失敗與 Session / `auth.users` identity。
- 此階段不處理 `app_user`、Role、Menu、Permission。

### B. Supabase Data API — Read `app_user`

目的：驗證 Supabase 自動提供的 CRUD / Data API，作為最便宜的 baseline。

暫定範圍：
- 由已登入的 Browser 呼叫 Data API。
- Read `app_user`。
- 讀取欄位：`oid`, `app_user_name`, `is_active`。
- 先觀察實際呼叫方式、Authentication Context、Response 與限制，不延伸 Business Logic。

### C. Supabase Custom API — Read `app_user`

目的：驗證自行開發的 API 是否能部署於 Supabase，並完成 Browser → API → Database → Response 的完整路徑。

暫定範圍：
- 自行實作一支最小 API。
- API 執行等價查詢：`select oid, app_user_name, is_active from app_user`。
- 驗證 API 的開發、部署、呼叫、DB Access 與 JSON Response。
- 暫時不加入 Role、Menu、Permission、複雜 Business Rule、Transaction。
- 暫時不評估 Netlify Function。

### D. Supabase RPC — Read `app_user`

目的：驗證 PostgreSQL Function + RPC 是否能完成與 B / C 相同的資料讀取需求。

暫定範圍：
- 建立實驗用 PostgreSQL Function / RPC。
- 執行與 B / C 等價的 `app_user` Read。
- 讀取欄位：`oid`, `app_user_name`, `is_active`。

## 後續比較

A 完成後取得 Authentication 實際經驗。

B、C、D 刻意完成相同且極簡的資料需求，避免 Business Logic 差異污染 Technical Mechanism 的比較。

B、C、D 完成後，再依實際 Evidence 討論：
- Supabase Data API 適合負責什麼。
- Custom API 適合負責什麼。
- RPC 適合負責什麼。
- RPC vs Custom API 是否需要二選一，或應形成不同適用情境的 Platform Rule。

目前不預設結論，也不把實驗結果直接視為 Production Architecture。
