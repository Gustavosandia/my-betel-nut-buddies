// 嘉義雞肉飯城：火雞肉飯、中央噴水池與射日塔
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("chiayicity", K => {
  const { T, smooth, water, clear, rnd, V, box, cyl, ball, line, gable, inst, dot, glow, anim, steam, bowl } = K;
  return {
    title: "嘉義雞肉飯城", icon: "🍚", subtitle: "火雞肉飯、中央噴水池與射日塔", ground: 0xa3c070, tall: true,
    // 稻田：4 片，金黃稻穗的比例 0.4
    paddies: 4, paddyGold: 0.4,
    events: [
      () => "嘉義人的早餐、午餐、晚餐、宵夜：火雞肉飯。",
      () => "中央噴水池的水柱嘩啦啦，KANO 的投手雕像還在投球。",
      () => "阿里山小火車從北門驛出發，準備上山了。",
    ],
    landmarks: [
      { key: "rice", name: "火雞肉飯", icon: "🍚", at: 40, labelY: 2.8,
        say: n => `${n} 連吃三碗火雞肉飯，還在考慮要不要再來一碗。`,
        build(g) {
          const top = bowl(g, 1.25, 0.85);
          ball(g, 1.12, smooth(0xfdfdf8), 0, top - 0.12, 0, 1, 0.55, 1);
          inst(g, new T.BoxGeometry(0.4, 0.07, 0.12), smooth(0xe8cfa0), Array.from({ length: 16 }, (_, i) => [Math.cos(i * 2.1) * rnd(0.1, 0.6), top + 0.42 - (i % 3) * 0.05, Math.sin(i * 2.1) * rnd(0.1, 0.6)]));
          ball(g, 0.5, smooth(0x8a4a22), 0.1, top + 0.3, 0.1, 1, 0.25, 1);
          cyl(g, 0.22, 0.22, 0.05, 0xf2c230, -0.6, top + 0.28, 0.4, 12).rotation.z = 0.3;
          line(g, V(0.7, top + 0.1, -0.3), V(1.9, top + 0.8, -0.8), 0.05, 0x9a6b3e);
          line(g, V(0.8, top + 0.1, -0.15), V(2.0, top + 0.8, -0.6), 0.05, 0x9a6b3e);
          steam(g, 0, top + 0.6, 0, 4, 0.28, 1.6);
        } },
      { key: "fountain", name: "中央噴水池", icon: "⛲", at: 130, labelY: 3.6,
        say: n => `${n} 繞著中央噴水池走一圈，學投手雕像擺出投球姿勢。`,
        build(g) {
          cyl(g, 1.9, 2.0, 0.35, 0xbdb6a8, 0, 0.17, 0, 24);
          cyl(g, 1.7, 1.7, 0.06, water(), 0, 0.36, 0, 24);
          cyl(g, 0.35, 0.45, 1.0, 0xbdb6a8, 0, 0.85, 0, 10);
          const gold = smooth(0xe2b33c);
          cyl(g, 0.12, 0.14, 0.6, gold, 0, 1.65, 0, 8);
          ball(g, 0.13, gold, 0, 2.1, 0);
          line(g, V(0, 1.9, 0), V(0.35, 2.3, -0.1), 0.07, gold);
          line(g, V(0, 1.9, 0), V(-0.3, 1.7, 0.2), 0.07, gold);
          line(g, V(0, 1.4, 0), V(0.35, 1.5, 0.3), 0.08, gold);
          const drops = Array.from({ length: 24 }, (_, i) => [(i % 8) * (Math.PI / 4), (i % 3) / 3]);
          const im = inst(g, dot(0.07), clear(0xdff3ff, 0.9), drops.map(() => [0, 0, 0]));
          const mm = new T.Matrix4();
          anim((dt, t) => {
            drops.forEach(([a, o], i) => { const u = (t * 0.7 + o) % 1; const r = 0.45 + u * 1.0; mm.makeTranslation(Math.cos(a) * r, 0.4 + Math.sin(u * Math.PI) * 1.1, Math.sin(a) * r); im.setMatrixAt(i, mm); });
            im.instanceMatrix.needsUpdate = true;
          });
        } },
      { key: "tower", name: "射日塔", icon: "🗼", at: 250, labelY: 6.4,
        say: n => `${n} 搭電梯上射日塔，從塔頂看見遠方的阿里山。`,
        build(g) {
          const brown = 0x7a5a3a;
          [-0.42, 0.42].forEach(x => box(g, 0.5, 5.0, 1.0, brown, x, 2.5, 0));
          box(g, 0.34, 4.6, 0.3, glow(0xf2c230, 0.3, 1.3), 0, 2.4, 0);
          box(g, 1.7, 0.7, 1.3, clear(0x7fb6d9, 0.9), 0, 5.35, 0);
          box(g, 1.8, 0.1, 1.4, 0xdfe2e6, 0, 5.75, 0);
          box(g, 2.2, 0.3, 1.6, 0xbdb6a8, 0, 0.15, 0);
          for (let k = 0; k < 6; k++) [-1, 1].forEach(s => box(g, 0.05, 0.5, 1.1, 0xc9ccd1, s * 0.72, 0.9 + k * 0.75, 0));
        } },
      { key: "station", name: "北門驛", icon: "🚂", at: 300, labelY: 2.8,
        say: n => `${n} 在北門驛聞到檜木香，差點跳上阿里山小火車。`,
        build(g) {
          box(g, 2.6, 0.95, 1.2, 0x7fb8a8, -0.3, 0.55, -0.4);
          gable(g, 3.0, 0.6, 1.5, 0x3a3430, -0.3, 1.0, -0.4);
          box(g, 0.9, 0.7, 0.5, 0x7fb8a8, -0.3, 0.45, 0.35);
          gable(g, 1.1, 0.35, 0.6, 0x3a3430, -0.3, 0.8, 0.35);
          box(g, 4.2, 0.12, 0.6, 0xb8b2a6, 0, 0.06, 0.9);
          box(g, 4.4, 0.05, 0.6, 0x6b6460, 0, 0.03, 1.5);
          [-0.15, 0.15].forEach(z => box(g, 4.4, 0.06, 0.05, 0x3a3430, 0, 0.09, 1.5 + z));
          box(g, 1.0, 0.5, 0.42, 0xc8372d, 1.2, 0.42, 1.5);
          box(g, 1.02, 0.1, 0.44, 0xf2e3b5, 1.2, 0.45, 1.5);
          box(g, 1.1, 0.06, 0.5, 0x3a3430, 1.2, 0.7, 1.5);
        } },
    ],
  };
});
