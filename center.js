const MAP_SCALE = 1 / 25000;
const GRAVITY_FIELD_RADIUS_MULTIPLIER = 1.7182;
const CENTER_SAMPLE = [
  "GPS:Point A:0:0:0:#FFFFFFFF:",
  "GPS:Point B:100000:0:0:#FFFFFFFF:",
  "GPS:Point C:0:100000:0:#FFFFFFFF:"
].join("\n");

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
  mapViewport: document.querySelector("#centerMapViewport"),
  mapFallback: document.querySelector("#centerMapFallback"),
  mapList: document.querySelector("#centerMapList"),
  resetMapButton: document.querySelector("#resetCenterMapButton"),
  form: document.querySelector("#centerForm"),
  input: document.querySelector("#centerInput"),
  summary: document.querySelector("#centerSummary"),
  resultList: document.querySelector("#centerResultList"),
  copyButton: document.querySelector("#copyCenterButton"),
  sampleButton: document.querySelector("#sampleCenterButton")
};

let mapState = null;
let inputPoints = [];
let centerPoint = null;

function parseGps(rawText) {
  const text = rawText.trim();
  const match = text.match(/^GPS:([^:]+):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(-?\d+(?:\.\d+)?):(#?[0-9a-fA-F]{8})?:?$/);
  if (!match) throw new Error("Use GPS:Name:X:Y:Z:#AARRGGBB: lines.");
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
  return rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function calculateCenter(event) {
  event.preventDefault();
  try {
    const lines = splitGpsInput(elements.input.value);
    if (lines.length !== 3) throw new Error("Paste exactly three GPS coordinates.");
    inputPoints = lines.map(parseGps);
    centerPoint = {
      name: "3 Point Center",
      x: inputPoints.reduce((sum, point) => sum + point.x, 0) / 3,
      y: inputPoints.reduce((sum, point) => sum + point.y, 0) / 3,
      z: inputPoints.reduce((sum, point) => sum + point.z, 0) / 3
    };
    centerPoint.rawText = makeGps(centerPoint.name, centerPoint);
    renderResult();
    drawCenterGeometry();
    renderMapList();
    focusPoint(centerPoint);
  } catch (error) {
    elements.summary.textContent = error.message;
  }
}

function renderResult() {
  const distances = inputPoints.map((point) => distance3d(point, centerPoint));
  elements.summary.innerHTML = `
    <strong>Center calculated</strong><br>
    X ${centerPoint.x.toFixed(2)} / Y ${centerPoint.y.toFixed(2)} / Z ${centerPoint.z.toFixed(2)}
  `;
  elements.resultList.innerHTML = `
    <article class="coordinate-card">
      <div>
        <h3>${escapeHtml(centerPoint.name)}</h3>
        <div class="gps-line">${escapeHtml(centerPoint.rawText)}</div>
        <div class="meta">
          <span class="pill">A ${formatDistance(distances[0])}</span>
          <span class="pill">B ${formatDistance(distances[1])}</span>
          <span class="pill">C ${formatDistance(distances[2])}</span>
        </div>
      </div>
      <button class="copy-button" type="button" data-copy-center="true">Copy</button>
    </article>
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
  scene.add(new THREE.AmbientLight(0xffffff, 0.58));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
  keyLight.position.set(80, 90, 120);
  scene.add(keyLight);

  const planetGroup = new THREE.Group();
  const labelGroup = new THREE.Group();
  const centerGroup = new THREE.Group();
  root.add(planetGroup, labelGroup, centerGroup);

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
    centerGroup,
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
  const direction = normalizeScreenVector({
    x: centerScreen.x - width / 2,
    y: centerScreen.y - height / 2
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
  const rect = elements.mapViewport.getBoundingClientRect();
  const width = Math.max(320, rect.width);
  const height = Math.max(360, rect.height);
  mapState.renderer.setSize(width, height, false);
  mapState.camera.aspect = width / height;
  mapState.camera.updateProjectionMatrix();
}

function animateMap() {
  updateLabelScale();
  updateMarkerScale();
  mapState.renderer.render(mapState.scene, mapState.camera);
  requestAnimationFrame(animateMap);
}

function updateMarkerScale() {
  const scale = Math.max(0.13, Math.min(2.2, mapState.distance / 340));
  for (const marker of mapState.centerGroup.children) {
    if (["input-point", "center-point"].includes(marker.userData?.type)) {
      marker.scale.setScalar(scale);
    }
  }
}

function resetMapView() {
  mapState.yaw = -0.62;
  mapState.pitch = -0.34;
  mapState.distance = 330;
  mapState.target.set(0, 0, 40);
  updateCamera();
}

function drawCenterGeometry() {
  if (!mapState) return;
  const THREE = mapState.THREE;
  while (mapState.centerGroup.children.length) {
    const child = mapState.centerGroup.children.pop();
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  }
  if (!inputPoints.length || !centerPoint) return;

  const trianglePoints = [...inputPoints, inputPoints[0]].map(mapPosition);
  mapState.centerGroup.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(trianglePoints),
    new THREE.LineBasicMaterial({ color: 0xfff2a8 })
  ));

  const centerLines = inputPoints.flatMap((point) => [mapPosition(point), mapPosition(centerPoint)]);
  mapState.centerGroup.add(new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(centerLines),
    new THREE.LineBasicMaterial({ color: 0x49d6b5, transparent: true, opacity: 0.75 })
  ));

  const inputGeometry = new THREE.SphereGeometry(1, 16, 10);
  const inputMaterial = new THREE.MeshStandardMaterial({ color: 0xfff2a8, emissive: 0xffd166, emissiveIntensity: 0.55 });
  for (const point of inputPoints) {
    const marker = new THREE.Mesh(inputGeometry, inputMaterial);
    marker.position.copy(mapPosition(point));
    marker.userData = { type: "input-point" };
    mapState.centerGroup.add(marker);
  }

  const centerMarker = new THREE.Mesh(
    new THREE.SphereGeometry(1.25, 16, 10),
    new THREE.MeshStandardMaterial({ color: 0x49d6b5, emissive: 0x49d6b5, emissiveIntensity: 0.75 })
  );
  centerMarker.position.copy(mapPosition(centerPoint));
  centerMarker.userData = { type: "center-point" };
  mapState.centerGroup.add(centerMarker);
}

function renderMapList() {
  const planetRows = PLANETS.map((planet) => `
    <button class="map-item" type="button" data-planet-name="${escapeHtml(planet.name)}">
      <strong>${escapeHtml(planet.name)}</strong>
      <span>Planet focus</span>
    </button>
  `).join("");
  const centerRows = centerPoint ? `
    <button class="map-item" type="button" data-center-focus="true">
      <strong>${escapeHtml(centerPoint.name)}</strong>
      <span>Calculated center</span>
    </button>
  ` : "";
  elements.mapList.innerHTML = planetRows + centerRows;
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

elements.form.addEventListener("submit", calculateCenter);
elements.sampleButton.addEventListener("click", () => {
  elements.input.value = CENTER_SAMPLE;
  elements.input.focus();
});
elements.copyButton.addEventListener("click", async () => {
  if (!centerPoint) return;
  await copyToClipboard(centerPoint.rawText);
  elements.copyButton.textContent = "Copied";
  setTimeout(() => {
    elements.copyButton.textContent = "Copy Center";
  }, 1200);
});
elements.resultList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-center]");
  if (button && centerPoint) await copyToClipboard(centerPoint.rawText);
});
elements.resetMapButton.addEventListener("click", resetMapView);
elements.mapList.addEventListener("click", (event) => {
  const planetButton = event.target.closest("[data-planet-name]");
  if (planetButton) {
    const planet = PLANETS.find((item) => item.name === planetButton.dataset.planetName);
    if (planet) focusPlanet(planet);
    return;
  }
  if (event.target.closest("[data-center-focus]") && centerPoint) focusPoint(centerPoint);
});

initMap();
renderMapList();
