// 台北天龍城：密密麻麻的大樓、中央的台北 101、高架文湖線，還有一條繞著 101 飛的天龍
// 這個檔案用一般 <script> 載入（不是 module），直接雙擊 html 也能執行；THREE 由 island.html 傳進來
window.HeartCities = window.HeartCities || {};
window.HeartCities.taipei = function buildTaipei(ctx) {
  const { THREE, mat, addLabel, rand, cityMaterial, insideHex, hexPrism, hexFoam } = ctx;
  const island = new THREE.Group();

  // ---------- 島體與街道 ----------
  // 六角形島，柏油路面與 101 廣場也是六角形
  const ASPHALT_R = 18.6;
  const ground = hexPrism(20, 2.6, 0x9db27a, 0xa98a62);
  ground.position.y = -0.6;
  const beach = hexPrism(21.4, 1.6, 0xead6a6, 0xd9c08e);
  beach.position.y = -1.3;
  const asphalt = hexPrism(ASPHALT_R, 0.06, 0x5d5f66, 0x5d5f66, 1);
  asphalt.position.y = 0.73;
  const plaza = hexPrism(6.4, 0.12, 0xd9d2c3, 0xc9c1b0, 1);
  plaza.position.y = 0.78;
  island.add(ground, beach, asphalt, plaza);
  const PLAZA_TOP = 0.84;

  const foam = hexFoam(22, 23.2);
  foam.rotation.x = -Math.PI / 2;
  foam.position.y = -1.05;
  island.add(foam);

  // ---------- 棋盤式街廓與大樓（InstancedMesh 一次畫完） ----------
  const spacing = 4.2;
  const blockSize = 3.2;
  // 中正紀念堂（西南角）與它前面的廣場
  const CKS = { x: -9.4, z: 9.4, half: 3.2 };
  const inCks = (x, z, pad = 0) => Math.abs(x - CKS.x) < CKS.half + pad && Math.abs(z - CKS.z) < CKS.half + pad;
  const lots = [];
  const sidewalkMat = mat(0xb9b6ae);
  const treeSpots = [];
  for (let i = -4; i <= 4; i++) {
    for (let j = -4; j <= 4; j++) {
      const cx = i * spacing;
      const cz = j * spacing;
      const d = Math.hypot(cx, cz);
      // 街廓的四個角都要落在六角形路面上，也不能壓到中央的 101 廣場
      const half = blockSize / 2 + 0.3;
      const corners = [[-half, -half], [half, -half], [-half, half], [half, half]];
      if (!corners.every(([ox, oz]) => insideHex(cx + ox, cz + oz, ASPHALT_R - 0.4))) continue;
      if (corners.some(([ox, oz]) => insideHex(cx + ox, cz + oz, 6.9))) continue;
      // 北邊留給陽明山與圓山大飯店
      if (cz < -6 && cx < 10) continue;
      if (corners.some(([ox, oz]) => inCks(cx + ox, cz + oz))) continue;
      const block = new THREE.Mesh(new THREE.BoxGeometry(blockSize, 0.12, blockSize), sidewalkMat);
      block.position.set(cx, 0.8, cz);
      block.receiveShadow = true;
      island.add(block);
      // 每個街廓切成 2×2 塊地，越靠近 101 的樓越高
      for (const ox of [-0.8, 0.8]) {
        for (const oz of [-0.8, 0.8]) {
          if (rand() < 0.1) {
            treeSpots.push([cx + ox, cz + oz]);
            continue;
          }
          const near = 1 - THREE.MathUtils.clamp((d - 6.8) / 8, 0, 1);
          const h = (1.6 + near * 6.5) * (0.55 + rand() * 0.9);
          lots.push({ x: cx + ox, z: cz + oz, w: 1.15 + rand() * 0.3, d: 1.15 + rand() * 0.3, h });
        }
      }
    }
  }
  const palette = [0xc9ccd3, 0x8fa3b8, 0xdcd3c2, 0x9fb7c9, 0xb8b0a5, 0x7d8ea3, 0xe6e1d6, 0x6f7f95];
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0);
  const towers = new THREE.InstancedMesh(boxGeo, cityMaterial({ roughness: 0.5 }), lots.length);
  const roofBits = new THREE.InstancedMesh(boxGeo, mat(0x8d8f94), lots.length);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const color = new THREE.Color();
  lots.forEach((l, i) => {
    m4.compose(new THREE.Vector3(l.x, 0, l.z), q, new THREE.Vector3(l.w, l.h, l.d));
    towers.setMatrixAt(i, m4);
    towers.setColorAt(i, color.setHex(palette[Math.floor(rand() * palette.length)]));
    // 屋頂的水塔或機房
    m4.compose(new THREE.Vector3(l.x + (rand() - 0.5) * 0.4, l.h, l.z + (rand() - 0.5) * 0.4), q, new THREE.Vector3(0.35, 0.3, 0.35));
    roofBits.setMatrixAt(i, m4);
  });
  // 整座城的 y 軸縮放做「大樓長出來」的開場動畫，所以底部放在人行道高度
  towers.position.y = 0.86;
  roofBits.position.y = 0.86;
  [towers, roofBits].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.scale.y = 0.001; island.add(m); });

  // 小公園的樹
  const treeMat = mat(0x4f9a52);
  treeSpots.forEach(([x, z]) => {
    const tree = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), treeMat);
    tree.position.set(x, 1.35, z);
    tree.castShadow = true;
    island.add(tree);
  });

  // ---------- 台北 101 ----------
  const tower = new THREE.Group();
  tower.position.y = PLAZA_TOP;
  // 101 的平面是「轉角有兩段凹口」的正方形；先做一個單位大小（半邊長 1）的輪廓
  const notchedOutline = (() => {
    const n1 = 0.1;
    const n2 = 0.22;
    const corner = [[1, 1 - n2], [1 - n1, 1 - n2], [1 - n1, 1 - n1], [1 - n2, 1 - n1], [1 - n2, 1]];
    const pts = [];
    for (let q = 0; q < 4; q++) {
      const c = Math.cos((q * Math.PI) / 2);
      const s2 = Math.sin((q * Math.PI) / 2);
      corner.forEach(([x, z]) => pts.push(new THREE.Vector2(x * c - z * s2, x * s2 + z * c)));
    }
    return pts;
  })();
  // 用輪廓做出上下大小不同的柱體（中心在原點，高 h）：bottomHalf、topHalf 是底與頂的半邊長
  function notchedPrism(bottomHalf, topHalf, h) {
    const n = notchedOutline.length;
    const pos = [];
    const ring = (half, yy) => notchedOutline.map(v => [v.x * half, yy, v.y * half]);
    const bot = ring(bottomHalf, -h / 2);
    const top = ring(topHalf, h / 2);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      pos.push(...bot[i], ...bot[j], ...top[j], ...bot[i], ...top[j], ...top[i]);
    }
    const tris = THREE.ShapeUtils.triangulateShape(notchedOutline, []);
    tris.forEach(([i, j, k]) => {
      pos.push(...top[i], ...top[k], ...top[j]);
      pos.push(...bot[i], ...bot[j], ...bot[k]);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  }
  // 4 個邊的圓柱 = 方形截錐；half 是邊長的一半
  const square = (topHalf, bottomHalf, h) => {
    const g = new THREE.CylinderGeometry(topHalf * Math.SQRT2, bottomHalf * Math.SQRT2, h, 4, 1);
    g.rotateY(Math.PI / 4);
    return g;
  };
  const glass = () => new THREE.MeshStandardMaterial({ color: 0x5e9e95, roughness: 0.3, metalness: 0.35, emissive: 0x000000, flatShading: true, side: THREE.DoubleSide });
  const trim = mat(0xa9cfc7, { metalness: 0.3, roughness: 0.4 });
  const podium = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.0, 4.6), mat(0x8fb6ad));
  podium.position.y = 0.5;
  // 底座：往上收窄的 25 層
  const lower = new THREE.Mesh(notchedPrism(1.75, 1.3, 3.2), glass());
  lower.position.y = 2.6;
  tower.add(podium, lower);
  // 四面的「如意」金色圓盤
  const goldMat = mat(0xe2b33c, { flatShading: false, metalness: 0.6, roughness: 0.3 });
  for (let k = 0; k < 4; k++) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 24), goldMat);
    const a = (k * Math.PI) / 2;
    coin.position.set(Math.sin(a) * 1.46, 3.4, Math.cos(a) * 1.46);
    // 先把圓盤立起來（軸朝 z），再轉向四個面
    coin.rotation.order = "YXZ";
    coin.rotation.set(Math.PI / 2, a, 0);
    tower.add(coin);
  }
  // 八節像竹節、上寬下窄的塔身；節與節的交界是一圈淺色的收邊，側影呈鋸齒狀
  const sections = [];
  let y = 4.2;
  for (let k = 0; k < 8; k++) {
    const seg = new THREE.Mesh(notchedPrism(1.16, 1.48, 1.3), glass());
    seg.position.y = y + 0.65;
    const ledge = new THREE.Mesh(notchedPrism(1.52, 1.52, 0.06), trim);
    ledge.position.y = y + 1.3;
    tower.add(seg, ledge);
    // 每一節底部四個角的小裝飾
    for (let q = 0; q < 4; q++) {
      const a = Math.PI / 4 + (q * Math.PI) / 2;
      const deco = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 4), trim);
      deco.position.set(Math.cos(a) * 1.5, y + 0.14, Math.sin(a) * 1.5);
      deco.rotation.z = Math.PI;
      tower.add(deco);
    }
    sections.push(seg);
    y += 1.3;
  }
  // 塔頂：逐層收細
  [[1.02, 0.86, 1.0, true], [0.72, 0.56, 0.8, true], [0.42, 0.3, 0.6, false]].forEach(([bHalf, tHalf, h, notched]) => {
    const top = new THREE.Mesh(notched ? notchedPrism(bHalf, tHalf, h) : square(tHalf, bHalf, h), glass());
    top.position.y = y + h / 2;
    tower.add(top);
    sections.push(top);
    y += h;
  });
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 3.2, 8), mat(0xd9e3e0, { flatShading: false, metalness: 0.5 }));
  spire.position.y = y + 1.6;
  tower.add(spire);
  tower.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  tower.userData.clickable = "taipei101";
  island.add(tower);
  addLabel("台北 101", tower, y + 3.8);

  // ---------- 高架文湖線：棕色軌道繞城一圈 ----------
  // 六角形路面的內切圓半徑約 16.1，軌道收在裡面
  const ringR = 15.4;
  const trackY = 3.4;
  const track = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.22, 6, 160), mat(0x8a5a3b, { flatShading: false }));
  track.rotation.x = Math.PI / 2;
  track.position.y = trackY;
  track.scale.z = 0.6;
  track.castShadow = true;
  island.add(track);
  const pillarMat = mat(0xc4c0b8);
  for (let k = 0; k < 30; k++) {
    const a = (k / 30) * Math.PI * 2;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, trackY - 0.7, 8), pillarMat);
    pillar.position.set(Math.cos(a) * ringR, 0.7 + (trackY - 0.7) / 2, Math.sin(a) * ringR);
    pillar.castShadow = true;
    island.add(pillar);
  }
  // 文湖線（照實車配色）：白色車身、下半部藍色、藍色下緣一條細綠線，車頂有冷氣機組，車頭是方正的大擋風玻璃
  const train = new THREE.Group();
  const carMat = mat(0xf4f5f7, { flatShading: false, roughness: 0.4 });
  const wenhuBlue = mat(0x2a4fa3, { flatShading: false, roughness: 0.45 });
  const wenhuGreen = mat(0x3fb56b, { flatShading: false });
  const sideGlass = mat(0x6f8597, { flatShading: false, roughness: 0.2, metalness: 0.3 });
  const frontGlass = mat(0x1f2a36, { flatShading: false, roughness: 0.15, metalness: 0.4 });
  const skirtMat = mat(0x4a4d52, { flatShading: false });
  const acMat = mat(0xc9ccd1);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff1b0, emissiveIntensity: 0.4 });
  const cars = [];
  const CARS = 4;
  for (let k = 0; k < CARS; k++) {
    // 車廂的長邊沿著本地 x 軸（行進方向）；車身高度 -0.25 ~ 0.25
    const car = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.5, 0.68), carMat);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.42, 18, 1, false, 0, Math.PI), carMat);
    // 半圓柱轉成沿著 x 軸、圓弧朝上；本地 x 轉完後朝上，所以壓扁 x 讓車頂低一點
    roof.rotation.z = Math.PI / 2;
    roof.scale.set(0.3, 1, 1);
    roof.position.y = 0.25;
    // 車頂兩台冷氣機組
    [-0.35, 0.35].forEach(dx => {
      const ac = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.4), acMat);
      ac.position.set(dx, 0.34, 0);
      car.add(ac);
    });
    const windows = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.17, 0.7), sideGlass);
    windows.position.y = 0.11;
    // 下半部藍色＋細綠線
    const blue = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.21, 0.7), wenhuBlue);
    blue.position.y = -0.14;
    const green = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.03, 0.705), wenhuGreen);
    green.position.y = -0.255;
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.12, 0.6), skirtMat);
    skirt.position.y = -0.33;
    car.add(body, roof, windows, blue, green, skirt);
    // 第一節的車頭朝前（+x）、最後一節的車頭朝後（-x）：方正的車頭
    const noseDir = k === 0 ? 1 : k === CARS - 1 ? -1 : 0;
    if (noseDir) {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.66), carMat);
      cab.position.set(noseDir * 0.77, 0, 0);
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.52), frontGlass);
      shield.position.set(noseDir * 0.835, 0.09, 0);
      const cabBlue = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.21, 0.665), wenhuBlue);
      cabBlue.position.set(noseDir * 0.772, -0.14, 0);
      const cabGreen = new THREE.Mesh(new THREE.BoxGeometry(0.128, 0.03, 0.67), wenhuGreen);
      cabGreen.position.set(noseDir * 0.773, -0.255, 0);
      car.add(cab, shield, cabBlue, cabGreen);
      [-0.2, 0.2].forEach(dz => {
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), lampMat);
        lamp.position.set(noseDir * 0.84, -0.06, dz);
        car.add(lamp);
      });
    }
    car.traverse(o => { if (o.isMesh) o.castShadow = true; });
    train.add(car);
    cars.push(car);
  }
  train.userData.clickable = "mrt";
  island.add(train);

  // ---------- 天龍：繞著 101 盤旋的金色小龍 ----------
  const dragon = new THREE.Group();
  dragon.userData.clickable = "dragon";
  const scaleMat = mat(0xe8b23a, { flatShading: false, metalness: 0.3, roughness: 0.4 });
  const finMat = mat(0xd8333a, { flatShading: false });
  const dragonSegs = [];
  const SEGMENTS = 24;
  for (let k = 0; k < SEGMENTS; k++) {
    const r = 0.5 - (k / SEGMENTS) * 0.38;
    const seg = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), scaleMat);
    if (k % 3 === 1) {
      const fin = new THREE.Mesh(new THREE.ConeGeometry(r * 0.5, r * 1.2, 4), finMat);
      fin.position.y = r * 0.9;
      seg.add(fin);
    }
    dragon.add(seg);
    dragonSegs.push(seg);
  }
  // 龍頭：鼻子、雙角、眼睛、鬍鬚
  const head = dragonSegs[0];
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.55), scaleMat);
  snout.position.z = 0.55;
  head.add(snout);
  [-1, 1].forEach(side => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 6), mat(0xfff1c9, { flatShading: false }));
    horn.position.set(side * 0.2, 0.5, -0.15);
    horn.rotation.x = -0.6;
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: 0x1b1b1b }));
    eye.position.set(side * 0.24, 0.18, 0.32);
    const whisker = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 4), finMat);
    whisker.position.set(side * 0.35, -0.05, 0.75);
    whisker.rotation.set(Math.PI / 2, 0, side * 0.9);
    head.add(horn, eye, whisker);
  });
  dragon.traverse(o => { if (o.isMesh) o.castShadow = true; });
  island.add(dragon);
  const lookTarget = new THREE.Vector3();

  // ---------- 陽明山：島的北側一整條山脊，上面有幾座山頭 ----------
  const RIDGE = { x: -2, z: -12.4, sx: 11, sy: 3.2, sz: 4.6, base: 0.4 };
  // 山脊表面在 (x, z) 的高度，用來把芒草、海芋、牛放在山坡上
  const ridgeY = (x, z) => {
    const k = 1 - ((x - RIDGE.x) / RIDGE.sx) ** 2 - ((z - RIDGE.z) / RIDGE.sz) ** 2;
    return k > 0 ? RIDGE.base + RIDGE.sy * Math.sqrt(k) : null;
  };
  const mountains = new THREE.Group();
  mountains.userData.clickable = "yangmingshan";
  const ridge = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14), mat(0x7fa35a));
  ridge.scale.set(RIDGE.sx, RIDGE.sy, RIDGE.sz);
  ridge.position.set(RIDGE.x, RIDGE.base, RIDGE.z);
  mountains.add(ridge);
  const peaks = [
    { name: "七星山", x: -2, z: -13.2, r: 4, h: 7, color: 0x6f9a4f },
    { name: "大屯山", x: -8.5, z: -12, r: 3.4, h: 5.4, color: 0x789f52 },
    { name: "小觀音山", x: 3.6, z: -14, r: 2.6, h: 4, color: 0x86a85a },
  ];
  peaks.forEach(p => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 8), mat(p.color));
    cone.position.set(p.x, 2.2 + p.h / 2, p.z);
    cone.rotation.y = rand() * Math.PI;
    mountains.add(cone);
  });
  // 紗帽山：圓圓的小山
  // 紗帽山：矮胖的圓錐
  const SHAMAO = { x: 0.6, z: -15.4, r: 2.2, h: 3.4, base: 1.6 };
  const shamao = new THREE.Mesh(new THREE.ConeGeometry(SHAMAO.r, SHAMAO.h, 8), mat(0x6f9a4f));
  shamao.position.set(SHAMAO.x, SHAMAO.base + SHAMAO.h / 2, SHAMAO.z);
  shamao.rotation.y = 0.3;
  mountains.add(shamao);
  // 芒草：山坡上一叢一叢淡金色
  const grassSpots = [];
  for (let i = 0; i < 400 && grassSpots.length < 90; i++) {
    const x = RIDGE.x + (rand() * 2 - 1) * RIDGE.sx * 0.9;
    const z = RIDGE.z + (rand() * 2 - 1) * RIDGE.sz * 0.9;
    const y = ridgeY(x, z);
    if (y !== null && y > 1.4) grassSpots.push([x, y, z]);
  }
  const grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.16, 0.6, 4), mat(0xe8dcae), grassSpots.length);
  const m4g = new THREE.Matrix4();
  grassSpots.forEach(([x, y, z], i) => grass.setMatrixAt(i, m4g.makeTranslation(x, y + 0.2, z)));
  mountains.add(grass);
  // 竹子湖海芋：一小片白色花海
  const lilySpots = [];
  for (let i = 0; i < 200 && lilySpots.length < 36; i++) {
    const x = -6.5 + (rand() - 0.5) * 3;
    const z = -9.6 + (rand() - 0.5) * 1.6;
    const y = ridgeY(x, z);
    if (y !== null) lilySpots.push([x, y, z]);
  }
  const lilies = new THREE.InstancedMesh(new THREE.ConeGeometry(0.1, 0.26, 5), mat(0xfbfbf6, { flatShading: false }), lilySpots.length);
  lilySpots.forEach(([x, y, z], i) => lilies.setMatrixAt(i, m4g.makeTranslation(x, y + 0.12, z)));
  mountains.add(lilies);
  // 擎天崗的牛：一頭水牛（深灰、往後彎的大角）、一頭黃牛（黃褐色、肩上有牛峰）
  // 牛的正面朝本地 +x；頭和脖子掛在肩膀的支點上，低頭吃草時整顆頭往下
  const cows = [];
  const COW_TYPES = [
    { hide: 0x3d3d42, muzzle: 0x6b6b70, belly: 0x55555b, buffalo: true },
    { hide: 0xc4893f, muzzle: 0xe8c9a0, belly: 0xdcae6e, buffalo: false },
  ];
  [[1.2, -9.4], [2.4, -9.9]].forEach(([x, z], k) => {
    const type = COW_TYPES[k];
    const hide = mat(type.hide, { flatShading: false });
    const dark = mat(0x1e1e22, { flatShading: false });
    const cow = new THREE.Group();
    // 圓滾滾的身體：胸口、屁股兩顆橢球，下面一塊顏色較淺的肚子
    const chest = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), hide);
    chest.scale.set(0.26, 0.22, 0.2);
    chest.position.set(0.14, 0.5, 0);
    const rump = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), hide);
    rump.scale.set(0.28, 0.21, 0.19);
    rump.position.set(-0.16, 0.5, 0);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat(type.belly, { flatShading: false }));
    belly.scale.set(0.3, 0.13, 0.15);
    belly.position.set(0, 0.38, 0);
    cow.add(chest, rump, belly);
    if (!type.buffalo) {
      // 黃牛肩上的牛峰
      const hump = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), hide);
      hump.scale.set(0.11, 0.1, 0.1);
      hump.position.set(0.2, 0.7, 0);
      cow.add(hump);
    }
    // 四條細腿＋黑色牛蹄
    for (const lx of [-0.27, 0.22]) {
      for (const lz of [-0.1, 0.1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.34, 8), hide);
        leg.position.set(lx, 0.2, lz);
        const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.05, 8), dark);
        hoof.position.set(lx, 0.025, lz);
        cow.add(leg, hoof);
      }
    }
    // 尾巴：從屁股垂下，末端一撮毛
    const tail = new THREE.Group();
    tail.position.set(-0.43, 0.6, 0);
    const tailRope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.34, 6), hide);
    tailRope.position.y = -0.17;
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), dark);
    tuft.scale.y = 1.6;
    tuft.position.y = -0.35;
    tail.add(tailRope, tuft);
    cow.add(tail);
    // 脖子與頭
    const neck = new THREE.Group();
    neck.position.set(0.32, 0.58, 0);
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.22, 10), hide);
    neckMesh.rotation.z = -1.0;
    neckMesh.position.set(0.08, 0.02, 0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), hide);
    head.scale.set(0.15, 0.11, 0.1);
    head.position.set(0.22, 0.02, 0);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mat(type.muzzle, { flatShading: false }));
    muzzle.scale.set(0.07, 0.07, 0.085);
    muzzle.position.set(0.35, -0.03, 0);
    neck.add(neckMesh, head, muzzle);
    [-1, 1].forEach(side => {
      const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), dark);
      nostril.position.set(0.42, -0.02, side * 0.03);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), dark);
      eye.position.set(0.27, 0.06, side * 0.085);
      const ear = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), hide);
      ear.scale.set(0.035, 0.02, 0.07);
      ear.position.set(0.17, 0.06, side * 0.14);
      ear.rotation.x = side * 0.4;
      neck.add(nostril, eye, ear);
      if (type.buffalo) {
        // 水牛的大角：從頭頂往兩側伸出、再往後彎
        const horn = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 16, Math.PI * 0.85), mat(0xd8cbb0, { flatShading: false }));
        horn.position.set(0.15, 0.1, side * 0.07);
        horn.rotation.set(Math.PI / 2, 0, side > 0 ? Math.PI * 0.95 : Math.PI * 0.2);
        horn.rotation.y = side * 0.3;
        neck.add(horn);
      } else {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 6), mat(0xe8dcc0, { flatShading: false }));
        horn.position.set(0.17, 0.13, side * 0.06);
        horn.rotation.x = side * 0.5;
        neck.add(horn);
      }
    });
    cow.add(neck);
    cow.traverse(o => { if (o.isMesh) o.castShadow = true; });
    cow.position.set(x, ridgeY(x, z) - 0.03, z);
    cow.rotation.y = rand() * Math.PI * 2;
    mountains.add(cow);
    cows.push({ neck, tail, phase: k * 2 });
  });
  // 小油坑：黃色硫磺地＋一直冒的蒸氣
  const VENT = new THREE.Vector3(-4.7, 3.3, -11.1);
  const sulfur = new THREE.Mesh(new THREE.CircleGeometry(0.7, 16), mat(0xe8d36a, { flatShading: false }));
  sulfur.rotation.x = -Math.PI / 2 + 0.35;
  sulfur.position.copy(VENT);
  mountains.add(sulfur);
  const ventSteam = [];
  for (let i = 0; i < 7; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff8e0, transparent: true, opacity: 0.5, depthWrite: false }));
    mountains.add(puff);
    ventSteam.push({ puff, offset: i / 7 });
  }
  mountains.traverse(o => { if (o.isMesh && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } });
  island.add(mountains);
  const yms = new THREE.Object3D();
  yms.position.set(-2, 9.6, -13.2);
  island.add(yms);
  addLabel("陽明山", yms, 1);

  // ---------- 文湖線穿過陽明山的隧道：自動找出軌道被山蓋住的路段，兩端加上隧道口 ----------
  // 山在 (x, z) 的地表高度：山脊、三座山頭、紗帽山取最高的
  const mountainTop = (x, z) => {
    let y = ridgeY(x, z) ?? 0;
    peaks.forEach(p => {
      const d = Math.hypot(x - p.x, z - p.z);
      if (d < p.r) y = Math.max(y, 2.2 + p.h * (1 - d / p.r));
    });
    const ds = Math.hypot(x - SHAMAO.x, z - SHAMAO.z);
    if (ds < SHAMAO.r) y = Math.max(y, SHAMAO.base + SHAMAO.h * (1 - ds / SHAMAO.r));
    return y;
  };
  const TUNNEL_SAMPLES = 720;
  const covered = [];
  for (let i = 0; i < TUNNEL_SAMPLES; i++) {
    const a = (i / TUNNEL_SAMPLES) * Math.PI * 2;
    covered.push(mountainTop(Math.cos(a) * ringR, Math.sin(a) * ringR) > trackY + 1.3);
  }
  // 把連續被蓋住的取樣點合併成一段段隧道（處理繞過 0 度的情況）
  const tunnels = [];
  const firstOpen = covered.indexOf(false);
  if (firstOpen >= 0) {
    for (let n = 1; n <= TUNNEL_SAMPLES; n++) {
      const i = (firstOpen + n) % TUNNEL_SAMPLES;
      const prev = (i - 1 + TUNNEL_SAMPLES) % TUNNEL_SAMPLES;
      if (covered[i] && !covered[prev]) tunnels.push({ start: firstOpen + n, end: firstOpen + n });
      if (covered[i] && tunnels.length) tunnels[tunnels.length - 1].end = firstOpen + n;
    }
  }
  // 山頭之間只露出一小段的，併成同一條隧道（露出的那段會變成石造明隧道）
  const MERGE_GAP = TUNNEL_SAMPLES / 12;
  for (let k = tunnels.length - 1; k > 0; k--) {
    if (tunnels[k].start - tunnels[k - 1].end <= MERGE_GAP) {
      tunnels[k - 1].end = tunnels[k].end;
      tunnels.splice(k, 1);
    }
  }
  // 兩端各往外延伸一段，洞口才會整個露在山外（洞口和山之間是一小段明隧道），不會被陡峭的山壁吃掉
  const SAMPLE_LEN = (Math.PI * 2 * ringR) / TUNNEL_SAMPLES;
  const ringPoint = (a, y) => new THREE.Vector3(Math.cos(a) * ringR, y, Math.sin(a) * ringR);
  // 把山加厚：沿著隧道中段疊上一排圓錐形山峰，把隧道整段蓋住，只留頭尾的洞口
  // 山峰的底在軌道下方 1，離原本入山處往內 0.8 開始放；頭尾兩座底半徑 3，坡面剛好退到洞口前
  const humpMat = mat(0x7fa35a);
  tunnels.forEach(({ start, end }) => {
    const first = start + Math.ceil(0.8 / SAMPLE_LEN);
    const last = end - Math.ceil(0.8 / SAMPLE_LEN);
    // 山峰大約每隔 3 放一座，從頭到尾平均分配，頭尾兩座剛好落在兩個洞口前
    const count = Math.max(2, Math.ceil((last - first) * SAMPLE_LEN / 3.0) + 1);
    for (let n = 0; n < count; n++) {
      const i = Math.round(first + ((last - first) * n) / (count - 1));
      // 頭尾兩座大小固定（才不會蓋住洞口）；中間的又寬又高，間距拉大也蓋得住隧道，底半徑最大 4.2，不會伸到洞口前面
      const edge = n === 0 || n === count - 1;
      const r = edge ? 3.0 : 3.6 + rand() * 0.6;
      const h = edge ? 4.0 : 5.4 + rand() * 1.6;
      const hump = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), humpMat);
      hump.rotation.y = rand() * Math.PI;
      hump.position.copy(ringPoint((i / TUNNEL_SAMPLES) * Math.PI * 2, trackY - 1.0 + h / 2));
      hump.castShadow = true;
      hump.receiveShadow = true;
      mountains.add(hump);
    }
  });
  const PORTAL_OUT = Math.ceil(1.6 / SAMPLE_LEN);
  tunnels.forEach(tn => { tn.start -= PORTAL_OUT; tn.end += PORTAL_OUT; });
  // 隧道口：石造方框中間挖出拱形洞，洞口上方兩盞燈
  const portalShape = new THREE.Shape();
  portalShape.moveTo(-1.1, -0.5);
  portalShape.lineTo(1.1, -0.5);
  portalShape.lineTo(1.1, 1.75);
  portalShape.lineTo(-1.1, 1.75);
  portalShape.lineTo(-1.1, -0.5);
  const archHole = new THREE.Path();
  archHole.moveTo(-0.62, -0.3);
  archHole.lineTo(0.62, -0.3);
  archHole.lineTo(0.62, 0.75);
  archHole.absarc(0, 0.75, 0.62, 0, Math.PI, false);
  archHole.lineTo(-0.62, -0.3);
  portalShape.holes.push(archHole);
  const portalGeo = new THREE.ExtrudeGeometry(portalShape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 16 });
  portalGeo.translate(0, 0, -0.2);
  const portalStone = mat(0x9a948a);
  const tunnelDark = new THREE.MeshBasicMaterial({ color: 0x14161a, side: THREE.BackSide });
  const tunnelLampMat = new THREE.MeshStandardMaterial({ color: 0xfff1c9, emissive: 0xffc861, emissiveIntensity: 0.2 });
  const mouthGeo = new THREE.ShapeGeometry(new THREE.Shape(archHole.getPoints(24)));
  const tunnelMouth = new THREE.MeshBasicMaterial({ color: 0x0e1014, side: THREE.DoubleSide });
  const plaqueTex = (() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 100;
    const g = c.getContext("2d");
    g.fillStyle = "#3b3f46";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#f2d16b";
    g.font = '900 60px "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("陽明山隧道", 256, 54);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const tunnelGroup = new THREE.Group();
  tunnelGroup.userData.clickable = "tunnel";
  tunnels.forEach(({ start, end }) => {
    const a0 = (start / TUNNEL_SAMPLES) * Math.PI * 2;
    const a1 = (end / TUNNEL_SAMPLES) * Math.PI * 2;
    // 隧道管：外面是石材（露出山外的那段像明隧道），裡面是深色，從洞口看進去是黑的
    const arc = [];
    for (let k = 0; k <= 32; k++) arc.push(ringPoint(a0 + ((a1 - a0) * k) / 32, trackY + 0.5));
    const tubeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc), 64, 0.66, 12, false);
    const shell = new THREE.Mesh(tubeGeo, portalStone);
    shell.castShadow = true;
    shell.receiveShadow = true;
    tunnelGroup.add(shell, new THREE.Mesh(tubeGeo, tunnelDark));
    [a0, a1].forEach((a, end) => {
      const p = ringPoint(a, trackY);
      // 洞口正面朝隧道外：起點朝角度變小的方向、終點朝角度變大的方向
      const outward = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(end ? 1 : -1);
      const portal = new THREE.Group();
      portal.position.copy(p);
      portal.lookAt(p.clone().add(outward));
      portal.add(new THREE.Mesh(portalGeo, portalStone));
      // 洞內是黑的：拱形的深色面放在洞口正面後面一點，列車開進來就消失在黑暗裡
      const mouth = new THREE.Mesh(mouthGeo, tunnelMouth);
      mouth.position.z = -0.12;
      portal.add(mouth);
      // 洞口上方寫著隧道名稱的門楣
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.3), new THREE.MeshBasicMaterial({ map: plaqueTex }));
      plaque.position.set(0, 1.5, 0.25);
      portal.add(plaque);
      [-0.9, 0.9].forEach(x => {
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.06), tunnelLampMat);
        lamp.position.set(x, 1.5, 0.25);
        portal.add(lamp);
      });
      portal.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      tunnelGroup.add(portal);
    });
  });
  island.add(tunnelGroup);

  // ---------- 圓山大飯店：紅柱金頂的宮殿式建築，在山腳下（放大成地標級） ----------
  const grand = new THREE.Group();
  grand.position.set(6.6, 0.86, -8.2);
  grand.rotation.y = -0.12;
  const podiumG = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.4, 1.6), mat(0xe9e2d0));
  podiumG.position.y = 0.2;
  const bodyG = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.5, 1.2), mat(0xc8372d));
  bodyG.position.y = 1.15;
  grand.add(podiumG, bodyG);
  // 正面一排白色窗格
  for (let k = 0; k < 6; k++) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.04), mat(0xfff1c9));
    win.position.set(-1.25 + k * 0.5, 1.15, 0.62);
    grand.add(win);
  }
  // 兩層金黃色屋頂（四角錐壓扁）
  const roofGold = mat(0xe2a838);
  [[2.7, 0.55, 2.15], [1.8, 0.5, 2.6]].forEach(([w, h, y]) => {
    // 先把四角錐轉正（邊對齊 x、z 軸）再壓扁成長方形屋頂
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1, h, 4).rotateY(Math.PI / 4), roofGold);
    roof.scale.set(w, 1, w * 0.45);
    roof.position.y = y;
    grand.add(roof);
  });
  // 正面一排紅柱、屋脊金色寶頂，晚上屋簷亮起暖黃色的燈
  for (let k = 0; k < 7; k++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.5, 8), mat(0xa8231c, { flatShading: false }));
    col.position.set(-1.5 + k * 0.5, 1.15, 0.72);
    grand.add(col);
  }
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), mat(0xf2c230, { flatShading: false, metalness: 0.6, roughness: 0.3 }));
  finial.position.y = 2.95;
  grand.add(finial);
  const eaveGlow = new THREE.MeshStandardMaterial({ color: 0xffe6a8, emissive: 0xffc861, emissiveIntensity: 0 });
  [1.9, 2.38].forEach(y => {
    const eave = new THREE.Mesh(new THREE.BoxGeometry(y > 2 ? 2.9 : 4.2, 0.06, y > 2 ? 1.5 : 1.95), eaveGlow);
    eave.position.y = y;
    grand.add(eave);
  });
  grand.scale.setScalar(1.75);
  grand.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  grand.userData.clickable = "grandhotel";
  island.add(grand);
  addLabel("🏮 圓山大飯店", grand, 3.9);

  // ---------- 中正紀念堂：白色殿身、藍色八角屋頂、正面大階梯（名牌標示「中正廟」） ----------
  const cksSquare = new THREE.Mesh(new THREE.BoxGeometry(CKS.half * 2, 0.1, CKS.half * 2), mat(0xe6e1d6, { flatShading: false }));
  cksSquare.position.set(CKS.x, 0.8, CKS.z);
  cksSquare.receiveShadow = true;
  island.add(cksSquare);
  const cks = new THREE.Group();
  cks.position.set(CKS.x - 0.3, 0.85, CKS.z - 0.3);
  // 正面（本地 +z）轉向東南，從預設鏡頭看得到階梯
  cks.rotation.y = Math.PI / 4;
  const marble = mat(0xf4f2ec, { flatShading: false });
  const stoneGrey = mat(0xd9d6cf, { flatShading: false });
  const blueTile = mat(0x2f5fb8, { roughness: 0.4 });
  // 三層基座
  [[4.0, 0.35, 0.175, stoneGrey], [3.4, 0.35, 0.525, marble], [2.9, 0.3, 0.85, stoneGrey]].forEach(([w, h, y, m]) => {
    const tier = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), m);
    tier.position.y = y;
    cks.add(tier);
  });
  // 正面一路往上的大階梯：一階一階越往裡越高
  for (let k = 0; k < 10; k++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1 * (k + 1), 0.16), marble);
    step.position.set(0, 0.05 * (k + 1), 2.9 - k * 0.15);
    cks.add(step);
  }
  // 白色方形殿身＋正門
  const hall = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.6, 2.3), marble);
  hall.position.y = 1.8;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.05), mat(0x3a4a6b, { flatShading: false }));
  door.position.set(0, 1.5, 1.16);
  cks.add(hall, door);
  // 藍色八角屋頂：下層寬屋簷、白色八角鼓座、上層屋頂、金色寶頂
  const roofLow = new THREE.Mesh(new THREE.ConeGeometry(2.1, 0.75, 8), blueTile);
  roofLow.position.y = 2.95;
  roofLow.rotation.y = Math.PI / 8;
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.5, 8), marble);
  drum.position.y = 3.45;
  drum.rotation.y = Math.PI / 8;
  const roofTop = new THREE.Mesh(new THREE.ConeGeometry(1.45, 0.95, 8), blueTile);
  roofTop.position.y = 4.15;
  roofTop.rotation.y = Math.PI / 8;
  const crownGold = mat(0xf2c230, { flatShading: false, metalness: 0.6, roughness: 0.3 });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), crownGold);
  knob.position.y = 4.72;
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 8), crownGold);
  spike.position.y = 5.0;
  cks.add(roofLow, drum, roofTop, knob, spike);
  cks.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  cks.userData.clickable = "cks";
  island.add(cks);
  addLabel("中正廟", cks, 6.2);

  // ---------- 走路用的路網：大樓之間的街道交叉口 ----------
  const walk = { nodes: [], edges: [], gate: 0 };
  const WALK_Y = 0.79;
  const gridIndex = new Map();
  const walkable = (x, z) => insideHex(x, z, ASPHALT_R - 0.9) && !insideHex(x, z, 6.6) && !(z < -6 && x < 10) && !inCks(x, z, -0.4);
  for (let i = -4; i <= 3; i++) {
    for (let j = -4; j <= 3; j++) {
      const x = (i + 0.5) * spacing;
      const z = (j + 0.5) * spacing;
      if (!walkable(x, z)) continue;
      gridIndex.set(`${i},${j}`, walk.nodes.length);
      walk.nodes.push(new THREE.Vector3(x, WALK_Y, z));
    }
  }
  gridIndex.forEach((a, key) => {
    const [i, j] = key.split(",").map(Number);
    [[i + 1, j], [i, j + 1]].forEach(([ni, nj]) => {
      const b = gridIndex.get(`${ni},${nj}`);
      if (b === undefined) return;
      const mid = walk.nodes[a].clone().add(walk.nodes[b]).multiplyScalar(0.5);
      if (walkable(mid.x, mid.z)) walk.edges.push([a, b]);
    });
  });
  // 縱貫線在南邊進城的地方
  walk.gate = walk.nodes.length;
  walk.nodes.push(new THREE.Vector3(2, WALK_Y, 15.2));
  let nearestStreet = 0;
  walk.nodes.forEach((p, i) => {
    if (i < walk.gate && p.distanceTo(walk.nodes[walk.gate]) < walk.nodes[nearestStreet].distanceTo(walk.nodes[walk.gate])) nearestStreet = i;
  });
  walk.edges.push([walk.gate, nearestStreet]);

  // ---------- 台北的小老鼠：只在台北街道上亂竄（不走縱貫線出入口，所以不會離開台北） ----------
  const streetNext = walk.nodes.map(() => []);
  walk.edges.forEach(([a, b]) => {
    if (a === walk.gate || b === walk.gate) return;
    streetNext[a].push(b);
    streetNext[b].push(a);
  });
  const streetNodes = walk.nodes.map((_, i) => i).filter(i => streetNext[i].length > 0);
  const ratFur = mat(0x8d8a86, { flatShading: false });
  const ratPink = mat(0xf2a6b4, { flatShading: false });
  const ratEye = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const rats = [];
  const RAT_COUNT = 5;
  for (let k = 0; k < RAT_COUNT; k++) {
    // 本地 +x 是鼻子朝向
    const rat = new THREE.Group();
    rat.userData.clickable = "rat";
    const body = new THREE.Group();
    rat.add(body);
    const torso = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), ratFur);
    torso.scale.set(0.34, 0.2, 0.22);
    torso.position.y = 0.22;
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), ratFur);
    head.scale.set(0.17, 0.14, 0.14);
    head.position.set(0.36, 0.28, 0);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), ratPink);
    nose.position.set(0.53, 0.28, 0);
    body.add(torso, head, nose);
    [-1, 1].forEach(side => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), ratPink);
      ear.scale.set(0.03, 0.08, 0.08);
      ear.position.set(0.3, 0.42, side * 0.09);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 5), ratEye);
      eye.position.set(0.47, 0.32, side * 0.07);
      body.add(ear, eye);
      for (const fx of [-0.15, 0.15]) {
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), ratPink);
        foot.position.set(fx, 0.04, side * 0.12);
        body.add(foot);
      }
    });
    // 細長的粉紅尾巴，往後再往上翹
    const tail = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.3, 0.2, 0), new THREE.Vector3(-0.55, 0.16, 0.06), new THREE.Vector3(-0.8, 0.24, -0.04), new THREE.Vector3(-0.95, 0.38, 0.02),
      ]), 16, 0.018, 5, false),
      ratPink
    );
    body.add(tail);
    rat.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const startNode = streetNodes[Math.floor(rand() * streetNodes.length)];
    rat.position.copy(walk.nodes[startNode]);
    island.add(rat);
    const hitbox = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hitbox.position.y = 0.25;
    rat.add(hitbox);
    rats.push({ rat, body, tail, caught: 0, from: startNode, to: startNode, along: 1, pause: rand() * 2, speed: 3.2 + rand() * 1.2, phase: rand() * 6 });
  }
  // 走到路口就隨機挑一條（盡量不走回頭路），偶爾停下來東張西望
  // 抓老鼠小遊戲用：被抓到的老鼠消失一下，再從隨機的路口冒出來；遊戲中老鼠跑更快
  let ratFrenzy = 1;
  const ratGame = {
    catch(obj) {
      const r = rats.find(x => x.rat === obj);
      if (!r || r.caught > 0) return false;
      r.caught = 1.2;
      r.rat.visible = false;
      return true;
    },
    setFrenzy(on) { ratFrenzy = on ? 1.8 : 1; },
  };
  function updateRats(dt, t) {
    rats.forEach(r => {
      if (r.caught > 0) {
        r.caught -= dt;
        if (r.caught <= 0) {
          const n = streetNodes[Math.floor(Math.random() * streetNodes.length)];
          Object.assign(r, { from: n, to: n, along: 1, pause: 0.3 });
          r.rat.position.copy(walk.nodes[n]);
          r.rat.visible = true;
        }
        return;
      }
      if (r.pause > 0) {
        r.pause -= dt;
        r.body.position.y = 0;
        r.body.rotation.y = Math.sin(t * 6 + r.phase) * 0.35;
        return;
      }
      r.body.rotation.y = 0;
      if (r.along >= 1) {
        const options = streetNext[r.to].filter(n => n !== r.from);
        const next = options.length ? options[Math.floor(Math.random() * options.length)] : r.from;
        r.from = r.to;
        r.to = next;
        r.along = 0;
        if (Math.random() < 0.2) r.pause = 0.6 + Math.random() * 1.6;
      }
      const a = walk.nodes[r.from];
      const b = walk.nodes[r.to];
      const len = Math.max(a.distanceTo(b), 0.001);
      r.along = Math.min(1, r.along + (r.speed * ratFrenzy * dt) / len);
      // 靠路邊跑，不要跟走在路中間的角色撞在一起
      const dir = new THREE.Vector3().subVectors(b, a).normalize();
      const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.55);
      r.rat.position.lerpVectors(a, b, r.along).add(side);
      r.rat.rotation.y = Math.atan2(-dir.z, dir.x);
      r.body.position.y = Math.abs(Math.sin(t * 22 + r.phase)) * 0.06;
      r.tail.rotation.y = Math.sin(t * 14 + r.phase) * 0.25;
    });
  }

  return {
    key: "taipei",
    title: "台北天龍城",
    icon: "🏙️",
    subtitle: "高樓林立，台北 101 矗立在城市中央",
    group: island,
    focus: new THREE.Vector3(0, 4, 0),
    viewScale: 1.35,
    walk,
    ratGame,
    onClick(target, { name }) {
      switch (target.userData.clickable) {
        case "yangmingshan": return `${name} 爬上七星山，在小油坑聞到濃濃的硫磺味，還在擎天崗跟牛打了招呼。`;
        case "rat": return `一隻小老鼠從 ${name} 腳邊竄過，吱吱兩聲就鑽進水溝蓋了！`;
        case "tunnel": return `文湖線鑽進陽明山隧道，${name} 在車廂裡聽到轟隆隆的回音！`;
        case "cks": return `${name} 爬上中正廟前的大階梯，剛好遇到儀隊交接，站得筆直！`;
        case "grandhotel": return `${name} 走進圓山大飯店，紅柱金瓦，聽說裡面有祕密通道！`;
        case "taipei101": return `${name} 搭上 101 的高速電梯，37 秒就衝上觀景台！`;
        case "dragon": return `天龍繞著 101 轉了一圈，對 ${name} 吐出一朵小小的祥雲。`;
        case "mrt": return `${name} 跳上棕色的文湖線，無人駕駛的車頭看出去好壯觀！`;
        default: return null;
      }
    },
    events: [
      () => "文湖線列車準時進站，棕色車身在高架上滑過。",
      () => "天龍在 101 旁盤旋，俯瞰整座天龍城。",
      () => `${ctx.name} 在信義區繞了三圈，還是找不到停車位。`,
      () => "101 的觀景台今天能見度極佳，看得到遠方的彰化。",
      () => "陽明山的芒草隨風搖曳，竹子湖的海芋開了一大片。",
      () => "中正廟的藍色屋頂在陽光下閃閃發亮，廣場上有人在練舞。",
      () => "幾隻小老鼠在天龍城的巷子裡竄來竄去，吱吱吱！",
      () => "小油坑又冒出一陣白煙，擎天崗的牛低頭吃草。",
    ],
    update(dt, t, env) {
      // 大樓長出來
      const grow = THREE.MathUtils.clamp((t - 0.6) / 1.6, 0, 1);
      const ease = 1 - Math.pow(1 - grow, 3);
      towers.scale.y = Math.max(0.001, ease);
      roofBits.scale.y = Math.max(0.001, ease);

      // 101 晚上換成彩虹燈光，每一節顏色不同
      sections.forEach((s, k) => {
        s.material.emissive.setHSL((t * 0.05 + k * 0.08) % 1, 0.8, 0.5);
        s.material.emissiveIntensity = env.night * 0.9;
      });

      updateRats(dt, t);

      // 文湖線繞圈；晚上車燈亮
      lampMat.emissiveIntensity = 0.4 + env.night * 1.6;
      tunnelLampMat.emissiveIntensity = 0.2 + env.night * 1.6;
      const a0 = t * 0.12;
      cars.forEach((car, k) => {
        const a = a0 - k * 0.098;
        car.position.set(Math.cos(a) * ringR, trackY + 0.5, Math.sin(a) * ringR);
        // 車頭（本地 +x）朝向圓周的切線方向
        car.rotation.y = -a - Math.PI / 2;
      });

      // 天龍沿著螺旋繞 101，身體一節節跟在頭後面
      dragonSegs.forEach((seg, k) => {
        // 節與節的角度差小一點，身體才會連成一條，不會像一串珠子
        const a = t * 0.55 - k * 0.075;
        const r = 5.5 + Math.sin(t * 0.7 - k * 0.2) * 0.8;
        seg.position.set(Math.cos(a) * r, 13 + Math.sin(t * 0.9 - k * 0.35) * 2.2, Math.sin(a) * r);
      });
      // 龍頭的 +z 先對準身體下一節，再轉 180 度讓鼻子朝前進方向
      head.lookAt(dragonSegs[1].getWorldPosition(lookTarget));
      head.rotateY(Math.PI);

      // 小油坑的蒸氣往上飄散；牛低頭吃草
      ventSteam.forEach(s => {
        const life = (t * 0.25 + s.offset) % 1;
        s.puff.position.set(VENT.x + Math.sin(t + s.offset * 7) * 0.3, VENT.y + 0.2 + life * 3.2, VENT.z + life * 0.6);
        s.puff.scale.setScalar(0.6 + life * 1.8);
        s.puff.material.opacity = 0.5 * (1 - life);
      });
      // 牛低頭吃草、甩尾巴
      cows.forEach(c => {
        c.neck.rotation.z = -Math.max(0, Math.sin(t * 0.8 + c.phase)) * 0.75;
        c.tail.rotation.x = Math.sin(t * 2.4 + c.phase) * 0.35;
      });
      eaveGlow.emissiveIntensity = env.night * 1.5;

      foam.material.opacity = 0.35 + Math.sin(t * 1.5) * 0.15;
      foam.scale.setScalar(1 + Math.sin(t * 1.5) * 0.015);
    },
  };
};
