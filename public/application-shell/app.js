import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { buildNavigation, resolveRoute } from "./shell-core.mjs";

// Public browser configuration only；不得在 browser artifact 放入 service_role / Secret Key。
const SUPABASE_URL = "https://cctonymfrxneonxryqei.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MN0_kx6LzCPyNbtI4CWZ9w_y-5hew_g";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } });

const el = id => document.getElementById(id);
const views = ["startup-view", "login-view", "bootstrap-error-view", "shell-view"];
const state = { session:null, appUser:null, features:[], navigation:[], allowedPaths:new Set(), renderVersion:0 };

function show(id) { views.forEach(view => { el(view).hidden = view !== id; }); }
function message(error) { return error instanceof Error ? error.message : String(error || "未知錯誤"); }
function escapeHtml(value) { const node=document.createElement("span"); node.textContent=value ?? ""; return node.innerHTML; }
function maskedEmail(email) { if (!email?.includes("@")) return "Authenticated user"; const [name,domain]=email.split("@"); return `${name.slice(0,2)}***@${domain}`; }
function clearApplicationState() {
  state.renderVersion+=1; state.session=null; state.appUser=null; state.features=[]; state.navigation=[]; state.allowedPaths=new Set();
  el("navigation").innerHTML='<a href="/home" data-route>Home</a>'; el("user-context").textContent=""; el("content").replaceChildren(); closeNavigation();
}
function enterSignedOutState() { clearApplicationState(); history.replaceState({},"","/application-shell/"); el("password").value=""; show("login-view"); }

async function bootstrap(session) {
  clearApplicationState();
  if (!session) { show("login-view"); return; }
  const bootstrapVersion=state.renderVersion;
  show("startup-view");
  try {
    // Auth Identity 必須解析成一筆 active app_user，才建立 Application User Context。
    const { data:appUser, error:userError } = await supabase.from("app_user").select("oid,app_user_name,user_type,is_active").eq("id_auth_user", session.user.id).eq("is_active", true).maybeSingle();
    if(bootstrapVersion!==state.renderVersion)return;
    if (userError) throw new Error(`Application User 查詢失敗：${userError.message}`);
    if (!appUser) throw new Error("此 Authentication Identity 沒有 active Application User Context。");
    if (!["admin","user","guest"].includes(appUser.user_type)) throw new Error("Application User classification 不在本 Experiment contract 內。");
    const [featureResult, menuResult, mappingResult] = await Promise.all([
      supabase.from("test_k4p7x2").select("oid,feature_code,feature_name,route_path,feature_type,is_active").eq("is_active", true),
      supabase.from("test_m8q3v6").select("oid,menu_code,menu_name,parent_menu_oid,feature_oid,sort_order,is_active").eq("is_active", true),
      supabase.from("test_r5n9c1").select("oid,user_type,feature_oid")
    ]);
    if(bootstrapVersion!==state.renderVersion)return;
    for (const result of [featureResult,menuResult,mappingResult]) if (result.error) throw new Error(`Metadata 載入失敗：${result.error.message}`);
    // Bootstrap 期間若 token 已 refresh，保留 auth listener 同步的新 Session，不覆寫成舊 token。
    state.session ??= session; state.appUser=appUser; state.features=featureResult.data ?? [];
    state.navigation=buildNavigation(state.features, menuResult.data ?? [], mappingResult.data ?? [], appUser.user_type);
    state.allowedPaths=new Set(state.navigation.flatMap(group => group.entries.map(entry => entry.route_path)));
    renderNavigation(); el("user-context").textContent=`${appUser.app_user_name || maskedEmail(session.user.email)} · ${appUser.user_type}`;
    show("shell-view"); await renderCurrentRoute(true);
  } catch (error) { state.session=session; el("bootstrap-error-message").textContent=message(error); show("bootstrap-error-view"); }
}

function renderNavigation() {
  const groups=state.navigation.map(group=>`<section class="nav-group"><h2>${escapeHtml(group.name)}</h2>${group.entries.map(entry=>`<a href="${escapeHtml(entry.route_path)}" data-route>${escapeHtml(entry.menuName)}</a>`).join("")}</section>`).join("");
  el("navigation").innerHTML=`<a href="/home" data-route>Home</a>${groups}`;
}
function closeNavigation() { el("sidebar").classList.remove("open"); el("nav-backdrop").hidden=true; el("menu-button").setAttribute("aria-expanded","false"); document.body.classList.remove("nav-open"); }
function heading(title, copy) { return `<header class="page-heading"><p class="eyebrow">Application Shell</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(copy)}</p></header>`; }
function setContent(html) { el("content").innerHTML=html; el("content").focus({preventScroll:true}); }
function setActiveRoute(path) { document.querySelectorAll("[data-route]").forEach(link => link.setAttribute("aria-current", link.getAttribute("href")===path ? "page" : "false")); }

async function renderCurrentRoute(replaceAlias=false) {
  const route=resolveRoute(location.pathname,state.allowedPaths); if (replaceAlias && route.path!==location.pathname) history.replaceState({},"",route.path);
  const version=++state.renderVersion; setActiveRoute(route.path); closeNavigation();
  if (route.kind==="home") { setContent(`${heading("Home","Shell-owned landing route") }<section class="panel"><h2>Application Ready</h2><p>Authentication、active Application User Context 與 metadata-driven Navigation 已完成 bootstrap。</p><dl class="facts"><dt>User type</dt><dd><span class="badge">${escapeHtml(state.appUser.user_type)}</span></dd><dt>Feature entries</dt><dd>${state.allowedPaths.size}</dd></dl></section>`); return; }
  if (route.kind==="rejected") { setContent(`${heading("Feature Entry Rejected","這個已知 route 不在目前 Application User Context 的 allowed Feature set。") }<section class="feature-state error"><strong>Navigation hidden 並不是 Backend Authorization。</strong><p>Shell 已 deterministic 拒絕 direct route，沒有執行 Feature data request。</p><a href="/home" data-route>返回 Home</a></section>`); return; }
  if (route.kind==="not-found") { setContent(`${heading("Page Not Found","Shell 無法解析這個 route。") }<section class="feature-state"><p><code>${escapeHtml(location.pathname)}</code></p><a href="/home" data-route>返回 Home</a></section>`); return; }
  const handlers={ "/business/places":renderPlaces, "/business/weather":renderWeather, "/common/place-country":renderPlaceCountry };
  await handlers[route.path](version);
}

async function renderPlaces(version) {
  setContent(`${heading("Place Native","Browser → Supabase Native Data API → bounded render") }<p class="feature-state">Place data 載入中…</p>`);
  const {data,error}=await supabase.from("place").select("oid,place_code,place_name,latitude,longitude,timezone,is_active").eq("is_active",true).order("place_code").limit(5);
  if(version!==state.renderVersion)return; if(error){setContent(`${heading("Place Native","Feature-level failure") }<p class="feature-state error">${escapeHtml(error.message)}</p>`);return;}
  if(!data?.length){setContent(`${heading("Place Native","Native Data API completed") }<p class="feature-state">沒有 active Place。</p>`);return;}
  setContent(`${heading("Place Native","Browser → Supabase Native Data API → bounded render") }<div class="grid">${data.map(place=>placeCard(place)).join("")}</div>`);
}
function placeCard(place,extra="") { return `<article class="data-card"><span class="badge">${escapeHtml(place.place_code)}</span><h2>${escapeHtml(place.place_name)}</h2><dl class="facts"><dt>Coordinates</dt><dd>${escapeHtml(place.latitude)}, ${escapeHtml(place.longitude)}</dd><dt>Timezone</dt><dd>${escapeHtml(place.timezone)}</dd>${extra}</dl></article>`; }

async function renderWeather(version) {
  setContent(`${heading("Place Weather","Native Place + browser direct Open-Meteo composition") }<p class="feature-state">正在選取 Place 並取得天氣…</p>`);
  const {data,error}=await supabase.from("place").select("oid,place_code,place_name,latitude,longitude,timezone,is_active").eq("is_active",true).not("latitude","is",null).not("longitude","is",null).order("place_code").limit(6);
  if(version!==state.renderVersion)return; if(error){setContent(`${heading("Place Weather","Feature-level failure") }<p class="feature-state error">Place query failed：${escapeHtml(error.message)}</p>`);return;}
  const candidates=(data??[]).filter(place=>Number.isFinite(Number(place.latitude))&&Number.isFinite(Number(place.longitude)));
  const selected=candidates.sort(()=>Math.random()-.5).slice(0,2); if(!selected.length){setContent(`${heading("Place Weather","No eligible Place") }<p class="feature-state">找不到具有效 coordinates 的 active Place。</p>`);return;}
  const results=await Promise.allSettled(selected.map(loadWeather)); if(version!==state.renderVersion)return;
  setContent(`${heading("Place Weather","每個 provider call 各自保留成功或失敗結果。") }<div class="grid">${results.map((result,index)=>result.status==="fulfilled"?weatherCard(selected[index],result.value):`<article class="data-card"><h2>${escapeHtml(selected[index].place_name)}</h2><p class="feature-state error">Open-Meteo failed：${escapeHtml(message(result.reason))}</p></article>`).join("")}</div>`);
}
async function loadWeather(place) {
  const query=new URLSearchParams({latitude:place.latitude,longitude:place.longitude,timezone:"auto",daily:"temperature_2m_min,temperature_2m_max,precipitation_sum,weather_code,sunrise,sunset",forecast_days:"1"});
  const response=await fetch(`https://api.open-meteo.com/v1/forecast?${query}`); if(!response.ok)throw new Error(`HTTP ${response.status}`); const json=await response.json(); if(!json.daily?.time?.length)throw new Error("response missing daily data"); return json;
}
function weatherCard(place,weather){const d=weather.daily;return `<article class="data-card"><span class="badge">${escapeHtml(d.time[0])}</span><h2>${escapeHtml(place.place_name)}</h2><dl class="facts"><dt>Min / Max</dt><dd>${escapeHtml(d.temperature_2m_min[0])} / ${escapeHtml(d.temperature_2m_max[0])} °C</dd><dt>Precipitation</dt><dd>${escapeHtml(d.precipitation_sum[0])} mm</dd><dt>Weather code</dt><dd>${escapeHtml(d.weather_code[0])}</dd><dt>Sunrise</dt><dd>${escapeHtml(d.sunrise[0])}</dd><dt>Sunset</dt><dd>${escapeHtml(d.sunset[0])}</dd><dt>Timezone</dt><dd>${escapeHtml(weather.timezone)}</dd></dl></article>`;}

async function renderPlaceCountry(version) {
  setContent(`${heading("Place-Country Custom API","Current caller session → test-place-country") }<p class="feature-state">Custom API 載入中…</p>`);
  const response=await fetch(`${SUPABASE_URL}/functions/v1/test-place-country`,{headers:{Authorization:`Bearer ${state.session.access_token}`,apikey:SUPABASE_PUBLISHABLE_KEY,Accept:"application/json"}});
  const body=await response.json().catch(()=>({})); if(version!==state.renderVersion)return; if(!response.ok){setContent(`${heading("Place-Country Custom API","Feature-level failure") }<p class="feature-state error">HTTP ${response.status}：${escapeHtml(body.error||body.message||"Request failed")}</p>`);return;}
  const rows=Array.isArray(body.rows)?body.rows.slice(0,5):[]; if(!rows.length){setContent(`${heading("Place-Country Custom API","Custom API completed") }<p class="feature-state">Response 沒有 Place rows。</p>`);return;}
  setContent(`${heading("Place-Country Custom API",`${body.experiment||"test-place-country"} · ${rows.length} bounded rows`) }<div class="grid">${rows.map(row=>placeCard(row,`<dt>Country</dt><dd>${escapeHtml(row.country_name)} (${escapeHtml(row.country_code)})</dd>`)).join("")}</div>`);
}

document.addEventListener("click",event=>{const link=event.target.closest("a[data-route]");if(!link)return;event.preventDefault();history.pushState({},"",link.getAttribute("href"));renderCurrentRoute();});
el("login-form").addEventListener("submit",async event=>{event.preventDefault();el("login-button").disabled=true;el("login-message").textContent="登入中…";const {data,error}=await supabase.auth.signInWithPassword({email:el("account").value.trim(),password:el("password").value});el("login-button").disabled=false;if(error){el("login-message").textContent=`登入失敗：${error.message}`;return;}el("login-message").textContent="";await bootstrap(data.session);});
document.querySelectorAll(".signout-button").forEach(button=>button.addEventListener("click",async()=>{button.disabled=true;clearApplicationState();show("startup-view");await supabase.auth.signOut();enterSignedOutState();button.disabled=false;}));
el("retry-button").addEventListener("click",()=>bootstrap(state.session));
el("menu-button").addEventListener("click",()=>{const open=!el("sidebar").classList.contains("open");el("sidebar").classList.toggle("open",open);el("nav-backdrop").hidden=!open;el("menu-button").setAttribute("aria-expanded",String(open));document.body.classList.toggle("nav-open",open);});
el("nav-backdrop").addEventListener("click",closeNavigation); window.addEventListener("popstate",()=>state.appUser&&renderCurrentRoute()); window.addEventListener("resize",()=>{if(innerWidth>800)closeNavigation();});
// Token refresh 失敗、其他 tab sign-out 等 auth invalidation 必須立即 fail closed，不保留舊 Context / Navigation / Feature DOM。
// 正常 refresh 只同步 caller JWT；不重建 Application Context、Navigation、route 或 Feature DOM。
supabase.auth.onAuthStateChange((_event,nextSession)=>{if(nextSession){state.session=nextSession;return;}queueMicrotask(enterSignedOutState);});
const {data:{session}}=await supabase.auth.getSession(); await bootstrap(session);
