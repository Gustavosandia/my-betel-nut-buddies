// 屏東墾丁城：鵝鑾鼻燈塔、南灣沙灘與東港王船
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("pingtung", K => {
  const { T, m, V, rnd, smooth, water, clear, box, cyl, cone, ball, roof, arch, wedge, inst, dot, onDome, sign, glow, anim, palm, put } = K;
  return {
    title: "屏東墾丁城", icon: "🏖️", subtitle: "鵝鑾鼻燈塔、南灣沙灘與東港王船", ground: 0xbfd072,
    // 南國：滿島椰子樹、粉彩色的房子
    tree: "palm", trees: 34, palms: 34, houses: 18,
    palette: [0xfdf6e3, 0xffe0b3, 0xbfeee8, 0xffd1dc, 0xfff3a8, 0xc9f0c0],
    events: [
      () => "墾丁的太陽好大，南灣的沙灘上撐滿了彩色的陽傘。",
      () => "東港的黑鮪魚上岸了，整個漁港都在歡呼。",
      () => "落山風吹過恆春半島，洋蔥田沙沙作響。",
      () => "路邊的檳榔攤霓虹燈一閃一閃，老闆熱情地招手。",
      () => "香蕉園的香蕉黃了，一串一串比人還高。",
    ],
    landmarks: [
      { key: "aquarium", name: "海生館鯨鯊", icon: "🦈", at: 100, labelY: 4.2,
        say: n => `${n} 在海生館的海底隧道裡，抬頭看見鯨鯊從頭頂游過。`,
        build(g) {
          box(g, 3.2, 0.9, 1.6, 0x4a8fd0, 0, 0.45, -0.3);
          [-1.05, 0, 1.05].forEach(x => { const a = arch(g, 0.55, 1.6, 0x6fb3e8, x, 0.9, -0.3); a.scale.y = 0.6; });
          box(g, 3.0, 0.4, 0.05, clear(0xbfe8ff, 0.9), 0, 0.5, 0.52);
          const shark = new T.Group();
          const skin = smooth(0x4a6f8f);
          ball(shark, 0.55, skin, 0, 0, 0, 2.6, 0.75, 1.1);
          ball(shark, 0.5, smooth(0xdfe8ee), 0, -0.12, 0, 2.3, 0.5, 0.95);
          const tail = cone(shark, 0.5, 0.9, skin, -1.6, 0.15, 0, 4);
          tail.scale.z = 0.15;
          tail.rotation.z = -Math.PI / 2;
          cone(shark, 0.2, 0.5, skin, -0.1, 0.5, 0, 4).scale.z = 0.3;
          [-1, 1].forEach(s => { const f = cone(shark, 0.18, 0.7, skin, 0.4, -0.15, s * 0.6, 4); f.rotation.x = s * 1.3; f.scale.x = 0.4; });
          inst(shark, dot(0.04), 0xffffff, onDome(30, 1.4, 0.4, 0.58, 0.3));
          ball(shark, 0.04, 0x111111, 1.25, 0.05, 0.3);
          shark.position.set(0, 2.9, 0.2);
          cyl(g, 0.05, 0.08, 1.9, 0xdfe2e6, 0, 1.85, 0.2, 6);
          g.add(shark);
          anim((dt, t) => { shark.rotation.y = Math.sin(t * 0.6) * 0.5; shark.position.y = 2.9 + Math.sin(t) * 0.12; });
        } },
      { key: "eluanbi", name: "鵝鑾鼻燈塔", icon: "🗼", at: 150, labelY: 5,
        say: n => `${n} 站在鵝鑾鼻燈塔下，面對巴士海峽：這裡是台灣的最南端！`,
        build(g) {
          for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; box(g, 0.75, 0.6, 0.2, 0xf7f5ef, Math.cos(a) * 1.5, 0.3, Math.sin(a) * 1.5).rotation.y = -a + Math.PI / 2; }
          cyl(g, 0.38, 0.55, 3.0, smooth(0xf7f5ef), 0, 1.5, 0, 14);
          cyl(g, 0.62, 0.62, 0.08, 0x26262a, 0, 3.04, 0, 14);
          const lamp = glow(0xfff3c4, 0.3, 1.8);
          cyl(g, 0.34, 0.34, 0.5, lamp, 0, 3.33, 0, 10);
          put(g, new T.SphereGeometry(0.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x26262a, 0, 3.58, 0);
          const pivot = new T.Group();
          pivot.position.y = 3.33;
          const beamMat = new T.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending });
          const cn = put(pivot, new T.ConeGeometry(1.2, 9, 16, 1, true), beamMat, 4.5, 0, 0);
          cn.rotation.z = Math.PI / 2;
          g.add(pivot);
          sign(g, "台灣最南點", 1.5, 0.34, "#2b211c", "#f7f5ef", 0, 0.75, 1.72);
          anim((dt, t, env) => { pivot.rotation.y = t * 0.8; beamMat.opacity = env.night * 0.22; });
        } },
      { key: "beach", name: "南灣沙灘", icon: "🏖️", at: 200, labelY: 3,
        say: n => `${n} 在南灣踏浪，被一個大浪打得全身濕，還喝到一口海水。`,
        build(g) {
          cyl(g, 2.6, 2.6, 0.06, smooth(0xf2e3b5), 0, 0.04, 0, 28);
          const sea = box(g, 4.6, 0.07, 1.3, water(), 0, 0.05, -1.7);
          const surf = box(g, 4.4, 0.08, 0.14, 0xffffff, 0, 0.06, -1.0);
          [[-1.4, 0.2, 0xe85d4a], [-0.2, 0.7, 0x4aa3df], [1.1, 0.1, 0xf2c230], [0.4, -0.5, 0x7fd18b]].forEach(([x, z, c]) => {
            cyl(g, 0.03, 0.03, 1.2, 0xdfe2e6, x, 0.6, z, 6);
            cone(g, 0.6, 0.3, c, x, 1.25, z, 10);
            box(g, 0.5, 0.03, 0.9, c === 0xf2c230 ? 0xe85d4a : 0xfdfdf5, x + 0.3, 0.09, z + 0.3);
          });
          [[1.9, 0.9, 0xff7fa8], [2.1, 0.6, 0x4dc8c8]].forEach(([x, z, c]) => { const b = ball(g, 0.6, smooth(c), x, 0.6, z, 0.3, 1, 0.08); b.rotation.z = 0.2; });
          palm(g, -2.1, 1.0, 1.1);
          palm(g, -1.7, -0.3, 0.9);
          anim((dt, t) => { surf.position.z = -1.0 + Math.sin(t * 1.2) * 0.15; sea.position.z = -1.7 + Math.sin(t * 1.2) * 0.08; });
        } },
      { key: "boat", name: "東港迎王船", icon: "⛵", at: 250, labelY: 4,
        say: n => `${n} 看東港迎王燒王船，火光沖天，把瘟疫和壞運都送走。`,
        build(g) {
          cone(g, 2.0, 0.5, 0xe2b33c, 0, 0.25, 0, 14);
          const hull = new T.Group();
          box(hull, 2.6, 0.55, 0.9, 0xc8372d, 0, 0, 0);
          box(hull, 2.64, 0.14, 0.94, 0xf7f5ef, 0, 0.12, 0);
          const bow = box(hull, 0.9, 0.5, 0.86, 0xc8372d, 1.5, 0.22, 0);
          bow.rotation.z = 0.5;
          const stern = box(hull, 0.8, 0.8, 0.9, 0x2f6fb5, -1.45, 0.35, 0);
          stern.rotation.z = -0.3;
          ball(hull, 0.09, 0xffffff, 1.55, 0.3, 0.44);
          box(hull, 0.8, 0.5, 0.6, 0xe2b33c, -0.2, 0.5, 0);
          roof(hull, 1.0, 0.3, 0.8, 0xc8372d, -0.2, 0.75, 0);
          [[-0.8, 1.7], [0.2, 2.2], [1.0, 1.5]].forEach(([x, h]) => { cyl(hull, 0.04, 0.04, h, 0x5a3d2b, x, 0.25 + h / 2, 0, 6); box(hull, 0.03, h * 0.6, 0.8, 0xfdfdf5, x + 0.02, 0.45 + h * 0.5, 0); box(hull, 0.3, 0.16, 0.02, 0xd8333a, x + 0.15, 0.3 + h, 0); });
          hull.position.y = 0.85;
          g.add(hull);
          const fire = glow(0xff7a1a, 1, 1.5);
          const flames = [[-1, 0.3], [0, -0.3], [0.9, 0.2], [-0.4, 0.1], [0.5, -0.1]].map(([x, z]) => cone(g, 0.3, 1.0, fire, x, 1.6, z, 6));
          anim((dt, t, env) => flames.forEach((f, i) => { const s = env.night * (0.8 + Math.sin(t * 9 + i * 2) * 0.3); f.scale.set(s, s * 1.4, s); f.visible = s > 0.02; }));
        } },
    ],
    // 南國風景：高高的檳榔園、香蕉園、路邊閃著霓虹燈的檳榔攤
    extra(island, { GROUND, spot }) {
      const farm = new T.Group();
      farm.position.y = GROUND;
      island.add(farm);
      const mm = new T.Matrix4();
      const q = new T.Quaternion();
      const e = new T.Euler();
      // 收集每個零件的位置，最後一種零件合成一個 InstancedMesh（一整片樹只多幾個繪製指令）
      const parts = {};
      const add = (kind, x, y, z, rx, ry, rz, sx, sy, sz) => {
        e.set(rx, ry, rz);
        q.setFromEuler(e);
        (parts[kind] ||= []).push(mm.compose(V(x, y, z), q, V(sx, sy, sz)).clone());
      };
      const leaf = new T.SphereGeometry(1, 8, 6);
      const shapes = {
        betelTrunk: [new T.CylinderGeometry(0.05, 0.075, 1, 6).translate(0, 0.5, 0), 0x9a8f78],
        betelLeaf: [leaf, 0x4f9a46],
        betelNut: [leaf, 0x9ab83a],
        bananaTrunk: [new T.CylinderGeometry(0.09, 0.14, 1, 7).translate(0, 0.5, 0), 0x7f9a4a],
        bananaLeaf: [leaf, 0x6cbf4a],
        banana: [leaf, 0xe8d04a],
      };

      // 檳榔園：又高又細的樹幹，頂端一小撮葉子，葉子下面掛著一串串檳榔
      for (let k = 0; k < 3; k++) {
        const c = spot(2.6);
        if (!c) break;
        for (let i = 0; i < 9; i++) {
          const a = rnd(0, Math.PI * 2), d = Math.sqrt(rnd()) * 2.1;
          const x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d;
          const h = rnd(3.4, 4.6), lx = rnd(-0.05, 0.05), lz = rnd(-0.05, 0.05);
          add("betelTrunk", x, 0, z, lx, 0, lz, 1, h, 1);
          const tx = x - Math.sin(lz) * h, tz = z + Math.sin(lx) * h;
          for (let f = 0; f < 7; f++) {
            const fa = (f / 7) * Math.PI * 2 + rnd(0, 0.5);
            add("betelLeaf", tx + Math.cos(fa) * 0.45, h + 0.05, tz + Math.sin(fa) * 0.45, 0, -fa, -0.5, 0.6, 0.06, 0.16);
          }
          add("betelNut", tx + 0.08, h - 0.32, tz, 0, 0, 0, 0.14, 0.22, 0.14);
        }
      }

      // 香蕉園：矮矮胖胖的樹幹、往外攤開的大葉子、一串黃香蕉
      for (let k = 0; k < 2; k++) {
        const c = spot(2.3);
        if (!c) break;
        for (let gx = -1; gx <= 1; gx++) {
          for (let gz = -1; gz <= 1; gz++) {
            const x = c.x + gx * 1.3 + rnd(-0.2, 0.2), z = c.z + gz * 1.3 + rnd(-0.2, 0.2);
            const h = rnd(0.9, 1.3);
            add("bananaTrunk", x, 0, z, 0, 0, 0, 1, h, 1);
            for (let f = 0; f < 6; f++) {
              const fa = (f / 6) * Math.PI * 2 + rnd(0, 0.6);
              add("bananaLeaf", x + Math.cos(fa) * 0.5, h + 0.12, z + Math.sin(fa) * 0.5, 0, -fa, rnd(0.1, 0.45), 0.7, 0.04, 0.26);
            }
            add("banana", x + 0.18, h - 0.2, z, 0, 0, 0.3, 0.13, 0.26, 0.13);
          }
        }
      }
      Object.entries(parts).forEach(([kind, list]) => {
        const [geo, color] = shapes[kind];
        const im = new T.InstancedMesh(geo, m(color), list.length);
        list.forEach((mx, i) => im.setMatrixAt(i, mx));
        farm.add(im);
      });

      // 檳榔攤：小玻璃屋、紅白條紋遮雨棚，招牌的霓虹燈晚上一閃一閃
      const c = spot(1.8);
      if (c) {
        const stall = new T.Group();
        stall.position.set(c.x, 0, c.z);
        stall.rotation.y = Math.atan2(-c.x, -c.z);
        stall.scale.setScalar(1.3);
        farm.add(stall);
        box(stall, 1.4, 0.95, 0.9, 0xf2f2ee, 0, 0.475, 0);
        box(stall, 1.2, 0.55, 0.04, clear(0xbfe8ff, 0.75), 0, 0.55, 0.46);
        box(stall, 1.2, 0.3, 0.3, 0x3fae5a, 0, 0.15, 0.55);
        for (let i = 0; i < 6; i++) wedge(stall, 0.24, 0.2, 0.5, i % 2 ? 0xffffff : 0xd8333a, -0.6 + i * 0.24, 0.95, 0.6).rotation.y = -Math.PI / 2;
        sign(stall, "檳榔", 0.9, 0.34, "#ffffff", "#2a1d2e", 0, 1.32, 0.04);
        const neonA = new T.MeshStandardMaterial({ color: 0xff4fd8, emissive: 0xff4fd8, emissiveIntensity: 0.3 });
        const neonB = new T.MeshStandardMaterial({ color: 0x4fffa0, emissive: 0x4fffa0, emissiveIntensity: 0.3 });
        box(stall, 1.04, 0.05, 0.05, neonA, 0, 1.52, 0.05);
        box(stall, 1.04, 0.05, 0.05, neonA, 0, 1.12, 0.05);
        [-1, 1].forEach(sx => box(stall, 0.05, 0.45, 0.05, neonB, sx * 0.5, 1.32, 0.05));
        cyl(stall, 0.12, 0.12, 0.3, 0xd8333a, 0.75, 0.15, 0.75, 10);
        anim((dt, t, env) => {
          const on = Math.sin(t * 5) > 0;
          neonA.emissiveIntensity = 0.3 + env.night * (on ? 2.2 : 0.4);
          neonB.emissiveIntensity = 0.3 + env.night * (on ? 0.4 : 2.2);
        });
      }
    },
  };
});
