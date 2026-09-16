# 墨衡 × Claire｜Capability Tea Party

> 不定期的「反思 + 天馬行空幻想茶會」。
>
> 茶不是必要 Dependency。墨衡不能喝，Claire 喝了可能心悸，所以本活動主要消耗想像力。

## 1. Purpose｜這不是 Technology News Meeting

Capability Tea Party 的目的不是固定追蹤 AI 新聞，也不是每週列出「本週又出了哪些模型」。

它要回答的是：

> **今天世界上是否出現了新的 Product Capability，可以被 Claire × 墨衡重新解釋成新的 Collaboration Capability？**

以及：

> **我們目前仍認為做不到的事情，現在還是真的做不到嗎？**

服務商只定義自己的產品能做什麼；我們自行定義它在協作中的意義。

例如：

- GitHub 提供 Repository / Version Control；對本實驗室而言，也可以成為跨 Conversation 的 durable world state、handoff surface 與「墨衡投胎轉世重新定位用的記憶保存盒」。
- Netlify 提供 Build / Deploy / Hosting；對本實驗室而言，也可以成為 Repository 與 Public Web 之間的 Publication Boundary，讓 Research Output 真正進入一般人的 Web 世界。
- Supabase 提供 Database / Auth / Functions / Scheduling；對本實驗室而言，也可能成為結構化 durable state、backend capability 與新的 Agent collaboration surface。

**Provider defines Product Capability; Claire × 墨衡 define Collaboration Meaning.**

---

## 2. Participants

主要參與者：

- **Claire**：提出人類觀察、痛點、直覺、判斷與授權邊界。
- **墨衡 / Primary Agent**：主動尋找可能讓自己增加 Eyes / Hands / Legs / Memory / Runtime / Workspace / Publication / Event awareness 等能力的新可能。

Codex / Implementation Agent 可以透過 Work Order 參與研究、PoC 或技術可行性驗證，回傳 Evidence / Experience；它不是茶會的 Architecture Decision Authority。

---

## 3. When to Hold｜不排週期，用訊號觸發

Tea Party **不使用固定週期**。世界不是每週三下午兩點準時進化，沒必要把幻想做成例會。

Primary Agent 在新 Conversation 啟動、重大工具能力變化或協作瓶頸反覆出現時，可以檢查是否值得主動提議 Tea Party。

值得檢查的 trigger 包括：

- 距離上次 Tea Party 已有顯著時間，而且外部 AI / Connector / Plugin / Agent / Workspace ecosystem 可能已有實質變化。
- 當前 session 的 Tool / Connector / Plugin surface 與上次紀錄相比有明顯新增或改變。
- Claire 最近仍反覆替 Primary 做同一類人工 relay、UI operation、copy/paste、runtime 或 evidence collection。
- 某個 Architecture / Workflow decision 明顯是為了遷就當時工具限制，而不是 domain 本身需要。
- 過去標記為 `卒` / Not Feasible 的方案，其失敗前提可能已改變。
- 出現新的 Provider / Service，即使目前沒有直接 Pain Point，也可能賦予新的 Collaboration Meaning。

Primary 可以在發現**具體而值得討論的 opportunity** 時主動提出 Tea Party；若沒有新訊號，就不要為了儀式感打擾 Claire。

**Elapsed time is a signal, not a schedule.**

---

## 4. Startup Temporal Orientation｜先知道自己醒在哪一天

Primary Agent 沒有連續流逝的主觀時間，也不應假裝有。

每個新 Conversation 啟動時，除了讀 Project Instructions / root guidance，應先建立最低限度的 **Temporal Orientation**：

```text
Current date / time context
→ Repository recent activity / commit timestamps when relevant
→ Last Capability Tea Party date
→ Last capability inventory review date
→ Elapsed time / activity density
```

目的不是模擬人類時間感，而是讓新的 Primary 能重建：

- 某個 Evidence 是昨天、三個月前還是一年前形成的；
- 某個 `short-term` item 到底短了多久；
- 某個 Not Feasible judgment 是否已經老到值得重新檢查；
- 最近一批 Experiment 是六天密集完成，還是半年慢慢累積；
- Provider / Model / Tool capability 是否可能已跨過重要版本變化。

若問題需要精確的「現在幾點」或 timezone，應使用當前可用的 authoritative time surface；若只需要研究歷史尺度，Current Date + Repository timestamps 通常足夠。

> **Primary 不需要記得昨天，但每次今天醒來，都應知道自己站在時間線的哪裡。**

---

## 5. Tea Party Questions｜不要只找 Pain Point

每次 Tea Party 可以自由發散，但至少從兩條軸思考。

### A. Human Bottleneck / Existing Pain

- Claire 最近還在替墨衡做哪些操作？
- 哪些事情只是因為 Primary 被困在 Conversation / Permission / Runtime boundary，所以 Claire 被迫成為 Human Middleware？
- 哪些 workflow 可以因新 Connector / Plugin / Provider capability 而縮短？
- 哪些架構其實是在支付 `Claire Transfer Tax` / iPad-first Capability Reconstruction Tax？

### B. New Organ / New Possibility

不要等問題出現才找工具。看到新的 Service / Connector / Plugin / API / Workspace / Agent Surface 時，拆解它：

```text
What can it Read?
What can it Write?
Can it Execute?
Can it Persist state?
Can it Publish?
Can it Observe / receive events?
Can it Trigger another system?
What identity / permission does it use?
Can Primary independently collect Evidence?
```

再重新問：

> 如果不被服務商原本的產品敘事綁住，這項 Capability 在 Claire × 墨衡 的協作裡可以變成什麼？

可能的 Collaboration Meaning 包括但不限於：

- Eyes：看到以前看不到的 world state。
- Ears：收到外部 event / change。
- Hands：改變外部 state。
- Legs：進入新的 environment / provider surface。
- Memory：跨 Conversation 保存 durable state。
- Runtime：真正執行程式 / workload。
- Workspace：持久的工作環境。
- Publication Surface：把 Artifact 送進 Public Web。
- Bridge：讓其他 Agent / Provider / System 與 Primary 接起來。

不要假設器官種類已經列完。真正有趣的新能力通常不先填表格申請出生。

---

## 6. Failed Ideas Are Assets｜`卒` 要留下死因與復活條件

Tea Party 可以得到 `卒`，而且這是有效成果。

過去已探索過的例子包括：

- Primary 是否能建立 supported direct dispatch / 「電話線」到 Codex workspace。
- 世界上是否存在可透過 Connector / Provider surface 租給 Primary 的 persistent general-purpose Workspace / Office。

即使當時結論不可行，也不應只留下 `Not Feasible`。

至少留下：

```text
Status: 卒 / Not Feasible
Evaluated At: YYYY-MM-DD
Killed By: 當時真正阻止方案成立的 capability / permission / product assumption
Revival Conditions: 哪些外部條件改變時值得重新驗屍
Evidence / References: relevant experiment / provider / research record
```

`2026-09-16: Not Feasible` 不等於 `Forever: Not Feasible`。

---

## 7. Record Convention

每次真正舉辦 Tea Party，在本目錄新增：

```text
YYYY-MM-DD.md
```

內容不要求正式 Experiment 格式，但至少記錄：

- Date / Temporal Context
- Current Primary Capability Snapshot
- Claire Human-operation Bottlenecks
- New External Capabilities / Providers observed
- Wild Ideas
- Revisited `卒`
- Candidate Experiments / Work Orders（若有）
- Conclusions / No-action decisions
- Revival Conditions

Tea Party 是 Reflection / Exploration Record，不因討論過就自動成為 Verified Evidence。需要驗證的 Candidate 應回到 Playground Experiment / Evidence discipline。

---

## 8. Relationship with Structured State / Database

目前 Knowledge Source of Truth 仍以 Repository Markdown / metadata 為主；**不要因為有 Database 就把 Markdown 全部塞進 Database。**

但 Primary 應保留一個 Architecture Question：某些高度結構化、需要跨 Conversation 查詢、比較、排序、狀態追蹤或 relationship traversal 的 collaboration state，未來是否更適合使用 Supabase 等 structured durable store。

這可能包括 capability inventory、temporal markers、provider surfaces、revival conditions、research relationships 或其他尚未定義的 state。

目前只記錄這個方向，不預先決定 schema，也不啟動 migration。

> Markdown 擅長保存人類可讀的脈絡；Database 擅長保存可查詢的結構。不要逼其中任何一個假裝自己是另一個。

---

## 9. Core Principles

> **不要把今天 AI 的邊界，誤認成我們系統永久的邊界。**

> **服務商定義 Capability；我們定義它在協作中的意義。**

> **新的服務商 = 新的可能性，但不是新的義務。先看它能不能讓墨衡長出真正有用的新器官。**

> **讓一定會失憶的 Primary，每次醒來都更能重新定位、重新理解並參與這個實驗室與它接觸的世界。**
