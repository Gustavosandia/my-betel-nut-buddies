// 花蓮太魯閣城：太魯閣峽谷、長春祠與金針花海
// 地標用 js/cities/kit.js 的積木工具蓋；這個檔案要排在 kit.js 後面載入
// 方位（at）用羅盤角度：0 是北、90 是東。地標的正面（+z）會朝向島中央的廣場
window.HeartKit.county("hualien", K => {
  const { T, m, smooth, water, clear, rnd, box, cyl, cone, ball, arch, inst, dot, onDome, anim, steam, eave } = K;
  return {
    title: "花蓮太魯閣城", icon: "🏞️", subtitle: "太魯閣峽谷、長春祠與金針花海", ground: 0x7fb866, tree: "pine",
    // 稻田：3 片，金黃稻穗的比例 0.25
    paddies: 3, paddyGold: 0.25,
    events: [
      () => "立霧溪的水聲在太魯閣峽谷裡迴盪。",
      () => "六十石山的金針花開了，整座山頭變成橘黃色。",
      () => "花蓮的麻糬剛搗好，Q 到會牽絲。",
    ],
    landmarks: [
      { key: "shrine", name: "長春祠", icon: "⛩️", at: 60, labelY: 4.6,
        say: n => `${n} 走到長春祠，看瀑布從祠堂下方的山壁傾瀉而下。`,
        build(g) {
          const rock = 0x9a958a;
          box(g, 4.2, 2.6, 1.4, rock, 0, 1.3, -0.9);
          box(g, 3.0, 1.6, 1.2, 0x8a857a, 0.4, 3.2, -1.0);
          ball(g, 1, 0x4f8a52, -1.2, 3.0, -0.9, 1.6, 0.6, 1);
          ball(g, 1, 0x4f8a52, 0.6, 4.1, -1.0, 1.5, 0.5, 0.9);
          const sh = new T.Group();
          box(sh, 1.2, 0.5, 0.6, 0xf7f5ef, 0, 0.25, 0);
          for (let i = 0; i < 4; i++) cyl(sh, 0.04, 0.04, 0.5, 0xc8372d, -0.5 + i * 0.33, 0.25, 0.32, 6);
          eave(sh, 1.6, 1.0, 0xe2a838, 0, 0.5, 0, 0.4);
          sh.position.set(0, 2.6, -0.3);
          g.add(sh);
          for (let i = 0; i < 5; i++) { box(g, 0.1, 0.35, 0.1, 0xf7f5ef, -1.6 + i * 0.35, 2.2, -0.15); }
          box(g, 1.6, 0.06, 0.2, 0xf7f5ef, -0.9, 2.4, -0.15);
          const fall = clear(0xffffff, 0.85);
          const w1 = box(g, 0.5, 2.3, 0.08, fall, 0, 1.25, -0.16);
          const w2 = box(g, 0.25, 2.0, 0.08, fall, 0.5, 1.1, -0.17);
          cyl(g, 1.2, 1.2, 0.05, water(), 0.2, 0.04, 0.6, 20);
          steam(g, 0.2, 0.2, 0.3, 3, 0.25, 0.9);
          anim((dt, t) => { w1.scale.x = 1 + Math.sin(t * 6) * 0.1; w2.scale.x = 1 + Math.cos(t * 5) * 0.15; });
        } },
      { key: "mochi", name: "花蓮麻糬", icon: "🍡", at: 110, labelY: 2.6,
        say: n => `${n} 幫忙搗麻糬，搗了三下就手痠，還是負責吃比較好。`,
        build(g) {
          cyl(g, 1.3, 1.1, 0.12, smooth(0xfbfaf4), -0.8, 0.06, 0.4, 24);
          [[-1.2, 0.3, 0xfdfdf5], [-0.5, 0.2, 0xffc1d6], [-0.8, 0.85, 0xbfe0a0]].forEach(([x, z, c]) => ball(g, 0.4, smooth(c), x, 0.32, z, 1, 0.65, 1));
          ball(g, 0.18, smooth(0x7a2f2f), -0.8, 0.42, 0.85, 1, 0.5, 1);
          cyl(g, 0.6, 0.5, 0.8, 0x8a5a3b, 1.2, 0.4, -0.2, 14);
          cyl(g, 0.5, 0.5, 0.06, smooth(0xfdfdf5), 1.2, 0.78, -0.2, 14);
          const mallet = new T.Group();
          cyl(mallet, 0.05, 0.05, 1.6, 0x9a6b3e, 0, 0.8, 0, 6);
          cyl(mallet, 0.16, 0.16, 0.6, 0x9a6b3e, 0, 1.6, 0, 10).rotation.z = Math.PI / 2;
          mallet.position.set(2.3, 0.3, -0.2);
          g.add(mallet);
          anim((dt, t) => { mallet.rotation.z = 0.25 + Math.abs(Math.sin(t * 3)) * 0.75; });
        } },
      { key: "taroko", name: "太魯閣峽谷", icon: "🏞️", at: 250, labelY: 5.8,
        say: n => `${n} 戴著安全帽走進太魯閣，抬頭只看得見一線天。`,
        build(g) {
          const marble = [0xcfcac0, 0xbdb8ae, 0xdad6cc];
          [-1, 1].forEach(s => {
            [[1.6, 2.2, 0, 3.2], [1.3, 1.8, 1.9, 3.0], [1.0, 1.6, 3.5, 2.6]].forEach(([w, h, y, d], k) => box(g, w, h, d, marble[(k + (s > 0 ? 1 : 0)) % 3], s * (0.7 + w / 2 + k * 0.12), y + h / 2, -0.2 + k * 0.1 * s));
            ball(g, 1, 0x4f8a52, s * 1.7, 5.1, -0.2, 1.1, 0.4, 1.4);
            for (let k = 0; k < 4; k++) box(g, 0.04, rnd(1, 2.4), 3.0, 0x8a857a, s * (0.71 + k * 0.01), 1.5 + k * 0.6, -0.2);
          });
          box(g, 1.4, 0.06, 3.6, m(0x4fb8a8, { flatShading: false, roughness: 0.2 }), 0, 0.04, -0.1);
          box(g, 1.5, 0.12, 0.35, 0xc8372d, 0, 1.0, 0.9);
          [-0.15, 0.15].forEach(z => box(g, 1.5, 0.2, 0.03, 0xc8372d, 0, 1.16, 0.9 + z));
          box(g, 0.25, 0.1, 3.2, 0x8a8f96, -0.82, 1.9, -0.2);
          arch(g, 0.3, 0.05, 0x2b2b2b, -0.7, 1.95, 1.41).rotation.y = 0;
          inst(g, dot(0.16), 0xe9e6de, Array.from({ length: 10 }, () => [rnd(-0.5, 0.5), 0.1, rnd(-1.6, 1.5)]));
        } },
      { key: "daylily", name: "六十石山金針花", icon: "🌼", at: 310, labelY: 3.4,
        say: n => `${n} 站在六十石山的金針花海裡，整個人都被染成橘色。`,
        build(g) {
          ball(g, 1, 0x6fae5a, 0, 0, 0, 2.7, 1.6, 2.1);
          inst(g, dot(0.1), smooth(0xf2a01a), onDome(110, 2.72, 1.62, 2.12, 0.12));
          [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(([x, z]) => cyl(g, 0.04, 0.04, 0.7, 0x8a5a3b, x, 1.9, z, 5));
          cone(g, 0.6, 0.4, 0xc8372d, 0, 2.45, 0, 6);
        } },
    ],
  };
});
