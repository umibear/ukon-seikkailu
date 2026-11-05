// ==========================================
//   SÄÄDÄ NÄITÄ! Kokeile muuttaa numeroita.
// ==========================================
const PELIN_NIMI = "Ukon seikkailu"; // Keksi pelille oma nimi!
const PAINOVOIMA = 1; // Kuinka nopeasti pelaaja putoaa
const HYPPYVOIMA = 16; // Kuinka korkealle pelaaja hyppää
const NOPEUS = 4; // Kuinka nopeasti pelaaja juoksee
const MAX_PUTOAMIS = 12; // Suurin putoamisnopeus
const ZOOM = 2; // Kuinka monta kertaa isompina kuvat piirretään
const TULIPALLON_NOPEUS = 8; // Kuinka nopeasti tulipallo lentää
const TULIPALLOJA_MAX = 2; // Montako tulipalloa voi olla ilmassa yhtä aikaa
const TULIPALLON_KANTAMA = 200; // Kuinka pitkälle tulipallo lentää ennen kuin se sammuu (pikseleitä)

// Tulimittari: jokainen tulipallo kuluttaa mittarista palan,
// ja mittari täyttyy hitaasti takaisin.
const TULI_MAX = 100; // täysi mittari
const TULI_HINTA = 35; // paljonko yksi tulipallo kuluttaa
const TULI_LATAUS = 0.05; // paljonko mittari täyttyy joka hetki (60 hetkeä = 1 sekunti)
const TULI_LITISTYKSESTA = TULI_HINTA; // paljonko mittari täyttyy, kun hyppää vihun päälle (TULI_HINTA = yksi tulipallo)
const ELAMIA_ALUSSA = 3; // Montako elämää pelaajalla on
const JOUSEN_VOIMA = 22; // kuinka korkealle jousi pomppauttaa (HYPPYVOIMA on 16)
const PUTOAMIS_VAROITUS = 30; // kuinka kauan putoava taso tärisee ennen putoamista (60 = 1 s)
const LUOLAN_SEINA = 40; // salaisen luolan umpinaisen seinän paksuus
const LUOLAN_KATTO = 20; // salaisen luolan katon paksuus
const SEINAHYPYN_VOIMA = 14; // kuinka korkealle seinästä ponnistetaan
const SEINAPOTKU_AIKA = 14; // kuinka kauan ukko lentää seinästä poispäin (60 = 1 s)
const SEINALIUKU_NOPEUS = 2.5; // kuinka hitaasti ukko liukuu seinää alas
const TIPPUJAN_HAVAINTO = 80; // kuinka läheltä tippuja huomaa ukon (pikseleitä sivuttain)
const TIPPUJAN_TARINA = 15; // kuinka kauan tippuja tärisee ennen putoamista
const KAKSINPELIN_VALI = 700; // kuinka kauas pelaajat voivat mennä toisistaan (ruutu on 800 leveä)
const HAAMU_HERAA_ELAMIA = 1; // montako elämää haamu saa, kun se herää seuraavassa kentässä
const SUOJA_AIKA = 90; // Kuinka kauan ukko vilkkuu ja on suojassa (60 = 1 sekunti)
// Testitila: alkuvalikossa voi hypätä suoraan kenttään numeronäppäimillä.
// Se on päällä vain omalla koneella (index.html avattu tiedostona tai localhost),
// ei netissä. Jos haluat sen aina pois, vaihda tähän: const TESTITILA = false;
const TESTITILA =
  location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";

// Pisteet
const PISTEET_KOLIKKO = 100; // yhdestä kolikosta
const PISTEET_VIHU = 200; // kävelevän vihun tuhoamisesta
const PISTEET_LENTOVIHU = 300; // lentovihun tuhoamisesta
const PISTEET_PIIKKIS = 300; // piikkiksen tuhoamisesta (vain tulipallolla!)
const PISTEET_POMPPIJA = 250; // pomppijan tuhoamisesta
const PISTEET_TIPPUJA = 250; // tippujan (hämähäkin) tuhoamisesta
const PISTEET_RYOMIJA = 300; // seinäryömijän (gekon) tuhoamisesta
const PISTEET_SYDAN_TAYSI = 500; // sydämestä, jos elämät ovat jo täynnä
const AIKABONUS_SEKUNTI = 20; // jokaisesta sekunnista, jonka alitat tavoiteajan
const BONUS_KAIKKI_KOLIKOT = 1000; // kun keräät kentän kaikki kolikot
const BONUS_KAIKKI_VIHUT = 1000; // kun tuhoat kentän kaikki vihut
const PISTEET_POMO = 3000; // pomon voittamisesta

// Pomo (Isäukko)
const POMON_ELAMAT = 24; // montako osumaa Isäukko kestää
const VAHINKO_TULIPALLO = 1; // paljonko tulipallo vie pomolta elämää
const VAHINKO_LITISTYS = 2; // paljonko päälle hyppääminen vie pomolta elämää
const POMON_NOPEUS = 1.2; // kävelynopeus
const POMON_RYNTAYS = 5; // kuinka kovaa pomo ryntää

// Haetaan canvas, johon peli piirretään
const canvas = document.getElementById("peli");
// alpha: false = ruutu ei ole läpinäkyvä (peli piirtää aina koko ruudun),
// jolloin selaimen ei tarvitse sekoittaa sitä taustan kanssa. Nopeampaa kännykällä!
const ctx = canvas.getContext("2d", { alpha: false });

// Pikselitaide näyttää terävältä vain, kun pehmennys on pois päältä
ctx.imageSmoothingEnabled = false;

// ---------- KUVAT ----------
// Ladataan kuvat kuvat-kansiosta
function lataaKuva(tiedosto) {
  const kuva = new Image();
  kuva.src = "kuvat/" + tiedosto;
  return kuva;
}

const kuvat = {
  ukko: lataaKuva("ukko.png"), // 2 ruutua, kumpikin 32 x 32
  ukko2: lataaKuva("ukko2.png"), // pelaaja 2: sininen Ukko
  kolikko: lataaKuva("kolikko.png"), // 2 ruutua, kumpikin 32 x 32
  lippu: lataaKuva("lippu.png"), // 2 ruutua, kumpikin 16 x 32
  maa: lataaKuva("maa.png"), // 16 x 16 laatta, jossa on nurmea
  multa: lataaKuva("multa.png"), // 16 x 16 laatta, pelkkää multaa
  pilvi: lataaKuva("pilvi.png"), // 32 x 12
  vihu: lataaKuva("vihu.png"), // 2 ruutua, kumpikin 32 x 32
  lentovihu: lataaKuva("lentovihu.png"), // 2 ruutua, kumpikin 32 x 32
  tulipallo: lataaKuva("tulipallo.png"), // 6 ruutua: 0-1 oikealle, 3-4 vasemmalle
  piikkis: lataaKuva("piikkis.png"), // 2 ruutua 16 x 16, katsoo vasemmalle
  pomppija: lataaKuva("pomppija.png"), // 2 ruutua 16 x 16: 0 kyykyssä, 1 hypyssä
  tippuja: lataaKuva("tippuja.png"), // 2 ruutua 16 x 16: hämähäkki, jalat heiluvat
  ryomija: lataaKuva("ryomija.png"), // 2 ruutua 16 x 16: gekko, seinä vasemmalla
  jousi: lataaKuva("jousi.png"), // 2 ruutua 16 x 16: 0 auki, 1 kasassa
  isaukko: lataaKuva("isaukko.png"), // 9 ruutua 64 x 64: 0-5 parta heiluu, 6-7 kävely, 8 nukkuu
};

// ---------- PELAAJAT ----------
// Jokaisella pelaajalla on omat tiedot. Kaksinpelissä pelaajia on kaksi.
function luoPelaaja(numero) {
  return {
  numero: numero, // 1 = vihreä Ukko, 2 = sininen Ukko
  x: 40,
  y: 360,
  leveys: 20, // ukon vartalo on 10 pikseliä leveä, kerrottuna ZOOMilla
  korkeus: 40, // ukko on 20 pikseliä pitkä, kerrottuna ZOOMilla
  vx: 0, // vauhti sivuttain
  vy: 0, // vauhti pystysuunnassa
  maassa: false, // seisooko pelaaja jonkin päällä?
  suunta: 1, // 1 = katsoo oikealle, -1 = katsoo vasemmalle
  hyppaa: false, // onko pelaaja keskellä hyppyä, jonka voi katkaista?
  alusta: null, // liikkuva taso, jonka päällä pelaaja seisoo
  venytys: 0, // yli 0 = ukko venyy pitkäksi, alle 0 = litistyy (vain ulkonäköä)
  seina: 0, // koskeeko ukko seinään: -1 = vasemmalla, 1 = oikealla, 0 = ei
  potkuAika: 0, // kun yli 0, ukko lentää seinästä poispäin (seinähyppy)
  liukuu: false, // liukuuko ukko seinää alas?
  elamat: ELAMIA_ALUSSA,
  suojaAika: 0, // kun tämä on yli 0, vihut eivät voi satuttaa ukkoa
  tuli: TULI_MAX, // paljonko tulimittarissa on tulta
  tuliVilkkuu: 0, // kun yli 0, mittari vilkkuu punaisena (tuli loppui)
  hyppyNappiEnnen: false, // oliko hyppynappi pohjassa edellisellä hetkellä?
  haamu: false, // kaksinpelissä: kun elämät loppuvat, ukko on haamu kentän loppuun asti
  turvaX: 40, // viimeisin turvallinen paikka maassa.
  turvaY: 360, // Kaksinpelissä toinen pelaaja syntyy tänne.
  };
}
const pelaaja1 = luoPelaaja(1);
const pelaaja2 = luoPelaaja(2);
let kaksinpeli = false; // true = kaksi pelaajaa
let kosketusOhjaus = false; // true = pelataan kännykällä (kosketus.js laittaa päälle)

// Valitsee ohjetekstin sen mukaan, pelataanko näppäimistöllä vai kosketusnäytöllä
function ohje(nappaimisto, kosketus) {
  return kosketusOhjaus ? kosketus : nappaimisto;
}
let pelaajat = [pelaaja1]; // pelissä mukana olevat pelaajat
let pelaaja = pelaaja1; // pelaaja, jota juuri nyt käsitellään

// Kaksinpelissä toinen pelaaja (yksinpelissä null)
function toinenPelaaja(pl) {
  if (!kaksinpeli) return null;
  return pl === pelaaja1 ? pelaaja2 : pelaaja1;
}

// Pelaajat, jotka eivät ole haamuja
function elavatPelaajat() {
  return pelaajat.filter((pl) => !pl.haamu);
}

// ---------- PELIN TILA ----------
// tila kertoo, mitä pelissä on juuri nyt menossa:
//   "alku"         = aloitusruutu
//   "kartta"       = maailmankartta, josta valitaan kenttä (kartta.js)
//   "peli"         = pelataan
//   "kenttaValmis" = kenttä läpäisty, odotetaan välilyöntiä
//   "voitto"       = kaikki kentät läpäisty
//   "havio"        = elämät loppuivat
let tila = "alku";

let kenttaNumero = 0; // 0 = ensimmäinen kenttä
let kentta = null; // nykyisen kentän tiedot (tulevat kentat.js-tiedostosta)
let pisteet = 0; // pelaajan pisteet koko pelissä
let kentanKolikot = 0; // montako kolikkoa tästä kentästä on kerätty
let kentanVihut = 0; // montako vihua tästä kentästä on tuhottu
let kentanAika = 0; // kuinka monta sekuntia kentässä on oltu
let kaikkiKolikot = 0; // kaikista kentistä kerätyt kolikot yhteensä
let tulos = []; // kentän lopun pistelaskelman rivit
let ruutuAika = 0; // kuinka kauan nykyinen ruutu (esim. kenttä läpi) on näkynyt
let ennatys = lataaEnnatys(); // paras pistemäärä koskaan
let uusiEnnatys = false; // tehtiinkö tässä pelissä uusi ennätys?
let kameraX = 0; // mistä kohtaa kenttää ruudun vasen reuna alkaa
let tarina = 0; // kuinka paljon ruutu tärisee (0 = ei ollenkaan)
let kameraHyppaa = true; // true = kamera siirtyy heti ukon luo (ei liu'u)

let tulipallot = []; // lentävät tulipallot
let hiukkaset = []; // kipinät ja palaset
let tekstit = []; // leijuvat tekstit, kuten "+1"

// Lasketaan, montako kolikkoa kaikissa kentissä on yhteensä
let kolikoitaYhteensa = 0;
for (const teeKentta of KENTAT) {
  kolikoitaYhteensa += teeKentta().kolikot.length;
}

// ---------- PILVET ----------
const pilvet = [
  { x: 50, y: 40, nopeus: 0.3 },
  { x: 250, y: 100, nopeus: 0.15 },
  { x: 450, y: 60, nopeus: 0.25 },
  { x: 650, y: 30, nopeus: 0.4 },
  { x: 820, y: 110, nopeus: 0.2 },
];

// ---------- NÄPPÄIMET ----------
// Muistetaan mitkä napit ovat juuri nyt pohjassa
const napit = {};

// Kuka ohjaa millä napeilla? Yksinpelissä kaikki napit ohjaavat ukkoa.
const OHJAIMET = {
  yksin: {
    vasen: ["ArrowLeft", "KeyA"],
    oikea: ["ArrowRight", "KeyD"],
    hyppy: ["ArrowUp", "KeyW", "Space"],
    ammu: ["KeyX", "KeyF"],
  },
  // Kaksinpeli: pelaaja 1 = WASD + F, pelaaja 2 = nuolet + L tai Enter
  1: { vasen: ["KeyA"], oikea: ["KeyD"], hyppy: ["KeyW", "Space"], ammu: ["KeyF"] },
  2: { vasen: ["ArrowLeft"], oikea: ["ArrowRight"], hyppy: ["ArrowUp"], ammu: ["KeyL", "Enter"] },
};

function ohjaimet(pl) {
  return kaksinpeli ? OHJAIMET[pl.numero] : OHJAIMET.yksin;
}

// Onko pelaajan nappi (esim. "hyppy") pohjassa?
function painettu(pl, toiminto) {
  return ohjaimet(pl)[toiminto].some((koodi) => napit[koodi]);
}

addEventListener("keydown", (e) => {
  napit[e.code] = true;
  kaynnistaAanet(); // selain sallii äänet vasta napin painalluksen jälkeen

  // e.repeat on true, kun nappia pidetään pohjassa. Silloin näitä ei tehdä
  // uudestaan, eli nappia pitää painaa joka kerta erikseen.
  if (!e.repeat) {
    const tilaEnnen = tila; // muistetaan, ettei kentän aloitus Enterillä ammu heti
    const hyvaksy = e.code === "Space" || e.code === "Enter";

    // Valikoissa (alkuruutu ja tauko) liikutaan ↑ ↓ ja valitaan Enterillä tai välilyönnillä.
    // Kännykässä myös ◀ ▶ liikuttaa valintaa.
    if (tila === "alku" || tila === "tauko") {
      const ylos = ["ArrowUp", "KeyW"].includes(e.code);
      const alas = ["ArrowDown", "KeyS"].includes(e.code);
      const sivulle = ["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(e.code);
      const oikealle = e.code === "ArrowRight" || e.code === "KeyD";
      if (ylos) siirraValintaa(-1);
      else if (alas) siirraValintaa(1);
      else if (sivulle && valittuRivi().id === "pelaajat") valitseRivi("pelaajat");
      else if (sivulle && kosketusOhjaus) siirraValintaa(oikealle ? 1 : -1);
      else if (hyvaksy) valitseRivi(valittuRivi().id);
      else if (e.code === "Escape" && tila === "tauko") jatkaTauolta();
    } else if (tila === "ohjeet") {
      if (hyvaksy || e.code === "Escape") suljeOhjeet();
    } else if (hyvaksy) {
      if (tila === "kartta") valitseKartalta();
      else if (tila === "kenttaValmis") seuraavaKentta();
    }

    // Kartalla liikutaan nuolilla tai A ja D -napeilla
    if (tila === "kartta") {
      if (e.code === "ArrowRight" || e.code === "KeyD") liikuKartalla(1);
      if (e.code === "ArrowLeft" || e.code === "KeyA") liikuKartalla(-1);
    }

    // R: kesken kentän maailma alkaa alusta (painetaan kaksi kertaa),
    // häviön jälkeen maailma alkaa alusta ja voiton jälkeen koko peli
    if (e.code === "KeyR") {
      if (tila === "peli") {
        if (alustaVahvistus > 0) aloitaMaailmaAlusta();
        else {
          alustaVahvistus = ALUSTA_VAHVISTUS_AIKA; // varoitus näkyy hetken
          aanet.tyhja();
        }
      }
      if (tila === "havio") aloitaMaailmaAlusta();
      if (tila === "voitto") aloitaPeli();
    }
    // Esc: kesken kentän peli pysähtyy (taukovalikko), kartalta palataan alkuruutuun
    if (e.code === "Escape" && tilaEnnen === "peli") avaaTauko();
    if (e.code === "Escape" && tilaEnnen === "kartta") poistuPelista();

    // Testitila: numeronäppäin 1, 2, 3... hyppää suoraan siihen kenttään.
    // Shift + numero = maailman 2 kenttä (esim. Shift + 1 = kenttä 6)
    if (TESTITILA && tila === "alku" && e.code.startsWith("Digit")) {
      let numero = Number(e.code.replace("Digit", "")) - 1; // "Digit3" -> 2
      if (e.shiftKey) numero += MAAILMAT[1].alku;
      if (numero >= 0 && numero < KENTAT.length) {
        testiPeli = true; // testipeliä ei tallenneta
        aloitaPeli();
        avattu = KENTAT.length - 1; // testissä kaikki kentät ovat auki
        kartanKohta = numero;
        aloitaKentta(numero);
      }
    }
    // Tulipallo: jokainen pelaaja ampuu omalla napillaan
    if (tilaEnnen === "peli") {
      for (const pl of pelaajat) {
        if (ohjaimet(pl).ammu.includes(e.code)) ammu(pl);
      }
    }
    if (e.code === "KeyM") aanetPaalla = !aanetPaalla; // ! kääntää true <-> false
    if (e.code === "F3") vaihdaFps(); // FPS-mittari päälle / pois
  }

  // Estetään nuolinäppäimiä ja välilyöntiä vierittämästä sivua
  // (F3 avaisi muuten selaimen haun)
  if (e.code.startsWith("Arrow") || e.code === "Space" || e.code === "Enter" || e.code === "F3") e.preventDefault();
});

addEventListener("keyup", (e) => {
  napit[e.code] = false;
});

// ---------- APUFUNKTIOT ----------

// Palauttaa true, jos kaksi suorakulmiota menevät päällekkäin
function osuu(a, b) {
  return (
    a.x < b.x + b.leveys &&
    a.x + a.leveys > b.x &&
    a.y < b.y + b.korkeus &&
    a.y + a.korkeus > b.y
  );
}

// Aloittaa koko pelin alusta (ensimmäisestä kentästä)
function aloitaPeli() {
  nollaaPeli();
  avaaKartta();
}

// Nollaa kaiken: elämät, pisteet ja avatut kentät
function nollaaPeli() {
  pelaajat = kaksinpeli ? [pelaaja1, pelaaja2] : [pelaaja1];
  for (const pl of [pelaaja1, pelaaja2]) {
    pl.elamat = ELAMIA_ALUSSA;
    pl.haamu = false;
  }
  pisteet = 0;
  kaikkiKolikot = 0;
  uusiEnnatys = false;
  parhaatPisteet = [];
  parhaatKolikot = [];
  avattu = 0; // vain ensimmäinen kenttä on auki
  kartanKohta = 0;
  uusiKentta = -1;
}

// Kun elämät loppuvat: nykyinen maailma alkaa alusta, mutta
// aiemmat maailmat pysyvät läpäistyinä.
function aloitaMaailmaAlusta() {
  const numero = maailmanNumero(kenttaNumero);
  const m = MAAILMAT[numero];
  for (const pl of [pelaaja1, pelaaja2]) {
    pl.elamat = ELAMIA_ALUSSA;
    pl.haamu = false;
  }
  // Tämän maailman kenttien pisteet ja kolikot unohdetaan
  for (let i = m.alku; i <= m.loppu; i++) {
    delete parhaatPisteet[i];
    delete parhaatKolikot[i];
  }
  pisteet = summa(parhaatPisteet);
  kaikkiKolikot = summa(parhaatKolikot);
  uusiEnnatys = false;
  avattu = m.alku;
  kartanKohta = m.alku;
  uusiKentta = -1;
  avaaKartta();
  naytaKarttaViesti("Maailma " + (numero + 1) + " alkaa alusta!");
}

// Kun kenttä on läpäisty ja painetaan välilyöntiä
function seuraavaKentta() {
  if (kenttaNumero === KENTAT.length - 1) {
    // Viimeinen kenttä läpäisty: koko peli voitettu!
    tila = "voitto";
    ruutuAika = 0;
    tarkistaEnnatys();
    return;
  }

  // Jos tämä oli uusin avattu kenttä, seuraava kenttä aukeaa
  if (kenttaNumero === avattu) {
    avattu++;
    uusiKentta = avattu;
    if (maailmanNumero(avattu) !== maailmanNumero(kenttaNumero)) {
      naytaKarttaViesti(ohje("UUSI MAAILMA AUKI! Paina →", "UUSI MAAILMA AUKI! Paina ▶"));
    } else {
      naytaKarttaViesti("Uusi kenttä auki!");
    }
    aanet.valitallennus();
  }
  kartanKohta = kenttaNumero;
  avaaKartta();
}

// ---------- PISTEET JA ENNÄTYS ----------

// Muuttaa sekunnit muotoon minuutit:sekunnit, esim. 83 -> "1:23"
function muotoileAika(sekunnit) {
  const min = Math.floor(sekunnit / 60);
  const sek = Math.floor(sekunnit % 60);
  return min + ":" + (sek < 10 ? "0" + sek : sek);
}

// Lasketaan bonukset kentän lopussa ja tehdään pistelaskelma
function laskeKentanTulos() {
  // Laavapalloja ei voi tuhota, ja kipinät sammuvat itsestään, joten niitä ei lasketa
  const tuhottavat = kentta.viholliset.filter((v) => !v.eiLasketa);
  const vihujaYhteensa = tuhottavat.length + kentta.lentovihut.length;
  const kaikkiKolikotKeratty = kentanKolikot === kentta.kolikot.length;
  const kaikkiVihutTuhottu = kentanVihut === vihujaYhteensa;

  // Aikabonus: Math.max(0, ...) estää bonusta menemästä miinukselle
  const sekuntejaJai = Math.max(0, Math.round(kentta.tavoiteAika - kentanAika));
  const aikaBonus = sekuntejaJai * AIKABONUS_SEKUNTI;
  const kolikkoBonus = kaikkiKolikotKeratty ? BONUS_KAIKKI_KOLIKOT : 0;
  const vihuBonus = kaikkiVihutTuhottu ? BONUS_KAIKKI_VIHUT : 0;

  pisteet += aikaBonus + kolikkoBonus + vihuBonus;

  // Muistetaan kentän paras tulos. Kokonaispisteet = kenttien parhaat yhteensä.
  const kentanPisteet = pisteet - muidenKenttienPisteet(kenttaNumero);
  const vanhaParas = parhaatPisteet[kenttaNumero] || 0;
  parhaatPisteet[kenttaNumero] = Math.max(vanhaParas, kentanPisteet);
  parhaatKolikot[kenttaNumero] = Math.max(parhaatKolikot[kenttaNumero] || 0, kentanKolikot);
  pisteet = summa(parhaatPisteet);
  kaikkiKolikot = summa(parhaatKolikot);

  // Jokainen rivi on [teksti vasemmalla, teksti oikealla]
  tulos = [
    ["Kolikot", kentanKolikot + " / " + kentta.kolikot.length],
    ["Vihut", kentanVihut + " / " + vihujaYhteensa],
    [
      "Aika",
      muotoileAika(kentanAika) +
        "  (tavoite " +
        muotoileAika(kentta.tavoiteAika) +
        ")",
    ],
    ["Aikabonus", "+" + aikaBonus],
    ["Kaikki kolikot", kaikkiKolikotKeratty ? "+" + kolikkoBonus : "-"],
    ["Kaikki vihut", kaikkiVihutTuhottu ? "+" + vihuBonus : "-"],
    ["PISTEET", "" + pisteet],
  ];
}

// Ennätys tallennetaan selaimen muistiin (localStorage), joten se säilyy,
// vaikka selaimen sulkisi. try/catch estää pelin kaatumisen, jos
// selain ei salli muistiin tallentamista.
function lataaEnnatys() {
  try {
    return Number(localStorage.getItem("ukonSeikkailuEnnatys")) || 0;
  } catch (virhe) {
    return 0;
  }
}

// ---------- TALLENNUS ----------
// Pelin eteneminen (avatut kentät, pisteet ja elämät) tallennetaan
// selaimen muistiin aina, kun palataan kartalle.
const TALLENNUKSEN_NIMI = "ukonSeikkailuTallennus";
let tallennus = lataaTallennus(); // null = ei tallennettua peliä
let uusiVahvistus = false; // true = "Uusi peli" painettiin kerran, odotetaan vahvistusta
let testiPeli = false; // testitilassa aloitettua peliä ei tallenneta
const ALUSTA_VAHVISTUS_AIKA = 150; // kuinka kauan on aikaa painaa R toisen kerran (60 = 1 s)
let alustaVahvistus = 0; // kun yli 0, R:n toinen painallus aloittaa maailman alusta

function lataaTallennus() {
  try {
    const t = JSON.parse(localStorage.getItem(TALLENNUKSEN_NIMI));
    return t && typeof t.avattu === "number" ? t : null;
  } catch (virhe) {
    return null;
  }
}

function tallennaPeli() {
  if (testiPeli) return;
  tallennus = {
    avattu: avattu,
    kartanKohta: kartanKohta,
    parhaatPisteet: parhaatPisteet,
    parhaatKolikot: parhaatKolikot,
    elamat: [pelaaja1.elamat, pelaaja2.elamat],
  };
  try {
    localStorage.setItem(TALLENNUKSEN_NIMI, JSON.stringify(tallennus));
  } catch (virhe) {
    // ei haittaa, peli vain ei tallennu
  }
}

// Jatketaan tallennetusta pelistä
function jatkaPelia() {
  const t = tallennus;
  nollaaPeli();
  // JSON muuttaa tyhjät kohdat null-arvoiksi, joten ne muutetaan takaisin
  const korjaa = (lista) => (lista || []).map((x) => (x === null ? undefined : x));
  avattu = Math.min(t.avattu, KENTAT.length - 1);
  kartanKohta = Math.min(t.kartanKohta || 0, avattu);
  parhaatPisteet = korjaa(t.parhaatPisteet);
  parhaatKolikot = korjaa(t.parhaatKolikot);
  pisteet = summa(parhaatPisteet);
  kaikkiKolikot = summa(parhaatKolikot);
  const elamat = t.elamat || [];
  pelaaja1.elamat = Math.max(1, elamat[0] || ELAMIA_ALUSSA);
  pelaaja2.elamat = Math.max(1, elamat[1] || ELAMIA_ALUSSA);
  avaaKartta();
}

// ---------- VALIKOT ----------
// Alkuruudussa ja taukoruudussa on valikko. Jokaisella rivillä on
// tunnus (id), teksti ja ehkä lisäteksti oikeassa reunassa.
let valikonValinta = 0; // monesko rivi on valittuna (0 = ylin)

function valikonRivit() {
  if (tila === "tauko") {
    return [
      { id: "jatkaTaukoa", teksti: "Jatka peliä" },
      { id: "kartalle", teksti: "Palaa kartalle" },
      { id: "musiikki", teksti: "Musiikki", lisa: musiikkiPaalla ? "päällä" : "pois" },
      { id: "poistu", teksti: "Poistu pelistä" },
    ];
  }
  const rivit = [];
  if (tallennus) {
    const kohta = Math.min(tallennus.avattu, KENTAT.length - 1);
    const lisa = "maailma " + (maailmanNumero(kohta) + 1) + ", kenttä " + (kohta + 1);
    rivit.push({ id: "jatka", teksti: "Jatka peliä", lisa: lisa });
  }
  if (!tallennus) rivit.push({ id: "uusi", teksti: "Aloita peli" });
  else if (uusiVahvistus) rivit.push({ id: "uusi", teksti: "Varmasti?", lisa: "paina uudestaan", vari: "#ff8080" });
  else rivit.push({ id: "uusi", teksti: "Uusi peli" });
  // Kännykällä pelataan aina yksin
  if (!kosketusOhjaus) rivit.push({ id: "pelaajat", teksti: "Pelaajat", lisa: "◀  " + (kaksinpeli ? 2 : 1) + "  ▶" });
  rivit.push({ id: "ohjeet", teksti: "Ohjeet" });
  return rivit;
}

function valittuRivi() {
  const rivit = valikonRivit();
  valikonValinta = Math.max(0, Math.min(valikonValinta, rivit.length - 1));
  return rivit[valikonValinta];
}

// Siirtää valintaa ylös (-1) tai alas (1). Ylimmästä pääsee alimpaan ja toisin päin.
function siirraValintaa(suunta) {
  const maara = valikonRivit().length;
  asetaValinta((valikonValinta + suunta + maara) % maara);
  aanet.laskuri();
}

function asetaValinta(numero) {
  if (numero !== valikonValinta) uusiVahvistus = false; // vahvistus peruuntuu, kun valinta vaihtuu
  valikonValinta = numero;
}

// Tehdään se, mitä valitulla rivillä lukee
function valitseRivi(id) {
  if (id === "jatka") {
    testiPeli = false;
    jatkaPelia();
  } else if (id === "uusi") {
    if (tallennus && !uusiVahvistus) {
      uusiVahvistus = true; // pitää painaa vielä kerran, ettei tallennus häviä vahingossa
      aanet.tyhja();
      return;
    }
    uusiVahvistus = false;
    testiPeli = false;
    aloitaPeli(); // vanha tallennus korvautuu uudella pelillä
  } else if (id === "pelaajat") {
    kaksinpeli = !kaksinpeli;
    aanet.laskuri();
  } else if (id === "ohjeet") {
    tila = "ohjeet";
    aanet.laskuri();
  } else if (id === "jatkaTaukoa") {
    jatkaTauolta();
  } else if (id === "musiikki") {
    vaihdaMusiikki();
    aanet.laskuri();
  } else if (id === "kartalle") {
    avaaKartta();
  } else if (id === "poistu") {
    poistuPelista();
  }
}

function suljeOhjeet() {
  tila = "alku";
  valikonValinta = valikonRivit().findIndex((r) => r.id === "ohjeet");
  aanet.laskuri();
}

// Esc kesken kentän: peli pysähtyy
function avaaTauko() {
  tila = "tauko";
  valikonValinta = 0;
  aanet.laskuri();
}

function jatkaTauolta() {
  tila = "peli";
  // Jos tauolta palataan välilyönnillä, ukko ei saa hypätä heti.
  // Odotetaan, että napit nostetaan (sama kuin kuoleman jälkeen).
  for (const pl of pelaajat) pl.odotaNostoa = true;
}

// Takaisin alkuruutuun. Eteneminen tallennetaan, joten "Jatka peliä" toimii.
function poistuPelista() {
  tallennaPeli();
  tila = "alku";
  valikonValinta = 0;
  uusiVahvistus = false;
  tulipallot = [];
  aloitaSiirtyma();
}

// Hiiri tai sormi osoittaa ruutua kohdassa (ruutuX, ruutuY) selaimen koordinaateissa.
// valitse = true: klikkaus tai napautus, false: hiiri vain liikkuu päällä.
function osoitaRuutua(ruutuX, ruutuY, valitse) {
  const kohta = pelinKohta(ruutuX, ruutuY);
  if (tila === "ohjeet") {
    if (valitse) suljeOhjeet();
    return;
  }
  if (tila !== "alku" && tila !== "tauko") return;
  const asettelu = valikonAsettelu();
  const numero = asettelu.rivit.findIndex((r) => osuu({ x: kohta.x, y: kohta.y, leveys: 1, korkeus: 1 }, r));
  if (numero < 0) return;
  asetaValinta(numero);
  if (valitse) valitseRivi(asettelu.rivit[numero].id);
}

// Muuttaa selaimen koordinaatit pelin koordinaateiksi (800 x 450).
// Kännykässä peli on venytetty koko ruudulle, joten pitää laskea mittakaava.
function pelinKohta(ruutuX, ruutuY) {
  const laatikko = canvas.getBoundingClientRect();
  const reuna = parseFloat(getComputedStyle(canvas).borderLeftWidth) || 0;
  const leveys = laatikko.width - 2 * reuna;
  const korkeus = laatikko.height - 2 * reuna;
  const mittakaava = Math.min(leveys / canvas.width, korkeus / canvas.height);
  const vasen = laatikko.left + reuna + (leveys - canvas.width * mittakaava) / 2;
  const yla = laatikko.top + reuna + (korkeus - canvas.height * mittakaava) / 2;
  return { x: (ruutuX - vasen) / mittakaava, y: (ruutuY - yla) / mittakaava };
}

// Tietokoneella valikkoa voi käyttää myös hiirellä
canvas.addEventListener("click", (e) => {
  if (kosketusOhjaus) return; // kännykässä napautukset hoitaa kosketus.js
  kaynnistaAanet();
  osoitaRuutua(e.clientX, e.clientY, true);
});
canvas.addEventListener("mousemove", (e) => {
  if (!kosketusOhjaus) osoitaRuutua(e.clientX, e.clientY, false);
});

// Missä kohtaa ruutua valikko ja sen rivit ovat
const RIVIN_KORKEUS = 48;
const VALIKON_LEVEYS = 400;
function valikonAsettelu() {
  const rivit = valikonRivit();
  const otsikko = tila === "tauko" ? 64 : 0; // taukovalikossa on otsikko "TAUKO"
  const korkeus = otsikko + rivit.length * RIVIN_KORKEUS + 16;
  const keskiY = tila === "tauko" ? 210 : 302;
  const x = (canvas.width - VALIKON_LEVEYS) / 2;
  const y = Math.round(keskiY - korkeus / 2);
  rivit.forEach((rivi, i) => {
    rivi.x = x + 12;
    rivi.y = y + 8 + otsikko + i * RIVIN_KORKEUS + 3;
    rivi.leveys = VALIKON_LEVEYS - 24;
    rivi.korkeus = RIVIN_KORKEUS - 6;
  });
  return { x: x, y: y, leveys: VALIKON_LEVEYS, korkeus: korkeus, otsikko: otsikko, rivit: rivit };
}

function tarkistaEnnatys() {
  if (pisteet > ennatys) {
    ennatys = pisteet;
    uusiEnnatys = true;
    aanet.ennatys();
    try {
      localStorage.setItem("ukonSeikkailuEnnatys", String(ennatys));
    } catch (virhe) {
      // ei haittaa, ennätys vain ei tallennu
    }
  }
}

// Lataa kentän ja laittaa pelaajan sen alkuun
function aloitaKentta(numero) {
  kenttaNumero = numero;
  aloitaMusiikkiAlusta(); // jokaisen kentän kappale alkaa alusta (musiikki.js)
  alustaVahvistus = 0;
  kentta = KENTAT[numero](); // kutsutaan kentän funktiota, esim. kentta1()
  valmisteleKentta(kentta);

  // Pisteisiin lasketaan muiden kenttien parhaat tulokset. Jos pelaat
  // kentän uudestaan, siitä jää voimaan vain parempi tulos.
  pisteet = muidenKenttienPisteet(numero);
  kentanKolikot = 0;
  kentanVihut = 0;
  kentanAika = 0;
  tulipallot = [];
  hiukkaset = [];
  tekstit = [];
  for (const pl of pelaajat) {
    // Haamu herää henkiin uudessa kentässä
    if (pl.haamu) {
      pl.haamu = false;
      pl.elamat = HAAMU_HERAA_ELAMIA;
    }
    pl.suojaAika = 0;
    pl.tuli = TULI_MAX;
    pl.tuliVilkkuu = 0;
    pelaaja = pl;
    siirraPelaajaAlkuun();
  }
  tila = "peli";
  aloitaSaa();
  valmisteleKentanKuvat(); // isot kuvat valmiiksi heti alussa (valmiskuvat.js)
  aloitaSiirtyma();
}

// Antaa kentän asioille ne tiedot, joita ei kirjoiteta kentat.js-tiedostoon
function valmisteleKentta(k) {
  for (const kolikko of k.kolikot) {
    kolikko.leveys = 20;
    kolikko.korkeus = 20;
    kolikko.keratty = false;
  }

  for (const v of k.viholliset) {
    // tyyppi: "vihu" (tavallinen), "piikkis", "pomppija", "tippuja" tai "ryomija"
    if (!v.tyyppi) v.tyyppi = "vihu";
    v.elossa = true;
    v.palanut = false;
    v.kuolinAika = 0;
    v.vy = 0;

    if (v.tyyppi === "laavapallo") {
      valmisteleLaavapallo(v); // tulivuori.js
      continue;
    }
    if (valmisteleTulivihu(v)) continue; // kekäle, laavaetana, salamanteri (tulivihut.js)
    if (v.tyyppi === "tippuja") {
      // Hämähäkki roikkuu langan päässä kohdassa x, y ja tippuu lattialle asti
      v.leveys = 26;
      v.korkeus = 24;
      v.alkuY = v.y;
      if (v.katto === undefined) v.katto = 0; // mistä lanka alkaa (0 = ruudun yläreuna)
      v.tila = "roikkuu"; // "roikkuu", "tarisee", "putoaa", "maassa" tai "nousee"
      v.ajastin = 0;
      v.suunta = 1;
      continue;
    }
    if (v.tyyppi === "ryomija") {
      // Gekko kiipeää seinää ylös ja alas. x = seinän pinta.
      // seina = "vasen", jos seinä on gekon vasemmalla puolella.
      v.leveys = 20;
      v.korkeus = 28;
      if (!v.seina) v.seina = "vasen";
      if (v.seina === "oikea") v.x = v.x - v.leveys;
      if (!v.nopeus) v.nopeus = 1;
      v.y = v.yla;
      v.suunta = 1; // 1 = alas, -1 = ylös
      continue;
    }

    v.leveys = 40; // vihun vartalo on noin 20 pikseliä leveä, kerrottuna ZOOMilla
    v.korkeus = 48;
    if (v.tyyppi === "piikkis") {
      v.leveys = 28;
      v.korkeus = 24;
    }
    if (v.tyyppi === "pomppija") {
      v.leveys = 26;
      v.korkeus = 20;
      v.vy = 0;
      v.ajastin = 40; // kuinka kauan pomppija odottaa ennen seuraavaa hyppyä
    }
    v.y = v.lattia - v.korkeus; // seisoo tason päällä
    v.suunta = 1; // 1 = oikealle, -1 = vasemmalle
    v.elossa = true;
    v.palanut = false;
    v.kuolinAika = 0; // kuinka kauan kuollut vihu vielä näkyy
  }

  for (const v of k.lentovihut) {
    v.leveys = 40;
    v.korkeus = 22;
    v.alkuY = v.y; // heilunta tapahtuu tämän korkeuden ympärillä
    v.aika = 0;
    v.suunta = -1; // lentovihu aloittaa lentämällä vasemmalle
    v.elossa = true;
    v.palanut = false;
    v.kuolinAika = 0;
    v.vy = 0; // putoamisvauhti, kun vihu on tuhottu
  }

  for (const t of k.liikkuvatTasot) {
    t.korkeus = 20;
    t.alkuX = t.x;
    t.alkuY = t.y;
    t.aika = 0;
  }

  // Liput: lattia kertoo, minkä tason päällä lippu seisoo
  for (const lippu of [k.valitallennus, k.maali]) {
    lippu.leveys = 20;
    lippu.korkeus = 60;
    lippu.y = lippu.lattia - lippu.korkeus;
  }
  k.valitallennus.aktiivinen = false;

  // Pomo (vain kentissä, joissa sellainen on)
  if (k.pomo && k.pomo.tyyppi === "magma") {
    valmisteleMagma(k.pomo); // tulivuori.js
  } else if (k.pomo) {
    const p = k.pomo;
    p.nimi = "ISÄUKKO";
    p.maxElamat = POMON_ELAMAT;
    p.leveys = 24 * ZOOM; // vartalo on kuvassa noin 24 pikseliä leveä
    p.korkeus = 60 * ZOOM; // ja 60 pikseliä korkea
    p.y = p.lattia - p.korkeus;
    p.alkuX = p.x;
    p.elamat = POMON_ELAMAT;
    p.elossa = true;
    p.herannyt = false; // pomo nukkuu, kunnes pelaaja tulee areenalle
    p.suunta = -1;
    p.tila = "kavelee"; // "kavelee", "valmistautuu" tai "ryntaa"
    p.ajastin = 150; // kuinka kauan nykyinen tila vielä kestää
    p.kipu = 0; // kun tämä on yli 0, parta heiluu eikä pomoon voi osua
    p.kuolinAika = 0;
    p.heratysTeksti = false; // onko "ISÄUKKO HERÄSI!" jo näytetty
    p.vx = 0; // vauhti sivuttain hypyssä
    p.vy = 0; // vauhti pystysuunnassa hypyssä
    p.kivet = []; // Isäukon heittämät kivet
    p.aallot = []; // järistysaallot, jotka vierivät maata pitkin
  }

  // Lista kaikista tasoista, sekä paikallaan olevista että liikkuvista
  // Sydämet (vapaaehtoisia): x ja y. Keräämällä saa elämän takaisin.
  if (!k.sydamet) k.sydamet = [];
  for (const sydan of k.sydamet) {
    sydan.leveys = 27; // sydänkuva on 9 x 8 "pikseliä", kukin 3 x 3
    sydan.korkeus = 24;
    sydan.keratty = false;
  }

  // Jouset (vapaaehtoisia): x ja lattia
  if (!k.jouset) k.jouset = [];
  for (const j of k.jouset) {
    j.leveys = 28;
    j.korkeus = 20;
    j.y = j.lattia - j.korkeus; // jousen yläreuna
    j.painuma = 0; // kun yli 0, jousi on painunut kasaan
  }

  // Putoavat tasot (vapaaehtoisia): x, y, leveys
  if (!k.putoavatTasot) k.putoavatTasot = [];
  for (const t of k.putoavatTasot) {
    t.korkeus = 20;
    t.alkuY = t.y;
    t.ajastin = -1; // -1 = kukaan ei ole vielä astunut päälle
    t.putoaa = false;
    t.vy = 0;
    t.eiKiintea = false; // true = taso ei pysäytä ukkoa (se putoaa jo)
  }

  // Salaiset luolat (vapaaehtoisia): x, lattia, leveys, korkeus, aukko.
  // Kallio tehdään kahdesta kiinteästä osasta (katto ja umpinainen seinä).
  // Aukon puolella on valeseinä: se näyttää kalliolta, mutta siitä pääsee läpi!
  if (!k.salaisetLuolat) k.salaisetLuolat = [];
  for (const l of k.salaisetLuolat) {
    if (!l.aukko) l.aukko = "oikea";
    l.y = l.lattia - l.korkeus; // kallion yläreuna
    l.nakyvyys = 1; // 1 = kallio peittää luolan, 0 = luola näkyy kokonaan
    l.loydetty = false;

    const oikealla = l.aukko === "oikea";
    const seinaX = oikealla ? l.x : l.x + l.leveys - LUOLAN_SEINA;
    const sisusX = oikealla ? l.x + LUOLAN_SEINA : l.x;
    // Umpinainen seinä (koko kallion korkuinen)
    k.tasot.push({ x: seinaX, y: l.y, leveys: LUOLAN_SEINA, korkeus: l.korkeus });
    // Katto
    k.tasot.push({ x: sisusX, y: l.y, leveys: l.leveys - LUOLAN_SEINA, korkeus: LUOLAN_KATTO });
    // Luolan sisäosa valeseinän kanssa. Kun ukko on täällä, kallio muuttuu läpinäkyväksi.
    l.sisus = {
      x: sisusX,
      y: l.y + LUOLAN_KATTO,
      leveys: l.leveys - LUOLAN_SEINA,
      korkeus: l.korkeus - LUOLAN_KATTO,
    };
  }

  valmisteleTulivuori(k); // laava, liekit ja tykit (tulivuori.js)

  k.kaikkiTasot = k.tasot.concat(k.liikkuvatTasot, k.putoavatTasot);
}

// Siirtää pelaajan kentän alkuun tai välitallennukseen
function siirraPelaajaAlkuun() {
  if (kentta.valitallennus.aktiivinen) {
    pelaaja.x = kentta.valitallennus.x;
    pelaaja.y = kentta.valitallennus.lattia - pelaaja.korkeus;
  } else {
    pelaaja.x = kentta.alku.x;
    pelaaja.y = kentta.alku.y;
  }
  if (pelaaja.numero === 2) pelaaja.x += 30; // pelaaja 2 vähän pelaajan 1 vieressä
  pelaaja.turvaX = pelaaja.x;
  pelaaja.turvaY = pelaaja.y;
  nollaaLiike(pelaaja);
  kameraHyppaa = true;
}

// Pysäyttää ukon (esim. kun se syntyy uudestaan)
function nollaaLiike(pl) {
  pl.vx = 0;
  pl.vy = 0;
  pl.suunta = 1;
  pl.alusta = null;
  pl.hyppaa = false;
  pl.venytys = 0;
  pl.potkuAika = 0;
  pl.liukuu = false;
}

// Kutsutaan, kun vihu osuu ukkoon tai ukko putoaa kuoppaan
function menetaElama() {
  pelaaja.elamat--; // sama kuin pelaaja.elamat = pelaaja.elamat - 1
  aanet.osuma();
  tarina = 15; // ruutu tärisee
  lisaaHiukkasia(pelaaja.x + 10, pelaaja.y + 20, 20, ["#e63946", "white"], 5);

  // Kaksinpelissä toinen pelaaja voi vielä jatkaa
  const toinen = toinenPelaaja(pelaaja);
  const toinenElossa = toinen && !toinen.haamu;

  if (pelaaja.elamat <= 0) {
    pelaaja.elamat = 0;
    if (toinenElossa) {
      // Elämät loppuivat, mutta kaveri jatkaa: tästä ukosta tulee haamu
      pelaaja.haamu = true;
      pelaaja.suojaAika = 0; // haamu ei vilku
      tulipallot = tulipallot.filter((t) => t.omistaja !== pelaaja);
      lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "PELAAJA " + pelaaja.numero + " ON HAAMU!");
      return;
    }
    tila = "havio"; // elämät loppuivat, peli hävitty
    ruutuAika = 0;
    aanet.havio();
    tarkistaEnnatys();
    return;
  }

  pelaaja.suojaAika = SUOJA_AIKA;
  pelaaja.tuli = TULI_MAX;
  // Ukko seisoo paikallaan, kunnes napit nostetaan ylös. Muuten ukko
  // juoksisi heti uudestaan samaan kuoppaan, jos nappi jäi pohjaan.
  pelaaja.odotaNostoa = true;

  if (toinenElossa) {
    // Kaksinpeli: ukko syntyy uudestaan kaverinsa luo
    nollaaLiike(pelaaja);
    pelaaja.x = toinen.turvaX;
    pelaaja.y = toinen.turvaY;
    lisaaHiukkasia(pelaaja.x + 10, pelaaja.y + 20, 15, ["white", "gold"], 3);
    return;
  }

  // Elämiä on vielä jäljellä: ukko palaa alkuun (tai välitallennukseen)
  // ja on hetken suojassa. Kolikot ja tuhotut vihut pysyvät ennallaan.
  siirraPelaajaAlkuun();
  aloitaSiirtyma();
  tulipallot = [];

  // Pomo palaa paikalleen ja nukahtaa, mutta sen osumat pysyvät
  const pomo = kentta.pomo;
  if (pomo && pomo.elossa && pomo.tyyppi === "magma") {
    avaaPortti();
    nollaaMagma(pomo); // tulivuori.js
  } else if (pomo && pomo.elossa) {
    avaaPortti(); // pelaaja aloittaa areenan ulkopuolelta
    pomo.herannyt = false;
    pomo.x = pomo.alkuX;
    pomo.suunta = -1;
    pomo.tila = "kavelee";
    pomo.ajastin = 150;
    pomo.y = pomo.lattia - pomo.korkeus; // takaisin maahan, jos oli hypyssä
    pomo.vy = 0;
    pomo.kivet = [];
    pomo.aallot = [];
  }
}

// Kun hyppää vihun päälle, tulimittari täyttyy palan verran heti
function lataaTulta() {
  pelaaja.tuli = Math.min(TULI_MAX, pelaaja.tuli + TULI_LITISTYKSESTA);
  lisaaHiukkasia(
    pelaaja.x + pelaaja.leveys / 2,
    pelaaja.y + 10,
    8,
    ["orange", "#ff3c00", "yellow"],
    3,
  );
}

// Ampuu uuden tulipallon siihen suuntaan, johon ukko katsoo
function ammu(pl) {
  if (tila !== "peli" || pl.haamu) return;
  pelaaja = pl;
  // Liikaa omia palloja ilmassa?
  const omat = tulipallot.filter((t) => t.omistaja === pl);
  if (omat.length >= TULIPALLOJA_MAX) return;

  // Onko mittarissa tarpeeksi tulta?
  if (pelaaja.tuli < TULI_HINTA) {
    pelaaja.tuliVilkkuu = 20; // mittari vilkkuu punaisena
    aanet.tyhja();
    return;
  }
  pelaaja.tuli -= TULI_HINTA;

  // Pallo lähtee ukon oikealta tai vasemmalta puolelta
  let x = pelaaja.x + pelaaja.leveys;
  if (pelaaja.suunta === -1) x = pelaaja.x - 16;

  tulipallot.push({
    x: x,
    y: pelaaja.y + 12, // vähän ukon pään alapuolelta
    leveys: 16,
    korkeus: 16,
    suunta: pelaaja.suunta,
    elossa: true,
    matka: 0, // kuinka pitkälle pallo on jo lentänyt
    omistaja: pelaaja, // kuka ampui
  });
  aanet.tulipallo();
}

// Tuhoaa vihun. palanut = true, jos tulipallo osui, muuten vihu litistyi.
function tuhoaVihu(v, palanut) {
  v.elossa = false;
  v.palanut = palanut;
  v.kuolinAika = 40;
  v.vy = 0;

  const keskiX = v.x + v.leveys / 2;
  const keskiY = v.y + v.korkeus / 2;

  // Pisteet: lentovihusta saa enemmän, koska se on vaikeampi
  let arvo = PISTEET_VIHU;
  if (v.tyyppi === "piikkis") arvo = PISTEET_PIIKKIS;
  if (v.tyyppi === "pomppija") arvo = PISTEET_POMPPIJA;
  if (v.tyyppi === "tippuja") arvo = PISTEET_TIPPUJA;
  if (v.tyyppi === "ryomija") arvo = PISTEET_RYOMIJA;
  if (kentta.lentovihut.includes(v)) arvo = PISTEET_LENTOVIHU;
  if (v.arvo) arvo = v.arvo; // tulivuoren vihuilla on oma arvo
  pisteet += arvo;
  if (!v.eiLasketa) kentanVihut++;
  lisaaTeksti(keskiX, v.y - 10, "+" + arvo);

  if (palanut) {
    lisaaHiukkasia(
      keskiX,
      keskiY,
      25,
      ["orange", "#ff3c00", "yellow", "#333"],
      5,
    );
    aanet.palaminen();
  } else {
    lisaaHiukkasia(
      keskiX,
      v.y + v.korkeus,
      15,
      v.litistysVarit || ["#0a5c0a", "#1f8a1f", "black"],
      4,
    );
    aanet.litistys();
  }
}

// Tarkistaa vihun kaikkia pelaajia vastaan. Palauttaa true, jos peli loppui.
function vihuOsuuPelaajiin(v) {
  for (const pl of elavatPelaajat()) {
    pelaaja = pl;
    tarkistaVihuOsuma(v);
    if (tila !== "peli") return true;
  }
  return false;
}

// Kun pelaaja hyppää vihun päälle, se saa tulta ja pomppaa ylös
function pomppaaVihusta() {
  lataaTulta();
  pelaaja.venytys = 0.35;
  // Pomppu: jos hyppynappi on pohjassa, pompataan korkeammalle!
  if (hyppyNappiPohjassa()) {
    pelaaja.vy = -HYPPYVOIMA;
    pelaaja.hyppaa = true;
  } else {
    pelaaja.vy = -HYPPYVOIMA / 2;
    pelaaja.hyppaa = false;
  }
}

// Tarkistaa, osuuko vihu pelaajaan.
// Palauttaa true, jos pelaaja menetti elämän.
function tarkistaVihuOsuma(v) {
  if (!v.elossa || !osuu(pelaaja, v)) return false;

  // Laavapallo on niin kuuma, että siihen ei saa koskea ollenkaan
  if (v.tyyppi === "laavapallo") {
    if (v.piilossa || pelaaja.suojaAika > 0) return false;
    lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "KUUMA!");
    menetaElama();
    return true;
  }
  if (TULIVIHUT.includes(v.tyyppi)) return tulivihuOsuu(v); // tulivihut.js

  // Tuleeko pelaaja ylhäältä? Silloin pelaaja putoaa (vy > 0) ja sen
  // jalat olivat edellisellä hetkellä vihun pään yläpuolella.
  const edellisetJalat = pelaaja.edellinenY + pelaaja.korkeus;
  const tuleeYlhaalta = pelaaja.vy > 0 && edellisetJalat <= v.y + 10;

  // Piikkiksen selässä on piikkejä: päälle hyppääminen sattuu!
  if (tuleeYlhaalta && v.tyyppi === "piikkis") {
    if (pelaaja.suojaAika <= 0) {
      lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "AUTS!");
      menetaElama();
      return true;
    }
    return false;
  }

  if (tuleeYlhaalta) {
    tuhoaVihu(v, false);
    pomppaaVihusta();
    return false;
  }

  // Osuttiin sivulta: menetetään elämä (paitsi jos ukko on suojassa)
  if (pelaaja.suojaAika <= 0) {
    menetaElama();
    return true;
  }
  return false;
}

// ---------- POMO ----------

// Portti on seinä, joka nousee pelaajan taakse, kun pomo herää.
// Seinästä tulee taso, eli se lisätään kaikkien tasojen listaan.
function suljePortti() {
  const portti = kentta.pomo.portti;
  if (!portti || kentta.kaikkiTasot.includes(portti)) return;
  kentta.kaikkiTasot.push(portti);
  lisaaHiukkasia(
    portti.x + portti.leveys / 2,
    portti.y + portti.korkeus,
    20,
    ["#ddd", "#8b5a2b", "#bbb"],
    4,
  );
}

function avaaPortti() {
  const portti = kentta.pomo.portti;
  if (!portti) return;
  // filter pitää listassa kaikki muut tasot paitsi portin
  kentta.kaikkiTasot = kentta.kaikkiTasot.filter((t) => t !== portti);
}

function porttiKiinni() {
  const pomo = kentta.pomo;
  return pomo && pomo.portti && kentta.kaikkiTasot.includes(pomo.portti);
}

// Pomoon osui. vahinko = montako elämää pomo menettää.
function osuPomoon(vahinko) {
  const p = kentta.pomo;
  p.herannyt = true;
  if (p.kipu > 0) return false; // parta heiluu vielä: pomo ei ota uutta vahinkoa

  p.elamat -= vahinko;
  p.kipu = 36; // parran heilumisen pituus (6 ruutua, kukin 6 hetkeä)
  tarina = 6;
  aanet.pomoOsuma();
  // Partakarvoja (tai kivenmurusia) lentää!
  const murut = p.tyyppi === "magma" ? ["#555", "#888", "#ff7b00"] : ["#8b4a1c", "#6b3a14", "#a0522d"];
  lisaaHiukkasia(p.x + p.leveys / 2, p.y + 50, 12, murut, 4);

  if (p.elamat <= 0) {
    p.elamat = 0;
    p.elossa = false;
    p.kuolinAika = 120;
    pisteet += PISTEET_POMO;
    lisaaTeksti(p.x + p.leveys / 2, p.y - 20, "+" + PISTEET_POMO);
    lisaaHiukkasia(
      p.x + p.leveys / 2,
      p.y + 60,
      60,
      ["gold", "white", "#8b4a1c", "#e63946"],
      8,
    );
    tarina = 30;
    aanet.pomoKaatui();
    avaaPortti();
    p.kivet = [];
    p.aallot = [];
    p.meteorit = [];
    p.geysirit = [];
    p.tulikuulat = [];
    // Maali ilmestyy!
    const m = kentta.maali;
    lisaaHiukkasia(m.x + 10, m.y + 20, 30, ["gold", "white"], 5);
    lisaaTeksti(m.x + 10, m.y - 10, "Maali auki!");
  }
  return true; // osuma meni perille
}

// Liikuttaa pomoa. Palauttaa true, jos pelaaja menetti elämän.
function paivitaPomo(dt) {
  const p = kentta.pomo;
  if (!p) return false; // tässä kentässä ei ole pomoa

  if (!p.elossa) {
    p.kuolinAika -= dt;
    return false;
  }
  if (p.kipu > 0) p.kipu -= dt;

  // Isäukko jahtaa lähintä pelaajaa (yksinpelissä aina samaa)
  const elavat = elavatPelaajat();
  if (elavat.length === 0) return false;
  pelaaja = elavat[0];
  for (const pl of elavat) {
    if (Math.abs(pl.x - p.x) < Math.abs(pelaaja.x - p.x)) pelaaja = pl;
  }

  // Pomo herää, kun joku pelaaja tulee areenalle
  if (!p.herannyt) {
    if (!elavat.some((pl) => pl.x >= p.alue)) return false;
    p.herannyt = true;
  }
  // Seinä nousee pelaajien taakse: areenalta ei pääse pakoon!
  // Kaksinpelissä portti sulkeutuu vasta, kun molemmat ovat areenalla.
  const kaikkiSisalla =
    p.portti && elavat.every((pl) => pl.x > p.portti.x + p.portti.leveys);
  if (p.portti && !porttiKiinni() && kaikkiSisalla) {
    suljePortti();
    tarina = 10;
  }
  if (!p.heratysTeksti) {
    p.heratysTeksti = true; // teksti ja ääni vain kerran
    aanet.pomoHeraa();
    tarina = 12;
    lisaaTeksti(p.x + p.leveys / 2, p.y - 20, p.nimi + " HERÄSI!");
  }

  // Magmamörköllä on omat hyökkäykset (tulivuori.js)
  if (p.tyyppi === "magma") return paivitaMagma(p, dt, elavat);

  // Kun elämiä on yksi kolmasosa jäljellä, Isäukko suuttuu ja on nopeampi
  const vihainen = p.elamat <= POMON_ELAMAT / 3;
  const tauko = vihainen ? 100 : 160; // kuinka kauan kävellään hyökkäysten välissä
  p.ajastin -= dt;

  if (p.tila === "kavelee") {
    p.x += POMON_NOPEUS * (vihainen ? 1.7 : 1) * p.suunta * dt;
    if (p.ajastin <= 0) {
      valitseHyokkays(p);
    }

    // --- Hyökkäys 1: RYNTÄYS ---
  } else if (p.tila === "valmistautuu") {
    // Seisoo paikallaan ja tärisee: varoitus pelaajalle!
    if (p.ajastin <= 0) {
      p.tila = "ryntaa";
      p.ajastin = 100;
      aanet.ryntays();
    }
  } else if (p.tila === "ryntaa") {
    p.x += POMON_RYNTAYS * (vihainen ? 1.4 : 1) * p.suunta * dt;
    if (Math.random() < 0.3) {
      lisaaHiukkasia(p.x + p.leveys / 2, p.lattia, 1, ["#ddd", "#bbb"], 2);
    }
    if (p.ajastin <= 0) {
      p.tila = "kavelee";
      p.ajastin = tauko;
    }

    // --- Hyökkäys 2: JÄTTIHYPPY JA MAANJÄRISTYS ---
  } else if (p.tila === "kyykistyy") {
    // Kyykistyy hetken ennen hyppyä
    if (p.ajastin <= 0) {
      p.tila = "hyppaa";
      p.vy = -14;
      // Hypätään pelaajaa kohti. Matka jaetaan hypyn pituudella (noin 47 hetkeä).
      p.vx = (pelaaja.x - p.x) / 47;
      p.vx = Math.max(-5, Math.min(5, p.vx)); // ei liian kovaa
      aanet.pomoHyppy();
    }
  } else if (p.tila === "hyppaa") {
    p.x += p.vx * dt;
    p.vy += 0.6 * dt;
    p.y += p.vy * dt;
    if (p.y >= p.lattia - p.korkeus) {
      // Laskeutui: maa tärisee ja järistysaallot lähtevät molempiin suuntiin
      p.y = p.lattia - p.korkeus;
      p.vy = 0;
      tarina = 18;
      aanet.maanjaristys();
      lisaaHiukkasia(
        p.x + p.leveys / 2,
        p.lattia,
        25,
        ["#ddd", "#bbb", "#8b5a2b"],
        5,
      );
      p.aallot.push({
        x: p.x - 24,
        y: p.lattia - 26,
        leveys: 24,
        korkeus: 26,
        suunta: -1,
      });
      p.aallot.push({
        x: p.x + p.leveys,
        y: p.lattia - 26,
        leveys: 24,
        korkeus: 26,
        suunta: 1,
      });
      p.tila = "kavelee";
      p.ajastin = tauko;
    }

    // --- Hyökkäys 3: KIVISADE ---
  } else if (p.tila === "heittaa") {
    // Heitetään kolme kiveä, yksi kerrallaan
    const heitot = [40, 28, 16]; // millä ajastimen hetkellä kukin kivi lähtee
    for (const hetki of heitot) {
      if (p.ajastin <= hetki && p.ajastin + dt > hetki) {
        heitaKivi(p, heitot.indexOf(hetki));
      }
    }
    if (p.ajastin <= 0) {
      p.tila = "kavelee";
      p.ajastin = tauko;
    }
  }

  // Areenan reunat: pomo kääntyy. Jos se ryntää seinään, maa tärähtää.
  if (p.x < p.vasen || p.x > p.oikea) {
    p.x = p.x < p.vasen ? p.vasen : p.oikea;
    p.suunta = -p.suunta;
    p.vx = 0;
    if (p.tila === "ryntaa") {
      tarina = 10;
      p.tila = "kavelee";
      p.ajastin = tauko;
    }
  }

  // Kivet ja järistysaallot liikkuvat
  paivitaKivetJaAallot(p, dt);

  // Osuuko pomo, kivi tai aalto johonkin pelaajaan?
  for (const pl of elavat) {
    pelaaja = pl;
    pomoOsuuPelaajaan(p);
    if (tila !== "peli") return true;
  }
  return false;
}

// Tarkistaa, osuuko pomo, kivi tai järistysaalto pelaajaan
function pomoOsuuPelaajaan(p) {
  if (pelaaja.suojaAika <= 0) {
    for (const vaara of p.kivet.concat(p.aallot)) {
      if (osuu(pelaaja, vaara)) {
        menetaElama();
        return;
      }
    }
  }
  if (!osuu(pelaaja, p)) return;

  // Isäukon pää (ylin osa) on turvallinen: jos ukon jalat ovat pään
  // korkeudella, Isäukko ei satuta. Jos ukko on tulossa alas, se litistää!
  const jalat = pelaaja.y + pelaaja.korkeus;
  const paanKorkeus = 45; // kuinka monta pikseliä ylhäältä lasketaan pääksi
  if (jalat <= p.y + paanKorkeus) {
    if (pelaaja.vy > 0) {
      // Tulta saa vain, jos osuma meni perille (ei parran heiluessa)
      if (osuPomoon(VAHINKO_LITISTYS)) lataaTulta();
      pelaaja.venytys = 0.35;
      // Pomppu pomon päästä: aina korkea, jotta pääsee pois alta
      pelaaja.vy = -HYPPYVOIMA;
      pelaaja.hyppaa = hyppyNappiPohjassa();
    }
    return;
  }

  if (pelaaja.suojaAika <= 0) menetaElama();
}

// Isäukko valitsee satunnaisesti yhden kolmesta hyökkäyksestä
function valitseHyokkays(p) {
  p.suunta = pelaaja.x < p.x ? -1 : 1; // käännytään pelaajaa kohti
  const arpa = Math.random(); // satunnainen luku 0 ja 1 välillä
  if (arpa < 0.34) {
    p.tila = "valmistautuu"; // ryntäys
    p.ajastin = 45;
  } else if (arpa < 0.67) {
    p.tila = "kyykistyy"; // jättihyppy
    p.ajastin = 25;
  } else {
    p.tila = "heittaa"; // kivisade
    p.ajastin = 50;
  }
}

// Heittää kiven kaarella pelaajaa kohti.
// numero = 0, 1 tai 2: jokainen kivi lentää vähän eri matkan.
function heitaKivi(p, numero) {
  const matka = Math.abs(pelaaja.x - p.x); // kuinka kaukana pelaaja on
  const vauhti = Math.max(1, Math.min(7, matka / 50)) * (0.7 + numero * 0.3);
  p.kivet.push({
    x: p.x + p.leveys / 2 - 9,
    y: p.y + 40, // käden korkeudelta
    leveys: 18,
    korkeus: 18,
    vx: vauhti * p.suunta,
    vy: -9,
    elossa: true,
  });
  aanet.heitto();
}

// Liikuttaa kiviä ja järistysaaltoja
function paivitaKivetJaAallot(p, dt) {
  for (const k of p.kivet) {
    k.x += k.vx * dt;
    k.vy += 0.4 * dt; // painovoima
    k.y += k.vy * dt;
    // Kivi hajoaa, kun se osuu maahan
    if (k.y + k.korkeus >= p.lattia) {
      k.elossa = false;
      lisaaHiukkasia(k.x + 9, p.lattia - 4, 8, ["#888", "#555", "#aaa"], 3);
    }
    // Tulipallo rikkoo kiven!
    for (const t of tulipallot) {
      if (t.elossa && k.elossa && osuu(t, k)) {
        t.elossa = false;
        k.elossa = false;
        lisaaHiukkasia(k.x + 9, k.y + 9, 12, ["#888", "orange", "#aaa"], 4);
      }
    }
  }
  p.kivet = p.kivet.filter((k) => k.elossa);

  for (const a of p.aallot) {
    a.x += 5 * a.suunta * dt;
    if (Math.random() < 0.5)
      lisaaHiukkasia(a.x + 12, p.lattia, 1, ["#ddd", "#8b5a2b"], 2);
  }
  // Aalto katoaa, kun se pääsee areenan reunaan
  p.aallot = p.aallot.filter(
    (a) => a.x > p.vasen - 30 && a.x < p.oikea + p.leveys + 30,
  );
}

// ---------- TIPPUJA JA SEINÄRYÖMIJÄ ----------

// Tippuja roikkuu langan päässä. Kun ukko tulee alle, se tärisee hetken,
// tippuu lattialle, odottaa ja kiipeää sitten lankaa pitkin takaisin ylös.
function paivitaTippuja(v, dt) {
  v.ajastin -= dt;
  if (v.tila === "roikkuu") {
    const matka = Math.abs(pelaaja.x + pelaaja.leveys / 2 - (v.x + v.leveys / 2));
    if (v.ajastin <= 0 && matka < TIPPUJAN_HAVAINTO && pelaaja.y > v.y) {
      v.tila = "tarisee";
      v.ajastin = TIPPUJAN_TARINA;
    }
  } else if (v.tila === "tarisee") {
    if (v.ajastin <= 0) {
      v.tila = "putoaa";
      v.vy = 0;
    }
  } else if (v.tila === "putoaa") {
    v.vy = Math.min(10, v.vy + 0.6 * dt);
    v.y += v.vy * dt;
    if (v.y + v.korkeus >= v.lattia) {
      v.y = v.lattia - v.korkeus;
      v.tila = "maassa";
      v.ajastin = 50;
    }
  } else if (v.tila === "maassa") {
    if (v.ajastin <= 0) v.tila = "nousee";
  } else if (v.tila === "nousee") {
    v.y -= 1.5 * dt;
    if (v.y <= v.alkuY) {
      v.y = v.alkuY;
      v.tila = "roikkuu";
      v.ajastin = 60; // pieni tauko ennen kuin se voi tippua uudestaan
    }
  }
}

// Seinäryömijä kiipeää seinää ylös ja alas kohtien yla ja ala välillä
function paivitaRyomija(v, dt) {
  v.y += v.nopeus * v.suunta * dt;
  if (v.y < v.yla) {
    v.y = v.yla;
    v.suunta = 1;
  }
  if (v.y + v.korkeus > v.ala) {
    v.y = v.ala - v.korkeus;
    v.suunta = -1;
  }
}

// ---------- POMPPIJA, JOUSET JA PUTOAVAT TASOT ----------

// Pomppija odottaa hetken maassa ja hyppää sitten eteenpäin
function paivitaPomppija(v, dt) {
  const maanTaso = v.lattia - v.korkeus;
  if (v.y >= maanTaso && v.vy >= 0) {
    // Maassa: odotetaan
    v.y = maanTaso;
    v.vy = 0;
    v.ajastin -= dt;
    if (v.ajastin <= 0) {
      v.vy = -(v.hyppy || 11); // hyppy! (kentässä voi antaa oman hyppy-luvun)
      v.ajastin = 50;
    }
    return;
  }
  // Ilmassa: painovoima vetää alas ja pomppija liikkuu sivuttain
  v.vy += 0.5 * dt;
  v.y += v.vy * dt;
  v.x += v.nopeus * v.suunta * dt;
  if (v.y >= maanTaso) {
    v.y = maanTaso;
    v.vy = 0;
  }
}

// Kun ukko putoaa jousen päälle, se pomppaa tosi korkealle
function tarkistaJouset() {
  for (const j of kentta.jouset) {
    const edellisetJalat = pelaaja.edellinenY + pelaaja.korkeus;
    const jalat = pelaaja.y + pelaaja.korkeus;
    const vaakaOsuu = pelaaja.x + pelaaja.leveys > j.x && pelaaja.x < j.x + j.leveys;
    // Ukko tulee ylhäältä ja jalat menevät jousen yläreunan ohi
    if (vaakaOsuu && pelaaja.vy >= 0 && edellisetJalat <= j.y + 4 && jalat >= j.y) {
      pelaaja.y = j.y - pelaaja.korkeus;
      pelaaja.vy = -JOUSEN_VOIMA;
      pelaaja.maassa = false;
      pelaaja.hyppaa = false; // jousen hyppyä ei voi katkaista
      pelaaja.venytys = 0.45;
      j.painuma = 10;
      aanet.jousi();
      lisaaHiukkasia(j.x + j.leveys / 2, j.y, 8, ["#ddd", "#e63946"], 3);
    }
  }
}

// Kun ukko astuu putoavalle tasolle, ajastin käynnistyy
function aloitaPutoaminen(t) {
  if (t.ajastin < 0) t.ajastin = PUTOAMIS_VAROITUS;
}

function paivitaPutoavatTasot(dt) {
  for (const t of kentta.putoavatTasot) {
    if (t.putoaa) {
      // Taso putoaa yhä nopeammin
      t.vy += 0.5 * dt;
      t.y += t.vy * dt;
      t.ajastin -= dt;
      // Kolmen sekunnin päästä taso palaa paikalleen
      if (t.ajastin < -180) {
        t.y = t.alkuY;
        t.vy = 0;
        t.putoaa = false;
        t.eiKiintea = false;
        t.ajastin = -1;
        lisaaHiukkasia(t.x + t.leveys / 2, t.y + 10, 10, ["white", "#ddd"], 2);
      }
    } else if (t.ajastin >= 0) {
      // Taso tärisee varoitukseksi ja putoaa, kun aika loppuu
      t.ajastin -= dt;
      if (t.ajastin <= 0) {
        t.putoaa = true;
        t.eiKiintea = true;
        t.ajastin = 0;
        aanet.putoaa();
        lisaaHiukkasia(t.x + t.leveys / 2, t.y + 10, 10, ["#8b5a2b", "#c68642"], 3);
      }
    }
  }
}

// Onko ukon vieressä seinä? Palauttaa -1 (vasemmalla), 1 (oikealla) tai 0.
// Tarkistetaan kapea suikale ukon kyljen vierestä.
function seinaVieressa() {
  const p = pelaaja;
  const oikea = { x: p.x + p.leveys, y: p.y + 6, leveys: 3, korkeus: p.korkeus - 12 };
  const vasen = { x: p.x - 3, y: p.y + 6, leveys: 3, korkeus: p.korkeus - 12 };
  for (const t of kentta.kaikkiTasot) {
    if (t.eiKiintea) continue;
    if (osuu(oikea, t)) return 1;
    if (osuu(vasen, t)) return -1;
  }
  return 0;
}

function hyppyNappiPohjassa() {
  return painettu(pelaaja, "hyppy");
}

// Lisää kasan hiukkasia kohtaan (x, y).
// varit = lista värejä, voima = kuinka kovaa hiukkaset lentävät
function lisaaHiukkasia(x, y, maara, varit, voima) {
  for (let i = 0; i < maara; i++) {
    hiukkaset.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * voima * 2, // satunnainen suunta
      vy: -Math.random() * voima - 1, // lentää ylöspäin
      elinaika: 30 + Math.random() * 20, // kuinka kauan hiukkanen elää
      vari: varit[Math.floor(Math.random() * varit.length)],
      koko: 3 + Math.floor(Math.random() * 3),
    });
  }
}

// Lisää ylös leijuvan tekstin, esim. "+1"
function lisaaTeksti(x, y, teksti) {
  tekstit.push({ x: x, y: y, teksti: teksti, elinaika: 45 });
}

// Piirtää yhden ruudun kuvasta, jossa on monta ruutua vierekkäin.
// peilaa = true kääntää kuvan toisin päin (vasen <-> oikea)
function piirraRuutu(kuva, ruutu, ruudunLeveys, ruudunKorkeus, x, y, peilaa) {
  const leveys = ruudunLeveys * ZOOM;
  const korkeus = ruudunKorkeus * ZOOM;
  ctx.save();
  ctx.translate(x, y);
  if (peilaa) {
    ctx.translate(leveys, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(
    kuva,
    ruutu * ruudunLeveys,
    0,
    ruudunLeveys,
    ruudunKorkeus, // mistä kohtaa kuvaa
    0,
    0,
    leveys,
    korkeus, // mihin kohtaan ruutua
  );
  ctx.restore();
}

// ---------- PELIN LOGIIKKA ----------
// dt = kuinka paljon aikaa kului (1 = yksi ruutu 60 fps:llä)
function paivita(dt) {
  // Nämä liikkuvat aina, vaikka peli olisi pysähdyksissä
  paivitaTehosteet(dt);
  paivitaMusiikki(); // musiikki.js
  if (tila === "tauko") return; // tauolla kaikki on pysähdyksissä
  if (alustaVahvistus > 0) alustaVahvistus -= dt;
  for (const p of pilvet) p.x += p.nopeus * dt;
  paivitaHiukkaset(dt);
  if (tarina > 0) tarina -= dt;

  // Kentän lopussa pistelaskelman rivit ilmestyvät yksi kerrallaan.
  // Kun uusi rivi ilmestyy, kuuluu piippaus.
  const rivejaEnnen = naytettavatRivit();
  ruutuAika += dt;
  if (tila === "kenttaValmis" && naytettavatRivit() > rivejaEnnen) {
    aanet.laskuri();
  }

  if (tila === "kartta") paivitaKartta(dt);

  // Pelaaja ja vihut liikkuvat vain, kun pelataan
  if (tila !== "peli") return;

  // Kello käy (dt / 60, koska 60 ruutua = 1 sekunti)
  kentanAika += dt / 60;

  // Liikkuvat tasot liikkuvat ja kuljettavat pelaajia mukanaan
  for (const t of kentta.liikkuvatTasot) {
    t.aika += dt;
    // Math.sin heiluu -1 ja 1 välillä, joten taso heiluu edestakaisin
    const heilahdus = Math.sin(t.aika * t.nopeus);
    const uusiX = t.alkuX + heilahdus * t.matkaX;
    const uusiY = t.alkuY + heilahdus * t.matkaY;
    for (const pl of pelaajat) {
      if (pl.alusta === t) {
        pl.x += uusiX - t.x;
        pl.y += uusiY - t.y;
      }
    }
    t.x = uusiX;
    t.y = uusiY;
  }

  // 1.-6. Jokainen pelaaja liikkuu vuorollaan
  for (const pl of pelaajat) {
    pelaaja = pl;
    if (pl.haamu) paivitaHaamu(dt);
    else paivitaPelaaja(dt);
    if (tila !== "peli") return;
  }

  // Jouset palautuvat ja putoavat tasot putoavat
  for (const j of kentta.jouset) {
    if (j.painuma > 0) j.painuma--;
  }
  paivitaPutoavatTasot(dt);

  // 7. Kävelevät vihut
  for (const v of kentta.viholliset) {
    if (!v.elossa) {
      v.kuolinAika -= dt; // kuollut vihu näkyy hetken ja katoaa sitten
      if (v.tyyppi === "tippuja" || v.tyyppi === "ryomija") {
        // Hämähäkki ja gekko putoavat alas, kun ne tuhotaan
        v.vy += 0.5 * dt;
        v.y += v.vy * dt;
      }
      continue;
    }

    if (v.tyyppi === "laavapallo") {
      paivitaLaavapallo(v, dt);
    } else if (v.tyyppi === "tippuja") {
      paivitaTippuja(v, dt);
    } else if (v.tyyppi === "ryomija") {
      paivitaRyomija(v, dt);
    } else if (v.tyyppi === "pomppija") {
      paivitaPomppija(v, dt);
    } else if (TULIVIHUT.includes(v.tyyppi)) {
      paivitaTulivihu(v, dt); // tulivihut.js
    } else {
      // Kävellään edestakaisin
      v.x += v.nopeus * v.suunta * dt;
    }
    if (v.x < v.vasen) {
      v.x = v.vasen;
      v.suunta = 1; // käännytään oikealle
    }
    if (v.x > v.oikea) {
      v.x = v.oikea;
      v.suunta = -1; // käännytään vasemmalle
    }

    if (vihuOsuuPelaajiin(v)) return;
  }

  // 8. Lentävät vihut
  for (const v of kentta.lentovihut) {
    if (!v.elossa) {
      // Tuhottu lentovihu putoaa alas
      v.kuolinAika -= dt;
      v.vy += 0.5 * dt;
      v.y += v.vy * dt;
      continue;
    }

    // Lennetään edestakaisin
    v.x += v.nopeus * v.suunta * dt;
    if (v.x < v.vasen) {
      v.x = v.vasen;
      v.suunta = 1;
    }
    if (v.x > v.oikea) {
      v.x = v.oikea;
      v.suunta = -1;
    }

    // Heilutaan ylös ja alas
    v.aika += dt;
    v.y = v.alkuY + Math.sin(v.aika * 0.05) * v.heilunta;

    if (vihuOsuuPelaajiin(v)) return;
  }

  // 8b. Laava, liekkisuihkut ja tykit (tulivuori.js)
  if (paivitaTulivuori(dt)) return;

  // 8c. Pomo
  if (paivitaPomo(dt)) return;

  // 9. Tulipallot lentävät
  const kaikkiVihut = kentta.viholliset.concat(kentta.lentovihut);
  for (const t of tulipallot) {
    t.x += TULIPALLON_NOPEUS * t.suunta * dt;
    t.matka += TULIPALLON_NOPEUS * dt;

    // Lensikö pallo liian pitkälle? Se sammuu savupilveksi.
    if (t.matka > TULIPALLON_KANTAMA) {
      t.elossa = false;
      lisaaHiukkasia(t.x + 8, t.y + 8, 6, ["#888", "#bbb", "orange"], 2);
    }

    // Osuuko pallo vihuun? Vihu palaa ja pallo sammuu.
    for (const v of kaikkiVihut) {
      if (t.elossa && v.elossa && !v.piilossa && osuu(t, v)) {
        t.elossa = false;
        if (v.tulenkestava) {
          // Tuli ei tehoa tuleen: pallo vain sihahtaa
          lisaaHiukkasia(t.x + 8, t.y + 8, 8, ["#888", "#bbb"], 2);
        } else {
          tuhoaVihu(v, true);
        }
      }
    }

    // Osuuko pallo pomoon? Pomoon voi osua vasta, kun pelaaja on
    // areenalla (portti kiinni). Muuten pallo vain sammuu.
    const pomo = kentta.pomo;
    if (pomo && pomo.elossa && t.elossa && osuu(t, pomo)) {
      if (pomo.tyyppi === "magma") {
        // Tuli ei tehoa Magmamörköön
        lisaaTeksti(t.x + 8, t.y - 10, "EI TEHOA!");
      } else if (!pomo.portti || porttiKiinni()) osuPomoon(VAHINKO_TULIPALLO);
      t.elossa = false;
      lisaaHiukkasia(t.x + 8, t.y + 8, 8, ["orange", "#ff3c00"], 3);
    }

    // Osuuko pallo seinään? Pieni "pöks" ja pallo sammuu.
    for (const taso of kentta.kaikkiTasot) {
      if (taso.eiKiintea) continue;
      if (t.elossa && osuu(t, taso)) {
        t.elossa = false;
        lisaaHiukkasia(t.x + 8, t.y + 8, 8, ["orange", "#ff3c00"], 3);
      }
    }

    // Lensikö pallo tosi kauas ukosta (ulos ruudulta)?
    if (Math.abs(t.x - t.omistaja.x) > canvas.width) {
      t.elossa = false;
    }
  }
  // Pidetään listassa vain pallot, jotka ovat vielä elossa
  tulipallot = tulipallot.filter((t) => t.elossa);

  // 10.-12. Jokainen pelaaja kerää kolikoita ja sydämiä
  for (const pl of elavatPelaajat()) {
    pelaaja = pl;
    keraaAsiat();
    if (tila !== "peli") return;
  }

  // 10c. Salaiset luolat: kun ukko on luolassa, kallio muuttuu läpinäkyväksi
  for (const l of kentta.salaisetLuolat) {
    const sisalla = elavatPelaajat().some((pl) => osuu(pl, l.sisus));
    const tavoite = sisalla ? 0.15 : 1; // kuinka näkyvä kallio on
    l.nakyvyys += (tavoite - l.nakyvyys) * Math.min(1, 0.12 * dt);
    if (sisalla && !l.loydetty) {
      l.loydetty = true;
      aanet.salaisuus();
      lisaaTeksti(l.x + l.leveys / 2, l.y - 10, "SALAINEN LUOLA!");
    }
  }
}

// Haamu herää henkiin yhdellä elämällä kaverinsa (pelaaja) vieressä
function herataHaamu(haamu) {
  haamu.haamu = false;
  haamu.elamat = 1;
  nollaaLiike(haamu);
  haamu.x = pelaaja.x;
  haamu.y = pelaaja.y;
  haamu.suojaAika = SUOJA_AIKA;
  haamu.tuli = TULI_MAX;
  lisaaHiukkasia(haamu.x + 10, haamu.y + 20, 20, ["white", "gold", "#5aa0ff"], 4);
}

// Kolikot, sydämet, välitallennus ja maali (pelaaja = se, jota käsitellään)
function keraaAsiat() {
  // 10. Kerätään kolikot
  for (const k of kentta.kolikot) {
    if (!k.keratty && osuu(pelaaja, k)) {
      k.keratty = true;
      kentanKolikot++;
      pisteet += PISTEET_KOLIKKO;
      aanet.kolikko();
      lisaaHiukkasia(k.x + 10, k.y + 10, 12, ["gold", "yellow", "white"], 3);
      lisaaTeksti(k.x + 10, k.y, "+" + PISTEET_KOLIKKO);
    }
  }

  // 10b. Kerätään sydämet
  for (const sydan of kentta.sydamet) {
    if (!sydan.keratty && osuu(pelaaja, sydan)) {
      sydan.keratty = true;
      const keskiX = sydan.x + sydan.leveys / 2;
      const toinen = toinenPelaaja(pelaaja);
      if (toinen && toinen.haamu) {
        // Sydän herättää haamukaverin henkiin!
        herataHaamu(toinen);
        lisaaTeksti(keskiX, sydan.y - 5, "PELAAJA " + toinen.numero + " HERÄSI!");
      } else if (pelaaja.elamat < ELAMIA_ALUSSA) {
        pelaaja.elamat++; // elämä takaisin!
        lisaaTeksti(keskiX, sydan.y - 5, "+1 ELÄMÄ");
      } else {
        // Elämät ovat jo täynnä: saadaan pisteitä
        pisteet += PISTEET_SYDAN_TAYSI;
        lisaaTeksti(keskiX, sydan.y - 5, "+" + PISTEET_SYDAN_TAYSI);
      }
      aanet.sydan();
      lisaaHiukkasia(keskiX, sydan.y + 12, 25, ["#e63946", "#ff8fa3", "white"], 4);
    }
  }

  // 11. Välitallennus
  const vt = kentta.valitallennus;
  if (!vt.aktiivinen && osuu(pelaaja, vt)) {
    vt.aktiivinen = true;
    aanet.valitallennus();
    lisaaHiukkasia(vt.x + 10, vt.y + 10, 20, ["#e63946", "white", "gold"], 4);
    lisaaTeksti(vt.x + 10, vt.y - 10, "Välitallennus!");

    // Kaksinpelissä lippu herättää haamukaverin henkiin yhdellä elämällä
    const toinen = toinenPelaaja(pelaaja);
    if (toinen && toinen.haamu) {
      herataHaamu(toinen);
      lisaaTeksti(vt.x + 10, vt.y - 35, "PELAAJA " + toinen.numero + " HERÄSI!");
    }
  }

  // 12. Päästiinkö maaliin? (Jos kentässä on pomo, se pitää voittaa ensin.)
  if (maaliAuki() && osuu(pelaaja, kentta.maali)) {
    aanet.kenttaValmis();
    lisaaHiukkasia(
      kentta.maali.x + 10,
      kentta.maali.y,
      40,
      ["#e63946", "gold", "white", "#4fa8e0"],
      6,
    );
    laskeKentanTulos();
    tila = "kenttaValmis";
    ruutuAika = 0;
  }
}

// Yhden pelaajan liikkuminen (pelaaja = se, jota käsitellään juuri nyt)
function paivitaPelaaja(dt) {
  // Tulimittari täyttyy hitaasti
  pelaaja.tuli = Math.min(TULI_MAX, pelaaja.tuli + TULI_LATAUS * dt);
  if (pelaaja.tuliVilkkuu > 0) pelaaja.tuliVilkkuu -= dt;

  // Suoja-aika vähenee koko ajan
  if (pelaaja.suojaAika > 0) pelaaja.suojaAika -= dt;

  // Muistetaan, missä pelaaja oli ennen liikkumista
  pelaaja.edellinenY = pelaaja.y;

  // 1. Luetaan napit
  pelaaja.vx = 0;
  if (pelaaja.odotaNostoa) {
    // Kuoleman jälkeen odotetaan, että kaikki liikenapit ovat ylhäällä
    const pohjassa =
      painettu(pelaaja, "vasen") || painettu(pelaaja, "oikea") || hyppyNappiPohjassa();
    if (!pohjassa) pelaaja.odotaNostoa = false;
  }
  if (!pelaaja.odotaNostoa && painettu(pelaaja, "vasen")) pelaaja.vx = -NOPEUS;
  if (!pelaaja.odotaNostoa && painettu(pelaaja, "oikea")) pelaaja.vx = NOPEUS;

  // Seinähypyn jälkeen ukko lentää hetken seinästä poispäin,
  // vaikka nuolinäppäin olisi pohjassa seinää kohti.
  if (pelaaja.potkuAika > 0) {
    pelaaja.potkuAika -= dt;
    pelaaja.vx = pelaaja.suunta * NOPEUS;
  }
  if (pelaaja.vx > 0) pelaaja.suunta = 1;
  if (pelaaja.vx < 0) pelaaja.suunta = -1;

  const hyppyNappi = !pelaaja.odotaNostoa && hyppyNappiPohjassa();
  const hyppyPainettiin = hyppyNappi && !pelaaja.hyppyNappiEnnen; // painettiin juuri nyt
  pelaaja.hyppyNappiEnnen = hyppyNappi;
  pelaaja.seina = pelaaja.maassa ? 0 : seinaVieressa();

  if (hyppyNappi && pelaaja.maassa) {
    pelaaja.vy = -HYPPYVOIMA;
    pelaaja.maassa = false;
    pelaaja.hyppaa = true;
    pelaaja.venytys = 0.3; // ukko venyy pitkäksi, kun se ponnistaa
    aanet.hyppy();
  } else if (hyppyPainettiin && pelaaja.seina !== 0) {
    // SEINÄHYPPY! Ponnistetaan ylös ja poispäin seinästä.
    pelaaja.vy = -SEINAHYPYN_VOIMA;
    pelaaja.suunta = -pelaaja.seina;
    pelaaja.potkuAika = SEINAPOTKU_AIKA;
    pelaaja.vx = pelaaja.suunta * NOPEUS;
    pelaaja.hyppaa = true;
    pelaaja.venytys = 0.3;
    const seinanX = pelaaja.seina === 1 ? pelaaja.x + pelaaja.leveys : pelaaja.x;
    lisaaHiukkasia(seinanX, pelaaja.y + 20, 8, ["#ddd", "#bbb", "#a0805a"], 3);
    aanet.seinahyppy();
  }

  // Säädettävä hyppy: jos hyppynapin päästää irti kesken nousun,
  // nousu loppuu aikaisemmin. Lyhyt painallus = pieni hyppy.
  if (!hyppyNappi && pelaaja.hyppaa && pelaaja.vy < -HYPPYVOIMA / 3) {
    pelaaja.vy = -HYPPYVOIMA / 3;
  }

  // 2. Painovoima vetää alaspäin
  pelaaja.vy += PAINOVOIMA * dt;
  if (pelaaja.vy > MAX_PUTOAMIS) pelaaja.vy = MAX_PUTOAMIS;

  // Seinäliuku: kun ukko putoaa ja painaa seinää kohti, se liukuu hitaasti alas
  pelaaja.liukuu =
    pelaaja.seina !== 0 && pelaaja.vy > 0 && pelaaja.vx * pelaaja.seina > 0;
  if (pelaaja.liukuu) {
    pelaaja.vy = Math.min(pelaaja.vy, SEINALIUKU_NOPEUS);
    pelaaja.suunta = pelaaja.seina; // ukko katsoo seinää kohti
    if (Math.random() < 0.15 * dt) {
      const seinanX = pelaaja.seina === 1 ? pelaaja.x + pelaaja.leveys : pelaaja.x;
      lisaaHiukkasia(seinanX, pelaaja.y + 30, 1, ["#ddd", "#a0805a"], 1);
    }
  }

  // 4. Liikutaan sivuttain ja tarkistetaan seinät
  pelaaja.x += pelaaja.vx * dt;
  for (const t of kentta.kaikkiTasot) {
    if (t.eiKiintea) continue; // putoava taso ei enää pysäytä
    if (osuu(pelaaja, t)) {
      if (pelaaja.vx > 0) pelaaja.x = t.x - pelaaja.leveys; // törmäsi oikealla
      if (pelaaja.vx < 0) pelaaja.x = t.x + t.leveys; // törmäsi vasemmalla
    }
  }

  // Kaksinpelissä pelaajat eivät pääse liian kauas toisistaan,
  // jotta molemmat näkyvät aina ruudulla
  const toinen = toinenPelaaja(pelaaja);
  if (toinen && !toinen.haamu) {
    if (pelaaja.x > toinen.x + KAKSINPELIN_VALI) pelaaja.x = toinen.x + KAKSINPELIN_VALI;
    if (pelaaja.x < toinen.x - KAKSINPELIN_VALI) pelaaja.x = toinen.x - KAKSINPELIN_VALI;
  }

  // Ei päästetä pelaajaa kentän reunojen ulkopuolelle
  if (pelaaja.x < 0) pelaaja.x = 0;
  if (pelaaja.x + pelaaja.leveys > kentta.leveys) {
    pelaaja.x = kentta.leveys - pelaaja.leveys;
  }

  // 5. Liikutaan pystysuunnassa ja tarkistetaan lattia ja katto
  const oliIlmassa = !pelaaja.maassa;
  const putoamisNopeus = pelaaja.vy;
  pelaaja.y += pelaaja.vy * dt;
  pelaaja.maassa = false;
  pelaaja.alusta = null;
  let turvallinen = false; // seisooko ukko tavallisella (ei liikkuvalla) tasolla?
  for (const t of kentta.kaikkiTasot) {
    if (t.eiKiintea) continue; // putoava taso ei enää pysäytä
    if (osuu(pelaaja, t)) {
      if (pelaaja.vy > 0) {
        // Laskeuduttiin tason päälle
        pelaaja.y = t.y - pelaaja.korkeus;
        pelaaja.maassa = true;
        pelaaja.hyppaa = false;
        if (kentta.liikkuvatTasot.includes(t)) pelaaja.alusta = t;
        if (kentta.putoavatTasot.includes(t)) aloitaPutoaminen(t);
        turvallinen = !pelaaja.alusta && !kentta.putoavatTasot.includes(t);
      } else if (pelaaja.vy < 0) {
        // Pää kolahti tason alapintaan
        pelaaja.y = t.y + t.korkeus;
      }
      pelaaja.vy = 0;
    }
  }

  // Muistetaan turvallinen paikka (tänne kaveri syntyy kaksinpelissä)
  if (pelaaja.maassa && turvallinen) {
    pelaaja.turvaX = pelaaja.x;
    pelaaja.turvaY = pelaaja.y;
  }

  // Laskeutuessa ukko litistyy sitä enemmän, mitä kovempaa se tuli alas
  if (oliIlmassa && pelaaja.maassa) {
    pelaaja.venytys = -Math.min(0.35, putoamisNopeus / 30);
  }

  // Pölypilvi, kun laskeudutaan kovaa
  if (oliIlmassa && pelaaja.maassa && putoamisNopeus > 8) {
    lisaaHiukkasia(
      pelaaja.x + 10,
      pelaaja.y + pelaaja.korkeus,
      6,
      ["#ddd", "#bbb"],
      2,
    );
  }

  // 5b. Jouset
  tarkistaJouset();

  // 6. Putosiko pelaaja kuoppaan?
  if (pelaaja.y > canvas.height) menetaElama();
}


// Haamu leijuu kaverinsa perässä. Se ei voi kerätä mitään eikä satuttaa ketään.
function paivitaHaamu(dt) {
  pelaaja.suojaAika = 0;
  const toinen = toinenPelaaja(pelaaja);
  if (!toinen) return;
  const kohdeX = toinen.x - toinen.suunta * 35;
  const kohdeY = toinen.y - 45;
  pelaaja.x += (kohdeX - pelaaja.x) * Math.min(1, 0.06 * dt);
  pelaaja.y += (kohdeY - pelaaja.y) * Math.min(1, 0.06 * dt);
  pelaaja.suunta = toinen.x > pelaaja.x ? 1 : -1;
  pelaaja.vx = 0;
  pelaaja.maassa = false;
  pelaaja.alusta = null;
}

// Maali on auki, jos kentässä ei ole pomoa tai pomo on voitettu
function maaliAuki() {
  return !kentta.pomo || !kentta.pomo.elossa;
}

// Kuinka monta pistelaskelman riviä näytetään (yksi lisää noin puolen sekunnin välein)
function naytettavatRivit() {
  const rivit = Math.floor((ruutuAika - 40) / 30) + 1;
  return Math.max(0, Math.min(rivit, tulos.length));
}

// Liikuttaa hiukkasia ja tekstejä ja poistaa vanhat
function paivitaHiukkaset(dt) {
  for (const h of hiukkaset) {
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.vy += 0.3 * dt; // painovoima vetää hiukkasia alas
    h.elinaika -= dt;
  }
  hiukkaset = hiukkaset.filter((h) => h.elinaika > 0);

  for (const t of tekstit) {
    t.y -= 1 * dt; // teksti leijuu ylös
    t.elinaika -= dt;
  }
  tekstit = tekstit.filter((t) => t.elinaika > 0);
}

// Siirtää kameraa niin, että pelaaja on ruudun keskellä
function paivitaKamera(dt) {
  if (dt === undefined) dt = 1;
  if (tila === "alku") {
    kameraX = 0;
    return;
  }
  let kohde;
  const elavat = elavatPelaajat();
  if (elavat.length === 2) {
    // Kaksinpeli: kamera katsoo pelaajien puoliväliin
    const keskikohta = (elavat[0].x + elavat[1].x) / 2 + elavat[0].leveys / 2;
    kohde = keskikohta - canvas.width / 2;
  } else {
    // Kamera katsoo vähän eteenpäin siihen suuntaan, johon ukko katsoo
    const p = elavat[0] || pelaaja1;
    kohde = p.x + p.leveys / 2 - canvas.width / 2 + p.suunta * KAMERAN_ENNAKKO;
  }
  if (kameraHyppaa) {
    kameraX = kohde; // kentän alussa kamera on heti oikeassa kohdassa
    kameraHyppaa = false;
  } else {
    // Kamera liukuu kohti kohdetta: joka hetki pieni pala jäljellä olevasta matkasta
    kameraX += (kohde - kameraX) * Math.min(1, KAMERAN_PEHMEYS * dt);
  }

  // Ei näytetä mitään kentän reunojen ulkopuolelta
  if (kameraX < 0) kameraX = 0;
  if (kameraX > kentta.leveys - canvas.width) {
    kameraX = kentta.leveys - canvas.width;
  }
}

// ---------- PIIRTÄMINEN ----------

// Sydän pikselitaiteena, samaan tapaan kuin Piskelissä:
// K = musta reuna, R = punainen, W = valkoinen kiilto, . = tyhjä
const SYDAN = [
  ".KK...KK.",
  "KRRK.KRRK",
  "KRWRKRRRK",
  "KRRRRRRRK",
  ".KRRRRRK.",
  "..KRRRK..",
  "...KRK...",
  "....K....",
];

// Piirtää sydämen. taysi = false piirtää harmaan (menetetyn) sydämen.
function piirraSydan(x, y, taysi) {
  const koko = 3; // yksi "pikseli" on 3 x 3 oikeaa pikseliä
  const varit = {
    K: "black",
    R: taysi ? "#e63946" : "#777",
    W: taysi ? "white" : "#999",
  };
  for (let rivi = 0; rivi < SYDAN.length; rivi++) {
    for (let sarake = 0; sarake < SYDAN[rivi].length; sarake++) {
      const merkki = SYDAN[rivi][sarake];
      if (merkki === ".") continue; // tyhjää kohtaa ei piirretä
      ctx.fillStyle = varit[merkki];
      ctx.fillRect(x + sarake * koko, y + rivi * koko, koko, koko);
    }
  }
}

// Piirtää surullisen naaman, jonka keskikohta on (x, y)
function piirraSuruNaama(x, y) {
  // Keltainen pää
  ctx.fillStyle = "gold";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Silmät
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x - 18, y - 12, 6, 0, Math.PI * 2);
  ctx.arc(x + 18, y - 12, 6, 0, Math.PI * 2);
  ctx.fill();

  // Kyynel valuu vasemmasta silmästä
  ctx.fillStyle = "#4fa8e0";
  ctx.beginPath();
  ctx.arc(x - 18, y + 8, 5, 0, Math.PI * 2);
  ctx.fill();

  // Suu kaartuu alaspäin (pala ympyrän yläreunaa)
  ctx.beginPath();
  ctx.arc(x, y + 35, 22, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
}

// Kirjoittaa tekstin, jolla on musta reuna (näkyy hyvin joka taustalla)
// vari on vapaaehtoinen: jos sitä ei anneta, teksti on valkoinen
function reunaTeksti(teksti, x, y, koko, tasaus, vari) {
  // Useimmiten teksti on piirretty jo valmiiksi (valmiskuvat.js), ja se vain kopioidaan
  if (piirraValmisTeksti(String(teksti), x, y, koko, tasaus, vari || "white")) return;
  piirraTekstiReunalla(ctx, teksti, x, y, koko, tasaus, vari);
}

// Piirtää tekstin, jolla on musta reunaviiva (c = mihin piirretään)
function piirraTekstiReunalla(c, teksti, x, y, koko, tasaus, vari) {
  c.font = "bold " + koko + "px sans-serif";
  c.textAlign = tasaus;
  c.lineWidth = Math.max(3, koko / 6);
  c.lineJoin = "round"; // pyöreät kulmat, ettei kirjaimiin (esim. M) tule piikkejä
  c.strokeStyle = "black";
  c.fillStyle = vari || "white"; // || = "tai": jos väriä ei ole, käytetään valkoista
  c.strokeText(teksti, x, y);
  c.fillText(teksti, x, y);
}

function piirraTausta(aika) {
  const varit = kentta.varit;

  // Taivas: liukuväri ylhäältä alas (valmiskuvat.js)
  ctx.imageSmoothingEnabled = true; // venytetty liukuväri pysyy pehmeänä
  ctx.drawImage(taivasKuva(varit.taivasYla, varit.taivasAla), 0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  piirraTahdet(aika);

  // Luolassa ei näy aurinkoa eikä pilviä, vain mäet (luolan seinät)
  if (!kentta.luola) piirraAurinkoJaPilvet(aika);

  // Mäet: kaukaiset liikkuvat hitaasti, lähemmät vähän nopeammin.
  // Tämä saa aikaan syvyyden tunteen (sitä kutsutaan nimellä "parallaksi").
  piirraMaet(varit.maetKauka, 200, 160, 0.3, 0);
  piirraMaet(varit.maetLahi, 170, 110, 0.5, 150);
  piirraKuuset(varit.puut);
}

function piirraAurinkoJaPilvet(aika) {
  // Aurinko
  ctx.fillStyle = kentta.varit.aurinko;
  ctx.beginPath();
  ctx.arc(720, 70, 35, 0, Math.PI * 2);
  ctx.fill();
  if (kentta.tulivuoriTausta) piirraTulivuoriTausta(aika); // tulivuori.js

  // Pilvet (piirretään 3 kertaa isompina).
  // Pilvet liikkuvat kameran mukana vain vähän (0.2), koska ne ovat kaukana.
  // Kun pilvi menee oikeasta reunasta ulos, se tulee takaisin vasemmalta.
  const pilvenLeveys = 32 * 3;
  const kierros = canvas.width + pilvenLeveys;
  for (const p of pilvet) {
    let x = (p.x - kameraX * 0.2) % kierros;
    if (x < 0) x += kierros;
    ctx.drawImage(kuvat.pilvi, x - pilvenLeveys, p.y, pilvenLeveys, 12 * 3);
  }
}

// Piirtää rivin mäkiä. nopeus kertoo, kuinka paljon mäet liikkuvat
// kameran mukana (1 = yhtä nopeasti kuin kenttä, 0 = ei ollenkaan)
function piirraMaet(vari, leveys, korkeus, nopeus, siirto) {
  const vali = 300; // mäkien väli
  const alku = -((kameraX * nopeus + siirto) % vali) - vali; // ensimmäisen mäen keskikohta
  // Mäkirivi on piirretty valmiiksi (valmiskuvat.js), joten se vain siirretään paikalleen
  ctx.imageSmoothingEnabled = true; // mäet liukuvat pehmeästi
  ctx.drawImage(maetKuva(vari, leveys, korkeus, vali), alku - leveys, canvas.height - korkeus);
  ctx.imageSmoothingEnabled = false;
}

function piirraTaso(t) {
  // Taso on piirretty valmiiksi (valmiskuvat.js), joten se vain kopioidaan
  const valmis = tasonKuva(t);
  if (valmis) {
    ctx.drawImage(valmis, t.x, t.y);
    return;
  }
  // Kuvat eivät ole vielä latautuneet: piirretään laatta kerrallaan
  const laatta = 16 * ZOOM; // yhden laatan koko ruudulla

  // "Leikataan" piirtoalue tason kokoiseksi, ettei laattoja piirry yli reunojen
  ctx.save();
  ctx.beginPath();
  ctx.rect(t.x, t.y, t.leveys, t.korkeus);
  ctx.clip();

  for (let y = t.y; y < t.y + t.korkeus; y += laatta) {
    for (let x = t.x; x < t.x + t.leveys; x += laatta) {
      // Ylimmässä rivissä on nurmea, alemmissa pelkkää multaa
      const kuva = laattaKuva(y === t.y); // nurmea ylimpänä, multaa alempana
      ctx.drawImage(kuva, x, y, laatta, laatta);
    }
  }
  ctx.restore();

  // Musta reunaviiva tason ympärille
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(t.x + 1, t.y + 1, t.leveys - 2, t.korkeus - 2);
}

// Onko asia (esim. kolikko tai sydän) piilossa salaisessa luolassa,
// jota ei ole vielä avattu? Silloin sen valo ei saa paljastaa sitä.
function piilossaLuolassa(asia) {
  for (const l of kentta.salaisetLuolat) {
    if (l.nakyvyys > 0.5 && osuu(asia, l.sisus)) return true;
  }
  return false;
}

// Salaisen luolan kallio piirretään ukon PÄÄLLE, jotta luolan sisältö
// on piilossa. Kun ukko menee sisään, kallio muuttuu läpinäkyväksi.
function piirraLuola(l) {
  if (l.nakyvyys < 0.01) return;
  const laatta = 16 * ZOOM;

  ctx.save();
  ctx.globalAlpha = l.nakyvyys;
  // Kallion laatat on piirretty valmiiksi (valmiskuvat.js)
  const valmis = tasonKuva(l, false);
  if (valmis) {
    ctx.drawImage(valmis, l.x, l.y);
  } else {
    ctx.beginPath();
    ctx.rect(l.x, l.y, l.leveys, l.korkeus);
    ctx.clip();
    for (let y = l.y; y < l.y + l.korkeus; y += laatta) {
      for (let x = l.x; x < l.x + l.leveys; x += laatta) {
        const kuva = laattaKuva(y === l.y);
        ctx.drawImage(kuva, x, y, laatta, laatta);
      }
    }
  }

  // Pieni halkeama valeseinässä. Tarkkasilmäinen huomaa sen!
  const hx = l.aukko === "oikea" ? l.x + l.leveys - 18 : l.x + 18;
  const hy = l.y + LUOLAN_KATTO + 15;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx - 5, hy + 12);
  ctx.lineTo(hx + 3, hy + 22);
  ctx.lineTo(hx - 2, hy + 34);
  ctx.stroke();

  // Musta reunaviiva
  ctx.strokeStyle = "black";
  ctx.strokeRect(l.x + 1, l.y + 1, l.leveys - 2, l.korkeus - 2);
  ctx.restore();
}

// Putoava taso näyttää haljenneelta puulta. Kun se on putoamassa, se tärisee.
function piirraPutoavaTaso(t) {
  let x = Math.round(t.x);
  const y = Math.round(t.y);
  if (!t.putoaa && t.ajastin > 0) x += Math.round((Math.random() - 0.5) * 4);
  if (y > canvas.height) return; // pudonnut ruudun alle

  ctx.fillStyle = "#b5651d";
  ctx.fillRect(x, y, t.leveys, t.korkeus);
  ctx.fillStyle = "#d9904a"; // vaalea raita
  ctx.fillRect(x, y + 2, t.leveys, 3);
  // Halkeamat
  ctx.strokeStyle = "#5a2d0c";
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

// Liikkuva taso näyttää puulankulta
function piirraLiikkuvaTaso(t) {
  const x = Math.round(t.x);
  const y = Math.round(t.y);
  ctx.fillStyle = "#c68642"; // puun väri
  ctx.fillRect(x, y, t.leveys, t.korkeus);
  ctx.fillStyle = "#e0a96d"; // vaalea raita yläreunassa
  ctx.fillRect(x, y + 2, t.leveys, 3);
  ctx.fillStyle = "#8b5a2b"; // lankkujen välit
  for (let rako = x + 20; rako < x + t.leveys; rako += 20) {
    ctx.fillRect(rako, y, 2, t.korkeus);
  }
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, t.leveys - 2, t.korkeus - 2);
}

function piirraPelaaja(aika) {
  // Suojassa ukko vilkkuu: joka toisella hetkellä sitä ei piirretä ollenkaan
  if (!pelaaja.haamu && pelaaja.suojaAika > 0 && Math.floor(aika / 100) % 2 === 0) return;
  const kuva = pelaaja.numero === 2 ? kuvat.ukko2 : kuvat.ukko;

  // Valitaan ukon ruutu:
  // ilmassa = ruutu 1 (jalat harallaan), kävellessä vaihdellaan 0 ja 1
  let ruutu = 0;
  if (!pelaaja.maassa) {
    ruutu = 1;
  } else if (pelaaja.vx !== 0) {
    ruutu = Math.floor(aika / 150) % 2;
  }

  // Ukon kuvassa jalat osoittavat vasemmalle, joten oikealle
  // mennessä kuva peilataan.
  const peilaa = pelaaja.suunta === 1;

  // Kuvassa on tyhjää tilaa ukon ympärillä. Nämä luvut siirtävät
  // kuvaa niin, että ukon vartalo osuu täsmälleen törmäyslaatikkoon.
  const vasenReuna = peilaa ? 12 : 10; // missä sarakkeessa vartalo alkaa
  const jalkojenAlareuna = [26, 30][ruutu]; // millä rivillä jalat loppuvat

  const x = pelaaja.x - vasenReuna * ZOOM;
  const y = pelaaja.y + pelaaja.korkeus - jalkojenAlareuna * ZOOM;

  // Venytys ja litistys: kuvaa skaalataan jalkojen keskikohdan ympäri.
  // Kun ukko venyy pitkäksi, se samalla kapenee (ja toisin päin).
  const jalatX = pelaaja.x + pelaaja.leveys / 2;
  const jalatY = pelaaja.y + pelaaja.korkeus;
  ctx.save();
  if (pelaaja.haamu) {
    // Haamu on läpinäkyvä, vaalea ja leijuu ylös alas
    ctx.globalAlpha = 0.45;
    ctx.translate(0, Math.sin(aika / 300) * 4);
  }
  ctx.translate(jalatX, jalatY);
  ctx.scale(1 - pelaaja.venytys * 0.6, 1 + pelaaja.venytys);
  // Haamu on harmaa ja vaalea (suodatettu kuva on laskettu valmiiksi, valmiskuvat.js)
  const piirrettava = pelaaja.haamu ? suodatettu(kuva, "grayscale(1) brightness(1.8)") : kuva;
  piirraRuutu(piirrettava, ruutu, 32, 32, x - jalatX, y - jalatY, peilaa);
  ctx.restore();

  // Kaksinpelissä pään yläpuolella on pelaajan numero
  if (kaksinpeli) {
    const vari = pelaaja.numero === 2 ? "#5aa0ff" : "#3ddc3d";
    reunaTeksti(String(pelaaja.numero), jalatX, pelaaja.y - 8, 14, "center", pelaaja.haamu ? "#ccc" : vari);
  }
}

// Piirtää kaikki pelaajat. Haamu piirretään ensin, jotta elävä ukko on sen päällä.
function piirraPelaajat(aika) {
  const jarjestys = pelaajat.slice().sort((a, b) => (b.haamu ? 1 : 0) - (a.haamu ? 1 : 0));
  for (const pl of jarjestys) {
    pelaaja = pl;
    piirraPelaaja(aika);
  }
}

// Piikkis ja pomppija: kuvat ovat 16 x 16
function piirraUusiVihu(v, aika) {
  if (!v.elossa && v.kuolinAika <= 0) return;
  const kuva = v.tyyppi === "piikkis" ? kuvat.piikkis : kuvat.pomppija;
  const x = v.x - 3;
  const y = v.y + v.korkeus - 32; // jalat kuvan alareunassa

  let ruutu = 0;
  if (v.tyyppi === "piikkis") ruutu = Math.floor(aika / 150) % 2; // jalat liikkuvat
  if (v.tyyppi === "pomppija" && v.vy !== 0) ruutu = 1; // ilmassa venynyt

  ctx.save();
  if (!v.elossa && v.palanut) {
    ctx.globalAlpha = v.kuolinAika / 40;
  } else if (!v.elossa) {
    // Litistynyt: matala lytty maassa
    ctx.drawImage(kuva, 0, 0, 16, 16, x, v.lattia - 10, 32, 10);
    ctx.restore();
    return;
  }
  // Piikkiksen kuva katsoo vasemmalle, joten oikealle mennessä peilataan
  const piirrettava = !v.elossa && v.palanut ? suodatettu(kuva, "brightness(0.2)") : kuva; // palanut = melkein musta
  piirraRuutu(piirrettava, ruutu, 16, 16, x, y, v.suunta === 1);
  ctx.restore();
}

// Tippuja: hämähäkki langan päässä
function piirraTippuja(v, aika) {
  if (!v.elossa && v.kuolinAika <= 0) return;
  const keskiX = v.x + v.leveys / 2;
  let x = v.x - 3;
  const y = v.y - 4;

  if (v.elossa) {
    // Lanka katosta hämähäkkiin
    ctx.strokeStyle = "rgba(235, 235, 235, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(keskiX, v.katto);
    ctx.lineTo(keskiX, v.y + 4);
    ctx.stroke();
  }
  if (v.tila === "tarisee") x += Math.sin(aika / 15) * 3; // tärisee ennen tippumista

  // Jalat heiluvat nopeasti, kun hämähäkki liikkuu, ja hitaasti, kun se roikkuu
  const nopea = v.tila !== "roikkuu";
  const ruutu = Math.floor(aika / (nopea ? 100 : 400)) % 2;

  ctx.save();
  if (!v.elossa) {
    if (v.palanut) ctx.globalAlpha = Math.max(0, v.kuolinAika / 40);
    // Tuhottu hämähäkki putoaa ylösalaisin
    ctx.translate(0, y * 2 + 32);
    ctx.scale(1, -1);
  }
  const kuva = !v.elossa && v.palanut ? suodatettu(kuvat.tippuja, "brightness(0.2)") : kuvat.tippuja;
  piirraRuutu(kuva, ruutu, 16, 16, x, y, false);
  ctx.restore();
}

// Seinäryömijä: gekko, joka kiipeää seinällä. Alas mennessä pää osoittaa alas.
function piirraRyomija(v, aika) {
  if (!v.elossa && v.kuolinAika <= 0) return;
  const ruutu = Math.floor(aika / 150) % 2;
  const peilaa = v.seina === "oikea"; // kuvassa seinä on vasemmalla
  const x = peilaa ? v.x + v.leveys - 32 : v.x;
  const y = v.y - 3;

  ctx.save();
  if (!v.elossa && v.palanut) ctx.globalAlpha = Math.max(0, v.kuolinAika / 40);
  // Käännetään ylösalaisin, kun gekko menee alas (tai kun se on tuhottu)
  if (v.suunta === 1 || !v.elossa) {
    ctx.translate(0, y * 2 + 32);
    ctx.scale(1, -1);
  }
  const kuva = !v.elossa && v.palanut ? suodatettu(kuvat.ryomija, "brightness(0.2)") : kuvat.ryomija;
  piirraRuutu(kuva, v.elossa ? ruutu : 0, 16, 16, x, y, peilaa);
  ctx.restore();
}

function piirraViholliset(aika) {
  const vihunRuutu = Math.floor(aika / 200) % 2;
  const kuvanKorkeus = 32 * ZOOM;

  piirraTulivihujenAmmukset(aika); // laavajäljet ja tulisylyt (tulivihut.js)
  for (const v of kentta.viholliset) {
    if (!naytolla(v.x, v.leveys || 32)) continue; // ruudun ulkopuolella olevia ei piirretä
    if (v.tyyppi === "laavapallo") {
      piirraLaavapallo(v, aika); // tulivuori.js
      continue;
    }
    if (TULIVIHUT.includes(v.tyyppi)) {
      piirraTulivihu(v, aika); // tulivihut.js
      continue;
    }
    if (v.tyyppi === "tippuja") {
      piirraTippuja(v, aika);
      continue;
    }
    if (v.tyyppi === "ryomija") {
      piirraRyomija(v, aika);
      continue;
    }
    if (v.tyyppi === "piikkis" || v.tyyppi === "pomppija") {
      piirraUusiVihu(v, aika);
      continue;
    }
    // Kuvassa on tyhjää vasemmalla puolella, siksi siirretään 6 pikseliä
    const x = v.x - 6 * ZOOM;

    if (v.elossa) {
      piirraRuutu(
        kuvat.vihu,
        vihunRuutu,
        32,
        32,
        x,
        v.lattia - kuvanKorkeus,
        false,
      );
    } else if (v.kuolinAika > 0 && v.palanut) {
      // Palanut vihu: muuttuu mustaksi ja haalenee pois
      ctx.globalAlpha = v.kuolinAika / 40; // 1 = näkyy kokonaan, 0 = näkymätön
      const tumma = suodatettu(kuvat.vihu, "brightness(0.2)"); // tummennettu kuva, melkein musta
      piirraRuutu(tumma, 0, 32, 32, x, v.lattia - kuvanKorkeus, false);
      ctx.globalAlpha = 1;
    } else if (v.kuolinAika > 0) {
      // Litistynyt vihu: piirretään matalaksi lytyksi
      const matala = kuvanKorkeus * 0.3;
      ctx.drawImage(
        kuvat.vihu,
        0,
        0,
        32,
        32,
        x,
        v.lattia - matala,
        32 * ZOOM,
        matala,
      );
    }
  }

  // Lentovihut: siivet räpyttävät nopeammin kuin kävelevän vihun jalat
  const siipiRuutu = Math.floor(aika / 120) % 2;
  for (const v of kentta.lentovihut) {
    if (!v.elossa && v.kuolinAika <= 0) continue;

    // Kuvassa nokka osoittaa vasemmalle, joten oikealle lentäessä peilataan
    const peilaa = v.suunta === 1;
    const x = v.x - (peilaa ? 7 : 5) * ZOOM;
    const y = v.y - 7 * ZOOM;

    if (v.elossa) {
      piirraRuutu(kuvat.lentovihu, siipiRuutu, 32, 32, x, y, peilaa);
    } else {
      // Tuhottu lentovihu putoaa ylösalaisin
      ctx.save();
      ctx.globalAlpha = Math.min(1, v.kuolinAika / 20);
      const kuva = v.palanut ? suodatettu(kuvat.lentovihu, "brightness(0.2)") : kuvat.lentovihu;
      ctx.translate(x, y + 32 * ZOOM);
      ctx.scale(1, -1); // -1 kääntää kuvan ylösalaisin
      piirraRuutu(kuva, 0, 32, 32, 0, 0, peilaa);
      ctx.restore();
    }
  }
}

function piirraPomo(aika) {
  const p = kentta.pomo;
  if (!p) return;
  if (p.tyyppi === "magma") return piirraMagma(p, aika); // tulivuori.js
  piirraKivetJaAallot(p, aika);
  if (!p.elossa && p.kuolinAika <= 0) return;

  // Valitaan ruutu:
  // 0-5 = parta heiluu (osuma), 6-7 = kävely, 0 = seisoo paikallaan, 8 = nukkuu sängyssä
  let ruutu;
  if (p.elossa && !p.herannyt) {
    ruutu = 8;
  } else if (!p.elossa) {
    ruutu = Math.floor(aika / 60) % 6; // kaatuessa parta heiluu koko ajan
  } else if (p.kipu > 0) {
    ruutu = Math.min(5, Math.floor((36 - p.kipu) / 6));
  } else if (p.tila === "hyppaa") {
    ruutu = 7; // jalat harallaan ilmassa
  } else if (p.tila === "heittaa") {
    ruutu = 6 + (Math.floor(aika / 80) % 2); // heiluu heittäessä
  } else if (p.tila === "valmistautuu" || p.tila === "kyykistyy") {
    ruutu = 0;
  } else {
    const vauhti = p.tila === "ryntaa" ? 90 : 220; // ryntäys = jalat liikkuvat nopeammin
    ruutu = 6 + (Math.floor(aika / vauhti) % 2);
  }

  // Kuvassa vartalo alkaa sarakkeesta 20. Jalat ovat kuvan alareunassa.
  let x = p.x - 20 * ZOOM;
  let y = p.y + p.korkeus - 64 * ZOOM;
  const valmistautuu =
    p.elossa && (p.tila === "valmistautuu" || p.tila === "kyykistyy");
  if (valmistautuu) {
    x += (Math.random() - 0.5) * 6; // tärisee ennen hyökkäystä
  }
  if (p.elossa && p.tila === "kyykistyy") y += 8; // kyykky ennen hyppyä

  ctx.save();
  if (!p.elossa) {
    ctx.globalAlpha = Math.max(0, p.kuolinAika / 120); // haalenee pois
  }
  // Heti osuman jälkeen pomo välähtää valkoisena
  const kuva = p.elossa && p.kipu > 30 ? suodatettu(kuvat.isaukko, "brightness(2.5)") : kuvat.isaukko;
  // Nukkumiskuvaa ei peilata, jotta pää on aina samalla puolella
  const peilaa = ruutu !== 8 && p.suunta === 1;
  piirraRuutu(kuva, ruutu, 64, 64, x, y, peilaa);
  ctx.restore();

  // Punainen huutomerkki varoittaa ryntäyksestä ja hypystä
  if (valmistautuu) {
    reunaTeksti("!", p.x + p.leveys / 2, y - 5, 40, "center", "#ff3c3c");
  }
  // Nukkuva pomo kuorsaa. Pää on kuvassa vasemmalla, joten z-kirjaimet
  // nousevat pään yläpuolelta.
  if (p.elossa && !p.herannyt) {
    const z = Math.floor(aika / 400) % 3;
    reunaTeksti(
      "z".repeat(z + 1),
      x + 10 * ZOOM,
      y + 16 * ZOOM - z * 10,
      20,
      "left",
    );
  }
}

// Kivet ovat harmaita palloja, järistysaallot ruskeita pölykumpuja
function piirraKivetJaAallot(p, aika) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  for (const k of p.kivet) {
    const kx = k.x + 9;
    const ky = k.y + 9;
    ctx.fillStyle = "#8a8a8a";
    ctx.beginPath();
    ctx.arc(kx, ky, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#bdbdbd"; // vaalea kiilto
    ctx.fillRect(kx - 5, ky - 5, 4, 4);
  }

  for (const a of p.aallot) {
    const heilunta = Math.sin(aika / 40) * 3; // aalto vähän pomppii
    ctx.fillStyle = "#c9a36b";
    ctx.beginPath();
    ctx.ellipse(
      a.x + 12,
      a.y + a.korkeus,
      14,
      a.korkeus + heilunta,
      0,
      Math.PI,
      0,
    );
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#e8d3a8";
    ctx.fillRect(a.x + 8, a.y + 6 - heilunta, 6, 6);
  }
}

// Pomon elämäpalkki ruudun alareunassa
function piirraPomonPalkki() {
  const p = kentta.pomo;
  if (!p || !p.elossa || !p.herannyt) return;

  const leveys = 300;
  const x = canvas.width / 2 - leveys / 2;
  const y = canvas.height - 26;
  reunaTeksti(p.nimi, canvas.width / 2, y - 6, 18, "center", "#ffb3b3");
  ctx.fillStyle = "black";
  ctx.fillRect(x - 3, y - 3, leveys + 6, 18);
  ctx.fillStyle = "#555";
  ctx.fillRect(x, y, leveys, 12);
  ctx.fillStyle = p.kipu > 0 ? "white" : "#e63946";
  ctx.fillRect(x, y, leveys * (p.elamat / p.maxElamat), 12);
}

function piirraLippu(lippu, aika, harmaa) {
  const ruutu = Math.floor(aika / 300) % 2; // lippu liehuu
  // harmaa = ei vielä aktivoitu (harmaa kuva on laskettu valmiiksi, valmiskuvat.js)
  piirraRuutu(
    harmaa ? suodatettu(kuvat.lippu, "grayscale(1)") : kuvat.lippu,
    ruutu,
    16,
    32,
    lippu.x - 3,
    lippu.lattia - 32 * ZOOM,
    false,
  );
}

function piirraHiukkaset() {
  for (const h of hiukkaset) {
    ctx.globalAlpha = Math.min(1, h.elinaika / 20); // haalenee lopussa
    ctx.fillStyle = h.vari;
    ctx.fillRect(h.x, h.y, h.koko, h.koko);
  }
  ctx.globalAlpha = 1;

  for (const t of tekstit) {
    ctx.globalAlpha = Math.min(1, t.elinaika / 20);
    reunaTeksti(t.teksti, t.x, t.y, 18, "center");
  }
  ctx.globalAlpha = 1;
}

// Näkyykö kohta x...x+leveys ruudulla? Ruudun ulkopuolella olevia asioita
// ei kannata piirtää, koska kukaan ei näe niitä (vara = hehkut ym. reunan yli).
function naytolla(x, leveys, vara) {
  if (vara === undefined) vara = 120;
  return x + leveys > kameraX - vara && x < kameraX + canvas.width + vara;
}

// Piirtää kentän ja kaiken siinä olevan
function piirraMaailma(aika) {
  piirraTausta(aika);

  // Siirretään koko kenttää vasemmalle kameran verran.
  // Kaikki tämän ja ctx.restore()-rivin välissä piirretty liikkuu kameran mukana.
  ctx.save();
  ctx.translate(-Math.round(kameraX), 0);

  piirraLaavat(aika); // tulivuori.js
  for (const t of kentta.tasot) {
    if (!t.eiPiirreta && naytolla(t.x, t.leveys)) piirraTaso(t);
  }
  piirraTulisuihkut(aika);
  piirraTykitJaKuulat(aika);
  for (const t of kentta.liikkuvatTasot) if (naytolla(t.x, t.leveys)) piirraLiikkuvaTaso(t);
  for (const t of kentta.putoavatTasot) if (naytolla(t.x, t.leveys)) piirraPutoavaTaso(t);
  for (const j of kentta.jouset) {
    // Jousen kuvassa yläreuna on rivillä 3, siksi kuvaa siirretään ylös
    piirraRuutu(kuvat.jousi, j.painuma > 0 ? 1 : 0, 16, 16, j.x - 2, j.lattia - 32, false);
  }
  if (porttiKiinni()) piirraTaso(kentta.pomo.portti);

  // Kolikot pyörivät (ruutu vaihtuu) ja keinuvat ylös alas
  const kolikonRuutu = Math.floor(aika / 200) % 2;
  for (const k of kentta.kolikot) {
    if (k.keratty || !naytolla(k.x, k.leveys)) continue;
    const keinunta = Math.sin(aika / 300 + k.x) * 3;
    hehku(k.x + 10, k.y + 10 + keinunta, 22, "255, 220, 80", 0.35);
    ctx.drawImage(
      kuvat.kolikko,
      kolikonRuutu * 32,
      0,
      32,
      32,
      k.x - 6,
      k.y - 6 + keinunta,
      32,
      32,
    );
  }

  // Sydämet sykkivät ja keinuvat
  for (const sydan of kentta.sydamet) {
    if (sydan.keratty || !naytolla(sydan.x, sydan.leveys)) continue;
    const keskiX = sydan.x + sydan.leveys / 2;
    const keskiY = sydan.y + sydan.korkeus / 2 + Math.sin(aika / 400) * 4;
    const syke = 1 + Math.max(0, Math.sin(aika / 150)) * 0.15; // sydän sykkii
    hehku(keskiX, keskiY, 30, "255, 60, 80", 0.4);
    ctx.save();
    ctx.translate(keskiX, keskiY);
    ctx.scale(syke, syke);
    piirraSydan(-sydan.leveys / 2, -sydan.korkeus / 2, true);
    ctx.restore();
  }

  piirraLippu(kentta.valitallennus, aika, !kentta.valitallennus.aktiivinen);
  if (maaliAuki()) piirraLippu(kentta.maali, aika, false);
  piirraViholliset(aika);
  piirraPomo(aika);

  // Tulipallot: vaihdellaan kahta ruutua, jotta liekit lepattavat.
  // Oikealle lentävä käyttää ruutuja 0-1, vasemmalle lentävä ruutuja 3-4.
  const tuliRuutu = Math.floor(aika / 100) % 2;
  for (const t of tulipallot) {
    let ruutu = tuliRuutu;
    let siirto = 8; // kuvassa pallo alkaa 8 pikselin kohdalta
    if (t.suunta === -1) {
      ruutu = 3 + tuliRuutu;
      siirto = 9;
    }
    hehku(t.x + 8, t.y + 8, 40, "255, 130, 0", 0.6);
    // Viimeisellä 80 pikselillä pallo haalenee, ennen kuin se sammuu
    ctx.globalAlpha = Math.max(
      0.2,
      Math.min(1, (TULIPALLON_KANTAMA - t.matka) / 80),
    );
    ctx.drawImage(
      kuvat.tulipallo,
      ruutu * 32,
      0,
      32,
      32,
      t.x - siirto,
      t.y - 8,
      32,
      32,
    );
    ctx.globalAlpha = 1;
  }

  if (tila !== "alku") piirraPelaajat(aika);
  for (const l of kentta.salaisetLuolat) if (naytolla(l.x, l.leveys)) piirraLuola(l);
  piirraHiukkaset();

  // Lopetetaan kameran siirto: pisteet ja tekstit pysyvät paikallaan ruudulla
  ctx.restore();
}

// Pisteet, elämät ja kentän nimi ruudun yläreunassa
function piirraTiedot() {
  // Kolikot ja pisteet vasemmassa yläkulmassa
  ctx.drawImage(kuvat.kolikko, 0, 0, 32, 32, 8, 8, 32, 32);
  reunaTeksti(
    kentanKolikot + " / " + kentta.kolikot.length,
    44,
    33,
    24,
    "left",
  );
  reunaTeksti("Pisteet: " + pisteet, 12, 65, 20, "left", "gold");

  // Kentän nimi ja kello keskellä. Kello muuttuu punaiseksi,
  // kun tavoiteaika on mennyt ohi.
  const nimi = "Kenttä " + (kenttaNumero + 1) + ": " + kentta.nimi;
  reunaTeksti(nimi, canvas.width / 2, 30, 20, "center");
  const kellonVari = kentanAika > kentta.tavoiteAika ? "#ff6b6b" : "white";
  reunaTeksti(
    muotoileAika(kentanAika),
    canvas.width / 2,
    58,
    20,
    "center",
    kellonVari,
  );
  if (!aanetPaalla)
    reunaTeksti("Äänet pois (M)", canvas.width / 2, 80, 14, "center");

  // Elämät ja tulimittari oikeassa yläkulmassa. Kaksinpelissä pelaaja 2 on alempana.
  for (const pl of pelaajat) {
    const y = (pl.numero - 1) * 60;
    piirraElamat(pl, y);
    if (!pl.haamu) piirraTulimittari(pl, y);
  }
  piirraPomonPalkki();

  // R painettiin kerran: varoitus keskellä ruutua
  if (alustaVahvistus > 0 && tila === "peli") {
    const maailma = maailmanNumero(kenttaNumero) + 1;
    reunaTeksti(
      ohje("Paina R uudestaan:", "Paina ↻ uudestaan:") + " maailma " + maailma + " alkaa alusta!",
      canvas.width / 2,
      150,
      24,
      "center",
      "#ff8080",
    );
    reunaTeksti("(täydet elämät, mutta maailman kentät pitää pelata uudestaan)", canvas.width / 2, 178, 16, "center");
  }
}

// Pelaajan sydämet (y = kuinka paljon alemmas piirretään)
function piirraElamat(pl, y) {
  if (kaksinpeli) {
    const vari = pl.numero === 2 ? "#5aa0ff" : "#3ddc3d";
    reunaTeksti("P" + pl.numero, canvas.width - ELAMIA_ALUSSA * 34 - 16, y + 32, 18, "right", vari);
  }
  if (pl.haamu) {
    reunaTeksti("HAAMU", canvas.width - 10, y + 32, 20, "right", "#ccc");
    return;
  }
  for (let i = 0; i < ELAMIA_ALUSSA; i++) {
    const x = canvas.width - (ELAMIA_ALUSSA - i) * 34 - 6;
    piirraSydan(x, y + 12, i < pl.elamat);
  }
}

// Tulimittari sydänten alla. Mustat viivat näyttävät, kuinka monta
// tulipalloa mittarilla voi ampua.
function piirraTulimittari(pl, siirto) {
  const leveys = 98;
  const x = canvas.width - leveys - 8;
  const y = 44 + siirto;
  const tuli = pl.tuli;
  const tuliVilkkuu = pl.tuliVilkkuu;

  // Pieni liekki mittarin vasemmalla puolella
  ctx.fillStyle = "#ff3c00";
  ctx.beginPath();
  ctx.arc(x - 12, y + 6, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(x - 12, y + 7, 3, 0, Math.PI * 2);
  ctx.fill();

  // Musta reunus ja tumma tausta
  ctx.fillStyle = "black";
  ctx.fillRect(x - 2, y - 2, leveys + 4, 16);
  ctx.fillStyle = "#442";
  ctx.fillRect(x, y, leveys, 12);

  // Tuli: oranssi, jos voi ampua, tumma, jos ei voi
  let vari = tuli >= TULI_HINTA ? "#ff8c1a" : "#9a5a20";
  if (tuliVilkkuu > 0 && Math.floor(tuliVilkkuu / 5) % 2 === 0)
    vari = "#ff3c3c";
  ctx.fillStyle = vari;
  ctx.fillRect(x, y, leveys * (tuli / TULI_MAX), 12);

  // Viivat jokaisen tulipallon kohdalle
  ctx.fillStyle = "black";
  for (let raja = TULI_HINTA; raja < TULI_MAX; raja += TULI_HINTA) {
    ctx.fillRect(x + leveys * (raja / TULI_MAX) - 1, y, 2, 12);
  }
}

// Näyttää ennätyksen. Uusi ennätys vilkkuu kullanvärisenä.
function piirraEnnatys(y, aika) {
  if (uusiEnnatys) {
    const vari = Math.floor(aika / 250) % 2 === 0 ? "gold" : "white";
    reunaTeksti("UUSI ENNÄTYS!", canvas.width / 2, y, 32, "center", vari);
  } else {
    reunaTeksti("Ennätys: " + ennatys, canvas.width / 2, y, 24, "center");
  }
}

// Tummentaa ruudun, jotta teksti näkyy hyvin
function tummenna() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function piirraAloitusruutu(aika) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)"; // vähän tummempi tausta
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pelin nimi, joka keinuu vähän
  const keinunta = Math.sin(aika / 400) * 4;
  reunaTeksti(PELIN_NIMI, canvas.width / 2, 62 + keinunta, 54, "center");

  // Ukko seisoo valikon päällä. Kaksinpelissä näkyy kaksi ukkoa: vihreä ja sininen.
  const ruutu = Math.floor(aika / 200) % 2;
  const valikonYla = valikonAsettelu().y;
  const ukot = kaksinpeli ? [kuvat.ukko, kuvat.ukko2] : [kuvat.ukko];
  for (let i = 0; i < ukot.length; i++) {
    const siirto = kaksinpeli ? (i === 0 ? -50 : 50) : 0;
    ctx.save();
    ctx.translate(canvas.width / 2 - 32 + siirto, valikonYla - 116);
    ctx.scale(2, 2);
    piirraRuutu(ukot[i], ruutu, 32, 32, 0, 0, i === 0);
    ctx.restore();
  }
  // Vihut valikon molemmin puolin
  piirraRuutu(kuvat.vihu, ruutu, 32, 32, 110, 378, false);
  piirraRuutu(kuvat.lentovihu, ruutu, 32, 32, 655, 230 + keinunta * 3, false);

  // Ennätys, jos sellainen on jo tehty
  if (ennatys > 0) {
    reunaTeksti("Ennätys: " + ennatys, canvas.width - 14, 30, 20, "right", "gold");
  }

  piirraValikko(aika);

  // Yksi lyhyt ohjerivi valikon alla
  let vihje = ohje("↑ ↓ valitse     Enter tai välilyönti hyväksyy", "Napauta valintaa");
  if (uusiVahvistus) vihje = "Uusi peli poistaa vanhan tallennuksen!";
  reunaTeksti(vihje, canvas.width / 2, 437, 16, "center", uusiVahvistus ? "#ff8080" : "white");

  if (TESTITILA && !kosketusOhjaus) {
    const m1 = MAAILMAT[0].loppu - MAAILMAT[0].alku + 1;
    const m2 = MAAILMAT[1].loppu - MAAILMAT[1].alku + 1;
    const teksti = "TESTI: maailma 1 = napit 1-" + m1 + ", maailma 2 = Shift + 1-" + m2;
    reunaTeksti(teksti, 8, 18, 12, "left", "gold");
  }
}

// Pyöreäkulmainen laatikko (kulma = kulman pyöreys)
function pyoreaLaatikko(x, y, leveys, korkeus, kulma) {
  ctx.beginPath();
  ctx.moveTo(x + kulma, y);
  ctx.arcTo(x + leveys, y, x + leveys, y + korkeus, kulma);
  ctx.arcTo(x + leveys, y + korkeus, x, y + korkeus, kulma);
  ctx.arcTo(x, y + korkeus, x, y, kulma);
  ctx.arcTo(x, y, x + leveys, y, kulma);
  ctx.closePath();
}

// Piirtää valikon (alkuruutu tai tauko): tumma laatikko ja rivit allekkain.
// Valittu rivi on kultainen ja sen ympärillä on kehys.
function piirraValikko(aika) {
  const v = valikonAsettelu();
  ctx.fillStyle = "rgba(10, 20, 40, 0.75)";
  pyoreaLaatikko(v.x, v.y, v.leveys, v.korkeus, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (v.otsikko) reunaTeksti("TAUKO", canvas.width / 2, v.y + 48, 34, "center", "gold");

  const valittu = valittuRivi();
  const sykkii = 0.5 + Math.sin(aika / 200) * 0.25; // kehys sykkii vähän
  for (const rivi of v.rivit) {
    const onValittu = rivi.id === valittu.id;
    const keskiY = rivi.y + rivi.korkeus / 2 + 8; // tekstin pohjaviiva
    if (onValittu) {
      ctx.fillStyle = "rgba(255, 215, 0, 0.18)";
      pyoreaLaatikko(rivi.x, rivi.y, rivi.leveys, rivi.korkeus, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 215, 0, " + (0.6 + sykkii * 0.4) + ")";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    const vari = rivi.vari || (onValittu ? "gold" : "white");
    if (onValittu) reunaTeksti("▶", rivi.x + 22, keskiY, 20, "center", vari);
    reunaTeksti(rivi.teksti, rivi.x + 44, keskiY, 24, "left", vari);
    if (rivi.lisa) reunaTeksti(rivi.lisa, rivi.x + rivi.leveys - 16, keskiY - 1, 17, "right", onValittu ? vari : "#ccc");
  }
}

// Taukoruutu: peli näkyy tummennettuna taustalla
function piirraTauko(aika) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  piirraValikko(aika);
  const v = valikonAsettelu();
  const vihje = ohje("↑ ↓ valitse     Enter hyväksyy     Esc jatkaa", "Napauta valintaa");
  reunaTeksti(vihje, canvas.width / 2, v.y + v.korkeus + 26, 16, "center");
}

// Ohjeruutu: napit selkeästi taulukkona (vasemmalla mitä tehdään, oikealla millä)
function piirraOhjeet() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let rivit;
  let vinkki = "Hyppää vihujen päälle tai ammu ne tulipallolla!";
  if (kosketusOhjaus) {
    rivit = [
      ["Liiku", "◀  ▶"],
      ["Hyppää", "⬆   (pidä pohjassa = korkeampi hyppy)"],
      ["Tulipallo", "🔥"],
      ["Lisää nappeja", "⚙️  avaa ja sulkee:"],
      ["", "⏸ tauko    ↻ maailma alusta (2 kertaa)"],
      ["", "🔊 äänet    🔍 nappien koko"],
      ["", "📊 FPS-mittari (ruutuja sekunnissa)"],
    ];
  } else if (kaksinpeli) {
    rivit = [
      ["", "Pelaaja 1", "Pelaaja 2"],
      ["Liiku", "A  D", "←  →"],
      ["Hyppää", "W", "↑"],
      ["Tulipallo", "F", "L tai Enter"],
      ["Tauko", "Esc"],
      ["Maailma alusta", "R  kaksi kertaa"],
      ["Äänet päälle / pois", "M"],
      ["FPS-mittari", "F3"],
    ];
    vinkki = "Sydän herättää haamukaverin!";
  } else {
    rivit = [
      ["Liiku", "←  →   tai   A  D"],
      ["Hyppää", "↑   W   tai välilyönti"],
      ["", "(pidä pohjassa = korkeampi hyppy)"],
      ["Tulipallo", "X"],
      ["Tauko", "Esc"],
      ["Maailma alusta", "R  kaksi kertaa"],
      ["Äänet päälle / pois", "M"],
      ["FPS-mittari", "F3"],
    ];
  }

  const x = 70;
  const y = 30;
  const leveys = canvas.width - 140;
  const korkeus = 360;
  ctx.fillStyle = "rgba(10, 20, 40, 0.8)";
  pyoreaLaatikko(x, y, leveys, korkeus, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  reunaTeksti("OHJEET", canvas.width / 2, y + 48, 34, "center", "gold");
  const raja = 330; // tästä vasemmalle selitys, oikealle napit
  for (let i = 0; i < rivit.length; i++) {
    const vali = rivit.length > 7 ? 30 : 34; // monta riviä: vähän tiiviimmin
    const rivinY = y + 94 + i * vali;
    const [mita, milla, pelaaja2] = rivit[i];
    const otsikkorivi = !mita && pelaaja2; // kaksinpelin "Pelaaja 1  Pelaaja 2"
    if (mita) reunaTeksti(mita, raja - 16, rivinY, 19, "right", "#ffe27a");
    reunaTeksti(milla, raja + 8, rivinY, 19, "left", otsikkorivi ? "#3ddc3d" : "white");
    // Kaksinpelissä pelaaja 2:n napit ovat omassa sarakkeessaan
    if (pelaaja2) reunaTeksti(pelaaja2, raja + 170, rivinY, 19, "left", otsikkorivi ? "#5aa0ff" : "white");
  }
  reunaTeksti(vinkki, canvas.width / 2, y + korkeus - 22, 18, "center", "#9fe39f");

  reunaTeksti(ohje("Takaisin: Esc tai Enter", "Napauta palataksesi"), canvas.width / 2, 432, 16, "center");
}

function piirra(aika) {
  // Ruudun tärinä: siirretään kaikkea vähän satunnaiseen suuntaan
  ctx.save();
  if (tarina > 0) {
    ctx.translate(
      (Math.random() - 0.5) * tarina,
      (Math.random() - 0.5) * tarina,
    );
  }

  if (tila === "alku" || tila === "ohjeet") {
    // Aloitusruudun taustalla on vain taivas, mäet ja maa
    piirraTausta(aika);
    piirraTaso({ x: 0, y: 410, leveys: canvas.width, korkeus: 40 });
    if (tila === "alku") piirraAloitusruutu(aika);
    else piirraOhjeet();
  } else if (tila === "kartta") {
    piirraKartta(aika);
  } else {
    piirraMaailma(aika);
    piirraPimeys(aika);
    piirraSaa();
    piirraTiedot();
  }

  if (tila === "tauko") piirraTauko(aika);

  if (tila === "kenttaValmis") {
    tummenna();
    reunaTeksti(
      "Kenttä " + (kenttaNumero + 1) + " läpäisty!",
      canvas.width / 2,
      75,
      40,
      "center",
    );

    // Pistelaskelman rivit, yksi kerrallaan
    const rivit = naytettavatRivit();
    for (let i = 0; i < rivit; i++) {
      const y = 135 + i * 34;
      const viimeinen = i === tulos.length - 1;
      const koko = viimeinen ? 28 : 22;
      const vari = viimeinen ? "gold" : "white";
      reunaTeksti(tulos[i][0], 230, y, koko, "left", vari);
      reunaTeksti(tulos[i][1], 570, y, koko, "right", vari);
    }

    // Ohje näytetään, kun kaikki rivit ovat näkyvissä
    if (rivit === tulos.length && Math.floor(aika / 500) % 2 === 0) {
      reunaTeksti(
        ohje("Paina VÄLILYÖNTIÄ jatkaaksesi", "Napauta jatkaaksesi"),
        canvas.width / 2,
        410,
        24,
        "center",
      );
    }
  }

  if (tila === "voitto") {
    tummenna();
    reunaTeksti("Voitit koko pelin! 🎉", canvas.width / 2, 110, 48, "center");
    reunaTeksti(
      "Pisteet: " + pisteet,
      canvas.width / 2,
      185,
      40,
      "center",
      "gold",
    );
    reunaTeksti(
      "Keräsit yhteensä " +
        kaikkiKolikot +
        " / " +
        kolikoitaYhteensa +
        " kolikkoa",
      canvas.width / 2,
      235,
      24,
      "center",
    );
    piirraEnnatys(290, aika);
    reunaTeksti(
      ohje("Paina R pelataksesi uudelleen", "Napauta pelataksesi uudelleen"),
      canvas.width / 2,
      370,
      24,
      "center",
    );
  }

  if (tila === "havio") {
    tummenna();
    piirraSuruNaama(canvas.width / 2, 110);
    reunaTeksti("Hävisit pelin!", canvas.width / 2, 225, 48, "center");
    reunaTeksti(
      "Pisteet: " + pisteet,
      canvas.width / 2,
      275,
      28,
      "center",
      "gold",
    );
    piirraEnnatys(320, aika);
    const maailma = "maailma " + (maailmanNumero(kenttaNumero) + 1);
    reunaTeksti(
      ohje("Paina R: " + maailma + " alkaa alusta", "Napauta: " + maailma + " alkaa alusta"),
      canvas.width / 2,
      390,
      24,
      "center",
    );
  }


  piirraSiirtyma(); // ruudun vaihdon musta ympyrä kaiken päälle
  ctx.restore();
}

// ---------- PELISILMUKKA ----------
// Tätä kutsutaan uudestaan ja uudestaan, noin 60 kertaa sekunnissa
let edellinenAika = performance.now();

// Joissain kännyköissä on 120 Hz näyttö: silloin selain kutsuu silmukkaa
// 120 kertaa sekunnissa. Peli on tehty 60 ruudulle sekunnissa, joten silloin
// joka toinen kerta jätetään väliin. Kännykkä tekee puolet vähemmän työtä!
let edellinenKutsu = 0;
let kutsujenVali = 1000 / 60; // keskimääräinen aika kutsujen välillä (ms)
let jokaToinen = false; // true = näyttö on nopea, piirretään joka toinen kerta
let ohitaTama = false;

function silmukka(nyt) {
  // Seuraava kierros pyydetään heti alussa. Silloin peli jatkuu,
  // vaikka tällä kierroksella tapahtuisi jokin virhe.
  requestAnimationFrame(silmukka);

  // Mitataan, kuinka nopea näyttö on (liukuva keskiarvo)
  const vali = nyt - edellinenKutsu;
  edellinenKutsu = nyt;
  if (vali > 0 && vali < 50) kutsujenVali = kutsujenVali * 0.95 + vali * 0.05;
  if (kutsujenVali < 9.5) jokaToinen = true; // yli 105 Hz
  if (kutsujenVali > 12) jokaToinen = false; // alle 83 Hz
  if (jokaToinen) {
    ohitaTama = !ohitaTama;
    if (ohitaTama) return;
  }

  let dt = (nyt - edellinenAika) / (1000 / 60);
  if (dt > 1.5) dt = 1.5; // ettei pelaaja hyppää tasojen läpi, jos kone takkuaa
  if (dt < 0) dt = 0;
  edellinenAika = nyt;

  paivita(dt);
  paivitaKamera(dt);
  piirra(nyt);
  if (naytaFps) mittaaFps(nyt);
}

// ---------- RUUDUT SEKUNNISSA (FPS-mittari) ----------
// Ruudun alareunassa näkyy, montako ruutua sekunnissa peli piirtää ja kuinka
// pitkä hitain väli oli. Päälle ja pois: F3 (tietokone) tai ⚙️ → FPS (kännykkä).
// Myös osoitteen loppuun voi lisätä ?fps
let naytaFps = location.search.includes("fps") || lataaFpsAsetus();
const fpsMittari = { ruudut: 0, alku: 0, hitain: 0, edellinen: 0, teksti: "" };

function vaihdaFps() {
  naytaFps = !naytaFps;
  // Mittaus alkaa alusta, ettei vanha tulos näy
  Object.assign(fpsMittari, { ruudut: 0, alku: performance.now(), hitain: 0, edellinen: 0, teksti: "" });
  try {
    localStorage.setItem("ukonSeikkailuFps", naytaFps ? "1" : "0");
  } catch (virhe) {
    // ei haittaa, valinta vain ei tallennu
  }
}

function lataaFpsAsetus() {
  try {
    return localStorage.getItem("ukonSeikkailuFps") === "1";
  } catch (virhe) {
    return false;
  }
}

function mittaaFps(nyt) {
  const m = fpsMittari;
  if (m.edellinen) m.hitain = Math.max(m.hitain, nyt - m.edellinen);
  m.edellinen = nyt;
  m.ruudut++;
  if (nyt - m.alku >= 1000) {
    const fps = Math.round((m.ruudut * 1000) / (nyt - m.alku));
    const naytto = Math.round(1000 / kutsujenVali);
    m.teksti = fps + " fps   hitain " + Math.round(m.hitain) + " ms   näyttö " + naytto + " Hz";
    m.ruudut = 0;
    m.alku = nyt;
    m.hitain = 0;
  }
  if (m.teksti) reunaTeksti(m.teksti, canvas.width / 2, canvas.height - 8, 14, "center", "#7fff7f");
}

// Ladataan ensimmäinen kenttä aloitusruudun taustaksi
kentta = KENTAT[0]();
valmisteleKentta(kentta);

// Peli käynnistetään vasta, kun KAIKKI tiedostot on ladattu.
// (Muuten selain saattaa aloittaa pelin ennen kuin tehosteet.js ja
// kartta.js ovat valmiita, ja ruutu jää siniseksi.)
addEventListener("DOMContentLoaded", () => requestAnimationFrame(silmukka));
