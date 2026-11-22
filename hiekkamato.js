// ==========================================
//   HIEKKAMATO
//   Maailma 4:n pomo. Jättimäinen mato, joka kaivautuu areenan lattian alla.
//   - Maan alla: hiekkakumpu näyttää, missä mato kulkee. Se seuraa ukkoa!
//   - Kun kumpu pysähtyy ja tärisee, mato syöksyy kohta ylös. JUOKSE POIS!
//   - Kun mato on ylhäällä, sen päähän voi osua:
//       hyppää pään päälle tasolta TAI ammu tulipallo päähän (tasolta yltää).
//   - Kun madolla on elämiä vähemmän, se sylkee hiekkapalloja,
//     ja lopuksi se loikkaa kaaressa areenan yli.
//   Kokeile itse: muuta lukuja MADON_ELAMAT tai MADON_YLHAALLA.
// ==========================================

const MADON_ELAMAT = 6;
const MADON_ELAMAT_VAIKEA = 8;
const MADON_LEVEYS = 60;
const MADON_KORKEUS = 190; // kuinka korkealle mato nousee lattiasta
const MADON_PAA = 64; // pään korkeus: tähän pitää osua
const MADON_KAIVUU = 2.6; // kuinka nopeasti kumpu liikkuu (ukon nopeus on 4)
const MADON_KAIVUU_VAIKEA = 3.4;
const MADON_VAROITUS = 42; // kuinka kauan kumpu tärisee ennen syöksyä (60 = 1 s)
const MADON_VAROITUS_VAIKEA = 30;
const MADON_YLHAALLA = 85; // kuinka kauan mato pysyy ylhäällä
const MADON_YLHAALLA_VAIKEA = 65;
const LOIKAN_KESTO = 75;
const LOIKAN_KORKEUS = 200;
const LOIKAN_PALAT = 8; // montako palaa madosta näkyy loikassa
const MADON_VARIT = { selka: "#c9824a", vatsa: "#e8b77a", tumma: "#8f5326" };

function valmisteleMato(p) {
  p.nimi = "HIEKKAMATO";
  p.maxElamat = vaikea ? MADON_ELAMAT_VAIKEA : MADON_ELAMAT;
  p.elamat = p.maxElamat;
  p.alkuX = p.x;
  p.leveys = MADON_LEVEYS;
  p.elossa = true;
  p.kipu = 0;
  p.kuolinAika = 0;
  p.heratysTeksti = false;
  nollaaMato(p);
}

// Mato palaa maan alle alkupaikkaansa (kun yksinpelissä menetetään elämä). Osumat pysyvät.
function nollaaMato(p) {
  p.herannyt = false;
  p.suunta = -1;
  p.tila = "kaivaa"; // "kaivaa", "varoittaa", "nousee", "ylhaalla", "vetaytyy" tai "loikka"
  p.seuraava = "nousee"; // mitä varoituksen jälkeen tapahtuu: "nousee" tai "loikka"
  p.ajastin = 80;
  p.x = p.alkuX;
  p.nousu = 0; // 0 = kokonaan maan alla, 1 = kokonaan ylhäällä
  p.loikka = null;
  p.loikkasi = false;
  p.sylki = 0;
  asetaMadonKoko(p);
  siivoaMato(p);
}

// Poistaa hiekkapallot (kun pomo nollataan tai kaatuu)
function siivoaMato(p) {
  if (typeof kentta === "undefined" || !kentta || kentta.pomo !== p || !kentta.lumipallot) return;
  kentta.lumipallot = [];
}

// Madon törmäyslaatikko on se osa, joka on lattian yläpuolella
function asetaMadonKoko(p) {
  p.korkeus = MADON_KORKEUS * p.nousu;
  p.y = p.lattia - p.korkeus;
}

// Madon vaihe: 1 = alussa, 2 = sylkee hiekkaa, 3 = myös loikkaa
function madonVaihe(p) {
  if (p.elamat > (p.maxElamat * 2) / 3) return 1;
  if (p.elamat > p.maxElamat / 3) return 2;
  return 3;
}

// ---------- PÄIVITYS ----------
// Kutsutaan paivitaPomo-funktiosta (peli.js). pelaaja = lähin pelaaja.
// Palauttaa true, jos peli loppui.
function paivitaMato(p, dt, elavat) {
  const kohde = pelaaja;
  const vaihe = madonVaihe(p);
  p.ajastin -= dt;

  if (p.tila === "kaivaa") {
    // Kumpu seuraa ukkoa lattian alla
    const kohdeX = kohde.x + kohde.leveys / 2 - p.leveys / 2;
    const nopeus = (vaikea ? MADON_KAIVUU_VAIKEA : MADON_KAIVUU) + (vaihe - 1) * 0.4;
    if (Math.abs(kohdeX - p.x) > nopeus) p.x += Math.sign(kohdeX - p.x) * nopeus * dt;
    p.x = Math.max(p.vasen, Math.min(p.oikea, p.x));
    if (Math.random() < 0.3) lisaaHiukkasia(p.x + 30, p.lattia, 1, ["#f3d9a0", "#c99a55"], 2);
    if (p.ajastin <= 0) {
      // Viimeisessä vaiheessa joka toinen hyökkäys on loikka
      p.seuraava = vaihe === 3 && !p.loikkasi ? "loikka" : "nousee";
      p.loikkasi = p.seuraava === "loikka";
      p.tila = "varoittaa";
      p.ajastin = vaikea ? MADON_VAROITUS_VAIKEA : MADON_VAROITUS;
      if (p.seuraava === "loikka") suunnitteleLoikka(p, kohde);
      tarina = 6;
      aanet.maanjaristys();
    }
  } else if (p.tila === "varoittaa") {
    // Kumpu tärisee paikallaan: nyt pitää juosta pois!
    if (Math.random() < 0.6) lisaaHiukkasia(p.x + 10 + Math.random() * 40, p.lattia, 1, ["#f3d9a0", "#c99a55", "#a87a3e"], 4);
    if (p.ajastin <= 0) {
      p.tila = p.seuraava;
      tarina = 10;
      aanet.ryntays();
      lisaaHiukkasia(p.x + 30, p.lattia, 25, ["#f3d9a0", "#c99a55", "#a87a3e"], 7);
    }
  } else if (p.tila === "nousee") {
    p.nousu = Math.min(1, p.nousu + dt / 14);
    if (p.nousu >= 1) {
      p.tila = "ylhaalla";
      p.ajastin = vaikea ? MADON_YLHAALLA_VAIKEA : MADON_YLHAALLA;
      p.sylki = vaihe >= 2 ? 28 : 9999; // vaiheesta 2 alkaen mato sylkee hiekkaa
    }
  } else if (p.tila === "ylhaalla") {
    p.sylki -= dt;
    if (p.sylki <= 0) {
      syljeHiekkaa(p, elavat, vaihe);
      p.sylki = 9999;
    }
    if (p.ajastin <= 0) p.tila = "vetaytyy";
  } else if (p.tila === "vetaytyy") {
    p.nousu = Math.max(0, p.nousu - dt / 16);
    if (p.nousu <= 0) {
      p.tila = "kaivaa";
      p.ajastin = 95 - vaihe * 15 + Math.random() * 40;
    }
  } else if (p.tila === "loikka") {
    const l = p.loikka;
    l.aika += dt;
    if (l.aika >= LOIKAN_KESTO + LOIKAN_PALAT * 4) {
      // Koko mato on taas maan alla
      p.x = l.loppu;
      p.loikka = null;
      p.tila = "kaivaa";
      p.ajastin = 60;
    }
  }
  asetaMadonKoko(p);

  for (const pl of elavat) {
    pelaaja = pl;
    matoOsuuPelaajaan(p);
    if (tila !== "peli") return true;
  }
  return false;
}

// Loikka alkaa kummun kohdalta ja päättyy ukon toiselle puolelle
function suunnitteleLoikka(p, kohde) {
  let suunta = kohde.x > p.x ? 1 : -1;
  let loppu = p.x + suunta * 420;
  loppu = Math.max(p.vasen, Math.min(p.oikea, loppu));
  if (Math.abs(loppu - p.x) < 250) {
    // Seinä on liian lähellä: loikataan toiseen suuntaan
    suunta = -suunta;
    loppu = Math.max(p.vasen, Math.min(p.oikea, p.x + suunta * 420));
  }
  p.loikka = { alku: p.x, loppu: loppu, aika: 0 };
}

// Missä madon pala on loikassa? i = 0 on pää, isompi i tulee perässä.
function loikanPala(p, i) {
  const l = p.loikka;
  const kohta = (l.aika - i * 4) / LOIKAN_KESTO; // 0 = lähtö, 1 = perillä
  if (kohta <= 0 || kohta >= 1) return null; // tämä pala on maan alla
  return {
    x: l.alku + (l.loppu - l.alku) * kohta + p.leveys / 2,
    y: p.lattia - Math.sin(kohta * Math.PI) * LOIKAN_KORKEUS,
  };
}

// Mato sylkee hiekkapalloja kaaressa pelaajia kohti (pallot lentävät kuin lumipallot, pakkanen.js)
function syljeHiekkaa(p, elavat, vaihe) {
  const x = p.x + p.leveys / 2;
  const maara = vaihe >= 3 ? 3 : 2;
  for (let i = 0; i < maara; i++) {
    const kohde = elavat[i % elavat.length];
    const hajonta = (i - (maara - 1) / 2) * 1.3;
    let vx = (kohde.x + 10 - x) / 65 + hajonta;
    vx = Math.max(-5, Math.min(5, vx));
    heitaLumipallo(x - 6, p.y + 6, vx, -7, 12, "hiekka");
  }
  aanet.heitto();
}

// Madon päähän osui (hyppy tai tulipallo): se vetäytyy heti maan alle
function matoonOsui(p) {
  if (!p.elossa) return;
  p.tila = "vetaytyy";
  const vaihe = madonVaihe(p);
  if (p.elamat === Math.floor((p.maxElamat * 2) / 3)) lisaaTeksti(p.x + 30, p.y - 30, "MATO SUUTTUI!");
  else if (vaihe === 3 && !p.raivoTeksti) {
    p.raivoTeksti = true;
    lisaaTeksti(p.x + 30, p.y - 30, "VARO LOIKKAA!");
  }
}

// Tulipallo osui matoon (peli.js: paivitaTulipallot). Vain pää on arka.
function matoonOsuiTuli(p, pallo) {
  const paahan = pallo.y + 8 < p.y + MADON_PAA;
  if (p.tila === "ylhaalla" && paahan) {
    if (osuPomoon(1)) matoonOsui(p);
    return;
  }
  lisaaTeksti(pallo.x + 8, pallo.y - 10, "TÄHTÄÄ PÄÄHÄN!");
}

// Osuuko mato pelaajaan? (pelaaja = se, jota käsitellään)
function matoOsuuPelaajaan(p) {
  if (p.tila === "loikka") {
    if (pelaaja.suojaAika > 0) return;
    for (let i = 0; i < LOIKAN_PALAT; i++) {
      const pala = loikanPala(p, i);
      if (!pala) continue;
      const laatikko = { x: pala.x - 22, y: pala.y - 22, leveys: 44, korkeus: 44 };
      if (osuu(pelaaja, laatikko)) {
        lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "AUTS!");
        menetaElama();
        return;
      }
    }
    return;
  }
  if (p.nousu < 0.05 || !osuu(pelaaja, p)) return;

  // Tuleeko ukko ylhäältä pään päälle? (Nousevan madon päälle ei voi hypätä.)
  const edellisetJalat = pelaaja.edellinenY + pelaaja.korkeus;
  const ylhaalta = p.tila !== "nousee" && pelaaja.vy > 0 && edellisetJalat <= p.y + 26;
  if (ylhaalta) {
    const osui = osuPomoon(1);
    pelaaja.vy = osui ? -HYPPYVOIMA : -HYPPYVOIMA * 0.7;
    pelaaja.hyppaa = osui && hyppyNappiPohjassa();
    pelaaja.venytys = 0.35;
    if (osui) {
      lataaTulta();
      matoonOsui(p);
    }
    return;
  }
  if (pelaaja.suojaAika > 0) return;
  lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "AUTS!");
  menetaElama();
}

// ---------- PIIRTÄMINEN ----------

// Yksi madon pala: pyöreä, tumma reuna ja vaalea vatsaraita
function piirraMadonPala(x, y, sade, vilkku) {
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x, y, sade + 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = vilkku ? "white" : MADON_VARIT.selka;
  ctx.beginPath();
  ctx.arc(x, y, sade, 0, Math.PI * 2);
  ctx.fill();
  if (vilkku) return;
  ctx.fillStyle = MADON_VARIT.vatsa;
  ctx.beginPath();
  ctx.ellipse(x, y + sade * 0.35, sade * 0.75, sade * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = MADON_VARIT.tumma;
  ctx.fillRect(x - sade * 0.6, y - sade * 0.75, sade * 1.2, 3);
}

// Madon pää: iso pyöreä suu täynnä hampaita ja kaksi pientä silmää
function piirraMadonPaa(x, y, vilkku, aika, suuAuki) {
  piirraMadonPala(x, y, 34, vilkku);
  if (vilkku) return;
  const suu = 14 + suuAuki * 8 + Math.sin(aika / 160) * 2;
  ctx.fillStyle = "#3a0d12";
  ctx.beginPath();
  ctx.arc(x, y - 6, suu, 0, Math.PI * 2);
  ctx.fill();
  // Hampaat ympäri suun
  ctx.fillStyle = "white";
  for (let i = 0; i < 8; i++) {
    const kulma = (i / 8) * Math.PI * 2 + aika / 900;
    const hx = x + Math.cos(kulma) * suu;
    const hy = y - 6 + Math.sin(kulma) * suu;
    ctx.beginPath();
    ctx.moveTo(hx + Math.cos(kulma + 1.5) * 4, hy + Math.sin(kulma + 1.5) * 4);
    ctx.lineTo(hx - Math.cos(kulma + 1.5) * 4, hy - Math.sin(kulma + 1.5) * 4);
    ctx.lineTo(x + Math.cos(kulma) * (suu - 8), y - 6 + Math.sin(kulma) * (suu - 8));
    ctx.fill();
  }
  // Silmät
  for (const puoli of [-1, 1]) {
    ctx.fillStyle = "black";
    ctx.fillRect(x + puoli * 26 - 5, y + 10, 10, 10);
    ctx.fillStyle = "#ffd23c";
    ctx.fillRect(x + puoli * 26 - 3, y + 12, 6, 6);
    ctx.fillStyle = "black";
    ctx.fillRect(x + puoli * 26 - 1, y + 14, 3, 3);
  }
}

// Hiekkakumpu lattialla näyttää, missä mato on maan alla
function piirraKumpu(x, lattia, koko, tarina) {
  const tx = x + (tarina ? Math.round((Math.random() - 0.5) * 5) : 0);
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.ellipse(tx, lattia, 38 + koko, 12 + koko, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2bd7a";
  ctx.beginPath();
  ctx.ellipse(tx, lattia, 35 + koko, 9 + koko, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c99a55";
  ctx.fillRect(tx - 14, lattia - 6 - koko, 8, 3);
  ctx.fillRect(tx + 6, lattia - 4 - koko * 0.5, 10, 3);
}

function piirraMato(p, aika) {
  if (!p.elossa && p.kuolinAika <= 0) return;
  const keski = p.x + p.leveys / 2;
  const vilkku = p.kipu > 0 && Math.floor(p.kipu / 4) % 2 === 0;

  // Nukkuva mato: kumpu ja kuorsaus
  if (p.elossa && !p.herannyt) {
    piirraKumpu(keski, p.lattia, 2 + Math.sin(aika / 500) * 2, false);
    const z = (aika / 700) % 3;
    reunaTeksti("Z", keski + 20 + z * 8, p.lattia - 30 - z * 12, 14 + z * 4, "center", "#eee");
    return;
  }

  // Loikka: palat lentävät kaaressa, pää edellä
  if (p.elossa && p.tila === "loikka") {
    for (let i = LOIKAN_PALAT - 1; i >= 1; i--) {
      const pala = loikanPala(p, i);
      if (pala) piirraMadonPala(pala.x, pala.y, 26 - i, false);
    }
    const paa = loikanPala(p, 0);
    if (paa) piirraMadonPaa(paa.x, paa.y, false, aika, 1);
    piirraKumpu(p.loikka.alku + p.leveys / 2, p.lattia, 0, false);
    piirraKumpu(p.loikka.loppu + p.leveys / 2, p.lattia, 0, false);
    return;
  }

  if (p.elossa && p.nousu <= 0) {
    const varoittaa = p.tila === "varoittaa";
    piirraKumpu(keski, p.lattia, varoittaa ? 6 : 0, varoittaa);
    if (varoittaa) {
      reunaTeksti("!", keski, p.lattia - 40, 34, "center", "#ff3c3c");
      if (p.seuraava === "loikka" && p.loikka) {
        // Pisteviiva näyttää, mistä mato loikkaa ja mihin se laskeutuu
        ctx.fillStyle = "rgba(255, 60, 60, 0.8)";
        for (let i = 1; i < 12; i++) {
          const kohta = i / 12;
          const x = p.loikka.alku + (p.loikka.loppu - p.loikka.alku) * kohta + p.leveys / 2;
          const y = p.lattia - Math.sin(kohta * Math.PI) * LOIKAN_KORKEUS;
          ctx.fillRect(x - 3, y - 3, 6, 6);
        }
        reunaTeksti("!", p.loikka.loppu + p.leveys / 2, p.lattia - 40, 34, "center", "#ff3c3c");
      }
    }
    return;
  }

  // Mato on ylhäällä (tai kaatumassa): palat päällekkäin lattiasta ylöspäin
  ctx.save();
  let korkeus = p.korkeus;
  if (!p.elossa) {
    // Voitettu mato vajoaa täristen takaisin hiekkaan
    korkeus = MADON_KORKEUS * (p.kuolinAika / 120);
    ctx.globalAlpha = Math.min(1, p.kuolinAika / 30);
    ctx.translate(Math.round((Math.random() - 0.5) * 6), 0);
  }
  ctx.beginPath();
  ctx.rect(keski - 200, -100, 400, p.lattia + 100); // lattian alle jäävä osa ei näy
  ctx.clip();
  const paaY = p.lattia - korkeus + 34;
  for (let y = p.lattia + 10; y > paaY + 20; y -= 26) {
    const matka = (p.lattia - y) / MADON_KORKEUS;
    piirraMadonPala(keski + Math.sin(aika / 220 + matka * 4) * 5 * matka, y, 27, vilkku);
  }
  piirraMadonPaa(keski + Math.sin(aika / 220 + 4) * 5 * (korkeus / MADON_KORKEUS), paaY, vilkku, aika, p.tila === "ylhaalla" ? 1 : 0);
  ctx.restore();
  // Hiekkaa lentää reiän reunoilta
  piirraKumpu(keski, p.lattia, 3, false);
}

// Pimeässä pesässä madon suu hehkuu
function madonValot(valo) {
  const p = kentta.pomo;
  if (!p || p.tyyppi !== "mato" || !p.elossa) return;
  if (p.tila === "loikka") {
    const paa = loikanPala(p, 0);
    if (paa) valo(paa.x, paa.y, 90);
  } else {
    valo(p.x + p.leveys / 2, p.lattia - Math.max(20, p.korkeus - 30), p.nousu > 0 ? 110 : 60);
  }
}

// ---------- KARTTA ----------
// Pieni madon pää kurkistaa pomokentän pallukan takaa, kunnes mato on voitettu
function piirraMatoKuvake(x, y, aika) {
  const nousu = Math.sin(aika / 400) * 3;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x, y + nousu, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = MADON_VARIT.selka;
  ctx.beginPath();
  ctx.arc(x, y + nousu, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a0d12";
  ctx.beginPath();
  ctx.arc(x, y - 2 + nousu, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.fillRect(x - 5, y - 4 + nousu, 2, 3);
  ctx.fillRect(x + 3, y - 4 + nousu, 2, 3);
  ctx.fillRect(x - 1, y - 8 + nousu, 2, 3);
}
