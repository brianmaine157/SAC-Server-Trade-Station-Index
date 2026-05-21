const DUPLICATE_DISTANCE_M = 1000;
const ADMIN_PASSWORD = "6846";
const SURFACE_ALTITUDE_M = 5000;
const ORBITAL_ALTITUDE_M = 150000;
const LOCAL_STORAGE_KEY = "se-coordinate-registry";
const LOCAL_STORAGE_VERSION_KEY = "se-coordinate-registry-version";
const LOCAL_STORAGE_VERSION = "2026-05-faction-derived-reset";
const LOCAL_FACTIONS_KEY = "se-npc-factions";
const LOCAL_COMMENTS_KEY = "se-station-comments";
const SAMPLE_GPS = "GPS:Hollis Launchway:9674.61475777626:142623.007626683:-111462.180489533:#FF75C9F1:";
const MAP_SCALE = 1 / 25000;
const GRAVITY_FIELD_RADIUS_MULTIPLIER = 1.7182;

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

const PLANET_COLORS = {
  EarthLike: 0x3f8ed8,
  Moon: 0xaeb4bd,
  Mars: 0xc66c42,
  Europa: 0xd8e4ee,
  Alien: 0x9cc05c,
  Titan: 0xd2a15d,
  Triton: 0x8cc6d9,
  Pertam: 0xd7a96b
};

const FACTION_TYPE_COLORS = {
  Builder: { hex: "#49d6b5", numeric: 0x49d6b5, dim: "#123d37" },
  Miner: { hex: "#f3c969", numeric: 0xf3c969, dim: "#4b3a13" },
  Trader: { hex: "#7db7ff", numeric: 0x7db7ff, dim: "#173453" },
  Pirate: { hex: "#ff7b72", numeric: 0xff7b72, dim: "#4b1718" },
  Scenario: { hex: "#c994ff", numeric: 0xc994ff, dim: "#352047" },
  "Hostile NPC": { hex: "#ff9f43", numeric: 0xff9f43, dim: "#4a2a0c" },
  Unknown: { hex: "#9ba7b4", numeric: 0x9ba7b4, dim: "#26303a" }
};

const ECONOMY_FACTION_PREFIXES = {
  CL: "Clang",
  DV: "Divine",
  EN: "Enlightened",
  FC: "First Class",
  GC: "Galactic",
  ID: "Independent",
  IG: "Intergalactic",
  IM: "Imperial",
  IS: "Interstellar",
  ME: "Merciless",
  MT: "Mystic",
  RL: "Royal",
  RO: "Rogue",
  RT: "Righteous",
  RV: "Revolutionary",
  SA: "Sacred",
  SC: "Secret",
  SM: "Supreme",
  SO: "Sovereign",
  SP: "Specialized",
  ST: "Star",
  TF: "The First",
  UD: "Unyielding",
  UN: "United",
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
  formMessage: document.querySelector("#formMessage"),
  sampleButton: document.querySelector("#sampleButton"),
  searchInput: document.querySelector("#searchInput"),
  planetFilter: document.querySelector("#planetFilter"),
  typeFilter: document.querySelector("#typeFilter"),
  tradeFilter: document.querySelector("#tradeFilter"),
  resultsList: document.querySelector("#resultsList"),
  totalCount: document.querySelector("#totalCount"),
  surfaceCount: document.querySelector("#surfaceCount"),
  orbitalCount: document.querySelector("#orbitalCount"),
  deepSpaceCount: document.querySelector("#deepSpaceCount"),
  refreshButton: document.querySelector("#refreshButton"),
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  copyAllButton: document.querySelector("#copyAllButton"),
  adminModeButton: document.querySelector("#adminModeButton"),
  exitAdminModeButton: document.querySelector("#exitAdminModeButton"),
  resetMapButton: document.querySelector("#resetMapButton"),
  mapViewport: document.querySelector("#mapViewport"),
  mapFallback: document.querySelector("#mapFallback"),
  mapList: document.querySelector("#mapList"),
  adminModal: document.querySelector("#adminModal"),
  adminForm: document.querySelector("#adminForm"),
  adminTitle: document.querySelector("#adminTitle"),
  adminCancelButton: document.querySelector("#adminCancelButton"),
  adminPasswordLabel: document.querySelector("#adminPasswordLabel"),
  adminPasswordInput: document.querySelector("#adminPasswordInput"),
  adminEditFields: document.querySelector("#adminEditFields"),
  adminNameInput: document.querySelector("#adminNameInput"),
  adminFactionInput: document.querySelector("#adminFactionInput"),
  adminFactionNameInput: document.querySelector("#adminFactionNameInput"),
  adminZoneChipInput: document.querySelector("#adminZoneChipInput"),
  adminSellsShipsInput: document.querySelector("#adminSellsShipsInput"),
  adminSellsH2Input: document.querySelector("#adminSellsH2Input"),
  adminSellsO2Input: document.querySelector("#adminSellsO2Input"),
  adminPlanetInput: document.querySelector("#adminPlanetInput"),
  adminLocationInput: document.querySelector("#adminLocationInput"),
  adminNotesInput: document.querySelector("#adminNotesInput"),
  adminSubmitterInput: document.querySelector("#adminSubmitterInput"),
  adminMessage: document.querySelector("#adminMessage"),
  adminConfirmButton: document.querySelector("#adminConfirmButton"),
  commentModal: document.querySelector("#commentModal"),
  commentForm: document.querySelector("#commentForm"),
  commentTitle: document.querySelector("#commentTitle"),
  commentCloseButton: document.querySelector("#commentCloseButton"),
  commentThread: document.querySelector("#commentThread"),
  commentAuthorInput: document.querySelector("#commentAuthorInput"),
  commentTextInput: document.querySelector("#commentTextInput"),
  commentMessage: document.querySelector("#commentMessage"),
  storageDot: document.querySelector("#storageDot"),
  storageMode: document.querySelector("#storageMode"),
  storageDetail: document.querySelector("#storageDetail")
};

let coordinates = [];
let supabaseClient = null;
let mapState = null;
let pendingAdminAction = null;
let activeCommentRecord = null;
let adminAuthenticated = false;

function parseGps(rawText) {
  const text = rawText.trim();
  const match = text.match(/^GPS:([^:]+):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(#?[0-9a-fA-F]{8})?:?$/);

  if (!match) {
    throw new Error("Use a Space Engineers GPS string like GPS:Name:X:Y:Z:#AARRGGBB:");
  }

  return {
    rawText: text,
    name: match[1].trim(),
    x: Number(match[2]),
    y: Number(match[3]),
    z: Number(match[4]),
    color: match[5] || ""
  };
}

function splitGpsInput(rawText) {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function distance3d(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function classifyLocation(point) {
  const ranked = PLANETS
    .map((planet) => {
      const centerDistance = distance3d(point, planet);
      return {
        planet: planet.name,
        centerDistance,
        altitude: centerDistance - planet.radius
      };
    })
    .sort((a, b) => Math.abs(a.altitude) - Math.abs(b.altitude));

  const nearest = ranked[0];
  const altitude = nearest.altitude;
  let locationType = "deep_space";

  if (Math.abs(altitude) <= SURFACE_ALTITUDE_M || altitude < 0) {
    locationType = "surface";
  } else if (altitude <= ORBITAL_ALTITUDE_M) {
    locationType = "orbital";
  }

  return {
    planet: nearest.planet,
    locationType,
    altitude,
    centerDistance: nearest.centerDistance
  };
}

function formatMeters(value) {
  const absolute = Math.abs(value);
  if (absolute >= 1000) return `${(value / 1000).toFixed(2)} km`;
  return `${Math.round(value)} m`;
}

function formatDistance(value) {
  const absolute = Math.abs(value);
  if (absolute >= 1000000) return `${(value / 1000000).toFixed(2)} Mm`;
  if (absolute >= 1000) return `${(value / 1000).toFixed(1)} km`;
  return `${Math.round(value)} m`;
}

function typeLabel(type) {
  return {
    surface: "Surface",
    orbital: "Orbital",
    deep_space: "Deep space"
  }[type] || type;
}

function normalizeFactionTag(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

function extractFactionTag(name) {
  const patterns = [
    /\[([A-Za-z0-9]{4})\]/,
    /\(([A-Za-z0-9]{4})\)/,
    /\b([A-Za-z0-9]{4})\b/
  ];

  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) return normalizeFactionTag(match[1]);
  }

  return "";
}

function inferFactionProfile(tag) {
  const normalizedTag = normalizeFactionTag(tag || "");
  if (KNOWN_NPC_FACTIONS[normalizedTag]) {
    const knownFaction = KNOWN_NPC_FACTIONS[normalizedTag];
    return {
      tag: normalizedTag,
      ...knownFaction,
      firstName: knownFaction.name,
      secondName: "",
      tradePurposes: tradePurposesForCategory(knownFaction.category),
      inferred: true
    };
  }

  if (normalizedTag.length !== 4) return null;

  const prefix = normalizedTag.slice(0, 2);
  const suffix = normalizedTag.slice(2);
  const prefixName = ECONOMY_FACTION_PREFIXES[prefix];
  const profile = ECONOMY_FACTION_SUFFIXES[suffix];

  if (!profile) return null;

  return {
    tag: normalizedTag,
    name: prefixName ? `${prefixName} ${profile.suffixName}` : `${profile.category} faction (${profile.suffixName})`,
    firstName: prefixName || "Unknown",
    secondName: profile.suffixName,
    category: profile.category,
    tradePurposes: tradePurposesForCategory(profile.category),
    inferred: true
  };
}

function resolveFaction(tag) {
  const normalizedTag = normalizeFactionTag(tag || "");
  if (!normalizedTag) return null;
  const customFaction = readLocalFactions()[normalizedTag];
  if (customFaction) {
    return {
      ...customFaction,
      tradePurposes: tradePurposesForCategory(customFaction.category)
    };
  }
  return inferFactionProfile(normalizedTag);
}

function factionNameForRecord(record, faction) {
  return record.faction_name?.trim() || faction?.name || "";
}

function readLocalFactions() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_FACTIONS_KEY) || "{}");
  } catch {
    return {};
  }
}

function readLocalComments() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_COMMENTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocalComments(comments) {
  localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(comments));
}

function tradePurposesForCategory(category) {
  return {
    Builder: ["ships"],
    Miner: ["ore"],
    Trader: ["components"],
    Pirate: ["weapons"]
  }[category] || ["unknown"];
}

function factionGoodsSummary(category) {
  return tradeLabel(factionDefaultTradeItem(category));
}

function factionDefaultTradeItem(category) {
  return {
    Miner: "Ores",
    Trader: "Components",
    Builder: "Rovers and ships"
  }[category] || "";
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

function factionTradeSummary(faction) {
  return tradeLabel(faction?.trade || faction?.sells || factionDefaultTradeItem(faction?.category));
}

function planetColorHex(planetName) {
  const numeric = PLANET_COLORS[planetName] || 0x9ba7b4;
  return `#${numeric.toString(16).padStart(6, "0")}`;
}

function renderLocationLine(record) {
  if (record.location_type === "deep_space") {
    return `
      <span class="location-line deep-space-location">
        <span class="location-icon deep-space-icon" aria-hidden="true"></span>
        <span>Deep space</span>
      </span>
    `;
  }

  return `
    <span class="location-line">
      <span class="location-icon planet-icon" style="--planet-color: ${planetColorHex(record.planet)};" aria-hidden="true"></span>
      <span>${escapeHtml(record.planet)} / <span class="location-type-inline"><span class="location-icon ${record.location_type === "surface" ? "surface-icon" : "orbital-icon"}" title="${typeLabel(record.location_type)} station" aria-hidden="true"></span>${typeLabel(record.location_type)}</span> / ${formatMeters(record.altitude_m)} altitude</span>
    </span>
  `;
}

function renderLocationRows(record) {
  if (record.location_type === "deep_space") {
    return `
      <div><dt>Location</dt><dd>${renderLocationLine(record)}</dd></div>
    `;
  }

  return `
    <div><dt>Planet</dt><dd><span class="location-line"><span class="location-icon planet-icon" style="--planet-color: ${planetColorHex(record.planet)};" aria-hidden="true"></span><span>${escapeHtml(record.planet)}</span></span></dd></div>
    <div><dt>Location</dt><dd><span class="location-line"><span class="location-type-inline"><span class="location-icon ${record.location_type === "surface" ? "surface-icon" : "orbital-icon"}" title="${typeLabel(record.location_type)} station" aria-hidden="true"></span>${typeLabel(record.location_type)}</span> / ${formatMeters(record.altitude_m)} altitude</span></dd></div>
  `;
}

function economyIconClass(category) {
  return {
    Miner: "economy-miner-icon",
    Trader: "economy-trader-icon",
    Builder: "economy-builder-icon"
  }[category] || "economy-generic-icon";
}

function renderEconomyLine(faction, economySummary) {
  return `
    <span class="economy-line">
      <span class="economy-icon ${economyIconClass(faction?.category)}" aria-hidden="true"></span>
      <span>${escapeHtml(economySummary || "Server-specific")}</span>
    </span>
  `;
}

function factionColor(faction) {
  return FACTION_TYPE_COLORS[faction?.category || "Unknown"] || FACTION_TYPE_COLORS.Unknown;
}

function copyColorForRecord(record) {
  const faction = resolveFaction(record?.faction_tag);
  const hex = factionColor(faction).hex.replace("#", "").toUpperCase();
  return `#FF${hex}`;
}

function gpsWithColor(record, color = copyColorForRecord(record)) {
  try {
    const parsed = parseGps(record.raw_text);
    return `GPS:${parsed.name}:${formatGpsNumber(parsed.x)}:${formatGpsNumber(parsed.y)}:${formatGpsNumber(parsed.z)}:${normalizeGpsColor(color)}:`;
  } catch {
    return `GPS:${record.name}:${formatGpsNumber(record.x)}:${formatGpsNumber(record.y)}:${formatGpsNumber(record.z)}:${normalizeGpsColor(color)}:`;
  }
}

function stationCopyGps(record) {
  return gpsWithColor(record, copyColorForRecord(record));
}

function buildRecord(parsed, extra = {}) {
  const classification = classifyLocation(parsed);
  const factionTag = extractFactionTag(parsed.name);
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
    faction_tag: factionTag,
    faction_name: extra.factionName || "",
    has_zone_chips: Boolean(extra.hasZoneChips),
    sells_ships: Boolean(extra.sellsShips),
    sells_h2_gas: Boolean(extra.sellsH2Gas),
    sells_o2_gas: Boolean(extra.sellsO2Gas),
    altitude_m: classification.altitude,
    center_distance_m: classification.centerDistance,
    notes: extra.notes || "",
    submitted_by: extra.submittedBy || "",
    created_at: new Date().toISOString()
  };
}

function formatGpsNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

function normalizeGpsColor(value) {
  const color = String(value || "").trim();
  const withHash = color.startsWith("#") ? color : `#${color}`;
  return /^#[0-9a-fA-F]{8}$/.test(withHash) ? withHash.toUpperCase() : "#FF9BA7B4";
}

function gpsCoreChanged(record, values) {
  return record.name !== values.name ||
    Number(record.x) !== Number(values.x) ||
    Number(record.y) !== Number(values.y) ||
    Number(record.z) !== Number(values.z) ||
    normalizeGpsColor(record.color) !== normalizeGpsColor(values.color);
}

function gpsStringForEdit(record, values) {
  const originalGps = String(record.raw_text || "").trim();
  if (!gpsCoreChanged(record, values)) return originalGps;
  return `GPS:${values.name}:${formatGpsNumber(values.x)}:${formatGpsNumber(values.y)}:${formatGpsNumber(values.z)}:${normalizeGpsColor(values.color)}:`;
}

function findDuplicate(record, list) {
  let closest = null;

  for (const existing of list) {
    const distance = distance3d(record, existing);
    if (distance <= DUPLICATE_DISTANCE_M && (!closest || distance < closest.distance)) {
      closest = { record: existing, distance };
    }
  }

  return closest;
}

function readLocalRecords() {
  const version = localStorage.getItem(LOCAL_STORAGE_VERSION_KEY);
  if (version !== LOCAL_STORAGE_VERSION) {
    localStorage.removeItem("se-coordinate-factions");
    localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, LOCAL_STORAGE_VERSION);
  }

  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
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

function configureStorage() {
  if (new URLSearchParams(window.location.search).get("resetLocal") === "1") {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, LOCAL_STORAGE_VERSION);
  }

  if (shouldUseSharedDatabase()) {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    elements.storageDot.classList.add("online");
    elements.storageMode.textContent = "Shared database mode";
    elements.storageDetail.textContent = "Entries are loaded from Supabase.";
    return;
  }

  elements.storageMode.textContent = "Local demo mode";
  elements.storageDetail.textContent = "Local testing only. Add ?shared=1 to the URL to use Supabase here.";
}

async function loadRecords() {
  if (!supabaseClient) {
    coordinates = readLocalRecords();
    render();
    return;
  }

  const coordinateResult = await supabaseClient
    .from("coordinates")
    .select("*")
    .order("created_at", { ascending: false });

  if (coordinateResult.error) {
    setMessage(coordinateResult.error.message, "bad");
    return;
  }

  coordinates = coordinateResult.data || [];
  render();
}

async function submitRecord(record) {
  if (!supabaseClient) {
    const duplicate = findDuplicate(record, coordinates);

    if (duplicate) {
      return {
        inserted: false,
        duplicate,
        message: `Already listed near ${duplicate.record.name} (${formatMeters(duplicate.distance)} away).`
      };
    }

    coordinates = [record, ...coordinates];
    writeLocalRecords(coordinates);
    return { inserted: true, record, message: `${record.name} added.` };
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
    p_has_zone_chips: Boolean(record.has_zone_chips),
    p_altitude_m: record.altitude_m,
    p_center_distance_m: record.center_distance_m,
    p_notes: record.notes,
    p_submitted_by: record.submitted_by
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function updateRecord(record) {
  if (!supabaseClient) {
    coordinates = coordinates.map((item) => item.id === record.id ? record : item);
    writeLocalRecords(coordinates);
    render();
    return;
  }

  const { error } = await supabaseClient.rpc("update_coordinate_admin", {
    p_admin_code: ADMIN_PASSWORD,
    p_id: record.id,
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
    p_has_zone_chips: Boolean(record.has_zone_chips),
    p_altitude_m: record.altitude_m,
    p_center_distance_m: record.center_distance_m,
    p_notes: record.notes,
    p_submitted_by: record.submitted_by
  });

  if (error) throw new Error(error.message);
  await loadRecords();
}

async function deleteRecord(recordId) {
  if (!supabaseClient) {
    const currentRecords = readLocalRecords();
    const nextRecords = currentRecords.filter((item) => String(item.id) !== String(recordId));

    if (nextRecords.length === currentRecords.length) {
      throw new Error("Delete could not find that station in local storage. Refresh and try again.");
    }

    coordinates = nextRecords;
    writeLocalRecords(coordinates);
    render();
    return;
  }

  const { error } = await supabaseClient.rpc("delete_coordinate_admin", {
    p_admin_code: ADMIN_PASSWORD,
    p_id: recordId
  });

  if (error) {
    throw new Error(formatAdminRpcError(error, "delete"));
  }
  await loadRecords();

  if (coordinates.some((item) => item.id === recordId)) {
    throw new Error("Delete did not remove the station. Run supabase-admin-repair.sql in Supabase, then try again.");
  }
}

function formatAdminRpcError(error, action) {
  const message = error?.message || "Unknown Supabase error.";
  const missingFunction = message.toLowerCase().includes("could not find the function") ||
    message.toLowerCase().includes("not found");

  if (missingFunction) {
    return `Admin ${action} is not installed in Supabase yet. Run supabase-admin-repair.sql in the Supabase SQL Editor, then try again.`;
  }

  return message;
}

function setMessage(message, tone = "") {
  elements.formMessage.className = `message ${tone}`.trim();
  elements.formMessage.textContent = message;
}

function updatePreview() {
  if (!elements.gpsInput.value.trim()) {
    elements.previewBox.textContent = "Paste one or more GPS coordinates to preview detection.";
    return;
  }

  try {
    const lines = splitGpsInput(elements.gpsInput.value);
    const parsed = parseGps(lines[0]);
    const record = buildRecord(parsed);
    const faction = resolveFaction(record.faction_tag);
    const bulkLine = lines.length > 1 ? `<br>${lines.length} coordinates detected. The same notes and submitter will apply to all.` : "";
    elements.previewBox.innerHTML = `
      <strong>${escapeHtml(record.name)}</strong><br>
      ${escapeHtml(record.planet)} - ${typeLabel(record.location_type)} - altitude ${formatMeters(record.altitude_m)}<br>
      ${renderFactionPreview(record.faction_tag, faction)}
      X ${record.x.toFixed(2)} / Y ${record.y.toFixed(2)} / Z ${record.z.toFixed(2)}
      ${bulkLine}
    `;
  } catch (error) {
    elements.previewBox.textContent = error.message;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function filteredRecords() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const planet = elements.planetFilter.value;
  const type = elements.typeFilter.value;
  const trade = elements.tradeFilter.value;

  return coordinates.filter((record) => {
    const matchesPlanet = planet === "all" || record.planet === planet;
    const matchesType = type === "all" || record.location_type === type;
    const faction = resolveFaction(record.faction_tag);
    const tradePurposes = faction?.tradePurposes || ["unknown"];
    const matchesTrade = trade === "all" ||
      (trade === "zone_chips" ? Boolean(record.has_zone_chips) :
        trade === "ships" ? Boolean(record.sells_ships) || tradePurposes.includes(trade) :
          trade === "h2_gas" ? Boolean(record.sells_h2_gas) :
            trade === "o2_gas" ? Boolean(record.sells_o2_gas) :
              tradePurposes.includes(trade));
    const haystack = [
      record.name,
      record.raw_text,
      record.planet,
      typeLabel(record.location_type),
      record.notes,
      record.submitted_by,
      record.faction_tag,
      record.sells_ships ? "ships rovers" : "",
      record.sells_h2_gas ? "h2 gas hydrogen" : "",
      record.sells_o2_gas ? "o2 gas oxygen" : "",
      record.faction_name,
      faction?.name,
      faction?.firstName,
      faction?.secondName,
      faction?.category,
      factionTradeSummary(faction),
      record.has_zone_chips ? "zone chips" : ""
    ].join(" ").toLowerCase();
    return matchesPlanet && matchesType && matchesTrade && haystack.includes(query);
  });
}

function render() {
  renderPlanetOptions();
  renderStats();
  renderFilteredViews();
}

function renderFilteredViews() {
  renderResults();
  updateMap();
}

function resetFilters() {
  elements.searchInput.value = "";
  elements.planetFilter.value = "all";
  elements.typeFilter.value = "all";
  elements.tradeFilter.value = "all";
  renderFilteredViews();
}

function renderPlanetOptions() {
  const currentValue = elements.planetFilter.value;
  const options = ["all", ...PLANETS.map((planet) => planet.name)];
  elements.planetFilter.innerHTML = options.map((planet) => {
    const label = planet === "all" ? "All planets" : planet;
    return `<option value="${planet}">${label}</option>`;
  }).join("");
  elements.planetFilter.value = options.includes(currentValue) ? currentValue : "all";
}

function renderAdminPlanetOptions() {
  if (!elements.adminPlanetInput) return;
  elements.adminPlanetInput.innerHTML = PLANETS.map((planet) => (
    `<option value="${planet.name}">${planet.name}</option>`
  )).join("");
}

function renderStats() {
  elements.totalCount.textContent = coordinates.length;
  elements.surfaceCount.textContent = coordinates.filter((record) => record.location_type === "surface").length;
  elements.orbitalCount.textContent = coordinates.filter((record) => record.location_type === "orbital").length;
  elements.deepSpaceCount.textContent = coordinates.filter((record) => record.location_type === "deep_space").length;
}

function renderResults() {
  const records = filteredRecords();

  if (!records.length) {
    elements.resultsList.innerHTML = `<div class="empty">No coordinates match this view.</div>`;
    return;
  }

  elements.resultsList.innerHTML = records.map((record) => renderRecordCard(record)).join("");
}

function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const faction = normalizeFactionTag(params.get("faction") || "");
  if (!faction) return;
  elements.searchInput.value = faction;
  window.history.replaceState({}, "", window.location.pathname);
}

function renderRecordCard(record) {
  const faction = resolveFaction(record.faction_tag);
  const color = factionColor(faction);
  const factionName = factionNameForRecord(record, faction);
  const displayName = faction?.firstName && faction?.secondName
    ? `${record.name} (${record.faction_name?.trim() || `${faction.firstName} ${faction.secondName}`})`
    : factionName
      ? `${record.name} (${factionName})`
      : record.name;
  const factionType = faction
    ? `<span class="station-type" style="--faction-color: ${color.hex}; --faction-bg: ${color.dim};">${escapeHtml(faction.category)}</span>`
    : "";
  const economySummary = factionTradeSummary(faction);
  const stationFlags = [
    record.has_zone_chips ? "Zone chips" : "",
    record.sells_ships ? "Ships" : "",
    record.sells_h2_gas ? "H2 gas" : "",
    record.sells_o2_gas ? "O2 gas" : ""
  ].filter(Boolean);
  const stationFlagSummary = stationFlags.length
    ? stationFlags.map((label) => `<span>${escapeHtml(label)}</span>`).join("")
    : `<span class="muted-inline">None marked</span>`;

  return `
    <article class="coordinate-card" data-station-id="${escapeHtml(record.id)}" tabindex="0" role="button" aria-label="Open details for ${escapeHtml(record.name)}">
      <div class="station-card-main">
        <div class="station-card-header">
          <div>
            <h3>${escapeHtml(displayName)}</h3>
            <div class="station-subtitle">${escapeHtml(record.faction_tag || "----")} ${factionType}</div>
          </div>
        </div>
        <div class="gps-line">${escapeHtml(stationCopyGps(record))}</div>
        ${record.notes ? `<p>${escapeHtml(record.notes)}</p>` : ""}
        <dl class="station-detail-list">
          ${renderLocationRows(record)}
          <div><dt>Economy</dt><dd>${renderEconomyLine(faction, economySummary)}</dd></div>
          <div><dt>Extras</dt><dd><span class="station-flags">${stationFlagSummary}</span></dd></div>
          <div><dt>Submitted</dt><dd>${record.submitted_by ? escapeHtml(record.submitted_by) : "Unknown"}</dd></div>
        </dl>
      </div>
      <div class="card-actions">
        <button class="copy-button" type="button" data-copy-id="${escapeHtml(record.id)}">Copy Coords</button>
        <button class="card-action-link" type="button" data-comment-id="${escapeHtml(record.id)}">Comments</button>
        <button class="card-action-link" type="button" data-edit-id="${escapeHtml(record.id)}" ${adminAuthenticated ? "" : `disabled title="Enter admin mode to edit"`}>Edit</button>
        <button class="card-action-link danger-button" type="button" data-delete-id="${escapeHtml(record.id)}" ${adminAuthenticated ? "" : `disabled title="Enter admin mode to delete"`}>Delete</button>
        <div class="pill">${new Date(record.created_at).toLocaleDateString()}</div>
      </div>
    </article>
  `;
}

function commentsForRecord(recordId) {
  return readLocalComments()[recordId] || [];
}

function openCommentModal(record) {
  activeCommentRecord = record;
  elements.commentForm.reset();
  elements.commentMessage.textContent = "";
  elements.commentMessage.className = "message";
  elements.commentTitle.textContent = `${record.name} Comments`;
  renderCommentThread();
  elements.commentModal.hidden = false;
  elements.commentTextInput.focus();
}

function closeCommentModal() {
  activeCommentRecord = null;
  elements.commentModal.hidden = true;
}

function renderCommentThread() {
  if (!activeCommentRecord) return;
  const comments = commentsForRecord(activeCommentRecord.id);
  elements.commentThread.innerHTML = comments.length
    ? comments.map((comment) => `
      <article class="comment-item">
        <strong>${escapeHtml(comment.author || "Anonymous")}</strong>
        <span>${new Date(comment.created_at).toLocaleString()}</span>
        <p>${escapeHtml(comment.text)}</p>
      </article>
    `).join("")
    : `<div class="empty">No comments yet.</div>`;
}

function addStationComment(recordId, comment) {
  const comments = readLocalComments();
  comments[recordId] = [
    ...(comments[recordId] || []),
    {
      id: crypto.randomUUID(),
      author: comment.author,
      text: comment.text,
      created_at: new Date().toISOString()
    }
  ];
  writeLocalComments(comments);
}

function openStationWindow(recordId) {
  const detailUrl = `station.html?id=${encodeURIComponent(recordId)}`;
  const stationWindow = window.open(detailUrl, "_blank");
  if (!stationWindow) {
    window.location.href = detailUrl;
  }
}

function openAdminModal(action, record) {
  if (["edit", "delete"].includes(action) && !adminAuthenticated) {
    setMessage("Enter admin mode before editing or deleting.", "bad");
    return;
  }
  pendingAdminAction = { action, record };
  elements.adminForm.reset();
  elements.adminMessage.textContent = "";
  elements.adminMessage.className = "message";
  elements.adminTitle.textContent = action === "admin" ? "Admin Mode" : action === "edit" ? `Edit ${record.name}` : `Delete ${record.name}`;
  elements.adminConfirmButton.textContent = action === "admin" ? "Enter Admin Mode" : action === "edit" ? "Save Changes" : "Delete Station";
  elements.adminConfirmButton.classList.toggle("danger-button", action === "delete");
  elements.adminEditFields.hidden = action !== "edit";
  setAdminEditFieldsEnabled(action === "edit");
  setAdminPasswordPromptVisible(action === "admin");
  if (record) {
    elements.adminNameInput.value = record.name;
    elements.adminFactionInput.value = record.faction_tag || "";
    elements.adminFactionNameInput.value = record.faction_name || "";
    elements.adminZoneChipInput.checked = Boolean(record.has_zone_chips);
    elements.adminSellsShipsInput.checked = Boolean(record.sells_ships);
    elements.adminSellsH2Input.checked = Boolean(record.sells_h2_gas);
    elements.adminSellsO2Input.checked = Boolean(record.sells_o2_gas);
    elements.adminPlanetInput.value = record.planet;
    elements.adminLocationInput.value = record.location_type;
    elements.adminNotesInput.value = record.notes || "";
    elements.adminSubmitterInput.value = record.submitted_by || "";
  }
  if (action === "delete") {
    elements.adminMessage.className = "message bad";
    elements.adminMessage.textContent = `Are you sure you want to delete ${record.name}? This cannot be undone.`;
  }
  elements.adminModal.hidden = false;
  if (action === "admin") elements.adminPasswordInput.focus();
  else elements.adminConfirmButton.focus();
}

function closeAdminModal() {
  pendingAdminAction = null;
  setAdminEditFieldsEnabled(true);
  setAdminPasswordPromptVisible(true);
  elements.adminModal.hidden = true;
}

function renderAdminModeControls() {
  elements.adminModeButton.hidden = adminAuthenticated;
  elements.exitAdminModeButton.hidden = !adminAuthenticated;
}

function setAdminPasswordPromptVisible(visible) {
  elements.adminPasswordLabel.hidden = !visible;
  elements.adminPasswordLabel.style.display = visible ? "" : "none";
  elements.adminPasswordInput.required = visible;
  if (!visible) elements.adminPasswordInput.value = "";
}

function setAdminEditFieldsEnabled(enabled) {
  elements.adminEditFields.querySelectorAll("input, select, textarea").forEach((field) => {
    field.disabled = !enabled;
  });
}

function keepAdminModalInputOpen(event) {
  if (event.key !== "Enter") return;
  const target = event.target;
  if (target?.tagName === "TEXTAREA") return;
  if (target?.closest("button")) return;
  event.preventDefault();
}

async function submitAdminAction(event) {
  event.preventDefault();
  if (!pendingAdminAction) return;

  const { action, record } = pendingAdminAction;
  if (action === "admin" && elements.adminPasswordInput.value !== ADMIN_PASSWORD) {
    elements.adminMessage.className = "message bad";
    elements.adminMessage.textContent = "Wrong password.";
    return;
  }
  if (action === "admin") {
    adminAuthenticated = true;
    renderAdminModeControls();
    renderFilteredViews();
    closeAdminModal();
    setMessage("Admin mode enabled.", "good");
    return;
  }

  try {
    if (action === "edit") {
      const name = elements.adminNameInput.value.trim();
      const submittedBy = elements.adminSubmitterInput.value.trim();
      if (!name) throw new Error("Station name is required.");
      if (!submittedBy) throw new Error("Submitted by is required.");
      const rawText = gpsStringForEdit(record, {
        name,
        x: record.x,
        y: record.y,
        z: record.z,
        color: record.color
      });
      const updated = {
        ...record,
        raw_text: rawText,
        name,
        planet: elements.adminPlanetInput.value,
        location_type: elements.adminLocationInput.value,
        faction_tag: normalizeFactionTag(elements.adminFactionInput.value),
        faction_name: elements.adminFactionNameInput.value.trim(),
        has_zone_chips: elements.adminZoneChipInput.checked,
        sells_ships: elements.adminSellsShipsInput.checked,
        sells_h2_gas: elements.adminSellsH2Input.checked,
        sells_o2_gas: elements.adminSellsO2Input.checked,
        notes: elements.adminNotesInput.value.trim(),
        submitted_by: submittedBy
      };
      const selectedPlanet = PLANETS.find((planet) => planet.name === updated.planet);
      if (selectedPlanet) {
        updated.center_distance_m = distance3d(updated, selectedPlanet);
        updated.altitude_m = updated.center_distance_m - selectedPlanet.radius;
      }
      updated.id = record.id;
      updated.created_at = record.created_at;
      await updateRecord(updated);
      setMessage(`${updated.name} updated.`, "good");
      closeAdminModal();
    } else {
      const deletedName = record.name;
      const deletedId = record.id;
      closeAdminModal();
      try {
        await deleteRecord(deletedId);
        setMessage(`${deletedName} deleted.`, "good");
      } catch (deleteError) {
        setMessage(`Delete failed: ${deleteError.message}`, "bad");
      }
    }
  } catch (error) {
    elements.adminMessage.className = "message bad";
    elements.adminMessage.textContent = error.message;
  }
}

function renderFactionPreview(tag, faction) {
  if (!tag) return "";
  if (!faction) return `Faction ${escapeHtml(tag)} - no built-in match<br>`;

  return `
    Faction ${escapeHtml(tag)} - ${escapeHtml(faction.name)}<br>
    1st: ${escapeHtml(faction.firstName)} / 2nd: ${escapeHtml(faction.secondName || "N/A")} / Type: ${escapeHtml(faction.category)}<br>
  `;
}

function initMap() {
  if (!window.THREE || !elements.mapViewport) {
    elements.mapFallback.textContent = "3D map unavailable. Check the Three.js script connection.";
    return;
  }

  const THREE = window.THREE;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05080d);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  elements.mapViewport.append(renderer.domElement);
  elements.mapFallback.style.display = "none";

  const root = new THREE.Group();
  scene.add(root);

  const ambient = new THREE.AmbientLight(0xffffff, 0.58);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
  keyLight.position.set(80, 90, 120);
  scene.add(keyLight);

  const planetGroup = new THREE.Group();
  const stationGroup = new THREE.Group();
  const labelGroup = new THREE.Group();
  root.add(planetGroup, stationGroup, labelGroup);

  const grid = new THREE.GridHelper(520, 26, 0x2c3643, 0x17202b);
  grid.position.y = -12;
  root.add(grid);

  const planetGeometryCache = new Map();

  for (const planet of PLANETS) {
    const radius = Math.max(0.32, planet.radius * MAP_SCALE);
    const roundedRadius = radius.toFixed(2);
    const geometry = planetGeometryCache.get(roundedRadius) || new THREE.SphereGeometry(radius, 32, 18);
    planetGeometryCache.set(roundedRadius, geometry);

    const material = new THREE.MeshStandardMaterial({
      color: PLANET_COLORS[planet.name] || 0xcccccc,
      roughness: 0.72,
      metalness: 0.02
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(mapPosition(planet));
    mesh.userData = { type: "planet", planet };
    planetGroup.add(mesh);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 1.08, radius * 1.12, 48),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    );
    ring.position.copy(mesh.position);
    ring.rotation.x = Math.PI / 2;
    planetGroup.add(ring);

    const gravityShell = new THREE.Mesh(
      new THREE.SphereGeometry(radius * GRAVITY_FIELD_RADIUS_MULTIPLIER, 32, 18),
      new THREE.MeshBasicMaterial({
        color: 0x49d6b5,
        transparent: true,
        opacity: 0.055,
        depthWrite: false
      })
    );
    gravityShell.position.copy(mesh.position);
    planetGroup.add(gravityShell);

    const label = makeLabelSprite(`${planet.name}`, "#eef3f8");
    const labelPosition = labelCalloutPosition(planet, radius);
    label.position.copy(labelPosition);
    label.userData = {
      type: "planet-label",
      planet,
      radius,
      baseScale: label.scale.clone(),
      isMoonScale: planet.radius < 20000,
      targetPosition: labelPosition.clone(),
      leaderLine: makeLeaderLine(mesh.position, labelPosition)
    };
    labelGroup.add(label);
    labelGroup.add(label.userData.leaderLine);
  }

  mapState = {
    THREE,
    scene,
    camera,
    renderer,
    root,
    planetGroup,
    stationGroup,
    labelGroup,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    yaw: -0.62,
    pitch: -0.34,
    distance: 330,
    target: new THREE.Vector3(0, 0, 40),
    dragging: false,
    lastX: 0,
    lastY: 0,
    movedDuringDrag: false
  };

  resizeMap();
  bindMapControls();
  updateCamera();
  animateMap();
}

function mapPosition(point) {
  const THREE = window.THREE;
  return new THREE.Vector3(point.x * MAP_SCALE, point.y * MAP_SCALE, point.z * MAP_SCALE);
}

function makeLabelSprite(text, color) {
  const THREE = window.THREE;
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "700 36px Segoe UI, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const textWidth = context.measureText(text).width;
  const boxWidth = Math.min(canvas.width - 32, Math.max(116, textWidth + 42));
  const boxX = (canvas.width - boxWidth) / 2;
  context.fillStyle = "rgba(5, 8, 13, 0.72)";
  roundRect(context, boxX, 30, boxWidth, 68, 16);
  context.fill();
  context.fillStyle = color;
  context.fillText(text, canvas.width / 2, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(25.5, 8.5, 1);
  return sprite;
}

function labelCalloutPosition(planet, radius) {
  const THREE = window.THREE;
  const moonScale = planet.radius < 20000;
  const direction = new THREE.Vector3(
    planet.x >= 0 ? 1 : -1,
    moonScale ? 1.35 : 1.05,
    planet.z >= 0 ? 1 : -1
  ).normalize();
  const distance = radius + (moonScale ? 14 : 8);
  return mapPosition(planet).add(direction.multiplyScalar(distance));
}

function makeLeaderLine(start, end) {
  const THREE = window.THREE;
  const geometry = new THREE.BufferGeometry().setFromPoints([start.clone(), end.clone()]);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: 0x9ba7b4, transparent: true, opacity: 0.55 })
  );
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function bindMapControls() {
  const viewport = elements.mapViewport;

  viewport.addEventListener("pointerdown", (event) => {
    if (!mapState) return;
    mapState.dragging = true;
    mapState.movedDuringDrag = false;
    mapState.lastX = event.clientX;
    mapState.lastY = event.clientY;
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!mapState?.dragging) return;
    const dx = event.clientX - mapState.lastX;
    const dy = event.clientY - mapState.lastY;
    mapState.lastX = event.clientX;
    mapState.lastY = event.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 3) {
      mapState.movedDuringDrag = true;
    }
    mapState.yaw -= dx * 0.006;
    mapState.pitch = Math.max(-1.25, Math.min(1.25, mapState.pitch + dy * 0.006));
    updateCamera();
  });

  viewport.addEventListener("pointerup", (event) => {
    if (!mapState) return;
    if (!mapState.movedDuringDrag) {
      focusMapObjectFromPointer(event);
    }
    mapState.dragging = false;
    viewport.releasePointerCapture(event.pointerId);
  });

  viewport.addEventListener("wheel", (event) => {
    if (!mapState) return;
    event.preventDefault();
    mapState.distance = Math.max(14, Math.min(900, mapState.distance + event.deltaY * 0.18));
    updateCamera();
  }, { passive: false });

  window.addEventListener("resize", resizeMap);
}

function focusMapObjectFromPointer(event) {
  if (!mapState) return;

  const rect = elements.mapViewport.getBoundingClientRect();
  mapState.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mapState.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  mapState.raycaster.setFromCamera(mapState.pointer, mapState.camera);

  const stationHits = mapState.raycaster.intersectObjects(mapState.stationGroup.children, false);
  const stationHit = stationHits.find((hit) => hit.object.userData?.type === "station");
  if (stationHit) {
    const record = coordinates.find((item) => item.id === stationHit.object.userData.recordId);
    if (record) openStationWindow(record.id);
    return;
  }

  const planetObjects = [
    ...mapState.planetGroup.children,
    ...mapState.labelGroup.children.filter((label) => label.visible)
  ];
  const hits = mapState.raycaster.intersectObjects(planetObjects, false);
  const planetHit = hits.find((hit) => ["planet", "planet-label"].includes(hit.object.userData?.type));
  if (!planetHit) return;

  focusPlanet(planetHit.object.userData.planet);
}

function focusPlanet(planet) {
  if (!mapState) return;
  const position = mapPosition(planet);
  const radius = Math.max(0.32, planet.radius * MAP_SCALE);
  mapState.target.copy(position);
  mapState.distance = planet.radius < 20000
    ? Math.max(12, radius * 5)
    : Math.max(28, radius * 10);
  updateCamera();
}

function focusStation(record) {
  if (!mapState) return;
  mapState.target.copy(mapPosition(record));
  mapState.distance = 36;
  updateCamera();
}

function selectStation(record) {
  focusStation(record);
  elements.searchInput.value = record.name;
  renderFilteredViews();
  document.querySelector(".results-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateCamera() {
  if (!mapState) return;
  const { camera, target, yaw, pitch, distance } = mapState;
  const horizontal = Math.cos(pitch) * distance;
  camera.position.set(
    target.x + Math.sin(yaw) * horizontal,
    target.y + Math.sin(pitch) * distance,
    target.z + Math.cos(yaw) * horizontal
  );
  camera.lookAt(target);
  updateLabelScale();
}

function updateLabelScale() {
  if (!mapState) return;

  const zoomScale = Math.max(0.6, Math.min(14, mapState.distance / 55));
  const bodyDisks = getProjectedBodyDisks();
  for (const label of mapState.labelGroup.children) {
    if (!label.userData?.baseScale) continue;
    const baseScale = label.userData?.baseScale;
    label.visible = shouldShowLabel(label, bodyDisks);

    if (baseScale) {
      label.scale.copy(baseScale).multiplyScalar(zoomScale);
    }
    if (label.visible) {
      placeSafeLabel(label, bodyDisks);
    }
    if (label.userData?.leaderLine) {
      label.userData.leaderLine.visible = label.visible;
      updateLeaderLine(label.userData.leaderLine, mapPosition(label.userData.planet), label.position);
    }
  }
}

function shouldShowLabel(label, bodyDisks) {
  if (label.userData?.isMoonScale && mapState.distance >= 320) return false;
  const planet = label.userData.planet;
  const disk = bodyDisks.find((item) => item.planet.name === planet.name);
  if (!disk || disk.behind) return false;
  const rect = elements.mapViewport.getBoundingClientRect();
  const margin = 80;
  return disk.x >= -margin &&
    disk.x <= rect.width + margin &&
    disk.y >= -margin &&
    disk.y <= rect.height + margin;
}

function getProjectedBodyDisks() {
  const disks = [];
  const rect = elements.mapViewport.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const cameraRight = new mapState.THREE.Vector3();
  mapState.camera.matrixWorld.extractBasis(cameraRight, new mapState.THREE.Vector3(), new mapState.THREE.Vector3());

  for (const planet of PLANETS) {
    const radius = Math.max(0.32, planet.radius * MAP_SCALE);
    const center = mapPosition(planet);
    const edge = center.clone().add(cameraRight.clone().multiplyScalar(radius));
    const centerScreen = worldToScreen(center, width, height);
    const edgeScreen = worldToScreen(edge, width, height);
    disks.push({
      planet,
      x: centerScreen.x,
      y: centerScreen.y,
      behind: centerScreen.z < -1 || centerScreen.z > 1,
      radius: Math.max(6, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y) + 4)
    });
  }

  return disks;
}

function placeSafeLabel(label, bodyDisks) {
  const rect = elements.mapViewport.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const planet = label.userData.planet;
  const centerWorld = mapPosition(planet);
  const centerScreen = worldToScreen(centerWorld, width, height);
  const viewportCenter = { x: width / 2, y: height / 2 };
  const direction = normalizeScreenVector({
    x: centerScreen.x - viewportCenter.x,
    y: centerScreen.y - viewportCenter.y
  }, planet);
  const ownDisk = bodyDisks.find((disk) => disk.planet.name === planet.name);
  const box = measureLabelBox(label, width, height);
  let distance = (ownDisk?.radius || 20) + Math.max(box.width, box.height) * 0.58 + 14;
  let target = { x: centerScreen.x + direction.x * distance, y: centerScreen.y + direction.y * distance };

  for (let attempt = 0; attempt < 18; attempt += 1) {
    const labelBox = {
      left: target.x - box.width / 2,
      right: target.x + box.width / 2,
      top: target.y - box.height / 2,
      bottom: target.y + box.height / 2
    };
    const collision = bodyDisks.find((disk) => rectIntersectsCircle(labelBox, disk));
    if (!collision) break;
    distance += collision.radius + 18;
    target = { x: centerScreen.x + direction.x * distance, y: centerScreen.y + direction.y * distance };
  }

  const desired = screenToWorld(target.x, target.y, centerWorld, width, height);
  if (!label.userData.targetPosition) {
    label.userData.targetPosition = desired.clone();
  } else {
    label.userData.targetPosition.copy(desired);
  }
  label.position.lerp(label.userData.targetPosition, 0.18);
}

function normalizeScreenVector(vector, planet) {
  const length = Math.hypot(vector.x, vector.y);
  if (length > 0.001) return { x: vector.x / length, y: vector.y / length };
  const fallback = planet.x + planet.z >= 0 ? 1 : -1;
  return { x: fallback * 0.72, y: -0.7 };
}

function measureLabelBox(label, width, height) {
  const THREE = mapState.THREE;
  const center = label.position.clone();
  const cameraRight = new THREE.Vector3();
  const cameraUp = new THREE.Vector3();
  mapState.camera.matrixWorld.extractBasis(cameraRight, cameraUp, new THREE.Vector3());
  const halfWidth = label.scale.x / 2;
  const halfHeight = label.scale.y / 2;
  const left = worldToScreen(center.clone().add(cameraRight.clone().multiplyScalar(-halfWidth)), width, height);
  const right = worldToScreen(center.clone().add(cameraRight.clone().multiplyScalar(halfWidth)), width, height);
  const top = worldToScreen(center.clone().add(cameraUp.clone().multiplyScalar(halfHeight)), width, height);
  const bottom = worldToScreen(center.clone().add(cameraUp.clone().multiplyScalar(-halfHeight)), width, height);
  return {
    width: Math.max(72, Math.abs(right.x - left.x)),
    height: Math.max(28, Math.abs(bottom.y - top.y))
  };
}

function rectIntersectsCircle(rect, circle) {
  const nearestX = Math.max(rect.left, Math.min(circle.x, rect.right));
  const nearestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
  return Math.hypot(circle.x - nearestX, circle.y - nearestY) < circle.radius;
}

function worldToScreen(position, width, height) {
  const projected = position.clone().project(mapState.camera);
  return {
    x: (projected.x * 0.5 + 0.5) * width,
    y: (-projected.y * 0.5 + 0.5) * height,
    z: projected.z
  };
}

function screenToWorld(x, y, depthPoint, width, height) {
  const THREE = mapState.THREE;
  const projectedDepth = depthPoint.clone().project(mapState.camera).z;
  return new THREE.Vector3(
    (x / width) * 2 - 1,
    -(y / height) * 2 + 1,
    projectedDepth
  ).unproject(mapState.camera);
}

function updateLeaderLine(line, start, end) {
  line.geometry.setFromPoints([start.clone(), end.clone()]);
  line.geometry.attributes.position.needsUpdate = true;
}

function resizeMap() {
  if (!mapState) return;
  const rect = elements.mapViewport.getBoundingClientRect();
  const width = Math.max(320, rect.width);
  const height = Math.max(360, rect.height);
  mapState.renderer.setSize(width, height, false);
  mapState.camera.aspect = width / height;
  mapState.camera.updateProjectionMatrix();
}

function animateMap() {
  if (!mapState) return;
  updateLabelScale();
  updateMarkerScale();
  mapState.renderer.render(mapState.scene, mapState.camera);
  requestAnimationFrame(animateMap);
}

function updateMarkerScale() {
  if (!mapState) return;
  const scale = Math.max(0.13, Math.min(2.2, mapState.distance / 340));
  for (const marker of mapState.stationGroup.children) {
    if (marker.userData?.type === "station") {
      marker.scale.setScalar(scale);
    }
  }
}

function resetMapView() {
  if (!mapState) return;
  mapState.yaw = -0.62;
  mapState.pitch = -0.34;
  mapState.distance = 330;
  mapState.target.set(0, 0, 40);
  updateCamera();
}

function updateMap() {
  if (!mapState) return;

  const THREE = mapState.THREE;
  while (mapState.stationGroup.children.length) {
    const child = mapState.stationGroup.children.pop();
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  }

  const records = filteredRecords();
  const markerGeometry = new THREE.SphereGeometry(0.85, 16, 10);

  for (const record of records) {
    const faction = resolveFaction(record.faction_tag);
    const factionName = factionNameForRecord(record, faction);
    const color = factionColor(faction);
    const material = new THREE.MeshStandardMaterial({
      color: color.numeric,
      emissive: color.numeric,
      emissiveIntensity: record.location_type === "deep_space" ? 0.7 : 0.45
    });
    const marker = new THREE.Mesh(markerGeometry, material);
    marker.position.copy(mapPosition(record));
    marker.userData = { type: "station", recordId: record.id };
    mapState.stationGroup.add(marker);
  }

  renderMapList(records);
}

function renderMapList(records) {
  const planetRows = PLANETS.map((planet) => `
    <button class="map-item" type="button" data-planet-name="${escapeHtml(planet.name)}">
      <strong>${escapeHtml(planet.name)}</strong>
      <span>Planet focus</span>
    </button>
  `).join("");

  const stationRows = records.map((record) => {
    const faction = resolveFaction(record.faction_tag);
    const factionName = factionNameForRecord(record, faction);
    const color = factionColor(faction);
    return `
      <button class="map-item" type="button" data-map-id="${escapeHtml(record.id)}" style="border-color: ${color.hex};">
        <strong>${escapeHtml(record.name)}</strong>
        <span>${escapeHtml(record.planet)} - ${typeLabel(record.location_type)} - ${formatDistance(record.altitude_m)} altitude</span>
        <span>${faction ? `${escapeHtml(factionName)} - ${escapeHtml(faction.category)}` : "Faction unknown"}</span>
      </button>
    `;
  }).join("");

  const emptyState = records.length ? "" : `<div class="empty">No stations in this map view.</div>`;
  elements.mapList.innerHTML = planetRows + emptyState + stationRows;
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some embedded browsers expose the Clipboard API but deny write permission.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

async function copyAllVisibleStations() {
  const records = filteredRecords();
  if (!records.length) {
    setMessage("No stations to copy in this view.", "bad");
    return false;
  }

  await copyToClipboard(records.map((record) => stationCopyGps(record)).join("\n"));
  setMessage(`${records.length} station coordinate${records.length === 1 ? "" : "s"} copied.`, "good");
  return true;
}

if (elements.form) elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("Checking coordinate(s)...");

  try {
    const lines = splitGpsInput(elements.gpsInput.value);
    if (!lines.length) {
      setMessage("Paste at least one GPS coordinate.", "bad");
      return;
    }

    const sharedExtra = {
      notes: elements.notesInput.value.trim(),
      submittedBy: elements.submitterInput.value.trim()
    };
    const added = [];
    const skipped = [];

    for (const [index, line] of lines.entries()) {
      try {
        const parsed = parseGps(line);
        const record = buildRecord(parsed, sharedExtra);
        const result = await submitRecord(record);

        if (result.inserted === false) {
          skipped.push({ line: index + 1, name: record.name, message: result.message || "Already listed within 1 km." });
        } else {
          added.push(record.name);
        }
      } catch (error) {
        skipped.push({ line: index + 1, name: `Line ${index + 1}`, message: error.message });
      }
    }

    if (added.length) {
      elements.form.reset();
      updatePreview();
      await loadRecords();
    } else {
      render();
    }

    const summary = `${added.length} added, ${skipped.length} skipped.`;
    const skippedDetails = skipped.slice(0, 3).map((item) => ` Line ${item.line}: ${item.message}`).join("");
    setMessage(`${summary}${skippedDetails}`, skipped.length && !added.length ? "bad" : "good");
  } catch (error) {
    setMessage(error.message, "bad");
  }
});

elements.gpsInput?.addEventListener("input", updatePreview);
elements.searchInput.addEventListener("input", renderFilteredViews);
elements.planetFilter.addEventListener("change", renderFilteredViews);
elements.typeFilter.addEventListener("change", renderFilteredViews);
elements.tradeFilter.addEventListener("change", renderFilteredViews);
elements.refreshButton.addEventListener("click", loadRecords);
elements.resetFiltersButton.addEventListener("click", resetFilters);
elements.copyAllButton.addEventListener("click", async () => {
  try {
    const copied = await copyAllVisibleStations();
    if (!copied) return;
    const originalText = elements.copyAllButton.textContent;
    elements.copyAllButton.textContent = "Copied";
    elements.copyAllButton.classList.add("copied");
    setTimeout(() => {
      elements.copyAllButton.textContent = originalText;
      elements.copyAllButton.classList.remove("copied");
    }, 1400);
  } catch (error) {
    setMessage(`Copy failed: ${error.message}`, "bad");
  }
});
elements.adminModeButton.addEventListener("click", () => openAdminModal("admin", null));
elements.exitAdminModeButton.addEventListener("click", () => {
  adminAuthenticated = false;
  renderAdminModeControls();
  renderFilteredViews();
  setMessage("Admin mode exited.", "good");
});
elements.resetMapButton.addEventListener("click", resetMapView);
elements.resultsList.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-station-id]");

  const commentButton = event.target.closest("[data-comment-id]");
  if (commentButton) {
    const record = coordinates.find((item) => item.id === commentButton.dataset.commentId);
    if (record) openCommentModal(record);
    return;
  }

  const editButton = event.target.closest("[data-edit-id]");
  if (editButton) {
    const record = coordinates.find((item) => item.id === editButton.dataset.editId);
    if (!record) return;
    openAdminModal("edit", record);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-id]");
  if (deleteButton) {
    const record = coordinates.find((item) => item.id === deleteButton.dataset.deleteId);
    if (!record) return;
    openAdminModal("delete", record);
    return;
  }

  const button = event.target.closest("[data-copy-id]");
  if (!button && card) {
    openStationWindow(card.dataset.stationId);
    return;
  }

  if (!button) return;

  const record = coordinates.find((item) => item.id === button.dataset.copyId);
  if (!record) return;

  try {
    await copyToClipboard(stationCopyGps(record));
    button.textContent = "Copied";
    setTimeout(() => {
      button.textContent = "Copy Coords";
    }, 1200);
  } catch (error) {
    setMessage(`Copy failed: ${error.message}`, "bad");
  }
});
elements.resultsList.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const card = event.target.closest("[data-station-id]");
  if (!card) return;
  event.preventDefault();
  openStationWindow(card.dataset.stationId);
});
elements.mapList.addEventListener("click", (event) => {
  const planetButton = event.target.closest("[data-planet-name]");
  if (planetButton) {
    const planet = PLANETS.find((item) => item.name === planetButton.dataset.planetName);
    if (planet) focusPlanet(planet);
    return;
  }

  const button = event.target.closest("[data-map-id]");
  if (!button || !mapState) return;

  const record = coordinates.find((item) => item.id === button.dataset.mapId);
  if (!record) return;

  openStationWindow(record.id);
});
elements.adminForm?.addEventListener("submit", submitAdminAction);
elements.adminForm?.addEventListener("click", (event) => event.stopPropagation());
elements.adminForm?.addEventListener("pointerdown", (event) => event.stopPropagation());
elements.adminForm?.addEventListener("keydown", keepAdminModalInputOpen);
elements.adminCancelButton?.addEventListener("click", closeAdminModal);
elements.adminModal?.addEventListener("click", (event) => {
  if (event.target === elements.adminModal) closeAdminModal();
});
elements.commentForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeCommentRecord) return;
  const text = elements.commentTextInput.value.trim();
  if (!text) {
    elements.commentMessage.className = "message bad";
    elements.commentMessage.textContent = "Comment is required.";
    return;
  }
  addStationComment(activeCommentRecord.id, {
    author: elements.commentAuthorInput.value.trim(),
    text
  });
  elements.commentTextInput.value = "";
  elements.commentMessage.className = "message good";
  elements.commentMessage.textContent = "Comment added.";
  renderCommentThread();
});
elements.commentCloseButton?.addEventListener("click", closeCommentModal);
elements.commentModal?.addEventListener("click", (event) => {
  if (event.target === elements.commentModal) closeCommentModal();
});
elements.sampleButton?.addEventListener("click", () => {
  elements.gpsInput.value = SAMPLE_GPS;
  updatePreview();
  elements.gpsInput.focus();
});

configureStorage();
renderPlanetOptions();
renderAdminPlanetOptions();
renderAdminModeControls();
initMap();
applyUrlFilters();
loadRecords();
