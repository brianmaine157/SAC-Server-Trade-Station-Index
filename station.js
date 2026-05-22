const LOCAL_STORAGE_KEY = "se-coordinate-registry";
const LOCAL_FACTIONS_KEY = "se-npc-factions";
const LOCAL_COMMENTS_KEY = "se-station-comments";
const ADMIN_PASSWORD = "6846";
const MAP_SCALE = 1 / 25000;
const GRAVITY_FIELD_RADIUS_MULTIPLIER = 1.7182;
const JUMP_EXIT_OFFSET_M = 10000;
const CRUISE_SPEED_MPS = 95;

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
  CL: "Clang", DV: "Divine", EN: "Enlightened", FC: "First Class", GC: "Galactic",
  ID: "Independent", IG: "Intergalactic", IM: "Imperial", IS: "Interstellar",
  ME: "Merciless", MT: "Mystic", RL: "Royal", RO: "Rogue", RT: "Righteous",
  RV: "Revolutionary", SA: "Sacred", SC: "Secret", SM: "Supreme", SO: "Sovereign",
  SP: "Specialized", ST: "Star", TF: "The First", UD: "Unyielding", UN: "United",
  UV: "Universal"
};

const ECONOMY_FACTION_SUFFIXES = {
  AT: { category: "Builder", suffixName: "Artisans" },
  CG: { category: "Builder", suffixName: "Construction Guild" },
  CS: { category: "Builder", suffixName: "Constructors" },
  EG: { category: "Builder", suffixName: "Engineering" },
  HI: { category: "Builder", suffixName: "Heavy Industry" },
  IN: { category: "Builder", suffixName: "Industry" },
  IV: { category: "Builder", suffixName: "Inventors" },
  MA: { category: "Builder", suffixName: "Manufacturers" },
  MK: { category: "Builder", suffixName: "Makers" },
  SB: { category: "Builder", suffixName: "Shipbuilding" },
  WE: { category: "Builder", suffixName: "Welders" },
  DC: { category: "Miner", suffixName: "Drilling Consortium" },
  DR: { category: "Miner", suffixName: "Drillers" },
  EX: { category: "Miner", suffixName: "Excavators" },
  MG: { category: "Miner", suffixName: "Miners Guild" },
  MN: { category: "Miner", suffixName: "Minerals" },
  PR: { category: "Miner", suffixName: "Prospectors" },
  SR: { category: "Miner", suffixName: "Sappers" },
  AL: { category: "Trader", suffixName: "Alliance" },
  CM: { category: "Trader", suffixName: "Conglomerate" },
  CO: { category: "Trader", suffixName: "Commerce" },
  CT: { category: "Trader", suffixName: "Cartel" },
  DE: { category: "Trader", suffixName: "Dealers" },
  DW: { category: "Trader", suffixName: "Dwellers" },
  HS: { category: "Trader", suffixName: "Hauling Services" },
  MC: { category: "Trader", suffixName: "Merchants" },
  SH: { category: "Trader", suffixName: "Shipping" },
  SL: { category: "Trader", suffixName: "Settlers" },
  TC: { category: "Trader", suffixName: "Technologies" },
  TK: { category: "Trader", suffixName: "Traffickers" },
  TR: { category: "Trader", suffixName: "Traders" }
};

const elements = {
  title: document.querySelector("#stationTitle"),
  subtitle: document.querySelector("#stationSubtitle"),
  details: document.querySelector("#stationDetails"),
  message: document.querySelector("#stationMessage"),
  copyButton: document.querySelector("#copyStationButton"),
  copyJumpButton: document.querySelector("#copyJumpButton"),
  editButton: document.querySelector("#editStationButton"),
  deleteButton: document.querySelector("#deleteStationButton"),
  adminModeButton: document.querySelector("#adminModeButton"),
  exitAdminModeButton: document.querySelector("#exitAdminModeButton"),
  mapViewport: document.querySelector("#stationMapViewport"),
  mapFallback: document.querySelector("#stationMapFallback"),
  resetMapButton: document.querySelector("#resetStationMapButton"),
  commentThread: document.querySelector("#stationCommentThread"),
  commentForm: document.querySelector("#stationCommentForm"),
  commentAuthorInput: document.querySelector("#stationCommentAuthorInput"),
  commentTextInput: document.querySelector("#stationCommentTextInput"),
  adminModal: document.querySelector("#stationAdminModal"),
  adminForm: document.querySelector("#stationAdminForm"),
  adminTitle: document.querySelector("#stationAdminTitle"),
  adminCancelButton: document.querySelector("#stationAdminCancelButton"),
  adminPasswordLabel: document.querySelector("#stationAdminPasswordLabel"),
  adminPasswordInput: document.querySelector("#stationAdminPasswordInput"),
  adminEditFields: document.querySelector("#stationAdminEditFields"),
  adminNameInput: document.querySelector("#stationAdminNameInput"),
  adminFactionInput: document.querySelector("#stationAdminFactionInput"),
  adminFactionNameInput: document.querySelector("#stationAdminFactionNameInput"),
  adminZoneChipInput: document.querySelector("#stationAdminZoneChipInput"),
  adminSellsShipsInput: document.querySelector("#stationAdminSellsShipsInput"),
  adminSellsH2Input: document.querySelector("#stationAdminSellsH2Input"),
  adminSellsO2Input: document.querySelector("#stationAdminSellsO2Input"),
  adminPlanetInput: document.querySelector("#stationAdminPlanetInput"),
  adminLocationInput: document.querySelector("#stationAdminLocationInput"),
  adminNotesInput: document.querySelector("#stationAdminNotesInput"),
  adminSubmitterInput: document.querySelector("#stationAdminSubmitterInput"),
  adminMessage: document.querySelector("#stationAdminMessage"),
  adminConfirmButton: document.querySelector("#stationAdminConfirmButton")
};

let station = null;
let mapState = null;
let canvasMapState = null;
let pendingAdminAction = null;
let adminAuthenticated = false;
let mapRetryTimer = null;
let mapRetryStartedAt = 0;
let latestJumpHitbox = null;
let latestStationHitbox = null;
let latestStationMarkerHitbox = null;
let mapToast = null;
let supabaseClient = null;
let customFactions = {};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function parseGps(value) {
  const trimmed = String(value || "").trim();
  const match = trimmed.match(/^GPS:([^:]+):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(#?[0-9a-fA-F]{8})?:?$/);
  if (!match) {
    throw new Error("Use a valid Space Engineers GPS string.");
  }
  return {
    name: match[1].trim(),
    x: Number(match[2]),
    y: Number(match[3]),
    z: Number(match[4]),
    color: normalizeGpsColor(match[5] || "#FF75C9F1")
  };
}

function extractFactionTag(name) {
  const prefix = String(name || "").trim().match(/^([A-Za-z0-9]{2,4})[.\-\s]/);
  return normalizeFactionTag(prefix?.[1] || "");
}

function normalizeGpsColor(value) {
  const cleaned = String(value || "#FF75C9F1").trim();
  const withHash = cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
  return /^#[0-9a-fA-F]{8}$/.test(withHash) ? withHash.toUpperCase() : "#FF75C9F1";
}

function gpsStringForEdit(original, edited) {
  const color = normalizeGpsColor(edited.color || original.color || "#FF75C9F1");
  return `GPS:${edited.name}:${edited.x}:${edited.y}:${edited.z}:${color}:`;
}

function colorForFaction(faction) {
  return FACTION_TYPE_COLORS[faction?.category || "Unknown"] || FACTION_TYPE_COLORS.Unknown;
}

function copyColorForStation(record = station) {
  const faction = inferFaction(record?.faction_tag);
  const hex = colorForFaction(faction).hex.replace("#", "").toUpperCase();
  return `#FF${hex}`;
}

function gpsWithColor(rawText, color) {
  try {
    const parsed = parseGps(rawText);
    return `GPS:${parsed.name}:${parsed.x}:${parsed.y}:${parsed.z}:${normalizeGpsColor(color)}:`;
  } catch {
    return rawText;
  }
}

function stationCopyGps() {
  return gpsWithColor(station.raw_text, copyColorForStation(station));
}

function distance3d(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function nearestBodyForStation() {
  return PLANETS
    .map((planet) => ({ planet, distance: distance3d(station, planet) }))
    .sort((a, b) => a.distance - b.distance)[0] || null;
}

function stationJumpCoordinate() {
  if (!station || !["surface", "orbital"].includes(station.location_type)) return null;
  const nearest = nearestBodyForStation();
  const planet = nearest?.planet;
  if (!planet) return null;
  const distance = nearest.distance || 1;
  const soiExitDistance = planet.radius * GRAVITY_FIELD_RADIUS_MULTIPLIER + JUMP_EXIT_OFFSET_M;
  const exitDistance = soiExitDistance;
  if (distance >= exitDistance) return null;
  const direction = {
    x: (station.x - planet.x) / distance,
    y: (station.y - planet.y) / distance,
    z: (station.z - planet.z) / distance
  };
  const point = {
    name: `${station.name} Jump Coordinate`,
    x: planet.x + direction.x * exitDistance,
    y: planet.y + direction.y * exitDistance,
    z: planet.z + direction.z * exitDistance,
    color: copyColorForStation(station)
  };
  const transferDistance = distance3d(station, point);
  const label = station.location_type === "orbital" ? "SOI exit jump coordinate" : "Jump coordinate";
  return {
    planet,
    label,
    point,
    transferDistance,
    travelSeconds: transferDistance / CRUISE_SPEED_MPS,
    gps: `GPS:${point.name}:${point.x.toFixed(3)}:${point.y.toFixed(3)}:${point.z.toFixed(3)}:${normalizeGpsColor(point.color)}:`
  };
}

function shouldUseSharedDatabase() {
  const isLocalHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const forceShared = new URLSearchParams(window.location.search).get("shared") === "1";
  return (!isLocalHost || forceShared) && Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function configureStorage() {
  if (shouldUseSharedDatabase()) {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
}

async function loadSharedFactions() {
  if (!supabaseClient) return;
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
      trade: faction.sells || "",
      updated_at: faction.updated_at
    }
  ]));
}

async function loadStationRecord(stationId) {
  if (!supabaseClient) {
    return readJson(LOCAL_STORAGE_KEY, []).find((item) => item.id === stationId) || null;
  }
  const { data, error } = await supabaseClient
    .from("coordinates")
    .select("*")
    .eq("id", stationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

async function replaceStation(updated) {
  if (supabaseClient) {
    const { error } = await supabaseClient.rpc("update_coordinate_admin", {
      p_admin_code: ADMIN_PASSWORD,
      p_id: updated.id,
      p_raw_text: updated.raw_text,
      p_name: updated.name,
      p_x: updated.x,
      p_y: updated.y,
      p_z: updated.z,
      p_color: updated.color,
      p_planet: updated.planet,
      p_location_type: updated.location_type,
      p_faction_tag: updated.faction_tag,
      p_faction_name: updated.faction_name || "",
      p_has_zone_chips: Boolean(updated.has_zone_chips),
      p_sells_ships: Boolean(updated.sells_ships),
      p_sells_h2_gas: Boolean(updated.sells_h2_gas),
      p_sells_o2_gas: Boolean(updated.sells_o2_gas),
      p_altitude_m: updated.altitude_m,
      p_center_distance_m: updated.center_distance_m,
      p_notes: updated.notes,
      p_submitted_by: updated.submitted_by
    });
    if (error) throw new Error(error.message);
    return;
  }
  const records = readJson(LOCAL_STORAGE_KEY, []);
  writeJson(LOCAL_STORAGE_KEY, records.map((record) => record.id === updated.id ? updated : record));
}

async function deleteStation(recordId) {
  if (supabaseClient) {
    const { error } = await supabaseClient.rpc("delete_coordinate_admin", {
      p_admin_code: ADMIN_PASSWORD,
      p_id: recordId
    });
    if (error) throw new Error(error.message);
    return;
  }
  const records = readJson(LOCAL_STORAGE_KEY, []);
  writeJson(LOCAL_STORAGE_KEY, records.filter((record) => record.id !== recordId));
}

function normalizeFactionTag(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

function inferFaction(tag) {
  const normalized = normalizeFactionTag(tag);
  const custom = supabaseClient ? customFactions[normalized] : readJson(LOCAL_FACTIONS_KEY, {})[normalized];
  if (custom) return custom;
  if (normalized.length !== 4) return null;
  const prefix = ECONOMY_FACTION_PREFIXES[normalized.slice(0, 2)];
  const suffix = ECONOMY_FACTION_SUFFIXES[normalized.slice(2)];
  if (!suffix) return null;
  return {
    tag: normalized,
    name: prefix ? `${prefix} ${suffix.suffixName}` : suffix.suffixName,
    category: suffix.category
  };
}

function factionGoodsSummary(category) {
  return tradeLabel(factionDefaultTradeItem(category));
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

function factionTradeSummary(faction) {
  return tradeLabel(faction?.trade || faction?.sells || factionDefaultTradeItem(faction?.category));
}

function typeLabel(type) {
  return {
    surface: "Surface",
    orbital: "Orbital",
    deep_space: "Deep space"
  }[type] || type;
}

function formatMeters(value) {
  const absolute = Math.abs(value);
  if (absolute >= 1000) return `${(value / 1000).toFixed(2)} km`;
  return `${Math.round(value)} m`;
}

function formatDuration(seconds) {
  const rounded = Math.max(0, Math.round(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;
  if (hours) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function planetColorHex(planetName) {
  const numeric = PLANET_COLORS[planetName] || 0x9ba7b4;
  return `#${numeric.toString(16).padStart(6, "0")}`;
}

function locationRows(record) {
  if (record.location_type === "deep_space") {
    return `<div><dt>Location</dt><dd><span class="location-line deep-space-location"><span class="location-icon deep-space-icon" aria-hidden="true"></span><span>Deep space</span></span></dd></div>`;
  }
  return `
    <div><dt>Planet</dt><dd><span class="location-line"><span class="location-icon planet-icon" style="--planet-color: ${planetColorHex(record.planet)};" aria-hidden="true"></span><span>${escapeHtml(record.planet)}</span></span></dd></div>
    <div><dt>Location</dt><dd><span class="location-line"><span class="location-type-inline"><span class="location-icon ${record.location_type === "surface" ? "surface-icon" : "orbital-icon"}" aria-hidden="true"></span>${typeLabel(record.location_type)}</span> / ${formatMeters(record.altitude_m)} altitude</span></dd></div>
  `;
}

function economyIconClass(category) {
  return {
    Miner: "economy-miner-icon",
    Trader: "economy-trader-icon",
    Builder: "economy-builder-icon"
  }[category] || "economy-generic-icon";
}

async function renderStation() {
  const id = new URLSearchParams(window.location.search).get("id");
  try {
    await loadSharedFactions();
    station = await loadStationRecord(id);
  } catch (error) {
    elements.title.textContent = "Station load failed";
    elements.subtitle.textContent = error.message;
    elements.details.innerHTML = `<div class="empty">Could not load this station from storage.</div>`;
    return;
  }
  if (!station) {
    elements.title.textContent = "Station not found";
    elements.subtitle.textContent = "Return to the index and choose a station again.";
    elements.details.innerHTML = `<div class="empty">This station is not available in local storage.</div>`;
    return;
  }

  const faction = inferFaction(station.faction_tag);
  const factionName = station.faction_name || faction?.name || "Unknown faction";
  const color = colorForFaction(faction);
  const factionUrl = `factions.html?faction=${encodeURIComponent(station.faction_tag || "")}`;
  const displayStationGps = stationCopyGps();
  const flags = [
    station.has_zone_chips ? "Zone chips" : "",
    station.sells_ships ? "Ships" : "",
    station.sells_h2_gas ? "H2 gas" : "",
    station.sells_o2_gas ? "O2 gas" : ""
  ].filter(Boolean);
  const jump = stationJumpCoordinate();
  const jumpRow = jump ? `
      <div>
        <dt>Jump Coordinates</dt>
        <dd>
          <button class="gps-line gps-copy-link" type="button" data-copy-detail="jump" title="Copy Coordinates">${escapeHtml(jump.gps)}</button>
          <span class="station-detail-note">${formatMeters(jump.transferDistance)} transfer / Transfer Time: ${formatDuration(jump.travelSeconds)} at ${CRUISE_SPEED_MPS} m/s</span>
        </dd>
      </div>
  ` : "";

  elements.title.textContent = station.name;
  elements.subtitle.textContent = `${station.faction_tag || "----"} - ${factionName}`;
  document.title = `${station.name} - SAC Star System Hub`;
  elements.details.innerHTML = `
    <dl class="station-detail-list station-detail-page-list">
      ${locationRows(station)}
      <div><dt>Faction</dt><dd><a class="faction-detail-link" href="${factionUrl}"><span class="station-type" style="--faction-color: ${color.hex}; --faction-bg: ${color.dim};">${escapeHtml(faction?.category || "Unknown")}</span> ${escapeHtml(factionName)}</a></dd></div>
      <div><dt>Economy</dt><dd><span class="economy-line"><span class="economy-icon ${economyIconClass(faction?.category)}" aria-hidden="true"></span><span>${escapeHtml(factionTradeSummary(faction))}</span></span></dd></div>
      <div><dt>Extras</dt><dd><span class="station-flags">${flags.length ? flags.map((flag) => `<span>${escapeHtml(flag)}</span>`).join("") : `<span class="muted-inline">None marked</span>`}</span></dd></div>
      <div>
        <dt>Coordinates</dt>
        <dd>
          <button class="gps-line gps-copy-link" type="button" data-copy-detail="station" title="Copy Coordinates">${escapeHtml(displayStationGps)}</button>
        </dd>
      </div>
      ${jumpRow}
      <div><dt>Submitted</dt><dd>${escapeHtml(station.submitted_by || "Unknown")}</dd></div>
      ${station.notes ? `<div><dt>Notes</dt><dd>${escapeHtml(station.notes)}</dd></div>` : ""}
    </dl>
  `;
  renderComments();
  renderActionPanel();
  scheduleMapInit();
}

function renderAdminPlanetOptions() {
  elements.adminPlanetInput.innerHTML = [
    ...PLANETS.map((planet) => `<option value="${escapeHtml(planet.name)}">${escapeHtml(planet.name)}</option>`),
    `<option value="Deep Space">Deep Space</option>`
  ].join("");
}

function renderActionPanel() {
  const hasJump = Boolean(stationJumpCoordinate());
  elements.copyJumpButton.hidden = !hasJump;
  elements.adminModeButton.hidden = adminAuthenticated;
  elements.exitAdminModeButton.hidden = !adminAuthenticated;
  elements.editButton.disabled = !adminAuthenticated;
  elements.deleteButton.disabled = !adminAuthenticated;
  elements.editButton.title = adminAuthenticated ? "" : "Enter admin mode to edit";
  elements.deleteButton.title = adminAuthenticated ? "" : "Enter admin mode to delete";
}

async function commentsForStation() {
  if (!supabaseClient) return readJson(LOCAL_COMMENTS_KEY, {})[station?.id] || [];
  const { data, error } = await supabaseClient
    .from("station_comments")
    .select("id,author,comment_text,created_at")
    .eq("coordinate_id", station.id)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((comment) => ({
    id: comment.id,
    author: comment.author,
    text: comment.comment_text,
    created_at: comment.created_at
  }));
}

async function renderComments() {
  elements.commentThread.innerHTML = `<div class="empty">Loading comments...</div>`;
  try {
    const comments = await commentsForStation();
    elements.commentThread.innerHTML = comments.length
      ? comments.map((comment) => `
        <article class="comment-item">
          <strong>${escapeHtml(comment.author || "Anonymous")}</strong>
          <span>${new Date(comment.created_at).toLocaleString()}</span>
          <p>${escapeHtml(comment.text)}</p>
        </article>
      `).join("")
      : `<div class="empty">No comments yet.</div>`;
  } catch (error) {
    elements.commentThread.innerHTML = `<div class="empty">Could not load comments: ${escapeHtml(error.message)}</div>`;
  }
}

async function addComment(author, text) {
  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("station_comments")
      .insert({
        coordinate_id: station.id,
        author,
        comment_text: text
      });
    if (error) throw new Error(error.message);
    return;
  }
  const comments = readJson(LOCAL_COMMENTS_KEY, {});
  comments[station.id] = [
    ...(comments[station.id] || []),
    { id: crypto.randomUUID(), author, text, created_at: new Date().toISOString() }
  ];
  writeJson(LOCAL_COMMENTS_KEY, comments);
}

function mapPosition(point) {
  const THREE = window.THREE;
  return new THREE.Vector3(point.x * MAP_SCALE, point.y * MAP_SCALE, point.z * MAP_SCALE);
}

function initMap() {
  if (!station || canvasMapState) return Boolean(canvasMapState);
  initCanvasMap();
  return true;
}

function initCanvasMap() {
  if (!station || canvasMapState) return;
  const canvas = document.createElement("canvas");
  canvas.className = "station-canvas-map";
  elements.mapViewport.append(canvas);
  elements.mapFallback.hidden = true;
  canvasMapState = { canvas, context: canvas.getContext("2d") };
  canvas.addEventListener("click", handleCanvasMapClick);
  canvas.addEventListener("mousemove", handleCanvasMapPointerMove);
  drawCanvasMap();
  window.addEventListener("resize", drawCanvasMap);
}

function boxesOverlap(a, b, pad = 8) {
  return !(
    a.x + a.width + pad < b.x ||
    b.x + b.width + pad < a.x ||
    a.y + a.height + pad < b.y ||
    b.y + b.height + pad < a.y
  );
}

function placeLabelBox(box, placed, canvasWidth, canvasHeight) {
  const step = 58;
  const options = [
    { x: box.x, y: box.y },
    { x: box.x, y: box.y + step },
    { x: box.x, y: box.y - step },
    { x: box.x - step, y: box.y },
    { x: box.x + step, y: box.y },
    { x: box.x, y: box.y + step * 2 },
    { x: box.x, y: box.y - step * 2 }
  ];
  for (const option of options) {
    const candidate = {
      ...box,
      x: Math.max(12, Math.min(option.x, canvasWidth - box.width - 12)),
      y: Math.max(12, Math.min(option.y, canvasHeight - box.height - 12))
    };
    if (!placed.some((item) => boxesOverlap(candidate, item))) {
      placed.push(candidate);
      return candidate;
    }
  }
  const fallback = {
    ...box,
    x: Math.max(12, Math.min(box.x, canvasWidth - box.width - 12)),
    y: Math.max(12, Math.min(box.y, canvasHeight - box.height - 12))
  };
  placed.push(fallback);
  return fallback;
}

function drawMapLabel(context, { x, y, title, subtitle, color = "#eef3f8", target, placedLabels = [] }) {
  const width = 248;
  const height = subtitle ? 48 : 32;
  const canvasWidth = context.canvas.width / (window.devicePixelRatio || 1);
  const canvasHeight = context.canvas.height / (window.devicePixelRatio || 1);
  const box = placeLabelBox({ x, y, width, height }, placedLabels, canvasWidth, canvasHeight);

  context.save();
  context.fillStyle = "rgba(5, 8, 13, 0.78)";
  context.strokeStyle = "rgba(238, 243, 248, 0.18)";
  context.lineWidth = 1;
  context.beginPath();
  roundedCanvasRect(context, box.x, box.y, width, height, 8);
  context.fill();
  context.stroke();

  if (target) {
    const anchorX = Math.max(box.x, Math.min(target.x, box.x + width));
    const anchorY = Math.max(box.y, Math.min(target.y, box.y + height));
    const dx = target.x - anchorX;
    const dy = target.y - anchorY;
    const length = Math.hypot(dx, dy) || 1;
    const endX = target.x - (dx / length) * 12;
    const endY = target.y - (dy / length) * 12;
    context.strokeStyle = "rgba(238, 243, 248, 0.42)";
    context.beginPath();
    context.moveTo(anchorX, anchorY);
    context.lineTo(endX, endY);
    context.stroke();
  }

  context.fillStyle = color;
  context.font = "700 12px Segoe UI, sans-serif";
  context.fillText(title, box.x + 10, box.y + 18, width - 20);
  if (subtitle) {
    context.fillStyle = "#9ba7b4";
    context.font = "12px Segoe UI, sans-serif";
    context.fillText(subtitle, box.x + 10, box.y + 36, width - 20);
  }
  context.restore();
  return box;
}

function drawCenteredPlanetName(context, name, point) {
  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "800 14px Segoe UI, sans-serif";
  context.lineWidth = 4;
  context.strokeStyle = "rgba(5, 8, 13, 0.78)";
  context.strokeText(name, point.x, point.y);
  context.fillStyle = "#eef3f8";
  context.fillText(name, point.x, point.y);
  context.restore();
}

function roundedCanvasRect(context, x, y, width, height, radius) {
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

async function copyJumpFromMap() {
  const jump = stationJumpCoordinate();
  if (!jump) return;
  await copyToClipboard(jump.gps);
  elements.message.className = "message good";
  elements.message.textContent = "Jump coordinates copied.";
  showMapToast("Jump coordinates copied");
}

async function copyStationFromMap() {
  if (!station) return;
  await copyToClipboard(stationCopyGps());
  elements.message.className = "message good";
  elements.message.textContent = "Station coordinates copied.";
  showMapToast("Station coordinates copied");
}

function showMapToast(text) {
  mapToast = { text, until: Date.now() + 1600 };
  drawCanvasMap();
}

function handleCanvasMapClick(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (latestJumpHitbox && isPointInBox(x, y, latestJumpHitbox)) {
    copyJumpFromMap();
    return;
  }
  if (
    (latestStationHitbox && isPointInBox(x, y, latestStationHitbox)) ||
    (latestStationMarkerHitbox && isPointInBox(x, y, latestStationMarkerHitbox))
  ) {
    copyStationFromMap();
  }
}

function handleCanvasMapPointerMove(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  event.currentTarget.style.cursor = [latestJumpHitbox, latestStationHitbox, latestStationMarkerHitbox].some((hit) => hit && isPointInBox(x, y, hit)) ? "pointer" : "";
}

function isPointInBox(x, y, box) {
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
}

function drawCanvasMap() {
  if (!canvasMapState || !station) return;
  latestJumpHitbox = null;
  latestStationHitbox = null;
  latestStationMarkerHitbox = null;
  const { canvas, context } = canvasMapState;
  const rect = elements.mapViewport.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(360, Math.floor(rect.height));
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);
  const placedLabels = [];

  const nearestPlanet = nearestBodyForStation();
  const jump = stationJumpCoordinate();
  const body = nearestPlanet?.planet;
  const bodyDistance = nearestPlanet?.distance || 1;
  const bodyRadius = body?.radius || 60000;
  const stationAltitude = body ? bodyDistance - bodyRadius : 0;
  const soiRadius = bodyRadius * GRAVITY_FIELD_RADIUS_MULTIPLIER;
  const margin = 54;
  const jumpDistance = jump ? distance3d(jump.point, body) : 0;
  const maxBodyDistance = Math.max(bodyDistance, jumpDistance);
  const isDeepSpace = station.location_type === "deep_space";
  const horizontalScale = (width - margin * 2) / Math.max(maxBodyDistance + soiRadius, soiRadius * 2);
  const verticalScale = (height - margin * 2) / Math.max(soiRadius * 2, bodyRadius * 2);
  const scale = isDeepSpace ? 0.00115 : Math.max(0.00008, Math.min(horizontalScale, verticalScale));
  const bodyPoint = {
    x: Math.max(margin + soiRadius * scale, width * 0.24),
    y: height / 2
  };
  const stationPoint = {
    x: isDeepSpace ? width / 2 : bodyPoint.x + bodyDistance * scale,
    y: height / 2
  };
  const jumpPoint = jump ? {
    x: bodyPoint.x + jumpDistance * scale,
    y: bodyPoint.y
  } : null;

  if (isDeepSpace) {
    bodyPoint.x = stationPoint.x;
    bodyPoint.y = stationPoint.y;
  };

  const gradient = context.createRadialGradient(stationPoint.x, stationPoint.y, 24, stationPoint.x, stationPoint.y, Math.max(width, height) * 0.7);
  gradient.addColorStop(0, "#101720");
  gradient.addColorStop(1, "#05080d");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(73, 214, 181, 0.12)";
  context.lineWidth = 1;
  const grid = 48;
  for (let x = stationPoint.x % grid; x < width; x += grid) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = stationPoint.y % grid; y < height; y += grid) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  if (body && !isDeepSpace) {
    const planetRadiusPx = bodyRadius * scale;
    const soiRadiusPx = soiRadius * scale;
    const altitude = bodyDistance - bodyRadius;

    context.beginPath();
    context.arc(bodyPoint.x, bodyPoint.y, soiRadiusPx, 0, Math.PI * 2);
    context.fillStyle = "rgba(73, 214, 181, 0.07)";
    context.fill();
    context.strokeStyle = "rgba(73, 214, 181, 0.35)";
    context.setLineDash([8, 8]);
    context.stroke();
    context.setLineDash([]);

    context.beginPath();
    context.arc(bodyPoint.x, bodyPoint.y, planetRadiusPx, 0, Math.PI * 2);
    context.fillStyle = planetColorHex(body.name);
    context.globalAlpha = 0.88;
    context.fill();
    context.globalAlpha = 1;
    context.strokeStyle = "rgba(238, 243, 248, 0.48)";
    context.lineWidth = 1.5;
    context.stroke();

    context.strokeStyle = "rgba(238, 243, 248, 0.28)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(bodyPoint.x, bodyPoint.y);
    context.lineTo(stationPoint.x, stationPoint.y);
    context.stroke();

    const surfaceX = bodyPoint.x + planetRadiusPx;
    if (altitude > 1) {
      context.strokeStyle = "rgba(243, 201, 105, 0.55)";
      context.beginPath();
      context.moveTo(surfaceX, stationPoint.y + 18);
      context.lineTo(stationPoint.x, stationPoint.y + 18);
      context.stroke();
    }

    if (jump && jumpPoint) {
      context.strokeStyle = "rgba(73, 214, 181, 0.78)";
      context.lineWidth = 1.5;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(stationPoint.x, stationPoint.y - 18);
      context.lineTo(jumpPoint.x, jumpPoint.y - 18);
      context.stroke();
      context.setLineDash([]);

      context.beginPath();
      context.arc(jumpPoint.x, jumpPoint.y, 7, 0, Math.PI * 2);
      context.fillStyle = "#49d6b5";
      context.shadowColor = "#49d6b5";
      context.shadowBlur = 14;
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = "#ffffff";
      context.stroke();

    }

    drawCenteredPlanetName(context, body.name, bodyPoint);
    drawMapLabel(context, {
      x: bodyPoint.x - 124,
      y: 16,
      title: "Gravity SOI",
      subtitle: `${formatMeters(soiRadius)} radius`,
      color: "#49d6b5",
      target: { x: bodyPoint.x, y: bodyPoint.y - soiRadiusPx },
      placedLabels
    });
    if (jump && jumpPoint) {
      latestJumpHitbox = drawMapLabel(context, {
        x: jumpPoint.x + 18,
        y: jumpPoint.y - 72,
        title: jump.label,
        subtitle: `Transfer Time: ${formatDuration(jump.travelSeconds)} - click`,
        color: "#49d6b5",
        target: jumpPoint,
        placedLabels
      });
    }
  } else if (body) {
    const dx = body.x - station.x;
    const dz = body.z - station.z;
    const length = Math.hypot(dx, dz) || 1;
    const arrowLength = Math.min(width, height) * 0.32;
    const endX = stationPoint.x + (dx / length) * arrowLength;
    const endY = stationPoint.y + (dz / length) * arrowLength;
    context.strokeStyle = "rgba(73, 214, 181, 0.72)";
    context.fillStyle = "#49d6b5";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(stationPoint.x, stationPoint.y);
    context.lineTo(endX, endY);
    context.stroke();
    const angle = Math.atan2(endY - stationPoint.y, endX - stationPoint.x);
    context.beginPath();
    context.moveTo(endX, endY);
    context.lineTo(endX - Math.cos(angle - 0.55) * 12, endY - Math.sin(angle - 0.55) * 12);
    context.lineTo(endX - Math.cos(angle + 0.55) * 12, endY - Math.sin(angle + 0.55) * 12);
    context.closePath();
    context.fill();
    drawMapLabel(context, {
      x: endX + 18,
      y: endY - 24,
      title: body.name,
      subtitle: `${formatMeters(bodyDistance)} away`,
      color: "#49d6b5",
      target: { x: endX, y: endY },
      placedLabels
    });
  }

  const faction = inferFaction(station.faction_tag);
  const color = FACTION_TYPE_COLORS[faction?.category || "Unknown"] || FACTION_TYPE_COLORS.Unknown;
  context.strokeStyle = "rgba(255, 255, 255, 0.35)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(stationPoint.x - 15, stationPoint.y);
  context.lineTo(stationPoint.x + 15, stationPoint.y);
  context.moveTo(stationPoint.x, stationPoint.y - 15);
  context.lineTo(stationPoint.x, stationPoint.y + 15);
  context.stroke();
  context.beginPath();
  context.arc(stationPoint.x, stationPoint.y, 9, 0, Math.PI * 2);
  context.fillStyle = color.hex;
  context.shadowColor = color.hex;
  context.shadowBlur = 18;
  context.fill();
  context.shadowBlur = 0;
  context.strokeStyle = "#ffffff";
  context.stroke();
  if (["orbital", "deep_space"].includes(station.location_type)) {
    latestStationMarkerHitbox = { x: stationPoint.x - 16, y: stationPoint.y - 16, width: 32, height: 32 };
  }

  const altitudeText = !isDeepSpace && body ? ` / Altitude: ${formatMeters(stationAltitude)}` : "";
  const stationSubtitle = ["orbital", "deep_space"].includes(station.location_type)
    ? `${typeLabel(station.location_type)}${altitudeText} - click to copy`
    : `${typeLabel(station.location_type)}${altitudeText}`;
  const stationLabelOutsideSoiX = body && !isDeepSpace
    ? (bodyPoint.x + soiRadius * scale + 230 < width
      ? bodyPoint.x + soiRadius * scale + 18
      : bodyPoint.x - soiRadius * scale - 266)
    : stationPoint.x + 18;
  latestStationHitbox = drawMapLabel(context, {
    x: stationLabelOutsideSoiX,
    y: stationPoint.y - 24,
    title: station.name,
    subtitle: stationSubtitle,
    color: color.hex,
    target: stationPoint,
    placedLabels
  });
  if (!["orbital", "deep_space"].includes(station.location_type)) {
    latestStationHitbox = null;
  }
  context.fillStyle = "#9ba7b4";
  context.font = "12px Segoe UI, sans-serif";
  context.fillText("2D local chart - true range from nearest planet/moon", 18, height - 18);
  drawMapToast(context, width);
}

function drawMapToast(context, width) {
  if (!mapToast || Date.now() > mapToast.until) {
    mapToast = null;
    return;
  }
  const boxWidth = 220;
  const boxHeight = 34;
  const x = Math.max(12, width / 2 - boxWidth / 2);
  const y = 18;
  context.save();
  context.fillStyle = "rgba(18, 61, 55, 0.92)";
  context.strokeStyle = "rgba(73, 214, 181, 0.75)";
  context.beginPath();
  roundedCanvasRect(context, x, y, boxWidth, boxHeight, 8);
  context.fill();
  context.stroke();
  context.fillStyle = "#e9fff8";
  context.font = "700 12px Segoe UI, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(mapToast.text, x + boxWidth / 2, y + boxHeight / 2);
  context.restore();
  setTimeout(drawCanvasMap, Math.max(0, mapToast.until - Date.now()));
}

function scheduleMapInit() {
  if (initMap()) return;
  if (!mapRetryStartedAt) {
    mapRetryStartedAt = Date.now();
  }
  if (Date.now() - mapRetryStartedAt > 8000) {
    showStationMapError("3D map unavailable. Three.js did not finish loading.");
    return;
  }
  clearTimeout(mapRetryTimer);
  mapRetryTimer = setTimeout(scheduleMapInit, 250);
}

function showStationMapError(message) {
  if (mapState) return;
  clearTimeout(mapRetryTimer);
  elements.mapFallback.hidden = false;
  elements.mapFallback.textContent = message;
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
  mapState.renderer.render(mapState.scene, mapState.camera);
  requestAnimationFrame(animateMap);
}

function rebuildMap() {
  if (!mapState && !canvasMapState) return;
  mapState?.renderer.domElement.remove();
  canvasMapState?.canvas.remove();
  mapState = null;
  canvasMapState = null;
  mapRetryStartedAt = 0;
  elements.mapFallback.hidden = false;
  elements.mapFallback.textContent = "Loading map...";
  scheduleMapInit();
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
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
}

elements.copyButton.addEventListener("click", async () => {
  if (!station) return;
  await copyToClipboard(stationCopyGps());
  elements.copyButton.textContent = "Copied";
  elements.copyButton.classList.add("copied");
  setTimeout(() => {
    elements.copyButton.textContent = "Copy Coords";
    elements.copyButton.classList.remove("copied");
  }, 1400);
});

elements.copyJumpButton.addEventListener("click", async () => {
  const jump = stationJumpCoordinate();
  if (!jump) return;
  await copyToClipboard(jump.gps);
  elements.copyJumpButton.textContent = "Copied";
  elements.copyJumpButton.classList.add("copied");
  elements.message.className = "message good";
  elements.message.textContent = "Jump coordinates copied.";
  setTimeout(() => {
    elements.copyJumpButton.textContent = "Copy Jump Coords";
    elements.copyJumpButton.classList.remove("copied");
  }, 1400);
});

elements.details.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-detail]");
  if (!button) return;
  const copyType = button.dataset.copyDetail;
  const jump = copyType === "jump" ? stationJumpCoordinate() : null;
  const text = copyType === "jump" ? jump?.gps : stationCopyGps();
  if (!text) return;
  await copyToClipboard(text);
  const originalText = button.textContent;
  button.textContent = "Copied";
  button.classList.add("copied");
  elements.message.className = "message good";
  elements.message.textContent = copyType === "jump" ? "Jump coordinates copied." : "Station coordinates copied.";
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("copied");
  }, 1400);
});

elements.resetMapButton.addEventListener("click", () => {
  if (!mapState || !station) return;
  mapState.target.copy(mapPosition(station));
  mapState.distance = station.location_type === "deep_space" ? 44 : 28;
  updateCamera();
});

elements.commentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!station) return;
  const text = elements.commentTextInput.value.trim();
  if (!text) return;
  try {
    await addComment(elements.commentAuthorInput.value.trim(), text);
    elements.commentTextInput.value = "";
    elements.message.className = "message good";
    elements.message.textContent = "Comment added.";
    await renderComments();
  } catch (error) {
    elements.message.className = "message bad";
    elements.message.textContent = error.message;
  }
});

function openAdminModal(action) {
  if (!station) return;
  if (["edit", "delete"].includes(action) && !adminAuthenticated) {
    elements.message.className = "message bad";
    elements.message.textContent = "Enter admin mode before editing or deleting.";
    return;
  }
  pendingAdminAction = action;
  elements.adminForm.reset();
  elements.adminMessage.textContent = "";
  elements.adminMessage.className = "message";
  elements.adminTitle.textContent = action === "admin" ? "Admin Mode" : action === "edit" ? `Edit ${station.name}` : `Delete ${station.name}`;
  elements.adminConfirmButton.textContent = action === "admin" ? "Enter Admin Mode" : action === "edit" ? "Save Changes" : "Delete Station";
  elements.adminConfirmButton.classList.toggle("danger-button", action === "delete");
  elements.adminEditFields.hidden = action !== "edit";
  elements.adminEditFields.querySelectorAll("input, select, textarea").forEach((field) => {
    field.disabled = action !== "edit";
  });
  setAdminPasswordPromptVisible(action === "admin");

  elements.adminNameInput.value = station.name;
  elements.adminFactionInput.value = station.faction_tag || "";
  elements.adminFactionNameInput.value = station.faction_name || "";
  elements.adminZoneChipInput.checked = Boolean(station.has_zone_chips);
  elements.adminSellsShipsInput.checked = Boolean(station.sells_ships);
  elements.adminSellsH2Input.checked = Boolean(station.sells_h2_gas);
  elements.adminSellsO2Input.checked = Boolean(station.sells_o2_gas);
  elements.adminPlanetInput.value = station.planet;
  elements.adminLocationInput.value = station.location_type;
  elements.adminNotesInput.value = station.notes || "";
  elements.adminSubmitterInput.value = station.submitted_by || "";
  if (action === "delete") {
    elements.adminMessage.className = "message bad";
    elements.adminMessage.textContent = `Are you sure you want to delete ${station.name}? This cannot be undone.`;
  }
  elements.adminModal.hidden = false;
  if (action !== "admin") {
    elements.adminConfirmButton.focus();
  } else {
    elements.adminPasswordInput.focus();
  }
}

function closeAdminModal() {
  pendingAdminAction = null;
  elements.adminEditFields.querySelectorAll("input, select, textarea").forEach((field) => {
    field.disabled = false;
  });
  setAdminPasswordPromptVisible(true);
  elements.adminModal.hidden = true;
}

function setAdminPasswordPromptVisible(visible) {
  elements.adminPasswordLabel.hidden = !visible;
  elements.adminPasswordLabel.style.display = visible ? "" : "none";
  elements.adminPasswordInput.required = visible;
  if (!visible) elements.adminPasswordInput.value = "";
}

function keepAdminModalInputOpen(event) {
  if (event.key !== "Enter") return;
  const target = event.target;
  if (target?.tagName === "TEXTAREA") return;
  if (target?.closest("button")) return;
  event.preventDefault();
}

elements.editButton.addEventListener("click", () => openAdminModal("edit"));
elements.deleteButton.addEventListener("click", () => openAdminModal("delete"));
elements.adminModeButton.addEventListener("click", () => openAdminModal("admin"));
elements.exitAdminModeButton.addEventListener("click", () => {
  adminAuthenticated = false;
  renderActionPanel();
  elements.message.className = "message";
  elements.message.textContent = "Admin mode exited.";
});
elements.adminCancelButton.addEventListener("click", closeAdminModal);
elements.adminForm.addEventListener("click", (event) => event.stopPropagation());
elements.adminForm.addEventListener("pointerdown", (event) => event.stopPropagation());
elements.adminForm.addEventListener("keydown", keepAdminModalInputOpen);
elements.adminModal.addEventListener("click", (event) => {
  if (event.target === elements.adminModal) closeAdminModal();
});
elements.adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!station || !pendingAdminAction) return;
  if (pendingAdminAction === "admin" && elements.adminPasswordInput.value !== ADMIN_PASSWORD) {
    elements.adminMessage.className = "message bad";
    elements.adminMessage.textContent = "Wrong password.";
    return;
  }

  if (pendingAdminAction === "admin") {
    adminAuthenticated = true;
    renderActionPanel();
    closeAdminModal();
    elements.message.className = "message good";
    elements.message.textContent = "Admin mode enabled.";
    return;
  }

  if (pendingAdminAction === "delete") {
    const deletedName = station.name;
    try {
      await deleteStation(station.id);
      closeAdminModal();
      elements.message.className = "message good";
      elements.message.textContent = `${deletedName} deleted. Returning to the index...`;
      setTimeout(() => {
        window.location.href = "index.html";
      }, 700);
    } catch (error) {
      elements.adminMessage.className = "message bad";
      elements.adminMessage.textContent = error.message;
    }
    return;
  }

  try {
    const name = elements.adminNameInput.value.trim();
    const submittedBy = elements.adminSubmitterInput.value.trim();
    if (!name) throw new Error("Station name is required.");
    if (!submittedBy) throw new Error("Submitted by is required.");
    const updated = {
      ...station,
      raw_text: gpsStringForEdit(station, { name, x: station.x, y: station.y, z: station.z, color: station.color }),
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
    await replaceStation(updated);
    station = updated;
    closeAdminModal();
    elements.message.className = "message good";
    elements.message.textContent = `${updated.name} updated.`;
    rebuildMap();
    renderStation();
  } catch (error) {
    elements.adminMessage.className = "message bad";
    elements.adminMessage.textContent = error.message;
  }
});

window.initializeStationMap = scheduleMapInit;
window.showStationMapError = showStationMapError;

configureStorage();
renderAdminPlanetOptions();
renderStation();
