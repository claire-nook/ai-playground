-- S-SHELL-1
-- Synthetic Platform Metadata
--
-- Purpose:
--   驗證 Feature Registry、Navigation Definition 與 user_type / Feature
--   mapping 是否足以支援 Application Shell 的 metadata-driven Navigation。
--
-- Important:
--   1. 所有 object 都是 Playground synthetic test object。
--   2. random table name 不代表未來 Production schema naming。
--   3. 本 probe 刻意省略 standard audit columns。
--   4. logical references 不建立 FK；本次不研究 referential enforcement。

-- ============================================================
-- Concept A: Routable Application Feature Registry
-- Synthetic object: test_k4p7x2
-- ============================================================

CREATE TABLE public.test_k4p7x2 (
    oid bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    feature_code varchar(40) NOT NULL,
    feature_name varchar(100) NOT NULL,
    route_path varchar(200) NOT NULL,
    feature_type varchar(20) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    CONSTRAINT test_k4p7x2_uk_feature_code UNIQUE (feature_code),
    CONSTRAINT test_k4p7x2_uk_route_path UNIQUE (route_path),
    CONSTRAINT test_k4p7x2_ck_feature_type
        CHECK (feature_type IN ('business', 'common'))
);

-- ============================================================
-- Concept B: Shell Navigation Definition
-- Synthetic object: test_m8q3v6
--
-- parent_menu_oid:
--   NULL 代表 root navigation item。
--
-- feature_oid:
--   NULL 代表純 Navigation Group；有值代表 Feature Entry。
-- ============================================================

CREATE TABLE public.test_m8q3v6 (
    oid bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    menu_code varchar(40) NOT NULL,
    menu_name varchar(100) NOT NULL,
    parent_menu_oid bigint NULL,
    feature_oid bigint NULL,
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    CONSTRAINT test_m8q3v6_uk_menu_code UNIQUE (menu_code)
);

-- ============================================================
-- Concept C: user_type → Feature Entry Mapping
-- Synthetic object: test_r5n9c1
--
-- mapping row 存在代表該 coarse user_type 可以進入 Feature。
-- 這不是 Role / Permission / RBAC model。
-- ============================================================

CREATE TABLE public.test_r5n9c1 (
    oid bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_type varchar(20) NOT NULL,
    feature_oid bigint NOT NULL,
    CONSTRAINT test_r5n9c1_uk_user_type_feature
        UNIQUE (user_type, feature_oid),
    CONSTRAINT test_r5n9c1_ck_user_type
        CHECK (user_type IN ('admin', 'user', 'guest'))
);

-- ============================================================
-- Seed: Feature Registry
-- ============================================================

INSERT INTO public.test_k4p7x2 (
    feature_code,
    feature_name,
    route_path,
    feature_type
)
VALUES
    (
        'FUNC_BUSINESS',
        'Business Function',
        '/business',
        'business'
    ),
    (
        'FUNC_COMMON',
        'Common Function',
        '/common',
        'common'
    );

-- ============================================================
-- Seed: Navigation Definition
--
-- 使用 subquery 取得 logical reference，避免依賴 identity 實際數值。
-- ============================================================

INSERT INTO public.test_m8q3v6 (
    menu_code,
    menu_name,
    parent_menu_oid,
    feature_oid,
    sort_order
)
VALUES
    (
        'GROUP_BUSINESS',
        'Business',
        NULL,
        NULL,
        10
    ),
    (
        'GROUP_COMMON',
        'Common',
        NULL,
        NULL,
        20
    );

INSERT INTO public.test_m8q3v6 (
    menu_code,
    menu_name,
    parent_menu_oid,
    feature_oid,
    sort_order
)
VALUES
    (
        'MENU_FUNC_BUSINESS',
        'Business Function',
        (
            SELECT oid
            FROM public.test_m8q3v6
            WHERE menu_code = 'GROUP_BUSINESS'
        ),
        (
            SELECT oid
            FROM public.test_k4p7x2
            WHERE feature_code = 'FUNC_BUSINESS'
        ),
        10
    ),
    (
        'MENU_FUNC_COMMON',
        'Common Function',
        (
            SELECT oid
            FROM public.test_m8q3v6
            WHERE menu_code = 'GROUP_COMMON'
        ),
        (
            SELECT oid
            FROM public.test_k4p7x2
            WHERE feature_code = 'FUNC_COMMON'
        ),
        10
    );

-- ============================================================
-- Seed: user_type → Feature Entry Mapping
--
-- admin → Business + Common
-- user  → Business
-- guest → no Feature mapping; Shell Home remains available.
-- ============================================================

INSERT INTO public.test_r5n9c1 (
    user_type,
    feature_oid
)
SELECT
    'admin',
    oid
FROM public.test_k4p7x2
WHERE feature_code IN ('FUNC_BUSINESS', 'FUNC_COMMON');

INSERT INTO public.test_r5n9c1 (
    user_type,
    feature_oid
)
SELECT
    'user',
    oid
FROM public.test_k4p7x2
WHERE feature_code = 'FUNC_BUSINESS';

-- guest intentionally receives no row.

-- ============================================================
-- Inspection Queries
-- ============================================================

-- Feature Registry
SELECT *
FROM public.test_k4p7x2
ORDER BY oid;

-- Navigation Definition with resolved Feature Entry Route
SELECT
    m.oid,
    m.menu_code,
    m.menu_name,
    m.parent_menu_oid,
    f.feature_code,
    f.route_path,
    m.sort_order,
    m.is_active
FROM public.test_m8q3v6 AS m
LEFT JOIN public.test_k4p7x2 AS f
    ON f.oid = m.feature_oid
ORDER BY
    COALESCE(m.parent_menu_oid, m.oid),
    m.parent_menu_oid NULLS FIRST,
    m.sort_order,
    m.oid;

-- Allowed Feature Set by user_type
SELECT
    x.user_type,
    f.feature_code,
    f.feature_name,
    f.route_path
FROM public.test_r5n9c1 AS x
JOIN public.test_k4p7x2 AS f
    ON f.oid = x.feature_oid
WHERE f.is_active = true
ORDER BY
    x.user_type,
    f.feature_code;
