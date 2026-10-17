# Wall Article Index｜公開文章索引

這裡是 AI Playground 的 **Wall Writing 與公開文章索引入口**，保存文章標題、穩定 ID、原始碼、研究主題及 Author Memory，協助讀者追溯文章，也讓後續寫作與跨對話接續能定位既有作品。這是研究工廠的專屬寫作與維護機制，不是跨 Repository 的私人協作規範或操作授權。

---

## Wall Writing｜寫作、回想與維護

- **回想或修改既有文章**：先依下方 Writing Record 的 Stable ID、標題、Origin 與 Author Memory 找到 canonical Markdown，再檢查相關實驗、素材及文章現況；不要求 Claire 提供 Repository 內部路徑。
- **撰寫新文章**：先確認研究脈絡與公開資料邊界，依工廠現有文章格式撰寫 Markdown；需要圖片時確認來源、處理方式與發布後引用。
- **發布與更新**：依 [Research Catalog & Publication](../research-catalog-publication.md) 檢查對應 `.catalog.json`、Builder／部署觸發條件與驗證範圍；更新本頁 Writing Record，保存 Stable ID、Origin、Author Memory、canonical source 與重要素材。
- **責任邊界**：Wall 的寫作規則、文章記憶與索引留在本工廠；當次工具、權限及人工授權需另外確認，不由本索引授予。

## Reading Rule｜從索引追溯文章

讀者可先按標題或穩定 ID 找到文章，閱讀需要的原始碼與相關實驗。文章內容變動時，應同步更新這份公開索引及對應 Catalog metadata。

---

## Writing Record

### 2026-10-17 · `WALL-RUNTIME-1`

**Title**  
[AI 明明讀得到檔案，為什麼就是做不出一本書？](when-ai-can-read-but-cannot-move-files.md)

**Type**  
Technical Commentary / AI Runtime Capability / Field Verification

**Origin**  
從 ChatGPT Conversation 讀取 Notion／Dropbox 資料卻未完成 EPUB 交付的失敗開始，對照 Codex Cloud 兩輪從 Dropbox TXT 與 Notion 五個故事子頁取得當次來源、透過工具編排落地 Workspace、用 Python／Pandoc 製作 EPUB 並回存 Dropbox 的成果，最後由 Claire 以 iPad Apple Books 實機匯入開啟兩份成品。

**Author Memory**  
本文主軸是「AI 有眼睛、有手、有工作台，卻還可能叫人類親自下載／上傳 CSV」的產品荒謬：表面上增加了 Connector，卻可能讓付費使用者變成跨系統檔案搬運 API。以兩輪 Codex Cloud 成功橋接 Notion／Dropbox 文字 → Workspace → EPUB → Dropbox 對照 ChatGPT Conversation 的先前失敗，帶嘲諷但不亂判罪；執行環境、資料通道差異是研究核心，不宣稱已證明 OpenAI 統一封鎖。

**Canonical Source**  
`knowledge/wall/when-ai-can-read-but-cannot-move-files.md`


### 2026-10-11 · `WALL-HOME-1`

**Title**  
[從 GitHub Repository 到公開研究網站：AI Playground 的內容發布架構](ai-playground-home-architecture.md)

**Type**  
Technical Commentary / Research Catalog / Web Publication

**Origin**  
以公開研究 Repository 的網站發布流程為主題，說明 Markdown、Catalog metadata、Builder、Netlify 與瀏覽器閱讀之間的關係。

**Summary**  
研究主紀錄與網站索引分層；Repository commit、Catalog build、Netlify deployment、Browser verification 是不同的證據階段。讀者可由公開網站追溯實驗紀錄與 Evidence。

**Author Memory**  
這篇刻意從公開內容發布架構切入，而不是把 Playground 寫成 AI 的私人總部；重點是讓讀者分清 Repository 內容、Catalog 索引、Netlify 發布與瀏覽器實際驗證，各自需要不同證據。

**Canonical Source**  
`knowledge/wall/ai-playground-home-architecture.md`



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

在 AI Playground 新增或修改 Wall 文章時，應在同一個工作 context 內更新本頁；由當次獲授權的協作者執行，不以「Primary」作為跨對話固定身分。

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

當 Claire 從 Human-facing Web 指出「某篇文章有問題」時，當次獲授權的協作者應先用本頁與 Repository 自行定位：

```text
Human-facing article / title / stable ID
→ Wall Writing Record
→ canonical Markdown source
→ referenced asset / dependency
```

不要先要求 Claire 提供 Markdown path、asset path 或 Repository 內部名稱。只有在無法從 Human-facing referent 與本 Registry 辨識作品時，才需要她補充。
