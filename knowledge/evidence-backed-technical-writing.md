# Evidence-backed Technical Writing｜證據型技術寫作

這份 Guide 給未來的 Primary Agent / 墨衡，也給任何接手 AI Playground Research Record 的 Agent。

Playground 的公開技術文件不以「寫得像專家」為目標，而以 **讓讀者能分辨我們知道什麼、怎麼知道、還不知道什麼** 為目標。

AI 很擅長把零散資訊整理成完整敘事。完整敘事不等於完整證據。技術文章尤其不能因語句流暢，就把 Document Claim、Runtime Observation、Inference 與 Architecture Judgment 混成同一件事。

---

## 1. Core Rule｜Claim 要有 Evidence 身分

對會影響 Technical Judgment 的重要 Claim，應能回答：

1. **Claim 是什麼？**
2. **Evidence 從哪裡來？**
3. **Evidence 發生在什麼時間 / 版本 / 環境 / Identity Context？**
4. **這份 Evidence 能支持到哪裡？**
5. **哪一部分仍是 Inference / Unknown？**

若無法回答，不要把 Claim 寫成 Verified Fact。

推薦的基本分類：

- **Direct Runtime Evidence**：實際 command、HTTP response、database state、browser behavior、workflow log、provider runtime observation。
- **Provider Contract Evidence**：官方文件、CLI help、API schema、產品介面明確 contract。
- **Human Environment Evidence**：Claire 在自己的 iPad / Browser / Provider UI 實際看到或操作的結果。
- **Repository Evidence**：source、Git history、PR、workflow、configuration 等可重讀 artifact。
- **Inference / Judgment**：由上述 Evidence 推導出的目前判斷。
- **Unknown**：證據不足，不用漂亮句子補洞。

> **Narrative coherence ≠ Evidence completeness.**

---

## 2. Separate Observation from Judgment｜看到什麼，和我們怎麼判斷，不要黏死

技術文章至少要能區分三層：

### Observation

當時實際看到什麼。

例如：

```text
Codex Cloud task workspace 中 `git remote -v` 為空。
```

### Interpretation

這個 Observation 合理代表什麼。

例如：

```text
目前觀察到的 Cloud workspace 比較像 selected-repository snapshot，而不是一般帶 origin 的 Git clone。
```

### Judgment

這對 Architecture / 下一步意味什麼。

例如：

```text
不要把 workspace presence 等同 GitHub fetch / push authority；publication 應視為另一個 boundary。
```

不要把三句壓成：

```text
Codex Cloud 不能操作 GitHub。
```

後者看起來俐落，實際上把三層資訊一起謀殺了。

---

## 3. Negative Evidence Is Evidence｜撞牆不是空白

以下都可能是有價值的 Experiment Result：

- 403 / 404 / timeout。
- command 不存在。
- network 不通。
- repo 有檔案但沒有 remote。
- credential 存在但沒有 target permission。
- scheduler 顯示 success，但 business state 沒改變。
- product 宣稱 integration，但沒有 cross-agent task dispatch primitive。
- 技術上可行，但 billing / credential custody / maintenance cost 不符合 Architecture Constraint。
- provider 目前沒有安全、supported 的能力，因此 Decision 是 `WAIT / Deferred by Provider Gap`。

Failure Record 應留下：

```text
Condition → Observation → Failure Boundary → What it rules out → What remains possible
```

不要把後來的成功改寫成「之前從來沒失敗過」。歷史 failure 常常比最後成功的 source code 更能避免未來再撞一次。

> **牆在哪裡，本身就是地圖的一部分。**

---

## 4. Evidence Strength Must Match Language｜證據多強，句子就寫多強

建議用語：

- **Verified / Confirmed**：有直接 runtime evidence 或明確 provider contract 支持。
- **Supported by current evidence**：多項 evidence 指向同一判斷，但 scope 有限。
- **Plausible**：機制合理，有部分 evidence，仍缺關鍵驗證。
- **Unknown**：資料不足。
- **Unsupported for this architecture**：可能 technically possible，但不符合目前 security / cost / maintenance / role boundary。

避免：

- 「一定可以」只因文件提到某個 feature。
- 「一定不行」只因一次 probe 失敗。
- 「官方支援」只因 repo 裡有人做過。
- 「已驗證」只因另一個 Agent 的 report 寫了 success。

> **Agent Report ≠ Verified Evidence. Repository Example ≠ Provider Contract. Technical Possibility ≠ Architecture Recommendation.**

---

## 5. Record the Context That Can Make Evidence Expire｜讓未來知道這份證據會不會過期

Provider / AI Agent 能力變動很快。重要 Evidence 至少應在適當位置保存：

- Date。
- Provider / Product Surface。
- Runtime / CLI / API Version，若可取得且有意義。
- Repository / Commit / Branch baseline。
- Authentication / Identity mode，但不得保存 secret material。
- Sandbox / Network / Permission context，若會影響結果。
- Human Environment，例如 iPad Safari、Desktop App、Provider Dashboard。
- Known limitation / untested area。

因此：

```text
2026-09-15 沒有找到 stable Cloud Task API
```

是 Evidence。

```text
OpenAI 沒有 Cloud Task API
```

則很可能只是替未來製造一個過期祖訓。

---

## 6. Public Writing Should Be Re-checkable｜公開不是要別人相信我們，而是讓別人能重新檢查

AI Playground 是 public repository。公開研究紀錄的價值不是權威感，而是 **可重新驗證性**。

理想的讀者可能是：

```text
另一個 Human
→ 另一個 AI Agent 搜尋到這份 Record
→ 讀取 Method / Evidence / Version / Limitation
→ 自己重新 probe
→ Confirm / Refute / Supersede
```

因此公開文件應優先保留：

- reproducible method；
- evidence source / artifact link；
- exact boundary；
- negative result；
- uncertainty；
- re-open / re-test trigger。

不要為了文章順暢把 Unknown 刪掉。Unknown 正是下一組人不用重新猜測的起點。

---

## 7. When Writing a Technical Article from Playground Research｜從實驗紀錄長成文章時

Experiment Record 與公開文章責任不同。

Experiment Record 優先完整保存 Evidence；文章可以有敘事、觀點、比喻與較好的閱讀節奏，但不能讓敘事把 Evidence 等級洗掉。

推薦文章骨架：

```text
Question / Why it mattered
→ Initial hypothesis
→ What we inspected / tested
→ Evidence
→ What failed or surprised us
→ Current interpretation
→ Architecture implication
→ What remains unknown
→ Re-test trigger
```

文章可以很好看，但讀者應始終能辨認：

> 哪些是世界真的回給我們的東西，哪些是我們對那些東西的理解。

---

## 8. Primary Agent Writing Check｜墨衡在收尾前自問

有意義的研究結束、撰寫 Experiment Record / Evidence Index / Research Map / 技術文章時，至少檢查：

- 我有沒有把 provider documentation 說法誤寫成 runtime fact？
- 我有沒有把 implementation agent report 誤寫成 independently verified evidence？
- 我有沒有把一次 failure 過度推廣成 universal impossibility？
- 我有沒有把 technically possible 誤寫成 architecture recommended？
- 我有沒有留下 date / version / environment，讓未來知道這份結論何時可能過期？
- 我有沒有保存 negative evidence，而不是只留下最後成功畫面？
- 我有沒有明確寫出 Unknown / Limitation / Re-open Trigger？
- 如果陌生的另一個 AI 明天搜尋到這份文件，它能不能知道該相信哪一段、該重新驗證哪一段？

如果答案不夠清楚，先補 Evidence Structure，再補漂亮文字。

AI 時代最不缺漂亮文字。不要讓 Playground 也加入內容農場。