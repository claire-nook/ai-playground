# Experiment Record Template

> 這不是 Formal Specification Template。它只是讓未來 AI 在 Experiment 當下順手留下足夠 Context，避免事後對著 1000 個資料夾考古。
>
> 不需要每個 Experiment 都填成論文。能回答問題即可，沒內容的 section 可以刪掉。

```markdown
# Experiment <ID> — <Name>

- Date: YYYY-MM-DD
- Status: Candidate / In Progress / Completed / Verified / Partial / Superseded
- Primary Intent: <Research Map / Node，若尚無明確 Intent 可寫 Open Exploration>
- Supports: <其他 Research Intent，可複數>
- Tags: `tag-a`, `tag-b`
- Relationships:
  - `depends-on`: <link>
  - `extends`: <link>
  - `compares-with`: <link>

## Why this experiment exists｜為什麼做

用幾句話留下當時的 Context。

不要只寫「測試 XXX」。要讓半年後的人知道：前一個問題是什麼？為什麼這個 Experiment 是合理的下一步？為什麼不是另一個 Experiment？

## Question｜想回答什麼

這次真正要回答的 Technical Question。

如果 Question 太多，考慮拆 Experiment。一次把 CORS、JWT、RLS、Transaction、Business Rule 全塞進去，最後通常只會得到「某個東西壞了」這種高品質 Evidence。

## Scope / Isolation｜範圍與刻意排除

- Included:
- Excluded:
- Why excluded:

刻意排除的東西很重要。Hello World 之所以有價值，常常不是因為它做了什麼，而是因為它故意什麼都沒做。

## Environment｜環境

記錄會影響 Evidence 解讀的 Provider / Runtime / Browser / Version / Identity Context。

不要放 Secret、Token、Password 或不適合 Public Playground 的資料。

## Method / Artifact｜怎麼驗證

- Source:
- Workflow / Function / Page:
- Test path:

## Evidence｜實際觀察

清楚區分：

### AI Direct Evidence

### Provider / Tool Evidence

### Claire Environment Evidence

### Inference

沒有直接驗證的事情，不要混進 Verified Evidence。

## Result｜結果

一句到幾句回答原始 Question。

## Constraints / Pitfalls｜限制與踩坑

## What this unlocks｜它打開了什麼下一步

- 哪個 Research Map node 可以更新？
- 是否冒出新的 Candidate Branch？
- 是否支援其他 Intent，例如 `ipad-first`？

## Current Judgment｜目前判斷

Evidence 可以支持什麼；又還不能支持什麼。

不要把 Current Judgment 偷偷寫成祖訓。

## Knowledge Links｜知識連結

- Research Map:
- Evidence Index:
- Experiment Catalog:
- Related Experiments:
```

## After Experiment Checklist

完成或形成新 Evidence 後，順手檢查：

- Experiment Record 已更新。
- `knowledge/experiments.md` 已更新。
- `evidence/index.md` 已更新。
- Relevant Research Map 或 `open-exploration.md` 已更新。
- Tags / Links 沒有重複造同義字。
- `notes/short-term-work.md` 已更新工作狀態。
- 新 Evidence 若推翻舊 Judgment，已保留日期 / 條件 / `supersedes` 關係。

幾分鐘的小事，勝過半年後成立「Hello World 身世調查委員會」。