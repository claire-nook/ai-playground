-- CF-ORACLE-1 / Phase 3 query candidates；尚未在 D1 執行。
-- 由 Worker 以 bind parameter 提供 :category / :fortune_id。
-- 隨機抽籤：只選啟用籤文。
SELECT id, category, level, title, poem, interpretation, advice
FROM oracle_fortunes
WHERE category = :category AND is_active = 1
ORDER BY RANDOM()
LIMIT 1;

-- 成功求籤時 INSERT 一筆。不要在開首頁或查統計時執行。
INSERT INTO oracle_draws (fortune_id) VALUES (:fortune_id);

-- 今日 / 本月以 UTC 為準；未來若需台灣日界線應明確改用時區規則。
SELECT COUNT(*) AS today_draws
FROM oracle_draws
WHERE drawn_at >= datetime('now', 'start of day')
  AND drawn_at < datetime('now', 'start of day', '+1 day');

SELECT COUNT(*) AS month_draws
FROM oracle_draws
WHERE drawn_at >= datetime('now', 'start of month')
  AND drawn_at < datetime('now', 'start of month', '+1 month');

-- JOIN + GROUP BY：依分類統計。
SELECT f.category, COUNT(*) AS draw_count
FROM oracle_draws AS d
JOIN oracle_fortunes AS f ON f.id = d.fortune_id
GROUP BY f.category
ORDER BY draw_count DESC;
