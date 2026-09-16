# Work Order Catalog

本文件是 `agent-work/work-orders/` 的 Historical Navigation 與 Work Order Governance 入口。

核心目的不是追蹤 Worker KPI、工時或即時進度，而是讓未來的 Primary Agent（墨衡）在冷啟動、跨會話或 Agent 更換後，可以快速知道：**歷史上派過哪些工單、工單主要在做什麼、應該從哪一份 Contract 開始閱讀。**

Work Order 本體保存 dispatch intent / contract；GitHub PR / Commit 保存實際 change；Experiment / Evidence 保存研究結果與驗證。不要把這些責任重新揉成一張萬能 Ticket。

---

## Reading Path

未來 Primary Agent 建議依下列順序恢復工單脈絡：

1. `agent-work/README.md`：理解 Agent Collaboration governance。
2. 本 `agent-work/work-orders/index.md`：定位歷史 Work Order。
3. `agent-work/templates/work-order.md`：理解目前 canonical Work Order structure。
4. 讀取目標 Work Order 本體。
5. 只有在需要時再追 Related Report / Experiment / Evidence / PR / Commit。

這是 Progressive Reading Path。不要因為 Repository 有很多文件，就要求 Agent 每次先吞完整個知識宇宙再開始工作。那不是嚴謹，是 context 暴飲暴食。

---

## Work Order Governance

### Canonical Template

新 Work Order 一律以：

`agent-work/templates/work-order.md`

作為 canonical structure。

Template 的 Metadata labels 與主要 Sections 保持固定；當次不適用時填 `None`，不要刪除。如此未來 Primary Agent 可以區分「沒有」與「漏寫」，也能依固定位置快速定位 Objective、Scope、Acceptance、Deliverables 與 Decision Boundary。

### Work Order Is Not Task Tracking

Work Order 管理的是 **Work Order 本身**，不是 Worker。

因此 canonical Work Order：

- 不維護 `Status`。
- 不追蹤工時、完成百分比、KPI 或長期 Assigned / In Progress state。
- 不要求因 Codex 開始、完成、等待 QC 而反覆修改 Work Order。
- 執行結果由 Report / PR / Commit / Evidence 等 durable artifact 承接。

若未來真的出現長週期多人工作管理需求，再另行設計 Task Tracking；不要提前把 Work Order Catalog 養成半套 Jira。

### Canonical Type Vocabulary

每張新 Work Order 只選一個主要 `Type`：

- `Implementation`：建立或修改 executable / deployable artifact、runtime implementation 或 technical implementation。
- `Investigation`：以 reconnaissance、research、provider/runtime inspection 為主要工作，產出 findings / report，而非施工。
- `Review`：對既有設計、Evidence、Architecture candidate、implementation 或 experiment plan 進行獨立 review / QC / adversarial assessment。
- `Documentation`：以 knowledge capture、documentation restructuring、catalog/governance content 維護為主要工作。
- `Experiment`：主要工作本身就是建立或執行 controlled probe，以取得新的 runtime/provider evidence。

Type 描述**主要工作性質**，不是列出所有碰到的活動。不要建立 `Experiment / Investigation / Review Support / Implementation-ish` 這種把 taxonomy 當購物清單的寫法。

### Historical Work Orders

本 Catalog 建立前的 Work Order 結構並不一致，例如 `Type / Work Type / Execution Type`、`Repository / Target Repository`、`Baseline / Source baseline`、`Owner / Requested By` 等 label 曾經漂移，也有部分文件沒有日期或 Metadata section。

這些歷史 Work Order **不做 retroactive rewrite**，避免改寫當時的 dispatch contract。Catalog 只依原始內容做 normalized navigation classification；原始文件仍保留歷史真相。

若歷史文件沒有明確 Date，Catalog 使用 `None`，不從 commit timestamp 或檔名以外的間接線索偷偷補成事實。

---

## Catalog

| Date | Type | Work Order | Primary Objective |
|---|---|---|---|
| 2026-09-16 | Review | [`application-shell-experiment-review-v2`](application-shell-experiment-review-v2.md) | 獨立審查並收斂 Application Shell 實驗範圍、lifecycle、user_type fixture、RWD evidence 與 stop condition。 |
| 2026-09-15 | Review | [`2026-09-15-nook-platform-readiness-blind-spot-review`](2026-09-15-nook-platform-readiness-blind-spot-review.md) | 從獨立 Reviewer 視角檢查 Nook Technical Platform 在形成 Architecture 前是否仍有重要 capability gap、hidden assumption 或 boundary。 |
| 2026-09-15 | Investigation | [`2026-09-15-codex-subscription-auth-automation-recon`](2026-09-15-codex-subscription-auth-automation-recon.md) | 研究無額外 API billing 的 Codex unattended automation 是否能安全使用既有 ChatGPT/Codex plan allowance。 |
| 2026-09-15 | Investigation | [`2026-09-15-codex-github-boundary-recon`](2026-09-15-codex-github-boundary-recon.md) | 釐清 Codex Cloud / runtime / GitHub 的 repository、branch 與 cross-repo authority boundary。 |
| 2026-09-15 | Review | [`2026-09-15-p-codex-phone-phase2-5-adversarial-validation`](2026-09-15-p-codex-phone-phase2-5-adversarial-validation.md) | 對 Primary 的 Codex autonomous dispatch draft architecture 做 adversarial validation，找出 unsupported assumption、security gap 與更小方案。 |
| 2026-09-15 | Investigation | [`2026-09-15-codex-dispatch-experiment-design`](2026-09-15-codex-dispatch-experiment-design.md) | 依 Phase 1 evidence 設計最小可信的 Codex external dispatch experiments 與 Phase 3 PoC 形狀，不執行。 |
| 2026-09-15 | Investigation | [`2026-09-15-codex-external-dispatch-recon`](2026-09-15-codex-external-dispatch-recon.md) | 調查外部系統是否有受支援的 Codex task/session/CLI invocation surface，以及最薄 dispatch fallback。 |
| 2026-09-14 | Documentation | [`2026-09-14-batch-scheduling-knowledge-capture`](2026-09-14-batch-scheduling-knowledge-capture.md) | 將 Batch Runtime / Scheduling 實驗收納進 Experiment Record、Catalog、Evidence、Research Map 與 Human View navigation。 |
| 2026-09-14 | Implementation | [`2026-09-14-cron-edge-auth-rework`](2026-09-14-cron-edge-auth-rework.md) | 修正 Cron B Edge Function service-to-service authentication boundary，保留既有 batch processing semantics。 |
| 2026-09-14 | Implementation | [`2026-09-14-supabase-cron-edge-auth-rework`](2026-09-14-supabase-cron-edge-auth-rework.md) | 從 current main 建立乾淨的新 auth rework task，修正已 merge worker 的 server-side apikey authorization contract。 |
| 2026-09-14 | Implementation | [`2026-09-14-supabase-cron-edge-observer`](2026-09-14-supabase-cron-edge-observer.md) | 建立 scheduled Edge Function worker 與 authenticated Browser Observer，完成 Batch Scheduling 第二段實驗 Artifact。 |
| 2026-09-13 | Investigation | [`2026-09-13-netlify-boundary-doc-audit`](2026-09-13-netlify-boundary-doc-audit.md) | Audit Netlify publish-boundary restructure 後的 repository documentation inconsistency，只產出 findings、不修正。 |
| 2026-09-13 | Documentation | [`2026-09-13-netlify-boundary-doc-fix`](2026-09-13-netlify-boundary-doc-fix.md) | 依已接受 Audit findings 修正四個 stale Browser Artifact paths，維持 minimal diff。 |
| 2026-09-13 | Documentation | [`2026-09-13-netlify-boundary-doc-fix-v2`](2026-09-13-netlify-boundary-doc-fix-v2.md) | 以符合 Codex Cloud snapshot model 的 Preflight 重派同一組 Netlify documentation path fixes。 |
| 2026-09-13 | Experiment | [`2026-09-13-netlify-trigger-boundary-case-b-v2`](2026-09-13-netlify-trigger-boundary-case-b-v2.md) | 建立 docs-only controlled probe，觀察 current Netlify build.ignore 是否真的對 repository-only change 停止 deploy。 |
| 2026-09-13 | Experiment | [`2026-09-13-netlify-trigger-boundary-observability-probe`](2026-09-13-netlify-trigger-boundary-observability-probe.md) | Instrument Netlify ignore stage，取得 CACHED_COMMIT_REF、COMMIT_REF、merge-base 與 changed-path 的 provider evidence。 |
| 2026-09-13 | Experiment | [`2026-09-13-netlify-trigger-boundary-git-ref-topology-probe`](2026-09-13-netlify-trigger-boundary-git-ref-topology-probe.md) | 觀察 Netlify Deploy Preview checkout 的 Git ref topology，判斷是否存在可信 PR base comparison boundary。 |
| 2026-09-13 | Investigation | [`2026-09-13-netlify-trigger-boundary-next-investigation`](2026-09-13-netlify-trigger-boundary-next-investigation.md) | 根據 PR #7 evidence 比較下一個 Trigger Boundary candidate，提出最小下一步實驗而不修改 runtime rule。 |
| 2026-09-13 | Experiment | [`2026-09-13-netlify-trigger-boundary-fresh-base-fetch-probe`](2026-09-13-netlify-trigger-boundary-fresh-base-fetch-probe.md) | 驗證 Netlify ignore stage 能否 fresh-fetch current base 到隔離 ref 並取得可信 cumulative PR changed paths。 |
| None | Implementation | [`custom-api-orchestration`](custom-api-orchestration.md) | 建立 Custom API → Custom API → RLS-backed data → Open-Meteo orchestration probe、deployment workflow 與 Browser Test UI。 |
| None | Implementation | [`experiment-catalog`](experiment-catalog.md) | 將 Playground Experiment Gallery 改造成 metadata-driven Catalog，建立 catalog schema、generator、tag/status governance 與 migration。 |
| None | Implementation | [`playground-human-view`](playground-human-view.md) | 將 Playground 首頁擴充成 Experiments / Short Term / Knowledge Map Human View，加入 runtime Markdown Reader 與 Mermaid rendering。 |

---

## Maintenance Rule

Primary Agent 建立新 Work Order 時，應在同一個 dispatch preparation checkpoint：

1. 從 canonical Template 建立 Work Order。
2. 確認 Metadata 與固定 Sections 完整，不適用項目填 `None`。
3. 在本 Catalog 新增一列 `Date / Type / Work Order / Primary Objective`。
4. 再 commit 必要 dispatch context，交由 Claire 建立 Codex Task / Workspace。

Catalog 是 navigation，不是第二份 Work Order。`Primary Objective` 只保留一句可定位摘要，不複製 Scope、Acceptance 或 Decision Boundary。
