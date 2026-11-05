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

// Kännykkä vaihtaa näytön nopeutta kesken pelin (One Plus tekee näin).
// Peli ei saa pudota 30 ruutuun eikä nykiä, kun nopeus vaihtuu.
{
  const T = lataa();
  T.ev("piirtoAjat = []; const alkup = piirra; piirra = (a) => { piirtoAjat.push(a); alkup(a); }");
  T.ev("aloitaPeli(); aloitaKentta(0); tila = 'peli'");
  let aika = 1000;
  const x0 = T.ev("kentanAika");
  const jaksot = [120, 60, 120, 90, 60, 90, 120, 60, 144, 60, 120, 90]; // jokainen puoli sekuntia
  const rajat = []; // jokaisen jakson alku ja näytön nopeus
  for (const hz of jaksot) {
    rajat.push([aika, hz]);
    for (let i = 0; i < hz / 2; i++) { aika += 1000 / hz; T.ev("silmukka(" + aika + ")"); }
  }
  const ajat = T.ev("piirtoAjat");
  let huonoja = 0, pisin = 0;
  for (let i = 1; i < ajat.length; i++) {
    const vali = ajat[i] - ajat[i - 1];
    pisin = Math.max(pisin, vali);
    // Kuinka pitkä väli saa olla: 60 Hz näytöllä 16,7 ms, nopeammilla enintään 16,7 ms.
    // Vaihtohetkellä sallitaan yksi vanha + yksi uusi väli (enintään 25 ms).
    if (vali > 25.1) huonoja++;
  }
  const kello = T.ev("kentanAika") - x0;
  const fps = ajat.length / ((aika - 1000) / 1000);
  tarkista(huonoja === 0, "Nopeus vaihtuu kesken pelin: ei pitkiä taukoja piirtämisessä (pisin " + pisin.toFixed(1) + " ms)");
  tarkista(fps >= 59, "Nopeus vaihtuu kesken pelin: vähintään 60 ruutua sekunnissa (" + fps.toFixed(1) + ")");
  tarkista(Math.abs(kello - (aika - 1000) / 1000) < 0.05, "Nopeus vaihtuu kesken pelin: pelin kello käy oikeaa aikaa");
  // 120 Hz jaksoissa joka toinen kutsu piirretään (ei 30 ruutua sekunnissa)
  let sata20ok = true;
  for (let j = 0; j < rajat.length; j++) {
    if (rajat[j][1] !== 120) continue;
    const alku = rajat[j][0] + 20, loppu = j + 1 < rajat.length ? rajat[j + 1][0] : aika;
    const maara = ajat.filter((a) => a > alku && a <= loppu).length;
    const odotettu = ((loppu - alku) / 1000) * 60;
    if (Math.abs(maara - odotettu) > 2) sata20ok = false;
  }
  tarkista(sata20ok, "120 Hz jaksoissa piirretään heti 60 ruutua sekunnissa");
}

// FPS-mittari näyttää, kuinka nopea näyttö oikeasti on
{
  const T = lataa();
  T.ev("aloitaPeli(); aloitaKentta(0); tila = 'peli'; naytaFps = true");
  let aika = 1000;
  for (let i = 0; i < 120 * 2.5; i++) { aika += 1000 / 120; T.ev("silmukka(" + aika + ")"); }
  const teksti = T.ev("fpsMittari.teksti");
  tarkista(/^60 fps .* näyttö 120 Hz$/.test(teksti), "120 Hz näytöllä mittari näyttää: " + teksti);
  for (let i = 0; i < 60 * 2.5; i++) { aika += 1000 / 60; T.ev("silmukka(" + aika + ")"); }
  const teksti2 = T.ev("fpsMittari.teksti");
  tarkista(/^60 fps .* näyttö 60 Hz$/.test(teksti2), "Kun näyttö hidastuu 60 Hz:iin, mittari näyttää: " + teksti2);
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
