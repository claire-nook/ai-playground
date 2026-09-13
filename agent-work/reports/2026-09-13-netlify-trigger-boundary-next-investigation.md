# Netlify Trigger Boundary Next Investigation

- Date: 2026-09-13
- Status: Investigation complete / next experiment recommended
- Related Work Order: `2026-09-13-netlify-trigger-boundary-next-investigation`
- Related Experiment: `experiments/netlify-trigger-boundary/README.md`

## Research Question

如何判斷這一次 Git-triggered change 是否碰到 Deploy Trigger Surface，而不是判斷從某個 cached historical point 到目前 head 是否曾碰到它？Candidate surface 維持 `public/`、`netlify/functions/`、`netlify/edge-functions/`、`netlify.toml` 與 root package manifests / lockfiles。

## Evidence

### Repository / provider evidence

- PR #6 中，`COMMIT_REF` 是 PR head，但 `CACHED_COMMIT_REF` 是較舊 build commit；兩者的 merge-base 仍是 `CACHED_COMMIT_REF`。因此只替既有兩個 refs 加上 `git merge-base` 不會修正 boundary。
- PR #7 中，GitHub-visible base 是 `72e4ac393c9e2e5689d340f15224c59f1526a7f0`，但 checkout 的 `origin/main` 是 `a1ff93b720fe6b066ac0bddcfbb638f859ea5be1`，local `main` 更舊，為 `64b55130098b903117ec1bdb3399b4f2ddd9c660`。stale `origin/main` 到 PR head 有 9 paths，而真正 PR diff 只有 3 files。checkout 中「ref 存在」不等於它是 current event baseline。
- 目前 Netlify checkout 有 remote 與可解析 refs，故下一個 experiment 可以直接區分「ref 只是 stale」和「ignore stage 能否取得 fresh base」，不必先引入 GitHub API token。

### Provider documentation facts

- Netlify 的 ignore command 以 exit code `0` 取消 build、exit code `1` 繼續；custom ignore logic 本身仍須正確重建 change boundary。[Netlify Ignore builds documentation](https://docs.netlify.com/build/configure-builds/ignore-builds/)
- Netlify 的 build environment 提供 deploy context / Git metadata，但本次 repository evidence 已證明 `CACHED_COMMIT_REF` 不能被視為 PR base。[Netlify build environment variables](https://docs.netlify.com/build/configure-builds/environment-variables/)
- GitHub Pull Requests REST API 可提供 PR metadata 及 changed-files list；files endpoint 有 pagination / response-size constraints，使用時必須完整處理，而不能只讀第一頁。[GitHub Pull Requests REST API](https://docs.github.com/en/rest/pulls/pulls)
- GitHub Actions 原生支援 `paths` / `paths-ignore`，但官方亦說明 diff 與 file-count 等限制；因此它是 ownership relocation candidate，不是天然無限制的 authoritative oracle。[GitHub Actions workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore)

本執行環境嘗試讀取上述官方頁面時遭 outbound proxy `403 Forbidden`，所以本輪沒有把未能重新讀取的產品細節提升為新的 Provider Evidence；連結供 Review 時核對。上面的 Netlify runtime 結論以 repository 已保存的 PR #6 / #7 Provider Evidence 為主。

## Candidate Comparison

| Candidate | Deploy Preview model | Production push model | 優點 | 主要風險 / Unknown | 本輪判斷 |
| --- | --- | --- | --- | --- | --- |
| Fresh fetch base branch + merge-base | fetch current base tip；比較 `merge-base(base, head)..head` | 仍需 event `before..after`，不能直接套 PR model | 最小延伸 PR #7；不需 GitHub API schema/token；可保留 Git rename/pathspec semantics | ignore stage network、remote URL/auth、shallow history、force-push；base tip race；尚未驗證 fetch 可用 | **推薦下一個 probe** |
| GitHub PR metadata / changed files | 用 `REVIEW_ID` 查 PR；changed-files endpoint最接近 GitHub-visible PR diff | push 不是 PR，需另一模型/API | 避免 cached checkout refs；可直接對照 GitHub UI | rate limit/auth/API outage/pagination；fork/private-repo policy；增加 JSON/API dependency；失敗必須 deploy | 第二順位，若 fresh fetch 不可靠再 probe |
| Context-specific model | DP 用 PR cumulative diff；production 用 push `before..after` | 明確以 push event 為界 | 語意最貼近兩種事件，涵蓋首次 PR、後續 commit及 multi-commit push | Netlify 是否暴露 immutable push `before` 尚未證明；需分支與 retry 定義 | 必要的 design direction，但不是單一取值方法 |
| Netlify native path trigger | 若 provider 能直接判斷 paths，無需自建 event semantics | 同左 | responsibility 最少、provider 可處理 cache/event | 本輪未找到已驗證、可精確套用這個 root-base whitelist 的 native capability；custom `ignore` 仍是目前已知 mechanism | 保持 Unknown，不以猜測取代 probe |
| GitHub Actions paths → Netlify | PR/push 由 GitHub 篩選，命中才呼叫 Netlify | 同左 | trigger responsibility 靠近 Git event owner；可分 PR/push workflow | Actions path-filter limits；build hook 不受 Netlify ignore；fork secrets、Deploy Preview UX/status、duplicate deploy與 provider ownership都要重設 | 合理 fallback / architecture candidate，現在不宣布採用 |

## Inference

1. **Deploy Preview 應以整個 PR 的 cumulative change 為判斷單位。** 第一次 preview、PR 建立前已有多 commits、以及同一 PR 後續 commit 都可用 `merge-base(current base, current head)..current head` 一致回答「PR 現在會帶進 base 的 deployable change」。這是推薦語意，不是已驗證的 Netlify implementation。
2. **Production push 必須另用 event boundary。** `merge-base(main, head)` 在 main push 後通常等於 head，不能表示該 push；所需語意是 event `before..after`，且一次 push 多 commits也應整段比較。Netlify 是否可靠提供 `before` 仍為 Unknown。
3. **所有 lookup failure 都應朝 deploy fail-safe。** fetch/API/ref resolution/history不足、非預期 context 或 parsing failure 均應 non-zero，寧可多 deploy，不可因 observability failure 漏 deployable change。
4. **比較 surface 時應看兩端 tree diff，而非逐 commit 掃描。** 這可避免 PR 內先加入再刪除檔案仍被誤判；是否需要把 rename 的 source/destination 都視為 relevant，應在 implementation validation 明確涵蓋。

## Recommended Next Minimal Experiment

### Fresh Base Fetch Probe（僅 Deploy Preview）

下一個 provider experiment 應只回答：

> 在 Netlify `ignore` 階段，能否把 PR base branch fresh-fetch 到一個隔離 ref，取得足夠 history，並讓 `merge-base(fresh base, COMMIT_REF)..COMMIT_REF` 精確重現 GitHub-visible PR changed paths？

最小設計：

1. 限定 `CONTEXT=deploy-preview` 且 `REVIEW_ID` / `COMMIT_REF` 可解析；其他 context 只記錄 skipped reason 並 `exit 1`。
2. 不更新 `origin/main` 或 local `main`；以 `git fetch --no-tags origin main:refs/netlify-probe/base`（必要時先由淺到深補 history）取得隔離 ref。
3. 記錄 fetch status、fresh SHA、merge-base SHA，以及有固定 begin/end markers 的 `git diff --name-only <merge-base> <COMMIT_REF>`；remote URL 必須繼續 redacted，禁止 dump environment。
4. Probe 永遠 `exit 1`，不開始真正 suppress deploy。
5. 把 output 與 PR #7 的 GitHub-visible base、head、3-file diff 對照。成功條件不是 fresh SHA 恰等於 PR 建立當時 base SHA，而是 merge-base-to-head 的 resulting changed paths 等於 GitHub current PR diff。

### Why this experiment next

它只增加一個變數：**refresh remote base**。PR #7 已建立 stale-ref control result，因此一次 run 就能高判別力地回答：

- 若 fetch 成功且 diff 收斂為 3 files，local Git strategy 仍可行，下一輪才設計 production push boundary。
- 若 fetch/auth/network/history不可靠，或 fresh merge-base 仍不等於 GitHub PR diff，便有直接 Evidence 支持轉向 GitHub changed-files API probe，而不是同時混入 API、token、JSON parser等新變數。

### Files for that future probe

- `netlify.toml`：暫時替換 ignore observability command；**本 investigation 不修改它**。
- `agent-work/reports/<fresh-base-probe-report>.md`：保存 local validation 與 provider result。
- `experiments/netlify-trigger-boundary/README.md`：記錄 probe status / result。

建議不要為一次 probe新增 production script 或 dependency；若 command 在下一階段成為 candidate implementation，再移出 inline TOML 以便測試。

## Scenario Coverage of the Proposed Semantics

| Scenario | Expected boundary / behavior |
| --- | --- |
| 第一次 Deploy Preview | current base/head merge-base 到 head，涵蓋 PR 建立前所有 commits |
| 同一 PR 後續 commit | 重新計算整個 current PR cumulative diff，不依賴上次 preview cache |
| PR 建立前已有多 commits | 與第一次 preview相同，所有將進 base 的 net tree changes 都納入 |
| base branch 在 PR 期間前進 | fresh base 重新算 merge-base；不把 base 自己的新 change算成 PR change |
| main merge / production push | 不使用 PR model；未來需驗證 event `before..after` |
| 一次 push 多 commits | 比較 push 的 before tree 與 after tree，而非只看最後 commit parent |
| stale refs / cache | 不採信 checkout ref；probe 嘗試隔離 fresh fetch |
| external lookup failure | non-zero，繼續 deploy（false positive 優於 false negative） |

## Unknown / Decision Boundary

- 未驗證 Netlify ignore stage 的 outbound Git fetch、remote auth、shallow clone deepen 與執行時間。
- 未驗證 base tip 在 GitHub event、Netlify queue、fetch 時點之間移動時，fresh-base cumulative diff 是否完全符合團隊想要的 retry semantics。
- 未驗證 Netlify 是否有可直接使用的 immutable PR base或push-before metadata，也未完成 native path-trigger capability audit。
- 未驗證 GitHub API 在此 public repo 的 unauthenticated rate limit、pagination與 failure behavior。
- 未決定 production push boundary，也未決定是否把 trigger responsibility 移至 GitHub Actions。
- 本報告只推薦下一個 probe，不宣布 final architecture，亦未啟動 provider probe。

## Preflight Note

Work Order 的 `Read First` 包含 `playground.md`，但目前 workspace / commit `32be34f` 不存在該 path；已改讀 repository root `README.md` 作為 repository context。其餘指定文件均存在並已閱讀。
