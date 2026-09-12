# Short-term Work Items

> 無交期。依 Claire 有空研究的時間逐項進行。
> 這不是正式開發排程，也不是 Nook Works Specification；只是 Playground 的近期實驗清單，避免跨對話後遺失上下文。

## Login / API Platform Experiments

### A. Supabase Auth — Completed / Verified

目的：驗證由 Netlify 上的 Browser UI 直接使用 Supabase Auth 的基本 Authentication Path。

結果：已於 2026-09-12 完成，並由 Claire 在 iPad Safari 實際驗證 Browser → Supabase Auth → `auth.users` Identity → Session 成功。

- Evidence Record：`experiments/auth/README.md`
- Evidence Index：`evidence/index.md`
- Artifact：`experiments/auth/index.html`

### B. Supabase Data API — Read Test Data

目的：驗證 Supabase 自動提供的 CRUD / Data API，作為最便宜的 baseline。

暫定範圍：
- 由已登入的 Browser 呼叫 Data API。
- 使用語意中立的 `test_` Database Object 與 AI 製造的 Test Data。
- 先觀察實際呼叫方式、Authentication Context、Response、RLS 與限制，不延伸 Business Logic。
- 不讀取正式 `app_user` 資料，避免 Public Playground 暴露正式 Business Semantic 或真實 Identity。

### C. Supabase Custom API — Read Test Data

目的：驗證自行開發的 API 是否能部署於 Supabase，並完成 Browser → API → Database → Response 的完整路徑。

暫定範圍：
- 自行實作一支最小 API。
- 使用與 Experiment B 相同的語意中立 `test_` Database Object 與 Test Data。
- 驗證 API 的開發、部署、呼叫、DB Access、Authentication Context 與 JSON Response。
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

A 已完成並取得 Authentication 實際 Evidence。

B、C、D 刻意完成相同且極簡的 Test Data Read 需求，避免 Business Logic 與正式 Business Semantic 污染 Technical Mechanism 的比較。

B、C、D 完成後，再依實際 Evidence 討論：
- Supabase Data API 適合負責什麼。
- Custom API 適合負責什麼。
- RPC 適合負責什麼。
- RPC vs Custom API 是否需要二選一，或應形成不同適用情境的 Platform Rule。

目前不預設結論，也不把實驗結果直接視為 Production Architecture。
