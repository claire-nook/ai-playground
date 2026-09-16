# 第一頁測試

這一段應該留在第一頁。

這份測試不在 Markdown 內放任何 `<style>` 或 `<div>`；換頁能力完全由 Textastic 的 `markdown_head.html` 與 `markdown.css` 提供。

<!-- pagebreak -->

# 第二頁測試

如果 `<!-- pagebreak -->` enhancement 正常：

- Textastic Preview 中，上方應看到一條淡色 `PAGE BREAK` 提示線。
- Safari / iPadOS Print Preview 中，這個標題應從第二頁開始。
- Print 時不應看到 `PAGE BREAK` 提示文字或虛線。
- A4、100% scale 即可，不需要用縮放硬喬分頁。
