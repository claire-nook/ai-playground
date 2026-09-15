# Connector Session Anomalies

## Purpose

保存 AI Playground 在 Provider Connector 操作中已觀察到、會影響 Experiment 判讀的 operational lesson。這不是 Provider capability catalog，也不是把偶發錯誤直接升格成產品缺陷清單。

## Observed pattern

在跨 conversation 的實際操作中，曾出現相同 Provider / Project / user authorization 下，Connector action availability 或可操作性不一致的情況。

D-BATCH-1 曾在一個 conversation 中無法正常觀察／操作 Cron；fresh conversation 後，同一研究工作可直接完成 Cron create、inspect、experiment 與 deactivate。

2026-09-15 C-BSA-1 Phase A-1 準備期間，Supabase Connector 可正常讀取 Nook Core project state、Edge Functions 與 security advisor，但 DDL migration action 在當前 conversation 被 tool safety layer 阻擋。此時尚未建立任何 C-BSA-1 synthetic DB object。

## Operational rule

Connector failure 必須與被研究平台的 runtime failure 分開。

```text
Expected Connector capability
→ unexplained action failure in current conversation
→ do not immediately classify as provider/platform limitation
→ preserve exact experiment checkpoint
→ retry from a fresh conversation
→ if failure reproduces, investigate permission / connector / provider boundary
```

尤其當 Experiment 本身研究 Authorization、Permission、Deployment 或 Provider Boundary 時，更不可把 Connector session anomaly 當成 Experiment Evidence。

Fresh-conversation retry 不是「證明重新開視窗一定會修好」；它只是隔離 conversation/session state 這個外部變因。若 fresh conversation 仍重現相同 failure，才進一步定位真正限制。

## Handoff requirement

若 Connector-heavy Experiment 因 unexplained session anomaly 中止，handoff 至少保存：

- Experiment / Phase / exact checkpoint；
- 已成功的 Connector actions；
- 失敗 action 與 failure classification；
- 尚未建立或尚未修改的 objects；
- fresh conversation 的第一個 retry action；
- 哪些 failure 不得被誤寫成 Experiment Evidence。

這條規則的目的不是迷信重開視窗，而是避免把 AI Tooling 的不穩定性混進 Platform Research。