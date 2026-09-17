// F-DETAIL-1 v2 deliberately uses a synthetic object so the prototype tests a General Detail Pattern, not one real table.
const PAGE_START = 32;
let externalInsertCount = 0;
let currentPage = PAGE_START;
let selectedRecordId = null;
let selectedOriginalPage = null;

const statusMeta = {
  ACTIVE: { label: "啟用", className: "status-success" },
  PAUSED: { label: "暫停", className: "status-warning" }
};

const el = (id) => document.getElementById(id);

// Generate enough deterministic rows to make pagination and record relocation observable without a real backend.
function buildRows() {
  const rows = [];
  for (let index = 1; index <= 760; index += 1) {
    const sequence = 761 - index;
    const category = ["A", "B", "C"][sequence % 3];
    const status = sequence % 7 === 0 ? "PAUSED" : "ACTIVE";
    rows.push({
      id: `REF-${String(sequence).padStart(4, "0")}`,
      code: `SYN-${String(sequence).padStart(4, "0")}`,
      name: `Synthetic Record ${String(sequence).padStart(4, "0")}`,
      category,
      status,
      amount: 1250.5 + sequence * 37.25,
      ratio: ((sequence % 83) + 10) / 100,
      quantity: 1000 + sequence,
      effectiveDate: `2026-${String((sequence % 9) + 1).padStart(2, "0")}-${String((sequence % 27) + 1).padStart(2, "0")}`,
      eventAt: `2026-09-${String((sequence % 17) + 1).padStart(2, "0")} ${String(sequence % 24).padStart(2, "0")}:${String(sequence % 60).padStart(2, "0")}`,
      enabled: sequence % 5 !== 0,
      nullableValue: sequence % 4 === 0 ? null : `Optional ${sequence}`,
      description: "這是一筆 synthetic business object。內容刻意包含文字、代碼、數值、金額、比例、日期時間、Boolean、Null 與長文字，用來觀察 Platform Detail Pattern 的通用呈現能力，而不是模仿任何正式資料表。",
      createdAt: `2026-08-${String((sequence % 27) + 1).padStart(2, "0")} 09:15`,
      createdBy: sequence % 2 ? "Claire" : "SYSTEM",
      updatedAt: sequence % 6 === 0 ? null : `2026-09-${String((sequence % 17) + 1).padStart(2, "0")} 14:30`,
      updatedBy: sequence % 6 === 0 ? null : "Platform Admin"
    });
  }
  return rows;
}

const baseRows = buildRows();

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML;
}

function formatNumber(value) { return new Intl.NumberFormat("zh-TW").format(value); }
function formatCurrency(value) { return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 2 }).format(value); }
function formatPercent(value) { return new Intl.NumberFormat("zh-TW", { style: "percent", maximumFractionDigits: 1 }).format(value); }
function displayValue(value) { return value === null || value === undefined || value === "" ? "—" : String(value); }
function statusPill(status) {
  const meta = statusMeta[status] ?? { label: status, className: "" };
  return `<span class="status-pill ${meta.className}">${escapeHtml(meta.label)}</span>`;
}

// External inserts are intentionally newer than every base row, so they shift the selected record's current rank.
function insertedRows() {
  return Array.from({ length: externalInsertCount }, (_, index) => ({
    ...baseRows[0],
    id: `NEW-${String(index + 1).padStart(3, "0")}`,
    code: `NEW-${String(index + 1).padStart(3, "0")}`,
    name: `Newly Inserted Record ${String(index + 1).padStart(3, "0")}`,
    category: "A",
    status: "ACTIVE"
  }));
}

function allRows() { return [...insertedRows(), ...baseRows]; }
function filteredRows() {
  const keyword = el("keyword").value.trim().toLowerCase();
  const status = el("status").value;
  const category = el("category").value;
  return allRows().filter((row) => {
    const keywordMatch = !keyword || row.name.toLowerCase().includes(keyword) || row.code.toLowerCase().includes(keyword);
    return keywordMatch && (!status || row.status === status) && (!category || row.category === category);
  });
}
function pageSize() { return Number(el("page-size").value); }
function totalPages(rows) { return Math.max(1, Math.ceil(rows.length / pageSize())); }
function rowsForPage(rows) {
  const start = (currentPage - 1) * pageSize();
  return rows.slice(start, start + pageSize());
}

function renderDesktop(rows) {
  el("desktop-result").innerHTML = `<table class="result-table detail-result-table"><thead><tr><th>代碼</th><th>名稱</th><th>分類</th><th>狀態</th><th>明細</th></tr></thead><tbody>${rows.map((row) => `<tr class="${row.id === selectedRecordId ? "selected-row" : ""}" data-record-id="${escapeHtml(row.id)}"><td>${escapeHtml(row.code)}</td><td>${escapeHtml(row.name)}</td><td>Category ${escapeHtml(row.category)}</td><td>${statusPill(row.status)}</td><td><button class="detail-action" type="button" data-detail-id="${escapeHtml(row.id)}">查看</button></td></tr>`).join("")}</tbody></table>`;
}

function renderMobile(rows) {
  el("mobile-result").innerHTML = rows.map((row) => `<article class="record-card ${row.id === selectedRecordId ? "selected-card" : ""}" data-record-id="${escapeHtml(row.id)}"><div class="record-card-header"><div><h3>${escapeHtml(row.name)}</h3><small>${escapeHtml(row.code)}</small></div>${statusPill(row.status)}</div><dl><dt>分類</dt><dd>Category ${escapeHtml(row.category)}</dd></dl><div class="card-action-row"><button class="detail-action" type="button" data-detail-id="${escapeHtml(row.id)}">查看明細</button></div></article>`).join("");
}

function renderPagination(rows) {
  const pages = totalPages(rows);
  currentPage = Math.min(Math.max(1, currentPage), pages);
  const candidates = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, pages].filter((page) => page >= 1 && page <= pages))];
  el("pagination").innerHTML = `<button type="button" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>上一頁</button>${candidates.map((page, index) => `${index > 0 && page - candidates[index - 1] > 1 ? '<span class="page-gap">…</span>' : ""}<button type="button" data-page="${page}" class="${page === currentPage ? "current" : ""}" ${page === currentPage ? 'aria-current="page"' : ""}>${page}</button>`).join("")}<button type="button" data-page="${currentPage + 1}" ${currentPage === pages ? "disabled" : ""}>下一頁</button>`;
}

function renderQuery(returnMessage = "") {
  const rows = filteredRows();
  const pages = totalPages(rows);
  currentPage = Math.min(Math.max(1, currentPage), pages);
  const visibleRows = rowsForPage(rows);
  el("result-count").textContent = `${rows.length} 筆 · 第 ${currentPage} / ${pages} 頁`;
  el("return-context").hidden = !returnMessage;
  el("return-context").textContent = returnMessage;
  renderDesktop(visibleRows);
  renderMobile(visibleRows);
  renderPagination(rows);
}

function field(label, value, typeLabel = "") {
  return `<div class="detail-field"><dt>${escapeHtml(label)}${typeLabel ? `<small>${escapeHtml(typeLabel)}</small>` : ""}</dt><dd>${escapeHtml(displayValue(value))}</dd></div>`;
}

// Detail rendering is metadata-like on purpose: Feature content varies, while the Platform owns consistent presentation rules.
function openDetail(recordId) {
  const row = allRows().find((item) => item.id === recordId);
  if (!row) return;
  selectedRecordId = row.id;
  selectedOriginalPage = currentPage;
  externalInsertCount = 0;
  el("detail-status").innerHTML = statusPill(row.status);
  el("detail-record-id").textContent = row.id;
  el("business-fields").innerHTML = [
    field("短文字", row.name, "Text"),
    field("Code + Description", `${row.code} / Category ${row.category}`, "Reference"),
    field("整數", formatNumber(row.quantity), "Number"),
    field("金額", formatCurrency(row.amount), "Currency"),
    field("比例", formatPercent(row.ratio), "Percentage"),
    field("日期", row.effectiveDate, "Date"),
    field("日期時間", row.eventAt, "Datetime"),
    field("Boolean", row.enabled ? "是" : "否", "Boolean"),
    field("Nullable", row.nullableValue, "Nullable")
  ].join("");
  el("long-content").textContent = row.description;
  el("audit-grid").innerHTML = [
    field("建立時間", row.createdAt),
    field("建立人員", row.createdBy),
    field("最後異動時間", row.updatedAt),
    field("最後異動人員", row.updatedBy)
  ].join("");
  el("mutation-state").textContent = "目前尚未模擬外部新增。";
  el("query-view").hidden = true;
  el("detail-view").hidden = false;
  window.scrollTo({ top: 0, behavior: "auto" });
  el("content").focus();
}

// Return Context uses stable identity as the anchor. Page number is derived from the CURRENT result set, not restored blindly.
function returnToQuery() {
  const rows = filteredRows();
  const index = rows.findIndex((row) => row.id === selectedRecordId);
  let message;
  if (index >= 0) {
    const relocatedPage = Math.floor(index / pageSize()) + 1;
    currentPage = relocatedPage;
    message = relocatedPage === selectedOriginalPage
      ? `已返回並重新定位 ${selectedRecordId}；目前仍在第 ${relocatedPage} 頁。`
      : `資料集已變動：${selectedRecordId} 原在第 ${selectedOriginalPage} 頁，依目前排序重新定位後位於第 ${relocatedPage} 頁。`;
  } else {
    currentPage = Math.min(selectedOriginalPage ?? 1, totalPages(rows));
    message = `原選取記錄 ${selectedRecordId} 已不在目前結果集中；保留查詢條件並回到可用結果頁。`;
  }
  el("detail-view").hidden = true;
  el("query-view").hidden = false;
  renderQuery(message);
  requestAnimationFrame(() => {
    const anchor = selectedRecordId ? document.querySelector(`[data-record-id="${CSS.escape(selectedRecordId)}"]`) : null;
    if (anchor) anchor.scrollIntoView({ block: "center", behavior: "auto" });
    el("content").focus();
  });
}

el("query-form").addEventListener("submit", (event) => { event.preventDefault(); currentPage = 1; selectedRecordId = null; renderQuery(); });
el("clear-button").addEventListener("click", () => { el("keyword").value = ""; el("status").value = ""; el("category").value = ""; currentPage = 1; selectedRecordId = null; renderQuery(); });
el("page-size").addEventListener("change", () => { currentPage = 1; selectedRecordId = null; renderQuery(); });
el("back-to-query").addEventListener("click", returnToQuery);
el("simulate-insert").addEventListener("click", () => { externalInsertCount = 30; el("mutation-state").textContent = "已模擬新增 30 筆較新的資料。返回時將以 stable record identity 在目前資料集中重新定位。"; });

document.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-detail-id]");
  if (detailButton) openDetail(detailButton.dataset.detailId);
  const pageButton = event.target.closest("[data-page]");
  if (pageButton && !pageButton.disabled) { currentPage = Number(pageButton.dataset.page); selectedRecordId = null; renderQuery(); window.scrollTo({ top: 0, behavior: "auto" }); }
});

// Reuse the verified Shell mobile-navigation behavior while keeping this functional prototype session-free.
function closeNavigation() { el("sidebar").classList.remove("open"); el("nav-backdrop").hidden = true; el("menu-button").setAttribute("aria-expanded", "false"); document.body.classList.remove("nav-open"); }
el("menu-button").addEventListener("click", () => { const open = !el("sidebar").classList.contains("open"); el("sidebar").classList.toggle("open", open); el("nav-backdrop").hidden = !open; el("menu-button").setAttribute("aria-expanded", String(open)); document.body.classList.toggle("nav-open", open); });
el("nav-backdrop").addEventListener("click", closeNavigation);
window.addEventListener("resize", () => { if (innerWidth > 800) closeNavigation(); });

renderQuery();
