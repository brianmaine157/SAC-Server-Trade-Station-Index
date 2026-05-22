const DUPLICATE_DISTANCE_M = 1000;
const SURFACE_ALTITUDE_M = 5000;
const ORBITAL_ALTITUDE_M = 150000;
const LOCAL_STORAGE_KEY = "se-coordinate-registry";
const LOCAL_STORAGE_VERSION_KEY = "se-coordinate-registry-version";
const LOCAL_STORAGE_VERSION = "2026-05-faction-derived-reset";
const LOCAL_FACTIONS_KEY = "se-npc-factions";
const SAMPLE_GPS = "GPS:Hollis Launchway:9674.61475777626:142623.007626683:-111462.180489533:#FF75C9F1:";

const PLANETS = [
  { name: "EarthLike", x: 0.5, y: 0.5, z: 0.5, radius: 60000, atmosphereHeight: 60000 },
  { name: "Moon", x: 16384.5, y: 136384.5, z: -113615.5, radius: 9500, atmosphereHeight: 0 },
  { name: "Mars", x: 1031072.5, y: 131072.5, z: 1631072.5, radius: 60000, atmosphereHeight: 60000 },
  { name: "Europa", x: 916384.5, y: 16384.5, z: 1616384.5, radius: 9500, atmosphereHeight: 0 },
  { name: "Alien", x: 131072.5, y: 131072.5, z: 5731072.5, radius: 60000, atmosphereHeight: 60000 },
  { name: "Titan", x: 36384.5, y: 226384.5, z: 5796384.5, radius: 9500, atmosphereHeight: 0 },
  { name: "Triton", x: -284463.5, y: -2434463.5, z: 365536.5, radius: 40126.5, atmosphereHeight: 40000 },
  { name: "Pertam", x: -3967231.5, y: -32231.5, z: -767231.5, radius: 30066.5, atmosphereHeight: 30000 }
];

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

const KNOWN_NPC_FACTIONS = {
  SPRT: { name: "Space Pirates", sells: "hostile pirate faction; trade stock depends on server/world settings", category: "Pirate" },
  SPID: { name: "Sabiroids", sells: "not a trading faction", category: "Hostile NPC" },
  FSTC: { name: "First Colonists", sells: "default player faction, not an economy trader", category: "Scenario" },
  ROS: { name: "Results Oriented Sciences", sells: "scenario faction, not a standard economy trader", category: "Scenario" },
  ITW: { name: "Independent Terran Workers", sells: "scenario faction, not a standard economy trader", category: "Scenario" },
  AGI: { name: "Argonaut Industries", sells: "scenario faction, not a standard economy trader", category: "Scenario" }
};

const elements = {
  form: document.querySelector("#coordinateForm"),
  gpsInput: document.querySelector("#gpsInput"),
  notesInput: document.querySelector("#notesInput"),
  submitterInput: document.querySelector("#submitterInput"),
  previewBox: document.querySelector("#previewBox"),
  zoneChipList: document.querySelector("#zoneChipList"),
  factionModal: document.querySelector("#factionModal"),
  factionForm: document.querySelector("#factionForm"),
  factionTitle: document.querySelector("#factionTitle"),
  factionIntro: document.querySelector("#factionIntro"),
  factionProgress: document.querySelector("#factionProgress"),
  factionCancelButton: document.querySelector("#factionCancelButton"),
  factionTagInput: document.querySelector("#factionTagInput"),
  factionNameInput: document.querySelector("#factionNameInput"),
  factionTypeInput: document.querySelector("#factionTypeInput"),
  factionMessage: document.querySelector("#factionMessage"),
  formMessage: document.querySelector("#formMessage"),
  sampleButton: document.querySelector("#sampleButton"),
  storageDot: document.querySelector("#storageDot"),
  storageMode: document.querySelector("#storageMode"),
  storageDetail: document.querySelector("#storageDetail")
};

let coordinates = [];
let supabaseClient = null;
let pendingFactionResolver = null;
let pendingFactionQueue = [];
let activeFactionRequest = null;
let customFactions = {};

function parseGps(rawText) {
  const text = rawText.trim();
  const match = text.match(/^GPS:([^:]+):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(#?[0-9a-fA-F]{8})?:?$/);
  if (!match) throw new Error("Use a Space Engineers GPS string like GPS:Name:X:Y:Z:#AARRGGBB:");
  return { rawText: text, name: match[1].trim(), x: Number(match[2]), y: Number(match[3]), z: Number(match[4]), color: match[5] || "" };
}

function splitGpsInput(rawText) {
  return rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function distance3d(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function classifyLocation(point) {
  const ranked = PLANETS.map((planet) => {
    const centerDistance = distance3d(point, planet);
    return { planet: planet.name, centerDistance, altitude: centerDistance - planet.radius };
  }).sort((a, b) => Math.abs(a.altitude) - Math.abs(b.altitude));
  const nearest = ranked[0];
  let locationType = "deep_space";
  if (Math.abs(nearest.altitude) <= SURFACE_ALTITUDE_M || nearest.altitude < 0) locationType = "surface";
  else if (nearest.altitude <= ORBITAL_ALTITUDE_M) locationType = "orbital";
  return { planet: nearest.planet, locationType, altitude: nearest.altitude, centerDistance: nearest.centerDistance };
}

function normalizeFactionTag(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

function extractFactionTag(name) {
  const patterns = [/\[([A-Za-z0-9]{4})\]/, /\(([A-Za-z0-9]{4})\)/, /\b([A-Za-z0-9]{4})\b/];
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) return normalizeFactionTag(match[1]);
  }
  return "";
}

function inferFactionProfile(tag) {
  const normalizedTag = normalizeFactionTag(tag || "");
  if (KNOWN_NPC_FACTIONS[normalizedTag]) return { tag: normalizedTag, ...KNOWN_NPC_FACTIONS[normalizedTag] };
  if (normalizedTag.length !== 4) return null;
  const prefixName = ECONOMY_FACTION_PREFIXES[normalizedTag.slice(0, 2)];
  const profile = ECONOMY_FACTION_SUFFIXES[normalizedTag.slice(2)];
  if (!profile) return null;
  return { tag: normalizedTag, name: prefixName ? `${prefixName} ${profile.suffixName}` : profile.suffixName, category: profile.category };
}

function readLocalFactions() {
  if (supabaseClient) return customFactions;
  try { return JSON.parse(localStorage.getItem(LOCAL_FACTIONS_KEY) || "{}"); } catch { return {}; }
}

function writeLocalFactions(factions) {
  localStorage.setItem(LOCAL_FACTIONS_KEY, JSON.stringify(factions));
}

function readFaction(tag) {
  const normalizedTag = normalizeFactionTag(tag || "");
  if (!normalizedTag) return null;
  return readLocalFactions()[normalizedTag] || null;
}

async function loadSharedFactions() {
  if (!supabaseClient) {
    customFactions = readLocalFactions();
    return;
  }
  const { data, error } = await supabaseClient
    .from("npc_factions")
    .select("tag,name,category,sells,updated_at");
  if (error) throw new Error(error.message);
  customFactions = Object.fromEntries((data || []).map((faction) => [
    normalizeFactionTag(faction.tag),
    {
      tag: normalizeFactionTag(faction.tag),
      name: faction.name,
      category: faction.category || "Unknown",
      sells: faction.sells || "",
      updated_at: faction.updated_at
    }
  ]));
}

async function writeFaction(faction) {
  const normalizedTag = normalizeFactionTag(faction.tag || "");
  if (!normalizedTag) return null;
  const savedFaction = {
    tag: normalizedTag,
    name: faction.name.trim(),
    category: faction.category,
    sells: faction.sells || "",
    updated_at: new Date().toISOString()
  };
  if (supabaseClient) {
    const { error } = await supabaseClient.rpc("upsert_npc_faction_admin", {
      p_admin_code: ADMIN_PASSWORD,
      p_tag: savedFaction.tag,
      p_name: savedFaction.name,
      p_category: savedFaction.category,
      p_sells: savedFaction.sells
    });
    if (error) throw new Error(error.message);
    customFactions[normalizedTag] = savedFaction;
    return savedFaction;
  }
  const factions = readLocalFactions();
  factions[normalizedTag] = savedFaction;
  writeLocalFactions(factions);
  return factions[normalizedTag];
}

function factionForTag(tag) {
  return readFaction(tag) || inferFactionProfile(tag);
}

function buildRecord(parsed, extra = {}) {
  const classification = classifyLocation(parsed);
  return {
    id: crypto.randomUUID(),
    raw_text: parsed.rawText,
    name: parsed.name,
    x: parsed.x,
    y: parsed.y,
    z: parsed.z,
    color: parsed.color,
    planet: classification.planet,
    location_type: classification.locationType,
    faction_tag: extractFactionTag(parsed.name),
    faction_name: extra.factionName || "",
    altitude_m: classification.altitude,
    center_distance_m: classification.centerDistance,
    has_zone_chips: Boolean(extra.hasZoneChips),
    sells_ships: Boolean(extra.sellsShips),
    sells_h2_gas: Boolean(extra.sellsH2Gas),
    sells_o2_gas: Boolean(extra.sellsO2Gas),
    notes: extra.notes || "",
    submitted_by: extra.submittedBy || "",
    created_at: new Date().toISOString()
  };
}

function readLocalRecords() {
  localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, LOCAL_STORAGE_VERSION);
  try { return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"); } catch { return []; }
}

function writeLocalRecords(records) {
  localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, LOCAL_STORAGE_VERSION);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
}

function shouldUseSharedDatabase() {
  const isLocalHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const forceShared = new URLSearchParams(window.location.search).get("shared") === "1";
  return (!isLocalHost || forceShared) && Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function findDuplicate(record, list) {
  let closest = null;
  for (const existing of list) {
    const distance = distance3d(record, existing);
    if (distance <= DUPLICATE_DISTANCE_M && (!closest || distance < closest.distance)) closest = { record: existing, distance };
  }
  return closest;
}

function configureStorage() {
  if (new URLSearchParams(window.location.search).get("resetLocal") === "1") {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, LOCAL_STORAGE_VERSION);
  }

  if (shouldUseSharedDatabase()) {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    elements.storageDot.classList.add("online");
    elements.storageMode.textContent = "Shared database mode";
    elements.storageDetail.textContent = "Entries are saved to Supabase.";
    return;
  }
  coordinates = readLocalRecords();
  customFactions = readLocalFactions();
  elements.storageMode.textContent = "Local demo mode";
  elements.storageDetail.textContent = "Local testing only. Add ?shared=1 to the URL to use Supabase here.";
}

async function submitRecord(record) {
  if (!supabaseClient) {
    const duplicate = findDuplicate(record, coordinates);
    if (duplicate) return { inserted: false, message: `Already listed near ${duplicate.record.name} (${Math.round(duplicate.distance)} m away).` };
    coordinates = [record, ...coordinates];
    writeLocalRecords(coordinates);
    return { inserted: true, message: `${record.name} added.` };
  }
  const { data, error } = await supabaseClient.rpc("submit_coordinate", {
    p_raw_text: record.raw_text,
    p_name: record.name,
    p_x: record.x,
    p_y: record.y,
    p_z: record.z,
    p_color: record.color,
    p_planet: record.planet,
    p_location_type: record.location_type,
    p_faction_tag: record.faction_tag,
    p_faction_name: record.faction_name || "",
    p_has_zone_chips: record.has_zone_chips,
    p_sells_ships: Boolean(record.sells_ships),
    p_sells_h2_gas: Boolean(record.sells_h2_gas),
    p_sells_o2_gas: Boolean(record.sells_o2_gas),
    p_altitude_m: record.altitude_m,
    p_center_distance_m: record.center_distance_m,
    p_notes: record.notes,
    p_submitted_by: record.submitted_by
  });
  if (error) throw new Error(error.message);
  return data;
}

function promptForFaction(request, index, total) {
  activeFactionRequest = request;
  const normalizedTag = normalizeFactionTag(request.tag);
  const inferred = inferFactionProfile(normalizedTag) || {};

  elements.factionForm.reset();
  elements.factionTagInput.value = normalizedTag;
  elements.factionNameInput.value = inferred.name || "";
  elements.factionTypeInput.value = inferred.category || "Unknown";
  elements.factionTitle.textContent = `Register ${normalizedTag}`;
  elements.factionIntro.textContent = `${request.stationNames.join(", ")} ${request.stationNames.length === 1 ? "uses" : "use"} faction tag ${normalizedTag}. Register it before these stations are added.`;
  elements.factionProgress.textContent = `Faction ${index + 1} of ${total}`;
  elements.factionMessage.textContent = "";
  elements.factionMessage.className = "message";
  elements.factionModal.hidden = false;
  elements.factionNameInput.focus();

  return new Promise((resolve) => {
    pendingFactionResolver = resolve;
  });
}

function closeFactionModal(value = null) {
  elements.factionModal.hidden = true;
  activeFactionRequest = null;
  if (pendingFactionResolver) {
    pendingFactionResolver(value);
    pendingFactionResolver = null;
  }
}

function missingFactionRequests(records) {
  const requests = new Map();
  for (const record of records) {
    const tag = normalizeFactionTag(record.faction_tag || "");
    if (!tag || factionForTag(tag)) continue;
    if (!requests.has(tag)) {
      requests.set(tag, { tag, stationNames: [] });
    }
    requests.get(tag).stationNames.push(record.name);
  }
  return [...requests.values()];
}

async function registerMissingFactions(records) {
  pendingFactionQueue = missingFactionRequests(records);
  for (let index = 0; index < pendingFactionQueue.length; index += 1) {
    const request = pendingFactionQueue[index];
    const saved = await promptForFaction(request, index, pendingFactionQueue.length);
    if (!saved) throw new Error(`Faction ${request.tag} was not registered. No stations were added.`);
  }
  pendingFactionQueue = [];
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function setMessage(message, tone = "") {
  elements.formMessage.className = `message ${tone}`.trim();
  elements.formMessage.textContent = message;
}

function updatePreview() {
  if (!elements.gpsInput.value.trim()) {
    elements.previewBox.textContent = "Paste one or more GPS coordinates to preview detection.";
    elements.zoneChipList.innerHTML = "";
    return;
  }
  try {
    const lines = splitGpsInput(elements.gpsInput.value);
    const record = buildRecord(parseGps(lines[0]));
    const faction = factionForTag(record.faction_tag);
    elements.previewBox.innerHTML = `
      <strong>${escapeHtml(record.name)}</strong><br>
      ${escapeHtml(record.planet)} - ${record.location_type.replace("_", " ")}<br>
      ${record.faction_tag ? `Faction ${escapeHtml(record.faction_tag)}${faction ? ` - ${escapeHtml(faction.name)}` : ""}<br>` : ""}
      ${lines.length > 1 ? `${lines.length} coordinates detected. Notes and submitter apply to all.` : ""}
    `;
    renderZoneChipList(lines);
  } catch (error) {
    elements.previewBox.textContent = error.message;
    elements.zoneChipList.innerHTML = "";
  }
}

function renderZoneChipList(lines) {
  elements.zoneChipList.innerHTML = `
    <div class="station-feature-table">
      <div class="station-feature-row station-feature-head">
        <span>Station</span>
        <span>Zone Chips</span>
        <span>Ships</span>
        <span>H2 Gas</span>
        <span>O2 Gas</span>
      </div>
      ${lines.map((line, index) => {
    try {
      const parsed = parseGps(line);
      return `
        <div class="station-feature-row">
          <strong>${escapeHtml(parsed.name)}</strong>
          <label title="Sells zone chips"><input type="checkbox" data-station-feature="hasZoneChips" data-feature-index="${index}"><span>Zone Chips</span></label>
          <label title="Sells ships"><input type="checkbox" data-station-feature="sellsShips" data-feature-index="${index}"><span>Ships</span></label>
          <label title="Sells hydrogen gas"><input type="checkbox" data-station-feature="sellsH2Gas" data-feature-index="${index}"><span>H2 Gas</span></label>
          <label title="Sells oxygen gas"><input type="checkbox" data-station-feature="sellsO2Gas" data-feature-index="${index}"><span>O2 Gas</span></label>
        </div>
      `;
    } catch {
      return "";
    }
  }).join("")}
    </div>
  `;
}

function stationFeatureSelections() {
  const selections = {};
  for (const input of elements.zoneChipList.querySelectorAll("[data-station-feature]:checked")) {
    const index = Number(input.dataset.featureIndex);
    selections[index] = selections[index] || {};
    selections[index][input.dataset.stationFeature] = true;
  }
  return selections;
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("Checking coordinate(s)...");
  const submittedBy = elements.submitterInput.value.trim();
  if (!submittedBy) {
    setMessage("Submitted by is required before adding trade stations.", "bad");
    elements.submitterInput.focus();
    return;
  }
  const lines = splitGpsInput(elements.gpsInput.value);
  const stationFeatures = stationFeatureSelections();
  const sharedExtra = { notes: elements.notesInput.value.trim(), submittedBy };
  const added = [];
  const skipped = [];
  const pendingRecords = [];

  try {
    await loadSharedFactions();
  } catch (error) {
    setMessage(`Could not load faction list: ${error.message}`, "bad");
    return;
  }

  for (const [index, line] of lines.entries()) {
    try {
      const record = buildRecord(parseGps(line), {
        ...sharedExtra,
        ...stationFeatures[index]
      });
      if (!supabaseClient) {
        const duplicate = findDuplicate(record, coordinates);
        if (duplicate) {
          skipped.push({ line: index + 1, message: `Already listed near ${duplicate.record.name} (${Math.round(duplicate.distance)} m away).` });
          continue;
        }
      }
      pendingRecords.push({ line: index + 1, record });
    } catch (error) {
      skipped.push({ line: index + 1, message: error.message });
    }
  }

  try {
    await registerMissingFactions(pendingRecords.map((item) => item.record));
  } catch (error) {
    setMessage(error.message, "bad");
    return;
  }

  for (const item of pendingRecords) {
    try {
      const faction = factionForTag(item.record.faction_tag);
      if (faction) item.record.faction_name = faction.name;
      const result = await submitRecord(item.record);
      if (result.inserted === false) skipped.push({ line: item.line, message: result.message || "Already listed within 1 km." });
      else added.push(item.record.name);
    } catch (error) {
      skipped.push({ line: item.line, message: error.message });
    }
  }
  if (added.length) {
    elements.form.reset();
    updatePreview();
  }
  const details = skipped.slice(0, 3).map((item) => ` Line ${item.line}: ${item.message}`).join("");
  setMessage(`${added.length} added, ${skipped.length} skipped.${details}`, skipped.length && !added.length ? "bad" : "good");
});

elements.gpsInput.addEventListener("input", updatePreview);
elements.sampleButton.addEventListener("click", () => {
  elements.gpsInput.value = SAMPLE_GPS;
  updatePreview();
  elements.gpsInput.focus();
});

elements.factionForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const tag = normalizeFactionTag(elements.factionTagInput.value);
  const name = elements.factionNameInput.value.trim();
  if (!name) {
    elements.factionMessage.className = "message bad";
    elements.factionMessage.textContent = "Faction name is required.";
    return;
  }
  try {
    const saved = await writeFaction({
      tag: activeFactionRequest?.tag || tag,
      name,
      category: elements.factionTypeInput.value,
      sells: ""
    });
    closeFactionModal(saved);
  } catch (error) {
    elements.factionMessage.className = "message bad";
    elements.factionMessage.textContent = error.message;
  }
});

elements.factionCancelButton?.addEventListener("click", () => closeFactionModal(null));
elements.factionModal?.addEventListener("click", (event) => {
  if (event.target === elements.factionModal) closeFactionModal(null);
});

configureStorage();
