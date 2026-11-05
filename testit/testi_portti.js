// Testaa, ettei pomon areenalta pääse pakoon hyppäämällä portin yli
// (esim. pomppimalla Isäukon pään päältä). Käyttö: node testit/testi_portti.js
const T = require("./peli_node.js")();
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
const p = T.pelaaja1;
const tyhjenna = () => { for (const k in T.napit) delete T.napit[k]; };

const pomoKentat = T.KENTAT.map((k, i) => [k(), i]).filter(([k]) => k.pomo && k.pomo.portti);
for (const [k, numero] of pomoKentat) {
  const nimi = k.nimi;
  T.kaksinpeli(false);
  T.ev(`aloitaKentta(${numero})`);
  for (let i = 0; i < 30; i++) T.paivita(1);
  p.x = k.pomo.alue + 20; // areenalle: pomo herää ja portti sulkeutuu
  for (let i = 0; i < 5; i++) T.paivita(1);
  tarkista(T.ev("porttiKiinni()"), nimi + ": portti sulkeutuu, kun pomo herää");
  const portti = T.kentta.pomo.portti;
  const seina = portti.x + portti.leveys;

  // Hypätään portin vieressä eri korkeuksilta vasemmalle (myös ruudun yläreunan yli)
  for (const korkeus of [300, 200, 100, 0, -150]) {
    tyhjenna();
    p.elamat = 3;
    p.suojaAika = 9999; // pomo ja kivet eivät satuta testissä
    p.odotaNostoa = false;
    p.vx = 0;
    T.ev("pomo = kentta.pomo; if (pomo) { pomo.tila = 'kavelee'; pomo.ajastin = 9999; pomo.x = pomo.oikea - pomo.leveys; }");
    p.x = seina + 15;
    p.y = korkeus;
    p.vy = -16;
    T.napit.ArrowLeft = true;
    for (let i = 0; i < 150; i++) T.paivita(1);
    tarkista(p.elamat === 3 && p.x >= seina - 1, nimi + ": hyppy korkeudelta " + korkeus + " ei vie portin yli (x " + Math.round(p.x) + ", seinä " + seina + ")");
  }
  tyhjenna();
}
console.log("\n" + ok + " ok, " + vika + " vikaa");
process.exitCode = vika ? 1 : 0;
