// 縣市島的共用工具：蓋地標用的積木（方塊、圓柱、招牌、蒸氣…）＋把一份縣市資料蓋成一座六角島
// 每個縣市各自一個檔案（keelung.js、taoyuan.js…），用 HeartKit.county(key, K => ({ ... })) 登記
// 這個檔案用一般 <script> 載入（不是 module），要排在各縣市檔案前面；THREE 由 island.html 傳進來
window.HeartCities = window.HeartCities || {};
(function () {
  const R = 20;        // 島的外接圓半徑，跟台北、彰化、高雄三座大島一樣大
  const LM_SCALE = 1.8; // 地標的放大倍率（地標用小單位蓋，擺上島時再放大）
  const GROUND = 0.7;  // 草地頂面的高度

  // ---------- 積木工具：蓋地標時用的簡寫（每蓋一座島前，會先換成那座島的 THREE、亂數、動畫清單） ----------
  let T, MAT, BEAM, RAND, ANIMS, LAMPS;
  const cache = new Map();
  // 顏色（數字）→ 共用材質；已經是材質就原樣回傳
  const m = (c, o) => {
    if (typeof c !== "number") return c;
    const k = c + (o ? JSON.stringify(o) : "");
    if (!cache.has(k)) cache.set(k, MAT(c, o));
    return cache.get(k);
  };
  const smooth = c => m(c, { flatShading: false });
  const water = () => m(0x3f9fd0, { flatShading: false, roughness: 0.2, metalness: 0.1 });
  const clear = (c, opacity = 0.7) => m(c, { flatShading: false, transparent: true, opacity, roughness: 0.2 });
  const rnd = (a = 0, b = 1) => a + RAND() * (b - a);
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const put = (g, geo, c, x = 0, y = 0, z = 0) => {
    const mesh = new T.Mesh(geo, m(c));
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
  };
  // 以下 x, y, z 都是「中心點」；roof／gable／arch／wedge 的 y 是底部
  const box = (g, w, h, d, c, x, y, z) => put(g, new T.BoxGeometry(w, h, d), c, x, y, z);
  const cyl = (g, rt, rb, h, c, x, y, z, seg = 14) => put(g, new T.CylinderGeometry(rt, rb, h, seg), c, x, y, z);
  const cone = (g, r, h, c, x, y, z, seg = 8) => put(g, new T.ConeGeometry(r, h, seg), c, x, y, z);
  const ball = (g, r, c, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const b = put(g, new T.SphereGeometry(r, 18, 12), c, x, y, z);
    b.scale.set(sx, sy, sz);
    return b;
  };
  const tor = (g, R0, tube, c, x, y, z, arc = Math.PI * 2) => put(g, new T.TorusGeometry(R0, tube, 8, 24, arc), c, x, y, z);
  const line = (g, a, b, thick, c) => { const s = BEAM(a, b, thick, m(c)); g.add(s); return s; };
  // 四角錐屋頂（底邊 w × d，高 h）
  const roof = (g, w, h, d, c, x, y, z) => {
    const r = put(g, new T.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4), c, x, y + h / 2, z);
    r.scale.set(w, h, d);
    return r;
  };
  const extrude = (shape, depth) => {
    const geo = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 16 });
    geo.translate(0, 0, -depth / 2);
    return geo;
  };
  // 山形屋頂（三角柱）、半圓拱、斜坡楔形
  const gable = (g, w, h, d, c, x, y, z) => {
    const s = new T.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
    return put(g, extrude(s, d), c, x, y, z);
  };
  const arch = (g, r, d, c, x, y, z) => {
    const s = new T.Shape();
    s.moveTo(-r, 0); s.absarc(0, 0, r, Math.PI, 0, true); s.closePath();
    return put(g, extrude(s, d), c, x, y, z);
  };
  const wedge = (g, w, h, d, c, x, y, z) => {
    const s = new T.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.closePath();
    return put(g, extrude(s, d), c, x, y, z);
  };
  // 一次畫很多顆一樣的東西（花、種子、石頭…）：pts 是 [x, y, z, 大小]
  const inst = (g, geo, c, pts) => {
    const im = new T.InstancedMesh(geo, m(c), pts.length);
    const mm = new T.Matrix4();
    pts.forEach(([x, y, z, s = 1], i) => { mm.makeScale(s, s, s).setPosition(x, y, z); im.setMatrixAt(i, mm); });
    g.add(im);
    return im;
  };
  const dot = (r = 0.1) => new T.SphereGeometry(r, 8, 6);
  // 圓頂表面上均勻分布的點（半球，中心在原點）
  const onDome = (n, rx, ry, rz, from = 0.15) => Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * (1 - from);
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    return [Math.cos(a) * r * rx, y * ry, Math.sin(a) * r * rz];
  });
  // 文字招牌
  const sign = (g, text, w, h, fg, bg, x, y, z) => {
    const c = document.createElement("canvas");
    c.height = 96;
    c.width = Math.max(96, Math.round((96 * w) / h));
    const d = c.getContext("2d");
    if (bg) { d.fillStyle = bg; d.fillRect(0, 0, c.width, c.height); }
    let size = 68;
    const font = s => `900 ${s}px "Noto Sans TC", "Microsoft JhengHei", sans-serif`;
    d.font = font(size);
    while (d.measureText(text).width > c.width * 0.9 && size > 16) { size -= 4; d.font = font(size); }
    d.fillStyle = fg;
    d.textAlign = "center";
    d.textBaseline = "middle";
    d.fillText(text, c.width / 2, c.height / 2 + 4);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    return put(g, new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex, transparent: !bg }), x, y, z);
  };
  // 晚上會亮的材質（燈籠、窗戶、火焰…）
  const glow = (c, base = 0.3, k = 1.4) => {
    const mm = new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: base });
    mm.userData = { base, k };
    LAMPS.push(mm);
    return mm;
  };
  const anim = fn => ANIMS.push(fn);
  // 往上飄的蒸氣／煙
  const steam = (g, x, y, z, n = 4, size = 0.28, rise = 2.2, color = 0xffffff) => {
    const ps = [];
    for (let i = 0; i < n; i++) {
      const mt = new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false });
      ps.push({ p: put(g, new T.SphereGeometry(size, 10, 8), mt, x, y, z), o: i / n, dx: rnd(-1, 1) * size, dz: rnd(-1, 1) * size });
    }
    anim((dt, t) => ps.forEach(s => {
      const u = (t * 0.3 + s.o) % 1;
      s.p.position.set(x + s.dx + Math.sin(t + s.o * 9) * 0.12, y + u * rise, z + s.dz);
      s.p.scale.setScalar(0.6 + u * 1.3);
      s.p.material.opacity = 0.5 * (1 - u);
    }));
  };
  const palm = (g, x, z, s = 1) => {
    const top = V(x + rnd(-0.3, 0.3) * s, 2.2 * s, z + rnd(-0.3, 0.3) * s);
    line(g, V(x, 0, z), top, 0.16 * s, 0x9a7348);
    for (let f = 0; f < 6; f++) {
      const a = (f / 6) * Math.PI * 2;
      const fr = ball(g, 0.5 * s, 0x4f9a46, top.x + Math.cos(a) * 0.6 * s, top.y - 0.1, top.z + Math.sin(a) * 0.6 * s, 1.5, 0.15, 0.45);
      fr.rotation.set(0, -a, -0.35);
    }
  };
  // 燕尾屋頂（廟宇、城樓）：四角錐＋屋脊＋兩端翹起的燕尾
  const eave = (g, w, d, c, x, y, z, h = 0.6) => {
    roof(g, w, h, d, c, x, y, z);
    box(g, w * 0.45, 0.1, 0.12, c, x, y + h * 0.92, z);
    [-1, 1].forEach(s => {
      const tip = cone(g, 0.07, 0.5, c, x + s * w * 0.28, y + h * 1.02, z, 6);
      tip.rotation.z = -s * 1.0;
    });
  };
  // 一座小廟：石台、紅牆紅柱、兩層燕尾屋頂
  const temple = (g, w, tile = 0xe2a838) => {
    box(g, w + 0.7, 0.3, 2.3, 0xbdb6a8, 0, 0.15, 0);
    box(g, w, 1.1, 1.5, 0xc8372d, 0, 0.85, -0.1);
    box(g, 0.6, 0.8, 0.05, 0x3a2a22, 0, 0.7, 0.66);
    for (let i = 0; i < 4; i++) cyl(g, 0.08, 0.08, 1.1, 0xa8231c, -w / 2 + 0.15 + (i * (w - 0.3)) / 3, 0.85, 0.85, 8);
    eave(g, w + 1, 2.5, tile, 0, 1.4, 0);
    box(g, w * 0.6, 0.4, 1.0, 0xc8372d, 0, 2.0, 0);
    eave(g, w * 0.8, 1.7, tile, 0, 2.2, 0, 0.55);
    const lamp = glow(0xff4a3a, 0.4, 1.5);
    [-1, 1].forEach(s => ball(g, 0.14, lamp, s * (w / 2 - 0.2), 1.2, 0.95));
  };
  // 一顆飯碗／茶杯：白瓷＋藍邊，回傳碗口高度
  const bowl = (g, r, h, x = 0, z = 0) => {
    cyl(g, r, r * 0.55, h, smooth(0xfbfaf4), x, h / 2, z, 24);
    const rim = tor(g, r, 0.05, smooth(0x3d6fb5), x, h, z);
    rim.rotation.x = Math.PI / 2;
    return h;
  };

  // 把現成的材質登記成「晚上會亮」
  const lit = (material, base, k) => {
    material.userData = { base, k };
    LAMPS.push(material);
    return material;
  };

  // ---------- 蓋一座縣市島 ----------
  function buildCounty(key, define, ctx) {
    ({ THREE: T, mat: MAT, beam: BEAM, rand: RAND } = ctx);
    const anims = [];
    const lamps = [];
    ANIMS = anims;
    LAMPS = lamps;
    // 這座島的資料：把積木工具交給縣市檔案，換回它的地標清單
    const def = define({ T, m, smooth, water, clear, rnd, V, box, cyl, cone, ball, tor, line, roof, gable, arch, wedge, inst, dot, onDome, sign, glow, anim, steam, palm, eave, temple, bowl, put, lit });
    const { hexPrism, hexFoam, hexRadius, insideHex, cityMaterial, addLabel } = ctx;
    const island = new T.Group();

    const ground = hexPrism(R, 2.6, def.ground || 0xa3c070, 0xb08a5a);
    ground.position.y = -0.6;
    const beach = hexPrism(R + 1.4, 1.6, 0xead6a6, 0xd9c08e);
    beach.position.y = -1.3;
    const foam = hexFoam(R + 2, R + 3.1);
    foam.rotation.x = -Math.PI / 2;
    foam.position.y = -1.05;
    island.add(ground, beach, foam);

    // 羅盤角度（0 北、90 東）→ 島上的方向
    const compass = deg => ({ x: Math.sin((deg * Math.PI) / 180), z: -Math.cos((deg * Math.PI) / 180) });
    const rimAt = d => hexRadius(Math.atan2(d.z, d.x), R);
    const ports = ctx.ports || [];
    const portBearings = ports.map(p => (Math.atan2(p.dir.x, -p.dir.z) * 180) / Math.PI);

    // 走路用的路網：中央廣場 → 每個地標前、每個公路出入口
    const walk = { nodes: [V(0, GROUND + 0.05, 0)], edges: [], ports: {} };
    const segs = [];
    const path = (to, width, color) => {
      const len = Math.hypot(to.x, to.z);
      const s = box(island, width, 0.06, len, color, to.x / 2, GROUND + 0.01, to.z / 2);
      s.rotation.y = Math.atan2(to.x, to.z);
      segs.push(to);
      walk.nodes.push(V(to.x, GROUND + 0.05, to.z));
      walk.edges.push([0, walk.nodes.length - 1]);
      return walk.nodes.length - 1;
    };
    cyl(island, 2.6, 2.6, 0.08, smooth(0xe9dcc4), 0, GROUND + 0.02, 0, 24);
    ports.forEach(p => { walk.ports[p.key] = path({ x: p.dir.x * (rimAt(p.dir) - 1.1), z: p.dir.z * (rimAt(p.dir) - 1.1) }, 1.5, 0x55585e); });

    // 地標：擺在指定方位（太靠近公路出入口就挪開一點），正面朝向島中心
    const slots = [];
    const groups = {};
    def.landmarks.forEach(lm => {
      let at = lm.at;
      portBearings.forEach(pb => {
        const diff = ((at - pb + 540) % 360) - 180;
        if (Math.abs(diff) < 33) at = pb + (diff < 0 ? -33 : 33);
      });
      const d = compass(at);
      const r = lm.r || 12.2;
      const g = new T.Group();
      g.position.set(d.x * r, GROUND, d.z * r);
      g.rotation.y = Math.atan2(-d.x, -d.z);
      g.userData.clickable = `${key}:${lm.key}`;
      // 地標放大，在島上才夠醒目
      g.scale.setScalar(lm.scale || LM_SCALE);
      lm.build(g);
      island.add(g);
      addLabel(lm.name, g, lm.labelY || 3.4);
      const stopR = Math.min(r * 0.55, rimAt(d) - 1.6);
      path({ x: d.x * stopR, z: d.z * stopR }, 0.8, 0xd9c9a8);
      slots.push({ x: d.x * r, z: d.z * r, r: lm.fr || 5.5 });
      g.updateMatrix();
      groups[lm.key] = g;
    });
    // 空地上蓋一些房子、種樹
    const segDist = (x, z, to) => {
      const k = Math.max(0, Math.min(1, (x * to.x + z * to.z) / (to.x * to.x + to.z * to.z)));
      return Math.hypot(x - to.x * k, z - to.z * k);
    };
    const taken = [];
    const free = (x, z, pad) =>
      insideHex(x, z, R - 1.4 - pad) && Math.hypot(x, z) > 3.6 + pad &&
      !slots.some(s => Math.hypot(x - s.x, z - s.z) < s.r + pad) &&
      !segs.some(to => segDist(x, z, to) < 1.0 + pad) &&
      !taken.some(p => Math.hypot(x - p[0], z - p[1]) < 1.5);
    const scatter = (count, pad) => {
      const out = [];
      for (let i = 0; i < 1500 && out.length < count; i++) {
        const x = rnd(-R, R), z = rnd(-R, R);
        if (!free(x, z, pad)) continue;
        taken.push([x, z]);
        out.push([x, z]);
      }
      return out;
    };
    // extra：島上額外的東西（基隆的雨雲、阿里山的鐵道、屏東的檳榔園…）
    // groups 是擺好的地標；block(x, z, r) 讓房子和樹別蓋在那裡；spot(r) 找一塊半徑 r 的空地（找不到回傳 null）
    const spot = r => {
      for (let i = 0; i < 1500; i++) {
        const x = rnd(-R, R), z = rnd(-R, R);
        if (!free(x, z, r)) continue;
        slots.push({ x, z, r });
        return { x, z };
      }
      return null;
    };
    if (def.extra) def.extra(island, { groups, GROUND, spot, block: (x, z, r) => slots.push({ x, z, r }) });

    // 稻田：paddies 是幾片田，每片是 2×2 塊水田（田埂、水面、一排排稻子），有的還站著稻草人；
    // paddyGold 是金黃稻穗的比例（0 全是綠油油的秧苗）
    // 先放一片片 2×2 的大田（半徑 3.1），空地不夠放大田時，剩下的用單塊小田（半徑 1.5）塞進縫裡
    const fields = [];
    const wanted = def.paddies || 0;
    const tryField = (rad, tries) => {
      for (let i = 0; i < tries; i++) {
        const x = rnd(-R, R), z = rnd(-R, R);
        if (!free(x, z, rad) || fields.some(f => Math.hypot(x - f[0], z - f[1]) < rad + f[3] + 0.3)) continue;
        // 田的方向對齊「從島中心往外」，一片一片排起來比較整齊
        fields.push([x, z, Math.atan2(x, z) + (RAND() < 0.5 ? 0 : Math.PI / 2), rad]);
        return true;
      }
      return false;
    };
    let big = 0;
    while (big < wanted && tryField(3.1, 1500)) big++;
    for (let i = 0; i < (wanted - big) * 4; i++) if (!tryField(1.5, 800)) break;
    if (fields.length) {
      const PW = 2.2, PD = 1.6, ROWS = 4;
      const plots = [];
      fields.forEach(([cx, cz, a, rad]) => {
        slots.push({ x: cx, z: cz, r: rad });
        const k = rad > 2 ? 1 : 0;
        [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
          if (!k && (sx > 0 || sz > 0)) return;
          const ox = sx * k * (PW / 2 + 0.14), oz = sz * k * (PD / 2 + 0.14);
          plots.push({ x: cx + ox * Math.cos(a) + oz * Math.sin(a), z: cz - ox * Math.sin(a) + oz * Math.cos(a), a, gold: RAND() < (def.paddyGold || 0) });
        }));
      });
      const dikes = new T.InstancedMesh(new T.BoxGeometry(PW + 0.28, 0.12, PD + 0.28), m(0x8a6a45), plots.length);
      const pond = new T.InstancedMesh(new T.BoxGeometry(PW - 0.08, 0.03, PD - 0.08), m(0x86bfb4, { flatShading: false, roughness: 0.2, metalness: 0.15 }), plots.length);
      const rice = new T.InstancedMesh(new T.BoxGeometry(PW - 0.35, 0.24, 0.17), m(0xffffff), plots.length * ROWS);
      const mm = new T.Matrix4();
      const q = new T.Quaternion();
      const up = V(0, 1, 0);
      const col = new T.Color();
      const greens = [0x7cc44f, 0x6db544, 0x8fd05a];
      const golds = [0xe2be48, 0xd9b03c, 0xeacb5c];
      const one = V(1, 1, 1);
      plots.forEach((p, i) => {
        q.setFromAxisAngle(up, p.a);
        dikes.setMatrixAt(i, mm.compose(V(p.x, GROUND + 0.02, p.z), q, one));
        pond.setMatrixAt(i, mm.compose(V(p.x, GROUND + 0.085, p.z), q, one));
        const tone = p.gold ? golds : greens;
        col.setHex(tone[Math.floor(rnd(0, tone.length))]);
        for (let r = 0; r < ROWS; r++) {
          const oz = (r - (ROWS - 1) / 2) * ((PD - 0.3) / (ROWS - 1));
          rice.setMatrixAt(i * ROWS + r, mm.compose(V(p.x + oz * Math.sin(p.a), GROUND + 0.2, p.z + oz * Math.cos(p.a)), q, one));
          rice.setColorAt(i * ROWS + r, col);
        }
      });
      island.add(dikes, pond, rice);
      // 稻草人：站在四塊田中間的田埂交叉口，戴斗笠
      fields.forEach(([cx, cz, a, rad]) => {
        if (rad < 2 || RAND() < 0.45) return;
        const man = new T.Group();
        man.position.set(cx, GROUND, cz);
        man.rotation.y = a;
        cyl(man, 0.04, 0.04, 1.3, 0x7a5a3a, 0, 0.65, 0, 6);
        box(man, 0.9, 0.06, 0.06, 0x7a5a3a, 0, 0.95, 0);
        box(man, 0.42, 0.4, 0.2, 0xc8372d, 0, 0.9, 0);
        ball(man, 0.17, 0xe8cf8a, 0, 1.3, 0);
        cone(man, 0.36, 0.2, 0xd9b45a, 0, 1.5, 0, 12);
        island.add(man);
      });
    }

    const lots = scatter(def.houses ?? 22, 0.5);
    const unit = new T.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    const houses = new T.InstancedMesh(unit, cityMaterial({ roughness: 0.7 }), lots.length);
    const roofGeo = new T.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0);
    const roofs = new T.InstancedMesh(roofGeo, m(def.roof || 0xdb6a41), lots.length);
    const mm = new T.Matrix4();
    const q = new T.Quaternion();
    const col = new T.Color();
    const palette = def.palette || [0xf4f1ea, 0xe9e2d0, 0xcfe3ec, 0xf2d7c9, 0xd8e6cf, 0xf7e3a6];
    // tall：true 是四成蓋成大樓，也可以直接給比例；tallH 是大樓高度範圍，tallPalette 是大樓的顏色
    const tallP = def.tall === true ? 0.4 : def.tall || 0;
    const [tallLo, tallHi] = def.tallH || [2.2, 3.8];
    const tallPalette = def.tallPalette || palette;
    lots.forEach(([x, z], i) => {
      const w = rnd(1.0, 1.4);
      const tall = RAND() < tallP;
      const h = tall ? rnd(tallLo, tallHi) : rnd(0.8, 1.5);
      const pal = tall ? tallPalette : palette;
      houses.setMatrixAt(i, mm.compose(V(x, 0, z), q, V(w, h, w)));
      houses.setColorAt(i, col.setHex(pal[Math.floor(rnd(0, pal.length))]));
      const flat = h > 2 ? 0 : 1;
      roofs.setMatrixAt(i, mm.compose(V(x, h, z), q, V(w * 1.25 * flat, 0.5 * flat, w * 1.25 * flat)));
    });
    [houses, roofs].forEach(o => { o.position.y = GROUND; o.scale.y = 0.001; island.add(o); });

    const spots = scatter(def.trees ?? 32, 0.2);
    if (def.tree === "palm") {
      const grove = new T.Group();
      grove.position.y = GROUND;
      spots.slice(0, def.palms ?? 18).forEach(([x, z]) => palm(grove, x, z, rnd(0.9, 1.2)));
      island.add(grove);
    } else {
      const pineTree = def.tree === "pine";
      inst(island, new T.CylinderGeometry(0.1, 0.14, 0.7, 6), 0x8a5a3b, spots.map(([x, z]) => [x, GROUND + 0.35, z]));
      inst(island, pineTree ? new T.ConeGeometry(0.55, 1.5, 6) : new T.IcosahedronGeometry(0.65, 0), pineTree ? 0x3f7a4c : def.leaf || 0x5fb87a,
        spots.map(([x, z]) => [x, GROUND + (pineTree ? 1.3 : 1.15), z, rnd(0.8, 1.2)]));
    }

    island.traverse(o => {
      if (o.isMesh && o !== foam && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; }
    });

    const byKey = Object.fromEntries(def.landmarks.map(lm => [`${key}:${lm.key}`, lm]));
    return {
      key,
      title: def.title,
      icon: def.icon,
      subtitle: def.subtitle,
      group: island,
      focus: V(0, 2, 0),
      viewScale: 1,
      // 全景時島名飄在多高
      nameY: 18,
      walk,
      // 給護照集章用
      landmarks: def.landmarks.map(lm => ({ key: `${key}:${lm.key}`, name: lm.name, icon: lm.icon, reach: lm.reach })),
      onClick(target, { name }) {
        const lm = byKey[target.userData.clickable];
        return lm ? lm.say(name) : null;
      },
      events: def.events,
      update(dt, t, env) {
        const grow = Math.max(0.001, 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 0.6) / 1.6)), 3));
        houses.scale.y = grow;
        roofs.scale.y = grow;
        foam.material.opacity = 0.35 + Math.sin(t * 1.5) * 0.15;
        foam.scale.setScalar(1 + Math.sin(t * 1.5) * 0.015);
        lamps.forEach(l => { l.emissiveIntensity = l.userData.base + env.night * l.userData.k; });
        anims.forEach(f => f(dt, t, env));
      },
    };
  }

  window.HeartKit = {
    // 登記一座縣市島：define(K) 拿到積木工具，回傳這個縣市的名稱、地標、日誌事件
    county(key, define) {
      window.HeartCities[key] = ctx => buildCounty(key, define, ctx);
    },
  };
})();
