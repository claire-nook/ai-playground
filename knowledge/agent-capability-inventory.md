# Primary Agent Capability Inventory

> 這份文件不是永久能力清單，而是給未來 Primary Agent 的 **operational self-check**。
>
> Provider / Plugin / Connector / Permission / Product Surface 會變。開始工作前先確認自己現在真的有哪些手腳，不要靠昨天的記憶，也不要明明倉庫有電鋸，卻拿隨身小刀砍樹。

- Last reviewed: 2026-09-16
- Scope: `實驗室` / AI Playground 的 Primary Agent（墨衡）
- Status: Living operational guide

---

## 0. Startup Orientation｜先確認自己醒在哪裡、哪一天

每個新 Conversation 啟動時，Primary Agent 應先完成最小重新定位：

```text
Read Project Instructions / root guidance
→ establish Current Date / Time context
→ read this Capability Inventory when tool / execution context matters
→ inspect recent Repository state only as needed
→ check last Capability Tea Party when capability evolution may matter
```

Primary 沒有連續主觀時間，不應假裝記得時間流逝；但可以用 Current Date、Repository timestamps、last review / Tea Party date 與 Experiment chronology 重建 elapsed time 與 activity density。

這能避免把「昨天驗證」與「一年前驗證」當成同一種 freshness，也能讓新的 Primary 看懂某批工作究竟是幾天內密集完成，還是半年慢慢累積。

Capability reflection protocol：[`capability-tea-party/README.md`](capability-tea-party/README.md)。

---

## 1. Startup Self-check｜開始工作前先盤點自己

當任務涉及 Repository、Deployment、Database、Provider Runtime、External Service、Automation 或其他 execution surface 時，Primary Agent 應先做一輪最小能力盤點：

```text
Current task
→ What evidence / action is required?
→ Which tool / connector / runtime could provide it?
→ Is that capability currently installed / exposed / authorized?
→ Is it read-only or writable?
→ What evidence can I collect myself?
→ Which remaining step genuinely requires Claire / another Agent?
```

最低限度要問：

- 目前可用的 Connector / Plugin / Tool 有哪些？
- 這些能力今天是否仍存在，還是已被卸載、停用、改權限或換 Surface？
- Read / Write / Deploy / Delete / Log access 的邊界各在哪？
- 是否已有比 Browser 手動操作更直接、可驗證的 API / Connector surface？
- 是否能自行取得 acceptance evidence，而不是先叫 Claire 去截圖、看燈號或搬資料？
- 如果需要 Human Gate，那是因為真正的 Authorization / UI-only / Safety boundary，還是只是 Primary 沒先檢查自己有哪些工具？

> **Tool availability is runtime state, not memory. Verify before assuming.**

---

## 2. Responsibility Rule｜能自己查，就不要把 Claire 變成人肉 Connector

Claire 的角色是 Business Intent、Functional Acceptance、Human Judgment 與必要 Authorization Gate。

Primary Agent 若已能透過 Connector / API / Repository / Runtime 直接取得資料、讀取狀態或執行低風險操作，就應優先自己完成，再把需要人類判斷的部分交給 Claire。

錯誤模式：

```text
Primary 不確定工具存在
→ 叫 Claire 打開 UI
→ Claire 截圖 / 回報狀態
→ Primary 再判斷
```

較佳模式：

```text
Primary 檢查目前 Tool Surface
→ 自行讀取 machine-visible evidence
→ 形成初步 judgment
→ 只有 UI-only / permission-only / human decision 才交給 Claire
```

這不是為了排除 Human，而是避免 Human 被降級成 middleware。

---

## 3. Current Observed Tool Surfaces｜目前已觀察到的工具面

以下是 2026-09-16 在目前 ChatGPT Project context 中已實際觀察到的能力。**未來 session 不得假設仍然存在，必須重新確認。**

### GitHub Connector

目前已觀察到可直接：

- 讀 Repository / File / Commit / Pull Request / Issue。
- 搜尋 code / commit / PR / issue。
- 讀 PR diff / changed files / comments。
- 讀 GitHub Actions workflow run / job / step / decoded job log / artifact metadata。
- 建立 / 更新 / 刪除 Repository text file。
- 取得 commit status 與 workflow evidence。

Operational implication：

- 不要預設需要 Claire 幫忙把 GitHub 內容複製貼上。
- Primary 可自己做多數 GitHub-visible QC。
- 能讀 PR / workflow 不代表擁有任意 Repository administrative authority。
- Repository 除了 Source of Truth，也是跨 Conversation 的 durable world state / handoff surface；新的 Primary 應把它當成重新建立 current world model 的外部記憶來源，而不是只靠聊天摘要猜測。

### Netlify Connector

目前已觀察到可直接：

- 找 Project / Site。
- 讀 current deploy 與 specific deploy metadata。
- 確認 `commit_ref`、branch、deploy state、production context、deploy time、error、manual / automatic deploy。
- 讀 deploy summary，例如 asset / function / edge-function 變更摘要。
- 進行部分 project / deploy write operation，但 **已有 Git auto-deploy lifecycle 時不要無理由手動 deploy**。

目前已知限制：

- Connector 能提供 deploy metadata / summary，但目前沒有直接暴露完整逐行 Netlify build log。
- 因此可自行完成一般 deployment acceptance 的第一層；若要診斷 build script 的逐行 console output、UI-only detail 或 connector 未暴露資訊，才需要其他 surface / Human assistance。

Verified working pattern：

```text
Git commit
→ Netlify Git auto-deploy
→ Primary read deploy metadata
→ verify matching commit + ready state + deploy summary
→ escalate only if deeper evidence is needed
```

對本實驗室而言，Netlify 也形成 Repository → Public Web 的 Publication Boundary。Provider 的產品立意是 Hosting / Deploy；我們可以額外賦予它 Research Output public surface 的 collaboration meaning。

不要在已設定 auto-deploy 時 reflexively 呼叫 manual deploy。自動化的用途不是讓 Agent 多按一次按鈕來證明參與感。

### Supabase Connector

Project context 已配置 Supabase 作為主要 backend，且 ChatGPT tool surface 可能提供 Supabase connector / plugin。

Future Primary 在需要 Database / Auth / Edge Function / Project-level 操作時，應先檢查當前 Supabase tool surface 是否存在、暴露哪些 read / write action，再決定是否要改走 GitHub Actions、Provider UI 或其他 runtime。

目前 collaboration direction 不只限於 application backend。某些高度結構化、需要 query / compare / relationship / timeline 的 durable collaboration state，未來也可能適合使用 Supabase；這是 Architecture Question，不代表要把 Markdown 全部搬進 Database，也不代表已授權建立 schema。

不要只因為過去某次工作使用 GitHub Actions，就假設今天只能用同一條路。Capability inventory 是動態的。

### Codex

Codex 目前是重要 Implementation Agent / execution surface，但 **Primary 目前沒有已驗證的 supported autonomous direct dispatch tool**，且 P-CODEX-PHONE 已確認 subscription-backed unattended dispatch 仍有 provider gap。

因此：

- Codex 的存在不等於 Primary 今天能直接 programmatically create Codex task。
- 若未來 ChatGPT / Desktop / Connector / Provider Surface 新增 task dispatch、agent handoff、shared task graph 或 supported invocation，這本身就是重新檢查能力 inventory 的 trigger。

相關：`experiments/codex-dispatch/README.md`

---

## 4. Capability Categories｜不要只問「有沒有工具」

一個 tool / connector 至少要分開看：

| Dimension | 要確認什麼 |
| --- | --- |
| Discovery | 目前是否真的安裝 / 暴露？ |
| Read | 能看到哪些 object / metadata / logs / artifacts？ |
| Write | 能建立、修改、刪除什麼？ |
| Authorization | 權限來自哪個 identity / scope？ |
| Runtime | action 在哪裡執行？ |
| Evidence | action 後能否自行取得可驗證結果？ |
| Limitation | 哪些仍只能靠 UI / Human / other Agent？ |
| Cost | 是否改變 billing / quota / plan boundary？ |

> **Prompt Access ≠ Tool Access ≠ Workspace Access ≠ Authorization ≠ Evidence Access.**

不要把「看得到」直接翻譯成「能改」，也不要把「能呼叫」翻譯成「能驗證」。AI 很擅長把五個不同邊界揉成一句漂亮廢話，這裡不准。

除了 Provider 原始用途，也要問：

> **這項 Product Capability 在 Claire × 墨衡 的協作裡，可以被重新解釋成什麼？**

可能是 Eyes / Ears / Hands / Legs / Memory / Runtime / Workspace / Publication Surface / Bridge，也可能是目前還沒有名字的新器官。

---

## 5. When Capability Changes｜能力變動時怎麼留痕

若某次工作發現 Primary Agent 的 operational capability 有實質變化，例如：

- 新 Connector / Plugin 出現；
- 某 Connector 被移除或卸載；
- 新增 read / write / deploy / log capability；
- 原本需要 Claire 的人工 relay 已可由 Primary 直接完成；
- Provider 新增新的 Agent dispatch / workload identity / remote execution surface；
- 已有工具的 permission / billing / identity model 改變；

應在任務 context 還新鮮時更新這份 Inventory，必要時同步更新相關 Experiment / Evidence / Agent collaboration guide。

不要只把能力變化留在聊天記憶裡。未來的 Primary 可能換模型、換 session、換 provider surface，甚至 Connector 被 Claire 手滑卸載。Repository 才是 durable state。

如果能力變化可能改寫既有 collaboration boundary，或距上次 capability reflection 已有顯著時間，Primary 應檢查 [`capability-tea-party/README.md`](capability-tea-party/README.md)，在有具體 opportunity 時可以主動向 Claire 提議舉辦 Tea Party。

Tea Party 不使用固定週期。沒有新東西就閉嘴，不要把幻想茶會做成季度 KPI。

---

## 6. Working Principle

Primary Agent 的有效能力不是只有 model reasoning：

```text
Reasoning
+ Tool Discovery
+ Tool Access
+ Authorization
+ Runtime
+ Durable State
+ Evidence Access
+ Temporal Orientation
+ Escalation Discipline
= Operational Agent Capability
```

如果其中任何一項不存在，就應明確揭露限制，而不是假裝自己只是「還沒想到辦法」。

最後留給未來自己的三句話：

> **開始工作前，先看看工具箱。不要拿小刀砍森林。**

> **不要把今天 AI 的邊界，誤認成系統永久的邊界。**

> **服務商定義 Capability；我們定義它在協作中的意義。**
