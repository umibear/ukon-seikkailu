// ==========================================
//   AAVIKKO
//   Maailma 4:n jutut:
//   - JUOKSUHIEKKA: ukko uppoaa hitaasti. Hyppäämällä pääsee ylös, mutta jokainen
//     hyppy on edellistä heikompi. Etsi kivi tai kiinteä maa ajoissa!
//   - PAAHDE: aurinko paistaa kuumasti. Auringossa ukon paahdemittari nousee,
//     varjossa se laskee. Varjoa on palmujen, pilvien ja tasojen alla.
//       normaali: liian kuumana ukkoa pyörryttää ja se on hidas
//       vaikea:   liian kuumana menee elämä!
//   - KANGASTUS: taso, joka näyttää oikealta mutta haihtuu, kun tulet lähelle.
//   Vihut ovat tiedostossa aavikkovihut.js ja pomo tiedostossa hiekkamato.js.
//   Kentät ovat tiedostossa kentat4.js.
//   (Koodissa varjoisa paikka on "katve", koska "varjo" on jo parhaan ajon varjo, varjo.js.)
// ==========================================

const HIEKAN_HIDASTUS = 0.5; // juoksuhiekassa ukko liikkuu näin paljon hitaammin (1 = tavallinen vauhti)
const UPPOAMINEN = 0.5; // kuinka nopeasti ukko uppoaa (pikseliä hetkessä)
const UPPOAMINEN_VAIKEA = 0.9;
const HIEKKAHYPPY = 11.5; // ensimmäisen hypyn voima hiekasta (tavallinen hyppy on 16)
const HIEKKAHYPYN_HEIKKENEMINEN = 1.6; // jokainen hyppy on näin paljon edellistä heikompi
const HIEKKAHYPYN_HEIKKENEMINEN_VAIKEA = 2.6;
const HIEKAN_NIELAISU = 8; // kun ukon pää on näin syvällä pinnan alla, hiekka nielaisee sen
const PAAHTEEN_NOPEUS = 0.24; // kuinka nopeasti paahdemittari nousee auringossa (täynnä noin 7 sekunnissa)
const PAAHTEEN_NOPEUS_VAIKEA = 0.3;
const JAAHTYMINEN = 1.1; // kuinka nopeasti mittari laskee varjossa
const POYRRYKSEN_HIDASTUS = 0.55; // pyörryksissä ukko on näin paljon hitaampi
const POYRRYS_LOPPUU = 50; // kun mittari laskee tämän alle, pyörrytys loppuu
const KANGASTUKSEN_ETAISYYS = 110; // kuinka läheltä kangastus haihtuu (pikseleitä)
const PALMUN_KORKEUS = 120;
const PALMUN_KATVE = 110; // kuinka leveä varjo palmun alla on
const PILVEN_LEVEYS = 170;

// ---------- PIKSELIKUVAT ----------
// Kuvat on piirretty kirjaimilla niin kuin Pakkassaarella (pakkanen.js: pikselikuva).
const AAVIKKOVARIT = {
  K: "#000000", // musta reunaviiva
  W: "#ffffff", // valkoinen
  H: "#f3d9a0", // vaalea hiekka
  h: "#e2bd7a", // hiekka
  s: "#c99a55", // hiekkakivi
  S: "#a87a3e", // hiekkakivi, tumma
  G: "#3fa34d", // kaktuksen vihreä
  g: "#2b7a39", // tumma vihreä
  L: "#7fd67f", // vaalea vihreä
  R: "#e63946", // punainen
  P: "#ff8fb1", // vaaleanpunainen kukka
  O: "#e07b2a", // skorpionin oranssi
  o: "#a8501a", // tumma oranssi
  Y: "#ffd23c", // keltainen
  M: "#e9e2cf", // muumion kääre
  m: "#bdb49a", // kääreen varjo
};

const AAVIKKOPIKSELIT = {
  // Hiekkalaatta: pehmeää hiekkaa päällä, hiekkakivitiiliä alla (16 x 16)
  hiekka: [[
    "HHHHHHHHHHHHHHHH",
    "HHHhHHHHHHHhHHHH",
    "hHHHHHhhHHHHHHhH",
    "hhhHHhhhhhHHhhhh",
    "shhhhhsshhhhhhss",
    "ssssssssssssssss",
    "sssSssssssssSsss",
    "ssssssssssssssss",
    "SSSSSSSSSSSSSSSS",
    "sssssssSssssssss",
    "sssssssSssssssss",
    "sssssssSssssssss",
    "SSSSSSSSSSSSSSSS",
    "sssSsssssssSssss",
    "sssSsssssssSssss",
    "sssSsssssssSssss",
  ]],
  // Hiekkakivitiilet hiekan alla
  hiekkamaa: [[
    "SSSSSSSSSSSSSSSS",
    "sssssssSssssssss",
    "sssssssSssssssss",
    "sssssssSssssssss",
    "SSSSSSSSSSSSSSSS",
    "sssSsssssssSssss",
    "sssSsssssssSssss",
    "sssSsssssssSssss",
    "SSSSSSSSSSSSSSSS",
    "sssssssSssssssss",
    "sssssssSssssssss",
    "sssssssSssssssss",
    "SSSSSSSSSSSSSSSS",
    "sssSsssssssSssss",
    "sssSsssssssSssss",
    "sssSsssssssSssss",
  ]],
};

const aavikkokuvat = {};
for (const nimi in AAVIKKOPIKSELIT) aavikkokuvat[nimi] = pikselikuva(AAVIKKOPIKSELIT[nimi], AAVIKKOVARIT);

// ---------- KENTÄN VALMISTELU ----------
// Kutsutaan valmisteleKentta-funktiosta (peli.js)
function valmisteleAavikko(k) {
  // Juoksuhiekka: x ja leveys (y = hiekan pinta, yleensä sama kuin maan pinta)
  if (!k.juoksuhiekat) k.juoksuhiekat = [];
  for (const h of k.juoksuhiekat) {
    if (h.y === undefined) h.y = 410;
    h.korkeus = 500 - h.y;
  }
  // Palmut: x (rungon keskikohta) ja lattia
  if (!k.palmut) k.palmut = [];
  // Varjopilvet: x, matka (kuinka kauas pilvi liikkuu sivuille), nopeus ja vaihe
  if (!k.varjopilvet) k.varjopilvet = [];
  for (const p of k.varjopilvet) {
    p.alkuX = p.x;
    p.leveys = PILVEN_LEVEYS;
    if (!p.matka) p.matka = 0;
    if (!p.nopeus) p.nopeus = 0.008;
    p.aika = p.vaihe || 0;
  }
  // Soihdut: x ja y (valaisevat pimeää pyramidia)
  if (!k.soihdut) k.soihdut = [];
  // Kangastukset: x, y ja leveys
  if (!k.kangastukset) k.kangastukset = [];
  for (const m of k.kangastukset) {
    m.korkeus = 20;
    m.nakyvyys = 1; // 1 = näkyy, 0 = haihtunut
    m.taso = { x: 0, y: 0, leveys: m.leveys, korkeus: 20 }; // kuva piirretään tästä (peli.js: piirraTaso)
  }
}

// Kun ukko syntyy uudestaan (peli.js: nollaaLiike)
function nollaaAavikko(pl) {
  pl.paahde = 0; // paahdemittari: 0 = viileä, 100 = liian kuuma
  pl.poyrryksissa = false;
  pl.hiekka = null; // juoksuhiekka, jossa ukko on (tai null)
  pl.hiekkaHypyt = 0; // montako kertaa hiekasta on jo hypätty
}

// ---------- JUOKSUHIEKKA ----------

// Missä juoksuhiekassa pelaaja on? (null = ei missään)
function juoksuhiekassa(pl) {
  const keski = pl.x + pl.leveys / 2;
  const jalat = pl.y + pl.korkeus;
  for (const h of kentta.juoksuhiekat) {
    if (keski > h.x && keski < h.x + h.leveys && jalat > h.y + 1) return h;
  }
  return null;
}

// Kutsutaan, kun napit on luettu (peli.js: paivitaPelaaja). Palauttaa ukon uuden vauhdin.
function aavikonVauhti(vx) {
  if (pelaaja.maassa) pelaaja.hiekkaHypyt = 0; // kiinteällä maalla voimat palaavat
  pelaaja.hiekka = juoksuhiekassa(pelaaja);
  if (pelaaja.hiekka) vx *= HIEKAN_HIDASTUS;
  if (pelaaja.hiekka && !kentta.hiekkaVihje) {
    // Ensimmäisellä kerralla peli neuvoo, mitä pitää tehdä
    kentta.hiekkaVihje = true;
    lisaaTeksti(pelaaja.x + 10, pelaaja.y - 34, vaikea ? "JUOKSUHIEKKAA! NÄPYTTELE HYPPYÄ!" : "JUOKSUHIEKKAA! HYPI POIS!");
  }
  if (pelaaja.poyrryksissa) vx *= POYRRYKSEN_HIDASTUS;
  return vx;
}

// Hyppy juoksuhiekasta (peli.js: paivitaPelaaja). Palauttaa true, jos ukko on hiekassa.
// Normaalilla riittää, että hyppynappi on pohjassa. Vaikealla nappia pitää näpytellä!
function ponnistaHiekasta(hyppyNappi, hyppyPainettiin) {
  const h = pelaaja.hiekka;
  if (!h) return false;
  const painettu = vaikea ? hyppyPainettiin : hyppyNappi;
  if (!painettu || pelaaja.vy < 0) return true; // ei hypätä (tai ollaan jo nousemassa)

  const heikkeneminen = vaikea ? HIEKKAHYPYN_HEIKKENEMINEN_VAIKEA : HIEKKAHYPYN_HEIKKENEMINEN;
  const voima = HIEKKAHYPPY - pelaaja.hiekkaHypyt * heikkeneminen;
  pelaaja.hiekkaHypyt++;
  if (voima <= 1) {
    // Voimat loppuivat: ukko vain räpiköi
    if (hyppyPainettiin) lisaaHiukkasia(pelaaja.x + 10, h.y, 4, ["#e2bd7a", "#c99a55"], 2);
    return true;
  }
  pelaaja.vy = -voima;
  pelaaja.hyppaa = true;
  pelaaja.venytys = 0.2;
  lisaaHiukkasia(pelaaja.x + 10, h.y, 6, ["#f3d9a0", "#e2bd7a", "#c99a55"], 3);
  aanet.hyppy();
  return true;
}

// Hiekassa ukko ei putoa vaan uppoaa hitaasti (peli.js: paivitaPelaaja)
function uppoaHiekkaan() {
  if (!pelaaja.hiekka) return;
  const nopeus = vaikea ? UPPOAMINEN_VAIKEA : UPPOAMINEN;
  if (pelaaja.vy > nopeus) pelaaja.vy = nopeus;
}

// ---------- PAAHDE JA VARJO ----------

// Missä pilvi on juuri nyt?
function pilvenX(p) {
  return p.alkuX + Math.sin(p.aika * p.nopeus) * p.matka;
}

// Onko pelaaja varjossa? Aurinko paistaa suoraan ylhäältä, joten varjossa
// ollaan, kun pään yläpuolella on taso, palmun lehvät tai pilvi.
function katveessa(pl) {
  const keski = pl.x + pl.leveys / 2;
  for (const p of kentta.palmut) {
    if (Math.abs(keski - p.x) < PALMUN_KATVE / 2) return true;
  }
  for (const p of kentta.varjopilvet) {
    const x = pilvenX(p);
    if (keski > x && keski < x + p.leveys) return true;
  }
  for (const t of kentta.kaikkiTasot) {
    if (t.eiKiintea) continue;
    if (keski > t.x && keski < t.x + t.leveys && t.y + t.korkeus <= pl.y + 6) return true;
  }
  return false;
}

// Kutsutaan joka hetki jokaiselle pelaajalle (peli.js: paivitaPelaaja).
// Palauttaa true, jos aurinko poltti ja ukko menetti elämän (vain vaikealla).
function paahdePolttaa(dt) {
  const pl = pelaaja;
  if (!kentta.paahde) return false;
  if (katveessa(pl)) {
    pl.paahde = Math.max(0, pl.paahde - JAAHTYMINEN * dt);
    if (pl.poyrryksissa && pl.paahde < POYRRYS_LOPPUU) pl.poyrryksissa = false; // helpotti!
    return false;
  }
  if (!kentta.paahdeVihje) {
    kentta.paahdeVihje = true;
    lisaaTeksti(pl.x + 10, pl.y - 34, "AURINKO PAAHTAA! LEPÄÄ VARJOSSA!");
  }
  const nopeus = (vaikea ? PAAHTEEN_NOPEUS_VAIKEA : PAAHTEEN_NOPEUS) * kentta.paahde;
  pl.paahde = Math.min(100, pl.paahde + nopeus * dt);
  if (pl.paahde < 100) return false;

  if (vaikea) {
    // Vaikealla aurinko polttaa
    lisaaTeksti(pl.x + 10, pl.y - 12, "AURINKO POLTTI!");
    lisaaHiukkasia(pl.x + 10, pl.y + 10, 20, ["#ffd23c", "#ff8c1a", "white"], 4);
    pl.paahde = 0;
    menetaElama();
    return true;
  }
  if (!pl.poyrryksissa) {
    pl.poyrryksissa = true;
    lisaaTeksti(pl.x + 10, pl.y - 12, "HUH, KUUMA! ETSI VARJOA!");
    aanet.kohme();
  }
  return false;
}

// ---------- PÄIVITYS ----------
// Pilvet, kangastukset ja juoksuhiekan nielaisu. Palauttaa true, jos peli loppui.
function paivitaAavikko(dt) {
  for (const p of kentta.varjopilvet) p.aika += dt;

  // Kangastus haihtuu, kun joku tulee lähelle, ja palaa, kun kaikki ovat kaukana
  for (const m of kentta.kangastukset) {
    let lahin = 9999;
    for (const pl of elavatPelaajat()) {
      const dx = Math.max(m.x - (pl.x + pl.leveys), pl.x - (m.x + m.leveys), 0);
      const dy = Math.max(m.y - (pl.y + pl.korkeus), pl.y - (m.y + m.korkeus), 0);
      lahin = Math.min(lahin, Math.hypot(dx, dy));
    }
    if (lahin < KANGASTUKSEN_ETAISYYS) {
      if (m.nakyvyys === 1) {
        lisaaTeksti(m.x + m.leveys / 2, m.y - 12, "KANGASTUS!");
        lisaaHiukkasia(m.x + m.leveys / 2, m.y + 10, 10, ["#fff6d8", "#f3d9a0"], 2);
        aanet.sammuu();
      }
      m.nakyvyys = Math.max(0, m.nakyvyys - 0.06 * dt);
    } else if (lahin > 320) {
      m.nakyvyys = Math.min(1, m.nakyvyys + 0.02 * dt);
    }
  }

  // Upposiko joku kokonaan hiekkaan?
  if (kentta.juoksuhiekat.length === 0) return false;
  for (const pl of elavatPelaajat()) {
    const h = juoksuhiekassa(pl);
    if (!h || pl.y < h.y + HIEKAN_NIELAISU) continue;
    pelaaja = pl;
    lisaaHiukkasia(pl.x + 10, h.y, 20, ["#f3d9a0", "#e2bd7a", "#c99a55"], 4);
    lisaaTeksti(pl.x + 10, h.y - 24, "HIEKKA NIELAISI!");
    aanet.loiskis();
    menetaElama();
    if (tila !== "peli") return true;
  }
  return false;
}

// ---------- PIIRTÄMINEN ----------

// Palmu: runko ja viisi lehvää
function piirraPalmu(x, lattia) {
  const latva = lattia - PALMUN_KORKEUS;
  // Runko pienistä palikoista, vähän kaarella
  for (let i = 0; i < 10; i++) {
    const kaari = Math.round(Math.sin(i / 9 * Math.PI) * 6);
    const y = lattia - (i + 1) * 12;
    ctx.fillStyle = "black";
    ctx.fillRect(x - 7 + kaari, y - 1, 14, 14);
    ctx.fillStyle = i % 2 === 0 ? "#8b5a2b" : "#a06a35";
    ctx.fillRect(x - 5 + kaari, y + 1, 10, 10);
  }
  // Lehvät
  const lehvat = [
    [-58, 14], [-40, -22], [0, -34], [40, -22], [58, 14],
  ];
  for (const [dx, dy] of lehvat) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x, latva - 2);
    ctx.quadraticCurveTo(x + dx * 0.5, latva + dy - 22, x + dx, latva + dy + 4);
    ctx.quadraticCurveTo(x + dx * 0.4, latva + dy * 0.4 + 8, x, latva + 12);
    ctx.fill();
    ctx.fillStyle = dx === 0 ? "#4fb85a" : "#3fa34d";
    ctx.beginPath();
    ctx.moveTo(x, latva + 1);
    ctx.quadraticCurveTo(x + dx * 0.5, latva + dy - 17, x + dx * 0.93, latva + dy + 2);
    ctx.quadraticCurveTo(x + dx * 0.4, latva + dy * 0.4 + 4, x, latva + 9);
    ctx.fill();
  }
  // Kookospähkinät
  ctx.fillStyle = "black";
  ctx.fillRect(x - 9, latva + 4, 9, 9);
  ctx.fillRect(x + 1, latva + 6, 9, 9);
  ctx.fillStyle = "#6b4a2b";
  ctx.fillRect(x - 7, latva + 6, 5, 5);
  ctx.fillRect(x + 3, latva + 8, 5, 5);
}

// Varjot, palmut ja pilvet piirretään tasojen TAAKSE (peli.js: piirraMaailma)
function piirraAavikkoTausta(aika) {
  if (kammiossa) return;
  if (kentta.paahde) {
    // Kaikki varjot yhtenä kuviona, etteivät päällekkäiset varjot tummu kahdesti
    ctx.fillStyle = "rgba(45, 30, 90, 0.17)";
    ctx.beginPath();
    for (const p of kentta.palmut) {
      if (naytolla(p.x - 60, 120)) ctx.rect(p.x - PALMUN_KATVE / 2, p.lattia - PALMUN_KORKEUS + 10, PALMUN_KATVE, 460);
    }
    for (const p of kentta.varjopilvet) {
      const x = pilvenX(p);
      if (naytolla(x, p.leveys)) ctx.rect(x, 60, p.leveys, 400);
    }
    for (const t of kentta.kaikkiTasot) {
      if (t.eiKiintea || t.y > 395 || t.x < 0 || !naytolla(t.x, t.leveys)) continue;
      ctx.rect(t.x, t.y + t.korkeus, t.leveys, 460 - t.y - t.korkeus);
    }
    ctx.fill();
  }
  for (const p of kentta.palmut) {
    if (naytolla(p.x - 60, 120)) piirraPalmu(p.x, p.lattia);
  }
  // Soihtu: pidike seinässä ja lepattava liekki
  for (const s of kentta.soihdut) {
    if (!naytolla(s.x - 10, 20)) continue;
    const lepatus = Math.round(Math.sin(aika / 90 + s.x) * 2);
    ctx.fillStyle = "black";
    ctx.fillRect(s.x - 4, s.y, 8, 22);
    ctx.fillStyle = "#6b4a2b";
    ctx.fillRect(s.x - 2, s.y + 2, 4, 18);
    hehku(s.x, s.y - 6, 34, "255, 170, 60", 0.5);
    ctx.fillStyle = "#ff8c1a";
    ctx.fillRect(s.x - 5, s.y - 10 - lepatus, 10, 12 + lepatus);
    ctx.fillStyle = "#ffd23c";
    ctx.fillRect(s.x - 3, s.y - 6 - lepatus, 6, 8 + lepatus);
  }
  // Pilvi on iso ja harmaa: sen alla on varjoa
  for (const p of kentta.varjopilvet) {
    const x = pilvenX(p);
    if (!naytolla(x, p.leveys)) continue;
    ctx.drawImage(suodatettu(kuvat.pilvi, "brightness(0.8)"), Math.round(x), 14, p.leveys, 62);
  }
}

// Kangastukset (peli.js: piirraMaailma)
function piirraAavikko(aika) {
  for (const m of kentta.kangastukset) {
    if (m.nakyvyys <= 0 || !naytolla(m.x, m.leveys)) continue;
    // Kangastus väreilee: se heiluu vähän ja on hiukan läpinäkyvä. Tarkkasilmäinen huomaa!
    const heilunta = Math.sin(aika / 260 + m.x) * 2;
    ctx.save();
    ctx.globalAlpha = m.nakyvyys * (0.62 + Math.sin(aika / 170 + m.x) * 0.12);
    ctx.translate(m.x, m.y + heilunta);
    piirraTaso(m.taso);
    ctx.restore();
  }
}

// Juoksuhiekka ja paahdemittari piirretään ukon PÄÄLLE (peli.js: piirraMaailma)
function piirraAavikkoEtuala(aika) {
  for (const h of kentta.juoksuhiekat) {
    if (!naytolla(h.x, h.leveys)) continue;
    ctx.fillStyle = "#d9ab63";
    ctx.fillRect(h.x, h.y, h.leveys, h.korkeus);
    // Hiekka valuu hitaasti: tummat viirut liikkuvat alaspäin
    ctx.fillStyle = "#c08f4a";
    for (let x = h.x + 8; x < h.x + h.leveys - 14; x += 34) {
      const y = h.y + 8 + ((aika / 60 + x * 0.7) % 26);
      ctx.fillRect(x + Math.round(Math.sin(aika / 500 + x) * 4), y, 14, 3);
    }
    // Pinta kuplii
    ctx.fillStyle = "#f3d9a0";
    ctx.fillRect(h.x, h.y, h.leveys, 3);
    for (let x = h.x + 20; x < h.x + h.leveys - 10; x += 52) {
      const vaihe = (aika / 900 + x * 0.13) % 1;
      if (vaihe < 0.5) ctx.fillRect(x, h.y - Math.round(vaihe * 8), 6, 3);
    }
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(h.x, h.y + 1);
    ctx.lineTo(h.x + h.leveys, h.y + 1);
    ctx.stroke();
  }

  if (tila === "alku") return;
  for (const pl of elavatPelaajat()) {
    const keski = pl.x + pl.leveys / 2;
    const y = pl.y - (kaksinpeli ? 34 : 18);
    // Paahdemittari ukon pään päällä: pieni aurinko ja palkki, joka muuttuu punaiseksi
    if (kentta.paahde && pl.paahde > 6) {
      ctx.fillStyle = "black";
      ctx.fillRect(keski - 12, y - 1, 34, 8);
      ctx.fillStyle = pl.paahde > 75 ? "#ff3c1a" : pl.paahde > 45 ? "#ff8c1a" : "#ffd23c";
      ctx.fillRect(keski - 10, y + 1, 30 * (pl.paahde / 100), 4);
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(keski - 18, y + 3, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd23c";
      ctx.beginPath();
      ctx.arc(keski - 18, y + 3, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Pyörryksissä pään ympärillä kiertää tähtiä
    if (pl.poyrryksissa) {
      for (let i = 0; i < 3; i++) {
        const kulma = aika / 200 + (i * Math.PI * 2) / 3;
        piirraValahdys(keski + Math.cos(kulma) * 16, pl.y - 4 + Math.sin(kulma) * 5, 5); // aarteet.js
      }
    }
  }
}

// Pimeissä kentissä soihdut valaisevat (tehosteet.js: piirraPimeys)
function aavikkoValot(valo) {
  for (const s of kentta.soihdut) valo(s.x, s.y, 130);
  aavikkovihujenValot(valo); // aavikkovihut.js
  madonValot(valo); // hiekkamato.js
}

// ---------- KARTTA ----------

function piirraPalmuKartalla(x, y) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(x - 2, y - 22, 5, 24);
  ctx.fillStyle = "#3fa34d";
  for (const [dx, dy] of [[-14, -18], [-9, -30], [0, -34], [9, -30], [14, -18]]) {
    ctx.beginPath();
    ctx.ellipse(x + dx * 0.6, y - 22 + (dy + 22) * 0.6, 9, 4, Math.atan2(dy + 22, dx), 0, Math.PI * 2);
    ctx.fill();
  }
}

// Pyramidi pomokentän takana
function piirraPyramidiKartalla(paikka) {
  const x = paikka.x + 6;
  const y = paikka.y + 14;
  ctx.fillStyle = "#e2bd7a";
  ctx.beginPath();
  ctx.moveTo(x - 95, y);
  ctx.lineTo(x, y - 120);
  ctx.lineTo(x + 95, y);
  ctx.fill();
  // Varjoisa sivu
  ctx.fillStyle = "#b98a48";
  ctx.beginPath();
  ctx.moveTo(x, y - 120);
  ctx.lineTo(x + 95, y);
  ctx.lineTo(x + 30, y);
  ctx.fill();
  // Tiilien raidat
  ctx.strokeStyle = "rgba(90, 60, 20, 0.35)";
  ctx.lineWidth = 2;
  for (let i = 1; i < 6; i++) {
    const leveys = 95 * (1 - i / 6);
    ctx.beginPath();
    ctx.moveTo(x - leveys, y - i * 20);
    ctx.lineTo(x + leveys, y - i * 20);
    ctx.stroke();
  }
}

// Juoksuhiekkalammikot kartalla
function piirraHiekkalammet(aika) {
  for (const [x, y, leveys] of [[190, 300, 44], [400, 150, 36], [520, 320, 40]]) {
    ctx.fillStyle = "#c99a55";
    ctx.beginPath();
    ctx.ellipse(x, y, leveys, leveys * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#a87a3e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, leveys * (0.35 + ((aika / 2500) % 0.5)), leveys * 0.12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
