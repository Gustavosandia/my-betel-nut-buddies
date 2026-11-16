// 雲林布袋戲城：北港朝天宮、布袋戲與古坑咖啡
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("yunlin", K => {
  const { T, smooth, rnd, V, box, cyl, cone, ball, tor, line, gable, inst, dot, onDome, sign, anim, steam, eave, temple } = K;
  return {
    title: "雲林布袋戲城", icon: "🎎", subtitle: "北港朝天宮、布袋戲與古坑咖啡", ground: 0xa8c26e,
    // 稻田：8 片，金黃稻穗的比例 0.35
    paddies: 8, paddyGold: 0.35,
    events: [
      () => "北港朝天宮的香火鼎盛，鞭炮聲劈哩啪啦響個不停。",
      () => "布袋戲台上，史豔文和藏鏡人又打起來了。",
      () => "古坑的咖啡香順著風飄下山。",
    ],
    landmarks: [
      { key: "temple", name: "北港朝天宮", icon: "🛕", at: 60, labelY: 4,
        say: n => `${n} 在北港朝天宮向媽祖拜拜，求了一支上上籤。`,
        build(g) {
          temple(g, 3.0);
          cyl(g, 0.3, 0.22, 0.4, 0xe2b33c, 0, 0.5, 1.6, 10);
          steam(g, 0, 0.8, 1.6, 3, 0.16, 1.6, 0xcfcfcf);
        } },
      { key: "puppet", name: "布袋戲台", icon: "🎎", at: 110, labelY: 3.4,
        say: n => `${n} 站在戲台前看布袋戲，看到入迷，嘴巴都忘了閉起來。`,
        build(g) {
          box(g, 3.0, 0.5, 1.2, 0x8a5a3b, 0, 0.25, 0);
          [-1.35, 1.35].forEach(x => box(g, 0.3, 2.0, 1.0, 0xc8372d, x, 1.5, 0));
          box(g, 3.0, 0.5, 1.0, 0xc8372d, 0, 2.6, 0);
          box(g, 2.4, 1.6, 0.1, 0x2a1d2e, 0, 1.4, -0.4);
          sign(g, "布袋戲", 1.6, 0.4, "#f2d16b", "#7a1f1a", 0, 2.6, 0.51);
          eave(g, 3.4, 1.4, 0xe2a838, 0, 2.85, 0, 0.5);
          [-1.2, 1.2].forEach(x => box(g, 0.25, 1.5, 0.06, 0xe2b33c, x, 1.4, 0.3));
          const pups = [];
          [[-0.5, 0xd8333a, 0xe2b33c], [0.5, 0x2f6fb5, 0x1b1b1b]].forEach(([x, robe, hat], i) => {
            const p = new T.Group();
            cone(p, 0.3, 0.7, smooth(robe), 0, 0.35, 0, 10);
            ball(p, 0.2, smooth(0xffe0c4), 0, 0.8, 0);
            cone(p, 0.16, 0.3, hat, 0, 1.08, 0, 6);
            [-1, 1].forEach(s => line(p, V(0, 0.55, 0), V(s * 0.38, 0.75, 0.05), 0.08, smooth(robe)));
            p.position.set(x, 0.5, 0.2);
            g.add(p);
            pups.push([p, x, i]);
          });
          anim((dt, t) => pups.forEach(([p, x, i]) => { p.position.x = x + Math.sin(t * 2.2 + i * 2.6) * 0.3; p.rotation.z = Math.sin(t * 4.4 + i) * 0.25; p.position.y = 0.5 + Math.abs(Math.sin(t * 4.4 + i)) * 0.12; }));
        } },
      { key: "coffee", name: "古坑咖啡", icon: "☕", at: 250, labelY: 2.8,
        say: n => `${n} 在古坑喝了一杯台灣咖啡，望著整片嘉南平原發呆。`,
        build(g) {
          cyl(g, 1.4, 1.2, 0.1, smooth(0xfbfaf4), 0, 0.05, 0, 28);
          cyl(g, 0.95, 0.65, 1.0, smooth(0xfbfaf4), 0, 0.6, 0, 24);
          cyl(g, 0.86, 0.86, 0.04, smooth(0x4a2c1a), 0, 1.08, 0, 24);
          const h = tor(g, 0.32, 0.09, smooth(0xfbfaf4), 1.05, 0.62, 0);
          h.scale.x = 0.9;
          steam(g, 0, 1.3, 0, 4, 0.26, 1.8);
          ball(g, 0.6, 0x3f8a3c, -1.7, 0.5, 0.6, 1, 0.9, 1);
          inst(g, dot(0.07), 0xd8333a, onDome(14, 0.62, 0.55, 0.62).map(([a, b, c]) => [-1.7 + a, 0.5 + b, 0.6 + c]));
          ball(g, 0.35, 0xc9a66b, 1.6, 0.3, 0.8, 1, 0.85, 0.8);
          inst(g, dot(0.06), 0x4a2c1a, Array.from({ length: 8 }, () => [1.6 + rnd(-0.5, 0.5), 0.05, 1.3 + rnd(-0.2, 0.2)]));
        } },
      { key: "soy", name: "西螺醬油", icon: "🫙", at: 300, labelY: 3,
        say: n => `${n} 掀開西螺醬油缸的斗笠蓋聞了一下，好香的豆麥味！`,
        build(g) {
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
              const x = -1.6 + i * 0.95, z = 0.4 + j * 0.95;
              ball(g, 0.42, smooth(0x3a2a22), x, 0.42, z, 1, 1, 1);
              cone(g, 0.5, 0.3, 0xc9a66b, x, 0.92, z, 12);
            }
          }
          cyl(g, 0.4, 0.4, 1.5, smooth(0x2a1d16), 1.3, 0.75, -0.2, 16);
          cyl(g, 0.18, 0.4, 0.5, smooth(0x2a1d16), 1.3, 1.75, -0.2, 16);
          cyl(g, 0.2, 0.2, 0.2, 0xd8333a, 1.3, 2.1, -0.2, 12);
          sign(g, "醬油", 0.6, 0.5, "#2b211c", "#f2c230", 1.3, 0.8, 0.21);
          box(g, 1.6, 0.9, 0.9, 0x8a5a3b, -0.8, 0.45, -0.9);
          gable(g, 1.9, 0.45, 1.1, 0x3a3430, -0.8, 0.9, -0.9);
        } },
    ],
  };
});
