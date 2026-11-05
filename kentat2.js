// ==========================================
//   MAAILMA 2: TULIVUORISAARI
//   Kuusi kenttää: viisi tavallista ja pomo Magmamörkö.
//   Uudet asiat (katso tulivuori.js):
//     laavat       = x, y (laavan pinta), leveys. Laavaan ei saa pudota!
//     tulisuihkut  = x ja lattia (liekki nousee) tai katto (liekki tulee alas),
//                    korkeus, jakso (kuinka usein) ja vaihe (milloin aloittaa)
//     tykit        = x, lattia, suunta (-1 = vasemmalle, 1 = oikealle), jakso, vaihe
//     vihu "laavapallo" = x, lattia (laavan pinta), hyppy (korkeus), jakso, vaihe
//     laatat: "kivi" = tulivuoren kivilaatat
//   Tulivuoren vihut (katso tulivihut.js): "kekale", "laavaetana" ja "salamanteri"
// ==========================================

// Tulivuorisaaren värit (kaikissa kentissä vähän erilaiset)
const TULIVUORI_VARIT = {
  taivasYla: "#2a0f1f",
  taivasAla: "#b8411c",
  aurinko: "#ffb347",
  maetKauka: "#4a1f1f",
  maetLahi: "#2e1414",
  puut: null, // ei kuusia tulivuorella
};

// ---------- KENTTÄ 6: TUHKARINNE ----------
// Ensimmäinen tulivuorikenttä: laavakuoppia ja laavapalloja
function kentta6() {
  return {
    nimi: "Tuhkarinne",
    leveys: 3800,
    tavoiteAika: 75,
    alku: { x: 40, y: 360 },
    varit: TULIVUORI_VARIT,
    laatat: "kivi",
    saa: ["kipinat"],
    tulivuoriTausta: true,

    tasot: [
      // --- OSA 1: ensimmäinen laavakuoppa ---
      { x: 0, y: 410, leveys: 500, korkeus: 40 },
      { x: 620, y: 410, leveys: 380, korkeus: 40 },
      // --- OSA 2: kiviä laavajärvessä ---
      { x: 1080, y: 370, leveys: 60, korkeus: 80 },
      { x: 1210, y: 330, leveys: 60, korkeus: 120 },
      { x: 1340, y: 370, leveys: 60, korkeus: 80 },
      { x: 1470, y: 320, leveys: 60, korkeus: 130 },
      { x: 1600, y: 410, leveys: 400, korkeus: 40 },
      // --- OSA 4: jousi korkean seinän yli ---
      { x: 2700, y: 410, leveys: 550, korkeus: 40 },
      { x: 3250, y: 180, leveys: 50, korkeus: 230 }, // korkea seinä
      { x: 3300, y: 410, leveys: 500, korkeus: 40 },
    ],

    laavat: [
      { x: 500, y: 425, leveys: 120 },
      { x: 1000, y: 425, leveys: 600 },
      { x: 2000, y: 425, leveys: 700 },
    ],

    liikkuvatTasot: [
      // --- OSA 3: liikkuva taso laavan yli ---
      { x: 2200, y: 360, leveys: 90, matkaX: 120, matkaY: 0, nopeus: 0.02 },
    ],
    putoavatTasot: [
      { x: 2420, y: 330, leveys: 70 },
      { x: 2560, y: 300, leveys: 70 },
    ],
    jouset: [{ x: 3170, lattia: 410 }],

    kolikot: [
      { x: 250, y: 370 },
      { x: 550, y: 300 }, // laavakuopan päällä
      { x: 750, y: 370 },
      { x: 1100, y: 320 },
      { x: 1230, y: 280 },
      { x: 1360, y: 320 },
      { x: 1490, y: 270 },
      { x: 1800, y: 370 },
      { x: 2245, y: 300 },
      { x: 2445, y: 280 },
      { x: 2585, y: 250 },
      { x: 2900, y: 370 },
      { x: 3000, y: 370 },
      { x: 3500, y: 370 },
      { x: 3600, y: 370 },
    ],

    viholliset: [
      { tyyppi: "kekale", x: 750, lattia: 410, vasen: 650, oikea: 950 },
      // Laavapallot hyppäävät laavasta: ajoita hyppy!
      { tyyppi: "laavapallo", x: 547, lattia: 425, hyppy: 170, jakso: 100 },
      { tyyppi: "laavapallo", x: 1162, lattia: 425, hyppy: 190, jakso: 110, vaihe: 30 },
      { tyyppi: "laavapallo", x: 1418, lattia: 425, hyppy: 190, jakso: 110, vaihe: 85 },
      { tyyppi: "salamanteri", x: 1850, lattia: 410, vasen: 1650, oikea: 1960 },
      { tyyppi: "laavapallo", x: 2510, lattia: 425, hyppy: 220, jakso: 120 },
      { tyyppi: "laavaetana", x: 2850, lattia: 410, vasen: 2750, oikea: 3000 },
      { tyyppi: "kekale", x: 3500, lattia: 410, vasen: 3350, oikea: 3700 },
    ],

    lentovihut: [],

    // Sydän korkean seinän päällä: jousella pitää ohjata tarkasti!
    sydamet: [{ x: 3262, y: 135 }],

    valitallennus: { x: 1680, lattia: 410 },
    maali: { x: 3720, lattia: 410 },
  };
}

// ---------- KENTTÄ 7: LAAVAJOKI ----------
// Melkein koko kenttä on laavaa: hypi saarelta toiselle
function kentta7() {
  return {
    nimi: "Laavajoki",
    leveys: 4200,
    tavoiteAika: 95,
    alku: { x: 40, y: 360 },
    varit: { ...TULIVUORI_VARIT, taivasAla: "#d4561c", aurinko: "#ffd27f" },
    laatat: "kivi",
    saa: ["kipinat"],
    tulivuoriTausta: true,

    tasot: [
      { x: 0, y: 410, leveys: 350, korkeus: 40 },
      { x: 600, y: 380, leveys: 120, korkeus: 70 }, // saari 1
      { x: 1240, y: 370, leveys: 160, korkeus: 80 }, // saari 2
      { x: 1810, y: 390, leveys: 320, korkeus: 60 }, // saari 3 (välitallennus)
      // Kivipylväät
      { x: 2200, y: 330, leveys: 50, korkeus: 120 },
      { x: 2320, y: 280, leveys: 50, korkeus: 170 },
      { x: 2440, y: 230, leveys: 50, korkeus: 220 },
      { x: 2560, y: 280, leveys: 50, korkeus: 170 },
      { x: 2680, y: 330, leveys: 50, korkeus: 120 },
      { x: 2800, y: 400, leveys: 200, korkeus: 50 }, // saari 4
      { x: 3530, y: 410, leveys: 670, korkeus: 40 }, // ranta
    ],

    laavat: [{ x: 350, y: 425, leveys: 3180 }],

    liikkuvatTasot: [
      { x: 420, y: 360, leveys: 80, matkaX: 0, matkaY: 50, nopeus: 0.03 },
      { x: 1550, y: 350, leveys: 100, matkaX: 110, matkaY: 0, nopeus: 0.018 },
      // Hissit: nousevat ja laskevat
      { x: 3080, y: 300, leveys: 70, matkaX: 0, matkaY: 70, nopeus: 0.03 },
      { x: 3230, y: 300, leveys: 70, matkaX: 0, matkaY: 70, nopeus: 0.03 },
      { x: 3380, y: 300, leveys: 70, matkaX: 0, matkaY: 70, nopeus: 0.03 },
    ],
    putoavatTasot: [
      { x: 790, y: 340, leveys: 60 },
      { x: 900, y: 300, leveys: 60 },
      { x: 1010, y: 340, leveys: 60 },
      { x: 1120, y: 300, leveys: 60 },
    ],

    kolikot: [
      { x: 450, y: 280 },
      { x: 650, y: 330 },
      { x: 810, y: 290 },
      { x: 920, y: 250 },
      { x: 1030, y: 290 },
      { x: 1140, y: 250 },
      { x: 1310, y: 320 },
      { x: 1600, y: 290 },
      { x: 1950, y: 350 },
      { x: 2050, y: 350 },
      { x: 2215, y: 280 },
      { x: 2335, y: 230 },
      { x: 2455, y: 180 },
      { x: 2575, y: 230 },
      { x: 2695, y: 280 },
      { x: 2900, y: 350 },
      { x: 3105, y: 230 },
      { x: 3255, y: 230 },
      { x: 3405, y: 230 },
      { x: 3800, y: 370 },
    ],

    viholliset: [
      { tyyppi: "laavapallo", x: 535, lattia: 425, hyppy: 200, jakso: 110 },
      { tyyppi: "laavapallo", x: 860, lattia: 425, hyppy: 230, jakso: 120, vaihe: 40 },
      { tyyppi: "laavapallo", x: 1080, lattia: 425, hyppy: 230, jakso: 120, vaihe: 100 },
      { tyyppi: "kekale", x: 2050, lattia: 390, vasen: 1970, oikea: 2100 },
      { tyyppi: "laavapallo", x: 1407, lattia: 425, hyppy: 220, jakso: 140 },
      { tyyppi: "laavapallo", x: 1772, lattia: 425, hyppy: 220, jakso: 140, vaihe: 70 },
      { tyyppi: "laavapallo", x: 2265, lattia: 425, hyppy: 260, jakso: 130 },
      { tyyppi: "laavapallo", x: 2505, lattia: 425, hyppy: 260, jakso: 130, vaihe: 65 },
      { tyyppi: "laavapallo", x: 2625, lattia: 425, hyppy: 260, jakso: 130, vaihe: 30 },
      { tyyppi: "laavaetana", x: 2880, lattia: 400, vasen: 2810, oikea: 2960 },
      { tyyppi: "laavapallo", x: 3170, lattia: 425, hyppy: 240, jakso: 120 },
      { tyyppi: "laavapallo", x: 3320, lattia: 425, hyppy: 240, jakso: 120, vaihe: 60 },
      { tyyppi: "salamanteri", x: 3900, lattia: 410, vasen: 3700, oikea: 4050 },
    ],

    lentovihut: [],

    // Sydän pylväiden välissä aivan laavan yllä. Sieltä pääsee pois vain seinähypyillä!
    sydamet: [{ x: 2392, y: 372 }],

    valitallennus: { x: 1880, lattia: 390 },
    maali: { x: 4100, lattia: 410 },
  };
}

// ---------- KENTTÄ 8: TYKKILINNAKE ----------
// Linnake, jonka tykit ampuvat kuulia. Hyppää kuulien yli tai niiden päälle!
function kentta8() {
  return {
    nimi: "Tykkilinnake",
    leveys: 4000,
    tavoiteAika: 95,
    alku: { x: 40, y: 360 },
    varit: { ...TULIVUORI_VARIT, taivasYla: "#1f0f2a", taivasAla: "#8a3020" },
    laatat: "kivi",
    saa: ["kipinat"],
    tulivuoriTausta: true,

    tasot: [
      // --- OSA 1: tykki ja linnakkeen muuri ---
      { x: 0, y: 410, leveys: 960, korkeus: 40 },
      { x: 560, y: 300, leveys: 100, korkeus: 20 },
      { x: 780, y: 170, leveys: 40, korkeus: 150 }, // roikkuva seinä
      { x: 900, y: 170, leveys: 60, korkeus: 240 }, // muuri
      // --- OSA 2: muurin harja ---
      { x: 960, y: 170, leveys: 540, korkeus: 20 },
      // --- OSA 3: linnan piha ---
      { x: 1500, y: 410, leveys: 1000, korkeus: 40 },
      { x: 1890, y: 300, leveys: 100, korkeus: 20 },
      { x: 2070, y: 250, leveys: 100, korkeus: 20 },
      // --- OSA 4: torni ---
      { x: 2380, y: 110, leveys: 40, korkeus: 200 }, // roikkuva seinä
      { x: 2500, y: 110, leveys: 60, korkeus: 340 }, // torni
      // --- OSA 5: tasoja laavan yllä, tykki ampuu vastaan ---
      { x: 2620, y: 330, leveys: 80, korkeus: 20 },
      { x: 2760, y: 290, leveys: 80, korkeus: 20 },
      { x: 2900, y: 330, leveys: 80, korkeus: 20 },
      { x: 3040, y: 290, leveys: 80, korkeus: 20 },
      { x: 3180, y: 330, leveys: 80, korkeus: 20 },
      { x: 3300, y: 300, leveys: 120, korkeus: 150 },
      { x: 3420, y: 410, leveys: 580, korkeus: 40 },
    ],

    laavat: [
      { x: 960, y: 425, leveys: 540 },
      { x: 2560, y: 425, leveys: 740 },
    ],

    tykit: [
      { x: 740, lattia: 410, suunta: -1, jakso: 140 },
      { x: 1400, lattia: 170, suunta: -1, jakso: 120 }, // muurin harjalla
      { x: 1820, lattia: 410, suunta: 1, jakso: 150 },
      { x: 2300, lattia: 410, suunta: -1, jakso: 150, vaihe: 75 },
      { x: 3330, lattia: 300, suunta: -1, jakso: 110 },
      { x: 3850, lattia: 410, suunta: -1, jakso: 130 },
    ],

    // Piha: kallio, jonka sisällä on salainen luola
    salaisetLuolat: [{ x: 1580, lattia: 410, leveys: 140, korkeus: 100, aukko: "oikea" }],

    liikkuvatTasot: [],

    kolikot: [
      { x: 300, y: 370 },
      { x: 600, y: 260 },
      { x: 850, y: 300 },
      { x: 850, y: 220 },
      { x: 1050, y: 130 },
      { x: 1200, y: 130 },
      { x: 1640, y: 375 }, // salaisessa luolassa
      { x: 1930, y: 260 },
      { x: 2110, y: 210 },
      { x: 2440, y: 260 },
      { x: 2440, y: 180 },
      { x: 2650, y: 290 },
      { x: 2790, y: 250 },
      { x: 2930, y: 290 },
      { x: 3070, y: 250 },
      { x: 3210, y: 290 },
      { x: 3600, y: 370 },
      { x: 3700, y: 370 },
    ],

    viholliset: [
      { tyyppi: "kekale", x: 300, lattia: 410, vasen: 150, oikea: 500 },
      { tyyppi: "salamanteri", x: 1150, lattia: 170, vasen: 1000, oikea: 1340 }, // muurin harjalla
      { tyyppi: "kekale", x: 2050, lattia: 410, vasen: 1900, oikea: 2250, nopeus: 1.4 },
      { tyyppi: "laavaetana", x: 3600, lattia: 410, vasen: 3450, oikea: 3800 },
    ],

    lentovihut: [],

    sydamet: [{ x: 1600, y: 372 }],

    valitallennus: { x: 1760, lattia: 410 },
    maali: { x: 3920, lattia: 410 },
  };
}

// ---------- KENTTÄ 9: LIEKKILUOLAT ----------
// Pimeä luola, jossa liekkisuihkut syttyvät vuorotellen
function kentta9() {
  return {
    nimi: "Liekkiluolat",
    leveys: 3800,
    tavoiteAika: 95,
    alku: { x: 40, y: 360 },
    varit: {
      taivasYla: "#0d0608",
      taivasAla: "#3a1210",
      aurinko: "#3a1210",
      maetKauka: "#1f0d0d",
      maetLahi: "#160909",
      puut: null,
    },
    laatat: "kivi",
    luola: true, // ei aurinkoa eikä pilviä
    pimeys: 0.62,

    tasot: [
      { x: 0, y: 0, leveys: 3800, korkeus: 60 }, // luolan katto
      // --- OSA 1: liekkisuihkuja lattiassa ---
      { x: 0, y: 410, leveys: 1000, korkeus: 40 },
      // --- OSA 2: matala käytävä ---
      { x: 600, y: 60, leveys: 400, korkeus: 250 },
      // --- OSA 3: laavasali ---
      { x: 1060, y: 350, leveys: 80, korkeus: 100 },
      { x: 1200, y: 300, leveys: 80, korkeus: 150 },
      { x: 1340, y: 350, leveys: 80, korkeus: 100 },
      { x: 1480, y: 300, leveys: 80, korkeus: 150 },
      { x: 1620, y: 350, leveys: 80, korkeus: 100 },
      { x: 1760, y: 410, leveys: 620, korkeus: 40 },
      // --- OSA 4: savupiippu ylös yläkäytävään ---
      { x: 2260, y: 60, leveys: 40, korkeus: 260 }, // roikkuva seinä
      { x: 2380, y: 180, leveys: 60, korkeus: 270 },
      { x: 2440, y: 180, leveys: 700, korkeus: 20 }, // yläkäytävän lattia
      // --- OSA 5: ulos ---
      { x: 3140, y: 410, leveys: 660, korkeus: 40 },
    ],

    laavat: [
      { x: 900, y: 425, leveys: 70 }, // käytävän kuoppa
      { x: 1000, y: 425, leveys: 760 },
      { x: 2440, y: 425, leveys: 700 },
    ],

    tulisuihkut: [
      { x: 300, lattia: 410, jakso: 160 },
      { x: 450, lattia: 410, jakso: 160, vaihe: 80 },
      { x: 780, lattia: 410, korkeus: 90, jakso: 150 }, // matalassa käytävässä
      { x: 1228, katto: 60, korkeus: 230, jakso: 170 }, // katosta alas!
      { x: 1508, katto: 60, korkeus: 230, jakso: 170, vaihe: 85 },
      { x: 2600, lattia: 180, korkeus: 120, jakso: 150 },
      { x: 2800, lattia: 180, korkeus: 120, jakso: 150, vaihe: 50 },
      { x: 3000, lattia: 180, korkeus: 120, jakso: 150, vaihe: 100 },
      { x: 3400, lattia: 410, jakso: 140 },
      { x: 3480, lattia: 410, jakso: 140, vaihe: 70 },
    ],

    // Alussa on kallio, jonka sisällä on salainen luola
    salaisetLuolat: [{ x: 120, lattia: 410, leveys: 120, korkeus: 100, aukko: "oikea" }],

    liikkuvatTasot: [],

    kolikot: [
      { x: 180, y: 375 }, // salaisessa luolassa
      { x: 375, y: 370 },
      { x: 700, y: 370 },
      { x: 935, y: 340 }, // kuopan päällä
      { x: 1090, y: 300 },
      { x: 1230, y: 250 },
      { x: 1370, y: 300 },
      { x: 1510, y: 250 },
      { x: 1650, y: 300 },
      { x: 2000, y: 370 },
      { x: 2330, y: 280 },
      { x: 2330, y: 200 },
      { x: 2520, y: 140 },
      { x: 2700, y: 140 },
      { x: 2900, y: 140 },
      { x: 3080, y: 140 },
      { x: 3300, y: 370 },
      { x: 3600, y: 370 },
    ],

    viholliset: [
      { tyyppi: "laavapallo", x: 922, lattia: 425, hyppy: 70, jakso: 90 },
      { tyyppi: "laavapallo", x: 1160, lattia: 425, hyppy: 200, jakso: 120 },
      { tyyppi: "laavapallo", x: 1440, lattia: 425, hyppy: 200, jakso: 120, vaihe: 60 },
      { tyyppi: "laavaetana", x: 2000, lattia: 410, vasen: 1850, oikea: 2120 },
      { tyyppi: "salamanteri", x: 2850, lattia: 180, vasen: 2650, oikea: 3090 }, // yläkäytävässä
      { tyyppi: "kekale", x: 3600, lattia: 410, vasen: 3550, oikea: 3700 },
    ],

    lentovihut: [],

    sydamet: [{ x: 140, y: 380 }],

    valitallennus: { x: 1800, lattia: 410 },
    maali: { x: 3720, lattia: 410 },
  };
}

// ---------- KENTTÄ 10: KRAATTERIN REUNA ----------
// Vaikein kenttä: kaikki tulivuoren vaarat yhdessä
function kentta10() {
  return {
    nimi: "Kraatterin reuna",
    leveys: 4600,
    tavoiteAika: 120,
    alku: { x: 40, y: 360 },
    varit: { ...TULIVUORI_VARIT, taivasYla: "#1a0505", taivasAla: "#e0501a" },
    laatat: "kivi",
    saa: ["kipinat"],
    tulivuoriTausta: true,

    tasot: [
      { x: 0, y: 410, leveys: 300, korkeus: 40 },
      // --- OSA 2: tykki, kuilu ja silta ---
      { x: 920, y: 410, leveys: 540, korkeus: 40 },
      { x: 1340, y: 140, leveys: 40, korkeus: 180 }, // roikkuva seinä
      { x: 1460, y: 140, leveys: 60, korkeus: 310 }, // torni
      { x: 1520, y: 140, leveys: 400, korkeus: 20 }, // silta
      { x: 1960, y: 300, leveys: 120, korkeus: 150 },
      { x: 2080, y: 410, leveys: 420, korkeus: 40 },
      // --- OSA 4: jousi ja korkea taso ---
      { x: 3340, y: 410, leveys: 460, korkeus: 40 },
      { x: 3540, y: 170, leveys: 200, korkeus: 20 },
      { x: 3800, y: 410, leveys: 800, korkeus: 40 },
    ],

    laavat: [
      { x: 300, y: 425, leveys: 620 },
      { x: 1520, y: 425, leveys: 440 },
      { x: 2500, y: 425, leveys: 840 },
    ],

    liikkuvatTasot: [
      // Hissit eri tahdissa
      { x: 2560, y: 330, leveys: 70, matkaX: 0, matkaY: 60, nopeus: 0.035 },
      { x: 2700, y: 290, leveys: 70, matkaX: 0, matkaY: 80, nopeus: 0.028 },
      { x: 2840, y: 320, leveys: 70, matkaX: 0, matkaY: 60, nopeus: 0.04 },
    ],
    putoavatTasot: [
      // OSA 1: putoavat tasot laavan yllä
      { x: 360, y: 360, leveys: 60 },
      { x: 480, y: 320, leveys: 60 },
      { x: 600, y: 280, leveys: 60 },
      { x: 720, y: 320, leveys: 60 },
      { x: 840, y: 360, leveys: 60 },
      // OSA 3
      { x: 2980, y: 300, leveys: 60 },
      { x: 3100, y: 260, leveys: 60 },
      { x: 3220, y: 300, leveys: 60 },
    ],
    jouset: [{ x: 3450, lattia: 410 }],

    tykit: [
      { x: 1250, lattia: 410, suunta: -1, jakso: 130 },
      { x: 1880, lattia: 140, suunta: -1, jakso: 110 }, // sillan päässä
      { x: 4300, lattia: 410, suunta: -1, jakso: 120 },
    ],

    tulisuihkut: [
      { x: 1408, lattia: 410, korkeus: 100, jakso: 150 }, // kuilun pohjalla
      { x: 3590, lattia: 170, korkeus: 110, jakso: 140 },
      { x: 3670, lattia: 170, korkeus: 110, jakso: 140, vaihe: 70 },
    ],

    // Korkean tason alla on kallio, jossa on salainen luola
    salaisetLuolat: [{ x: 3560, lattia: 410, leveys: 140, korkeus: 120, aukko: "oikea" }],

    kolikot: [
      { x: 150, y: 370 },
      { x: 380, y: 310 },
      { x: 500, y: 270 },
      { x: 620, y: 230 },
      { x: 740, y: 270 },
      { x: 860, y: 310 },
      { x: 1100, y: 370 },
      { x: 1400, y: 300 },
      { x: 1400, y: 220 },
      { x: 1650, y: 100 },
      { x: 1800, y: 100 },
      { x: 2200, y: 370 },
      { x: 2585, y: 250 },
      { x: 2725, y: 200 },
      { x: 2865, y: 240 },
      { x: 3000, y: 250 },
      { x: 3120, y: 210 },
      { x: 3240, y: 250 },
      { x: 3610, y: 380 }, // salaisessa luolassa
      { x: 3630, y: 130 },
      { x: 4000, y: 370 },
      { x: 4450, y: 370 },
    ],

    viholliset: [
      { tyyppi: "laavapallo", x: 430, lattia: 425, hyppy: 220, jakso: 110 },
      { tyyppi: "laavapallo", x: 670, lattia: 425, hyppy: 240, jakso: 110, vaihe: 55 },
      { tyyppi: "kekale", x: 1050, lattia: 410, vasen: 950, oikea: 1200 },
      { tyyppi: "salamanteri", x: 1700, lattia: 140, vasen: 1540, oikea: 1830 }, // sillalla
      { tyyppi: "laavaetana", x: 2300, lattia: 410, vasen: 2150, oikea: 2380 },
      { tyyppi: "laavapallo", x: 2660, lattia: 425, hyppy: 250, jakso: 120 },
      { tyyppi: "laavapallo", x: 2800, lattia: 425, hyppy: 250, jakso: 120, vaihe: 60 },
      { tyyppi: "laavapallo", x: 3060, lattia: 425, hyppy: 260, jakso: 115, vaihe: 20 },
      { tyyppi: "laavapallo", x: 3170, lattia: 425, hyppy: 260, jakso: 115, vaihe: 80 },
      { tyyppi: "kekale", x: 4000, lattia: 410, vasen: 3850, oikea: 4200, nopeus: 1.5 },
      { tyyppi: "salamanteri", x: 4100, lattia: 410, vasen: 3900, oikea: 4250 },
    ],

    lentovihut: [],

    sydamet: [{ x: 3640, y: 375 }],

    valitallennus: { x: 2150, lattia: 410 },
    maali: { x: 4520, lattia: 410 },
  };
}

// ---------- KENTTÄ 11: POMO MAGMAMÖRKÖ ----------
function kentta11() {
  return {
    nimi: "Magmamörkön kraatteri",
    leveys: 2600,
    tavoiteAika: 120,
    alku: { x: 40, y: 360 },
    varit: { ...TULIVUORI_VARIT, taivasYla: "#120306", taivasAla: "#7a1c0c" },
    laatat: "kivi",
    saa: ["kipinat"],
    pimeys: 0.3,

    tasot: [
      { x: 0, y: 410, leveys: 300, korkeus: 40 },
      // Kiviä laavassa
      { x: 370, y: 370, leveys: 70, korkeus: 80 },
      { x: 500, y: 330, leveys: 70, korkeus: 120 },
      { x: 630, y: 370, leveys: 70, korkeus: 80 },
      { x: 760, y: 330, leveys: 70, korkeus: 120 },
      { x: 890, y: 370, leveys: 70, korkeus: 80 },
      { x: 1020, y: 340, leveys: 70, korkeus: 110 },
      // Areena
      { x: 1140, y: 410, leveys: 1360, korkeus: 40 },
      { x: 2500, y: 60, leveys: 100, korkeus: 390 }, // areenan oikea seinä
      { x: 1560, y: 300, leveys: 110, korkeus: 20 },
      { x: 2290, y: 300, leveys: 110, korkeus: 20 },
      { x: 1925, y: 220, leveys: 110, korkeus: 20 },
    ],

    laavat: [{ x: 300, y: 425, leveys: 840 }],

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
      { tyyppi: "laavapallo", x: 465, lattia: 425, hyppy: 200, jakso: 100 },
      { tyyppi: "laavapallo", x: 725, lattia: 425, hyppy: 200, jakso: 100, vaihe: 50 },
      { tyyppi: "laavapallo", x: 985, lattia: 425, hyppy: 200, jakso: 100 },
    ],

    lentovihut: [],

    // MAGMAMÖRKÖ herää, kun pelaaja tulee areenalle
    pomo: {
      tyyppi: "magma",
      x: 2100,
      lattia: 410,
      vasen: 1490,
      oikea: 2390,
      alue: 1560,
      portti: { x: 1440, y: 200, leveys: 32, korkeus: 210 },
    },

    sydamet: [{ x: 1965, y: 180 }],

    valitallennus: { x: 1200, lattia: 410 },
    maali: { x: 2420, lattia: 410 },
  };
}

// Lisätään maailman 2 kentät kenttälistaan
KENTAT.push(kentta6, kentta7, kentta8, kentta9, kentta10, kentta11);

// Kenttien paikat Tulivuorisaaren kartalla
KARTTA.push(
  { x: 90, y: 300 }, // kenttä 6
  { x: 220, y: 200 }, // kenttä 7
  { x: 350, y: 310 }, // kenttä 8
  { x: 470, y: 190 }, // kenttä 9
  { x: 590, y: 300 }, // kenttä 10
  { x: 710, y: 280 }, // kenttä 11 (pomo)
);

// MAAILMAT: mitkä kentät kuuluvat mihinkin maailmaan (kenttien numerot alkavat nollasta)
const MAAILMAT = [
  { nimi: "Vihreä saari", alku: 0, loppu: 4, tyyli: "nurmi" },
  {
    nimi: "Tulivuorisaari",
    alku: 5,
    loppu: 10,
    tyyli: "tulivuori",
    kivet: [
      { x: 150, y: 250 },
      { x: 300, y: 130 },
      { x: 420, y: 350 },
      { x: 560, y: 150 },
      { x: 260, y: 340 },
    ],
  },
];
