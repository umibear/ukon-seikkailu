// ==========================================
//   VAIKEAT KENTÄT
//   Kun pelataan vaikealla (vaikea.js), kenttä tehdään ensin tavallisesti
//   ja sitten siihen tehdään tässä luetellut muutokset.
//   - Vihreä saari:   tasoja otetaan pois ja tilalle tulee LIAANEJA (liaanit.js)
//   - Tulivuorisaari: RUUTITYNNYREITÄ, sytytyslankoja, murtuvia seiniä
//                     ja LAAVATULVA (ruuti.js)
//   - Pakkassaari:    pakkanen puree itsestään (pakkanen.js), joten kenttiin
//                     tarvitaan vain pari nuotiota lisää
//   Kokeile itse: lisää liaani, tynnyri tai tulva johonkin kenttään!
// ==========================================

// Etsii listasta asian, jonka x on annettu (esim. taso tai vihu)
function etsi(lista, x) {
  return lista.find((asia) => asia.x === x);
}

// Poistaa listasta asian, jonka x on annettu
function poista(lista, x) {
  const kohta = lista.findIndex((asia) => asia.x === x);
  if (kohta >= 0) lista.splice(kohta, 1);
}

// Siirtää kolikon liaanin heilahduksen varrelle, jotta sen saa kerättyä
// heiluessa. kulma: 0 = suoraan liaanin alla, plus = oikealla, miinus = vasemmalla.
function kolikkoLiaaniin(k, kolikonX, liaani, kulma) {
  const kolikko = etsi(k.kolikot, kolikonX);
  const matka = liaani.pituus * 0.85; // suunnilleen tässä kohdassa ukon kädet ovat
  kolikko.x = Math.round(liaani.x + Math.sin(kulma) * matka - 10);
  kolikko.y = Math.round(liaani.y + Math.cos(kulma) * matka + 5);
}

// Pieni turvataso, jolle pääsee laavatulvaa pakoon
function turvataso(k, x) {
  k.tasot.push({ x: x, y: 330, leveys: 100, korkeus: 20 });
}

// Jokaisen kentän muutokset. Järjestys on sama kuin KENTAT-listassa:
// ensimmäinen funktio muuttaa kenttää 1, toinen kenttää 2 ja niin edelleen.
const VAIKEAT_KENTAT = [
  // ---------- MAAILMA 1: VIHREÄ SAARI ----------

  // Kenttä 1, Vihreät kukkulat: kuilujen yli heilutaan liaanilla
  function (k) {
    poista(k.putoavatTasot, 2060);
    poista(k.putoavatTasot, 2160);
    poista(k.liikkuvatTasot, 3310);
    poista(k.putoavatTasot, 3850);
    poista(k.putoavatTasot, 3950);
    k.liaanit = [
      { x: 2055, y: 100, pituus: 220 },
      { x: 3305, y: 100, pituus: 220 },
      { x: 3840, y: -40, pituus: 260 }, // roikkuu korkealta: tähän hypätään ylätasolta
    ];
    kolikkoLiaaniin(k, 2085, k.liaanit[0], -0.4);
    kolikkoLiaaniin(k, 2185, k.liaanit[0], 0.4);
    kolikkoLiaaniin(k, 3300, k.liaanit[1], 0);
    kolikkoLiaaniin(k, 3880, k.liaanit[2], 0);
    kolikkoLiaaniin(k, 3970, k.liaanit[2], 0.5);
    // Lentovihu siirtyy pois liaanin tieltä
    const lento = etsi(k.lentovihut, 2150);
    lento.x = 2400;
    lento.vasen = 2280;
    lento.oikea = 2560;
  },

  // Kenttä 2, Auringonlasku: pitkän kuilun yli pääsee vain kolmella liaanilla peräkkäin
  function (k) {
    poista(k.liikkuvatTasot, 485);
    poista(k.liikkuvatTasot, 2180);
    poista(k.putoavatTasot, 2340);
    poista(k.liikkuvatTasot, 2470);
    k.liaanit = [
      { x: 455, y: 100, pituus: 220 },
      { x: 2155, y: 100, pituus: 220 },
      { x: 2315, y: 100, pituus: 220 },
      { x: 2475, y: 100, pituus: 220 },
    ];
    kolikkoLiaaniin(k, 500, k.liaanit[0], -0.2);
    kolikkoLiaaniin(k, 560, k.liaanit[0], 0.3);
    kolikkoLiaaniin(k, 2200, k.liaanit[1], 0);
    kolikkoLiaaniin(k, 2360, k.liaanit[2], 0);
    kolikkoLiaaniin(k, 2480, k.liaanit[3], 0);
    // Lentovihut siirtyvät pois liaanien tieltä
    const lento1 = etsi(k.lentovihut, 520);
    lento1.x = 300;
    lento1.vasen = 250;
    lento1.oikea = 420;
    const lento2 = etsi(k.lentovihut, 2350);
    lento2.x = 2800;
    lento2.y = 250;
    lento2.vasen = 2620;
    lento2.oikea = 2950;
  },

  // Kenttä 3, Pilvipolku: putoavien pilvitasojen tilalla on liaanit taivaalta
  function (k) {
    for (const x of [920, 1040, 1160, 2600, 2720, 2840]) poista(k.putoavatTasot, x);
    poista(k.liikkuvatTasot, 3000);
    k.liaanit = [
      { x: 920, y: -30, pituus: 255 },
      { x: 1080, y: -30, pituus: 255 },
      { x: 2600, y: -30, pituus: 255 },
      { x: 2760, y: -30, pituus: 255 },
      { x: 2920, y: -30, pituus: 255 },
      { x: 3080, y: -30, pituus: 255 },
    ];
    kolikkoLiaaniin(k, 945, k.liaanit[0], 0);
    kolikkoLiaaniin(k, 1065, k.liaanit[0], 0.45);
    kolikkoLiaaniin(k, 1185, k.liaanit[1], 0.2);
    kolikkoLiaaniin(k, 2620, k.liaanit[2], 0);
    kolikkoLiaaniin(k, 2740, k.liaanit[2], 0.45);
    kolikkoLiaaniin(k, 2860, k.liaanit[4], 0);
    kolikkoLiaaniin(k, 3040, k.liaanit[5], 0);
    const lento = etsi(k.lentovihut, 2750);
    lento.x = 3250;
    lento.y = 250;
    lento.vasen = 3200;
    lento.oikea = 3380;
  },

  // Kenttä 4, Kalliokuilut: liikkuva taso on poissa, kuilun yli heilutaan
  function (k) {
    poista(k.liikkuvatTasot, 2060);
    k.liaanit = [
      { x: 2005, y: 100, pituus: 220 },
      { x: 2165, y: 100, pituus: 220 },
    ];
    kolikkoLiaaniin(k, 2090, k.liaanit[0], 0.3);
    // Kuilun yllä roikkunut tippuja siirtyy kuilun taakse (siellä se voi myös juosta perään)
    const tippuja = etsi(k.viholliset, 2190);
    tippuja.x = 2280;
    tippuja.lattia = 410;
  },

  // Kenttä 5, Isäukon vuori: areenan yllä on kaksi liaania.
  // Niistä voi väistää Isäukon ryntäyksen ja järistysaallot!
  function (k) {
    // ylaOte: ukko kiipeää liaanissa näin korkealle, ettei Isäukko yllä siihen
    k.liaanit = [
      { x: 1720, y: 60, pituus: 230, ylaOte: 165 },
      { x: 2200, y: 60, pituus: 230, ylaOte: 165 },
    ];
  },

  // ---------- MAAILMA 2: TULIVUORISAARI ----------

  // Kenttä 6, Tuhkarinne: ensimmäiset tynnyrit, murtuvat seinät ja sytytyslanka
  function (k) {
    k.murtuvat = [
      { x: 930, y: 190, leveys: 40, korkeus: 220 },
      { x: 1900, y: 60, leveys: 40, korkeus: 350 },
    ];
    k.tasot.push({ x: 1860, y: 170, leveys: 40, korkeus: 20 }); // hylly, jolla toinen tynnyri on
    k.tynnyrit = [
      { x: 898, lattia: 410 }, // ammu tämä, niin seinä hajoaa
      { x: 1866, lattia: 170 }, // liian korkealla tulipallolle: sytytä lanka!
      { x: 3560, lattia: 410 },
      { x: 3605, lattia: 410 },
    ];
    k.langat = [{ pisteet: [[1760, 386], [1760, 405], [1894, 405], [1894, 176]], tynnyri: 1 }];
    // Vihut eivät kävele seinien läpi
    etsi(k.viholliset, 750).oikea = 850;
    etsi(k.viholliset, 1850).oikea = 1800;
    etsi(k.viholliset, 1850).x = 1700;
  },

  // Kenttä 7, Laavajoki: LAAVATULVA. Matalat saaret jäävät välillä laavan alle.
  function (k) {
    k.tulva = { ala: 470, yla: 372 };
    for (const x of [150, 1930, 2850, 3640, 3880, 4070]) turvataso(k, x);
    etsi(k.tasot, 1930).y = 310;
    etsi(k.tasot, 2850).y = 320;
  },

  // Kenttä 8, Tykkilinnake: jokaisen tykin päällä on tynnyri. Räjäytä tykit!
  function (k) {
    k.tynnyrit = [
      { x: 742, lattia: 378 },
      { x: 1402, lattia: 138 },
      { x: 1822, lattia: 378 },
      { x: 2302, lattia: 378 },
      { x: 3332, lattia: 268 },
      { x: 3852, lattia: 378 },
    ];
    k.langat = [
      { pisteet: [[1000, 146], [1000, 166], [1398, 166], [1398, 140]], tynnyri: 1 },
      { pisteet: [[3470, 386], [3470, 405], [3847, 405], [3847, 380]], tynnyri: 5 },
    ];
  },

  // Kenttä 9, Liekkiluolat: käytävät on muurattu umpeen. Räjäytä tie auki!
  function (k) {
    k.murtuvat = [
      { x: 860, y: 310, leveys: 40, korkeus: 100 },
      { x: 2260, y: 320, leveys: 40, korkeus: 90 },
    ];
    k.tynnyrit = [
      { x: 828, lattia: 410 },
      { x: 2226, lattia: 410 },
      { x: 2700, lattia: 180 }, // yläkäytävässä: salamanterin sylky sytyttää nämä!
      { x: 2910, lattia: 180 },
    ];
    k.langat = [{ pisteet: [[1840, 386], [1840, 405], [2222, 405]], tynnyri: 1 }];
  },

  // Kenttä 10, Kraatterin reuna: tulva JA tynnyrit
  function (k) {
    k.tulva = { ala: 470, yla: 372 };
    for (const x of [120, 1010, 2200, 3960, 4440]) turvataso(k, x);
    k.tynnyrit = [
      { x: 1252, lattia: 378 },
      { x: 1882, lattia: 108 },
      { x: 4302, lattia: 378 },
    ];
    k.langat = [{ pisteet: [[1570, 116], [1570, 136], [1878, 136], [1878, 110]], tynnyri: 1 }];
  },

  // Kenttä 11, Magmamörkön kraatteri: laava tulvii areenalle kesken taistelun.
  // Kiipeä tasoille, kun lukee "LAAVA NOUSEE!"
  function (k) {
    k.tulva = { ala: 470, yla: 372, jakso: 900 };
    turvataso(k, 150);
    turvataso(k, 1250);
    // Kaksi lisätasoa: tulvan aikana pääsee areenan päästä päähän tasoja pitkin
    k.tasot.push({ x: 1740, y: 260, leveys: 90, korkeus: 20 }, { x: 2110, y: 260, leveys: 90, korkeus: 20 });
  },

  // ---------- MAAILMA 3: PAKKASSAARI ----------
  // Pakkanen puree jokaisessa lumikentässä itsestään (pakkanen.js).
  // Pisimpiin nuotiottomiin väleihin tarvitaan yksi nuotio lisää.
  null, // kenttä 12, Lumikenttä
  null, // kenttä 13, Jäälautat
  null, // kenttä 14, Puikkoluola
  null, // kenttä 15, Myrskyharju

  // Kenttä 16, Revontulirinne
  function (k) {
    k.nuotiot.push({ x: 960, lattia: 410 }, { x: 3236, lattia: 410 });
  },

  null, // kenttä 17, Pakkasukon linna
];
