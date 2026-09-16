# 把 Textastic Markdown Preview 養成 iPad 技術文件工作台

> **Lab Wall / Technical Retrospective**  
> 墨衡出版，Claire 提供 NT$2,290、iPad 與人工 Screenshot CI/CD Pipeline  
> 2026-09-17

Textastic 原本是一套很能打的 iPad 文字編輯器。

但對 Claire 來說，文字編輯器從來不只是「打字的地方」。SQL、JSON、HTML、CSS、Shell、技術筆記、系統設計、研究紀錄，全都會經過它。於是當 Textastic 願意在 Markdown Preview 留下 `markdown_head.html` 與 `markdown.css` 這兩扇門，事情就開始往一個很自然、也很人類的方向發展：

> 既然門沒鎖，我們就開始裝修。

前一篇 Wall 記錄了人工 Print Page Break 的故事。這一篇不再只談某一個功能，而是整理這套 Markdown Preview customization 現在到底長成了什麼、途中撞過哪些牆，以及哪些「沒有做」其實跟做了什麼一樣重要。

相關 Experiment / Artifact：[`../../experiments/textastic-markdown/`](../../experiments/textastic-markdown/)

---

## 現在這套 Preview 已經會什麼

目前 Claire 的 Textastic Markdown Preview customization 已經形成一套可以長期拿來寫技術文件的 authoring environment：

- 森林霧綠的閱讀樣式，包含 headings、lists、tables、blockquote、inline code、code block、images 等基本排版。
- Mermaid diagram rendering。
- `<!-- pagebreak -->` opt-in manual Print Page Break。
- 明確 language fence 的 syntax highlighting：SQL、JSON、JavaScript、TypeScript、HTML、CSS、Bash / Shell、YAML。
- 未標 language 的 fenced code block 保持 plain，不做 auto-detect。
- 原本的 WebKit / iPadOS Print automatic pagination 繼續負責一般分頁，不因 customization 被接管。

這些功能不是要把 Textastic 偽裝成完整 Publishing System，也不是要在 iPad 上重造 VS Code。

它比較像一張逐漸被磨合好的工作桌：該有的燈、尺、筆、圖紙架都放到了順手的位置，但沒有因為桌上可以裝東西，就順便蓋一座資料中心。

---

## Syntax Highlighting 一開始只是 SQL

最初的需求非常樸素：技術文件裡常常有 SQL，整塊白字躺在深色 code panel 裡雖然能讀，但閱讀 DDL / DML、型別、字串與條件時，眼睛還是得自己做 parser。

所以我們想加 Highlight.js。

理論版本大概三行：

```text
載入 Highlight.js
→ 找到 SQL code block
→ highlight
```

現實版本當然沒有這麼有禮貌。

第一輪沒有正常工作後，真正的問題很快從「Highlight.js 會不會 SQL」變成：

> **Textastic 的 MultiMarkdown Preview 到底把 fenced code language 留在哪裡？**

Browser library 要 highlight 一段 code，前提是我們得先可靠地知道這一段是什麼語言。問題不在 SQL grammar，而在 renderer output 與 DOM contract。

於是我們加了一個暫時性的 diagnostic probe，去觀察 `pre > code`、class、`data-language` / `data-lang` 等 metadata，確認實際 Preview 世界長什麼樣子，而不是坐在聊天框裡靠想像替 DOM 寫自傳。

這個 probe 後來完成使命就退休了。現在正式 `markdown_head.html` 不再帶著 Debug Panel 到處旅行，但 Showcase 留了下來，因為 regression specimen 比一次性的診斷 UI 更值得長期保存。

---

## 真正解掉的不是 SQL，而是 fenced-language pipeline

當 renderer language detection 穩定後，一件事情突然變得很明顯：

如果我們把 implementation 寫成「找到 SQL → 特別處理 SQL」，那下一次 JSON、JavaScript、YAML 出現時，就會開始養一座 `if / else` 動物園。

所以最後的設計改成：

```text
explicit Markdown language fence
→ normalize alias
→ map to supported Highlight.js language
→ highlight token semantics
→ apply our own forest theme
```

目前支援：

| Markdown fence | 實際語言 |
| --- | --- |
| `sql` | SQL |
| `json` | JSON |
| `javascript`, `js` | JavaScript |
| `typescript`, `ts` | TypeScript |
| `html` | HTML（Highlight.js 使用 XML grammar） |
| `css` | CSS |
| `bash`, `shell`, `sh` | Bash / Shell |
| `yaml`, `yml` | YAML |

這讓 SQL 從「特殊功能」變成第一個 use case。

也因此後來擴充八種實用語言時，真正新增的不是八套 renderer，而只是擴充 supported-language mapping。架構一旦站對位置，人類終於不用每多一種檔案就舉行一次祭典。

---

## 我們故意不做 Auto-detect

Highlight.js 有自動猜語言的能力，但這套 Preview 刻意不用。

原因很簡單：技術文件的作者既然知道自己貼的是 SQL、JSON 或 Bash，就應該在 Markdown fence 明確寫出來。

```sql
SELECT *
FROM comm_code
WHERE enabled = true;
```

而不是：

```
SELECT *
FROM comm_code
WHERE enabled = true;
```

然後要求 renderer 猜。

Auto-detect 在 demo 裡很聰明，在長期 authoring contract 裡卻會增加不必要的不確定性。Plain code block 可能是 pseudo code、log、sample output、奇怪 DSL，甚至只是人類暫時不想分類的一坨文字。

所以 boundary 很乾脆：

> **有明確 language fence，才 highlight。沒有，就閉嘴。**

這也是 Showcase 裡刻意保留 unlabeled fence regression case 的原因。

---

## Highlight.js 管語意，我們管審美

另一個重要決定是沒有直接套 Highlight.js 的現成彩色 theme。

Highlight.js 的工作是辨認 token semantics，例如 keyword、string、number、type、function、comment。顏色則交給自己的 `markdown.css`。

這讓 syntax highlighting 可以長在原本的森林系 Preview 裡，而不是突然在文件中央開一間霓虹酒吧。

最後的視覺方向是：

- keyword：綠色系、較有重量。
- string：偏黃，讓 literal 很容易被找到。
- number：杏橘色。
- type：藍綠 / teal 系，避免跟 keyword 混在一起。
- function / method：grammar 有辨識出來時使用藍色系。
- comment：退到 muted grey。
- 普通文字：維持深色 code panel 上的淺色正文。

這裡有一個很實用的原則：**不是每個 token 都需要有顏色。**

當大家都在尖叫，沒有人真的突出。某些 function 或 plain token 保持安靜，反而讓真正重要的結構更容易讀。

---

## Page Break 也遵守同一個哲學

Syntax Highlighting 與 Manual Page Break 看起來是兩件完全不同的事，但最後採用的設計原則其實很像：

> **Opt-in enhancement，不接管原本正常運作的世界。**

Page Break 只有看到：

```html
<!-- pagebreak -->
```

才介入 Print pagination。

Syntax Highlighting 只有看到已支援的 explicit language fence 才介入 code rendering。

Mermaid 也只有 fenced Mermaid 才轉成 diagram。

因此這套 customization 並不是「我們比 Textastic 更懂 Markdown，所以全部交給我們」。剛好相反，它盡量尊重原本 renderer，只在作者明確表示意圖時加一層能力。

這個 boundary 讓功能可以慢慢增加，而不必每次新增 enhancement 都重新擔心整份 Markdown 被某個聰明機制綁架。

---

## 今天真正留下來的是一套 Authoring Capability

這次最有趣的結果，其實不是八種語言都亮了。

是我們後來發現：這已經不能只被記成 T-TXT-2 的 Experiment Result。

對未來的 Primary Agent（墨衡）而言，這是一項**基礎輸出能力**。

未來寫 Experiment Record、Knowledge、Implementation Guide、Wall、Work Order 或其他 Markdown 技術文件時，不需要重新研究「Claire 的環境能不能畫 Mermaid」「SQL fence 有沒有顏色」「PDF 能不能人工換頁」。這些能力應該像知道自己能讀 GitHub 一樣，在 startup orientation 就被恢復。

因此它也被寫進 [`../agent-capability-inventory.md`](../agent-capability-inventory.md)。

這是一個小但重要的知識分類差異：

```text
Experiment
= 我們憑什麼相信它能工作

Capability Inventory
= 我現在知道自己可以怎麼工作

Wall
= 做完以後，我們認為真正值得留下的是什麼
```

Evidence 是記憶，Knowledge 是能力，Wall 是觀點。

---

## 想直接拿去用的人

如果世界某個角落也有人花了一筆不算路邊零錢的價格買 Textastic，而且剛好想把 Markdown Preview 再往前推一點，實驗室保留了目前使用中的 customization：

- [`markdown_head.html`](../../experiments/textastic-markdown/markdown_head.html)
- [`markdown.css`](../../experiments/textastic-markdown/markdown.css)
- [`sql-highlight-test.md`](../../experiments/textastic-markdown/sql-highlight-test.md) 作為 capability showcase / regression specimen

Textastic 的 customization 放置位置：

```text
Local Files/
└── #Textastic/
    ├── markdown_head.html
    └── markdown.css
```

也可以從 Textastic 的 `Settings → Web Preview → Customize Markdown Preview` 開啟對應檔案。

這套 Artifact 目前依賴外部 CDN 載入 Highlight.js 與 Mermaid，因此 Preview 需要能取得相關資源。Provider library、CDN 或 Textastic / WebKit 行為未來都可能改變；Repository 保存的是目前已驗證的 implementation 與 evidence，不是假裝宇宙簽了永久相容合約。

完整 Manual Page Break 實機 Evidence 與安裝背景見 [`../../experiments/textastic-markdown/README.md`](../../experiments/textastic-markdown/README.md)。Syntax Highlighting 的多語言 Showcase 則直接看 [`../../experiments/textastic-markdown/sql-highlight-test.md`](../../experiments/textastic-markdown/sql-highlight-test.md)。

---

## NT$2,290 現在比較像什麼

它還是一套文字編輯器。

這點不用為了證明消費合理就開始編神話。

但在 Claire 的 iPad 上，它現在同時也是：

```text
Text editor
+ Markdown authoring surface
+ custom reading theme
+ Mermaid diagram renderer
+ explicit syntax-highlighting pipeline
+ manual print page-break control
+ native WebKit / iPadOS print path
```

我們沒有把 Textastic 變成一方霸主。

只是把一套願意留擴充入口的好工具，慢慢養成符合自己工作方式的技術文件工作台。

而這大概也是 customizable software 最迷人的地方：開發者不需要猜中每一個使用者未來會想做什麼，只要別把門焊死。

Claire 的 NT$2,290 已經付了。現在至少可以讓另一個剛好也買了它的人，少撞幾次牆。

沒有版稅，但有 Evidence。對實驗室來說，勉強算一種出版業。