// 台東熱氣球城：鹿野高台熱氣球、三仙台與池上稻田
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("taitung", K => {
  const { T, smooth, water, V, box, cyl, cone, ball, tor, line, inst, dot, onDome, glow, anim, put } = K;
  return {
    title: "台東熱氣球城", icon: "🎈", subtitle: "鹿野高台熱氣球、三仙台與池上稻田", ground: 0x8fc070,
    // 稻田：4 片，金黃稻穗的比例 0.6
    paddies: 4, paddyGold: 0.6,
    events: [
      () => "鹿野高台的熱氣球一顆一顆升空，天空變得好熱鬧。",
      () => "池上的稻浪隨風擺動，金城武樹下又有人在拍照。",
      () => "太平洋的風吹過三仙台的八拱橋。",
    ],
    landmarks: [
      { key: "sanxiantai", name: "三仙台八拱橋", icon: "🌉", at: 70, labelY: 2.6,
        say: n => `${n} 走過三仙台的八座拱橋，走到第五座就開始喘了。`,
        build(g) {
          box(g, 5.6, 0.05, 1.6, water(), 0, 0.03, 0);
          for (let k = 0; k < 8; k++) {
            const x = -2.24 + k * 0.64;
            const a = tor(g, 0.32, 0.06, smooth(0xf2e9d8), x, 0.2, 0, Math.PI);
            a.scale.z = 3;
            if (k < 7) box(g, 0.1, 0.3, 0.3, 0xbdb6a8, x + 0.32, 0.15, 0);
          }
          [[2.9, 0.1, 0.7], [3.4, -0.2, 0.5], [3.1, 0.5, 0.4]].forEach(([x, z, s]) => ball(g, s, 0x7d7468, x, 0.1, z, 1, 0.9, 1));
          ball(g, 0.5, 0x6f9e55, -3, 0.05, 0, 1.2, 0.5, 1.4);
        } },
      { key: "atemoya", name: "台東釋迦", icon: "🍈", at: 120, labelY: 3,
        say: n => `${n} 捧著一顆比臉還大的釋迦，吃得滿手黏黏的。`,
        build(g) {
          box(g, 1.9, 0.5, 1.6, 0x9a6b3e, 0, 0.25, 0);
          const skin = smooth(0x8fbf5a);
          ball(g, 1.0, skin, -0.2, 1.4, 0, 1, 0.95, 1);
          inst(g, dot(0.2), smooth(0xa8d070), onDome(46, 1.0, 0.95, 1.0, -0.75).map(([a, b, c]) => [-0.2 + a, 1.4 + b, c]));
          cyl(g, 0.05, 0.06, 0.3, 0x5a3d2b, -0.2, 2.45, 0, 6);
          const half = put(g, new T.SphereGeometry(0.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), skin, 1.5, 0.05, 0.9);
          half.rotation.x = Math.PI;
          half.position.y = 0.6;
          cyl(g, 0.58, 0.58, 0.04, smooth(0xfdfdf5), 1.5, 0.61, 0.9, 20);
          inst(g, dot(0.06), 0x1b1b1b, [[1.3, 0.64, 0.8], [1.6, 0.64, 1.0], [1.5, 0.64, 0.7], [1.7, 0.64, 0.8], [1.35, 0.64, 1.1]]);
        } },
      { key: "tree", name: "池上金城武樹", icon: "🌳", at: 170, labelY: 3.8,
        say: n => `${n} 騎腳踏車經過伯朗大道，在金城武樹下喝了一口奉茶。`,
        build(g) {
          [[-1.6, 0x8fc04a], [1.6, 0xd9b53f]].forEach(([x, c]) => {
            box(g, 2.4, 0.08, 3.6, 0x6f8f4a, x, 0.04, 0);
            inst(g, new T.BoxGeometry(2.2, 0.22, 0.1), c, Array.from({ length: 12 }, (_, i) => [x, 0.18, -1.6 + i * 0.29]));
          });
          box(g, 0.7, 0.05, 3.8, 0x8a8f96, 0, 0.03, 0);
          cyl(g, 0.16, 0.24, 1.6, 0x7a5a3a, 0.75, 0.8, 0.4, 7);
          ball(g, 1, 0x4f9a46, 0.75, 2.2, 0.4, 1.5, 0.85, 1.5);
          [-0.25, 0.25].forEach(dx => { const w = tor(g, 0.2, 0.025, 0x26262a, -0.1 + dx, 0.25, 1.3); w.rotation.y = 0.2; });
          line(g, V(-0.35, 0.25, 1.3), V(-0.05, 0.5, 1.3), 0.03, 0xd8333a);
          line(g, V(-0.05, 0.5, 1.3), V(0.15, 0.25, 1.3), 0.03, 0xd8333a);
          line(g, V(0.15, 0.25, 1.3), V(0.1, 0.6, 1.3), 0.03, 0xd8333a);
        } },
      { key: "balloon", name: "鹿野高台熱氣球", icon: "🎈", at: 290, labelY: 2.4,
        say: n => `${n} 搭上熱氣球慢慢升空，花東縱谷在腳下像一條綠色的地毯。`,
        build(g) {
          cyl(g, 2.5, 2.7, 0.35, 0x7fb85a, 0, 0.17, 0, 20);
          const burner = glow(0xffb03a, 0.6, 1.6);
          const balloons = [];
          [[-1.5, 0.3, 0xe85d4a, 0xf2c230], [0.2, -0.8, 0x4aa3df, 0xfdfdf5], [1.6, 0.4, 0xb58af2, 0xff7fa8], [0.1, 1.0, 0x5fbf5a, 0x5fbf5a]].forEach(([x, z, c1, c2], k) => {
            const b = new T.Group();
            ball(b, 0.75, smooth(c1), 0, 1.5, 0, 1, 1.15, 1);
            const band = tor(b, 0.72, 0.1, smooth(c2), 0, 1.6, 0);
            band.rotation.x = Math.PI / 2;
            cone(b, 0.42, 0.6, smooth(c2), 0, 0.72, 0, 12).rotation.x = Math.PI;
            ball(b, 0.09, burner, 0, 0.5, 0);
            box(b, 0.3, 0.24, 0.3, 0x8a5a3b, 0, 0.12, 0);
            [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]].forEach(([dx, dz]) => line(b, V(dx, 0.24, dz), V(dx * 2.4, 0.75, dz * 2.4), 0.015, 0x5a3d2b));
            if (k === 3) {
              // 蛙哥造型的熱氣球
              [-1, 1].forEach(s => { ball(b, 0.22, smooth(c1), s * 0.3, 2.35, 0.2); ball(b, 0.15, 0xffffff, s * 0.3, 2.4, 0.34); ball(b, 0.07, 0x1b1b1b, s * 0.3, 2.42, 0.46); });
              tor(b, 0.25, 0.03, 0x1b1b1b, 0, 1.55, 0.72, Math.PI).rotation.z = Math.PI;
            }
            g.add(b);
            balloons.push([b, x, z, k]);
          });
          anim((dt, t) => balloons.forEach(([b, x, z, k]) => {
            b.position.set(x + Math.sin(t * 0.15 + k * 2) * 0.8, 2.6 + k * 0.9 + Math.sin(t * 0.4 + k * 1.3) * 0.9, z + Math.cos(t * 0.12 + k) * 0.6);
            b.rotation.y = t * 0.1 + k;
          }));
        } },
    ],
  };
});
