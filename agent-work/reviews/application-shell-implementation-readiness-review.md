# S-SHELL-1 — Application Shell Implementation Readiness Review

- Date: 2026-09-16
- Work Order: `agent-work/work-orders/2026-09-16-application-shell-implementation-readiness-review.md`
- Review Type: Repository-only implementation readiness review
- Runtime Access: 未使用 Supabase Dashboard、connector、database credential、service role 或 SQL execution surface
- Result: `Conditionally Ready` — Shell 主體可由單一 Codex implementation vertical slice 完成，但 dispatch 前必須固定本文列出的 blocking runtime/query contracts；provider state 仍須由 Primary Agent 驗證。

## 1. Result

本次只完成 review，未撰寫或修改 Shell runtime code，也未變更 provider resource、Architecture Rule 或 Experiment scope。

Repository 已提供足夠的 lifecycle、route、fixture semantics 與 synthetic metadata schema，讓後續 Implementation Agent 能設計並實作 Shell-owned state machine、Navigation derivation、direct Feature Entry check、responsive behavior 與 deterministic presentation。**缺少 Supabase management access 並不會使這些 browser responsibilities 本身不可實作。**

但目前 Repository 尚未固定 browser 實際如何讀取 `app_user` 與三個 metadata table、browser role 對這些 object 的可見性、兩個 Feature 的 real-read source，以及數個要求 Agent 不應自行決定的 UI/runtime outcome。因此目前不適合直接派發「自行補齊細節」的 implementation；先完成第 6 節 minimum handoff contract 後，即可派發 repo-contract-driven implementation，並把 real environment correctness 留給 Primary Agent validation。

## 2. Evidence Basis 與證據強度

### 2.1 Repository-derived facts

- S-SHELL-1 lifecycle 是 Auth/session → `app_user` resolution → `is_active` eligibility → Application User Context → route resolution → Shell Ready。
- `admin`、`user`、`guest` 都是 experiment scope；active `guest` 可進 `/home`，但沒有 Business / Common Feature Entry。
- `/home` 是 Shell-owned landing；Feature Registry 只有 `/business` 與 `/common`。
- synthetic metadata 明確分成 Feature Registry `test_k4p7x2`、Navigation Definition `test_m8q3v6`、mapping `test_r5n9c1`，並提供 columns、seed 與 inspection SQL。
- expected mapping 是 `admin` → Business + Common、`user` → Business、`guest` → none；Navigation visibility、Feature Entry 與 Backend Authorization 必須保持分離。
- current Experiment Record 明列 exact safe Business/Common data source、direct rejection outcome 與窄 viewport Navigation behavior仍是 implementation planning open items。
- synthetic SQL 只有 DDL、fixture 與 inspection query，沒有 browser roles 的 grants/RLS policy，也沒有 application-consumable view/RPC contract。
- Repository 中舊 Experiment B 的 TU01/TU02 semantics 是 TU01=`inactive app_user`、TU02=`no app_user`；本 Work Order 則陳述預期 runtime fixture 已改為 TU01=`active user`、TU02=`active guest`。後者是 Work Order assumption，不可用舊 Evidence 當作已驗證的新 runtime state。

### 2.2 Work Order assumptions（由 Primary Agent 提供，非本次直接 Evidence）

- formal `app_user.user_type` 允許 `admin` / `user` / `guest`。
- Supabase runtime 已建立三個 synthetic tables 與 fixture。
- 預期 runtime identity 是 Claire=`admin`、TU01=`user`、TU02=`guest`。

### 2.3 Runtime unknowns

- 目前 GitHub/Supabase provider state 是否確實等同上述 assumptions。
- Browser authenticated role 是否可 SELECT `app_user` 需要的 row/columns及三個 metadata objects，以及 RLS 結果是否符合預期。
- `app_user` 的 exact browser query（table/view/RPC）、column names、cardinality 與 error semantics。
- metadata 應分三次 query、embedded relation query、view 或 RPC 取得；目前 inspection SQL 不是 browser client contract。
- `/business` 與 `/common` 的 exact real-read source、select shape、safe display fields、expected empty/error semantics；是否 reuse Custom API 亦未固定。
- browser-safe configuration 的 source、required keys 與 deployment injection方式。
- session expiry/network interruption在目標 Supabase client/runtime 中的實際 timing與事件順序。

本 Review 不把以上 unknown 推論成 Verified Evidence。

## 3. Minimum Browser Lifecycle 與責任邊界

```text
ENTRY (preserve requested URL)
  → RESTORE SESSION
    → no/invalid session: SIGNED OUT
    → valid session: LOAD APP USER
      → no mapping: APPLICATION INELIGIBLE
      → inactive: APPLICATION INELIGIBLE
      → query/config/network failure: SHELL ERROR (recoverable)
      → active: BUILD APPLICATION USER CONTEXT
        → LOAD / DERIVE FEATURE + NAVIGATION METADATA
          → metadata failure: SHELL ERROR (recoverable)
          → RESOLVE ORIGINAL ROUTE
            → /home: SHELL READY / HOME
            → allowed known feature: SHELL READY / FEATURE
            → disallowed known feature: deterministic Shell rejection
            → unknown route: deterministic recoverable not-found outcome
```

Sign-out、invalid-session event 或 identity change 必須先清除 Application User Context、allowed Feature set、Navigation 與 Feature-owned data，再顯示 signed-out outcome。這是避免 stale privileged UI 的 Shell responsibility；不應等下一次 render 或 failed API call 才清除。

Shell global state只應擁有 session/bootstrap、Application User Context、allowed Features、current route、Navigation UI、Shell loading/error 與 sign-out invalidation。Feature data、Feature loading/error、CRUD/form state 與 server-result cache仍由各 Feature 擁有。

## 4. Segment Readiness Classification

分類定義：

- **Sufficient**：`Repo contract sufficient for implementation`
- **Validate**：`Implementable but requires real-environment validation`
- **Blocked**：`Blocked by missing contract/context`

| Runtime segment | Classification | 可由 Codex 可靠完成 | 尚需 handoff / validation |
| --- | --- | --- | --- |
| Auth client / session handling | **Validate** | 依既有 browser Supabase pattern建立 client、restore session、listen auth change、login/sign-out state、清除 identity-derived state；不需 management access。 | 固定 browser-safe config source與 client dependency/version policy；在 real project驗證 login、restore、expiry/invalidation event及 sign-out。 |
| `app_user` bootstrap / Application User Context | **Blocked** | 一旦 query contract固定，可實作 zero/one/many/error分支、active check與 immutable context。 | 必須提供 exact table/view/RPC、select fields、Auth ID relation/filter、expected single-row/cardinality、browser access policy與 error semantics。不可由 Agent從 formal schema猜測。 |
| Application Eligibility | **Validate** | 對已取得的 `is_active`與 mapping outcome做 deterministic state transition；保持 Auth Success與eligibility分離。 | Primary Agent驗證 no mapping/inactive/active guest的真實 provider outcome，並提供可安全測試 fixture或 bounded control。 |
| Metadata query / Navigation derivation | **Blocked** | schema與derivation概念足夠實作 pure transformation、active filtering、ordering、empty Navigation與orphan defense。 | 必須固定 browser query shape/sequence、grants/RLS、failure semantics；說明是否同時要求 `feature.is_active`和`menu.is_active`，以及 malformed/orphan row處置。 |
| Route resolution / direct Feature Entry | **Blocked** | 可用同一 allowed Feature set同時驅動 Navigation和route guard，preserve deep link，處理 refresh/Back/Forward/unknown route。 | 必須決定 disallowed known route的 deterministic outcome（例如 inline access-unavailable + `/home` link或redirect）及 unknown route outcome；不可把選擇偷渡成 production 401/403/404 rule。 |
| `/home` | **Sufficient** | Shell-owned landing，呈現最小 Application User Context與logout；guest可用；不查Feature Registry。 | 真實 identity/display field仍受 `app_user` query contract約束，但頁面責任與route semantics不受阻。 |
| `/business` | **Blocked** | route/feature boundary已清楚；可在data contract提供後實作Feature-owned loading/error/render。 | exact safe Native Data API source、select/filter/expected response/display fields尚未指定。 |
| `/common` | **Blocked** | route/feature boundary已清楚；可在data contract提供後實作Feature-owned loading/error/render。 | exact safe read及Native Data API vs existing Custom API尚未固定；若Custom API則還需URL、method、JWT propagation、CORS與response/error shape。 |
| Loading / error / sign-out | **Validate** | 可分離Shell bootstrap error與Feature error、提供retry、避免redirect/retry loop、sign-out時同步清空derived state。 | 需要固定error copy不重要，但需固定哪些query failure可retry、session invalidation outcome、synthetic failure control；real network/session behavior需provider/browser validation。 |
| Responsive Shell behavior | **Sufficient** | 可依iPad-first targets實作touch Navigation、open/close/focus/overlay、portrait/narrow layout及desktop sanity，不需Supabase management access。 | dispatch前固定窄viewport Navigation interaction（drawer/popover等）或授權Agent選disposable experiment behavior；最終由Claire在real iPad Safari驗證。 |

### 4.1 Classification interpretation

`Blocked` 是**dispatch contract blocker**，不是技術不可行，也不是要求把 provider management交給Codex。Primary Agent只要提供query/data/outcome contract與provider-side confirmation，Codex即可從public browser interface實作；不需要也不應取得 `service_role`、database password或Dashboard access。

## 5. Synthetic Metadata 能提供與不能提供的 contract

### 5.1 已提供

- stable Feature identity、display name、entry route、classification與active state。
- hierarchical Navigation nodes、optional Feature reference、sort order與active state。
- `user_type`到Feature eligibility的coarse mapping。
- guest empty Feature set仍不影響Shell `/home`。
- 足以建立同源的Navigation derivation與direct route eligibility check，避免各自hard-code兩套規則。

### 5.2 尚未提供／必須由 application contract補足

- Browser-readable API boundary與authorization policy。
- Query response DTO、query orchestration、atomic snapshot需求及partial failure處理。
- Parent/child組裝規則的異常資料處理（missing parent、cycle、duplicate route、mapping指向inactive Feature）。DDL刻意沒有FK，client不能假設referential integrity。
- Root/group是否在沒有allowed active child時隱藏；建議本次固定為隱藏empty group，但這應由handoff明確確認。
- `menu.is_active`、`feature.is_active`及mapping同時評估的精確規則；建議eligible entry必須三者有效，group由remaining children推導。
- Metadata reload/cache/invalidation policy。本experiment可固定為每次成功bootstrap加載一次、identity change清除並重載，不需要發展成production cache architecture。
- Backend feature-level authorization。metadata只能控制coarse client Feature Entry，不可作為authoritative Backend Authorization。

## 6. Implementation Dispatch 前的 Minimum Runtime Contract

以下內容應寫入後续 Implementation Work Order或其Read First repository artifact；只提供public/browser-safe contract，不提供secret：

1. **Snapshot identity**：確認實作snapshot包含當前S-SHELL-1 record、metadata design/SQL及本Review，並記錄provider fixture version/date。
2. **Browser configuration**：configuration載入位置、Supabase project URL、publishable/anon key的browser-safe來源、required/optional keys、missing config outcome。明確禁止 `service_role`、database credential及management token。
3. **Client dependency contract**：允許沿用existing pinned `supabase-js` pattern或由Work Order指定可用版本/packaging方式；不要讓Agent順手決定production toolchain。
4. **`app_user` bootstrap query**：object/API名、selected columns（至少Auth linkage、`oid`、display identity、`is_active`、`user_type`）、filter、zero/one/many-row semantics、RLS/grant預期及example success payload。
5. **Metadata query contract**：三個object的browser access方式、exact selects/aliases、query順序或combined API、sort規則、active filter、empty/malformed data處理與example payload。若browser不可直接讀table，應由Primary Agent先提供safe view/RPC，而非讓frontend取得privileged credential。
6. **Fixture confirmation**：以不暴露email/password的identifier確認Claire/TU01/TU02各自為active `admin`/`user`/`guest`，並另指定no-mapping/inactive case能否real test；不能安全製造者才使用bounded synthetic control。
7. **Route outcome contract**：固定 `/home`、allowed Feature、disallowed known Feature、unknown route、post-login preserved deep link、post-sign-out destination與Back/Forward期望。明確Shell rejection不是fake backend `403`。
8. **Feature read contracts**：分別提供Business/Common endpoint或table/view/RPC、request/select/filter、auth propagation、safe fixture、minimal response schema、empty/error outcome與可顯示fields；確認Custom API reuse不會產生new backend work。
9. **Failure controls**：列出哪些failure用real fixture、哪些可用bounded local/synthetic control，以及control必須明確標記、不得取代normal trunk。
10. **Responsive interaction contract**：指定或授權disposable Navigation在iPad portrait/iPhone narrow的behavior；同時固定touch target、overlay dismissal、no horizontal overflow為acceptance，而不是選擇production Design System。
11. **Evidence contract**：定義local/static checks、Primary provider檢查所需raw result摘要，以及Claire real-device截圖/錄屏/步驟記錄格式；emulation不得標為real-device Evidence。

## 7. Implementation Slicing Recommendation

### Candidate conclusion

在第 6 節 blockers解除後，建議由**單一 Implementation Work Order完成一個disposable vertical slice**，而不是因為存在Supabase就機械拆成frontend/backend兩個implementation：

- Auth、bootstrap、metadata、route、Navigation和Feature render的價值在於composition；拆成彼此不可運行的半成品會削弱本Experiment的Research Question。
- Codex只需使用browser-safe client contract，不需management access；provider-side schema/grant/fixture preparation已經是handoff precondition，而不是Codex implementation slice。
- 同一artifact可依既定Phase A/B/C逐步取得Evidence，不代表需建立三套implementation。

建議執行順序是在同一Work Order設置明確gates：

1. 先以pure fixture/unit-level contract驗證state transitions、metadata derivation與route matrix。
2. 接上real Auth、`app_user`與metadata normal trunk，Primary Agent完成provider contract smoke validation。
3. 接上兩個real Feature read，完成route/history/error behavior。
4. 穩定後才進行responsive polish與Claire iPad Safari Evidence。

僅在Primary Agent無法在dispatch前提供browser-readable `app_user`/metadata或Feature endpoint時才需要split：先由Primary Agent完成provider contract preparation與verification，再派Codex Shell implementation。這個split的原因是缺少可調用contract及validation ownership，不是「frontend不能碰Supabase」。

## 8. Validation Handoff Matrix

| Validation item | Codex local/static | Primary Agent provider / real environment | Claire Human Environment Evidence |
| --- | :---: | :---: | :---: |
| State machine分支、zero/one/error handling | ✓ primary | review contract | — |
| Metadata DTO parsing、active filtering、ordering、empty group、admin/user/guest matrix | ✓ primary（fixtures/tests） | 確認real rows/query result | — |
| Route table、allowed/disallowed/unknown outcomes | ✓ primary | 確認metadata與backend結果未被混稱 | targeted observation |
| Deep link preservation、refresh、Back/Forward | local browser automation/manual where available | deployed URL sanity | ✓ real Safari primary |
| Auth login/session restore/auth change/sign-out | mock/static + accessible browser smoke | ✓ real Supabase session/provider logs or observations | ✓ real login/sign-out flow |
| `app_user` no mapping/inactive/active guest | branch tests | ✓ fixture + RLS/query truth | targeted visible outcome |
| Metadata grants/RLS與query shape | client contract tests | ✓ authoritative | — |
| Business/Common real data read與authoritative authorization | client rendering/error tests | ✓ endpoint, RLS/API result | ✓ rendered outcome |
| No stale privileged Navigation/context after sign-out/invalidation | local behavior test | trigger/confirmreal invalidation where feasible | ✓ visible state |
| Network/query failure與retry/no loop | deterministic controls | real failure only if safe | targeted visible recovery |
| iPad landscape/portrait、touch menu、orientation | viewport automation is supporting only | deployed artifact available | ✓ authoritative Human Environment Evidence |
| iPhone narrow、horizontal overflow/overlay | viewport automation is supporting only | — | ✓ real device preferred; clearly label emulation |
| Desktop sanity | ✓ browser/viewport | — | optional human sanity |
| Secrets/public artifact inspection | ✓ source/build scan | ✓ deployed config contains browser-safe values only | — |

Codex報告只能證明workspace內的source/test/browser observation；Primary Agent負責provider truth，Claire負責real iPad Safari usability。三者不可互相冒充。

## 9. Blockers 與 Non-blocking Concerns

### 9.1 Blockers（dispatch前必須解決）

1. **`app_user` bootstrap API/query contract missing**：沒有exact object、fields、filter、cardinality和browser authorization，Agent會被迫猜formal schema或誤把empty RLS result當no mapping。
2. **Synthetic metadata browser query/access contract missing**：DDL沒有grants/RLS/client DTO；僅知道table shape不足以保證browser可讀。
3. **Feature real-read contracts missing**：`/business`和`/common`必須real read，但data source及response contract尚未選定。
4. **Deterministic route outcomes missing**：Experiment要求disallowed/unknown outcome，卻刻意留待planning；Implementation Agent無權自行形成production-like 403/404語義。
5. **Runtime fixture drift未確認**：舊Evidence中的TU01/TU02狀態與新Work Order assumption不同；必須由Primary Agent確認current provider fixture。
6. **Browser configuration source未固定**：既有public experiments的hard-coded publishable configuration可作為capability precedent，但不能默認為本次implementation delivery contract。

### 9.2 Non-blocking concerns

- metadata table刻意無FK，client應defensively reject/ignore malformed references並顯示recoverable Shell error；本probe不需補FK。
- 三次independent metadata reads可能得到短暫不一致snapshot；對disposable fixed fixture可接受，只要handoff聲明metadata在Evidence run中不變。不要為此自行設計production transaction/cache layer。
- direct Feature Entry是client experience gate，不是backend authorization；real Feature endpoint必須繼續獨立執行自身authorization。
- session expiry、network offline、multi-tab同步與production Session Policy不應擴張；本次只需代表性invalid-session/context failure、no loop與state clearing。
- exact framework/router/state library、Design System、dynamic menu maintenance、Role/RBAC繼續deferred。
- responsive自動化只能減少明顯regression，不能取代iPad Safari touch/orientation Human Evidence。

## 10. Ambiguity / Inconsistency Register

| Item | Severity | Review disposition |
| --- | --- | --- |
| TU01/TU02舊Evidence vs新fixture assumption | Blocker | 不改寫歷史；Primary確認current runtime並以dated observation交接。 |
| Metadata inspection SQL vs browser query API | Blocker | inspection query只說明關係，不視為client contract。 |
| `is_active` filters在inspection SQL中只明確Feature mapping query，未給完整Navigation derivation規則 | Blocker within metadata contract | dispatch固定三層有效性與empty group規則。 |
| Direct rejection、unknown route presentation | Blocker | 由Primary/Claire選擇experiment outcome；標為disposable，不升格formal status contract。 |
| Common Feature Custom API reuse | Blocker for feature completion | dispatch確認可reuse endpoint或改用simple real read。 |
| Responsive Navigation visual pattern | Non-blocking if explicitly delegated | 可授權Agent選擇minimum disposable behavior；不得稱為Platform Rule。 |
| Error wording與visual styling | Non-blocking | Agent可作低風險presentation決定，acceptance看determinism/recovery。 |
| Metadata refresh/cache | Non-blocking | 建議bootstrap once、identity change reload，限本Experiment。 |

## 11. Evidence / Validation

- 完整閱讀Work Order指定的Read First與Preflight artifacts，並確認所有必要文件存在。
- 以`.git/FETCH_HEAD`與`HEAD`確認workspace snapshot指向dispatch時可見的GitHub `main` commit；local branch名稱不是preflight requirement。
- 對S-SHELL-1 record、synthetic metadata design/SQL、prior review、Technical Platform Research Map、Experiment Catalog與Agent governance做cross-check。
- 檢查本deliverable只新增Review Report；沒有修改`public/`、Shell runtime或provider artifacts。
- Markdown/static sanity與internal repository references在commit前執行，結果见最終handoff。

## 12. Deviations

None。

## 13. Failure / Unknown

沒有阻止本次Review完成的failure。Provider current state、browser grants/RLS、exact runtime payload與real Safari behavior保持Unknown，詳見第 2.3、6、8 節；本次未嘗試以management access驗證，也未把Work Order assumption改寫成自身Evidence。

## 14. Observation / Candidate Conclusion

Candidate：S-SHELL-1並非因Codex沒有Supabase management access而不ready；它是**contract-conditionally ready**。真正dependency是一個穩定、browser-safe、example-backed query/data contract和provider-side prevalidation。完成這些preconditions後，以單一vertical slice實作並由三方分工validation，最能回答composition research question且不會擴張Architecture。

本Candidate不自動成為Architecture/Platform Rule或Verified Runtime Evidence。

## 15. Follow-up / Decision Needed

Primary Agent / Claire在派發implementation前需決定並記錄：

1. 第 6 節 runtime contract各項，尤其四個blocker contract（`app_user`、metadata、Feature reads、route outcomes）。
2. 窄viewport Navigation behavior是直接指定，或明確授權Implementation Agent選擇disposable pattern。
3. 哪些failure fixture可安全real test，哪些使用bounded synthetic control。
4. Primary Agent provider validation與Claire iPad Safari Evidence的實際執行/記錄方式。

除上述事項外，不建議另開Architecture redesign；也不建議把synthetic object提升為production schema。
