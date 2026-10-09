-- CF-ORACLE-1 / Phase 3 seed CANDIDATE；尚未執行。
-- 以下為測試籤文，不代表已部署 Worker 的八支原文。
-- 正式 migration 前應核對既有籤文及分類歸屬。
INSERT OR IGNORE INTO oracle_fortunes
(id, category, level, title, poem, interpretation, advice)
VALUES
(1, 'system', '大吉', '萬事可行', '雲開見日，服務常青。', '系統運作順利，變更有望。', '仍需留下可重現的驗證紀錄。'),
(2, 'career', '中吉', '穩中求勝', '步步為營，終有所成。', '工作穩步推進。', '先確認需求，再安排部署。'),
(3, 'love', '小吉', '緣分待機', '訊息已送，回覆未明。', '感情需要耐心，不是所有等待都是 timeout。', '尊重彼此節奏。'),
(4, 'health', '中吉', '作息有序', '晨昏有度，身心安然。', '提醒照顧日常生活，不提供醫療判斷。', '適度休息；身體不適請尋求專業協助。');
