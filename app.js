const DUPLICATE_DISTANCE_M = 1000;
const SURFACE_ALTITUDE_M = 5000;
const ORBITAL_ALTITUDE_M = 150000;
const LOCAL_STORAGE_KEY = "se-coordinate-registry";
const LOCAL_STORAGE_VERSION_KEY = "se-coordinate-registry-version";
const LOCAL_STORAGE_VERSION = "2026-05-faction-derived-reset";
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
  resetMapButton: document.querySelector("#resetMapButton"),
  mapViewport: document.querySelector("#mapViewport"),
  mapFallback: document.querySelector("#mapFallback"),
  mapList: document.querySelector("#mapList"),
  storageDot: document.querySelector("#storageDot"),
  storageMode: document.querySelector("#storageMode"),
  storageDetail: document.querySelector("#storageDetail")
};

let coordinates = [];
let supabaseClient = null;
let mapState = null;

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
    sells: `${profile.sells}; stock can reroll and may include zone chips`,
    category: profile.category,
    tradePurposes: tradePurposesForCategory(profile.category),
    inferred: true
  };
}

function resolveFaction(tag) {
  return inferFactionProfile(tag);
}

function tradePurposesForCategory(category) {
  return {
    Builder: ["ships", "components", "zone_chips"],
    Miner: ["ore", "zone_chips"],
    Trader: ["components", "zone_chips"],
    Pirate: ["weapons", "zone_chips"]
  }[category] || ["unknown"];
}

function factionColor(faction) {
  return FACTION_TYPE_COLORS[faction?.category || "Unknown"] || FACTION_TYPE_COLORS.Unknown;
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
    altitude_m: classification.altitude,
    center_distance_m: classification.centerDistance,
    notes: extra.notes || "",
    submitted_by: extra.submittedBy || "",
    created_at: new Date().toISOString()
  };
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
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem("se-coordinate-factions");
    localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, LOCAL_STORAGE_VERSION);
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalRecords(records) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
}

function configureStorage() {
  const hasSupabaseConfig = Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);

  if (hasSupabaseConfig) {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    elements.storageDot.classList.add("online");
    elements.storageMode.textContent = "Shared database mode";
    elements.storageDetail.textContent = "Entries are loaded from Supabase.";
    return;
  }

  elements.storageMode.textContent = "Local demo mode";
  elements.storageDetail.textContent = "Entries stay in this browser until Supabase is connected.";
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
    const matchesTrade = trade === "all" || (faction?.tradePurposes || ["unknown"]).includes(trade);
    const haystack = [
      record.name,
      record.raw_text,
      record.planet,
      typeLabel(record.location_type),
      record.notes,
      record.submitted_by,
      record.faction_tag,
      faction?.name,
      faction?.firstName,
      faction?.secondName,
      faction?.category,
      faction?.sells
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

function renderRecordCard(record) {
  const faction = resolveFaction(record.faction_tag);
  const color = factionColor(faction);
  const displayName = faction?.firstName && faction?.secondName
    ? `${record.name} (${faction.firstName} ${faction.secondName})`
    : faction?.name
      ? `${record.name} (${faction.name})`
      : record.name;
  const factionType = faction
    ? `<span class="pill faction-pill" style="--faction-color: ${color.hex}; --faction-bg: ${color.dim};">Type ${escapeHtml(faction.category)}</span>`
    : "";
  const sellsSummary = faction?.sells ? `<span class="pill faction-pill" style="--faction-color: ${color.hex}; --faction-bg: ${color.dim};">${escapeHtml(faction.sells)}</span>` : "";

  return `
    <article class="coordinate-card">
      <div>
        <h3>${escapeHtml(displayName)}</h3>
        <div class="gps-line">${escapeHtml(record.raw_text)}</div>
        ${record.notes ? `<p>${escapeHtml(record.notes)}</p>` : ""}
        <div class="meta">
          <span class="pill">${escapeHtml(record.planet)}</span>
          <span class="pill">${typeLabel(record.location_type)}</span>
          <span class="pill">Altitude ${formatMeters(record.altitude_m)}</span>
          ${factionType}
          ${sellsSummary}
          ${record.submitted_by ? `<span class="pill">By ${escapeHtml(record.submitted_by)}</span>` : ""}
        </div>
      </div>
      <div class="card-actions">
        <button class="copy-button" type="button" data-copy-id="${escapeHtml(record.id)}">Copy Coords</button>
        <div class="pill">${new Date(record.created_at).toLocaleDateString()}</div>
      </div>
    </article>
  `;
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
    if (record) selectStation(record);
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
    const color = factionColor(faction);
    return `
      <button class="map-item" type="button" data-map-id="${escapeHtml(record.id)}" style="border-color: ${color.hex};">
        <strong>${escapeHtml(record.name)}</strong>
        <span>${escapeHtml(record.planet)} - ${typeLabel(record.location_type)} - ${formatDistance(record.altitude_m)} altitude</span>
        <span>${faction ? `${escapeHtml(faction.name)} - ${escapeHtml(faction.category)}` : "Faction unknown"}</span>
      </button>
    `;
  }).join("");

  const emptyState = records.length ? "" : `<div class="empty">No stations in this map view.</div>`;
  elements.mapList.innerHTML = planetRows + emptyState + stationRows;
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
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

elements.form.addEventListener("submit", async (event) => {
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

elements.gpsInput.addEventListener("input", updatePreview);
elements.searchInput.addEventListener("input", renderFilteredViews);
elements.planetFilter.addEventListener("change", renderFilteredViews);
elements.typeFilter.addEventListener("change", renderFilteredViews);
elements.tradeFilter.addEventListener("change", renderFilteredViews);
elements.refreshButton.addEventListener("click", loadRecords);
elements.resetFiltersButton.addEventListener("click", resetFilters);
elements.resetMapButton.addEventListener("click", resetMapView);
elements.resultsList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-id]");
  if (!button) return;

  const record = coordinates.find((item) => item.id === button.dataset.copyId);
  if (!record) return;

  try {
    await copyToClipboard(record.raw_text);
    button.textContent = "Copied";
    setTimeout(() => {
      button.textContent = "Copy Coords";
    }, 1200);
  } catch (error) {
    setMessage(`Copy failed: ${error.message}`, "bad");
  }
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

  selectStation(record);
});
elements.sampleButton.addEventListener("click", () => {
  elements.gpsInput.value = SAMPLE_GPS;
  updatePreview();
  elements.gpsInput.focus();
});

configureStorage();
renderPlanetOptions();
initMap();
loadRecords();
