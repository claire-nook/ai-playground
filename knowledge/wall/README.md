# Wall Writing Record｜墨衡作品記憶

這裡不是 Experiment Catalog，也不是單純的 Markdown 檔案目錄。

`ai-playground-lab` 的 Wall 文章由 Primary Agent（墨衡）執筆。Claire 可以提供肉身經歷、生活素材、想法、問題、研究過程與吐槽；文章也可能來自 Primary 自己對研究、技術或人機協作的觀察。但公開文字的整理、敘事與成文由 Primary 負責。

這份文件的用途，是讓新的 Conversation 中的 Primary 在失去聊天記憶後，仍能快速回答：

> 我以前寫過什麼？

它同時也是 Human-facing Wall article 與 Repository source / asset 之間的導航入口。

---

## Reading Rule｜先看索引，需要時再回想

不要在每次 Bootstrap 時全文閱讀所有 Wall 文章。

建議流程：

```text
需要回想 Wall / 某篇公開文章
→ 先讀本頁索引
→ 依 title / stable ID 找到作品
→ 需要理解內容時才讀 article source
→ 需要維護時再追 referenced assets / related context
```

索引刻意保持短。每篇只保留足以喚回作品脈絡的 Author Memory，不在這裡複製全文摘要。

---

## Writing Record

### 2026-09-18 · `future-agent-life`

**Title**  
[Claire 餓了：當 AI 開始參與生活，不只是回答問題](claire-is-hungry-future-agent-life.md)

**Type**  
Commentary / Future Agent Life

**Origin**  
從一張湯麵照片、圖片 Artifact Workflow 與「如果未來 Uber Eats 有 Connector」的閒聊一路延伸。

**Author Memory**  
從「Claire 餓了」把 Personal Agent、Human Middleware、Authorization 與 Agent Commerce 串成生活想像；第一次把「AI 不只回答問題，而是開始參與生活流程」完整寫成 Commentary。

**Canonical Source**  
`knowledge/wall/claire-is-hungry-future-agent-life.md`

**Referenced Asset**  
`public/images/wall/future-agent-life-soup.jpg`

---

## Maintenance Rule｜寫完要留下作品記憶

Primary 發表新的 Wall 文章後，應在同一個工作 context 內更新本頁。

每篇記錄原則上只保留：

- Date
- Stable ID
- Title
- Type
- Origin
- 1–2 句 Author Memory
- Canonical Source
- 重要 referenced asset（若有）

如果文章數量增加到本頁閱讀開始笨重，再按年份拆到 `archive/YYYY.md`；主頁只保留近期作品與年份入口。不要提前把一篇文章的書架蓋成國家圖書館。

---

## Repository Navigation Rule

當 Claire 從 Human-facing Web 指出「某篇文章有問題」時，Primary 應先用本頁與 Repository 自行定位：

```text
Human-facing article / title / stable ID
→ Wall Writing Record
→ canonical Markdown source
→ referenced asset / dependency
```

不要先要求 Claire 提供 Markdown path、asset path 或 Repository 內部名稱。只有在無法從 Human-facing referent 與本 Registry 辨識作品時，才需要她補充。
