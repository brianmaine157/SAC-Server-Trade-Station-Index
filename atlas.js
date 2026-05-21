const MAP_SCALE = 1 / 25000;
const EXIT_OFFSET_M = 1000;
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

const DIRECTIONS = [
  { label: "X+", x: 1, y: 0, z: 0 },
  { label: "X-", x: -1, y: 0, z: 0 },
  { label: "Y+", x: 0, y: 1, z: 0 },
  { label: "Y-", x: 0, y: -1, z: 0 },
  { label: "Z+", x: 0, y: 0, z: 1 },
  { label: "Z-", x: 0, y: 0, z: -1 }
];

const elements = {
  mapViewport: document.querySelector("#atlasMapViewport"),
  mapFallback: document.querySelector("#atlasMapFallback"),
  mapList: document.querySelector("#atlasMapList"),
  resetMapButton: document.querySelector("#resetAtlasMapButton"),
  pointList: document.querySelector("#atlasPointList"),
  planetFilter: document.querySelector("#atlasPlanetFilter"),
  directionFilter: document.querySelector("#atlasDirectionFilter"),
  copyAllButton: document.querySelector("#copyAllAtlasPointsButton"),
  routeForm: document.querySelector("#routeForm"),
  routeInput: document.querySelector("#routeInput"),
  velocityInput: document.querySelector("#velocityInput"),
  tripModeInput: document.querySelector("#tripModeInput"),
  routeSummary: document.querySelector("#routeSummary"),
  clearRouteButton: document.querySelector("#clearRouteButton")
};

let mapState = null;
let atlasPoints = [];
let routePoints = [];

function parseGps(rawText) {
  const text = rawText.trim();
  const match = text.match(/^GPS:([^:]+):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(#?[0-9a-fA-F]{8})?:?$/);

  if (!match) {
    throw new Error("Use Space Engineers GPS lines like GPS:Name:X:Y:Z:#AARRGGBB:");
  }

  return {
    rawText: text,
    name: match[1].trim(),
    x: Number(match[2]),
    y: Number(match[3]),
    z: Number(match[4]),
    color: match[5] || "#FFFFFFFF"
  };
}

function splitGpsInput(rawText) {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function makeGps(name, point, color = "#FF49D6B5") {
  return `GPS:${name}:${point.x.toFixed(2)}:${point.y.toFixed(2)}:${point.z.toFixed(2)}:${color}:`;
}

function distance3d(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
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

function buildAtlasPoints() {
  atlasPoints = [];
  for (const planet of PLANETS) {
    const exitDistance = planet.radius * GRAVITY_FIELD_RADIUS_MULTIPLIER + EXIT_OFFSET_M;
    for (const direction of DIRECTIONS) {
      const point = {
        id: `${planet.name}-${direction.label}`,
        name: `${planet.name} ${direction.label} Planet Jump Coord`,
        planet: planet.name,
        direction: direction.label,
        x: planet.x + direction.x * exitDistance,
        y: planet.y + direction.y * exitDistance,
        z: planet.z + direction.z * exitDistance,
        exitDistance,
        note: "1 km outside natural gravity SOI"
      };
      point.rawText = makeGps(point.name, point);
      atlasPoints.push(point);
    }
  }
}

function populateFilters() {
  elements.planetFilter.innerHTML = ["all", ...PLANETS.map((planet) => planet.name)].map((name) => {
    const label = name === "all" ? "All planets" : name;
    return `<option value="${name}">${label}</option>`;
  }).join("");
}

function filteredAtlasPoints() {
  const planet = elements.planetFilter.value;
  const direction = elements.directionFilter.value;
  return atlasPoints.filter((point) => {
    return (planet === "all" || point.planet === planet) &&
      (direction === "all" || point.direction === direction);
  });
}

function renderAtlasPoints() {
  const points = filteredAtlasPoints();
  elements.pointList.innerHTML = points.map((point) => `
    <article class="atlas-point-card" data-atlas-point-card="${escapeHtml(point.id)}">
      <div>
        <h3>${escapeHtml(point.name)}</h3>
        <div class="gps-line">${escapeHtml(point.rawText)}</div>
        <div class="meta">
          <span class="pill">${escapeHtml(point.planet)}</span>
          <span class="pill">${escapeHtml(point.direction)}</span>
          <span class="pill">${escapeHtml(point.note)}</span>
        </div>
      </div>
      <button class="copy-button" type="button" data-copy-point="${escapeHtml(point.id)}">Copy</button>
    </article>
  `).join("");
  updateAtlasMapPoints(points);
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
  const atlasPointGroup = new THREE.Group();
  const routeGroup = new THREE.Group();
  root.add(planetGroup, labelGroup, atlasPointGroup, routeGroup);

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

    const atmosphereRadius = Math.max(radius + 0.06, (planet.radius + planet.atmosphereHeight) * MAP_SCALE);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(atmosphereRadius * 1.01, atmosphereRadius * 1.025, 64),
      new THREE.MeshBasicMaterial({ color: 0x49d6b5, transparent: true, opacity: planet.atmosphereHeight > 0 ? 0.2 : 0.07, side: THREE.DoubleSide })
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

    const label = makeLabelSprite(planet.name, "#eef3f8");
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
    labelGroup,
    atlasPointGroup,
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

  const atlasHits = mapState.raycaster.intersectObjects(mapState.atlasPointGroup.children, false);
  if (atlasHits[0]) {
    const point = atlasPoints.find((item) => item.id === atlasHits[0].object.userData.pointId);
    if (point) selectAtlasPoint(point);
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
  if (!mapState) return;
  const position = mapPosition(planet);
  const radius = Math.max(0.32, planet.radius * MAP_SCALE);
  mapState.target.copy(position);
  mapState.distance = planet.radius < 20000
    ? Math.max(12, radius * 5)
    : Math.max(28, radius * 10);
  updateCamera();
}

function focusPoint(point) {
  if (!mapState) return;
  mapState.target.copy(mapPosition(point));
  mapState.distance = 36;
  updateCamera();
}

function selectAtlasPoint(point) {
  focusPoint(point);
  const selector = `[data-atlas-point-card="${CSS.escape(point.id)}"]`;
  const card = document.querySelector(selector);
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  card.classList.add("selected");
  setTimeout(() => {
    card.classList.remove("selected");
  }, 1400);
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
    label.visible = shouldShowLabel(label, bodyDisks);
    label.scale.copy(label.userData.baseScale).multiplyScalar(zoomScale);
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
  for (const marker of mapState.atlasPointGroup.children) {
    if (marker.userData?.type === "atlas-point") {
      marker.scale.setScalar(scale);
    }
  }
  for (const marker of mapState.routeGroup.children) {
    if (marker.userData?.type === "route-marker") {
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

function updateAtlasMapPoints(points) {
  if (!mapState) return;
  const THREE = mapState.THREE;
  while (mapState.atlasPointGroup.children.length) {
    const child = mapState.atlasPointGroup.children.pop();
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  }

  const geometry = new THREE.SphereGeometry(0.7, 14, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0x49d6b5, emissive: 0x49d6b5, emissiveIntensity: 0.5 });
  for (const point of points) {
    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(mapPosition(point));
    marker.userData = { type: "atlas-point", pointId: point.id };
    mapState.atlasPointGroup.add(marker);
  }
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
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: 0xfff2a8, linewidth: 2 })
  );
  mapState.routeGroup.add(line);

  const markerGeometry = new THREE.SphereGeometry(1.05, 16, 10);
  const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xfff2a8, emissive: 0xffd166, emissiveIntensity: 0.65 });
  for (const point of points) {
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(mapPosition(point));
    marker.userData = { type: "route-marker" };
    mapState.routeGroup.add(marker);
  }
}

function renderMapList() {
  const planetRows = PLANETS.map((planet) => `
    <button class="map-item" type="button" data-planet-name="${escapeHtml(planet.name)}">
      <strong>${escapeHtml(planet.name)}</strong>
      <span>${planet.atmosphereHeight > 0 ? `${formatDistance(planet.atmosphereHeight)} atmosphere` : "No atmosphere"}</span>
    </button>
  `).join("");
  const routeRows = routePoints.map((point, index) => `
    <button class="map-item" type="button" data-route-index="${index}">
      <strong>${escapeHtml(point.name)}</strong>
      <span>Route waypoint ${index + 1}</span>
    </button>
  `).join("");
  elements.mapList.innerHTML = planetRows + routeRows;
}

function calculateRoute(event) {
  event.preventDefault();

  try {
    const lines = splitGpsInput(elements.routeInput.value);
    routePoints = lines.map(parseGps);
    if (routePoints.length < 2) {
      throw new Error("Paste at least two GPS coordinates.");
    }

    const velocity = Number(elements.velocityInput.value);
    if (!Number.isFinite(velocity) || velocity <= 0) {
      throw new Error("Velocity must be greater than 0 m/s.");
    }

    let distance = 0;
    for (let index = 1; index < routePoints.length; index += 1) {
      distance += distance3d(routePoints[index - 1], routePoints[index]);
    }

    const multiplier = Number(elements.tripModeInput.value);
    const totalDistance = distance * multiplier;
    const seconds = totalDistance / velocity;
    drawRoute(routePoints);
    renderMapList();

    elements.routeSummary.innerHTML = `
      <strong>${routePoints.length} waypoints</strong><br>
      One-way distance: ${formatDistance(distance)}<br>
      ${multiplier === 2 ? `Two-way distance: ${formatDistance(totalDistance)}<br>` : ""}
      Travel time at ${velocity.toLocaleString()} m/s: ${formatDuration(seconds)}
    `;
  } catch (error) {
    elements.routeSummary.textContent = error.message;
  }
}

function clearRoute() {
  routePoints = [];
  elements.routeInput.value = "";
  elements.routeSummary.textContent = "Paste two or more GPS coordinates to calculate travel time.";
  drawRoute([]);
  renderMapList();
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

elements.routeForm.addEventListener("submit", calculateRoute);
elements.clearRouteButton.addEventListener("click", clearRoute);
elements.resetMapButton.addEventListener("click", resetMapView);
elements.planetFilter.addEventListener("change", renderAtlasPoints);
elements.directionFilter.addEventListener("change", renderAtlasPoints);
elements.copyAllButton.addEventListener("click", async () => {
  await copyToClipboard(filteredAtlasPoints().map((point) => point.rawText).join("\n"));
});
elements.pointList.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy-point]");
  if (copyButton) {
    const point = atlasPoints.find((item) => item.id === copyButton.dataset.copyPoint);
    if (!point) return;
    await copyToClipboard(point.rawText);
    copyButton.textContent = "Copied";
    setTimeout(() => {
      copyButton.textContent = "Copy";
    }, 1200);
    return;
  }

  const card = event.target.closest("[data-atlas-point-card]");
  if (!card) return;
  const point = atlasPoints.find((item) => item.id === card.dataset.atlasPointCard);
  if (point) selectAtlasPoint(point);
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
    const point = routePoints[Number(routeButton.dataset.routeIndex)];
    if (point) focusPoint(point);
  }
});

buildAtlasPoints();
populateFilters();
initMap();
renderAtlasPoints();
renderMapList();
