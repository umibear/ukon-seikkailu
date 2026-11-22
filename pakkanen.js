// ==========================================
//   PAKKANEN
//   Maailma 3:n jutut:
//   - liukas jää (ukko liukuu!)
//   - jäälohkot, jotka sulavat tulipallosta (sisällä voi olla kolikko tai sydän)
//   - nuotio, jonka vieressä tulimittari täyttyy
//   - jääpuikot, jotka tippuvat katosta
//   - hyinen vesi (siihen ei saa pudota)
//   - tuulenpuuskat, jotka työntävät ukkoa
//   - revontulet taivaalla
//   Vihut ovat tiedostossa pakkasvihut.js ja pomo tiedostossa pakkasukko.js.
//   Kentät ovat tiedostossa kentat3.js.
// ==========================================

const JAAN_KIIHTYVYYS = 0.25; // kuinka nopeasti ukko pääsee vauhtiin jäällä (pieni luku = liukas)
const JAAN_JARRUTUS = 0.12; // kuinka nopeasti ukko pysähtyy jäällä (pieni luku = liukuu pitkään)
const NUOTION_LAMPO = 2.5; // kuinka nopeasti nuotio täyttää tulimittaria
const NUOTION_ETAISYYS = 60; // kuinka läheltä nuotio lämmittää (pikseleitä)
const PUIKON_HAVAINTO = 150; // kuinka läheltä jääpuikko huomaa ukon (pikseleitä sivuttain)
const PUIKON_TARINA = 24; // kuinka kauan jääpuikko tärisee ennen putoamista (60 = 1 s)
const PUIKON_KASVU = 240; // kuinka kauan uusi puikko kasvaa pudonneen tilalle
const PISTEET_PUIKKO = 50; // jääpuikon sulattamisesta tulipallolla
const TUULEN_JAKSO = 240; // kuinka usein tuulenpuuska tulee (60 = 1 s)
const TUULI_MAASSA = 0.25; // maassa tuuli työntää vain vähän (1 = yhtä paljon kuin ilmassa)
const TUULI_JAALLA = 0.8; // jäällä jalat eivät pidä: tuuli vie melkein kuin ilmassa
const LUMIPALLON_PAINO = 0.3; // kuinka nopeasti lumipallo kaartaa alas

// VAIKEA TASO: PAKKANEN PUREE. Tulimittari on ukon lämpö. Se ei täyty
// itsestään vaan hupenee koko ajan. Lämpöä saa nuotiolta ja hyppäämällä
// vihujen päälle. Jokainen tulipallo vie lämpöä, joten mieti ennen kuin ammut!
const PAKKASEN_PUREMA = 0.04; // kuinka nopeasti lämpö hupenee (täysi mittari kestää noin 40 sekuntia)
const TUULEN_PUREMA = 2.5; // tuulessa pakkanen puree näin monta kertaa kovemmin
const KOHMEEN_HIDASTUS = 0.6; // kohmeinen ukko liikkuu näin paljon hitaammin (1 = tavallinen vauhti)
const JAATYMISEN_AIKA = 600; // kuinka kauan ukko kestää kohmeessa ennen kuin jäätyy (60 = 1 s)
const NUOTION_SAMMUMINEN = 420; // kuinka kauan Pakkasukon sammuttama nuotio on sammuksissa

// ---------- PIKSELIKUVAT ----------
// Tämän maailman kuvat on piirretty tähän tiedostoon kirjaimilla, samaan
// tapaan kuin sydän peli.js:ssä. Jokainen kirjain on yksi pikseli!
// Kokeile muuttaa kirjaimia ja katso, miten kuva muuttuu.
const PAKKASVARIT = {
  K: "#000000", // musta reunaviiva
  W: "#ffffff", // valkoinen
  w: "#cfe1f0", // lumen varjo
  s: "#9fb9d6", // sinertävä varjo
  d: "#5d6f8f", // jäinen maa
  D: "#465675", // jäinen maa, tumma
  i: "#7f93b5", // jäinen maa, vaalea
  C: "#d6f4ff", // jää, kirkas
  c: "#8fd3f0", // jää
  b: "#4f9ed0", // jää, tumma
  B: "#1d2b53", // tummansininen (pingviinin selkä)
  O: "#ff9a2a", // oranssi
  o: "#d9631e", // tumma oranssi
  Y: "#ffd23c", // keltainen
  R: "#e63946", // punainen
  G: "#8a97a6", // harmaa
  g: "#5b6675", // tumma harmaa
  N: "#8b5a2b", // ruskea
  n: "#5a3716", // tumma ruskea
  f: "#4c9c8c", // hauen vihreä
  F: "#2f6f66", // hauen tumma vihreä
};

// Tekee kuvan pikselikartasta. ruudut = lista ruutuja (animaation vaiheet),
// ja jokainen ruutu on lista rivejä. Piste (.) on läpinäkyvä.
// Ruudut tulevat kuvaan vierekkäin, niin kuin kuvat-kansion kuvissa.
function pikselikuva(ruudut) {
  const leveys = ruudut[0][0].length;
  const korkeus = ruudut[0].length;
  const kuva = document.createElement("canvas");
  kuva.width = leveys * ruudut.length;
  kuva.height = korkeus;
  const c = kuva.getContext("2d");
  for (let n = 0; n < ruudut.length; n++) {
    for (let y = 0; y < korkeus; y++) {
      for (let x = 0; x < leveys; x++) {
        const vari = PAKKASVARIT[ruudut[n][y][x]];
        if (!vari) continue; // piste = ei piirretä mitään
        c.fillStyle = vari;
        c.fillRect(n * leveys + x, y, 1, 1);
      }
    }
  }
  return kuva;
}

const PAKKASPIKSELIT = {
  // Lumilaatta: lunta päällä, jäistä maata alla (16 x 16)
  lumi: [[
    "WWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWW",
    "WWWWWWWWWwWWWWWW",
    "WWWwWWWWWWWWWWwW",
    "WWWWWWWwWWWWWWWW",
    "wWWWwwWWWWwWWWww",
    "swwwsswwwwswwwss",
    "dssdddssssdssddd",
    "dddddddddddddddd",
    "ddddDddddddiDddd",
    "dddddddddddddddd",
    "dDdddddddDdddddd",
    "ddddddiddddddddd",
    "dddddDdddddddddD",
    "dddddddddddddddd",
    "ddDdddddddDddidd",
  ]],
  // Jäinen maa lumen alla
  lumimaa: [[
    "dddddddddddddddd",
    "ddddDddddddddddd",
    "ddddddddddiddddd",
    "dddddddddddddDdd",
    "dDdddddddddddddd",
    "dddddddDdddddddd",
    "dddiddddddddDddd",
    "dddddddddddddddd",
    "ddddddddddDddddd",
    "dDddddiddddddddd",
    "dddddddddddddddD",
    "ddddDddddddddddd",
    "ddddddddddddiddd",
    "ddddddddDddddddd",
    "dDdddddddddddddd",
    "dddddddddddDdddd",
  ]],
  // Liukas jää: kirkas pinta, jossa on kiiltoa
  jaa: [[
    "WWWWWWWWWWWWWWWW",
    "CCCCCCCCCCCCCCCC",
    "CCWWCCCCCCCWWCCC",
    "cCCWWCCCCCCCWWCc",
    "ccCCWWccccccCCWc",
    "cccCCccccccccCCc",
    "cccccccccccccccc",
    "ccccccbccccccccc",
    "cccccbcccccccccc",
    "ccccbccccccCcccc",
    "ccccccccccCccccc",
    "cccccccccCcccccc",
    "cccccccccccccccc",
    "ccbccccccccccccc",
    "cbcccccccccccbcc",
    "ccccccccccccbccc",
  ]],
  // Jään sisus
  jaasisus: [[
    "cccccccccccccccc",
    "cccccccccccbcccc",
    "ccCcccccccbccccc",
    "cCcccccccbcccccc",
    "cccccccccccccccc",
    "cccccccccccccccc",
    "ccccccbccccccCcc",
    "cccccbccccccCccc",
    "ccccbccccccCcccc",
    "cccccccccccccccc",
    "cccccccccccccccc",
    "cbccccccCccccccc",
    "bcccccccccccccbc",
    "cccccccccccccbcc",
    "ccccCcccccccbccc",
    "cccCcccccccccccc",
  ]],
  // Nuotio: 2 ruutua, liekki lepattaa
  nuotio: [
    [
      "................",
      ".......O........",
      "......OO........",
      "......OYO..O....",
      ".....OOYO.OO....",
      ".....OYYOOOO....",
      "....OOYYYOYO....",
      "....OYYWYYYOO...",
      "...OOYWWWYYYO...",
      "...OYYWWWWYYO...",
      "...OYYYWWYYOO...",
      "....OOYYYYOO....",
      ".KNNNKOOOKNNNK..",
      "KNNnNNKKKNNnNNK.",
      ".KnnKnnnnnKnnK..",
      "..KK.KKKKK.KK...",
    ],
    [
      "................",
      ".........O......",
      "....O...OO......",
      "....OO..OYO.....",
      "....OYO.OYOO....",
      "....OYOOOYYO....",
      "....OYYOYYYOO...",
      "...OOYYYWYYYO...",
      "...OYYYWWWYOO...",
      "...OYYWWWWYYO...",
      "...OOYYWWYYYO...",
      "....OOYYYYOO....",
      ".KNNNKOOOKNNNK..",
      "KNNnNNKKKNNnNNK.",
      ".KnnKnnnnnKnnK..",
      "..KK.KKKKK.KK...",
    ],
  ],
  // Jääpuikko (8 x 16)
  jaapuikko: [[
    "KKKKKKKK",
    "KCWCCCcK",
    "KCWCCCcK",
    "KCWCCccK",
    ".KCWCcK.",
    ".KCWCcK.",
    ".KCWCcK.",
    ".KCCCcK.",
    "..KCcK..",
    "..KCcK..",
    "..KCcK..",
    "..KCcK..",
    "...KcK..",
    "...KcK..",
    "...KK...",
    "....K...",
  ]],
  // Lumipallo (8 x 8)
  lumipallo: [[
    "..KKKK..",
    ".KWWWWK.",
    "KWWWWWwK",
    "KWWWWWwK",
    "KWWWWwwK",
    "KWWwwwsK",
    ".KwwssK.",
    "..KKKK..",
  ]],
};

const pakkaskuvat = {};
for (const nimi in PAKKASPIKSELIT) pakkaskuvat[nimi] = pikselikuva(PAKKASPIKSELIT[nimi]);

// ---------- LAATAT ----------
// Mistä laatoista taso tehdään? Jokaisella maailmalla on omat laattansa,
// ja yksittäinen taso voi olla jäätä (jaa: true).
function laatanNimi(t) {
  if (t && t.jaa) return "jaa";
  return kentta.laatat || "nurmi";
}

// ylin = true: tason ylin rivi (nurmi, lumi...), muuten sisus
function laattaKuva(ylin, t) {
  const nimi = laatanNimi(t);
  if (nimi === "jaa") return ylin ? pakkaskuvat.jaa : pakkaskuvat.jaasisus;
  if (nimi === "lumi") return ylin ? pakkaskuvat.lumi : pakkaskuvat.lumimaa;
  if (nimi === "kivi") return ylin ? tulikuvat.kivi : tulikuvat.kivimulta;
  return ylin ? kuvat.maa : kuvat.multa;
}

// ---------- KENTÄN VALMISTELU ----------
// Kutsutaan valmisteleKentta-funktiosta (peli.js)
function valmistelePakkanen(k) {
  // Hyinen vesi: x, y (veden pinta) ja leveys. Vesi ulottuu ruudun alareunaan asti.
  if (!k.vedet) k.vedet = [];
  for (const v of k.vedet) v.korkeus = 500 - v.y;

  // Jäälohko: x ja lattia (tai y), leveys ja korkeus (jos ei anneta: 40 x 40).
  // Lohko on kiinteä, kunnes siihen osuu tulipallo. Silloin se sulaa pois!
  if (!k.jaalohkot) k.jaalohkot = [];
  for (const l of k.jaalohkot) {
    if (!l.leveys) l.leveys = 40;
    if (!l.korkeus) l.korkeus = 40;
    if (l.lattia !== undefined) l.y = l.lattia - l.korkeus;
    l.jaalohko = true;
    l.jaa = true; // lohkon päällä on liukasta
    l.eiPiirreta = true; // lohko piirretään itse (läpikuultavana), ei laattoina
    l.eiKiintea = false;
    l.sulaminen = 0; // kun yli 0, lohko on sulamassa pois
    k.tasot.push(l);
  }

  // Nuotio: x ja lattia. Sen vieressä tulimittari täyttyy nopeasti.
  if (!k.nuotiot) k.nuotiot = [];
  for (const n of k.nuotiot) {
    n.leveys = 32;
    n.korkeus = 32;
    n.y = n.lattia - n.korkeus;
    n.lammittaa = false; // onko joku juuri nyt lämmittelemässä?
    n.sammunut = 0; // kun yli 0, nuotio on sammuksissa (Pakkasukon viima sammuttaa sen)
  }

  // Jääpuikko: x ja y (katto, josta puikko roikkuu).
  // uusiutuu: true = pudonneen tilalle kasvaa uusi puikko.
  if (!k.jaapuikot) k.jaapuikot = [];
  for (const p of k.jaapuikot) valmistelePuikko(p);

  // Tuuli: x ja leveys (missä tuulee) sekä voima (plus = oikealle, miinus = vasemmalle).
  // jakso = kuinka usein puuska tulee (0 = tuulee koko ajan), vaihe = milloin aloittaa.
  if (!k.tuulet) k.tuulet = [];
  for (const t of k.tuulet) {
    if (t.jakso === undefined) t.jakso = TUULEN_JAKSO;
    t.aika = t.vaihe || 0;
    t.tila = t.jakso === 0 ? "paalla" : "pois"; // "pois", "varoitus" tai "paalla"
  }

  k.lumipallot = []; // lentävät lumipallot (pakkasvihut.js ja pakkasukko.js heittävät niitä)
}

function valmistelePuikko(p) {
  p.leveys = 14;
  p.korkeus = 30;
  p.alkuY = p.y;
  p.tila = "roikkuu"; // "roikkuu", "tarisee", "putoaa", "kasvaa" tai "poissa"
  p.ajastin = 0;
  p.vy = 0;
}

// ---------- LIUKAS JÄÄ ----------
// Tavallisella maalla ukko lähtee liikkeelle ja pysähtyy heti. Jäällä vauhti
// muuttuu vähän kerrallaan: ukko kiihtyy hitaasti ja liukuu vielä pitkään.
// tavoite = vauhti, jota pelaaja haluaa (napeista). Palauttaa oikean vauhdin.
function liukuJaalla(pl, tavoite, dt) {
  if (!pl.jaalla) {
    pl.jaaVauhti = tavoite; // ei jäällä: vauhti muuttuu heti
    return tavoite;
  }
  const muutos = (tavoite === 0 ? JAAN_JARRUTUS : JAAN_KIIHTYVYYS) * dt;
  const ero = tavoite - pl.jaaVauhti;
  if (Math.abs(ero) <= muutos) pl.jaaVauhti = tavoite;
  else pl.jaaVauhti += Math.sign(ero) * muutos;

  // Jäähileitä lentää, kun ukko liukuu jarruttaen
  if (tavoite === 0 && Math.abs(pl.jaaVauhti) > 1.5 && Math.random() < 0.3 * dt) {
    lisaaHiukkasia(pl.x + pl.leveys / 2, pl.y + pl.korkeus, 1, ["white", "#c9f0ff"], 1);
  }
  return pl.jaaVauhti;
}

// ---------- TUULI ----------
// Työntää pelaajaa sivulle (dx pikseliä) ja pysäyttää sen seiniin
function tyonnaPelaajaa(dx) {
  pelaaja.x += dx;
  for (const t of kentta.kaikkiTasot) {
    if (t.eiKiintea || !osuu(pelaaja, t)) continue;
    if (dx > 0) pelaaja.x = t.x - pelaaja.leveys;
    else pelaaja.x = t.x + t.leveys;
  }
}

// ---------- PAKKANEN PUREE (vaikea taso) ----------

// Pureeko pakkanen tässä kentässä? (vain vaikealla ja vain lumikentissä)
function pakkanenPuree() {
  return vaikea && kentta.laatat === "lumi" && !kammiossa; // aarrekammiossa on lämmintä (aarteet.js)
}

// Ukon lämpö hupenee. Palauttaa true, jos ukko jäätyi ja menetti elämän.
function palele(pl, dt) {
  if (!kentta.pakkasVihje) {
    kentta.pakkasVihje = true;
    lisaaTeksti(pl.x + 10, pl.y - 30, "PAKKANEN PUREE! PYSY LÄMPIMÄNÄ!");
  }
  let purema = PAKKASEN_PUREMA;
  if (tuuliKohdassa(pl.x + pl.leveys / 2) !== 0) purema *= TUULEN_PUREMA;
  pl.tuli = Math.max(0, pl.tuli - purema * dt);

  if (pl.tuli > 0) {
    if (pl.kohmeessa && pl.tuli >= 10) pl.kohmeessa = false; // lämpeni taas
    return false;
  }
  if (!pl.kohmeessa) {
    pl.kohmeessa = true;
    pl.jaatyminen = 0;
    lisaaTeksti(pl.x + 10, pl.y - 12, "KOHMEESSA! ETSI NUOTIO!");
    aanet.kohme();
  }
  pl.jaatyminen += dt;
  if (pl.jaatyminen < JAATYMISEN_AIKA) return false;
  // Liian kauan kylmässä: ukko jäätyy
  lisaaHiukkasia(pl.x + 10, pl.y + 20, 20, ["white", "#c9f0ff", "#8fd3f0"], 5);
  lisaaTeksti(pl.x + 10, pl.y - 12, "JÄÄDYIT!");
  menetaElama();
  return true;
}

// Kohmeinen ukko on jääkuoren sisällä. Kuori paksunee, mitä kauemmin ukko palelee.
function piirraKohme(pl, aika) {
  const paksuus = 0.25 + 0.4 * Math.min(1, pl.jaatyminen / JAATYMISEN_AIKA);
  const hytina = Math.round(Math.sin(aika / 25)); // ukko hytisee
  ctx.fillStyle = "rgba(160, 220, 255, " + paksuus + ")";
  ctx.fillRect(pl.x - 3 + hytina, pl.y - 3, pl.leveys + 6, pl.korkeus + 3);
  ctx.strokeStyle = "rgba(255, 255, 255, " + (paksuus + 0.2) + ")";
  ctx.lineWidth = 2;
  ctx.strokeRect(pl.x - 3 + hytina, pl.y - 3, pl.leveys + 6, pl.korkeus + 3);
}

// Sammuttaa nuotion hetkeksi (Pakkasukon viima, pakkasukko.js)
function sammutaNuotio(n, aika) {
  if (n.sammunut <= 0) {
    lisaaTeksti(n.x + 16, n.y - 14, "NUOTIO SAMMUI!");
    lisaaHiukkasia(n.x + 16, n.y + 10, 12, ["#888", "#bbb", "white"], 3);
  }
  n.sammunut = aika;
  n.lammittaa = false;
}

function sytytaNuotio(n) {
  n.sammunut = 0;
  lisaaTeksti(n.x + 16, n.y - 14, "NUOTIO SYTTYI!");
  lisaaHiukkasia(n.x + 16, n.y + 10, 12, ["orange", "yellow", "#ff3c00"], 3);
  if (lahellaRuutua(n.x)) aanet.nuotio();
}

// Puhaltaako tuuli kohdassa x juuri nyt? Palauttaa tuulen voiman (0 = tyyntä).
function tuuliKohdassa(x) {
  for (const t of kentta.tuulet) {
    if (t.tila === "paalla" && x > t.x && x < t.x + t.leveys) return t.voima;
  }
  return 0;
}

// Kutsutaan pelaajan liikkumisesta (peli.js: paivitaPelaaja)
function tuuliTyontaa(dt) {
  if (kentta.tuulet.length === 0) return;
  const voima = tuuliKohdassa(pelaaja.x + pelaaja.leveys / 2);
  if (voima === 0) return;
  // Maassa ukko pitää kiinni jaloillaan, ilmassa tuuli vie kunnolla
  let teho = 1;
  if (pelaaja.maassa) teho = pelaaja.jaalla ? TUULI_JAALLA : TUULI_MAASSA;
  tyonnaPelaajaa(voima * teho * dt);
}

// ---------- JÄÄLOHKOT ----------
let vihjeAika = 0; // kun yli 0, vihjettä ei näytetä uudestaan

// Ukko törmäsi jäälohkoon: kerrotaan, miten siitä pääsee läpi
function jaalohkoVihje(l) {
  if (vihjeAika > 0) return;
  vihjeAika = 180;
  lisaaTeksti(l.x + l.leveys / 2, l.y - 12, "SULATA TULIPALLOLLA!");
}

// Tulipallo osui jäälohkoon: lohko sulaa pois
function sulataLohko(l) {
  l.eiKiintea = true; // lohkon läpi pääsee heti
  l.sulaminen = 24;
  const keskiX = l.x + l.leveys / 2;
  const keskiY = l.y + l.korkeus / 2;
  lisaaHiukkasia(keskiX, keskiY, 16, ["white", "#c9f0ff", "#8fd3f0"], 4);
  lisaaTeksti(keskiX, l.y - 8, "SULI!");
  aanet.sulaa();
}

// ---------- PÄIVITYS ----------
// Nuotiot, jääpuikot, lumipallot, tuuli ja vesi. Palauttaa true, jos peli loppui.
function paivitaPakkanen(dt) {
  // Nuotio lämmittää: tulimittari täyttyy
  for (const n of kentta.nuotiot) {
    if (n.sammunut > 0) {
      // Sammunut nuotio syttyy itsestään hetken päästä, tai heti tulipallosta
      n.sammunut -= dt;
      let sytytetaan = n.sammunut <= 0;
      for (const t of tulipallot) {
        if (t.elossa && osuu(t, n)) {
          t.elossa = false;
          sytytetaan = true;
        }
      }
      if (sytytetaan) sytytaNuotio(n);
      continue;
    }
    let jokuLahella = false;
    for (const pl of elavatPelaajat()) {
      const matka = Math.abs(pl.x + pl.leveys / 2 - (n.x + n.leveys / 2));
      const korkeusero = Math.abs(pl.y + pl.korkeus - n.lattia);
      if (matka > NUOTION_ETAISYYS || korkeusero > 50) continue;
      jokuLahella = true;
      if (pl.tuli >= TULI_MAX) continue;
      if (!n.lammittaa) {
        // Tultiin juuri nuotiolle
        lisaaTeksti(n.x + 16, n.y - 14, "LÄMMIN!");
        aanet.nuotio();
      }
      pl.tuli = Math.min(TULI_MAX, pl.tuli + NUOTION_LAMPO * dt);
      if (Math.random() < 0.3 * dt) lisaaHiukkasia(pl.x + 10, pl.y + 10, 1, ["orange", "yellow"], 2);
    }
    n.lammittaa = jokuLahella;
  }

  // Sulavat jäälohkot
  if (vihjeAika > 0) vihjeAika -= dt;
  for (const l of kentta.jaalohkot) {
    if (l.sulaminen > 0) l.sulaminen -= dt;
  }

  paivitaPuikot(dt);
  paivitaLumipallot(dt);

  // Tuulenpuuskat tulevat ja menevät
  for (const t of kentta.tuulet) {
    if (t.jakso === 0) continue; // tuulee koko ajan
    t.aika += dt;
    const kohta = t.aika % t.jakso;
    const ennen = t.tila;
    if (kohta < t.jakso * 0.45) t.tila = "pois";
    else if (kohta < t.jakso * 0.6) t.tila = "varoitus";
    else t.tila = "paalla";
    if (t.tila === "paalla" && ennen !== "paalla" && lahellaRuutua(t.x + t.leveys / 2)) aanet.tuuli();
  }

  // Osuuko jokin vaara pelaajiin?
  for (const pl of elavatPelaajat()) {
    pelaaja = pl;
    tarkistaPakkasVaarat();
    if (tila !== "peli") return true;
  }
  return false;
}

function paivitaPuikot(dt) {
  let poistettavia = false;
  for (const p of kentta.jaapuikot) {
    if (p.tila === "poissa") {
      poistettavia = true;
      continue;
    }
    p.ajastin -= dt;

    if (p.tila === "kasvaa") {
      if (p.ajastin <= 0) p.tila = "roikkuu";
      continue;
    }
    // Tulipallo sulattaa puikon
    for (const t of tulipallot) {
      if (t.elossa && osuu(t, p)) {
        t.elossa = false;
        pisteet += PISTEET_PUIKKO;
        lisaaTeksti(p.x + 7, p.y - 6, "+" + PISTEET_PUIKKO);
        lisaaHiukkasia(p.x + 7, p.y + 15, 10, ["white", "#c9f0ff", "#8fd3f0"], 3);
        aanet.sulaa();
        puikkoPois(p);
      }
    }
    if (p.tila === "roikkuu") {
      // Onko joku puikon alla?
      const alla = elavatPelaajat().some(
        (pl) => Math.abs(pl.x + pl.leveys / 2 - (p.x + p.leveys / 2)) < PUIKON_HAVAINTO && pl.y > p.y,
      );
      if (alla) {
        p.tila = "tarisee";
        p.ajastin = PUIKON_TARINA;
        if (lahellaRuutua(p.x)) aanet.puikkoVaroitus();
      }
    } else if (p.tila === "tarisee") {
      if (p.ajastin <= 0) {
        p.tila = "putoaa";
        p.vy = 0;
      }
    } else if (p.tila === "putoaa") {
      p.vy = Math.min(11, p.vy + 0.5 * dt);
      p.y += p.vy * dt;
      let osui = p.y > 470; // putosi ruudun alle (veteen tai kuoppaan)
      for (const t of kentta.kaikkiTasot) {
        if (!t.eiKiintea && osuu(p, t)) osui = true;
      }
      if (osui) {
        // Puikko hajoaa jääsiruiksi
        lisaaHiukkasia(p.x + 7, p.y + p.korkeus - 4, 10, ["white", "#c9f0ff", "#8fd3f0"], 3);
        if (lahellaRuutua(p.x)) aanet.puikkoRikki();
        puikkoPois(p);
      }
    }
  }
  if (poistettavia) kentta.jaapuikot = kentta.jaapuikot.filter((p) => p.tila !== "poissa");
}

// Puikko hajosi tai suli. Jos se uusiutuu, tilalle kasvaa uusi.
function puikkoPois(p) {
  if (p.uusiutuu) {
    p.tila = "kasvaa";
    p.ajastin = PUIKON_KASVU;
    p.y = p.alkuY;
    p.vy = 0;
  } else {
    p.tila = "poissa";
  }
}

// Heittää lumipallon. koko = pallon läpimitta pikseleinä.
// laji = "piikki", "kapy", "hiili" tai "jaa", jos se ei olekaan lumipallo (vaikea.js)
function heitaLumipallo(x, y, vx, vy, koko, laji) {
  kentta.lumipallot.push({ x: x, y: y, leveys: koko, korkeus: koko, vx: vx, vy: vy, elossa: true, laji: laji || "" });
}

// Minkä värisiä palasia ammuksesta lentää, kun se hajoaa?
function ammuksenVarit(l) {
  return l.laji ? AMMUSTEN_TIEDOT[l.laji].varit : ["white", "#cfe1f0"];
}

function paivitaLumipallot(dt) {
  if (kentta.lumipallot.length === 0) return;
  for (const l of kentta.lumipallot) {
    l.vy += LUMIPALLON_PAINO * dt;
    l.x += l.vx * dt;
    l.y += l.vy * dt;
    if (l.y > 480) l.elossa = false;
    let poksahti = false;
    for (const t of kentta.kaikkiTasot) {
      if (l.elossa && !t.eiKiintea && osuu(l, t)) poksahti = true;
    }
    // Tulipallo sulattaa lumipallon
    for (const t of tulipallot) {
      if (l.elossa && t.elossa && osuu(l, t)) {
        t.elossa = false;
        poksahti = true;
      }
    }
    if (poksahti) {
      l.elossa = false;
      lisaaHiukkasia(l.x + l.leveys / 2, l.y + l.korkeus / 2, 8, ammuksenVarit(l), 2.5);
    }
  }
  kentta.lumipallot = kentta.lumipallot.filter((l) => l.elossa);
}

// Vesi, putoavat jääpuikot ja lumipallot (pelaaja = se, jota käsitellään)
function tarkistaPakkasVaarat() {
  // Hyinen vesi vie elämän aina, vaikka ukko olisi suojassa
  for (const v of kentta.vedet) {
    const pinta = { x: v.x, y: v.y + 8, leveys: v.leveys, korkeus: v.korkeus };
    if (osuu(pelaaja, pinta)) {
      lisaaHiukkasia(pelaaja.x + 10, v.y, 20, ["white", "#8fd3f0", "#4f9ed0"], 5);
      lisaaTeksti(pelaaja.x + 10, v.y - 20, "HYRR!");
      aanet.loiskis();
      menetaElama();
      return;
    }
  }
  if (pelaaja.suojaAika > 0) return;

  for (const p of kentta.jaapuikot) {
    if (p.tila === "putoaa" && osuu(pelaaja, p)) {
      lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "AUTS!");
      puikkoPois(p);
      menetaElama();
      return;
    }
  }
  for (const l of kentta.lumipallot) {
    if (osuu(pelaaja, l)) {
      l.elossa = false;
      lisaaHiukkasia(l.x + l.leveys / 2, l.y + l.korkeus / 2, 8, ammuksenVarit(l), 2.5);
      lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, l.laji ? AMMUSTEN_TIEDOT[l.laji].teksti : "LUMIPALLO!");
      menetaElama();
      return;
    }
  }
}

// ---------- PIIRTÄMINEN ----------

let vesiLiuku = null; // veden liukuväri, 1 pikselin levyinen kuva

// Vesi piirretään ennen tasoja, jotta tasot näyttävät olevan veden päällä
function piirraVedet(aika) {
  if (kentta.vedet.length === 0) return;
  if (!vesiLiuku) {
    vesiLiuku = document.createElement("canvas");
    vesiLiuku.width = 1;
    vesiLiuku.height = 64;
    const c = vesiLiuku.getContext("2d");
    const liuku = c.createLinearGradient(0, 0, 0, 64);
    liuku.addColorStop(0, "#4aa3d8");
    liuku.addColorStop(1, "#143a66");
    c.fillStyle = liuku;
    c.fillRect(0, 0, 1, 64);
  }
  for (const v of kentta.vedet) {
    // Piirretään vain ruudulla näkyvä osa (16 pikselin tasavälein, etteivät aallot nyi)
    const alku = Math.max(v.x, Math.floor((kameraX - 16) / 16) * 16);
    const loppu = Math.min(v.x + v.leveys, kameraX + canvas.width + 16);
    if (loppu <= alku) continue;

    // Syvä vesi: valmis liukuväri venytetään oikean kokoiseksi (nopeaa)
    ctx.drawImage(vesiLiuku, alku, v.y + 5, loppu - alku, canvas.height - v.y);

    // Aaltoileva pinta: vaalea kaistale ja vaahtoviivat
    ctx.fillStyle = "#4aa3d8";
    ctx.beginPath();
    ctx.moveTo(alku, v.y + 6);
    for (let x = alku; x <= loppu + 15; x += 16) {
      const kohta = Math.min(x, loppu);
      ctx.lineTo(kohta, v.y + vedenAalto(kohta, aika));
    }
    ctx.lineTo(loppu, v.y + 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e8f8ff";
    for (let x = alku; x < loppu - 8; x += 16) {
      ctx.fillRect(x + 3, Math.round(v.y + vedenAalto(x + 8, aika)) - 1, 9, 2);
    }

    // Pieniä jäälauttoja kelluu vedessä (vain koristeita)
    for (let i = 0; i < v.leveys / 110; i++) {
      const jx = v.x + ((i * 173 + 50) % Math.max(1, v.leveys - 20));
      if (jx < alku || jx > loppu - 16) continue;
      const jy = Math.round(v.y + vedenAalto(jx, aika));
      ctx.fillStyle = "white";
      ctx.fillRect(jx, jy - 2, 14, 4);
      ctx.fillStyle = "#8fd3f0";
      ctx.fillRect(jx + 1, jy + 2, 12, 2);
    }
  }
}

function vedenAalto(x, aika) {
  return Math.sin(x / 34 + aika / 500) * 2.5 + Math.sin(x / 15 - aika / 330) * 1.2;
}

// Jäälautta: liikkuva taso, joka on jäätä (liikkuvatTasot, jaa: true)
function piirraJaalautta(t) {
  const x = Math.round(t.x);
  const y = Math.round(t.y);
  ctx.fillStyle = "#8fd3f0";
  ctx.fillRect(x, y, t.leveys, t.korkeus);
  ctx.fillStyle = "white"; // lunta päällä
  ctx.fillRect(x, y, t.leveys, 6);
  ctx.fillStyle = "#4f9ed0"; // tumma alareuna
  ctx.fillRect(x, y + t.korkeus - 5, t.leveys, 5);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, t.leveys - 2, t.korkeus - 2);
}

// Ohut jää: putoava taso lumimaailmassa. Kun sen päälle astuu, se halkeaa ja putoaa.
function piirraOhutJaa(t, x, y) {
  ctx.fillStyle = "#c9f0ff";
  ctx.fillRect(x, y, t.leveys, t.korkeus);
  ctx.fillStyle = "white";
  ctx.fillRect(x, y + 2, t.leveys, 3);
  // Halkeamat
  ctx.strokeStyle = "#4f9ed0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + t.leveys * 0.3, y);
  ctx.lineTo(x + t.leveys * 0.4, y + 10);
  ctx.lineTo(x + t.leveys * 0.33, y + t.korkeus);
  ctx.moveTo(x + t.leveys * 0.7, y);
  ctx.lineTo(x + t.leveys * 0.62, y + 12);
  ctx.stroke();
  ctx.strokeStyle = "black";
  ctx.strokeRect(x + 1, y + 1, t.leveys - 2, t.korkeus - 2);
}

// Jäälohkot, nuotiot, jääpuikot ja tuulipussit. Piirretään kolikoiden jälkeen,
// jotta jäälohkon sisällä oleva kolikko näkyy jään läpi.
function piirraPakkanen(aika) {
  for (const l of kentta.jaalohkot) {
    if (!naytolla(l.x, l.leveys)) continue;
    if (l.eiKiintea && l.sulaminen <= 0) continue; // sulanut kokonaan
    let y = l.y;
    let korkeus = l.korkeus;
    if (l.eiKiintea) {
      // Sulava lohko painuu kasaan ja haalenee
      korkeus = l.korkeus * (l.sulaminen / 24);
      y = l.y + l.korkeus - korkeus;
      ctx.globalAlpha = Math.max(0, l.sulaminen / 24);
    }
    ctx.fillStyle = "rgba(150, 215, 250, 0.6)"; // läpikuultava jää
    ctx.fillRect(l.x, y, l.leveys, korkeus);
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // kiilto
    ctx.fillRect(l.x + 5, y + 4, 4, Math.max(0, korkeus * 0.5 - 4));
    ctx.fillRect(l.x + 11, y + 4, 2, Math.max(0, korkeus * 0.3 - 4));
    ctx.strokeStyle = "#1d4f7a";
    ctx.lineWidth = 2;
    ctx.strokeRect(l.x + 1, y + 1, l.leveys - 2, Math.max(0, korkeus - 2));
    ctx.globalAlpha = 1;
  }

  const liekki = Math.floor(aika / 140) % 2;
  for (const n of kentta.nuotiot) {
    if (!naytolla(n.x, n.leveys)) continue;
    if (n.sammunut > 0) {
      // Sammunut nuotio: pelkät puut (kuvan alaosa) ja vähän savua
      ctx.drawImage(pakkaskuvat.nuotio, 0, 12, 16, 4, n.x, n.y + 24, 32, 8);
      if (Math.random() < 0.1) lisaaHiukkasia(n.x + 16, n.y + 22, 1, ["#888", "#aaa"], 1);
      continue;
    }
    hehku(n.x + 16, n.y + 14, n.lammittaa ? 70 : 55, "255, 150, 40", 0.45 + Math.sin(aika / 90) * 0.08);
    piirraRuutu(pakkaskuvat.nuotio, liekki, 16, 16, n.x, n.y, false);
  }

  for (const p of kentta.jaapuikot) {
    if (p.tila === "poissa" || !naytolla(p.x, p.leveys)) continue;
    let x = p.x - 1;
    if (p.tila === "tarisee") x += Math.round(Math.sin(aika / 14) * 2); // tärisee ennen putoamista
    if (p.tila === "kasvaa") {
      // Uusi puikko kasvaa pikkuhiljaa täyteen mittaan
      const koko = Math.max(0.1, 1 - p.ajastin / PUIKON_KASVU);
      ctx.drawImage(pakkaskuvat.jaapuikko, 0, 0, 8, 16, x + 8 * (1 - koko), p.y, 16 * koko, 32 * koko);
    } else {
      ctx.drawImage(pakkaskuvat.jaapuikko, 0, 0, 8, 16, x, Math.round(p.y), 16, 32);
    }
  }

  for (const t of kentta.tuulet) {
    if (t.merkki === false) continue;
    // Tuulipussi alueen alussa (tai kohdassa merkkiX) näyttää, tuuleeko
    const mx = t.merkkiX !== undefined ? t.merkkiX : t.x + (t.voima > 0 ? 10 : t.leveys - 10);
    const lattia = t.merkkiLattia || 410;
    if (naytolla(mx, 40)) piirraTuulipussi(mx, lattia, t, aika);
  }
}

// Tuulipussi: tyynellä roikkuu, varoituksella nytkähtelee ja puuskassa on suorana
function piirraTuulipussi(x, lattia, t, aika) {
  const huippu = lattia - 70;
  ctx.fillStyle = "#5a3716"; // tolppa
  ctx.fillRect(x - 2, huippu, 4, 70);
  const suunta = t.voima > 0 ? 1 : -1;
  // nousu: 0 = roikkuu alas, 1 = vaakasuorassa
  let nousu = 0;
  if (t.tila === "varoitus") nousu = 0.35 + Math.sin(aika / 60) * 0.25;
  if (t.tila === "paalla") nousu = 0.95 + Math.sin(aika / 45) * 0.05;
  for (let i = 0; i < 4; i++) {
    // Pussi on neljä palaa: punainen, valkoinen, punainen, valkoinen
    const matka = 4 + i * 8;
    const px = x + suunta * matka * nousu;
    const py = huippu + 4 + matka * (1 - nousu);
    ctx.fillStyle = i % 2 === 0 ? "#e63946" : "white";
    ctx.fillRect(Math.round(suunta > 0 ? px : px - 8), Math.round(py), 8, 9 - i);
  }
  ctx.fillStyle = "black";
  ctx.fillRect(x - 3, huippu - 2, 6, 3);
}

// Lumipallot ja tuulen viirut piirretään ukon päälle
function piirraPakkanenEtuala(aika) {
  for (const l of kentta.lumipallot) {
    if (l.laji) {
      piirraAmmus(l); // piikit, kävyt, hiilet ja jääpalat (vaikea.js)
      continue;
    }
    ctx.drawImage(pakkaskuvat.lumipallo, 0, 0, 8, 8, Math.round(l.x) - 1, Math.round(l.y) - 1, l.leveys + 2, l.korkeus + 2);
  }

  // Tuulen viirut: valkoisia viivoja, jotka lentävät tuulen mukana.
  // Viirujen paikat lasketaan kellosta, joten niitä ei tarvitse muistaa.
  for (const t of kentta.tuulet) {
    if (t.tila === "pois" || !naytolla(t.x, t.leveys, 0)) continue;
    const puuska = t.tila === "paalla";
    ctx.fillStyle = puuska ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.35)";
    const maara = Math.min(14, Math.ceil(t.leveys / 45));
    const nopeus = (puuska ? 0.5 : 0.12) * Math.abs(t.voima);
    for (let i = 0; i < maara; i++) {
      if (kevytTila && i % 2 === 1) continue;
      let kohta = (i * 97.3 + aika * nopeus) % t.leveys;
      if (t.voima < 0) kohta = t.leveys - kohta;
      const y = 60 + ((i * 59) % 330);
      ctx.fillRect(Math.round(t.x + kohta), y, puuska ? 26 : 10, 2);
    }
  }
}

// Valot pimeissä kentissä (tehosteet.js kutsuu tätä)
function pakkasValot(valo) {
  for (const n of kentta.nuotiot) {
    if (n.sammunut <= 0) valo(n.x + 16, n.y + 10, n.lammittaa ? 170 : 150);
  }
  for (const l of kentta.jaalohkot) {
    if (!l.eiKiintea) valo(l.x + l.leveys / 2, l.y + l.korkeus / 2, 45); // jää kimmeltää vähän
  }
  for (const p of kentta.jaapuikot) {
    if (p.tila !== "poissa" && p.tila !== "kasvaa") valo(p.x + 7, p.y + 15, 30);
  }
  pakkasvihujenValot(valo); // pakkasvihut.js
  pakkasukonValot(valo); // pakkasukko.js
}

// ---------- REVONTULET ----------
// Vihreät verhot yötaivaalla. Verho piirretään kerran pieneksi kuvaksi, ja
// ruudulle se piirretään suurennettuna. Verho liukuu hitaasti ja hengittää.
let revontuliKuva = null;
const REVONTULEN_LEVEYS = 240; // pieni kuva, joka piirretään 2 kertaa isompana

function piirraRevontulet(aika) {
  if (!onSaata("revontulet")) return;
  if (!revontuliKuva) {
    const L = REVONTULEN_LEVEYS;
    revontuliKuva = document.createElement("canvas");
    revontuliKuva.width = L;
    revontuliKuva.height = 110;
    const c = revontuliKuva.getContext("2d");
    const kierros = (Math.PI * 2) / L; // aallot menevät tasan kuvan leveydelle, joten kuvan voi toistaa
    for (let x = 0; x < L; x += 2) {
      // Jokainen pystyraita on eri pituinen ja eri kirkas: siitä tulee verhon laskokset
      const ala = 78 + Math.sin(x * kierros * 2) * 18 + Math.sin(x * kierros * 7) * 6;
      const pituus = 50 + Math.sin(x * kierros * 3 + 1) * 16;
      const kirkkaus = 0.3 + 0.3 * Math.pow(Math.sin(x * kierros * 5), 2);
      const liuku = c.createLinearGradient(0, ala - pituus, 0, ala);
      liuku.addColorStop(0, "rgba(170, 90, 255, 0)");
      liuku.addColorStop(0.5, "rgba(90, 240, 190, " + kirkkaus * 0.5 + ")");
      liuku.addColorStop(1, "rgba(130, 255, 150, " + kirkkaus + ")");
      c.fillStyle = liuku;
      c.fillRect(x, ala - pituus, 2, pituus);
    }
  }
  const leveys = REVONTULEN_LEVEYS * 2;
  let siirto = (aika / 90 + kameraX * 0.04) % leveys;
  if (siirto < 0) siirto += leveys;
  ctx.globalAlpha = 0.75 + Math.sin(aika / 1300) * 0.25; // hengittää
  for (let x = -siirto; x < canvas.width; x += leveys) {
    ctx.drawImage(revontuliKuva, Math.round(x), 10, leveys, 220);
  }
  ctx.globalAlpha = 1;
}

// ---------- KARTTA ----------
// Pakkassaaren koristeet maailmankartalla (kartta.js kutsuu näitä)

// Jäätyneet lammet
function piirraJaalammet() {
  const lammet = [
    [185, 285, 46, 17],
    [500, 330, 54, 17],
    [410, 150, 42, 14],
  ];
  for (const [x, y, leveys, korkeus] of lammet) {
    ctx.fillStyle = "#a8dcf5";
    ctx.strokeStyle = "#5fa6d6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, leveys, korkeus, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "white"; // kiilto
    ctx.fillRect(x - leveys * 0.5, y - 4, leveys * 0.4, 3);
    ctx.fillRect(x + 4, y + 3, leveys * 0.3, 2);
  }
}

// Luminen kuusi
function piirraLumikuusi(x, y) {
  ctx.fillStyle = "#5a3716"; // runko
  ctx.fillRect(x - 3, y + 4, 6, 10);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  // Kolme kerrosta oksia, alhaalta ylös
  for (let i = 0; i < 3; i++) {
    const leveys = 16 - i * 4;
    const pohja = y + 6 - i * 10;
    ctx.fillStyle = "#2f6b5a";
    ctx.beginPath();
    ctx.moveTo(x - leveys, pohja);
    ctx.lineTo(x, pohja - 16);
    ctx.lineTo(x + leveys, pohja);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Lunta oksilla
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x - leveys * 0.5, pohja - 8);
    ctx.lineTo(x, pohja - 15);
    ctx.lineTo(x + leveys * 0.5, pohja - 8);
    ctx.closePath();
    ctx.fill();
  }
}
