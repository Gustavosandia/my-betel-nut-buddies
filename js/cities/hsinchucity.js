// 新竹風城：東門城、科學園區與九降風
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("hsinchucity", K => {
  const { T, m, smooth, clear, rnd, V, box, cyl, ball, tor, line, arch, inst, glow, anim, steam, eave, bowl } = K;
  return {
    title: "新竹風城", icon: "🎐", subtitle: "東門城、科學園區與九降風", ground: 0xa3c070, tall: true,
    events: [
      () => "九降風吹過新竹，風車轉得像要飛起來一樣。",
      () => "科學園區的工程師下班了……才怪，燈還亮著。",
      () => "城隍廟口的貢丸湯和炒米粉，香味被風吹得好遠。",
    ],
    landmarks: [
      { key: "gate", name: "新竹東門城", icon: "🏯", at: 340, labelY: 4.2,
        say: n => `${n} 繞著東門城（迎曦門）的圓環走了一圈，風大到帽子差點飛走。`,
        build(g) {
          box(g, 3.2, 1.3, 1.8, 0xb8ab95, 0, 0.65, 0);
          [-1, 1].forEach(s => { box(g, 0.8, 0.5, 0.05, 0x2f2a28, 0, 0.25, s * 0.91); arch(g, 0.4, 0.05, 0x2f2a28, 0, 0.5, s * 0.91); });
          for (let i = -3; i <= 3; i++) [-1, 1].forEach(s => box(g, 0.25, 0.2, 0.2, 0xb8ab95, i * 0.48, 1.4, s * 0.8));
          for (let i = 0; i < 4; i++) [-1, 1].forEach(s => cyl(g, 0.07, 0.07, 0.8, 0xa8231c, -1.05 + i * 0.7, 1.7, s * 0.5, 8));
          box(g, 2.0, 0.7, 0.8, 0xc8372d, 0, 1.7, 0);
          eave(g, 3.2, 2.0, 0x6d7f8f, 0, 2.1, 0, 0.5);
          box(g, 1.4, 0.4, 0.7, 0xc8372d, 0, 2.7, 0);
          eave(g, 2.2, 1.4, 0x6d7f8f, 0, 2.9, 0, 0.5);
        } },
      { key: "chip", name: "新竹科學園區", icon: "💾", at: 150, labelY: 3.6,
        say: n => `${n} 參觀科學園區，看到一片比臉還大的晶圓，上面刻了幾億個電晶體。`,
        build(g) {
          box(g, 2.8, 1.3, 1.8, 0xe6eaee, 0, 0.65, 0);
          box(g, 2.82, 0.35, 1.82, clear(0x4a8fd0, 0.9), 0, 0.8, 0);
          const led = glow(0x4dff9a, 0.5, 1.5);
          const chip = new T.Group();
          box(chip, 1.3, 0.14, 1.3, 0x1f2125, 0, 0, 0);
          box(chip, 0.7, 0.03, 0.7, 0x8a8f96, 0, 0.08, 0);
          for (let i = -2; i <= 2; i++) {
            [-1, 1].forEach(s => { box(chip, 0.12, 0.05, 0.22, 0xe2b33c, i * 0.25, -0.03, s * 0.72); box(chip, 0.22, 0.05, 0.12, 0xe2b33c, s * 0.72, -0.03, i * 0.25); });
          }
          ball(chip, 0.05, led, -0.5, 0.09, 0.5);
          chip.position.set(-0.5, 1.75, 0.2);
          chip.rotation.set(0.5, 0.4, 0);
          g.add(chip);
          const wafer = cyl(g, 0.6, 0.6, 0.04, m(0x9ad0ff, { flatShading: false, metalness: 0.8, roughness: 0.15 }), 1.0, 1.95, 0.3, 28);
          wafer.rotation.set(Math.PI / 2, 0, 0.2);
          anim((dt, t) => { chip.rotation.y = 0.4 + Math.sin(t * 0.6) * 0.3; wafer.rotation.z = t * 0.5; });
        } },
      { key: "wind", name: "風城大風車", icon: "🎐", at: 240, labelY: 3.8,
        say: n => `${n} 被九降風吹得頭髮全亂，風車卻轉得很開心。`,
        build(g) {
          const wheels = [];
          [[-1.3, 2.3, 0xe85d75], [0, 3.0, 0x4aa3df], [1.3, 2.0, 0xf2c230]].forEach(([x, h, c], k) => {
            cyl(g, 0.05, 0.07, h, 0xdfe2e6, x, h / 2, 0, 6);
            const wh = new T.Group();
            for (let b = 0; b < 4; b++) {
              const blade = new T.Group();
              box(blade, 0.55, 0.28, 0.03, b % 2 ? c : 0xfdfdf5, 0.32, 0.1, 0);
              blade.rotation.z = (b * Math.PI) / 2;
              wh.add(blade);
            }
            ball(wh, 0.07, 0xe2b33c, 0, 0, 0.03);
            wh.position.set(x, h, 0.1);
            g.add(wh);
            wheels.push([wh, 3 + k]);
          });
          anim((dt, t) => wheels.forEach(([w, s]) => { w.rotation.z = -t * s; }));
        } },
      { key: "noodle", name: "貢丸米粉", icon: "🍜", at: 290, labelY: 2.6,
        say: n => `${n} 呼嚕呼嚕吃完一碗貢丸湯配炒米粉，還加點了一顆滷蛋。`,
        build(g) {
          const top = bowl(g, 1.2, 0.8);
          cyl(g, 1.1, 1.1, 0.04, smooth(0xe8cf8c), 0, top - 0.08, 0, 24);
          [[-0.4, 0.2], [0.3, -0.3], [0.35, 0.4]].forEach(([x, z]) => ball(g, 0.3, smooth(0xd9b99a), x, top + 0.05, z));
          for (let i = 0; i < 5; i++) {
            const n1 = tor(g, 0.3 + i * 0.1, 0.035, smooth(0xfbf3d9), -0.2 + i * 0.05, top - 0.03, -0.1);
            n1.rotation.set(Math.PI / 2 + rnd(-0.2, 0.2), 0, rnd(0, 3));
          }
          inst(g, new T.BoxGeometry(0.1, 0.03, 0.05), 0x3fa046, Array.from({ length: 10 }, () => [rnd(-0.8, 0.8), top - 0.03, rnd(-0.8, 0.8)]));
          line(g, V(0.6, top, -0.4), V(1.7, top + 0.9, -0.9), 0.05, 0x9a6b3e);
          line(g, V(0.7, top, -0.25), V(1.8, top + 0.9, -0.7), 0.05, 0x9a6b3e);
          steam(g, 0, top + 0.2, 0, 4, 0.3, 1.8);
        } },
    ],
  };
});
