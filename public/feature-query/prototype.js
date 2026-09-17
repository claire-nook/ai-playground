// F-QUERY-1 uses deterministic fixtures on purpose: this round validates Functional Interaction, not Data Access.
const fixtures = {
  mixed: [
    { id:"BL-0917-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-17 06:05", end:"2026-09-17 06:06", status:"WARNING", actor:"SYSTEM", summary:"12 個地點完成，1 個地點有警告", detail:"Osaka：provider response 缺少 precipitation_sum；其餘地點完成。" },
    { id:"BL-0916-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-16 06:05", end:"2026-09-16 06:06", status:"SUCCESS", actor:"SYSTEM", summary:"13 個地點完成", detail:"所有 active places 完成昨日天氣資料寫入。" },
    { id:"BL-0915-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-15 06:05", end:"2026-09-15 06:05", status:"FAILED", actor:"SYSTEM", summary:"Batch 啟動後失敗", detail:"Configuration validation failed：weather provider configuration unavailable。" },
    { id:"BL-0914-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-14 06:05", end:"2026-09-14 06:06", status:"SUCCESS", actor:"SYSTEM", summary:"13 個地點完成", detail:"所有 active places 完成昨日天氣資料寫入。" },
    { id:"BL-0913-002", batch:"PLACE_REFRESH", name:"Place Refresh", start:"2026-09-13 09:30", end:"2026-09-13 09:31", status:"SUCCESS", actor:"CLAIRE", summary:"5 筆地點資料檢查完成", detail:"Prototype secondary batch，用來確認 Batch filter 行為。" },
    { id:"BL-0913-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-13 06:05", end:null, status:"RUNNING", actor:"SYSTEM", summary:"正在處理地點資料", detail:"Prototype running state；不代表真實 Batch 正在執行。" }
  ],
  normal: [
    { id:"BL-N-003", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-17 06:05", end:"2026-09-17 06:06", status:"SUCCESS", actor:"SYSTEM", summary:"13 個地點完成", detail:"所有 active places 完成昨日天氣資料寫入。" },
    { id:"BL-N-002", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-16 06:05", end:"2026-09-16 06:06", status:"SUCCESS", actor:"SYSTEM", summary:"13 個地點完成", detail:"所有 active places 完成昨日天氣資料寫入。" },
    { id:"BL-N-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-15 06:05", end:"2026-09-15 06:06", status:"SUCCESS", actor:"SYSTEM", summary:"13 個地點完成", detail:"所有 active places 完成昨日天氣資料寫入。" }
  ],
  empty: []
};

const statusMeta = {
  SUCCESS:{ label:"成功", className:"status-success" },
  WARNING:{ label:"部分異常", className:"status-warning" },
  FAILED:{ label:"失敗", className:"status-failed" },
  RUNNING:{ label:"執行中", className:"status-running" }
};
const el = id => document.getElementById(id);
const expanded = new Set();

// Escaping fixture content keeps the prototype's rendering habit compatible with later real-data replacement.
function escapeHtml(value) {
  const node=document.createElement("span");
  node.textContent=value ?? "";
  return node.innerHTML;
}
function datePart(value) { return value ? value.slice(0,10) : ""; }
function filteredRows() {
  const rows=fixtures[el("scenario").value] ?? [];
  const batch=el("batch-code").value, status=el("status").value, from=el("date-from").value, to=el("date-to").value;
  return rows.filter(row => (!batch || row.batch===batch) && (!status || row.status===status) && (!from || datePart(row.start)>=from) && (!to || datePart(row.start)<=to));
}
function statusPill(status) {
  const meta=statusMeta[status] ?? {label:status,className:""};
  return `<span class="status-pill ${meta.className}">${escapeHtml(meta.label)}</span>`;
}
function detailMarkup(row) {
  return `<div class="detail-box"><div><p class="detail-label">Execution ID</p><p>${escapeHtml(row.id)}</p><p class="detail-label">執行者</p><p>${escapeHtml(row.actor)}</p></div><div><p class="detail-label">Result / Error Detail</p><p>${escapeHtml(row.detail)}</p></div></div>`;
}
function renderDesktop(rows) {
  if(!rows.length){ el("desktop-result").innerHTML=""; return; }
  el("desktop-result").innerHTML=`<table class="result-table"><thead><tr><th>開始時間</th><th>Batch</th><th>狀態</th><th>結果摘要</th><th>結束時間</th><th></th></tr></thead><tbody>${rows.map(row=>`<tr><td>${escapeHtml(row.start)}</td><td>${escapeHtml(row.name)}</td><td>${statusPill(row.status)}</td><td>${escapeHtml(row.summary)}</td><td>${escapeHtml(row.end || "—")}</td><td><button type="button" data-detail="${escapeHtml(row.id)}">${expanded.has(row.id)?"收合":"明細"}</button></td></tr>${expanded.has(row.id)?`<tr class="detail-row"><td colspan="6">${detailMarkup(row)}</td></tr>`:""}`).join("")}</tbody></table>`;
}
function renderMobile(rows) {
  el("mobile-result").innerHTML=rows.map(row=>`<article class="record-card"><div class="record-card-header"><div><h3>${escapeHtml(row.name)}</h3><small>${escapeHtml(row.start)}</small></div>${statusPill(row.status)}</div><dl><dt>結果</dt><dd>${escapeHtml(row.summary)}</dd><dt>結束</dt><dd>${escapeHtml(row.end || "—")}</dd></dl><button class="detail-toggle" type="button" data-detail="${escapeHtml(row.id)}">${expanded.has(row.id)?"收合明細":"查看明細"}</button>${expanded.has(row.id)?`<div class="mobile-detail">${detailMarkup(row)}</div>`:""}</article>`).join("");
}
function renderSummary() {
  const scenario=el("scenario").value;
  const box=el("today-status"), title=el("today-title"), copy=el("today-copy");
  box.className="status-pill";
  if(scenario==="normal") { title.textContent="已完成"; copy.textContent="最近執行：2026-09-17 06:05 · 13 個地點完成"; box.textContent="成功"; box.classList.add("status-success"); }
  else if(scenario==="empty") { title.textContent="尚無紀錄"; copy.textContent="目前 Scenario 沒有可顯示的 Batch execution record。"; box.textContent="無資料"; box.classList.add("status-running"); }
  else { title.textContent="已完成"; copy.textContent="最近執行：2026-09-17 06:05 · 12 個地點完成，1 個地點有警告"; box.textContent="部分異常"; box.classList.add("status-warning"); }
}
function render() {
  const rows=filteredRows();
  el("result-count").textContent=`${rows.length} 筆`;
  el("result-message").hidden=rows.length>0;
  el("result-message").textContent=rows.length?"":"沒有符合條件的執行紀錄。";
  renderDesktop(rows); renderMobile(rows); renderSummary();
}

el("query-form").addEventListener("submit",event=>{ event.preventDefault(); expanded.clear(); render(); });
el("clear-button").addEventListener("click",()=>{ el("batch-code").value=""; el("status").value=""; el("date-from").value=""; el("date-to").value=""; expanded.clear(); render(); });
el("scenario").addEventListener("change",()=>{ expanded.clear(); render(); });
document.addEventListener("click",event=>{ const button=event.target.closest("[data-detail]"); if(!button)return; const id=button.dataset.detail; expanded.has(id)?expanded.delete(id):expanded.add(id); render(); });

// Reuse the verified Shell's mobile navigation interaction, while keeping this prototype session-free.
function closeNavigation(){ el("sidebar").classList.remove("open"); el("nav-backdrop").hidden=true; el("menu-button").setAttribute("aria-expanded","false"); document.body.classList.remove("nav-open"); }
el("menu-button").addEventListener("click",()=>{ const open=!el("sidebar").classList.contains("open"); el("sidebar").classList.toggle("open",open); el("nav-backdrop").hidden=!open; el("menu-button").setAttribute("aria-expanded",String(open)); document.body.classList.toggle("nav-open",open); });
el("nav-backdrop").addEventListener("click",closeNavigation);
window.addEventListener("resize",()=>{ if(innerWidth>800)closeNavigation(); });
render();
