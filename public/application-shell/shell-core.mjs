export const HOME_ROUTE = "/home";
export const KNOWN_FEATURE_ROUTES = new Set(["/business/places", "/business/weather", "/common/place-country"]);

export function allowedFeatureIds(features, mappings, userType) {
  const mapped = new Set(mappings.filter(row => row.user_type === userType).map(row => Number(row.feature_oid)));
  return new Set(features.filter(row => row.is_active && mapped.has(Number(row.oid))).map(row => Number(row.oid)));
}

export function buildNavigation(features, menus, mappings, userType) {
  const allowed = allowedFeatureIds(features, mappings, userType);
  const featureById = new Map(features.map(feature => [Number(feature.oid), feature]));
  const children = menus.filter(row => row.is_active && row.feature_oid != null && allowed.has(Number(row.feature_oid)));
  return menus.filter(row => row.is_active && row.parent_menu_oid == null).sort(byOrder).map(group => ({
    name: group.menu_name,
    entries: children.filter(row => Number(row.parent_menu_oid) === Number(group.oid)).sort(byOrder).map(row => ({ menuName:row.menu_name, ...featureById.get(Number(row.feature_oid)) }))
  })).filter(group => group.entries.length);
}

export function resolveRoute(pathname, allowedPaths) {
  if (pathname === "/" || pathname === "/application-shell" || pathname === "/application-shell/") return { kind:"home", path:HOME_ROUTE };
  if (pathname === HOME_ROUTE) return { kind:"home", path:pathname };
  if (KNOWN_FEATURE_ROUTES.has(pathname)) return allowedPaths.has(pathname) ? { kind:"feature", path:pathname } : { kind:"rejected", path:pathname };
  return { kind:"not-found", path:pathname };
}

export async function signOutCurrentSession(auth) {
  const { error } = await auth.signOut({ scope:"local" });
  if (error) throw error;
}

function byOrder(left, right) { return Number(left.sort_order) - Number(right.sort_order) || Number(left.oid) - Number(right.oid); }
