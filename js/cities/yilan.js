// 宜蘭蔥蔥城：龜山島、蘭陽博物館與礁溪溫泉
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("yilan", K => {
  const { T, m, smooth, water, clear, rnd, V, box, cyl, ball, tor, line, gable, wedge, inst, dot, sign, glow, anim, steam } = K;
  return {
    title: "宜蘭蔥蔥城", icon: "🐢", subtitle: "龜山島、蘭陽博物館與礁溪溫泉", ground: 0x8fc070,
    // 稻田：4 片，金黃稻穗的比例 0.1
    paddies: 4, paddyGold: 0.1,
    events: [
      () => "龜山島在海面上若隱若現，今天「龜山戴帽」，要下雨了。",
      () => "礁溪的溫泉冒著熱氣，泡一下整個人都鬆了。",
      () => "三星蔥又長高了，蔥油餅的香味飄過蘭陽平原。",
    ],
    landmarks: [
      { key: "turtle", name: "龜山島", icon: "🐢", at: 90, r: 30, labelY: 2.6, reach: 13,
        say: n => `${n} 隔著海眺望龜山島，牠好像也轉頭看了一眼。`,
        build(g) {
          // 龜山島在外海：整座島沉到海面的高度（海面在世界座標約 -1.6，地標放大 1.8 倍、底部在草地高度 0.7）
          const sea = -1.26;
          const rock = smooth(0x6f9a58);
          // 這個地標面向島中心（+z），龜頭朝南邊擺
          ball(g, 1, rock, 0, sea, 0, 2.6, 1.7, 2.0);
          ball(g, 1, rock, -2.9, sea, 0.2, 1.2, 0.8, 0.9);
          ball(g, 1, smooth(0xd9c08e), 2.9, sea, -0.1, 1.2, 0.12, 0.3);
          cyl(g, 1.2, 1.2, 0.04, clear(0x9fe8d8, 0.8), -3.6, sea + 0.62, 1.0, 20);
          const cap = new T.Group();
          [[0, 0, 1.1], [0.9, -0.1, 0.8], [-0.8, -0.1, 0.8]].forEach(([x, y, r]) => ball(cap, r, m(0xffffff, { flatShading: false, roughness: 1 }), x, y, 0, 1.2, 0.5, 1));
          cap.position.set(0, sea + 2.3, 0);
          g.add(cap);
          steam(g, -3.6, sea + 0.7, 1.0, 3, 0.25, 1.4);
          anim((dt, t) => { cap.position.x = Math.sin(t * 0.3) * 0.4; });
        } },
      { key: "museum", name: "蘭陽博物館", icon: "🪨", at: 140, labelY: 3.4,
        say: n => `${n} 來到蘭陽博物館，整棟建築像一塊從地底斜斜冒出來的大石頭。`,
        build(g) {
          cyl(g, 2.6, 2.6, 0.05, water(), 0, 0.03, 0.6, 28);
          wedge(g, 4.0, 2.6, 2.2, 0x6b6660, 0, 0, -0.5);
          wedge(g, 3.0, 1.9, 1.0, m(0x8fb6c9, { flatShading: false, roughness: 0.15, metalness: 0.3 }), 0.2, 0, 0.9);
          for (let k = 0; k < 5; k++) { const y = 0.3 + k * 0.42; const w = 4.0 * (1 - y / 2.6); box(g, w, 0.07, 2.24, 0x8a857a, 2.0 - w / 2, y, -0.5); }
        } },
      { key: "spring", name: "礁溪溫泉", icon: "♨️", at: 250, labelY: 3,
        say: n => `${n} 泡在礁溪溫泉裡，舒服到差點睡著，頭上的毛巾都掉了。`,
        build(g) {
          for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; ball(g, 0.38, 0x6b6660, Math.cos(a) * 1.6, 0.2, Math.sin(a) * 1.6 + 0.3, 1.2, 0.8, 1); }
          cyl(g, 1.55, 1.55, 0.1, clear(0x7fd8d0, 0.9), 0, 0.25, 0.3, 24);
          [[-0.5, 0.2], [0.5, 0.6]].forEach(([x, z]) => { ball(g, 0.22, smooth(0xffe0c4), x, 0.5, z); box(g, 0.26, 0.05, 0.2, 0xfdfdf5, x, 0.72, z); });
          [-1.5, 1.5].forEach(x => cyl(g, 0.06, 0.06, 1.8, 0x8a5a3b, x, 0.9, -1.2, 6));
          gable(g, 3.6, 0.6, 1.2, 0x5a3d2b, 0, 1.8, -1.2);
          const lamp = glow(0xfff1c9, 0.4, 1.5);
          box(g, 0.5, 0.7, 0.3, lamp, 1.9, 1.0, 0.9);
          sign(g, "♨", 0.44, 0.6, "#d8333a", null, 1.9, 1.0, 1.06);
          box(g, 0.08, 0.7, 0.08, 0x5a3d2b, 1.9, 0.33, 0.9);
          steam(g, 0, 0.5, 0.3, 6, 0.36, 2.4);
        } },
      { key: "onion", name: "三星蔥", icon: "🧅", at: 300, labelY: 3.8,
        say: n => `${n} 抱著一大把三星蔥，決定今晚做蔥油餅、蔥爆牛肉和蔥花蛋。`,
        build(g) {
          const bundle = new T.Group();
          [[-0.2, 0], [0.2, 0.05], [0, -0.18], [0.05, 0.2]].forEach(([x, z], k) => {
            cyl(bundle, 0.13, 0.17, 1.3, smooth(0xfdfdf5), x, 0.65, z, 10);
            ball(bundle, 0.19, smooth(0xfdfdf5), x, 0.08, z, 1, 0.7, 1);
            [-1, 1].forEach(s => line(bundle, V(x, 1.25, z), V(x + s * (0.25 + k * 0.06), 3.0 - k * 0.15, z + s * 0.12), 0.13, smooth(0x3fa046)));
          });
          const band = tor(bundle, 0.36, 0.05, 0xd8333a, 0, 0.9, 0);
          band.rotation.x = Math.PI / 2;
          bundle.position.set(-0.6, 0, -0.2);
          bundle.rotation.z = 0.08;
          g.add(bundle);
          [0.8, 1.3, 1.8].forEach(z => box(g, 3.8, 0.16, 0.3, 0x7a5a3a, 0.3, 0.08, z));
          inst(g, new T.ConeGeometry(0.06, 0.5, 4), 0x3fa046, Array.from({ length: 36 }, (_, i) => [-1.4 + (i % 12) * 0.31, 0.4, 0.8 + Math.floor(i / 12) * 0.5]));
          cyl(g, 0.6, 0.6, 0.06, smooth(0xe8b84a), 1.6, 0.5, -0.4, 16);
          cyl(g, 0.75, 0.6, 0.08, smooth(0xfbfaf4), 1.6, 0.44, -0.4, 16);
          box(g, 0.9, 0.4, 0.9, 0x8a5a3b, 1.6, 0.2, -0.4);
          inst(g, dot(0.04), 0x3fa046, Array.from({ length: 8 }, () => [1.6 + rnd(-0.4, 0.4), 0.54, -0.4 + rnd(-0.4, 0.4)]));
          steam(g, 1.6, 0.7, -0.4, 3, 0.18, 1.2);
        } },
    ],
  };
});
