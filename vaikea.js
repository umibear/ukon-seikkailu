// ==========================================
//   VAIKEA TASO
//   Alkuvalikosta voi valita vaikeuden: Normaali tai Vaikea.
//   Normaalilla peli on sama kuin ennenkin. Vaikealla:
//   - jokaisella vihulla on UUSI TEMPPU (katso alta)
//   - jokaisessa maailmassa on oma uusi juttunsa:
//       Vihreä saari    = liaanit, joissa heilutaan       (liaanit.js)
//       Tulivuorisaari  = ruutitynnyrit ja laavatulva     (ruuti.js)
//       Pakkassaari     = pakkanen puree: pysy lämpimänä! (pakkanen.js)
//   - kentissä on muutoksia (vaikeatkentat.js) ja pomot ovat äkäisempiä
//   Kun kentän pääsee läpi vaikealla, kartalle tulee tähti ★.
//
//   Vihujen temput vaikealla:
//     vihu        = huomaa ukon ja RYNTÄÄ päin
//     piikkis     = tärisee ja ampuu piikkejä ilmaan
//     pomppija    = hyppää aina ukkoa kohti, ja joka kolmas hyppy on jättihyppy
//     tippuja     = juoksee ukon perään, kun se on pudonnut maahan
//     ryömijä     = kiipeää ukkoa kohti
//     lentovihu   = pudottaa käpyjä
//     laavapallo  = roiskii hiiliä hypyn huipulla
//     kekäle      = leimahtaa välillä liekkeihin (silloin päälle ei voi hypätä)
//     laavaetana  = kuori kestää yhden tulipallon, ja laavajälki palaa pitkään
//     salamanteri = sylkee kaksi kertaa peräkkäin
//     pingviini   = kimpoaa liu'usta takaisin
//     lumiukkeli  = heittää kolme lumipalloa kerralla
//     jäähauki    = sylkee jääpalan hypyn huipulla
//     pöllö       = syöksyy paljon useammin
// ==========================================

const VAIKEUDEN_NIMI = "ukonSeikkailuVaikeus"; // tällä nimellä valinta on selaimen muistissa
let vaikea = lataaVaikeus(); // true = pelataan vaikealla

const VAIKEA_BONUS = 500; // lisäpisteet kentästä, joka läpäistään vaikealla
const RYNTAYKSEN_NAKO = 170; // kuinka kaukaa vihu huomaa ukon
const RYNTAYKSEN_VAUHTI = 2.8; // kuinka monta kertaa kävelyä nopeammin vihu ryntää
const PIIKKISEN_NAKO = 190; // kuinka läheltä piikkis alkaa ampua
const PIIKKISEN_JAKSO = 170; // kuinka usein piikkis ampuu (60 = 1 s)
const TIPPUJAN_JUOKSU = 70; // kuinka kauas kotoaan tippuja juoksee (pikseleitä)
const RYOMIJAN_NAKO = 150; // kuinka läheltä (sivusuunnassa) ryömijä huomaa ukon
const KAVYN_JAKSO = 110; // kuinka usein lentovihu pudottaa kävyn
const KEKALEEN_JAKSO = 260; // kuinka usein kekäle leimahtaa
const KEKALEEN_LEIMU = 90; // kuinka kauan leimahdus kestää

function lataaVaikeus() {
  try {
    return localStorage.getItem(VAIKEUDEN_NIMI) === "vaikea";
  } catch (virhe) {
    return false;
  }
}

// Alkuvalikon rivi "Vaikeus" kutsuu tätä
function vaihdaVaikeus() {
  vaikea = !vaikea;
  try {
    localStorage.setItem(VAIKEUDEN_NIMI, vaikea ? "vaikea" : "normaali");
  } catch (virhe) {
    // ei haittaa, valinta vain ei tallennu
  }
}

// Tekee kentän. Vaikealla kenttään lisätään muutokset (vaikeatkentat.js).
function luoKentta(numero) {
  const k = KENTAT[numero]();
  if (vaikea && VAIKEAT_KENTAT[numero]) VAIKEAT_KENTAT[numero](k);
  lisaaAarre(k, numero); // salakuoppa ja aarrekammio (aarteet.js)
  return k;
}

// Kutsutaan valmisteleKentta-funktion lopusta (peli.js), kun pelataan vaikealla
function valmisteleVaikea(k) {
  for (const t of k.tykit) t.jakso *= 0.75; // tykit ampuvat tiuhempaan
  for (const v of k.viholliset) {
    if (v.tyyppi === "laavaetana") v.kilpi = 1; // kuori kestää yhden tulipallon
    if (v.tyyppi === "kekale") v.leimuAika = (v.x * 7) % KEKALEEN_JAKSO; // kaikki eivät leimahda yhtä aikaa
    if (v.tyyppi === "tippuja") {
      // Tippuja saa juosta vain sen tason päällä, jolle se putoaa
      v.kotiX = v.x;
      v.juoksuVasen = v.x;
      v.juoksuOikea = v.x;
      const keski = v.x + v.leveys / 2;
      const lattia = k.tasot.find((t) => t.y === v.lattia && keski > t.x && keski < t.x + t.leveys);
      if (lattia) {
        v.juoksuVasen = Math.max(v.x - TIPPUJAN_JUOKSU, lattia.x);
        v.juoksuOikea = Math.min(v.x + TIPPUJAN_JUOKSU, lattia.x + lattia.leveys - v.leveys);
      }
    }
  }
}

// Onko pomo jo vihainen? Vaikealla pomot suuttuvat paljon aikaisemmin.
function pomoVihainen(p) {
  return p.elamat <= p.maxElamat * (vaikea ? 2 / 3 : 1 / 3);
}

// ---------- VIHU: RYNTÄYS ----------
// Palauttaa true, jos vihu tekee nyt jotain muuta kuin kävelee.
function vihuRyntaa(v, dt) {
  if (v.raivoTauko > 0) v.raivoTauko -= dt;

  if (v.raivo === "huomaa") {
    // Seisoo hetken paikallaan: tästä ehtii nähdä, että kohta se tulee!
    v.raivoAika -= dt;
    if (v.raivoAika <= 0) {
      v.raivo = "ryntaa";
      v.raivoAika = 60;
    }
    return true;
  }
  if (v.raivo === "ryntaa") {
    v.x += v.nopeus * RYNTAYKSEN_VAUHTI * v.suunta * dt;
    v.raivoAika -= dt;
    if (Math.random() < 0.4 * dt) lisaaHiukkasia(v.x + v.leveys / 2, v.lattia, 1, ["#ddd", "#bbb"], 1.5);
    // Ryntäys loppuu alueen reunaan tai kun vihu väsyy
    if (v.raivoAika <= 0 || v.x <= v.vasen || v.x >= v.oikea) {
      v.raivo = "";
      v.raivoTauko = 90;
    }
    return true;
  }

  if (v.raivoTauko > 0) return false;
  const kohde = lahinPelaajaLahella(v, RYNTAYKSEN_NAKO, 60); // pakkasvihut.js
  if (!kohde) return false;
  const suunta = kohde.x + 10 < v.x + v.leveys / 2 ? -1 : 1;
  // Jos vihu on jo alueensa reunalla, se ei pääse ukon luo
  if ((suunta === -1 && v.x <= v.vasen + 4) || (suunta === 1 && v.x >= v.oikea - 4)) return false;
  v.suunta = suunta;
  v.raivo = "huomaa";
  v.raivoAika = 24;
  lisaaTeksti(v.x + v.leveys / 2, v.y - 8, "!");
  if (lahellaRuutua(v.x)) aanet.ryntays();
  return true;
}

// ---------- PIIKKIS: PIIKKISUIHKU ----------
// Palauttaa true, jos piikkis seisoo paikallaan (tärisee).
function piikkisAmpuu(v, dt) {
  if (v.piikkiTauko > 0) v.piikkiTauko -= dt;

  if (v.tarisee) {
    v.piikkiAika -= dt;
    if (v.piikkiAika <= 0) {
      // Kolme piikkiä viuhkana ilmaan
      const keski = v.x + v.leveys / 2;
      for (const vx of [-2.2, 0, 2.2]) heitaLumipallo(keski - 5, v.y - 10, vx, -8.5, 10, "piikki");
      if (lahellaRuutua(v.x)) aanet.heitto();
      v.tarisee = false;
      v.piikkiTauko = PIIKKISEN_JAKSO;
    }
    return true;
  }

  if (v.piikkiTauko > 0) return false;
  if (!lahinPelaajaLahella(v, PIIKKISEN_NAKO, 150)) return false;
  v.tarisee = true;
  v.piikkiAika = 32;
  return true;
}

// ---------- POMPPIJA: TÄHTÄÄ UKKOA ----------
// Kutsutaan juuri, kun pomppija ponnistaa
function pomppijaTahtaa(v) {
  const kohde = lahinPelaajaLahella(v, 320, 200);
  if (kohde) v.suunta = kohde.x + 10 < v.x + v.leveys / 2 ? -1 : 1;
  v.ajastin = 30; // lyhyempi tauko hyppyjen välissä
  v.hyppyja = (v.hyppyja || 0) + 1;
  if (v.hyppyja % 3 === 0) v.vy *= 1.3; // joka kolmas hyppy on jättihyppy
}

// ---------- TIPPUJA: JUOKSEE PERÄÄN ----------
// Maahan pudonnut tippuja juoksee lähintä ukkoa kohti
function tippujaJahtaa(v, dt) {
  const kohde = lahinPelaajaLahella(v, 200, 80);
  if (!kohde) return;
  const ero = kohde.x + 10 - (v.x + v.leveys / 2);
  if (Math.abs(ero) < 4) return;
  v.x += Math.sign(ero) * 2.2 * dt;
  v.x = Math.max(v.juoksuVasen, Math.min(v.juoksuOikea, v.x));
}

// Tippuja juoksee takaisin lankansa alle. Palauttaa true, kun se on perillä.
function tippujaPalaa(v, dt) {
  const ero = v.kotiX - v.x;
  if (Math.abs(ero) <= 2.2 * dt) {
    v.x = v.kotiX;
    return true;
  }
  v.x += Math.sign(ero) * 2.2 * dt;
  return false;
}

// ---------- RYÖMIJÄ: KIIPEÄÄ UKKOA KOHTI ----------
// Palauttaa ryömijän vauhdin (miinus = ylös, plus = alas)
function ryomijanVauhti(v) {
  for (const pl of elavatPelaajat()) {
    const matka = Math.abs(pl.x + pl.leveys / 2 - (v.x + v.leveys / 2));
    const ero = pl.y + pl.korkeus / 2 - (v.y + v.korkeus / 2);
    if (matka > RYOMIJAN_NAKO || pl.y + pl.korkeus < v.yla - 40 || pl.y > v.ala + 40) continue;
    if (Math.abs(ero) < 6) return 0; // samalla korkeudella: odottaa paikallaan
    v.suunta = ero > 0 ? 1 : -1;
    return v.nopeus * 1.5 * v.suunta;
  }
  return v.nopeus * v.suunta; // ketään ei näy: kiipeää edestakaisin kuten ennenkin
}

// ---------- LENTOVIHU: KÄVYT ----------
function lentovihuPommittaa(v, dt) {
  if (v.kapyTauko > 0) {
    v.kapyTauko -= dt;
    return;
  }
  for (const pl of elavatPelaajat()) {
    const matka = Math.abs(pl.x + pl.leveys / 2 - (v.x + v.leveys / 2));
    if (matka < 60 && pl.y > v.y + 40) {
      heitaLumipallo(v.x + v.leveys / 2 - 6, v.y + v.korkeus, v.nopeus * v.suunta * 0.5, 0, 12, "kapy");
      v.kapyTauko = KAVYN_JAKSO;
      return;
    }
  }
}

// ---------- LAAVAPALLO: ROISKUU ----------
// Kutsutaan, kun laavapallo on hyppynsä huipulla
function laavapalloRoiskuu(v) {
  if (!lahellaRuutua(v.x)) return;
  for (const vx of [-1.8, 1.8]) heitaLumipallo(v.x + 8, v.y, vx, -3, 10, "hiili");
}

// ---------- KEKÄLE: LEIMAHTAA ----------
function kekaleLeimahtaa(v, dt) {
  v.leimuAika += dt;
  const kohta = v.leimuAika % KEKALEEN_JAKSO;
  const oliKuuma = v.kuuma;
  v.kuuma = kohta > KEKALEEN_JAKSO - KEKALEEN_LEIMU; // liekeissä: päälle ei voi hypätä!
  v.kuumenee = !v.kuuma && kohta > KEKALEEN_JAKSO - KEKALEEN_LEIMU - 45; // varoitus: kohta leimahtaa
  if (v.kuuma && !oliKuuma && lahellaRuutua(v.x)) aanet.liekki();
  if (v.kuuma && Math.random() < 0.5 * dt) {
    lisaaHiukkasia(v.x + 4 + Math.random() * 18, v.y, 1, ["#ff7b00", "#ffd23c", "#ff3c00"], 2);
  }
}

// Kekäleen liekit ja varoitushehku (tulivihut.js kutsuu tätä piirtäessään)
function piirraLeimu(v, aika) {
  if (v.kuumenee) {
    // Vilkkuu yhä nopeammin: kohta leimahtaa!
    if (Math.floor(aika / 80) % 2 === 0) hehku(v.x + 13, v.y + 13, 44, "255, 220, 80", 0.6);
    return;
  }
  if (!v.kuuma) return;
  hehku(v.x + 13, v.y + 8, 60, "255, 140, 0", 0.7);
  // Kolme liekkiä, jotka lepattavat
  for (let i = 0; i < 3; i++) {
    const korkeus = 16 + Math.sin(aika / 60 + i * 2) * 6;
    const x = v.x + 5 + i * 8;
    ctx.fillStyle = i === 1 ? "#ffd23c" : "#ff7b00";
    ctx.beginPath();
    ctx.moveTo(x - 5, v.y + 6);
    ctx.lineTo(x, v.y + 6 - korkeus);
    ctx.lineTo(x + 5, v.y + 6);
    ctx.fill();
  }
}

// ---------- LAAVAETANA: KUORI ----------
// Tulipallo osui vihuun, jolla on vielä kilpi: kilpi hajoaa, vihu jää henkiin
function rikoKilpi(v) {
  v.kilpi--;
  lisaaTeksti(v.x + v.leveys / 2, v.y - 10, "KUORI HALKESI!");
  lisaaHiukkasia(v.x + v.leveys / 2, v.y + 6, 10, ["#888", "#555", "#ffd23c"], 3);
  aanet.kova();
}

// ---------- JÄÄHAUKI: JÄÄPALA ----------
// Kutsutaan, kun hauki on hyppynsä huipulla
function haukiSylkee(v) {
  const kohde = lahinPelaajaLahella(v, 300, 400);
  if (!kohde) return;
  let vx = (kohde.x + 10 - (v.x + v.leveys / 2)) / 40;
  vx = Math.max(-5, Math.min(5, vx));
  heitaLumipallo(v.x + v.leveys / 2 - 5, v.y, vx, -2, 10, "jaa");
  if (lahellaRuutua(v.x)) aanet.heitto();
}

// ---------- AMMUKSET ----------
// Piikit, kävyt, hiilet ja jääpalat lentävät samalla tavalla kuin lumipallot
// (pakkanen.js). Tässä on vain niiden värit ja tekstit.
const AMMUSTEN_TIEDOT = {
  piikki: { varit: ["#3a3a3a", "#888"], teksti: "PIIKKI!" },
  kapy: { varit: ["#7a4a1e", "#b07a3a"], teksti: "KÄPY!" },
  hiili: { varit: ["#ff7b00", "#ffd23c"], teksti: "KUUMA!" },
  jaa: { varit: ["#8fd3f0", "white"], teksti: "JÄÄPALA!" },
};

function piirraAmmus(l) {
  const tiedot = AMMUSTEN_TIEDOT[l.laji];
  const x = Math.round(l.x + l.leveys / 2);
  const y = Math.round(l.y + l.korkeus / 2);
  const sade = l.leveys / 2;
  if (l.laji === "hiili") hehku(x, y, 18, "255, 140, 0", 0.5);
  ctx.fillStyle = "black";
  ctx.beginPath();
  if (l.laji === "piikki") {
    // Piikki on kapea kolmio, joka osoittaa lentosuuntaan (ylös tai alas)
    const suunta = l.vy < 0 ? -1 : 1;
    ctx.moveTo(x - 4, y - suunta * 6);
    ctx.lineTo(x + 4, y - suunta * 6);
    ctx.lineTo(x, y + suunta * 8);
    ctx.fill();
    ctx.fillStyle = tiedot.varit[1];
    ctx.beginPath();
    ctx.moveTo(x - 2, y - suunta * 4);
    ctx.lineTo(x + 2, y - suunta * 4);
    ctx.lineTo(x, y + suunta * 5);
    ctx.fill();
    return;
  }
  ctx.arc(x, y, sade + 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tiedot.varit[0];
  ctx.beginPath();
  ctx.arc(x, y, sade - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tiedot.varit[1];
  ctx.fillRect(x - 2, y - 3, 3, 3);
}

// ---------- TÄHDET ----------
// Montako kenttää on läpäisty vaikealla?
function vaikeitaLapaisty() {
  return vaikeatLapaisty.filter((lapaisty) => lapaisty).length;
}

// Piirtää tähden (käytetään kartalla ja ruudun yläreunassa)
function piirraTahti(x, y, sade, vari) {
  ctx.fillStyle = vari || "gold";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    // Joka toinen kärki on kaukana keskeltä ja joka toinen lähellä
    const r = i % 2 === 0 ? sade : sade * 0.45;
    const kulma = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(x + Math.cos(kulma) * r, y + Math.sin(kulma) * r);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}
