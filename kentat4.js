// ==========================================
//   MAAILMA 4: AAVIKKOSAARI
//   Kuusi kenttää: viisi tavallista ja pomo Hiekkamato.
//   Uudet asiat (katso aavikko.js):
//     laatat: "hiekka" = hiekkaa ja hiekkakivitiiliä
//     paahde: 1        = aurinko paahtaa (isompi luku = kuumempi). Varjossa pitää levätä!
//     juoksuhiekat     = x ja leveys. Ukko uppoaa! Kivet hiekassa ovat tavallisia tasoja.
//     palmut           = x ja lattia. Palmun alla on varjoa.
//     varjopilvet      = x, matka (kuinka kauas pilvi liikkuu), nopeus ja vaihe.
//                        Pilven alla on varjoa, ja se liikkuu: kulje sen mukana!
//     kangastukset     = x, y ja leveys. Näyttää tasolta, mutta haihtuu lähellä.
//     soihdut          = x ja y. Valaisevat pimeää pyramidia.
//   Aavikon vihut (katso aavikkovihut.js):
//     "kaktus", "skorpioni", "pyorre" ja "muumio"
// ==========================================

// Aavikon värit (dyynit ovat "mäkiä", ja kuusia ei ole)
const AAVIKKO_VARIT = {
  taivasYla: "#3f9fe0",
  taivasAla: "#ffe9b8",
  aurinko: "#fff7c9",
  maetKauka: "#e9c98a",
  maetLahi: "#d9a860",
  puut: null,
};

// Pyramidin ja madon pesän värit: hämärää hiekkakiveä
const PYRAMIDI_VARIT = {
  taivasYla: "#241708",
  taivasAla: "#5a3d1e",
  aurinko: "#241708",
  maetKauka: "#3a2814",
  maetLahi: "#4a3319",
  puut: null,
};

// ---------- KENTTÄ 18: DYYNIT ----------
// Ensimmäinen aavikkokenttä: paahde, palmujen varjo, kaktukset ja ensimmäinen juoksuhiekka
function kentta18() {
  return {
    nimi: "Dyynit",
    leveys: 3800,
    tavoiteAika: 80,
    alku: { x: 40, y: 360 },
    varit: AAVIKKO_VARIT,
    laatat: "hiekka",
    paahde: 1,

    tasot: [
      { x: 0, y: 410, leveys: 700, korkeus: 40 },
      { x: 840, y: 410, leveys: 660, korkeus: 40 },
      { x: 1500, y: 350, leveys: 200, korkeus: 100 }, // dyyni
      { x: 1700, y: 410, leveys: 600, korkeus: 40 },
      { x: 2395, y: 390, leveys: 70, korkeus: 60 }, // kivi juoksuhiekassa
      { x: 2560, y: 410, leveys: 1240, korkeus: 40 },
      // Tasojen alla on varjoa
      { x: 1050, y: 320, leveys: 120, korkeus: 20 },
      { x: 3000, y: 330, leveys: 120, korkeus: 20 },
      { x: 3180, y: 260, leveys: 120, korkeus: 20 },
    ],

    // Pieni juoksuhiekka: pidä hyppy pohjassa, niin pääset yli!
    juoksuhiekat: [
      { x: 700, leveys: 140 },
      { x: 2300, leveys: 260 },
    ],

    palmut: [
      { x: 380, lattia: 410 },
      { x: 1260, lattia: 410 },
      { x: 1900, lattia: 410 },
      { x: 2750, lattia: 410 },
      { x: 3450, lattia: 410 },
    ],

    liikkuvatTasot: [],

    kolikot: [
      { x: 150, y: 370 },
      { x: 250, y: 370 },
      { x: 370, y: 370 },
      { x: 760, y: 340 }, // juoksuhiekan yllä
      { x: 950, y: 370 },
      { x: 1080, y: 280 },
      { x: 1130, y: 280 },
      { x: 1250, y: 370 },
      { x: 1560, y: 310 },
      { x: 1640, y: 310 },
      { x: 1800, y: 370 },
      { x: 2000, y: 370 },
      { x: 2420, y: 350 }, // kiven päällä
      { x: 2650, y: 370 },
      { x: 2800, y: 370 },
      { x: 3030, y: 290 },
      { x: 3080, y: 290 },
      { x: 3210, y: 220 },
      { x: 3440, y: 370 },
      { x: 3600, y: 370 },
    ],

    viholliset: [
      // Kaktukseen ei saa koskea. Tulipallo polttaa sen!
      { tyyppi: "kaktus", x: 560, lattia: 410 },
      // Skorpioni piileskelee hiekassa: vain pistin näkyy
      { tyyppi: "skorpioni", x: 1000, lattia: 410, vasen: 880, oikea: 1200 },
      { tyyppi: "kaktus", x: 1400, lattia: 410 },
      { tyyppi: "kaktus", x: 2130, lattia: 410 },
      { tyyppi: "kaktus", x: 2900, lattia: 410 },
      { tyyppi: "skorpioni", x: 3550, lattia: 410, vasen: 3300, oikea: 3640 },
    ],

    lentovihut: [],

    sydamet: [{ x: 3265, y: 222 }],

    valitallennus: { x: 1750, lattia: 410 },
    maali: { x: 3720, lattia: 410 },
  };
}

// ---------- KENTTÄ 19: KAKTUSLAAKSO ----------
// Kaktuksia rivissä, pölypyörteet, jotka heittävät niiden yli, ja liikkuvat pilvien varjot
function kentta19() {
  return {
    nimi: "Kaktuslaakso",
    leveys: 4000,
    tavoiteAika: 90,
    alku: { x: 40, y: 360 },
    varit: { ...AAVIKKO_VARIT, taivasYla: "#58aee6" },
    laatat: "hiekka",
    paahde: 1,

    tasot: [
      { x: 0, y: 410, leveys: 900, korkeus: 40 },
      { x: 1040, y: 410, leveys: 760, korkeus: 40 },
      { x: 1800, y: 330, leveys: 160, korkeus: 120 }, // kallio
      { x: 1960, y: 410, leveys: 640, korkeus: 40 },
      { x: 2680, y: 390, leveys: 60, korkeus: 60 }, // kivet juoksuhiekassa
      { x: 2790, y: 390, leveys: 60, korkeus: 60 },
      { x: 2900, y: 410, leveys: 1100, korkeus: 40 },
      // Tälle tasolle pääsee vain pyörteen heittämänä!
      { x: 3290, y: 270, leveys: 130, korkeus: 20 },
    ],

    juoksuhiekat: [
      { x: 900, leveys: 140 },
      { x: 2600, leveys: 300 },
    ],

    palmut: [
      { x: 250, lattia: 410 },
      { x: 1600, lattia: 410 },
      { x: 2100, lattia: 410 },
      { x: 3000, lattia: 410 },
      { x: 3750, lattia: 410 },
    ],

    // Pilven varjo liikkuu: kulje sen mukana!
    varjopilvet: [
      { x: 500, matka: 220, nopeus: 0.01 },
      { x: 1250, matka: 200, nopeus: 0.008, vaihe: 200 },
      { x: 2350, matka: 250, nopeus: 0.009 },
      { x: 3500, matka: 250, nopeus: 0.01, vaihe: 100 },
    ],

    liikkuvatTasot: [],

    kolikot: [
      { x: 150, y: 370 },
      { x: 300, y: 370 },
      { x: 540, y: 300 }, // kaktusten yllä
      { x: 700, y: 370 },
      { x: 960, y: 340 },
      { x: 1100, y: 370 },
      { x: 1250, y: 250 }, // pyörteen heiton päässä
      { x: 1370, y: 290 },
      { x: 1550, y: 370 },
      { x: 1850, y: 290 },
      { x: 1900, y: 290 },
      { x: 2100, y: 370 },
      { x: 2250, y: 300 },
      { x: 2700, y: 350 },
      { x: 2810, y: 350 },
      { x: 3000, y: 370 },
      { x: 3180, y: 240 },
      { x: 3320, y: 230 },
      { x: 3380, y: 230 },
      { x: 3560, y: 300 },
      { x: 3700, y: 370 },
    ],

    viholliset: [
      // Kaksi kaktusta vierekkäin: hyppää yli tai polta!
      { tyyppi: "kaktus", x: 520, lattia: 410 },
      { tyyppi: "kaktus", x: 552, lattia: 410 },
      // Pyörre heittää ukon korkealle: sen avulla pääsee kolmen kaktuksen yli
      { tyyppi: "pyorre", x: 1180, lattia: 410, vasen: 1120, oikea: 1260 },
      { tyyppi: "kaktus", x: 1330, lattia: 410 },
      { tyyppi: "kaktus", x: 1362, lattia: 410 },
      { tyyppi: "kaktus", x: 1394, lattia: 410 },
      { tyyppi: "kaktus", x: 2250, lattia: 410 },
      { tyyppi: "skorpioni", x: 2420, lattia: 410, vasen: 2320, oikea: 2560 },
      { tyyppi: "pyorre", x: 3150, lattia: 410, vasen: 3100, oikea: 3240 },
      { tyyppi: "kaktus", x: 3550, lattia: 410 },
      { tyyppi: "kaktus", x: 3582, lattia: 410 },
      { tyyppi: "skorpioni", x: 3800, lattia: 410, vasen: 3650, oikea: 3880 },
    ],

    lentovihut: [],

    sydamet: [{ x: 3340, y: 232 }], // pyörteen tasolla

    valitallennus: { x: 2000, lattia: 410 },
    maali: { x: 3920, lattia: 410 },
  };
}

// ---------- KENTTÄ 20: KANGASTUSTEN KANJONI ----------
// Isoja juoksuhiekkoja, joiden yli hypitään kiveltä kivelle. Mutta osa tasoista
// on kangastuksia: ne väreilevät ja haihtuvat, kun tulet lähelle!
function kentta20() {
  return {
    nimi: "Kangastusten kanjoni",
    leveys: 4200,
    tavoiteAika: 105,
    alku: { x: 40, y: 360 },
    varit: { ...AAVIKKO_VARIT, taivasYla: "#e8a04a", taivasAla: "#ffe0a0", maetKauka: "#d9965a", maetLahi: "#c07a44" },
    laatat: "hiekka",
    paahde: 1,

    tasot: [
      { x: 0, y: 410, leveys: 500, korkeus: 40 },
      // Kivet ensimmäisessä juoksuhiekassa
      { x: 600, y: 390, leveys: 70, korkeus: 60 },
      { x: 780, y: 380, leveys: 70, korkeus: 70 },
      { x: 960, y: 390, leveys: 70, korkeus: 60 },
      { x: 1140, y: 380, leveys: 70, korkeus: 70 },
      { x: 1300, y: 410, leveys: 700, korkeus: 40 },
      // Kanjoni: kaksi kalliota ja niiden välissä juoksuhiekkaa
      { x: 2000, y: 330, leveys: 300, korkeus: 120 },
      { x: 2385, y: 390, leveys: 60, korkeus: 60 }, // kivi kallioiden välissä
      { x: 2520, y: 330, leveys: 300, korkeus: 120 },
      { x: 2820, y: 410, leveys: 580, korkeus: 40 },
      // Kivet viimeisessä juoksuhiekassa
      { x: 3500, y: 390, leveys: 60, korkeus: 60 },
      { x: 3670, y: 390, leveys: 60, korkeus: 60 },
      { x: 3790, y: 350, leveys: 70, korkeus: 20 },
      { x: 3900, y: 410, leveys: 300, korkeus: 40 },
    ],

    juoksuhiekat: [
      { x: 500, leveys: 800 },
      { x: 2300, leveys: 220 },
      { x: 3400, leveys: 500 },
    ],

    // Näitä EI ole oikeasti olemassa!
    kangastukset: [
      { x: 690, y: 330, leveys: 80 },
      { x: 870, y: 330, leveys: 80 },
      { x: 1050, y: 330, leveys: 80 },
      { x: 2310, y: 330, leveys: 200 }, // "silta" kallioiden välissä
      { x: 3575, y: 350, leveys: 80 },
    ],

    palmut: [
      { x: 250, lattia: 410 },
      { x: 1650, lattia: 410 },
      { x: 3100, lattia: 410 },
    ],

    varjopilvet: [
      { x: 800, matka: 300, nopeus: 0.007 },
      { x: 2350, matka: 280, nopeus: 0.008 },
      { x: 3600, matka: 200, nopeus: 0.009 },
    ],

    liikkuvatTasot: [],

    kolikot: [
      { x: 150, y: 370 },
      { x: 300, y: 370 },
      { x: 625, y: 350 },
      { x: 805, y: 340 },
      { x: 985, y: 350 },
      { x: 1165, y: 340 },
      { x: 1400, y: 370 },
      { x: 1550, y: 370 },
      { x: 1850, y: 370 },
      { x: 2080, y: 290 },
      { x: 2200, y: 290 },
      { x: 2600, y: 290 },
      { x: 2740, y: 290 },
      { x: 2900, y: 370 },
      { x: 3280, y: 370 },
      { x: 3520, y: 350 },
      { x: 3690, y: 350 },
      { x: 3815, y: 310 },
      { x: 4000, y: 370 },
    ],

    viholliset: [
      { tyyppi: "kaktus", x: 1450, lattia: 410 },
      { tyyppi: "skorpioni", x: 1750, lattia: 410, vasen: 1550, oikea: 1950 },
      { tyyppi: "kaktus", x: 2660, lattia: 330 },
      { tyyppi: "kaktus", x: 2950, lattia: 410 },
      { tyyppi: "skorpioni", x: 3200, lattia: 410, vasen: 3050, oikea: 3360 },
    ],

    lentovihut: [],

    sydamet: [{ x: 2402, y: 346 }], // kivellä kallioiden välissä

    valitallennus: { x: 2100, lattia: 330 },
    maali: { x: 4120, lattia: 410 },
  };
}

// ---------- KENTTÄ 21: PYRAMIDIN UUMENISSA ----------
// Pimeä pyramidi: täällä aurinko ei paahda, mutta muumiot vaeltavat.
// Muumio hajoaa hypystä mutta nousee taas. Vain tulipallo tuhoaa sen!
function kentta21() {
  return {
    nimi: "Pyramidin uumenissa",
    leveys: 3800,
    tavoiteAika: 100,
    alku: { x: 40, y: 360 },
    varit: PYRAMIDI_VARIT,
    laatat: "hiekka",
    luola: true, // ei aurinkoa eikä pilviä
    pimeys: 0.55,

    tasot: [
      { x: 0, y: 0, leveys: 3800, korkeus: 50 }, // katto
      { x: 0, y: 410, leveys: 600, korkeus: 40 },
      { x: 900, y: 410, leveys: 800, korkeus: 40 },
      { x: 1800, y: 390, leveys: 60, korkeus: 60 }, // kivet juoksuhiekassa
      { x: 1950, y: 390, leveys: 60, korkeus: 60 },
      { x: 2100, y: 410, leveys: 700, korkeus: 40 },
      { x: 2880, y: 390, leveys: 50, korkeus: 60 },
      { x: 3000, y: 410, leveys: 800, korkeus: 40 },
      // Korokkeet: täältä näkee kauemmas ja muumio ei yllä
      { x: 1150, y: 320, leveys: 140, korkeus: 20 },
      { x: 2350, y: 330, leveys: 140, korkeus: 20 },
      { x: 3250, y: 330, leveys: 120, korkeus: 20 },
    ],

    juoksuhiekat: [
      { x: 600, leveys: 300 },
      { x: 1700, leveys: 400 },
      { x: 2800, leveys: 200 },
    ],

    // Vanhat kivilaatat putoavat, kun niille astuu
    putoavatTasot: [
      { x: 680, y: 360, leveys: 60 },
      { x: 800, y: 360, leveys: 60 },
    ],

    soihdut: [
      { x: 300, y: 250 },
      { x: 1000, y: 250 },
      { x: 1600, y: 250 },
      { x: 2200, y: 250 },
      { x: 2700, y: 250 },
      { x: 3100, y: 250 },
      { x: 3650, y: 250 },
    ],

    liikkuvatTasot: [],

    kolikot: [
      { x: 150, y: 370 },
      { x: 300, y: 370 },
      { x: 450, y: 370 },
      { x: 700, y: 320 },
      { x: 820, y: 320 },
      { x: 1000, y: 370 },
      { x: 1190, y: 280 },
      { x: 1250, y: 280 },
      { x: 1500, y: 370 },
      { x: 1820, y: 350 },
      { x: 1970, y: 350 },
      { x: 2200, y: 370 },
      { x: 2390, y: 290 },
      { x: 2600, y: 370 },
      { x: 2895, y: 350 },
      { x: 3100, y: 370 },
      { x: 3290, y: 290 },
      { x: 3500, y: 370 },
    ],

    viholliset: [
      { tyyppi: "muumio", x: 1300, lattia: 410, vasen: 950, oikea: 1650 },
      { tyyppi: "tippuja", x: 1500, y: 90, lattia: 410 },
      { tyyppi: "muumio", x: 2450, lattia: 410, vasen: 2150, oikea: 2740 },
      { tyyppi: "tippuja", x: 2250, y: 90, lattia: 410 },
      { tyyppi: "skorpioni", x: 3150, lattia: 410, vasen: 3050, oikea: 3300 },
      { tyyppi: "muumio", x: 3500, lattia: 410, vasen: 3350, oikea: 3650 },
    ],

    lentovihut: [],

    sydamet: [{ x: 3297, y: 292 }],

    valitallennus: { x: 2150, lattia: 410 },
    maali: { x: 3720, lattia: 410 },
  };
}

// ---------- KENTTÄ 22: PAAHDEHARJU ----------
// Kuumin kenttä: palmuja ei juuri ole, joten varjoa saa vain liikkuvista pilvistä.
// Kulje pilven mukana äläkä jää auringon paahteeseen!
function kentta22() {
  return {
    nimi: "Paahdeharju",
    leveys: 4400,
    tavoiteAika: 110,
    alku: { x: 40, y: 360 },
    varit: { ...AAVIKKO_VARIT, taivasYla: "#f2b04c", taivasAla: "#fff0b8", aurinko: "#ffffff" },
    laatat: "hiekka",
    paahde: 1.25, // tavallista kuumempi

    tasot: [
      { x: 0, y: 410, leveys: 800, korkeus: 40 },
      { x: 880, y: 390, leveys: 50, korkeus: 60 }, // kivi
      { x: 1000, y: 410, leveys: 900, korkeus: 40 },
      // Pitkä juoksuhiekka: neljä kiveä
      { x: 2000, y: 385, leveys: 70, korkeus: 65 },
      { x: 2175, y: 385, leveys: 70, korkeus: 65 },
      { x: 2350, y: 385, leveys: 70, korkeus: 65 },
      { x: 2525, y: 385, leveys: 70, korkeus: 65 },
      { x: 2700, y: 410, leveys: 600, korkeus: 40 },
      { x: 3385, y: 390, leveys: 50, korkeus: 60 }, // kivi
      { x: 3520, y: 410, leveys: 880, korkeus: 40 },
      { x: 1400, y: 320, leveys: 120, korkeus: 20 },
      { x: 3060, y: 270, leveys: 120, korkeus: 20 }, // tänne pääsee pyörteen heittämänä
    ],

    juoksuhiekat: [
      { x: 800, leveys: 200 },
      { x: 1900, leveys: 800 },
      { x: 3300, leveys: 220 },
    ],

    palmut: [
      { x: 2760, lattia: 410 },
      { x: 4250, lattia: 410 },
    ],

    varjopilvet: [
      { x: 300, matka: 260, nopeus: 0.009 },
      { x: 1300, matka: 300, nopeus: 0.008, vaihe: 150 },
      { x: 2250, matka: 330, nopeus: 0.007 },
      { x: 3700, matka: 300, nopeus: 0.009, vaihe: 300 },
    ],

    liikkuvatTasot: [],

    kolikot: [
      { x: 150, y: 370 },
      { x: 300, y: 370 },
      { x: 470, y: 300 },
      { x: 895, y: 350 },
      { x: 1100, y: 370 },
      { x: 1280, y: 250 },
      { x: 1430, y: 280 },
      { x: 1480, y: 280 },
      { x: 1700, y: 370 },
      { x: 2025, y: 345 },
      { x: 2200, y: 345 },
      { x: 2375, y: 345 },
      { x: 2550, y: 345 },
      { x: 2800, y: 370 },
      { x: 2960, y: 240 },
      { x: 3090, y: 230 },
      { x: 3400, y: 350 },
      { x: 3600, y: 370 },
      { x: 3690, y: 280 },
      { x: 3900, y: 370 },
      { x: 4100, y: 370 },
    ],

    viholliset: [
      { tyyppi: "kaktus", x: 450, lattia: 410 },
      { tyyppi: "kaktus", x: 482, lattia: 410 },
      { tyyppi: "skorpioni", x: 640, lattia: 410, vasen: 540, oikea: 760 },
      { tyyppi: "kaktus", x: 1130, lattia: 410 },
      { tyyppi: "pyorre", x: 1250, lattia: 410, vasen: 1200, oikea: 1320 },
      { tyyppi: "skorpioni", x: 1700, lattia: 410, vasen: 1520, oikea: 1860 },
      { tyyppi: "pyorre", x: 2950, lattia: 410, vasen: 2880, oikea: 3000 },
      { tyyppi: "pyorre", x: 3580, lattia: 410, vasen: 3545, oikea: 3610 },
      { tyyppi: "kaktus", x: 3660, lattia: 410 },
      { tyyppi: "kaktus", x: 3692, lattia: 410 },
      { tyyppi: "kaktus", x: 3724, lattia: 410 },
      { tyyppi: "skorpioni", x: 4000, lattia: 410, vasen: 3850, oikea: 4150 },
    ],

    lentovihut: [],

    sydamet: [{ x: 3107, y: 232 }],

    valitallennus: { x: 2750, lattia: 410 },
    maali: { x: 4320, lattia: 410 },
  };
}

// ---------- KENTTÄ 23: HIEKKAMADON PESÄ ----------
// POMO! Katso ohjeet tiedostosta hiekkamato.js.
function kentta23() {
  return {
    nimi: "Hiekkamadon pesä",
    leveys: 2600,
    tavoiteAika: 150,
    alku: { x: 40, y: 360 },
    varit: PYRAMIDI_VARIT,
    laatat: "hiekka",
    luola: true,
    pimeys: 0.4,

    tasot: [
      { x: 0, y: 0, leveys: 2600, korkeus: 40 }, // katto
      { x: 0, y: 410, leveys: 300, korkeus: 40 },
      // Kiviä juoksuhiekassa
      { x: 370, y: 385, leveys: 70, korkeus: 65 },
      { x: 510, y: 375, leveys: 70, korkeus: 75 },
      { x: 650, y: 385, leveys: 70, korkeus: 65 },
      { x: 790, y: 375, leveys: 70, korkeus: 75 },
      { x: 930, y: 385, leveys: 70, korkeus: 65 },
      { x: 1050, y: 390, leveys: 50, korkeus: 60 },
      // Areena
      { x: 1140, y: 410, leveys: 1360, korkeus: 40 },
      { x: 2500, y: 40, leveys: 100, korkeus: 410 }, // areenan oikea seinä
      // Tasoilta yltää hyppäämään madon pään päälle ja ampumaan sitä päähän
      { x: 1600, y: 300, leveys: 120, korkeus: 20 },
      { x: 1920, y: 300, leveys: 120, korkeus: 20 },
      { x: 2240, y: 300, leveys: 120, korkeus: 20 },
    ],

    juoksuhiekat: [{ x: 300, leveys: 840 }],

    soihdut: [
      { x: 150, y: 250 },
      { x: 1300, y: 250 },
      { x: 1800, y: 200 },
      { x: 2140, y: 200 },
      { x: 2460, y: 250 },
    ],

    liikkuvatTasot: [],

    kolikot: [
      { x: 395, y: 345 },
      { x: 535, y: 335 },
      { x: 675, y: 345 },
      { x: 815, y: 335 },
      { x: 955, y: 345 },
      { x: 1065, y: 350 },
      { x: 1250, y: 370 },
    ],

    viholliset: [],
    lentovihut: [],

    // HIEKKAMATO herää, kun pelaaja tulee areenalle
    pomo: {
      tyyppi: "mato",
      x: 2000,
      lattia: 410,
      vasen: 1474, // mato liikkuu tällä välillä (koko areenan leveydeltä)
      oikea: 2440,
      alue: 1560,
      // Portti ulottuu ruudun yläreunan yli, ettei sen yli voi hypätä
      portti: { x: 1440, y: -400, leveys: 32, korkeus: 810 },
    },

    sydamet: [{ x: 1647, y: 262 }],

    valitallennus: { x: 1200, lattia: 410 },
    maali: { x: 2380, lattia: 410 },
  };
}

// Lisätään maailman 4 kentät kenttälistaan
KENTAT.push(kentta18, kentta19, kentta20, kentta21, kentta22, kentta23);

// Kenttien paikat Aavikkosaaren kartalla
KARTTA.push(
  { x: 95, y: 280 }, // kenttä 18
  { x: 215, y: 200 }, // kenttä 19
  { x: 335, y: 290 }, // kenttä 20
  { x: 455, y: 215 }, // kenttä 21
  { x: 575, y: 300 }, // kenttä 22
  { x: 700, y: 265 }, // kenttä 23 (pomo)
);

MAAILMAT.push({
  nimi: "Aavikkosaari",
  alku: 17,
  loppu: 22,
  tyyli: "aavikko",
  // Palmut kartalla
  puut: [
    { x: 150, y: 215 },
    { x: 280, y: 345 },
    { x: 330, y: 140 },
    { x: 480, y: 340 },
    { x: 560, y: 150 },
    { x: 255, y: 265 },
  ],
});
