// ==========================================
//   PAKKASSAAREN VIHUT
//   pingviini  = taapertaa edestakaisin. Kun se näkee ukon, se heittäytyy
//                mahalleen ja LIUKUU lujaa ukkoa kohti! Liu'un jälkeen se on
//                hetken pökerryksissä. Hyppää päälle tai ammu tulipallolla.
//   lumiukkeli = pieni lumiukko, joka seisoo paikallaan ja heittää lumipalloja
//                kaaressa. Tulipallo sulattaa sen (ja lumipallot).
//   jaahauki   = hauki, joka hyppää vedestä. Sen päältä voi pompata!
//   pollo      = tunturipöllö, joka lentää korkealla ja SYÖKSYY alas ukkoa kohti.
//                Väistä juoksemalla tai hyppää sen päälle, kun se tulee alas.
//   Kentässä: tyyppi, x, lattia (pöllöllä y) sekä vasen ja oikea, jos vihu liikkuu.
//   Kuvat on piirretty kirjaimilla (katso pakkanen.js: PAKKASVARIT).
// ==========================================

const PAKKASVIHUT = ["pingviini", "lumiukkeli", "jaahauki", "pollo"];

const PINGVIININ_NOPEUS = 0.8; // taapertaa hitaasti
const PINGVIININ_LIUKU = 4.3; // mutta liukuu lujaa! (ukon nopeus on 4)
const PINGVIININ_NAKO = 260; // kuinka kaukaa pingviini huomaa ukon
const LUMIUKKELIN_NAKO = 400; // kuinka kauas lumiukkeli jaksaa heittää
const LUMIUKKELIN_JAKSO = 150; // kuinka usein lumiukkeli heittää (60 = 1 s)
const HAUEN_JAKSO = 120; // kuinka usein hauki hyppää
const POLLON_NOPEUS = 1.3;
const POLLON_NAKO = 170; // kuinka läheltä (sivusuunnassa) pöllö huomaa ukon
const POLLON_SYOKSY = 80; // kuinka kauan syöksy kestää (60 = 1 s)

const PISTEET_PINGVIINI = 250;
const PISTEET_LUMIUKKELI = 300;
const PISTEET_HAUKI = 300;
const PISTEET_POLLO = 350;

const PAKKASVIHUPIKSELIT = {
  // Pingviini: 3 ruutua 16 x 16 (kävely, kävely, mahallaan), katsoo oikealle
  pingviini: [
    [
      "................",
      "......KKKKK.....",
      ".....KBBBBBK....",
      "....KBBBBBBBK...",
      "....KBBBWWKBK...",
      "....KBBWWWWOOOK.",
      "....KBBWWWWOOK..",
      "...KBBWWWWWWK...",
      "..KBBBWWWWWWK...",
      "..KBKBWWWWWWK...",
      "..KBKBWWWWWWK...",
      "..KKKBWWWWWWK...",
      "...KBBWWWWWBK...",
      "...KBBBWWWBBK...",
      "....KOOKKOOOK...",
      "....KKK..KKKK...",
    ],
    [
      "................",
      "......KKKKK.....",
      ".....KBBBBBK....",
      "....KBBBBBBBK...",
      "....KBBBWWKBK...",
      "....KBBWWWWOOOK.",
      "....KBBWWWWOOK..",
      "...KBBWWWWWWK...",
      "..KBBBWWWWWWK...",
      ".KBBKBWWWWWWK...",
      ".KBKKBWWWWWWK...",
      "..KK.KWWWWWWK...",
      "...KBBWWWWWBK...",
      "...KBBBWWWBBK...",
      "...KOOOKKOOK....",
      "...KKKK..KKK....",
    ],
    [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "....KKKKKKKK....",
      "..KKBBBBBBBBKK..",
      ".KBBBBBBBBBWKBK.",
      "KOKBBBBBBBWWWOOK",
      "KOKWWWWWWWWWWOK.",
      ".KKWWWWWWWWWWK..",
      "...KKKKKKKKKK...",
    ],
  ],
  // Lumiukkeli: 2 ruutua 16 x 20 (seisoo, kädet ylhäällä), nenä osoittaa oikealle
  lumiukkeli: [
    [
      "................",
      ".....KKKKKK.....",
      ".....KGGGGK.....",
      ".....KGgGGK.....",
      "...KKKKKKKKKK...",
      "....KWWWWWWK....",
      "...KWWWKWWKWK...",
      "...KWWWWWWOOOOK.",
      "...KWWKWWWWWK...",
      "....KWWKKKWK....",
      "...KRRRRRRRRK...",
      "..KWWWRRWWWWWK..",
      ".KWWWWWWKWWWWWK.",
      "NKWWWWWWWWWWWWKN",
      "NKWWWWWWKWWWWWKN",
      ".KWWWWWWWWWWWWK.",
      ".KwWWWWWKWWWWwK.",
      ".KwwWWWWWWWWwwK.",
      "..KwwwwwwwwwwK..",
      "...KKKKKKKKKK...",
    ],
    [
      "................",
      ".....KKKKKK.....",
      ".....KGGGGK.....",
      ".....KGgGGK.....",
      "...KKKKKKKKKK...",
      "....KWWWWWWK....",
      "...KWWKWWKKWK...",
      "...KWWWWWWOOOOK.",
      "N..KWWWWWWWWK..N",
      "N...KWKKKKWK...N",
      "NK.KRRRRRRRRK.KN",
      ".NKWWWRRWWWWWKN.",
      ".KWWWWWWKWWWWWK.",
      ".KWWWWWWWWWWWWK.",
      ".KWWWWWWKWWWWWK.",
      ".KWWWWWWWWWWWWK.",
      ".KwWWWWWKWWWWwK.",
      ".KwwWWWWWWWWwwK.",
      "..KwwwwwwwwwwK..",
      "...KKKKKKKKKK...",
    ],
  ],
  // Jäähauki: 2 ruutua 16 x 16, pää ylöspäin (pyrstö heiluu)
  jaahauki: [
    [
      "......KKKK......",
      ".....KffffK.....",
      "....KfWKfffK....",
      "....KffffffK....",
      "....KffffFfK....",
      "..KKKffFfffKKK..",
      ".KcCKfffffFKCcK.",
      ".KcKKfCCCCfKKcK.",
      "..K.KfCCCCfK.K..",
      "....KfFCCffK....",
      "....KffCCfFK....",
      ".....KffffK.....",
      ".....KfFffK.....",
      "....KKKffKKK....",
      "...KccKffKccK...",
      "...KKKKKKKKKK...",
    ],
    [
      "......KKKK......",
      ".....KffffK.....",
      "....KfWKfffK....",
      "....KffffffK....",
      "....KffffFfK....",
      "..KKKffFfffKKK..",
      ".KcCKfffffFKCcK.",
      ".KcKKfCCCCfKKcK.",
      "..K.KfCCCCfK.K..",
      "....KfFCCffK....",
      "....KffCCfFK....",
      ".....KffffK.....",
      ".....KfFffK.....",
      "....KKKffKKK....",
      "..KccKKffKKccK..",
      "..KKKK.KK.KKKK..",
    ],
  ],
  // Tunturipöllö: 2 ruutua 16 x 16 (siivet ylhäällä, siivet alhaalla)
  pollo: [
    [
      "KK............KK",
      "KWK...KKKK...KWK",
      "KWWK.KWWWWK.KWWK",
      "KWWWKWWWWWWKWWWK",
      ".KWGWYYWWYYWGWK.",
      ".KWWWYKWWKYWWWK.",
      "..KWGWWOOWWGWK..",
      "...KWWWOOWWWK...",
      "...KWGWWWWGWK...",
      "...KWWWGGWWWK...",
      "....KWGWWGWK....",
      "....KWWWWWWK....",
      ".....KWWWWK.....",
      ".....KOKKOK.....",
      "................",
      "................",
    ],
    [
      "................",
      "......KKKK......",
      ".....KWWWWK.....",
      "....KWWWWWWK....",
      "..KKKYYWWYYKKK..",
      ".KWWKYKWWKYKWWK.",
      "KWWGWWWOOWWWGWWK",
      "KWWWKWWOOWWKWWWK",
      "KWGK.KWWWWK.KGWK",
      "KWK..KWGGWK..KWK",
      "KK...KWWWWK...KK",
      ".....KWGGWK.....",
      ".....KWWWWK.....",
      ".....KOKKOK.....",
      "................",
      "................",
    ],
  ],
};

const pakkasvihuKuvat = {};
for (const nimi in PAKKASVIHUPIKSELIT) pakkasvihuKuvat[nimi] = pikselikuva(PAKKASVIHUPIKSELIT[nimi]);

// ---------- VALMISTELU ----------

// Palauttaa true, jos vihu oli Pakkassaaren vihu (ja se valmisteltiin)
function valmistelePakkasvihu(v) {
  if (!PAKKASVIHUT.includes(v.tyyppi)) return false;
  if (!v.suunta) v.suunta = 1;
  v.sulaa = true; // tulipallo sulattaa nämä vihut (ne eivät pala mustiksi)
  v.litistysVarit = ["white", "#cfe1f0", "#8fd3f0"];

  if (v.tyyppi === "pingviini") {
    v.leveys = 26;
    v.korkeus = 30;
    if (!v.nopeus) v.nopeus = PINGVIININ_NOPEUS;
    v.tila = "kavelee"; // "kavelee", "valmistautuu", "liukuu" tai "nousee"
    v.ajastin = 60;
    v.arvo = PISTEET_PINGVIINI;
    v.y = v.lattia - v.korkeus;
  } else if (v.tyyppi === "lumiukkeli") {
    v.leveys = 28;
    v.korkeus = 38;
    if (!v.jakso) v.jakso = LUMIUKKELIN_JAKSO;
    v.tila = "odottaa"; // "odottaa", "tahtaa" tai "heitti"
    v.ajastin = v.vaihe !== undefined ? v.vaihe : 80;
    v.suunta = -1; // katsoo aluksi vasemmalle, josta ukko yleensä tulee
    v.arvo = PISTEET_LUMIUKKELI;
    v.y = v.lattia - v.korkeus;
  } else if (v.tyyppi === "jaahauki") {
    // x, lattia (veden pinta), hyppy (kuinka korkealle), jakso ja vaihe
    v.leveys = 22;
    v.korkeus = 28;
    if (!v.hyppy) v.hyppy = 190;
    if (!v.jakso) v.jakso = HAUEN_JAKSO;
    v.y = v.lattia + 10;
    v.piilossa = true; // veden alla
    v.ajastin = v.vaihe || 0;
    v.putoaaKuollessa = true;
    v.arvo = PISTEET_HAUKI;
  } else if (v.tyyppi === "pollo") {
    // x, y (lentokorkeus), vasen ja oikea
    v.leveys = 30;
    v.korkeus = 22;
    if (!v.nopeus) v.nopeus = POLLON_NOPEUS;
    v.alkuY = v.y;
    v.aika = 0;
    v.tila = "lentaa"; // "lentaa", "tahtaa" tai "syoksyy"
    v.ajastin = 60;
    v.putoaaKuollessa = true;
    v.arvo = PISTEET_POLLO;
  }
  v.edellinenY = v.y;
  return true;
}

// ---------- PÄIVITYS ----------

function paivitaPakkasvihu(v, dt) {
  v.edellinenY = v.y;
  if (v.tyyppi === "pingviini") paivitaPingviini(v, dt);
  else if (v.tyyppi === "lumiukkeli") paivitaLumiukkeli(v, dt);
  else if (v.tyyppi === "jaahauki") paivitaHauki(v, dt);
  else if (v.tyyppi === "pollo") paivitaPollo(v, dt);
}

// Lähin elävä pelaaja, joka on korkeintaan matkan "nako" päässä sivusuunnassa
// ja korkeintaan "korkeusero" pikseliä ylempänä tai alempana (tai null).
function lahinPelaajaLahella(v, nako, korkeusero) {
  let lahin = null;
  let paras = nako;
  const lattia = v.lattia !== undefined ? v.lattia : v.y + v.korkeus;
  for (const pl of elavatPelaajat()) {
    const matka = Math.abs(pl.x + pl.leveys / 2 - (v.x + v.leveys / 2));
    if (matka < paras && Math.abs(pl.y + pl.korkeus - lattia) < korkeusero) {
      paras = matka;
      lahin = pl;
    }
  }
  return lahin;
}

function paivitaPingviini(v, dt) {
  v.ajastin -= dt;
  if (v.tila === "kavelee") {
    v.x += v.nopeus * v.suunta * dt;
    if (v.ajastin > 0) return;
    const kohde = lahinPelaajaLahella(v, PINGVIININ_NAKO, 50);
    if (!kohde) {
      v.ajastin = 15; // katsotaan pian uudestaan
      return;
    }
    // Ukko näkyy: käännytään sitä kohti ja valmistaudutaan liukuun
    v.suunta = kohde.x + 10 < v.x + v.leveys / 2 ? -1 : 1;
    v.tila = "valmistautuu";
    v.ajastin = 28;
    if (lahellaRuutua(v.x)) aanet.pingviini();
  } else if (v.tila === "valmistautuu") {
    if (v.ajastin <= 0) {
      v.tila = "liukuu";
      v.ajastin = 110;
      v.korkeus = 18; // mahallaan pingviini on matala
      v.y = v.lattia - v.korkeus;
    }
  } else if (v.tila === "liukuu") {
    v.x += PINGVIININ_LIUKU * v.suunta * dt;
    if (Math.random() < 0.4 * dt) lisaaHiukkasia(v.x + 13, v.lattia, 1, ["white", "#c9f0ff"], 1.5);
    // Liuku loppuu alueen reunaan tai kun vauhti hiipuu
    const reunassa = v.x <= v.vasen || v.x >= v.oikea;
    if (vaikea && reunassa && !v.kimposi) {
      // Vaikealla pingviini kimpoaa reunasta kerran takaisin
      v.kimposi = true;
      v.suunta = v.x <= v.vasen ? 1 : -1;
      v.x = Math.max(v.vasen + 1, Math.min(v.oikea - 1, v.x));
      v.ajastin = 90;
    } else if (reunassa || v.ajastin <= 0) {
      v.kimposi = false;
      v.tila = "nousee";
      v.ajastin = 45;
      v.korkeus = 30;
      v.y = v.lattia - v.korkeus;
    }
  } else if (v.tila === "nousee") {
    // Pökerryksissä: seisoo paikallaan
    if (v.ajastin <= 0) {
      v.tila = "kavelee";
      v.ajastin = 90;
    }
  }
}

function paivitaLumiukkeli(v, dt) {
  v.ajastin -= dt;
  if (v.tila === "odottaa") {
    if (v.ajastin > 0) return;
    const kohde = lahinPelaajaLahella(v, LUMIUKKELIN_NAKO, 220);
    if (!kohde) {
      v.ajastin = 20;
      return;
    }
    v.suunta = kohde.x + 10 < v.x + v.leveys / 2 ? -1 : 1;
    v.kohdeX = kohde.x + 10; // tähdätään siihen, missä ukko on nyt
    v.tila = "tahtaa";
    v.ajastin = 30;
  } else if (v.tila === "tahtaa") {
    if (v.ajastin <= 0) {
      // Lumipallo lentää kaaressa noin 50 hetkeä. Vauhti sivulle lasketaan
      // niin, että pallo putoaa ukon kohdalle.
      const lahtoX = v.x + v.leveys / 2 - 7 + v.suunta * 12;
      let vx = (v.kohdeX - 7 - lahtoX) / 50;
      vx = Math.max(-6.5, Math.min(6.5, vx));
      heitaLumipallo(lahtoX, v.y + 2, vx, -7.5, 14);
      if (vaikea) {
        // Vaikealla kolme palloa kerralla: yksi lyhyt, yksi tarkka ja yksi pitkä
        heitaLumipallo(lahtoX, v.y + 2, vx * 0.6, -7.5, 14);
        heitaLumipallo(lahtoX, v.y + 2, vx * 1.4, -7.5, 14);
      }
      if (lahellaRuutua(v.x)) aanet.heitto();
      v.tila = "heitti";
      v.ajastin = 20;
    }
  } else if (v.tila === "heitti") {
    if (v.ajastin <= 0) {
      v.tila = "odottaa";
      v.ajastin = v.jakso;
    }
  }
}

// Hauki hyppää vedestä, putoaa takaisin ja odottaa hetken (kuten laavapallo)
function paivitaHauki(v, dt) {
  if (v.piilossa) {
    v.ajastin -= dt;
    if (v.ajastin <= 0) {
      v.piilossa = false;
      v.y = v.lattia;
      v.vy = -Math.sqrt(2 * 0.35 * v.hyppy);
      v.edellinenY = v.y;
      lisaaHiukkasia(v.x + 11, v.lattia, 6, ["white", "#8fd3f0"], 3);
    }
    return;
  }
  const nousi = v.vy < 0;
  v.vy += 0.35 * dt;
  v.y += v.vy * dt;
  if (vaikea && nousi && v.vy >= 0) haukiSylkee(v); // jääpala hypyn huipulla (vaikea.js)
  if (v.vy > 0 && v.y > v.lattia + 10) {
    v.piilossa = true;
    v.ajastin = v.jakso;
    lisaaHiukkasia(v.x + 11, v.lattia, 6, ["white", "#8fd3f0"], 3);
  }
}

function paivitaPollo(v, dt) {
  v.ajastin -= dt;
  if (v.tila === "lentaa") {
    // Lentää edestakaisin ja keinuu vähän
    v.x += v.nopeus * v.suunta * dt;
    v.aika += dt;
    v.y = v.alkuY + Math.sin(v.aika * 0.06) * 6;
    if (v.ajastin > 0) return;
    v.ajastin = 10;
    // Onko joku pöllön alapuolella?
    for (const pl of elavatPelaajat()) {
      const matka = Math.abs(pl.x + pl.leveys / 2 - (v.x + v.leveys / 2));
      if (matka < (vaikea ? POLLON_NAKO * 1.4 : POLLON_NAKO) && pl.y > v.y + 40) {
        v.tila = "tahtaa";
        v.ajastin = 26;
        if (lahellaRuutua(v.x)) aanet.pollo();
      }
    }
  } else if (v.tila === "tahtaa") {
    // Pysähtyy ilmaan ja tuijottaa: kohta se syöksyy!
    if (v.ajastin <= 0) {
      // Syöksytään lähintä ukkoa kohti
      let pl = elavatPelaajat()[0];
      for (const toinen of elavatPelaajat()) {
        if (Math.abs(toinen.x - v.x) < Math.abs(pl.x - v.x)) pl = toinen;
      }
      v.tila = "syoksyy";
      v.syoksy = 0;
      // Syöksyn alin kohta on ukon korkeudella ja ukon kohdalla
      v.syvyys = Math.max(50, Math.min(280, pl.y + pl.korkeus - 30 - v.alkuY));
      v.vx = (pl.x + pl.leveys / 2 - (v.x + v.leveys / 2)) / (POLLON_SYOKSY / 2);
      v.vx = Math.max(-5, Math.min(5, v.vx));
      if (v.vx !== 0) v.suunta = v.vx > 0 ? 1 : -1;
    }
  } else if (v.tila === "syoksyy") {
    v.syoksy += dt;
    const osa = v.syoksy / POLLON_SYOKSY; // 0 = alussa, 1 = takaisin ylhäällä
    v.x += v.vx * dt;
    // Math.sin tekee kaaren: alas ja takaisin ylös
    v.y = v.alkuY + v.syvyys * Math.sin(Math.PI * Math.min(1, osa));
    if (osa >= 1) {
      v.tila = "lentaa";
      v.ajastin = vaikea ? 45 : 110; // lepää hetken ennen seuraavaa syöksyä
      v.aika = 0;
    }
  }
}

// Pakkassaaren vihu osui pelaajaan. Palauttaa true, jos pelaaja menetti elämän.
function pakkasvihuOsuu(v) {
  if (v.piilossa) return false; // hauki on veden alla
  // Tuleeko ukko ylhäältä? Verrataan ukon jalkoja siihen, missä vihun pää oli
  // edellisellä hetkellä (hauki ja pöllö liikkuvat nopeasti ylös ja alas).
  const edellisetJalat = pelaaja.edellinenY + pelaaja.korkeus;
  const ylhaalta = pelaaja.vy > 0 && edellisetJalat <= Math.max(v.y, v.edellinenY) + 12;
  if (ylhaalta) {
    tuhoaVihu(v, false);
    pomppaaVihusta();
    return false;
  }
  if (pelaaja.suojaAika > 0) return false;
  menetaElama();
  return true;
}

// ---------- PIIRTÄMINEN ----------

function piirraPakkasvihu(v, aika) {
  if (!v.elossa && v.kuolinAika <= 0) return;
  if (v.elossa && v.piilossa) return;
  const peilaa = v.suunta === -1; // kuvat katsovat oikealle

  ctx.save();
  if (!v.elossa) {
    ctx.globalAlpha = Math.max(0, Math.min(1, v.kuolinAika / 25));
    const pohja = v.putoaaKuollessa ? v.y + v.korkeus : v.lattia;
    if (v.palanut) {
      // Sulaa: painuu pikkuhiljaa lätäköksi
      ctx.translate(0, pohja);
      ctx.scale(1, Math.max(0.05, v.kuolinAika / 40));
      ctx.translate(0, -pohja);
    } else if (v.putoaaKuollessa) {
      // Putoaa ylösalaisin
      ctx.translate(0, v.y * 2 + v.korkeus);
      ctx.scale(1, -1);
    } else {
      // Litistynyt: matala lytty maassa
      ctx.translate(0, pohja);
      ctx.scale(1, 0.35);
      ctx.translate(0, -pohja);
    }
  }

  let huuto = false; // piirretäänkö punainen huutomerkki pään päälle?
  if (v.tyyppi === "pingviini") {
    let ruutu = Math.floor(aika / 180) % 2;
    let x = v.x - 3;
    if (!v.elossa) ruutu = 0;
    else if (v.tila === "liukuu") ruutu = 2;
    else if (v.tila === "valmistautuu") {
      ruutu = 0;
      x += Math.round(Math.sin(aika / 20) * 2); // tärisee ennen liukua
      huuto = true;
    } else if (v.tila === "nousee") ruutu = 0;
    piirraRuutu(pakkasvihuKuvat.pingviini, ruutu, 16, 16, x, v.lattia - 32, peilaa);
    if (v.elossa && v.tila === "nousee") {
      // Pökerryksissä: pään päällä pyörii merkki
      reunaTeksti("@", v.x + 13, v.y - 6 + Math.sin(aika / 150) * 2, 14, "center", "#ccc");
    }
  } else if (v.tyyppi === "lumiukkeli") {
    let x = v.x - 2;
    let ruutu = 0;
    if (v.elossa && (v.tila === "tahtaa" || v.tila === "heitti")) ruutu = 1; // kädet ylhäällä
    if (v.elossa && v.tila === "tahtaa") x += Math.round(Math.sin(aika / 20) * 1.5);
    piirraRuutu(pakkasvihuKuvat.lumiukkeli, ruutu, 16, 20, x, v.lattia - 40, peilaa);
  } else if (v.tyyppi === "jaahauki") {
    // Alas pudotessa hauki on pää alaspäin
    if (v.elossa && v.vy > 0) {
      ctx.translate(0, (v.y - 2) * 2 + 32);
      ctx.scale(1, -1);
    }
    piirraRuutu(pakkasvihuKuvat.jaahauki, Math.floor(aika / 110) % 2, 16, 16, v.x - 5, v.y - 2, false);
  } else if (v.tyyppi === "pollo") {
    let ruutu = Math.floor(aika / 150) % 2; // siivet räpyttävät
    let x = v.x - 1;
    if (v.elossa && v.tila === "syoksyy") ruutu = 1;
    if (v.elossa && v.tila === "tahtaa") {
      x += Math.round(Math.sin(aika / 18) * 2);
      huuto = true;
    }
    if (!v.elossa) ruutu = 1;
    piirraRuutu(pakkasvihuKuvat.pollo, ruutu, 16, 16, x, v.y - 6, false);
  }
  ctx.restore();

  if (huuto) reunaTeksti("!", v.x + v.leveys / 2, v.y - 8, 26, "center", "#ff3c3c");
}

// Pimeissä kentissä pöllön silmät kiiluvat
function pakkasvihujenValot(valo) {
  for (const v of kentta.viholliset) {
    if (v.elossa && v.tyyppi === "pollo") valo(v.x + 15, v.y + 8, 40);
  }
}
