# Safari Auth Session Lifecycle — Claire Environment Evidence

- Date: 2026-09-16
- Environment: iPad Safari
- Related Experiment: `A-SAFARI-LIFECYCLE`
- Related Shell Experiment: `S-SHELL-1`
- Related Investigation Work Order: `agent-work/work-orders/2026-09-16-supabase-auth-safari-session-persistence-investigation.md`
- Related Corrective Work Order: `agent-work/work-orders/2026-09-16-application-shell-logout-session-lifecycle.md`
- Related PRs: `#40`, `#41`
- Evidence Type: Claire Environment Evidence

## Why This Evidence Exists

S-SHELL-1 的 post-implementation browser validation 曾在 iPad Ordinary Safari 觀察到 logout 後 Session 再次被 restore 的現象。由於同類現象在 Application Shell 出現以前的 Auth 小型實驗時期也曾被 Claire 觀察到，因此不能直接把 anomaly 歸因於 Shell implementation。

本紀錄保存目前已直接觀察到的事實、controlled probe result 與仍未知事項，避免後續把 hypothesis 誤寫成 root cause。

## Historical / Runtime Observation — Session Restoration Anomaly

Claire 在 Ordinary Safari 曾觀察：

```text
Login
→ authenticated Shell
→ Logout
→ Login surface
→ 離開 Application Shell / 返回 Playground
→ 再進 Live Demo
→ Session restore
→ Claire/admin Application Context restored
```

另一次 observation 使用關閉 Playground tabs 後 direct Feature route，也曾進入 Session restore 並恢復 Claire/admin Shell。

這個 behavior 不是只在 S-SHELL-1 首次出現。Claire 回報在早期只有 Auth 小型實驗、尚未存在 Application Shell 時，就曾遇過 logout 後再次進入而自動恢復登入；當時誤以為是 Safari convenience behavior。

Private Browsing 的對照 observation 不同：相同類型的 login → logout → new/re-entry flow 會維持 signed-out / Login state，未觀察到 Session restoration。

### Classification

- Session restoration anomaly: **directly observed, but intermittent**.
- Shell-specific root cause: **not established**.
- Safari-specific root cause: **not established**.
- Supabase-specific root cause: **not established**.

## Controlled Probe — Ordinary Safari

PR #41 Deploy Preview 提供獨立 `Auth Lifecycle Diagnostic Probe`。Probe 不修改 Application Shell，也不手動讀取或清除 Supabase Auth storage；只使用 Supabase Auth public API surface 觀察 lifecycle。

Claire 在 iPad Ordinary Safari 執行 controlled flow，screenshots 顯示以下 sequence。

### 1. Initial Entry

```text
PAGE_LOAD
GET_SESSION page_load start
AUTH_EVENT INITIAL_SESSION | session=null | identity=none
GET_SESSION page_load resolved | error=none | session=null | identity=none
```

Result: probe 開始時沒有 active Session。

### 2. Login

```text
SIGN_IN call_start
AUTH_EVENT SIGNED_IN | session=present
SIGN_IN resolved | error=none | session=present
```

Result: Login 成功，Session present。

### 3. Local Logout

```text
SIGN_OUT local call_start
AUTH_EVENT SIGNED_OUT | session=null | identity=none
SIGN_OUT local resolved | error=none
GET_SESSION after_sign_out start
GET_SESSION after_sign_out resolved | error=none | session=null | identity=none
```

Result: 本次 controlled run 中，`signOut({ scope: "local" })` resolved without returned error；SIGNED_OUT event 與 immediate post-sign-out `getSession()` 都顯示 Session null。

### 4. Manual Check After Logout

```text
GET_SESSION manual start
GET_SESSION manual resolved | error=none | session=null | identity=none
```

Result: Logout 後再次檢查仍為 Session null。

### 5. Reload

Reload 產生新的 in-memory diagnostic log：

```text
PAGE_LOAD
GET_SESSION page_load start
AUTH_EVENT INITIAL_SESSION | session=null | identity=none
GET_SESSION page_load resolved | error=none | session=null | identity=none
GET_SESSION manual resolved | error=none | session=null | identity=none
```

Result: Reload 後 Session 沒有恢復。

### 6. Leave / Re-entry

返回 Playground 後重新進入 probe，再次產生新的 lifecycle：

```text
PAGE_LOAD
GET_SESSION page_load start
AUTH_EVENT INITIAL_SESSION | session=null | identity=none
GET_SESSION page_load resolved | error=none | session=null | identity=none
GET_SESSION manual resolved | error=none | session=null | identity=none
```

Result: Re-entry 後 Session 仍沒有恢復。

## Controlled Result

本次 Ordinary Safari controlled probe 完整符合預期 local logout lifecycle：

```text
session=null
→ Login
→ session=present
→ Local Logout
→ SIGNED_OUT / session=null
→ signOut resolved / error=none
→ getSession session=null
→ Reload session=null
→ Re-entry session=null
```

因此目前 Evidence **不支持**「Ordinary Safari 每次 local logout 都會保留或恢復 Supabase Session」這個 generalization。

同時，controlled success 也**不能推翻**先前已直接觀察到的 Session restoration anomaly。兩者共同形成目前較精確的 judgment：anomaly confirmed but intermittent；controlled reproduction 尚未成功。

## PR #40 Interpretation Boundary

Current Application Shell implementation 在 manual logout path 曾存在 correctness defect：未檢查 `supabase.auth.signOut()` returned error，UI 會無條件進入 signed-out/Login state。PR #40 對此加入 explicit current-session/local logout semantics 與 error handling。

然而目前不能宣稱 PR #40 已找到 historical Session restoration 的 root cause，理由包括：

1. 早期 Auth experiment 已使用 local sign-out 並處理 returned error，而 Claire 回報當時也曾看過類似 restoration behavior。
2. 本次 controlled Ordinary Safari probe 的 local sign-out 明確 `error=none`，且 Session 持續為 null。
3. Historical anomaly 尚未在 diagnostic probe 中重現，因此沒有 anomaly 發生當下的 provider/browser lifecycle trace。

因此 PR #40 應被視為 **logout lifecycle correctness / defensive hardening candidate**，而不是已證實的 Safari Session restoration root-cause fix。

## Current Judgment

截至本 Evidence checkpoint：

- Ordinary Safari local logout expected lifecycle: **verified in one controlled Claire Environment run**.
- Historical Session restoration anomaly: **confirmed observation, intermittent**.
- Private Browsing historical comparison: **logout/re-entry remained signed out in Claire observations**.
- Controlled Private Browsing probe matrix: **not required for the current Ordinary Safari result; may be added only if future investigation needs stronger symmetric evidence**.
- Root cause of intermittent restoration: **Unknown**.
- Production workaround specific to the anomaly: **None justified by current Evidence**.
- S-SHELL-1 logout lifecycle final acceptance after PR #40 deployment: **Pending**.

## Next Checkpoint

Do not repeatedly attempt to force the intermittent anomaly without a concrete diagnostic purpose.

Recommended sequence:

1. Preserve PR #41 probe as diagnostic/research artifact and integrate its Environment Evidence into experiment knowledge.
2. Treat PR #40 on its own correctness merits, not as a proven root-cause fix.
3. After PR #40 reaches deployed Shell, perform one bounded Claire Environment Acceptance:
   `Ordinary Safari Login → Logout → leave/re-enter Live Demo → remains Login`.
4. If the historical restoration anomaly appears again, immediately use the diagnostic probe before changing implementation, and capture the lifecycle trace around the occurrence.

The absence of reproduction is not evidence that the historical anomaly never occurred. It only limits the conclusion that can responsibly be drawn from the current run.
