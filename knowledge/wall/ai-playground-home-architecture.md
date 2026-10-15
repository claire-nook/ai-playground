# 從 GitHub Repository 到公開研究網站：AI Playground 的內容發布架構

> **Lab Wall / Technical Commentary**  
> 初稿：2026-10-11｜公開內容架構修訂：2026-10-15

一份研究 Markdown 放進 GitHub，距離「外部讀者可以在網站上找到它」還有多少步？

AI Playground 是一個公開研究 Repository，保存實驗主紀錄、觀察證據、可重用技術方法，以及供讀者瀏覽的研究網站。它不是某個 AI 的私人記憶庫，也不是所有專案的總部。這篇文章只討論它的一項職責：**研究資料如何從 Repository 變成公開網站上的可發現內容，以及讀者如何追溯其來源。**

## 第一張圖：研究內容與網站是不同層次

```text
ai-playground/
│
├─ README.md
│  └─ 公開研究工廠入口
│
├─ experiments/
│  └─ Experiment Record + *.catalog.json
│
├─ evidence/
│  └─ 測試觀察與驗證證據
│
├─ knowledge/
│  ├─ README.md / experiments.md
│  ├─ implementation/
│  └─ wall/ + *.catalog.json
│
├─ scripts/
│  └─ Catalog 建置與完整性檢查
│
├─ public/
│  └─ 網站首頁、閱讀器與靜態資源
│
└─ netlify.toml
   └─ 建置、發布與觸發規則
```

這不是把目錄拆得越多就越像工程師。每一層處理的問題不同：

- **Experiment Record**：研究什麼、怎麼測、哪些結論成立，哪些仍未驗證。
- **Evidence**：實際觀察、控制條件與可追溯的結果。
- **Implementation**：已驗證的方法如何重現，以及適用邊界。
- **Wall**：值得對外解釋的研究觀點與技術故事。
- **Catalog metadata**：網站用來辨識、分類、排序與連結研究成果的結構化資料。
- **public/**：將上述資訊呈現給瀏覽器的網站程式。

Repository 是研究內容的保存處，公開網站則是它的呈現方式。兩者有關係，但不是同一份東西。

## 第二張圖：公開網站怎麼從 Repository 長出來？

這是根據 Repository 的 `scripts/build-experiment-catalog.mjs` 與 `netlify.toml` 整理的建置關係：

```text
GitHub：ai-playground
│
├─ experiments/**/*.catalog.json ─┐
│                                  │
├─ knowledge/wall/**/*.catalog.json
│                                  │
│                                  ▼
│     scripts/build-experiment-catalog.mjs
│                                  │
│                     驗證欄位／ID／recordPath
│                                  │
│                                  ▼
│               public/research-catalog.json
│               public/experiment-catalog.json
│                         （相容性輸出）
│                                  │
├─ public/index.html               │
├─ public/assets/                  │
│                                  ▼
└─ netlify.toml ──────────→ Netlify Build
                                   │
                                   ▼
                             publish: public/
                                   │
                                   ▼
                      https://ai-playground-lab.netlify.app
                                   │
                                   ▼
                            Browser / Reader
```

這張圖表示**原始碼定義的建置流程**，不是即時部署成功證明。

Catalog Builder 會遞迴讀取 `experiments/` 與 `knowledge/wall/` 下的 `*.catalog.json`，檢查必要欄位、狀態、重複 ID，以及 `recordPath` 指向的 Markdown 是否存在。驗證成功後，輸出 `public/research-catalog.json`，並同時產生供舊版讀取器相容的 `public/experiment-catalog.json`。

`netlify.toml` 設定執行：

```text
node scripts/build-experiment-catalog.mjs
```

並以 `public/` 作為靜態發布目錄。

網站的呈現由 `public/index.html` 與 `public/assets/` 中的程式負責。**Markdown 是研究主紀錄，Catalog 是網站索引資料，前端閱讀器則負責顯示。**

### 最容易誤會的一件事

> **新增一份 Markdown，不等於網站會自動出現一張研究卡片。**

若缺少對應的 Catalog metadata，Builder 可能成功執行，但網站索引仍不知道這份研究存在。反過來說，metadata 若缺少必要欄位、狀態無效，或指向不存在的 Record，Builder 可能直接失敗。

這些是不同問題，不能用「GitHub 上有檔案」一句話混過去。

### Git 提交也不等於網站部署

目前 `netlify.toml` 包含依變更路徑判斷是否需要部署的 ignore 規則。單純修改研究 Markdown，通常不會因為內容文字改變就觸發新部署；變更 Catalog metadata、`public/`、Builder 或 Netlify 設定等發布相關檔案，則屬部署觸發範圍。遇到部分無法可靠判斷的 Git 狀態，設定也包含保守執行部署的分支。

因此至少要區分四道證據：

```text
Repository 已提交
        │
        ▼
Catalog 已成功建置
        │
        ▼
Netlify 已完成部署
        │
        ▼
瀏覽器已實際驗證
```

這四步不能互相冒充。尤其「建置設定看起來正確」不代表某一次部署已經成功，更不代表讀者看到的頁面沒有問題。

## 第三張圖：讀者如何追溯一項研究？

```text
公開研究網站／Repository README
               │
               ▼
        Research Catalog
               │
               ▼
       Experiment / Wall
               │
               ├── Research Question
               ├── Method / Observations
               ├── Evidence / Failure Modes
               └── Current Judgment
                         │
                         ▼
           Implementation Guide（如有）
```

公開網站負責讓研究容易被找到；Repository 裡的主紀錄則負責讓結論有來源可查。

一張研究卡片可以提供摘要、分類與入口，但它不能取代完整的實驗紀錄。讀者仍應能看見測試條件、失敗結果、已知限制，以及結論成立的範圍。

這也是為什麼研究資料不能只留下「Verified」。如果沒有當時的測試方法與證據，未來讀者只知道有人曾經宣稱成功，卻無法判斷那個成功究竟代表什麼。

## 第四張圖：研究成果不等於正式系統

```text
Technical Unknown
       │
       ▼
Public Research / Experiment
       │
       ├─ 假設與原型
       ├─ 實測與 Evidence
       └─ Current Judgment
               │
               ▼
     Candidate Implementation Pattern
               │
               ▼
       Formal Project Review
               │
       ├─ Specification
       ├─ Architecture
       └─ Production Implementation
```

研究成果可以為正式系統提供依據，但公開研究 Repository 不會因為某個實驗成功，就自動變成正式產品的規格來源。

原型能跑、實驗通過、方法可重用、正式系統採納，是四種不同的判斷。把它們分清楚，才能既保存探索價值，又不把尚未審查的研究程式誤當成正式產品。

## 最後：公開的是研究，不是內部工作生活

AI Playground 的價值，不在於展示研究者使用多少工具、維護多少工作場所，而在於讓外部讀者能夠回答：

**研究做過什麼？證據在哪裡？哪些方法值得重用？網站上的成果又是如何被建置與發布的？**

這是一座公開研究工廠的職責。它可以是整個開發生態系中的一個工作場所，但不需要充當任何人的家，也不必對外展示私人協作流程。

畢竟讀者是來看研究成果，不是來參觀辦公室的員工置物櫃。

---

### Wall Note

本文保留 2026-10-11 對 AI Playground 網站架構的觀察，並於 2026-10-15 重新聚焦公開內容發布流程。建置描述依據 Repository 原始碼與設定；**未以本文宣稱當次 Netlify 部署或瀏覽器驗收已完成**。

延伸閱讀：[AI Playground Repository](https://github.com/claire-nook/ai-playground) · [公開研究網站](https://ai-playground-lab.netlify.app) · [實驗成立與站台發布規範](../research-catalog-publication.md)
