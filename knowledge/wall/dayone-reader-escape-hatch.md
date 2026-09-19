# 我們只是想把 Day One 日記帶走，事情怎麼會變成這樣

> **Lab Wall / Commentary**  
> 墨衡出版，Claire 提供八年份日記、iPad 與結案前二十分鐘才出現的 PDF  
> 2026-09-19

Claire 從 2018 年開始用 Day One。

一開始真的只是寫日記。

八年後，日記變成一千多篇，照片變成很多很多張，然後某一天，一個原本很單純的問題出現了：

> **如果有一天不想用 Day One 了，這些日記還看得下去嗎？**

Day One 可以 Export。

很好。

資料可以帶走。

然後我們打開 JSON。

也很好。

資料確實都在。

只是「資料還在」跟「人類還想看」顯然是兩回事。

JSON 很適合證明資料沒有死掉，不太適合讓人在晚上十一點躺在床上回味八年前到底寫了什麼。於是我們做了一件原本完全沒有打算做大的事情：

**寫一個 Reader。**

---

## 我們不要搬家，只想留一扇逃生門

這個 Reader 從一開始就沒有打算取代 Day One。

Day One 繼續負責寫日記、同步、整理與那些它本來就做得很好的事情。

Reader 只負責一件事：

> **如果資料已經 Export 出來，就讓它還像日記。**

所以我們沒有把 Day One JSON 轉成另一套「我們比較聰明」的資料格式，也沒有建立資料庫，更沒有要求使用者先把八年人生重新 Import 到另一個系統。

原始 JSON 就是 source of truth。

Reader 只讀它。

這個決定後來省掉很多麻煩，也避免我們為了解決「不想被某套格式綁住」，最後自己再發明一套格式把人綁住。人類在資料遷移上已經很擅長這種輪迴，我們決定少貢獻一次。

---

## 然後 JSON 比想像中有料

真正開始拆 Day One export 之後，我們才發現裡面留下的東西不少。

文字不是只有一大坨 plain text。

標題、粗體、斜體、清單、引用、Tag、日期、地點、天氣，甚至照片原本插在文章哪裡，都還留著足夠的線索。

於是 Reader 從：

> 「至少把文字顯示出來。」

慢慢長成：

- 還原主要 rich text 結構。
- 顯示日期、Tag、地點與天氣。
- 搜尋標題與正文。
- 依 Tag、國家與日期篩選。
- 保留照片原本在文章裡的位置。
- 可以點照片看原圖。

到這裡事情已經開始有點失控，但還在可以假裝是小工具的範圍。

---

## 照片沒有不見，只是 Day One 不想把答案寫在門口

Day One 的照片 export 會放在原生的 `photos/` 裡。

Reader 不要求重新命名。

也不要求 Claire 把幾千張照片拖出來排隊報到。

JSON 裡有照片紀錄，rich text 裡又保留 embedded photo identifier；沿著這些資料就能把「這張照片屬於哪篇日記、原本放在哪裡」重新接起來。

因此 Reader 有兩種正常使用方式。

**只有 JSON：**

文字照樣能讀，照片原本的位置留下 placeholder。

**JSON + photos/：**

Reader 在瀏覽器裡把 Day One 原生 export 的照片對回文章。

沒有 backend。

沒有上傳日記。

沒有「請先把私人日記交給陌生網站，我們保證會好好照顧它」這種令人心跳加速的 onboarding。

---

## 網站版其實沒有拿走你的日記

我們把 Reader 放上網站後，立刻遇到一個很合理的心理問題：

> 「等等，我把 JSON 選給這個網站，不就等於把日記上傳了嗎？」

不是。

[Day One Reader 網站版](https://ai-playground-lab.netlify.app/dayone-reader/) 提供的是 Reader 程式本身。

你選的 JSON、`photos/`，以及後來才被我們想起來的 `pdfs/`，都由目前這個瀏覽器頁面在本機處理。

Reader 不需要帳號，也沒有日記 backend。

換句話說：

```text
網站
→ 提供 Reader

你的 JSON / photos / pdfs
→ 留在目前瀏覽器頁面處理
```

這並不代表世界上所有網站都值得這樣信任。

只是這一個 Reader 的設計就是如此。

---

## 還是不放心？歡迎進入冤大頭尊榮版

Claire 的反應很合理：

> 「那我可不可以連網站都不要？」

可以。

而且她剛好已經買了 Textastic。

於是我們又多走了一條路：

**Textastic Local Preview。**

把 Reader HTML 放在 Textastic 可以存取的位置，用 Local Preview 開啟，再選自己的 Day One export。

整套 Reader 與日記資料都可以留在 iPad 本機。

我們正式把這條路稱為：

> **完全本機版（aka 冤大頭尊榮版）**

因為 Textastic 是第三方付費 App，而我們跟它沒有合作、沒有贊助、沒有分潤。

我們甚至沒有折扣碼。

財務模型收入固定為 0。

Textastic 官方網站：  
https://www.textasticapp.com/

如果你已經有 Textastic，而且覺得「既然錢都花了，不如順便把 Markdown Preview 也養漂亮」，我們之前還做過另一件完全沒有營收潛力的事情：

[花 NT$2,290 買文字編輯器之後，我們決定自己補功能](https://ai-playground-lab.netlify.app/result/?id=WALL-TEXTASTIC-1)

那篇有森林霧綠 Markdown Preview、Mermaid、人工 PDF Page Break，也有可以直接拿去塞進 Textastic 的 `markdown_head.html` 與 `markdown.css`。

錢已經付了，就讓軟體多上幾個班。

---

## 我們甚至寫了操作手冊

事情走到這裡，Reader 已經不是只有我們兩個知道怎麼操作。

所以我們做了一件對「AI 發電小工具」來說極其危險的事：

**寫操作手冊。**

而且不是三行 README。

最後生出來的是一份二十多頁的 PDF，從 Day One Export、ZIP 解壓、網站版 Reader，一路寫到 Textastic Local Preview。

[下載 Day One Reader 使用指南 PDF](https://ai-playground-lab.netlify.app/downloads/dayone-reader/dayone-reader-guide-v0.5.pdf)

Claire 從頭看到尾。

沒有問題。

我們覺得可以結案了。

這通常就是災難準備登場的時候。

---

# 結案前二十分鐘：等一下，PDF 呢？

為了最後確認 Reader，我們重新看了一次 Test Journal 的完整 export。

裡面有：

```text
Day One Reader Test Journal.json
photos/
pdfs/
```

JSON。

有。

照片。

有。

`pdfs/`。

……

**等一下。**

我們忘了 PDF。

而且不是「未來可能有人會用 PDF」這種理論問題。

Test Journal 的第二篇日記裡就真的塞了一份 PDF。

我們甚至拿那份 PDF 當測試附件。

然後 Reader 從頭到尾都當它不存在。

這是一種非常純粹的工程喜劇。

最精彩的是：**操作手冊已經寫完了。**

於是剛準備收斂的實驗重新打開，沿著 Day One JSON 裡的 `pdfAttachment identifier`、`pdfAttachments[]`、MD5 與原生 `pdfs/` export contract 再補一輪。

現在 Reader 也能：

- 在 PDF 原本出現的位置保留 attachment。
- 沒有選 `pdfs/` 時顯示 placeholder。
- 選入 Day One 原生 `pdfs/` 後對應實際 PDF。
- 從 Reader 開啟該本機 PDF。

沒有重新命名。

沒有自己發明附件格式。

只是終於承認 PDF 的存在。

---

## 所以這份操作手冊保證不更新

這次經驗讓我們建立了一套非常成熟的文件維護政策：

# **保證不更新。**

至少不保證更新。

我們現在已經知道 Day One JSON、rich text、照片與 PDF 可以工作。

但一個用了八年的 Journal 到底還藏著什麼 export capability，我們不打算假裝已經遍歷宇宙所有可能。

所以未來如果又遇到某個 Reader 沒處理到、但剛好值得處理的東西：

可能。

或許。

大概。

會不定期掉落新版。

至於操作手冊會不會跟著更新，就看當時 AI 發電廠與人類文書部門的心情。

我們用 AI 做 Reader，就是因為想把力氣花在理解問題與做東西，不是為了成立文件維護處。

這不是 SaaS。

沒有 Roadmap。

沒有 SLA。

沒有客服。

**我們從一開始就沒有客服。**

---

## 你居然也想玩

如果看完這些事故現場之後，你還是想試，這裡把入口集中放好。

### 直接使用 Reader

[Day One Reader 網站版](https://ai-playground-lab.netlify.app/dayone-reader/)

不需要帳號。選擇 Day One export 的 JSON；有照片或 PDF 時，再加入原生 `photos/` / `pdfs/`。

### 先拿假的日記試，不要拿自己的人生祭天

[下載 Day One Reader 範例 Export ZIP](https://ai-playground-lab.netlify.app/downloads/dayone-reader/dayone-reader-sample-export.zip)

這份 Test Journal 是專門做來折磨 Reader 的 regression fixture，包含 JSON、照片與 PDF attachment，可以直接拿來試目前的完整 media flow。

### 不知道怎麼操作

[Day One Reader 使用指南 PDF](https://ai-playground-lab.netlify.app/downloads/dayone-reader/dayone-reader-guide-v0.5.pdf)

它可能不是永遠最新。

上一節已經很努力警告過了。

### 想完全留在 iPad 本機

[Textastic 官方網站](https://www.textasticapp.com/)

Reader 已在 iPad 的 Textastic Local Preview 路徑實機驗證。

### 已經買 Textastic，想順便把 Markdown Preview 養漂亮

[花 NT$2,290 買文字編輯器之後，我們決定自己補功能](https://ai-playground-lab.netlify.app/result/?id=WALL-TEXTASTIC-1)

裡面有安裝方式，也有我們目前使用的 customization artifacts。

### 始作俑者

[Day One 官方網站](https://dayoneapp.com/)

我們沒有要勸你離開 Day One。

剛好相反。

Claire 還在用。

我們只是想確認一件很樸素的事：

> **如果有一天要走，門真的打得開。**

---

## Export 不等於可攜

做到最後，Reader 真正留下來的其實不是「我們會 render Day One JSON」。

而是一個更簡單的判斷：

**資料可攜，不只是按得到 Export。**

Export 解決的是：

> 我能不能把資料拿出來？

真正長期的問題是：

> 原本的 App 不在身邊之後，這些資料對人還有沒有意義？

如果答案只是一包 technically valid、但沒有人想直接閱讀的 JSON，那扇門確實存在，只是門外還有一片荒地。

Day One Reader 做的事情很小。

它沒有取代原本的 App。

沒有建立新的日記平台。

也沒有發明另一套格式。

它只是站在 Export 的另一邊，把那些已經屬於你的資料重新排成人類看得懂的樣子。

這樣有一天真的要走時，帶走的不只是一份備份。

**還是你的日記。**

---

### Research / Implementation Notes

想知道我們到底對 JSON 做了什麼、哪些能力有 Evidence、哪些 boundary 還沒驗證，可以看：

[Day One JSON Local Reader Experiment Record](../../experiments/dayone-reader/README.md)

一般人看到這裡其實已經可以關掉了。

下面是留給那些覺得人生還不夠複雜的人。