// ==========================================
//   PARAS AIKA JA VARJO
//   Peli muistaa jokaisen kentän parhaan ajan. Kun pelaat kentän uudestaan,
//   rinnallasi juoksee VARJO: se kulkee täsmälleen niin kuin sinä kuljit
//   parhaalla kerrallasi. Ehditkö maaliin ennen omaa varjoasi?
//   - Reitti nauhoitetaan: ukon paikka otetaan muistiin 10 kertaa sekunnissa.
//   - Normaalilla ja vaikealla on omat aikansa, koska kentät ovat erilaiset.
//   - Varjon saa pois taukovalikosta (Esc): "Varjo päällä / pois".
// ==========================================

const VARJOJEN_NIMI = "ukonSeikkailuVarjot"; // tällä nimellä ajat ja reitit ovat selaimen muistissa
const VARJON_VALI = 0.1; // kuinka usein paikka nauhoitetaan (sekunteja)
const VARJON_PISIN = 3000; // pisin nauhoitus (3000 paikkaa = 5 minuuttia)
const VARJON_NAKYVYYS = 0.4; // kuinka selvästi varjo näkyy (0 = ei ollenkaan, 1 = kokonaan)

// parhaat[avain] = { aika: sekunteja, reitti: pakattu teksti }. Avain on esim. "n3" tai "v3":
// n = normaali, v = vaikea, numero = kentän numero (0 = ensimmäinen).
let parhaat = lataaVarjot();
let varjoPaalla = lataaVarjoAsetus();
let nauhoitus = []; // tämän yrityksen reitti: x, y, x, y, ...
let varjo = null; // parhaan ajon reitti samassa muodossa (null = ei vielä parasta aikaa)
let varjonSuunta = 1; // mihin suuntaan varjo katsoo

function lataaVarjot() {
  try {
    const tiedot = JSON.parse(localStorage.getItem(VARJOJEN_NIMI) || "{}");
    return tiedot && typeof tiedot === "object" ? tiedot : {};
  } catch (virhe) {
    return {}; // muisti ei ole käytössä tai tiedot ovat rikki
  }
}

function tallennaVarjot() {
  try {
    localStorage.setItem(VARJOJEN_NIMI, JSON.stringify(parhaat));
  } catch (virhe) {
    // ei haittaa, ajat vain eivät tallennu
  }
}

function lataaVarjoAsetus() {
  try {
    return localStorage.getItem("ukonSeikkailuVarjo") !== "pois";
  } catch (virhe) {
    return true;
  }
}

function vaihdaVarjo() {
  varjoPaalla = !varjoPaalla;
  try {
    localStorage.setItem("ukonSeikkailuVarjo", varjoPaalla ? "paalla" : "pois");
  } catch (virhe) {
    // ei haittaa, valinta vain ei tallennu
  }
}

function varjonAvain(numero) {
  return (vaikea ? "v" : "n") + numero;
}

// Kentän paras aika sekunteina (tai 0, jos kenttää ei ole vielä läpäisty tällä vaikeudella)
function parasAika(numero) {
  const paras = parhaat[varjonAvain(numero)];
  return paras ? paras.aika : 0;
}

// Aika kymmenesosan tarkkuudella, esim. 83.4 -> "1:23.4" (parhaissa ajoissa pienikin ero ratkaisee)
function muotoileTarkkaAika(sekunnit) {
  const kymmenykset = Math.round(sekunnit * 10);
  const min = Math.floor(kymmenykset / 600);
  const sek = Math.floor((kymmenykset % 600) / 10);
  return min + ":" + (sek < 10 ? "0" + sek : sek) + "." + (kymmenykset % 10);
}

// ---------- REITIN PAKKAUS ----------
// Jokainen paikka on viisi merkkiä: x kolmella ja y kahdella merkillä (36-järjestelmä, kuten omatkentat.js).

function pakkaaReitti(reitti) {
  let teksti = "";
  for (let i = 0; i < reitti.length; i += 2) {
    const x = Math.max(0, Math.min(46000, Math.round(reitti[i])));
    const y = Math.max(0, Math.min(1200, Math.round(reitti[i + 1]) + 300)); // +300, ettei luku ole miinuksella
    teksti += x.toString(36).padStart(3, "0") + y.toString(36).padStart(2, "0");
  }
  return teksti;
}

function puraReitti(teksti) {
  const reitti = [];
  for (let i = 0; i + 5 <= teksti.length; i += 5) {
    reitti.push(parseInt(teksti.slice(i, i + 3), 36), parseInt(teksti.slice(i + 3, i + 5), 36) - 300);
  }
  return reitti;
}

// ---------- NAUHOITUS ----------

// Kentän alussa (peli.js: aloitaKentta): uusi nauhoitus alkaa ja vanha paras reitti haetaan varjoksi
function aloitaVarjo() {
  nauhoitus = [];
  varjo = null;
  varjonSuunta = 1;
  if (omaPeli) return; // omissa kentissä ei ole varjoa
  const paras = parhaat[varjonAvain(kenttaNumero)];
  if (paras && paras.reitti) varjo = puraReitti(paras.reitti);
}

// Kutsutaan joka hetki pelin aikana (peli.js: paivita)
function nauhoitaVarjo() {
  if (omaPeli) return;
  const p = elavatPelaajat()[0] || pelaaja1;
  // Paikkoja otetaan talteen niin monta, kuin kellon mukaan kuuluu olla
  while (nauhoitus.length / 2 <= kentanAika / VARJON_VALI && nauhoitus.length / 2 < VARJON_PISIN) {
    // Aarrekammiossa (aarteet.js) varjo on piilossa: paikaksi merkitään salakuopan pohja
    if (kammiossa) nauhoitus.push(kentta.salakuoppa.x, 900);
    else nauhoitus.push(p.x, p.y);
  }
}

// Maalissa (peli.js: laskeKentanTulos): oliko tämä uusi paras aika?
// Palauttaa { paras: paras aika, uusi: true, jos se tehtiin juuri nyt }.
function tallennaParasAika() {
  const avain = varjonAvain(kenttaNumero);
  const vanha = parhaat[avain];
  if (vanha && vanha.aika <= kentanAika) return { paras: vanha.aika, uusi: false };
  parhaat[avain] = { aika: Math.round(kentanAika * 10) / 10, reitti: pakkaaReitti(nauhoitus) };
  tallennaVarjot();
  return { paras: parhaat[avain].aika, uusi: true };
}

// ---------- PIIRTÄMINEN ----------

// Varjo on tumma, läpinäkyvä ukko. Se piirretään ennen oikeaa ukkoa (peli.js: piirraMaailma).
function piirraVarjo(aika) {
  if (!varjo || !varjoPaalla || varjo.length < 4) return;
  if (tila !== "peli" && tila !== "tauko") return;

  // Missä kohtaa reittiä ollaan? Kahden nauhoitetun paikan väliltä lasketaan tarkka kohta.
  const kohta = Math.min(kentanAika / VARJON_VALI, varjo.length / 2 - 1);
  const i = Math.min(Math.floor(kohta), varjo.length / 2 - 2);
  const osa = kohta - i;
  const x1 = varjo[i * 2];
  const y1 = varjo[i * 2 + 1];
  const x2 = varjo[i * 2 + 2];
  const y2 = varjo[i * 2 + 3];
  // Iso loikka = ukko syntyi uudestaan: silloin varjokin hyppää suoraan eikä liu'u
  const loikka = Math.abs(x2 - x1) > 120 || Math.abs(y2 - y1) > 120;
  const x = loikka ? x1 : x1 + (x2 - x1) * osa;
  const y = loikka ? y1 : y1 + (y2 - y1) * osa;
  if (x2 > x1 + 0.5) varjonSuunta = 1;
  if (x2 < x1 - 0.5) varjonSuunta = -1;
  if (!naytolla(x, 20)) return;

  // Sama ruudun valinta ja kuvan kohdistus kuin oikealla ukolla (peli.js: piirraPelaaja)
  const liikkuu = Math.abs(x2 - x1) > 0.5;
  const ilmassa = Math.abs(y2 - y1) > 1.5;
  const ruutu = ilmassa ? 1 : liikkuu ? Math.floor(aika / 150) % 2 : 0;
  const peilaa = varjonSuunta === 1;
  const kuvaX = x - (peilaa ? 12 : 10) * ZOOM;
  const kuvaY = y + 40 - [26, 30][ruutu] * ZOOM;
  const perilla = kohta >= varjo.length / 2 - 1; // varjo on jo maalissa: se haalenee
  ctx.globalAlpha = perilla ? VARJON_NAKYVYYS * 0.5 : VARJON_NAKYVYYS;
  piirraRuutu(suodatettu(kuvat.ukko, "brightness(0.2)"), ruutu, 32, 32, kuvaX, kuvaY, peilaa);
  ctx.globalAlpha = 1;
}
