// ==========================================
//   POMO: PAKKASUKKO
//   Jättimäinen lumiukko, jolla on JÄÄPANSSARI. Näin se voitetaan:
//   1. Sulata panssari tulipalloilla (3 osumaa). Jääkiteet pään päällä
//      näyttävät, montako osumaa vielä tarvitaan. Tulta saa lisää nuotiolta!
//   2. Kun panssari on sulanut, Pakkasukko on hetken pökerryksissä:
//      HYPPÄÄ SEN PÄÄLLE! Silloin siltä lähtee yksi lumipallo ja se pienenee.
//   3. Kolmen hypyn jälkeen jäljellä ei ole mitään.
//   Hyökkäykset:
//   - LUMIPALLOT: heittää kolme lumipalloa kaaressa
//   - VYÖRY: vierittää ison lumipallon lattiaa pitkin (hyppää yli!)
//   - VIIMA: puhaltaa hyistä viimaa lattiaa pitkin (kiipeä tasolle tai juokse
//     selän taakse!). Sen jälkeen lattia on hetken liukasta jäätä, ja viima
//     SAMMUTTAA NUOTION hetkeksi. Tulipallo sytyttää nuotion heti uudestaan.
//   - PINGVIINIT: kutsuu apuun pingviinejä (niistä saa tulta, kun hyppää päälle)
//   - JÄÄPUIKOT: kun jäljellä on vain pää, se pomppii ja pudottaa puikkoja katosta
// ==========================================

const PAKKASUKON_PANSSARI = 3; // montako tulipalloa panssari kestää
const PAKKASUKON_SULA_AIKA = 210; // kuinka kauan ukko on sulana (60 = 1 s)
const PAKKASUKON_SULA_AIKA_VAIKEA = 170; // vaikealla on vielä vähemmän aikaa
const PAKKASUKON_NOPEUS = [0, 0, 1.3, 0.9]; // kävelyvauhti, kun palloja on jäljellä 2 tai 3 (pienempi on nopeampi)
const VYORYN_NOPEUS = 3.6; // kuinka nopeasti vyöry vierii
const VIIMAN_PITUUS = 360; // kuinka pitkälle viima yltää (pikseleitä)
const VIIMAN_KORKEUS = 64; // kuinka korkealle lattiasta viima yltää
const VIIMAN_KESTO = 60; // kuinka kauan puhallus kestää
const JAALATTIAN_KESTO = 480; // kuinka kauan lattia on jäässä viiman jälkeen
const PISTEET_VYORY = 100; // vyöryn sulattamisesta tulipallolla

// Pakkasukon lumipallot ylhäältä alas: pää, keskipallo ja alapallo (läpimitta pikseleinä)
const UKON_PALLOT = [40, 48, 56];
const PALLOJEN_LIMITYS = 17; // kuinka paljon pallot ovat päällekkäin

function valmistelePakkasukko(p) {
  p.nimi = "PAKKASUKKO";
  p.koko = 3; // montako lumipalloa on jäljellä
  p.panssari = PAKKASUKON_PANSSARI;
  p.maxElamat = 3 * (PAKKASUKON_PANSSARI + 1);
  p.alkuX = p.x;
  p.elossa = true;
  p.kipu = 0;
  p.kuolinAika = 0;
  p.heratysTeksti = false;
  p.lattiaTaso = null; // areenan lattia (haetaan, kun pomo herää)
  asetaUkonKoko(p);
  nollaaPakkasukko(p);
}

// Lasketaan ukon leveys ja korkeus siitä, montako palloa on jäljellä
function asetaUkonKoko(p) {
  p.leveys = UKON_PALLOT[p.koko - 1];
  p.korkeus = 0;
  for (let i = 0; i < p.koko; i++) p.korkeus += UKON_PALLOT[i];
  p.korkeus -= PALLOJEN_LIMITYS * (p.koko - 1);
  p.y = p.lattia - p.korkeus;
  // Elämäpalkki: jokaisesta pallosta 3 panssaria + 1 hyppy
  p.elamat = (p.koko - 1) * (PAKKASUKON_PANSSARI + 1) + p.panssari + 1;
}

// Pakkasukko palaa alkuun (kun yksinpelissä menetetään elämä). Osumat pysyvät.
function nollaaPakkasukko(p) {
  p.herannyt = false;
  p.suunta = -1;
  p.tila = "kavelee";
  p.ajastin = 110;
  p.vx = 0;
  p.vy = 0;
  p.vilkku = 0;
  p.hyppyTauko = 0;
  p.edellinenHyokkays = "";
  p.toinenVyory = false;
  if (p.panssari <= 0) p.panssari = 1; // sulanut ukko ehti jäätyä vähän
  asetaUkonKoko(p);
  p.x = p.alkuX + (UKON_PALLOT[2] - p.leveys) / 2;
  p.edellinenY = p.y;
  siivoaPakkasukko(p);
}

// Poistaa hyökkäykset ja apurit (kun pomo nollataan tai kaatuu)
function siivoaPakkasukko(p) {
  p.vyoryt = [];
  p.kivet = [];
  p.aallot = [];
  p.jaaAika = 0;
  if (p.lattiaTaso) p.lattiaTaso.jaa = false;
  // Onko tämän pomon kenttä jo käynnissä? (Kentän alussa ei vielä ole.)
  if (typeof kentta === "undefined" || !kentta || kentta.pomo !== p || !kentta.jaapuikot) return;
  kentta.lumipallot = [];
  for (const n of kentta.nuotiot) n.sammunut = 0; // sammutetut nuotiot syttyvät taas
  kentta.jaapuikot = kentta.jaapuikot.filter((puikko) => !puikko.pomon);
  for (const v of kentta.viholliset) {
    if (v.kutsuttu && v.elossa) lisaaHiukkasia(v.x + 13, v.y + 15, 10, ["white", "#cfe1f0"], 3);
  }
  kentta.viholliset = kentta.viholliset.filter((v) => !v.kutsuttu);
}

// ---------- PÄIVITYS ----------

function paivitaPakkasukko(p, dt, elavat) {
  if (!p.lattiaTaso) {
    p.lattiaTaso = kentta.tasot.find((t) => t.y === p.lattia && p.alkuX >= t.x && p.alkuX < t.x + t.leveys);
  }
  p.edellinenY = p.y;
  p.ajastin -= dt;
  if (p.vilkku > 0) p.vilkku -= dt;
  if (p.hyppyTauko > 0) p.hyppyTauko -= dt;
  const maassa = p.y >= p.lattia - p.korkeus - 0.5;
  const keski = p.x + p.leveys / 2;

  // Jäinen lattia sulaa aikanaan
  if (p.jaaAika > 0) {
    p.jaaAika -= dt;
    if (p.jaaAika <= 0 && p.lattiaTaso) p.lattiaTaso.jaa = false;
  }

  if (p.tila === "kavelee") {
    p.suunta = pelaaja.x + 10 < keski ? -1 : 1;
    if (p.koko > 1) {
      // Liukuu hitaasti ukkoa kohti. Pienempänä se on nopeampi.
      p.x += PAKKASUKON_NOPEUS[p.koko] * p.suunta * dt;
    } else if (maassa && p.hyppyTauko <= 0) {
      // Pelkkä pää pomppii (matalia pomppuja, että tulipallo ehtii osua)
      p.vy = -7;
      p.vx = p.suunta * 2.6;
    }
    if (p.ajastin <= 0 && maassa) valitsePakkasukonHyokkays(p);
  } else if (p.tila === "heittaa") {
    // Kolme lumipalloa peräkkäin (pienempänä neljä)
    for (const hetki of p.koko === 3 ? [24, 12, 0] : [36, 24, 12, 0]) {
      if (p.ajastin <= hetki && p.ajastin + dt > hetki) {
        const lahtoX = keski - 9 + p.suunta * 20;
        // Pallo lentää noin 60 hetkeä: tähdätään ukon lähelle, joka kerta vähän eri kohtaan
        const kohde = pelaaja.x + 10 + (hetki - 12) * 5;
        let vx = (kohde - lahtoX) / 60;
        vx = Math.max(-7, Math.min(7, vx));
        heitaLumipallo(lahtoX, p.y + 10, vx, -8, 18);
        aanet.heitto();
      }
    }
    if (p.ajastin <= 0) lepaa(p, 50);
  } else if (p.tila === "vierittaa") {
    if (p.ajastin <= 0) {
      p.vyoryt.push({
        x: p.suunta === 1 ? p.x + p.leveys : p.x - 28,
        y: p.lattia - 28,
        leveys: 28,
        korkeus: 28,
        vx: p.suunta * VYORYN_NOPEUS,
        elossa: true,
      });
      aanet.ryntays();
      if (p.koko <= 2 && !p.toinenVyory) {
        // Pienempi ukko vierittää heti toisenkin pallon perään
        p.toinenVyory = true;
        p.ajastin = 55;
      } else {
        p.toinenVyory = false;
        lepaa(p, 60);
      }
    }
  } else if (p.tila === "hengittaa") {
    // Vetää henkeä: kohta tulee viima!
    if (p.ajastin <= 0) {
      p.tila = "puhaltaa";
      p.ajastin = VIIMAN_KESTO;
      aanet.puhallus();
      // Viima sammuttaa nuotiot, joihin se yltää (pakkanen.js)
      const alue = viimanAlue(p);
      for (const n of kentta.nuotiot) {
        const osuuViimaan = n.x + n.leveys > alue.x && n.x < alue.x + alue.leveys;
        if (osuuViimaan) sammutaNuotio(n, vaikea ? NUOTION_SAMMUMINEN * 1.5 : NUOTION_SAMMUMINEN);
      }
    }
  } else if (p.tila === "puhaltaa") {
    const alue = viimanAlue(p);
    if (Math.random() < 0.8 * dt) {
      const x = alue.x + Math.random() * alue.leveys;
      lisaaHiukkasia(x, p.lattia - Math.random() * VIIMAN_KORKEUS, 1, ["white", "#c9f0ff", "#8fd3f0"], 1.5);
    }
    if (p.ajastin <= 0) {
      // Viiman jälkeen lattia on jäässä
      if (p.lattiaTaso) p.lattiaTaso.jaa = true;
      p.jaaAika = JAALATTIAN_KESTO;
      lisaaTeksti(keski + p.suunta * 150, p.lattia - 50, "LATTIA JÄÄTYI!");
      aanet.jaatyy();
      lepaa(p, 40);
    }
  } else if (p.tila === "kutsuu") {
    if (p.ajastin <= 0) {
      kutsuPingviini(p);
      lepaa(p, 40);
    }
  } else if (p.tila === "loikkaa") {
    // Pää hyppäsi korkealle: kun se tömähtää alas, katosta putoaa jääpuikkoja
    if (maassa && p.vy >= 0 && p.ajastin < 20) {
      tarina = 10;
      aanet.maanjaristys();
      pudotaPuikot(p, elavat);
      lepaa(p, 60);
    }
  } else if (p.tila === "lepaa") {
    if (p.ajastin <= 0) {
      p.tila = "kavelee";
      // Tauko ennen seuraavaa hyökkäystä: pienempi ukko hyökkää tiuhempaan
      p.ajastin = (40 + p.koko * 15) * (vaikea ? 0.75 : 1);
    }
  } else if (p.tila === "sulanut") {
    // Vesi tippuu
    if (Math.random() < 0.25 * dt) {
      lisaaHiukkasia(p.x + Math.random() * p.leveys, p.y + 20, 1, ["#8fd3f0", "#c9f0ff"], 1);
    }
    if (p.ajastin <= 0) {
      // Kukaan ei ehtinyt hypätä päälle: panssari jäätyy kokonaan takaisin
      p.panssari = PAKKASUKON_PANSSARI;
      asetaUkonKoko(p);
      p.tila = "jaatyy";
      p.ajastin = 45;
      lisaaTeksti(keski, p.y - 20, "JÄÄTYI TAKAISIN!");
      aanet.jaatyy();
    }
  } else if (p.tila === "jaatyy") {
    if (p.ajastin <= 0) {
      p.tila = "kavelee";
      p.ajastin = 70;
    }
  }

  // Pää lentää ilmassa ja putoaa (isompi ukko pysyy aina maassa)
  if (p.tila !== "kavelee" && p.tila !== "loikkaa") p.vx = 0;
  p.vy += 0.45 * dt;
  p.y += p.vy * dt;
  if (p.vy !== 0 || !maassa) p.x += p.vx * dt;
  if (p.y >= p.lattia - p.korkeus) {
    if (p.vy > 2) p.hyppyTauko = 36; // laskeutui: tauko ennen seuraavaa pomppua
    p.y = p.lattia - p.korkeus;
    p.vy = 0;
    p.vx = 0;
  }

  // Areenan reunat
  if (p.x < p.vasen) p.x = p.vasen;
  if (p.x > p.oikea) p.x = p.oikea;

  paivitaVyoryt(p, dt);

  for (const pl of elavat) {
    pelaaja = pl;
    pakkasukkoOsuuPelaajaan(p);
    if (tila !== "peli") return true;
  }
  return false;
}

function lepaa(p, aika) {
  p.tila = "lepaa";
  p.ajastin = aika;
}

function valitsePakkasukonHyokkays(p) {
  // Mitä pienempi ukko, sitä kovemmat konstit
  let vaihtoehdot = ["heittaa", "vierittaa", "hengittaa", "kutsuu"];
  if (p.koko === 1) vaihtoehdot = ["loikkaa", "hengittaa", "kutsuu"];

  const pingviineja = kentta.viholliset.filter((v) => v.kutsuttu && v.elossa).length;
  vaihtoehdot = vaihtoehdot.filter((h) => {
    if (h === p.edellinenHyokkays) return false; // ei samaa kahdesti peräkkäin
    if (h === "kutsuu" && pingviineja >= (vaikea ? 3 : 2)) return false;
    if (h === "hengittaa" && p.jaaAika > 0) return false; // lattia on jo jäässä
    return true;
  });
  const valinta = vaihtoehdot[Math.floor(Math.random() * vaihtoehdot.length)];
  p.edellinenHyokkays = valinta;
  p.tila = valinta;
  if (valinta === "heittaa") p.ajastin = p.koko === 3 ? 60 : 72; // 36 hetkeä varoitusta, sitten pallot
  if (valinta === "vierittaa") p.ajastin = 40;
  if (valinta === "hengittaa") p.ajastin = 55;
  if (valinta === "kutsuu") p.ajastin = 30;
  if (valinta === "loikkaa") {
    p.ajastin = 40;
    p.vy = -13;
    p.vx = p.suunta * 1.5;
    aanet.pomoHyppy();
    return;
  }
  aanet.ryntays();
}

// Missä viima puhaltaa? (lattiaa pitkin siihen suuntaan, johon ukko katsoo)
function viimanAlue(p) {
  const x = p.suunta === 1 ? p.x + p.leveys : p.x - VIIMAN_PITUUS;
  return { x: x, y: p.lattia - VIIMAN_KORKEUS, leveys: VIIMAN_PITUUS, korkeus: VIIMAN_KORKEUS };
}

// Pingviini putkahtaa lumesta areenan reunalta (kauempaa ukosta)
function kutsuPingviini(p) {
  const vasenReuna = p.areenaVasen;
  const oikeaReuna = p.areenaOikea;
  const keskikohta = (vasenReuna + oikeaReuna) / 2;
  const v = {
    tyyppi: "pingviini",
    x: pelaaja.x > keskikohta ? vasenReuna + 30 : oikeaReuna - 30,
    lattia: p.lattia,
    vasen: vasenReuna,
    oikea: oikeaReuna,
    kutsuttu: true, // Pakkasukon apuri
    eiLasketa: true, // ei lasketa kentän vihuihin
    elossa: true,
    palanut: false,
    kuolinAika: 0,
    vy: 0,
  };
  valmistelePakkasvihu(v);
  v.arvo = 50;
  kentta.viholliset.push(v);
  lisaaHiukkasia(v.x + 13, v.lattia - 10, 14, ["white", "#cfe1f0"], 4);
  lisaaTeksti(v.x + 13, v.lattia - 50, "KVAAK!");
  aanet.pingviini();
}

// Jääpuikot irtoavat katosta: yksi jokaisen pelaajan yläpuolelta ja kaksi muualta
function pudotaPuikot(p, elavat) {
  const paikat = elavat.map((pl) => pl.x + 3);
  for (let i = 0; i < 2; i++) paikat.push(p.areenaVasen + Math.random() * (p.areenaOikea - p.areenaVasen));
  for (const x of paikat) {
    const puikko = { x: x, y: p.katto || 0, pomon: true };
    valmistelePuikko(puikko);
    puikko.tila = "tarisee";
    puikko.ajastin = 50;
    kentta.jaapuikot.push(puikko);
  }
  aanet.puikkoVaroitus();
}

// Vyöry: iso lumipallo vierii lattiaa pitkin ja kasvaa
function paivitaVyoryt(p, dt) {
  if (p.vyoryt.length === 0) return;
  for (const v of p.vyoryt) {
    v.x += v.vx * dt;
    if (v.leveys < 56) {
      // Pallo kasvaa vieriessään (keskikohta pysyy paikallaan)
      const kasvu = 0.3 * dt;
      v.leveys += kasvu;
      v.korkeus += kasvu;
      v.x -= kasvu / 2;
      v.y = p.lattia - v.korkeus;
    }
    // Seinään osuessaan pallo hajoaa
    for (const t of kentta.kaikkiTasot) {
      if (t !== p.lattiaTaso && !t.eiKiintea && osuu(v, t)) v.elossa = false;
    }
    // Tulipallo sulattaa vyöryn
    for (const t of tulipallot) {
      if (v.elossa && t.elossa && osuu(t, v)) {
        t.elossa = false;
        v.elossa = false;
        pisteet += PISTEET_VYORY;
        lisaaTeksti(v.x + v.leveys / 2, v.y - 8, "+" + PISTEET_VYORY);
        aanet.sulaa();
      }
    }
    if (!v.elossa) lisaaHiukkasia(v.x + v.leveys / 2, v.y + v.korkeus / 2, 16, ["white", "#cfe1f0", "#9fb9d6"], 4);
  }
  p.vyoryt = p.vyoryt.filter((v) => v.elossa);
}

// Tulipallo osui Pakkasukkoon (peli.js kutsuu tätä)
function sulataPakkasukkoa(p) {
  const keski = p.x + p.leveys / 2;
  if (p.tila === "sulanut") {
    lisaaTeksti(keski, p.y - 20, "HYPPÄÄ PÄÄLLE!");
    return;
  }
  if (p.tila === "jaatyy" || p.vilkku > 0) return; // juuri nyt tuli ei tehoa
  p.panssari--;
  p.vilkku = 8;
  asetaUkonKoko(p);
  lisaaHiukkasia(keski, p.y + p.korkeus / 2, 14, ["white", "#c9f0ff", "#8fd3f0"], 4);
  aanet.sulaa();
  if (p.panssari > 0) {
    lisaaTeksti(keski, p.y - 20, "JÄÄ SULAA!");
    return;
  }
  // Panssari suli kokonaan: ukko on pökerryksissä
  p.tila = "sulanut";
  p.ajastin = vaikea ? PAKKASUKON_SULA_AIKA_VAIKEA : PAKKASUKON_SULA_AIKA;
  tarina = 6;
  aanet.sammuu();
  lisaaTeksti(keski, p.y - 20, "SULI! HYPPÄÄ PÄÄLLE!");
}

// Ukko lentää sivuun Pakkasukon päältä (lähimmän reunan puolelle)
function pomppaaPakkasukosta(p, voima) {
  pelaaja.vy = -voima;
  pelaaja.hyppaa = false;
  pelaaja.venytys = 0.35;
  const ukonKeski = pelaaja.x + pelaaja.leveys / 2;
  pelaaja.suunta = ukonKeski < p.x + p.leveys / 2 ? -1 : 1;
  if (pelaaja.suunta === -1 && p.x <= p.vasen + 20) pelaaja.suunta = 1;
  if (pelaaja.suunta === 1 && p.x >= p.oikea - 20) pelaaja.suunta = -1;
  pelaaja.potkuAika = MAGMAN_POTKU;
}

// Osuuko Pakkasukko tai sen hyökkäys pelaajaan? (pelaaja = se, jota käsitellään)
function pakkasukkoOsuuPelaajaan(p) {
  if (pelaaja.suojaAika <= 0) {
    for (const v of p.vyoryt) {
      if (osuu(pelaaja, v)) {
        lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "VYÖRY!");
        return menetaElama();
      }
    }
    if (p.tila === "puhaltaa" && osuu(pelaaja, viimanAlue(p))) {
      lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "HYRR!");
      return menetaElama();
    }
  }
  if (!osuu(pelaaja, p)) return;

  const edellisetJalat = pelaaja.edellinenY + pelaaja.korkeus;
  const ylhaalta = pelaaja.vy > 0 && edellisetJalat <= Math.max(p.y, p.edellinenY) + 25;

  if (p.tila === "sulanut") {
    if (!ylhaalta) return; // sulanut ukko ei satuta
    // OSUMA! Alin pallo hajoaa ja ukko pienenee.
    if (!osuPomoon(1)) return;
    lataaTulta();
    pomppaaPakkasukosta(p, HYPPYVOIMA);
    pelaaja.hyppaa = hyppyNappiPohjassa();
    if (p.elossa) pienennaPakkasukkoa(p);
    return;
  }
  if (p.tila === "jaatyy") return; // jäätyvä ukko ei vielä satuta

  if (ylhaalta) {
    // Jääpanssari on liian kova: ukko vain kimpoaa pois
    lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "KOVAA JÄÄTÄ!");
    aanet.kova();
    pomppaaPakkasukosta(p, HYPPYVOIMA * 0.75);
    return;
  }
  if (pelaaja.suojaAika <= 0) {
    lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "KYLMÄ!");
    menetaElama();
  }
}

// Alin lumipallo hajosi: ukko on nyt yhtä palloa pienempi
function pienennaPakkasukkoa(p) {
  const keski = p.x + p.leveys / 2;
  lisaaHiukkasia(keski, p.lattia - 25, 35, ["white", "#cfe1f0", "#9fb9d6"], 6);
  p.koko--;
  p.panssari = PAKKASUKON_PANSSARI;
  asetaUkonKoko(p);
  p.x = keski - p.leveys / 2;
  p.edellinenY = p.y;
  p.vy = 0;
  p.tila = "jaatyy";
  p.ajastin = 70;
  lisaaTeksti(keski, p.y - 30, p.koko === 1 ? "VAIN PÄÄ JÄLJELLÄ!" : "PAKKASUKKO PIENENI!");
}

// ---------- PIIRTÄMINEN ----------

// Pyöreä lumipallo tehdään pikseli kerrallaan (ja vain kerran jokaista kokoa kohti).
// sade = pallon säde kuvan pikseleinä. Ruudulle pallo piirretään 2 kertaa isompana.
// vari: "lumi" = valkoinen, "jaa" = jäinen, "vilkku" = kokonaan valkoinen
const pallonKuvat = {};
const PALLON_VARIT = {
  lumi: ["#ffffff", "#cfe1f0", "#9fb9d6"],
  jaa: ["#d6f4ff", "#8fd3f0", "#4f9ed0"],
  vilkku: ["#ffffff", "#ffffff", "#ffffff"],
};

function pallonKuva(sade, vari) {
  const avain = sade + vari;
  if (pallonKuvat[avain]) return pallonKuvat[avain];
  const kuva = document.createElement("canvas");
  kuva.width = sade * 2;
  kuva.height = sade * 2;
  const c = kuva.getContext("2d");
  const varit = PALLON_VARIT[vari];
  for (let y = 0; y < sade * 2; y++) {
    for (let x = 0; x < sade * 2; x++) {
      const dx = x + 0.5 - sade;
      const dy = y + 0.5 - sade;
      const matka = Math.sqrt(dx * dx + dy * dy); // kuinka kaukana pallon keskeltä
      if (matka > sade) continue; // pallon ulkopuolella
      const varjo = (dx + dy) / sade; // valo tulee vasemmalta ylhäältä
      if (matka > sade - 1.2) c.fillStyle = "black"; // reunaviiva
      else if (varjo > 0.75) c.fillStyle = varit[2];
      else if (varjo > 0.25) c.fillStyle = varit[1];
      else c.fillStyle = varit[0];
      c.fillRect(x, y, 1, 1);
    }
  }
  pallonKuvat[avain] = kuva;
  return kuva;
}

// Piirtää pallon, jonka vasen yläkulma on (x, y) ja läpimitta d
function piirraPallo(x, y, d, vari) {
  ctx.drawImage(pallonKuva(Math.round(d / 4), vari), Math.round(x), Math.round(y), d, d);
}

function piirraPakkasukko(p, aika) {
  piirraPakkasukonHyokkaykset(p, aika);
  if (!p.elossa && p.kuolinAika <= 0) return;

  const sulanut = p.tila === "sulanut";
  let x = p.x;
  const keski = () => x + p.leveys / 2;

  ctx.save();
  if (!p.elossa) {
    // Kuollessaan Pakkasukko sulaa lätäköksi
    const osa = Math.max(0.03, p.kuolinAika / 120);
    ctx.globalAlpha = Math.min(1, p.kuolinAika / 40);
    ctx.translate(p.x + p.leveys / 2, p.lattia);
    ctx.scale(1 + (1 - osa) * 0.8, osa);
    ctx.translate(-(p.x + p.leveys / 2), -p.lattia);
  } else if (sulanut) {
    // Sulana ukko on lysyssä ja huojuu
    ctx.translate(p.x + p.leveys / 2, p.lattia);
    ctx.scale(1.06, 0.9 + Math.sin(aika / 160) * 0.02);
    ctx.translate(-(p.x + p.leveys / 2), -p.lattia);
  }
  // Tärisee ennen hyökkäystä
  if (["heittaa", "vierittaa", "hengittaa", "kutsuu"].includes(p.tila)) x += Math.round(Math.sin(aika / 20) * 2);

  // Väri: jäinen panssari, sulanut valkoinen lumi tai välähdys osumasta
  let vari = "jaa";
  if (sulanut || !p.elossa) vari = "lumi";
  if (p.tila === "jaatyy" && Math.floor(aika / 90) % 2 === 0) vari = "lumi";
  if (p.vilkku > 0 || (p.kipu > 0 && Math.floor(p.kipu / 4) % 2 === 0)) vari = "vilkku";

  // Pallot alhaalta ylös (pää on listan ensimmäinen)
  const ylareunat = [];
  let y = p.y;
  for (let i = 0; i < p.koko; i++) {
    ylareunat.push(y);
    y += UKON_PALLOT[i] - PALLOJEN_LIMITYS;
  }
  // Kädet ovat keskipallossa (pelkällä päällä ei ole käsiä)
  if (p.koko >= 2) {
    const ky = ylareunat[1] + 20;
    const ylhaalla = p.tila === "heittaa" || p.tila === "kutsuu";
    const nosto = ylhaalla ? -26 : sulanut ? 14 : -6;
    ctx.strokeStyle = "#5a3716";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(keski() - 20, ky);
    ctx.lineTo(keski() - 44, ky + nosto);
    ctx.moveTo(keski() + 20, ky);
    ctx.lineTo(keski() + 44, ky + nosto);
    ctx.stroke();
  }
  for (let i = p.koko - 1; i >= 0; i--) {
    const d = UKON_PALLOT[i];
    piirraPallo(keski() - d / 2, ylareunat[i], d, vari);
    if (i === 1) {
      // Hiilinapit
      ctx.fillStyle = "black";
      ctx.fillRect(keski() - 3, ylareunat[1] + 20, 6, 6);
      ctx.fillRect(keski() - 3, ylareunat[1] + 32, 6, 6);
    }
  }

  // Kasvot (pää on 40 pikseliä leveä)
  const px = keski() - 20;
  const py = p.y;
  const katse = p.suunta * 3;
  ctx.fillStyle = "black";
  if (sulanut || !p.elossa) {
    // Silmät kiinni
    ctx.fillRect(px + 9, py + 16, 8, 3);
    ctx.fillRect(px + 23, py + 16, 8, 3);
  } else {
    ctx.fillRect(px + 10 + katse, py + 13, 6, 6);
    ctx.fillRect(px + 24 + katse, py + 13, 6, 6);
    // Vihaiset kulmakarvat
    ctx.fillRect(px + 7 + katse, py + 9, 10, 3);
    ctx.fillRect(px + 23 + katse, py + 9, 10, 3);
  }
  // Porkkananenä osoittaa sinne, minne ukko katsoo
  ctx.fillStyle = "#ff9a2a";
  ctx.fillRect(px + 17 + katse, py + 20, 6, 6);
  ctx.fillRect(p.suunta === 1 ? px + 23 + katse : px + 9 + katse, py + 21, 8, 4);
  // Suu: auki, kun vetää henkeä tai puhaltaa
  ctx.fillStyle = "black";
  if (p.tila === "hengittaa" || p.tila === "puhaltaa") ctx.fillRect(px + 14 + katse, py + 28, 12, 8);
  else ctx.fillRect(px + 12 + katse, py + 30, 16, 3);

  // Jääkruunu
  if (p.elossa) {
    ctx.fillStyle = sulanut ? "#8fd3f0" : "#d6f4ff";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 6, py + 4);
    ctx.lineTo(px + 6, py - 12);
    ctx.lineTo(px + 13, py - 4);
    ctx.lineTo(px + 20, py - 16);
    ctx.lineTo(px + 27, py - 4);
    ctx.lineTo(px + 34, py - 12);
    ctx.lineTo(px + 34, py + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
  if (!p.elossa) return;

  if (sulanut) {
    // Pökerryksissä: nuoli näyttää, että nyt pitää hypätä päälle. Lopussa se vilkkuu.
    const kiire = p.ajastin < 90 && Math.floor(aika / 100) % 2 === 0;
    if (!kiire) reunaTeksti("▼", p.x + p.leveys / 2, p.y - 26 + Math.sin(aika / 120) * 5, 26, "center", "gold");
  } else if (p.herannyt) {
    // Jääkiteet näyttävät, montako tulipalloa panssari vielä kestää
    for (let i = 0; i < p.panssari; i++) {
      const kx = p.x + p.leveys / 2 + (i - (p.panssari - 1) / 2) * 20;
      const ky = p.y - 34 + Math.sin(aika / 200 + i) * 2;
      ctx.fillStyle = "#8fd3f0";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(kx, ky - 8);
      ctx.lineTo(kx + 7, ky);
      ctx.lineTo(kx, ky + 8);
      ctx.lineTo(kx - 7, ky);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.fillRect(kx - 2, ky - 3, 2, 3);
    }
  }
}

function piirraPakkasukonHyokkaykset(p, aika) {
  for (const v of p.vyoryt) {
    piirraPallo(v.x - 1, v.y - 1, Math.round(v.leveys / 4) * 4 + 2, "lumi");
  }
  if (!p.elossa) return;

  if (p.tila === "hengittaa") {
    // Varoitus: vilkkuva alue näyttää, mihin viima kohta osuu
    const alue = viimanAlue(p);
    const vilkku = Math.floor(aika / 100) % 2 === 0 ? 0.35 : 0.15;
    ctx.fillStyle = "rgba(160, 225, 255, " + vilkku + ")";
    ctx.fillRect(alue.x, alue.y, alue.leveys, alue.korkeus);
    reunaTeksti("!", alue.x + alue.leveys / 2, alue.y - 10, 30, "center", "#ff3c3c");
  } else if (p.tila === "puhaltaa") {
    // Viima: sinertävä pilvi ja valkoisia viiruja, jotka lentävät ukosta poispäin
    const alue = viimanAlue(p);
    ctx.fillStyle = "rgba(190, 235, 255, 0.45)";
    ctx.fillRect(alue.x, alue.y, alue.leveys, alue.korkeus);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    for (let i = 0; i < 12; i++) {
      let kohta = (i * 83 + aika * 0.6) % alue.leveys;
      if (p.suunta === -1) kohta = alue.leveys - kohta;
      ctx.fillRect(Math.round(alue.x + kohta), alue.y + 4 + ((i * 23) % (alue.korkeus - 8)), 24, 3);
    }
  }
}

// Pimeissä kentissä Pakkasukko hohtaa vähän
function pakkasukonValot(valo) {
  const p = kentta.pomo;
  if (p && p.tyyppi === "pakkas" && p.elossa) valo(p.x + p.leveys / 2, p.y + p.korkeus / 2, 110);
}

// ---------- KARTTA ----------

// Pieni nukkuva Pakkasukko kartalle (x = keskikohta, y = alareuna)
function piirraPakkasukkoKuvake(x, y, aika) {
  const hengitys = Math.round(Math.sin(aika / 600) * 1.5);
  piirraPallo(x - 20, y - 36, 40, "jaa");
  piirraPallo(x - 14, y - 60 + hengitys, 28, "jaa");
  ctx.fillStyle = "black"; // silmät kiinni
  ctx.fillRect(x - 8, y - 48 + hengitys, 5, 2);
  ctx.fillRect(x + 3, y - 48 + hengitys, 5, 2);
  ctx.fillStyle = "#ff9a2a"; // porkkananenä
  ctx.fillRect(x - 2, y - 44 + hengitys, 7, 4);
}

// Jäälinna kartalle Pakkasukon kentän taakse
function piirraJaalinnaKartalla(paikka, aika) {
  const pohja = paikka.y - 8;
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  // Kolme tornia: reunoilla matalat, keskellä korkea
  const tornit = [
    { x: paikka.x - 62, leveys: 34, korkeus: 80 },
    { x: paikka.x + 28, leveys: 34, korkeus: 80 },
    { x: paikka.x - 24, leveys: 48, korkeus: 120 },
  ];
  for (const t of tornit) {
    const huippu = pohja - t.korkeus;
    ctx.fillStyle = "#8fd3f0";
    ctx.fillRect(t.x, huippu, t.leveys, t.korkeus);
    ctx.strokeRect(t.x, huippu, t.leveys, t.korkeus);
    ctx.fillStyle = "#d6f4ff"; // kiilto tornin kyljessä
    ctx.fillRect(t.x + 4, huippu + 6, 5, t.korkeus - 14);
    // Terävä jääkatto
    ctx.fillStyle = "#4f9ed0";
    ctx.beginPath();
    ctx.moveTo(t.x - 5, huippu);
    ctx.lineTo(t.x + t.leveys / 2, huippu - t.leveys * 0.9);
    ctx.lineTo(t.x + t.leveys + 5, huippu);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Ikkuna
    ctx.fillStyle = "#1d2b53";
    ctx.fillRect(t.x + t.leveys / 2 - 4, huippu + 16, 8, 14);
  }
  // Kimallus: tähti vilkkuu vuorotellen tornien huipuilla
  const vuoro = Math.floor(aika / 700) % 3;
  const t = tornit[vuoro];
  ctx.fillStyle = "white";
  const tx = t.x + t.leveys / 2;
  const ty = pohja - t.korkeus - t.leveys * 0.9;
  ctx.fillRect(tx - 1, ty - 7, 2, 14);
  ctx.fillRect(tx - 7, ty - 1, 14, 2);
}
