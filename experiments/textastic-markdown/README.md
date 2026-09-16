# T-TXT-1 — Textastic Markdown Preview / Manual Print Page Break

- Date: 2026-09-16
- Status: Verified / Completed
- Environment: iPad Pro + Textastic + Safari / iPadOS Print
- Type: iPad-first authoring / rendering enhancement
- Artifacts: `markdown_head.html`, `markdown.css`, `pagebreak-test.md`

## 1. Why this experiment existed

Claire 平常幾乎不需要把 Markdown 轉成 PDF。正常情況下，Markdown Preview 與列印應完全維持 Textastic / WebKit / iPadOS Print 的原生世界，讓系統自行決定 pagination。

真正的痛點只存在於少數特殊文件：當內容需要交付成 PDF，而且 Claire 明確知道某個章節必須從新頁開始時，單靠調整紙張大小或全域縮放會讓前一頁看似正常、後續頁面卻重新漂移。

因此研究目標不是建立 PDF engine，也不是接管整份文件的 pagination，而是驗證一個極小的 enhancement：

> 預設完全不介入；只有 Markdown 明確加入人工換頁 marker 時，才要求 Print Layout 在該位置強制開始新頁。

## 2. Verified behavior

最終採用的 Markdown 語法是：

```markdown
<!-- pagebreak -->
```

`markdown_head.html` 會在 DOM ready 後尋找內容恰為 `pagebreak` 的 HTML comment，並只在 marker 存在時把它替換成 `.page-break` 節點。

`markdown.css` 對 `.page-break` 提供兩種行為：

- Screen / Textastic Preview：顯示淡色 `PAGE BREAK` 提示線，讓作者知道人工換頁放在哪裡。
- Print：隱藏提示線，使用 CSS `break-before: page` / `page-break-before: always` 強制換頁。

沒有 `<!-- pagebreak -->` 時，不建立 `.page-break` 節點，也沒有任何 page-level layout、A4 高度計算、自動分頁重排或其他 pagination intervention。

## 3. Human Environment Evidence

### Minimal probe

先以兩段短內容驗證：

```markdown
# 第一頁測試

這裡放一些文字。

<!-- pagebreak -->

# 第二頁測試

這個標題應從下一頁開始。
```

結果：

- Textastic Preview 可見 `PAGE BREAK` marker。
- Safari / iPadOS Print Preview 產生兩頁。
- A4、100% scale 即可。
- Print output 不顯示 marker 本身。

### Long-document validation

再以真實長文件進行 Human Environment Validation。文件在沒有人工 marker 的區域仍由 iPadOS 自然 pagination；加入 marker 的位置則強制開始新頁。人工換頁造成前一頁留下空白、以及後續自然 pagination 重新計算，皆屬預期行為。

Textastic Preview 中的人工換頁 marker：

![Textastic Markdown Preview 顯示 PAGE BREAK marker](../../public/images/wall/textastic-markdown-pagebreak-preview.png)

A4 / 100% iPadOS Print Preview 的長文件驗證：

![iPadOS Print Preview 驗證人工換頁與自然 pagination 共存](../../public/images/wall/textastic-markdown-pagebreak-print.png)

這證明 Automatic Pagination 與 Manual Forced Page Break 可以共存，而不需要把 Textastic Preview 改造成 page-layout editor。

## 4. Scope boundary

這個 enhancement **不是**：

- Markdown → PDF generator
- 自動最佳化分頁
- Page Container / A4 模擬器
- 防止系統自然換頁
- 自動處理孤兒標題、表格、圖片或 Mermaid 的跨頁策略

它只有一個責任：

> `<!-- pagebreak -->` = 「從這裡開始新的一頁。」

其他 99% 的世界交還給原生 Print pagination。

## 5. Installation in Textastic

Textastic 官方支援自訂 Markdown Preview HTML 與 CSS。依官方文件，檔名與位置為：

```text
Local Files/
└── #Textastic/
    ├── markdown_head.html
    └── markdown.css
```

本 Experiment 已提供可直接使用的版本：

- [`markdown_head.html`](markdown_head.html)
- [`markdown.css`](markdown.css)

將兩個檔案放到上述位置即可。檔名大小寫需保持一致。

也可以從 Textastic 的 `Settings → Web Preview → Customize Markdown Preview` 開啟 / 編輯對應檔案。

官方說明：

https://www.textasticapp.com/v10/manual/viewing_editing_files/web_preview.html#custom-html-and-css-for-markdown-preview

Textastic Markdown Preview 使用 MultiMarkdown，Preview 使用系統提供的 WebKit / `WKWebView`；官方也明確支援在 `markdown_head.html` 載入 JavaScript library。

## 6. Included enhancements

這兩個 Artifact 並不是只為 Page Break 臨時製作。它們來自 Claire 與墨衡早期在沒有 Git-based collaboration 時，透過對話、手動 copy / paste 與 Textastic 實機測試逐步形成的 Markdown Preview customization。

目前包含：

- 森林霧綠 Markdown Preview theme
- Typography / headings / lists / blockquote / table / code / image styling
- Mermaid code block rendering
- Manual Print Page Break

因此它們可以直接作為 Textastic Markdown Preview customization 使用，而不只是本次 probe code。

## 7. Usage cheat sheet

Claire 未來失憶專區：

```markdown
前一段內容。

<!-- pagebreak -->

# 下一頁從這裡開始
```

工作方式：

```text
Markdown 完成
→ Preview in Safari
→ iPadOS Print Preview
→ 找到需要人工斷頁的位置
→ 回 Markdown 插入 <!-- pagebreak -->
→ 再看 Print Preview
→ 必要時繼續往後微調
```

不要為了第一頁漂亮而用全域縮放硬喬整份文件。那正是這次 Experiment 被召喚出來的原因。

## 8. Result

**Verified / Completed.**

在 Claire 的 iPad 實機環境中，Textastic Markdown Preview customization 可以提供 opt-in manual page break；A4 / 100% iPadOS Print Preview 已驗證成功，且未改變沒有 marker 時的原生 automatic pagination model。
