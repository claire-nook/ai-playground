// F-MAINT-1: deterministic Browser mock for Single-record Maintenance lifecycle research.
const PAGE_START = 32;
const userCapability = { canCreate: true, canView: true, canEdit: true };
const el = (id) => document.getElementById(id);

let currentPage = PAGE_START;
let selectedRecordId = null;
let selectedOriginalPage = null;
let formMode = null;
let loadedVersion = null;
let formDirty = false;
let originalFormSnapshot = "";
let pendingLeave = null;
let createdRows = [];

const statusMeta = {
  ACTIVE: { label: "啟用", className: "status-success" },
  PAUSED: { label: "暫停", className: "status-warning" }
};

function buildRows() {
  const rows = [];
  for (let index = 1; index <= 760; index += 1) {
    const sequence = 761 - index;
    rows.push({
      id: `REF-${String(sequence).padStart(4, "0")}`,
      code: `SYN-${String(sequence).padStart(4, "0")}`,
      name: `Synthetic Record ${String(sequence).padStart(4, "0")}`,
      category: ["A", "B", "C"][sequence % 3],
      status: sequence % 7 === 0 ? "PAUSED" : "ACTIVE",
      effectiveDate: `2026-${String((sequence % 9) + 1).padStart(2, "0")}-${String((sequence % 27) + 1).padStart(2, "0")}`,
      maintainable: sequence % 5 === 0 ? "N" : "Y",
      description: `Synthetic record ${sequence}。此欄位代表 Feature-defined Long Text；正式畫面仍依 Specification 設計。`,
      createdAt: `2026-08-${String((sequence % 27) + 1).padStart(2, "0")} 09:15`,
      createdBy: sequence % 2 ? "Claire" : "SYSTEM",
      updatedAt: `2026-09-${String((sequence % 17) + 1).padStart(2, "0")} 14:30`,
      updatedBy: "Platform Admin",
      version: 1
    });
  }
  return rows;
}

const baseRows = buildRows();
function allRows() { return [...createdRows, ...baseRows]; }
function recordById(id) { return allRows().find((row) => row.id === id) ?? null; }
function canEditRecord(row) { return Boolean(row && userCapability.canEdit && row.maintainable === "Y"); }

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML;
}
function statusPill(status) {
  const meta = statusMeta[status] ?? { label: status, className: "" };
  return `<span class="status-pill ${meta.className}">${escapeHtml(meta.label)}</span>`;
}
function field(label, value, presentation = "normal") {
  return `<div class="detail-field field-${presentation}"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value ?? "—")}</dd></div>`;
}
function nowLabel() { return "2026-09-17 19:30"; }

function filteredRows() {
  const keyword = el("keyword").value.trim().toLowerCase();
  const status = el("status").value;
  const maintainable = el("maintainable").value;
  return allRows().filter((row) => {
    const keywordMatch = !keyword || row.name.toLowerCase().includes(keyword) || row.code.toLowerCase().includes(keyword);
    return keywordMatch && (!status || row.status === status) && (!maintainable || row.maintainable === maintainable);
  });
}
function pageSize() { return Number(el("page-size").value); }
function totalPages(rows) { return Math.max(1, Math.ceil(rows.length / pageSize())); }
function visibleRows(rows) { return rows.slice((currentPage - 1) * pageSize(), currentPage * pageSize()); }

function renderDesktop(rows) {
  el("desktop-result").innerHTML = `<table class="result-table detail-result-table"><thead><tr><th>代碼</th><th>名稱</th><th>狀態</th><th>維護能力</th><th>操作</th></tr></thead><tbody>${rows.map((row) => {
    const editable = canEditRecord(row);
    return `<tr class="${row.id === selectedRecordId ? "selected-row" : ""}" data-record-id="${escapeHtml(row.id)}"><td>${escapeHtml(row.code)}</td><td>${escapeHtml(row.name)}</td><td>${statusPill(row.status)}</td><td>${editable ? "可修改" : "唯讀"}</td><td><div class="result-action-group"><button class="detail-action" type="button" data-read-id="${escapeHtml(row.id)}">明細</button><button class="detail-action" type="button" data-edit-id="${escapeHtml(row.id)}" ${editable ? "" : "disabled"}>修改</button></div></td></tr>`;
  }).join("")}</tbody></table>`;
}
function renderMobile(rows) {
  el("mobile-result").innerHTML = rows.map((row) => {
    const editable = canEditRecord(row);
    return `<article class="record-card ${row.id === selectedRecordId ? "selected-card" : ""}" data-record-id="${escapeHtml(row.id)}"><div class="record-card-header"><div><h3>${escapeHtml(row.name)}</h3><small>${escapeHtml(row.code)}</small></div>${statusPill(row.status)}</div><dl><dt>維護能力</dt><dd>${editable ? "可修改" : "唯讀"}</dd></dl><div class="card-action-row result-action-group"><button class="detail-action" type="button" data-read-id="${escapeHtml(row.id)}">明細</button><button class="detail-action" type="button" data-edit-id="${escapeHtml(row.id)}" ${editable ? "" : "disabled"}>修改</button></div></article>`;
  }).join("");
}
function renderPagination(rows) {
  const pages = totalPages(rows);
  currentPage = Math.min(Math.max(1, currentPage), pages);
  const candidates = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, pages].filter((p) => p >= 1 && p <= pages))];
  el("pagination").innerHTML = `<button type="button" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>上一頁</button>${candidates.map((p, i) => `${i && p - candidates[i - 1] > 1 ? '<span class="page-gap">…</span>' : ""}<button type="button" data-page="${p}" class="${p === currentPage ? "current" : ""}">${p}</button>`).join("")}<button type="button" data-page="${currentPage + 1}" ${currentPage === pages ? "disabled" : ""}>下一頁</button>`;
}
function renderQuery(message = "") {
  const rows = filteredRows();
  currentPage = Math.min(currentPage, totalPages(rows));
  el("result-count").textContent = `${rows.length} 筆 · 第 ${currentPage} / ${totalPages(rows)} 頁`;
  el("return-context").hidden = !message;
  el("return-context").textContent = message;
  renderDesktop(visibleRows(rows));
  renderMobile(visibleRows(rows));
  renderPagination(rows);
}

function showOnly(viewId) {
  ["query-view", "detail-view", "form-view"].forEach((id) => { el(id).hidden = id !== viewId; });
  window.scrollTo({ top: 0, behavior: "auto" });
  el("content").focus();
}

function renderAudit(row, targetId) {
  el(targetId).innerHTML = [field("建立時間", row.createdAt), field("建立人員", row.createdBy), field("最後異動時間", row.updatedAt), field("最後異動人員", row.updatedBy)].join("");
}
function openDetail(recordId) {
  const row = recordById(recordId);
  if (!row) return;
  selectedRecordId = row.id;
  el("detail-record-id").textContent = row.id;
  el("detail-status").innerHTML = statusPill(row.status);
  el("detail-capability").textContent = canEditRecord(row) ? "目前 User + Record capability 允許修改。" : "目前 Effective Capability = Read-only；明細仍可正常閱讀。";
  el("detail-edit").hidden = !canEditRecord(row);
  el("detail-fields").innerHTML = [field("代碼", row.code), field("名稱", row.name), field("分類", `Category ${row.category}`), field("狀態", statusMeta[row.status]?.label ?? row.status), field("生效日期", row.effectiveDate), field("可修改", row.maintainable === "Y" ? "是" : "否")].join("");
  el("detail-description").textContent = row.description || "—";
  renderAudit(row, "detail-audit");
  showOnly("detail-view");
}

function formSnapshot() {
  return JSON.stringify({ code: el("f-code").value, name: el("f-name").value, category: el("f-category").value, status: el("f-status").value, date: el("f-date").value, maintainable: el("f-maintainable").value, description: el("f-description").value });
}
function setDirty(dirty) {
  formDirty = dirty;
  el("dirty-indicator").textContent = dirty ? "尚未儲存" : "尚未修改";
  el("dirty-indicator").classList.toggle("is-dirty", dirty);
}
function updateDirty() { setDirty(formSnapshot() !== originalFormSnapshot); }
function showFormMessage(text, type = "") {
  el("form-message").hidden = !text;
  el("form-message").className = `form-message ${type}`.trim();
  el("form-message").textContent = text;
}
function clearInvalid() { ["f-code", "f-name", "f-category", "f-date"].forEach((id) => el(id).removeAttribute("aria-invalid")); }

function openCreate() {
  if (!userCapability.canCreate) return;
  formMode = "create";
  selectedRecordId = null;
  loadedVersion = null;
  el("form-mode-label").textContent = "Create Surface";
  el("form-title").textContent = "新增資料";
  el("form-record-id").textContent = "NEW";
  el("form-version-note").textContent = "Create 不存在既有 record version；Save 成功後建立 stable identity，再進 Read Detail。";
  el("f-code").disabled = false;
  el("f-code").value = ""; el("f-name").value = ""; el("f-category").value = ""; el("f-status").value = "ACTIVE"; el("f-date").value = "2026-09-17"; el("f-maintainable").value = "Y"; el("f-description").value = "";
  el("form-audit-section").hidden = true;
  el("concurrency-lab").hidden = true;
  clearInvalid(); showFormMessage("");
  originalFormSnapshot = formSnapshot(); setDirty(false); showOnly("form-view");
}
function openUpdate(recordId) {
  const row = recordById(recordId);
  if (!canEditRecord(row)) { openDetail(recordId); return; }
  selectedRecordId = row.id;
  formMode = "update";
  loadedVersion = row.version;
  el("form-mode-label").textContent = "Update Surface";
  el("form-title").textContent = "修改資料";
  el("form-record-id").textContent = row.id;
  el("form-version-note").textContent = `Loaded version = ${loadedVersion}。代碼在本 Prototype 視為建立後 immutable。`;
  el("f-code").disabled = true;
  el("f-code").value = row.code; el("f-name").value = row.name; el("f-category").value = row.category; el("f-status").value = row.status; el("f-date").value = row.effectiveDate; el("f-maintainable").value = row.maintainable; el("f-description").value = row.description;
  el("form-audit-section").hidden = false;
  renderAudit(row, "form-audit");
  el("concurrency-lab").hidden = false;
  el("concurrency-state").textContent = `Stored version = ${row.version}；尚未模擬 concurrent update。`;
  clearInvalid(); showFormMessage("");
  originalFormSnapshot = formSnapshot(); setDirty(false); showOnly("form-view");
}

function validateForm() {
  clearInvalid();
  const required = [["f-code", "代碼"], ["f-name", "名稱"], ["f-category", "分類"], ["f-date", "生效日期"]];
  const missing = required.filter(([id]) => !el(id).value.trim());
  missing.forEach(([id]) => el(id).setAttribute("aria-invalid", "true"));
  if (missing.length) { showFormMessage(`請完成必填欄位：${missing.map(([, label]) => label).join("、")}。`, "error"); return false; }
  if (formMode === "create" && allRows().some((row) => row.code.toLowerCase() === el("f-code").value.trim().toLowerCase())) { el("f-code").setAttribute("aria-invalid", "true"); showFormMessage("代碼已存在。Prototype 將 unique business key validation 視為 Save contract 的一部分。", "error"); return false; }
  return true;
}
function applyForm(row) {
  row.name = el("f-name").value.trim(); row.category = el("f-category").value; row.status = el("f-status").value; row.effectiveDate = el("f-date").value; row.maintainable = el("f-maintainable").value; row.description = el("f-description").value.trim();
}
function saveForm(event) {
  event.preventDefault();
  if (!validateForm()) return;
  if (formMode === "create") {
    const id = `NEW-${String(createdRows.length + 1).padStart(3, "0")}`;
    const row = { id, code: el("f-code").value.trim().toUpperCase(), name: "", category: "", status: "ACTIVE", effectiveDate: "", maintainable: "Y", description: "", createdAt: nowLabel(), createdBy: "Claire", updatedAt: nowLabel(), updatedBy: "Claire", version: 1 };
    applyForm(row); createdRows.unshift(row); selectedRecordId = id; setDirty(false); openDetail(id); return;
  }
  const row = recordById(selectedRecordId);
  if (!row) { showFormMessage("Record 已不存在，無法儲存。", "error"); return; }
  if (row.version !== loadedVersion) {
    showFormMessage(`Concurrency conflict：你載入的是 version ${loadedVersion}，目前資料已是 version ${row.version}。本 Prototype 拒絕 silent overwrite。`, "warning");
    el("concurrency-state").innerHTML = `目前 stored version = ${row.version}。 <button type="button" class="detail-action" data-reload-current>重新載入目前資料</button>`;
    return;
  }
  applyForm(row); row.version += 1; row.updatedAt = nowLabel(); row.updatedBy = "Claire"; loadedVersion = row.version; setDirty(false); openDetail(row.id);
}

function requestLeave(callback) {
  if (!formDirty) { callback(); return; }
  pendingLeave = callback;
  el("dirty-dialog").showModal();
}
function cancelForm() {
  requestLeave(() => {
    setDirty(false);
    if (formMode === "update" && selectedRecordId) openDetail(selectedRecordId);
    else { showOnly("query-view"); renderQuery("新增已取消；保留原查詢工作上下文。"); }
  });
}
function returnToQuery() {
  const rows = filteredRows();
  const index = selectedRecordId ? rows.findIndex((row) => row.id === selectedRecordId) : -1;
  let message = "已返回查詢結果。";
  if (index >= 0) { currentPage = Math.floor(index / pageSize()) + 1; message = `已返回並以 stable identity 重新定位 ${selectedRecordId}，目前位於第 ${currentPage} 頁。`; }
  else if (selectedOriginalPage) currentPage = Math.min(selectedOriginalPage, totalPages(rows));
  showOnly("query-view"); renderQuery(message);
  requestAnimationFrame(() => document.querySelector(`[data-record-id="${CSS.escape(selectedRecordId ?? "")}"]`)?.scrollIntoView({ block: "center" }));
}

el("query-form").addEventListener("submit", (event) => { event.preventDefault(); currentPage = 1; selectedRecordId = null; renderQuery(); });
el("clear-button").addEventListener("click", () => { el("keyword").value = ""; el("status").value = ""; el("maintainable").value = ""; currentPage = 1; selectedRecordId = null; renderQuery(); });
el("page-size").addEventListener("change", () => { currentPage = 1; renderQuery(); });
el("create-button").addEventListener("click", openCreate);
el("detail-back").addEventListener("click", returnToQuery);
el("detail-edit").addEventListener("click", () => openUpdate(selectedRecordId));
el("maintenance-form").addEventListener("input", updateDirty);
el("maintenance-form").addEventListener("change", updateDirty);
el("maintenance-form").addEventListener("submit", saveForm);
el("form-cancel").addEventListener("click", cancelForm);
el("form-cancel-top").addEventListener("click", cancelForm);
el("simulate-concurrent-update").addEventListener("click", () => { const row = recordById(selectedRecordId); if (!row) return; row.version += 1; row.updatedAt = nowLabel(); row.updatedBy = "Another User"; el("concurrency-state").textContent = `已模擬外部修改：stored version = ${row.version}，你的 loaded version 仍為 ${loadedVersion}。`; });
el("dirty-dialog").addEventListener("close", () => { if (el("dirty-dialog").returnValue === "leave" && pendingLeave) { const callback = pendingLeave; pendingLeave = null; setDirty(false); callback(); } else pendingLeave = null; });

document.addEventListener("click", (event) => {
  const read = event.target.closest("[data-read-id]");
  const edit = event.target.closest("[data-edit-id]");
  const page = event.target.closest("[data-page]");
  const reload = event.target.closest("[data-reload-current]");
  if (read) { selectedOriginalPage = currentPage; openDetail(read.dataset.readId); }
  if (edit && !edit.disabled) { selectedOriginalPage = currentPage; openUpdate(edit.dataset.editId); }
  if (page && !page.disabled) { currentPage = Number(page.dataset.page); selectedRecordId = null; renderQuery(); }
  if (reload) openUpdate(selectedRecordId);
});

window.addEventListener("beforeunload", (event) => { if (formDirty) { event.preventDefault(); event.returnValue = ""; } });

function closeNavigation() { el("sidebar").classList.remove("open"); el("nav-backdrop").hidden = true; el("menu-button").setAttribute("aria-expanded", "false"); document.body.classList.remove("nav-open"); }
el("menu-button").addEventListener("click", () => { const open = !el("sidebar").classList.contains("open"); el("sidebar").classList.toggle("open", open); el("nav-backdrop").hidden = !open; el("menu-button").setAttribute("aria-expanded", String(open)); document.body.classList.toggle("nav-open", open); });
el("nav-backdrop").addEventListener("click", closeNavigation);
window.addEventListener("resize", () => { if (innerWidth > 800) closeNavigation(); });

renderQuery();
