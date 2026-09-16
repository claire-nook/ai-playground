import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildNavigation, resolveRoute } from "../public/application-shell/shell-core.mjs";

const features=[
  {oid:1,feature_code:"FUNC_BUSINESS_PLACE",route_path:"/business/places",is_active:true},
  {oid:2,feature_code:"FUNC_BUSINESS_WEATHER",route_path:"/business/weather",is_active:true},
  {oid:3,feature_code:"FUNC_COMMON_PLACE_COUNTRY",route_path:"/common/place-country",is_active:true}
];
const menus=[
  {oid:10,menu_name:"Business",parent_menu_oid:null,feature_oid:null,sort_order:10,is_active:true},
  {oid:20,menu_name:"Common",parent_menu_oid:null,feature_oid:null,sort_order:20,is_active:true},
  {oid:11,menu_name:"Place Native",parent_menu_oid:10,feature_oid:1,sort_order:10,is_active:true},
  {oid:12,menu_name:"Place Weather",parent_menu_oid:10,feature_oid:2,sort_order:20,is_active:true},
  {oid:21,menu_name:"Place-Country",parent_menu_oid:20,feature_oid:3,sort_order:10,is_active:true}
];
const mappings=[{user_type:"admin",feature_oid:1},{user_type:"admin",feature_oid:2},{user_type:"admin",feature_oid:3},{user_type:"user",feature_oid:1},{user_type:"user",feature_oid:2}];

test("metadata derives admin, user and guest navigation",()=>{
  assert.equal(buildNavigation(features,menus,mappings,"admin").flatMap(x=>x.entries).length,3);
  assert.deepEqual(buildNavigation(features,menus,mappings,"user").map(x=>x.name),["Business"]);
  assert.deepEqual(buildNavigation(features,menus,mappings,"guest"),[]);
});

test("known disallowed and unknown routes are deterministic",()=>{
  const allowed=new Set(["/business/places","/business/weather"]);
  assert.equal(resolveRoute("/business/places",allowed).kind,"feature");
  assert.equal(resolveRoute("/common/place-country",allowed).kind,"rejected");
  assert.equal(resolveRoute("/not-real",allowed).kind,"not-found");
  assert.equal(resolveRoute("/application-shell/",allowed).kind,"home");
});

test("browser artifact contains no privileged credential markers",async()=>{
  const source=await readFile(new URL("../public/application-shell/app.js",import.meta.url),"utf8");
  assert.doesNotMatch(source,/eyJ[a-zA-Z0-9_-]{20,}/);
  assert.doesNotMatch(source,/service_role\s*[:=]/i);
  assert.match(source,/sb_publishable_/);
});
