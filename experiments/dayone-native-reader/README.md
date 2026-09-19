# D1-NATIVE-1 — Day One Native Reader

- Date: 2026-09-19
- Status: In Progress / M1 Verified
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

Status: **Next / In Progress target**

Research target：

```text
Day One richText.contents
→ semantic block / inline model
→ SwiftUI / AttributedString presentation
→ preserve meaningful reading structure
```

至少需要重新檢視 Browser Reader 已驗證的 mapping，並在 Native renderer 中處理 Claire fixture 真正使用到的 heading、paragraph、inline formatting、list / checklist、quote / embedded position 等語意。

M2 不把 Day One `text` fallback 誤認成 Markdown rendering。Canonical input 仍是 structured `richText`。

### M3 — PhotoKit Media Resolution

Status: **Candidate after / alongside M2**

Research target：

```text
Day One JSON photo metadata
→ local identifier
→ PHAsset
→ Photos / iCloud
→ Native Reader image
```

先前 private single-photo PoC 已觀察到一個真實 Day One PhotoKit identifier 可由 `PHAsset.fetchAssets` 找到並載入圖片；但那是 hardcoded identifier probe。

本 Experiment 必須另外驗證：

- identifier 是從 Day One JSON data model 取得，而非手工 hardcode；
- selected entry 的照片可 lazy / bounded loading；
- iCloud-only asset 在允許 network access 時的實際行為；
- 找不到 / 已刪除 / identifier 失效時的 Reader fallback。

不以一次載入整個 Journal 所有照片為目標。

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

Private earlier PhotoKit probe 曾以 hardcoded real identifier 成功取得一張照片。這只支持「PhotoKit route plausible / previously observed」，不支持 M3 已完成。

### Unknown / Not Tested

- Native rich-text semantic fidelity。
- JSON-derived local identifier → PhotoKit integration。
- 多張照片 / iCloud-only photo 的 bounded loading。
- 大型 Journal Native performance。
- Native search / advanced filter 是否值得做。
- PDF：刻意不測。

## Result｜目前結果

M1 已回答：**Day One JSON 可以在 iPad Native SwiftUI App 中完成 import、decode、entry list / detail 與基本 flattened reading。**

它還不能回答：

- Native Reader 已具備 rich-text 閱讀品質；
- JSON photo reference 已能顯示 Photos / iCloud 實體照片；
- Native Reader 已達成 Browser Reader parity。

因此 Experiment 狀態維持 **In Progress / M1 Verified**。

## Constraints / Pitfalls｜限制與踩坑

- 不要把 attachment count / reference parsing 寫成 physical media rendering evidence。
- 不要把 flattened `String` extraction 寫成 rich-text support。
- 不要因為先前 hardcoded PhotoKit PoC 成功，就把 JSON integration 當成已驗證。
- private identifier / journal fixture 不進 public repo。
- Native package / Working Copy / Swift Playgrounds operational traps 由 `apple-lab/knowledge/ipad-native-development.md` 管理，不在本 Experiment 重複維護。

## What this unlocks｜它打開了什麼下一步

Immediate next target：**M2 Rich Text Reconstruction**。

M2 若形成可接受閱讀品質，再以 M3 驗證 JSON-derived PhotoKit media resolution。M2 / M3 可依 implementation dependency 調整先後，但各自 Evidence 必須分開，不互相借功勞。

## Current Judgment｜目前判斷

- Native JSON ingestion / basic reading：**Verified in Claire iPad environment**。
- Native rich-text reconstruction：**Not yet verified**。
- JSON-derived PhotoKit image integration：**Not yet verified**。
- PDF support：**Out of scope by explicit product choice**。

目前 Evidence 支持 Native Reader 路線具有高可行性，但本 Experiment 的 completion 必須以 Claire 真正需要的 Reader 核心能力為準，而不是「App 能打開」就提早畢業。

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
