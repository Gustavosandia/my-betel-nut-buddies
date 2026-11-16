// 南投日月城：日月潭、玉山與清境農場
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("nantou", K => {
  const { T, smooth, water, rnd, box, cyl, cone, ball, gable, inst, sign, anim } = K;
  return {
    title: "南投日月城", icon: "🏔️", subtitle: "日月潭、玉山與清境農場", ground: 0x86bb66, tree: "pine",
    events: [
      () => "日月潭的遊艇劃過水面，慈恩塔的倒影晃了一下。",
      () => "玉山頂上積雪了，在陽光下閃閃發亮。",
      () => "清境農場的綿羊排成一排，等著看剪毛秀。",
      () => "埔里酒廠飄出紹興酒的香氣，檳友們的鼻子都動了一下。",
    ],
    landmarks: [
      { key: "wine", name: "埔里紹興酒甕", icon: "🍶", at: 30, labelY: 3,
        say: n => `${n} 在埔里酒廠試喝紹興酒，一小杯就臉紅了，還直說沒醉。`,
        build(g) {
          const urn = (x, z, s) => {
            const c = smooth(0x7a4a2a);
            ball(g, 0.9 * s, c, x, 1.0 * s, z, 1, 1.15, 1);
            cyl(g, 0.4 * s, 0.5 * s, 0.3 * s, c, x, 2.05 * s, z, 16);
            ball(g, 0.46 * s, smooth(0xd8333a), x, 2.25 * s, z, 1, 0.5, 1);
            const lab = sign(g, "酒", 0.6 * s, 0.6 * s, "#2b211c", "#d8333a", x, 1.1 * s, z + 0.91 * s);
            lab.rotation.z = Math.PI / 4;
          };
          urn(0, 0, 1);
          urn(-1.5, 0.5, 0.55);
          urn(1.4, 0.6, 0.6);
          urn(1.0, -0.9, 0.5);
        } },
      { key: "yushan", name: "玉山", icon: "🏔️", at: 100, labelY: 6,
        say: n => `${n} 登上玉山主峰，海拔 3952 公尺，台灣最高的地方！`,
        build(g) {
          const rock = 0x7d7468;
          cone(g, 2.7, 5.2, rock, 0, 2.6, -0.3, 7);
          cone(g, 0.95, 1.8, 0xfbfbf8, 0, 4.31, -0.3, 7);
          cone(g, 1.7, 3.3, 0x8a8175, -1.9, 1.65, 0.3, 6);
          cone(g, 0.55, 1.05, 0xfbfbf8, -1.9, 2.78, 0.3, 6);
          cone(g, 1.5, 2.6, 0x8a8175, 1.7, 1.3, 0.5, 6);
          inst(g, new T.ConeGeometry(0.22, 0.7, 5), 0x3f7a4c, Array.from({ length: 26 }, (_, i) => { const a = (i / 26) * Math.PI * 2; const r = 2.6 + (i % 3) * 0.35; return [Math.cos(a) * r, 0.35, Math.sin(a) * r * 0.7 + 0.2]; }));
          sign(g, "玉山 3952m", 1.5, 0.36, "#ffffff", "#5a4a3a", 0, 0.5, 2.4);
        } },
      { key: "lake", name: "日月潭", icon: "🚤", at: 180, labelY: 3.8,
        say: n => `${n} 搭船遊日月潭，還買了一顆阿婆茶葉蛋。`,
        build(g) {
          cyl(g, 2.6, 2.6, 0.06, water(), 0, 0.04, 0.3, 32);
          [[-2.2, -1.3, 1.3], [0, -2.1, 1.7], [2.2, -1.2, 1.2]].forEach(([x, z, s]) => ball(g, s, 0x5d9a52, x, 0, z, 1.2, 0.8, 1));
          ball(g, 0.3, 0x6f9e55, 0.3, 0.05, 0.4, 1, 0.5, 1);
          cone(g, 0.15, 0.4, 0x3f7a4c, 0.3, 0.35, 0.4, 5);
          for (let k = 0; k < 5; k++) { cyl(g, 0.3 - k * 0.04, 0.32 - k * 0.04, 0.3, 0xf2e3b5, 0, 1.5 + k * 0.42, -2.1, 8); cone(g, 0.42 - k * 0.04, 0.16, 0xc8372d, 0, 1.72 + k * 0.42, -2.1, 8); }
          const boat = new T.Group();
          box(boat, 0.7, 0.14, 0.28, 0xf4f4f2, 0, 0.12, 0);
          box(boat, 0.3, 0.16, 0.22, 0x2f6fb5, -0.05, 0.27, 0);
          g.add(boat);
          anim((dt, t) => { const a = t * 0.3; boat.position.set(Math.cos(a) * 1.6, 0, 0.3 + Math.sin(a) * 1.6); boat.rotation.y = -a - Math.PI / 2; });
        } },
      { key: "sheep", name: "清境農場", icon: "🐑", at: 250, labelY: 3.4,
        say: n => `${n} 在清境農場被一群綿羊包圍，飼料瞬間被搶光。`,
        build(g) {
          ball(g, 1, 0x8fc866, 0, 0, 0, 2.7, 1.1, 2.1);
          box(g, 0.9, 0.7, 0.8, 0xf7f5ef, -0.3, 1.4, -0.4);
          gable(g, 1.1, 0.5, 1.0, 0xc8372d, -0.3, 1.75, -0.4);
          const flock = [];
          [[-1.5, 0.9], [-0.6, 1.3], [0.5, 1.1], [1.3, 0.7], [1.6, -0.2]].forEach(([x, z], i) => {
            const s = new T.Group();
            ball(s, 0.26, smooth(0xfbfbf6), 0, 0.3, 0, 1.3, 1, 1);
            ball(s, 0.12, smooth(0x3a3430), 0.34, 0.36, 0);
            [[-0.15, -0.1], [-0.15, 0.1], [0.15, -0.1], [0.15, 0.1]].forEach(([lx, lz]) => cyl(s, 0.03, 0.03, 0.2, 0x3a3430, lx, 0.08, lz, 5));
            const y = 1.1 * Math.sqrt(Math.max(0, 1 - (x / 2.7) ** 2 - (z / 2.1) ** 2));
            s.position.set(x, y, z);
            s.rotation.y = rnd(0, 6);
            g.add(s);
            flock.push([s, y, i]);
          });
          anim((dt, t) => flock.forEach(([s, y, i]) => { s.position.y = y + Math.max(0, Math.sin(t * 2 + i * 1.7)) * 0.12; }));
        } },
    ],
  };
});
