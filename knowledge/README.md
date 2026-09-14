# Playground Knowledge Base

AI Playground 的主要產出不是 Code，而是可以被重新理解、重新組合、重新判斷的工程經驗。

這個 Knowledge Base 保存的不只是「做完得到什麼」，也保存：

> 我們當時為什麼會問這個問題、為什麼設計這個 Experiment、它支援哪些 Research Intent，以及未來還有哪些 Branch 值得繼續走。

Playground 不是 Nook Works Technical Platform 的附屬測試區。Nook Works Platform 只是目前其中一個 Research Topic；未來可以存在完全無關、天馬行空，甚至一開始沒有明確 Intent 的探索。

---

## Knowledge Model｜知識模型

Playground 使用幾種不同的 Knowledge Object，各自只回答自己的問題：

| Object | 回答的問題 | 主要位置 |
| --- | --- | --- |
| Research Map | 為什麼研究？脈絡走到哪？還有哪些 Branch？ | `knowledge/maps/` |
| Open Exploration | 尚未形成明確 Research Intent 的探索有哪些？ | `knowledge/open-exploration.md` |
| Experiment Catalog | 我們曾經做過哪些 Experiment，而且當時為什麼做？ | `knowledge/experiments.md` |
| Experiment Record | 實際做了什麼？怎麼驗證？ | `experiments/**/README.md` |
| Evidence Index | 做完後我們實際知道了什麼？ | `evidence/index.md` |
| Implementation Guide | 未來要重做這個已驗證 pattern 時，怎麼正確實作？ | `knowledge/implementation/` |
| Short-term Work | 現在正在做什麼？ | `notes/short-term-work.md` |
| Technical Decision | Evidence 足夠後，正式系統最後選擇什麼？ | 正式 Repository，不由 Playground 自動決定 |

核心關係：

```text
Research Context / Question
        ↓
Candidate Branch
        ↓
Experiment
        ↓
Evidence
        ↓
Current Judgment
        ↓
Technical Decision Candidate
```

`Evidence` 不等於 `Decision`。Experiment 成功只代表在特定時間、環境與條件下取得 Evidence，不應自動升格為永久 Platform Rule。

`Implementation Guide` 也不等於每個 Experiment 的必備附件。只有當 Source + Evidence 不足以讓未來正確、低成本地重建 implementation 時才建立，避免把 Knowledge Base 養成文件農場。

---

## Research Map｜研究地圖

Research Map 是有主題的研究脈絡，不是所有 Experiment 的總目錄。

一張 Map 應該能回答：

- 這個 Research Topic 為什麼存在。
- 目前正在回答哪些 Technical Question。
- Question 下有哪些合理 Candidate / Branch。
- 哪些 Branch 已有 Experiment / Evidence。
- 哪些 Branch 已辨識但尚未驗證。
- 哪些問題目前刻意不研究。

Research Map 的 Progress 是 **Research Coverage**，不是假裝精準的百分比。

建議 Status：

- `Verified`：已有直接 Evidence 支持。
- `Partial`：已有部分 Evidence，但 Question 尚未完整回答。
- `Candidate`：已辨識為合理研究 Branch，尚未實驗。
- `Open`：問題存在，但 Candidate / Scope 尚未收斂。
- `Superseded`：已有更新 Evidence 或新的研究路徑取代，保留歷史關係。

同一個 Experiment 可以被多張 Research Map 引用，不需要複製 Experiment 或 Evidence。

---

## Experiment Catalog｜實驗目錄

[`knowledge/experiments.md`](experiments.md) 保存所有值得長期記得的 Experiment 與 Candidate Experiment 的短摘要。

它不是 Evidence Index 的另一份副本：

- Experiment Catalog 問：「**為什麼當時要做？它打開了什麼下一步？**」
- Evidence Index 問：「**做完之後我們實際知道了什麼？**」

Catalog 應維持短小，只放 Intent、Status、Tags、Links、Why it existed、What it unlocked。完整 Method / Evidence 留在 Experiment Record。

---

## Open Exploration｜開放探索

不是每個 Experiment 出生時都必須先有 Strategic Research Objective。

如果只是「這個好像值得撞撞看」，可以先放在 `knowledge/open-exploration.md`，用少量分類與 Tags 保存可檢索性。

當散落的 Exploration 開始共同回答某個問題時，可以進行：

```text
Explore
→ Tag / Link
→ Cluster
→ Refine Research Question
→ Promote to Research Map
```

Promote 不代表搬動或複製既有 Experiment。新的 Research Map 只引用既有 Experiment / Evidence。

這讓 Playground 可以先自由長草，等草真的長成一片森林再畫地圖，而不是每玩一個 Hello World 都先成立研究院。

---

## Links｜關係連結

Experiment / Evidence 可以支援多種 Intent，因此應優先使用 Link，而不是複製內容。

常用關係語意：

- `supports`：這份 Evidence 支援某個 Research Question / Map。
- `depends-on`：此 Experiment 建立在另一項已驗證 Capability 上。
- `compares-with`：兩個 Experiment / Candidate 用於同一 Responsibility 的比較。
- `extends`：後續 Experiment 延伸前一個 Experiment 的 Scope。
- `supersedes`：新 Evidence 取代舊 Evidence 的目前判斷。
- `related`：存在直接技術關係，但不適合以上語意。

Link 應指向既有文件或明確 Research Map 節點；不要為了看起來很 Graph 就把所有東西互相牽線。

---

## Tags｜檢索標籤

Tags 是 Retrieval Metadata，不負責保存完整脈絡。

優先使用少量、穩定、可重用的英文 Tag。不要把同義字全部養成不同物種。

建議 Tag families：

### Intent

- `nook-platform`
- `ipad-first`
- `ai-engineering`

### Capability

- `authentication`
- `authorization`
- `data-api`
- `read-model`
- `custom-api`
- `rpc`
- `deployment`
- `remote-execution`
- `batch-runtime`

### Provider / Runtime

- `supabase`
- `netlify`
- `github-actions`
- `browser`
- `postgresql`

### Concern

- `security`
- `credential`
- `rls`
- `cors`
- `session`
- `transaction`
- `observability`

Status 不必重複當 Tag；使用文件中的 `Status` 欄位即可。

新增 Tag 前先搜尋既有 Tag。若只是同義字、大小寫或語氣差異，沿用既有 Tag。

例如不要同時養出：`ipad`、`ipadOS`、`ipad-development`、`no-mac`、`claire-does-not-want-a-mac-mini`。最後那個雖然歷史意義濃厚，但 Knowledge Retrieval 不需要替購物信仰立碑。

---

## Knowledge Capture Protocol｜每次 Experiment 順手完成

有意義的 Experiment 完成或形成新 Evidence 時，未來 AI 應順手完成以下維護，不要累積到第 1000 個 Experiment 才進行數位考古：

1. **Experiment Record**：更新 Question / Purpose、Scope、Method、Evidence、Constraint、Current Judgment。
2. **Experiment Catalog**：更新 Why it existed / What it unlocked / Status / Tags / Links。
3. **Evidence Index**：加入可重用的 Result / Evidence / Limitation，不複製整份 Experiment Record。
4. **Research Map**：更新相關節點 Status；若實驗暴露新的合理 Candidate Branch，留下 Branch，即使尚未實驗。
5. **Links / Tags**：補上跨 Research Intent 可重用的關係與少量穩定 Tags。
6. **Implementation Knowledge Check**：判斷 Source + Evidence 是否已足以讓未來 AI 正確重建 implementation；若不足，必須在本次實驗 context 尚存在時建立或更新 `knowledge/implementation/` Guide，不得把補寫工作推給未來對話。
7. **Short-term Work**：完成的工作標示 Completed；真正值得長期保存的 Context 應畢業到 Research Map / Catalog / Evidence / Implementation Guide，而不是永遠靠 TODO 墓碑保存。

### Implementation Knowledge Check｜不要讓未來自己考古

每個有實作產出的 Experiment 在 completion / stable checkpoint 時，都必須問一次：

> 如果目前 conversation context 立刻消失，未來 AI 只靠 Repository，能否正確理解「怎麼做、為什麼這樣做、哪些設定不能漏、哪些實驗寫法不應照抄」？

若答案是 Yes，而且 Source + Evidence 已清楚自解釋，就**不要**為了形式建立 Guide。

若出現以下任一訊號，通常應立即建立或更新 Implementation Guide：

- implementation 需要多個元件以特定方式串接；
- 有 Dashboard / Provider / Credential / Deployment 等 source code 看不到的必要設定；
- 曾走過合理但錯誤、且未來很容易重踩的 implementation path；
- 存在重要 Security / Authentication / Authorization boundary；
- 「能跑」與「建議正式採用的做法」不同；
- test source 含有純實驗 workaround，正式 implementation 不應照抄；
- pattern 很可能在正式系統或後續 Experiment 重複使用；
- 只看最終成功 source 無法理解為什麼必須這樣實作。

Guide 的責任是保存 reusable implementation knowledge，不是複製整份 Experiment Record 或貼一份 source code。至少應說明必要元件、關鍵設定、責任邊界、已知陷阱、正式實作不可照抄的 test-only 部分，以及對應 Source / Evidence 路徑。

**Timing Rule：**Implementation Guide 必須在 Experiment context 尚新鮮時完成。若重要 implementation knowledge 已在中途形成，可先於 checkpoint 寫入；Experiment completion 時再做一次 final check。不得以「未來需要時再補」作為正常策略，因為未來 AI 能重新讀 code，卻未必能重建當時未寫下來的 provider state、失敗脈絡與設計理由。

### Checkpoint Capture｜長實驗不要等結案才寫

Knowledge Capture 不必等整個 Experiment `Completed` 才發生。當長時間研究已形成**不會因下一步成功或失敗而失效的重要 Evidence、Failure Diagnosis、Operational Lesson、Implementation Trap 或 Technical Judgment**，應立即建立 checkpoint，把它寫回 Experiment Record / Evidence Index / Implementation Guide 等適當位置。

典型時機包括：

- 已驗證一段 multi-stage path，但後續 stage 尚待實驗。
- failure 已被定位，而且 failure 本身揭露可重用的 architecture / operations lesson。
- Human Environment Evidence 已完成，但下一個 implementation / deployment 尚在進行。
- 已確認 provider-specific 設定或容易重踩的 implementation trap。
- 後續工作需交給另一 Agent、等待 provider runtime、人工操作或其他 asynchronous dependency。
- 對話 context 已累積大量不可由 repository source 重新推導的 observation / reasoning。

Checkpoint 不是把未完成實驗假裝 Completed，也不是每五分鐘寫流水帳。它只保存**已成立且值得跨 context 保留**的知識，並明確標示尚未驗證的下一段。

後續 Evidence 若改變 Judgment，應追加 / supersede，而不是把舊 failure 改寫成從未發生。如此即使 AI conversation context 被截斷、Agent Task 換代或 provider 操作中斷，Git repository 仍保存已取得的研究資產。畢竟把唯一一份工程記憶寄放在 context window，跟把唯一備份放在同一顆硬碟差不多有創意。

建立新 Experiment 時可以從 [`experiment-template.md`](experiment-template.md) 開始，但 Template 是提醒，不是官僚表單。沒有內容的 section 可以刪掉。

如果 Experiment 沒有明確 Research Intent，就更新 Open Exploration；未來形成 Cluster 時再 Promote。

如果新的 Evidence 與舊結論衝突，不要偷偷改寫歷史。保留日期、條件與 `supersedes` 關係，讓未來知道 Judgment 為什麼改變。

---

## Language Convention｜語言約定

Knowledge Base 需要同時服務 Claire、未來 AI，以及幻想中可能真的會出現的外國友人。

核心原則：

> **Traditional Chinese for reasoning and explanation; standard English IT terminology stays in English. Explain unfamiliar terms instead of translating them.**

具體規則：

- Research Context、Reasoning、Observation、Judgment、Constraint 等敘事以繁體中文為主。
- Standard IT terms 保留業界常用英文，例如 `clone`, `commit`, `branch`, `Repo`, `Workflow`, `Runner`, `Runtime`, `Deployment`, `Credential`, `Session`, `Authentication`, `Authorization`, `RLS`, `API`, `Endpoint`。
- 第一次遇到 Claire 可能不熟悉的 Concept，可以用中文**解釋**，不要硬造中文術語。例如：`Credential`：系統用來證明呼叫方具有某種存取權限的資訊。
- 不需要把 `clone` 翻成「拓製」之類看起來很有文化、實際上讓讀者重新學一次 Git 的詞。
- Title / Heading / Tags / Status / Provider / Capability / Link Relationship 優先使用穩定英文 Technical Vocabulary，必要時用 `English｜繁體中文` 雙標題協助閱讀。
- 不做逐段中英雙語翻譯。Knowledge Base 是工程知識，不是聯合國逐字稿。

---

## Current Knowledge Entry Points｜目前入口

- [`Experiment Catalog`](experiments.md)：快速看曾經做過什麼、為什麼做、打開了什麼下一步。
- [`Nook Technical Platform Research`](maps/nook-technical-platform.md)：沿著 Nook Works Technical Platform 的 Responsibility / Capability 節點逐步取得實作 Evidence。
- [`Open Exploration`](open-exploration.md)：尚未形成獨立 Research Map，或可支援多種未來 Intent 的探索線索。
- [`Implementation Guides`](implementation/README.md)：保存不能只靠 Source + Evidence 安全重建的 reusable implementation knowledge。
- [`Experiment Record Template`](experiment-template.md)：新 Experiment 的輕量 Knowledge Capture 提醒。
- [`Evidence Index`](../evidence/index.md)：集中檢索已形成的 Evidence。

未來如果 `ipad-first`、`ai-engineering` 或其他 Cluster 累積出明確 Research Question，再 Promote 成自己的 Research Map。不要為了分類完整而預先建立一堆空地圖。

---

## Reading Order｜給未來 AI

進行新 Experiment 前：

```text
README.md
→ knowledge/README.md
→ knowledge/experiments.md
→ relevant Research Map / Open Exploration
→ evidence/index.md
→ relevant Experiment Record
→ relevant Implementation Guide (if one exists)
→ decide whether to extend, compare, re-verify, or create a new Experiment
```

Experiment 結束或形成 stable checkpoint 時，依 Knowledge Capture Protocol 完成保存，並執行 Implementation Knowledge Check。