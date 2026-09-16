-- S-SHELL-1
-- Synthetic Platform Metadata
--
-- Reproducible target fixture for the Shell composition probe.
-- All objects are disposable Playground test objects, not Production schema.

CREATE TABLE public.test_k4p7x2 (
    oid bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    feature_code varchar(40) NOT NULL,
    feature_name varchar(100) NOT NULL,
    route_path varchar(200) NOT NULL,
    feature_type varchar(20) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    CONSTRAINT test_k4p7x2_uk_feature_code UNIQUE (feature_code),
    CONSTRAINT test_k4p7x2_uk_route_path UNIQUE (route_path),
    CONSTRAINT test_k4p7x2_ck_feature_type CHECK (feature_type IN ('business', 'common'))
);

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

CREATE TABLE public.test_r5n9c1 (
    oid bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_type varchar(20) NOT NULL,
    feature_oid bigint NOT NULL,
    CONSTRAINT test_r5n9c1_uk_user_type_feature UNIQUE (user_type, feature_oid),
    CONSTRAINT test_r5n9c1_ck_user_type CHECK (user_type IN ('admin', 'user', 'guest'))
);

-- Browser access: Application Access gate only.
-- Feature Entry remains metadata-derived Shell behavior, not RLS authorization.
ALTER TABLE public.test_k4p7x2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_m8q3v6 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_r5n9c1 ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.test_k4p7x2 FROM anon, authenticated;
REVOKE ALL ON TABLE public.test_m8q3v6 FROM anon, authenticated;
REVOKE ALL ON TABLE public.test_r5n9c1 FROM anon, authenticated;

GRANT SELECT ON TABLE public.test_k4p7x2 TO authenticated;
GRANT SELECT ON TABLE public.test_m8q3v6 TO authenticated;
GRANT SELECT ON TABLE public.test_r5n9c1 TO authenticated;

CREATE POLICY test_k4p7x2_select_active_user
ON public.test_k4p7x2 FOR SELECT TO authenticated
USING (private.can_access_application());

CREATE POLICY test_m8q3v6_select_active_user
ON public.test_m8q3v6 FOR SELECT TO authenticated
USING (private.can_access_application());

CREATE POLICY test_r5n9c1_select_active_user
ON public.test_r5n9c1 FOR SELECT TO authenticated
USING (private.can_access_application());

-- Feature Registry: classification and integration mechanism are independent.
INSERT INTO public.test_k4p7x2 (feature_code, feature_name, route_path, feature_type)
VALUES
    ('FUNC_BUSINESS_PLACE', 'Place Native', '/business/places', 'business'),
    ('FUNC_BUSINESS_WEATHER', 'Place Weather', '/business/weather', 'business'),
    ('FUNC_COMMON_PLACE_COUNTRY', 'Place-Country Custom API', '/common/place-country', 'common');

-- Root Navigation groups.
INSERT INTO public.test_m8q3v6 (menu_code, menu_name, parent_menu_oid, feature_oid, sort_order)
VALUES
    ('GROUP_BUSINESS', 'Business', NULL, NULL, 10),
    ('GROUP_COMMON', 'Common', NULL, NULL, 20);

-- Feature Navigation entries. Logical references deliberately avoid FK in this probe.
INSERT INTO public.test_m8q3v6 (menu_code, menu_name, parent_menu_oid, feature_oid, sort_order)
VALUES
    (
        'MENU_FUNC_BUSINESS_PLACE',
        'Place Native',
        (SELECT oid FROM public.test_m8q3v6 WHERE menu_code = 'GROUP_BUSINESS'),
        (SELECT oid FROM public.test_k4p7x2 WHERE feature_code = 'FUNC_BUSINESS_PLACE'),
        10
    ),
    (
        'MENU_FUNC_BUSINESS_WEATHER',
        'Place Weather',
        (SELECT oid FROM public.test_m8q3v6 WHERE menu_code = 'GROUP_BUSINESS'),
        (SELECT oid FROM public.test_k4p7x2 WHERE feature_code = 'FUNC_BUSINESS_WEATHER'),
        20
    ),
    (
        'MENU_FUNC_COMMON_PLACE_COUNTRY',
        'Place-Country Custom API',
        (SELECT oid FROM public.test_m8q3v6 WHERE menu_code = 'GROUP_COMMON'),
        (SELECT oid FROM public.test_k4p7x2 WHERE feature_code = 'FUNC_COMMON_PLACE_COUNTRY'),
        10
    );

-- admin → all three Features.
INSERT INTO public.test_r5n9c1 (user_type, feature_oid)
SELECT 'admin', oid
FROM public.test_k4p7x2
WHERE feature_code IN (
    'FUNC_BUSINESS_PLACE',
    'FUNC_BUSINESS_WEATHER',
    'FUNC_COMMON_PLACE_COUNTRY'
);

-- user → both Business Features.
INSERT INTO public.test_r5n9c1 (user_type, feature_oid)
SELECT 'user', oid
FROM public.test_k4p7x2
WHERE feature_code IN ('FUNC_BUSINESS_PLACE', 'FUNC_BUSINESS_WEATHER');

-- guest intentionally receives no Feature mapping; /home remains Shell-owned.

-- Inspection queries used to compare reconstructed fixture with live provider truth.
SELECT feature_code, feature_name, route_path, feature_type, is_active
FROM public.test_k4p7x2
ORDER BY oid;

SELECT m.menu_code, m.menu_name, m.parent_menu_oid, f.feature_code, m.sort_order, m.is_active
FROM public.test_m8q3v6 AS m
LEFT JOIN public.test_k4p7x2 AS f ON f.oid = m.feature_oid
ORDER BY COALESCE(m.parent_menu_oid, m.oid), m.parent_menu_oid NULLS FIRST, m.sort_order, m.oid;

SELECT x.user_type, f.feature_code, f.route_path
FROM public.test_r5n9c1 AS x
JOIN public.test_k4p7x2 AS f ON f.oid = x.feature_oid
WHERE f.is_active = true
ORDER BY x.user_type, f.feature_code;