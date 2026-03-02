// Features module - handles feature creation and management

/**
 * Initialize features module
 */
function initFeaturesModule() {
  const featureForm = document.getElementById("featureModalForm");
  const openCreateBtn = document.getElementById("openCreateFeature");
  const closeBtn = document.getElementById("modalClose");
  const createBtn = document.getElementById("modalCreate");
  const keyInput = document.getElementById("modalFeatureKey");

  if (openCreateBtn) {
    openCreateBtn.onclick = handleOpenCreateFeature;
  }
  if (closeBtn) {
    closeBtn.onclick = handleCloseFeatureModal;
  }
  if (featureForm) {
    featureForm.addEventListener("submit", handleCreateFeatureSubmit);
  } else if (createBtn) {
    createBtn.onclick = handleCreateFeature;
  }
  if (keyInput) {
    keyInput.addEventListener("input", handleKeyInput);
    keyInput.addEventListener("blur", updateCreateButtonState);
  }
}

function handleCreateFeatureSubmit(event) {
  event.preventDefault();
  return handleCreateFeature();
}

/**
 * Open create feature modal
 */
async function handleOpenCreateFeature() {
  await loadEnvs();
  const modal = document.getElementById("modal");
  const sel = document.getElementById("modalEnvSelect");
  sel.innerHTML = '<option value="">-- none --</option>';
  (window._envs || []).forEach((e) => {
    const o = document.createElement("option");
    o.value = e.id;
    o.innerText = e.name;
    sel.appendChild(o);
  });
  const keyEl = document.getElementById("modalFeatureKey");
  if (keyEl) keyEl.value = "";
  document.getElementById("modalFeatureDesc").value = "";
  document.getElementById("modalEnvToggle").checked = false;
  document.getElementById("modalMsg").innerText = "";
  modal.style.display = "flex";
}

/**
 * Close feature modal
 */
function handleCloseFeatureModal() {
  document.getElementById("modal").style.display = "none";
}

/**
 * Handle key input - auto-clean whitespace
 * @param {Event} e - The input event
 */
function handleKeyInput(e) {
  const el = e.target;
  const cleaned = el.value.replace(/^\s+|\s+$/g, "").replace(/\s+/g, "-");
  if (cleaned !== el.value) {
    el.value = cleaned;
    const msgEl = document.getElementById("modalMsg");
    if (msgEl) msgEl.innerText = "";
    el.classList.remove("invalid");
  }
  updateCreateButtonState();
}

/**
 * Update create button state based on validation
 */
function updateCreateButtonState() {
  const key = (document.getElementById("modalFeatureKey") || {}).value || "";
  const btn = document.getElementById("modalCreate");
  const v = validateFeatureKey(key);
  if (btn) btn.disabled = !v.valid;
  const msgEl = document.getElementById("modalMsg");
  const keyEl = document.getElementById("modalFeatureKey");
  if (!v.valid) {
    if (keyEl) keyEl.classList.add("invalid");
    if (msgEl) msgEl.innerText = v.message;
  } else {
    if (keyEl) keyEl.classList.remove("invalid");
    if (msgEl) msgEl.innerText = "";
  }
}

/**
 * Create a new feature
 */
async function handleCreateFeature() {
  const btn = document.getElementById("modalCreate");
  btn.disabled = true;
  const key = document.getElementById("modalFeatureKey").value;
  const desc = document.getElementById("modalFeatureDesc").value;

  const v = validateFeatureKey(key);
  if (!v.valid) {
    const msgEl = document.getElementById("modalMsg");
    if (msgEl) msgEl.innerText = v.message;
    const keyEl = document.getElementById("modalFeatureKey");
    if (keyEl) {
      keyEl.classList.add("invalid");
      keyEl.focus();
    }
    btn.disabled = false;
    return;
  }

  try {
    const created = await authFetch(api + "/features", {
      method: "POST",
      body: JSON.stringify({ key, description: desc }),
    });
    if (created.error) {
      const msgEl = document.getElementById("modalMsg");
      if (msgEl) msgEl.innerText = created.error;
      const keyEl = document.getElementById("modalFeatureKey");
      if (keyEl) keyEl.classList.add("invalid");
    } else {
      const envSel = document.getElementById("modalEnvSelect");
      const envId = envSel ? envSel.value : null;
      const initialValue = document.getElementById("modalEnvToggle").checked;
      if (envId) {
        await authFetch(api + `/features/${created.id}/value`, {
          method: "PUT",
          body: JSON.stringify({
            environmentId: Number(envId),
            value: initialValue,
          }),
        });
      }
      document.getElementById("modalMsg").innerText = "Created " + created.key;
      document.getElementById("modal").style.display = "none";
      await loadFeatures();
    }
  } catch (err) {
    document.getElementById("modalMsg").innerText =
      err.message || "Error creating feature";
  } finally {
    btn.disabled = false;
  }
}

/**
 * Load and display features
 */
async function loadFeatures() {
  console.log("loadFeatures");
  const res = await authFetch(api + "/features");
  window._features = res;
  await loadFlags();
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", initFeaturesModule);
