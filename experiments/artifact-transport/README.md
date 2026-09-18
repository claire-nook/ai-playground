# A-ARTIFACT-1 — AI-assisted Artifact Collaboration Workflow

- Date: 2026-09-18
- Status: In Progress / Partial Evidence Established
- Primary Intent: Claire × Primary Agent / Private Artifact Intake / Processing / Delivery / Repository Handoff
- Tags: agent-collaboration, artifact-workflow, dropbox, github, ipad-first, binary-transport, privacy-boundary, human-middleware

## Research Question

這個 Experiment 不研究「Dropbox Connector 有哪些功能」。

真正的問題是：

> Dropbox、Conversation、Primary Agent local workspace 與 GitHub 能否組成一條低摩擦的 Artifact Collaboration Workflow，讓 Claire 只保留有判斷價值的投遞 / 授權 / 接收動作，而不再承擔 resize、rename、manual upload、commit、push 等人工 middleware responsibility？

研究焦點因此是 workflow outcome，不是 connector feature checklist。

~~~text
Human Intake
→ Artifact Discovery
→ Agent Processing
→ Working Storage
→ Repository / Delivery Routing
→ Human Output
~~~

Experiment 目前仍在進行中；已建立部分 transport evidence，但尚未形成完整雙向閉環。

---

## Privacy / Safety Boundary

本 Experiment 會接觸私人檔案空間，因此公開 Research Record 只保存技術邊界與匿名化 Evidence。

規則：

- 不記錄既有私人 / 家庭 / shared folder 的真實名稱。
- 不記錄與技術判斷無關的私人檔名、文件名稱或 storage topology。
- 既有私人資料區域視為 out-of-scope，不進行無目的列舉、搜尋、讀取、搬移或修改。
- 只有專門建立的 AI collaboration area 與 Claire 明確指定的測試素材屬 Experiment surface。
- Public Evidence 優先記錄 capability、failure mode、size boundary、transport shape，而不是私人內容。

這不是「標記哪幾個箱子特別珍貴」。公開文件不應先替攻擊者畫藏寶圖。

---

## Collaboration Model Under Test

目前候選責任分工：

~~~text
Claire
├── 投遞原始素材
├── 必要的 authorization / payment / acceptance gate
└── 接收 finished artifact

Primary Agent
├── 發現 / 讀取素材
├── MIME / size / metadata inspection
├── rename / resize / convert / split / merge
├── 管理 AI-owned working area
├── routing to GitHub / delivery storage
└── 保存 Evidence / Current Judgment

Dropbox
├── private intake
├── private reference
├── AI working storage candidate
└── human delivery storage candidate

GitHub
├── canonical technical source
├── versioned repository artifact
├── durable research evidence
└── agent collaboration state
~~~

核心原則：

> Human 應負責有判斷價值的 gate；Agent 應吸收純搬運、格式處理、命名與 routing。

---

## Workspace Shape Under Test

目前只建立最低必要結構：

~~~text
Dropbox
├── AI Inbox        # Human Drop Zone / raw source stays unchanged
└── AI 工作區        # Agent-owned working area
~~~

AI Inbox 的命名是 iPadOS / Dropbox picker UX evidence 的結果。通用 Inbox 比特定「圖片暫存區」更能承擔未來 image / PDF / other artifact intake，而且排序較容易被 Human 快速選取。

候選但尚未建立：

~~~text
AI Output           # Human-facing finished artifacts
~~~

不預先建立大量空 folder。Folder taxonomy 應由真實 workflow pressure 產生，不進行「資料夾寶可夢蒐集」。

---

## Completed / Observed Evidence

### 1. Dropbox collaboration-area management

已驗證：

- Primary Agent 可建立 AI-owned folder。
- folder rename / move 可成功執行。
- Human Drop Zone 可從 iPad Share Sheet 投遞檔案。
- Primary Agent 可列出指定 Inbox immediate children 並取得 file id / path / modified time / size。

~~~text
Create folder          Verified
Rename / move folder   Verified
List Inbox             Verified
Human Share Sheet      Verified
~~~

這代表 Claire 不需要負責 AI working-area 的日常結構管理。

### 2. Dropbox discovery / preview

已驗證 Primary Agent 可：

- 找到 Inbox 中的新圖片。
- 取得 metadata。
- 取得 image / PDF preview。
- 對可 fetch 的文字 PDF 取得 extracted text。

但 Preview 與 binary transport 是不同能力。能「看到」不等於能把原始 bytes 搬進 local processing workspace。

### 3. Small text PDF as private AI-readable reference

小於 Connector fetch size boundary 的文字 PDF，已驗證可直接取得完整 extracted text，足以支援摘要、教學、重新組織、semantic chunking 與 reference-driven reasoning。

這條 workflow 不要求 Claire 把 PDF 內容複製進 Conversation。

### 4. Large PDF fetch boundary

大型 PDF 實測出現明確 boundary：

~~~text
Whole-file fetch limit: 5 MiB
~~~

超過 boundary 時：

- metadata：可
- preview：可
- temporary download link：可
- whole-file extracted-text fetch：不可
- page-range fetch：目前沒有
- direct binary handoff into local processing workspace：尚未打通

重要 finding：

> Search / Preview / Download Link / Fetch 各自存在，不代表它們組合後必然形成可用的大型 PDF AI reading workflow。

### 5. Dropbox → local workspace binary transport

目前 Direct Path 結果：

~~~text
Dropbox file
→ temporary single-use download URL      Verified
→ Primary Agent local workspace          Blocked / Not established
~~~

阻礙不是 resize / PDF processing 技術本身，而是 connector tool world 與 local processing tool world 之間的 binary transport boundary。

因此目前不能宣稱 Dropbox binary → local processing 已完成。

### 6. Conversation → local workspace image processing

以 Conversation-provided JPEG 作 control artifact，已直接驗證：

~~~text
Conversation attachment
→ local workspace
→ rotate
→ resize
→ new JPEG artifact
~~~

結果：

- rotate：Verified
- resize：Verified
- re-encode：Verified
- new local artifact：Verified

這證明 Processing Layer 本身可工作；Dropbox direct path 的問題位於 transport，而不是圖片加工能力。

### 7. Local workspace → GitHub binary

已完成真正的 binary path：

~~~text
Processed JPEG
→ Base64 transport representation
→ GitHub blob
→ Git tree
→ Git commit
→ experiment branch
~~~

結果：

~~~text
Create binary blob     Verified
Create tree            Verified
Create commit          Verified
Create branch          Verified after retry
~~~

GitHub 最終保存的仍是真正 binary JPEG，不是 Base64 text artifact。

因此先前「Primary Agent 不能上傳圖片到 GitHub」的舊判斷應修正為：

> 沒有簡單的 generic binary upload action，但 Primary Agent 可以透過 Git object / blob path 建立 binary repository artifact。

### 8. GitHub ref mutation intermittent behavior

第一次更新 ref / 建 branch 曾被 safety layer 擋下；後續相同 intent 重試成功建立 experiment branch。

Current Judgment：

- capability 存在；
- tool / safety layer 可能出現 transient or context-sensitive blocking；
- 不應把單次 blocked call 誤判為永久 provider incapability。

這類 instability 本身屬 Agent Workflow reliability evidence。

### 9. Human fallback already improved

即使 Dropbox direct binary transport 最後仍無法打通，目前至少存在低摩擦 fallback：

~~~text
A. Photos → Conversation attachment
B. Files / Dropbox picker → Conversation attachment
~~~

一旦素材進入 Conversation，後續 rotate / resize / rename / GitHub binary routing 可由 Primary Agent 接手。

這已經把 Claire 的人工 responsibility 從：

~~~text
resize
→ save
→ Working Copy upload
→ ask canonical filename
→ rename
→ commit
→ push
~~~

縮小為：

~~~text
select / share source artifact
~~~

---

## Planned Experiment Matrix

### A. Source → Primary Agent workspace

| Path | Status | Question |
| --- | --- | --- |
| Conversation → Local Workspace | Verified | attachment 是否可直接加工 |
| Dropbox → Local Workspace | Open / blocked | connector binary 能否直接 materialize |
| GitHub → Local Workspace | Open | repository binary 能否直接 materialize |

### B. Primary Agent workspace → Destination

| Path | Status | Question |
| --- | --- | --- |
| Local Workspace → GitHub | Verified | binary artifact 是否可 version / commit |
| Local Workspace → Dropbox | Open | generated local artifact 是否可 upload 回 AI 工作區 |
| Local Workspace → Human Output | Open | finished artifact delivery contract |

### C. End-to-end workflow

後續至少要驗證：

~~~text
Dropbox → Primary → GitHub
GitHub → Primary → Dropbox
Conversation → Primary → Dropbox
Conversation → Primary → GitHub        Verified in major path
~~~

### D. PDF lifecycle

待驗證：

- large PDF local materialization
- semantic split into AI-readable chunks
- chunk storage in AI working area
- merge into Human-facing complete PDF
- working artifact vs delivery artifact ownership

候選 shape：

~~~text
AI Working Area
├── part-01.pdf
├── part-02.pdf
└── part-03.pdf

Human Output
└── complete.pdf
~~~

AI-readable working representation 不必等於 Human delivery representation。

### E. Inbox lifecycle

仍需收斂：

- raw source 是否永久保留於 Inbox
- processed artifact 是否搬出
- cleanup timing
- archive 是否真的需要
- duplicate / retry / failed-processing handling

目前原則：

> Inbox 是 Human Drop Zone，不把它變成 Agent 內部 taxonomy。

### F. Rollback / recovery

待驗證：

- rename / move rollback
- wrong-destination recovery
- Dropbox revision / restore behavior
- GitHub binary cleanup / branch cleanup
- partial failure 時如何保留 provenance

---

## Netlify Publisher Probe — Phase C

為了避免 Primary Agent 每次手工執行 Base64 → Git blob → tree → commit → ref，建立了一個極窄的 Netlify Function PoC：

~~~text
netlify/functions/artifact-publisher.mts
~~~

部署狀態：

- Netlify production deploy：Verified
- Function route：`/artifact-publisher`
- Runtime：Node.js 24
- Public GET health / deterministic Base64 round-trip probe：implemented
- POST publish path：implemented
- GitHub destination：固定 `claire-nook/ai-playground`
- Allowed prefix：固定 `experiments/artifact-transport/publisher-output/`
- Allowed MIME：JPEG / PNG / WebP
- Size limit：4 MiB processed artifact（不是 raw source 上限；Netlify synchronous Function 的 buffered request/response payload 為 6 MB，binary upload 經 Base64 後有效 binary ceiling 約 4.5 MB，因此 PoC 保守採 4 MiB）
- Round-trip verification：source SHA-256 + byte length vs GitHub read-back
- GitHub credential：**not configured**
- Publisher request key：**not configured**

POST publish 目前刻意停在 credential boundary。Netlify project 尚未配置任何 environment variable，而 GitHub write token 不應寫進 source code，也不能從 ChatGPT GitHub Connector 匯出成 Runtime secret。

因此目前 Evidence 是：

~~~text
Repository code
→ Netlify deploy
→ Serverless Function available                 Verified

Netlify runtime binary/Base64 implementation     Implemented
Netlify Function → GitHub write                  Blocked by missing explicit runtime credential
Conversation/local artifact → Function POST      Agent transport path not yet established
~~~

這個結果把問題拆得更精確：

> Netlify managed runtime 可以承擔 binary publisher 的 execution responsibility；真正剩下的是 runtime GitHub identity 與 Agent → Function request transport，而不是 image processing 本身。

這個 PoC 沒有把 Public Wall 當測試寫入區。第一個可寫 destination 被限制在 Experiment-owned path，避免用真正公開素材驗證 credential / transport。

---

### Local Image Artifact Processor

新增：

~~~text
scripts/process-image-artifact.py
~~~

用途不是取代 Conversation 私密圖片處理，而是把「準備進 Repository 的公開／研究圖片」先標準化為可驗證 artifact。

目前功能：

- EXIF orientation normalize
- longest-edge resize
- JPEG / PNG / WebP output
- metadata stripping
- output reopen / decode verification
- source + output byte size
- source + output SHA-256
- dimensions / format / EXIF-entry evidence

第一個實測使用既有 soup image：

~~~text
source bytes:   140598
output bytes:   136302
output size:    1024 x 768
output format:  JPEG
output EXIF:    0 entries
output SHA-256: 0f09e106f7ad077ce075b74daadeb957d49c9de7e8acff3def8530909cd193eb
status:         verified
~~~

這表示 image processing / validation 本身可以收斂成 reusable batch。真正尚未解決的是 validated local artifact 如何可靠進入遠端 publisher。

### Transport Reassessment

進一步查核 Netlify Functions 平台限制後，10 MiB synchronous upload 並不可行。Netlify buffered request / response payload 上限為 6 MB，而 binary payload 經 Base64 transport 後官方給出的有效 binary ceiling 約為 4.5 MB。

因此 publisher 的 4 MiB 限制是「processed artifact transport limit」，不是 Claire 原始截圖／相片大小限制。原始來源可以大於 4 MiB；在 Conversation/local runtime 先 resize / re-encode 後，再進 publisher 才合理。

另外，目前 Primary Agent 的可用工具沒有 generic arbitrary HTTP POST capability。也就是：

~~~text
Conversation/local artifact
→ Netlify custom POST endpoint
~~~

目前沒有直接、穩定的 Agent transport primitive。

因此 Netlify Publisher PoC 現階段證明的是 managed runtime feasibility，而不是完整 Agent publication path。若要正式採用，仍需 connector/plugin/MCP 類 integration，否則只是在 GitHub binary 手工鏈旁邊多蓋一座漂亮但 Agent 進不去的收費站。

---

## Current Judgment

A-ARTIFACT-1 尚未完成，但已得到幾個穩定判斷：

1. Dropbox Connector 的價值不能用 feature checklist 評估。真正要看它能否降低 Claire 的人工 middleware responsibility。
2. Conversation attachment 已是有效的 binary intake surface。即使 connector direct binary path 受限，Human fallback 仍可保持低摩擦。
3. Primary Agent local processing 已驗證可處理圖片。
4. Primary Agent → GitHub binary 已驗證可行。Git blob path 可以承擔一般 text-file API 不支援的 binary artifact。
5. Dropbox direct binary → local workspace 仍是目前主要 transport gap。
6. Private storage experiments 必須 privacy-scrub。Public Evidence 保存技術結論，不保存私人 storage topology。

目前 Research Question 已從：

> Dropbox Connector 可以做什麼？

升級為：

> 如何把 Connector、Conversation、local processing workspace、Dropbox 與 GitHub 組成一條讓 Human 不再充當檔案 middleware 的 Artifact Collaboration Workflow？

> Capability checkbox ≠ usable workflow.
