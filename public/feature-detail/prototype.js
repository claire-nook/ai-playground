// F-DETAIL-1 uses deterministic fixtures deliberately: this round validates Master → Detail interaction, not Data Access.
const fixtures = {
  mixed: [
    { id:"BL-0917-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-17 06:05", end:"2026-09-17 06:06", status:"WARNING", actor:"SYSTEM", summary:"12 個地點完成，1 個地點有警告", duration:"1 分 18 秒", scope:"13 個啟用地點", completed:12, warning:1, failed:0, detail:"主要處理已完成；Tokyo 的外部天氣資料回應超過本次等待門檻，因此保留警告供後續檢查。", trace:["06:05 建立本次 Daily Weather 執行","06:05 載入 13 個啟用地點","06:06 完成 12 個地點，1 個地點標記警告","06:06 寫入 Batch 執行結果"] },
    { id:"BL-0916-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-16 06:05", end:"2026-09-16 06:06", status:"SUCCESS", actor:"SYSTEM", summary:"13 個地點完成", duration:"58 秒", scope:"13 個啟用地點", completed:13, warning:0, failed:0, detail:"所有啟用地點皆完成天氣資料更新，本次執行沒有需要人工處理的警告。", trace:["06:05 建立本次 Daily Weather 執行","06:05 載入 13 個啟用地點","06:06 完成全部地點","06:06 寫入 Batch 執行結果"] },
    { id:"BL-0915-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-15 06:05", end:"2026-09-15 06:05", status:"FAILED", actor:"SYSTEM", summary:"Batch 啟動後失敗", duration:"12 秒", scope:"13 個啟用地點", completed:0, warning:0, failed:13, detail:"Batch 已建立執行紀錄，但在開始逐筆處理前即發生不可恢復錯誤，因此本次沒有完成任何地點。", trace:["06:05 建立本次 Daily Weather 執行","06:05 載入啟用地點","06:05 初始化處理程序失敗","06:05 寫入失敗結果"] },
    { id:"BL-0914-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-14 06:05", end:"2026-09-14 06:06", status:"SUCCESS", actor:"SYSTEM", summary:"13 個地點完成", duration:"1 分 02 秒", scope:"13 個啟用地點", completed:13, warning:0, failed:0, detail:"所有啟用地點皆完成天氣資料更新。", trace:["06:05 建立本次 Daily Weather 執行","06:05 載入 13 個啟用地點","06:06 完成全部地點","06:06 寫入 Batch 執行結果"] },
    { id:"BL-0913-002", batch:"PLACE_REFRESH", name:"Place Refresh", start:"2026-09-13 09:30", end:"2026-09-13 09:31", status:"SUCCESS", actor:"CLAIRE", summary:"5 筆地點資料檢查完成", duration:"41 秒", scope:"5 筆指定地點", completed:5, warning:0, failed:0, detail:"人工觸發的 Place Refresh 已完成指定資料檢查。", trace:["09:30 Claire 觸發 Place Refresh","09:30 載入 5 筆指定地點","09:31 完成資料檢查","09:31 寫入執行結果"] },
    { id:"BL-0913-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-13 06:05", end:null, status:"RUNNING", actor:"SYSTEM", summary:"正在處理地點資料", duration:"執行中", scope:"13 個啟用地點", completed:7, warning:0, failed:0, detail:"本筆代表仍在執行中的 Detail 狀態；已完成部分地點，但尚未產生最終結果。", trace:["06:05 建立本次 Daily Weather 執行","06:05 載入 13 個啟用地點","目前已完成 7 個地點","等待其餘處理完成"] }
  ],
  normal: [
    { id:"BL-N-003", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-17 06:05", end:"2026-09-17 06:06", status:"SUCCESS", actor:"SYSTEM", summary:"13 個地點完成", duration:"59 秒", scope:"13 個啟用地點", completed:13, warning:0, failed:0, detail:"所有啟用地點皆完成天氣資料更新。", trace:["06:05 建立執行","06:05 載入資料","06:06 完成全部地點","06:06 寫入結果"] },
    { id:"BL-N-002", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-16 06:05", end:"2026-09-16 06:06", status:"SUCCESS", actor:"SYSTEM", summary:"13 個地點完成", duration:"57 秒", scope:"13 個啟用地點", completed:13, warning:0, failed:0, detail:"所有啟用地點皆完成天氣資料更新。", trace:["06:05 建立執行","06:05 載入資料","06:06 完成全部地點","06:06 寫入結果"] },
    { id:"BL-N-001", batch:"DAILY_WEATHER", name:"Daily Weather", start:"2026-09-15 06:05", end:"2026-09-15 06:06", status:"SUCCESS", actor:"SYSTEM", summary:"13 個地點完成", duration:"1 分 01 秒", scope:"13 個啟用地點", completed:13, warning:0, failed:0, detail:"所有啟用地點皆完成天氣資料更新。", trace:["06:05 建立執行","06:05 載入資料","06:06 完成全部地點","06:06 寫入結果"] }
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
let selectedRecordId = null;

// Escape fixture content so prototype rendering habits remain safe when replaced by real data later.
function escapeHtml(value) {
  const node=document.createElement("span");
  node.textContent=value ?? "";
  return node.innerHTML;
}
function datePart(value) { return value ? value.slice(0,10) : ""; }
function currentRows() { return fixtures[el("scenario").value] ?? []; }
function filteredRows() {
  const batch=el("batch-code").value;
  const status=el("status").value;
  const from=el("date-from").value;
  const to=el("date-to").value;
  return currentRows().filter(row => (!batch || row.batch===batch) && (!status || row.status===status) && (!from || datePart(row.start)>=from) && (!to || datePart(row.start)<=to));
}
function statusPill(status) {
  const meta=statusMeta[status] ?? {label:status,className:""};
  return `<span class="status-pill ${meta.className}">${escapeHtml(meta.label)}</span>`;
}

// Pattern 2 adds one deliberate action column: the list identifies/selects a record; it does not absorb Detail content.
function renderDesktop(rows) {
  if(!rows.length){ el("desktop-result").innerHTML=""; return; }
  el("desktop-result").innerHTML=`<table class="result-table detail-result-table"><thead><tr><th>開始時間</th><th>Batch</th><th>狀態</th><th>結果摘要</th><th>明細</th></tr></thead><tbody>${rows.map(row=>`<tr class="${row.id===selectedRecordId?"selected-row":""}" data-record-id="${escapeHtml(row.id)}"><td>${escapeHtml(row.start)}</td><td>${escapeHtml(row.name)}</td><td>${statusPill(row.status)}</td><td>${escapeHtml(row.summary)}</td><td><button class="detail-action" type="button" data-detail-id="${escapeHtml(row.id)}">查看</button></td></tr>`).join("")}</tbody></table>`;
}
function renderMobile(rows) {
  el("mobile-result").innerHTML=rows.map(row=>`<article class="record-card ${row.id===selectedRecordId?"selected-card":""}" data-record-id="${escapeHtml(row.id)}"><div class="record-card-header"><div><h3>${escapeHtml(row.name)}</h3><small>${escapeHtml(row.start)}</small></div>${statusPill(row.status)}</div><dl><dt>結果</dt><dd>${escapeHtml(row.summary)}</dd><dt>結束</dt><dd>${escapeHtml(row.end || "—")}</dd></dl><div class="card-action-row"><button class="detail-action" type="button" data-detail-id="${escapeHtml(row.id)}">查看明細</button></div></article>`).join("");
}
function renderQuery() {
  const rows=filteredRows();
  el("result-count").textContent=`${rows.length} 筆`;
  el("result-message").hidden=rows.length>0;
  el("result-message").textContent=rows.length?"":"沒有符合條件的資料。";
  el("return-context").hidden=!selectedRecordId;
  el("return-context").textContent=selectedRecordId?`已返回查詢結果；前次查看記錄 ${selectedRecordId} 保留為工作錨點。`:"";
  renderDesktop(rows);
  renderMobile(rows);
}

// Detail is rendered from the selected stable record identity; no full-record blob is passed through the button itself.
function openDetail(recordId) {
  const row=currentRows().find(item=>item.id===recordId);
  if(!row) return;
  selectedRecordId=row.id;
  const meta=statusMeta[row.status] ?? {label:row.status,className:""};
  el("detail-summary").textContent=row.summary;
  el("detail-status").innerHTML=statusPill(row.status);
  el("detail-record-id").textContent=row.id;
  el("overview-grid").innerHTML=[
    ["Batch",row.name],
    ["開始時間",row.start],
    ["結束時間",row.end || "尚未結束"],
    ["執行者",row.actor],
    ["執行範圍",row.scope],
    ["執行時間",row.duration]
  ].map(([label,value])=>`<div class="detail-field"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  el("detail-result-card").innerHTML=`<div class="result-copy"><h3>${escapeHtml(meta.label)} · ${escapeHtml(row.summary)}</h3><p>${escapeHtml(row.detail)}</p></div><div class="result-metrics"><div class="metric"><strong>${escapeHtml(row.completed)}</strong><span>完成</span></div><div class="metric"><strong>${escapeHtml(row.warning)}</strong><span>警告</span></div><div class="metric"><strong>${escapeHtml(row.failed)}</strong><span>失敗</span></div><div class="metric"><strong>${escapeHtml(row.status==="RUNNING"?"進行中":"完成")}</strong><span>生命週期</span></div></div>`;
  el("detail-trace").innerHTML=row.trace.map(item=>`<li><strong>${escapeHtml(row.name)}</strong><span>${escapeHtml(item)}</span></li>`).join("");
  el("query-view").hidden=true;
  el("detail-view").hidden=false;
  el("content").focus();
  window.scrollTo({top:0,behavior:"auto"});
}
function returnToQuery() {
  el("detail-view").hidden=true;
  el("query-view").hidden=false;
  renderQuery();
  requestAnimationFrame(()=>{
    const anchor=document.querySelector(`[data-record-id="${CSS.escape(selectedRecordId)}"]`);
    if(anchor) anchor.scrollIntoView({block:"center",behavior:"auto"});
    el("content").focus();
  });
}

el("query-form").addEventListener("submit",event=>{ event.preventDefault(); selectedRecordId=null; renderQuery(); });
el("clear-button").addEventListener("click",()=>{ el("batch-code").value=""; el("status").value=""; el("date-from").value=""; el("date-to").value=""; selectedRecordId=null; renderQuery(); });
el("scenario").addEventListener("change",()=>{ selectedRecordId=null; renderQuery(); });
el("back-to-query").addEventListener("click",returnToQuery);
document.addEventListener("click",event=>{
  const button=event.target.closest("[data-detail-id]");
  if(button) openDetail(button.dataset.detailId);
});

// Reuse the verified Shell mobile-navigation behavior while keeping this functional prototype session-free.
function closeNavigation(){ el("sidebar").classList.remove("open"); el("nav-backdrop").hidden=true; el("menu-button").setAttribute("aria-expanded","false"); document.body.classList.remove("nav-open"); }
el("menu-button").addEventListener("click",()=>{ const open=!el("sidebar").classList.contains("open"); el("sidebar").classList.toggle("open",open); el("nav-backdrop").hidden=!open; el("menu-button").setAttribute("aria-expanded",String(open)); document.body.classList.toggle("nav-open",open); });
el("nav-backdrop").addEventListener("click",closeNavigation);
window.addEventListener("resize",()=>{ if(innerWidth>800)closeNavigation(); });

renderQuery();
