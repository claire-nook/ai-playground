# F-DETAIL-1 — General Master → Detail Pattern Findings

> Date: 2026-09-17  
> Experiment: `F-DETAIL-1`  
> Status: Functional / Interaction Evidence + Pattern Candidate  
> Scope: Read-only Master → Detail lifecycle  

## 1. Evidence Boundary

F-DETAIL-1 使用 deterministic synthetic fixture 與 deployed browser prototype。Claire 已在 desktop / iPhone 實機 review v2，確認 General Detail direction 相較 v1 的 Batch-specific composition 明顯合理，並進一步檢查 responsive layout、Long Text、Audit 與返回 Query Context 的 interaction。

這些 observation 可以支撐 Functional / Interaction Pattern；**不證明** production Data Access、authorization、backend anchor-position resolution、router implementation 或 generic metadata-driven UI generator。

---

## 2. Negative Evidence — Requirement Carrier Leakage

v1 直接沿用 Batch requirement carrier，並自行發明 `執行結果 / metrics / trace / lifecycle` 等內容。

Review 顯示這些不是 General Detail responsibility：若換成 City、User 或其他 Business Object，這些區塊立即失去通用性；真實 `batch_log` schema 也沒有對應的 metrics / trace structure。

因此得到可重用教訓：

> **Requirement Carrier 可以讓 Pattern 落地，但 Business-specific semantics 不可因 prototype convenience 被升格為 Platform Pattern。**

---

## 3. General Detail Content Boundary

v2 改用 Synthetic Business Object，刻意涵蓋 Text、Reference、Number、Currency、Percentage、Date、Datetime、Boolean、Nullable、Long Text 等 field semantics。

目前收斂：

```text
Feature Specification
→ 決定 Business Content、欄位、群組、順序、business-specific composition

Platform Detail Pattern
→ 規範共通 presentation conventions、responsive behavior、record identity、lifecycle、state / error semantics
```

重要 distinction：

> **Common Pattern ≠ Auto-generated Page.**

目前沒有 Evidence 支持 Platform Runtime 應讀 DB schema / field metadata 自動生成正式 Detail page。Prototype 使用 metadata-like rendering 只是為了快速驗證 field presentation capability，不應反推 production implementation。

Feature 仍可依 Specification「刻」正式畫面；Pattern 提供一致 vocabulary / contract，而不是接管 composition。

---

## 4. Detail Layout Candidate

Desktop prototype 顯示固定三欄會出現不自然空洞，因此「每列固定三格」不應成為 Platform Rule。

較合理的 candidate 是：

- normal：一般閱讀寬度。
- wide：內容需要較寬閱讀空間。
- full：整列 / 完整閱讀寬度。
- Tablet / Mobile 依 responsive rule collapse，而不是 Feature 自己硬編 pixel/grid span。

但 `normal / wide / full` 目前只視為 **layout capability / guideline candidate**，不是已定義的 production metadata contract。

正式 Feature Specification 可以直接決定 composition；不要因 Prototype 用 JS array 就突然養出 Low-code Framework。

---

## 5. Long Text Candidate

Long Text 與普通短欄位不同，應優先提供完整閱讀寬度、自然 wrapping、可保留段落 / newline 的 plain-text presentation。

重要 boundary：

```text
Long Text ≠ Rich Text
```

文字很長不代表 Platform 應自動啟用 Markdown / HTML / CMS。Rich Text 涉及 rendering、sanitization、安全與 content contract，應由真實 Requirement 另行驅動。

---

## 6. Platform Standard Sub-pattern — Audit

Claire 明確指出：一般單檔 Detail 的 Audit 應具有一致顯示模式。

目前 Pattern Candidate：

```text
Created At / Created By
Updated At / Updated By
→ fixed semantic role
→ consistent visual grouping / ordering
→ reusable across ordinary record Detail surfaces
```

Audit 是 Platform-standard composition，不應讓十個 Feature 各自發明十種排列方式。

實際欄位命名、是否存在 soft-delete / version / approval audit 等擴充，仍由正式 Architecture / Requirement 決定。

---

## 7. Master → Detail Return Context

F-DETAIL-1 最重要的 lifecycle conclusion：

> **Query Context 不等於舊 Page Number。**

Scenario：

```text
Query page 32
→ select stable record R
→ open Detail R
→ 期間新增 30 筆較新的資料
→ return
```

若排序基準未變，R 的 current rank 會移動，可能已位於 page 33 / 34。若平台固定回 page 32，恢復的是舊 pagination state，不是 User 原本工作的 record context。

Current Pattern Candidate：

```text
Preserve:
- Query Criteria
- Sort
- Page Size
- Stable Record Identity

Return:
- resolve selected record against CURRENT result ordering
- derive current location/page
- render current page
- restore selected-record visual / scroll anchor
```

若 record 已不存在或不再符合 current criteria，應明確 fallback，不應假裝成功定位。

### Production Open Contract

Browser prototype 可以掃 synthetic fixture 找 current rank；這不代表 Production Browser 應下載全部 Result Set。

正式 Data / Operation Contract 仍需回答如何 bounded 地 resolve stable record 的 current position / cursor / surrounding page。

---

## 8. State / Responsibility Candidate

```text
Query Feature owns
- Criteria
- Sort
- Page Size
- Query Result semantics
- Return work context semantics

Detail Feature / Detail state owns
- Stable Record Identity
- Current record presentation
- Detail loading / not-found / error state

Shell may transport
- Route / URL state
- Browser navigation lifecycle

Shell does not become semantic owner
- merely because Query / Detail state appears in URL
```

---

## 9. Maintenance Handoff

Read-only Detail Pattern 不等於未來 Maintenance Pattern 的 implementation strategy。

下一輪已辨識出重要 open question：Create / Update / Read 是否應共用同一 implementation surface，或可拆成獨立 Feature / Program Unit。

Claire 過去 enterprise system 的實務案例：

```text
ACCA01 → Create
ACCU01 → Update
ACCR01 → Read-only
```

這提供一個很好的 architecture pressure：

> **共用 Platform Pattern 不代表必須共用同一份 Page Implementation。**

Maintenance Pattern 下一輪應研究：

- Create / Update / Read 的共同語意與 lifecycle。
- `canView / canEdit / canCreate` 等 capability / authorization boundary。
- View-first vs Edit-when-allowed entry policy。
- shared field semantics / validation conventions。
- separate surfaces vs mode-based implementation 的 trade-off。
- Save / Cancel / Dirty State / Browser Back / Menu navigation。
- optimistic concurrency / record changed by another user。
- Save 後回 Detail、回 Query 或維持 Edit 的 lifecycle。

不要先因 Framework 方便就宣布「所有模式必須同一頁」。平台該標準化的是 contract 與 behavior，不是強迫程式檔住在一起。

---

## 10. Current Judgment

F-DETAIL-1 第一輪 research cycle 可以關閉，Read-only General Master → Detail 已形成可供後續 Pattern challenge 的 baseline：

```text
Query Context
→ Select Stable Record Identity
→ General Read-only Detail
→ Feature-defined Business Content
+ Platform-standard Audit
→ Return
→ Re-resolve Stable Record against current result ordering
→ Restore work context
```

Maturity：**Pattern Candidate / Functional Interaction Evidence**。

它足以進入下一輪 Maintenance Pattern，但還不能被宣稱為 Production routing / backend pagination / authorization implementation 已完成。
