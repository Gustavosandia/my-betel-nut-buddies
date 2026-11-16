// 台中珍奶城：歌劇院、高美濕地與珍珠奶茶
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("taichung", K => {
  const { T, m, smooth, water, rnd, V, box, cyl, ball, line, gable, inst, dot, sign, anim } = K;
  return {
    title: "台中珍奶城", icon: "🧋", subtitle: "歌劇院、高美濕地與珍珠奶茶", ground: 0xa3c070,
    // 七期重劃區：房子多、七成是大樓，大樓比別的縣市高，用玻璃帷幕的藍灰色
    houses: 46, trees: 22, tall: 0.7, tallH: [3, 8], tallPalette: [0x9fb8cc, 0xc9d6df, 0x7f99ad, 0xe6e2d8, 0xb3c7c2, 0x8fa6b8],
    events: [
      () => "台中的太陽好大，來一杯珍珠奶茶，半糖少冰。",
      () => "高美濕地的夕陽把整片水面染成橘色，風機慢慢地轉。",
      () => "彩虹眷村的牆上，又多了幾個彩色的小人。",
      () => "七期的豪宅一棟比一棟高，晚上整片窗戶亮晶晶。",
    ],
    landmarks: [
      { key: "opera", name: "台中國家歌劇院", icon: "🎭", at: 55, labelY: 3.4,
        say: n => `${n} 走進歌劇院，牆壁彎來彎去像洞穴一樣，找不到一面直的牆。`,
        build(g) {
          const w = smooth(0xf4f2ec);
          box(g, 3.4, 2.0, 2.0, w, 0, 1.0, 0);
          const gl = m(0x7fa9c9, { flatShading: false, roughness: 0.15, metalness: 0.3 });
          [[-1.0, 1.25, 0.6], [0.2, 0.75, 0.48], [1.05, 1.3, 0.5], [-0.2, 1.6, 0.3], [-1.2, 0.5, 0.32], [1.2, 0.5, 0.3]].forEach(([x, y, r]) => {
            [-1, 1].forEach(s => ball(g, r, gl, x * s, y, s * 1.0, 1, 1, 0.08));
          });
          [[-1, 0.5], [0.3, 0.45], [1.1, 0.4]].forEach(([x, r]) => ball(g, r, w, x, 2.0, 0, 1.3, 0.6, 1.3));
          cyl(g, 1.2, 1.2, 0.05, water(), 0, 0.04, 1.9, 24);
        } },
      { key: "rainbow", name: "彩虹眷村", icon: "🌈", at: 95, labelY: 2.4,
        say: n => `${n} 在彩虹眷村拍照，背景的彩色小人比真人還搶戲。`,
        build(g) {
          const paint = seed => {
            const c = document.createElement("canvas");
            c.width = c.height = 128;
            const d = c.getContext("2d");
            const cols = ["#e8423a", "#f2c230", "#3f8fd8", "#3fae5a", "#f28cb4", "#f28c3a", "#8a5fd0"];
            d.fillStyle = cols[seed % cols.length];
            d.fillRect(0, 0, 128, 128);
            for (let i = 0; i < 26; i++) {
              d.fillStyle = cols[Math.floor(rnd(0, cols.length))];
              const x = rnd(0, 128), y = rnd(0, 128), r = rnd(6, 14);
              d.beginPath(); d.arc(x, y, r, 0, 7); d.fill();
              d.fillStyle = "#fff";
              d.fillRect(x - r * 0.5, y + r, r, r * 1.3);
              d.fillStyle = "#222";
              d.fillRect(x - 3, y - 2, 2, 2); d.fillRect(x + 2, y - 2, 2, 2);
            }
            const tex = new T.CanvasTexture(c);
            tex.colorSpace = T.SRGBColorSpace;
            return new T.MeshStandardMaterial({ map: tex, roughness: 0.9 });
          };
          [[-1.4, -0.3], [0.1, -0.5], [1.5, -0.2]].forEach(([x, z], k) => {
            box(g, 1.3, 0.85, 1.1, paint(k), x, 0.42, z);
            gable(g, 1.5, 0.4, 1.3, 0xb4553a, x, 0.85, z);
          });
          const floor = cyl(g, 2.3, 2.3, 0.03, paint(4), 0, 0.03, 0.9, 28);
          floor.scale.z = 0.5;
        } },
      { key: "gaomei", name: "高美濕地", icon: "🌬️", at: 250, labelY: 4.6,
        say: n => `${n} 脫了鞋踩進高美濕地，腳邊有小螃蟹橫著跑過去。`,
        build(g) {
          cyl(g, 2.6, 2.6, 0.05, m(0x8fb8c8, { flatShading: false, roughness: 0.1, metalness: 0.3 }), 0, 0.03, 0.2, 28);
          box(g, 0.45, 0.06, 3.4, 0x9a6b3e, 0, 0.22, 0.3);
          for (let i = 0; i < 6; i++) [-0.2, 0.2].forEach(x => box(g, 0.05, 0.22, 0.05, 0x6b4a2a, x, 0.11, -1.2 + i * 0.6));
          inst(g, new T.ConeGeometry(0.06, 0.3, 4), 0x6f9e55, Array.from({ length: 30 }, () => [rnd(-2.2, 2.2), 0.18, rnd(-1.6, 2)]));
          const hubs = [];
          [[-1.6, -1.0, 3.6], [1.5, -1.3, 4.2], [0.3, -1.8, 3.2]].forEach(([x, z, h]) => {
            cyl(g, 0.05, 0.1, h, smooth(0xf7f7f4), x, h / 2, z, 8);
            box(g, 0.25, 0.14, 0.14, 0xf7f7f4, x, h, z);
            const hub = new T.Group();
            for (let b = 0; b < 3; b++) { const bl = new T.Group(); box(bl, 0.09, 1.3, 0.03, 0xf7f7f4, 0, 0.65, 0); bl.rotation.z = (b * Math.PI * 2) / 3; hub.add(bl); }
            hub.position.set(x, h, z + 0.1);
            g.add(hub);
            hubs.push(hub);
          });
          anim((dt, t) => hubs.forEach((h, i) => { h.rotation.z = t * (0.9 + i * 0.2); }));
        } },
      { key: "boba", name: "珍珠奶茶", icon: "🧋", at: 300, labelY: 3.6,
        say: n => `${n} 吸了一大口珍珠奶茶，珍珠卡在吸管裡，臉都漲紅了。`,
        build(g) {
          cyl(g, 0.85, 0.6, 2.0, smooth(0xd2a679), 0, 1.0, 0, 24);
          cyl(g, 0.87, 0.87, 0.06, smooth(0xf4f4f2), 0, 2.02, 0, 24);
          inst(g, dot(0.11), smooth(0x2a1d16), Array.from({ length: 34 }, (_, i) => {
            const y = 0.12 + (i % 4) * 0.17;
            const r = 0.62 + y * 0.125;
            return [Math.cos(i * 0.9) * r, y, Math.sin(i * 0.9) * r];
          }));
          line(g, V(0.15, 1.2, 0), V(0.5, 3.0, 0.15), 0.16, smooth(0xff7fa8));
          sign(g, "珍奶", 0.9, 0.5, "#7a4a2a", "#fff3d9", 0, 1.3, 0.77);
        } },
    ],
  };
});
