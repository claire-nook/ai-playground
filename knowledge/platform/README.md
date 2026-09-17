# Platform Technical Knowledge

這個目錄保存由 Playground Experiment / Evidence 綜合後形成的 **general platform technical knowledge**。

它不是某個正式系統的 Production Architecture，也不是單一 Experiment 的 Findings 副本。它的用途是把多份 Evidence 消化成可被後續 Requirement、Implementation Agent 與其他讀者挑戰的 Architecture / Responsibility Knowledge。

```text
Real Requirement / Technical Question
→ Playground Experiment
→ Evidence / Current Judgment
→ General Platform Technical Knowledge
→ Independent Review / New Pattern Challenge
→ Revised Knowledge
→ Formal Repository adoption / adaptation when appropriate
```

核心原則：

- 以 general application platform 語意撰寫，不讓第一個 Requirement Carrier 變成整份 Knowledge 的 domain boundary。
- 明確區分 Direct Evidence、Inference、Candidate Boundary、Pattern-specific Decision 與 Open Contract。
- 保留 rationale 與 provenance，讓外部讀者能理解、學習、質疑，而不是只看到最後一句「規定如此」。
- Implementation Agent Review 是 Architecture Challenge input，不會因為寫得很長就自動升格成 Platform Rule；Primary 必須逐項 Accept / Reject / Rework。
- 不因為某份 Knowledge 存在於 Public Playground，就宣稱它已成為任何正式系統的 Platform Rule。
- 正式系統採用時，回該正式 Repository 依其 Specification、Security、Operations、Cost 與 Architecture governance 重新確認。

## Current Documents

- [`application-platform-architecture.md`](application-platform-architecture.md) — **Architecture Baseline Candidate v0.2**。已吸收第一輪 Implementation Agent adversarial review，將原本未經證明的 `Feature Runtime` 降格為 `Feature Activation Contract`，把線性五層模型拆成 lifecycle / operation 兩個正交視圖，並補上 Pattern-1 最低 operation contract、authorization 與 error obligations。下一個主要壓力測試是新的真實 Feature Pattern。
- [`../../agent-work/reports/2026-09-17-general-platform-architecture-v01-review.md`](../../agent-work/reports/2026-09-17-general-platform-architecture-v01-review.md) — v0.1 的獨立 Reviewer + Implementer adversarial review。保留原始 challenge，供追溯「為什麼 v0.2 要改」。

> Playground 保存的不只是「撞牆結果」，還保存牆是誰撞的、哪裡裂了，以及我們為什麼決定補這一塊而不是把整棟房子貼滿膠帶。