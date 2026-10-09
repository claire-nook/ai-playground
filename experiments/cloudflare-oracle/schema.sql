-- CF-ORACLE-1 / Phase 3 D1 Schema (executed and verified 2026-10-09)
-- Apply within shared lab-smoke-db; CREATE TABLE / INDEX only, no seed INSERT.
-- SQLite / Cloudflare D1 compatible.
-- 不儲存 IP、Cookie、訪客身分；僅記錄成功求籤事件。

CREATE TABLE IF NOT EXISTS oracle_fortunes (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('system', 'career', 'love', 'health')),
    level TEXT NOT NULL,
    title TEXT NOT NULL,
    poem TEXT NOT NULL,
    interpretation TEXT NOT NULL,
    advice TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oracle_fortunes_category_active
    ON oracle_fortunes (category, is_active);

CREATE TABLE IF NOT EXISTS oracle_draws (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fortune_id INTEGER NOT NULL REFERENCES oracle_fortunes(id),
    drawn_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oracle_draws_drawn_at
    ON oracle_draws (drawn_at);
