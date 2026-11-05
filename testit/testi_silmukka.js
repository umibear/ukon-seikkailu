// Testaa, että peli piirtää tasaiset ~60 ruutua sekunnissa myös nopeilla (120 Hz) näytöillä
// Käyttö: node testit/testi_silmukka.js
const lataa = require("./peli_node.js");
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };

function kokeile(hz) {
  const T = lataa();
  T.ev("piirtoja = 0; const alkup = piirra; piirra = (a) => { piirtoja++; alkup(a); }");
  T.ev("aloitaPeli(); aloitaKentta(0); tila = 'peli'");
  const vali = 1000 / hz;
  let aika = 1000;
  for (let i = 0; i < hz * 3; i++) { aika += vali; T.ev("silmukka(" + aika + ")"); } // 3 sekuntia lämmittelyä
  T.ev("piirtoja = 0");
  const x0 = T.ev("kentanAika");
  for (let i = 0; i < hz * 2; i++) { aika += vali; T.ev("silmukka(" + aika + ")"); } // mitataan 2 sekuntia
  return { fps: T.ev("piirtoja") / 2, kello: T.ev("kentanAika") - x0 };
}

for (const [hz, min, max] of [[60, 59, 61], [90, 89, 91], [120, 59, 61], [144, 71, 73]]) {
  const t = kokeile(hz);
  tarkista(t.fps >= min && t.fps <= max, hz + " Hz näyttö: peli piirtää " + t.fps + " ruutua sekunnissa");
  tarkista(Math.abs(t.kello - 2) < 0.05, hz + " Hz näyttö: pelin kello käy oikeaa aikaa (" + t.kello.toFixed(2) + " s / 2 s)");
}

// F3 laittaa FPS-mittarin päälle ja pois, ja valinta muistetaan
{
  const data = {};
  const muisti = { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => (data[k] = String(v)), removeItem: (k) => delete data[k] };
  let T = lataa(muisti);
  tarkista(T.ev("naytaFps") === false, "FPS-mittari on aluksi pois");
  T.paina("F3");
  tarkista(T.ev("naytaFps") === true, "F3 laittaa FPS-mittarin päälle");
  T = lataa(muisti);
  tarkista(T.ev("naytaFps") === true, "FPS-mittari muistetaan, kun sivu ladataan uudestaan");
  T.paina("F3");
  tarkista(T.ev("naytaFps") === false, "F3 uudestaan laittaa sen pois");
  console.log("\n" + ok + " ok, " + vika + " vikaa");
}
