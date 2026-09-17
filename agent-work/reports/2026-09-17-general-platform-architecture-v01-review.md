# General Application Platform Architecture v0.1 — Adversarial Review Report

- Work Order ID: `2026-09-17-general-platform-architecture-v01-review`
- Review Target: `knowledge/platform/application-platform-architecture.md` v0.1
- Completion State: `Completed — Executor Completion`
- Decision Authority: 本報告是 reviewer opinion 與 architecture challenge input；不等於 Primary Agent 已接受 findings，也不等於 v0.1 已通過驗證。正式 Accept / Reject / Rework 仍由 Primary Agent 判斷。

## 1. Context Preflight

Context Preflight 可通過：

- Work Order 指定的五份 Read First 文件均存在且可完整讀取。Required architecture v0.1 存在，沒有觸發 baseline mismatch / Cannot Complete contract。
- Architecture、F-QUERY-1、S-SHELL-1 evidence、technical map 與 Work Order 都位於目前 `HEAD` 的同一條 commit ancestry 中；工作目錄在 review 開始時乾淨。
- Local branch 名稱是 `work`，不是 `main`。Repository governance 明確指出 workspace branch name 不等於 baseline identity，因此 branch name 本身不是 blocker。
- 此 workspace 沒有設定 Git remote，所以能確認的是同一個 local source snapshot 與完整 ancestry，不能從本環境獨立重新查證該 SHA 目前是否仍為 GitHub `main` head。此項列為 Unknown，不視為 direct GitHub verification。
- Review 未使用 Provider credential、Supabase management、deployment 或 DB mutation。

## 2. Executive Assessment

v0.1 最有價值的部分，不是五層名稱本身，而是三個有實質風險控制效果的分離：

1. **Application lifecycle 與 business-feature state 分離。**
2. **Feature entry/navigation 與真正 data authorization 分離。**
3. **Feature-facing contract 與 backend/storage mechanism 分離。**

這三項已有相對直接的 Shell runtime evidence，或至少有清楚的 Evidence boundary。S-SHELL-1 實際驗證了 session restore、Application Context、navigation、route、Feature Entry、不同 integration shape 及 logout/invalidation；它也明確證明 navigation visibility、Feature Entry、Feature Data Access 與 Backend Authorization 不是同一件事。

主要弱點是：v0.1 把一組**有用的責任分離原則**表達成看似完整的五段線性 runtime architecture，但其中：

- `Feature Runtime` 尚未證明自己是獨立責任邊界；
- `Feature Interaction Pattern` 比較像 design/pattern classification，不一定是 runtime layer；
- `Data Access Boundary` 與 `Backend / Data Source` 的 contract/mechanism 分離值得保留，但目前 minimum contract 不足以讓第一個 authenticated query implementation 安全落地；
- Authorization、current credential、boundedness、stale response、error classification 等跨界責任只有方向，缺少可執行的最低 obligations；
- F-QUERY-1 是 mock-based Functional / Interaction Evidence，明確不證明正式 Data Access、Authorization 或 Production UI Architecture，因此不能拿它支撐整條 production-ready runtime chain。

因此本 review 的判斷不是推翻 v0.1，而是：

> **保留 Shell / Feature lifecycle、Feature-facing contract / mechanism、Feature Entry / Data Authorization 三組核心分離；在 Pattern 2 前拿掉或降格未經證明的 `Feature Runtime` 獨立層地位，並補足第一個 authenticated query 所需的 minimum handoff/data/error/authorization obligations。**

## 3. Reviewer Perspective Findings

### R1 — High：`Feature Runtime` 目前是名稱，不是已證明的獨立 responsibility boundary

#### Architecture claim

v0.1 將 `Feature Runtime` 放在 Shell 與 Feature Interaction Pattern 之間，稱其為 Shell 將控制權交給 Feature 的 technical boundary；它可能提供 Feature identity、route context、Application User Context、invocation capability 與 shared primitives，並「擁有 active Feature lifecycle」。

#### Challenge

目前沒有足夠 evidence 證明這是一個與下列兩者不同的責任：

- Shell 的 route resolution / Feature activation；
- active Feature 自己的 lifecycle。

S-SHELL-1 的 verified chain 是：

```text
Shell Ready
→ Feature Entry
→ Native / Custom / External integration
→ Rendered Result
```

其中沒有觀察到一個需要獨立存在的 `Feature Runtime` actor。更直接的 internal inconsistency 是 Pattern 1 sequence diagram 根本沒有 `Feature Runtime` participant：Shell 直接 `Activate Feature`，然後 Query Feature 直接呼叫 Data Access Boundary。換言之，文字上的五層模型與實際描述的 runtime flow 並不一致。

#### Impact

- **Unnecessary abstraction:** implementer 很可能為了符合圖上的名詞建立 `FeatureRuntime` class/provider/service，但它沒有獨立 invariant，只會轉交 route、context 與 API client。
- **Responsibility duplication:** Shell、Feature Runtime、Feature 三者都可能宣稱擁有 mount/unmount、loading、error、context refresh 或 cancellation。
- **Security/lifecycle risk:** 如果 Runtime 接收的是 Application Context 或 JWT snapshot，會重現 Shell Evidence 已指出的 stale-token 問題；S-SHELL-1 明確要求 custom API 使用 refreshed current Session，而不是 bootstrap 時的 stale token。
- **Giant-framework growth point:** `platform-provided invocation capability` 與 `shared primitives` 沒有準入準則，最容易演化成 service locator、implicit global state 或 generic feature framework。

#### Reviewer judgment

`Feature Runtime` **尚不應被列為與 Shell、Feature、Data Contract 同等成熟的責任區**。

建議在 v0.1 採以下其中一種較誠實的表達：

1. **首選：改成 `Shell → Feature Activation Contract`。**它是 Shell/Feature seam，而不是獨立 runtime owner。
2. 保留 `Feature Runtime` 作為純描述性 vocabulary，但明示它目前不要求獨立 object/module/service；除非 Pattern 2 證明有跨 feature、且不屬 Shell 或 Feature 的 lifecycle invariant，否則不得建立 framework。
3. 若 Primary 堅持保留獨立 boundary，至少必須先回答它唯一擁有、且 Shell/Feature 均不擁有的 state、transition、failure 和 security obligation 是什麼。

### R2 — High：五段箭頭混合了 runtime layers、design pattern 與 contract seam

#### Architecture claim

v0.1 將以下五者畫成線性責任鏈：

```text
Application Shell
→ Feature Runtime
→ Feature Interaction Pattern
→ Data Access Boundary
→ Backend / Data Source
```

#### Challenge

五者不是同一種 architectural unit：

- `Application Shell`：可執行的 application lifecycle owner。
- `Feature Runtime`：候選 activation seam，尚未證明為獨立 owner。
- `Feature Interaction Pattern`：user-facing behavior 的分類/設計語彙；未必是一個 runtime component。
- `Data Access Boundary`：contract seam。
- `Backend / Data Source`：contract 後方的 execution mechanisms。

把它們畫成一條 pipeline 容易讓施工者誤以為：

- 每個 Feature 都要 instantiate 一個 Pattern abstraction；
- 所有資料存取都必須經過 browser-side repository/service wrapper；
- Backend/Data Source 是單一最底層元件，而不是可能包含 native API、custom API、RPC 或外部 composition 的多種 topology。

但 architecture 自己又禁止為隱藏 provider SDK 建立 generic repository/service abstraction。

#### Impact

- **Implementation ambiguity:** 不知道哪些是 conceptual classification、哪些是必須可見的 code seam。
- **Maintainability cost:** 為每一箭頭製造 interface 和 pass-through adapter。
- **False replaceability:** 不同 mechanism 可能有不同 auth、latency、cancellation、partial failure 與 observability semantics，不是單靠相同 result DTO 就可替換。

#### Reviewer judgment

建議把模型拆成兩個正交視圖，而不是一條五層 pipeline：

```text
Lifecycle / activation view

Browser Entry
→ Application Shell
→ Feature Activation Contract
→ Active Feature
```

```text
Feature operation view

Feature Interaction Semantics
→ Feature-facing Operation Contract
→ Selected Data Access Mechanism
→ Backend / Data Source
```

Authorization、credential freshness、error classification、observability 和 cancellation 應標在 operation path 上，不應靠一條虛線 `crosses boundaries` 帶過。

### R3 — High：Evidence provenance 有自我約束，但 general scope 仍超過直接證據

#### Source evidence

Architecture 正確聲明目前 coverage 只有 Application Shell + Read-only Query，並承認未經後續 patterns 挑戰前不能當 foundation。

F-QUERY-1 更明確說：

- prototype 使用 representative mock fixture；
- 主要未知是 functional interaction，不是 real data mechanism；
- Browser 行為只形成 Functional / Interaction Evidence；
- 它不證明正式 Data Access、Authorization 或 Production UI Architecture。

#### Challenge

文件標題與 scope 是 `General browser-based application platform`，但實證來源主要是：

- 一個 Nook Works / Supabase-oriented Shell vertical slice；
- 一個 Nook Works business requirement carrier；
- 一個 mock-based query interaction prototype。

這足以支持**候選 responsibility principles**，不足以支持「一般 browser application 必然需要五個 responsibility areas」。特別是 Data Access 一節將 mechanism capability 稱為 evidence-backed 是合理的，但它不能因此讓「Data Access Boundary 作為每支 Feature 必須具有的獨立 code layer」也變成 evidence-backed。

#### Impact

- **Unsupported generalization:** capability 可行性被誤讀成 architecture shape 已驗證。
- **Premature platform rule:** Pattern 1 candidate 可能被正式專案當作 production template。
- **Evidence dilution:** `Evidence-backed` 若同時涵蓋 runtime observation、candidate responsibility 和 architecture inference，會失去判別力。

#### Recommendation

對各 claim 增加更清楚的 confidence 標示：

- **Direct runtime evidence**
- **Inference from evidence**
- **Candidate boundary**
- **Pattern-specific decision**
- **Open contract**

尤其明示：

> Data mechanisms have been demonstrated; the requirement for a dedicated browser-side Data Access layer has not.

### R4 — Medium/High：No-horizontal-scroll 仍帶有 Nook-specific preference generalization

#### Architecture claim

v0.1 說對 `current target class of business applications`，horizontal scrolling result grid 應是例外，不是正常 platform capability。

#### Source boundary

F-QUERY-1 原文更保守，明確把它稱為 **Nook Works Candidate Decision**，並說不宣告為所有企業系統普遍真理。

#### Challenge

Architecture 雖然仍寫成 candidate，但 `current target class of business applications` 比 source evidence 的 Nook Works scope 更寬。它已由 product-specific design pressure 向 general platform policy 滑動一步。

此外，curated result columns 與「禁止把 raw record 全攤出來」是責任原則；是否 horizontal scroll 則仍是 layout/interaction judgment。兩者不應被綁成同等 architecture strength。

#### Impact

- **Unsupported generalization**
- **Potential requirement distortion:** 施工者可能為了遵守 architecture 而刪除真實比較工作需要的欄位。
- **Boundary confusion:** Interaction guideline 被當成 platform architecture invariant。

#### Recommendation

Pattern 2 前應把它明確降格成：

> Nook Works Pattern-1 interaction candidate; not a general platform responsibility boundary.

保留 curated result contract；不要把 viewport behavior 升格為 general application platform rule。

### R5 — High：Authorization separation 正確，但 enforceable boundary 缺失

#### Architecture strength

v0.1 正確分離 Authentication Identity、Application Eligibility、Navigation Visibility、Feature Entry、Feature Data Access 與 Business Authorization，也明確拒絕以 hidden menu 或 successful entry 代表資料已受保護。這與 S-SHELL-1 direct evidence 一致。

#### Challenge

State ownership table 把 Business Authorization decision 指派給 `Appropriate backend / authorization boundary`。`Appropriate` 對 implementation 沒有約束力。第一個 authenticated query 仍需猜：

- Native Data API 使用 RLS、view grants，還是其他 policy？
- Custom API 在哪裡把 current identity/context 轉成 business scope？
- Browser 傳來的 Application User Context 哪些欄位可信？
- Backend 是否必須重新 derive caller identity，而不是相信 client-supplied user/application identifiers？
- Feature Entry denied 與 Query data denied 分別用什麼 failure semantics？
- Auth/session expiry 是誰偵測、如何觸發 Shell invalidation？

這不是要求 v0.1 現在設計 RBAC；而是要求寫清楚 minimum security obligations。

#### Impact

- **Security risk:** 每個 Feature 自行判斷 client context 是否可信。
- **Inconsistent denial behavior:** 有的 query 顯示 empty、有的顯示 forbidden、有的把 raw provider error 暴露出去。
- **Boundary violation:** Feature Entry metadata 可能不知不覺變成 data authorization source。

#### Minimum correction

Pattern 2 前至少固定：

1. Data operation 必須在受信任 boundary 驗證 caller/session。
2. Business/data scope 不得只依賴 browser 傳入、可竄改的 eligibility/navigation metadata。
3. Feature Entry denial 與 Data Access denial 是不同結果。
4. Session invalidation 必須能沿明確 signal 回到 Shell。
5. 不在 v0.1 預先決定 RBAC schema、role model 或 provider-specific mechanism。

### R6 — High：Error ownership direction 合理，但 minimum error taxonomy 不足

#### Architecture claim

Error flow 被描述為：

```text
Provider / DB / API failure
→ Data Access translates technical failure
→ Feature decides recovery
→ Shell only handles application-lifecycle invalidation
```

#### Challenge

這個 ownership direction 值得保留，但無法讓施工者一致實作。至少以下情況尚未能分類：

- unauthenticated / expired session；
- authenticated but forbidden；
- invalid criteria；
- bounded-result limit reached / truncated；
- transient provider/network failure；
- timeout；
- cancellation；
- stale response from a superseded query；
- backend contract/schema mismatch；
- partial result；
- unknown internal error。

另外，責任圖把 `Error Contract` 虛線指向 `Feature Runtime`，但 prose 又是 Data Access → Feature → Shell。若 Runtime 沒有具體 error responsibility，這條圖線反而增加歧義。

#### Impact

- **Implementation ambiguity**
- **Security risk:** raw provider errors或 unauthorized details 外洩。
- **Lifecycle risk:** query-local error 誤觸整個 Shell logout，或 session expiry 只被當成一般 feature error。
- **Maintainability cost:** 每個 Feature 建立不相容的 error mapping。

#### Minimum correction

不必設計 final enterprise Error Contract，但 Pattern 2 前應定義最小 discriminants：

- `validation`
- `unauthenticated/session-invalid`
- `forbidden`
- `boundedness/too-many-results`，或明確保證絕不 truncation
- `transient/unavailable`
- `internal/unknown`
- `cancelled/superseded`，可以是 non-user-facing control result

並固定只有 `session-invalid` 類別能要求 Shell 重新建立或終止 application lifecycle。

### R7 — High：Data contract 列了名詞，尚未形成可建構的 minimum contract

#### Architecture claim

v0.1 說 Read-only Query contract 至少應定義 criteria representation、result shape、default ordering、boundedness 和 relevant error semantics。

#### Challenge

這是正確清單，但不是可執行 contract。施工者仍需自行決定：

- criteria omitted、`null`、empty string、empty multi-select 的語意；
- date/time/timezone encoding；
- result row stable identity；
- field types、nullability、enum/unknown-value handling；
- default sort 是否 deterministic，tie-breaker 是什麼；
- complete result set 如何被證明「完整」；
- maximum row count 是 hard reject、truncate、還是 implicit provider limit；
- zero rows 與 authorization-filtered-to-zero 是否可區分；
- response 是否包含 count、limit 或 truncation indicator；
- query request 是否具 cancellation/correlation identity；
- technical error 如何映射到 Feature-facing error。

F-QUERY-1 的 browser-side sorting 明確依賴「完整 Result Set 已載入」這個前提。如果 boundedness 只是一個沒有 machine-observable guarantee 的形容詞，client-side sorting correctness 就無法成立。

#### Impact

- **Correctness risk:** 被 provider 默默截斷的 results 仍被 UI 誤稱完整結果。
- **Duplicate decision:** 每個 query 自行發明 empty/null/date/order semantics。
- **False contract stability:** DTO 相同但 completeness、auth scope 或 ordering 行為不同。

#### Recommendation

Architecture 不必寫每支 Feature 的 schema，但應要求每一個 Pattern-1 technical design 提供一張 minimum operation contract，且上述項目不得缺省。

### R8 — Medium：State ownership 原則好，但 route/query-state seam 未說清楚

#### Architecture claim

v0.1 指定 route / Feature Entry 由 Shell 擁有，criteria/result/sort 由 Query Feature 擁有，並提出 `state ownership follows semantic lifecycle`。它同時說 Query submission 是 Feature action，不是 Browser navigation。

#### Challenge

兩者不矛盾，但仍缺一個 seam：

- 若 URL 包含 query criteria，Shell 是否「擁有」criteria？
- Deep link 是否應恢復 criteria/results？
- Back/Forward 是否只切換 Feature route，還是也回復 query state？
- Feature unmount/remount 是否清除 criteria？
- Shell 是否只保存 opaque URL，讓 Feature decode 自己的 state？

S-SHELL-1 明確把 Query state restoration 列為未回答議題。

#### Impact

- **Implementation ambiguity**
- **Lifecycle inconsistency:** 同一應用中有些 query 可 deep-link，有些返回即清空。
- **Boundary leakage:** 為了支援 URL，criteria 被放入 Shell-global store。

#### Judgment

第一個 query 不必現在設計通用 query-state restoration。Pattern 2 前只需明確寫：

> Query criteria semantics remain Feature-owned even if represented in the URL; Shell may transport route/URL state without interpreting business criteria. Pattern 1 may choose no restoration if the Feature requirement does not require it.

## 4. Implementer Perspective Findings

### 4.1 今日實作第一個 authenticated read-only query 的 end-to-end trace

以下不是要求指定 framework，而是檢查 architecture 是否足以避免工程師重複做重大 technical decisions。

#### Step 1 — Browser entry / deep link

**已知**

- Shell 負責 session restore/login、Application Context bootstrap、route resolution、deep link、refresh 和 history。
- S-SHELL-1 已有相應 runtime evidence。

**仍需猜測**

- bootstrap 尚未完成時，requested route 存放在哪個 conceptual owner；
- session invalidation during bootstrap 與 ordinary query error 如何用同一或不同 signal 表達；
- Feature activation 是否等待 Application Context 完整成功，還是容許不需要 context 的 feature 先啟動。

**分類**

- activation prerequisite 與 session-invalid signal：**Pattern 2 前需補 minimum contract**。
- loading component、router API、skeleton UI：**implementation detail**。

#### Step 2 — Feature Entry validation

**已知**

- Feature Entry 是 Shell responsibility；
- entry success 不等於 data authorization。

**仍需猜測**

- route known-but-not-visible、unknown route、entry forbidden 分別是什麼 outcome；
- Feature 是否可能被 activated 後才發現 entry denied；
- entry metadata 是 UI metadata 還是被 Data Access 使用的 authorization input。

**分類**

- 禁止把 entry metadata 當 data authorization proof：**Pattern 2 前需補**。
- 404/403 page wording與視覺：**implementation detail**。

#### Step 3 — Shell → Feature handoff

**已知**

- Runtime `may receive or access` Feature identity、route、Application Context、invocation capability。

**仍需猜測**

- `may` 中哪些是 mandatory；
- Feature identity 的 canonical source 與 stable identifier；
- context 是 immutable snapshot、reactive value，還是 getter；
- invocation capability 是否自動使用 current credential；
- ownership/disposal/cancellation；
- Runtime 是否必須真的存在為 module/object。

F-QUERY-1 曾確認 stable identifier 有跨 Business/SA/PG 溝通價值，但 identifier 名稱與 mapping cardinality 尚未決定。Architecture 只寫 `stable Feature identity`，沒有說這是 display metadata、route key 還是 operation identity。

**分類**

- current credential access、context freshness、activation/disposal ownership：**Pattern 2 前需補**。
- identifier naming、component props、dependency injection方式：**implementation detail**。
- `Feature Runtime` 是否成為可獨立重用 framework：**延後，除非先降格為 seam**。

#### Step 4 — Criteria state / validation / query action

**已知**

- criteria、validation、submit/reset、query-local states 由 Feature 擁有。

**仍需猜測**

- initial query 是否自動執行；
- reset 是否立即 query；
- invalid criteria 是 local validation 還是 server validation；
- multiple rapid submissions 是否 cancel、ignore、race；
- criteria representation 的 empty/null/date/multi-select semantics；
- results 在新 query loading 時保留或清除。

**分類**

- stale-response/race ownership與 criteria wire semantics：**Pattern 2 前需補 minimum contract**。
- auto-query、reset UX、是否保留舊 results：若 requirement 未指定，屬 **feature-specific implementation/functional detail**，不應變成 general platform rule。

#### Step 5 — Feature → Data Access invocation

**已知**

- 可採 Native Data API、View、Custom API、RPC 或 backend composition；
- Feature 應依賴 bounded contract，而非 physical schema。

**仍需猜測**

- mechanism 選擇由誰決定；
- Native API direct call 是否仍算經過 Data Access Boundary；
- 是否需建立 repository/service wrapper；
- auth credential 如何取得且保持 current；
- caller-controlled context 哪些不可相信；
- request cancellation、timeout、retry、correlation 的 owner；
- authorization denial 的 normalized outcome。

**判斷**

Data Access Boundary 應理解成**contract boundary，不是強制 browser-side adapter**。若 native client 已直接滿足 feature-facing contract，無證據要求再包一層 pass-through repository。

**分類**

- contract/mechanism separation、credential freshness、trusted authorization point：**Pattern 2 前需補**。
- client wrapper、file layout、class/interface形式：**implementation detail**。
- common retry/caching framework：**延後，不可預建**。

#### Step 6 — Backend / Data Source execution

**已知**

- backend complexity 不應自動洩漏為 UI complexity；
- latency、authorization、failure semantics 改變時應重訪 contract。

**仍需猜測**

- business authorization 實際在哪個 trusted boundary enforce；
- boundedness 由 query predicate、hard limit、view、function 還是 API enforce；
- provider default row cap 是否可被視為 complete set；
- deterministic default ordering；
- authorization-filtered empty 與 legitimate empty 的語意；
- response schema evolution。

**分類**

- enforceable authorization、boundedness/completeness、deterministic ordering：**Pattern 2 前需補到 first feature technical contract**。
- table/view/function選擇與 query optimization：**implementation detail**，除非它改變 contract。

#### Step 7 — Result rendering and browser-side sorting

**已知**

- curated columns；
- complete result set 才可 browser-side single-column sort；
- sorting 不更改 API default order。

**仍需猜測**

- complete 的 observable guarantee；
- null/locale/date/string sort comparator；
- stable sort 與 tie-break；
- sort state 是否在 re-query 後保留；
- columns 是否可見取決於 data sensitivity，還是純 requirement semantics。

**分類**

- completeness guarantee：**Pattern 2 前需補**，否則 correctness 不成立。
- comparator details、sort indicator、state reset：**feature/implementation detail**。
- generic Data Grid：**延後且目前不應建立**。

#### Step 8 — Error / invalidation / retry

**已知**

- query-local failure 留在 Feature；
- session-invalidating failure回 Shell；
- raw diagnostics 不直接成為 user-facing contract。

**仍需猜測**

- Feature 如何辨識 session-invalid；
- forbidden 是否可以 retry；
- timeout和offline如何分類；
- stale/cancelled request 是否顯示 error；
- Data Access 是否保留 diagnostic correlation information；
- Shell takeover 時 Feature cleanup 如何發生。

**分類**

- minimum error discriminants 和 invalidation signal：**Pattern 2 前需補**。
- toast/inline message、retry button位置：**implementation detail**。
- universal error UI framework：**延後**。

### 4.2 Implementer 最可能自然違反 boundary 的地方

1. **把 Runtime 做成全域 context/service locator。**因為文件允許它提供 context、invocation、presentation 和 lifecycle primitives，但沒有 admission rule。
2. **把 current JWT 或 Application Context snapshot 傳入 Feature。**這是最方便的 props shape，卻可能在 token refresh 後 stale，直接重踩 S-SHELL-1 已知 lifecycle trap。
3. **為每種 mechanism 建立 generic repository wrapper。**因為圖上有獨立 Data Access 層，施工者會覺得 architecture 要求有一個 class，即使只是轉呼叫 provider SDK。
4. **以 entry metadata 過濾資料。**因為 Shell 已有 user type / visible features，施工者可能把它當 business scope，而不是讓 backend independently authorize。
5. **把 provider row limit 當 bounded complete set。**UI 仍會 client-sort，但其實只排序默默被截斷的一部分資料。
6. **將所有 API 401/403/5xx 一律 logout 或一律 inline error。**因為 error ownership direction 沒有 machine-readable classification。
7. **讓 Pattern abstraction擁有 field schemas、columns、API call 和 UI state。**最終形成一個 config-driven giant query framework；這與 v0.1 所宣稱的 thin responsibility system相反。

## 5. Must Fix Before Pattern 2

以下是 architecture clarity / minimum contract 修正，不是要求先建新 framework。

### MF-1 — 降格或移除獨立 `Feature Runtime` layer

在能說出其 exclusive invariant 前，改稱 `Feature Activation Contract`。明示不要求獨立 module/object/framework，避免 implementer 為符合名詞製造 abstraction。

### MF-2 — 將五段線性圖改成 lifecycle view + operation-contract view

不要把 Interaction Pattern、runtime owner、contract seam 和 backend mechanism 畫成同種類型的 layer。

### MF-3 — 補 Shell → Feature minimum handoff obligations

至少定義：

- stable feature identity / route context 的來源；
- activation prerequisites；
- Application Context 是 current access 而非不受控 stale snapshot；
- authenticated invocation 必須取得 current credential；
- active Feature disposal/cancellation owner；
- session invalidation signal 如何回到 Shell。

不需要指定 router、state library 或 DI framework。

### MF-4 — 補 Pattern-1 operation contract 的 mandatory checklist

每一支 authenticated query technical design 至少明確：

- criteria wire semantics；
- result fields/types/nullability/row identity；
- authorization enforcement point；
- deterministic default order；
- boundedness/completeness guarantee；
- maximum-limit behavior；
- minimum error classifications；
- stale/superseded response policy。

Architecture 可只要求此 checklist，不必替 Feature 填值。

### MF-5 — 把 authorization separation改成 minimum enforceable obligations

保留「尚未設計 RBAC」，但明確要求：

- trusted boundary重新驗證 caller；
- client metadata不構成 data authorization proof；
- entry denial、data forbidden、session invalid 是不同 outcomes。

### MF-6 — 補 minimum error taxonomy 與 lifecycle escalation rule

至少讓施工者不必自行猜何時由 Feature 處理、何時必須交回 Shell。移除或修正圖上 `Error Contract → Feature Runtime` 的模糊指向。

### MF-7 — 把 no-horizontal-scroll 明確標回 Nook Works Pattern-1 candidate

保留 curated result principle；不要將 Nook-specific interaction pressure擴寫成 general browser platform responsibility。

## 6. Defer Until Challenged by a Real Pattern

以下問題不應在 v0.1 預建答案：

1. CRUD、dirty state、Save/Cancel 與 transaction interaction。
2. Master → Detail navigation / retrieval。
3. Export、audit、masking 與 bulk data authorization。
4. Server-side Pagination / Sorting / Filtering。
5. Generic Data Grid。
6. Design System / generalized component library。
7. Generic workflow engine。
8. Production RBAC / permission schema。
9. Generic cache layer。
10. Universal retry policy。
11. Query-state restoration 的通用方案。
12. Cross-feature shared state，除非 Pattern 2 提供真實 lifecycle evidence。
13. Feature Runtime plugin registry、component registry 或 dependency-injection framework。
14. Observability 的完整 platform standard；第一支 Feature 只需要保留 error/correlation diagnostics 的最低能力。
15. Partial-success general contract；除非下一個 real operation確實需要。

## 7. Pure Implementation Details

以下即使今天開工，也不需要寫進 general architecture：

- frontend framework、router、state library；
- folder/module naming；
- `FeatureRuntime` 是否用 component、hook、function 或 object 表達；
- form control implementation；
- loading spinner、skeleton、toast或 inline message；
- exact responsive breakpoints；
- comparator library與 table component；
- debounce milliseconds；
- HTTP client choice；
- CSS、native control normalization；
- local variable/type names；
- test runner；
- Native Data API / View / Custom API 的具體選擇，只要 Feature technical design 能證明它滿足 contract、安全與 boundedness；
- exact maximum row number；它是 Feature/data contract decision，不是 general architecture universal constant。

## 8. Boundaries Worth Preserving

### BP-1 — Shell lifecycle 與 Feature business state 分離

這是 v0.1 最強的 responsibility rule。Shell 擁有 session、Application Context、navigation、route 與 application invalidation；criteria/result/sort 不因 rendered inside Shell 就成為 global state。

### BP-2 — Feature Entry 不等於 Feature Data Access authorization

此 boundary 有直接 Shell evidence，且能防止實質 security error。

### BP-3 — Feature-facing data contract 與 physical schema / execution mechanism 分離

Feature 不應知道 table/view/join topology。不同 mechanism 可以滿足同一 operation contract，但只有在 auth、latency、failure 和 boundedness semantics 仍成立時才可稱為可替換。

### BP-4 — State ownership follows semantic lifecycle

這比任何特定 state library 都更耐久，也能阻止 Shell-global store 膨脹。

### BP-5 — Query-local error 與 application-lifecycle invalidation 分離

方向正確；需要補 taxonomy，但不應因此把所有 error 集中到 Shell。

### BP-6 — Curated result contract，而非 raw record dumping

這是 requirement/data-contract discipline，不依賴特定 UI framework；但應與 no-horizontal-scroll preference 分開。

### BP-7 — Complete-set precondition for client-side sorting

這是一個重要 correctness boundary。若無法證明結果完整，就不能用 current-page/client subset sorting 假裝 global ordering。

### BP-8 — 不以 speculative capability 冒充成熟度

v0.1 拒絕預建 CRUD、Export、Pagination、Design System、workflow engine、generic cache和generic repository，方向正確。

## 9. Prioritized Rework List

### P0 — Pattern 2 前必須處理

1. **將 `Feature Runtime` 降格為 Feature Activation Contract，或寫出其 exclusive responsibility/invariants。**
2. **改寫五段線性模型，分離 lifecycle、interaction semantics、operation contract 與 mechanism topology。**
3. **定義 first authenticated query 的 minimum handoff contract：current context/credential、activation、disposal、session invalidation。**
4. **定義 Pattern-1 minimum operation-contract checklist：criteria、result schema、identity、ordering、boundedness/completeness、authorization、errors。**
5. **加入最低 error taxonomy 與 Shell escalation規則。**
6. **加入最低 authorization obligations，避免 entry metadata 或 browser context被當成 trusted data authorization。**

### P1 — 建議在 Pattern 2 前澄清，但不阻擋 exploratory implementation

7. **將 no-horizontal-scroll 明確標為 Nook Works Pattern-1 candidate，而非 general platform rule。**
8. **說明 URL/query criteria 的 owner seam：Shell 可 transport，Feature retains semantics。**
9. **將 Direct Evidence、Architecture Inference、Candidate Boundary 和 Open Contract 的標示分開。**
10. **說明 Data Access Boundary 是 contract seam，不強制 repository/service wrapper。**

### P2 — 等真實 Pattern challenge

11. Query-state restoration。
12. Partial success。
13. Shared cache。
14. Common retry。
15. Cross-feature state。
16. Standardized reusable error UI。
17. Dedicated Runtime/plugin framework。
18. Pagination、Detail、Export、CRUD、Design System 等目前刻意 deferred capabilities。

## 10. Adversarial Failure Scenario

若要故意讓這套 architecture 長壞，最容易的入口是 `Feature Runtime`：

```text
Feature Runtime
→ 放 current user/context
→ 放 API clients
→ 放 error handling
→ 放 shared loading
→ 放 table/query schemas
→ 放 route state
→ 放 cache
→ 放 authorization helpers
→ 放 feature registry
→ 最後成為 service locator + global state + generic feature engine
```

它之所以危險，不是因為 runtime seam 一定不需要，而是目前 `may receive or access` 的範圍很廣，卻沒有 exclusive ownership 與 admission test。

第二個容易長壞的入口是 Data Access Boundary：若讀者把 contract boundary 誤解成每種 provider 前都必須有 repository interface，就會產生大量一對一 wrapper。Architecture 已反對這種 generic abstraction，修訂時應把這個禁止條件放得更靠近 Data Access 定義。

## 11. Unknowns / Assumptions

1. **GitHub visibility:** local repository 沒有 remote，故無法從本環境重新確認 `HEAD` 是否等於當下 GitHub `main`；本 review 假設 task creation snapshot 即 Work Order 指定 baseline。
2. **Formal business specification:** Work Order 的 Related Specification 是 `None`；因此沒有判定第一支 query 的具體 criteria、columns、row limit或 authorization policy。
3. **Production framework:** 未假設任何 frontend framework、router、state library或 DI mechanism。
4. **Authorization mechanism:** 未假設一定使用 RLS、custom API或 RBAC；只要求 trusted enforcement 與清楚 outcomes。
5. **Feature Runtime:** 本 review 假設 architecture 想表達的是 Shell/Feature execution seam，而不是已決定要建立 runtime framework；如果 Primary 原意是後者，現有 evidence 不足。
6. **Boundedness:** 未假設 provider default limit等於完整結果；必須由 Feature operation contract明示。
7. **Pattern 2 scope:** 本報告沒有替 Primary 決定 Pattern 2，也沒有要求以 speculative feature驗證所有 open questions。

## 12. Completion / Repository Integrity

原 review 僅產出 report，未修改 architecture、Experiment、Evidence、source code，亦未執行 deployment、Provider configuration或 Formal DB mutation。本文件只將已完成的 Review Report 保存為 GitHub-visible handoff artifact；沒有重新進行 review 或修正 architecture findings。
