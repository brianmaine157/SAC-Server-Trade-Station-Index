const ADMIN_PASSWORD = "6846";
const LOCAL_STORAGE_KEY = "se-coordinate-registry";
const LOCAL_FACTIONS_KEY = "se-npc-factions";
const DEFAULT_FACTION_TYPES = ["Builder", "Miner", "Trader", "Pirate", "Hostile NPC", "Scenario", "Unknown"];
const DEFAULT_FACTION_TRADES = ["Ores", "Components", "Rovers and ships", "Unknown"];
const OTHER_FACTION_TYPE = "__other__";
const OTHER_FACTION_TRADE = "__other_trade__";

const FACTION_TYPE_COLORS = {
  Builder: { hex: "#49d6b5", dim: "#123d37" },
  Miner: { hex: "#f3c969", dim: "#4b3a13" },
  Trader: { hex: "#7db7ff", dim: "#173453" },
  Pirate: { hex: "#ff7b72", dim: "#4b1718" },
  Scenario: { hex: "#c994ff", dim: "#352047" },
  "Hostile NPC": { hex: "#ff9f43", dim: "#4a2a0c" },
  Unknown: { hex: "#9ba7b4", dim: "#26303a" }
};

const BUILT_IN_FACTIONS = {
  SPRT: { tag: "SPRT", name: "Space Pirates", category: "Pirate", trade: "Unknown", source: "built-in" },
  SPID: { tag: "SPID", name: "Sabiroids", category: "Hostile NPC", trade: "Unknown", source: "built-in" },
  FSTC: { tag: "FSTC", name: "First Colonists", category: "Scenario", trade: "Unknown", source: "built-in" },
  ROS: { tag: "ROS", name: "Results Oriented Sciences", category: "Scenario", trade: "Unknown", source: "built-in" },
  ITW: { tag: "ITW", name: "Independent Terran Workers", category: "Scenario", trade: "Unknown", source: "built-in" },
  AGI: { tag: "AGI", name: "Argonaut Industries", category: "Scenario", trade: "Unknown", source: "built-in" }
};

const ECONOMY_FACTION_PREFIXES = {
  CL: "Clang", DV: "Divine", EN: "Enlightened", FC: "First Class", GC: "Galactic",
  ID: "Independent", IG: "Intergalactic", IM: "Imperial", IS: "Interstellar",
  ME: "Merciless", MT: "Mystic", RL: "Royal", RO: "Rogue", RT: "Righteous",
  RV: "Revolutionary", SA: "Sacred", SC: "Secret", SM: "Supreme", SO: "Sovereign",
  SP: "Specialized", ST: "Star", TF: "The First", UD: "Unyielding", UN: "United",
  UV: "Universal"
};

const ECONOMY_FACTION_SUFFIXES = {
  AT: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Artisans" },
  CG: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Construction Guild" },
  CS: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Constructors" },
  EG: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Engineering" },
  HI: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Heavy Industry" },
  IN: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Industry" },
  IV: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Inventors" },
  MA: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Manufacturers" },
  MK: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Makers" },
  SB: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Shipbuilding" },
  WE: { category: "Builder", sells: "rovers, ships, and components", suffixName: "Welders" },
  DC: { category: "Miner", sells: "ores and raw materials", suffixName: "Drilling Consortium" },
  DR: { category: "Miner", sells: "ores and raw materials", suffixName: "Drillers" },
  EX: { category: "Miner", sells: "ores and raw materials", suffixName: "Excavators" },
  MG: { category: "Miner", sells: "ores and raw materials", suffixName: "Miners Guild" },
  MN: { category: "Miner", sells: "ores and raw materials", suffixName: "Minerals" },
  PR: { category: "Miner", sells: "ores and raw materials", suffixName: "Prospectors" },
  SR: { category: "Miner", sells: "ores and raw materials", suffixName: "Sappers" },
  AL: { category: "Trader", sells: "components and general trade goods", suffixName: "Alliance" },
  CM: { category: "Trader", sells: "components and general trade goods", suffixName: "Conglomerate" },
  CO: { category: "Trader", sells: "components and general trade goods", suffixName: "Commerce" },
  CT: { category: "Trader", sells: "components and general trade goods", suffixName: "Cartel" },
  DE: { category: "Trader", sells: "components and general trade goods", suffixName: "Dealers" },
  DW: { category: "Trader", sells: "components and general trade goods", suffixName: "Dwellers" },
  HS: { category: "Trader", sells: "components and general trade goods", suffixName: "Hauling Services" },
  MC: { category: "Trader", sells: "components and general trade goods", suffixName: "Merchants" },
  SH: { category: "Trader", sells: "components and general trade goods", suffixName: "Shipping" },
  SL: { category: "Trader", sells: "components and general trade goods", suffixName: "Settlers" },
  TC: { category: "Trader", sells: "components and general trade goods", suffixName: "Technologies" },
  TK: { category: "Trader", sells: "components and general trade goods", suffixName: "Traffickers" },
  TR: { category: "Trader", sells: "components and general trade goods", suffixName: "Traders" }
};

const elements = {
  addButton: document.querySelector("#addFactionButton"),
  adminModeButton: document.querySelector("#factionAdminModeButton"),
  exitAdminModeButton: document.querySelector("#factionExitAdminModeButton"),
  searchInput: document.querySelector("#factionSearchInput"),
  typeFilter: document.querySelector("#factionTypeFilter"),
  sourceFilter: document.querySelector("#factionSourceFilter"),
  resetButton: document.querySelector("#resetFactionFiltersButton"),
  count: document.querySelector("#factionCount"),
  discoveredCount: document.querySelector("#discoveredCount"),
  undiscoveredCount: document.querySelector("#undiscoveredCount"),
  discoveredList: document.querySelector("#discoveredFactionList"),
  undiscoveredList: document.querySelector("#undiscoveredFactionList"),
  pageMessage: document.querySelector("#factionPageMessage"),
  modal: document.querySelector("#adminFactionModal"),
  form: document.querySelector("#adminFactionForm"),
  title: document.querySelector("#adminFactionTitle"),
  cancelButton: document.querySelector("#adminFactionCancelButton"),
  passwordLabel: document.querySelector("#adminFactionPasswordLabel"),
  passwordInput: document.querySelector("#adminFactionPasswordInput"),
  fields: document.querySelector("#adminFactionFields"),
  tagInput: document.querySelector("#adminFactionTagInput"),
  nameInput: document.querySelector("#adminFactionNameInput"),
  typeInput: document.querySelector("#adminFactionTypeInput"),
  customTypeField: document.querySelector("#customFactionTypeField"),
  customTypeInput: document.querySelector("#customFactionTypeInput"),
  tradeInput: document.querySelector("#adminFactionTradeInput"),
  customTradeField: document.querySelector("#customFactionTradeField"),
  customTradeInput: document.querySelector("#customFactionTradeInput"),
  message: document.querySelector("#adminFactionMessage"),
  confirmButton: document.querySelector("#adminFactionConfirmButton")
};

let pendingAction = null;
let adminAuthenticated = false;
let supabaseClient = null;
let stationRecords = [];
let customFactionRecords = {};

function normalizeFactionTag(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readCustomFactions() {
  if (supabaseClient) return customFactionRecords;
  try {
    return JSON.parse(localStorage.getItem(LOCAL_FACTIONS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCustomFactions(factions) {
  customFactionRecords = factions;
  if (supabaseClient) return;
  localStorage.setItem(LOCAL_FACTIONS_KEY, JSON.stringify(factions));
}

function customFactionTypes() {
  const defaults = new Set(DEFAULT_FACTION_TYPES);
  return [...new Set(
    Object.values(readCustomFactions())
      .map((faction) => String(faction.category || "").trim())
      .filter((category) => category && !defaults.has(category))
  )].sort((a, b) => a.localeCompare(b));
}

function allFactionTypes() {
  return [...DEFAULT_FACTION_TYPES, ...customFactionTypes()];
}

function customFactionTrades() {
  const defaults = new Set(DEFAULT_FACTION_TRADES);
  return [...new Set(
    Object.values(readCustomFactions())
      .map((faction) => normalizeTradeValue(faction.trade || faction.sells || ""))
      .filter((trade) => trade && !defaults.has(trade))
  )].sort((a, b) => a.localeCompare(b));
}

function allFactionTrades() {
  return [...DEFAULT_FACTION_TRADES, ...customFactionTrades()];
}

function renderTypeOptions(selected = "Unknown") {
  const types = allFactionTypes();
  const selectedType = selected && types.includes(selected) ? selected : "Unknown";
  elements.typeFilter.innerHTML = [
    `<option value="all">All specialties</option>`,
    ...types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`)
  ].join("");

  elements.typeInput.innerHTML = [
    ...types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`),
    `<option value="${OTHER_FACTION_TYPE}">Other - Specify</option>`
  ].join("");
  elements.typeInput.value = selectedType;
  elements.customTypeField.hidden = true;
  elements.customTypeInput.required = false;
  elements.customTypeInput.value = "";
}

function selectedFactionType() {
  if (elements.typeInput.value !== OTHER_FACTION_TYPE) return elements.typeInput.value;
  const customType = elements.customTypeInput.value.trim();
  if (!customType) throw new Error("Custom faction type is required.");
  return customType;
}

function renderTradeOptions(selected = "Unknown") {
  const trades = allFactionTrades();
  const normalizedSelected = normalizeTradeValue(selected);
  const selectedTrade = normalizedSelected && trades.includes(normalizedSelected) ? normalizedSelected : "Unknown";
  elements.tradeInput.innerHTML = [
    ...trades.map((trade) => `<option value="${escapeHtml(trade)}">${escapeHtml(trade)}</option>`),
    `<option value="${OTHER_FACTION_TRADE}">Other - Specify</option>`
  ].join("");
  elements.tradeInput.value = selectedTrade;
  elements.customTradeField.hidden = true;
  elements.customTradeInput.required = false;
  elements.customTradeInput.value = "";
}

function selectedFactionTrade() {
  if (elements.tradeInput.value !== OTHER_FACTION_TRADE) return elements.tradeInput.value;
  const customTrade = normalizeTradeValue(elements.customTradeInput.value);
  if (!customTrade) throw new Error("Custom trade is required.");
  return customTrade;
}

function readLocalStations() {
  if (supabaseClient) return stationRecords;
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function discoveredFactionTags() {
  const tags = new Set();
  for (const station of readLocalStations()) {
    const tag = normalizeFactionTag(station.faction_tag || "");
    if (tag) tags.add(tag);
  }
  return tags;
}

function allFactions() {
  const custom = readCustomFactions();
  const merged = { ...BUILT_IN_FACTIONS, ...generatedEconomyFactions() };
  for (const faction of Object.values(custom)) {
    const tag = normalizeFactionTag(faction.tag || "");
    if (!tag) continue;
    merged[tag] = { ...(merged[tag] || {}), ...faction, tag, source: "custom" };
  }
  return Object.values(merged).sort((a, b) => a.tag.localeCompare(b.tag));
}

function generatedEconomyFactions() {
  const factions = {};
  for (const [prefixTag, prefixName] of Object.entries(ECONOMY_FACTION_PREFIXES)) {
    for (const [suffixTag, suffix] of Object.entries(ECONOMY_FACTION_SUFFIXES)) {
      const tag = `${prefixTag}${suffixTag}`;
      factions[tag] = {
        tag,
        name: `${prefixName} ${suffix.suffixName}`,
        category: suffix.category,
        trade: factionDefaultTradeItem(suffix.category),
        source: "built-in"
      };
    }
  }
  return factions;
}

function filteredFactions() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const type = elements.typeFilter.value;
  const source = elements.sourceFilter.value;
  const discoveredTags = discoveredFactionTags();
  return allFactions().filter((faction) => {
    const matchesType = type === "all" || faction.category === type;
    const discovered = discoveredTags.has(faction.tag);
    const matchesSource = source === "all" ||
      (source === "custom" ? discovered : !discovered);
    const haystack = [faction.tag, faction.name, faction.category, factionTradeSummary(faction), discovered ? "discovered" : "undiscovered"].join(" ").toLowerCase();
    return matchesType && matchesSource && haystack.includes(query);
  });
}

function colorForFaction(faction) {
  return FACTION_TYPE_COLORS[faction.category] || FACTION_TYPE_COLORS.Unknown;
}

function factionGoodsSummary(category) {
  return tradeLabel(factionDefaultTradeItem(category));
}

function factionTradeSummary(faction) {
  return tradeLabel(faction.trade || faction.sells || factionDefaultTradeItem(faction.category));
}

function factionDefaultTradeItem(category) {
  return {
    Miner: "Ores",
    Trader: "Components",
    Builder: "Rovers and ships"
  }[category] || "Unknown";
}

function normalizeTradeValue(value) {
  const trade = String(value || "").trim();
  if (!trade) return "";
  const lower = trade.toLowerCase();
  if (lower === "unknown") return "Unknown";
  if (lower === "buys and sells ores") return "Ores";
  if (lower === "buys and sells components") return "Components";
  if (lower === "sells rovers and ships; buys components") return "Rovers and ships";
  return trade
    .replace(/^buys\s+and\s+sells\s+/i, "")
    .replace(/^buy'?s\s+and\s+sells\s+/i, "")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function tradeLabel(value) {
  const trade = normalizeTradeValue(value);
  if (!trade || trade === "Unknown") return "Unknown";
  return `Buys and sells ${trade}`;
}

function render() {
  const currentType = elements.typeFilter.value || "all";
  renderTypeOptions(elements.typeInput.value || "Unknown");
  renderTradeOptions(elements.tradeInput.value || "Unknown");
  elements.typeFilter.value = [...allFactionTypes(), "all"].includes(currentType) ? currentType : "all";
  const factions = filteredFactions();
  const discoveredTags = discoveredFactionTags();
  const discovered = factions.filter((faction) => discoveredTags.has(faction.tag));
  const undiscovered = factions.filter((faction) => !discoveredTags.has(faction.tag));
  elements.count.textContent = factions.length;
  elements.discoveredCount.textContent = `${discovered.length} listed`;
  elements.undiscoveredCount.textContent = `${undiscovered.length} possible`;
  elements.discoveredList.innerHTML = discovered.length
    ? discovered.map(renderFactionCard).join("")
    : `<div class="empty">No discovered factions match this view.</div>`;
  elements.undiscoveredList.innerHTML = undiscovered.length
    ? undiscovered.map(renderFactionCard).join("")
    : `<div class="empty">No undiscovered factions match this view.</div>`;
}

function renderAdminModeControls() {
  elements.adminModeButton.hidden = adminAuthenticated;
  elements.exitAdminModeButton.hidden = !adminAuthenticated;
  elements.addButton.disabled = !adminAuthenticated;
  elements.addButton.title = adminAuthenticated ? "" : "Enter admin mode to add factions";
}

function renderFactionCard(faction) {
  const color = colorForFaction(faction);
  const discovered = discoveredFactionTags().has(faction.tag);
  return `
    <article class="coordinate-card faction-card" ${discovered ? `data-filter-faction="${escapeHtml(faction.tag)}" tabindex="0" role="button" aria-label="Show trade stations for ${escapeHtml(faction.tag)}"` : ""}>
      <div>
        <h3>${escapeHtml(faction.tag)} - ${escapeHtml(faction.name)}</h3>
        <div class="meta">
          <span class="pill faction-pill" style="--faction-color: ${color.hex}; --faction-bg: ${color.dim};">${escapeHtml(faction.category)}</span>
          <span class="pill">${discovered ? "Discovered" : "Undiscovered"}</span>
          <span class="pill">${escapeHtml(factionTradeSummary(faction))}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-action-link" type="button" data-edit-tag="${escapeHtml(faction.tag)}" ${adminAuthenticated ? "" : `disabled title="Enter admin mode to edit"`}>Edit</button>
        ${faction.source === "custom" ? `<button class="card-action-link danger-button" type="button" data-delete-tag="${escapeHtml(faction.tag)}" ${adminAuthenticated ? "" : `disabled title="Enter admin mode to delete"`}>Delete</button>` : ""}
      </div>
    </article>
  `;
}

function openModal(action, faction = null) {
  if (["add", "edit", "delete"].includes(action) && !adminAuthenticated) {
    elements.pageMessage.className = "message bad";
    elements.pageMessage.textContent = "Enter admin mode before changing factions.";
    return;
  }
  pendingAction = { action, faction };
  elements.form.reset();
  elements.message.textContent = "";
  elements.message.className = "message";
  elements.title.textContent = action === "admin" ? "Admin Mode" : action === "delete" ? `Delete ${faction.tag}` : action === "edit" ? `Edit ${faction.tag}` : "Add Faction";
  elements.confirmButton.textContent = action === "admin" ? "Enter Admin Mode" : action === "delete" ? "Delete Faction" : "Save Faction";
  elements.confirmButton.classList.toggle("danger-button", action === "delete");
  elements.fields.hidden = action === "delete" || action === "admin";
  elements.fields.querySelectorAll("input, select").forEach((field) => {
    field.disabled = action === "delete" || action === "admin";
  });
  setPasswordPromptVisible(action === "admin");
  renderTypeOptions(faction?.category || "Unknown");
  renderTradeOptions(faction ? factionTradeSummary(faction) : "Unknown");
  if (faction) {
    elements.tagInput.value = faction.tag;
    elements.nameInput.value = faction.name;
  }
  if (action === "delete") {
    elements.message.className = "message bad";
    elements.message.textContent = `Are you sure you want to delete ${faction.tag}? This cannot be undone.`;
  }
  elements.modal.hidden = false;
  if (action === "admin") elements.passwordInput.focus();
  else elements.confirmButton.focus();
}

function closeModal() {
  pendingAction = null;
  elements.fields.hidden = false;
  elements.fields.querySelectorAll("input, select").forEach((field) => {
    field.disabled = false;
  });
  setPasswordPromptVisible(true);
  elements.customTypeField.hidden = true;
  elements.customTypeInput.required = false;
  elements.customTradeField.hidden = true;
  elements.customTradeInput.required = false;
  elements.modal.hidden = true;
}

function setPasswordPromptVisible(visible) {
  elements.passwordLabel.hidden = !visible;
  elements.passwordLabel.style.display = visible ? "" : "none";
  elements.passwordInput.required = visible;
  if (!visible) elements.passwordInput.value = "";
}

function keepModalInputOpen(event) {
  if (event.key !== "Enter") return;
  const target = event.target;
  if (target?.tagName === "TEXTAREA") return;
  if (target?.closest("button")) return;
  event.preventDefault();
}

function saveFaction() {
  const tag = normalizeFactionTag(elements.tagInput.value);
  const name = elements.nameInput.value.trim();
  if (tag.length !== 4) throw new Error("Faction tag must be 4 letters or numbers.");
  if (!name) throw new Error("Faction name is required.");
  const factions = readCustomFactions();
  factions[tag] = {
    tag,
    name,
    category: selectedFactionType(),
    trade: selectedFactionTrade(),
    updated_at: new Date().toISOString()
  };
  writeCustomFactions(factions);
  elements.pageMessage.className = "message good";
  elements.pageMessage.textContent = `${tag} saved.`;
}

function deleteFaction(tag) {
  const factions = readCustomFactions();
  delete factions[tag];
  writeCustomFactions(factions);
  elements.pageMessage.className = "message good";
  elements.pageMessage.textContent = `${tag} removed from the custom faction list.`;
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function configureStorage() {
  if (!hasSupabaseConfig()) {
    stationRecords = readLocalStations();
    customFactionRecords = readCustomFactions();
    return;
  }
  supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

async function loadData() {
  if (!supabaseClient) {
    stationRecords = readLocalStations();
    customFactionRecords = readCustomFactions();
    render();
    return;
  }

  elements.pageMessage.className = "message";
  elements.pageMessage.textContent = "Loading shared faction data...";

  const [{ data: coordinates, error: coordinateError }, { data: factions, error: factionError }] = await Promise.all([
    supabaseClient
      .from("coordinates")
      .select("faction_tag")
      .order("created_at", { ascending: false }),
    supabaseClient
      .from("npc_factions")
      .select("tag,name,category,sells,updated_at")
      .order("tag", { ascending: true })
  ]);

  if (coordinateError) throw new Error(coordinateError.message);
  if (factionError) throw new Error(factionError.message);

  stationRecords = coordinates || [];
  customFactionRecords = Object.fromEntries((factions || []).map((faction) => [
    normalizeFactionTag(faction.tag),
    {
      tag: normalizeFactionTag(faction.tag),
      name: faction.name,
      category: faction.category || "Unknown",
      trade: faction.sells || "",
      updated_at: faction.updated_at
    }
  ]));

  elements.pageMessage.className = "message good";
  elements.pageMessage.textContent = "Shared faction data loaded.";
  render();
}

async function saveFactionToStorage() {
  const tag = normalizeFactionTag(elements.tagInput.value);
  const name = elements.nameInput.value.trim();
  if (tag.length !== 4) throw new Error("Faction tag must be 4 letters or numbers.");
  if (!name) throw new Error("Faction name is required.");
  const faction = {
    tag,
    name,
    category: selectedFactionType(),
    trade: selectedFactionTrade(),
    updated_at: new Date().toISOString()
  };

  if (supabaseClient) {
    const { error } = await supabaseClient.rpc("upsert_npc_faction_admin", {
      p_admin_code: ADMIN_PASSWORD,
      p_tag: faction.tag,
      p_name: faction.name,
      p_category: faction.category,
      p_sells: faction.trade
    });
    if (error) throw new Error(error.message);
  }

  const factions = readCustomFactions();
  factions[tag] = faction;
  writeCustomFactions(factions);
  elements.pageMessage.className = "message good";
  elements.pageMessage.textContent = `${tag} saved.`;
}

async function deleteFactionFromStorage(tag) {
  if (supabaseClient) {
    const { error } = await supabaseClient.rpc("delete_npc_faction_admin", {
      p_admin_code: ADMIN_PASSWORD,
      p_tag: tag
    });
    if (error) throw new Error(error.message);
  }
  deleteFaction(tag);
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingAction) return;
  if (pendingAction.action === "admin" && elements.passwordInput.value !== ADMIN_PASSWORD) {
    elements.message.className = "message bad";
    elements.message.textContent = "Wrong password.";
    return;
  }
  if (pendingAction.action === "admin") {
    adminAuthenticated = true;
    renderAdminModeControls();
    closeModal();
    elements.pageMessage.className = "message good";
    elements.pageMessage.textContent = "Admin mode enabled.";
    render();
    return;
  }
  try {
    if (pendingAction.action === "delete") await deleteFactionFromStorage(pendingAction.faction.tag);
    else await saveFactionToStorage();
    closeModal();
    await loadData();
  } catch (error) {
    elements.message.className = "message bad";
    elements.message.textContent = error.message;
  }
});

elements.addButton.addEventListener("click", () => openModal("add"));
elements.adminModeButton.addEventListener("click", () => openModal("admin"));
elements.exitAdminModeButton.addEventListener("click", () => {
  adminAuthenticated = false;
  renderAdminModeControls();
  elements.pageMessage.className = "message";
  elements.pageMessage.textContent = "Admin mode exited.";
  render();
});
elements.cancelButton.addEventListener("click", closeModal);
elements.form.addEventListener("click", (event) => event.stopPropagation());
elements.form.addEventListener("pointerdown", (event) => event.stopPropagation());
elements.form.addEventListener("keydown", keepModalInputOpen);
elements.modal.addEventListener("click", (event) => {
  if (event.target === elements.modal) closeModal();
});
elements.searchInput.addEventListener("input", render);
elements.typeFilter.addEventListener("change", render);
elements.sourceFilter.addEventListener("change", render);
elements.typeInput.addEventListener("change", () => {
  const isOther = elements.typeInput.value === OTHER_FACTION_TYPE;
  elements.customTypeField.hidden = !isOther;
  elements.customTypeInput.required = isOther;
  if (isOther) elements.customTypeInput.focus();
  else elements.customTypeInput.value = "";
});
elements.tradeInput.addEventListener("change", () => {
  const isOther = elements.tradeInput.value === OTHER_FACTION_TRADE;
  elements.customTradeField.hidden = !isOther;
  elements.customTradeInput.required = isOther;
  if (isOther) elements.customTradeInput.focus();
  else elements.customTradeInput.value = "";
});
elements.resetButton.addEventListener("click", () => {
  elements.searchInput.value = "";
  elements.typeFilter.value = "all";
  elements.sourceFilter.value = "all";
  window.history.replaceState({}, "", window.location.pathname);
  render();
});
document.querySelector(".faction-columns").addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-tag]");
  if (editButton) {
    const faction = allFactions().find((item) => item.tag === editButton.dataset.editTag);
    if (faction) openModal("edit", faction);
    return;
  }
  const deleteButton = event.target.closest("[data-delete-tag]");
  if (deleteButton) {
    const faction = allFactions().find((item) => item.tag === deleteButton.dataset.deleteTag);
    if (faction) openModal("delete", faction);
    return;
  }

  const factionCard = event.target.closest("[data-filter-faction]");
  if (factionCard && !event.target.closest("button")) {
    window.location.href = `index.html?faction=${encodeURIComponent(factionCard.dataset.filterFaction)}`;
  }
});
document.querySelector(".faction-columns").addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const factionCard = event.target.closest("[data-filter-faction]");
  if (!factionCard) return;
  event.preventDefault();
  window.location.href = `index.html?faction=${encodeURIComponent(factionCard.dataset.filterFaction)}`;
});

function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const faction = normalizeFactionTag(params.get("faction") || "");
  if (!faction) return;
  elements.searchInput.value = faction;
  elements.sourceFilter.value = "all";
}

configureStorage();
applyUrlFilters();
renderAdminModeControls();
loadData().catch((error) => {
  elements.pageMessage.className = "message bad";
  elements.pageMessage.textContent = `Shared faction load failed: ${error.message}`;
  supabaseClient = null;
  stationRecords = readLocalStations();
  customFactionRecords = readCustomFactions();
  render();
});
