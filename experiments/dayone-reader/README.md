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
- `dev-maybe` 不參與目前 implementation；成熟的 standalone HTML 之後才可能移入。

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

目前尚未完成這一版 HTML Reader 的 iPad Human Environment Acceptance。

先前 Day One export / PhotoKit 的其他 probe 可作後續相關研究背景，但不因它們成功就把本次 Browser Reader 自動寫成 Verified。

### Unknown / Not Tested

- 目前兩篇 Test Journal 在新版 Browser Reader 的完整 render 結果。
- PDF attachment rendering。
- 更大型 Journal 的 performance / lazy rendering。
- Day One export 其他尚未遇到的 richText / media edge cases。

## Current Judgment｜目前判斷

目前狀態維持 **Candidate**。

Repository 已具備第一版可執行 Browser Artifact，且 input / privacy / media responsibility boundary 已明確；但在 Claire 實際以 iPad + 真實 Day One export 完成 Human Environment Acceptance 前，不升格為 Verified。

## What this unlocks｜它打開了什麼下一步

先用目前兩篇 Test Journal 實際凌虐 renderer。等基本閱讀與圖片行為穩定後，再加入：

- PDF attachment；
- 一篇正常旅行日記，驗證不是只有人工測試格式才看起來正常；
- 更多 media edge cases；
- Browser Reader 與 Native PhotoKit Reader 的責任分界。

不要先為了測試製造一座 fixture 博物館。Reader 先活下來比較重要。
