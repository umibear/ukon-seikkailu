// ==========================================
//   ÄÄNET
//   Äänet tehdään suoraan JavaScriptillä (Web Audio), joten
//   äänitiedostoja ei tarvita. Ne kuulostavat vanhoilta pelikoneilta!
// ==========================================

let aaniKonteksti = null;
let aanetPaalla = true;

// Selain sallii äänet vasta, kun käyttäjä on painanut jotain nappia.
// Tätä kutsutaan aina, kun nappia painetaan.
function kaynnistaAanet() {
  if (!aaniKonteksti) aaniKonteksti = new AudioContext();
  if (aaniKonteksti.state === "suspended") aaniKonteksti.resume();
}

// Soittaa yhden piippauksen.
// aalto       = äänen tyyppi: "square" (8-bit), "triangle" (pehmeä),
//               "sawtooth" (rätisevä) tai "sine" (puhdas)
// alkuKorkeus = äänen korkeus alussa (hertseinä, iso luku = korkea ääni)
// loppuKorkeus= äänen korkeus lopussa
// kesto       = kuinka pitkä ääni on sekunteina
// voimakkuus  = kuinka kova ääni on (0.1 on sopiva)
// viive       = kuinka monen sekunnin päästä ääni alkaa
function piippaus(aalto, alkuKorkeus, loppuKorkeus, kesto, voimakkuus, viive) {
  if (!aaniKonteksti || !aanetPaalla) return;
  if (viive === undefined) viive = 0;

  const alku = aaniKonteksti.currentTime + viive;
  const oskillaattori = aaniKonteksti.createOscillator(); // tekee äänen
  const vahvistin = aaniKonteksti.createGain(); // säätää voimakkuutta

  oskillaattori.type = aalto;
  oskillaattori.frequency.setValueAtTime(alkuKorkeus, alku);
  oskillaattori.frequency.exponentialRampToValueAtTime(loppuKorkeus, alku + kesto);

  // Ääni alkaa kovana ja hiljenee loppua kohti
  vahvistin.gain.setValueAtTime(voimakkuus, alku);
  vahvistin.gain.exponentialRampToValueAtTime(0.001, alku + kesto);

  oskillaattori.connect(vahvistin);
  vahvistin.connect(aaniKonteksti.destination); // destination = kaiuttimet
  oskillaattori.start(alku);
  oskillaattori.stop(alku + kesto);
}

// Soittaa sävelmän: monta piippausta peräkkäin
function savelma(aalto, korkeudet, savelenPituus, voimakkuus) {
  for (let i = 0; i < korkeudet.length; i++) {
    const k = korkeudet[i];
    piippaus(aalto, k, k, savelenPituus * 1.5, voimakkuus, i * savelenPituus);
  }
}

// Pelin kaikki äänet. Kokeile muuttaa lukuja!
const aanet = {
  hyppy() {
    piippaus("square", 300, 600, 0.15, 0.08);
  },
  seinahyppy() {
    // vähän korkeampi ja nopeampi kuin tavallinen hyppy
    piippaus("square", 450, 900, 0.12, 0.08);
    piippaus("triangle", 150, 100, 0.06, 0.1);
  },
  sydan() {
    savelma("triangle", [523, 659, 784, 1047], 0.08, 0.2);
  },
  liekki() {
    // liekkisuihku syttyy: suhiseva "fuush"
    piippaus("sawtooth", 120, 60, 0.35, 0.06);
    piippaus("square", 90, 50, 0.3, 0.04);
  },
  tykki() {
    // tykki ampuu: matala "pum"
    piippaus("square", 160, 40, 0.2, 0.12);
  },
  sammuu() {
    // Magmamörkö jäähtyy: sihahdus
    piippaus("sawtooth", 900, 200, 0.4, 0.04);
  },
  salaisuus() {
    // salainen paikka löytyi! Salaperäinen sävelmä
    savelma("square", [392, 370, 311, 220, 208, 330, 415, 523], 0.07, 0.06);
  },
  kolikko() {
    piippaus("square", 990, 990, 0.08, 0.08);
    piippaus("square", 1320, 1320, 0.25, 0.08, 0.08);
  },
  jousi() {
    piippaus("square", 200, 900, 0.3, 0.1);
  },
  putoaa() {
    piippaus("triangle", 300, 80, 0.4, 0.12);
  },
  tyhja() {
    // tulimittari on tyhjä: pieni "pfft"
    piippaus("square", 140, 90, 0.08, 0.05);
  },
  tulipallo() {
    piippaus("sawtooth", 900, 200, 0.15, 0.06);
  },
  litistys() {
    piippaus("square", 400, 60, 0.2, 0.12);
  },
  palaminen() {
    piippaus("sawtooth", 300, 40, 0.35, 0.12);
  },
  osuma() {
    piippaus("sawtooth", 500, 60, 0.5, 0.15);
  },
  valitallennus() {
    savelma("triangle", [523, 659, 784], 0.1, 0.2);
  },
  kenttaValmis() {
    savelma("square", [523, 659, 784, 1047, 784, 1047], 0.12, 0.08);
  },
  laskuri() {
    piippaus("square", 660, 660, 0.06, 0.06);
  },
  ennatys() {
    savelma("square", [784, 988, 1175, 1568], 0.1, 0.08);
  },
  havio() {
    savelma("triangle", [392, 330, 262, 196], 0.25, 0.2);
  },

  // Pomon äänet
  pomoHeraa() {
    savelma("sawtooth", [110, 98, 82, 65], 0.18, 0.12);
  },
  ryntays() {
    piippaus("sawtooth", 80, 300, 0.4, 0.12);
  },
  pomoHyppy() {
    piippaus("square", 120, 400, 0.3, 0.1);
  },
  maanjaristys() {
    piippaus("sawtooth", 90, 30, 0.6, 0.18);
    piippaus("square", 60, 25, 0.5, 0.12, 0.05);
  },
  heitto() {
    piippaus("triangle", 500, 200, 0.15, 0.12);
  },
  pomoOsuma() {
    piippaus("square", 200, 50, 0.3, 0.15);
    piippaus("sawtooth", 150, 40, 0.3, 0.08, 0.05);
  },
  pomoKaatui() {
    piippaus("sawtooth", 300, 30, 1.0, 0.15);
    savelma("square", [523, 659, 784, 1047, 1319, 1568], 0.12, 0.08);
  },
};
