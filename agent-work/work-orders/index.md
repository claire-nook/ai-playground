# Work Order Catalog

本文件是 `agent-work/work-orders/` 的 Historical Navigation 與 Work Order Governance 入口。Work Order 管理工單，不管理 Worker KPI / 即時進度；實際 change 由 PR / Commit，研究結果由 Experiment / Evidence 承接。

## Reading Path

1. `agent-work/README.md`
2. `agent-work/work-orders/index.md`
3. `agent-work/templates/work-order.md`
4. 目標 Work Order
5. 需要時再追 Related Report / Experiment / Evidence / PR / Commit

## Work Order Governance

新 Work Order 一律使用 `agent-work/templates/work-order.md` canonical structure。Metadata labels 與主要 Sections 固定，不適用填 `None`，不要刪除。

Work Order 不維護 `Status`、工時、完成百分比或 KPI。Canonical Type 每張只選一個：`Implementation`、`Investigation`、`Review`、`Documentation`、`Experiment`。

Historical Work Orders 不 retroactive rewrite；Catalog 只做 normalized navigation，避免改寫當時 dispatch contract。

## Catalog

| Date | Type | Work Order | Primary Objective |
|---|---|---|---|
| 2026-09-17 | Review | [`2026-09-17-general-platform-architecture-v01-review`](2026-09-17-general-platform-architecture-v01-review.md) | 從 Architecture Reviewer 與 Implementer 雙視角 adversarially review General Application Platform Architecture v0.1。 |
| 2026-09-16 | Implementation | [`2026-09-16-application-shell-vertical-slice`](2026-09-16-application-shell-vertical-slice.md) | 實作 S-SHELL-1 disposable Application Shell vertical slice，整合 Auth/bootstrap、metadata Navigation、三種 Feature integration shape、routing 與 iPad-first responsive behavior。 |
| 2026-09-16 | Review | [`2026-09-16-application-shell-implementation-readiness-review`](2026-09-16-application-shell-implementation-readiness-review.md) | 獨立評估 S-SHELL-1 在 Codex 無 Supabase management access 條件下的 implementation readiness、可施工範圍、runtime contract 與 validation handoff。 |
| 2026-09-16 | Review | [`application-shell-experiment-review-v2`](application-shell-experiment-review-v2.md) | 獨立審查並收斂 Application Shell 實驗範圍、lifecycle、user_type fixture、RWD evidence 與 stop condition。 |
| 2026-09-15 | Review | [`2026-09-15-nook-platform-readiness-blind-spot-review`](2026-09-15-nook-platform-readiness-blind-spot-review.md) | 從獨立 Reviewer 視角檢查 Nook Technical Platform 在形成 Architecture 前是否仍有重要 capability gap、hidden assumption 或 boundary。 |
| 2026-09-15 | Investigation | [`2026-09-15-codex-subscription-auth-automation-recon`](2026-09-15-codex-subscription-auth-automation-recon.md) | 研究無額外 API billing 的 Codex unattended automation 是否能安全使用既有 ChatGPT/Codex plan allowance。 |
| 2026-09-15 | Investigation | [`2026-09-15-codex-github-boundary-recon`](2026-09-15-codex-github-boundary-recon.md) | 釐清 Codex Cloud / runtime / GitHub 的 repository、branch 與 cross-repo authority boundary。 |
| 2026-09-15 | Review | [`2026-09-15-p-codex-phone-phase2-5-adversarial-validation`](2026-09-15-p-codex-phone-phase2-5-adversarial-validation.md) | 對 Primary 的 Codex autonomous dispatch draft architecture 做 adversarial validation。 |
| 2026-09-15 | Investigation | [`2026-09-15-codex-dispatch-experiment-design`](2026-09-15-codex-dispatch-experiment-design.md) | 依 Phase 1 evidence 設計最小可信的 Codex external dispatch experiments 與 Phase 3 PoC 形狀。 |
| 2026-09-15 | Investigation | [`2026-09-15-codex-external-dispatch-recon`](2026-09-15-codex-external-dispatch-recon.md) | 調查外部系統可用的 Codex task/session/CLI invocation surface 與最薄 dispatch fallback。 |
| 2026-09-14 | Documentation | [`2026-09-14-batch-scheduling-knowledge-capture`](2026-09-14-batch-scheduling-knowledge-capture.md) | 收納 Batch Runtime / Scheduling 實驗到 Knowledge / Evidence / Catalog。 |
| 2026-09-14 | Implementation | [`2026-09-14-cron-edge-auth-rework`](2026-09-14-cron-edge-auth-rework.md) | 修正 Cron B Edge Function service-to-service authentication boundary。 |
| 2026-09-14 | Implementation | [`2026-09-14-supabase-cron-edge-auth-rework`](2026-09-14-supabase-cron-edge-auth-rework.md) | 從 current main 建立乾淨 auth rework task。 |
| 2026-09-14 | Implementation | [`2026-09-14-supabase-cron-edge-observer`](2026-09-14-supabase-cron-edge-observer.md) | 建立 scheduled Edge Function worker 與 authenticated Browser Observer。 |
| 2026-09-13 | Investigation | [`2026-09-13-netlify-boundary-doc-audit`](2026-09-13-netlify-boundary-doc-audit.md) | Audit Netlify publish-boundary documentation inconsistency。 |
| 2026-09-13 | Documentation | [`2026-09-13-netlify-boundary-doc-fix`](2026-09-13-netlify-boundary-doc-fix.md) | 修正 stale Browser Artifact paths。 |
| 2026-09-13 | Documentation | [`2026-09-13-netlify-boundary-doc-fix-v2`](2026-09-13-netlify-boundary-doc-fix-v2.md) | 以符合 Codex Cloud snapshot model 的 Preflight 重派 documentation fixes。 |
| 2026-09-13 | Experiment | [`2026-09-13-netlify-trigger-boundary-case-b-v2`](2026-09-13-netlify-trigger-boundary-case-b-v2.md) | 建立 docs-only controlled probe 觀察 Netlify build.ignore。 |
| 2026-09-13 | Experiment | [`2026-09-13-netlify-trigger-boundary-observability-probe`](2026-09-13-netlify-trigger-boundary-observability-probe.md) | Instrument Netlify ignore stage 取得 provider evidence。 |
| 2026-09-13 | Experiment | [`2026-09-13-netlify-trigger-boundary-git-ref-topology-probe`](2026-09-13-netlify-trigger-boundary-git-ref-topology-probe.md) | 觀察 Netlify Deploy Preview Git ref topology。 |
| 2026-09-13 | Investigation | [`2026-09-13-netlify-trigger-boundary-next-investigation`](2026-09-13-netlify-trigger-boundary-next-investigation.md) | 比較下一個 Trigger Boundary candidate。 |
| 2026-09-13 | Experiment | [`2026-09-13-netlify-trigger-boundary-fresh-base-fetch-probe`](2026-09-13-netlify-trigger-boundary-fresh-base-fetch-probe.md) | 驗證 fresh-fetch current base 的 cumulative PR changed paths。 |
| None | Implementation | [`custom-api-orchestration`](custom-api-orchestration.md) | 建立 Custom API → Custom API → RLS-backed data → Open-Meteo orchestration probe。 |
| None | Implementation | [`experiment-catalog`](experiment-catalog.md) | 建立 metadata-driven Experiment Catalog。 |
| None | Implementation | [`playground-human-view`](playground-human-view.md) | 建立 Experiments / Short Term / Knowledge Map Human View。 |

## Maintenance Rule

Primary Agent 建立新 Work Order 時，在同一 dispatch preparation checkpoint：使用 canonical Template、確認固定 Sections、Catalog 新增一列，commit 必要 dispatch context，再交由 Claire 建立 Codex Task / Workspace。Catalog 只做 navigation，不複製 Scope / Acceptance / Decision Boundary。