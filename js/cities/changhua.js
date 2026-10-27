// 彰化肉圓城：政策格稻田、八卦山大佛、西螺大橋、肉圓島
// 這個檔案用一般 <script> 載入（不是 module），直接雙擊 html 也能執行；THREE 由 island.html 傳進來
window.HeartCities = window.HeartCities || {};
window.HeartCities.changhua = function buildChanghua(ctx) {
  const { THREE, mat, beam, addLabel, rand, roles, roleIndex, hexPrism, hexFoam } = ctx;

  // ---------- 島體：直接坐在海裡 ----------
  const island = new THREE.Group();

  // 六角形島：外接圓半徑 19，頂點朝東西兩側（西螺大橋從東邊的頂點附近出發）
  const ground = hexPrism(19, 2.6, 0x9fbf68, 0xb08a5a);
  ground.position.y = -0.6;
  const beach = hexPrism(20.6, 1.6, 0xead6a6, 0xd9c08e);
  beach.position.y = -1.3;
  island.add(ground, beach);

  const foam = hexFoam(21.2, 22.4);
  foam.rotation.x = -Math.PI / 2;
  foam.position.y = -1.05;
  island.add(foam);

  const hillPos = new THREE.Vector3(-11, 0.7, -11);
  const roadZ = 4;
  // 彰化扇形車庫的轉車台位置（西南角）
  const ROUNDHOUSE = new THREE.Vector3(-6, 0.74, 8.2);

  // ---------- 政策格（六角格） ----------
  const cells = [];
  const hexSize = 1.6;
  const radius = 5;
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.abs(s) > radius) continue;
      const x = hexSize * Math.sqrt(3) * (q + r / 2);
      const z = hexSize * 1.5 * r;
      // 八卦山與通往大橋的道路要留空
      if (Math.hypot(x - hillPos.x, z - hillPos.z) < 5.6) continue;
      if (x > 9.5 && Math.abs(z - roadZ) < 1.8) continue;
      if (Math.hypot(x - ROUNDHOUSE.x, z - (ROUNDHOUSE.z + 2.2)) < 6.4) continue;
      // 依角度切成跟政策角色一樣多的街區，各自對應一個政策主題
      const angle = Math.atan2(z, x) + Math.PI;
      const center = q === 0 && r === 0;
      const theme = center ? roleIndex : Math.floor(angle / (Math.PI * 2) * roles.length) % roles.length;
      cells.push({ x, z, theme, center });
    }
  }

  const cellMeshes = [];
  const buildings = [];
  const ricePoints = [];
  const flowerPoints = [];
  const flowerColors = [0xff5f8f, 0xffd23f, 0xff8a3d, 0xb66dff, 0xffffff, 0xff3b3b];
  let flowerCell = null;

  cells.forEach(cell => {
    const color = new THREE.Color(roles[cell.theme].color);
    const isMine = cell.theme === roleIndex;
    const roll = rand();
    const kind = cell.center ? "plaza"
      : roll < (isMine ? 0.3 : 0.08) ? "house"
      : roll < (isMine ? 0.4 : 0.16) ? "tree"
      : "paddy";

    // 稻田的外框就是田埂，保留街區顏色方便辨認
    const tile = new THREE.Mesh(
      new THREE.CylinderGeometry(hexSize * 0.94, hexSize * 0.94, 0.4, 6),
      mat(cell.center ? color : color.clone().lerp(new THREE.Color(0xffffff), isMine ? 0.3 : 0.6))
    );
    tile.position.set(cell.x, 0.9, cell.z);
    tile.rotation.y = Math.PI / 6;
    tile.receiveShadow = true;
    tile.userData = { ...cell, clickable: "cell" };
    island.add(tile);
    cellMeshes.push(tile);

    // 田尾公路花園：一部分田改種成彩色花田
    if (kind === "paddy" && !isMine && rand() < 0.2) {
      const soil = new THREE.Mesh(new THREE.CylinderGeometry(hexSize * 0.78, hexSize * 0.78, 0.06, 6), mat(0x5f8a45));
      soil.position.set(cell.x, 1.1, cell.z);
      soil.rotation.y = Math.PI / 6;
      soil.receiveShadow = true;
      island.add(soil);
      // 一格田種成一條一條不同顏色的花
      const rowColors = [0, 1, 2].map(() => flowerColors[Math.floor(rand() * flowerColors.length)]);
      for (let ix = -3; ix <= 3; ix++) {
        for (let iz = -3; iz <= 3; iz++) {
          const px = ix * 0.34;
          const pz = iz * 0.34;
          if (Math.hypot(px, pz) > 1.1) continue;
          flowerPoints.push({ x: cell.x + px, z: cell.z + pz, color: rowColors[(iz + 3) % 3] });
        }
      }
      if (!flowerCell) flowerCell = cell;
    } else if (kind === "paddy") {
      const paddyWater = new THREE.Mesh(
        new THREE.CylinderGeometry(hexSize * 0.78, hexSize * 0.78, 0.06, 6),
        mat(0x7fa89a, { roughness: 0.2, metalness: 0.15 })
      );
      paddyWater.position.set(cell.x, 1.1, cell.z);
      paddyWater.rotation.y = Math.PI / 6;
      paddyWater.receiveShadow = true;
      island.add(paddyWater);
      // 一期稻綠油油、二期稻轉金黃
      const ripe = rand() < 0.3;
      for (let ix = -3; ix <= 3; ix++) {
        for (let iz = -3; iz <= 3; iz++) {
          const px = ix * 0.36;
          const pz = iz * 0.36;
          if (Math.hypot(px, pz) > 1.15) continue;
          ricePoints.push({ x: cell.x + px, z: cell.z + pz, ripe, s: 0.8 + rand() * 0.4 });
        }
      }
    } else if (kind !== "plaza") {
      addBuilding(cell, color, isMine, kind === "tree");
    }
  });

  // 稻子用 InstancedMesh 一次畫完，頂點著色器讓它隨風擺動
  const riceTime = { value: 0 };
  const riceGeo = new THREE.ConeGeometry(0.07, 0.5, 4);
  riceGeo.translate(0, 0.25, 0);
  const riceMat = mat(0xffffff);
  riceMat.onBeforeCompile = shader => {
    shader.uniforms.uTime = riceTime;
    shader.vertexShader = "uniform float uTime;\n" + shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      vec4 rootPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      float sway = sin(uTime * 1.8 + rootPos.x * 0.6 + rootPos.z * 0.4) * 0.35 * position.y;
      transformed.x += sway;
      transformed.z += sway * 0.5;`
    );
  };
  const rice = new THREE.InstancedMesh(riceGeo, riceMat, ricePoints.length);
  const m4 = new THREE.Matrix4();
  const green = new THREE.Color(0x67b043);
  const gold = new THREE.Color(0xd9b53f);
  ricePoints.forEach((p, i) => {
    m4.makeScale(p.s, p.s, p.s).setPosition(p.x, 1.12, p.z);
    rice.setMatrixAt(i, m4);
    rice.setColorAt(i, (p.ripe ? gold : green).clone().offsetHSL(0, 0, (rand() - 0.5) * 0.08));
  });
  rice.castShadow = true;
  island.add(rice);

  const flowers = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.13, 0), mat(0xffffff), flowerPoints.length);
  const flowerColor = new THREE.Color();
  flowerPoints.forEach((p, i) => {
    m4.makeTranslation(p.x, 1.24 + rand() * 0.06, p.z);
    flowers.setMatrixAt(i, m4);
    flowers.setColorAt(i, flowerColor.setHex(p.color));
  });
  flowers.castShadow = true;
  island.add(flowers);
  if (flowerCell) {
    const flowerLabel = new THREE.Object3D();
    flowerLabel.position.set(flowerCell.x, 1.1, flowerCell.z);
    island.add(flowerLabel);
    addLabel("田尾花田", flowerLabel, 1.2);
  }

  function addBuilding(cell, color, isMine, isTree) {
    const group = new THREE.Group();
    group.position.set(cell.x, 1.1, cell.z);
    const h = (isMine ? 1.4 : 0.8) + rand() * (isMine ? 1.6 : 1.0);

    if (isTree) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.7, 5), mat(0x8a5a3b));
      trunk.position.y = 0.35;
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), mat(0x5fb87a));
      crown.position.y = 1.2;
      group.add(trunk, crown);
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, h, 1.3), mat(color.clone().lerp(new THREE.Color(0xffffff), 0.15)));
      body.position.y = h / 2;
      group.add(body);
      // 窗戶
      const winMat = new THREE.MeshStandardMaterial({ color: 0xfff1c9, emissive: 0xffc861, emissiveIntensity: 0 });
      for (let y = 0.5; y < h - 0.2; y += 0.6) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.18, 0.4), winMat);
        win.position.y = y;
        group.add(win);
      }
      group.userData.windows = winMat;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.8, 4), mat(0xdb6a41));
      roof.position.y = h + 0.4;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
    }
    group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    group.scale.setScalar(0.001);
    group.userData.delay = rand() * 1.2;
    group.userData.mine = isMine;
    island.add(group);
    buildings.push(group);
  }

  // ---------- 八卦山與大佛 ----------
  const hill = new THREE.Mesh(new THREE.SphereGeometry(5.2, 14, 10), mat(0x6f9e55));
  hill.scale.y = 0.5;
  hill.position.copy(hillPos);
  hill.receiveShadow = true;
  island.add(hill);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.4;
    const d = 3.3 + rand() * 1.2;
    const tree = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 + rand() * 0.3, 0), mat(0x4f8f4a));
    tree.position.set(hillPos.x + Math.cos(a) * d, hillPos.y + 2.6 * Math.sqrt(1 - (d / 5.2) ** 2) + 0.4, hillPos.z + Math.sin(a) * d);
    tree.castShadow = true;
    island.add(tree);
  }

  const buddha = new THREE.Group();
  const bronze = new THREE.MeshStandardMaterial({ color: 0x4a4640, roughness: 0.5, metalness: 0.4 });
  const stone = mat(0xbdb6a8);
  const part = (geo, material, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    buddha.add(m);
    return m;
  };
  // 台座與蓮花座
  part(new THREE.CylinderGeometry(2.2, 2.4, 0.4, 8), stone, 0, 0.2, 0);
  part(new THREE.CylinderGeometry(1.9, 2.0, 0.4, 8), stone, 0, 0.6, 0);
  part(new THREE.CylinderGeometry(1.7, 1.4, 0.5, 16), bronze, 0, 1.05, 0);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const petal = part(new THREE.SphereGeometry(0.5, 10, 8), bronze, Math.cos(a) * 1.55, 1.15, Math.sin(a) * 1.55, 0.7, 1, 0.35);
    petal.rotation.y = -a + Math.PI / 2;
    petal.rotateX(-0.4);
  }
  // 盤坐的雙腿、身軀、雙手
  part(new THREE.SphereGeometry(1, 20, 14), bronze, 0, 1.6, 0.1, 1.65, 0.55, 1.15);
  const torso = part(new THREE.LatheGeometry([
    new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.95, 0.05), new THREE.Vector2(1.0, 0.6),
    new THREE.Vector2(1.05, 1.3), new THREE.Vector2(0.9, 1.75), new THREE.Vector2(0.4, 2.0), new THREE.Vector2(0.0, 2.0),
  ], 24), bronze, 0, 1.7, 0, 1, 1, 0.72);
  torso.castShadow = true;
  part(new THREE.SphereGeometry(1, 14, 10), bronze, 0, 2.05, 0.8, 0.55, 0.22, 0.35);
  [-1, 1].forEach(side => {
    buddha.add(beam(new THREE.Vector3(side * 0.95, 2.9, 0.1), new THREE.Vector3(side * 0.95, 2.2, 0.3), 0.32, bronze));
    buddha.add(beam(new THREE.Vector3(side * 0.95, 2.2, 0.3), new THREE.Vector3(side * 0.3, 2.05, 0.8), 0.28, bronze));
  });
  // 頭部：螺髮、肉髻、長耳垂、白毫
  part(new THREE.CylinderGeometry(0.32, 0.36, 0.4, 12), bronze, 0, 3.75, 0);
  part(new THREE.SphereGeometry(0.62, 22, 16), bronze, 0, 4.25, 0, 1, 1.1, 1);
  part(new THREE.SphereGeometry(0.3, 14, 10), bronze, 0, 4.88, -0.02);
  [-1, 1].forEach(side => part(new THREE.SphereGeometry(1, 10, 8), bronze, side * 0.62, 4.05, 0, 0.12, 0.38, 0.18));
  part(new THREE.SphereGeometry(0.05, 8, 6), bronze, 0, 4.42, 0.66);
  const curls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 6, 4), bronze, 140);
  for (let i = 0; i < 140; i++) {
    // 費氏球面分布，只取頭頂上半部
    const y = 1 - (i / 139) * 0.75;
    const rr = Math.sqrt(1 - y * y);
    const th = i * 2.39996;
    m4.makeTranslation(Math.cos(th) * rr * 0.63, 4.25 + y * 0.69, Math.sin(th) * rr * 0.63);
    curls.setMatrixAt(i, m4);
  }
  buddha.add(curls);
  buddha.traverse(o => { if (o.isMesh) o.castShadow = true; });

  // 晚上亮燈時，大佛的雙眼會射出紅色雷射（白天看不到）
  const eyeGlow = new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0 });
  const laserCore = new THREE.MeshBasicMaterial({ color: 0xff5050, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const laserHalo = new THREE.MeshBasicMaterial({ color: 0xff1a1a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const LASER_LEN = 16;
  // 雷射從頭部中心轉動，左右掃、微微往下照
  const laserPivot = new THREE.Group();
  laserPivot.position.set(0, 4.36, 0);
  buddha.add(laserPivot);
  [-1, 1].forEach(side => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), eyeGlow);
    eye.position.set(side * 0.22, 0, 0.6);
    // 光束沿著 +z 往前射：細細的亮芯＋外面一層柔和的光暈
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, LASER_LEN, 8, 1, true), laserCore);
    core.rotation.x = Math.PI / 2;
    core.position.set(side * 0.22, 0, 0.6 + LASER_LEN / 2);
    const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.16, LASER_LEN, 10, 1, true), laserHalo);
    halo.rotation.x = Math.PI / 2;
    halo.position.copy(core.position);
    laserPivot.add(eye, core, halo);
  });
  buddha.scale.setScalar(1.45);
  buddha.position.set(hillPos.x, hillPos.y + 2.5, hillPos.z);
  buddha.lookAt(0, buddha.position.y, 0);
  buddha.userData.clickable = "buddha";
  island.add(buddha);
  addLabel("八卦山大佛", buddha, 6.2);

  // ---------- 西螺大橋：紅色華倫式桁架 ----------
  const bridge = new THREE.Group();
  const red = mat(0xc8372d, { flatShading: false });
  const concrete = mat(0xb8b2a6);
  const deckY = 1.0;
  const spanLen = 3.6;
  const spans = 5;
  const startX = 16.5;
  const endX = startX + spans * spanLen;

  const deck = new THREE.Mesh(new THREE.BoxGeometry(endX - startX, 0.22, 2.0), mat(0x6d6a66));
  deck.position.set((startX + endX) / 2, deckY, roadZ);
  bridge.add(deck);
  const road = new THREE.Mesh(new THREE.BoxGeometry(startX - 9, 0.1, 2.0), mat(0x6d6a66));
  road.position.set((startX + 9) / 2, 0.75, roadZ);
  bridge.add(road);

  for (let i = 0; i <= spans; i++) {
    const x = startX + i * spanLen;
    if (i > 0) {
      [-0.7, 0.7].forEach(dz => {
        const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 3.6, 10), concrete);
        pier.position.set(x, deckY - 1.9, roadZ + dz);
        bridge.add(pier);
      });
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 2.2), concrete);
      cap.position.set(x, deckY - 0.2, roadZ);
      bridge.add(cap);
    }
    if (i === spans) break;
    const x0 = x;
    const x1 = x + spanLen;
    const topY = deckY + 1.5;
    [-1, 1].forEach(side => {
      const z = roadZ + side * 1.0;
      const V = (px, py) => new THREE.Vector3(px, py, z);
      bridge.add(beam(V(x0, deckY + 0.1), V(x1, deckY + 0.1), 0.14, red));
      bridge.add(beam(V(x0 + spanLen / 4, topY), V(x1 - spanLen / 4, topY), 0.14, red));
      const zig = [
        V(x0, deckY + 0.1), V(x0 + spanLen / 4, topY), V(x0 + spanLen / 2, deckY + 0.1),
        V(x1 - spanLen / 4, topY), V(x1, deckY + 0.1),
      ];
      for (let k = 0; k < zig.length - 1; k++) bridge.add(beam(zig[k], zig[k + 1], 0.11, red));
    });
    [x0 + spanLen / 4, x1 - spanLen / 4].forEach(px => {
      bridge.add(beam(new THREE.Vector3(px, topY, roadZ - 1), new THREE.Vector3(px, topY, roadZ + 1), 0.1, red));
    });
  }

  const islet = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.8, 2.4, 10), mat(0x9fbf68));
  islet.position.set(endX + 2.4, -0.5, roadZ);
  bridge.add(islet);

  // 載著西螺米的小貨車在橋上來回跑
  const truck = new THREE.Group();
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.6), mat(0x2f6fb5));
  cabin.position.set(0.45, 0.25, 0);
  const cargo = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.62), mat(0xf2e3b5));
  cargo.position.set(-0.2, 0.2, 0);
  truck.add(cabin, cargo);
  truck.position.set(startX, deckY + 0.12, roadZ - 0.5);
  bridge.add(truck);

  bridge.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  bridge.userData.clickable = "bridge";
  island.add(bridge);
  const bridgeLabel = new THREE.Object3D();
  bridgeLabel.position.set((startX + endX) / 2, deckY, roadZ);
  bridge.add(bridgeLabel);
  addLabel("西螺大橋", bridgeLabel, 2.4);

  // ---------- 彰化扇形車庫：扇形排開的車庫＋中間的轉車台 ----------
  const roundhouse = new THREE.Group();
  roundhouse.position.copy(ROUNDHOUSE);
  roundhouse.userData.clickable = "roundhouse";
  const gravel = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 0.08, 40), mat(0x9a948a, { flatShading: false }));
  gravel.position.set(0, 0, 2.2);
  gravel.receiveShadow = true;
  const pit = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.1, 32), mat(0x55504a, { flatShading: false }));
  pit.position.y = 0.04;
  roundhouse.add(gravel, pit);
  const railMat = mat(0x6b6460);
  const wallMat = mat(0xe9dcc4);
  const roofMat = mat(0x6d7f8f);
  const doorMat = mat(0x3a3430);
  const BAYS = 7;
  const bayAngles = [];
  for (let k = 0; k < BAYS; k++) {
    // 角度從東南到西南展開成扇形（+z 方向是 90 度）
    const theta = THREE.MathUtils.degToRad(36 + (k * 108) / (BAYS - 1));
    bayAngles.push(theta);
    const dir = new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta));
    const bay = new THREE.Group();
    bay.position.copy(dir).multiplyScalar(4.2);
    bay.rotation.y = -theta;
    const walls = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 1.2), wallMat);
    walls.position.y = 0.75;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.16, 1.32), roofMat);
    roof.position.y = 1.58;
    roof.rotation.z = -0.12;
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.1, 0.8), doorMat);
    door.position.set(-1.31, 0.55, 0);
    bay.add(walls, roof, door);
    roundhouse.add(bay);
    // 從轉車台通往每一格車庫的鐵軌
    for (const off of [-0.2, 0.2]) {
      const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(off);
      const a = dir.clone().multiplyScalar(2.1).add(side).setY(0.1);
      const b = dir.clone().multiplyScalar(3.0).add(side).setY(0.1);
      roundhouse.add(beam(a, b, 0.06, railMat));
    }
  }
  // 轉車台的橋＋蒸汽火車頭
  const turntable = new THREE.Group();
  turntable.position.y = 0.12;
  const deckTT = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.1, 0.6), mat(0x7a706a));
  turntable.add(deckTT);
  const loco = new THREE.Group();
  const black = mat(0x26262a, { flatShading: false });
  const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 1.4, 16), black);
  boiler.rotation.z = Math.PI / 2;
  boiler.position.set(0.25, 0.5, 0);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.55), black);
  cab.position.set(-0.7, 0.55, 0);
  const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.65), black);
  cabRoof.position.set(-0.7, 0.88, 0);
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.32, 10), black);
  chimney.position.set(0.75, 0.86, 0);
  const cowcatcher = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.3, 4), mat(0xc8372d));
  cowcatcher.rotation.z = -Math.PI / 2;
  cowcatcher.position.set(1.05, 0.25, 0);
  loco.add(boiler, cab, cabRoof, chimney, cowcatcher);
  for (const wx of [-0.5, 0, 0.5]) {
    for (const wz of [-0.22, 0.22]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 14), mat(0xc8372d, { flatShading: false }));
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, 0.18, wz);
      loco.add(wheel);
    }
  }
  loco.position.y = 0.05;
  turntable.add(loco);
  roundhouse.add(turntable);
  const locoSmoke = [];
  for (let i = 0; i < 5; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.5, depthWrite: false }));
    loco.add(puff);
    locoSmoke.push({ puff, offset: i / 5 });
  }
  roundhouse.traverse(o => { if (o.isMesh && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } });
  island.add(roundhouse);
  const rhLabel = new THREE.Object3D();
  rhLabel.position.set(ROUNDHOUSE.x, ROUNDHOUSE.y, ROUNDHOUSE.z + 3.4);
  island.add(rhLabel);
  addLabel("彰化扇形車庫", rhLabel, 2.6);
  // 轉車台每隔幾秒轉到下一格車庫
  const tt = { from: bayAngles[0], to: bayAngles[0], t: 1, index: 0, wait: 3 };

  // ---------- 王功燈塔：西海岸黑白相間的燈塔 ----------
  const wanggong = new THREE.Group();
  wanggong.position.set(-16.6, 0.7, 0);
  wanggong.userData.clickable = "wanggong";
  for (let k = 0; k < 7; k++) {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52 - (k + 1) * 0.02, 0.52 - k * 0.02, 0.6, 8),
      mat(k % 2 ? 0x26262a : 0xf7f5ef)
    );
    band.position.y = 0.3 + k * 0.6;
    wanggong.add(band);
  }
  const wgRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 8), mat(0x26262a));
  wgRoom.position.y = 4.3;
  const wgLampMat = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: 0.2 });
  const wgLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.45, 8), wgLampMat);
  wgLamp.position.y = 4.64;
  const wgCap = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.45, 8), mat(0xc8372d));
  wgCap.position.y = 5.1;
  wanggong.add(wgRoom, wgLamp, wgCap);
  const wgBeamPivot = new THREE.Group();
  wgBeamPivot.position.y = 4.64;
  const wgCone = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 10, 20, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
  );
  wgCone.rotation.z = Math.PI / 2;
  wgCone.position.x = 5;
  wgBeamPivot.add(wgCone);
  wanggong.add(wgBeamPivot);
  wanggong.traverse(o => { if (o.isMesh && o !== wgCone) o.castShadow = true; });
  island.add(wanggong);
  addLabel("王功燈塔", wanggong, 6.2);

  // ---------- 彰化肉圓：放在西螺大橋對岸的小島上 ----------
  const bawan = new THREE.Group();
  bawan.position.set(endX + 2.4, 0.7, roadZ);
  // 白瓷盤＋藍邊
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.4, 0.2, 40), mat(0xf7f5ef, { flatShading: false, roughness: 0.3 }));
  plate.position.y = 0.1;
  const plateRim = new THREE.Mesh(new THREE.TorusGeometry(2.62, 0.06, 8, 48), mat(0x3d6fb5, { flatShading: false }));
  plateRim.rotation.x = Math.PI / 2;
  plateRim.position.y = 0.2;
  // 半透明 Q 彈外皮（扁圓頂，底部略收）
  const skinGeo = new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const bawanSkin = new THREE.Mesh(skinGeo, new THREE.MeshPhysicalMaterial({
    color: 0xeedcc4, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.2, transparent: true, opacity: 0.9,
  }));
  bawanSkin.scale.set(2.1, 1.25, 2.1);
  bawanSkin.position.y = 0.05;
  // 隱約透出來的肉餡
  const filling = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 14), mat(0x9a5a3a, { flatShading: false }));
  filling.scale.set(1.2, 0.55, 1.2);
  filling.position.y = 0.55;
  // 淋上的紅色醬汁：不規則的扁圓片，沿著外皮往下流
  const sauceMat = mat(0xc9443a, { flatShading: false, roughness: 0.35 });
  const sauce = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI * 0.3), sauceMat);
  sauce.scale.set(1.75, 1.3, 1.6);
  sauce.position.y = 0.04;
  bawan.add(plate, plateRim, filling, bawanSkin, sauce);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rand() * 0.5;
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), sauceMat);
    drip.scale.set(1, 1.8, 0.7);
    drip.position.set(Math.cos(a) * 1.55, 0.75 + rand() * 0.2, Math.sin(a) * 1.55);
    drip.lookAt(0, 0.75, 0);
    bawan.add(drip);
  }
  // 香菜點綴
  const cilantroMat = mat(0x3f9a3c);
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), cilantroMat);
    const a = rand() * Math.PI * 2;
    const r = rand() * 0.8;
    leaf.position.set(Math.cos(a) * r, 1.32 - r * 0.15, Math.sin(a) * r);
    leaf.scale.set(1.3, 0.4, 1);
    bawan.add(leaf);
  }
  // 熱騰騰的蒸氣
  const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false });
  const steam = [];
  for (let i = 0; i < 6; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), steamMat.clone());
    bawan.add(puff);
    steam.push({ puff, offset: i / 6, x: (rand() - 0.5) * 1.2, z: (rand() - 0.5) * 1.2 });
  }
  bawan.traverse(o => { if (o.isMesh && o.material !== steamMat) o.castShadow = true; });
  bawan.userData.clickable = "bawan";
  island.add(bawan);
  addLabel("彰化肉圓", bawan, 3.4);

  // ---------- 走路用的路網：田埂（六角格之間的邊）＋通往西螺大橋的路 ----------
  const walk = { nodes: [], edges: [], gate: 0 };
  const nodeIndex = new Map();
  const walkNode = (x, y, z) => {
    const key = `${Math.round(x * 10)},${Math.round(z * 10)}`;
    if (!nodeIndex.has(key)) {
      nodeIndex.set(key, walk.nodes.length);
      walk.nodes.push(new THREE.Vector3(x, y, z));
    }
    return nodeIndex.get(key);
  };
  const edgeKeys = new Set();
  const walkEdge = (a, b) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a !== b && !edgeKeys.has(key)) { edgeKeys.add(key); walk.edges.push([a, b]); }
  };
  cells.forEach(c => {
    const ids = [];
    for (let k = 0; k < 6; k++) {
      const a = Math.PI / 6 + (k * Math.PI) / 3;
      ids.push(walkNode(c.x + Math.cos(a) * hexSize, 1.12, c.z + Math.sin(a) * hexSize));
    }
    ids.forEach((id, k) => walkEdge(id, ids[(k + 1) % 6]));
  });
  const ridgeCount = walk.nodes.length;
  const laneZ = roadZ + 0.5;
  const roadEnd = walkNode(9.2, 0.82, laneZ);
  let nearestRidge = 0;
  for (let i = 0; i < ridgeCount; i++) {
    if (walk.nodes[i].distanceTo(walk.nodes[roadEnd]) < walk.nodes[nearestRidge].distanceTo(walk.nodes[roadEnd])) nearestRidge = i;
  }
  // 西螺大橋引道和縱貫線交會的路口，就是彰化接上縱貫線的地方
  const crossing = walkNode(14.4, 0.82, laneZ);
  const bridgeA = walkNode(startX, deckY + 0.12, laneZ);
  const bridgeB = walkNode(endX - 0.4, deckY + 0.12, laneZ);
  walkEdge(nearestRidge, roadEnd);
  walkEdge(roadEnd, crossing);
  walkEdge(crossing, bridgeA);
  walkEdge(bridgeA, bridgeB);
  walk.gate = crossing;

  return {
    key: "changhua",
    title: "彰化肉圓城",
    icon: "🥟",
    subtitle: "稻浪、八卦山大佛與西螺大橋",
    group: island,
    // 城市中心偏向大橋，鏡頭才看得到整座城
    focus: new THREE.Vector3(5, 1.5, 0),
    walk,
    onClick(target, { name, role, roles, roleIndex }) {
      switch (target.userData.clickable) {
        case "buddha": return `${name} 爬上八卦山，向大佛許願：「${role.motto}」`;
        case "bridge": return `${name} 走上西螺大橋，紅色桁架在陽光下閃閃發亮。`;
        case "roundhouse": return `${name} 走進彰化扇形車庫，看著蒸汽火車頭在轉車台上慢慢轉向。`;
        case "wanggong": return `${name} 在王功燈塔下看夕陽，黑白條紋的燈塔被染成橘色。`;
        case "bawan": return `${name} 一口咬下彰化肉圓，Q 彈外皮配上甜辣醬，燙到跳起來！`;
        default: {
          const cell = target.userData;
          const r = roles[cell.theme];
          target.material.emissive.set(r.color);
          target.material.emissiveIntensity = 0.9;
          return cell.theme === roleIndex
            ? `${name} 回到自己的${r.theme}街區：${r.motto}`
            : `${name} 走進${r.theme}街區，遇見了${r.title} ${r.icon}`;
        }
      }
    },
    events: [
      () => "八卦山大佛今天也靜靜看顧著整片稻田。",
      () => "一台載滿西螺米的小貨車開過西螺大橋。",
      () => "風吹過稻浪，田埂上的白鷺鷥飛了起來。",
      () => "肉圓攤前排起長長的人龍，蒸氣一陣一陣往上冒。",
      () => "扇形車庫的轉車台轉了半圈，火車頭準備進庫休息。",
      () => "田尾的花田開得五顏六色，騎腳踏車的人都停下來拍照。",
      () => "王功燈塔亮起燈，照著西海岸的蚵田。",
    ],
    update(dt, t, env) {
      // 建築生長
      buildings.forEach(b => {
        const p = THREE.MathUtils.clamp((t - 0.8 - b.userData.delay) / 0.6, 0, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        b.scale.setScalar(Math.max(0.001, ease));
        if (b.userData.mine && p === 1) b.position.y = 1.1 + Math.sin(t * 2 + b.position.x) * 0.05;
        if (b.userData.windows) b.userData.windows.emissiveIntensity = env.night * 1.4;
      });
      // 被點過的格子慢慢退光
      cellMeshes.forEach(m => { m.material.emissiveIntensity *= 0.94; });
      riceTime.value = t;
      foam.material.opacity = 0.35 + Math.sin(t * 1.5) * 0.15;
      foam.scale.setScalar(1 + Math.sin(t * 1.5) * 0.015);

      // 小貨車來回跑，到橋頭就掉頭（固定走 -0.5 那側車道，角色們走 +0.5）
      const lap = (t * 0.12) % 2;
      const along = lap < 1 ? lap : 2 - lap;
      truck.position.x = startX + 0.6 + along * (endX - startX - 1.2);
      truck.position.z = roadZ - 0.5;
      truck.rotation.y = lap < 1 ? 0 : Math.PI;

      // 轉車台：停一下，再轉到下一格車庫
      if (tt.t < 1) {
        tt.t = Math.min(1, tt.t + dt / 2.5);
        const e = tt.t * tt.t * (3 - 2 * tt.t);
        turntable.rotation.y = -THREE.MathUtils.lerp(tt.from, tt.to, e);
      } else if ((tt.wait -= dt) <= 0) {
        tt.index = (tt.index + 1 + Math.floor(Math.random() * (BAYS - 1))) % BAYS;
        tt.from = tt.to;
        tt.to = bayAngles[tt.index];
        tt.t = 0;
        tt.wait = 4 + Math.random() * 3;
      }
      locoSmoke.forEach(s => {
        const life = (t * 0.45 + s.offset) % 1;
        s.puff.position.set(0.75 - life * 0.4, 1.05 + life * 1.6, 0);
        s.puff.scale.setScalar(0.6 + life * 1.6);
        s.puff.material.opacity = 0.45 * (1 - life);
      });
      // 王功燈塔：晚上亮燈、光束旋轉
      wgLampMat.emissiveIntensity = 0.2 + env.night * 1.6;
      wgBeamPivot.rotation.y = -t * 0.7;
      wgCone.material.opacity = env.night * 0.22;

      // 大佛的紅色雷射眼：天黑才出現，左右來回掃
      const laserOn = THREE.MathUtils.smoothstep(env.night, 0.4, 0.9);
      eyeGlow.opacity = laserOn;
      laserCore.opacity = laserOn * (0.85 + Math.sin(t * 20) * 0.1);
      laserHalo.opacity = laserOn * 0.3;
      laserPivot.visible = laserOn > 0.01;
      laserPivot.rotation.set(0.32 + Math.sin(t * 0.9) * 0.08, Math.sin(t * 0.6) * 0.55, 0);

      // 肉圓的蒸氣
      steam.forEach(s => {
        const life = (t * 0.3 + s.offset) % 1;
        s.puff.position.set(s.x + Math.sin(t + s.offset * 9) * 0.2, 1.4 + life * 2.4, s.z);
        s.puff.scale.setScalar(0.6 + life * 1.4);
        s.puff.material.opacity = 0.45 * (1 - life);
      });
    },
  };
};
