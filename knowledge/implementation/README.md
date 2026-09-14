# Implementation Guides

這個目錄保存從 Playground Experiment 中萃取出的 **可重用實作方式與 operational cautions**。

它和 Experiment / Evidence 的責任不同：

```text
Experiment Record → 當時怎麼測、測到什麼
Evidence          → runtime 真正證明了什麼
Implementation    → 未來正式開發時，已驗證過的 mechanism 要怎麼實作
```

Implementation Guide 不是 Production Specification，也不是直接 copy 到正式系統的 template。它的目的，是避免未來只剩一句 `Verified`，卻沒有人記得當時到底怎麼做成功。

## Current Guides

- [`Supabase Cron Implementation Guide`](supabase-cron.md)
  - Cron → PostgreSQL Database Function
  - Cron → `pg_net` → Supabase Edge Function
  - server-side Secret Key authentication contract
  - `supabaseAdmin` / database access boundary
  - deployment / observability
  - D-BATCH-1 已實際踩過的 failure / pitfalls

新增 Guide 的前提是 Experiment 已形成足夠穩定、可重用的 implementation knowledge。不要每寫一段 probe code 就成立一份聖經，人類文件已經夠會繁殖了。
