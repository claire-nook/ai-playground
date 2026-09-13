# Netlify Git Deployment Boundary

- Date: 2026-09-13
- Status: Completed / Verified
- Topics: Netlify, Git Deployment, Publish Directory, Deployment Boundary, Browser Artifact
- Tags: `nook-platform`, `ipad-first`, `deployment`, `netlify`, `browser`

## Question

當 `ai-playground` GitHub Repository 直接連接 Netlify Continuous Deployment 時，如何避免 Research Record、Knowledge、Evidence、Agent Work、Supabase source 等 Repository 內容一起成為 Site Deploy，只發布刻意指定的 Browser Artifact？

## Initial Observation

Playground 原本沒有 Build command，也沒有明確 Publish directory。Netlify Deploy file browser 實際顯示，當時 Deploy 內容近似 Repository root，包括 `agent-work/`、`evidence/`、`experiments/`、`knowledge/`、`notes/`、`supabase/`、root `index.html` 與 root `README.md`。

這表示「Repository 已連接 Netlify」本身不是 Deployment Boundary。若沒有明確界定 Publish Artifact，Provider 可以把比預期更大的 Repository surface 帶進 Deploy。

## Design

```text
ai-playground/
├── experiments/         # Experiment Record / Research Context
├── knowledge/           # Knowledge Base
├── evidence/            # Evidence
├── agent-work/          # Agent Handoff
├── supabase/            # Supabase source
├── public/              # Netlify static Publish Boundary
│   ├── index.html       # Public Experiment Catalog
│   ├── auth/
│   ├── data-api/
│   └── data-api-view/
└── netlify/functions/   # Netlify server runtime source, when used
```

Netlify Project Build settings：

- Base directory: Repository root (`/`)
- Build command: Not set
- Publish directory: `public`
- Functions directory: `netlify/functions`

`public/` 使用 whitelist / fail-closed 思路：只有刻意放入此目錄的 Static Artifact 才能進入 Site Deploy。

## Migration

原本 Browser Experiment 的 HTML 與 Experiment Record 混住在 `experiments/<experiment>/`。本次拆分為：

```text
experiments/auth/README.md          ↔ public/auth/index.html
experiments/data-api/README.md      ↔ public/data-api/index.html
experiments/data-api-view/README.md ↔ public/data-api-view/index.html
```

`experiments/` 保存 Why / Method / Evidence / Result；`public/` 保存可直接由 Browser 執行的 Public Artifact。

## Direct Evidence

Claire 在 Netlify Dashboard 將 Publish directory 設為 `public`。後續 Browser Artifact migration 產生新的 `main` commits，Netlify 重新 Deploy 後，Deploy file browser 實際只顯示：

```text
public/
├── auth/
├── data-api/
├── data-api-view/
└── index.html
```

原本其他 Repository directories 與 root README 均不再出現在新的 Site Deploy。

## Result

**Verified.**

```text
GitHub Repository
        ↓
Netlify Continuous Deployment
        ↓
Publish Boundary = public/
        ↓
Only intentional static Browser Artifacts enter Site Deploy
```

Repository 可以保留完整 Laboratory Context，而 Netlify Site Deploy 不需要等於 Repository mirror。

## Pitfalls

### Provider connection is not an exposure boundary

「GitHub Repo 已連接 Netlify」只建立 Deployment transport，不會自動替 Repository 判斷哪些檔案應該進入 Site Deploy。Deployment success 也不能證明 Deployment Boundary 正確，仍需檢查實際 deployed artifact。

### Publish Boundary and Trigger Boundary are different

`Publish directory = public` 回答「哪些檔案可以被發布？」；它不等於「哪些 Git changes 值得觸發一次 Deploy？」目前 `main` 的非 `public/` commit 仍可能觸發 Netlify build / deploy 判斷。Trigger Boundary 是後續獨立 research。

### Static Artifact and Experiment Record should not share deployment ownership by accident

若直接把 `experiments/` 設為 Publish directory，`README.md` 等 Research Record 也會進 Site Deploy。這不是 README 本身的問題，而是 responsibility 混在一起。

## Current Judgment

`public/` 作為 Playground Static Public Artifact boundary 已取得直接 Evidence，適合保留。Netlify Functions source 應維持在 `netlify/functions/`，不放入 `public/`。Trigger Boundary 尚未研究完成。
