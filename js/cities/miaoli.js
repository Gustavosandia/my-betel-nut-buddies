// 苗栗草莓城：龍騰斷橋、大湖草莓與五月桐花
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("miaoli", K => {
  const { T, smooth, rnd, box, cyl, cone, ball, tor, roof, inst, dot, onDome, sign, anim } = K;
  return {
    title: "苗栗草莓城", icon: "🍓", subtitle: "龍騰斷橋、大湖草莓與五月桐花", ground: 0x8fbf6c, tree: "pine",
    // 稻田：3 片，金黃稻穗的比例 0.2
    paddies: 3, paddyGold: 0.2,
    events: [
      () => "大湖的草莓季開始了，每個人都提著一籃紅通通的草莓。",
      () => "五月雪——桐花一朵一朵從樹上轉著圈落下來。",
      () => "舊山線的小火車鳴著汽笛，經過龍騰斷橋。",
    ],
    landmarks: [
      { key: "ruin", name: "龍騰斷橋", icon: "🧱", at: 70, labelY: 4,
        say: n => `${n} 仰望龍騰斷橋的紅磚橋墩，想像百年前火車開過去的樣子。`,
        build(g) {
          const brick = 0xb4553a;
          [[-2.1, 2.6], [-0.7, 3.0], [0.7, 2.8], [2.1, 1.5]].forEach(([x, h]) => { box(g, 0.7, h, 0.9, brick, x, h / 2, 0); ball(g, 0.3, 0x5d9a52, x + 0.1, h + 0.1, 0.1, 1.2, 0.6, 1.2); });
          tor(g, 0.7, 0.2, brick, -1.4, 1.9, 0, Math.PI).scale.z = 2.2;
          tor(g, 0.7, 0.2, brick, 0, 1.9, 0, 1.1).scale.z = 2.2;
          const stub = tor(g, 0.7, 0.2, brick, 1.4, 1.9, 0, 1.0);
          stub.scale.z = 2.2;
          stub.rotation.y = Math.PI;
          box(g, 2.1, 0.25, 0.9, brick, -1.4, 2.75, 0);
        } },
      { key: "strawberry", name: "大湖草莓", icon: "🍓", at: 120, labelY: 3.4,
        say: n => `${n} 在大湖採草莓，採一顆吃兩顆，籃子還是空的。`,
        build(g) {
          const red = smooth(0xe0323c);
          const berry = new T.Group();
          const body = cone(berry, 1.05, 1.9, red, 0, 0, 0, 16);
          body.rotation.x = Math.PI;
          ball(berry, 1.05, red, 0, 0.95, 0, 1, 0.5, 1);
          inst(berry, dot(0.05), 0xf2d16b, Array.from({ length: 40 }, (_, i) => {
            const y = 0.8 - (i / 39) * 1.5;
            const r = 1.07 * Math.min(1, (y + 0.95) / 1.9 + 0.02);
            return [Math.cos(i * 2.4) * r, y, Math.sin(i * 2.4) * r];
          }));
          for (let k = 0; k < 6; k++) {
            const leaf = cone(berry, 0.22, 0.8, 0x3f9a3c, 0, 1.45, 0, 4);
            leaf.rotation.set(1.25, 0, 0);
            leaf.position.set(Math.sin(k * 1.047) * 0.4, 1.47, Math.cos(k * 1.047) * 0.4);
            leaf.rotation.order = "YXZ";
            leaf.rotation.y = k * 1.047;
          }
          cyl(berry, 0.05, 0.05, 0.4, 0x3f9a3c, 0, 1.7, 0, 6);
          berry.position.set(-0.4, 1.15, -0.2);
          berry.rotation.z = 0.2;
          g.add(berry);
          [0.9, 1.5].forEach(z => { box(g, 3.6, 0.2, 0.35, 0x4f8a3c, 0.3, 0.1, z); });
          inst(g, dot(0.08), red, Array.from({ length: 16 }, (_, i) => [-1.3 + (i % 8) * 0.45, 0.24, i < 8 ? 0.9 : 1.5]));
        } },
      { key: "station", name: "勝興車站", icon: "🚉", at: 250, labelY: 3,
        say: n => `${n} 在勝興車站的月台上等一班永遠不會來的火車。`,
        build(g) {
          box(g, 2.6, 1.0, 1.3, 0x8a5a3b, 0, 0.6, -0.3);
          roof(g, 3.2, 0.8, 1.9, 0x3a3430, 0, 1.1, -0.3);
          box(g, 0.5, 0.7, 0.05, 0x3a2a22, 0, 0.45, 0.36);
          [-0.9, 0.9].forEach(x => box(g, 0.4, 0.35, 0.05, 0xf2e3b5, x, 0.7, 0.36));
          sign(g, "勝興", 0.9, 0.34, "#2b211c", "#f7f5ef", 0, 1.0, 0.38);
          box(g, 3.8, 0.16, 0.7, 0xb8b2a6, 0, 0.08, 0.75);
          box(g, 4.4, 0.05, 0.7, 0x6b6460, 0, 0.03, 1.5);
          [-0.2, 0.2].forEach(z => box(g, 4.4, 0.06, 0.05, 0x3a3430, 0, 0.09, 1.5 + z));
        } },
      { key: "tung", name: "客家桐花步道", icon: "🌸", at: 300, labelY: 3.4,
        say: n => `${n} 站在桐花樹下，白色的花瓣落在頭上，像戴了一頂小花帽。`,
        build(g) {
          [[-1.2, -0.3, 1.2], [0.2, -0.8, 1.5], [1.4, 0.1, 1.1]].forEach(([x, z, s]) => {
            cyl(g, 0.12 * s, 0.18 * s, 1.5 * s, 0x7a5a3a, x, 0.75 * s, z, 6);
            ball(g, 0.9 * s, 0x6fae5a, x, 1.9 * s, z, 1.2, 0.75, 1.2);
            inst(g, dot(0.09), 0xfdfdf5, onDome(22, 1.1 * s, 0.72 * s, 1.1 * s).map(([a, b, c]) => [x + a, 1.9 * s + b, z + c]));
          });
          inst(g, dot(0.07), 0xfdfdf5, Array.from({ length: 30 }, () => [rnd(-2, 2), 0.05, rnd(-0.6, 1.6)]));
          const petals = Array.from({ length: 12 }, () => [rnd(-1.8, 1.8), rnd(), rnd(-0.8, 1.2)]);
          const fall = inst(g, dot(0.06), 0xfdfdf5, petals);
          const mm = new T.Matrix4();
          anim((dt, t) => {
            petals.forEach((p, i) => { const u = (t * 0.12 + p[1]) % 1; mm.makeTranslation(p[0] + Math.sin(t * 2 + i) * 0.25, 2.4 - u * 2.3, p[2]); fall.setMatrixAt(i, mm); });
            fall.instanceMatrix.needsUpdate = true;
          });
        } },
    ],
  };
});
