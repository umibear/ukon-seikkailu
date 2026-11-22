// ==========================================
//   LIAANIT
//   Vihreän saaren vaikeissa kentissä roikkuu liaaneja (vaikeatkentat.js).
//   - Hyppää liaaniin: ukko tarttuu siihen itsestään.
//   - Liaani heiluu. ◀ ja ▶ antavat lisää vauhtia.
//   - Paina hyppyä: ukko päästää irti ja hyppää. Paras hetki on heilahduksen päässä!
//   - VARO: tulipallo polttaa liaanin. Uusi kasvaa tilalle vasta hetken päästä.
//   Kentässä liaanille annetaan: x ja y (mistä se roikkuu) ja pituus.
//   Jos haluaa, voi antaa myös ylaOte: ukko kiipeää silloin itse niin ylös,
//   että sen kädet ovat näin kaukana kiinnityskohdasta.
// ==========================================

const LIAANIN_PAINO = 0.45; // kuinka kovaa painovoima heiluttaa liaania
const LIAANIN_PUMPPU = 0.0011; // kuinka paljon ◀ ▶ antavat lisää vauhtia
const LIAANIN_SUURIN_KULMA = 1.15; // kuinka vinoon liaani voi heilahtaa (1.57 = vaakasuoraan)
const LIAANIN_KASVU = 300; // kuinka kauan palanut liaani kasvaa takaisin (60 = 1 s)
const LIAANIN_TAUKO = 24; // irrotuksen jälkeen samaan liaaniin ei tartuta heti uudestaan
const LIAANIN_OTE_ALKU = 0.1; // otteen saa melkein mistä vain (0.1 = vain ihan yläpää on liian korkealla)
const LIAANIN_LIUKU = 0.6; // liian ylhäältä tarttunut ukko liukuu tähän asti alas (0.6 = vähän puolivälin alle)
const LIAANIHYPPY = 0.85; // kuinka kova hyppy liaanista lähtee (1 = tavallinen hyppy)

function valmisteleLiaanit(k) {
  if (!k.liaanit) k.liaanit = [];
  for (const l of k.liaanit) {
    l.kulma = 0; // 0 = suoraan alas, plus = oikealle, miinus = vasemmalle
    l.vauhti = 0; // kuinka nopeasti kulma muuttuu
    l.poissa = 0; // kun yli 0, liaani on palanut ja kasvaa takaisin
    l.aika = l.x; // jokainen liaani huojuu tuulessa vähän eri tahtiin
  }
  k.liaaniVihje = false; // onko "HEILU JA HYPPÄÄ!" jo näytetty
  k.liaaniVihje0 = false; // onko "HYPPÄÄ LIAANIIN!" jo näytetty
}

// Missä liaanin kohta on, kun kuljetaan "matka" pikseliä kiinnityskohdasta alas?
function liaaninPiste(l, matka) {
  return { x: l.x + Math.sin(l.kulma) * matka, y: l.y + Math.cos(l.kulma) * matka };
}

// Osuuko laatikko (ukko tai tulipallo) liaaniin? Palauttaa kohdan (matka
// kiinnityskohdasta) tai -1. Liaania kokeillaan 10 pikselin välein.
function liaaninKohta(l, laatikko, alku) {
  for (let matka = l.pituus; matka >= alku; matka -= 10) {
    const p = liaaninPiste(l, matka);
    const sisalla =
      p.x > laatikko.x - 4 &&
      p.x < laatikko.x + laatikko.leveys + 4 &&
      p.y > laatikko.y - 4 &&
      p.y < laatikko.y + laatikko.korkeus;
    if (sisalla) return matka;
  }
  return -1;
}

// ---------- PÄIVITYS ----------

// Liaanit heiluvat (kutsutaan kerran joka hetki ennen pelaajia, peli.js)
function paivitaLiaanit(dt) {
  for (let i = 0; i < kentta.liaanit.length; i++) {
    const l = kentta.liaanit[i];
    if (l.poissa > 0) {
      l.poissa -= dt;
      continue;
    }

    // Kun ukko tulee ensimmäisen kerran liaanin lähelle, neuvotaan mitä tehdä
    if (!kentta.liaaniVihje0 && elavatPelaajat().some((pl) => Math.abs(pl.x - l.x) < 190)) {
      kentta.liaaniVihje0 = true;
      lisaaTeksti(l.x, l.y + l.pituus - 30, "HYPPÄÄ LIAANIIN!");
    }

    // Roikkuuko joku tässä liaanissa? Painaako se ◀ tai ▶?
    let pituus = l.pituus;
    let kantaa = false;
    let pumppu = 0;
    for (const pl of pelaajat) {
      if (pl.haamu || pl.liaani !== i) continue;
      kantaa = true;
      pituus = pl.ote;
      if (painettu(pl, "oikea")) pumppu += 1;
      if (painettu(pl, "vasen")) pumppu -= 1;
    }

    // Heiluri: painovoima vetää liaania takaisin suoraan alas
    l.aika += dt;
    l.vauhti -= (LIAANIN_PAINO / pituus) * Math.sin(l.kulma) * dt;
    l.vauhti += pumppu * LIAANIN_PUMPPU * dt;
    if (kantaa) {
      l.vauhti *= 1 - 0.003 * dt; // heiluminen hiipuu hitaasti
    } else {
      l.vauhti *= 1 - 0.03 * dt; // tyhjä liaani rauhoittuu nopeasti
      l.vauhti += Math.sin(l.aika * 0.012) * 0.00008 * dt; // ja huojuu ihan vähän tuulessa
    }
    l.kulma += l.vauhti * dt;
    if (Math.abs(l.kulma) > LIAANIN_SUURIN_KULMA) {
      l.kulma = Math.sign(l.kulma) * LIAANIN_SUURIN_KULMA;
      l.vauhti = 0;
    }

    // Tulipallo polttaa liaanin poikki
    for (const t of tulipallot) {
      if (t.elossa && liaaninKohta(l, t, 20) >= 0) {
        t.elossa = false;
        poltaLiaani(l);
        break;
      }
    }
  }
}

function poltaLiaani(l) {
  for (let matka = 10; matka < l.pituus; matka += 16) {
    const p = liaaninPiste(l, matka);
    lisaaHiukkasia(p.x, p.y, 3, ["orange", "#ff3c00", "#333", "#2f8f2f"], 3);
  }
  const p = liaaninPiste(l, l.pituus * 0.6);
  lisaaTeksti(p.x, p.y - 10, "LIAANI PALOI!");
  aanet.palaminen();
  l.poissa = LIAANIN_KASVU;
  l.kulma = 0;
  l.vauhti = 0;
}

// Roikkuuko pelaaja liaanissa? Jos roikkuu, se heiluu liaanin mukana eikä
// liiku itse. Palauttaa true, jos pelaaja on liaanissa. (pelaaja = se, jota käsitellään)
function paivitaLiaanissa(dt) {
  if (pelaaja.liaaniTauko > 0) pelaaja.liaaniTauko -= dt;
  if (pelaaja.liaani < 0) return false;
  const l = kentta.liaanit[pelaaja.liaani];
  if (!l || l.poissa > 0) {
    pelaaja.liaani = -1; // liaani paloi alta: ukko putoaa
    return false;
  }

  const hyppyNappi = hyppyNappiPohjassa();
  const hyppyPainettiin = hyppyNappi && !pelaaja.hyppyNappiEnnen;
  pelaaja.hyppyNappiEnnen = hyppyNappi;
  if (hyppyPainettiin) {
    hyppaaLiaanista(l);
    return false; // tästä eteenpäin ukko lentää tavallisesti
  }

  // Liian ylhäältä tarttunut ukko liukuu vähän alemmas: siellä heiluu paremmin
  const liuku = l.pituus * LIAANIN_LIUKU;
  if (pelaaja.ote < liuku) pelaaja.ote = Math.min(liuku, pelaaja.ote + 2 * dt);

  // Joissakin liaaneissa ukko kiipeää itse vähän ylemmäs
  if (l.ylaOte && pelaaja.ote > l.ylaOte) pelaaja.ote = Math.max(l.ylaOte, pelaaja.ote - 1.5 * dt);

  // Ukko roikkuu käsistään (kädet ovat vähän pään alapuolella)
  const vanhaX = pelaaja.x;
  const vanhaY = pelaaja.y;
  const p = liaaninPiste(l, pelaaja.ote);
  pelaaja.x = p.x - pelaaja.leveys / 2;
  pelaaja.y = p.y - 10;
  pelaaja.vx = 0;
  pelaaja.vy = 0;
  pelaaja.maassa = false;
  pelaaja.alusta = null;
  pelaaja.jaalla = false;
  pelaaja.liukuu = false;
  if (Math.abs(l.vauhti) > 0.004) pelaaja.suunta = l.vauhti > 0 ? 1 : -1;

  // Jos liaani heilauttaisi ukon seinään, se kimpoaa takaisin
  for (const t of kentta.kaikkiTasot) {
    if (t.eiKiintea || !osuu(pelaaja, t)) continue;
    l.kulma -= l.vauhti * dt * 2;
    l.vauhti *= -0.4;
    pelaaja.x = vanhaX;
    pelaaja.y = vanhaY;
    break;
  }
  return true;
}

// Ukko päästää irti ja hyppää siihen suuntaan, johon liaani heiluu
function hyppaaLiaanista(l) {
  const nopeus = l.vauhti * pelaaja.ote; // ukon vauhti liaanin päässä (pikseliä hetkessä)
  let suunta = nopeus >= 0 ? 1 : -1;
  if (painettu(pelaaja, "oikea")) suunta = 1;
  if (painettu(pelaaja, "vasen")) suunta = -1;

  pelaaja.irrotettu = pelaaja.liaani;
  pelaaja.liaani = -1;
  pelaaja.liaaniTauko = LIAANIN_TAUKO;
  pelaaja.suunta = suunta;
  pelaaja.potkuAika = 8; // lentää hetken hyppysuuntaan, vaikka nuolta ei painaisi
  pelaaja.vy = -HYPPYVOIMA * LIAANIHYPPY;
  // Jos liaani on juuri heilahtamassa ylöspäin, hyppy lähtee vielä korkeammalle
  const ylospain = nopeus * Math.sin(l.kulma);
  if (ylospain > 0) pelaaja.vy -= Math.min(3, ylospain);
  pelaaja.hyppaa = false; // liaanihyppy on aina täysi hyppy, vaikka nappia vain näpäyttäisi
  pelaaja.venytys = 0.3;
  aanet.hyppy();
}

// Tarttuuko ilmassa oleva pelaaja liaaniin? (pelaaja = se, jota käsitellään)
function tartuLiaaniin() {
  if (pelaaja.maassa || pelaaja.liaani >= 0) return;
  // Ukko tarttuu käsillään: kokeillaan vain ukon yläosaa
  const kadet = { x: pelaaja.x, y: pelaaja.y, leveys: pelaaja.leveys, korkeus: 24 };
  for (let i = 0; i < kentta.liaanit.length; i++) {
    const l = kentta.liaanit[i];
    if (l.poissa > 0 || Math.abs(pelaaja.x - l.x) > l.pituus + 40) continue;
    if (pelaaja.liaaniTauko > 0 && pelaaja.irrotettu === i) continue;
    const kohta = liaaninKohta(l, kadet, l.pituus * LIAANIN_OTE_ALKU);
    if (kohta < 0) continue;

    pelaaja.liaani = i;
    pelaaja.ote = kohta;
    pelaaja.hyppaa = false;
    pelaaja.potkuAika = 0;
    // Ukon vauhti siirtyy liaaniin. Paikaltaan tarttunutkin saa pienen heilahduksen.
    l.vauhti += (pelaaja.vx * Math.cos(l.kulma)) / kohta;
    if (Math.abs(l.vauhti) < 0.02) l.vauhti = pelaaja.suunta * 0.025;
    aanet.liaani();
    if (!kentta.liaaniVihje) {
      kentta.liaaniVihje = true;
      lisaaTeksti(l.x, l.y + l.pituus + 40, "HEILU ◀ ▶ JA HYPPÄÄ!");
    }
    return;
  }
}

// ---------- PIIRTÄMINEN ----------

function piirraLiaanit(aika) {
  for (const l of kentta.liaanit) {
    if (!naytolla(l.x - l.pituus, l.pituus * 2, 20)) continue;

    // Lehtipehko, josta liaani roikkuu (jos se ei tule ruudun yläreunasta)
    if (l.y > 10) {
      ctx.fillStyle = "#1f6b1f";
      ctx.beginPath();
      ctx.arc(l.x - 12, l.y - 2, 12, 0, Math.PI * 2);
      ctx.arc(l.x + 12, l.y - 2, 12, 0, Math.PI * 2);
      ctx.arc(l.x, l.y - 9, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2f8f2f";
      ctx.beginPath();
      ctx.arc(l.x - 4, l.y - 12, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Palanut liaani kasvaa takaisin: ensin pieni tynkä, lopuksi koko mitta
    let pituus = l.pituus;
    if (l.poissa > 0) pituus = l.pituus * Math.max(0.08, 1 - l.poissa / (LIAANIN_KASVU * 0.5));
    if (pituus <= 0) continue;

    // Köysi: tumma paksu viiva ja sen päällä vaalea ohut
    const paa = liaaninPiste(l, pituus);
    // Tyhjä liaani roikkuu vähän mutkalla, heiluva on suora
    const mutka = Math.sin(aika / 700 + l.x) * 6 * (1 - Math.min(1, Math.abs(l.kulma) * 4));
    const keskiX = (l.x + paa.x) / 2 + mutka;
    const keskiY = (l.y + paa.y) / 2;
    ctx.lineCap = "round";
    for (const [vari, paksuus] of [["#14451a", 6], ["#3fa63f", 2.5]]) {
      ctx.strokeStyle = vari;
      ctx.lineWidth = paksuus;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.quadraticCurveTo(keskiX, keskiY, paa.x, paa.y);
      ctx.stroke();
    }
    ctx.lineCap = "butt";

    // Lehdet vuorotellen kummallakin puolella
    let puoli = 1;
    for (let matka = 22; matka < pituus - 6; matka += 26) {
      const osa = matka / pituus;
      // Sama kaari kuin köydessä (quadraticCurveTo)
      const x = (1 - osa) * (1 - osa) * l.x + 2 * (1 - osa) * osa * keskiX + osa * osa * paa.x;
      const y = (1 - osa) * (1 - osa) * l.y + 2 * (1 - osa) * osa * keskiY + osa * osa * paa.y;
      ctx.fillStyle = puoli === 1 ? "#2f8f2f" : "#4fb84f";
      ctx.beginPath();
      ctx.ellipse(x + puoli * 6, y, 7, 3.5, puoli * 0.6, 0, Math.PI * 2);
      ctx.fill();
      puoli = -puoli;
    }
    // Liaanin päässä on tupsu, josta on helppo nähdä, mihin tarttua
    if (l.poissa <= 0) {
      ctx.fillStyle = "#4fb84f";
      ctx.beginPath();
      ctx.arc(paa.x, paa.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
