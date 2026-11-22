// ==========================================
//   OMAT KENTÄT
//   Kenttäpajassa (paja.js) voi rakentaa omia kenttiä. Tässä tiedostossa on:
//   - PALIKAT: mitä kenttään voi laittaa
//   - oma kenttä on RUUDUKKO: jokaisessa ruudussa on korkeintaan yksi palikka
//   - omaKentaksi: muuttaa ruudukon oikeaksi kentäksi, jota peli osaa pelata
//   - pakkaaKentta / puraKentta: kenttä lyhyeksi tekstiksi ja takaisin
//     (teksti tallennetaan selaimen muistiin ja siitä tehdään jakolinkki)
// ==========================================

const RUUTU = 40; // yhden ruudun koko pikseleinä
const RIVEJA = 11; // rivit 0-10. Rivi 0 on ylin ja rivi 10 alin (maan taso).
const RIVIN_YLA = 10; // ylimmän rivin yläreuna ruudulla (silloin rivi 10 alkaa kohdasta 410)
const ALIN_RIVI = RIVEJA - 1;
const SARAKKEITA_MAX = 250; // kuinka pitkä kenttä voi olla (250 ruutua = 10 000 pikseliä)
const OMIA_KENTTIA_MAX = 8; // montako omaa kenttää mahtuu Omalle saarelle
const OMIEN_NIMI = "ukonSeikkailuOmatKentat"; // tällä nimellä kentät ovat selaimen muistissa
const NIMEN_PITUUS = 24; // kentän nimessä saa olla näin monta merkkiä

// Jokaisella palikalla on yhden merkin tunnus. Se tallennetaan ruudukkoon.
//   maalattava = sormea voi vetää ja palikoita tulee monta peräkkäin
//   lattialle  = palikka putoaa lähimmän maan päälle
//   pohjalle   = palikka menee aina alimmalle riville (laava ja vesi)
//   ainoa      = näitä voi olla kentässä vain yksi
const PALIKAT = {
  // --- Kaikissa maailmoissa ---
  M: { nimi: "Maa", maalattava: true },
  T: { nimi: "Taso", maalattava: true },
  P: { nimi: "Putoava taso", maalattava: true },
  K: { nimi: "Kolikko", maalattava: true },
  S: { nimi: "Sydän" },
  J: { nimi: "Jousi", lattialle: true },
  A: { nimi: "Ukko aloittaa tästä", lattialle: true, ainoa: true },
  L: { nimi: "Maali", lattialle: true, ainoa: true },
  V: { nimi: "Välilippu", lattialle: true, ainoa: true },
  // --- Vihreä saari ---
  v: { nimi: "Vihu", lattialle: true },
  p: { nimi: "Piikkis", lattialle: true },
  o: { nimi: "Pomppija", lattialle: true },
  l: { nimi: "Lentovihu" },
  t: { nimi: "Tippuja" },
  i: { nimi: "Liaani" },
  // --- Tulivuorisaari ---
  k: { nimi: "Kekäle", lattialle: true },
  e: { nimi: "Laavaetana", lattialle: true },
  s: { nimi: "Salamanteri", lattialle: true },
  b: { nimi: "Laavapallo" },
  a: { nimi: "Laava", maalattava: true, pohjalle: true },
  y: { nimi: "Ruutitynnyri", lattialle: true },
  m: { nimi: "Murtuva seinä", maalattava: true },
  c: { nimi: "Tykki", lattialle: true },
  f: { nimi: "Tulisuihku", lattialle: true },
  // --- Pakkassaari ---
  g: { nimi: "Pingviini", lattialle: true },
  u: { nimi: "Lumiukkeli", lattialle: true },
  h: { nimi: "Jäähauki" },
  w: { nimi: "Pöllö" },
  j: { nimi: "Liukas jää", maalattava: true },
  n: { nimi: "Nuotio", lattialle: true },
  x: { nimi: "Jäälohko", lattialle: true },
  z: { nimi: "Vesi", maalattava: true, pohjalle: true },
  q: { nimi: "Jääpuikko" },
};

const YHTEISET_PALIKAT = "MTPKSJALV";

// Teema = miltä kenttä näyttää ja mitä erikoispalikoita siinä on.
// malli = kenttä, josta otetaan värit, laatat, sää ja musiikki (0 = kenttä 1).
const TEEMAT = [
  { nimi: "Vihreä saari", malli: 0, palikat: "vpolti", vari: "#5fb85f" },
  { nimi: "Tulivuorisaari", malli: 5, palikat: "kesbaymcf", vari: "#e0622a" },
  { nimi: "Pakkassaari", malli: 11, palikat: "guhwjnxzq", vari: "#8fd3f0" },
];

// Palikat, joiden päällä voi seistä
const KIINTEAT = "MjTmx";

// ---------- RUUDUKKO ----------

function ruudunNimi(sarake, rivi) {
  return sarake + "," + rivi;
}

// Mikä palikka ruudussa on? (undefined = tyhjä)
function palikkaRuudussa(oma, sarake, rivi) {
  return oma.ruudut[ruudunNimi(sarake, rivi)];
}

function onKiintea(oma, sarake, rivi) {
  const merkki = palikkaRuudussa(oma, sarake, rivi);
  return merkki !== undefined && KIINTEAT.includes(merkki);
}

// Ruudun yläreuna ja vasen reuna pikseleinä
function rivinY(rivi) {
  return RIVIN_YLA + rivi * RUUTU;
}
function sarakkeenX(sarake) {
  return sarake * RUUTU;
}

// Lähin kiinteä ruutu tämän ruudun alapuolella (tai -1, jos alla on vain tyhjää)
function lattiaRivi(oma, sarake, rivi) {
  for (let r = rivi + 1; r < RIVEJA; r++) if (onKiintea(oma, sarake, r)) return r;
  return -1;
}

// Lähimmän katon alareuna tämän ruudun yläpuolella (0 = ruudun yläreuna)
function katonY(oma, sarake, rivi) {
  for (let r = rivi - 1; r >= 0; r--) {
    if (!onKiintea(oma, sarake, r)) continue;
    return rivinY(r) + (palikkaRuudussa(oma, sarake, r) === "T" ? 20 : RUUTU);
  }
  return 0;
}

// Kuinka pitkälle vihu voi kävellä? Se kääntyy seinän ja kuilun reunalla.
function kavelyAlue(oma, sarake, rivi, leveys) {
  let vasen = sarake;
  let oikea = sarake;
  const voiAstua = (s) => s >= 0 && !onKiintea(oma, s, rivi) && onKiintea(oma, s, rivi + 1);
  while (sarake - vasen < 6 && voiAstua(vasen - 1)) vasen--;
  while (oikea - sarake < 6 && voiAstua(oikea + 1)) oikea++;
  return { vasen: sarakkeenX(vasen) + 2, oikea: sarakkeenX(oikea + 1) - leveys - 2 };
}

// Yhdistää vierekkäiset samanlaiset ruudut isoiksi suorakulmioiksi.
// Näin pitkä maa on yksi taso eikä sata pientä palaa (nopeampaa ja nätimpää).
// pystyyn = true: myös päällekkäiset rivit yhdistetään.
function yhdistaRuudut(oma, merkki, pystyyn) {
  const palat = [];
  for (let rivi = 0; rivi < RIVEJA; rivi++) {
    let alku = -1;
    for (let sarake = 0; sarake <= SARAKKEITA_MAX; sarake++) {
      const on = palikkaRuudussa(oma, sarake, rivi) === merkki;
      if (on && alku < 0) alku = sarake;
      // Pala loppuu, kun palikat loppuvat (tai palasta tulisi liian pitkä)
      if (alku >= 0 && (!on || sarake - alku >= 100)) {
        palat.push({ sarake: alku, rivi: rivi, leveys: sarake - alku, korkeus: 1 });
        alku = on ? sarake : -1;
      }
    }
  }
  if (!pystyyn) return palat;
  // Jos suoraan alla on täsmälleen samanlevyinen pala, ne sulautuvat yhteen
  const valmiit = [];
  for (const pala of palat) {
    const ylempi = valmiit.find(
      (v) => v.sarake === pala.sarake && v.leveys === pala.leveys && v.rivi + v.korkeus === pala.rivi,
    );
    if (ylempi) ylempi.korkeus++;
    else valmiit.push(pala);
  }
  return valmiit;
}

// ---------- RUUDUKOSTA KENTÄKSI ----------

// Teeman värit ja sää otetaan mallikentästä (haetaan vain kerran)
const teemojenMallit = [];
function teemanMalli(teema) {
  if (!teemojenMallit[teema]) {
    const k = KENTAT[TEEMAT[teema].malli]();
    teemojenMallit[teema] = { varit: k.varit, laatat: k.laatat, saa: k.saa, tulivuoriTausta: k.tulivuoriTausta };
  }
  return teemojenMallit[teema];
}

// Lisää asian kentän listaan (ja tekee listan, jos sitä ei vielä ole)
function lisaaKenttaan(k, lista, asia) {
  if (!k[lista]) k[lista] = [];
  k[lista].push(asia);
}

// Tekee omasta kentästä samanlaisen kentän kuin kentat.js-tiedoston kentät
function omaKentaksi(oma) {
  const malli = teemanMalli(oma.teema);
  let viimeinen = 0; // oikeanpuoleisin sarake, jossa on jotain
  for (const nimi in oma.ruudut) viimeinen = Math.max(viimeinen, Number(nimi.split(",")[0]));
  const leveys = Math.max(canvas.width, (viimeinen + 3) * RUUTU);

  const k = {
    nimi: oma.nimi,
    leveys: leveys,
    tavoiteAika: 15 + Math.round(leveys / 70),
    alku: { x: 50, y: 370 },
    varit: malli.varit,
    tasot: [],
    liikkuvatTasot: [],
    putoavatTasot: [],
    kolikot: [],
    viholliset: [],
    lentovihut: [],
    // Jos välilippua ei ole laitettu, se on piilossa kentän ulkopuolella
    valitallennus: { x: -400, lattia: 410 },
    maali: { x: leveys - 70, lattia: 410 },
  };
  if (malli.laatat) k.laatat = malli.laatat;
  if (malli.saa) k.saa = malli.saa.slice();
  if (malli.tulivuoriTausta) k.tulivuoriTausta = true;

  // Maa, jää, tasot, murtuvat seinät, laava ja vesi: vierekkäiset ruudut yhteen
  for (const p of yhdistaRuudut(oma, "M", true)) {
    k.tasot.push({ x: sarakkeenX(p.sarake), y: rivinY(p.rivi), leveys: p.leveys * RUUTU, korkeus: p.korkeus * RUUTU });
  }
  for (const p of yhdistaRuudut(oma, "j", true)) {
    k.tasot.push({ x: sarakkeenX(p.sarake), y: rivinY(p.rivi), leveys: p.leveys * RUUTU, korkeus: p.korkeus * RUUTU, jaa: true });
  }
  for (const p of yhdistaRuudut(oma, "T", false)) {
    k.tasot.push({ x: sarakkeenX(p.sarake), y: rivinY(p.rivi), leveys: p.leveys * RUUTU, korkeus: 20 });
  }
  for (const p of yhdistaRuudut(oma, "m", true)) {
    lisaaKenttaan(k, "murtuvat", { x: sarakkeenX(p.sarake), y: rivinY(p.rivi), leveys: p.leveys * RUUTU, korkeus: p.korkeus * RUUTU });
  }
  for (const p of yhdistaRuudut(oma, "a", false)) {
    lisaaKenttaan(k, "laavat", { x: sarakkeenX(p.sarake), y: 425, leveys: p.leveys * RUUTU });
  }
  for (const p of yhdistaRuudut(oma, "z", false)) {
    lisaaKenttaan(k, "vedet", { x: sarakkeenX(p.sarake), y: 425, leveys: p.leveys * RUUTU });
  }

  // Kaikki muut palikat yksi kerrallaan
  for (const nimi in oma.ruudut) {
    const merkki = oma.ruudut[nimi];
    const sarake = Number(nimi.split(",")[0]);
    const rivi = Number(nimi.split(",")[1]);
    const x = sarakkeenX(sarake); // ruudun vasen reuna
    const y = rivinY(rivi); // ruudun yläreuna
    const lattia = y + RUUTU; // ruudun alareuna: tässä palikka seisoo
    // Kävelevä vihu: leveys kertoo, mihin kohtaan ruutua se laitetaan
    const kavelija = (tyyppi, vihunLeveys, lisat) => {
      const alue = kavelyAlue(oma, sarake, rivi, vihunLeveys);
      const vihu = { x: x + (RUUTU - vihunLeveys) / 2, lattia: lattia, vasen: alue.vasen, oikea: alue.oikea };
      if (tyyppi !== "vihu") vihu.tyyppi = tyyppi;
      k.viholliset.push(Object.assign(vihu, lisat));
    };

    if (merkki === "P") k.putoavatTasot.push({ x: x, y: y, leveys: RUUTU });
    else if (merkki === "K") k.kolikot.push({ x: x + 10, y: y + 10 });
    else if (merkki === "S") lisaaKenttaan(k, "sydamet", { x: x + 6, y: y + 8 });
    else if (merkki === "J") lisaaKenttaan(k, "jouset", { x: x + 6, lattia: lattia });
    else if (merkki === "A") k.alku = { x: x + 10, y: y };
    else if (merkki === "L") k.maali = { x: x + 10, lattia: lattia };
    else if (merkki === "V") k.valitallennus = { x: x + 10, lattia: lattia };
    // --- Vihreä saari ---
    else if (merkki === "v") kavelija("vihu", 40, { nopeus: 1 });
    else if (merkki === "p") kavelija("piikkis", 28, { nopeus: 1.5 });
    else if (merkki === "o") kavelija("pomppija", 26, { nopeus: 1.3 });
    else if (merkki === "l") {
      k.lentovihut.push({ x: x, y: y + 9, vasen: x - 120, oikea: x + 120, nopeus: 1.5, heilunta: 30 });
    } else if (merkki === "t") {
      // Hämähäkki roikkuu katosta ja tippuu lattialle asti
      const alla = lattiaRivi(oma, sarake, rivi);
      k.viholliset.push({ tyyppi: "tippuja", x: x + 7, y: y + 8, lattia: alla < 0 ? 410 : rivinY(alla), katto: katonY(oma, sarake, rivi) });
    } else if (merkki === "i") {
      // Liaani roikkuu ruudun yläreunasta. Sen pää jää hyppykorkeudelle maasta.
      const alla = lattiaRivi(oma, sarake, rivi);
      const pituus = alla < 0 ? 220 : Math.max(80, Math.min(240, rivinY(alla) - y - 90));
      lisaaKenttaan(k, "liaanit", { x: x + 20, y: y, pituus: pituus });
    }
    // --- Tulivuorisaari ---
    else if (merkki === "k") kavelija("kekale", 26);
    else if (merkki === "e") kavelija("laavaetana", 30);
    else if (merkki === "s") kavelija("salamanteri", 40);
    else if (merkki === "b") k.viholliset.push({ tyyppi: "laavapallo", x: x + 7, lattia: 425, hyppy: 170, jakso: 100 });
    else if (merkki === "y") lisaaKenttaan(k, "tynnyrit", { x: x + 6, lattia: lattia });
    else if (merkki === "c") {
      // Tykki ampuu siihen suuntaan, josta ukko tulee
      lisaaKenttaan(k, "tykit", { x: x + 4, lattia: lattia, suunta: -1, jakso: 140, sarake: sarake });
    } else if (merkki === "f") lisaaKenttaan(k, "tulisuihkut", { x: x + 8, lattia: lattia, jakso: 160 });
    // --- Pakkassaari ---
    else if (merkki === "g") kavelija("pingviini", 26);
    else if (merkki === "u") k.viholliset.push({ tyyppi: "lumiukkeli", x: x + 6, lattia: lattia });
    else if (merkki === "h") k.viholliset.push({ tyyppi: "jaahauki", x: x + 9, lattia: 425, hyppy: 170, jakso: 110 });
    else if (merkki === "w") k.viholliset.push({ tyyppi: "pollo", x: x + 5, y: y + 9, vasen: x - 180, oikea: x + 180 });
    else if (merkki === "n") lisaaKenttaan(k, "nuotiot", { x: x + 4, lattia: lattia });
    else if (merkki === "x") lisaaKenttaan(k, "jaalohkot", { x: x, lattia: lattia });
    else if (merkki === "q") lisaaKenttaan(k, "jaapuikot", { x: x + 13, y: y });
  }

  // Tykit kääntyvät ukon alkupaikkaa kohti
  for (const tykki of k.tykit || []) {
    tykki.suunta = sarakkeenX(tykki.sarake) < k.alku.x ? 1 : -1;
    delete tykki.sarake;
  }
  return k;
}

// ---------- UUSI KENTTÄ ----------

// Uudessa kentässä on valmiina maa, ukko ja maali
function uusiOmaKentta(teema, nimi) {
  const oma = { nimi: nimi, teema: teema, ruudut: {} };
  for (let sarake = 0; sarake < 40; sarake++) oma.ruudut[ruudunNimi(sarake, ALIN_RIVI)] = "M";
  oma.ruudut[ruudunNimi(1, ALIN_RIVI - 1)] = "A";
  oma.ruudut[ruudunNimi(37, ALIN_RIVI - 1)] = "L";
  return oma;
}

// Missä ruudussa palikka (esim. "A" = ukko) on? Palauttaa nimen tai null.
function etsiPalikka(oma, merkki) {
  for (const nimi in oma.ruudut) if (oma.ruudut[nimi] === merkki) return nimi;
  return null;
}

// ---------- PAKKAAMINEN ----------
// Kenttä muutetaan lyhyeksi tekstiksi, esim. "0~Oma kenttä~-14M00aA019L119".
//   ensin teeman numero, sitten nimi, sitten palikat:
//   palikan merkki + sarake (2 merkkiä) + rivi (1 merkki). Luvut ovat 36-järjestelmässä
//   (0-9 ja a-z), jolloin isokin luku mahtuu kahteen merkkiin.
//   "-14" palikan edessä = sama palikka 40 kertaa peräkkäin oikealle (14 = 40).

function luku36(luku, pituus) {
  return luku.toString(36).padStart(pituus, "0");
}

function pakkaaKentta(oma) {
  let palikat = "";
  for (let rivi = 0; rivi < RIVEJA; rivi++) {
    let sarake = 0;
    while (sarake < SARAKKEITA_MAX) {
      const merkki = palikkaRuudussa(oma, sarake, rivi);
      if (merkki === undefined) {
        sarake++;
        continue;
      }
      let maara = 1; // montako samaa palikkaa on peräkkäin
      while (palikkaRuudussa(oma, sarake + maara, rivi) === merkki) maara++;
      if (maara > 1) palikat += "-" + luku36(maara, 2);
      palikat += merkki + luku36(sarake, 2) + luku36(rivi, 1);
      sarake += maara;
    }
  }
  return oma.teema + "~" + siistiNimi(oma.nimi) + "~" + palikat;
}

// Nimestä otetaan pois merkki ~ (se erottaa pakkauksen osat) ja liika pituus
function siistiNimi(nimi) {
  const siisti = String(nimi || "").replace(/[~\n\r]/g, " ").trim().slice(0, NIMEN_PITUUS);
  return siisti || "Oma kenttä";
}

// Purkaa tekstin takaisin kentäksi. Palauttaa null, jos teksti on rikki.
function puraKentta(teksti) {
  if (typeof teksti !== "string") return null;
  const eka = teksti.indexOf("~");
  const vika = teksti.lastIndexOf("~");
  const teema = Number(teksti.slice(0, eka));
  if (eka < 1 || vika <= eka || !TEEMAT[teema]) return null;

  const oma = { nimi: siistiNimi(teksti.slice(eka + 1, vika)), teema: teema, ruudut: {} };
  const palikat = teksti.slice(vika + 1);
  let kohta = 0;
  while (kohta < palikat.length) {
    let maara = 1;
    if (palikat[kohta] === "-") {
      maara = parseInt(palikat.slice(kohta + 1, kohta + 3), 36);
      kohta += 3;
    }
    const merkki = palikat[kohta];
    const sarake = parseInt(palikat.slice(kohta + 1, kohta + 3), 36);
    const rivi = parseInt(palikat.slice(kohta + 3, kohta + 4), 36);
    kohta += 4;
    // Rikkinäinen kohta: lopetetaan, mutta pidetään se, mikä saatiin luettua
    if (!PALIKAT[merkki] || !(maara >= 1) || !(sarake >= 0) || !(rivi >= 0) || rivi >= RIVEJA) break;
    for (let i = 0; i < maara && sarake + i < SARAKKEITA_MAX; i++) oma.ruudut[ruudunNimi(sarake + i, rivi)] = merkki;
  }
  // Ukko ja maali tarvitaan aina
  if (!etsiPalikka(oma, "A")) oma.ruudut[ruudunNimi(1, ALIN_RIVI - 1)] = "A";
  if (!etsiPalikka(oma, "L")) oma.ruudut[ruudunNimi(18, ALIN_RIVI - 1)] = "L";
  return oma;
}

// ---------- TALLENNUS SELAIMEN MUISTIIN ----------
// omatKentat on lista. Jokaisesta kentästä muistetaan:
//   koodi (pakattu kenttä), lapaisty (onko joku päässyt sen läpi) ja paras (paras aika)

let omatKentat = lataaOmatKentat();

function lataaOmatKentat() {
  try {
    const lista = JSON.parse(localStorage.getItem(OMIEN_NIMI) || "[]");
    if (!Array.isArray(lista)) return [];
    return lista.filter((t) => t && puraKentta(t.koodi)).slice(0, OMIA_KENTTIA_MAX);
  } catch (virhe) {
    return []; // muisti ei ole käytössä tai tallennus on rikki
  }
}

function tallennaOmatKentat() {
  try {
    localStorage.setItem(OMIEN_NIMI, JSON.stringify(omatKentat));
  } catch (virhe) {
    // ei haittaa, kentät vain eivät tallennu
  }
}

// ---------- JAKAMINEN ----------
// Kenttä on linkin lopussa #k=-merkin jälkeen. Kun linkin avaa, peli lukee kentän siitä.

function kentanLinkki(koodi) {
  return location.origin + location.pathname + "#k=" + encodeURIComponent(koodi);
}

// Onko sivun osoitteessa kenttä? Palauttaa pakatun kentän tai null.
function kenttaOsoitteesta() {
  const risu = (typeof location !== "undefined" && location.hash) || "";
  if (!risu.startsWith("#k=")) return null;
  let koodi = risu.slice(3);
  try {
    koodi = decodeURIComponent(koodi);
  } catch (virhe) {
    // osoite oli jo valmiiksi purettu: käytetään sitä sellaisenaan
  }
  return puraKentta(koodi) ? koodi : null;
}
