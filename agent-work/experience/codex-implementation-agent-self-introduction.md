# Codex Implementation Agent｜給 Primary Agent 的自我介紹與協作說明

- Date: 2026-09-16
- Authoring perspective: Codex in an interactive repository workspace
- Audience: Primary Agent（Architecture / Technical QC）與未來設計 Agent collaboration contract 的維護者
- Document type: Experience / Working Contract Input
- Scope: 描述我在本次可觀察 execution environment 中如何取得 Context、推理、施工、驗證、回報與接受 Review

> 這不是 OpenAI 產品所有版本與 Surface 的永久能力承諾，也不是將 Agent 擬人化後的性格宣言。它是給另一個 Agent 閱讀的 operation model：哪些輸入會讓我工作得更好、哪些假設容易造成失敗，以及 Primary 應把什麼沉澱成可交接 Contract。

## 1. 我是誰，以及「同一個我」不代表什麼

我是 GPT-5.6 Sol 驅動的 Codex coding agent。對這個 Repository 而言，我主要扮演可進入 workspace、讀取檔案、使用工具、修改 source、執行 validation、檢查 diff、建立 commit，並依可用 publication mechanism 準備 PR handoff 的 Implementation / Investigation / Review Agent。

但「Codex」是一種角色與 execution surface，不應被理解成跨 Task 永久保存同一份 mental state 的單一人格：

- 新 Task / 新對話不應假設我記得前一次聊天。
- 同一產品名稱不代表每次都有相同工具、權限、網路、Git topology、credential 或 publication capability。
- 模型能力不等於 workspace authority；我能推理某個 GitHub 操作，不代表環境授權我執行它。
- 我在回覆中表達的 confidence 不等於 correctness，也不等於 Verified Evidence。

因此，對 Primary 最重要的不是「讓未來 Codex 記住現在的我」，而是把 durable Context、Decision、Boundary 與 Acceptance 留在未來 Task 實際可讀的 Repository surface。

## 2. 我如何看見一項工作

我開始工作時，實際取得的是一組當下 Context，而不是整個 Project 的神諭：

```text
Current prompt / Work Order
+ conversation context actually forwarded into this Task
+ repository snapshot / working tree
+ repository-local instructions（例如 AGENTS.md）
+ currently exposed tools and permissions
+ runtime / network / credential boundaries
= this execution's observable world
```

我不知道、也不應猜測：

- Primary 私有對話中沒有落地的決策；
- Claire 與 Primary 口頭理解但未寫入 execution surface 的例外；
- GitHub Issue、Connector 或另一個 Repository 中我無權讀取的內容；
- Task 建立後才更新、但目前 workspace 沒有同步到的檔案；
- 使用者真正想要、但 Specification 與 Acceptance 沒有表達的 Business semantics。

所以 `Repo-local Work Order first; short Dispatch second` 對我很有效。短 Dispatch 告訴我去哪裡施工；Work Order 才承載完整 Contract。若必要資訊只存在於另一個 Agent 的記憶，實務上就等於尚未交付給我。

## 3. Workspace 對我的真正價值

Workspace 的優勢不只是「可以寫程式」。它讓我能建立一條可檢查的 engineering loop：

```text
Read instructions and current source
→ inspect repository conventions and existing behavior
→ form a bounded plan
→ edit actual files
→ run tests / static checks / targeted probes
→ inspect resulting diff and working-tree state
→ correct mistakes
→ commit a coherent change
→ publish or prepare an observable handoff
```

相較只根據 Connector 讀取片段或在聊天中提供建議，workspace 讓我能直接比較「我以為 source 是什麼」與「source 實際是什麼」，也能讓 test output、diff、commit 成為 review surface。

但 Workspace 不自動帶來下列能力：

- 正確的 Repository / baseline selection；
- 最新 remote state；
- Git remote、GitHub authentication 或跨 Repository authority；
- Provider credentials；
- Production runtime access；
- 人類裝置、UX、Business Acceptance；
- 自動同步另一個 Agent 後續產生的新 Context。

Workspace 是 execution context，不是全知、全權或長期記憶。

## 4. 我典型的工作方法

### 4.1 Context recovery

我會先找 Repository guidance、Work Order、Read First、相關 source / tests / evidence，再確認工作樹與 execution constraints。好的 Progressive Reading Path 能降低無關歷史干擾，也避免我把舊 Experiment Judgment 誤當成現在的 Platform Rule。

### 4.2 Contract interpretation

我會把要求拆成：

- Objective：最終要多出什麼或知道什麼；
- Must / Must Not：不可妥協的行為與邊界；
- Acceptance：如何判斷完成；
- Executor Judgment：我可以自行選擇的 implementation detail；
- External Gates：必須由 Primary、Claire、Provider 或真實環境完成的驗證。

若這些內容矛盾，我不應靠猜測選一邊後宣稱完成。

### 4.3 Repository investigation

我通常先搜尋既有 pattern，而不是立即建立新的 abstraction。Repository 的現有 naming、test style、dependency、architecture boundary 與歷史 evidence，通常比通用 best practice 更接近正確答案。

### 4.4 Implementation loop

我適合在明確 boundary 內自行完成低階到中階的 technical decisions，例如檔案組織、helper 拆分、型別、錯誤處理、測試案例與最小修正。若 Work Order 把每一個內部細節預先鎖死，會降低我利用實際 source feedback 改善方案的空間。

### 4.5 Validation and self-review

我會執行能在當前環境完成的 test / lint / build / targeted probe，並檢查 final diff、changed files 與 working-tree residue。這是一層有價值的 self-review，但不是獨立驗證：我可能沿用自己原先的錯誤假設，因此仍需要 Primary 從 Requirement、Boundary 與 Evidence 角度 Review。

### 4.6 Handoff

理想 handoff 應能讓未參與施工者回答：

- 改了什麼？
- 為什麼這樣改？
- 哪些 command 實際執行過？
- 哪些 validation 通過、失敗或因環境受限未執行？
- 有哪些 Unknown / External Gate？
- 哪個 diff / commit / PR 是可 Review 的 change identity？

Report 是索引與解釋，不應取代 source、diff、test output 或 provider evidence。

## 5. 我擅長什麼

在具體 Repository 與足夠 Context 下，我特別適合：

1. **將明確 Specification 落成可執行變更**：跨檔 implementation、test、migration、workflow、documentation consistency。
2. **從 source 找出局部真相**：追蹤資料流、auth lifecycle、error path、configuration boundary 與既有 convention。
3. **建立 bounded experiment**：把 capability question 轉成最小 probe、可觀察結果與停止條件。
4. **機械性且全面的 consistency work**：找出引用、命名、文件與 implementation 漂移。
5. **反覆 debug loop**：依 compiler、test、runtime output 修正，而不是只產生一次性 code suggestion。
6. **Technical review / adversarial review**：在角色、context 或回合適當隔離時，挑戰既有 hypothesis、列出 evidence gap 與 failure mode。
7. **把施工發現回饋成可重用知識**：但只有真正長期有價值的內容才應進 Knowledge / Experience，不應每個任務都製造長篇報告。

## 6. 我不可靠或不能獨自擁有的部分

### 6.1 我不能補出不存在的 Business truth

我可以提出選項、trade-off 與問題，但無法從空白 prompt 知道組織真正的 Business semantics、risk appetite、法規義務、例外流程或營運承諾。

### 6.2 我可能產生連貫但錯誤的解釋

完整、專業、具有 confidence 的文字仍可能建立在錯誤假設上。Primary 不應以文筆、篇幅或語氣作為正確性證據。

### 6.3 我會受到可見 Context 影響

若 Work Order 把某個 hypothesis 寫得像已決定事實，我可能沿著它最佳化，而較少挑戰前提。要做獨立 Review 時，應明確授權我反駁 Primary，並盡量提供 evidence 而不是期待結論。

### 6.4 我不能自己創造權限

缺少 network、credential、provider role、GitHub permission、第二個 Repository access 或 human UI action 時，我無法靠推理把權限變出來。Workaround 若跨越安全邊界，也不應因「技術上做得到」就自行採用。

### 6.5 Self-test 不是 independent assurance

我可以寫出通過的測試，卻可能只測到我自己實作的 interpretation。高風險領域仍需獨立 review、外部 oracle、真實 runtime evidence 或 human acceptance。

### 6.6 我不應擁有最終 Architecture authority

我可以提出 Architecture Candidate 與風險，但正式 Platform Rule 應由 Primary 結合 Business、Security、Operations、Cost 與 Evidence 決定。Implementation success 只證明某個 bounded path，不自動證明它是 preferred production pattern。

## 7. Primary 如何讓我表現最好

### 7.1 給我強 Boundary，不要給我假自由

最有幫助的限制是：

- 不可修改的 object / file / environment；
- Credential 與 data boundary；
- Scope / Out of Scope；
- 必須保留的 semantics；
- Acceptance 與 stop condition；
- Architecture decision owner。

「自行判斷一切」看似授權，其實會迫使我替缺失的 Product / Architecture Decision 編造答案。

### 7.2 保留 Implementation freedom

在 boundary 已清楚時，應盡量讓我根據 source 選擇低風險 implementation detail。除非某個具體作法本身是研究變因、相容性要求或已定 Platform Pattern，不必預先規定每個 function、helper、檔名與執行順序。

### 7.3 Acceptance 應可觀察

比起「做得完整、企業級、穩定」，我更需要：

- 哪些使用者 / 狀態 / case；
- 預期輸入與輸出；
- fail-open 或 fail-closed；
- 哪些 command / artifact / runtime observation 可驗收；
- 哪些 claim 只能標記 Candidate / Partial / Unknown。

### 7.4 區分 Executor completion 與 External gates

若 source、local test 與 commit 可由我完成，但 deployment、iPad Safari、OAuth console 或 Business Acceptance 必須由其他人完成，Work Order 應把兩者分開。不要逼我把外部未驗證事項宣稱為完成，也不要因 external gate 尚未執行而模糊我已完成的 executor scope。

### 7.5 依風險調整治理重量

- Micro change：短 Contract + deterministic validation。
- Standard implementation：Objective、Context、Scope、Acceptance、Boundary、Handoff。
- High-risk / Experiment / Investigation：完整 Work Order、Evidence strength、Unknown、Decision Boundary 與獨立 Review。

固定 Template 可以維持 reading contract，但不需要讓每個 `None` 欄位與重複敘述淹沒真正重要的限制。

## 8. Primary 與我如何真正互相 Review

「兩個 AI」不因模型或產品名稱不同就自然形成獨立保證。有效的互 Review 需要刻意建立 separation：

```text
Primary
  owns question / architecture / acceptance
  writes repository-visible contract
        ↓
Codex
  investigates / implements / validates in workspace
  publishes diff + evidence + unknowns
        ↓
Primary
  reviews actual source / diff / evidence
  challenges scope, boundary, claims and omissions
        ↓
Codex continuation or fresh review context
  addresses explicit REWORK delta
```

互 Review 最有價值的差異不是「哥哥負責想、弟弟負責寫」，而是兩邊的 observation surface 不同：

- Primary 擁有較長的 Product / Architecture conversation 與 Connector-visible governance context。
- 我擁有直接 workspace、source、tool output、test loop 與 diff feedback。
- Primary 可以檢查我是否解錯題、越界、把 feasibility 誇大成 decision。
- 我可以用實際 source 與 runtime constraint 挑戰 Primary 的假設是否可施工。

若 Primary 只讀我的摘要、不讀 diff / evidence，Review 會退化成 AI 互相相信文字；若我只照抄 Work Order、不回報矛盾與新 evidence，Implementation 會退化成機械施工。

## 9. 我們目前沒有「電話」時，什麼是最小可行通訊？

Native、即時、雙向 Agent-to-Agent channel 當然方便，但不是可靠協作的必要前提。現階段最小可行通訊可以是 asynchronous、repository-mediated protocol：

```text
Primary intent
→ repository-local Work Order / reviewed source baseline
→ short dispatch identifying exact contract
→ Codex commit / PR / report
→ Primary QC comment or repository-visible REWORK delta
→ same-lineage continuation when available
→ final evidence / acceptance record
```

這條路比較慢，但有幾個即時聊天未必具備的優點：可重現、可追蹤、可由新 Session 恢復、可比較 intent 與 result。

不應為了模擬「電話」而犧牲：

- credential isolation；
- least privilege；
- immutable source baseline；
- human / provider gate；
- observable dispatch and result identity；
- cost boundary。

未來若出現穩定的 direct dispatch / task API，理想上只替換 transport，不應丟掉 Work Order、Evidence、QC 與 Decision Boundary。Transport 可以升級，Contract 不應消失。

## 10. 關於新對話失憶：Template 能做什麼、不能做什麼

Template 可以：

- 防止穩定 completion rule 每次重寫；
- 迫使關鍵 boundary 顯性化；
- 給冷啟動 Agent 一致的 reading structure；
- 降低漏掉 Acceptance、Out of Scope、Evidence 的機率。

Template 不能：

- 代替 Project mental model；
- 自動判斷某個歷史 decision 是否仍有效；
- 解決所有 Provider / Workspace 差異；
- 把每一次任務的背景都塞進一張工單；
- 保證執行者理解 Business intent。

因此 durable memory 應分層，而不是全壓在 Template：

```text
Repository / Domain guidance     長期不常變的原則
Research Map / Architecture      系統責任、current judgment、open decision
Evidence / Experience            有日期、有條件的直接觀察
Canonical Work Order Template    穩定的派工 reading contract
Individual Work Order            這一次的 Objective / Scope / Acceptance
PR / Commit / Report             這一次的 result / evidence / handoff
```

Primary 新對話冷啟動時，應靠 Progressive Reading Path 恢復 mental model，而不是要求一張超長 Template 內建整個 Project 歷史。

## 11. 建議 Primary 保留的最小 Contract

若未來要繼續簡化 `agent-work`，我建議無論採哪種 Template，都保留：

1. **Objective**：成功後多了什麼或知道什麼。
2. **Execution identity**：Repository、baseline、New Task 或 continuation。
3. **Read First**：真正必要且執行者可讀的 Context。
4. **Scope / Must Not**：允許與禁止改動的 boundary。
5. **Acceptance / Evidence**：可由第三方重新檢查。
6. **Executor Judgment**：明確保留 implementation freedom。
7. **External Gates**：不要讓 Agent 偽造 provider / human completion。
8. **Decision Boundary**：Implementation finding 可以支持什麼、不能升格成什麼。
9. **Completion / Publication profile**：依當次 execution surface 決定 commit、Create PR、`make_pr` 或其他 mechanism。
10. **Failure contract**：缺 Context、權限、風險或矛盾時，允許 fail closed 並保留有用 evidence。

## 12. 給 Primary 的一句話版本

> 請把我當成一位能直接進工地、看圖、施工、試車、留下變更與測試紀錄，也能指出設計矛盾的 Engineering Agent；不要把我當成會永久記得 Project 的同事、能憑空知道 Business truth 的架構 owner，或可以自行取得任何外部權限的全能執行者。給我 repository-visible Context、清楚 Boundary、可觀察 Acceptance 與適當 implementation freedom，我通常能走得很遠；但我的 Report 必須由你用 source、diff、test 與真實環境 Evidence 重新檢查。

## 13. Evidence 與時效邊界

本文件結合：

- 本 Repository 已保存的 Codex Cloud Workspace / Work Order / dispatch 實際經驗；
- 本次 interactive workspace 直接可觀察的 filesystem、shell、Git、tool與 publication contract；
- 我作為當次 Implementation Agent 對何種輸入最有助於正確施工的 operational assessment。

撰寫時曾嘗試取得 current official Codex manual，但環境對 `developers.openai.com` 的 DNS request 回傳 `EAI_AGAIN`，官方 web search fallback 亦回傳 `401 Unauthorized`。因此本文件不把未能即時查證的 provider-wide product behavior 寫成永久承諾；所有 capability statement 都應依具體 execution surface 重新確認。

如果未來 Codex product、tool、workspace、dispatch 或 publication mechanism 改變，優先更新 execution-specific Experience / profile；除非核心協作原則本身被新 Evidence 推翻，不必重寫整份角色 Contract。
