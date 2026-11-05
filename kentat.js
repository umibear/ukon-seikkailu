// ==========================================
//   KENTÄT
//   Jokainen kenttä on funktio, joka palauttaa kentän tiedot.
//   Kun kenttä aloitetaan (tai aloitetaan alusta), funktiota kutsutaan
//   uudestaan, jolloin saadaan aina "uusi" kenttä: kolikot ja vihut
//   ovat taas paikoillaan.
//
//   Kentän osat:
//   tasot          = paikallaan olevat tasot: x, y, leveys, korkeus
//   liikkuvatTasot = tasot, jotka heiluvat edestakaisin:
//                    x, y      = keskikohta, jonka ympärillä taso heiluu
//                    matkaX    = kuinka pitkälle taso liikkuu sivuttain
//                    matkaY    = kuinka pitkälle taso liikkuu ylös-alas
//                    nopeus    = kuinka nopeasti (pieni luku = hidas)
//   kolikot        = x, y
//   sydamet        = (vapaaehtoinen) x, y. Sydän antaa elämän takaisin!
//   salaisetLuolat = (vapaaehtoinen) kallio, jonka toisen seinän läpi voi kävellä
//   viholliset     = kävelevät vihut: x, lattia, vasen, oikea, nopeus
//   lentovihut     = lentävät vihut: x, y, vasen, oikea, nopeus,
//                    heilunta = kuinka paljon vihu heiluu ylös-alas
//   valitallennus  = harmaa lippu. Kun kosket siihen, siitä tulee punainen,
//                    ja menetetyn elämän jälkeen jatkat siitä.
//   maali          = lippu, johon kenttä päättyy
//   tavoiteAika    = sekunteja. Jos pääset maaliin nopeammin, saat aikabonusta!
//   pomo           = (vapaaehtoinen) iso loppuvastus, ks. kenttä 3
//   saa            = (vapaaehtoinen) lista säätehosteista: "lumi", "sade", "tahdet"
//   pimeys         = (vapaaehtoinen) kuinka pimeä kenttä on: 0 = valoisa, 1 = ihan musta.
//                    Pimeässä ukko, tulipallot ja kolikot valaisevat ympäristöä!
// ==========================================

// ---------- KENTTÄ 1 ----------
function kentta1() {
  return {
    nimi: "Vihreät kukkulat",
    leveys: 4125,
    tavoiteAika: 63,
    alku: { x: 40, y: 360 },
    varit: {
      taivasYla: "#4fa8e0",
      taivasAla: "#c8ecff",
      aurinko: "#fff3a0",
      maetKauka: "#a8dba0",
      maetLahi: "#7cc576",
      puut: "#5aa95a", // kaukaiset kuuset mäkien edessä
    },

    tasot: [
      // --- OSA 1: alku ---
      { x: 0, y: 410, leveys: 250, korkeus: 40 },
      { x: 320, y: 410, leveys: 200, korkeus: 40 },
      { x: 600, y: 410, leveys: 400, korkeus: 40 },
      { x: 150, y: 320, leveys: 100, korkeus: 20 },
      { x: 300, y: 250, leveys: 120, korkeus: 20 },
      { x: 480, y: 300, leveys: 100, korkeus: 20 },
      { x: 620, y: 200, leveys: 120, korkeus: 20 },

      // --- OSA 2: portaat ylös ---
      { x: 1080, y: 410, leveys: 320, korkeus: 40 },
      { x: 1150, y: 330, leveys: 80, korkeus: 20 },
      { x: 1260, y: 260, leveys: 80, korkeus: 20 },
      { x: 1380, y: 190, leveys: 120, korkeus: 20 },
      { x: 1470, y: 410, leveys: 230, korkeus: 40 },
      { x: 1500, y: 320, leveys: 140, korkeus: 20 },
      { x: 1780, y: 410, leveys: 220, korkeus: 40 },

      // --- OSA 3: iso kuoppa (sen yli putoavilla tasoilla!) ---
      { x: 2250, y: 410, leveys: 350, korkeus: 40 },
      { x: 2350, y: 320, leveys: 100, korkeus: 20 },
      { x: 2480, y: 250, leveys: 100, korkeus: 20 },
      { x: 2680, y: 410, leveys: 320, korkeus: 40 },
      { x: 3050, y: 410, leveys: 200, korkeus: 40 },

      // --- OSA 4 (uusi): jousi ja korkea polku ---
      { x: 3480, y: 410, leveys: 160, korkeus: 40 }, // jousi tässä
      { x: 3660, y: 170, leveys: 120, korkeus: 20 }, // korkea taso
      { x: 4020, y: 410, leveys: 105, korkeus: 40 }, // maali
    ],

    liikkuvatTasot: [
      { x: 3310, y: 370, leveys: 80, matkaX: 50, matkaY: 0, nopeus: 0.03 },
    ],

    // Nämä olivat ennen tavallisia tasoja, nyt ne putoavat!
    putoavatTasot: [
      { x: 2060, y: 350, leveys: 70 },
      { x: 2160, y: 300, leveys: 70 },
      { x: 3850, y: 230, leveys: 70 },
      { x: 3950, y: 290, leveys: 60 },
    ],

    jouset: [{ x: 3560, lattia: 410 }],

    // Sydän korkean tason yläpuolella: hyppää tasolta ylös!
    sydamet: [{ x: 3707, y: 95 }],

    kolikot: [
      // Osa 1
      { x: 190, y: 280 },
      { x: 350, y: 210 },
      { x: 520, y: 260 },
      { x: 440, y: 370 },
      { x: 660, y: 160 },
      { x: 900, y: 370 },
      // Osa 2
      { x: 1180, y: 290 },
      { x: 1290, y: 220 },
      { x: 1420, y: 150 },
      { x: 1460, y: 150 },
      { x: 1560, y: 280 },
      { x: 1730, y: 330 }, // ilmassa kuopan päällä!
      // Osa 3
      { x: 2085, y: 310 },
      { x: 2185, y: 260 },
      { x: 2390, y: 280 },
      { x: 2520, y: 210 },
      { x: 2630, y: 330 }, // ilmassa kuopan päällä!
      { x: 2800, y: 370 },
      { x: 3000, y: 370 },
      // Osa 4
      { x: 3300, y: 330 },
      { x: 3570, y: 300 },
      { x: 3610, y: 230 },
      { x: 3630, y: 190 },
      { x: 3720, y: 130 },
      { x: 3880, y: 190 },
      { x: 3970, y: 250 },
    ],

    viholliset: [
      // Osa 1
      { x: 400, lattia: 410, vasen: 330, oikea: 470, nopeus: 1 },
      { x: 700, lattia: 410, vasen: 610, oikea: 750, nopeus: 1.3 },
      { x: 320, lattia: 250, vasen: 300, oikea: 380, nopeus: 0.8 },
      // Osa 2
      { x: 1200, lattia: 410, vasen: 1100, oikea: 1350, nopeus: 1.2 },
      { tyyppi: "piikkis", x: 1550, lattia: 410, vasen: 1480, oikea: 1660, nopeus: 1.5 },
      { x: 1520, lattia: 320, vasen: 1500, oikea: 1600, nopeus: 0.8 },
      // Osa 3
      { x: 2300, lattia: 410, vasen: 2260, oikea: 2420, nopeus: 1.3 },
      { x: 2500, lattia: 410, vasen: 2430, oikea: 2550, nopeus: 1 },
      { x: 2750, lattia: 410, vasen: 2690, oikea: 2850, nopeus: 1.6 },
      // Osa 4
      { tyyppi: "pomppija", x: 3150, lattia: 410, vasen: 3080, oikea: 3210, nopeus: 1.3 },
    ],

    lentovihut: [
      { x: 900, y: 300, vasen: 800, oikea: 1000, nopeus: 1.5, heilunta: 30 },
      { x: 2150, y: 220, vasen: 2050, oikea: 2250, nopeus: 1.2, heilunta: 40 },
    ],

    valitallennus: { x: 1850, lattia: 410 },
    maali: { x: 4060, lattia: 410 },
  };
}

// ---------- KENTTÄ 2 ----------
function kentta2() {
  return {
    nimi: "Auringonlasku",
    leveys: 4500,
    tavoiteAika: 63,
    alku: { x: 40, y: 360 },
    varit: {
      taivasYla: "#ff7e5f",
      taivasAla: "#feb47b",
      aurinko: "#ffe08a",
      maetKauka: "#c98bb9",
      maetLahi: "#8e5f8a",
      puut: "#6d4a6b",
    },

    tasot: [
      // --- OSA 1: liikkuva taso kuopan yli ---
      { x: 0, y: 410, leveys: 400, korkeus: 40 },
      { x: 650, y: 410, leveys: 350, korkeus: 40 },
      { x: 760, y: 300, leveys: 100, korkeus: 20 },

      // --- OSA 2: hissi ylös korkealle ---
      { x: 1080, y: 410, leveys: 220, korkeus: 40 },
      { x: 1420, y: 170, leveys: 200, korkeus: 20 }, // korkea kieleke
      { x: 1700, y: 410, leveys: 400, korkeus: 40 },

      // --- OSA 3: pitkä kuoppa ---
      { x: 2600, y: 410, leveys: 400, korkeus: 40 },
      { x: 2700, y: 300, leveys: 120, korkeus: 20 },
      { x: 3080, y: 410, leveys: 320, korkeus: 40 },

      // --- OSA 4 (uusi): putoavat portaat ja jousi ---
      { x: 4060, y: 410, leveys: 200, korkeus: 40 }, // jousi tässä
      { x: 4280, y: 180, leveys: 100, korkeus: 20 }, // korkea taso
      { x: 4400, y: 410, leveys: 100, korkeus: 40 }, // maali
    ],

    liikkuvatTasot: [
      // Liikkuu sivuttain ensimmäisen kuopan yllä
      { x: 485, y: 380, leveys: 80, matkaX: 60, matkaY: 0, nopeus: 0.02 },
      // Hissi: liikkuu ylös ja alas
      { x: 1320, y: 300, leveys: 80, matkaX: 0, matkaY: 90, nopeus: 0.03 },
      // Kaksi sivuttain liikkuvaa tasoa pitkän kuopan yllä
      { x: 2180, y: 360, leveys: 80, matkaX: 60, matkaY: 0, nopeus: 0.025 },
      { x: 2470, y: 330, leveys: 80, matkaX: 60, matkaY: 0, nopeus: 0.03 },
      // Osa 4
      { x: 3860, y: 300, leveys: 80, matkaX: 50, matkaY: 0, nopeus: 0.03 },
    ],

    putoavatTasot: [
      { x: 2340, y: 300, leveys: 60 }, // ennen tavallinen taso
      // Osa 4: portaat ylös, jotka putoavat alta!
      { x: 3480, y: 360, leveys: 70 },
      { x: 3610, y: 310, leveys: 70 },
      { x: 3740, y: 260, leveys: 70 },
    ],

    jouset: [{ x: 4180, lattia: 410 }],

    sydamet: [{ x: 4317, y: 85 }],

    kolikot: [
      // Osa 1
      { x: 500, y: 330 },
      { x: 560, y: 330 },
      { x: 720, y: 370 },
      { x: 800, y: 260 },
      { x: 900, y: 370 },
      // Osa 2
      { x: 1350, y: 150 },
      { x: 1460, y: 130 },
      { x: 1520, y: 130 },
      { x: 1580, y: 130 },
      { x: 1760, y: 370 },
      { x: 2000, y: 370 },
      // Osa 3
      { x: 2200, y: 320 },
      { x: 2360, y: 260 },
      { x: 2480, y: 290 },
      { x: 2730, y: 260 },
      { x: 2780, y: 260 },
      { x: 3150, y: 370 },
      { x: 3300, y: 370 },
      // Osa 4
      { x: 3505, y: 320 },
      { x: 3635, y: 270 },
      { x: 3765, y: 220 },
      { x: 3920, y: 260 },
      { x: 4190, y: 300 },
      { x: 4230, y: 220 },
      { x: 4320, y: 140 },
    ],

    viholliset: [
      { x: 800, lattia: 410, vasen: 720, oikea: 950, nopeus: 1.2 },
      { x: 1520, lattia: 170, vasen: 1480, oikea: 1580, nopeus: 1 },
      { tyyppi: "pomppija", x: 1950, lattia: 410, vasen: 1850, oikea: 2050, nopeus: 1.4 },
      { x: 2700, lattia: 410, vasen: 2620, oikea: 2800, nopeus: 1.5 },
      { tyyppi: "piikkis", x: 2900, lattia: 410, vasen: 2820, oikea: 2960, nopeus: 1.2 },
      // Osa 4
      { tyyppi: "pomppija", x: 4100, lattia: 410, vasen: 4070, oikea: 4140, nopeus: 1, hyppy: 12 },
    ],

    lentovihut: [
      { x: 520, y: 250, vasen: 420, oikea: 620, nopeus: 1.2, heilunta: 30 },
      { x: 1900, y: 300, vasen: 1750, oikea: 2050, nopeus: 2, heilunta: 30 },
      { x: 2350, y: 180, vasen: 2200, oikea: 2500, nopeus: 1.5, heilunta: 40 },
      { x: 3250, y: 320, vasen: 3120, oikea: 3400, nopeus: 2.2, heilunta: 20 },
      { x: 3700, y: 180, vasen: 3550, oikea: 3850, nopeus: 1.6, heilunta: 30 },
    ],

    valitallennus: { x: 1800, lattia: 410 },
    maali: { x: 4440, lattia: 410 },
  };
}

// ---------- KENTTÄ 3: PILVIPOLKU ----------
// Vaikea hyppelykenttä: paljon kuoppia, liikkuvia ja putoavia tasoja,
// jousia sekä uudet vihut Piikkis ja Pomppija.
function kentta3() {
  return {
    nimi: "Pilvipolku",
    leveys: 4000,
    tavoiteAika: 70,
    alku: { x: 40, y: 360 },
    varit: {
      taivasYla: "#6ec6ff",
      taivasAla: "#e8f7ff",
      aurinko: "#fff7c2",
      maetKauka: "#b9d7f0",
      maetLahi: "#93bfe0",
      puut: "#7fa9c9",
    },

    tasot: [
      // --- OSA 1: jousi korkealle ---
      { x: 0, y: 410, leveys: 260, korkeus: 40 },
      { x: 540, y: 410, leveys: 160, korkeus: 40 }, // jousi tässä
      { x: 720, y: 180, leveys: 140, korkeus: 20 }, // korkea taso

      // --- OSA 2: lepakkomaa ---
      { x: 1280, y: 410, leveys: 300, korkeus: 40 }, // piikkis

      // --- OSA 3: välitallennus ---
      { x: 2120, y: 410, leveys: 260, korkeus: 40 },

      // --- OSA 4: ylhäällä pilvissä ---
      { x: 2440, y: 170, leveys: 100, korkeus: 20 },

      // --- OSA 5: loppu ---
      { x: 3200, y: 410, leveys: 200, korkeus: 40 }, // piikkis
      { x: 3600, y: 220, leveys: 140, korkeus: 20 },
      { x: 3780, y: 410, leveys: 220, korkeus: 40 }, // maali
    ],

    liikkuvatTasot: [
      // Kuopan yli ensimmäiseen jouseen
      { x: 350, y: 390, leveys: 80, matkaX: 50, matkaY: 0, nopeus: 0.025 },
      // Kolme liikkuvaa tasoa ison kuopan yllä
      { x: 1640, y: 330, leveys: 80, matkaX: 0, matkaY: 70, nopeus: 0.03 },
      { x: 1820, y: 280, leveys: 80, matkaX: 70, matkaY: 0, nopeus: 0.035 },
      { x: 1990, y: 300, leveys: 80, matkaX: 0, matkaY: 90, nopeus: 0.04 },
      // Pilvistä alas
      { x: 3000, y: 330, leveys: 80, matkaX: 80, matkaY: 0, nopeus: 0.03 },
      // Hissi ylös lopussa
      { x: 3460, y: 300, leveys: 80, matkaX: 0, matkaY: 100, nopeus: 0.035 },
    ],

    // Putoavat tasot: tärisevät hetken, kun niiden päälle astuu, ja putoavat!
    putoavatTasot: [
      { x: 920, y: 240, leveys: 70 },
      { x: 1040, y: 220, leveys: 70 },
      { x: 1160, y: 250, leveys: 70 },
      { x: 2600, y: 190, leveys: 60 },
      { x: 2720, y: 160, leveys: 60 },
      { x: 2840, y: 200, leveys: 60 },
    ],

    // Jouset: hyppää päälle, niin lennät tosi korkealle!
    jouset: [
      { x: 600, lattia: 410 },
      { x: 2320, lattia: 410 },
    ],

    sydamet: [
      { x: 1840, y: 175 }, // liikkuvan tason yläpuolella, lentovihun reitillä!
      { x: 2737, y: 55 }, // putoavan tason yläpuolella: ole nopea!
    ],

    kolikot: [
      // Osa 1
      { x: 380, y: 340 },
      { x: 610, y: 300 },
      { x: 640, y: 230 },
      { x: 680, y: 190 },
      { x: 780, y: 140 },
      // Osa 2
      { x: 945, y: 200 },
      { x: 1065, y: 180 },
      { x: 1185, y: 210 },
      { x: 1450, y: 370 },
      // Osa 3
      { x: 1670, y: 220 },
      { x: 1850, y: 230 },
      { x: 2020, y: 190 },
      // Osa 4
      { x: 2480, y: 130 },
      { x: 2620, y: 150 },
      { x: 2740, y: 120 },
      { x: 2860, y: 160 },
      // Osa 5
      { x: 3040, y: 290 },
      { x: 3490, y: 170 },
      { x: 3660, y: 180 },
    ],

    viholliset: [
      // tyyppi: "piikkis" = päälle ei voi hypätä, ammu tulipallolla!
      { tyyppi: "piikkis", x: 1400, lattia: 410, vasen: 1290, oikea: 1540, nopeus: 1.3 },
      { tyyppi: "pomppija", x: 2250, lattia: 410, vasen: 2210, oikea: 2290, nopeus: 1.5 },
      { tyyppi: "piikkis", x: 3300, lattia: 410, vasen: 3210, oikea: 3370, nopeus: 1.6 },
      // tyyppi: "pomppija" = hyppii, hyppy-luku kertoo kuinka korkealle
      { tyyppi: "pomppija", x: 3850, lattia: 410, vasen: 3800, oikea: 3880, nopeus: 1.2, hyppy: 12 },
    ],

    lentovihut: [
      { x: 1850, y: 150, vasen: 1700, oikea: 2000, nopeus: 1.8, heilunta: 30 },
      { x: 2750, y: 100, vasen: 2600, oikea: 2900, nopeus: 1.5, heilunta: 30 },
    ],

    valitallennus: { x: 2130, lattia: 410 },
    maali: { x: 3940, lattia: 410 },
  };
}

// ---------- KENTTÄ 4: KALLIOKUILUT ----------
// Seinähyppykenttä! Korkeat seinät ja kapeat kuilut, joissa kiivetään
// hyppimällä seinästä toiseen. Uudet vihut: Tippuja ja Seinäryömijä.
function kentta4() {
  return {
    nimi: "Kalliokuilut",
    leveys: 3300,
    tavoiteAika: 70,
    alku: { x: 40, y: 360 },
    varit: {
      taivasYla: "#4f8fc0",
      taivasAla: "#f6d6a0",
      aurinko: "#fff1b8",
      maetKauka: "#c98b5e",
      maetLahi: "#9c5a36",
      puut: "#6e3b22",
    },

    tasot: [
      // --- OSA 1: harjoituskuilu ---
      // Mene roikkuvan seinän alta kuiluun ja kiipeä ylös seinähypyillä!
      { x: 0, y: 410, leveys: 1080, korkeus: 40 },
      { x: 420, y: 150, leveys: 40, korkeus: 180 }, // roikkuva seinä
      { x: 540, y: 150, leveys: 40, korkeus: 260 }, // korkea seinä

      // --- OSA 2: gekkokuilu ylös kalliolle ---
      { x: 960, y: 110, leveys: 40, korkeus: 220 }, // roikkuva seinä
      { x: 1080, y: 170, leveys: 520, korkeus: 280 }, // korkea kallio

      // --- OSA 3: alas kalliolta ja kuopan yli ---
      { x: 1600, y: 410, leveys: 350, korkeus: 40 },

      // --- OSA 4: tuplakuilu, jossa on kaksi gekkoa ---
      // Kuilun oikea seinä on torni, joka on tehty salaisesta luolasta (katso alempaa)
      { x: 2250, y: 410, leveys: 1050, korkeus: 40 },
      { x: 2330, y: 110, leveys: 40, korkeus: 210 }, // roikkuva seinä
    ],

    // Torni, jonka sisällä on salainen luola. Aukko on oikealla puolella!
    salaisetLuolat: [
      { x: 2450, lattia: 410, leveys: 100, korkeus: 300, aukko: "oikea" },
    ],

    liikkuvatTasot: [
      { x: 2060, y: 340, leveys: 80, matkaX: 80, matkaY: 0, nopeus: 0.025 },
    ],

    kolikot: [
      // Osa 1: harjoituskuilu
      { x: 490, y: 330 },
      { x: 490, y: 260 },
      { x: 490, y: 190 },
      { x: 550, y: 110 }, // korkean seinän päällä
      { x: 700, y: 370 },
      { x: 800, y: 370 },
      // Osa 2: gekkokuilu ja kallio
      { x: 1030, y: 300 },
      { x: 1030, y: 220 },
      { x: 1150, y: 130 },
      { x: 1350, y: 130 },
      { x: 1550, y: 130 },
      // Osa 3
      { x: 1750, y: 370 },
      { x: 2090, y: 290 }, // liikkuvan tason yläpuolella
      // Osa 4: tuplakuilu
      { x: 2290, y: 370 },
      { x: 2400, y: 280 },
      { x: 2400, y: 200 },
      { x: 2490, y: 70 }, // tornin päällä
      // Osa 5
      { x: 2700, y: 370 },
      { x: 2800, y: 370 },
      { x: 2900, y: 370 },
    ],

    viholliset: [
      { x: 700, lattia: 410, vasen: 600, oikea: 900, nopeus: 1.3 },

      // TIPPUJA eli hämähäkki: roikkuu kohdassa x, y. Kun ukko tulee alle,
      // se tippuu lattialle asti ja kiipeää sitten takaisin ylös.
      { tyyppi: "tippuja", x: 1250, y: 70, lattia: 170 },
      { tyyppi: "tippuja", x: 1450, y: 60, lattia: 170 },
      { tyyppi: "tippuja", x: 2190, y: 80, lattia: 480 }, // kuopan päällä!

      // SEINÄRYÖMIJÄ eli gekko: kiipeää seinää ylös ja alas.
      //   x = seinän pinta, yla ja ala = kuinka ylös ja alas se kiipeää
      //   seina = "vasen", jos seinä on gekon vasemmalla puolella, muuten "oikea"
      { tyyppi: "ryomija", x: 1080, yla: 180, ala: 400, nopeus: 1.2, seina: "oikea" },
      { tyyppi: "ryomija", x: 2450, yla: 240, ala: 410, nopeus: 1.2, seina: "oikea" },

      { tyyppi: "pomppija", x: 2800, lattia: 410, vasen: 2600, oikea: 3000, nopeus: 2 },
      { x: 3000, lattia: 410, vasen: 2950, oikea: 3150, nopeus: 1.5 },
    ],

    lentovihut: [
      { x: 2750, y: 250, vasen: 2600, oikea: 2950, nopeus: 1.6, heilunta: 30 },
    ],

    // Sydän on piilossa tornin salaisessa luolassa
    sydamet: [{ x: 2507, y: 380 }],

    valitallennus: { x: 1680, lattia: 410 },
    maali: { x: 3200, lattia: 410 },
  };
}

// ---------- KENTTÄ 5: POMO ----------
function kentta5() {
  return {
    nimi: "Isäukon vuori",
    leveys: 2500,
    tavoiteAika: 50,
    alku: { x: 40, y: 360 },
    varit: {
      taivasYla: "#1d2b53",
      taivasAla: "#7e5c9e",
      aurinko: "#f5f0c8", // täällä aurinko on kuu!
      maetKauka: "#4b3f72",
      maetLahi: "#2f2a4f",
      puut: "#221d3a",
    },
    saa: ["tahdet", "lumi"], // tähtitaivas ja lumisade
    pimeys: 0.45, // vähän pimeää: ukko ja tulipallot valaisevat

    tasot: [
      // --- OSA 1: matka vuorelle ---
      { x: 0, y: 410, leveys: 350, korkeus: 40 }, // tällä tasolla on salainen luola!
      { x: 430, y: 410, leveys: 250, korkeus: 40 },
      { x: 520, y: 310, leveys: 100, korkeus: 20 },
      { x: 760, y: 410, leveys: 300, korkeus: 40 },
      { x: 850, y: 300, leveys: 120, korkeus: 20 },

      // --- OSA 2: pomon areena ---
      // Areenalla ei ole tasoja, koska Isäukon pää osuisi niihin.
      // Hänen päälleen voi hypätä suoraan maasta täydellä hypyllä!
      { x: 1150, y: 410, leveys: 1350, korkeus: 40 },
    ],

    liikkuvatTasot: [],

    kolikot: [
      // Osa 1
      { x: 200, y: 270 }, // kallion päällä
      { x: 235, y: 375 }, // salaisessa luolassa!
      { x: 390, y: 330 }, // kuopan päällä
      { x: 570, y: 270 },
      { x: 720, y: 330 }, // kuopan päällä
      { x: 910, y: 260 },
      { x: 1000, y: 370 },
      { x: 1105, y: 330 }, // kuopan päällä
      // Osa 2
      { x: 1300, y: 370 },
      { x: 1600, y: 330 },
      { x: 1850, y: 290 },
      { x: 2100, y: 290 },
      { x: 2350, y: 330 },
    ],

    viholliset: [
      { x: 500, lattia: 410, vasen: 440, oikea: 640, nopeus: 1.2 },
      { x: 900, lattia: 410, vasen: 770, oikea: 1010, nopeus: 1.5 },
    ],

    lentovihut: [
      { x: 600, y: 220, vasen: 450, oikea: 750, nopeus: 1.5, heilunta: 30 },
    ],

    // POMO! Isäukko herää, kun pelaaja menee kohdan "alue" ohi.
    // Isäukko kävelee vasemman ja oikean reunan välillä (koko areena).
    // Kun hän herää, pelaajan taakse nousee "portti" eli seinä,
    // ettei areenalta pääse pakoon. Seinä katoaa, kun Isäukko voitetaan.
    // Maali tulee näkyviin vasta, kun Isäukko on voitettu.
    pomo: {
      x: 1800,
      lattia: 410,
      vasen: 1445,
      oikea: 2452,
      alue: 1560,
      // Portti ulottuu ruudun yläreunan yli, ettei sen yli voi hypätä
      // (Isäukon pään päältä pomppu vie tosi korkealle!)
      portti: { x: 1410, y: -400, leveys: 32, korkeus: 810 },
    },

    // SALAINEN LUOLA! Kallio näyttää tavalliselta, mutta sen sisällä on luola.
    // Yhden seinän läpi voi kävellä (aukko: "oikea" tai "vasen").
    //   x, lattia = missä kallio on
    //   leveys, korkeus = kallion koko
    salaisetLuolat: [
      { x: 110, lattia: 410, leveys: 200, korkeus: 100, aukko: "oikea" },
    ],

    // Sydän on piilossa salaisessa luolassa
    sydamet: [{ x: 168, y: 372 }],

    valitallennus: { x: 1250, lattia: 410 },
    maali: { x: 2420, lattia: 410 },
  };
}

// Kaikki kentät järjestyksessä. Uuden kentän voi lisätä tekemällä
// funktion kentta6 ja lisäämällä sen tähän listaan.
const KENTAT = [kentta1, kentta2, kentta3, kentta4, kentta5];

// Kenttien paikat maailmankartalla (x = vasemmalta, y = ylhäältä).
// Kartta on 800 x 450 pikseliä. Jos lisäät kentän, lisää sille myös paikka tähän!
const KARTTA = [
  { x: 100, y: 300 }, // kenttä 1
  { x: 250, y: 190 }, // kenttä 2
  { x: 400, y: 300 }, // kenttä 3
  { x: 550, y: 200 }, // kenttä 4 (kalliokuilut)
  { x: 700, y: 280 }, // kenttä 5 (pomo)
];
