// 高雄港城：西側有海灣的港口島，貨櫃碼頭、岸邊起重機、進出港的貨櫃輪、旗津與燈塔、
// 85 大樓、夢時代摩天輪、駁二倉庫與愛河
// 這個檔案用一般 <script> 載入（不是 module），直接雙擊 html 也能執行；THREE 由 island.html 傳進來
window.HeartCities = window.HeartCities || {};
window.HeartCities.kaohsiung = function buildKaohsiung(ctx) {
  const { THREE, mat, beam, addLabel, rand, cityMaterial, hexRadius, insideHex } = ctx;
  const island = new THREE.Group();

  // 海灣是一個圓：圓心在島的西側，島的外形 = 六邊形扣掉這個海灣
  const BAY = { x: -17, z: 0, r: 9 };
  const ISLAND_R = 20;
  const GROUND_TOP = 0.7;
  // 縱貫線從北邊進城的位置（island.html 的公路會接到這裡）
  const HIGHWAY_X = 6;
  const inBay = (x, z, pad = 0) => Math.hypot(x - BAY.x, z - BAY.z) < BAY.r + pad;
  const onLand = (x, z, pad = 0) => insideHex(x, z, ISLAND_R - 2.5 - pad) && !inBay(x, z, 1.5 + pad);

  // 沿著六邊形的邊走一圈，遇到海灣就改走海灣的圓弧（Shape 的 y 之後會變成世界的 -z）
  function harbourShape(R, bayR) {
    const inside = p => Math.hypot(p.x - BAY.x, p.y - BAY.z) < bayR;
    // 六邊形的頂點從角度 0 開始逆時針，每條邊細分成很多點，方便找出跟海灣的交界
    const pts = [];
    for (let k = 0; k < 6; k++) {
      const a0 = (k * Math.PI) / 3;
      const a1 = ((k + 1) * Math.PI) / 3;
      const p0 = new THREE.Vector2(Math.cos(a0) * R, Math.sin(a0) * R);
      const p1 = new THREE.Vector2(Math.cos(a1) * R, Math.sin(a1) * R);
      for (let s = 0; s < 40; s++) pts.push(p0.clone().lerp(p1, s / 40));
    }
    const first = pts.findIndex(inside);
    const last = pts.length - 1 - [...pts].reverse().findIndex(inside);
    // 用二分法找出邊與海灣圓的精確交點
    const crossing = (out, inn) => {
      let a = out.clone();
      let b = inn.clone();
      for (let i = 0; i < 30; i++) {
        const m = a.clone().lerp(b, 0.5);
        if (inside(m)) b = m; else a = m;
      }
      return a;
    };
    const enter = crossing(pts[first - 1], pts[first]);
    const exit = crossing(pts[last + 1], pts[last]);
    const shape = new THREE.Shape();
    shape.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < first; i++) shape.lineTo(pts[i].x, pts[i].y);
    shape.lineTo(enter.x, enter.y);
    // 海灣的弧往島內凹（經過圓心的東側）
    shape.absarc(BAY.x, BAY.z, bayR, Math.atan2(enter.y - BAY.z, enter.x - BAY.x), Math.atan2(exit.y - BAY.z, exit.x - BAY.x), true);
    for (let i = last + 1; i < pts.length; i++) shape.lineTo(pts[i].x, pts[i].y);
    return shape;
  }
  function slab(shape, depth, top, topColor, sideColor) {
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 48 });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, top - depth, 0);
    // ExtrudeGeometry 的材質順序：上下兩面、側面
    const m = new THREE.Mesh(geo, [mat(topColor), mat(sideColor)]);
    m.receiveShadow = true;
    return m;
  }
  island.add(slab(harbourShape(ISLAND_R, BAY.r), 2.6, GROUND_TOP, 0xa8c070, 0xb08a5a));
  island.add(slab(harbourShape(ISLAND_R + 1.4, BAY.r - 1.0), 1.6, -0.5, 0xead6a6, 0xd9c08e));

  // ---------- 旗津：灣口外的狹長島＋燈塔 ----------
  const QIJIN_X = -28.5;
  const qijinSand = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.6, 40), mat(0xead6a6));
  qijinSand.scale.set(2.8, 1, 13.4);
  qijinSand.position.set(QIJIN_X, -1.3, 0);
  const qijin = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.6, 40), mat(0xb5c97e));
  qijin.scale.set(2.0, 1, 12.5);
  qijin.position.set(QIJIN_X, -0.6, 0);
  [qijinSand, qijin].forEach(m => { m.receiveShadow = true; island.add(m); });

  const lighthouse = new THREE.Group();
  lighthouse.position.set(QIJIN_X, GROUND_TOP, -10);
  const lhTower = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.6, 3.2, 8), mat(0xf7f5ef));
  lhTower.position.y = 1.6;
  const lhRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.25, 8), mat(0x2b2b2b));
  lhRoom.position.y = 3.3;
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: 0.2 });
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.5, 8), lampMat);
  lamp.position.y = 3.68;
  const lhCap = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.5, 8), mat(0xc8372d));
  lhCap.position.y = 4.18;
  lighthouse.add(lhTower, lhRoom, lamp, lhCap);
  // 晚上旋轉的探照光
  const beamPivot = new THREE.Group();
  beamPivot.position.y = 3.68;
  const lightCone = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 12, 20, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
  );
  lightCone.rotation.z = Math.PI / 2;
  lightCone.position.x = 6;
  beamPivot.add(lightCone);
  lighthouse.add(beamPivot);
  lighthouse.traverse(o => { if (o.isMesh && o !== lightCone) o.castShadow = true; });
  lighthouse.userData.clickable = "lighthouse";
  island.add(lighthouse);
  addLabel("旗津燈塔", lighthouse, 5.2);

  // ---------- 貨櫃碼頭 ----------
  const containerColors = [0xd8333a, 0x2f6fb5, 0x2fa36b, 0xe98a2f, 0xf2c230, 0x1f8f9a, 0xf4f4f2, 0x8a3fb5];
  const containerSpots = [];
  // x 從 -5.2 開始，留空間給岸邊起重機的腳
  for (let x = -5.2; x <= -1.0; x += 1.05) {
    for (let z = -2.6; z <= 8.4; z += 0.52) {
      if (!onLand(x, z)) continue;
      const stack = 1 + Math.floor(rand() * 4);
      for (let k = 0; k < stack; k++) containerSpots.push([x, GROUND_TOP + 0.21 + k * 0.42, z]);
    }
  }
  const containers = new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 0.42, 0.46), mat(0xffffff, { roughness: 0.7 }), containerSpots.length);
  const m4 = new THREE.Matrix4();
  const color = new THREE.Color();
  containerSpots.forEach(([x, y, z], i) => {
    m4.makeTranslation(x, y, z);
    containers.setMatrixAt(i, m4);
    containers.setColorAt(i, color.setHex(containerColors[Math.floor(rand() * containerColors.length)]));
  });
  containers.castShadow = true;
  containers.receiveShadow = true;
  island.add(containers);

  // ---------- 岸邊起重機：紅白相間，吊臂伸到海灣上 ----------
  const craneRed = mat(0xd8333a);
  const craneWhite = mat(0xf2f2ee);
  const cranes = [];
  [-0.5, -0.15, 0.2, 0.55].forEach((phi, k) => {
    const crane = new THREE.Group();
    const bx = BAY.x + Math.cos(phi) * (BAY.r + 1.5);
    const bz = BAY.z + Math.sin(phi) * (BAY.r + 1.5);
    crane.position.set(bx, GROUND_TOP, bz);
    // 吊臂沿著本地 -x，轉向海灣中心
    const dx = BAY.x - bx;
    const dz = BAY.z - bz;
    crane.rotation.y = Math.atan2(dz, -dx);
    const legMat = k % 2 ? craneWhite : craneRed;
    for (const lx of [-0.8, 0.8]) {
      for (const lz of [-0.6, 0.6]) {
        crane.add(beam(new THREE.Vector3(lx, 0, lz), new THREE.Vector3(lx * 0.8, 3.6, lz), 0.14, legMat));
      }
    }
    crane.add(beam(new THREE.Vector3(-0.64, 2.2, -0.6), new THREE.Vector3(0.64, 2.2, -0.6), 0.1, craneWhite));
    crane.add(beam(new THREE.Vector3(-0.64, 2.2, 0.6), new THREE.Vector3(0.64, 2.2, 0.6), 0.1, craneWhite));
    const boom = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.28, 0.5), k % 2 ? craneRed : craneWhite);
    boom.position.set(-2.3, 3.75, 0);
    const house = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 1.2), craneWhite);
    house.position.set(0.6, 4.2, 0);
    const trolley = new THREE.Group();
    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.6), mat(0x2b2b2b));
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 4), mat(0x2b2b2b));
    cable.position.y = -0.8;
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 0.46), mat(containerColors[k % containerColors.length]));
    box.position.y = -1.6;
    trolley.add(cart, cable, box);
    trolley.position.y = 3.55;
    crane.add(boom, house, trolley);
    crane.traverse(o => { if (o.isMesh) o.castShadow = true; });
    crane.userData.clickable = "crane";
    island.add(crane);
    cranes.push({ trolley, box, offset: k * 0.37 });
  });

  // ---------- 85 大樓：兩支粗腿撐起中間的開口、上面一層層退縮，像個「高」字 ----------
  const sky85 = new THREE.Group();
  sky85.position.set(7, GROUND_TOP, 2);
  const glass85 = cityMaterial({ color: 0x7f9bb5, roughness: 0.35, metalness: 0.25 });
  const fin85 = mat(0x5f7a92, { flatShading: false });
  const piece = (w, h, d, x, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glass85);
    m.position.set(x, y, 0);
    sky85.add(m);
    return m;
  };
  // 正反兩面的垂直線條，讓大樓看起來更修長
  const fins = (w, h, d, x, y, gap = 0.45) => {
    for (let fx = -w / 2 + gap / 2; fx < w / 2; fx += gap) {
      [-1, 1].forEach(side => {
        const f = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.06), fin85);
        f.position.set(x + fx, y, side * (d / 2 + 0.03));
        sky85.add(f);
      });
    }
  };
  // 兩支腿（中間是挑高的開口）
  [-1.45, 1.45].forEach(x => {
    piece(1.5, 6.2, 2.7, x, 3.1);
    fins(1.5, 6.2, 2.7, x, 3.1);
  });
  // 橫跨兩腿的橋段
  piece(4.4, 2.0, 2.7, 0, 7.2);
  fins(4.4, 2.0, 2.7, 0, 7.2);
  // 兩側肩部一層層往內退縮
  piece(3.6, 1.0, 2.5, 0, 8.7);
  piece(3.0, 0.8, 2.4, 0, 9.6);
  // 中央主樓與上層
  piece(2.3, 4.4, 2.2, 0, 12.2);
  fins(2.3, 4.4, 2.2, 0, 12.2, 0.38);
  piece(1.8, 1.4, 1.8, 0, 15.1);
  // 收尖的塔冠
  const crown85 = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * Math.SQRT2, 0.9 * Math.SQRT2, 1.2, 4, 1).rotateY(Math.PI / 4), glass85);
  crown85.position.y = 16.4;
  sky85.add(crown85);
  const spire85 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 2.6, 8), mat(0xdfe4e6, { metalness: 0.5 }));
  spire85.position.y = 18.3;
  sky85.add(spire85);
  sky85.scale.setScalar(0.8);
  sky85.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  sky85.userData.clickable = "sky85";
  island.add(sky85);
  addLabel("85 大樓", sky85, 21);

  // ---------- 夢時代摩天輪 ----------
  const WHEEL = { x: 3, z: 11, h: 5.2, r: 3.6 };
  const wheelBase = new THREE.Group();
  wheelBase.position.set(WHEEL.x, GROUND_TOP, WHEEL.z);
  wheelBase.rotation.y = -0.5;
  const steel = mat(0xe8e8e6, { flatShading: false, metalness: 0.4 });
  [-0.7, 0.7].forEach(side => {
    wheelBase.add(beam(new THREE.Vector3(-1.6, 0, side), new THREE.Vector3(0, WHEEL.h, side * 0.45), 0.16, steel));
    wheelBase.add(beam(new THREE.Vector3(1.6, 0, side), new THREE.Vector3(0, WHEEL.h, side * 0.45), 0.16, steel));
  });
  const wheel = new THREE.Group();
  wheel.position.y = WHEEL.h;
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, emissive: 0xff6fa8, emissiveIntensity: 0, metalness: 0.3, roughness: 0.4 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(WHEEL.r, 0.09, 8, 64), rimMat);
  const rim2 = new THREE.Mesh(new THREE.TorusGeometry(WHEEL.r * 0.55, 0.06, 8, 48), rimMat);
  wheel.add(rim, rim2);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 16), steel);
  hub.rotation.x = Math.PI / 2;
  wheelBase.add(hub);
  hub.position.y = WHEEL.h;
  const cabins = [];
  const cabinColors = [0xff7fa8, 0x5fb3f2, 0xf2c230, 0x7fd18b, 0xb58af2, 0xff9a5f];
  const CABINS = 16;
  for (let k = 0; k < CABINS; k++) {
    const a = (k / CABINS) * Math.PI * 2;
    wheel.add(beam(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * WHEEL.r, Math.sin(a) * WHEEL.r, 0), 0.04, steel));
    const cabin = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.42), mat(cabinColors[k % cabinColors.length], { flatShading: false }));
    body.position.y = -0.32;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.2, 4), steel);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = -0.02;
    cabin.add(body, roof);
    cabin.position.set(Math.cos(a) * WHEEL.r, Math.sin(a) * WHEEL.r, 0);
    wheel.add(cabin);
    cabins.push(cabin);
  }
  wheelBase.add(wheel);
  wheelBase.traverse(o => { if (o.isMesh) o.castShadow = true; });
  wheelBase.userData.clickable = "wheel";
  island.add(wheelBase);
  addLabel("夢時代摩天輪", wheelBase, WHEEL.h + WHEEL.r + 1.2);

  // ---------- 駁二：紅磚倉庫＋彩色壁畫 ----------
  const pier2 = new THREE.Group();
  pier2.userData.clickable = "pier2";
  const brick = mat(0xb4553a);
  const roofMat = mat(0x4a4a4f);
  const muralColors = [0xf2c230, 0x5fb3f2, 0xff7fa8, 0x7fd18b, 0xffffff];
  [-10.2, -6.6, -3.0].forEach((x, k) => {
    const wh = new THREE.Group();
    wh.position.set(x, GROUND_TOP, -12.2 + (k % 2) * 0.4);
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.3, 1.7), brick);
    body.position.y = 0.65;
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 3.3, 3), roofMat);
    roof.rotation.z = Math.PI / 2;
    roof.scale.set(1, 1, 0.55);
    roof.position.y = 1.5;
    wh.add(body, roof);
    for (let p = 0; p < 3; p++) {
      const mural = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), mat(muralColors[(k + p) % muralColors.length], { flatShading: false }));
      mural.position.set(-1 + p, 0.65, 0.86);
      wh.add(mural);
    }
    wh.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    pier2.add(wh);
  });
  island.add(pier2);
  const pier2Label = new THREE.Object3D();
  pier2Label.position.set(-6.6, GROUND_TOP, -12.2);
  island.add(pier2Label);
  addLabel("駁二藝術特區", pier2Label, 2.8);

  // ---------- 愛河：從海灣蜿蜒進市區 ----------
  const riverCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-9.6, 0, -4.4), new THREE.Vector3(-5, 0, -6.4), new THREE.Vector3(-0.5, 0, -5.2),
    new THREE.Vector3(4, 0, -7.6), new THREE.Vector3(9, 0, -6.4), new THREE.Vector3(13.5, 0, -9),
  ]);
  const riverGeo = new THREE.TubeGeometry(riverCurve, 80, 0.8, 8, false);
  riverGeo.scale(1, 0.04, 1);
  const river = new THREE.Mesh(riverGeo, mat(0x3f9fd0, { flatShading: false, roughness: 0.15, metalness: 0.2, emissive: 0x0b3550 }));
  river.position.y = GROUND_TOP + 0.02;
  island.add(river);
  const riverSamples = riverCurve.getSpacedPoints(60);
  const nearRiver = (x, z, pad) => riverSamples.some(p => Math.hypot(p.x - x, p.z - z) < pad);
  // 兩座白色小橋
  [0.35, 0.7].forEach(u => {
    const p = riverCurve.getPointAt(u);
    const tan = riverCurve.getTangentAt(u);
    const span = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 2.2), mat(0xf7f5ef, { flatShading: false }));
    span.position.set(p.x, GROUND_TOP + 0.12, p.z);
    span.rotation.y = Math.atan2(tan.x, tan.z) + Math.PI / 2;
    span.castShadow = true;
    island.add(span);
  });
  const riverLabel = new THREE.Object3D();
  riverLabel.position.copy(riverCurve.getPointAt(0.55));
  riverLabel.position.y = GROUND_TOP;
  island.add(riverLabel);
  addLabel("愛河", riverLabel, 1.2);

  // ---------- 主角站的小廣場（駁二旁邊） ----------
  const heroSpot = new THREE.Vector3(1.6, GROUND_TOP + 0.06, -11.4);
  const square = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.12, 32), mat(0xe9dcc4, { flatShading: false }));
  square.position.set(heroSpot.x, GROUND_TOP, heroSpot.z);
  square.receiveShadow = true;
  island.add(square);

  // ---------- 走路用的路網：駁二前、愛河北岸、貨櫃場旁、摩天輪前 ----------
  const walk = { nodes: [], edges: [], gate: 0 };
  const wn = (x, y, z) => { walk.nodes.push(new THREE.Vector3(x, y, z)); return walk.nodes.length - 1; };
  const we = (a, b) => walk.edges.push([a, b]);
  const nearestOf = (list, i) => list.reduce((best, j) => (walk.nodes[j].distanceTo(walk.nodes[i]) < walk.nodes[best].distanceTo(walk.nodes[i]) ? j : best), list[0]);
  const gateNode = wn(HIGHWAY_X, 0.78, -12);
  const squareNode = wn(heroSpot.x, heroSpot.y, heroSpot.z);
  const pier2Nodes = [wn(-2.8, 0.72, -10.3), wn(-6.6, 0.72, -10.3), wn(-10.2, 0.72, -10.3)];
  const bankNodes = [];
  for (let k = 0; k <= 6; k++) {
    const u = 0.08 + k * 0.14;
    const p = riverCurve.getPointAt(u);
    const tan = riverCurve.getTangentAt(u);
    const side = new THREE.Vector3(tan.z, 0, -tan.x);
    if (side.z > 0) side.negate(); // 走北岸
    bankNodes.push(wn(p.x + side.x * 1.25, 0.72, p.z + side.z * 1.25));
  }
  const yardTop = wn(-0.2, 0.72, -3.6);
  const yard = wn(-0.2, 0.72, 2.5);
  const wheelFront = wn(3, 0.72, 5.4);
  we(gateNode, squareNode);
  we(squareNode, pier2Nodes[0]);
  we(pier2Nodes[0], pier2Nodes[1]);
  we(pier2Nodes[1], pier2Nodes[2]);
  for (let k = 0; k < bankNodes.length - 1; k++) we(bankNodes[k], bankNodes[k + 1]);
  we(squareNode, nearestOf(bankNodes, squareNode));
  we(pier2Nodes[1], nearestOf(bankNodes, pier2Nodes[1]));
  we(yardTop, nearestOf(bankNodes, yardTop));
  we(yardTop, yard);
  we(yard, wheelFront);
  walk.gate = gateNode;
  // 步道兩側 1.2 以內不蓋大樓
  const segDist = (x, z, a, b) => {
    const ab = new THREE.Vector2(b.x - a.x, b.z - a.z);
    const ap = new THREE.Vector2(x - a.x, z - a.z);
    const k = THREE.MathUtils.clamp(ap.dot(ab) / Math.max(ab.lengthSq(), 1e-6), 0, 1);
    return ap.sub(ab.multiplyScalar(k)).length();
  };
  const nearWalk = (x, z, pad) => walk.edges.some(([a, b]) => segDist(x, z, walk.nodes[a], walk.nodes[b]) < pad);

  // ---------- 港都街景：明亮的白色與粉彩色大樓 ----------
  const reserved = (x, z) =>
    (x > -7.4 && x < -0.6 && z > -3.4 && z < 9.2) ||                  // 貨櫃碼頭
    Math.hypot(x - 7, z - 2) < 3.6 ||                                 // 85 大樓
    Math.hypot(x - WHEEL.x, z - WHEEL.z) < 4.6 ||                     // 摩天輪
    (x > -12.4 && x < -0.8 && z > -14 && z < -10.2) ||                // 駁二
    Math.hypot(x - heroSpot.x, z - heroSpot.z) < 2.6 ||               // 小廣場
    (x > HIGHWAY_X - 2 && x < HIGHWAY_X + 2 && z < -11.5) ||           // 縱貫線進城的路
    nearRiver(x, z, 1.7) ||
    nearWalk(x, z, 1.2);
  const lots = [];
  for (let x = -16; x <= 16; x += 2.1) {
    for (let z = -16; z <= 16; z += 2.1) {
      const px = x + (rand() - 0.5) * 0.4;
      const pz = z + (rand() - 0.5) * 0.4;
      if (!onLand(px, pz, 0.8) || reserved(px, pz)) continue;
      if (rand() < 0.12) continue;
      lots.push({ x: px, z: pz, w: 1.1 + rand() * 0.6, d: 1.1 + rand() * 0.6, h: 1.2 + rand() * rand() * 6 });
    }
  }
  const palette = [0xf4f1ea, 0xe9e2d0, 0xcfe3ec, 0xf2d7c9, 0xd8e6cf, 0xbfc9d6, 0xf7e3a6];
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0);
  const blocks = new THREE.InstancedMesh(boxGeo, cityMaterial({ roughness: 0.6 }), lots.length);
  const q = new THREE.Quaternion();
  lots.forEach((l, i) => {
    m4.compose(new THREE.Vector3(l.x, 0, l.z), q, new THREE.Vector3(l.w, l.h, l.d));
    blocks.setMatrixAt(i, m4);
    blocks.setColorAt(i, color.setHex(palette[Math.floor(rand() * palette.length)]));
  });
  blocks.position.y = GROUND_TOP;
  blocks.scale.y = 0.001;
  blocks.castShadow = true;
  blocks.receiveShadow = true;
  island.add(blocks);

  // ---------- 沿岸的椰子樹 ----------
  const trunkMat = mat(0x9a7348);
  const frondMat = mat(0x4f9a46);
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * Math.PI * 2 + rand() * 0.08;
    // 沿著六邊形的海岸線往內縮一點種
    const r = hexRadius(a, ISLAND_R) - 1.6 - rand() * 0.8;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (inBay(x, z, 2.2)) continue;
    if (Math.abs(x - HIGHWAY_X) < 1.8 && z < -11) continue;
    const palm = new THREE.Group();
    palm.position.set(x, GROUND_TOP, z);
    const lean = new THREE.Vector3((rand() - 0.5) * 0.6, 2.2, (rand() - 0.5) * 0.6);
    palm.add(beam(new THREE.Vector3(0, 0, 0), lean, 0.16, trunkMat));
    for (let f = 0; f < 6; f++) {
      const fa = (f / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), frondMat);
      frond.scale.set(1.5, 0.15, 0.45);
      frond.position.set(lean.x + Math.cos(fa) * 0.6, lean.y - 0.1, lean.z + Math.sin(fa) * 0.6);
      frond.rotation.set(0, -fa, -0.35);
      palm.add(frond);
    }
    palm.traverse(o => { if (o.isMesh) o.castShadow = true; });
    island.add(palm);
  }

  // ---------- 大型貨櫃輪「酒肉檳友號」：從外海繞過旗津進港、靠碼頭、再出港 ----------
  // 船的長邊沿著本地 x 軸，+x 是船頭；右舷是 +z、左舷是 -z；原點在水線附近
  const ship = new THREE.Group();
  ship.userData.clickable = "ship";
  const SHIP_HALF = 3.6;
  const SHIP_WIDE = 0.78;
  // 從上往下看的船形：尖尖的船頭、方正略圓的船尾
  const shipShape = (scale = 1) => {
    const L = SHIP_HALF * scale;
    const W = SHIP_WIDE * scale;
    const sh = new THREE.Shape();
    sh.moveTo(-L, -W * 0.92);
    sh.lineTo(L * 0.55, -W);
    sh.bezierCurveTo(L * 0.85, -W, L, -W * 0.45, L * 1.04, 0);
    sh.bezierCurveTo(L, W * 0.45, L * 0.85, W, L * 0.55, W);
    sh.lineTo(-L, W * 0.92);
    sh.quadraticCurveTo(-L * 1.03, 0, -L, -W * 0.92);
    return sh;
  };
  const shipLayer = (scale, bottom, height, material) => {
    const geo = new THREE.ExtrudeGeometry(shipShape(scale), { depth: height, bevelEnabled: false, curveSegments: 16 });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, bottom, 0);
    return new THREE.Mesh(geo, material);
  };
  const shipRed = mat(0xa83228, { flatShading: false });
  const shipNavy = mat(0x1d2f4f, { flatShading: false, roughness: 0.5 });
  const shipWhite = mat(0xf4f4f2, { flatShading: false });
  ship.add(
    shipLayer(0.97, -0.45, 0.3, shipRed),       // 水線下的紅色船底
    shipLayer(1.0, -0.15, 0.06, shipWhite),     // 白色水線
    shipLayer(1.0, -0.09, 0.55, shipNavy),      // 深藍色船身
    shipLayer(0.97, 0.46, 0.04, mat(0x8a3a30)) // 甲板
  );
  // 船頭水面下的球鼻艏（露出一點點）
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), shipRed);
  bulb.scale.set(0.45, 0.16, 0.2);
  bulb.position.set(SHIP_HALF * 1.02, -0.3, 0);
  ship.add(bulb);
  // 船頭兩側的船名
  const nameTex = (() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = "#ffffff";
    g.font = '900 64px "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    g.textBaseline = "middle";
    g.fillText("酒肉檳友號  BETEL STAR", 20, 66);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  [-1, 1].forEach(side => {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.32), new THREE.MeshBasicMaterial({ map: nameTex, transparent: true }));
    sign.position.set(0.6, 0.2, side * (SHIP_WIDE + 0.006));
    if (side < 0) sign.rotation.y = Math.PI;
    ship.add(sign);
  });
  // 船頭甲板的擋浪牆與前桅
  const forecastle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.26, SHIP_WIDE * 1.6), shipNavy);
  forecastle.position.set(SHIP_HALF * 0.86, 0.6, 0);
  const foreMast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.9, 8), shipWhite);
  foreMast.position.set(SHIP_HALF * 0.86, 1.15, 0);
  ship.add(forecastle, foreMast);

  // 甲板上滿滿的貨櫃：一排一排疊高，船頭那幾排疊低一點
  const boxSpots = [];
  for (let bay = 0; bay < 11; bay++) {
    const x = -1.95 + bay * 0.47;
    const tiers = bay > 8 ? 3 : 4 + (bay % 3 === 0 ? 1 : 0);
    for (let row = -3; row <= 3; row++) {
      for (let tier = 0; tier < tiers; tier++) {
        boxSpots.push([x, 0.6 + tier * 0.2, row * 0.2]);
      }
    }
  }
  const shipBoxes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.45, 0.19, 0.19), mat(0xffffff, { roughness: 0.7 }), boxSpots.length);
  boxSpots.forEach(([x, y, z], i) => {
    m4.makeTranslation(x, y, z);
    shipBoxes.setMatrixAt(i, m4);
    shipBoxes.setColorAt(i, color.setHex(containerColors[Math.floor(rand() * containerColors.length)]));
  });
  ship.add(shipBoxes);

  // 船尾的白色艦橋：高高的生活區，頂層駕駛台往兩側伸出駕駛台翼
  const STERN_X = -2.75;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.7, 1.3), shipWhite);
  tower.position.set(STERN_X, 1.33, 0);
  ship.add(tower);
  const shipWindow = mat(0x22303d, { flatShading: false, roughness: 0.2, metalness: 0.3 });
  for (let k = 0; k < 5; k++) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.77, 0.07, 1.1), shipWindow);
    band.position.set(STERN_X, 0.75 + k * 0.3, 0);
    ship.add(band);
  }
  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.26, SHIP_WIDE * 2.15), shipWhite);
  bridgeDeck.position.set(STERN_X + 0.08, 2.3, 0);
  const bridgeGlass = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, SHIP_WIDE * 2.1), shipWindow);
  bridgeGlass.position.set(STERN_X + 0.08, 2.34, 0);
  const bridgeRoof = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, SHIP_WIDE * 2.2), shipNavy);
  bridgeRoof.position.set(STERN_X + 0.08, 2.45, 0);
  ship.add(bridgeDeck, bridgeGlass, bridgeRoof);
  // 雷達桅與會轉的雷達
  const radarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.6, 8), shipWhite);
  radarMast.position.set(STERN_X + 0.05, 2.75, 0);
  const radar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.5), shipWhite);
  radar.position.set(STERN_X + 0.05, 2.95, 0);
  ship.add(radarMast, radar);
  // 大煙囪：深藍色，中間一圈紅色，冒著煙
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.8, 16), shipNavy);
  funnel.position.set(STERN_X - 0.42, 2.0, 0);
  const funnelBand = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.28, 0.2, 16), mat(0xd8333a, { flatShading: false }));
  funnelBand.position.set(STERN_X - 0.42, 2.05, 0);
  ship.add(funnel, funnelBand);
  const shipSmoke = [];
  for (let i = 0; i < 6; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshBasicMaterial({ color: 0x8d8f94, transparent: true, opacity: 0.4, depthWrite: false }));
    ship.add(puff);
    shipSmoke.push({ puff, offset: i / 6 });
  }
  // 航行燈：左舷紅、右舷綠、桅頂白，晚上會亮
  const navLight = color => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
  const navMats = [navLight(0xff3030), navLight(0x30ff60), navLight(0xffffff)];
  [[STERN_X + 0.08, 2.3, -SHIP_WIDE * 1.1, 0], [STERN_X + 0.08, 2.3, SHIP_WIDE * 1.1, 1], [STERN_X + 0.05, 3.08, 0, 2], [SHIP_HALF * 0.86, 1.62, 0, 2]].forEach(([x, y, z, k]) => {
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), navMats[k]);
    light.position.set(x, y, z);
    ship.add(light);
  });
  ship.traverse(o => { if (o.isMesh && !o.material.transparent) o.castShadow = true; });
  // 船頭推開的浪與船尾的白色航跡；開得越快越明顯
  const shipWakeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
  const wakeTail = new THREE.Mesh((() => {
    const sh = new THREE.Shape();
    sh.moveTo(0, -0.7);
    sh.lineTo(-4.5, -1.6);
    sh.lineTo(-4.5, 1.6);
    sh.lineTo(0, 0.7);
    const g = new THREE.ShapeGeometry(sh);
    g.rotateX(-Math.PI / 2);
    return g;
  })(), shipWakeMat);
  wakeTail.position.set(-SHIP_HALF, -0.17, 0);
  const bowWave = new THREE.Mesh((() => {
    const g = new THREE.RingGeometry(0.7, 1.0, 24, 1, -Math.PI / 2.4, Math.PI / 1.2);
    g.rotateX(-Math.PI / 2);
    return g;
  })(), shipWakeMat);
  bowWave.position.set(SHIP_HALF * 0.82, -0.17, 0);
  ship.add(wakeTail, bowWave);
  island.add(ship);
  const shipPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-80, 0, -42), new THREE.Vector3(-46, 0, -24), new THREE.Vector3(-30, 0, -17),
    new THREE.Vector3(-22, 0, -11), new THREE.Vector3(-15.5, 0, -4), new THREE.Vector3(-11.6, 0, 2),
    new THREE.Vector3(-14, 0, 6.5), new THREE.Vector3(-20, 0, 4), new THREE.Vector3(-21.5, 0, -5),
    new THREE.Vector3(-25, 0, -15), new THREE.Vector3(-40, 0, -28), new THREE.Vector3(-70, 0, -30),
    new THREE.Vector3(-100, 0, -40),
  ], true, "centripetal");
  const shipLen = shipPath.getLength();
  const DOCK_U = 5 / 13;
  const shipState = { u: 0.02, pause: 0, docked: false };

  // ---------- 旗津渡輪：雙頭船，下層載機車、上層客艙，在灣口兩岸之間來回 ----------
  // 船的長邊沿著本地 x 軸；原點在水線附近
  const ferry = new THREE.Group();
  ferry.userData.clickable = "ferry";
  // 從上往下看的船形：前後都是圓頭（雙頭船，不用迴轉）
  const hullShape = (half, wide) => {
    const sh = new THREE.Shape();
    const end = half - wide * 0.7;
    sh.moveTo(-end, -wide);
    sh.lineTo(end, -wide);
    sh.quadraticCurveTo(half, -wide, half, 0);
    sh.quadraticCurveTo(half, wide, end, wide);
    sh.lineTo(-end, wide);
    sh.quadraticCurveTo(-half, wide, -half, 0);
    sh.quadraticCurveTo(-half, -wide, -end, -wide);
    return sh;
  };
  const hullLayer = (half, wide, bottom, height, material) => {
    const geo = new THREE.ExtrudeGeometry(hullShape(half, wide), { depth: height, bevelEnabled: false, curveSegments: 12 });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, bottom, 0);
    return new THREE.Mesh(geo, material);
  };
  const ferryWhite = mat(0xf7f7f4, { flatShading: false });
  const ferryBlue = mat(0x2a5fae, { flatShading: false });
  const ferryGlass = mat(0x1f3346, { flatShading: false, roughness: 0.2, metalness: 0.3 });
  ferry.add(
    hullLayer(1.2, 0.47, -0.22, 0.17, mat(0xb8392e, { flatShading: false })), // 水線下的紅色船底
    hullLayer(1.25, 0.5, -0.05, 0.3, ferryWhite),                               // 白色船身
    hullLayer(1.26, 0.505, 0.06, 0.07, ferryBlue),                              // 藍色腰帶
    hullLayer(1.18, 0.46, 0.25, 0.02, mat(0x8d9096, { flatShading: false }))    // 下層甲板
  );
  // 船身兩側的航線名稱
  const signTex = (() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 64;
    const g = c.getContext("2d");
    g.fillStyle = "#2a5fae";
    g.font = '900 44px "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("鼓山 ⇄ 旗津", 256, 34);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  [-1, 1].forEach(side => {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.14), new THREE.MeshBasicMaterial({ map: signTex, transparent: true }));
    sign.position.set(0, 0.17, side * 0.506);
    if (side < 0) sign.rotation.y = Math.PI;
    ferry.add(sign);
  });
  // 下層開放甲板：停著幾台機車
  const scooterColors = [0xd8333a, 0xf2c230, 0x2f6fb5, 0xf4f4f2, 0x3fa66b, 0x26262a];
  [[-0.65, -0.2], [-0.3, 0.22], [0.1, -0.22], [0.45, 0.2], [0.75, -0.18]].forEach(([x, z], k) => {
    const scooter = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.08), mat(scooterColors[k % scooterColors.length]));
    body.position.y = 0.06;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.07), mat(0x26262a));
    seat.position.set(-0.03, 0.12, 0);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.1), mat(0x6b6e74));
    bar.position.set(0.09, 0.12, 0);
    scooter.add(body, seat, bar);
    scooter.position.set(x, 0.27, z);
    ferry.add(scooter);
  });
  // 支撐上層的白色柱子
  [-0.95, -0.32, 0.32, 0.95].forEach(x => [-0.4, 0.4].forEach(z => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6), ferryWhite);
    post.position.set(x, 0.47, z);
    ferry.add(post);
  }));
  // 上層客艙：白色艙身、一排深色車窗、藍色頂邊
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.3, 0.86), ferryWhite);
  cabin.position.y = 0.82;
  const cabinWindows = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.875), ferryGlass);
  cabinWindows.position.y = 0.85;
  const cabinTrim = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.04, 0.9), ferryBlue);
  cabinTrim.position.y = 0.98;
  ferry.add(cabin, cabinWindows, cabinTrim);
  // 橙色救生圈
  const ringMat = mat(0xf26b1d, { flatShading: false });
  [-0.6, 0.6].forEach(x => [-1, 1].forEach(side => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 8, 16), ringMat);
    ring.position.set(x, 0.74, side * 0.44);
    ferry.add(ring);
  }));
  // 頂層甲板的欄杆
  const railMat = mat(0xdfe2e6);
  [[-0.85, -0.42, 0.85, -0.42], [-0.85, 0.42, 0.85, 0.42], [-0.85, -0.42, -0.85, 0.42], [0.85, -0.42, 0.85, 0.42]].forEach(([x0, z0, x1, z1]) => {
    ferry.add(beam(new THREE.Vector3(x0, 1.12, z0), new THREE.Vector3(x1, 1.12, z1), 0.025, railMat));
  });
  for (let x = -0.85; x <= 0.86; x += 0.34) {
    [-0.42, 0.42].forEach(z => ferry.add(beam(new THREE.Vector3(x, 1.0, z), new THREE.Vector3(x, 1.12, z), 0.02, railMat)));
  }
  // 頂層的乘客（吹海風）
  const shirtColors = [0xff8fb8, 0x5fb3f2, 0xf2c230, 0x7fd18b, 0xffffff];
  [[-0.6, 0.3], [-0.2, -0.32], [0.55, 0.28], [0.65, -0.3]].forEach(([x, z], k) => {
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.14, 8), mat(shirtColors[k % shirtColors.length], { flatShading: false }));
    torso.position.set(x, 1.07, z);
    const headP = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mat(0xffd8b8, { flatShading: false }));
    headP.position.set(x, 1.18, z);
    ferry.add(torso, headP);
  });
  // 駕駛艙、桅杆、旗子
  const wheelhouse = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.5), ferryWhite);
  wheelhouse.position.y = 1.12;
  const wheelGlass = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.09, 0.52), ferryGlass);
  wheelGlass.position.y = 1.16;
  const wheelRoof = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.58), ferryBlue);
  wheelRoof.position.y = 1.26;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6), railMat);
  mast.position.y = 1.48;
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.11), new THREE.MeshStandardMaterial({ color: 0xd8333a, side: THREE.DoubleSide }));
  flag.position.set(0.09, 1.62, 0);
  ferry.add(wheelhouse, wheelGlass, wheelRoof, mast, flag);
  ferry.traverse(o => { if (o.isMesh && !o.material.transparent) o.castShadow = true; });
  // 船尾拖出的白色浪花（往哪個方向開，浪花就換到另一頭）
  const wakeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
  const wakeGeo = new THREE.ShapeGeometry((() => {
    const sh = new THREE.Shape();
    sh.moveTo(0, -0.35);
    sh.lineTo(-1.6, -0.75);
    sh.lineTo(-1.6, 0.75);
    sh.lineTo(0, 0.35);
    return sh;
  })());
  wakeGeo.rotateX(-Math.PI / 2);
  const wake = new THREE.Mesh(wakeGeo, wakeMat);
  wake.position.y = -0.15;
  ferry.add(wake);
  island.add(ferry);
  const FERRY_A = new THREE.Vector3(QIJIN_X + 2.3, 0, 6);
  const FERRY_B = new THREE.Vector3(-12.5, 0, 6.6);

  return {
    key: "kaohsiung",
    title: "高雄港城",
    icon: "⚓",
    subtitle: "港都的貨櫃、起重機、渡輪與摩天輪",
    group: island,
    focus: new THREE.Vector3(-4, 2, 0),
    viewScale: 1.3,
    walk,
    onClick(target, { name }) {
      switch (target.userData.clickable) {
        case "sky85": return `${name} 抬頭看 85 大樓，兩隻腳在半空中合成一棟，像個「高」字。`;
        case "wheel": return `${name} 坐上夢時代摩天輪，在最高點看見整個高雄港。`;
        case "lighthouse": return `${name} 爬上旗津燈塔，海風吹得帽子差點飛走。`;
        case "ship": return `巨大的貨櫃輪「酒肉檳友號」拉響汽笛：嗚——！${name} 向艦橋上的船長揮揮手。`;
        case "ferry": return `${name} 牽著機車擠上旗津渡輪，五分鐘就到對岸吃海產！`;
        case "pier2": return `${name} 在駁二倉庫前拍了一張網美照。`;
        case "crane": return `起重機吊起一個貨櫃，${name} 在旁邊數：一、二、三……`;
        default: return null;
      }
    },
    events: [
      () => "貨櫃輪「酒肉檳友號」拉著長長的汽笛，緩緩駛進高雄港。",
      () => "旗津渡輪又滿載一船騎著機車的乘客出發了。",
      () => "愛河畔的晚風很舒服，有人在河邊彈吉他。",
      () => "岸邊起重機一口氣吊起好幾個彩色貨櫃。",
    ],
    update(dt, t, env) {
      // 街景長出來
      const grow = THREE.MathUtils.clamp((t - 0.6) / 1.6, 0, 1);
      blocks.scale.y = Math.max(0.001, 1 - Math.pow(1 - grow, 3));

      // 起重機的小車沿吊臂來回，貨櫃上下吊
      cranes.forEach(c => {
        const s = (Math.sin(t * 0.35 + c.offset * 6) + 1) / 2;
        c.trolley.position.x = -5.2 + s * 5.4;
        c.box.position.y = -1.0 - (1 - Math.abs(Math.sin(t * 0.7 + c.offset * 4))) * 1.4;
      });

      // 貨櫃輪：靠近碼頭時減速，靠港後停一下
      if (shipState.pause > 0) {
        shipState.pause -= dt;
      } else {
        const toDock = Math.abs(shipState.u - DOCK_U);
        const slow = 0.25 + 0.75 * THREE.MathUtils.smoothstep(toDock, 0, 0.06);
        const before = shipState.u;
        shipState.u = (shipState.u + (dt * 2.2 * slow) / shipLen) % 1;
        if (before < DOCK_U && shipState.u >= DOCK_U) shipState.pause = 6;
      }
      const sp = shipPath.getPointAt(shipState.u);
      const st = shipPath.getTangentAt(shipState.u);
      ship.position.set(sp.x, -1.0 + Math.sin(t * 1.3) * 0.04, sp.z);
      ship.rotation.y = Math.atan2(-st.z, st.x);
      ship.rotation.x = Math.sin(t * 0.9) * 0.012;
      // 浪花跟著船速；雷達轉、煙囪冒煙、航行燈晚上亮
      const moving = shipState.pause > 0 ? 0 : THREE.MathUtils.smoothstep(Math.abs(shipState.u - DOCK_U), 0, 0.06);
      shipWakeMat.opacity = 0.5 * moving;
      radar.rotation.y = t * 2.5;
      shipSmoke.forEach(sm => {
        const life = (t * 0.3 + sm.offset) % 1;
        sm.puff.position.set(STERN_X - 0.42 - life * 1.4, 2.45 + life * 1.6, Math.sin(t + sm.offset * 9) * 0.15);
        sm.puff.scale.setScalar(0.7 + life * 2.2);
        sm.puff.material.opacity = 0.4 * (1 - life);
      });
      navMats.forEach(m => { m.emissiveIntensity = 0.2 + env.night * 2; });

      // 渡輪來回
      const lap = (t * 0.05) % 2;
      const k = lap < 1 ? lap : 2 - lap;
      const eased = k * k * (3 - 2 * k);
      ferry.position.lerpVectors(FERRY_A, FERRY_B, eased);
      ferry.position.y = -1.0 + Math.sin(t * 2) * 0.04;
      ferry.rotation.set(Math.sin(t * 1.6) * 0.02, -Math.atan2(FERRY_B.z - FERRY_A.z, FERRY_B.x - FERRY_A.x), Math.sin(t * 1.3) * 0.015);
      // 雙頭船不迴轉：去程浪花在 -x 那頭，回程換到 +x 那頭；開得越快浪花越明顯
      const going = lap < 1;
      wake.position.x = going ? -1.25 : 1.25;
      wake.rotation.y = going ? 0 : Math.PI;
      wakeMat.opacity = 0.55 * 6 * k * (1 - k) / 1.5;
      flag.rotation.y = Math.sin(t * 5) * 0.3;

      // 摩天輪轉動，車廂保持直立；晚上點燈
      wheel.rotation.z = t * 0.12;
      cabins.forEach(c => { c.rotation.z = -wheel.rotation.z; });
      rimMat.emissive.setHSL((t * 0.08) % 1, 0.9, 0.55);
      rimMat.emissiveIntensity = env.night * 1.2;

      // 燈塔：晚上亮燈、光束旋轉
      lampMat.emissiveIntensity = 0.2 + env.night * 1.6;
      beamPivot.rotation.y = t * 0.8;
      lightCone.material.opacity = env.night * 0.22;
    },
  };
};
