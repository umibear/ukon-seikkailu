// ==========================================
//   MUSIIKKI
//   Jokaisella kentällä on oma kappale. Kappaleet on kirjoitettu nuotteina,
//   ja tietokone soittaa ne samalla tavalla kuin äänet (aanet.js).
//
//   Näin nuotit luetaan:
//     C5, D#5, Bb4 ...  = nuotti (kirjain + korkeus, isompi numero = korkeampi ääni)
//                         # = korotus (puoli askelta ylös), b = alennus (puoli alas)
//     -                 = edellinen nuotti jatkuu
//     .                 = tauko (hiljaista)
//     |                 = tahtiviiva, vain helpottamaan lukemista
//   Rummut:  k = potkurumpu,  s = virveli,  h = hi-hat,  . = hiljaa
//
//   Jokainen merkki on yhtä pitkä (kahdeksasosanuotti).
//   tempo = montako iskua minuutissa (isompi = nopeampi)
//   Kokeile muuttaa nuotteja ja kuuntele, miltä kuulostaa!
// ==========================================

let musiikkiPaalla = lataaMusiikkiAsetus(); // musiikin voi laittaa pois taukovalikosta

const KAPPALEET = [
  // ---------- MAAILMA 1: VIHREÄ SAARI ----------
  {
    // Kenttä 1: iloinen ja reipas
    nimi: "Vihreät kukkulat",
    tempo: 150,
    aalto: "square",
    melodia:
      "E5 . G5 . C6 - G5 . | A5 - G5 E5 C5 - D5 . | F5 . A5 . C6 - A5 G5 | G5 - - . D5 E5 F5 D5 |" +
      "E5 . G5 . C6 - E6 . | D6 C6 A5 . E5 - A5 . | F5 A5 C6 A5 F5 . E5 . | D5 - G5 - C5 - - . ",
    basso:
      "C3 . C3 G2 C3 . G2 . | A2 . A2 E2 A2 . E2 . | F2 . F2 C3 F2 . C3 . | G2 . G2 D3 G2 . D3 . ",
    rummut: "k . h . s . h . ",
  },
  {
    // Kenttä 2: rauhallinen iltakappale
    nimi: "Auringonlasku",
    tempo: 112,
    aalto: "triangle",
    melodia:
      "A4 - C5 - F5 - - E5 | D5 - - C5 A4 - - . | Bb4 - D5 - F5 - G5 - | E5 - - - C5 - - . |" +
      "A5 - G5 - F5 - C5 - | D5 - F5 - A5 - - G5 | F5 - D5 - Bb4 - D5 - | C5 - E5 - F5 - - . ",
    basso: "F2 - - - C3 - - - | D2 - - - A2 - - - | Bb1 - - - F2 - - - | C2 - - - G2 - - - ",
    rummut: "k . . h s . . h ",
  },
  {
    // Kenttä 3: kevyt ja korkea, kuin pilvien päällä
    nimi: "Pilvipolku",
    tempo: 132,
    aalto: "square",
    melodia:
      "G5 . B5 . D6 - B5 . | E6 - D6 B5 G5 - E5 . | C6 . E6 . G6 - E6 C6 | D6 - - . A5 - F#5 . |" +
      "G5 B5 D6 G6 - D6 B5 . | E6 D6 B5 G5 B5 - E5 . | C6 - B5 - A5 - G5 - | F#5 - A5 - D6 - - . ",
    basso: "G2 . D3 . G2 . D3 . | E2 . B2 . E2 . B2 . | C3 . G2 . C3 . G2 . | D3 . A2 . D3 . A2 . ",
    rummut: "k . h h s . h h ",
  },
  {
    // Kenttä 4: salaperäinen kalliokappale
    nimi: "Kalliokuilut",
    tempo: 120,
    aalto: "square",
    melodia:
      "A4 . C5 . E5 - D5 C5 | B4 - - . G4 - B4 . | C5 . A4 . F4 - A4 C5 | B4 - G#4 - E4 - - . |" +
      "E5 - A5 - G5 E5 C5 . | D5 - G5 - F5 D5 B4 . | C5 - F5 - E5 C5 A4 . | G#4 - B4 - E5 - - . ",
    basso: "A2 A2 . A2 E2 . A2 . | G2 G2 . G2 D2 . G2 . | F2 F2 . F2 C3 . F2 . | E2 E2 . E2 B1 . E2 . ",
    rummut: "k . h . s . h k ",
  },
  {
    // Kenttä 5: pomotaistelu Isäukkoa vastaan
    nimi: "Isäukon vuori",
    tempo: 160,
    aalto: "square",
    melodia:
      "D5 . D5 . F5 . D5 . | E5 . C5 . G5 - E5 . | F5 . D5 . Bb5 - A5 G5 | A5 - - . C#5 - E5 . |" +
      "D6 - A5 - F5 - D5 . | C6 - G5 - E5 - C5 . | Bb5 - F5 - D5 - Bb4 . | A4 C#5 E5 A5 - - . . ",
    basso:
      "D2 D2 D3 D2 D2 D2 D3 D2 | C2 C2 C3 C2 C2 C2 C3 C2 | Bb1 Bb1 Bb2 Bb1 Bb1 Bb1 Bb2 Bb1 | A1 A1 A2 A1 A1 A1 A2 A1 ",
    rummut: "k h s h k k s h ",
  },

  // ---------- MAAILMA 2: TULIVUORISAARI ----------
  {
    // Kenttä 6: tuhkaista ja vähän jännittävää
    nimi: "Tuhkarinne",
    tempo: 128,
    aalto: "square",
    melodia:
      "E5 . G5 . B5 - A5 G5 | E5 - - . C5 - E5 . | F#5 . A5 . D6 - C6 A5 | B5 - - . D#5 - F#5 . |" +
      "G5 - E5 - B5 - G5 . | C6 - G5 - E5 - G5 . | A5 - F#5 - D5 - F#5 . | B4 D#5 F#5 B5 - - . . ",
    basso: "E2 . E2 E3 E2 . B2 . | C2 . C2 C3 C2 . G2 . | D2 . D2 D3 D2 . A2 . | B1 . B1 B2 B1 . F#2 . ",
    rummut: "k . h . s . h h ",
  },
  {
    // Kenttä 7: basso vyöryy kuin laava
    nimi: "Laavajoki",
    tempo: 140,
    aalto: "square",
    melodia:
      "D5 - G5 - Bb5 - A5 G5 | G5 - Eb5 - - . Bb4 . | C5 - F5 - A5 - G5 F5 | F#5 - - - D5 - - . |" +
      "G5 . G5 A5 Bb5 - D6 . | C6 Bb5 G5 . Eb5 - G5 . | A5 G5 F5 . C5 - F5 . | D5 - F#5 - A5 - D6 . ",
    basso:
      "G2 D3 G3 D3 G2 D3 G3 D3 | Eb2 Bb2 Eb3 Bb2 Eb2 Bb2 Eb3 Bb2 | F2 C3 F3 C3 F2 C3 F3 C3 | D2 A2 D3 A2 D2 A2 D3 A2 ",
    rummut: "k . h k s . h . ",
  },
  {
    // Kenttä 8: marssi tykkien tahdissa
    nimi: "Tykkilinnake",
    tempo: 120,
    aalto: "square",
    melodia:
      "C5 . C5 C5 Eb5 . G5 . | Ab5 - G5 . Eb5 - C5 . | D5 . D5 D5 F5 . Bb5 . | B4 - - . D5 - G5 . |" +
      "G5 - Eb5 . C5 - G4 . | Ab4 - C5 . Eb5 - Ab5 . | F5 - D5 . Bb4 - D5 F5 | G5 - - - B4 - - . ",
    basso: "C2 . G2 . C2 . G2 . | Ab1 . Eb2 . Ab1 . Eb2 . | Bb1 . F2 . Bb1 . F2 . | G1 . D2 . G1 . D2 . ",
    rummut: "k . s s k . s s ",
  },
  {
    // Kenttä 9: hiljainen ja kaikuva luola
    nimi: "Liekkiluolat",
    tempo: 100,
    aalto: "triangle",
    melodia:
      "D5 - - - F5 - Eb5 - | D5 - - - . . . . | A4 - - - C5 - D5 - | Eb5 - D5 - C5 - - . |" +
      "F5 - - - A5 - G5 - | F5 - Eb5 - D5 - - . | C5 - D5 - Eb5 - F5 - | D5 - - - - - . . ",
    basso: "D2 - - - - - - - | Eb2 - - - - - - - | D2 - - - - - - - | C2 - - - - - - - ",
    rummut: "k . . h s . . . | k . . . . . h . ",
  },
  {
    // Kenttä 10: nopea, pitää kiirehtiä!
    nimi: "Kraatterin reuna",
    tempo: 170,
    aalto: "square",
    melodia:
      "A5 . E5 . A5 C6 B5 A5 | F5 . C5 . F5 A5 G5 F5 | E5 . G5 . C6 - B5 . | D5 - G5 - B5 - - . |" +
      "C6 B5 A5 E5 C6 B5 A5 E5 | A5 G5 F5 C5 A5 G5 F5 C5 | B5 A5 G5 D5 B5 - D6 . | E6 - - . B5 - G#5 . ",
    basso:
      "A2 A3 A2 A3 A2 A3 A2 A3 | F2 F3 F2 F3 F2 F3 F2 F3 | C2 C3 C2 C3 C2 C3 C2 C3 | G2 G3 G2 G3 G2 G3 G2 G3 |" +
      "A2 A3 A2 A3 A2 A3 A2 A3 | F2 F3 F2 F3 F2 F3 F2 F3 | G2 G3 G2 G3 G2 G3 G2 G3 | E2 E3 E2 E3 E2 E3 E2 E3 ",
    rummut: "k h s h k h s s ",
  },
  {
    // Kenttä 11: Magmamörkön pomotaistelu
    nimi: "Magmamörkön kraatteri",
    tempo: 150,
    aalto: "sawtooth",
    melodia:
      "E5 . E5 . F5 - E5 . | G5 . F5 . E5 - D5 . | E5 . E5 . G5 - A5 . | B5 - A5 - G5 - F5 . |" +
      "E6 - B5 - E6 - F6 . | E6 D6 C6 B5 A5 - G5 . | F5 - G5 - A5 - C6 . | B5 - - - F5 - E5 . ",
    basso:
      "E2 E2 E3 E2 F2 E2 E3 E2 | E2 E2 E3 E2 F2 E2 E3 E2 | C2 C2 C3 C2 C2 C2 C3 C2 | B1 B1 B2 B1 B1 B1 B2 B1 ",
    rummut: "k k s h k k s s ",
  },
];

// Kuinka kovaa kukin soitin soi (äänitehosteiden pitää kuulua musiikin päältä)
const MUSIIKIN_VOIMAKKUUS = 0.6; // koko musiikin voimakkuus: 1 = täysillä, 0.5 = puolet
const MELODIAN_VOIMAKKUUS = { square: 0.045, triangle: 0.11, sawtooth: 0.035 };
const BASSON_VOIMAKKUUS = 0.1;
const RUMPUJEN_VOIMAKKUUS = 0.05;

// ---------- NUOTTIEN LUKEMINEN ----------
// Muuttaa nuotin nimen (esim. "A4") hertseiksi. A4 = 440 Hz.
const SAVELET = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function nuotinTaajuus(nimi) {
  let savel = SAVELET[nimi[0]];
  let loput = nimi.slice(1);
  if (loput[0] === "#") savel++;
  if (loput[0] === "b") savel--;
  if (loput[0] === "#" || loput[0] === "b") loput = loput.slice(1);
  const numero = savel + (Number(loput) + 1) * 12; // MIDI-numero
  return 440 * Math.pow(2, (numero - 69) / 12);
}

// Muuttaa nuottirivin listaksi: jokaisessa kohdassa joko nuotti
// ({ taajuus, pituus }), null (ei mitään uutta) tai rummun kirjain.
function luoNuotit(teksti, rummut) {
  const merkit = teksti.split(/[\s|]+/).filter((m) => m); // välilyönnit ja | erottavat merkit
  const nuotit = [];
  let edellinen = null;
  for (const merkki of merkit) {
    if (rummut) {
      nuotit.push(merkki === "." ? null : merkki);
    } else if (merkki === "-") {
      if (edellinen) edellinen.pituus++; // edellinen nuotti jatkuu
      nuotit.push(null);
    } else if (merkki === ".") {
      edellinen = null;
      nuotit.push(null);
    } else {
      edellinen = { taajuus: nuotinTaajuus(merkki), pituus: 1 };
      nuotit.push(edellinen);
    }
  }
  return nuotit;
}

for (const kappale of KAPPALEET) {
  kappale.melodiaNuotit = luoNuotit(kappale.melodia);
  kappale.bassoNuotit = luoNuotit(kappale.basso);
  kappale.rumpuNuotit = luoNuotit(kappale.rummut, true);
}

// ---------- SOITTAMINEN ----------
const musiikki = {
  kappale: null, // mikä kappale soi
  askel: 0, // monesko kahdeksasosa on menossa
  seuraavaAika: 0, // milloin seuraava kahdeksasosa soitetaan
  vahvistin: null, // kaikki musiikki kulkee tämän kautta (sillä musiikin saa hiljaiseksi heti)
  kohina: null, // rumpujen kohinaääni
};

// Soittaa yhden nuotin musiikin vahvistimen kautta
function soitaNuotti(aalto, taajuus, alku, kesto, voimakkuus) {
  const oskillaattori = aaniKonteksti.createOscillator();
  const vahvistin = aaniKonteksti.createGain();
  vahvistin.gain.value = 0; // hiljaa ennen kuin ääni alkaa, ettei kuulu napsahdusta
  oskillaattori.type = aalto;
  oskillaattori.frequency.setValueAtTime(taajuus, alku);
  // Ääni alkaa nopeasti, hiljenee vähän ja loppuu pehmeästi (ei naksahda)
  vahvistin.gain.setValueAtTime(0, alku);
  vahvistin.gain.linearRampToValueAtTime(voimakkuus, alku + 0.01);
  vahvistin.gain.linearRampToValueAtTime(voimakkuus * 0.7, alku + Math.min(0.1, kesto * 0.5));
  vahvistin.gain.setValueAtTime(voimakkuus * 0.7, alku + kesto * 0.85);
  vahvistin.gain.linearRampToValueAtTime(0, alku + kesto);
  oskillaattori.connect(vahvistin);
  vahvistin.connect(musiikki.vahvistin);
  oskillaattori.start(alku);
  oskillaattori.stop(alku + kesto + 0.02);
}

// Rummut tehdään kohinasta (sssh) ja nopeasti laskevasta äänestä (pum)
function soitaRumpu(tyyppi, alku) {
  if (tyyppi === "k") {
    const oskillaattori = aaniKonteksti.createOscillator();
    const vahvistin = aaniKonteksti.createGain();
  vahvistin.gain.value = 0; // hiljaa ennen kuin ääni alkaa, ettei kuulu napsahdusta
    oskillaattori.type = "sine";
    oskillaattori.frequency.setValueAtTime(150, alku);
    oskillaattori.frequency.exponentialRampToValueAtTime(45, alku + 0.12);
    vahvistin.gain.setValueAtTime(RUMPUJEN_VOIMAKKUUS * 3, alku);
    vahvistin.gain.exponentialRampToValueAtTime(0.001, alku + 0.15);
    oskillaattori.connect(vahvistin);
    vahvistin.connect(musiikki.vahvistin);
    oskillaattori.start(alku);
    oskillaattori.stop(alku + 0.16);
    return;
  }
  if (!musiikki.kohina) {
    // Tehdään kerran pätkä satunnaista kohinaa
    const pituus = Math.floor(aaniKonteksti.sampleRate * 0.3);
    musiikki.kohina = aaniKonteksti.createBuffer(1, pituus, aaniKonteksti.sampleRate);
    const data = musiikki.kohina.getChannelData(0);
    for (let i = 0; i < pituus; i++) data[i] = Math.random() * 2 - 1;
  }
  const kesto = tyyppi === "s" ? 0.14 : 0.04; // virveli on pidempi kuin hi-hat
  const lahde = aaniKonteksti.createBufferSource();
  const suodin = aaniKonteksti.createBiquadFilter();
  const vahvistin = aaniKonteksti.createGain();
  vahvistin.gain.value = 0; // hiljaa ennen kuin ääni alkaa, ettei kuulu napsahdusta
  lahde.buffer = musiikki.kohina;
  suodin.type = "highpass";
  suodin.frequency.value = tyyppi === "s" ? 1200 : 7000;
  const voimakkuus = tyyppi === "s" ? RUMPUJEN_VOIMAKKUUS * 1.6 : RUMPUJEN_VOIMAKKUUS * 0.8;
  vahvistin.gain.setValueAtTime(voimakkuus, alku);
  vahvistin.gain.exponentialRampToValueAtTime(0.001, alku + kesto);
  lahde.connect(suodin);
  suodin.connect(vahvistin);
  vahvistin.connect(musiikki.vahvistin);
  lahde.start(alku);
  lahde.stop(alku + kesto);
}

// Soittaa kaikki soittimet yhdessä kohdassa kappaletta
function soitaAskel(kappale, askel, aika, askelenPituus) {
  const melodia = kappale.melodiaNuotit[askel % kappale.melodiaNuotit.length];
  if (melodia) {
    const voimakkuus = MELODIAN_VOIMAKKUUS[kappale.aalto];
    soitaNuotti(kappale.aalto, melodia.taajuus, aika, melodia.pituus * askelenPituus * 0.95, voimakkuus);
  }
  const basso = kappale.bassoNuotit[askel % kappale.bassoNuotit.length];
  if (basso) soitaNuotti("triangle", basso.taajuus, aika, basso.pituus * askelenPituus * 0.9, BASSON_VOIMAKKUUS);
  const rumpu = kappale.rumpuNuotit[askel % kappale.rumpuNuotit.length];
  if (rumpu) soitaRumpu(rumpu, aika);
}

// Kutsutaan joka ruudulla (peli.js). Musiikki soi vain, kun pelataan.
// Tauon jälkeen kappale jatkuu siitä, mihin se jäi.
function paivitaMusiikki() {
  const soi =
    tila === "peli" &&
    aanetPaalla &&
    musiikkiPaalla &&
    aaniKonteksti &&
    aaniKonteksti.state === "running" &&
    kenttaNumero < KAPPALEET.length;
  if (!soi) {
    hiljennaMusiikki();
    return;
  }
  const kappale = KAPPALEET[kenttaNumero];
  if (musiikki.kappale !== kappale) {
    // uusi kenttä: kappale alkaa alusta
    musiikki.kappale = kappale;
    musiikki.askel = 0;
  }
  const nyt = aaniKonteksti.currentTime;
  if (!musiikki.vahvistin) {
    luoMusiikinVahvistin();
    musiikki.seuraavaAika = nyt + 0.05;
  }
  // Jos selain on ollut jumissa (esim. välilehti piilossa), ei soiteta kaikkea myöhästynyttä kerralla
  if (musiikki.seuraavaAika < nyt) musiikki.seuraavaAika = nyt + 0.05;

  // Soitetaan nuotit vähän etukäteen, ettei musiikki nyki
  const askelenPituus = 60 / kappale.tempo / 2;
  while (musiikki.seuraavaAika < nyt + 0.2) {
    soitaAskel(kappale, musiikki.askel, musiikki.seuraavaAika, askelenPituus);
    musiikki.askel++;
    musiikki.seuraavaAika += askelenPituus;
  }
}

// Kaikki musiikki kulkee tämän vahvistimen kautta kaiuttimiin
function luoMusiikinVahvistin() {
  musiikki.vahvistin = aaniKonteksti.createGain();
  musiikki.vahvistin.gain.value = MUSIIKIN_VOIMAKKUUS;
  musiikki.vahvistin.connect(aaniKonteksti.destination);
}

// Musiikki hiljenee heti (jo ajastetut nuotit katkaistaan)
function hiljennaMusiikki() {
  if (!musiikki.vahvistin) return;
  musiikki.vahvistin.disconnect();
  musiikki.vahvistin = null;
}

// Kun kenttä alkaa, kappale alkaa alusta
function aloitaMusiikkiAlusta() {
  hiljennaMusiikki();
  musiikki.kappale = null;
}

function vaihdaMusiikki() {
  musiikkiPaalla = !musiikkiPaalla;
  try {
    localStorage.setItem("ukonSeikkailuMusiikki", musiikkiPaalla ? "1" : "0");
  } catch (virhe) {
    // ei haittaa, valinta vain ei tallennu
  }
}

function lataaMusiikkiAsetus() {
  try {
    return localStorage.getItem("ukonSeikkailuMusiikki") !== "0";
  } catch (virhe) {
    return true;
  }
}
