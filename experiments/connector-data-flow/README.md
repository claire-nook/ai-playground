# AI-CONNECTOR-FLOW-1｜AI Connector 資料讀取、加工與持久化交付

<!-- experiment: {"id":"AI-CONNECTOR-FLOW-1","card":"required","index":"required"} -->

- 成立日期：2026-10-17
- 狀態：Candidate / Planned（尚未執行 A／B／C 測試）
- 研究方法：Controlled Experiment
- 研究對象：AI Connector、資料庫讀寫、物件儲存、Workspace 資料交接
- 實驗場域：ChatGPT Conversation 與 Codex Cloud，依當次工具可用性分別驗證

## 研究問題

AI 透過 Connector **讀得到**外部資料，是否也能將資料**實際運用**，完成轉換、寫入另一個 Table，或交付遠端檔案？不同來源與目的地是否需要 Workspace？讀取成功不得代替寫入成功。

## 主要定義

- **站著**：來源資料經 Connector 回傳後，由模型與工具參數完成加工／交付，**不進入 Execution Workspace**。模型處理文字不等於工作台處理。
- **坐著**：Connector 資料**明確進入 Execution Workspace**，供程式、檔案工具或記憶體運算處理；不要求一定產生本機實體檔案。
- **Remote Artifact**：遠端資料庫紀錄或物件；與 Model Context、Tool Result、Workspace 資料各自區分。
- **PASS**：必須有目的地重新讀取、內容比對等直接證據；僅工具回報成功不足以證明端到端完成。
- **FAIL / BLOCKED / NOT TESTED**：分別記錄實際失敗、環境阻礙、尚未測試，不以單次結果推論所有平台永久限制。

## 實驗來源與變因

來源：Supabase PostgreSQL Table、Cloudflare D1 Table；Supabase Storage 的來源讀取能力可作後續獨立延伸，不混入本輪核心比較。

執行環境：ChatGPT Conversation、Codex Cloud。每條路徑記錄當次 Connector 方法、資料型別、工具參數契約、是否進入 Workspace、資料量與權限邊界；同樣的內容、相同轉換規則作為對照。不能把 Codex 成功推論為 ChatGPT Conversation 成功，反之亦然。

測試資料採**非敏感合成資料**，具有穩定 ID、順序、繁體中文段落、特殊字元、換行與可驗證摘要；不以模型記憶重建來源，不把私人小說正文或內部憑證提交到公開 Repository。

## A｜Table → Table（核心）

**業務動機**：未來 AI 作家／編輯需要讀取章節、加工內容，再把新章節或修訂結果可靠寫回資料庫。

- A1：Supabase Table → AI 整理／轉換 → **另一個 Supabase 測試 Table**。
- A2：D1 Table → AI 整理／轉換 → **另一個 D1 測試 Table**。
- 延伸對照：D1 → Supabase Table、Supabase → D1 Table，需在實際需要且工具授權足夠時另測；不預先當成已通過。
- 分別驗證 INSERT（新增）與 UPDATE（修改）；UPDATE 優先保留原始資料或版本紀錄，避免破壞性覆寫。
- 驗收：重新 SELECT 目標 Table，核對來源 ID、筆數、順序、轉換規則、字元／換行、版本與重跑結果。觀察是否無需人工複製貼上。

## B｜Table → Dropbox（人類交付與 Workspace 對照）

- B1：來源 Table → AI 整理成 TXT／JSON → Dropbox 指定測試輸出區。**候選站著路徑**，但是否能不經 Workspace，取決於 Dropbox 寫入工具接受文字／內容或僅本地檔案路徑。
- B2：來源 Table → Workspace → EPUB → Dropbox 指定測試輸出區。**候選坐著路徑**，用於驗證資料進入工作台、實體封裝與遠端交付。
- 兩者皆驗證 Dropbox 遠端 metadata、大小／雜湊（可取得時）與內容；EPUB 另檢查 ZIP／章節結構及實際閱讀器匯入（後者需人類驗證）。
- 先前 Codex 已完成 Notion／Dropbox 文字來源到 EPUB 的其他實驗；**不等於本實驗的 Table 來源已通過**。

## C｜Table → Supabase Storage（物件交付）

**不強制 EPUB**；優先採可核對的 TXT／JSON，測試整理後能否直接交付物件。

- C1：Supabase Table → AI 整理 → Supabase Storage。
- C2：Cloudflare D1 Table → AI 整理 → Supabase Storage。
- **候選站著路徑**；若 Storage 工具要求本機路徑而需 Workspace，記錄實際走法，不將其誤判為站著。
- 驗收：目的 Bucket 物件存在、大小與內容可重新讀取比對；跨平台來源與同平台來源分別判定，不把 C1 成功歸因於「Supabase 內部自動整合」。

## 共同觀測欄位

| 欄位 | 記錄方式 |
| --- | --- |
| Run ID／日期／執行者 | 每次執行獨立標識 |
| Source / Destination | 服務、資料型別、測試物件識別（公開文件不暴露私人路徑） |
| Tool contract | 實際讀寫方法、輸入格式、資料大小／上限 |
| Model / Tool / Workspace | 明確分辨資料經過的邊界 |
| Execution mode | 站著／坐著／未能判定，附依據 |
| Transformation | 可重現的轉換規則與來源保真檢查 |
| Outcome | PASS／FAIL／BLOCKED／NOT TESTED |
| Evidence | 目的地讀回、筆數、內容比對、檔案驗證、必要時人工驗收 |
| Limitation | 根因已證實或仍未知，避免過度外推 |

## 預定執行順序（非執行紀錄）

1. 確認測試 Table、Bucket、授權與可用 Connector 的實際讀寫契約；不得破壞共用測試資源。
2. 優先執行 A 的最小 INSERT／讀回閉環，再擴展 UPDATE 與不同執行環境。
3. 執行 C1／C2 的文字／JSON 交付，辨識站著是否可行。
4. 執行 B1，再評估 B2 的 Workspace 與 EPUB 路徑。
5. 逐 Run 保存直接 Evidence；只有完成驗證的路徑才升級對應結論。

## 已知背景與待驗證界線

- 既有 Codex Cloud 實測曾將 Notion／Dropbox Connector 文字重建至 Workspace、加工 EPUB、上傳 Dropbox 並核對遠端結果；本輪新來源、新目的地與 ChatGPT Conversation 的相同能力仍 **NOT TESTED**。
- Supabase Storage 寫入 Connector 是否接受直接文字／bytes／本機檔案路徑 **待查**；D1 與 Supabase 讀寫權限、資料量上限也須以當次工具驗證。
- 研究工廠是公開 Repo；真實環境憑證、私人作品內容及非公開操作資訊不得入庫。
- 本次僅成立實驗與測試計畫；**尚未建立測試 Table／Bucket、尚未讀寫外部資料、尚未取得 A／B／C 執行證據**。

## Current Judgment

**Candidate：** A 是核心業務能力，B 是工作台／人類交付能力，C 是 Connector 直接物件交接能力。站著與坐著是資料流路徑，不是優劣排名；成功與否需逐路徑驗證。

## Evidence

尚無本實驗執行 Evidence。實際執行後按 Run 記錄並更新本主 Record；需要時建立延伸 Evidence 文件及 Evidence Index 條目。不要將計畫寫成已驗證結果。
