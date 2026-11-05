// Lataa pelin Node.js:ään ilman selainta (testejä ja bottia varten)
const fs = require("fs"), vm = require("vm"), path = require("path");
const D = path.join(__dirname, "..") + "/";
module.exports = function lataa(muisti) {
  const kuuntelijat = {};
  const ctxStub = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ({ addColorStop() {} })), set: (t, k, v) => ((t[k] = v), true) });
  const canvasStub = () => ({ width: 800, height: 450, getContext: () => ctxStub, addEventListener() {} });
  const g = {
    console, Math, structuredClone, performance: { now: () => 0 },
    document: { getElementById: canvasStub, createElement: canvasStub, addEventListener() {} },
    window: { addEventListener() {} }, addEventListener: (tyyppi, f) => (kuuntelijat[tyyppi] = kuuntelijat[tyyppi] || []).push(f),
    Image: function () { this.width = 64; this.height = 32; },
    AudioContext: function () {}, localStorage: muisti || { getItem: () => null, setItem() {}, removeItem() {} },
    requestAnimationFrame() {},
    matchMedia: () => ({ matches: false }), location: { search: "" }, dispatchEvent() {}, KeyboardEvent: function () {},
  };
  vm.createContext(g);
  // Sama järjestys kuin index.html-tiedostossa
  const html = fs.readFileSync(D + "index.html", "utf8");
  const tiedostot = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  let koodi = "";
  for (const f of tiedostot) koodi += fs.readFileSync(D + f, "utf8") + "\n";
  koodi += `;globalThis.T = { aloitaKentta, paivita, piirra, napit, KENTAT, pelaaja1, pelaaja2,
    ammu: (pl) => ammu(pl || pelaaja1),
    kaksinpeli: (k) => { kaksinpeli = k; pelaajat = k ? [pelaaja1, pelaaja2] : [pelaaja1]; },
    get kentta(){return kentta}, get tila(){return tila}, ev: (s) => eval(s) };
  T.SNAP = () => structuredClone({ kentta, p1: { ...pelaaja1 }, p2: { ...pelaaja2 }, tulipallot, kameraX, tila, kentanKolikot, kentanVihut, kentanAika, pisteet, tarina, kaksinpeli });
  T.RESTORE = (s0) => { const s = structuredClone(s0); kentta = s.kentta; Object.assign(pelaaja1, s.p1); Object.assign(pelaaja2, s.p2);
    tulipallot = s.tulipallot; kameraX = s.kameraX; tila = s.tila; kentanKolikot = s.kentanKolikot; kentanVihut = s.kentanVihut; kentanAika = s.kentanAika;
    pisteet = s.pisteet; tarina = s.tarina; kaksinpeli = s.kaksinpeli; pelaajat = kaksinpeli ? [pelaaja1, pelaaja2] : [pelaaja1]; pelaaja = pelaaja1;
    hiukkaset = []; tekstit = []; for (const k in napit) delete napit[k]; };`;
  vm.runInContext(koodi, g);
  g.T.ev("aanetPaalla = false"); // testeissä ei ole kaiuttimia
  // Painaa näppäintä kuin oikea näppäimistö (keydown ja keyup)
  g.T.paina = (koodi, lisat = {}) => {
    for (const tyyppi of ["keydown", "keyup"])
      for (const f of kuuntelijat[tyyppi] || []) f({ code: koodi, repeat: false, shiftKey: false, preventDefault() {}, ...lisat });
  };
  return g.T;
};
