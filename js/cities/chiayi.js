// 嘉義阿里山城：阿里山日出雲海、小火車與故宮南院
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("chiayi", K => {
  const { T, m, smooth, water, rnd, V, box, cyl, cone, ball, tor, line, gable, sign, glow, anim, lit } = K;
  // 阿里山在地標裡的位置與大小（小火車的鐵道要繞著它爬上去）
  const PEAK = { x: 0, z: -0.6, r: 2.7, h: 4.6 };
  return {
    title: "嘉義阿里山城", icon: "🚂", subtitle: "阿里山日出雲海、小火車與故宮南院", ground: 0x7fb562, tree: "pine",
    // 稻田：5 片，金黃稻穗的比例 0.4
    paddies: 5, paddyGold: 0.4,
    events: [
      () => "阿里山的日出從雲海裡跳出來，大家一起「哇——」。",
      () => "紅色的小火車繞著山一圈一圈往上爬，穿過雲海開到祝山。",
      () => "布袋的高跟鞋教堂在夕陽下閃著藍色的光。",
    ],
    landmarks: [
      { key: "alishan", name: "阿里山日出雲海", icon: "🌄", at: 40, r: 12.5, fr: 7.5, labelY: 6.2,
        say: n => `${n} 凌晨三點搭小火車上祝山看日出，冷到發抖，但是值得！`,
        build(g) {
          cone(g, PEAK.r, PEAK.h, 0x3f7a4c, PEAK.x, PEAK.h / 2, PEAK.z, 20);
          ball(g, 0.7, new T.MeshBasicMaterial({ color: 0xffc04a }), 1.4, 5.6, -2.9);
          // 雲海：一圈白雲繞著半山腰慢慢轉，小火車會從雲裡穿過去
          const sea = new T.Group();
          const white = m(0xffffff, { flatShading: false, transparent: true, opacity: 0.85, roughness: 1 });
          for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; ball(sea, rnd(0.55, 0.85), white, Math.cos(a) * 2.9, rnd(-0.1, 0.1), Math.sin(a) * 2.6, 1.4, 0.4, 1.2); }
          sea.position.set(PEAK.x, 1.9, PEAK.z);
          g.add(sea);
          anim((dt, t) => { sea.rotation.y = t * 0.05; });
        } },
      { key: "train", name: "阿里山小火車", icon: "🚂", at: 110, labelY: 2.6,
        say: n => `${n} 搭上紅色的阿里山小火車，一圈一圈繞著山，爬到雲海上面的祝山。`,
        // 車站、鐵道、火車都在下面的 extra 裡蓋（要順著鐵道的方向擺）
        build() {} },
      { key: "heel", name: "高跟鞋教堂", icon: "👠", at: 200, labelY: 4.2,
        say: n => `${n} 站在藍色玻璃高跟鞋教堂前，覺得自己像走進童話故事。`,
        build(g) {
          const gl = new T.MeshStandardMaterial({ color: 0x4aa8e0, transparent: true, opacity: 0.75, roughness: 0.15, metalness: 0.2, emissive: 0x2a6fb0, emissiveIntensity: 0.15 });
          lit(gl, 0.15, 1.0);
          cyl(g, 2.3, 2.3, 0.06, smooth(0xf4f4f2), 0, 0.03, 0, 28);
          ball(g, 0.85, gl, 1.1, 0.42, 0, 1.1, 0.45, 0.6);
          const sole = line(g, V(0.5, 0.5, 0), V(-1.0, 2.3, 0), 0.5, gl);
          sole.scale.x = 0.35;
          ball(g, 0.6, gl, -1.1, 2.45, 0, 0.9, 0.75, 0.8);
          cone(g, 0.3, 2.2, gl, -1.3, 1.1, 0, 10).rotation.x = Math.PI;
        } },
      { key: "museum", name: "故宮南院", icon: "🏺", at: 300, labelY: 3,
        say: n => `${n} 逛故宮南院，在翠玉白菜前面看了好久，肚子都餓了。`,
        build(g) {
          cyl(g, 2.5, 2.5, 0.05, water(), 0, 0.03, 0.4, 28);
          const dark = tor(g, 1.7, 0.5, smooth(0x2b2b30), -0.3, 0.75, -0.5, Math.PI * 0.95);
          dark.rotation.set(-Math.PI / 2, 0, 0.3);
          dark.scale.z = 1.5;
          const light = tor(g, 1.5, 0.42, m(0xcfe3ec, { flatShading: false, roughness: 0.15, metalness: 0.3 }), 0.5, 0.65, -0.8, Math.PI * 0.9);
          light.rotation.set(-Math.PI / 2, 0, 2.6);
          light.scale.z = 1.5;
          tor(g, 1.6, 0.05, 0xf7f7f4, 0, 0.1, 1.2, Math.PI).scale.y = 0.45;
          box(g, 3.2, 0.06, 0.3, 0xf7f7f4, 0, 0.2, 1.2);
        } },
    ],
    // 阿里山森林鐵路：從山下的車站出發，繞著阿里山盤旋一圈半，穿過雲海開到山頂的祝山站
    extra(island, { groups, GROUND, block }) {
      const mt = groups.alishan;
      const st = groups.train;
      const s = mt.scale.x;
      const axis = V(PEAK.x, 0, PEAK.z).applyMatrix4(mt.matrix);
      const station = V(0, 0, 0).applyMatrix4(st.matrix);
      // 盤山段：u = 0 在山腳、u = 1 在山頂附近；dir 是繞山的方向
      const TURNS = 1.5;
      const Y0 = 0.12, Y1 = 3.3;
      const spiral = (u, a0, dir) => {
        const yl = Y0 + u * (Y1 - Y0);
        const rr = (PEAK.r * (1 - yl / PEAK.h) + 0.28) * s;
        const a = a0 + dir * u * TURNS * Math.PI * 2;
        return V(axis.x + Math.cos(a) * rr, GROUND + yl * s, axis.z + Math.sin(a) * rr);
      };
      // 找一個起點：從車站開過去剛好順著山腳的切線進入盤山段，而且不會穿過山
      const baseR = (PEAK.r + 0.28) * s;
      let best = null;
      [-1, 1].forEach(dir => {
        for (let k = 0; k < 72; k++) {
          const a0 = (k / 72) * Math.PI * 2;
          const e = spiral(0, a0, dir);
          const tan = spiral(0.01, a0, dir).sub(e).setY(0).normalize();
          const pre = e.clone().addScaledVector(tan, -3);
          const toward = pre.clone().sub(station).setY(0);
          if (toward.length() < 3) continue;
          // 車站 → 進山口這段不能碰到山
          let clearOK = true;
          for (let i = 0; i <= 10; i++) {
            const p = station.clone().lerp(pre, i / 10);
            if (Math.hypot(p.x - axis.x, p.z - axis.z) < baseR + 0.6) clearOK = false;
          }
          if (!clearOK) continue;
          const score = toward.normalize().dot(tan);
          if (!best || score > best.score) best = { score, a0, dir, pre };
        }
      });
      const { a0, dir, pre } = best || { a0: 0, dir: 1, pre: spiral(0, 0, 1) };
      const lead = pre.clone().sub(station).setY(0).normalize();
      const pts = [
        station.clone().addScaledVector(lead, -2.6),
        station.clone(),
        station.clone().lerp(pre, 0.5),
        pre,
      ];
      for (let i = 0; i <= 48; i++) pts.push(spiral(i / 48, a0, dir));
      pts.forEach((p, i) => { if (i < 4) p.y = GROUND; });
      const curve = new T.CatmullRomCurve3(pts, false, "centripetal");
      const L = curve.getLength();
      const ys = 0.12; // 鐵軌離地（路基）高度

      // 路基＋枕木：沿著鐵道一小段一小段擺
      const SEG = Math.ceil(L / 0.35);
      const bed = new T.InstancedMesh(new T.BoxGeometry(0.85, 0.16, 1), m(0x9a8a70), SEG);
      const ties = new T.InstancedMesh(new T.BoxGeometry(0.7, 0.06, 0.12), m(0x5a3d2b), SEG);
      const mm = new T.Matrix4();
      const q = new T.Quaternion();
      const e3 = new T.Euler(0, 0, 0, "YXZ");
      const rail = [[], []];
      for (let i = 0; i < SEG; i++) {
        const u0 = i / SEG, u1 = (i + 1) / SEG;
        const p0 = curve.getPointAt(u0), p1 = curve.getPointAt(u1);
        const mid = p0.clone().add(p1).multiplyScalar(0.5);
        const d = p1.clone().sub(p0);
        const len = d.length();
        d.normalize();
        e3.set(-Math.asin(d.y), Math.atan2(d.x, d.z), 0);
        q.setFromEuler(e3);
        bed.setMatrixAt(i, mm.compose(V(mid.x, mid.y + ys - 0.08, mid.z), q, V(1, 1, len + 0.05)));
        ties.setMatrixAt(i, mm.compose(V(mid.x, mid.y + ys + 0.03, mid.z), q, V(1, 1, 1)));
        if (Math.hypot(mid.x - axis.x, mid.z - axis.z) > baseR + 0.4) block(mid.x, mid.z, 1.1);
      }
      island.add(bed, ties);
      // 兩條鐵軌
      for (let i = 0; i <= SEG; i++) {
        const u = i / SEG;
        const p = curve.getPointAt(u);
        const t = curve.getTangentAt(u);
        const side = V(-t.z, 0, t.x).normalize();
        [-1, 1].forEach((k, j) => rail[j].push(p.clone().addScaledVector(side, k * 0.22).setY(p.y + ys + 0.09)));
      }
      rail.forEach(r => island.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(r), SEG, 0.04, 5), m(0x4a4a50, { metalness: 0.6, roughness: 0.4 }))));

      // 山下的車站：月台、木造站房、櫻花樹（蓋在小火車地標裡，順著鐵道的方向擺）
      const atStation = curve.getUtoTmapping(0, 2.6);
      const tS = curve.getTangent(atStation);
      const hall = new T.Group();
      hall.rotation.y = Math.atan2(tS.x, tS.z) - st.rotation.y;
      st.add(hall);
      box(hall, 0.9, 0.28, 3.6, 0xd9c9a8, 0.75, 0.14, 0);
      box(hall, 1.0, 0.75, 1.5, 0x8a5a3b, 1.25, 0.65, 0);
      gable(hall, 1.25, 0.45, 1.7, 0x3d6b4a, 1.25, 1.02, 0).rotation.y = Math.PI / 2;
      sign(hall, "阿里山", 0.9, 0.26, "#fff7e0", "#3d6b4a", 0.73, 0.85, 0).rotation.y = -Math.PI / 2;
      const lamp = glow(0xffd27a, 0.3, 1.4);
      [-1.4, 1.4].forEach(z => { cyl(hall, 0.03, 0.03, 0.8, 0x3a3430, 0.45, 0.68, z, 6); ball(hall, 0.09, lamp, 0.45, 1.1, z); });
      [[-1.0, -0.9, 1.1], [-1.2, 0.8, 0.9], [-0.7, 1.9, 0.8], [1.6, 1.8, 0.8]].forEach(([x, z, sc]) => {
        cyl(hall, 0.08 * sc, 0.12 * sc, 0.8 * sc, 0x5a3d2b, x, 0.4 * sc, z, 6);
        ball(hall, 0.6 * sc, smooth(0xffb7cf), x, 1.15 * sc, z, 1.15, 0.85, 1.15);
      });

      // 山頂的祝山站：小月台、紅屋頂的觀日亭、站牌
      const top = curve.getPointAt(1);
      const tT = curve.getTangentAt(1);
      const summit = new T.Group();
      summit.position.set(top.x, top.y + ys, top.z);
      summit.rotation.y = Math.atan2(tT.x, tT.z);
      island.add(summit);
      const out = V(top.x - axis.x, 0, top.z - axis.z).normalize();
      const sideSign = Math.sign(out.dot(V(Math.cos(summit.rotation.y), 0, -Math.sin(summit.rotation.y)))) || 1;
      box(summit, 0.7, 0.12, 1.4, 0xd9c9a8, sideSign * 0.65, 0, 0.1);
      box(summit, 0.08, 0.08, 0.5, 0x3a3430, 0, 0.05, 0.55);
      [-0.4, 0.4].forEach(z => cyl(summit, 0.04, 0.04, 0.6, 0x7a5a3a, sideSign * 0.85, 0.3, z, 6));
      gable(summit, 0.8, 0.3, 1.1, 0xc8372d, sideSign * 0.85, 0.6, 0).rotation.y = Math.PI / 2;
      sign(summit, "祝山", 0.6, 0.24, "#fff7e0", "#c8372d", sideSign * 0.4, 0.42, -0.5).rotation.y = sideSign * Math.PI / 2;

      // 小火車：火車頭在上坡那一頭（阿里山的火車是推上山的），停站→爬山→山頂看日出→下山
      const cars = [];
      for (let c = 0; c < 3; c++) {
        const car = new T.Group();
        car.userData.clickable = "chiayi:train";
        const body = new T.Group();
        body.position.y = ys + 0.12;
        car.add(body);
        box(body, 0.52, 0.42, 1.05, 0xc8372d, 0, 0.36, 0);
        box(body, 0.54, 0.09, 1.07, 0xf2e3b5, 0, 0.4, 0);
        box(body, 0.58, 0.06, 1.12, 0x3a3430, 0, 0.6, 0);
        [-0.35, 0.35].forEach(z => [-1, 1].forEach(x => cyl(body, 0.09, 0.09, 0.06, 0x26262a, x * 0.24, 0.12, z, 10).rotation.z = Math.PI / 2));
        if (c === 0) {
          box(body, 0.5, 0.3, 0.12, 0x26262a, 0, 0.3, 0.56);
          ball(body, 0.07, glow(0xfff1c4, 0.4, 2), 0, 0.5, 0.6);
          box(body, 0.04, 0.38, 0.38, 0xf2e3b5, 0.27, 0.42, 0);
        }
        island.add(car);
        cars.push(car);
      }
      const GAP = 1.2;                   // 車廂間距
      const dStart = 2.6 + GAP * 2 + 0.4; // 停在車站時，火車頭的位置（從鐵道起點量）
      const dEnd = L - 0.35;
      const SPEED = 1.7;
      const runT = (dEnd - dStart) / SPEED;
      const WAIT_LOW = 4, WAIT_TOP = 5;
      const cycle = WAIT_LOW + runT + WAIT_TOP + runT;
      const ease = x => x * x * (3 - 2 * x);
      anim((dt, t) => {
        const c = t % cycle;
        let d;
        if (c < WAIT_LOW) d = dStart;
        else if (c < WAIT_LOW + runT) d = dStart + (dEnd - dStart) * ease((c - WAIT_LOW) / runT);
        else if (c < WAIT_LOW + runT + WAIT_TOP) d = dEnd;
        else d = dEnd - (dEnd - dStart) * ease((c - WAIT_LOW - runT - WAIT_TOP) / runT);
        cars.forEach((car, i) => {
          const u = Math.max(0, Math.min(1, (d - i * GAP) / L));
          const p = curve.getPointAt(u);
          const tg = curve.getTangentAt(u);
          car.position.copy(p);
          car.rotation.set(-Math.asin(tg.y), Math.atan2(tg.x, tg.z), 0, "YXZ");
        });
      });
    },
  };
});
