# Open Exploration

- Status: Active
- Purpose: 保存尚未形成獨立 Research Map 的探索線索、可重用 Experiment 與可能的 Knowledge Cluster。

這裡不是 TODO Dump，也不是「其他」垃圾桶。

一個 Experiment 可以先在這裡被看見，之後被一張或多張 Research Map 引用；如果某組 Evidence 慢慢形成清楚的 Research Question，再 Promote 成自己的 Map。

---

## Potential Cluster — iPad-first Development

目前尚未建立獨立 `iPad-first Development` Research Map。

原因不是這個 Intent 不重要，而是現階段 Evidence 主要是其他研究自然產生的副產品。先用 Tags / Links 保存，等問題邊界更清楚再 Promote，避免為了三份 Evidence 就成立研究院。

### Existing Evidence

#### GitHub Actions Remote Execution Environment

- Record: [`../experiments/github-actions/README.md`](../experiments/github-actions/README.md)
- Tags: `ipad-first`, `ai-engineering`, `remote-execution`, `github-actions`, `deployment`
- Supports:
  - iPadOS 缺少傳統 Local CLI / Linux runtime 時，可委派給 GitHub-hosted Runner。
  - Manual Approval Mode 與 AI Result Retrieval 可以分離。
  - Push-triggered Workflow 可形成低風險 Playground autonomous execution loop。

#### Supabase Edge Function Deployment Lifecycle

- Record: [`../experiments/custom-api/README.md`](../experiments/custom-api/README.md)
- Tags: `ipad-first`, `custom-api`, `deployment`, `remote-execution`, `supabase`, `github-actions`, `credential`
- `depends-on`: GitHub Actions Remote Execution
- Supports:
  - Supabase Edge Function source / deploy / HTTP verify / delete lifecycle 在已測條件下不要求本地 Desktop / Mac。
  - GitHub Actions + CLI 與 Connector 都能補足部分 local toolchain gap。

#### Browser Experiments A / B / B-1

- Records:
  - [`../experiments/auth/README.md`](../experiments/auth/README.md)
  - [`../experiments/data-api/README.md`](../experiments/data-api/README.md)
  - [`../experiments/data-api-view/README.md`](../experiments/data-api-view/README.md)
- Tags: `ipad-first`, `browser`, `supabase`, `netlify`
- Supports:
  - iPad Safari 不只是閱讀文件，也可作為真實 Browser Evidence Environment。
  - Authentication、Native CRUD、View Read / Security 都已有 iPad Safari direct evidence。
  - Playground Browser Artifact 若要讓 Claire 將 Evidence 帶回 AI，應提供 Copy Result 等 iPad-friendly evidence transfer design。

### Possible Future Research Question

如果 Evidence 繼續累積，可以 Refine 成例如：

> 在不自建 Local Desktop / Server 的前提下，iPad-first Development Environment 可以涵蓋哪些 Software Development Responsibilities？哪些工作仍存在不可替代的 Local Toolchain gap？

這個 Question 應該用 Evidence 回答，而不是預設結論「Claire 不需要買 Mac mini」。Knowledge Base 不替購物信仰作弊。

---

## Closed Exploration｜Local-first Personal Archive / Day One Reader

- Experiment: [D1-READER-1](../experiments/dayone-reader/README.md)
- Status: Verified / Completed
- Closed: 2026-09-19
- Tags: `day-one`, `local-first`, `browser`, `json`, `privacy`, `ipad-first`, `photo-rendering`, `pdf-attachment`, `data-portability`
- Related Cluster｜相關研究群：iPad-first Development

這條 Open Exploration 已完成第一輪 Browser Reader Research Question：Day One structured export 可以在不轉換 canonical archive、也不把私人日記上傳 backend 的前提下，支撐實際可閱讀的 local-first Browser Reader；照片與 PDF attachment 都已形成 native export mapping / fallback contract 與 iPad Human Environment Evidence。

目前不因單一完成 Experiment 建立獨立 Research Map。大型 Journal performance、未遇到的 export edge cases 採 problem-triggered reopening；已啟動的 Native Swift / PhotoKit Reader 另立 [D1-NATIVE-1](../experiments/dayone-native-reader/README.md)，不把不同 runtime 的問題塞回已結案的 Browser Reader。

### Closed Extension — D1-NATIVE-1

- Status: Verified / Completed
- Closed: 2026-09-20
- Question answered: Claire 自用 iPad Native Reader 可直接讀 Day One JSON、重建 structured richText，並以 `photos[].appleLocalIdentifier` 透過 PhotoKit 取得 Photos 實體照片。
- Reading UX verified: Search、single Tag filter、bounded inline photos、full-screen same-entry photo browsing。
- Explicit exclusion: PDF physical rendering / attachment integration。
- Negative evidence: Day One-style photo wall prototype 在目前 SwiftUI / Playgrounds composition 造成 reverse-scroll regression；因非 data-sovereignty 核心需求而停止追查。
- Re-open only when a real archive need appears，例如 Day One schema change、new richText construct、iCloud-only failure、large-journal performance pain 或 PhotoKit identifier behavior change。

D1-NATIVE-1 與 D1-READER-1 現在共同回答「Day One export 是否具有實際資料自主性」：Browser route 與 Apple-native route 都已有可閱讀的 Human Environment Evidence。後續不因 UI parity 願望維持常駐 Open Exploration。


---

## Potential Cluster — AI Engineering / Autonomous Experimentation

### Existing Evidence

GitHub Actions Experiment 已證明：AI 可以透過 controlled repository change 觸發外部 Runner，並自行讀回 runtime-only result。

- Record: [`../experiments/github-actions/README.md`](../experiments/github-actions/README.md)
- Tags: `ai-engineering`, `remote-execution`, `github-actions`

這可能支援未來更大的 Research Question：

> AI 在不持有 Claire 本地電腦的情況下，可以安全、自主地完成哪些 engineering experiment lifecycle？哪些步驟應保留 Human Approval Gate？

目前 Evidence 還不足以建立完整 Research Map。先保留 Cluster。

---

## How to Add New Exploration｜怎麼加新的天馬行空

如果新 Experiment 沒有明確 Research Intent，可以先留下最小資訊：

```text
Exploration / Experiment name
Why it was interesting now
Question, even if still fuzzy
Links to Experiment / Evidence
Tags
Possible cluster, if any
```

不要硬塞進 `Nook Technical Platform`，也不要為了「沒有分類」感到罪惡。

分類是為了找回思路，不是為了讓每一朵野花先申請戶籍。