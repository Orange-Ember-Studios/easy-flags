// Flags module - handles feature flag toggles and display

/**
 * Load and display feature flags for the selected environment
 */
async function loadFlags() {
  console.log("loadFlags");
  const seq = ++window._loadFlagsSeq;
  const sel = document.getElementById("envSelect");
  const table = document.getElementById("flagsTable");

  if (!table) return;

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  if (!sel || !sel.value) return;

  const res = await authFetch(
    api + `/flags?env=${encodeURIComponent(sel.value)}`,
  );

  // Abort if a newer request was started
  if (seq !== window._loadFlagsSeq) {
    console.log("loadFlags: stale response, aborting render");
    return;
  }

  res.flags.forEach((f) => {
    const tr = createFlagRow(f, res.environment);
    tbody.appendChild(tr);
  });
}

/**
 * Create a table row for a feature flag
 * @param {object} flag - The flag object with key, description, value, id
 * @param {object} environment - The environment object
 * @returns {HTMLElement} The table row
 */
function createFlagRow(flag, environment) {
  const tr = document.createElement("tr");

  // Key column
  const tdKey = document.createElement("td");
  tdKey.className = "key";
  tdKey.style.padding = "12px";
  tdKey.innerText = flag.key;

  // Description column
  const tdDesc = document.createElement("td");
  tdDesc.className = "desc";
  tdDesc.style.padding = "12px";
  tdDesc.innerText = flag.description || "";

  // Toggle column
  const tdToggle = document.createElement("td");
  tdToggle.style.padding = "12px";
  tdToggle.style.textAlign = "center";
  const label = document.createElement("label");
  label.className = "toggle-switch";
  const chk = document.createElement("input");
  chk.type = "checkbox";
  chk.checked = flag.value;
  chk.setAttribute("aria-label", `Toggle ${flag.key}`);
  const span = document.createElement("span");
  span.className = "slider";
  chk.onchange = async () => {
    await authFetch(api + `/features/${flag.id}/value`, {
      method: "PUT",
      body: JSON.stringify({
        environmentId: environment.id,
        value: chk.checked,
      }),
    });
  };
  label.appendChild(chk);
  label.appendChild(span);
  tdToggle.appendChild(label);

  // Actions column
  const tdActions = document.createElement("td");
  tdActions.style.padding = "12px";
  tdActions.style.textAlign = "center";
  const delBtn = createDeleteFlagButton(flag);
  tdActions.appendChild(delBtn);

  tr.appendChild(tdKey);
  tr.appendChild(tdDesc);
  tr.appendChild(tdToggle);
  tr.appendChild(tdActions);

  return tr;
}

/**
 * Create delete button for a feature flag
 * @param {object} flag - The flag object
 * @returns {HTMLElement} The delete button
 */
function createDeleteFlagButton(flag) {
  const btn = document.createElement("button");
  btn.className = "icon-btn";
  btn.title = "Delete";
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  btn.onclick = async () => {
    if (!confirm('Delete feature "' + flag.key + '"?')) return;
    await authFetch(api + `/features/${flag.id}`, { method: "DELETE" });
    await loadFeatures();
    await loadFlags();
  };
  return btn;
}
