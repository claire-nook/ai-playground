# D1-NATIVE-1 — Day One Native Reader

- Date: 2026-09-19
- Status: Verified / Completed
- Primary Intent: Open Exploration / Local-first Personal Archive
- Supports: iPad-first Development
- Tags: `day-one`, `swift`, `swiftui`, `swift-playgrounds`, `json`, `rich-text`, `photokit`, `ipad-first`, `local-first`, `data-portability`
- Relationships:
  - `extends`: [D1-READER-1 — Day One JSON Local Reader](../dayone-reader/README.md)
  - `depends-on`: private `claire-nook/apple-lab` Apple-native execution environment

## Why this experiment exists｜為什麼做

D1-READER-1 已驗證 Day One structured JSON export 可以直接作為 local-first Browser Reader 的 source of truth。完成 Browser Reader 後，新的問題不是「能不能再做一套給別人用的產品」，而是 Claire 自己在 iPad 上是否能取得更貼近 Apple-native environment 的閱讀方式。

Native 路線特別有一個 Browser Reader 不具備的可能性：Day One JSON 若保存 Apple Photos 可用的 local identifier，Native App 可能透過 PhotoKit 直接讀取 Photos / iCloud 中既有照片，而不必另外維護一份大量 exported photos。

2026-09-19 已先完成第一個 Native checkpoint：Swift Playgrounds App 可從 Files 選取 Day One JSON、解析成 Swift model，並以 SwiftUI 顯示三篇測試日記的基本 List / Detail。這份已發生的 Evidence 現在正式收編為本 Experiment M1。

## Question｜想回答什麼

在 Claire 自用、iPad-first 的前提下，Day One Native Reader 能否達到目前 Browser Reader 對 Claire 真正有價值的核心閱讀能力：

1. 直接讀取 Day One JSON，不建立第二套 canonical archive。
2. 正確重建 Day One `richText` 的閱讀語意與主要 formatting，而不是只把文字攤平成 String。
3. 從 JSON 中的照片資訊出發，透過 Apple-native PhotoKit 取得 Photos / iCloud 中對應實體照片，並整合回日記閱讀流程。

成功標準是「Claire 實際會用的 Reader 核心能力」，不是追求通用 Day One replacement。

## Scope / Isolation｜範圍與刻意排除

### Included

- Day One JSON 作為 source of truth。
- iPadOS / Swift Playgrounds / SwiftUI Native Reader。
- JSON file import、decode、entry navigation。
- Day One structured `richText` semantic reconstruction。
- JSON photo reference / local identifier → PhotoKit → Photos / iCloud physical image。
- Claire iPad Human Environment Acceptance。
- 只在真實閱讀需求出現時補必要的 Native Reader UX。

### Explicitly Excluded

- **PDF rendering / PDF attachment integration。** Claire 幾乎不使用 Day One PDF；Browser Reader 已支援，但 Native Reader 不以 parity 為目標。
- 不為陌生使用者建立 generic product / onboarding / distribution。
- 不要求與 Browser Reader 每一項 UI / filter / presentation feature 1:1 parity。
- 不重新設計 Day One export format。
- 不建立第二份照片庫。
- 不把 private journal / PhotoKit identifier 搬進 public Playground。

### Scope Rule

Browser Reader 已有的能力不是自動列入 Native scope。只有 Claire 自用 Reader 真正需要的能力才納入。

因此本 Experiment 的方向是：

```text
Browser Reader capability
→ Claire actually needs it in Native?
   ├─ Yes → candidate scope
   └─ No  → intentionally omitted
```

不是「既然 Browser 有，就全部重寫一次」。人生已經夠短，不需要拿 parity 當宗教。

## Environment｜環境

### Public Research / Knowledge

- Repository: `claire-nook/ai-playground`
- Role: Experiment Record / sanitized Evidence / durable research context

### Private Native Execution

- Repository: `claire-nook/apple-lab`
- Environment: iPadOS + Swift Playgrounds + Working Copy + GitHub
- Native project: `projects/DayOneNativeReader.swiftpm/`
- Operational workflow: `apple-lab/knowledge/ipad-native-development.md`

真實 Day One journal fixture、PhotoKit local identifier、device-specific private evidence 留在 private execution boundary。

## Milestones

### M1 — Native JSON Ingestion & Basic Reading

Status: **Verified — Claire Environment Evidence**

Target:

```text
Day One JSON
→ iPad Files
→ SwiftUI fileImporter
→ local file read
→ JSONDecoder
→ Swift model
→ SwiftUI List / Detail
```

Observed on 2026-09-19:

- Native App 可啟動。
- Claire 可從 Files 選取 Day One JSON。
- Test Journal 可解析為 3 篇 entry。
- Sidebar 可列出 3 篇日記。
- 點選 entry 可進入 Detail。
- 日期、location、tags 等已解析 metadata 可在目前 UI 中呈現。
- `richText` 中的文字可被抽取成 readable plain text。

Important boundary:

- 目前 `richText` 是 **flattened text extraction**，不是 rich-text reconstruction。
- JSON 中的 photo / PDF attachment metadata 可以被 data model 辨識 / 統計，不等於 physical media 已載入或 render。
- Native Reader 目前沒有顯示 15 張實體照片，也沒有顯示 PDF。

### M2 — Rich Text Reconstruction

Status: **Verified — Claire Environment Evidence (2026-09-20)**

Research target：

```text
Day One richText.contents
→ semantic block / inline model
→ SwiftUI / AttributedString presentation
→ preserve meaningful reading structure
```

至少需要重新檢視 Browser Reader 已驗證的 mapping，並在 Native renderer 中處理 Claire fixture 真正使用到的 heading、paragraph、inline formatting、list / checklist、quote / embedded position 等語意。

M2 不把 Day One `text` fallback 誤認成 Markdown rendering。Canonical input 仍是 structured `richText`。

#### M2 verified result

Claire iPad Human Environment 已完成 M2 實機驗證。Native Reader 不再把 `richText` 攤平成單一 String，而是先轉成 semantic block / inline model，再由 SwiftUI / `AttributedString` 呈現。

目前已實際形成可閱讀結果的語意包括：

- heading / paragraph；
- bold / italic / strikethrough / inline code / link；
- quote；
- bullet list / contiguous numbered list / checklist；
- horizontal rule；
- embedded photo position placeholder；
- embedded PDF position placeholder；
- weather metadata；
- zh_TW date presentation。

Day One 第一個與 entry title 相同的 H1 會避免在 Detail 重複顯示。Numbered list 採 Claire fixture 的實際閱讀規則：**連續 numbered blocks 由 1 起算；被一般 paragraph 等 block 中斷後，後續 numbered list 重新由 1 起算**，不追求跨非 list block 延續編號。

PDF 仍不進入 Native physical rendering scope。M2 只保留 PDF 在原文中的 semantic position，顯示「此處有 PDF 附件」與可取得的檔名；這是 position preservation，不是 PDF support。

M2 同時補上 Claire 實際需要的輕量閱讀 UX：

- 原生 SwiftUI `.searchable` 文字搜尋；
- 單一 Tag 下拉篩選；
- Search + Tag 採 AND；
- Tag 清單由目前 JSON 實際 tags 動態產生；
- 沒有日期 / 國家 filter，也沒有 multi-tag filter。

這些 UX 是 Claire 自用 Reader 的必要閱讀能力，不代表 Native Reader 要追求 Browser Reader advanced filter parity。

#### M2 implementation / environment lessons

M2 在 Swift Playgrounds 暴露兩個重要環境坑：

1. **SwiftUI type-check complexity 要小步切割。** Search 初次加入既有大型 `ContentView` modifier chain 時，Swift Playgrounds compiler 出現「unable to type-check this expression in reasonable time」。只抽出 list row / list 還不足；把 search state、filtering 與 `.searchable` 一起隔離到 dedicated sidebar view 後才恢復 compile。這支持 apple-lab 採「一個小功能 → compile → iPad 驗證 → checkpoint → 下一步」的開發節奏。
2. **Magic Keyboard text input 是目前 Playgrounds execution environment 的已知限制。** 同一 Search 使用螢幕鍵盤可正常輸入與 filter；Magic Keyboard 無法在 `.searchable` 輸入。改成普通 SwiftUI `TextField` 後 Magic Keyboard 仍無法輸入，因此 Evidence 不支持把問題歸因於 Reader filtering 或 `.searchable`。Native Reader 最終保留標準 `.searchable`，不為 Playgrounds-only observation 犧牲 App UI。

第二點目前只適用於這次 Claire iPad + Swift Playgrounds Human Environment；**不能推論正式安裝的 iPadOS App 或 Xcode-built App 也有相同行為**。跨 project operational rule 已整理在 private `apple-lab/knowledge/ipad-native-development.md`。

### M3 — PhotoKit Media Resolution

Status: **Verified — Reader Integration + Human Environment Acceptance (2026-09-20)**

Research target：

```text
Day One JSON photo metadata
→ photos[].appleLocalIdentifier
→ PHAsset.fetchAssets(withLocalIdentifiers:)
→ PHImageManager
→ Photos / iCloud
→ Native Reader image
```

#### M3-A feasibility probe — Verified

2026-09-20 在 private `apple-lab` 的既有 PhotoKit 小專案完成 Claire iPad Human Environment probe。這一輪刻意沒有先修改正式 `DayOneNativeReader.swiftpm`，而是把「JSON 到 PhotoKit 是否真的可行」隔離驗證。

Probe 保留一組已知可成功的 hardcoded `PHAsset.localIdentifier` 作 Control，並讓 App 從 Day One Test Journal JSON 直接讀取照片 metadata。為避免 Claire 已刪除的測試截圖污染結果，最終 target 鎖定 `# 03｜A Normal Travel Day` 中 Claire 確認仍存在 Photos 的真實旅遊照片。

Observed result：

- hardcoded Control 可取得 `PHAsset` 並顯示 image；
- Day One JSON `photos[].identifier` 直接餵給 `PHAsset.fetchAssets(withLocalIdentifiers:)`：**找不到 asset**；
- 同一張仍存在 Photos 的照片，改用 Day One JSON `photos[].appleLocalIdentifier`：**成功取得 PHAsset 並顯示正確 image**；
- 因此 M3 的核心 mapping 已由 Human Environment Evidence 驗證，而不是只靠欄位名稱或格式推論。

#### Critical schema pitfall — identifier 不是 PhotoKit localIdentifier

這是 M3 最重要的踩坑，必須保留：

```text
Day One photos[].identifier
≠ PHAsset.localIdentifier

Day One photos[].appleLocalIdentifier
→ PHAsset.fetchAssets(withLocalIdentifiers:)
→ PHAsset
```

Day One photo object 同時存在多種 identifier-like metadata。不能因為欄位叫 `identifier` 就假設它屬於 Apple Photos namespace。M3-A 的 negative evidence 已證明：對一張 Claire 確認仍存在 Photos 的照片，`photos[].identifier` 查詢失敗；改用同一 photo object 的 `appleLocalIdentifier` 後成功。

未來 Agent 實作或除錯 PhotoKit mapping 時，應先確認 identifier namespace，再檢查 asset 是否存在。不要把「PhotoKit 找不到」第一時間誤判成照片已刪除、權限失效或 iCloud 問題。欄位名字看起來很無辜，實際上非常會把人帶去撞牆。

#### M3-B Native Reader integration — Verified

M3-A 的 identifier mapping 已整合進正式 `DayOneNativeReader.swiftpm`，並由 Claire iPad Human Environment 驗證：

```text
richText photo embedded identifier
→ match entry.photos[].identifier
→ matched photo.appleLocalIdentifier
→ PHAsset
→ PHImageManager
→ inline image at original article position
```

Reader 採 per-photo degradation。缺少 `appleLocalIdentifier`、找不到 PHAsset、或 Photos 找到 asset 但影像暫時無法取得時，都只影響該張照片，原文章與 semantic position 保持可閱讀；UI 不武斷宣稱照片已刪除。

實機亦驗證多張真實旅遊照片可在正文原位置載入。Claire 測試 fixture 中已不存在 Photos 的 screenshot references 則以 unavailable placeholder 呈現，沒有拖垮整篇 entry。

#### M3-C Reading layout / full-screen browsing — Verified

第一輪曾嘗試將多張 inline photos 改為 SwiftUI `LazyVGrid` 兩欄 photo wall。Human Environment 出現可重現的 reverse-scroll failure：文章可一路向下滑至照片區，但在多圖區域無法正常向上返回。

Isolation probes：

- photo wall `.allowsHitTesting(false)` 後問題仍存在；
- 暫時移除 parent rich-text `.textSelection(.enabled)` 後問題仍存在；
- 移除 `LazyVGrid` photo wall、改回 bounded inline images 後，Claire 驗證 article scrolling 恢復正常。

因此 Evidence **沒有證明 LazyVGrid 本身是 SwiftUI 的普遍 bug**，只證明這個 photo-wall composition 在目前 Reader + Swift Playgrounds Human Environment 造成實際閱讀問題。由於本 Reader 的目標是資料自主 / archival readability，而不是 Day One UI parity，沒有繼續投入圖片牆 root-cause research。

Current reading layout：

- 照片維持 richText 原始位置與順序；
- 保持 aspect ratio；
- bounded inline presentation，避免單張照片吞掉整個閱讀畫面；
- 多張照片採直向排列，不再建立 gallery grid。

這也留下了一個很人類的產品心得：**Day One 的圖片牆看起來理所當然，實際重做才知道一點也不理所當然。** Native Reader 不需要為了模仿它，把 data-sovereignty 工具養成另一套 Day One。

第二階段加入 full-screen photo viewer，Claire iPad Human Environment 已驗證：

```text
inline loaded photo
→ tap
→ full-screen dark viewer
→ open at tapped photo
→ swipe previous / next within the same entry
→ current / total counter
→ close
→ return to article
```

Viewer 的照片順序依 **richText 實際出現順序**，不是直接假設 `entry.photos` array order。每頁各自透過 PhotoKit resolve image，避免開啟 viewer 時一次 preload 整篇所有原圖。Unavailable photo 仍保留對應資料狀態，不因 viewer 而被當成不存在。

Claire 實機驗證 full-screen viewer 可正確顯示真實照片並左右翻頁；測試畫面已到達 `5 / 5`。有輕微切換卡頓的 Human Environment observation，但目前沒有 Evidence 可把 root cause 歸給 Reader、PhotoKit 或 Swift Playgrounds，因此不為這項 observation 提前加入 cache / prefetch complexity。

#### Explicitly not required for completion

- Day One-style photo wall parity；
- pinch-to-zoom；
- PDF physical rendering；
- 大型 Journal performance optimization；
- 尚未取得 Human Environment Evidence 的 iCloud-only asset 行為。

這些項目若未來成為 Claire 的真實使用痛點，再 problem-triggered reopen；不作為本輪 completion blocker。

## Method / Artifact｜怎麼驗證

### Source

Private execution source：

```text
claire-nook/apple-lab
└── projects/DayOneNativeReader.swiftpm/
    ├── DayOneModels.swift
    ├── ReaderStore.swift
    ├── ContentView.swift
    └── Apple-generated package files
```

### Verification model

- Primary Agent：讀寫 GitHub source、設計 experiment、分析 machine-visible repository evidence。
- Claire：Working Copy Pull / Commit / Push、Swift Playgrounds compile / Preview / run、iPad Human Environment Acceptance。
- Public `ai-playground`：只保存 sanitized Experiment / Evidence / Judgment。

## Evidence｜實際觀察

### Claire Environment Evidence

2026-09-19 M1：

- Swift Playgrounds 成功 build / run `DayOneNativeReader.swiftpm`。
- Claire 透過「開啟 JSON」從 Files 選取 test journal。
- UI 顯示三篇 entry 並可進入 detail。
- Detail 顯示基本 metadata 與可閱讀的 flattened text。

### Repository Evidence

Private project 已包含：

- `DayOneModels.swift`：Day One JSON data model / richText decode baseline。
- `ReaderStore.swift`：JSON import / decode / sorted entries state。
- `ContentView.swift`：fileImporter + NavigationSplitView + List / Detail baseline。

### Related prior evidence

D1-READER-1 已建立 Browser side 的 Day One `richText` / media mapping knowledge，可作 Native semantic reconstruction 的 reference，但 Browser implementation 成功 **不等於** Native renderer 已驗證。

Private M3-A probe 已完成 hardcoded Control 與 JSON-derived mapping 對照：`photos[].identifier` 對仍存在的照片查詢失敗，而 `photos[].appleLocalIdentifier` 成功取得 PHAsset 並顯示正確 image。這驗證 M3 feasibility；正式 Reader integration 仍未完成。

### Unknown / Not Tested

- 尚未遇到的 Day One richText construct / future schema edge case。
- M3-A 已驗證 JSON `appleLocalIdentifier` → PhotoKit → image；正式 Reader 尚未整合。
- 多張照片 / 已刪除或 unavailable asset fallback / iCloud-only photo 的 bounded loading。
- 大型 Journal Native performance。
- PDF：刻意不測。

## Result｜最終結果

D1-NATIVE-1 的核心 Research Question 已回答 **Yes**。

Claire 自用 iPad Native Reader 已在 Human Environment 驗證：

```text
Day One JSON
→ Native decode / navigation
→ structured richText semantic reconstruction
→ Search + single Tag filter
→ richText photo position
→ Day One generic identifier mapping
→ appleLocalIdentifier
→ PhotoKit / Photos
→ bounded inline image
→ tap full-screen viewer
→ same-entry previous / next browsing
```

因此 Native route 已證明可以在**不建立第二套 canonical archive、不另存一份照片庫**的前提下，利用 Day One export + Apple Photos 建立 Claire 真正需要的 archival Reader。

本 Experiment 不宣稱取代 Day One。Day One 仍是日常 journal product；Native Reader 的角色是 **data sovereignty / archival readability fallback**：確保資料離開 Day One 後仍有一條 Claire 自己掌握、可理解且可閱讀的路。

Status：**Verified / Completed — 2026-09-20**。

## Constraints / Pitfalls｜限制與踩坑

- 不要把 attachment count / reference parsing 寫成 physical media rendering evidence。
- 不要把 flattened `String` extraction 寫成 rich-text support。
- 不要把 Day One `photos[].identifier` 當成 PhotoKit localIdentifier；已驗證正確欄位是 `photos[].appleLocalIdentifier`。
- 不要把 M3-A feasibility probe 成功寫成正式 Reader 已完成 PhotoKit integration。
- PhotoKit asset-not-found 不等於可斷言「照片已刪除」；保留 semantic position 並採 unavailable placeholder。
- private identifier / journal fixture 不進 public repo。
- Native package / Working Copy / Swift Playgrounds operational traps 由 `apple-lab/knowledge/ipad-native-development.md` 管理，不在本 Experiment 重複維護。

## Final Judgment｜最終判斷

- Native JSON ingestion / basic reading：**Verified**。
- Native structured richText reconstruction：**Verified**。
- Search + single Tag reading UX：**Verified**。
- Day One `appleLocalIdentifier` → PhotoKit mapping：**Verified**。
- Formal Native Reader PhotoKit integration：**Verified**。
- Missing / unavailable photo per-item fallback：**Verified in current fixture**。
- Bounded inline photo layout / article scrolling：**Verified**。
- Full-screen same-entry photo browsing：**Verified**。
- Day One-style photo wall：**Attempted, produced a repeatable scroll regression, intentionally abandoned as non-essential parity**。
- PDF physical rendering：**Explicitly out of scope**。
- Large Journal performance / iCloud-only edge behavior：**Unknown / deferred until real need**。

Stop condition 已滿足。後續不因「還能再漂亮一點」維持 Experiment 永遠 In Progress。這是 archival Reader，不是第二家 Day One 公司。

## Re-test / Re-open Trigger

Experiment 尚在進行中。若未來完成後再重開，Trigger 可包括：

- Day One export schema 改變。
- Apple Photos / PhotoKit identifier behavior 改變。
- Swift Playgrounds / iPadOS file access behavior 改變。
- Claire 實際 Journal 出現目前 renderer 無法閱讀的新 richText construct。

## Knowledge Links｜知識連結

- Experiment Catalog: `knowledge/experiments.md`
- Open Exploration: `knowledge/open-exploration.md`
- Evidence Index: `evidence/index.md`
- Related Experiment: `experiments/dayone-reader/README.md`
- Private Execution: `claire-nook/apple-lab/projects/DayOneNativeReader.swiftpm/`
