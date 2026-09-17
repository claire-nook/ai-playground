# Platform Technical Knowledge

這個目錄保存由 Playground Experiment / Evidence 綜合後形成的 **general platform technical knowledge**。

它不是某個正式系統的 Production Architecture，也不是單一 Experiment 的 Findings 副本。它的用途是把多份 Evidence 消化成可被後續 Requirement、Implementation Agent 與其他讀者挑戰的 Architecture / Responsibility Knowledge。

```text
Real Requirement / Technical Question
→ Playground Experiment
→ Evidence / Current Judgment
→ General Platform Technical Knowledge
→ Review / New Pattern Challenge
→ Revised Knowledge
→ Formal Repository adoption / adaptation when appropriate
```

核心原則：

- 以 general application platform 語意撰寫，不讓第一個 Requirement Carrier 變成整份 Knowledge 的 domain boundary。
- 明確區分 Evidence-backed boundary、Architecture Candidate 與 Open Question。
- 保留 rationale 與 provenance，讓外部讀者能理解、學習、質疑，而不是只看到最後一句「規定如此」。
- 不因為某份 Knowledge 存在於 Public Playground，就宣稱它已成為任何正式系統的 Platform Rule。
- 正式系統採用時，回該正式 Repository 依其 Specification、Security、Operations、Cost 與 Architecture governance 重新確認。

## Current Documents

- [`application-platform-architecture.md`](application-platform-architecture.md) — Architecture Baseline Candidate v0.1；目前由 Application Shell + Read-only Query Pattern 建立，等待 Implementation Agent Review 與後續 Pattern challenge。

> Playground 保存的不只是「撞牆結果」，也可以公開牆為什麼蓋在那裡。否則路人只能看到一面牆，還以為我們特別喜歡水泥。