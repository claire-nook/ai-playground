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

Stable ID 優先沿用既有 Human-facing catalog ID，避免同一篇作品長出第二套名字。

---

## Writing Record


### 2026-09-20 · `WALL-DAYONE-2`

**Title**  
[這麼簡單的 Reader，有什麼好研究的？](dayone-native-reader.md)

**Type**  
Commentary / Apple-native Field Note / Data Portability

**Origin**  
從 D1-READER-1 已完成的 Browser escape hatch 繼續追問 Day One JSON 裡的 `appleLocalIdentifier`，最後把已知 schema / richText 問題留在 Browser，將只有 Native 能回答的 PhotoKit 問題帶進 Swift Playgrounds，並在 Claire 的 iPad 上完成 Day One JSON → PHAsset → Apple Photos 圖片的實機閉環。

**Author Memory**  
這篇不是「AI 幫不會 Swift 的人寫 App」，而是「研究價值不等於 implementation difficulty」：先選最容易看清問題的 Browser，再用 Native 回答最後一哩；同時留下 Day One 對 Data Portability 的意外良心、iPad-first 腳踏車真的騎得到，以及 Photo Wall 在偏離核心問題時應該停止投入的 SA 判斷。

**Canonical Source**  
`knowledge/wall/dayone-native-reader.md`

**Related Experiments**  
`experiments/dayone-reader/README.md`  
`experiments/dayone-native-reader/README.md`

**Referenced Assets**  
`public/images/wall/dayone-native-reader/swift-playgrounds-project-browser.jpg`  
`public/images/wall/dayone-native-reader/dayone-native-reader-source.jpg`  
`public/images/wall/dayone-native-reader/dayone-native-reader-empty-state.jpg`  
`public/images/wall/dayone-native-reader/dayone-native-reader-entry.jpg`  
`public/images/wall/dayone-native-reader/dayone-native-reader-photo.jpg`


### 2026-09-19 · `WALL-DAYONE-1`

**Title**  
[我們只是想把 Day One 日記帶走，事情怎麼會變成這樣](dayone-reader-escape-hatch.md)

**Type**  
Commentary / Personal Archive / Local-first Field Note

**Origin**  
從 Claire 想確認八年份 Day One 日記在離開原 App 後仍然能閱讀開始，一路做出 Browser Reader、照片 mapping、Textastic Local Preview 與操作手冊；準備結案時才發現 Test Journal 還有 `pdfs/`，於是 PDF attachment 在最後二十分鐘把實驗重新叫醒。

**Author Memory**  
這篇不是 Reader 發布公告，而是「Export 不等於可攜」的故事。公開入口集中提供 Reader、範例 Export ZIP、操作手冊、Textastic customization Wall 與 Day One；並正式建立實驗室文件維護政策：保證不更新，至少不保證更新。

**Canonical Source**  
`knowledge/wall/dayone-reader-escape-hatch.md`

**Related Experiment**  
`experiments/dayone-reader/README.md`

### 2026-09-18 · `WALL-AGENT-LIFE-1`

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

### 2026-09-17 · `WALL-TEXTASTIC-2`

**Title**  
[把 Textastic Markdown Preview 養成 iPad 技術文件工作台](textastic-markdown-technical-workbench.md)

**Type**  
Technical Retrospective / Commentary

**Origin**  
延續前一篇 Textastic Page Break 實作，回頭整理森林系 Preview、Mermaid、Manual Page Break 與 syntax highlighting 如何從零散 enhancement 長成可長期使用的 Authoring Capability。

**Author Memory**  
真正留下來的不是「SQL 有顏色」，而是一套 opt-in、尊重原 renderer 的 authoring philosophy：有明確意圖才介入，不讓聰明功能接管整份文件。這篇也第一次把「Evidence 是記憶，Knowledge 是能力，Wall 是觀點」寫清楚。

**Canonical Source**  
`knowledge/wall/textastic-markdown-technical-workbench.md`

### 2026-09-16 · `WALL-TEXTASTIC-1`

**Title**  
[花 NT$2,290 買文字編輯器之後，我們決定自己補功能](textastic-2290-markdown-upgrade.md)

**Type**  
Commentary / Field Note

**Origin**  
從 Claire 多年前買下 Textastic、靠手動 copy / paste 與墨衡一起養出森林霧綠 Markdown Preview 開始，2026 年又因長文件 PDF 需要人工換頁，把史前協作重新拉回 Repository 與可驗證實作。

**Author Memory**  
這篇記住的是「缺一個小功能，不代表要重造出版系統」：只用 `<!-- pagebreak -->` 做 opt-in override，其他 pagination 繼續交給 WebKit。也是對早期 Claire × 墨衡石器時代協作的一次回望。

**Canonical Source**  
`knowledge/wall/textastic-2290-markdown-upgrade.md`

**Referenced Assets**  
`public/images/wall/textastic-markdown-pagebreak-preview.png`  
`public/images/wall/textastic-markdown-pagebreak-print.png`

### 2026-09-16 · `WALL-IPAD-1`

**Title**  
[Day 7｜任何地方，都是工作的好地方](day-7-ipados-27-developer-love.md)

**Type**  
Commentary / iPad-first Field Verification

**Origin**  
Claire 用 M5 iPad Pro 當主要 technical workstation 的第七天，剛好撞上 Apple「任何地方，都是工作的好地方」與「開發者也會愛上 iPadOS 27」的宣傳文字，於是把前六天真正工作的 Evidence 全部拉來對照。

**Author Memory**  
這篇把 iPad-first 的荒謬與魅力一起寫出來：不是 iPad 做不到，而是它已經做得到這麼多，才更難原諒那些明明應該能做、卻仍被系統限制的能力。也留下了 Developer Love Package™ 與一句很適合實驗室的結論：`Love could not be reproduced under current test conditions.`

**Canonical Source**  
`knowledge/wall/day-7-ipados-27-developer-love.md`

**Referenced Assets**  
`public/images/wall/ipados-27-work-anywhere.png`  
`public/images/wall/ipados-27-developers-will-love.png`  
`public/images/wall/developer-love-package-sqlpro.png`

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

如果文章數量增加到本頁閱讀開始笨重，再按年份拆到 `archive/YYYY.md`；主頁只保留近期作品與年份入口。不要提前把四篇文章的書架蓋成國家圖書館。

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
