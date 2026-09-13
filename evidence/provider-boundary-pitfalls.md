# Provider Default Boundary Pitfalls

- Date: 2026-09-13
- Status: Verified Experience
- Topics: Provider Defaults, Exposure Boundary, Fail-closed, Supabase Data API, Netlify Deployment

## Why this exists

Playground 先後遇到兩次非常相似的 Provider Default 經驗。兩次服務不同、技術層不同，但共同問題都是：

> **Provider 幫你把 Capability 打開，不代表它知道你希望 Exposure Boundary 畫在哪裡。**

## Case 1 — Supabase Table / Native Data API

建立 Table 並不等於 Application Access Boundary 已完成。

在 Supabase 的 exposed schema / Native Data API 模型下，Table reachability、Database Grant、RLS 與 Policy 是不同層次。若只看到「Table 建立成功」就停止驗證，可能得到比 Application Intent 更寬的 Data API surface。

Playground 後續建立的做法是：

```text
Table exists
    ≠
Data access is correctly bounded
```

必須另外確認 Grant、RLS、Policy，以及 Anonymous / Authenticated / valid Application User 的實際行為。

這也是 Experiment B / B-1 為什麼把 Browser Evidence 與不同 Identity 實測視為必要，而不是只看 DDL 成功。

## Case 2 — Netlify Git-connected Site / Publish Directory

GitHub Repository 連接 Netlify 並成功 Deploy，也不等於 Static Publish Boundary 已完成。

Playground 原本沒有明確 Publish directory，Netlify Deploy file browser 實際顯示較大的 Repository surface 進入 Site Deploy，包括 Research Record、Knowledge、Evidence 與其他 Repository directories。

後續設定：

```text
Publish directory = public
```

並將 Browser Artifact 搬到 `public/` 後，新 Deploy 的 file browser 只剩刻意發布的 Browser Artifact。

因此：

```text
Deployment success
    ≠
Deployment boundary is correct
```

詳細 Evidence：`experiments/netlify-deployment-boundary/README.md`

## Shared Finding

這兩次經驗可以抽象成同一條 Engineering Rule：

> **Provider Convenience Default 是 Capability Default，不是 Application Security / Exposure Intent。**

所以 Provider 建立新 Capability 後，至少要問兩個不同問題：

1. **Capability works?** 服務能不能用、能不能部署、能不能讀寫？
2. **Boundary works?** 誰能用、哪些內容會出去、哪些 operation / artifact 可被看見？

第一題成功不能替第二題作答。

## Fail-closed Preference

Playground 與 Nook Works 的 Boundary 設計應優先採 fail-closed：

- Database：漏 Policy / Access Rule 時，優先造成不能讀寫，而不是資料範圍變大。
- Deployment：漏新增 Publish Artifact 時，優先造成沒有發布，而不是整個 Repository 被帶出去。

換句話說：

> **漏設定最好讓東西不能用，不要讓東西突然變得太能用。**

這條經驗應在未來新增 Provider、Runtime、Database Surface、Storage、API Gateway 或 Deployment Mechanism 時重新套用，而不是只記成「Supabase / Netlify 有一個坑」。
