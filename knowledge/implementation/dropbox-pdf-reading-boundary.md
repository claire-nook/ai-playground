# Dropbox PDF Reading Boundary｜實測限制

- Test date: 2026-09-18
- Status: Dated experimental evidence; connector behavior may change
- Evidence: [A-ARTIFACT-1](../../experiments/artifact-transport/README.md)
- Scope: PDF metadata, preview, text extraction, search, and temporary URL behavior

## Research question

在 2026-09-18 的 Dropbox Connector 測試環境中，PDF 能否直接取得全文或指定頁面內容？檔案大小對能力有何影響？

## Control cases

使用兩份真實文字 PDF 進行對照。為避免公開私人檔案名稱與儲存路徑，此處只保留檔案大小與可驗證結果。

| Control | File size | Observation |
| --- | ---: | --- |
| Small PDF | 2,784,964 bytes (2.66 MB) | Metadata、preview、完整 extracted text 均成功；擷取文字長度 360,763 characters |
| Large PDF | 99,768,096 bytes (95.15 MB) | Metadata、preview、temporary download URL 成功；完整 extracted text fetch 失敗 |

Large PDF 回傳的錯誤：

~~~text
FILE_TOO_LARGE
Maximum supported size is 5MB (5242880 bytes)
~~~

Small PDF 擷取內容包含目錄與正文。以上只證明當次控制組的行為，並非所有 PDF 的永久保證。

## Observed capability matrix

| Capability | Small control | Large control |
| --- | --- | --- |
| Metadata | Verified | Verified |
| Visual preview | Verified | Verified |
| Full extracted text fetch | Verified | Blocked at 5 MiB |
| Page-range text fetch | Not exposed | Not exposed |
| Partial / byte-range text fetch | Not exposed | Not exposed |
| Temporary direct download URL | Available | Available |
| Direct binary materialization into separate local processing runtime | Not established | Not established |
| PDF content search as section reader | Not established | Not established |

測試曾使用小型控制組已知的文法術語與大型控制組可能出現的字源術語進行搜尋，未取得結果。這不足以宣稱 Dropbox 永遠無法搜尋 PDF，但不能將搜尋當成已驗證的分頁閱讀替代方案。

## Transport is not extraction

~~~text
Dropbox PDF
→ metadata / preview / temporary single-use URL
= observed

temporary URL
→ separate runtime's PDF text or page-range reader
= not established in this experiment
~~~

取得 URL 不代表已能在另一個執行環境取得文字或指定頁面。Conversation 直接上傳 PDF 也屬不同的輸入介面，不能套用此處的 5 MiB fetch 限制。

## Practical interpretation and future verification

當時的 Dropbox-native 讀取方式對 2.66 MB 控制組有效；95.15 MB 控制組則受全文擷取上限阻擋。若需要大型 PDF 分頁閱讀，應先重新檢查當前 Connector 功能、檔案處理環境與授權，而不是把歷史限制當成永久事實。

此實驗沒有驗證自動分割、頁面範圍讀取、可靠的跨 runtime binary transfer，或長期讀書進度管理。相關完整研究脈絡見 [A-ARTIFACT-1](../../experiments/artifact-transport/README.md)。
