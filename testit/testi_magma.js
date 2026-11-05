// Testaa, ettei Magmamörkö satuta heti, kun sen päälle on hypätty
// Käyttö: node testit/testi_magma.js
const T = require("./peli_node.js")();
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
const pl = T.pelaaja1;
T.kaksinpeli(false);

// Odotetaan, että mörkö jäähtyy kohdassa bossX, ja hypätään sen päälle kohdassa siirto
function kokeile(bossX, siirto, napit) {
  T.ev("aloitaKentta(10)");
  const p = T.kentta.pomo;
  pl.x = 1700; pl.y = 370;
  for (let i = 0; i < 60; i++) T.paivita(1);
  for (let i = 0; i < 2000 && p.tila !== "jaahtyy"; i++) { T.paivita(1); pl.suojaAika = 999; pl.x = 1550; pl.y = 370; p.x = bossX; }
  T.ev("kentta.pomo.meteorit = []; kentta.pomo.geysirit = []; kentta.pomo.tulikuulat = [];");
  pl.suojaAika = 0; pl.elamat = 3;
  pl.x = p.x + siirto; pl.y = p.y - 45; pl.vy = 5; pl.edellinenY = p.y - 50; pl.alusta = null; pl.maassa = false; pl.hyppyNappiEnnen = true;
  for (const k in T.napit) delete T.napit[k];
  Object.assign(T.napit, napit);
  const e0 = p.elamat;
  for (let i = 0; i < 4; i++) T.paivita(1);
  const osui = p.elamat < e0;
  // pelataan 90 ruutua: ehtiikö mörkö satuttaa?
  for (let i = 0; i < 90; i++) { T.paivita(1); if (i === 30) for (const k in T.napit) delete T.napit[k]; }
  return { osui, elamat: pl.elamat, tila: p.tila, etaisyys: Math.round(pl.x + 10 - (p.x + p.leveys / 2)) };
}
const p0 = (() => { T.ev("aloitaKentta(10)"); return T.kentta.pomo; })();
let ohi = 0; const osumia = {};
const paikat = { "keskellä areenaa": 1900, "vasemmassa reunassa": p0.vasen, "oikeassa reunassa": p0.oikea };
for (const [nimi, bx] of Object.entries(paikat)) {
  for (const siirto of [-8, 10, 32, 54, 72]) {
    for (const [nNimi, napit] of [["ei nappeja", {}], ["hyppy pohjassa", { ArrowUp: true }], ["oikea pohjassa", { ArrowRight: true }], ["vasen pohjassa", { ArrowLeft: true }]]) {
      const t = kokeile(bx, siirto, napit);
      if (!t.osui) { ohi++; continue; } // ukko laskeutui sivutasolle eikä osunut mörköön
      osumia[nimi] = (osumia[nimi] || 0) + 1;
      tarkista(t.elamat === 3, `${nimi}, ukko kohdassa ${siirto}, ${nNimi}: elämät ${t.elamat}, ukko ${t.etaisyys} px mörön keskeltä`);
    }
  }
}
for (const n of Object.keys(paikat)) tarkista(osumia[n] >= 8, n + ": " + (osumia[n] || 0) + " hyppyä osui mörköön");
console.log("\n" + ok + " ok, " + vika + " vikaa");
