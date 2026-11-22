// ==========================================
//   MAAILMA 3: PAKKASSAARI
//   Kuusi kenttää: viisi tavallista ja pomo Pakkasukko.
//   Uudet asiat (katso pakkanen.js):
//     jaa: true    = tasossa: taso on liukasta jäätä (ukko liukuu!)
//     jaalohkot    = x ja lattia (sekä leveys ja korkeus, jos ei 40 x 40).
//                    Jäälohko sulaa tulipallosta. Sisään voi laittaa kolikon tai sydämen.
//     nuotiot      = x ja lattia. Nuotion vieressä tulimittari täyttyy nopeasti.
//     jaapuikot    = x ja y (katto, josta puikko roikkuu). uusiutuu: true = kasvaa takaisin.
//     vedet        = x, y (veden pinta), leveys. Hyiseen veteen ei saa pudota!
//     tuulet       = x, leveys, voima (plus = oikealle, miinus = vasemmalle), jakso ja vaihe.
//                    Tuulipussi näyttää, milloin puuska tulee.
//     laatat: "lumi" = lumiset laatat. Liikkuvat tasot ovat jäälauttoja ja
//                    putoavat tasot ohutta jäätä.
//     saa: "revontulet" = revontulet taivaalla
//   Pakkassaaren vihut (katso pakkasvihut.js):
//     "pingviini", "lumiukkeli", "jaahauki" ja "pollo"
// ==========================================

// Pakkassaaren värit (kaikissa kentissä vähän erilaiset)
const PAKKAS_VARIT = {
  taivasYla: "#6fb1e8",
  taivasAla: "#e4f3ff",
  aurinko: "#fff3b0",
  maetKauka: "#a9c4e0",
  maetLahi: "#d5e4f2",
  puut: "#2f6b5a",
};

// ---------- KENTTÄ 12: LUMIKENTTÄ ----------
// Ensimmäinen pakkaskenttä: liukas jää, nuotio, jäälohkot ja pingviinit
function kentta12() {
  return {
    nimi: "Lumikenttä",
    leveys: 3800,
    tavoiteAika: 75,
    alku: { x: 40, y: 360 },
    varit: PAKKAS_VARIT,
    laatat: "lumi",
    saa: ["lumi"],

    tasot: [
      // --- OSA 1: lumikenttä ja jäätynyt lampi ---
      { x: 0, y: 410, leveys: 700, korkeus: 40 },
      { x: 700, y: 410, leveys: 500, korkeus: 40, jaa: true }, // liukas lampi
      { x: 1200, y: 410, leveys: 300, korkeus: 40 },
      // --- OSA 2: kivet hyisessä vedessä ---
      { x: 1570, y: 370, leveys: 70, korkeus: 80 },
      { x: 1690, y: 350, leveys: 70, korkeus: 100 },
      { x: 1800, y: 410, leveys: 600, korkeus: 40 },
      // --- OSA 3: pitkä jäärata ---
      { x: 2400, y: 410, leveys: 500, korkeus: 40, jaa: true },
      { x: 3000, y: 410, leveys: 800, korkeus: 40 },
      // --- OSA 4: portaat ---
      { x: 3150, y: 330, leveys: 120, korkeus: 20 },
      { x: 3330, y: 260, leveys: 120, korkeus: 20 },
    ],

    vedet: [
      { x: 1500, y: 425, leveys: 300 },
      { x: 2900, y: 425, leveys: 100 },
    ],

    // Nuotiolla tulimittari täyttyy: sitten jaksaa sulattaa jäätä!
    nuotiot: [
      { x: 1230, lattia: 410 },
      { x: 3050, lattia: 410 },
    ],

    jaalohkot: [
      { x: 1330, lattia: 410 }, // sisällä kolikko
      { x: 1440, lattia: 410, leveys: 40, korkeus: 170 }, // jääseinä: sulata tulipallolla!
      { x: 3370, lattia: 260 }, // sisällä sydän
    ],

    liikkuvatTasot: [],

    kolikot: [
      { x: 200, y: 370 },
      { x: 300, y: 370 },
      { x: 780, y: 370 },
      { x: 880, y: 370 },
      { x: 980, y: 370 },
      { x: 1080, y: 370 },
      { x: 1340, y: 380 }, // jäälohkon sisällä
      { x: 1595, y: 320 },
      { x: 1715, y: 300 },
      { x: 1950, y: 370 },
      { x: 2150, y: 370 },
      { x: 2500, y: 370 },
      { x: 2650, y: 370 },
      { x: 2800, y: 370 },
      { x: 2940, y: 300 }, // veden päällä
      { x: 3200, y: 290 },
      { x: 3250, y: 290 },
      { x: 3500, y: 370 },
      { x: 3650, y: 370 },
    ],

    viholliset: [
      // Pingviini liukuu mahallaan ukkoa kohti: hyppää yli tai päälle!
      { tyyppi: "pingviini", x: 450, lattia: 410, vasen: 300, oikea: 640 },
      { tyyppi: "pingviini", x: 2050, lattia: 410, vasen: 1900, oikea: 2250 },
      { tyyppi: "lumiukkeli", x: 2330, lattia: 410 },
      { tyyppi: "pingviini", x: 2650, lattia: 410, vasen: 2450, oikea: 2850 },
      { tyyppi: "lumiukkeli", x: 3600, lattia: 410 },
    ],

    lentovihut: [],

    sydamet: [{ x: 3376, y: 228 }], // jäälohkon sisällä ylimmällä portaalla

    valitallennus: { x: 1850, lattia: 410 },
    maali: { x: 3720, lattia: 410 },
  };
}

// ---------- KENTTÄ 13: JÄÄLAUTAT ----------
// Melkein koko kenttä on hyistä vettä: hypi jäälautalta ja jäävuorelta toiselle
function kentta13() {
  return {
    nimi: "Jäälautat",
    leveys: 4200,
    tavoiteAika: 100,
    alku: { x: 40, y: 360 },
    varit: { ...PAKKAS_VARIT, taivasYla: "#4f9ed0", taivasAla: "#d6f1ff" },
    laatat: "lumi",
    saa: ["lumi"],

    tasot: [
      { x: 0, y: 410, leveys: 350, korkeus: 40 },
      { x: 760, y: 370, leveys: 200, korkeus: 80, jaa: true }, // jäävuori 1
      { x: 1060, y: 410, leveys: 240, korkeus: 40 }, // lumisaari 1
      { x: 1880, y: 350, leveys: 240, korkeus: 100, jaa: true }, // jäävuori 2
      { x: 2220, y: 410, leveys: 240, korkeus: 40 }, // lumisaari 2
      { x: 2930, y: 330, leveys: 200, korkeus: 120, jaa: true }, // jäävuori 3
      { x: 3750, y: 410, leveys: 450, korkeus: 40 },
    ],

    vedet: [{ x: 350, y: 425, leveys: 3400 }],

    // Jäälautat kelluvat edestakaisin tai ylös ja alas
    liikkuvatTasot: [
      { x: 500, y: 380, leveys: 110, matkaX: 80, matkaY: 0, nopeus: 0.02 },
      { x: 1380, y: 370, leveys: 100, matkaX: 0, matkaY: 45, nopeus: 0.025 },
      { x: 1620, y: 380, leveys: 110, matkaX: 80, matkaY: 0, nopeus: 0.02 },
      { x: 3290, y: 370, leveys: 110, matkaX: 90, matkaY: 0, nopeus: 0.018 },
      { x: 3560, y: 360, leveys: 100, matkaX: 0, matkaY: 40, nopeus: 0.025 },
    ],

    // Ohut jää halkeaa ja putoaa, kun sen päälle astuu
    putoavatTasot: [
      { x: 2540, y: 380, leveys: 70 },
      { x: 2670, y: 360, leveys: 70 },
      { x: 2800, y: 345, leveys: 70 },
    ],

    nuotiot: [
      { x: 1090, lattia: 410 },
      { x: 2400, lattia: 410 },
    ],

    jaalohkot: [
      { x: 1150, lattia: 410 }, // sisällä kolikko
      { x: 2330, lattia: 410 }, // sisällä sydän
    ],

    kolikot: [
      { x: 200, y: 370 },
      { x: 545, y: 330 },
      { x: 800, y: 330 },
      { x: 900, y: 330 },
      { x: 1000, y: 300 },
      { x: 1160, y: 380 }, // jäälohkon sisällä
      { x: 1420, y: 270 },
      { x: 1665, y: 330 },
      { x: 1930, y: 310 },
      { x: 2040, y: 310 },
      { x: 2160, y: 320 },
      { x: 2565, y: 330 },
      { x: 2695, y: 310 },
      { x: 2825, y: 295 },
      { x: 2980, y: 290 },
      { x: 3335, y: 320 },
      { x: 3600, y: 260 },
      { x: 3850, y: 370 },
      { x: 3950, y: 370 },
    ],

    viholliset: [
      // Jäähauet hyppäävät vedestä: ajoita hyppy (tai pomppaa hauen päältä!)
      { tyyppi: "jaahauki", x: 715, lattia: 425, hyppy: 170, jakso: 110 },
      { tyyppi: "lumiukkeli", x: 1250, lattia: 410 },
      { tyyppi: "jaahauki", x: 1500, lattia: 425, hyppy: 190, jakso: 120, vaihe: 40 },
      { tyyppi: "pingviini", x: 1960, lattia: 350, vasen: 1890, oikea: 2080 },
      { tyyppi: "jaahauki", x: 2630, lattia: 425, hyppy: 180, jakso: 100 },
      { tyyppi: "jaahauki", x: 2760, lattia: 425, hyppy: 180, jakso: 100, vaihe: 50 },
      { tyyppi: "lumiukkeli", x: 3070, lattia: 330 },
      { tyyppi: "jaahauki", x: 3695, lattia: 425, hyppy: 170, jakso: 110, vaihe: 60 },
    ],

    lentovihut: [],

    sydamet: [{ x: 2336, y: 378 }], // jäälohkon sisällä

    valitallennus: { x: 2250, lattia: 410 },
    maali: { x: 4100, lattia: 410 },
  };
}

// ---------- KENTTÄ 14: PUIKKOLUOLA ----------
// Pimeä jääluola. Katosta roikkuu jääpuikkoja: ne tippuvat, kun ukko tulee alle!
// Odota, että puikko putoaa, tai sulata se tulipallolla.
function kentta14() {
  return {
    nimi: "Puikkoluola",
    leveys: 4000,
    tavoiteAika: 110,
    alku: { x: 40, y: 360 },
    varit: {
      taivasYla: "#0b1830",
      taivasAla: "#1f3a5c",
      aurinko: "#1f3a5c",
      maetKauka: "#16294a",
      maetLahi: "#0f1e38",
      puut: null,
    },
    laatat: "lumi",
    luola: true, // ei aurinkoa eikä pilviä
    pimeys: 0.55,

    tasot: [
      // --- OSA 1: matala tunneli, jossa on jääpuikkoja ---
      { x: 0, y: 410, leveys: 600, korkeus: 40 },
      { x: 600, y: 410, leveys: 400, korkeus: 40, jaa: true }, // liukas lattia puikkojen alla
      { x: 1000, y: 410, leveys: 400, korkeus: 40 },
      { x: 200, y: 0, leveys: 1200, korkeus: 230 }, // tunnelin katto
      // --- OSA 2: luolalampi ---
      { x: 1480, y: 370, leveys: 70, korkeus: 80 },
      { x: 1620, y: 330, leveys: 70, korkeus: 120 },
      { x: 1760, y: 370, leveys: 70, korkeus: 80 },
      { x: 1600, y: 0, leveys: 110, korkeus: 150 }, // tippukivi katossa
      { x: 1900, y: 410, leveys: 560, korkeus: 40 },
      // --- OSA 3: jousella ylätasanteelle ---
      { x: 2460, y: 250, leveys: 500, korkeus: 200 },
      { x: 2520, y: 0, leveys: 400, korkeus: 110 },
      // --- OSA 4: jäätunneli ---
      { x: 2960, y: 410, leveys: 140, korkeus: 40 },
      { x: 3100, y: 410, leveys: 400, korkeus: 40, jaa: true },
      { x: 3500, y: 410, leveys: 500, korkeus: 40 },
      { x: 3080, y: 0, leveys: 440, korkeus: 240 },
    ],

    vedet: [{ x: 1400, y: 425, leveys: 500 }],

    jaapuikot: [
      { x: 420, y: 230 },
      { x: 540, y: 230 },
      { x: 690, y: 230, uusiutuu: true },
      { x: 800, y: 230 },
      { x: 910, y: 230, uusiutuu: true },
      { x: 1648, y: 150 }, // keskimmäisen kiven yläpuolella
      { x: 2600, y: 110 },
      { x: 2720, y: 110, uusiutuu: true },
      { x: 2840, y: 110 },
      { x: 3180, y: 240 },
      { x: 3290, y: 240, uusiutuu: true },
      { x: 3400, y: 240 },
    ],

    nuotiot: [
      { x: 1060, lattia: 410 },
      { x: 2000, lattia: 410 },
      { x: 3540, lattia: 410 },
    ],

    jaalohkot: [
      { x: 1130, lattia: 410 }, // sisällä kolikko
      { x: 1300, lattia: 410, leveys: 40, korkeus: 180 }, // jääseinä tukkii tunnelin
      { x: 3620, lattia: 410 }, // sisällä kolikko
      { x: 3660, lattia: 410 }, // sisällä kolikko
    ],

    jouset: [{ x: 2400, lattia: 410 }],

    liikkuvatTasot: [],

    kolikot: [
      { x: 100, y: 370 },
      { x: 300, y: 370 },
      { x: 480, y: 370 },
      { x: 700, y: 370 },
      { x: 800, y: 370 },
      { x: 900, y: 370 },
      { x: 1140, y: 380 }, // jäälohkon sisällä
      { x: 1505, y: 320 },
      { x: 1785, y: 320 },
      { x: 2100, y: 370 },
      { x: 2250, y: 370 },
      { x: 2404, y: 240 }, // jousen yläpuolella
      { x: 2550, y: 210 },
      { x: 2700, y: 210 },
      { x: 2850, y: 210 },
      { x: 3020, y: 370 },
      { x: 3200, y: 370 },
      { x: 3300, y: 370 },
      { x: 3400, y: 370 },
      { x: 3630, y: 380 }, // jäälohkon sisällä
      { x: 3670, y: 380 }, // jäälohkon sisällä
      { x: 3850, y: 370 },
    ],

    viholliset: [
      { tyyppi: "pingviini", x: 380, lattia: 410, vasen: 240, oikea: 560 },
      { tyyppi: "jaahauki", x: 1565, lattia: 425, hyppy: 170, jakso: 110 },
      { tyyppi: "jaahauki", x: 1705, lattia: 425, hyppy: 170, jakso: 110, vaihe: 55 },
      // Tunturipöllön silmät kiiluvat pimeässä
      { tyyppi: "pollo", x: 2150, y: 190, vasen: 1960, oikea: 2330 },
      { tyyppi: "pingviini", x: 2750, lattia: 250, vasen: 2480, oikea: 2900 },
      { tyyppi: "pingviini", x: 3350, lattia: 410, vasen: 3120, oikea: 3460 },
      { tyyppi: "lumiukkeli", x: 3770, lattia: 410 },
    ],

    lentovihut: [],

    // Sydän keskimmäisellä kivellä, suoraan jääpuikon alla!
    sydamet: [{ x: 1642, y: 290 }],

    valitallennus: { x: 1950, lattia: 410 },
    maali: { x: 3920, lattia: 410 },
  };
}

// ---------- KENTTÄ 15: MYRSKYHARJU ----------
// Tuulenpuuskat! Vastatuulessa ei pääse kuopan yli: odota, että tyyntyy.
// Myötätuulessa taas lentää TOSI pitkälle. Katso tuulipussia!
function kentta15() {
  return {
    nimi: "Myrskyharju",
    leveys: 4200,
    tavoiteAika: 110,
    alku: { x: 40, y: 360 },
    varit: {
      taivasYla: "#5d6f8f",
      taivasAla: "#c8d4e3",
      aurinko: "#e8eef5",
      maetKauka: "#8798b5",
      maetLahi: "#b4c2d6",
      puut: "#3b5a5a",
    },
    laatat: "lumi",
    saa: ["lumi"],

    tasot: [
      // --- OSA 1: vastatuuli ja kuoppa ---
      { x: 0, y: 410, leveys: 600, korkeus: 40 },
      { x: 700, y: 410, leveys: 600, korkeus: 40 },
      // --- OSA 2: myötätuuli kantaa leveän rotkon yli ---
      { x: 1180, y: 370, leveys: 120, korkeus: 40 }, // ponnistuskoroke
      { x: 1480, y: 410, leveys: 520, korkeus: 40 },
      // --- OSA 3: pylväät vastatuulessa ---
      { x: 2080, y: 380, leveys: 80, korkeus: 70 },
      { x: 2240, y: 350, leveys: 80, korkeus: 100 },
      { x: 2400, y: 380, leveys: 80, korkeus: 70 },
      { x: 2560, y: 350, leveys: 80, korkeus: 100 },
      { x: 2720, y: 410, leveys: 380, korkeus: 40 },
      // --- OSA 4: kaksi pitkää loikkaa myötätuulessa ---
      { x: 3270, y: 410, leveys: 150, korkeus: 40 },
      { x: 3590, y: 410, leveys: 610, korkeus: 40 },
    ],

    tuulet: [
      { x: 420, leveys: 420, voima: -2.2, jakso: 240 },
      { x: 1160, leveys: 400, voima: 2.5, jakso: 240, vaihe: 60 },
      { x: 2000, leveys: 740, voima: -1.6, jakso: 200, merkkiX: 1980 },
      { x: 3040, leveys: 620, voima: 2.5, jakso: 220 },
    ],

    nuotiot: [
      { x: 1000, lattia: 410 },
      { x: 2760, lattia: 410 },
    ],

    jaalohkot: [
      { x: 1100, lattia: 410 }, // sisällä kolikko
      { x: 2900, lattia: 410 }, // sisällä sydän
    ],

    liikkuvatTasot: [],

    kolikot: [
      { x: 200, y: 370 },
      { x: 350, y: 370 },
      { x: 640, y: 300 }, // kuopan päällä
      { x: 850, y: 370 },
      { x: 1110, y: 380 }, // jäälohkon sisällä
      { x: 1230, y: 330 },
      // Kolikkokaari näyttää, miten myötätuuli kantaa
      { x: 1330, y: 280 },
      { x: 1385, y: 270 },
      { x: 1440, y: 290 },
      { x: 1650, y: 370 },
      { x: 1800, y: 370 },
      { x: 2110, y: 340 },
      { x: 2270, y: 310 },
      { x: 2430, y: 340 },
      { x: 2590, y: 310 },
      { x: 3000, y: 370 },
      { x: 3175, y: 320 },
      { x: 3335, y: 370 },
      { x: 3495, y: 320 },
      { x: 3700, y: 370 },
      { x: 3800, y: 370 },
    ],

    viholliset: [
      // Tunturipöllö syöksyy alas: väistä juoksemalla tai hyppää sen päälle!
      { tyyppi: "pollo", x: 950, y: 190, vasen: 800, oikea: 1100 },
      { tyyppi: "pingviini", x: 1750, lattia: 410, vasen: 1600, oikea: 1950 },
      { tyyppi: "pollo", x: 2850, y: 190, vasen: 2740, oikea: 3040 },
      { tyyppi: "pingviini", x: 3750, lattia: 410, vasen: 3620, oikea: 3880 },
      { tyyppi: "lumiukkeli", x: 3950, lattia: 410 },
    ],

    lentovihut: [],

    sydamet: [{ x: 2906, y: 378 }], // jäälohkon sisällä

    valitallennus: { x: 1520, lattia: 410 },
    maali: { x: 4100, lattia: 410 },
  };
}

// ---------- KENTTÄ 16: REVONTULIRINNE ----------
// Yö ja revontulet. Tässä kentässä on kaikkea: jäätä, vettä, tuulta ja jääpuikkoja!
function kentta16() {
  return {
    nimi: "Revontulirinne",
    leveys: 4400,
    tavoiteAika: 120,
    alku: { x: 40, y: 360 },
    varit: {
      taivasYla: "#06102a",
      taivasAla: "#1b3a5e",
      aurinko: "#f5f3ce", // kuu
      maetKauka: "#14294a",
      maetLahi: "#0d1c36",
      puut: "#0a1a24",
    },
    laatat: "lumi",
    saa: ["tahdet", "revontulet"],

    tasot: [
      // --- OSA 1: jäärata ja lumiukkeli ---
      { x: 0, y: 410, leveys: 500, korkeus: 40 },
      { x: 500, y: 410, leveys: 400, korkeus: 40, jaa: true },
      { x: 900, y: 410, leveys: 250, korkeus: 40 },
      // --- OSA 2: lautta, jäävuori ja ohut jää ---
      { x: 1530, y: 360, leveys: 170, korkeus: 90, jaa: true },
      { x: 1900, y: 410, leveys: 600, korkeus: 40 },
      // --- OSA 3: jääseinä ja loikka myötätuulessa ---
      { x: 2400, y: 370, leveys: 100, korkeus: 40 }, // ponnistuskoroke
      { x: 2680, y: 410, leveys: 120, korkeus: 40 },
      // --- OSA 4: jääpuikot kielekkeen alla ---
      { x: 2800, y: 410, leveys: 400, korkeus: 40, jaa: true },
      { x: 3200, y: 410, leveys: 100, korkeus: 40 },
      { x: 2780, y: 0, leveys: 440, korkeus: 220 }, // kieleke
      // --- OSA 5: pylväät vedessä vastatuulessa ---
      { x: 3380, y: 370, leveys: 80, korkeus: 80 },
      { x: 3540, y: 340, leveys: 80, korkeus: 110 },
      { x: 3700, y: 370, leveys: 80, korkeus: 80 },
      { x: 3860, y: 410, leveys: 540, korkeus: 40 },
      { x: 4000, y: 300, leveys: 120, korkeus: 20 },
    ],

    vedet: [
      { x: 1150, y: 425, leveys: 750 },
      { x: 3300, y: 425, leveys: 560 },
    ],

    liikkuvatTasot: [{ x: 1280, y: 380, leveys: 110, matkaX: 70, matkaY: 0, nopeus: 0.02 }],
    putoavatTasot: [{ x: 1770, y: 375, leveys: 70 }],

    tuulet: [
      { x: 2380, leveys: 340, voima: 2.5, jakso: 240 },
      { x: 3300, leveys: 560, voima: -1.6, jakso: 200, merkkiX: 3270 },
    ],

    jaapuikot: [
      { x: 2880, y: 220 },
      { x: 2970, y: 220, uusiutuu: true },
      { x: 3060, y: 220 },
      { x: 3150, y: 220, uusiutuu: true },
    ],

    nuotiot: [
      { x: 2000, lattia: 410 },
      { x: 3900, lattia: 410 },
    ],

    jaalohkot: [
      { x: 650, lattia: 410 }, // sisällä kolikko
      { x: 2250, lattia: 410, leveys: 40, korkeus: 170 }, // jääseinä
      { x: 4040, lattia: 300 }, // sisällä sydän
    ],

    kolikot: [
      { x: 200, y: 370 },
      { x: 560, y: 370 },
      { x: 660, y: 380 }, // jäälohkon sisällä
      { x: 780, y: 370 },
      { x: 960, y: 370 },
      { x: 1325, y: 330 },
      { x: 1580, y: 320 },
      { x: 1650, y: 320 },
      { x: 1795, y: 325 },
      { x: 2100, y: 370 },
      { x: 2180, y: 370 },
      { x: 2440, y: 330 },
      { x: 2540, y: 270 },
      { x: 2600, y: 280 },
      { x: 2900, y: 370 },
      { x: 3000, y: 370 },
      { x: 3100, y: 370 },
      { x: 3410, y: 330 },
      { x: 3570, y: 300 },
      { x: 3730, y: 330 },
      { x: 4200, y: 370 },
    ],

    viholliset: [
      { tyyppi: "pingviini", x: 320, lattia: 410, vasen: 160, oikea: 460 },
      { tyyppi: "lumiukkeli", x: 1090, lattia: 410 },
      { tyyppi: "jaahauki", x: 1485, lattia: 425, hyppy: 180, jakso: 110 },
      { tyyppi: "pollo", x: 2100, y: 180, vasen: 1960, oikea: 2220 },
      { tyyppi: "pingviini", x: 2320, lattia: 410, vasen: 2295, oikea: 2372 }, // vartija jääseinän takana
      { tyyppi: "pingviini", x: 3000, lattia: 410, vasen: 2820, oikea: 3160 },
      { tyyppi: "jaahauki", x: 3489, lattia: 425, hyppy: 190, jakso: 110 },
      { tyyppi: "jaahauki", x: 3649, lattia: 425, hyppy: 190, jakso: 110, vaihe: 55 },
      { tyyppi: "pollo", x: 4150, y: 150, vasen: 3920, oikea: 4260 },
      { tyyppi: "lumiukkeli", x: 4230, lattia: 410 },
    ],

    lentovihut: [],

    sydamet: [{ x: 4046, y: 268 }], // jäälohkon sisällä

    valitallennus: { x: 1950, lattia: 410 },
    maali: { x: 4330, lattia: 410 },
  };
}

// ---------- KENTTÄ 17: PAKKASUKON LINNA ----------
// Pomokenttä! Katso ohjeet tiedostosta pakkasukko.js.
function kentta17() {
  return {
    nimi: "Pakkasukon linna",
    leveys: 2600,
    tavoiteAika: 150,
    alku: { x: 40, y: 360 },
    varit: {
      taivasYla: "#101c3c",
      taivasAla: "#4a6ea8",
      aurinko: "#dfe9ff", // kuu
      maetKauka: "#243a66",
      maetLahi: "#1a2a4d",
      puut: null,
    },
    laatat: "lumi",
    saa: ["tahdet", "revontulet", "lumi"],

    tasot: [
      { x: 0, y: 410, leveys: 300, korkeus: 40 },
      // Kiviä hyisessä vedessä
      { x: 370, y: 370, leveys: 70, korkeus: 80 },
      { x: 500, y: 330, leveys: 70, korkeus: 120 },
      { x: 630, y: 370, leveys: 70, korkeus: 80 },
      { x: 760, y: 330, leveys: 70, korkeus: 120 },
      { x: 890, y: 370, leveys: 70, korkeus: 80 },
      { x: 1020, y: 340, leveys: 70, korkeus: 110 },
      // Areena
      { x: 1140, y: 410, leveys: 1360, korkeus: 40 },
      { x: 2500, y: 60, leveys: 100, korkeus: 390 }, // areenan oikea seinä
      // Tasoille pääsee viimaa pakoon. Pakkasukko liikkuu vain tasojen välissä,
      // joten sen päälle pääsee aina hyppäämään.
      { x: 1570, y: 300, leveys: 130, korkeus: 20 },
      { x: 2240, y: 300, leveys: 130, korkeus: 20 },
    ],

    vedet: [{ x: 300, y: 425, leveys: 840 }],

    // Nuotiot areenan molemmissa päissä: täältä saa tulta panssarin sulattamiseen
    nuotiot: [
      { x: 1486, lattia: 410 },
      { x: 2440, lattia: 410 },
    ],

    liikkuvatTasot: [],

    kolikot: [
      { x: 395, y: 320 },
      { x: 525, y: 280 },
      { x: 655, y: 320 },
      { x: 785, y: 280 },
      { x: 915, y: 320 },
      { x: 1045, y: 290 },
      { x: 1250, y: 370 },
    ],

    viholliset: [
      { tyyppi: "jaahauki", x: 465, lattia: 425, hyppy: 200, jakso: 100 },
      { tyyppi: "jaahauki", x: 725, lattia: 425, hyppy: 200, jakso: 100, vaihe: 50 },
      { tyyppi: "jaahauki", x: 985, lattia: 425, hyppy: 200, jakso: 100 },
    ],

    lentovihut: [],

    // PAKKASUKKO herää, kun pelaaja tulee areenalle
    pomo: {
      tyyppi: "pakkas",
      x: 2100,
      lattia: 410,
      vasen: 1720, // Pakkasukko liikkuu tällä välillä (tasojen välissä)
      oikea: 2184,
      areenaVasen: 1480, // pingviinit liikkuvat koko areenalla
      areenaOikea: 2460,
      alue: 1560,
      katto: 0, // tästä korkeudesta jääpuikot putoavat
      // Portti ulottuu ruudun yläreunan yli, ettei sen yli voi hypätä
      portti: { x: 1440, y: -400, leveys: 32, korkeus: 810 },
    },

    sydamet: [{ x: 1622, y: 262 }],

    valitallennus: { x: 1200, lattia: 410 },
    maali: { x: 2380, lattia: 410 },
  };
}

// Lisätään maailman 3 kentät kenttälistaan
KENTAT.push(kentta12, kentta13, kentta14, kentta15, kentta16, kentta17);

// Kenttien paikat Pakkassaaren kartalla
KARTTA.push(
  { x: 95, y: 290 }, // kenttä 12
  { x: 220, y: 190 }, // kenttä 13
  { x: 345, y: 300 }, // kenttä 14
  { x: 465, y: 195 }, // kenttä 15
  { x: 585, y: 295 }, // kenttä 16
  { x: 705, y: 265 }, // kenttä 17 (pomo)
);

MAAILMAT.push({
  nimi: "Pakkassaari",
  alku: 11,
  loppu: 16,
  tyyli: "pakkanen",
  // Lumiset kuuset kartalla
  puut: [
    { x: 150, y: 215 },
    { x: 290, y: 340 },
    { x: 330, y: 135 },
    { x: 420, y: 345 },
    { x: 560, y: 150 },
    { x: 250, y: 260 },
  ],
});
