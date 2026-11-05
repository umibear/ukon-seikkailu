// ==========================================
//   TULIVUOREN VIHUT
//   kekale      = kävelevä hiilimöykky. Tuli ei tehoa siihen!
//                 Kun sen päälle hyppää, se hajoaa kahdeksi kipinäksi,
//                 jotka juoksevat eri suuntiin ja sammuvat hetken päästä.
//   laavaetana  = hidas etana, joka jättää perään palavan laavajäljen.
//                 Kuori on kuuma, joten päälle ei voi hypätä. Ammu tulipallolla!
//   salamanteri = pysähtyy välillä ja sylkee tulta ukkoa kohti.
//                 Sen voi voittaa hyppäämällä päälle tai tulipallolla.
//   Kentässä kaikille annetaan: tyyppi, x, lattia, vasen, oikea (ja nopeus, jos haluaa)
// ==========================================

const TULIVIHUT = ["kekale", "kipina", "laavaetana", "salamanteri"];

const KEKALEEN_NOPEUS = 1.2;
const KIPINAN_NOPEUS = 2.6; // kipinät juoksevat tosi lujaa
const KIPINAN_IKA = 160; // kuinka kauan kipinä elää ennen kuin sammuu (60 = 1 s)
const ETANAN_NOPEUS = 0.5;
const JALJEN_IKA = 120; // kuinka kauan laavajälki palaa
const JALJEN_VALI = 14; // kuinka monen pikselin välein etana jättää jälkeä
const SALAMANTERIN_NOPEUS = 1;
const SYLKEMISEN_JAKSO = 150; // kuinka usein salamanteri sylkee
const SYLJEN_NOPEUS = 4; // kuinka nopeasti tulisylky lentää
const SALAMANTERIN_NAKO = 420; // kuinka kaukaa salamanteri huomaa ukon

const PISTEET_KEKALE = 200;
const PISTEET_KIPINA = 50;
const PISTEET_ETANA = 300;
const PISTEET_SALAMANTERI = 300;

const tulivihuKuvat = {
  kekale: lataaTulikuva("kekale.png"), // 2 ruutua 16 x 16, katsoo oikealle
  laavaetana: lataaTulikuva("laavaetana.png"), // 2 ruutua 16 x 16, katsoo oikealle
  salamanteri: lataaTulikuva("salamanteri.png"), // 3 ruutua 24 x 12, viimeinen = suu auki
};

// ---------- VALMISTELU ----------

// Palauttaa true, jos vihu oli tulivuoren vihu (ja se valmisteltiin)
function valmisteleTulivihu(v) {
  if (!TULIVIHUT.includes(v.tyyppi)) return false;
  if (!v.suunta) v.suunta = 1;

  if (v.tyyppi === "kekale") {
    v.leveys = 26;
    v.korkeus = 26;
    if (!v.nopeus) v.nopeus = KEKALEEN_NOPEUS;
    v.tulenkestava = true; // tulipallo vain sihahtaa
    v.arvo = PISTEET_KEKALE;
  } else if (v.tyyppi === "kipina") {
    v.leveys = 14;
    v.korkeus = 14;
    if (!v.nopeus) v.nopeus = KIPINAN_NOPEUS;
    v.ika = KIPINAN_IKA;
    v.tulenkestava = true;
    v.eiLasketa = true; // kipinöitä ei lasketa "kaikki vihut tuhottu" -bonukseen
    v.arvo = PISTEET_KIPINA;
  } else if (v.tyyppi === "laavaetana") {
    v.leveys = 30;
    v.korkeus = 24;
    if (!v.nopeus) v.nopeus = ETANAN_NOPEUS;
    v.viimeJalki = v.x;
    v.arvo = PISTEET_ETANA;
  } else if (v.tyyppi === "salamanteri") {
    v.leveys = 40;
    v.korkeus = 18;
    if (!v.nopeus) v.nopeus = SALAMANTERIN_NOPEUS;
    v.tila = "kavelee"; // "kavelee", "valmistautuu" tai "sylkee"
    v.ajastin = v.vaihe !== undefined ? v.vaihe : 60;
    v.arvo = PISTEET_SALAMANTERI;
  }
  v.litistysVarit = ["#333", "#ff7b00", "#ffd23c"];
  v.y = v.lattia - v.korkeus;
  return true;
}

// ---------- PÄIVITYS ----------

function paivitaTulivihu(v, dt) {
  if (v.tyyppi === "kekale") {
    v.x += v.nopeus * v.suunta * dt;
  } else if (v.tyyppi === "kipina") {
    v.x += v.nopeus * v.suunta * dt;
    v.ika -= dt;
    if (v.ika <= 0) {
      // Kipinä sammuu itsestään
      v.elossa = false;
      v.kuolinAika = 0;
      lisaaHiukkasia(v.x + 7, v.y + 7, 6, ["#555", "#888"], 1.5);
    }
  } else if (v.tyyppi === "laavaetana") {
    v.x += v.nopeus * v.suunta * dt;
    // Kun etana on liikkunut tarpeeksi, se jättää jälkeensä laavaa
    if (Math.abs(v.x - v.viimeJalki) >= JALJEN_VALI) {
      v.viimeJalki = v.x;
      const takana = v.suunta === 1 ? v.x : v.x + v.leveys - 14;
      kentta.laavajaljet.push({ x: takana, y: v.lattia - 6, leveys: 14, korkeus: 6, ika: JALJEN_IKA });
    }
  } else if (v.tyyppi === "salamanteri") {
    paivitaSalamanteri(v, dt);
  }
}

function paivitaSalamanteri(v, dt) {
  v.ajastin -= dt;
  if (v.tila === "kavelee") {
    v.x += v.nopeus * v.suunta * dt;
    if (v.ajastin > 0) return;
    const kohde = lahinPelaaja(v);
    if (kohde) {
      // Ukko näkyy: käännytään sitä kohti ja valmistaudutaan sylkemään
      v.suunta = kohde.x + 10 < v.x + v.leveys / 2 ? -1 : 1;
      v.tila = "valmistautuu";
      v.ajastin = 35;
    } else {
      v.ajastin = 30; // katsotaan pian uudestaan
    }
  } else if (v.tila === "valmistautuu") {
    if (v.ajastin <= 0) {
      const suu = v.suunta === 1 ? v.x + v.leveys - 4 : v.x - 10;
      kentta.syljet.push({ x: suu, y: v.lattia - 26, leveys: 14, korkeus: 14, vx: SYLJEN_NOPEUS * v.suunta, matka: 0, elossa: true });
      if (lahellaRuutua(v.x)) aanet.tulipallo();
      v.tila = "sylkee";
      v.ajastin = 20;
    }
  } else if (v.tila === "sylkee") {
    if (v.ajastin <= 0) {
      v.tila = "kavelee";
      v.ajastin = SYLKEMISEN_JAKSO;
    }
  }
}

// Lähin elävä pelaaja, jonka salamanteri näkee (tai null)
function lahinPelaaja(v) {
  let lahin = null;
  let paras = SALAMANTERIN_NAKO;
  for (const pl of elavatPelaajat()) {
    const matka = Math.abs(pl.x + 10 - (v.x + v.leveys / 2));
    const korkeusero = Math.abs(pl.y + pl.korkeus - v.lattia);
    if (matka < paras && korkeusero < 120) {
      paras = matka;
      lahin = pl;
    }
  }
  return lahin;
}

// Kekäle hajoaa kahdeksi kipinäksi
function hajotaKekale(v) {
  for (const suunta of [-1, 1]) {
    const kipina = {
      tyyppi: "kipina",
      x: v.x + 6,
      lattia: v.lattia,
      vasen: v.vasen,
      oikea: v.oikea + v.leveys - 14,
      suunta: suunta,
      elossa: true,
      palanut: false,
      kuolinAika: 0,
      vy: 0,
    };
    valmisteleTulivihu(kipina);
    kentta.viholliset.push(kipina);
  }
  lisaaTeksti(v.x + 13, v.y - 30, "KIPINÖITÄ!");
}

// Laavajäljet sammuvat ja tulisylyt lentävät
function paivitaTulivihujenAmmukset(dt) {
  for (const j of kentta.laavajaljet) j.ika -= dt;
  kentta.laavajaljet = kentta.laavajaljet.filter((j) => j.ika > 0);

  for (const s of kentta.syljet) {
    s.x += s.vx * dt;
    s.matka += Math.abs(s.vx) * dt;
    if (s.matka > 600) s.elossa = false;
    for (const taso of kentta.kaikkiTasot) {
      if (s.elossa && !taso.eiKiintea && osuu(s, taso)) s.elossa = false;
    }
    // Ukon tulipallo ja salamanterin sylky sammuttavat toisensa
    for (const t of tulipallot) {
      if (s.elossa && t.elossa && osuu(s, t)) {
        s.elossa = false;
        t.elossa = false;
      }
    }
    if (!s.elossa) lisaaHiukkasia(s.x + 7, s.y + 7, 8, ["#ff7b00", "#ffd23c", "#888"], 2.5);
  }
  kentta.syljet = kentta.syljet.filter((s) => s.elossa);
}

// Osuuko laavajälki tai sylky pelaajaan? Palauttaa true, jos pelaaja menetti elämän.
function tarkistaTulivihujenVaarat() {
  for (const j of kentta.laavajaljet) {
    if (osuu(pelaaja, j)) {
      lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "KUUMAA!");
      menetaElama();
      return true;
    }
  }
  for (const s of kentta.syljet) {
    if (osuu(pelaaja, s)) {
      s.elossa = false;
      lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "AUTS!");
      menetaElama();
      return true;
    }
  }
  return false;
}

// Tulivuoren vihu osui pelaajaan. Palauttaa true, jos pelaaja menetti elämän.
function tulivihuOsuu(v) {
  const edellisetJalat = pelaaja.edellinenY + pelaaja.korkeus;
  const ylhaalta = pelaaja.vy > 0 && edellisetJalat <= v.y + 10;

  // Päälle hyppääminen toimii, paitsi laavaetanaan (kuuma kuori!)
  if (ylhaalta && v.tyyppi !== "laavaetana") {
    tuhoaVihu(v, false);
    if (v.tyyppi === "kekale") hajotaKekale(v);
    pomppaaVihusta();
    return false;
  }
  if (pelaaja.suojaAika > 0) return false;
  lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, ylhaalta ? "KUUMA KUORI!" : "AUTS!");
  menetaElama();
  return true;
}

// ---------- PIIRTÄMINEN ----------

function piirraTulivihu(v, aika) {
  if (!v.elossa && v.kuolinAika <= 0) return;
  const ruutu = Math.floor(aika / (v.tyyppi === "laavaetana" ? 400 : 160)) % 2;
  const peilaa = v.suunta === -1;

  ctx.save();
  if (!v.elossa) {
    // Kuollut vihu haalenee pois. Litistetty vihu painuu matalaksi.
    ctx.globalAlpha = Math.max(0, v.kuolinAika / 40);
    if (!v.palanut) {
      ctx.translate(0, v.lattia);
      ctx.scale(1, 0.4);
      ctx.translate(0, -v.lattia);
    }
  }

  // Palanut vihu on melkein musta (tumma kuva lasketaan valmiiksi, valmiskuvat.js)
  const tumma = !v.elossa && v.palanut;
  const kuvaksi = (kuva) => (tumma ? suodatettu(kuva, "brightness(0.2)") : kuva);

  if (v.tyyppi === "kekale") {
    if (v.elossa) hehku(v.x + 13, v.y + 13, 34, "255, 120, 0", 0.25 + Math.sin(aika / 120) * 0.1);
    piirraRuutu(kuvaksi(tulivihuKuvat.kekale), v.elossa ? ruutu : 0, 16, 16, v.x - 3, v.lattia - 30, peilaa);
  } else if (v.tyyppi === "kipina") {
    piirraKipina(v, aika, tumma);
  } else if (v.tyyppi === "laavaetana") {
    piirraRuutu(kuvaksi(tulivihuKuvat.laavaetana), v.elossa ? ruutu : 0, 16, 16, v.x - 1, v.lattia - 30, peilaa);
  } else if (v.tyyppi === "salamanteri") {
    let kuva = v.elossa ? ruutu : 0;
    if (v.tila === "valmistautuu" || v.tila === "sylkee") kuva = 2;
    let x = v.x - 4;
    if (v.elossa && v.tila === "valmistautuu") {
      x += Math.sin(aika / 25) * 1.5; // tärisee ennen sylkemistä
      const suu = v.suunta === 1 ? v.x + v.leveys + 2 : v.x - 2;
      hehku(suu, v.lattia - 16, 10 + (35 - v.ajastin), "255, 140, 0", 0.5);
    }
    piirraRuutu(kuvaksi(tulivihuKuvat.salamanteri), kuva, 24, 12, x, v.lattia - 24, peilaa);
  }
  ctx.restore();
}

// Kipinä on pieni lepattava liekki, jolla on silmät
// tumma = palanut kipinä on melkein musta (värit ovat viidesosa normaalista)
function piirraKipina(v, aika, tumma) {
  const lepatus = Math.floor(aika / 80 + v.x) % 2;
  const x = Math.round(v.x);
  const y = Math.round(v.y);
  if (!tumma) hehku(x + 7, y + 7, 22, "255, 150, 0", 0.4);
  ctx.fillStyle = tumma ? "#331200" : "#ff5a00";
  ctx.fillRect(x, y + 4, 14, 10);
  ctx.fillRect(x + 2 + lepatus * 2, y, 8, 4);
  ctx.fillStyle = tumma ? "#332a0c" : "#ffd23c";
  ctx.fillRect(x + 3, y + 6, 8, 6);
  ctx.fillStyle = "black";
  const silma = v.suunta === 1 ? 6 : 3;
  ctx.fillRect(x + silma, y + 7, 2, 3);
  ctx.fillRect(x + silma + 4, y + 7, 2, 3);
}

// Laavajäljet ja tulisylyt
function piirraTulivihujenAmmukset(aika) {
  if (!kentta.laavajaljet) return;
  for (const j of kentta.laavajaljet) {
    ctx.globalAlpha = Math.min(1, j.ika / 40); // jälki himmenee lopussa
    ctx.fillStyle = "#c22a0a";
    ctx.fillRect(j.x, j.y + 2, j.leveys, j.korkeus - 2);
    ctx.fillStyle = Math.floor(aika / 100 + j.x) % 2 ? "#ff7b00" : "#ffb020";
    ctx.fillRect(j.x + 2, j.y, j.leveys - 4, 4);
    ctx.globalAlpha = 1;
  }
  for (const s of kentta.syljet) {
    hehku(s.x + 7, s.y + 7, 26, "255, 120, 0", 0.5);
    ctx.fillStyle = "#ff5a00";
    ctx.beginPath();
    ctx.arc(s.x + 7, s.y + 7, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(s.x + 7 + Math.sign(s.vx) * 2, s.y + 7, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Pimeissä kentissä tulivihut valaisevat ympäristöään
function tulivihujenValot(valo) {
  for (const v of kentta.viholliset) {
    if (!v.elossa) continue;
    if (v.tyyppi === "kekale") valo(v.x + 13, v.y + 13, 60);
    if (v.tyyppi === "kipina") valo(v.x + 7, v.y + 7, 45);
    if (v.tyyppi === "laavaetana") valo(v.x + 15, v.y + 12, 55);
    if (v.tyyppi === "salamanteri") valo(v.x + 20, v.y + 9, v.tila === "valmistautuu" ? 90 : 55);
  }
  for (const j of kentta.laavajaljet) valo(j.x + 7, j.y, 30);
  for (const s of kentta.syljet) valo(s.x + 7, s.y + 7, 70);
}
