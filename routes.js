const MAP_SCALE = 1 / 25000;
const GRAVITY_FIELD_RADIUS_MULTIPLIER = 1.7182;
const JUMP_EXIT_OFFSET_M = 10000;
const LOCAL_STORAGE_KEY = "se-coordinate-registry";
const STATION_MATCH_RADIUS_M = 1000;

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

const elements = {
  mapViewport: document.querySelector("#routeMapViewport"),
  mapFallback: document.querySelector("#routeMapFallback"),
  mapList: document.querySelector("#routeMapList"),
  resetMapButton: document.querySelector("#resetRouteMapButton"),
  form: document.querySelector("#optimizerForm"),
  input: document.querySelector("#optimizerInput"),
  velocityInput: document.querySelector("#optimizerVelocityInput"),
  tripModeInput: document.querySelector("#optimizerTripModeInput"),
  summary: document.querySelector("#optimizerSummary"),
  clearButton: document.querySelector("#clearOptimizerButton"),
  copyButton: document.querySelector("#copyOptimizedRouteButton"),
  resultList: document.querySelector("#optimizedRouteList")
};

let mapState = null;
let originalStops = [];
let optimizedStops = [];
let knownStations = [];
let supabaseClient = null;
let stationLoadPromise = null;

function parseGps(rawText) {
  const text = rawText.trim();
  const match = text.match(/^GPS:([^:]+):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(#?[0-9a-fA-F]{8})?:?$/);
  if (!match) throw new Error("Use Space Engineers GPS lines like GPS:Name:X:Y:Z:#AARRGGBB:");
  return {
    rawText: text,
    name: match[1].trim(),
    x: Number(match[2]),
    y: Number(match[3]),
    z: Number(match[4]),
    color: match[5] || "#FFFFFFFF"
  };
}

function gpsWithName(point, name) {
  return `GPS:${name}:${point.x}:${point.y}:${point.z}:${point.color}:`;
}

function readLocalStations() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function shouldUseSupabase() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function hasCoordinatePosition(station) {
  return station &&
    Number.isFinite(Number(station.x)) &&
    Number.isFinite(Number(station.y)) &&
    Number.isFinite(Number(station.z));
}

async function loadKnownStations() {
  knownStations = readLocalStations().filter(hasCoordinatePosition);

  if (!shouldUseSupabase()) return;

  supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  const { data, error } = await supabaseClient
    .from("coordinates")
    .select("id,name,x,y,z,location_type,color")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const localIds = new Set(knownStations.map((station) => station.id).filter(Boolean));
  for (const station of data || []) {
    if (station.id && localIds.has(station.id)) continue;
    if (hasCoordinatePosition(station)) knownStations.push(station);
  }
}

function nearestKnownStation(point) {
  let best = null;
  let bestDistance = Infinity;
  for (const station of knownStations) {
    const distance = distance3d(point, station);
    if (distance < bestDistance) {
      best = station;
      bestDistance = distance;
    }
  }

  return best && bestDistance <= STATION_MATCH_RADIUS_M
    ? { station: best, distance: bestDistance }
    : null;
}

function applyKnownStationName(point) {
  const match = nearestKnownStation(point);
  if (!match || !match.station.name) return point;

  const orbitalCoordinate = stationOrbitalCoordinate(match.station, point.color);
  const updated = {
    ...point,
    originalName: match.station.name === point.name ? "" : point.name,
    name: match.station.name,
    matchedStationId: match.station.id || null,
    matchedDistance: match.distance,
    orbitalCoordinate
  };
  updated.rawText = gpsWithName(updated, updated.name);
  return updated;
}

function stationOrbitalCoordinate(station, fallbackColor = "#FFFFFFFF") {
  if (station.location_type !== "surface") return null;
  const nearest = nearestPlanet(station);
  const planet = nearest?.planet;
  if (!planet) return null;

  const distance = nearest.distance || 1;
  const exitDistance = planet.radius * GRAVITY_FIELD_RADIUS_MULTIPLIER + JUMP_EXIT_OFFSET_M;
  const direction = {
    x: (Number(station.x) - planet.x) / distance,
    y: (Number(station.y) - planet.y) / distance,
    z: (Number(station.z) - planet.z) / distance
  };
  const point = {
    name: `${station.name} Orbital Coordinate`,
    x: planet.x + direction.x * exitDistance,
    y: planet.y + direction.y * exitDistance,
    z: planet.z + direction.z * exitDistance,
    color: normalizeGpsColor(station.color || fallbackColor)
  };

  return {
    planet: planet.name,
    transferDistance: distance3d(station, point),
    rawText: `GPS:${point.name}:${point.x.toFixed(3)}:${point.y.toFixed(3)}:${point.z.toFixed(3)}:${point.color}:`
  };
}

function nearestPlanet(point) {
  return PLANETS
    .map((planet) => ({ planet, distance: distance3d(point, planet) }))
    .sort((a, b) => a.distance - b.distance)[0] || null;
}

function normalizeGpsColor(color) {
  const value = String(color || "#FFFFFFFF").trim();
  return /^#[0-9a-fA-F]{8}$/.test(value) ? value.toUpperCase() : "#FFFFFFFF";
}

function splitGpsInput(rawText) {
  return rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function distance3d(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function routeDistance(points) {
  let distance = 0;
  for (let index = 1; index < points.length; index += 1) {
    distance += distance3d(points[index - 1], points[index]);
  }
  return distance;
}

function formatDistance(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)} Mm`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)} km`;
  return `${Math.round(value)} m`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "Invalid";
  const rounded = Math.round(seconds);
  const days = Math.floor(rounded / 86400);
  const hours = Math.floor((rounded % 86400) / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  if (minutes || hours || days) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function optimizeRoute(points) {
  if (points.length <= 2) return points.slice();
  if (points.length <= 9) return exactRoute(points);
  return twoOptRoute(nearestNeighborRoute(points));
}

function exactRoute(points) {
  const start = points[0];
  const remaining = points.slice(1);
  let bestRoute = null;
  let bestDistance = Infinity;

  function visit(path, unused) {
    if (!unused.length) {
      const candidate = [start, ...path];
      const distance = routeDistance(candidate);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestRoute = candidate;
      }
      return;
    }

    for (let index = 0; index < unused.length; index += 1) {
      visit([...path, unused[index]], unused.filter((_, itemIndex) => itemIndex !== index));
    }
  }

  visit([], remaining);
  return bestRoute || points.slice();
}

function nearestNeighborRoute(points) {
  const route = [points[0]];
  const unused = points.slice(1);
  while (unused.length) {
    const current = route[route.length - 1];
    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let index = 0; index < unused.length; index += 1) {
      const distance = distance3d(current, unused[index]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    }
    route.push(unused.splice(bestIndex, 1)[0]);
  }
  return route;
}

function twoOptRoute(points) {
  const route = points.slice();
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 2; i += 1) {
      for (let j = i + 1; j < route.length - 1; j += 1) {
        const current = distance3d(route[i - 1], route[i]) + distance3d(route[j], route[j + 1]);
        const swapped = distance3d(route[i - 1], route[j]) + distance3d(route[i], route[j + 1]);
        if (swapped + 0.001 < current) {
          route.splice(i, j - i + 1, ...route.slice(i, j + 1).reverse());
          improved = true;
        }
      }
    }
  }
  return route;
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
  scene.add(new THREE.AmbientLight(0xffffff, 0.58));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
  keyLight.position.set(80, 90, 120);
  scene.add(keyLight);

  const planetGroup = new THREE.Group();
  const labelGroup = new THREE.Group();
  const routeGroup = new THREE.Group();
  root.add(planetGroup, labelGroup, routeGroup);

  const grid = new THREE.GridHelper(520, 26, 0x2c3643, 0x17202b);
  grid.position.y = -12;
  root.add(grid);

  for (const planet of PLANETS) {
    const radius = Math.max(0.32, planet.radius * MAP_SCALE);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 18),
      new THREE.MeshStandardMaterial({ color: PLANET_COLORS[planet.name] || 0xcccccc, roughness: 0.72 })
    );
    mesh.position.copy(mapPosition(planet));
    mesh.userData = { type: "planet", planet };
    planetGroup.add(mesh);

    const gravityShell = new THREE.Mesh(
      new THREE.SphereGeometry(radius * GRAVITY_FIELD_RADIUS_MULTIPLIER, 32, 18),
      new THREE.MeshBasicMaterial({ color: 0x49d6b5, transparent: true, opacity: 0.055, depthWrite: false })
    );
    gravityShell.position.copy(mesh.position);
    planetGroup.add(gravityShell);

    const labelPosition = labelCalloutPosition(planet, radius);
    const label = makeLabelSprite(planet.name, "#eef3f8");
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
    planetGroup,
    labelGroup,
    routeGroup,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    yaw: -0.62,
    pitch: -0.34,
    distance: 330,
    target: new THREE.Vector3(0, 0, 40),
    dragging: false,
    movedDuringDrag: false,
    lastX: 0,
    lastY: 0
  };

  bindMapControls();
  resizeMap();
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

function labelCalloutPosition(planet, radius) {
  const THREE = window.THREE;
  const moonScale = planet.radius < 20000;
  const direction = new THREE.Vector3(
    planet.x >= 0 ? 1 : -1,
    moonScale ? 1.35 : 1.05,
    planet.z >= 0 ? 1 : -1
  ).normalize();
  return mapPosition(planet).add(direction.multiplyScalar(radius + (moonScale ? 14 : 8)));
}

function makeLeaderLine(start, end) {
  const THREE = window.THREE;
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([start.clone(), end.clone()]),
    new THREE.LineBasicMaterial({ color: 0x9ba7b4, transparent: true, opacity: 0.55 })
  );
}

function bindMapControls() {
  const viewport = elements.mapViewport;
  viewport.addEventListener("pointerdown", (event) => {
    if (!mapState) return;
    event.preventDefault();
    mapState.dragging = true;
    mapState.movedDuringDrag = false;
    mapState.lastX = event.clientX;
    mapState.lastY = event.clientY;
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!mapState?.dragging) return;
    event.preventDefault();
    const dx = event.clientX - mapState.lastX;
    const dy = event.clientY - mapState.lastY;
    mapState.lastX = event.clientX;
    mapState.lastY = event.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 3) mapState.movedDuringDrag = true;
    mapState.yaw -= dx * 0.006;
    mapState.pitch = Math.max(-1.25, Math.min(1.25, mapState.pitch + dy * 0.006));
    updateCamera();
  });
  viewport.addEventListener("pointerup", (event) => {
    if (!mapState) return;
    if (!mapState.movedDuringDrag) focusMapObjectFromPointer(event);
    mapState.dragging = false;
    viewport.releasePointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointercancel", () => {
    if (!mapState) return;
    mapState.dragging = false;
  });
  viewport.addEventListener("lostpointercapture", () => {
    if (!mapState) return;
    mapState.dragging = false;
  });
  viewport.addEventListener("contextmenu", (event) => {
    if (!mapState) return;
    event.preventDefault();
    focusMapObjectFromPointer(event);
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
  const rect = elements.mapViewport.getBoundingClientRect();
  mapState.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mapState.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  mapState.raycaster.setFromCamera(mapState.pointer, mapState.camera);

  const routeHit = mapState.raycaster.intersectObjects(mapState.routeGroup.children, false)
    .find((hit) => hit.object.userData?.type === "route-marker");
  if (routeHit) {
    const point = optimizedStops[routeHit.object.userData.routeIndex];
    if (point) focusPoint(point);
    return;
  }

  const objects = [
    ...mapState.planetGroup.children,
    ...mapState.labelGroup.children.filter((label) => label.visible)
  ];
  const hits = mapState.raycaster.intersectObjects(objects, false);
  const planetHit = hits.find((hit) => ["planet", "planet-label"].includes(hit.object.userData?.type));
  if (planetHit) focusPlanet(planetHit.object.userData.planet);
}

function focusPlanet(planet) {
  const radius = Math.max(0.32, planet.radius * MAP_SCALE);
  mapState.target.copy(mapPosition(planet));
  mapState.distance = planet.radius < 20000 ? Math.max(12, radius * 5) : Math.max(28, radius * 10);
  updateCamera();
}

function focusPoint(point) {
  mapState.target.copy(mapPosition(point));
  mapState.distance = 36;
  updateCamera();
}

function updateCamera() {
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
    label.visible = shouldShowLabel(label, bodyDisks);
    label.scale.copy(label.userData.baseScale).multiplyScalar(zoomScale);
    if (label.visible) placeSafeLabel(label, bodyDisks);
    if (label.userData?.leaderLine) {
      label.userData.leaderLine.visible = label.visible;
      updateLeaderLine(label.userData.leaderLine, mapPosition(label.userData.planet), label.position);
    }
  }
}

function shouldShowLabel(label, bodyDisks) {
  if (label.userData?.isMoonScale && mapState.distance >= 320) return false;
  const disk = bodyDisks.find((item) => item.planet.name === label.userData.planet.name);
  if (!disk || disk.behind) return false;
  const rect = elements.mapViewport.getBoundingClientRect();
  const margin = 80;
  return disk.x >= -margin && disk.x <= rect.width + margin && disk.y >= -margin && disk.y <= rect.height + margin;
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
  const direction = normalizeScreenVector({ x: centerScreen.x - width / 2, y: centerScreen.y - height / 2 }, planet);
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
  if (!label.userData.targetPosition) label.userData.targetPosition = desired.clone();
  else label.userData.targetPosition.copy(desired);
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
  const left = worldToScreen(center.clone().add(cameraRight.clone().multiplyScalar(-label.scale.x / 2)), width, height);
  const right = worldToScreen(center.clone().add(cameraRight.clone().multiplyScalar(label.scale.x / 2)), width, height);
  const top = worldToScreen(center.clone().add(cameraUp.clone().multiplyScalar(label.scale.y / 2)), width, height);
  const bottom = worldToScreen(center.clone().add(cameraUp.clone().multiplyScalar(-label.scale.y / 2)), width, height);
  return { width: Math.max(72, Math.abs(right.x - left.x)), height: Math.max(28, Math.abs(bottom.y - top.y)) };
}

function rectIntersectsCircle(rect, circle) {
  const nearestX = Math.max(rect.left, Math.min(circle.x, rect.right));
  const nearestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
  return Math.hypot(circle.x - nearestX, circle.y - nearestY) < circle.radius;
}

function worldToScreen(position, width, height) {
  const projected = position.clone().project(mapState.camera);
  return { x: (projected.x * 0.5 + 0.5) * width, y: (-projected.y * 0.5 + 0.5) * height, z: projected.z };
}

function screenToWorld(x, y, depthPoint, width, height) {
  const THREE = mapState.THREE;
  const projectedDepth = depthPoint.clone().project(mapState.camera).z;
  return new THREE.Vector3((x / width) * 2 - 1, -(y / height) * 2 + 1, projectedDepth).unproject(mapState.camera);
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
  for (const marker of mapState.routeGroup.children) {
    if (marker.userData?.type === "route-marker") marker.scale.setScalar(scale);
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

function drawRoute(points) {
  if (!mapState) return;
  const THREE = mapState.THREE;
  while (mapState.routeGroup.children.length) {
    const child = mapState.routeGroup.children.pop();
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  }
  if (points.length < 2) return;

  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(mapPosition));
  mapState.routeGroup.add(new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: 0xfff2a8 })
  ));

  points.forEach((point, index) => {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(index === 0 ? 1.25 : 1.05, 16, 10),
      new THREE.MeshStandardMaterial({
        color: index === 0 ? 0x49d6b5 : 0xfff2a8,
        emissive: index === 0 ? 0x49d6b5 : 0xffd166,
        emissiveIntensity: 0.65
      })
    );
    marker.position.copy(mapPosition(point));
    marker.userData = { type: "route-marker", routeIndex: index };
    mapState.routeGroup.add(marker);
  });
}

function renderMapList() {
  const planetRows = PLANETS.map((planet) => `
    <button class="map-item" type="button" data-planet-name="${escapeHtml(planet.name)}">
      <strong>${escapeHtml(planet.name)}</strong>
      <span>Planet focus</span>
    </button>
  `).join("");

  const routeRows = optimizedStops.map((point, index) => `
    <button class="map-item" type="button" data-route-index="${index}">
      <strong>${index + 1}. ${escapeHtml(point.name)}</strong>
      <span>${index === 0 ? "Start" : `Stop ${index}`}</span>
    </button>
  `).join("");

  elements.mapList.innerHTML = planetRows + routeRows;
}

function renderOptimizedRoute() {
  if (!optimizedStops.length) {
    elements.resultList.innerHTML = `<div class="empty">No route calculated yet.</div>`;
    return;
  }

  elements.resultList.innerHTML = optimizedStops.map((point, index) => {
    const legDistance = index === 0 ? 0 : distance3d(optimizedStops[index - 1], point);
    return `
      <article class="atlas-point-card" data-route-card="${index}">
        <div>
          <h3>${index + 1}. ${escapeHtml(point.name)}</h3>
          <div class="gps-line">${escapeHtml(point.rawText)}</div>
          <div class="meta">
            <span class="pill">${index === 0 ? "Start" : `Leg ${formatDistance(legDistance)}`}</span>
            ${point.originalName ? `<span class="pill">Matched ${escapeHtml(point.originalName)} within ${formatDistance(point.matchedDistance)}</span>` : ""}
            ${point.orbitalCoordinate ? `<span class="pill">Orbital coordinate available</span>` : ""}
          </div>
          ${point.orbitalCoordinate ? `
            <div class="gps-line">${escapeHtml(point.orbitalCoordinate.rawText)}</div>
            <div class="meta">
              <span class="pill">${escapeHtml(point.orbitalCoordinate.planet)} orbit</span>
              <span class="pill">Surface transfer ${formatDistance(point.orbitalCoordinate.transferDistance)}</span>
            </div>
          ` : ""}
        </div>
        <div class="route-card-actions">
          <button class="copy-button" type="button" data-copy-route-point="${index}">Copy</button>
          ${point.orbitalCoordinate ? `<button class="copy-button secondary" type="button" data-copy-orbital-point="${index}">Copy Orbit</button>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

async function optimizeFromForm(event) {
  event.preventDefault();
  try {
    await stationLoadPromise;
    originalStops = splitGpsInput(elements.input.value).map((line) => applyKnownStationName(parseGps(line)));
    if (originalStops.length < 2) throw new Error("Paste at least two GPS coordinates.");
    const velocity = Number(elements.velocityInput.value);
    if (!Number.isFinite(velocity) || velocity <= 0) throw new Error("Velocity must be greater than 0 m/s.");

    optimizedStops = optimizeRoute(originalStops);
    const distance = routeDistance(optimizedStops);
    const multiplier = Number(elements.tripModeInput.value);
    const totalDistance = distance * multiplier;
    const originalDistance = routeDistance(originalStops);
    const renamedCount = originalStops.filter((stop) => stop.originalName).length;
    const orbitalCount = originalStops.filter((stop) => stop.orbitalCoordinate).length;
    drawRoute(optimizedStops);
    renderMapList();
    renderOptimizedRoute();

    elements.summary.innerHTML = `
      <strong>${optimizedStops.length} stops</strong><br>
      Optimized one-way distance: ${formatDistance(distance)}<br>
      ${originalStops.length > 2 ? `Saved vs pasted order: ${formatDistance(Math.max(0, originalDistance - distance))}<br>` : ""}
      ${renamedCount ? `${renamedCount} stop${renamedCount === 1 ? "" : "s"} renamed from nearby known station matches<br>` : ""}
      ${orbitalCount ? `${orbitalCount} surface station orbital coordinate${orbitalCount === 1 ? "" : "s"} provided<br>` : ""}
      ${multiplier === 2 ? `Two-way distance: ${formatDistance(totalDistance)}<br>` : ""}
      Travel time at ${velocity.toLocaleString()} m/s: ${formatDuration(totalDistance / velocity)}
    `;
  } catch (error) {
    elements.summary.textContent = error.message;
  }
}

function clearRoute() {
  originalStops = [];
  optimizedStops = [];
  elements.input.value = "";
  elements.summary.textContent = "Paste two or more GPS coordinates.";
  drawRoute([]);
  renderMapList();
  renderOptimizedRoute();
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through for embedded browser clipboard restrictions.
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

elements.form.addEventListener("submit", optimizeFromForm);
elements.clearButton.addEventListener("click", clearRoute);
elements.resetMapButton.addEventListener("click", resetMapView);
elements.copyButton.addEventListener("click", async () => {
  if (!optimizedStops.length) return;
  await copyToClipboard(optimizedStops.map((point) => point.rawText).join("\n"));
  elements.copyButton.textContent = "Copied";
  setTimeout(() => {
    elements.copyButton.textContent = "Copy Route";
  }, 1200);
});
elements.resultList.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy-route-point]");
  if (copyButton) {
    const point = optimizedStops[Number(copyButton.dataset.copyRoutePoint)];
    if (!point) return;
    await copyToClipboard(point.rawText);
    copyButton.textContent = "Copied";
    setTimeout(() => {
      copyButton.textContent = "Copy";
    }, 1200);
    return;
  }

  const orbitalButton = event.target.closest("[data-copy-orbital-point]");
  if (orbitalButton) {
    const point = optimizedStops[Number(orbitalButton.dataset.copyOrbitalPoint)];
    if (!point?.orbitalCoordinate) return;
    await copyToClipboard(point.orbitalCoordinate.rawText);
    orbitalButton.textContent = "Copied";
    setTimeout(() => {
      orbitalButton.textContent = "Copy Orbit";
    }, 1200);
    return;
  }

  const card = event.target.closest("[data-route-card]");
  if (card) {
    const point = optimizedStops[Number(card.dataset.routeCard)];
    if (point) focusPoint(point);
  }
});
elements.mapList.addEventListener("click", (event) => {
  const planetButton = event.target.closest("[data-planet-name]");
  if (planetButton) {
    const planet = PLANETS.find((item) => item.name === planetButton.dataset.planetName);
    if (planet) focusPlanet(planet);
    return;
  }
  const routeButton = event.target.closest("[data-route-index]");
  if (routeButton) {
    const point = optimizedStops[Number(routeButton.dataset.routeIndex)];
    if (point) focusPoint(point);
  }
});

stationLoadPromise = loadKnownStations().catch((error) => {
  elements.summary.textContent = `Station lookup unavailable: ${error.message}`;
});

initMap();
renderMapList();
