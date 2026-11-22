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
  if (!aaniKonteksti) {
    // Vanhoissa iPhoneissa nimi on webkitAudioContext. Jos selain ei osaa
    // ääniä ollenkaan, peli toimii silti (ilman ääniä).
    const Aanet = window.AudioContext || window.webkitAudioContext;
    if (!Aanet) return;
    aaniKonteksti = new Aanet();
  }
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
  vahvistin.gain.value = 0; // hiljaa ennen kuin ääni alkaa, ettei kuulu napsahdusta

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

  // ---------- PAKKASSAAREN ÄÄNET ----------
  sulaa() {
    // jää sulaa: kirkas helinä, joka valuu alas
    piippaus("triangle", 1400, 500, 0.25, 0.08);
    piippaus("sine", 900, 300, 0.3, 0.06, 0.05);
  },
  nuotio() {
    // lämmin nuotio: iloinen pieni sävelmä
    savelma("triangle", [392, 494, 587], 0.07, 0.07);
  },
  tuuli() {
    // tuulenpuuska: matala humahdus
    piippaus("sawtooth", 120, 260, 0.5, 0.035);
    piippaus("sine", 300, 180, 0.6, 0.04, 0.1);
  },
  puikkoVaroitus() {
    // jääpuikko irtoaa: pieni naksahdus
    piippaus("square", 1500, 1100, 0.08, 0.05);
    piippaus("square", 1300, 900, 0.08, 0.05, 0.1);
  },
  puikkoRikki() {
    // jääpuikko hajoaa: kilinää
    piippaus("triangle", 1800, 700, 0.12, 0.07);
    piippaus("triangle", 1300, 500, 0.12, 0.05, 0.05);
  },
  loiskis() {
    // ukko putosi hyiseen veteen
    piippaus("sine", 500, 90, 0.35, 0.14);
    piippaus("triangle", 900, 200, 0.2, 0.06, 0.05);
  },
  pingviini() {
    // pingviini huomaa ukon: "kvaak!"
    piippaus("square", 520, 700, 0.09, 0.07);
    piippaus("square", 700, 480, 0.12, 0.07, 0.09);
  },
  pollo() {
    // pöllö huhuilee ennen syöksyä: "huu-huu"
    piippaus("sine", 420, 380, 0.14, 0.12);
    piippaus("sine", 420, 340, 0.2, 0.12, 0.18);
  },
  puhallus() {
    // Pakkasukko puhaltaa hyistä viimaa
    piippaus("sawtooth", 500, 150, 0.9, 0.05);
    piippaus("sine", 1200, 400, 0.9, 0.04);
  },
  kova() {
    // kilahdus: jääpanssari on liian kova
    piippaus("square", 1100, 900, 0.07, 0.08);
    piippaus("triangle", 1600, 1500, 0.1, 0.06, 0.03);
  },
  jaatyy() {
    // jää jäätyy takaisin: nouseva helinä
    piippaus("triangle", 500, 1500, 0.3, 0.07);
  },

  // ---------- VAIKEAN TASON ÄÄNET ----------
  liaani() {
    // ukko tarttuu liaaniin: pieni "viuh"
    piippaus("triangle", 300, 520, 0.12, 0.09);
  },
  sihina() {
    // lanka tai tynnyri syttyi: sihisee
    piippaus("sawtooth", 1800, 1200, 0.35, 0.03);
    piippaus("square", 2400, 1500, 0.3, 0.02, 0.05);
  },
  rajahdys() {
    // PAM! Matala jyrähdys
    piippaus("sawtooth", 200, 25, 0.7, 0.2);
    piippaus("square", 110, 20, 0.6, 0.16, 0.03);
    piippaus("triangle", 600, 60, 0.25, 0.1);
  },
  tulva() {
    // laava alkaa nousta: uhkaava murina
    piippaus("sawtooth", 50, 110, 1.2, 0.12);
    piippaus("square", 40, 80, 1.2, 0.08, 0.1);
  },
  kohme() {
    // ukko on kohmeessa: hampaat kalisevat
    for (let i = 0; i < 5; i++) piippaus("square", 900, 700, 0.04, 0.05, i * 0.07);
  },
};
