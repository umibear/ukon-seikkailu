// ==========================================
//   TARINA
//   Lyhyet kuvakohtaukset, jotka kertovat, miksi Ukko seikkailee:
//   majakan neljä valokiveä ovat kadonneet, ja jokaisella pomolla on yksi.
//   - Alkukohtaus näytetään, kun peli aloitetaan.
//   - Jokaisen pomon jälkeen näytetään yksi kohtaus (vain ensimmäisellä kerralla).
//   - Kun viimeinen pomo on voitettu, näytetään loppukohtaus.
//   Kohtauksen voi ohittaa: VÄLILYÖNTI vie eteenpäin ja ESC ohittaa kokonaan.
//
//   Kokeile itse: muuta tekstejä alla olevassa KOHTAUKSET-listassa!
//   Pitkä teksti jaetaan riveille automaattisesti.
//   (Huom: peli.js:ssä on jo muuttuja "tarina", joka tarkoittaa ruudun tärinää.
//    Siksi täällä puhutaan "kohtauksista".)
// ==========================================

const KOHTAUKSET = [
  {
    id: "alku",
    sivut: [
      "Ukon kotisaarella seisoo vanha majakka. Sen neljä valokiveä näyttävät veneille tien kotiin pimeälläkin.",
      "Mutta eräänä aamuna valokivet olivat poissa! – Minä etsin ne, sanoi Ukko ja lähti matkaan.",
    ],
  },
  {
    id: "isaukko",
    pomo: "isaukko", // näytetään, kun tämä pomo on voitettu
    kivia: 1, // montako valokiveä Ukolla on tämän jälkeen
    sivut: [
      "Isäukko oli lainannut valokiven lukulampuksi. – Anteeksi! Halusin vain lukea iltasadun loppuun, se mumisi. Ensimmäinen valokivi on tallessa!",
    ],
  },
  {
    id: "magma",
    pomo: "magma",
    kivia: 2,
    sivut: [
      "Magmamörkö oli luullut valokiveä karkiksi. – Yäk, eihän se maistu miltään! se ärisi ja sylkäisi kiven ulos. Toinen valokivi on tallessa!",
    ],
  },
  {
    id: "pakkas",
    pomo: "pakkas",
    kivia: 3,
    sivut: [
      "Pakkasukko oli pannut valokiven jäälinnansa koristeeksi. – Se oli niin kaunis, se huokaisi. Ukko lupasi, että majakan valo näkyy linnaan asti. Kolmas valokivi on tallessa!",
    ],
  },
  {
    id: "mato",
    pomo: "mato",
    kivia: 4,
    sivut: [
      "Hiekkamato oli nielaissut valokiven vahingossa, ja sen vatsaa oli kutittanut siitä asti. – Kiitos, nyt saan taas nukuttua! Viimeinen valokivi on tallessa!",
    ],
  },
  {
    id: "loppu",
    kivia: 4,
    sivut: [
      "Ukko kantoi valokivet takaisin majakkaan. Valo syttyi ja loisti kaikille saarille asti.",
      "Isäukko, Magmamörkö, Pakkasukko ja Hiekkamato tulivat katsomaan valoa. Nyt jokainen löytää taas kotiin. LOPPU",
    ],
  },
];

const RIVIN_PITUUS = 64; // montako kirjainta yhdelle riville mahtuu
const KIRJOITUSNOPEUS = 1.3; // montako kirjainta ilmestyy yhdessä hetkessä
const VALOKIVEN_VARIT = ["#ffe14d", "#ff9d5c", "#8fe8ff", "#b6f09c"]; // jokainen kivi on eri värinen

// Mikä kohtaus on menossa? null = ei mikään.
//   lista = näytettävien kohtausten nimet, kohta = monesko niistä on menossa,
//   sivu = monesko sivu, aika = kauanko sivu on ollut näkyvissä, jatko = mitä tehdään lopuksi
let kohtaus = null;
// Mitkä kohtaukset on jo nähty (tallentuu pelin mukana, peli.js: tallennaPeli)
let nahdytKohtaukset = {};

function etsiKohtaus(id) {
  return KOHTAUKSET.find((k) => k.id === id);
}

// Näyttää kohtaukset peräkkäin. Lopuksi kutsutaan jatko-funktiota (tai palataan kartalle).
function naytaKohtaukset(idt, jatko) {
  kohtaus = { lista: idt, kohta: 0, sivu: 0, aika: 0, jatko: jatko || null };
  tila = "kohtaus";
  aloitaSiirtyma(); // tehosteet.js
  if (etsiKohtaus(idt[0]).pomo) aanet.salaisuus(); // valokivi löytyi!
}

// Kutsutaan, kun peli aloitetaan tai sitä jatketaan (peli.js: valitseRivi).
// Alkukohtaus näytetään vain kerran.
function naytaAlkukohtaus() {
  if (nahdytKohtaukset.alku) return;
  naytaKohtaukset(["alku"], null);
}

// Kutsutaan, kun läpäistystä kentästä jatketaan eteenpäin (peli.js: seuraavaKentta).
// Palauttaa true, jos kohtaus alkoi. Kun se loppuu, seuraavaKentta kutsutaan uudestaan.
let kohtauksetNaytettyKentasta = -1;
function kohtausPomonJalkeen(numero) {
  if (kohtauksetNaytettyKentasta === numero) {
    kohtauksetNaytettyKentasta = -1; // kohtaukset on jo näytetty: nyt jatketaan
    return false;
  }
  const tyyppi = KENTTIEN_TIEDOT[numero].pomoTyyppi; // kartta.js
  const idt = [];
  const pomonKohtaus = KOHTAUKSET.find((k) => k.pomo && k.pomo === tyyppi);
  if (pomonKohtaus && !nahdytKohtaukset[pomonKohtaus.id]) idt.push(pomonKohtaus.id);
  if (numero === KENTAT.length - 1) idt.push("loppu"); // viimeisen kentän jälkeen aina loppukohtaus
  if (idt.length === 0) return false;
  naytaKohtaukset(idt, () => {
    kohtauksetNaytettyKentasta = numero;
    seuraavaKentta();
  });
  return true;
}

// Montako valokiveä on löydetty? (= montako pomoa on voitettu)
function valokiviaLoydetty() {
  let maara = 0;
  for (let i = 0; i < KENTAT.length; i++) {
    if (KENTTIEN_TIEDOT[i].pomoTyyppi && parhaatPisteet[i] !== undefined) maara++;
  }
  return maara;
}

// Jakaa pitkän tekstin riveiksi sanojen välistä
function rivita(teksti) {
  const rivit = [];
  let rivi = "";
  for (const sana of teksti.split(" ")) {
    if (rivi !== "" && (rivi + " " + sana).length > RIVIN_PITUUS) {
      rivit.push(rivi);
      rivi = sana;
    } else {
      rivi = rivi === "" ? sana : rivi + " " + sana;
    }
  }
  if (rivi !== "") rivit.push(rivi);
  return rivit;
}

function paivitaKohtaus(dt) {
  if (kohtaus) kohtaus.aika += dt;
}

// Näppäin painettiin kohtauksen aikana (peli.js: keydown)
function kohtauksenNappi(koodi) {
  if (!kohtaus) return;
  const k = etsiKohtaus(kohtaus.lista[kohtaus.kohta]);
  if (koodi === "Escape") {
    lopetaKohtaukset(); // ohitetaan kaikki
    return;
  }
  if (koodi !== "Space" && koodi !== "Enter") return;
  const kirjaimia = k.sivut[kohtaus.sivu].length;
  if (kohtaus.aika * KIRJOITUSNOPEUS < kirjaimia) {
    kohtaus.aika = kirjaimia; // teksti on vielä kesken: näytetään se heti kokonaan
    return;
  }
  aanet.laskuri();
  kohtaus.aika = 0;
  if (kohtaus.sivu < k.sivut.length - 1) {
    kohtaus.sivu++; // seuraava sivu
  } else if (kohtaus.kohta < kohtaus.lista.length - 1) {
    nahdytKohtaukset[k.id] = true;
    kohtaus.kohta++; // seuraava kohtaus
    kohtaus.sivu = 0;
    aloitaSiirtyma();
  } else {
    lopetaKohtaukset();
  }
}

function lopetaKohtaukset() {
  for (const id of kohtaus.lista) nahdytKohtaukset[id] = true;
  const jatko = kohtaus.jatko;
  kohtaus = null;
  if (jatko) {
    jatko();
  } else {
    tila = "kartta";
    aloitaSiirtyma();
  }
  tallennaPeli(); // muistetaan, mitkä kohtaukset on nähty
}

// ---------- PIIRTÄMINEN ----------

// Valokivi: hehkuva timantti (kiven numero 0-3 päättää värin)
function piirraValokivi(x, y, koko, numero, aika) {
  const vari = VALOKIVEN_VARIT[numero % 4];
  hehku(x, y, koko * 1.6 + Math.sin(aika / 300 + numero) * 3, "255, 240, 170", 0.75);
  piirraTimantti(x - koko / 2, y - koko / 2, koko, vari, "white"); // aarteet.js
}

// Rivi pieniä valokiviä: löydetyt hehkuvat, muut ovat harmaita
function piirraValokivirivi(x, y, loydetty, aika) {
  for (let i = 0; i < 4; i++) {
    if (i < loydetty) piirraValokivi(x + i * 26, y, 16, i, aika);
    else piirraTimantti(x + i * 26 - 8, y - 8, 16, "#555", null);
  }
}

// Kartan yläreunassa näkyy, montako valokiveä on jo löydetty (kartta.js)
function piirraValokivetKartalle(aika) {
  piirraValokivirivi(canvas.width / 2 - 39, 60, valokiviaLoydetty(), aika);
}

// Ukko kohtauksen kuvassa. x, y = jalkojen kohta, koko = suurennos.
function piirraUkkoKuvaan(x, y, koko, oikealle) {
  ctx.save();
  ctx.translate(x, y);
  if (oikealle) ctx.scale(-1, 1); // kuvassa ukko katsoo vasemmalle
  ctx.drawImage(kuvat.ukko, 0, 0, 32, 32, -16 * koko, -26 * koko, 32 * koko, 32 * koko);
  ctx.restore();
}

// Pomot kohtausten kuvissa. x, y = jalkojen kohta, koko = suurennos.
const POMOJEN_KUVAT = {
  isaukko: (aika) => ctx.drawImage(kuvat.isaukko, 0, 0, 64, 64, -80, -160, 160, 160),
  magma: (aika) => {
    ctx.scale(2.6, 2.6);
    piirraMagmaKuvake(0, -22, aika); // tulivuori.js
  },
  pakkas: (aika) => {
    ctx.scale(2.4, 2.4);
    piirraPakkasukkoKuvake(0, -4, aika); // pakkasukko.js
  },
  mato: (aika) => {
    // Mato kurkistaa hiekasta (hiekkamato.js)
    for (let y = 0; y > -80; y -= 26) piirraMadonPala(Math.sin(aika / 300 + y) * 3, y, 27, false);
    piirraMadonPaa(0, -100, false, aika, 0);
    piirraKumpu(0, 8, 3, false);
  },
};

function piirraPomoKuvaan(tyyppi, x, y, koko, aika) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(koko, koko);
  POMOJEN_KUVAT[tyyppi](aika);
  ctx.restore();
}

// Taivas (kaksi väriä liukuna) ja maa
function piirraKohtauksenTausta(ylaVari, alaVari, maanVari) {
  const liuku = ctx.createLinearGradient(0, 0, 0, 330);
  liuku.addColorStop(0, ylaVari);
  liuku.addColorStop(1, alaVari);
  ctx.fillStyle = liuku;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 277, canvas.width, 3);
  ctx.fillStyle = maanVari;
  ctx.fillRect(0, 280, canvas.width, 170);
}

// Tähtiä yötaivaalle
function piirraTahdet(aika) {
  ctx.fillStyle = "white";
  for (let i = 0; i < 40; i++) {
    const tuike = Math.sin(aika / 400 + i * 2.3) > 0.6 ? 3 : 2;
    ctx.fillRect((i * 137) % 800, (i * 61) % 170, tuike, tuike);
  }
}

// Majakka saarella. valo = palaako lamppu.
function piirraMajakka(x, y, valo, aika) {
  // Saari
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 213, 43, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3f9b4b";
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 210, 40, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Valokeila pyörii hitaasti
  if (valo) {
    const kulma = Math.sin(aika / 1400) * 0.5;
    ctx.save();
    ctx.translate(x, y - 196);
    for (const suunta of [-1, 1]) {
      ctx.save();
      ctx.rotate(kulma * suunta);
      ctx.fillStyle = "rgba(255, 244, 170, 0.35)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(suunta * 700, -110);
      ctx.lineTo(suunta * 700, 110);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    hehku(x, y - 196, 70, "255, 244, 170", 0.8);
  }
  // Torni: valkoinen, kolme punaista raitaa
  ctx.fillStyle = "black";
  ctx.fillRect(x - 33, y - 173, 66, 153);
  ctx.fillStyle = "white";
  ctx.fillRect(x - 30, y - 170, 60, 150);
  ctx.fillStyle = "#e63946";
  for (let i = 0; i < 3; i++) ctx.fillRect(x - 30, y - 160 + i * 50, 60, 22);
  ctx.fillStyle = "#3a2a1a"; // ovi
  ctx.fillRect(x - 9, y - 48, 18, 28);
  // Parveke ja lamppuhuone
  ctx.fillStyle = "black";
  ctx.fillRect(x - 42, y - 180, 84, 10);
  ctx.fillRect(x - 25, y - 222, 50, 44);
  ctx.fillStyle = valo ? "#fff4aa" : "#39424e";
  ctx.fillRect(x - 21, y - 218, 42, 38);
  // Katto
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(x - 34, y - 220);
  ctx.lineTo(x, y - 256);
  ctx.lineTo(x + 34, y - 220);
  ctx.fill();
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.moveTo(x - 28, y - 223);
  ctx.lineTo(x, y - 251);
  ctx.lineTo(x + 28, y - 223);
  ctx.fill();
}

// Kohtausten kuvat. sivu = monesko sivu on menossa.
const KOHTAUSTEN_KUVAT = {
  alku: (aika, sivu) => {
    if (sivu === 0) {
      // Yö: majakka loistaa ja valokivet hehkuvat lamppuhuoneessa
      piirraKohtauksenTausta("#0b1030", "#2a3a78", "#1d4f8f");
      piirraTahdet(aika);
      piirraMajakka(400, 290, true, aika);
      for (let i = 0; i < 4; i++) piirraValokivi(383 + i * 11, 94 + (i % 2) * 8, 10, i, aika);
    } else {
      // Aamu: lamppu on pimeä, ja Ukko ihmettelee
      piirraKohtauksenTausta("#7cc4f5", "#ffe2b0", "#3f8fd0");
      piirraMajakka(400, 290, false, aika);
      piirraUkkoKuvaan(300, 282, 2.5, true);
      reunaTeksti("?!", 300, 190 + Math.sin(aika / 200) * 4, 36, "center", "#ffe14d");
    }
  },
  isaukko: (aika) => {
    piirraKohtauksenTausta("#6ec3f5", "#d7f1ff", "#59b85f");
    piirraUkkoKuvaan(230, 280, 3, true);
    piirraPomoKuvaan("isaukko", 560, 280, 1, aika);
    // Iltasatukirja Isäukon vieressä
    ctx.fillStyle = "black";
    ctx.fillRect(637, 247, 46, 34);
    ctx.fillStyle = "#b5403a";
    ctx.fillRect(640, 250, 40, 28);
    ctx.fillStyle = "#ffe9b8";
    ctx.fillRect(646, 256, 28, 4);
    piirraValokivi(390, 190 + Math.sin(aika / 350) * 8, 44, 0, aika);
  },
  magma: (aika) => {
    piirraKohtauksenTausta("#2a0a08", "#8a2a12", "#3a2019");
    piirraUkkoKuvaan(230, 280, 3, true);
    piirraPomoKuvaan("magma", 570, 280, 1, aika);
    piirraValokivi(390, 190 + Math.sin(aika / 350) * 8, 44, 1, aika);
  },
  pakkas: (aika) => {
    piirraKohtauksenTausta("#3d6fb0", "#cfe8ff", "#f4fbff");
    piirraUkkoKuvaan(230, 280, 3, true);
    piirraPomoKuvaan("pakkas", 570, 280, 1, aika);
    piirraValokivi(390, 190 + Math.sin(aika / 350) * 8, 44, 2, aika);
  },
  mato: (aika) => {
    piirraKohtauksenTausta("#f2b04c", "#fff0b8", "#e2bd7a");
    piirraUkkoKuvaan(230, 280, 3, true);
    piirraPomoKuvaan("mato", 570, 275, 1, aika);
    piirraValokivi(390, 190 + Math.sin(aika / 350) * 8, 44, 3, aika);
  },
  loppu: (aika, sivu) => {
    // Yö: majakan valo palaa taas
    piirraKohtauksenTausta("#0b1030", "#2a3a78", "#1d4f8f");
    piirraTahdet(aika);
    piirraMajakka(400, 290, true, aika);
    for (let i = 0; i < 4; i++) piirraValokivi(383 + i * 11, 94 + (i % 2) * 8, 10, i, aika);
    piirraUkkoKuvaan(345, 282, 2, true);
    if (sivu >= 1) {
      // Kaikki pomot katsovat valoa yhdessä
      piirraPomoKuvaan("isaukko", 285, 284, 0.55, aika);
      piirraPomoKuvaan("magma", 480, 284, 0.5, aika);
      piirraPomoKuvaan("pakkas", 550, 284, 0.5, aika);
      piirraPomoKuvaan("mato", 228, 286, 0.45, aika);
    }
  },
};

function piirraKohtaus(aika) {
  if (!kohtaus) return;
  const k = etsiKohtaus(kohtaus.lista[kohtaus.kohta]);
  KOHTAUSTEN_KUVAT[k.id](aika, kohtaus.sivu);
  if (k.kivia) piirraValokivirivi(30, 30, k.kivia, aika);

  // Tekstilaatikko: kirjaimet ilmestyvät yksi kerrallaan
  ctx.fillStyle = "black";
  ctx.fillRect(22, 318, canvas.width - 44, 118);
  ctx.fillStyle = "#1c2a44";
  ctx.fillRect(26, 322, canvas.width - 52, 110);
  const teksti = k.sivut[kohtaus.sivu];
  let nakyvissa = Math.floor(kohtaus.aika * KIRJOITUSNOPEUS);
  const rivit = rivita(teksti);
  for (let i = 0; i < rivit.length; i++) {
    if (nakyvissa <= 0) break;
    // (Ei reunaTeksti, koska se tallentaisi jokaisen keskeneräisen rivin muistiin.)
    piirraTekstiReunalla(ctx, rivit[i].slice(0, nakyvissa), 44, 354 + i * 28, 20, "left", "white");
    nakyvissa -= rivit[i].length + 1;
  }

  // Ohje vilkkuu, kun koko teksti on näkyvissä
  if (nakyvissa > 0 && Math.floor(aika / 500) % 2 === 0) {
    reunaTeksti(ohje("VÄLILYÖNTI ▶", "Napauta ▶"), canvas.width - 40, 426, 16, "right", "#ffe14d");
  }
  if (!kosketusOhjaus) reunaTeksti("ESC = ohita", canvas.width - 14, 22, 13, "right", "#ddd");
}
