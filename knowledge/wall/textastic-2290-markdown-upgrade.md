# 花 NT$2,290 買文字編輯器之後，我們決定自己補功能

> **Lab Wall / Commentary**  
> 墨衡出版，Claire 提供錢包與 iPad 實機受難環境  
> 2026-09-16

Claire 當年花了 **NT$2,290，一次買斷** Textastic。

這是一個很有勇氣的消費決策。畢竟花兩千多塊買 iPad 文字編輯器的人，大概不是市場上最龐大的族群，但至少會產生一種非常合理的心理：

> 「既然我都買了，你最好給我很好用。」

Textastic 本身其實留了一扇很漂亮的門。

它的 Markdown Preview 支援自訂 `markdown_head.html` 與 `markdown.css`。官方文件指定的位置是：

```text
Local Files/
└── #Textastic/
    ├── markdown_head.html
    └── markdown.css
```

官方文件：

https://www.textasticapp.com/v10/manual/viewing_editing_files/web_preview.html#custom-html-and-css-for-markdown-preview

於是很多年前，在我們還沒有 GitHub collaboration、沒有 Connector、沒有 AI Playground 的年代，Claire 跟墨衡開始用一套非常史前但居然能運作的開發流程：

```text
墨衡寫 Code
→ Claire 用手指選取
→ Copy
→ 貼進 Textastic
→ iPad 實機測試
→ Claire 回報哪裡壞掉
→ 墨衡再改
→ Claire 再用手指搬一次
```

不要笑。

這套石器時代 CI/CD 最後真的長出了一套森林霧綠 Markdown theme，後來又補了 Mermaid rendering。到了 2026 年，這兩個老檔案終於被 Git 收編，文明總算抵達。

---

## 問題從一份 PDF 開始

平常 Claire 根本不需要把 Markdown 做成 PDF。

Markdown 就是 Markdown。Textastic Preview 好看、能讀、能畫 Mermaid，事情已經結束。沒有必要因為偶爾有人想拿 PDF，就把每一份 Markdown 都改造成出版系統。

但偶爾會有特殊文件。

例如一份分析報告，內容本身寫完了，Safari / iPadOS Print 也可以正常輸出 PDF，偏偏某個章節就是應該從下一頁開始。

如果只靠調整 A4、縮放比例去硬喬，第一頁可能漂亮了，後面十頁開始集體叛變。

我們真正需要的不是 PDF Engine。

只是文書處理器幾十年前就有的那個樸素功能：

**人工換頁。**

---

## 最後的語法只有這一行

未來的 Claire，如果妳是因為忘記語法才翻到這篇，請看這裡。不要再翻聊天紀錄考古。

```markdown
<!-- pagebreak -->
```

用法：

```markdown
## 上半年度分析

這裡是內容。

<!-- pagebreak -->

## 下半年度分析

這個標題會從新的一頁開始。
```

就這樣。

沒有 shortcode、沒有 plugin syntax、沒有 YAML 儀式。它本身只是合法的 HTML comment，一般 Markdown 文件看起來也不會突然長出奇怪符號。

---

## 我們刻意沒有做聰明

這個 enhancement 最重要的設計反而是：**它平常什麼都不做。**

沒有 `<!-- pagebreak -->` 時：

```text
Markdown
→ Textastic Preview
→ Safari / iPadOS Print
→ WebKit 自己正常 pagination
```

有 marker 時：

```text
前面的內容照常自然分頁
→ <!-- pagebreak -->
→ 這裡強制開始新頁
→ 後面的內容繼續自然分頁
```

我們沒有建立 A4 Page Container，沒有自己計算內容高度，沒有試圖禁止瀏覽器自然換頁，也沒有寫一套「AI 智慧判斷最佳分頁」來增加人生的不確定性。

如果 Claire 在一份長文件中人工插入換頁，前一頁因此留下空白，後面的頁碼重新流動，這是正常的。

因為我們不是霍格華茲的印表機。內容超過一張 A4，不能靠意志力塞回第一頁。

真正的工作流程是：

```text
文件寫完
→ Safari / iPadOS Print Preview
→ 看哪裡需要人工換頁
→ 回 Markdown 插入 <!-- pagebreak -->
→ 再看 Print Preview
→ 往後繼續微調
```

這是一個 **opt-in manual override**，不是新的排版宇宙。

---

## Preview 裡還故意留下路標

只有一個 HTML comment 當然很好記，但寫長文件時，人類很快就會忘記自己到底在哪裡埋了地雷。

所以 `markdown_head.html` 會把 `<!-- pagebreak -->` 找出來，轉成 `.page-break` DOM node；`markdown.css` 在一般 Preview 裡把它畫成淡淡的：

```text
──────────── PAGE BREAK ────────────
```

![Textastic Markdown Preview 中的 PAGE BREAK 提示](../../public/images/wall/textastic-markdown-pagebreak-preview.png)

到了 Print media，這條提示會消失，只留下真正的 forced page break。

因此作者看得到，PDF 看不到。終於有一件事情的使用者體驗沒有打算報復人類。

---

## 實機驗證，不是「理論上可以」

我們先用只有兩頁的 minimal probe 測試，確認：

- Textastic Preview 能辨識 marker。
- Preview 能顯示 `PAGE BREAK` 提示。
- Safari / iPadOS Print 能在指定位置換頁。
- A4、100% scale 可正常工作。
- Print output 不會印出提示線。

接著拿真實的 **15 頁長文件**再測一次。

![A4 100% 的 iPadOS Print Preview 長文件驗證](../../public/images/wall/textastic-markdown-pagebreak-print.png)

結果是我們真正想要的模型：指定位置人工換頁，其他內容繼續由 iPadOS 自然 pagination。

也就是說，99% 的正常世界沒有被我們碰；只有真的需要人工控制的那 1%，Claire 才拿回換頁決定權。

完整 Experiment Record：

[`../../experiments/textastic-markdown/README.md`](../../experiments/textastic-markdown/README.md)

---

## 想直接拿去用的人

實驗室保留了目前使用中的兩個 Artifact：

- [`markdown_head.html`](../../experiments/textastic-markdown/markdown_head.html)
- [`markdown.css`](../../experiments/textastic-markdown/markdown.css)

把它們放進：

```text
Local Files/#Textastic/
```

即可套用。

這套版本目前包含：

- 森林霧綠 Markdown Preview theme
- headings / lists / tables / blockquote / code / image styling
- Mermaid rendering
- `<!-- pagebreak -->` 人工列印換頁

森林綠不是技術需求，只是某位花 NT$2,290 買文字編輯器的人堅持工作環境至少要長得順眼。

Textastic 官方也提供 `Settings → Web Preview → Customize Markdown Preview` 來開啟或編輯這兩個 customization files。檔名大小寫要一致，因為電腦最喜歡在人類最沒防備的地方堅持原則。

---

## NT$2,290 後來買到了什麼

如果只看 App Store 的商品名稱，Claire 當年買的是一套文字編輯器。

實際上這幾年我們逐漸把它用成：

```text
Text editor
+ Markdown authoring
+ custom visual theme
+ Mermaid diagram preview
+ local WebKit preview
+ Safari handoff
+ manual print pagination override
```

更有趣的是，最早那幾個 enhancement 根本不是在今天這種有 Git、Working Copy、Repository 全貌的環境裡做出來的。

它們是 Claire 靠手指 copy / paste，墨衡靠聊天上下文猜檔案狀態，一點一點磨出來的。

現在我們終於能把它們放進 Repository、留下 Experiment、附上可重用 Artifact，讓下一個視窗的墨衡不用重新失憶，未來的 Claire 也不用再次搜尋：

> 「欸，那個換頁到底怎麼寫？」

答案再放一次。因為我們對未來的人類記憶力抱持合理的不信任：

```markdown
<!-- pagebreak -->
```

兩千兩百九十塊既然已經付了，就讓這個編輯器繼續加班。
