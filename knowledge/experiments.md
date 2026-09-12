# Experiment Catalog

這份 Catalog 回答一個很樸素、但 Evidence Index 不負責回答的問題：

> **我們曾經做過哪些 Experiment，而且當時為什麼要做？**

`evidence/index.md` 以「做完知道什麼」為中心；這份 Catalog 以「為什麼設計這個 Experiment」為中心。

同一個 Experiment 可以支援多個 Research Intent。Catalog 只保存短摘要、Tags 與 Links，不複製完整 Evidence。

---

## 2026-09-12

### Experiment A — Supabase Auth

- Status: `Verified`
- Record: [`../experiments/auth/README.md`](../experiments/auth/README.md)
- Primary Intent: `Nook Technical Platform / Browser Authentication`
- Also Supports: `ipad-first`
- Tags: `nook-platform`, `ipad-first`, `authentication`, `session`, `supabase`, `netlify`, `browser`

**Why it existed**

先確認最基本的 Browser Authentication Path：Netlify-hosted UI 是否能直接使用 Supabase Auth 建立 Session，而不需要為了「登入」先自行包一層 Custom API。

**What it unlocked**

建立 Browser → Supabase Auth baseline，讓後續 Data API / Application Access Experiment 可以使用真實 authenticated Session。

---

### Experiment B — Supabase Native Data API CRUD

- Status: `Verified`
- Record: [`../experiments/data-api/README.md`](../experiments/data-api/README.md)
- Primary Intent: `Nook Technical Platform / Internal Data Access`
- Also Supports: `ipad-first`
- Tags: `nook-platform`, `ipad-first`, `data-api`, `authorization`, `rls`, `supabase`, `browser`, `postgresql`

**Why it existed**

在 Auth baseline 成立後，驗證 Browser 能否直接使用 Supabase Native Data API 完成 CRUD，以及 Authentication Identity、`app_user` Application Identity、Grant、RLS 是否能形成真正的 Application Access Boundary。

**What it unlocked**

建立 Native Data API mechanism baseline，也暴露 `error = null` / row visibility / affected-row semantics 不等於 Business Operation semantics，讓後續 Custom API / RPC 比較有了真正的問題，而不是只比「能不能讀資料」。

---

### Experiment B-1 — Supabase Native Data API View Read / Security

- Status: `Verified`
- Record: [`../experiments/data-api-view/README.md`](../experiments/data-api-view/README.md)
- Relationship: `extends` Experiment B
- Primary Intent: `Nook Technical Platform / Read Model`
- Also Supports: `ipad-first`
- Tags: `nook-platform`, `ipad-first`, `data-api`, `read-model`, `rls`, `supabase`, `browser`, `postgresql`

**Why it existed**

Experiment B 證明 Native Table CRUD 可行後，進一步問：Browser Read Contract 是否一定要等於 Physical Table Schema？PostgreSQL View 能不能在保留 invoking identity security boundary 的情況下提供 join / alias Read Model？

**What it unlocked**

建立 `Table or security-reviewed View → Native Data API` 的 Read Model Candidate，避免未來只是為了資料 shaping 就條件反射地增加 Custom API。

---

### GitHub Actions Remote Execution Environment

- Status: `Verified`
- Record: [`../experiments/github-actions/README.md`](../experiments/github-actions/README.md)
- Primary Intent at birth: `Supabase deployment prerequisite exploration`
- Supports: `Nook Technical Platform / Deployment`
- Supports: `ipad-first`
- Supports: `ai-engineering`
- Tags: `nook-platform`, `ipad-first`, `ai-engineering`, `remote-execution`, `deployment`, `github-actions`

**Why it existed**

原本為了回答後續 Supabase Edge Function deployment 是否會被 iPadOS 缺少 Local CLI 卡住，先確認 GitHub Actions 能不能真的借出一台 temporary Runner，讓 AI / Claire 把 execution 委派出去並讀回 runtime result。

**What it unlocked**

Experiment 結果超出原始 Intent：GitHub Actions 成為 Playground 可重用的 Remote Execution Environment，同時支援 iPad-first、AI autonomous experimentation、CLI / build / CI-CD 等未來問題。

---

### Experiment C-0 — Supabase Edge Function Deployment Lifecycle

- Status: `Verified`
- Record: [`../experiments/custom-api/README.md`](../experiments/custom-api/README.md)
- `depends-on`: GitHub Actions Remote Execution Environment
- Primary Intent: `Nook Technical Platform / Custom API Runtime / Deployment`
- Also Supports: `ipad-first`
- Tags: `nook-platform`, `ipad-first`, `custom-api`, `deployment`, `remote-execution`, `credential`, `supabase`, `github-actions`

**Why it existed**

Custom API 未來要比較 DB / Auth / Business Contract，但在那之前先隔離最原始的 dependency：API 到底能不能從 Claire 真實的 iPad-first workflow 被 deploy、invoke、inspect、delete。

因此故意使用沒有 DB、Auth、Business Logic、CORS 的 Hello World。Hello World 本身不重要，重要的是它替 Deployment Lifecycle 當祭品，避免其他變因混進來。

**What it unlocked**

Supabase Edge Function Deployment Lifecycle 已有實作 Evidence；同時自然暴露 `Custom API Runtime` 的 sibling candidate：Netlify Functions。後續可以在同一 Architecture node 取得可比較 Evidence，而不是做兩家公司全面功能評測。

---

## Current Candidate Experiments｜已辨識但尚未執行

這些不是 Completed Experiment，不應寫進 Evidence Index；但保留它們可以讓未來知道「這條 Branch 已經被看見，不是被否決」。

### Netlify Functions — Minimal Deployment Lifecycle

- Status: `Candidate`
- Research Map: [`Nook Technical Platform`](maps/nook-technical-platform.md)
- Relationship: `compares-with` C-0 at `Custom API Runtime / Deployment`
- Tags: `nook-platform`, `ipad-first`, `custom-api`, `deployment`, `netlify`

Purpose：用與 C-0 相近的最小 probe 驗證 source → deploy → HTTP invoke → inspect / cleanup，取得與 Supabase Edge Functions 可比較的 operational Evidence。

### Custom API — Browser Invocation / CORS

- Status: `Candidate`
- Research Map: [`Nook Technical Platform`](maps/nook-technical-platform.md)
- Tags: `nook-platform`, `custom-api`, `browser`, `cors`

Purpose：C-0 的 Safari direct navigation 只證明 endpoint 可被 HTTP GET，不等於 Netlify Browser Application 的 cross-origin `fetch()` 已成立。

### PostgreSQL RPC — Read Test Data

- Status: `Candidate`
- Research Map: [`Nook Technical Platform`](maps/nook-technical-platform.md)
- Tags: `nook-platform`, `rpc`, `authorization`, `rls`, `postgresql`, `supabase`

Purpose：建立 Native Data API / Custom API 之外的 mechanism Evidence，研究 RPC 在明確 operation contract、permission、RLS 與 Function Security Mode 下適合承擔什麼 Responsibility。

---

## Maintenance Rule｜維護規則

每次建立新 Experiment 時，先加入一筆簡短 Catalog entry；完成後更新 Status 與 `What it unlocked`。

如果 Experiment 後來支援新的 Research Intent，只增加 Link / Tag，不複製 Experiment Record 或 Evidence。

Catalog 要讓未來的人快速回答「為什麼做」，不是把所有實驗報告再抄一次。