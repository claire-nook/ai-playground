# Nook Works Platform Architecture Readiness / Blind Spot Review

- Work Order: `2026-09-15-nook-platform-readiness-blind-spot-review`
- Review date: 2026-09-15
- Reviewer role: independent Platform Architecture reviewer
- Review type: Evidence / responsibility / boundary review（不是 Architecture Decision，也不是新 Experiment）

# Executive Judgment

## 結論

**我會允許團隊開始撰寫 Platform Architecture。就目前可讀 Evidence 而言，Backend / Data / Integration 沒有新的 technical `BLOCKING` gap。** Auth、caller-scoped data access、read model、Custom API composition、backend service database access、database-owned / backend-owned transaction，以及 scheduled execution 的主要 mechanism 都已有 runtime Evidence；現在更重要的工作，是把已驗證的 capability 轉成少量、明確的 Platform Rule，而不是再做 provider feature tour。

但這個判斷有一項重要 qualification：本次 workspace 無法讀取 `claire-nook/nook-works`。嘗試由公開 GitHub URL clone 時，environment 回覆 `CONNECT tunnel failed, response 403`；workspace 內也沒有第二個 repository。因此我**沒有假裝 Review 過** `docs/business/specifications/batch/daily-weather.md` 或其他 formal specifications。本報告只能使用 Work Order 已明載的 Daily Weather semantics（`Delete + Insert` 同一 transaction、rollback、failure persistence 等）以及 Playground 對該 specification 的引用。這不構成 platform capability blocker，但構成 independent requirements-coverage assurance 的 limitation：Architecture draft 可以開始，正式定稿前仍應由能讀 formal repository 的 Reviewer 做 requirement-to-platform traceability check。

另有一項 snapshot anomaly：Work Order 要求的 root `playground.md` 不存在。`knowledge/maps/nook-technical-platform.md` 與 `knowledge/experiments.md` 仍把 C-BSA-1 寫成 Planned / candidate，但專屬 record、catalog 與 consolidated Evidence 已顯示 A/B/C/D 完成。這證明 Research Map 不能單獨作 readiness source。

## Readiness 分層

| Area | Judgment | Architecture 前的處置 |
| --- | --- | --- |
| Backend / Data / Integration core | Ready to draft | 將 candidates 收斂為 selection rules；不需新 blocking experiment |
| Batch reliability contract | Ready with open design | 先定義 idempotency、retry ownership、failure persistence、run identity；只有 requirement 需要 provider-specific assurance 時才做 focused experiment |
| Application Shell | 必須列入 Platform Architecture，但可與 UI exploration 並行 | 先定 layer / contracts；session recovery 與 permission-aware routing 值得 focused verification |
| Authorization / error semantics | Mechanism 足夠、contract 尚未定 | `PLATFORM RULE / DESIGN`；不要把 RLS empty result 當完整 business contract |
| Production credential / environment / connection governance | Feasibility 有、production rule 未定 | `PLATFORM RULE / DESIGN`，採 fail-closed；不把 Playground `postgres` probe 當 production approval |
| Formal requirement coverage | Review assurance incomplete | Architecture draft 前進；定稿前補 cross-repo traceability review |

# Evidence-backed Coverage Map

以下按 Platform Responsibility / Boundary 整理，不按 Experiment ID 列功能清單。

| Platform responsibility / boundary | Evidence-backed coverage | Maturity / remaining boundary |
| --- | --- | --- |
| Identity establishment | Browser Email / Password sign-in、session acquisition、JWT propagation 已驗證；Auth identity 與 application user/access 被明確分開。參見 [Auth record](../../experiments/auth/README.md)。 | **Verified Capability**。尚不是 application bootstrap、refresh/recovery、logout propagation 或 route lifecycle 的 Platform Rule。 |
| Caller-scoped authorization | Browser session 經 Native Data API，以 PostgreSQL grants + RLS 控制 CRUD；anonymous、inactive user、missing app user、active user 有對照。參見 [Data API record](../../experiments/data-api/README.md)。 | **Verified Capability**。RLS-filtered `[]`、zero affected rows 的 business meaning 仍需 API / UI contract。 |
| Read model / projection | `security_invoker = true` View 維持 invoking-user base-table security，可承擔 Native Data API read model。參見 [View record](../../experiments/data-api-view/README.md)。 | **Architecture Candidate**。View ownership、migration / compatibility、哪些 projection 可直接公開仍需 design。 |
| Browser-to-Custom-API boundary | Cross-origin invocation、CORS、caller JWT、Edge Function 內 caller-scoped RPC / Data API、response mapping 已 runtime verified。參見 [Custom API record](../../experiments/custom-api/README.md)。 | **Verified Capability**，但 endpoint-level business authorization 與 stable error envelope 尚未成為 Platform Rule。 |
| API composition / external integration | Caller-aware Edge Function 組合另一 Custom API，保留 JWT / RLS，再呼叫 Open-Meteo 並 normalize result，已驗證。 | **Verified Capability**。External provider timeout、retry、rate limit、credential lifecycle 應由真實 integration contract 觸發，不宜泛化研究。 |
| Backend service database authorization | Object privilege 與 RLS 可分離；direct table operation 與 approved Function `EXECUTE` 可分離；endpoint caller identity 與 backend DB identity亦被辨識為不同 boundary。參見 [C-BSA-1](../../experiments/custom-api/c-bsa-1.md) 與 [consolidated findings](../../evidence/c-bsa-1-consolidated-findings.md)。 | **Verified Capability / Architecture Candidates**。Production restricted DB role、grants 與 secret governance 尚須 Platform Rule。 |
| Business operation / transaction ownership | Independent Data API calls 不共享 rollback；one RPC 可持有 database-owned transaction；Edge Function PostgreSQL client 可持有 backend-owned transaction。Controlled failure 與 independent state verification 已完成。 | 足以選 pattern。核心 rule 應是 `Transaction owner = layer owning complete Business Operation.`；不可從 feasibility 推導「全部 RPC」或「全部 direct DB」。 |
| Scheduling / batch invocation | Cron → DB Function、Cron → `pg_net` → authenticated Edge Function、scheduled external HTTP、Data API update、static/runtime/function-derived parameters及 job lifecycle均已驗證。參見 [Batch record](../../experiments/batch-scheduling/README.md) 與 [implementation guide](../../knowledge/implementation/supabase-cron.md)。 | **Verified Capability**。Scheduling 成功、HTTP 成功、business/data success 已知不同；operational contract 尚需設計。 |
| Deployment / exposure boundary | Netlify public publish boundary、Supabase Edge Function lifecycle、Netlify Function lifecycle與 GitHub Actions remote execution已有 Evidence；provider convenience default 不能代表 exposure intent。參見 [provider pitfalls](../../evidence/provider-boundary-pitfalls.md)。 | 足以形成 fail-closed deployment rule；environment promotion、configuration ownership與 rollback policy仍是 formal architecture concern。 |
| Observability boundary | Existing records 已分出 Scheduler History → HTTP / `pg_net` → Edge runtime → DB result → business state，且觀察到 client timeout 時 downstream 仍可能完成。 | **Partial but sufficient to design**。缺 correlation / operation ID、durable run state、redaction、alert ownership等 production contract。 |
| Application Shell | 現有 browser artifacts證明獨立 flow 可運作。 | **Coverage gap**：沒有證明把 auth/session、bootstrap、navigation、route lifecycle、permission-aware feature entry整合成 reusable shell contract。 |

## Maturity guardrail

本報告刻意維持：

```text
Verified Capability
≠ Architecture Candidate
≠ Preferred Pattern
≠ Platform Rule
≠ Production Implementation
```

C-BSA-1 尤其只證明三種 operation / transaction placement 可行；D-BATCH-1 也只證明 scheduling mechanism 與 parameter sources。Architecture 的下一步是選擇與限制，而不是將所有已測 capability 同時標準化。

# Potential Blind Spots

## Disposition summary

| ID | Candidate | Disposition | Needs Experiment? |
| --- | --- | --- | --- |
| BS-1 | Formal requirement-to-platform traceability 無法在本 workspace 完成 | `SHOULD VERIFY` | No；需要 repository review |
| BS-2 | Scheduled operation 的 ambiguous completion、idempotency、retry ownership與 failure persistence | `PLATFORM RULE / DESIGN`，必要時 `SHOULD VERIFY` | 先 design；有具體 retry contract 才 focused experiment |
| BS-3 | Business authorization與 stable error contract | `PLATFORM RULE / DESIGN` | 通常 No |
| BS-4 | Application Shell 的 session / route / permission lifecycle | `SHOULD VERIFY` | Yes，最小整合 probe；可與 UI research 並行 |
| BS-5 | Production service identity、secret、direct DB connection governance | `PLATFORM RULE / DESIGN` | restricted-role mechanism有疑義時才需要 |
| BS-6 | Cross-layer observability缺 operation correlation / durable outcome model | `PLATFORM RULE / DESIGN` | No；可隨第一個 representative workflow驗收 |
| BS-7 | Research Map / Catalog 狀態漂移 | `PLATFORM RULE / DESIGN`（research governance） | No |
| BS-8 | Concurrency / isolation / deadlock / load / distributed consistency | `DEFERRED` | Future trigger 後才是 Yes |
| BS-9 | Pure compute / longer-running / provider comparison | `DEFERRED` | Future workload trigger 後才是 Yes |
| BS-10 | UI visual system / component aesthetics | `NOT A GAP` | 已有下一階段 UI exploration |

## BS-1 — Formal requirements traceability

- **Platform Responsibility**：確認 Platform Rule 覆蓋真實 Business Operation，而非只覆蓋實驗設計者想到的 program shapes。
- **Why evidence is insufficient**：本次無法讀 `nook-works`，因此無法獨立抽樣 Daily Weather 以外的 Business Specification / Schema / Architecture；Work Order 所述責任模型也無法對 formal documents 實際核對。
- **Architecture concern**：可能存在 file/storage、reporting、approval、long-running workflow、temporal semantics或其他尚未進 Research Map 的 requirement。
- **Risk**：把「現有 experiments 覆蓋完整」誤認為「formal workload space 覆蓋完整」。
- **Disposition**：`SHOULD VERIFY`。這不是 provider Experiment，而是定稿前的 cross-repo traceability review。若 review 找出新 capability need，再判斷是否需 Experiment。

## BS-2 — Batch execution semantics 不等於 scheduler invocation

- **Platform Responsibility**：對 scheduled Business Operation 定義 execution identity、duplicate handling、retry owner、failure persistence與可判定的 terminal outcome。
- **Why evidence is insufficient**：Evidence 已證明「短 timeout / transport failure signal 與 downstream commit 可同時發生」，也明確指出 Scheduler success ≠ HTTP success ≠ business success；但還沒有一個 Platform Contract 說重試是否安全、如何辨識同一 logical run、失敗寫在哪裡、誰決定 retry。
- **Requirement / concern**：Work Order 明列 Business Specification 應描述 commit point、rollback scope、failure persistence；Daily Weather 是 scheduled replacement workload。
- **Risk**：timeout 後重試造成 duplicate / repeated destructive work，或 operation 已 commit 卻被紀錄成 failed；只看 Cron 綠燈則漏掉 business failure。
- **Disposition**：`PLATFORM RULE / DESIGN`，不是立即 `BLOCKING` experiment。先由 Business Specification 定義 repeat semantics，再由 Platform Architecture定義 invocation / operation ID、idempotency boundary、durable run record與 retry ownership。
- **Experiment threshold**：若 chosen pattern 依賴 provider redelivery、concurrent invocation或 timeout-after-commit behavior 才能判斷 correctness，才做 focused experiment。

## BS-3 — Data visibility與 Business Operation result 被隱性等同

- **Platform Responsibility**：把 validation、authentication、authorization、not found / no visible data、conflict、business rejection與 unexpected failure映射成 stable API contract。
- **Why evidence is insufficient**：Data API 已直接觀察到 RLS SELECT 可回 `200 + []`，UPDATE / DELETE 也可能 `error = null` 但沒有 affected rows。這對 privacy-preserving CRUD 是有效 provider semantics，卻不能自動回答 Business Operation 應如何對 caller表意。
- **Risk**：UI 把「無權限」當「沒有資料」或把 zero-row write 當成功；不同 endpoints 各自發明錯誤格式。
- **Disposition**：`PLATFORM RULE / DESIGN`。Mechanism 並不神秘，通常不需 Experiment；需由 endpoint threat model與 Business Specification決定何時刻意不可區分、何時必須 explicit 403/404/409。

## BS-4 — Application Shell lifecycle

- **Platform Responsibility**：在 feature code 之前一致處理 application bootstrap、session loading / expiry / refresh、route guards、navigation visibility、feature entry與global error/loading boundary。
- **Why evidence is insufficient**：Auth與各 browser artifact驗證的是 isolated capability，不是 multi-route application lifecycle。`signIn` 成功不代表 cold start、stale session、token refresh、sign-out、deep link與permission change的行為一致。
- **Requirement / concern**：任何 browser application 都需要 stable entry / navigation boundary；permission-aware navigation還必須避免把「menu hidden」誤當 authorization。
- **Risk**：每個 page 重寫 session gate、初始化 race、redirect loop、短暫顯示未授權 feature；UI architecture反向決定 security behavior。
- **Disposition**：`SHOULD VERIFY`，但不阻擋 Backend / Data Architecture 起草。最小 shell experiment可與下一階段 UI exploration 共用，不研究 aesthetics。

## BS-5 — Production backend identity governance

- **Platform Responsibility**：分離 endpoint authentication、database identity、object/operation privilege、secret custody與connection lifecycle。
- **Why evidence is insufficient**：Phase D 使用 `postgres` 只證明 backend-owned transaction feasibility；consolidated Evidence也明確不批准其 production use。
- **Risk**：以 broadly privileged credential 讓所有 Edge Functions共用，導致一個 component compromise跨越所有 domain；serverless connection misuse也可能耗盡 pool。
- **Disposition**：`PLATFORM RULE / DESIGN`。Architecture 至少要定義 restricted application role、per-responsibility grants、secret source / rotation、Transaction Pooler使用規則與禁止 owner credential。只有 provider role / pooler限制不明時才需 focused experiment。

## BS-6 — Observability 還缺 end-to-end operation identity

- **Platform Responsibility**：跨 scheduler、HTTP、runtime、DB transaction與business state關聯同一 logical operation，且不洩漏 secrets / personal data。
- **Why evidence is insufficient**：已有 layer model與分層檢查經驗，沒有 durable correlation / status contract。
- **Risk**：同一次 run 的 timeout與successful commit被當成兩個事件；support無法安全重放或判斷是否需要人工介入。
- **Disposition**：`PLATFORM RULE / DESIGN`。先規定 operation/run ID、structured log fields、durable status owner、redaction與evidence retention；在第一個 formal batch implementation做 acceptance，不需獨立 provider probe。

## BS-7 — Research state drift

`knowledge/maps/nook-technical-platform.md` 和 `knowledge/experiments.md` 仍把 C-BSA-1 當 Planned，然而 `experiments/custom-api/c-bsa-1.md`、catalog與 consolidated findings 都是 complete。這不是 platform runtime gap，卻是 architecture input provenance gap。若只讀 Map，會重做已完成研究；若只讀 catalog，則會看不到 Map 當時的 decision context。

**Disposition：**`PLATFORM RULE / DESIGN`（research governance）。Architecture input 應引用 dated underlying Evidence，並保留 explicit open-decision register；不要把 Map status 當真實世界的單一 authority。

## Deferred topics 與 future trigger

| Topic | Why deferred now | Future trigger |
| --- | --- | --- |
| Isolation level / concurrent writers / deadlock / retry | 無 representative contention / correctness requirement | 同一 aggregate / date partition出現可並行 writers，或 specification定義 lost-update不可接受 |
| Distributed transaction / compensation | 現有 DB atomicity不能也不應假裝 rollback external API | Business Operation要求 external side effect與DB state跨系統一致 |
| High throughput、connection exhaustion、load benchmark | 尚無 quantified workload / SLO | 有預估 concurrency、latency SLO、connection budget或provider incident |
| Pure compute / longer-running runtime | 無 representative CPU / duration workload | 出現超出 Edge runtime限制的 image/report/optimization等真實 job |
| Multi-provider failover / provider comparison | Supabase-first candidates已足夠且無 availability / compliance requirement | Business continuity、data residency、cost或vendor exit requirement成為 decision |
| Advanced orchestration / workflow engine | 現階段 flow可由 Cron + API / DB operation表達 | 出現 multi-step durable waits、branching、compensation、human approval或跨日 resume |
| Offline-first / real-time sync | formal requirement 未取得 | Nook Works明確要求離線編輯、多裝置衝突或即時協作 |
| UI visual design / component aesthetics | 已明確排入下一階段且不是本 review 的 platform capability gap | UI research開始 |

# Application Shell Assessment

## Placement judgment

Application Shell 應被視為 **Platform 的 browser-side composition layer**，不是純 UI presentation，也不必先成立一個與整個 Platform平行的永久 Research Program。

```text
Platform security / API contracts
        ↓
Application Shell
  - bootstrap + session context
  - route / page lifecycle
  - permission-aware navigation
  - feature entry registry
  - global loading / error boundary
        ↓
Feature UI + visual patterns
```

理由：shell 持有 cross-feature lifecycle 與 policy consumption；button color、table spacing、Dialog appearance則屬 UI exploration。Navigation visibility只改善 UX，真正 authorization仍在 API / DB boundary。Global state也不應因「shell」三個字變成萬物倉庫：只放 session、current application identity、environment-safe configuration與少量 cross-feature state；domain state留在 feature / operation owner。

## 建立 Architecture 前需要知道到什麼程度

Architecture draft 應先定義：

1. Auth session與application-user/access context的來源及不同狀態（loading、anonymous、authenticated-but-ineligible、eligible、error）。
2. Cold start / deep link時，route resolution是否等待 bootstrap；redirect loop如何避免。
3. Route / menu metadata如何引用 permission / feature availability；hidden navigation不構成 security control。
4. Token expiry / refresh / sign-out如何使 cached user / feature state失效。
5. Feature entry contract、not-found / forbidden / unavailable與global unexpected error的 ownership。
6. 哪些 configuration可安全送到 Browser，哪些只存在 server-side。

## Recommended minimal focused experiment

- **Research Question**：Netlify-hosted multi-route shell 在 cold start、valid session、expired/removed session、authenticated-but-ineligible identity與sign-out時，能否產生 deterministic bootstrap / route / navigation behavior，且所有真正 access仍由 backend拒絕？
- **Why now**：這是 Auth Evidence與下一階段 UI pattern之間唯一明顯的 browser architecture seam；若不先固定 contract，各 feature會各自建立 session gate。
- **Minimal Evidence needed**：至少一個 public route與一個 protected route；cold deep link；session restore；forced invalid/expired session；inactive/missing app user；sign-out；menu visibility與direct URL / API denial對照；state transition log。可使用 synthetic data，不需 visual design。
- **Stop Condition**：上述 state matrix行為 deterministic、沒有 redirect loop / stale privileged state，並證明 navigation不是authorization boundary。停止，不擴張成 component library或完整 app。

# Hidden Assumptions

1. **「一個綠燈代表整個 operation 成功」**：已被 D-BATCH-1 的 layered outcomes反證；Architecture 若不提供 durable business outcome，團隊仍可能回到這個 assumption。
2. **「transport timeout 表示沒有 side effect」**：Evidence 明示 timeout時 Edge Function仍可能完成 insert。任何 blind retry都必須先有 idempotency / reconciliation contract。
3. **「authenticated 等於有效 Application User」**：Auth、`app_user` existence、active state是不同 boundary；Shell與API都不能只檢查 token存在。
4. **「RLS-filtered empty / zero affected rows等於成功或不存在」**：它只證明 caller看不到 / 改不到，未決定 business semantics。
5. **「trusted backend / service role 等於所有 DB object都可存取」**：formal `place` failure及 C-BSA-1 已反證；RLS bypass、object privilege與Function EXECUTE是不同 controls。
6. **「one application call sequence equals one transaction」**：separate Data API requests 不共享 rollback；只有完整 owner持有的 one RPC / DB connection transaction符合 atomic boundary。
7. **「能使用 backend-owned transaction 就已有 production pattern」**：Phase D 使用 `postgres`，只證明 feasibility；restricted role、pooling、secret lifecycle尚未獲批准。
8. **「external call可以和 DB transaction一起 rollback」**：現有 Evidence只涵蓋 PostgreSQL atomicity；external side effect需要 idempotency / compensation等另一種 consistency model。
9. **「Browser demo成功等於 Application Shell已驗證」**：isolated pages沒有覆蓋 bootstrap、refresh、deep link、logout與route lifecycle。
10. **「Research Map 是完整且即時的 coverage source」**：C-BSA-1 status drift直接反證。Readiness review必須回到 underlying record / Evidence。
11. **「已抽樣 Daily Weather 就代表 Nook Works requirement space」**：本次甚至無法重新讀該 formal spec，更無法抽樣其他 specs；此 assumption必須由 cross-repo traceability review排除。
12. **「scheduled date參數等於 business date semantics」**：Cron可產生 `current_date - 1` 已驗證，但 timezone、business calendar、rerun date與backfill policy仍是 Business Specification / Platform Rule，不是 SQL expression capability問題。

# Recommended Next Research

## 先做 Architecture / Rule，不先做 Experiment

1. **Operation pattern selection rule**：依 Business Operation owner與atomicity選 Native Data API、database-owned RPC或backend-owned transaction；明示 anti-pattern（multi-request假交易、ordinary CRUD全面 RPC 化）。
2. **Authorization / error contract**：定義 caller identity、application eligibility、operation authorization，以及 privacy-preserving 404 / explicit 403 / conflict / validation的使用條件與共用 envelope。
3. **Batch execution contract**：定義 logical run ID、business date、idempotency key / uniqueness boundary、retry owner、failure persistence、manual rerun / reconciliation與 terminal status。
4. **Production identity / secret / connection rule**：restricted DB roles、least privilege、secret custody / rotation、Browser-safe config、pooler與transaction cleanup。
5. **Observability contract**：correlation fields、layered status、durable outcome、redaction、retention與alert ownership。
6. **Architecture evidence register**：每個 rule標示 `Verified Capability`、`Architecture Candidate`、`Preferred Pattern`、`Open Decision`、`Deferred`及 supporting evidence；不要因 Map drift重做研究。
7. **Cross-repo requirement traceability**：由可讀 `nook-works` 的 Reviewer抽樣 Daily Weather加至少兩種不同 responsibility形態的 spec/schema/architecture，確認沒有 storage、reporting、approval、temporal或integration boundary被漏掉。

## 值得做的唯一近期 focused experiment

Application Shell lifecycle probe（上一節所述）。它可以與 UI Pattern exploration共用 artifact，但 acceptance只看 bootstrap / session / route / permission behavior，不看 aesthetics。

## Conditional experiment — Batch retry / idempotency

- **Research Question**：在 chosen Daily Weather execution contract下，同一 logical run遇到 concurrent invocation或 timeout-after-commit重試時，是否能維持 specification定義的 state與可判定 outcome？
- **Why now**：**只有** formal specification / Platform design決定會自動 retry、允許 manual rerun或存在duplicate delivery時才需要；不是目前先做的通用研究。
- **Minimal Evidence needed**：相同 operation ID雙次 / 並行 invocation、failure-before-commit、success-but-caller-timeout、retry-after-commit；獨立驗證 business rows與run record。測真正選定的 RPC或backend-owned transaction pattern，不同時測所有候選。
- **Stop Condition**：chosen contract對四種 control case的結果 deterministic，且operator可分辨 committed / retryable / terminal failure。停止，不做泛用 workflow engine或load test。

# Final Independent Assessment

如果我是 Nook Works Tech Lead，我會批准團隊**現在開始撰寫 Platform Architecture draft**。Backend / Data / Integration 已達到足以設計的 Evidence threshold；沒有理由等待另一輪 broad capability experiments，也不應把 C-BSA-1、D-BATCH-1 的所有可行路徑一次升格成平台標準。

我不會批准目前就宣稱「Platform Architecture complete」。完成前需要：

- 把 transaction ownership、authorization / error semantics、batch idempotency / failure persistence、production identity / secrets / connections與observability寫成 Platform Rule / Open Decision；
- 將 Application Shell納入 browser platform layer，至少完成 lifecycle-focused verification；
- 由能存取 `nook-works` 的 Reviewer做 cross-repo requirement traceability，補足本次明確 limitation。

**Blocking Gap 最終回答：沒有已識別的 technical `BLOCKING` capability gap。** 可保留為 Architecture 中的 Deferred / Open Decision 包括：concurrency / isolation tuning、advanced retry、distributed compensation、long-running compute、workflow orchestration、multi-provider strategy，以及在 formal requirement 出現前的 offline / real-time capability。Batch retry experiment與Application Shell probe都應是 bounded、requirement-driven follow-up；不得在本次 review 中自行開始。
