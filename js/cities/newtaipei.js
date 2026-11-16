// 新北天燈城：九份山城、淡水紅毛城與平溪天燈
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("newtaipei", K => {
  const { smooth, rnd, box, cyl, cone, ball, gable, arch, glow, anim } = K;
  return {
    title: "新北天燈城", icon: "🏮", subtitle: "九份山城、淡水紅毛城與平溪天燈", ground: 0x98b86e, tall: true,
    events: [
      () => "平溪的天燈一盞一盞飄上夜空，載著大家的願望。",
      () => "九份老街的紅燈籠亮了，芋圓店飄出甜甜的香味。",
      () => "淡水河口的夕陽，把紅毛城染得更紅了。",
    ],
    landmarks: [
      { key: "queen", name: "野柳女王頭", icon: "👑", at: 350, labelY: 3.2,
        say: n => `${n} 跟野柳女王頭合照，小心翼翼不敢碰到她細細的脖子。`,
        build(g) {
          const sand = smooth(0xc9a66b);
          cyl(g, 1.5, 1.7, 0.25, 0xb89a68, 0, 0.12, 0, 9);
          cyl(g, 0.16, 0.3, 1.0, sand, 0, 0.75, 0, 10);
          ball(g, 0.45, sand, 0, 1.5, 0.12, 1, 0.9, 1.25);
          ball(g, 0.28, smooth(0x9a7348), 0, 1.92, -0.1, 1.1, 0.8, 1.1);
          [[-1.1, 0.5, 0.5], [1.0, -0.3, 0.42], [0.9, 0.8, 0.3]].forEach(([x, z, r]) => {
            cyl(g, r * 0.35, r * 0.5, r * 1.4, sand, x, 0.25 + r * 0.7, z, 8);
            ball(g, r, smooth(0x9a7348), x, 0.3 + r * 1.5, z, 1, 0.6, 1);
          });
        } },
      { key: "jiufen", name: "九份老街", icon: "🍡", at: 115, labelY: 3.8,
        say: n => `${n} 沿著九份的石階往上爬，在茶樓裡看海喝茶配芋圓。`,
        build(g) {
          ball(g, 1, 0x6f8f55, 0, 0, -0.4, 2.9, 2.0, 2.1);
          const lamp = glow(0xff4a3a, 0.5, 1.6);
          [[-1.2, 0.9, 0.9], [1.1, 1.25, 0.6], [-0.3, 1.75, 0.1], [1.3, 0.7, 1.2]].forEach(([x, y, z]) => {
            box(g, 1.3, 0.7, 0.9, 0x5a3d2b, x, y + 0.35, z);
            box(g, 1.5, 0.1, 1.1, 0x2f2a28, x, y + 0.75, z);
            box(g, 1.1, 0.3, 0.05, 0xf2d9a0, x, y + 0.4, z + 0.46);
            [-0.5, 0, 0.5].forEach(dx => ball(g, 0.09, lamp, x + dx, y + 0.62, z + 0.5));
          });
          for (let k = 0; k < 6; k++) box(g, 0.5, 0.12, 0.3, 0xbdb6a8, 0.15, 0.2 + k * 0.2, 1.75 - k * 0.24);
        } },
      { key: "lantern", name: "平溪天燈", icon: "🎑", at: 170, labelY: 3,
        say: n => `${n} 在天燈上寫下願望：「檳友們永遠健康、天天開心！」`,
        build(g) {
          const lamp = glow(0xff9a3d, 0.8, 1.2);
          box(g, 4.2, 0.06, 0.7, 0x6b6460, 0, 0.03, 0.3);
          [-0.22, 0.22].forEach(z => box(g, 4.2, 0.05, 0.05, 0x3a3430, 0, 0.08, 0.3 + z));
          box(g, 1.6, 0.9, 0.9, 0x8a5a3b, -1, 0.45, -0.7);
          gable(g, 1.9, 0.5, 1.1, 0x3a3430, -1, 0.9, -0.7);
          const ls = [];
          for (let i = 0; i < 6; i++) ls.push({ l: cyl(g, 0.24, 0.17, 0.5, lamp, 0, 0, 0, 4), o: i / 6, x: rnd(-1.5, 1.5), z: rnd(-0.2, 1.3) });
          anim((dt, t) => ls.forEach(s => {
            const u = (t * 0.07 + s.o) % 1;
            s.l.position.set(s.x + Math.sin(t * 0.8 + s.o * 9) * 0.3, 0.6 + u * 7, s.z);
            s.l.scale.setScalar(1 - u * 0.5);
          }));
        } },
      { key: "fort", name: "淡水紅毛城", icon: "🏰", at: 290, labelY: 3.8,
        say: n => `${n} 走進紅毛城，從城牆上看見淡水河出海口。`,
        build(g) {
          box(g, 2.4, 1.9, 2.2, 0xc8452f, 0, 0.95, 0);
          box(g, 2.6, 0.12, 2.4, 0xf4f1ea, 0, 1.95, 0);
          for (let i = -2; i <= 2; i++) [-1, 1].forEach(s => box(g, 0.3, 0.25, 0.3, 0xc8452f, i * 0.55, 2.13, s));
          [-0.7, 0, 0.7].forEach(x => { box(g, 0.4, 0.6, 0.05, 0x2b2b2b, x, 0.8, 1.11); arch(g, 0.2, 0.05, 0x2b2b2b, x, 1.1, 1.11); });
          cyl(g, 0.4, 0.4, 2.5, 0xc8452f, 1.3, 1.25, -1.1, 8);
          cone(g, 0.5, 0.5, 0x7a2f22, 1.3, 2.75, -1.1);
          cyl(g, 0.03, 0.03, 1.2, 0xdfe2e6, -0.9, 2.6, 0, 6);
          box(g, 0.5, 0.3, 0.02, 0xd8333a, -0.62, 3.0, 0);
        } },
    ],
  };
});
