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
6. **Short-term Work**：完成的工作標示 Completed；真正值得長期保存的 Context 應畢業到 Research Map / Catalog / Evidence，而不是永遠靠 TODO 墓碑保存。

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
→ decide whether to extend, compare, re-verify, or start a new Experiment
```

不要只搜尋「有沒有做過同名 Experiment」。真正要找的是：

> 是否已經有 Evidence 可以支援現在的 Question？

同一份 Evidence 可能早在另一個 Research Intent 下出生。知識可以重用，Hello World 不需要反覆投胎。