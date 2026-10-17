# AI-CONNECTOR-FLOW-1｜AI Connector 資料讀取、加工與持久化交付

<!-- experiment: {"id":"AI-CONNECTOR-FLOW-1","card":"required","index":"required"} -->

- 成立日期：2026-10-17
- 狀態：Partial / Phase A INSERT 與摘要閉環、B2 兩種資料庫來源至 Dropbox 已驗證；A UPDATE 未測、C 原生 Storage 上傳 BLOCKED，B1 站著模式受工具契約阻擋
- 研究方法：Controlled Experiment
- 研究對象：AI Connector、資料庫讀寫、物件儲存、Workspace 資料交接
- 實驗場域：ChatGPT Conversation；Codex Cloud 不列入本實驗必測範圍

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

執行環境：ChatGPT Conversation。每條路徑記錄當次 Connector 方法、資料型別、工具參數契約、是否進入 Workspace、資料量與權限邊界；同樣的內容、相同轉換規則作為對照。既有 Codex Cloud 相關成果僅作背景，不構成本實驗驗收條件。

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
- B2：來源 Table → Workspace → TXT／JSON／EPUB 等檔案 → Dropbox 指定測試輸出區。**坐著路徑**，用於驗證資料進入工作台、實體封裝與遠端交付；EPUB 是候選格式，不是通過條件。
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

## 2026-10-17｜Phase A 實測紀錄：Conversation 原生 Table → AI → Table

**結論：本次 A1、A2 的 INSERT／讀回閉環 PASS；完整 A 範圍尚未結案。** 本段記錄當次 ChatGPT Conversation 實測；無人值守排程屬其他研究方向，不納入本實驗驗收。

### 測試流程與直接觀察

1. **原創內容寫入：** ChatGPT 生成七章繁體中文原創科幻故事（約 4,382 Unicode code points、12,674 UTF-8 bytes），以 Connector 寫入 Supabase PostgreSQL 與 Cloudflare D1 各自的測試來源 Table，來源列均為 `oid=1`。故事全文不存入公開 Repo。
2. **模型閱讀邊界：** 初次 SQL 查詢雖取得全文，工具對模型只輸出字數與頭尾片段，因此不能宣稱模型已閱讀全文。修正後，Supabase Connector 的完整 `content` 確實展開至模型上下文；這證明「工具取得全文」與「模型實際看到全文」必須分別驗證。原視窗曾生成該故事，因此不算獨立盲測。
3. **跨視窗盲測：** 新 ChatGPT Conversation 依 Notion 交接文件，受命分別從 Supabase 與 D1 來源 Table 讀取並生成繁體中文摘要，寫入各自的摘要 Table；交接不提供故事劇情或標準答案。
4. **獨立資料庫驗收：** 原視窗重新透過 Supabase SQL Connector 與 Cloudflare D1 Connector SELECT 目標摘要 Table，兩邊均查得 `oid=1`、`source_content_oid=1`、`created_by='chatgpt-blind-test'`，摘要內容完整且彼此不同，能正確交代主要人物、核心轉折及尚未完全完成的結局。
5. **可確認的執行時間：** Supabase 摘要列建立於 2026-10-17 08:56:07 UTC；D1 摘要列建立於 08:56:09 UTC，約相隔兩秒。時間接近與摘要不同不單獨證明兩套來源均曾獨立完整展開至模型上下文。

### 驗收矩陣

| 測項 | 結果 | 證據／限制 |
| --- | --- | --- |
| ChatGPT 原創內容 → Supabase 來源 Table INSERT | PASS | 來源 `oid=1`，曾讀回全文與長度 |
| ChatGPT 原創內容 → D1 來源 Table INSERT | PASS | 來源 `oid=1`，曾讀回長度與頭尾 |
| Supabase 來源 → AI 摘要 → Supabase 摘要 Table INSERT | PASS | 原視窗獨立 SELECT，摘要 `oid=1`、來源 `oid=1` |
| D1 來源 → AI 摘要 → D1 摘要 Table INSERT | PASS | 原視窗獨立 SELECT，摘要 `oid=1`、來源 `oid=1` |
| 新視窗兩套 Connector 各自全文進入模型上下文 | PARTIAL | 摘要語義正確，但本主 Record 尚未收錄新視窗逐步工具輸出，不能僅由資料庫內容證明兩次獨立全文閱讀 |
| UPDATE／重跑冪等性 | NOT TESTED | 本次僅驗證 INSERT |
| Dropbox／Supabase Storage 交付（Phase A 當時） | NOT TESTED | 本表保留 Phase A 當時狀態；後續 B 的結果見下方 Phase B 紀錄 |

### 已觀察到的失敗與界線

- 原視窗曾嘗試 Supabase → D1 的跨 Connector 原文轉送，遇到工具安全檢查阻擋；不影響兩個來源各自的 INSERT／摘要閉環，也不能宣稱跨 Connector 原文搬運已成功。
- 初次「全文讀取」僅在工具執行環境內成立，模型只看到 metadata；後來才修正為實際輸出全文。這是本實驗重要的 negative evidence。
- 目前驗收證明目標資料庫確實有正確摘要；新視窗完整閱讀的嚴格證據仍需執行視窗的工具紀錄。未測試大規模內容或反覆執行。
- 本次是 **Conversation 內互動式 Connector 執行**，未建立自製 API、Edge Function 或額外後端。就本次可見流程，屬「站著」的候選路徑；不將模型上下文或工具執行環境誤稱為 Execution Workspace。

### Current Judgment（本階段）

**Partial / Verified sub-paths：** 互動式 ChatGPT 可透過 Connector 生成內容、持久化寫入資料庫，並對資料庫內容進行語義摘要後再寫回另一 Table；Supabase 與 D1 的目的地讀回驗證均成功。A 的 UPDATE 與執行紀錄完整性仍需驗證。正式 B 為 Table → Dropbox（B1 直接交付、B2 Workspace／EPUB 對照）；無人值守排程與 Connector 授權繼承僅屬可能的後續獨立研究方向，不是本實驗 Phase B。

## 預定執行順序（原計畫，非上述實測紀錄）

1. 確認測試 Table、Bucket、授權與可用 Connector 的實際讀寫契約；不得破壞共用測試資源。
2. 優先執行 A 的最小 INSERT／讀回閉環，再擴展 UPDATE。
3. 執行 C1／C2 的文字／JSON 交付，辨識站著是否可行。
4. 執行 B1，再評估 B2 的 Workspace 與 EPUB 路徑。
5. 逐 Run 保存直接 Evidence；只有完成驗證的路徑才升級對應結論。

## 已知背景與待驗證界線

- 既有 Codex Cloud 實測曾將 Notion／Dropbox Connector 文字重建至 Workspace、加工 EPUB、上傳 Dropbox 並核對遠端結果；本實驗仍須獨立驗證 ChatGPT Conversation 的 Table 來源交付路徑。
- Supabase Storage 寫入 Connector 是否接受直接文字／bytes／本機檔案路徑 **待查**；D1 與 Supabase 讀寫權限、資料量上限也須以當次工具驗證。
- 研究工廠是公開 Repo；真實環境憑證、私人作品內容及非公開操作資訊不得入庫。
- 本次已取得 A1／A2 INSERT 與摘要寫回的直接證據；B2 後續已驗證；B1 站著模式遭工具契約阻擋，C 與 A 的 UPDATE 仍未測試。

## Current Judgment

**Partial：** A1／A2 的互動式 INSERT／摘要閉環與 B2 的 Supabase／D1 → Workspace → Dropbox 節錄交付均已驗證；B1 站著模式 BLOCKED；A UPDATE 未測、C 原生 Storage 上傳 BLOCKED。A 是核心業務能力，B 是工作台／人類交付能力，C 是 Connector 直接物件交接能力。站著與坐著是資料流路徑，不是優劣排名；成功與否需逐路徑驗證。

## Evidence

Phase A 的本次執行結果與驗收矩陣已直接保存在本主 Record。摘要列由原視窗分別在兩套資料庫獨立 SELECT 驗證；未另建平行 Evidence Record。新視窗逐步工具紀錄尚未歸檔，故不擴大聲稱盲測的完整閱讀路徑已經逐步稽核。


## 2026-10-17｜Phase B 實測紀錄：Table → Dropbox（Conversation）

**本階段結論：B1 站著模式 BLOCKED（未實際送出 Dropbox 上傳）；B2 坐著模式的 Supabase 與 Cloudflare D1 兩條節錄交付鏈路皆 PASS。** 本次以同一筆合成小說測試資料（來源 `oid=1`，4,382 字元）為基礎；輸出只含來源註記及開頭節錄，**不等於全文保真驗證**。本階段由 ChatGPT Conversation 互動式完成，不涉及 Codex Cloud、人工複製或人工上傳。

### B1｜站著：Supabase → Model Context → Dropbox

- **Source**：Supabase PostgreSQL `public.test_ai_content`、`oid=1`。Connector SQL SELECT 讀取正文成功，來源長度 4,382 字元；模型可取得正文。
- **限制**：目前可用 Dropbox `upload_file` 的描述要求 `source_file` 指向平台可辨識的來源檔案；工具集合未找到直接接受純文字 `content` 並建立 Dropbox 檔案的入口。嚴守「不經 Execution Workspace」的 B1 條件，因此沒有先建立本機檔案、沒有發出 Dropbox 上傳呼叫，也沒有遠端讀回。
- **Outcome**：來源讀取 PASS；直接文字寫檔 **BLOCKED（tool-contract boundary）**；目的地驗收 NOT TESTED。這是「當次工具集合與實驗條件下未找到可行寫入路徑」，**不是 Dropbox API 永遠無法接受文字，也不是已經取得 Dropbox 拒絕上傳的證據**。

### B2-S｜坐著：Supabase → Model Context → Workspace → Dropbox

- **Source**：Supabase `public.test_ai_content`，`oid=1`，4,382 字元。
- **Transformation**：由讀取結果選取小說標題、第一節與前段節錄，加上來源與字數註記；在 Execution Workspace 建立 UTF-8 TXT，**749 bytes**。輸出不是全文備份。
- **Destination**：Dropbox `<Dropbox 測試輸出區>/<Supabase B2 測試檔>.txt`。使用 `dropbox.upload_file`，參數 `source_file` 傳入 Workspace 絕對路徑，`destination_path` 傳入完整 Dropbox 路徑；工具先回 `in_progress`，經 `check_upload_file_status` 取得 `completed`，Dropbox 遠端檔案識別已於當次 Connector 回應確認（公開紀錄不揭露 file ID），server modified `2026-10-17T10:38:13Z`。
- **Independent readback**：再次使用 `dropbox.fetch` 從遠端路徑讀取，文字包含來源註記、小說標題與原始節錄，與本輪生成檔內容一致。分享連結不列入公開紀錄。
- **Outcome**：**PASS（節錄加工／交付）**；未執行來源全文與遠端檔案的逐 byte/hash 保真比對。

### B2-D｜坐著：Cloudflare D1 → Model Context → Workspace → Dropbox

- **Source**：Cloudflare D1 `lab-smoke-db` 的 `test_ai_content`、`oid=1`；D1 Connector 透過 SQL 查詢回傳原文節錄及 `length(content)=4382`，HTTP 200、`success=true`、`rows_read=1`、`rows_written=0`。**本次查詢直接取的是節錄，並未展開整篇 4,382 字元到模型**，不可誤稱已完成全文閱讀。
- **Transformation**：將實際查得的節錄與來源註記封裝成 Workspace UTF-8 TXT，**757 bytes**；不是全文備份。
- **Destination**：Dropbox `<Dropbox 測試輸出區>/<D1 B2 測試檔>.txt`，由 Connector 上傳完成；遠端 metadata 的 server modified 為 `2026-10-17T10:39:32Z`。
- **Independent readback**：再次使用 `dropbox.fetch` 讀回，確認來源註記、標題及節錄內容與預期一致。分享連結不列入公開紀錄。
- **Outcome**：**PASS（節錄加工／交付）**；沒有全文保真或雜湊驗證。

### 觀察矩陣

| 測項 | Supabase | Cloudflare D1 | 限制 |
| --- | --- | --- | --- |
| B1 站著：Table → Context → Dropbox | BLOCKED | NOT TESTED | 來源讀取 PASS，但缺乏符合 B1 的文字寫檔入口；未嘗試上傳 |
| B2 坐著：Table → Context → Workspace TXT | PASS | PASS | 兩者均為來源節錄，非全文封裝 |
| B2 坐著：Workspace → Dropbox | PASS（重試） | PASS | Supabase 第一次呼叫遇安全檢查阻擋；重試成功 |
| B2：Dropbox 獨立讀回 | PASS | PASS | 已核對節錄內容；未做 byte/hash 驗證 |
| B2：完整節錄交付鏈路 | **PASS** | **PASS** | 僅證明本次互動式 Conversation 的節錄流程 |

### 公開紀錄的資訊邊界

- 本文件**不公開 Dropbox 分享 URL、file ID、namespace ID、完整私人資料夾路徑**；驗證依據為執行時 Connector 回傳與獨立讀回紀錄，必要時由具授權的執行者重新查驗。
- GitHub commit 歷史可能仍保留先前版本中誤公開的連結；更新最新版本**不等於清除歷史紀錄，也不會撤銷既有分享連結**。如有存取風險，須另行處理 Dropbox 分享權限與 Git 歷史。

### 給後續 AI 的操作經驗與排錯提醒

1. **不要把「我不會呼叫工具」當成「平台不支援」。** Dropbox `upload_file` 的說明文字強調 `source_file` 由 ChatGPT fileParams 注入、不可自行建構，但本次實際可呼叫的介面接受 `source_file` 字串。曾有模型僅憑說明就宣稱無法上傳；後來實際傳入已存在的 Workspace 檔案絕對路徑，成功取得非同步上傳回應、完成狀態與獨立讀回。**此為當次觀察，不保證其他版本或其他檔案類型也適用。**
2. **先分清「站著」與「坐著」，不可偷換路徑。** B1 不能為了漂亮的 PASS 偷建 Workspace 檔案；B2 則應明確留下 Workspace 實體檔案及 Dropbox 遠端讀回的證據。
3. **單次安全檢查阻擋不等於持續性平台限制。** Supabase B2 首次上傳遭平台安全檢查阻擋，沒有取得 Dropbox 端回應；使用**同一來源檔與相同目的地**重新呼叫後，取得 `in_progress` → `completed`。根因未知，不能直接歸因於視窗故障、資料庫來源或安全政策永久禁止。Cloudflare D1 B2 當次成功，樣本不足以比較平台穩定性。
4. **`in_progress` 不是成功，也不是失敗。** 必須保留 `operation_id`，使用 `dropbox.check_upload_file_status` 輪詢直到 `completed`；然後再用 `dropbox.fetch` 從目的地獨立讀回。單看工具回傳「完成」不滿足本研究的端到端 PASS 標準。
5. **資料來源可見性與輸出保真是兩個問題。** 工具查得全文，不等於模型一定收到全文；D1 本輪只要求節錄，因此不宣稱全文展開。兩份遠端 TXT 均為節錄檔，驗證的是可追溯的來源文字加工與交付，而非全文逐位元一致。
6. **重試是新的觀察，不是擦掉第一次的錯誤。** 研究紀錄同時保存首次阻擋、再次成功與未知根因。實驗的目的在辨識能力邊界，而不是把所有狀態塗成 PASS。

### Phase B Current Judgment

**Verified sub-paths：** Supabase → Workspace → Dropbox、Cloudflare D1 → Workspace → Dropbox，均完成 TXT 節錄交付與遠端獨立讀回。**Blocked sub-path：** Supabase B1 站著模式在當次 Dropbox Connector 輸入契約下未找到直接文字寫檔路徑，未發出上傳。D1 B1、B2 全文保真、大檔與重跑冪等性均未驗證。研究整體仍為 **Partial**；A UPDATE 未測；C 已完成 Connector 能力預檢，未找到原生上傳工具。


## 2026-10-17｜Phase C 結果：Supabase Storage Connector 能力預檢

**C1（Supabase Table → Storage）、C2（Cloudflare D1 Table → Storage）：BLOCKED。** 當次 Supabase Connector 工具清單沒有原生 Storage 物件上傳操作。已透過唯讀 SQL 查詢 Storage metadata，確認私人測試 Bucket 與兩個零位元組資料夾 placeholder；此結果僅證明 metadata 可見，不代表物件內容可讀或可上傳。未發出上傳請求，亦未進行遠端物件讀回，因此不能標示為上傳 FAIL 或交付 PASS。

本研究限定 Connector 原生交付，不以 Edge Function、自製 API 或其他 HTTP 路徑替代。這是當次工具能力邊界，不代表 Supabase 平台沒有 Storage 上傳 API。**保留 C 作為有效的 BLOCKED 實驗結果，不刪除。**

## 本輪結案摘要

- A：Supabase 與 D1 的 INSERT／摘要寫回及目的地獨立讀回 PASS；UPDATE、冪等性未測。
- B：站著直接文字交付 BLOCKED；兩種資料庫來源經 Workspace 產生節錄 TXT、上傳 Dropbox、獨立讀回 PASS；全文保真未測。
- C：Supabase Connector 缺少原生 Storage 上傳工具，C1／C2 BLOCKED；唯讀 metadata PASS，未上傳。

實驗已完成本輪能力邊界調查；整體證據狀態仍為 Partial。往後測試其他 API 呼叫能力，應獨立記錄，不改寫本實驗的 C 結果。
