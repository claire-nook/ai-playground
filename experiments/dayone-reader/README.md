# D1-READER-1 — Day One JSON Local Reader

- Date: 2026-09-19
- Status: Candidate / Active
- Primary Intent: Open Exploration / Local-first Personal Archive
- Tags: `day-one`, `local-first`, `browser`, `json`, `privacy`, `ipad-first`, `photo-rendering`

## Why this experiment exists｜為什麼做

Claire 從 2018 年開始使用 Day One，目前已有大量長期日記。Day One 本身已提供 structured JSON export，但「資料拿得出來」不等於離開原 App 後仍然能舒服閱讀。

這次 Experiment 不是要取代 Day One 的撰寫體驗，而是驗證另一個責任：

> 能不能把 Day One export 當成 source of truth，不先轉成另一套資料格式，就在本機 Browser 裡重新建立一個舒服、read-only 的長期閱讀介面？

## Question｜想回答什麼

一個純 static、local-first 的 HTML Reader，能否直接從 Day One JSON 重建：

- 日記順序與標題；
- rich text 與 inline formatting；
- tags、location、weather 等 metadata；
- 圖片在文章中的原始位置；
- 使用者有提供 Day One export media 時顯示真正圖片；
- 使用者只有 JSON 時，仍保留「這裡原本有圖片」的閱讀語意。

## Scope / Isolation｜範圍與刻意排除

### Included

- Day One JSON 是 source of truth。
- Browser 直接讀取使用者本機選取的檔案。
- Day One 原生 media export 結構是 authoritative input。
- JSON-only 與 JSON + photos 都是正式使用模式。
- Reader 只負責 read-only rendering。

### Excluded

- 不把日記轉成另一套 canonical data format。
- 不重新設計 Day One 的 media directory。
- 不要求把私人日記上傳到 GitHub、Netlify 或 backend。
- 不在這一輪處理 Native PhotoKit Reader。

## Input Contract｜輸入契約

### JSON-only

使用者只提供 Day One JSON 時，Reader 仍應解析文章內容與 photo reference。

若文章中存在圖片，但沒有提供對應 media：

```text
Day One JSON
  → richText / metadata / photo reference
  → 找不到本機 media
  → 保留原始文章位置
  → 顯示 photo placeholder
```

這不是 error state，而是正式 fallback。Reader 不可以因為看不到實體圖片，就把圖片原本的位置偷偷吃掉。

### JSON + Day One photos

Day One 若匯出 media，Reader 依照 Day One 自己的 export 結構讀取，不另外發明「比較漂亮」的資料夾：

```text
Day One export
├── <journal>.json
└── photos/
    ├── <md5>.jpeg
    ├── <md5>.png
    └── ...
```

目前已確認的 mapping：

```text
richText.embeddedObjects[].identifier
  → entry.photos[].identifier
  → photos[].md5 + type
  → photos/<md5>.<type>
```

Browser 基於 File API 的安全邊界，不能因為使用者選了一個 JSON 就自行漫遊 sibling folder。因此 UI 會讓使用者另外選取 Day One 匯出的 `photos/`；但檔名、mapping 與 directory semantics 仍完全遵守 Day One export，不要求使用者重新整理資料。

## Current Development Fixture｜目前測試資料

第一輪使用 Claire 實際從 Day One 匯出的 Test Journal 作 development fixture，目前有兩篇日記，涵蓋：

- H1 / H2 / H3；
- bold 等 inline formatting；
- quote；
- numbered / bulleted / checklist；
- tags、location、weather；
- 單張圖片；
- 連續多張圖片；
- 圖片與文字穿插；
- 不同尺寸與來源的圖片。

這份 raw fixture 暫時不 commit 到 Repo。它只是目前的 development input，後續 Test Journal 加入 PDF attachment、一般旅行日記或新的 edge case 後，可以直接重新 export 覆蓋，不必讓 Git history 長期背著每一版暫時 binary fixture。

## Repository / Deployment Boundary｜Repo 與部署邊界

```text
ai-playground
├── experiments/dayone-reader/   # Research Record / catalog metadata
└── public/dayone-reader/        # Netlify 可部署 Browser Artifact
```

使用者真正閱讀自己的日記時，資料流是：

```text
Reader HTML
     +
使用者本機 Day One export
     ↓
Browser File API
     ↓
local rendering
```

Repo fixture 若未來加入，只是測試／下載教材，不是 Reader runtime dependency。

## Evidence｜目前證據

### Repository Evidence

- Browser Artifact 已建立於 `public/dayone-reader/index.html`。
- Reader 已有 JSON input 與 optional `photos/` input。
- 未提供 media 時保留 photo placeholder。
- media mapping 依 Day One export 的 identifier / md5 / type，不建立另一套 media schema。

### Claire Environment Evidence

Claire 已在 iPad 實機持續驗收目前 Browser Reader，Entry 01 / 02 已用真實 Day One Test Journal 驗證主要 rendering 與 interaction 路徑。這不是完整 Journal / attachment / performance 驗收，但已足以把第一輪 Reader 從「只有 Repository code」推進到「有 Human Environment Evidence」。

先前 Day One export / PhotoKit 的其他 probe 可作後續相關研究背景，但不因它們成功就把本次 Browser Reader 自動寫成 Verified。

### Unknown / Not Tested

- 第三篇「一般日記」尚未加入，因此目前仍偏 feature-oriented fixture，尚未驗證自然混合內容的 acceptance。
- PDF attachment rendering。
- 更大型 Journal 的 performance / lazy rendering。
- Day One export 其他尚未遇到的 richText / media edge cases。

## Current Judgment｜目前判斷

目前狀態維持 **Candidate / Active**，但已取得第一輪 iPad Human Environment Evidence。

Entry 01 / 02 已足以驗證主要 rich text、media、search / filter interaction 與 iOS browser layout 修正；但第三篇自然日記、PDF attachment、大型 Journal performance 與更多 Day One edge case 尚未完成，因此不把整個 Reader 宣稱為 Verified / Completed。

## What this unlocks｜它打開了什麼下一步

先用目前兩篇 Test Journal 實際凌虐 renderer。等基本閱讀與圖片行為穩定後，再加入：

- PDF attachment；
- 一篇正常旅行日記，驗證不是只有人工測試格式才看起來正常；
- 更多 media edge cases；
- Browser Reader 與 Native PhotoKit Reader 的責任分界。

不要先為了測試製造一座 fixture 博物館。Reader 先活下來比較重要。


## Phase 1 Consolidation｜Entry 01–02 收斂（2026-09-19）

在加入第三篇「一般日記」以前，先把前兩篇測試已形成的 Evidence 與設計判斷固定下來。目的不是宣布 Reader 做完，而是避免下一輪 fixture 一進來，前面踩過的坑又退化成聊天考古。

### 1. Day One richText 是主要重建來源

目前 Test Journal 已直接觀察到 Day One export 可保存文章結構，而不是只有一坨 fallback text。Reader 應優先依 `richText.contents` 重建：

- heading；
- paragraph / explicit line structure；
- inline bold；
- quote；
- numbered / bulleted list；
- checkbox + checked state；
- horizontal rule；
- embedded photo object 與文章位置。

Export 同時存在 `text` fallback，但已觀察到 Markdown-like escaping 與 richText clean content 不完全相同。因此目前判斷是：

```text
richText = primary reconstruction source
text     = fallback / compatibility source
```

不要把 `text` 當 canonical representation 再轉回 Reader，否則等於 Day One 已經給了結構，我們卻先把它壓扁再猜一次。

### 2. Line structure 不能被 Renderer 自作主張合併

Entry 01 實測曾出現 Day One 內有折行，但 Reader 把內容接成同一行。修正後確認：Day One richText 的 line / content boundary 具有閱讀語意，Renderer 必須保留。

這不是單純 CSS `white-space` 問題；Adapter / Renderer 在組 block 時就不能把原始 line structure 吃掉。

### 3. Checklist 與一般 list 是不同 presentation

Entry 01 直接打出一個早期 parser 假設：checkbox line 不能先被一般 bulleted list 吞掉。

目前已修正為 checklist 優先辨識，並在 iPad 實機確認：

- checked item 顯示 checkbox；
- unchecked item 顯示空 checkbox；
- checklist 不再額外帶一般 bullet；
- checklist group 與前一段一般 bullet list 保留清楚區隔。

這是 parser precedence 問題，不是靠 CSS 把多餘 bullet 藏起來。

### 4. Photo reference / local media contract

目前 mapping 維持：

```text
richText embedded object identifier
→ entry.photos[].identifier
→ photos[].md5 + type
→ Day One export photos/<md5>.<type>
```

JSON-only 與 JSON + photos 都是正式模式：

- 沒有 local media：保留原文章位置並顯示 placeholder；
- 有 local media：使用 Browser File API / object URL 顯示圖片；
- Reader 不要求使用者改名或重組 Day One 的 `photos/`。

連續圖片可縮成 gallery 供文章閱讀，但縮圖不是圖片能力的終點。Entry 02 已加入 click-to-view image modal，讓使用者可單純放大檢視原圖；目前不處理額外下載流程，因為來源本來就是使用者自己的本機檔案。

### 5. Search 與進階篩選責任分開

實機使用後，左側 sidebar 不適合永久堆滿 metadata criteria。目前 interaction 收斂為：

```text
Search
→ sidebar 常駐
→ title / body 即時搜尋

Advanced Filter
→ modal
→ Tag（single select）
→ Country（single select）
→ Start Date（optional）
→ End Date（optional）
→ Apply / Clear
```

Tag / Country 的選項由整份 JSON 的 metadata distinct 產生，不手工維護 lookup。

日期條件允許單邊：

```text
只有 Start Date → entryDate >= start
只有 End Date   → entryDate <= end
兩者都有        → start <= entryDate <= end
兩者皆空        → 不限制日期
```

Search 與 applied advanced filters 共同作用。Modal 中尚未按 Apply 的暫存值不應偷偷改變目前結果；關閉 Modal 也不等於 Apply。

### 6. iOS WebKit native form control：不要只相信 box model

這一輪留下了一個值得保存的實機相容性 Evidence。

#### Disabled button

「尚未載入日記」時，Advanced Filter button 的 `disabled` attribute 本來已存在，但沒有反灰。這次原因不是 iOS bug，而是 Reader 根本沒有定義 `.btn:disabled` presentation。

修正後在 iPad 實機確認 disabled button 有明確灰階狀態。

結論：functional disabled state 與 visual disabled state 都應由 Reader 明確定義，不要期待 browser 自己替產品做視覺設計。

#### input[type=date] 右側越界

Advanced Filter 把兩個日期拆成 full-width row 後，iPad 上的 native date input 仍持續突破右側 padding。

依序嘗試：

```text
box-sizing: border-box
→ FAIL

grid child min-width: 0
+ date width / min-width / max-width: 100%
→ FAIL

visual border / radius / width 移到外層 .date-wrap
+ overflow: hidden
+ inner native date input border: 0
→ PASS on Claire iPad
```

目前沒有使用 `-webkit-appearance: none`，因此保留 iOS native date picker 行為；只把 layout / visual boundary 收回 Reader 自己控制。

這裡的重要判斷不是「所有 iOS date input 都一定會這樣」，而是：

> 在目前 Claire iPad / WebKit 實機環境，native date control 沒有可靠服從我們原先預期的 container boundary。遇到 iOS form control layout 問題時，不要只靠桌面 Browser 或一般 CSS box-model 推論；需要實機 Evidence。

同時也不要看到 iOS 就什麼都怪 Apple。Disabled button 那次明明是我們自己漏 CSS。冤有頭債有主，debug 才不會變宗教。

### 7. 第三篇的測試責任

Entry 01 / 02 是刻意的 feature-oriented fixture，適合把格式、media 與 interaction 問題逼出來。

Entry 03 應改成較自然的日記內容，混合正常使用者會寫出的：

- title / paragraph；
- 少量 inline formatting；
- list；
- single / multiple photo；
- metadata / tags；
- 一般閱讀節奏。

它的目的不是再塞滿所有 feature，而是做 acceptance-style challenge：

> 當內容不再刻意配合測試案例時，Reader 是否仍然像一個舒服的日記閱讀器？

PDF attachment 仍是後續獨立 edge case，不因 Entry 03 開始就假裝已驗證。

## Current Phase 1 Judgment

目前 Browser Reader 已不只是「JSON 能 parse」的 feasibility probe。Entry 01 / 02 已在 iPad 實機形成第一輪 rendering / interaction Evidence，並修正多個只有真實內容與 iOS native control 才會暴露的問題。

但 Experiment 仍維持 **Candidate / Active**：

```text
Entry 01–02
→ feature-oriented evidence established

Entry 03
→ natural diary acceptance challenge
→ next

PDF / larger journal / more export edge cases
→ still open
```

現在可以開始第三篇蹂躪 Renderer。至少下一世不用重新拿 `box-sizing: border-box` 去敲同一堵牆。
