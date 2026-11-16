// 桃園國門城：國際機場、石門水庫與拉拉山神木
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("taoyuan", K => {
  const { T, smooth, water, clear, box, cyl, cone, ball, tor, arch, anim, steam } = K;
  return {
    title: "桃園國門城", icon: "✈️", subtitle: "國際機場、石門水庫與拉拉山神木", ground: 0xa3c070, tall: true,
    events: [
      () => "一架飛機從桃園機場起飛，在島的上空盤旋一圈。",
      () => "石門水庫洩洪了，白色的水花轟隆隆地往下沖。",
      () => "拉拉山的水蜜桃熟了，整座山都是甜甜的香氣。",
    ],
    landmarks: [
      { key: "airport", name: "桃園國際機場", icon: "✈️", at: 310, labelY: 3.8,
        say: n => `${n} 拖著行李箱衝進機場，才想起來根本沒有要出國。`,
        build(g) {
          const w = smooth(0xf4f4f2);
          box(g, 5, 0.05, 1.1, 0x4a4d52, 0, 0.03, 0.9);
          for (let i = -4; i <= 4; i++) box(g, 0.3, 0.02, 0.08, 0xf4f4f2, i * 0.55, 0.07, 0.9);
          box(g, 2.4, 0.7, 0.9, 0xdfe6ea, -0.8, 0.35, -0.5);
          box(g, 2.3, 0.3, 0.92, clear(0x7fb6d9, 0.85), -0.8, 0.45, -0.5);
          arch(g, 1.2, 0.9, 0xc9d3d9, -0.8, 0.7, -0.5).scale.y = 0.35;
          cyl(g, 0.22, 0.3, 2.4, w, 1.5, 1.2, -0.5, 10);
          cyl(g, 0.5, 0.36, 0.45, 0x22303d, 1.5, 2.6, -0.5, 8);
          cyl(g, 0.55, 0.55, 0.08, w, 1.5, 2.86, -0.5, 8);
          const P = new T.Group();
          cyl(P, 0.16, 0.16, 1.3, w, 0, 0, 0, 10).rotation.z = Math.PI / 2;
          ball(P, 0.16, w, 0.65, 0, 0, 1.6, 1, 1);
          box(P, 0.4, 0.04, 1.7, w, 0.05, -0.02, 0);
          box(P, 0.25, 0.04, 0.6, w, -0.6, 0.05, 0);
          box(P, 0.28, 0.35, 0.04, 0x2f6fb5, -0.6, 0.2, 0);
          g.add(P);
          anim((dt, t) => {
            const a = t * 0.5;
            P.position.set(Math.cos(a) * 4.2, 4.4 + Math.sin(t * 0.7) * 0.3, Math.sin(a) * 4.2);
            P.rotation.set(-0.25, -a - Math.PI / 2, 0);
          });
        } },
      { key: "daxi", name: "大溪老街", icon: "🏛️", at: 0, labelY: 3,
        say: n => `${n} 逛大溪老街，買了豆干，還抬頭研究巴洛克牌樓上的雕花。`,
        build(g) {
          [-1.3, 0, 1.3].forEach((x, i) => {
            box(g, 1.2, 1.5, 1.0, 0xb4553a, x, 0.75, -0.2);
            box(g, 0.5, 0.7, 0.05, 0x2f2a28, x, 0.35, 0.31);
            arch(g, 0.25, 0.05, 0x2f2a28, x, 0.7, 0.31);
            box(g, 1.26, 0.1, 1.06, 0xe9dcc4, x, 1.5, -0.2);
            arch(g, 0.45 + (i % 2) * 0.1, 0.12, 0xe9dcc4, x, 1.55, 0.25);
            ball(g, 0.09, 0xe9dcc4, x, 2.1 + (i % 2) * 0.1, 0.25);
          });
        } },
      { key: "dam", name: "石門水庫", icon: "💧", at: 110, labelY: 3.2,
        say: n => `${n} 站在石門水庫的大壩上，被洩洪的水霧噴得一臉濕。`,
        build(g) {
          [-2.2, 2.2].forEach(x => ball(g, 1, 0x5d9a52, x, 0, -0.3, 1.3, 1.9, 1.8));
          box(g, 3.4, 1.7, 0.6, 0xbdb6a8, 0, 0.85, 0);
          box(g, 3.2, 0.08, 2, water(), 0, 1.45, -1.3);
          const foam = clear(0xffffff, 0.8);
          [-1, 0, 1].forEach(x => { box(g, 0.6, 0.5, 0.1, 0x4a4d52, x, 1.3, 0.31); box(g, 0.5, 1.2, 0.06, foam, x, 0.6, 0.42); });
          cyl(g, 1.6, 1.6, 0.06, water(), 0, 0.04, 1.2, 24);
          steam(g, 0, 0.3, 0.8, 4, 0.3, 1.2);
        } },
      { key: "tree", name: "拉拉山神木", icon: "🌲", at: 160, labelY: 5.8,
        say: n => `${n} 張開雙手想抱住拉拉山神木，結果連十分之一都抱不到。`,
        build(g) {
          cyl(g, 0.5, 0.85, 3.2, 0x7a5a3a, 0, 1.6, 0, 9);
          [[1.8, 1.7, 3.2], [1.4, 1.5, 4.1], [1.0, 1.3, 4.9]].forEach(([r, h, y]) => cone(g, r, h, 0x2f6b3c, 0, y, 0, 9));
          const rope = tor(g, 0.72, 0.05, 0xd8333a, 0, 1.1, 0);
          rope.rotation.x = Math.PI / 2;
          [[1.3, 0.9], [-1.2, 1.0], [1.0, -1.1]].forEach(([x, z]) => { ball(g, 0.28, smooth(0xffa8b0), x, 0.28, z); ball(g, 0.1, 0x4f9a46, x + 0.1, 0.56, z, 1.6, 0.4, 1); });
        } },
    ],
  };
});
