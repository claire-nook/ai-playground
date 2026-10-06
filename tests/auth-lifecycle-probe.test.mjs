import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../public/auth-lifecycle-probe/index.html", import.meta.url), "utf8");

test("probe uses the Experiment A provider/version and local sign-out contract", () => {
  assert.match(source, /@supabase\/supabase-js@2\.57\.4/);
  assert.match(source, /https:\/\/cctonymfrxneonxryqei\.supabase\.co/);
  assert.match(source, /persistSession:\s*true/);
  assert.match(source, /autoRefreshToken:\s*true/);
  assert.match(source, /signOut\(\{\s*scope:\s*"local"\s*\}\)/);
});

test("probe records the required lifecycle observations", () => {
  assert.match(source, /onAuthStateChange/);
  assert.match(source, /AUTH_EVENT \$\{event\}/);
  assert.match(source, /checkSession\("page_load"\)/);
  assert.match(source, /checkSession\("after_sign_out"\)/);
  assert.match(source, /SIGN_OUT local resolved/);
  assert.match(source, /SIGN_OUT local rejected/);
});

test("diagnostic output is constrained to safe summaries", () => {
  assert.doesNotMatch(source, /console\./);
  assert.doesNotMatch(source, /localStorage\s*[.\[]/);
  assert.doesNotMatch(source, /error\.message/);
  assert.doesNotMatch(source, /JSON\.stringify\s*\(\s*(?:session|error)/);
  assert.doesNotMatch(source, /session\.(?:access_token|refresh_token)/);
  assert.match(source, /function maskIdentifier/);
  assert.match(source, /function maskEmail/);
  assert.match(source, /function safeErrorSummary/);
});

test("page presents symmetric Ordinary and Private Safari instructions", () => {
  assert.match(source, /Ordinary Safari 與 Private Browsing 必須各用全新的測試流程，並執行完全相同的步驟/);
  assert.match(source, /Reload 本頁/);
  assert.match(source, /重新進入本 probe/);
});
