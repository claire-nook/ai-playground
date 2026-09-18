# Primary Workspace Housekeeping Policy

- Status: Operational
- Established: 2026-09-18
- Scope: Dropbox `/AI 工作區`
- Owner: Primary Agent
- Evidence origin: A-ARTIFACT-1 / Workspace Lifecycle Probe

## 1. Purpose

`/AI 工作區` 是 Primary 的 **autonomous operational workspace**。

它的價值不是多一個 Dropbox folder，而是吸收不值得污染 Git history 的 ephemeral artifacts：

~~~text
temporary render
intermediate PDF
staging image
probe output
conversion result
retry copy
transient manifest / handoff material
~~~

核心原則：

> **GitHub is durable canonical state, not scratch space.**
>
> **Primary-owned Dropbox workspace absorbs ephemeral operational artifacts.**

## 2. Ownership Boundary

~~~text
/AI Inbox
Owner: Claire
Role: Human → Primary intake
Primary rule: 不整理 raw source；需要時由 Claire 選入 Conversation。

/AI 工作區
Owner: Primary
Role: autonomous scratch / staging / intermediate workspace
Primary rule: 自行建立、命名、移動、整理、清除。

/AI Output
Owner: Claire
Role: Primary → Human temporary / durable delivery
Primary rule: finished artifact 放這裡；交付後 Claire 自行決定保存、分享或刪除。
~~~

Primary 不應要求 Claire 維護 `/AI 工作區` 的 folder taxonomy、檔名或 cleanup。

## 3. What Belongs Here

適合：

- transient render working files
- processing intermediates
- staging copy
- retry / comparison artifact
- short-lived task folder
- artifact 尚未決定是否值得進 GitHub 前的緩衝區

不適合：

- canonical source code
- reusable script / implementation pattern
- durable experiment evidence
- knowledge / Wall source
- 唯一一份需要長期保存的成品
- Human raw source 的唯一副本

若 artifact 明天消失會影響系統、知識、Evidence 或可重現性，它就不應只存在 `/AI 工作區`。

## 4. Default Lifecycle

~~~text
task begins
→ create task-scoped working path only if needed
→ stage / transform / compare / retry
→ decide destination

if durable technical state
→ GitHub

if Human-facing finished artifact
→ /AI Output

if no longer needed
→ delete workspace copy / task folder
~~~

不要為了看起來整齊就預先建立大量空 taxonomy。Folder structure 應由真實 workflow pressure 產生。

## 5. Naming

Primary 自行命名，目標是：

- human-readable enough for later self-search
- task / artifact intent clear
- 不依賴 `final-final-v3-really-final` 這類人類文明遺跡

短期 task folder 可採：

~~~text
<task-slug>-YYYYMMDD
~~~

但這不是硬性 schema；如果單檔足夠就不要為了一個檔案生一棵樹。

## 6. Cleanup Rule

完成以下任一條件後，Primary 應主動評估 cleanup：

- artifact 已成功進 GitHub canonical location
- finished artifact 已成功交付 `/AI Output`
- probe / retry 已得到結論
- staging copy 已失去再利用價值
- task 明確結束

Default judgment：

> **沒有 durable value，就不要因為「也許 someday」而留著。**

Cleanup 是 Primary responsibility，不應把 `/AI 工作區` 變成 Claire 的第二個垃圾桶。

## 7. Search Before Asking Human

Claire 提到「你之前處理的檔案」「你放 Dropbox 的工作檔」時：

~~~text
Primary
→ read canonical Dropbox surface definition
→ search /AI 工作區
→ search /AI Output when relevant
→ only then ask Claire if referent remains ambiguous
~~~

不要先問 Claire：「你記得我上次放哪嗎？」

## 8. Git Pollution Guard

產生檔案不等於需要 commit。

Commit 前問：

> 這個 artifact 是否屬於跨 Conversation / 跨時間 / 跨 Agent 都值得保存的 canonical state？

若答案是否定：

~~~text
keep ephemeral
→ /AI 工作區
or
deliver Human-facing
→ /AI Output
~~~

典型不應為了存在就 commit 的 artifact：

~~~text
temporary-render.html
one-off-export.pdf
probe-copy.jpg
intermediate-merged.md
staging-output.json
~~~

## 9. Verified Workspace Lifecycle Probe

2026-09-18 使用真實 Dropbox workspace 驗證：

~~~text
/AI Output/case-b-conversation-images.pdf
→ copy
→ /AI 工作區/workspace-lifecycle-probe-20260918/staging-case-b.pdf
→ rename
→ reviewed-case-b.pdf
→ list / verify
→ delete entire probe task folder
→ list /AI 工作區 again
~~~

Observed：

- task folder create：Verified
- file copy into workspace：Verified
- rename / move inside workspace：Verified
- file identity preserved across rename：Verified
- list / inspection：Verified
- task-folder cleanup：Verified
- original `/AI Output/case-b-conversation-images.pdf` remained untouched
- probe left no residual task folder

Final observed `/AI 工作區` immediate children after cleanup：

~~~text
images/
~~~

也就是說，Workspace Lifecycle 可以由 Primary 自主管理，不需要 Claire 參與 housekeeping。

## 10. Reopen Conditions

這份 Policy 不主動研究 rollback / restore / archive feature。

只有真實痛點出現時才 reopen，例如：

- workspace cleanup 誤刪仍需要的 artifact
- retry / duplicate 行為造成實際困擾
- task artifacts 需要跨多日保留
- cleanup policy 無法判斷 durable value

不要因為 Dropbox Connector 有 Restore / Revision，就先替不存在的災難寫災難片劇本。
