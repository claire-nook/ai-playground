# Netlify Trigger Observability Probe Report

- Date: 2026-09-13
- Status: Probe prepared; Provider Result pending
- Related Work Order: `2026-09-13-netlify-trigger-boundary-observability-probe`
- Related Experiment: `experiments/netlify-trigger-boundary/README.md`

## Context

Case B v2 的 GitHub-visible change 只有 Experiment Record，但 Netlify 執行既有
custom `ignore` command 後仍繼續 deploy。現有 Evidence 指向 comparison boundary
mismatch；當次 `$CACHED_COMMIT_REF`、`$COMMIT_REF`、Workspace HEAD、merge-base
與 changed paths 尚未被直接觀察。

本次工作只建立 Observability Probe，不修正 Trigger Boundary，也不選擇 final
comparison strategy。

## Probe Design

`netlify.toml` 的 temporary `ignore` command：

1. 以固定 begin/end marker 圈出 probe output。
2. 只輸出 allowlist 中的 Netlify context：`CONTEXT`、`BRANCH`、`HEAD`、
   `COMMIT_REF`、`CACHED_COMMIT_REF`、`REVIEW_ID`；缺值顯示 `<unset>`。
3. 記錄 Workspace `git rev-parse HEAD` 與 HEAD identity / parents。
4. 分別驗證 commit refs 是否可解析，並輸出明確 success / failure marker。
5. 兩個 refs 都可解析時，記錄 cached-to-commit changed paths 與 merge-base。
6. merge-base 可取得時，再記錄 merge-base-to-commit changed paths。這是額外
   observation，不是正式 rule 的選擇。
7. 不使用 `set -e`；每個可能失敗的 Git operation 都有 conditional guard。
8. 最後固定 `exit 1`，依 Netlify ignore semantics 繼續 build / deploy。

Probe 不會 dump 全部 environment，也不讀取或輸出 token、credential、cookie、
authorization header 或其他 provider secret。

## Runtime-side Validation

- 已確認 Work Order、`netlify.toml` 與 Experiment Record 存在，修改前 working tree
  clean；local branch 名稱為 `work`，依 Work Order 不構成 Failure。
- Python standard-library `tomllib` 可解析設定，抽取的 ignore command 通過
  `sh -n`；受控的 valid-ref 與 unset-ref local scenarios 均完整到達 end marker，
  並固定回傳 status 1。
- 修改範圍只包含 Work Order 允許的三個 deliverable files。
- Local simulation 只驗證 control flow、markers 與 final exit status，不冒充
  Netlify Provider Evidence。

## Expected Provider Evidence Fields

下一次 Deploy Preview Log 預期能直接 Review：

- probe begin/end marker 是否完整出現；
- 六個 allowlisted environment fields 的值或 `<unset>`；
- Workspace HEAD SHA、commit identity 與 parents；
- `COMMIT_REF` / `CACHED_COMMIT_REF` 的 resolve outcome 與 resolved SHA；
- cached-to-commit changed-path output；
- merge-base outcome；
- merge-base-to-commit changed-path output（若 merge-base 成功）；
- 個別 diagnostic failure marker；
- probe 是否以 non-zero result 讓 build / deploy 繼續。

## Unknown

目前尚未取得新的 Netlify Deploy Preview Log，因此下列項目仍未知：

- Provider 實際注入的 allowlisted environment values。
- Workspace HEAD 是 PR head 或 merge-shaped commit。
- 兩個 refs 在該 clone 中是否可解析，以及實際 SHA。
- merge-base 是否可取得及其 SHA。
- 兩種 comparison 的實際 changed paths。
- Netlify 是否在 probe 後確實繼續並完成該次 deploy。

以上不得在 Provider Log 產生前標成成功、失敗、Verified 或 Passed。

## Candidate Follow-up

Primary Agent 取得並 Review Provider Log 後，可依直接 Evidence 設計最小的下一步
experiment。是否使用 merge-base、PR base、provider refs 或其他正式 comparison
strategy，仍留在本 Work Order 的決策邊界之外。
