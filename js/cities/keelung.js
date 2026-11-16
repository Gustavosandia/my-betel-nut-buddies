// 基隆雨都城：雨港、廟口夜市與山上的 KEELUNG
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("keelung", K => {
  const { T, m, smooth, water, rnd, box, cyl, ball, sign, glow, anim, steam } = K;
  return {
    title: "基隆雨都城", icon: "🌧️", subtitle: "雨港、廟口夜市與山上的 KEELUNG", ground: 0x8fb078, tall: true,
    events: [
      () => "基隆又下雨了，港邊的燈火倒映在濕濕的路面上。",
      () => "廟口夜市的黃燈籠一盞盞亮起，營養三明治大排長龍。",
      () => "一艘郵輪鳴著汽笛，慢慢靠進基隆港。",
    ],
    landmarks: [
      { key: "sign", name: "KEELUNG 地標", icon: "🔠", at: 20, labelY: 3.6,
        say: n => `${n} 爬上虎仔山，在 KEELUNG 大字前俯瞰整個雨港。`,
        build(g) {
          ball(g, 1, 0x5d9a52, 0, 0, 0, 2.9, 1.9, 1.9);
          sign(g, "KEELUNG", 4.4, 0.95, "#ffffff", null, 0, 2.3, 0.8);
          [-1.8, 0, 1.8].forEach(x => box(g, 0.08, 0.9, 0.08, 0x8a8f96, x, 1.75, 0.76));
        } },
      { key: "market", name: "基隆廟口夜市", icon: "🏮", at: 75, labelY: 3.6,
        say: n => `${n} 在廟口吃了鼎邊銼、營養三明治，還外帶一杯泡泡冰。`,
        build(g) {
          const lamp = glow(0xffd23f, 0.4, 1.6);
          [-1.4, 0, 1.4].forEach((x, i) => {
            box(g, 1.1, 0.7, 0.9, [0xd8333a, 0x2f6fb5, 0x3fa66b][i], x, 0.35, 0.4);
            box(g, 1.3, 0.07, 1.1, i % 2 ? 0xf4f4f2 : 0xe85d4a, x, 1.25, 0.5).rotation.x = 0.25;
            [-0.5, 0.5].forEach(dx => box(g, 0.06, 1.2, 0.06, 0x6b6460, x + dx, 0.6, -0.05));
          });
          [-2.3, 2.3].forEach(x => box(g, 0.18, 2.6, 0.18, 0xc8372d, x, 1.3, -0.6));
          box(g, 5, 0.34, 0.3, 0xc8372d, 0, 2.7, -0.6);
          sign(g, "基隆廟口", 2.4, 0.5, "#f2d16b", "#7a1f1a", 0, 2.7, -0.43);
          for (let i = 0; i < 9; i++) ball(g, 0.13, lamp, -2 + i * 0.5, 2.25 + (i % 2) * 0.08, -0.45);
          steam(g, 0, 0.9, 0.4, 3, 0.2, 1.4);
        } },
      { key: "houses", name: "正濱漁港彩色屋", icon: "🏘️", at: 130, labelY: 3,
        say: n => `${n} 在正濱漁港拍照，一整排彩色屋倒映在水面上。`,
        build(g) {
          [0xf2c230, 0xe85d75, 0x4aa3df, 0x7fd18b, 0xf28c3a, 0xb58af2].forEach((c, i) => {
            const h = 1.5 + (i % 3) * 0.25;
            const x = -2.25 + i * 0.9;
            box(g, 0.82, h, 1.1, c, x, h / 2, -0.4);
            [0.55, 1.1].forEach(wy => box(g, 0.3, 0.28, 0.04, 0xfdfdf5, x, wy, 0.17));
          });
          box(g, 5.6, 0.06, 1.3, water(), 0, 0.04, 0.95);
          box(g, 0.9, 0.18, 0.35, 0xf4f4f2, -1, 0.16, 1);
          box(g, 0.3, 0.2, 0.25, 0x2f6fb5, -1.15, 0.34, 1);
          box(g, 0.8, 0.16, 0.32, 0xd8333a, 1.2, 0.15, 1.15);
        } },
      { key: "guanyin", name: "中正公園大觀音", icon: "🙏", at: 310, labelY: 4.4,
        say: n => `${n} 仰望中正公園的白色大觀音，雨剛好停了一下。`,
        build(g) {
          const w = smooth(0xf7f5ef);
          cyl(g, 1.2, 1.3, 0.3, 0xbdb6a8, 0, 0.15, 0);
          cyl(g, 0.9, 1.0, 0.25, 0xe2b33c, 0, 0.42, 0);
          cyl(g, 0.36, 0.8, 2.5, w, 0, 1.8, 0, 20);
          ball(g, 0.36, w, 0, 3.25, 0.02);
          ball(g, 0.46, w, 0, 3.3, -0.12, 1, 1.15, 0.9);
          [-1, 1].forEach(s => { ball(g, 0.28, 0xe2b33c, s * 1.5, 0.3, 0.6, 1, 1, 1.3); ball(g, 0.2, 0xe2b33c, s * 1.5, 0.62, 0.85); });
        } },
    ],
    // 基隆上空永遠有一朵會下雨的雲
    extra(g) {
      const sky = new T.Group();
      sky.scale.setScalar(1.5);
      g.add(sky);
      const cloud = new T.Group();
      cloud.position.set(0, 8, 0);
      const grey = m(0x8d95a3, { flatShading: false, roughness: 1 });
      [[-2, 0, 0, 1.6], [0, 0.4, 0.3, 2], [2, 0, -0.2, 1.5], [0.8, -0.2, 1, 1.3], [-1, -0.1, -0.9, 1.2]].forEach(([x, y, z, r]) => ball(cloud, r, grey, x, y, z, 1, 0.6, 1));
      sky.add(cloud);
      const N = 70;
      const drops = new T.InstancedMesh(new T.BoxGeometry(0.03, 0.5, 0.03), new T.MeshBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.7 }), N);
      const seeds = Array.from({ length: N }, () => [rnd(-3.5, 3.5), rnd(), rnd(-2.5, 2.5), rnd(5, 8)]);
      const mm = new T.Matrix4();
      sky.add(drops);
      anim((dt, t) => {
        cloud.position.x = Math.sin(t * 0.2) * 1.5;
        seeds.forEach((s, i) => {
          const u = (t * s[3] / 9 + s[1]) % 1;
          mm.makeTranslation(cloud.position.x + s[0], 7.4 - u * 7.0, s[2]);
          drops.setMatrixAt(i, mm);
        });
        drops.instanceMatrix.needsUpdate = true;
      });
    },
  };
});
