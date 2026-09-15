# Connector Session Anomalies

## Purpose

保存 AI Playground 在 Provider Connector 操作中已觀察到、會影響 Experiment 判讀的 operational lesson。這不是 Provider capability catalog，也不是把偶發錯誤直接升格成產品缺陷清單。

## Observed pattern

在跨 conversation 的實際操作中，曾出現相同 Provider / Project / user authorization 下，Connector action availability 或可操作性不一致的情況。

D-BATCH-1 曾在一個 conversation 中無法正常觀察／操作 Cron；fresh conversation 後，同一研究工作可直接完成 Cron create、inspect、experiment 與 deactivate。

2026-09-15 C-BSA-1 Phase A-1 準備期間，Supabase Connector 可正常讀取 Nook Core project state、Edge Functions 與 security advisor，但 DDL migration action 在當前 conversation 被 tool safety layer 阻擋。此時尚未建立任何 C-BSA-1 synthetic DB object。

同一日數分鐘後，以完整 handoff 開啟 fresh conversation，沒有先要求 Claire 執行 SQL Editor，也沒有把前一視窗的 Connector failure 當作 Supabase limitation。新 conversation 重新嘗試相同研究起點後，`apply_migration` 成功，並繼續完成 synthetic object、Edge Function 與 runtime baseline probe；C-BSA-1 Phase A-1 因而取得 Verified baseline。

這是至少第二次觀察到：在 target Provider environment 未被已知人工修正的前提下，前一 conversation 無法執行的 Connector 工作，在 fresh conversation 可以正常執行。這仍不足以證明 fresh conversation 會「修復 Connector」，但已足以把 conversation/session state 視為故障隔離時不可忽略的外部變因。

另有跨 Connector / action-type 異常經驗：不只 Supabase action，GitHub 一般 mutation / commit 類操作也曾被 safety layer 無法解釋地阻擋；有時 read 正常但 mutation 失敗，甚至同一 session 可能出現某種 write action 被擋、另一種 write action 成功。故障來源目前不能武斷歸因於 Supabase、GitHub 或單一 Connector implementation。

## Operational rule

Connector failure 必須與被研究平台的 runtime failure 分開。

```text
Expected Connector capability
→ unexplained action failure in current conversation
→ simplify / retry once to rule out obvious request-shape problems
→ do not immediately classify as provider/platform limitation
→ preserve exact experiment checkpoint and conversational context needed for continuation
→ retry from a fresh conversation
→ if failure reproduces, investigate permission / connector / provider boundary
```

尤其當 Experiment 本身研究 Authorization、Permission、Deployment 或 Provider Boundary 時，更不可把 Connector session anomaly 當成 Experiment Evidence。

Fresh-conversation retry 不是「證明重新開視窗一定會修好」；它只是隔離 conversation/session state 這個外部變因。若 fresh conversation 仍重現相同 failure，才進一步定位真正限制。

## Handoff requirement

Fresh conversation 有成本。Repository 可以保存 technical state，卻不能完整保存 conversation 中逐步形成的 reasoning、已排除的誤解、Claire 的設計意圖與雙方對術語的共同理解。因此不能把「重開視窗」當成零成本的第一反應。

若 Connector-heavy Experiment 因 unexplained session anomaly 中止，handoff 至少保存：

- Experiment / Phase / exact checkpoint；
- 已成功的 Connector actions；
- 失敗 action 與 failure classification；
- 尚未建立或尚未修改的 objects；
- fresh conversation 的第一個 retry action；
- 哪些 failure 不得被誤寫成 Experiment Evidence；
- 下一個 conversation 若只讀 Repository 無法重建的重要 reasoning / design intent / terminology context；
- 明確授權狀態，例如實驗是否已經「開工」，避免換視窗後重新消耗 Claire 進行重複確認。

因此故障處理原則不是「Connector 不爽就立刻換視窗」，而是：先做一次低成本 sanity retry；若仍屬 unexplained session anomaly，與其持續消耗大量對話嘗試 N 種 prompt / request shape，不如先把 context 壓縮成可攜 handoff，再 fresh conversation retry。

這條規則的目的不是迷信重開視窗，而是避免把 AI Tooling 的不穩定性混進 Platform Research，同時盡量降低 conversation continuity 的損失。