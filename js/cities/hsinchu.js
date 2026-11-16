// 新竹柿餅城：內灣吊橋、新埔柿餅與六福村
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("hsinchu", K => {
  const { T, smooth, water, V, box, cyl, ball, line, inst, dot, anim } = K;
  return {
    title: "新竹柿餅城", icon: "🦒", subtitle: "內灣吊橋、新埔柿餅與六福村", ground: 0x9cc272, tree: "pine",
    events: [
      () => "新埔的柿餅在竹篩上曬太陽，整片橘紅色好漂亮。",
      () => "內灣的野薑花粽出爐了，吊橋上擠滿了遊客。",
      () => "六福村的長頸鹿伸長脖子，偷吃樹頂的葉子。",
    ],
    landmarks: [
      { key: "bridge", name: "內灣吊橋", icon: "🌉", at: 20, labelY: 3,
        say: n => `${n} 走上內灣吊橋，橋搖啊搖，嚇得抓緊欄杆。`,
        build(g) {
          box(g, 1.6, 0.05, 3, water(), 0, 0.03, 0);
          [-2.3, 2.3].forEach(x => box(g, 1.4, 0.7, 1.6, 0x6f9e55, x, 0.35, 0));
          [-1.7, 1.7].forEach(x => {
            [-0.38, 0.38].forEach(z => box(g, 0.14, 1.5, 0.14, 0xe9e4d8, x, 1.45, z));
            box(g, 0.14, 0.14, 0.9, 0xe9e4d8, x, 2.15, 0);
          });
          box(g, 4.4, 0.08, 0.62, 0x9a6b3e, 0, 0.78, 0);
          [-0.38, 0.38].forEach(z => {
            [-1, 1].forEach(s => { line(g, V(s * 1.7, 2.2, z), V(0, 1.15, z), 0.035, 0x4a4d52); line(g, V(s * 1.7, 2.2, z), V(s * 2.8, 0.7, z), 0.035, 0x4a4d52); });
            [-1.1, -0.55, 0, 0.55, 1.1].forEach(x => { const top = 1.15 + Math.abs(x) * 0.62; box(g, 0.02, top - 0.8, 0.02, 0x4a4d52, x, (top + 0.8) / 2, z); });
          });
        } },
      { key: "persimmon", name: "新埔柿餅", icon: "🟠", at: 100, labelY: 2.8,
        say: n => `${n} 偷吃一顆曬到一半的柿餅，甜到瞇起眼睛。`,
        build(g) {
          const pts = [];
          [[-1.4, 0], [0, -0.5], [1.4, 0.1]].forEach(([x, z], k) => {
            const tray = cyl(g, 0.85, 0.85, 0.06, 0xd9b878, x, 1.0 + k * 0.1, z, 20);
            tray.rotation.x = 0.35;
            [-0.6, 0.6].forEach(dx => box(g, 0.06, 1.0, 0.06, 0x8a5a3b, x + dx, 0.5, z - 0.3));
            for (let i = 0; i < 12; i++) {
              const a = (i / 12) * Math.PI * 2;
              const r = i % 3 ? 0.6 : 0.28;
              pts.push([x + Math.cos(a) * r, 1.08 + k * 0.1 - Math.sin(a) * r * 0.36, z + Math.sin(a) * r * 0.94]);
            }
          });
          inst(g, dot(0.12), smooth(0xf2852a), pts);
          ball(g, 0.65, smooth(0xf2852a), 0, 0.5, 1.2, 1, 0.8, 1);
          cyl(g, 0.3, 0.34, 0.06, 0x4f7a3a, 0, 1.03, 1.2, 4);
        } },
      { key: "giraffe", name: "六福村長頸鹿", icon: "🦒", at: 180, labelY: 4.4,
        say: n => `${n} 在六福村餵長頸鹿，牠低下頭，用長長的舌頭捲走葉子。`,
        build(g) {
          const y = smooth(0xe8b84a);
          box(g, 1.1, 0.6, 0.5, y, 0, 1.6, 0);
          [[-0.4, -0.17], [-0.4, 0.17], [0.4, -0.17], [0.4, 0.17]].forEach(([x, z]) => { cyl(g, 0.07, 0.06, 1.3, y, x, 0.65, z, 8); cyl(g, 0.07, 0.07, 0.1, 0x5a3d2b, x, 0.05, z, 8); });
          const neck = new T.Group();
          neck.position.set(0.45, 1.8, 0);
          line(neck, V(0, 0, 0), V(0.55, 1.5, 0), 0.24, y);
          box(neck, 0.45, 0.24, 0.24, y, 0.75, 1.6, 0);
          [-0.07, 0.07].forEach(z => { cyl(neck, 0.02, 0.02, 0.18, 0x5a3d2b, 0.6, 1.8, z, 5); box(neck, 0.1, 0.06, 0.03, y, 0.58, 1.66, z * 2.4); });
          ball(neck, 0.03, 0x1b1b1b, 0.82, 1.65, 0.125);
          g.add(neck);
          inst(g, new T.BoxGeometry(0.14, 0.12, 0.02), 0x9a6b2e, [[-0.3, 1.7, 0.26], [0.1, 1.5, 0.26], [0.35, 1.72, 0.26], [-0.1, 1.75, -0.26], [0.3, 1.52, -0.26], [-0.35, 1.5, -0.26]]);
          line(g, V(-0.55, 1.8, 0), V(-0.75, 1.2, 0), 0.04, 0x5a3d2b);
          cyl(g, 0.12, 0.16, 2.2, 0x7a5a3a, 1.9, 1.1, -0.3, 6);
          ball(g, 1, 0x5f9a46, 1.9, 2.5, -0.3, 1.2, 0.35, 1.2);
          anim((dt, t) => { neck.rotation.z = Math.sin(t * 0.7) * 0.12; });
        } },
    ],
  };
});
