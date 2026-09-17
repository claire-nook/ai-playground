# Provider Assumption Register

> Scope: General Platform research / implementation guidance  
> Status: Candidate Register  
> Purpose: 把目前 architecture 依賴的 provider semantics 顯性化，不假裝把 SDK 名字藏起來就等於 provider-neutral

## 1. Rule

Provider mechanism 可以替換，只有在 replacement 保持以下 contract 時才算真正可替換：

- identity / authorization semantics；
- transaction / consistency semantics；
- pagination / boundedness semantics；
- retry / delivery semantics；
- cancellation / timeout semantics；
- error/outcome semantics；
- secret / credential boundary。

若 replacement 改變以上任一項，就需要 Architecture / Technical Design review。

---

## 2. Supabase Auth

Current assumptions：

- Browser Session / token lifecycle 由 Auth + Shell 負責。
- Feature 不保存長期 credential snapshot。
- session-invalid 可由 operation 回報 Shell。

Need product-specific mapping：

- session duration / refresh strategy；
- logout scope；
- application-user mapping；
- identity claims trusted boundary。

---

## 3. Supabase Native Data API / PostgREST

Current assumptions：

- 可用於 bounded read / simple mutation candidate。
- filter / sort / pagination semantics 必須由 Feature-facing contract 明確定義。
- provider row limits 不可被誤當 completeness guarantee。
- grants / RLS / exposed schema 決定真正 data authorization surface。

Product-specific profile 必須定義：

- exposed schemas / relations；
- browser role / token identity；
- grants；
- RLS policy / bypass behavior；
- count semantics；
- max page / result bounds；
- raw error mapping。

---

## 4. PostgreSQL View / Read Model

Current assumptions：

- View 只是 curated read model candidate，不天然安全。
- invoker / definer semantics、underlying grants / RLS、View ownership 必須明確。

Product-specific review 至少回答：

- security_invoker / security barrier 等 relevant setting；
- caller identity 是否仍能正確 enforce underlying policy；
- direct table access 是否仍暴露；
- result semantics / nullability / stable identity。

---

## 5. PostgreSQL Function / RPC

Current assumptions：

- 適合 DB-centric Business Operation / transaction owner candidate。
- Function EXECUTE privilege 與 table privilege / RLS 是不同 boundary。

Product-specific profile 必須定義：

- invoker / definer security；
- EXECUTE grants；
- owner；
- search_path；
- input / output contract；
- transaction scope；
- error mapping；
- caller/service identity semantics。

---

## 6. Supabase Edge Function / Custom API

Current assumptions：

- 可承擔 Custom Business Operation、API composition、external API orchestration。
- Browser caller identity 與 backend service identity 不同。
- Edge Function 若直接 DB connection，需要 restricted identity / connection governance。

Product-specific profile 必須定義：

- caller JWT validation；
- service credential boundary；
- restricted DB role；
- connection/pooler mode；
- timeout；
- retry / idempotency；
- outbound dependency policy；
- log / correlation / secret redaction。

---

## 7. Supabase Cron / pg_net

Current assumptions：

- scheduler acceptance / HTTP transport success ≠ business operation success。
- parameter provenance 可以包含 static literal / SQL runtime expression / helper function result。

Product-specific Batch contract 必須補：

- schedule identity；
- run / attempt identity；
- overlap；
- delivery / retry semantics；
- timeout；
- safe replay；
- business outcome recording。

---

## 8. Netlify / Browser Delivery

Current assumptions：

- Netlify 提供 static/browser application delivery。
- deep link / SPA fallback / cache / runtime configuration 都是 deployment semantics，不應偷偷變成 Feature responsibility。

Product-specific deployment design 必須定義：

- rewrite / fallback；
- cache headers；
- build-time vs runtime config；
- configuration freshness / invalidation；
- error route behavior；
- browser compatibility / iPad-first constraints。

---

## 9. Register Maintenance Rule

只有 architecture / implementation 真正依賴某個 provider semantic 時才登記。

不要為了「未來可能換 AWS / Cloudflare / 某個明年才紅的東西」先蓋 adapter 王國。那種抽象通常只成功抽掉時間。