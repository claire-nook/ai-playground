# A-ARTIFACT-1 — AI-assisted Artifact Collaboration Workflow

- Date: 2026-09-18
- Status: In Progress / Core Image Publication Workflow Operational
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

Experiment 目前仍在進行中；核心 image publication workflow 已 operational，但 general artifact lifecycle 尚未形成完整雙向閉環。

---

## Current State Snapshot｜2026-09-18

先讀這一節，再決定是否需要往下考古。下方 Completed Evidence / Probe 記錄保留研究過程與被取代的假設；**本節代表目前最新 operational judgment**。

### 已成立的主要協作路徑

~~~text
Conversation attachment
→ Primary local processing
→ resize / convert / EXIF normalize / metadata strip
→ output reopen + bytes / SHA-256 validation
→ Dropbox upload_file staging
→ Dropbox download_link
→ short-lived single-use binary URL
→ batch_json
→ Claire 每批執行一次 [COLLAB] Artifact Batch Publish
→ GitHub Actions Runner direct binary fetch
→ bytes / SHA-256 / full decode verification
→ atomic repository commit
→ Primary repository / visual QC
~~~

這條路徑已完成：

- real processed JPEG transport verification；
- 1-item batch verification；
- multi-item batch verification；
- formal Wall image same-path replacement；
- explicit publication allowlist 擴充至 `public/images/wall/**`；
- temporary source URL 不落入 Repository。

Canonical collaboration tool：

~~~text
[COLLAB] Artifact Batch Publish
.github/workflows/collab-artifact-batch-publish.yml
.github/workflow-contracts/artifact-batch-publish.schema.json
~~~

### Current Capability Matrix

| Direction / Capability | Current Status | Current Judgment |
| --- | --- | --- |
| Conversation → Primary local workspace | **Verified** | 目前最可靠的 binary intake / processing surface |
| Primary local image processing | **Verified** | resize / re-encode / EXIF normalize / metadata strip / decode / hash 可做 |
| Primary local artifact → Dropbox | **Verified** | 可用 `upload_file` staging processed artifact |
| Dropbox staged file → temporary binary URL | **Verified** | `download_link` 可產生短效 single-use URL |
| temporary URL → GitHub Actions → Repository | **Verified / Operational** | real-image direct binary fetch + integrity verification + commit 已成立 |
| 1-item / N-item batch publication | **Verified / Operational** | 單張不是 special case；皆走 batch contract |
| Wall image publication / replacement | **Verified / Operational** | allowlist 已包含 `public/images/wall/**` |
| Primary autonomous `workflow_dispatch` | **Unavailable in current GitHub Connector** | Claire 仍保留每批一次 manual Run human gate |
| Dropbox existing binary → Primary local workspace | **Blocked / Not established** | 不得與反方向 Primary → Dropbox 混為一談 |
| GitHub repository binary → Primary local workspace | **Open** | 尚未建立 general materialization path |
| Primary local workspace → Human Output | **Open** | finished-artifact delivery contract 尚未收斂 |
| GitHub → Primary → Dropbox | **Open** | general reverse routing 尚未驗證 |
| Large PDF materialization / split / merge lifecycle | **Open / Partial** | metadata / preview / small-text fetch 有 Evidence；general binary lifecycle 未完成 |
| Inbox lifecycle / cleanup / retry / duplicate handling | **Open** | 尚未收斂 operational policy |
| Rollback / recovery | **Open** | wrong destination / revision / partial failure recovery 尚未完整驗證 |

### Human Responsibility Today

圖片進 Repository 的日常協作，Claire 的 responsibility 已從：

~~~text
resize
→ save
→ rename
→ Working Copy upload
→ commit
→ push
~~~

縮小為：

~~~text
提供 / 選定 source artifact
→ 做必要的公開 / functional judgment
→ 每批按一次 Run
~~~

Primary 應自行處理 Repository navigation、加工、命名、Dropbox staging、temporary URL、canonical `batch_json` 與 publication 後 QC。

### 尚未達成的 Experiment Stop Condition

A-ARTIFACT-1 **不能因為 image publication tool 已 operational 就宣告 Completed**。母實驗仍在研究 broader artifact collaboration lifecycle。

目前真正 remaining gaps：

1. Dropbox 既有 binary 如何可靠 materialize 到 Primary local processing workspace。
2. Primary autonomous dispatch 是否有 supported execution surface，可移除每批 manual Run。
3. Human-facing finished artifact delivery / Dropbox output lifecycle。
4. GitHub / Dropbox reverse routing 與 general bidirectional closure。
5. Large PDF / multi-part document lifecycle。
6. Inbox cleanup、retry、duplicate、rollback / recovery policy。

因此目前最準確的狀態是：

> **Core image publication workflow operational; general bidirectional artifact collaboration remains in progress.**

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

## Historical Planned Experiment Matrix

> **Historical note:** 這是 Experiment 中途建立的 planning matrix，保留作研究演進紀錄。部分 `Open` 已被後續 Evidence 關閉或改寫；**判讀現在狀態請以文件前方 Current State Snapshot 為準。**

### A. Source → Primary Agent workspace

| Path | Historical Status | Current Note |
| --- | --- | --- |
| Conversation → Local Workspace | Verified | 仍為 Verified / preferred binary intake |
| Dropbox → Local Workspace | Open / blocked | 仍 Blocked / Not established |
| GitHub → Local Workspace | Open | 仍 Open |

### B. Primary Agent workspace → Destination

| Path | Historical Status | Current Note |
| --- | --- | --- |
| Local Workspace → GitHub | Verified | Verified；另已有更低摩擦的 Dropbox staging → GitHub Actions publication path |
| Local Workspace → Dropbox | Open | **Superseded：現已 Verified** via Dropbox `upload_file` |
| Local Workspace → Human Output | Open | 仍 Open |

### C. End-to-end workflow

原始 planning targets：

~~~text
Dropbox → Primary → GitHub
GitHub → Primary → Dropbox
Conversation → Primary → Dropbox
Conversation → Primary → GitHub
~~~

Current note：

- `Conversation → Primary → Dropbox`：**Verified**
- `Conversation → Primary → Dropbox staging → GitHub Actions → GitHub`：**Verified / Operational**
- `Dropbox existing binary → Primary → GitHub`：仍受 Dropbox → Primary local materialization boundary 阻擋
- `GitHub → Primary → Dropbox`：仍 Open

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

### GitHub Actions Text-Chunk Transport Probe

為了避開 direct binary blob upload，新增：

~~~text
scripts/assemble-image-artifact.py
.github/workflows/artifact-text-ingest.yml
~~~

流程：

~~~text
Agent
→ UTF-8 Base64 chunks
→ GitHub text files
→ manifest.json
→ push-triggered GitHub Action
→ chunk reassembly
→ expected byte length verification
→ expected SHA-256 verification
→ Pillow full image decode
→ binary artifact commit
~~~

Synthetic multi-chunk probe 已成功：

~~~text
chunks:             3
base64 characters:  92
decoded bytes:      68
SHA-256:            431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460
decoded format:     PNG
decoded dimensions: 1 x 1
EXIF entries:       0
workflow result:    success
~~~

GitHub 產生的 binary output：

~~~text
experiments/artifact-transport/publisher-output/poc-text-chunks.png
~~~

size 與 expected bytes 同為 68 bytes。

第二輪將 workflow trigger 收窄為只監看：

~~~text
experiments/artifact-transport/queue/**/manifest.json
~~~

因此 chunks 可以先逐一 stage，只有最後 manifest arrival 會觸發一次 Action。第二個 probe `poc-trigger-gate` 成功，證明 manifest-as-commit-gate 可避免每個 chunk 都喚醒 Runner。

這個結果代表：

> Agent 可以用可靠的 UTF-8 GitHub write path 間接建立真正 binary artifact，而且不需要 Claire 手動按 GitHub Actions Run。

但 scale 尚未驗證。嘗試把現有 136 KB JPEG 直接經由模型上下文搬運成約 48K-character chunk 時，人工／模型中介的 payload construction 本身就變得笨重且容易失真。該次不完整 staging chunk 已立即刪除，且沒有 manifest，因此沒有觸發 assembly。

這不是 GitHub text write 的失敗證據，而是新的架構限制：

> 「模型把大量 Base64 字串搬進 tool arguments」不應成為正式 transport implementation。

因此 text-chunk Action 是有價值的 **binary assembly primitive**，但仍需要一個不依賴 LLM token/context 搬運大 payload 的 chunk producer / transport adapter。

Claire 手動按 `Run workflow` 可以保留成 fallback human gate，但目前 push-triggered manifest gate 已證明 AI 可以自行喚醒 Runner；真正剩下的缺口仍是大 binary payload 如何從 Conversation/local workspace 可靠進入 staging。

---

### GitHub Actions Remote-Binary Transport Probe → Collaboration Tool

為了避開 LLM context 搬運大量 Base64，新增：

~~~text
scripts/ingest-image-from-url.py
.github/workflows/collab-artifact-batch-publish.yml
~~~

候選流程：

~~~text
Conversation attachment
→ Primary Agent local processing
→ Dropbox AI Inbox staging
→ single-use temporary download URL
→ GitHub Actions Runner
→ direct binary download
→ expected byte length verification
→ expected SHA-256 verification
→ Pillow full image decode
→ binary artifact commit
~~~

Real-image probe 使用 processed JPEG，已由 Claire 進行必要的 manual `workflow_dispatch` gate。

驗證結果：

~~~text
Dropbox staged bytes: 221676
output bytes:         221676
SHA-256:              58b6e8211abae2119bd870613ee6c8ccc74c32fc4832e9515bc7952c342a4cd9
decoded format:       JPEG
decoded dimensions:   1152 x 1536
EXIF entries:         0
source URL persisted: false
repository output:    experiments/artifact-transport/publisher-output/soup-remote-ingest.jpg
status:               verified
~~~

這證明：

> 大 binary payload 不需要經過 LLM text/context，也不需要 Base64 chunk transport。若 Primary 能先把 local artifact 放進 Dropbox，GitHub Runner 可以用短效 download URL 直接抓 binary，並以 bytes / SHA-256 / full decode 做 integrity verification。

目前剩餘限制是 execution gate，而不是 binary transport 本身：

- Dropbox upload from Conversation/local artifact：Verified
- Dropbox temporary single-use URL：Verified
- GitHub Runner direct binary fetch：Verified
- Runner verify + commit：Verified
- Primary autonomous `workflow_dispatch`：Not available in current GitHub Connector
- Claire manual Run workflow：Verified fallback human gate

因此這條 path 的 Human responsibility 已縮小為一次 manual dispatch，而不是 resize / rename / upload / commit / push 的整串搬運。

這條 Evidence 也取代了先前「大 binary 必須走 text-chunk assembly」的方向性假設。Text-chunk Action 仍是有效 assembly primitive，但不再是 real-image transport 的首選。


Promotion note：remote-binary batch path 已完成 1-item / multi-item 驗證，現以正式協作名稱保存：

~~~text
[COLLAB] Artifact Batch Publish
.github/workflows/collab-artifact-batch-publish.yml
.github/workflow-contracts/artifact-batch-publish.schema.json
~~~

這個 promotion 只代表「該 publication mechanism 已升格為 collaboration tool」，**不代表 A-ARTIFACT-1 整體 Experiment 已完成**。目前 workflow write boundary 仍維持在 Experiment-owned output prefix，正式文章圖片的 durable publication path 另行收斂。

### Batch-first Publication Verification

在 remote-binary path 成立後，workflow 進一步收斂成同一套 Batch-first contract：

~~~text
1 image  → 1-item batch → 1 Human Run
N images → N-item batch → 1 Human Run
~~~

已完成兩組 control：

~~~text
3-item batch
requestId: soup-batch-3-control
itemCount: 3
atomicPublication: true
result: verified

1-item batch
requestId: soup-batch-1-control
itemCount: 1
atomicPublication: true
result: verified
~~~

因此單張不再是另一套 special case；一張只是 batch size = 1。

目前 Human collaboration contract 可收斂為：

~~~text
Claire
→ 提供一張或多張 artifact
→ 做公開 / 使用判斷
→ 每批按一次 Run workflow

Primary Agent
→ 處理 / 命名 / resize / convert / metadata strip
→ Dropbox staging
→ 為整批建立 temporary download URLs
→ 產生 batch_json
→ 驗證 GitHub 最終結果

GitHub Actions Runner
→ 一次抓取整批 binary
→ 每一項驗 bytes / SHA-256 / full decode
→ 全部成功後才 publication
→ 一次 commit
~~~

目前主要未解缺口已不再是 single vs multi-file transport，而是：

> Primary Agent 目前無法自主觸發新的 workflow_dispatch，因此 Human Gate 仍保留為 Claire 每批按一次 Run。



---

## Current Judgment

A-ARTIFACT-1 尚未完成，但已得到幾個穩定判斷：

1. Dropbox Connector 的價值不能用 feature checklist 評估。真正要看它能否降低 Claire 的人工 middleware responsibility。
2. Conversation attachment 已是有效的 binary intake surface，Primary Agent local processing 也已驗證可處理圖片。
3. Direct binary Git object path 曾成功，但 reliability / tooling ergonomics 不足，不應作為目前首選 publication workflow。
4. UTF-8 text-chunk → Runner reconstruction 已驗證是有效 binary assembly primitive，但大量 Base64 經 LLM context 搬運不具可持續性。
5. Dropbox staging → temporary URL → GitHub Runner direct binary fetch → integrity verification → repository commit 已用真實 processed JPEG 驗證成功，且 payload 不經 LLM text/context。
6. 目前主要缺口已從 binary transport 轉為 execution gate：Primary 當前 GitHub Connector 缺 autonomous workflow_dispatch write primitive，因此仍需 Claire 手動按一次 Run workflow。
7. Private storage experiments 必須 privacy-scrub。Public Evidence 保存 capability / constraint / transport shape，不保存私人 storage topology。

目前 Research Question 已從：

> Dropbox Connector 可以做什麼？

升級為：

> 如何把 Connector、Conversation、local processing workspace、Dropbox 與 GitHub 組成一條讓 Human 不再充當檔案 middleware 的 Artifact Collaboration Workflow？

> Capability checkbox ≠ usable workflow.


---

### Formal Wall Image Repair Probe

2026-09-18 首次將已升格的 `[COLLAB] Artifact Batch Publish` 用於實際 Wall article image repair。

Context：

~~~text
Article:
knowledge/wall/claire-is-hungry-future-agent-life.md

Broken image:
public/images/wall/future-agent-life-soup.jpg
~~~

原 repository image 約 10 KiB，browser 實際呈現為 partial decode / gray remainder。Claire 提供原圖後，Primary 重新處理為 metadata-stripped JPEG，並將 collaboration publication boundary 從 Experiment-only 收斂為 explicit allowlist：

~~~text
experiments/artifact-transport/publisher-output/**
public/images/wall/**
~~~

這不是任意 repository write。新增 publication surface 必須明確加入 allowlist 與 canonical contract。

本 probe 同時驗證一條更接近日常工作的 collaboration path：

~~~text
Existing Wall article
→ Primary locates article + broken asset from Repository
→ Conversation original image
→ Primary image processing
→ Dropbox staging
→ [COLLAB] Artifact Batch Publish
→ same-path binary replacement
→ Primary QC
~~~

這個案例也修正操作原則：若 artifact 已存在於 Repository，Primary 應先自行定位 article reference 與 current asset path，不應把 repository navigation 轉嫁給 Claire。

---

### Markdown → PDF → Human Output Probe

2026-09-18 進一步把 A-ARTIFACT-1 的 reverse / output routing 轉成真實工作案例：從 GitHub Wall source 產生 Human-facing PDF，預備交付 Dropbox，而不是把階段性 PDF commit 回 Repository。

使用 source：

~~~text
knowledge/wall/day-7-ipados-27-developer-love.md
~~~

同時建立 reusable renderer：

~~~text
scripts/render-markdown-pdf.py
knowledge/implementation/markdown-to-pdf.md
~~~

Probe working copy 額外加入 Mermaid、SQL fenced code、table、blockquote 與 `<!-- pagebreak -->`，用來驗證複雜 Markdown rendering。

已驗證：

- GitHub Markdown text → Primary working context：Verified
- Markdown → 7-page A4 PDF：Verified
- Traditional Chinese embedded fonts：Verified
- SQL syntax highlighting：Verified
- table / blockquote / manual page break：Verified
- bounded Mermaid flowchart subset → vector diagram：Verified
- PDF render-to-PNG visual QC：Verified

同時得到一個重要 boundary：

~~~text
GitHub Markdown text → Primary local render          Verified
GitHub referenced repository image → local binary   Not established
~~~

因此第一份 PDF 對 GitHub-referenced PNG 使用 visible placeholder，而不是 silently drop。這不是 renderer 失敗，而是 A-ARTIFACT-1 原本就尚未關閉的 `GitHub repository binary → Primary local workspace` transport boundary。

Current Judgment：

> Markdown → Human-facing PDF 已可升格為 reusable Primary capability；Repository binary asset materialization 與 Dropbox durable Human Output delivery 應分開驗證。

