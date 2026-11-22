// ==========================================
//   AAVIKON VIHUT
//   "kaktus"    = seisoo paikallaan ja pistää. Tulipallo polttaa sen!
//   "skorpioni" = piileskelee hiekan alla. Kun ukko tulee lähelle, se nousee
//                 ylös ja jahtaa hetken. Sitten se kaivautuu takaisin piiloon.
//   "pyorre"    = pölypyörre. Ei satuta, mutta heittää ukon korkealle ilmaan!
//                 Sitä ei voi tuhota. Pyörteen avulla pääsee korkeisiin paikkoihin.
//   "muumio"    = hajoaa kääröiksi, kun sen päälle hyppää, mutta kokoaa itsensä
//                 uudestaan. Vain tulipallo tuhoaa sen lopullisesti.
//   Vaikealla: kaktus ampuu piikkejä, skorpioni ja pyörre ovat nopeampia
//   ja muumio kokoaa itsensä nopeammin.
//   Kuvat on piirretty kirjaimilla (värit: aavikko.js, AAVIKKOVARIT).
// ==========================================

const AAVIKKOVIHUT = ["kaktus", "skorpioni", "pyorre", "muumio"];

const SKORPIONIN_NAKO = 140; // kuinka läheltä skorpioni huomaa ukon
const SKORPIONIN_NOPEUS = 2.2; // (ukon nopeus on 4)
const SKORPIONIN_NOPEUS_VAIKEA = 3;
const SKORPIONIN_JAHTI = 170; // kuinka kauan skorpioni jahtaa (60 = 1 s)
const PYORTEEN_NOPEUS = 1.5;
const PYORTEEN_NOPEUS_VAIKEA = 2.4;
const PYORTEEN_HEITTO = 17.5; // kuinka kovaa pyörre heittää ylös (tavallinen hyppy on 16)
const MUUMION_NOPEUS = 0.7;
const MUUMION_NAKO = 220;
const MUUMION_LEPO = 190; // kuinka kauan muumio on kasassa ennen kuin se nousee
const MUUMION_LEPO_VAIKEA = 110;
const KAKTUKSEN_JAKSO = 150; // vaikealla: kuinka usein kaktus ampuu piikkejä

const PISTEET_KAKTUS = 100;
const PISTEET_SKORPIONI = 300;
const PISTEET_MUUMIO = 350;

const AAVIKKOVIHUPIKSELIT = {
  // Kaktus (16 x 24)
  kaktus: [[
    "......KKKK......",
    ".....KGLGGK.....",
    ".....KGLGGK.....",
    ".....KGLGGK.....",
    ".KK..KGLGGK.....",
    "KGGK.KGLGGK.....",
    "KGLK.KGLGGK..KK.",
    "KGLK.KGLGGK.KGGK",
    "KGLK.KGLGGK.KLGK",
    "KGLKKKGLGGK.KLGK",
    "KGGGGGGLGGK.KLGK",
    ".KGGGGGLGGKKKLGK",
    "..KKKKGLGGGGGGGK",
    ".....KGLGGGGGGK.",
    ".....KGLGGKKKK..",
    ".....KGLGGK.....",
    ".....KGLGGK.....",
    ".....KGLGGK.....",
    ".....KGLGGK.....",
    ".....KGLGGK.....",
    ".....KGLGGK.....",
    ".....KGLGGK.....",
    ".....KGLGGK.....",
    ".....KGLGGK.....",
  ]],
  // Skorpioni (16 x 12), katsoo oikealle: häntä kaartuu selän yli
  skorpioni: [
    [
      "...KKK..........",
      "..KOOOK.........",
      ".KOKKOOK........",
      ".KOK.KYK........",
      ".KOK..K.....KK..",
      ".KOOK......KOOK.",
      "..KOOKKKKKKKOK..",
      "..KOOOOOOOOOKKK.",
      "..KOoOOoOOoOOOOK",
      "...KOOOOOOOOKKK.",
      "...KKKKKKKKKK...",
      "..K..K..K..K....",
    ],
    [
      "...KKK..........",
      "..KOOOK.........",
      ".KOKKOOK........",
      ".KOK.KYK........",
      ".KOK..K......KK.",
      ".KOOK.......KOOK",
      "..KOOKKKKKKKOKK.",
      "..KOOOOOOOOOKKK.",
      "..KOoOOoOOoOOOOK",
      "...KOOOOOOOOKKK.",
      "...KKKKKKKKKK...",
      "...K..K..K..K...",
    ],
  ],
  // Muumio (16 x 24), katsoo oikealle kädet ojossa
  muumio: [
    [
      "....KKKKKK......",
      "...KMMMMMMK.....",
      "..KMmMMMMmMK....",
      "..KMKKMMKKMK....",
      "..KMRKMMRKMK....",
      "..KMmMMMMMMK....",
      "...KMMmmMMK.....",
      "...KKMMMMKK.....",
      "..KMMmMMMMMKKKK.",
      ".KMMMMMmMMMMMMMK",
      ".KMmMMMMMMmKKKK.",
      ".KMMMmMMMMMK....",
      ".KMMMMMMmMMK....",
      ".KmMMMMMMMMK....",
      ".KMMMmMMMMMK....",
      "..KMMMMMmMK.....",
      "..KMMKKKMMK.....",
      "..KMMK.KMmK.....",
      "..KmMK.KMMK.....",
      "..KMMK.KMMK.....",
      "..KMMK.KmMK.....",
      "..KMmK.KMMK.....",
      ".KMMMK.KMMMK....",
      ".KKKKK.KKKKK....",
    ],
    [
      "....KKKKKK......",
      "...KMMMMMMK.....",
      "..KMmMMMMmMK....",
      "..KMKKMMKKMK....",
      "..KMRKMMRKMK....",
      "..KMmMMMMMMK....",
      "...KMMmmMMK.....",
      "...KKMMMMKK.....",
      "..KMMmMMMMMKKKK.",
      ".KMMMMMmMMMMMMMK",
      ".KMmMMMMMMmKKKK.",
      ".KMMMmMMMMMK....",
      ".KMMMMMMmMMK....",
      ".KmMMMMMMMMK....",
      ".KMMMmMMMMMK....",
      "..KMMMMMmMK.....",
      "..KMMKKKMMK.....",
      "..KMMK.KMmK.....",
      ".KmMK...KMMK....",
      ".KMMK...KMMK....",
      ".KMMK....KmMK...",
      "KMmK.....KMMK...",
      "KMMMK....KMMMK..",
      "KKKKK....KKKKK..",
    ],
  ],
  // Muumio kasassa (16 x 8)
  kaaro: [[
    "................",
    "................",
    "....KKKK........",
    "..KKMMMMKKK.....",
    ".KMMmMMMMMMKK...",
    "KMMMMMmMMMMMMK..",
    "KMmMMMMMMMmMMMK.",
    "KKKKKKKKKKKKKKK.",
  ]],
};

const aavikkovihuKuvat = {};
for (const nimi in AAVIKKOVIHUPIKSELIT) {
  aavikkovihuKuvat[nimi] = pikselikuva(AAVIKKOVIHUPIKSELIT[nimi], AAVIKKOVARIT);
}

// ---------- VALMISTELU ----------
// Kutsutaan valmisteleKentta-funktiosta (peli.js). Palauttaa true, jos vihu on aavikon vihu.
function valmisteleAavikkovihu(v) {
  if (!AAVIKKOVIHUT.includes(v.tyyppi)) return false;
  if (!v.suunta) v.suunta = 1;
  v.litistysVarit = ["#f3d9a0", "#c99a55", "#a87a3e"];
  v.ajastin = 0;

  if (v.tyyppi === "kaktus") {
    // x ja lattia
    v.leveys = 24;
    v.korkeus = 44;
    v.nopeus = 0;
    v.ajastin = v.vaihe || 60;
    v.arvo = PISTEET_KAKTUS;
    v.litistysVarit = ["#3fa34d", "#2b7a39", "#7fd67f"];
  } else if (v.tyyppi === "skorpioni") {
    // x, lattia, vasen ja oikea
    v.leveys = 30;
    v.korkeus = 18;
    v.tila = "piilossa"; // "piilossa", "nousee", "jahtaa" tai "kaivautuu"
    v.piilossa = true; // hiekan alla siihen ei voi osua
    v.arvo = PISTEET_SKORPIONI;
  } else if (v.tyyppi === "pyorre") {
    // x, lattia, vasen ja oikea
    v.leveys = 36;
    v.korkeus = 70;
    v.nopeus = vaikea ? PYORTEEN_NOPEUS_VAIKEA : PYORTEEN_NOPEUS;
    v.piilossa = true; // tulipallo lentää pyörteen läpi
    v.eiLasketa = true; // pyörrettä ei voi tuhota
    v.heittoTauko = 0;
  } else if (v.tyyppi === "muumio") {
    // x, lattia, vasen ja oikea
    v.leveys = 26;
    v.korkeus = 44;
    v.nopeus = MUUMION_NOPEUS;
    v.tila = "kavelee"; // "kavelee" tai "kasassa"
    v.arvo = PISTEET_MUUMIO;
    v.litistysVarit = ["#e9e2cf", "#bdb49a", "white"];
  }
  v.y = v.lattia - v.korkeus;
  return true;
}

// ---------- PÄIVITYS ----------

function paivitaAavikkovihu(v, dt) {
  if (v.tyyppi === "skorpioni") paivitaSkorpioni(v, dt);
  else if (v.tyyppi === "pyorre") paivitaPyorre(v, dt);
  else if (v.tyyppi === "muumio") paivitaMuumio(v, dt);
  else if (v.tyyppi === "kaktus" && vaikea) kaktusAmpuu(v, dt);
}

function paivitaSkorpioni(v, dt) {
  v.ajastin -= dt;
  if (v.tila === "piilossa") {
    if (v.ajastin > 0) return;
    const kohde = lahinPelaajaLahella(v, SKORPIONIN_NAKO, 70); // pakkasvihut.js
    if (!kohde) return;
    // Ukko on lähellä: hiekka alkaa pöllytä. Tämä on varoitus!
    v.tila = "nousee";
    v.ajastin = vaikea ? 22 : 36;
    v.suunta = kohde.x > v.x ? 1 : -1;
    aanet.putoaa();
  } else if (v.tila === "nousee") {
    if (Math.random() < 0.4) lisaaHiukkasia(v.x + 15, v.lattia, 1, ["#f3d9a0", "#c99a55"], 2);
    if (v.ajastin <= 0) {
      v.tila = "jahtaa";
      v.piilossa = false;
      v.ajastin = SKORPIONIN_JAHTI;
    }
  } else if (v.tila === "jahtaa") {
    const kohde = lahinPelaajaLahella(v, 500, 300);
    if (kohde) v.suunta = kohde.x + 10 > v.x + v.leveys / 2 ? 1 : -1;
    v.x += (vaikea ? SKORPIONIN_NOPEUS_VAIKEA : SKORPIONIN_NOPEUS) * v.suunta * dt;
    if (v.ajastin <= 0) {
      v.tila = "kaivautuu";
      v.ajastin = 30;
    }
  } else if (v.tila === "kaivautuu") {
    if (Math.random() < 0.4) lisaaHiukkasia(v.x + 15, v.lattia, 1, ["#f3d9a0", "#c99a55"], 2);
    if (v.ajastin <= 0) {
      v.tila = "piilossa";
      v.piilossa = true;
      v.ajastin = 100; // hetki rauhaa ennen kuin se voi nousta uudestaan
    }
  }
}

function paivitaPyorre(v, dt) {
  if (v.heittoTauko > 0) v.heittoTauko -= dt;
  v.x += v.nopeus * v.suunta * dt; // kääntyminen reunoilla tehdään peli.js:ssä
}

function paivitaMuumio(v, dt) {
  if (v.tila === "kasassa") {
    v.ajastin -= dt;
    if (v.ajastin <= 0) {
      // Muumio kokoaa itsensä!
      v.tila = "kavelee";
      lisaaHiukkasia(v.x + 13, v.lattia - 10, 8, ["#e9e2cf", "#bdb49a"], 2);
    }
    return;
  }
  // Muumio kävelee ukkoa kohti, jos näkee sen. Muuten se kulkee edestakaisin.
  const kohde = lahinPelaajaLahella(v, MUUMION_NAKO, 80);
  let nopeus = v.nopeus;
  if (kohde) {
    v.suunta = kohde.x + 10 > v.x + v.leveys / 2 ? 1 : -1;
    nopeus *= vaikea ? 2 : 1.5;
  }
  v.x += nopeus * v.suunta * dt;
}

// Vaikealla kaktus ampuu kaksi piikkiä kaaressa, kun ukko on lähellä (ammukset: pakkanen.js ja vaikea.js)
function kaktusAmpuu(v, dt) {
  v.ajastin -= dt;
  if (v.ajastin > 0) return;
  if (!lahinPelaajaLahella(v, 230, 200)) return;
  v.ajastin = KAKTUKSEN_JAKSO;
  heitaLumipallo(v.x + 8, v.y, -2.2, -6.5, 8, "piikki");
  heitaLumipallo(v.x + 8, v.y, 2.2, -6.5, 8, "piikki");
  if (lahellaRuutua(v.x)) aanet.heitto();
}

// ---------- OSUMAT ----------
// Osuuko vihu pelaajaan? (pelaaja = se, jota käsitellään.) Palauttaa true, jos elämä meni.
function aavikkovihuOsuu(v) {
  if (v.tyyppi === "pyorre") {
    // Pyörre ei satuta: se heittää ukon korkealle ilmaan
    if (v.heittoTauko > 0) return false;
    v.heittoTauko = 25;
    pelaaja.vy = -PYORTEEN_HEITTO;
    pelaaja.hyppaa = false; // heittoa ei voi katkaista päästämällä hyppynapin
    pelaaja.maassa = false;
    pelaaja.venytys = 0.4;
    lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "HUI!");
    lisaaHiukkasia(pelaaja.x + 10, pelaaja.y + 30, 12, ["#f3d9a0", "#e2bd7a", "white"], 4);
    aanet.jousi();
    return false;
  }
  if (v.tyyppi === "kaktus") {
    // Kaktus pistää joka puolelta, myös päältä
    if (pelaaja.suojaAika > 0) return false;
    lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "PIIKKEJÄ!");
    menetaElama();
    return true;
  }
  if (v.tyyppi === "skorpioni" && v.piilossa) return false; // hiekan alla
  if (v.tyyppi === "muumio" && v.tila === "kasassa") return false; // kääröt eivät satuta

  const edellisetJalat = pelaaja.edellinenY + pelaaja.korkeus;
  const ylhaalta = pelaaja.vy > 0 && edellisetJalat <= v.y + 12;
  if (ylhaalta && v.tyyppi === "muumio") {
    // Muumio hajoaa kasaksi, mutta ei tuhoudu: polta se tulipallolla!
    v.tila = "kasassa";
    v.ajastin = vaikea ? MUUMION_LEPO_VAIKEA : MUUMION_LEPO;
    lisaaHiukkasia(v.x + 13, v.y + 20, 12, v.litistysVarit, 4);
    if (!v.vihjeNaytetty) {
      v.vihjeNaytetty = true;
      lisaaTeksti(v.x + 13, v.y - 10, "SE NOUSEE TAAS! POLTA SE!");
    }
    aanet.litistys();
    pomppaaVihusta();
    return false;
  }
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

function piirraAavikkovihu(v, aika) {
  if (!v.elossa && v.kuolinAika <= 0) return;
  if (v.tyyppi === "pyorre") return piirraPyorre(v, aika);

  ctx.save();
  if (!v.elossa) {
    // Tuhottu vihu haalenee ja painuu kasaan
    ctx.globalAlpha = Math.max(0, Math.min(1, v.kuolinAika / 25));
    ctx.translate(0, v.lattia);
    ctx.scale(1, v.palanut ? Math.max(0.05, v.kuolinAika / 40) : 0.35);
    ctx.translate(0, -v.lattia);
  }

  let huuto = false; // piirretäänkö punainen huutomerkki?
  if (v.tyyppi === "kaktus") {
    let x = v.x - 4;
    // Vaikealla kaktus tärisee juuri ennen kuin se ampuu
    if (v.elossa && vaikea && v.ajastin < 25 && lahinPelaajaLahella(v, 230, 200)) x += Math.round(Math.sin(aika / 20) * 2);
    piirraRuutu(v.palanut ? suodatettu(aavikkovihuKuvat.kaktus, "brightness(0.25)") : aavikkovihuKuvat.kaktus, 0, 16, 24, x, v.lattia - 48, false);
  } else if (v.tyyppi === "skorpioni") {
    const kuva = v.palanut ? suodatettu(aavikkovihuKuvat.skorpioni, "brightness(0.25)") : aavikkovihuKuvat.skorpioni;
    const peilaa = v.suunta === -1;
    if (!v.elossa) {
      piirraRuutu(kuva, 0, 16, 12, v.x - 1, v.lattia - 24, peilaa);
    } else if (v.tila === "piilossa") {
      // Hiekasta pilkistää vain pistimen kärki. Tarkkasilmäinen huomaa sen!
      ctx.fillStyle = "black";
      ctx.fillRect(v.x + 11, v.lattia - 8, 8, 8);
      ctx.fillStyle = "#ffd23c";
      ctx.fillRect(v.x + 13, v.lattia - 6, 4, 6);
    } else {
      // Nousee hiekasta tai kaivautuu takaisin: kuvasta näkyy vain osa
      let piilossa = 0; // kuinka monta pikseliä on vielä hiekan alla
      if (v.tila === "nousee") piilossa = 18 * Math.min(1, v.ajastin / 30);
      if (v.tila === "kaivautuu") piilossa = 18 * (1 - v.ajastin / 30);
      if (v.tila === "nousee") huuto = true;
      ctx.beginPath();
      ctx.rect(v.x - 20, v.lattia - 60, 80, 60);
      ctx.clip();
      const tarina = v.tila === "nousee" ? Math.round(Math.sin(aika / 18) * 2) : 0;
      piirraRuutu(kuva, Math.floor(aika / 110) % 2, 16, 12, v.x - 1 + tarina, v.lattia - 24 + piilossa, peilaa);
    }
  } else if (v.tyyppi === "muumio") {
    const peilaa = v.suunta === -1;
    const muumio = v.palanut ? suodatettu(aavikkovihuKuvat.muumio, "brightness(0.25)") : aavikkovihuKuvat.muumio;
    if (v.elossa && v.tila === "kasassa") {
      // Juuri ennen nousemista kasa tärisee
      const tarina = v.ajastin < 40 ? Math.round(Math.sin(aika / 18) * 2) : 0;
      piirraRuutu(aavikkovihuKuvat.kaaro, 0, 16, 8, v.x - 3 + tarina, v.lattia - 16, false);
      if (v.ajastin < 40) huuto = true;
    } else {
      piirraRuutu(muumio, v.elossa ? Math.floor(aika / 260) % 2 : 0, 16, 24, v.x - 3, v.lattia - 48, peilaa);
    }
  }
  ctx.restore();

  if (huuto) reunaTeksti("!", v.x + v.leveys / 2, v.y - 10, 26, "center", "#ff3c3c");
}

// Pölypyörre: päällekkäisiä hiekkarenkaita, jotka levenevät ylöspäin ja huojuvat
function piirraPyorre(v, aika) {
  const keski = v.x + v.leveys / 2;
  for (let i = 0; i < 7; i++) {
    const y = v.lattia - 6 - i * 10;
    const leveys = 8 + i * 5;
    const huojunta = Math.sin(aika / 130 + i * 0.9) * (2 + i);
    ctx.fillStyle = i % 2 === 0 ? "rgba(226, 189, 122, 0.85)" : "rgba(243, 217, 160, 0.85)";
    ctx.strokeStyle = "rgba(90, 60, 20, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(keski + huojunta, y, leveys, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Pyörivä viiru
    const kulma = aika / 90 + i * 1.3;
    ctx.fillStyle = "rgba(140, 100, 50, 0.8)";
    ctx.fillRect(keski + huojunta + Math.cos(kulma) * leveys * 0.7 - 2, y - 1, 5, 2);
  }
}

// Pimeissä kentissä muumion silmät kiiluvat
function aavikkovihujenValot(valo) {
  for (const v of kentta.viholliset) {
    if (v.elossa && v.tyyppi === "muumio" && v.tila !== "kasassa") valo(v.x + 13, v.y + 8, 45);
  }
}
