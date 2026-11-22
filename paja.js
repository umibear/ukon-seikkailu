// ==========================================
//   KENTTÄPAJA
//   Täällä rakennetaan omia kenttiä! Alkuvalikosta: "Rakenna kenttä".
//   - OMA SAARI (tila "paja"): lista omista kentistä. Niitä voi pelata,
//     muokata, nimetä, jakaa linkkinä ja poistaa.
//   - MUOKKAUS (tila "muokkaus"): vasemmalla on palikat, oikealla työkalut.
//     Napauta ruutua, niin palikka menee siihen. ▶ kokeilee kenttää heti.
//   Itse kentät (ruudukko, palikat, tallennus) ovat tiedostossa omatkentat.js.
// ==========================================

// Pelataanko juuri nyt omaa kenttää? null = ei.
//   tyyppi "testi" = kokeillaan kenttää kesken rakentamisen (kuolema vie takaisin muokkaukseen)
//   tyyppi "oma"   = pelataan valmista omaa kenttää
let omaPeli = null;
let elamatTallessa = null; // seikkailun elämät odottavat tässä, kun pelataan omaa kenttää
let pajaPaluu = null; // kun tämä on asetettu, palataan muokkaukseen heti seuraavalla hetkellä

// ---------- OMA SAARI ----------
let pajaValinta = 0; // mikä kenttä on valittuna (omatKentat.length = "uusi kenttä" -paikka)
let pajaViesti = ""; // teksti, joka näkyy hetken ruudulla
let pajaViestiAika = 0;
let teemanValinta = false; // true = valitaan uuden kentän maailmaa
let poistoVahvistus = false; // true = Poista-nappia on painettu kerran

// ---------- MUOKKAUS ----------
let muokattava = null; // kenttä, jota rakennetaan (ruudukko, omatkentat.js)
let muokattavaNro = -1; // monesko kenttä se on omatKentat-listassa
let tyokalu = "M"; // valittu palikka (merkki), "kumi" tai "kasi"
let pajaKamera = 0; // mitä kohtaa kentästä katsotaan
let kumoukset = []; // aiemmat tilanteet ↶-nappia varten
let kuvakkeet = {}; // palikoiden pienet kuvat (tehdään, kun muokkaus avataan)
let kuvakkeidenTeema = -1;
let kuvakkeetUudestaan = 0;

// Hiiri tai sormi
const osoitin = {
  alas: false, // onko nappi tai sormi pohjassa
  x: -100,
  y: -100,
  nappi: null, // minkä napin päältä painallus alkoi
  pyyhkii: false, // tämä veto pyyhkii palikoita (aloitettiin saman palikan päältä)
  viimeRuutu: "", // viimeksi käsitelty ruutu (ettei samaa tehdä monta kertaa)
  muutti: false, // onko tämä veto jo muuttanut kenttää
  vetoX: 0, // käsi-työkalu: mistä veto alkoi
  vetoKamera: 0,
};

const PALETIN_LEVEYS = 96; // vasemman reunan palikkalaatikko
const TYOKALUJEN_LEVEYS = 56; // oikean reunan napit
const LOKERO = 46; // yhden palikan lokero paletissa
const KUVAKKEEN_KOKO = 56; // kuinka iso pala ruudusta kopioidaan kuvakkeeksi
const VIERITYS = 9; // kuinka nopeasti kenttä vierii napeista ja nuolista

function pajassa() {
  return tila === "paja" || tila === "muokkaus";
}

function naytaPajaViesti(teksti) {
  pajaViesti = teksti;
  pajaViestiAika = 170;
}

// ---------- OMAN KENTÄN PELAAMINEN ----------

// Aloittaa oman kentän. numero = monesko kenttä omatKentat-listassa.
function aloitaOmaKentta(oma, tyyppi, numero) {
  // Seikkailun elämät otetaan talteen: omassa kentässä on aina täydet elämät
  if (!elamatTallessa) elamatTallessa = [pelaaja1, pelaaja2].map((pl) => ({ elamat: pl.elamat, haamu: pl.haamu }));
  for (const pl of [pelaaja1, pelaaja2]) {
    pl.elamat = ELAMIA_ALUSSA;
    pl.haamu = false;
  }
  napit.Space = false; // ettei ukko hyppää heti, kun kenttä alkaa
  napit.Enter = false;
  aloitaKentta(TEEMAT[oma.teema].malli, { tyyppi: tyyppi, kentta: oma, numero: numero });
  if (tyyppi === "testi") siirtyma = 0; // kokeilu alkaa heti ilman ruudun vaihtoa
}

// Oman kentän pelaaminen loppuu: seikkailun elämät palaavat
function lopetaOmaPeli() {
  if (elamatTallessa) {
    [pelaaja1, pelaaja2].forEach((pl, i) => {
      pl.elamat = elamatTallessa[i].elamat;
      pl.haamu = elamatTallessa[i].haamu;
    });
  }
  elamatTallessa = null;
  omaPeli = null;
  tulipallot = [];
  pisteet = summa(parhaatPisteet); // seikkailun pisteet takaisin
}

// R: sama kenttä alusta
function aloitaOmaUudestaan() {
  aloitaOmaKentta(omaPeli.kentta, omaPeli.tyyppi, omaPeli.numero);
}

// Kun maaliin päästään omassa kentässä (peli.js: laskeKentanTulos)
function omaKenttaLapaisty() {
  const tallenne = omatKentat[omaPeli.numero];
  const uusiParas = !tallenne.paras || kentanAika < tallenne.paras;
  tallenne.lapaisty = true;
  if (uusiParas) tallenne.paras = Math.round(kentanAika * 10) / 10;
  tallennaOmatKentat();
  const vihuja = kentta.viholliset.filter((v) => !v.eiLasketa).length + kentta.lentovihut.length;
  tulos = [
    ["Kolikot", kentanKolikot + " / " + kentta.kolikot.length],
    ["Vihut", kentanVihut + " / " + vihuja],
    ["Aika", muotoileAika(kentanAika)],
    ["Paras aika", muotoileAika(tallenne.paras) + (uusiParas ? "  UUSI!" : "")],
    ["PISTEET", "" + pisteet],
  ];
}

// Kokeilussa kuolema ei vie elämää, vaan palataan muokkaamaan (peli.js: menetaElama)
function testiKuolema() {
  if (!omaPeli || omaPeli.tyyppi !== "testi") return false;
  if (!pajaPaluu) {
    aanet.osuma();
    pajaPaluu = { viesti: "Auts! Muokkaa tai kokeile uudestaan ▶", x: pelaaja.x };
  }
  return true;
}

// Oman kentän pelaaminen jätetään kesken (taukovalikko tai Esc)
function poistuOmastaKentasta() {
  if (omaPeli.tyyppi === "testi") palaaMuokkaukseen("", elavatPelaajat()[0] ? elavatPelaajat()[0].x : pelaaja1.x);
  else avaaPaja();
}

// ---------- OMA SAARI: TOIMINNOT ----------

function avaaPaja() {
  if (omaPeli) lopetaOmaPeli();
  tila = "paja";
  teemanValinta = false;
  poistoVahvistus = false;
  pajaViestiAika = 0;
  pajaValinta = Math.max(0, Math.min(pajaValinta, omatKentat.length));
  aloitaSiirtyma();
}

// Takaisin alkuvalikkoon
function suljePaja() {
  tila = "alku";
  valikonValinta = Math.max(0, valikonRivit().findIndex((r) => r.id === "paja"));
  aloitaSiirtyma();
}

function valittuOmaKentta() {
  return omatKentat[pajaValinta] || null;
}

function siirraPajaValintaa(suunta) {
  const paikkoja = Math.min(OMIA_KENTTIA_MAX, omatKentat.length + 1);
  pajaValinta = (pajaValinta + suunta + paikkoja) % paikkoja;
  poistoVahvistus = false;
  aanet.laskuri();
}

// Tekee uuden kentän valittuun maailmaan ja avaa sen muokattavaksi
function luoUusiKentta(teema) {
  if (omatKentat.length >= OMIA_KENTTIA_MAX) return;
  const oma = uusiOmaKentta(teema, "Oma kenttä " + (omatKentat.length + 1));
  omatKentat.push({ koodi: pakkaaKentta(oma), lapaisty: false, paras: 0 });
  tallennaOmatKentat();
  pajaValinta = omatKentat.length - 1;
  teemanValinta = false;
  avaaMuokkaus(pajaValinta);
  naytaPajaViesti("Valitse palikka vasemmalta ja napauta kenttää! ▶ kokeilee.");
}

// Tehdään se, mitä painetussa napissa lukee
function pajaToiminto(id) {
  const tallenne = valittuOmaKentta();
  if (id !== "poista") poistoVahvistus = false;
  aanet.laskuri();
  if (id === "takaisin") suljePaja();
  else if (id === "uusi") teemanValinta = true;
  else if (id === "peru") teemanValinta = false;
  else if (id.startsWith("teema")) luoUusiKentta(Number(id.slice(5)));
  else if (!tallenne) return;
  else if (id === "pelaa") aloitaOmaKentta(puraKentta(tallenne.koodi), "oma", pajaValinta);
  else if (id === "muokkaa") avaaMuokkaus(pajaValinta);
  else if (id === "nimi") nimeaKentta();
  else if (id === "jaa") jaaKentta();
  else if (id === "poista") {
    if (!poistoVahvistus) {
      poistoVahvistus = true; // pitää painaa vielä kerran, ettei kenttä häviä vahingossa
      aanet.tyhja();
      return;
    }
    poistoVahvistus = false;
    omatKentat.splice(pajaValinta, 1);
    tallennaOmatKentat();
    pajaValinta = Math.max(0, Math.min(pajaValinta, omatKentat.length));
  }
}

// Kysyy kentälle uuden nimen
function nimeaKentta() {
  const tallenne = valittuOmaKentta();
  if (!tallenne || typeof prompt !== "function") return;
  const oma = puraKentta(tallenne.koodi);
  const nimi = prompt("Kentän nimi:", oma.nimi);
  if (nimi === null) return; // painettiin Peruuta
  oma.nimi = siistiNimi(nimi);
  tallenne.koodi = pakkaaKentta(oma);
  tallennaOmatKentat();
}

// Jakaa kentän linkkinä: kännykässä aukeaa jakovalikko (WhatsApp ja muut),
// tietokoneella linkki kopioidaan leikepöydälle.
function jaaKentta() {
  const tallenne = valittuOmaKentta();
  if (!tallenne || typeof navigator === "undefined") return;
  const nimi = puraKentta(tallenne.koodi).nimi;
  const linkki = kentanLinkki(tallenne.koodi);
  const naytaLinkki = () => {
    if (typeof prompt === "function") prompt("Kopioi linkki ja lähetä se kaverille:", linkki);
  };
  if (navigator.share) {
    navigator.share({ title: PELIN_NIMI, text: "Kokeile minun kenttääni: " + nimi, url: linkki }).catch(() => {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(linkki).then(() => naytaPajaViesti("Linkki kopioitu! Liitä se viestiin."), naytaLinkki);
  } else naytaLinkki();
}

// Jos sivu avattiin jakolinkistä, kenttä lisätään Omalle saarelle
function otaKenttaOsoitteesta() {
  const koodi = kenttaOsoitteesta();
  if (!koodi) return;
  let numero = omatKentat.findIndex((t) => t.koodi === koodi);
  if (numero < 0 && omatKentat.length >= OMIA_KENTTIA_MAX) {
    tila = "paja";
    naytaPajaViesti("Saari on täynnä! Poista yksi kenttä ja avaa linkki uudestaan.");
    return;
  }
  if (numero < 0) {
    omatKentat.push({ koodi: koodi, lapaisty: false, paras: 0 });
    tallennaOmatKentat();
    numero = omatKentat.length - 1;
  }
  pajaValinta = numero;
  tila = "paja";
  naytaPajaViesti("Sait uuden kentän! Paina Pelaa.");
  // Kenttä otetaan pois osoitteesta, ettei sitä lisätä uudestaan, kun sivu ladataan
  if (typeof history !== "undefined" && history.replaceState) history.replaceState(null, "", location.pathname + location.search);
}

// ---------- MUOKKAUS: TOIMINNOT ----------

function avaaMuokkaus(numero) {
  muokattavaNro = numero;
  muokattava = puraKentta(omatKentat[numero].koodi);
  kumoukset = [];
  tyokalu = "M";
  tila = "muokkaus";
  rakennaPajaKentta();
  // Aloitetaan ukon kohdalta
  pajaKamera = rajaaKamera(kentta.alku.x - 300);
  aloitaSiirtyma();
}

// Tallentaa ja palaa Omalle saarelle
function suljeMuokkaus() {
  tila = "paja";
  poistoVahvistus = false;
  pajaViestiAika = 0;
  aloitaSiirtyma();
}

// Kokeilusta takaisin muokkaukseen. x = mihin kohtaan kenttää katsotaan.
function palaaMuokkaukseen(viesti, x) {
  lopetaOmaPeli();
  tila = "muokkaus";
  rakennaPajaKentta();
  pajaKamera = rajaaKamera(x - 400);
  if (viesti) naytaPajaViesti(viesti);
}

// Pelissä laavapallo ja hauki ovat piilossa pinnan alla ja tulisuihku on välillä pois päältä.
// Muokkauksessa ne näytetään, jotta näkee, mihin ne on laitettu.
function naytaPiilossaOlevat(k) {
  for (const v of k.viholliset) {
    if (v.tyyppi !== "laavapallo" && v.tyyppi !== "jaahauki") continue;
    v.piilossa = false;
    v.y = v.lattia - 48;
  }
  for (const s of k.tulisuihkut || []) s.tila = "paalla";
}

// Tekee ruudukosta oikean kentän, jotta se voidaan piirtää pelin omilla piirtäjillä
function rakennaPajaKentta() {
  kentta = omaKentaksi(muokattava);
  valmisteleKentta(kentta);
  naytaPiilossaOlevat(kentta);
  for (const pl of pelaajat) {
    pelaaja = pl;
    siirraPelaajaAlkuun();
    pl.suunta = 1;
    pl.suojaAika = 0;
  }
  hiukkaset = [];
  tekstit = [];
  tulipallot = [];
}

// Kamera ei saa mennä kentän ohi. Vasemmalla ja oikealla on tilaa nappien verran.
function rajaaKamera(x) {
  const suurin = Math.min(SARAKKEITA_MAX * RUUTU, kentta.leveys + 10 * RUUTU) - canvas.width + TYOKALUJEN_LEVEYS;
  return Math.max(-PALETIN_LEVEYS, Math.min(x, suurin));
}

// Kun kenttä muuttuu: tallennetaan heti ja piirretään uusi versio
function kenttaMuuttui() {
  const tallenne = omatKentat[muokattavaNro];
  tallenne.koodi = pakkaaKentta(muokattava);
  tallenne.lapaisty = false; // muutettu kenttä pitää päästä läpi uudestaan
  tallenne.paras = 0;
  tallennaOmatKentat();
  rakennaPajaKentta();
}

// Ennen muutosta otetaan vanha tilanne talteen ↶-nappia varten (kerran yhtä vetoa kohti)
function muistaTilanne() {
  if (osoitin.muutti) return;
  osoitin.muutti = true;
  kumoukset.push(pakkaaKentta(muokattava));
  if (kumoukset.length > 60) kumoukset.shift();
}

function kumoa() {
  if (kumoukset.length === 0) {
    aanet.tyhja();
    return;
  }
  muokattava = puraKentta(kumoukset.pop());
  kenttaMuuttui();
  aanet.laskuri();
}

// Laittaa palikan ruutuun. Palauttaa true, jos kenttä muuttui.
function laitaPalikka(sarake, rivi, merkki) {
  const tiedot = PALIKAT[merkki];
  const ruudut = muokattava.ruudut;
  if (sarake < 0 || sarake >= SARAKKEITA_MAX) return false;

  if (tiedot.pohjalle) rivi = ALIN_RIVI; // laava ja vesi ovat aina alimmalla rivillä
  // Laavapallo ja hauki hyppäävät laavasta tai vedestä: se tehdään niiden alle itsestään
  const neste = merkki === "b" ? "a" : merkki === "h" ? "z" : null;
  if (neste) rivi = ALIN_RIVI - 1;

  if (tiedot.lattialle) {
    if (onKiintea(muokattava, sarake, rivi)) {
      // Napautettiin maata: palikka nousee maan päälle
      while (rivi >= 0 && onKiintea(muokattava, sarake, rivi)) rivi--;
    } else {
      // Napautettiin ilmaa: palikka putoaa lähimmän maan päälle
      const alla = lattiaRivi(muokattava, sarake, rivi);
      if (alla < 0) {
        naytaPajaViesti(tiedot.nimi + " tarvitsee maata alleen!");
        return false;
      }
      rivi = alla - 1;
    }
    if (rivi < 0) return false;
  }

  const nimi = ruudunNimi(sarake, rivi);
  const vanha = ruudut[nimi];
  if (vanha === merkki && !neste) return false;
  if ((vanha === "A" || vanha === "L") && vanha !== merkki) {
    naytaPajaViesti("Siirrä ensin " + (vanha === "A" ? "ukko" : "maali") + " muualle!");
    return false;
  }
  muistaTilanne();
  // Ukkoja, maaleja ja välilippuja on vain yksi: vanha lähtee pois
  if (tiedot.ainoa) {
    const edellinen = etsiPalikka(muokattava, merkki);
    if (edellinen) delete ruudut[edellinen];
  }
  ruudut[nimi] = merkki;
  if (neste) ruudut[ruudunNimi(sarake, ALIN_RIVI)] = neste;
  return true;
}

// Pyyhkii ruudun tyhjäksi. Palauttaa true, jos kenttä muuttui.
function pyyhiRuutu(sarake, rivi) {
  const nimi = ruudunNimi(sarake, rivi);
  const vanha = muokattava.ruudut[nimi];
  if (vanha === undefined) return false;
  if (vanha === "A" || vanha === "L") {
    naytaPajaViesti(vanha === "A" ? "Ukko tarvitaan aina! Sen voi siirtää." : "Maali tarvitaan aina! Sen voi siirtää.");
    return false;
  }
  muistaTilanne();
  delete muokattava.ruudut[nimi];
  // Jos laava tai vesi pyyhitään, sen päällä hyppivä pallo tai hauki lähtee mukana
  const ylla = ruudunNimi(sarake, rivi - 1);
  if ((vanha === "a" && muokattava.ruudut[ylla] === "b") || (vanha === "z" && muokattava.ruudut[ylla] === "h")) {
    delete muokattava.ruudut[ylla];
  }
  return true;
}

// Mikä ruutu on ruudun kohdassa (x, y)?
function ruutuKohdassa(x, y) {
  const sarake = Math.floor((x + pajaKamera) / RUUTU);
  const rivi = Math.max(0, Math.min(ALIN_RIVI, Math.floor((y - RIVIN_YLA) / RUUTU)));
  return { sarake: sarake, rivi: rivi };
}

// Sormi tai hiiri on kentän päällä pohjassa: käytetään valittua työkalua
function kaytaTyokalua(alku) {
  if (tyokalu === "kasi") {
    pajaKamera = rajaaKamera(osoitin.vetoKamera - (osoitin.x - osoitin.vetoX));
    return;
  }
  const ruutu = ruutuKohdassa(osoitin.x, osoitin.y);
  // Laava ja vesi ovat aina alimmalla rivillä, laavapallo ja hauki heti niiden yllä
  if (tyokalu.length === 1 && PALIKAT[tyokalu].pohjalle) ruutu.rivi = ALIN_RIVI;
  if (tyokalu === "b" || tyokalu === "h") ruutu.rivi = ALIN_RIVI - 1;
  const nimi = ruudunNimi(ruutu.sarake, ruutu.rivi);
  if (nimi === osoitin.viimeRuutu) return;
  osoitin.viimeRuutu = nimi;

  const vanha = muokattava.ruudut[nimi];
  // Jos veto alkaa saman palikan päältä, se pyyhkii (napauta palikkaa uudestaan = pois)
  if (alku) osoitin.pyyhkii = tyokalu === "kumi" || vanha === tyokalu;
  // Vain maalattavia palikoita tulee lisää, kun sormea vedetään
  if (!alku && !osoitin.pyyhkii && !PALIKAT[tyokalu].maalattava) return;

  const muuttui = osoitin.pyyhkii ? pyyhiRuutu(ruutu.sarake, ruutu.rivi) : laitaPalikka(ruutu.sarake, ruutu.rivi, tyokalu);
  if (muuttui) {
    kenttaMuuttui();
    if (osoitin.pyyhkii) aanet.tyhja();
    else aanet.kolikko();
  }
}

// ---------- NAPIT ----------

// Oman saaren napit: mitkä näkyvät, riippuu siitä, mikä on valittuna
function pajanNapit() {
  const lista = [{ id: "takaisin", x: 12, y: 10, leveys: 118, korkeus: 34, teksti: "◀ Takaisin" }];
  if (teemanValinta) {
    TEEMAT.forEach((teema, i) => {
      lista.push({ id: "teema" + i, x: 70 + i * 225, y: 364, leveys: 210, korkeus: 46, teksti: teema.nimi, vari: teema.vari });
    });
    lista.push({ id: "peru", x: 340, y: 416, leveys: 120, korkeus: 28, teksti: "Peruuta", pieni: true });
  } else if (!valittuOmaKentta()) {
    lista.push({ id: "uusi", x: 280, y: 384, leveys: 240, korkeus: 46, teksti: "+ Rakenna uusi kenttä", vari: "#ffd75e" });
  } else {
    const rivi = [
      { id: "pelaa", teksti: "▶ Pelaa", leveys: 150, vari: "#7be07b" },
      { id: "muokkaa", teksti: "Muokkaa", leveys: 140, vari: "#ffd75e" },
      { id: "nimi", teksti: "Nimi", leveys: 100 },
      { id: "jaa", teksti: "Jaa", leveys: 100 },
      { id: "poista", teksti: poistoVahvistus ? "Varmasti?" : "Poista", leveys: 130, vari: poistoVahvistus ? "#ff8080" : null },
    ];
    let x = (canvas.width - rivi.reduce((yhteensa, n) => yhteensa + n.leveys + 10, -10)) / 2;
    for (const n of rivi) {
      lista.push(Object.assign(n, { x: x, y: 394, korkeus: 44 }));
      x += n.leveys + 10;
    }
  }
  return lista;
}

// Missä kohtaa saarta kentän paikka on?
function omanKentanPaikka(i) {
  return { x: 126 + i * 78, y: 222 + Math.sin(i * 1.4 + 0.6) * 46 };
}

// Muokkauksen napit oikeassa reunassa
function muokkausNapit() {
  const tiedot = [
    { id: "testi", teksti: "▶", vari: "#7be07b" },
    { id: "kasi", teksti: "✋" },
    { id: "kumi", teksti: "kumi" },
    { id: "kumoa", teksti: "↩" },
    { id: "vasen", teksti: "«" },
    { id: "oikea", teksti: "»" },
    { id: "valmis", teksti: "valmis", vari: "#7be07b" },
  ];
  return tiedot.map((n, i) => Object.assign(n, { x: canvas.width - TYOKALUJEN_LEVEYS + 4, y: 8 + i * 62, leveys: TYOKALUJEN_LEVEYS - 8, korkeus: 56 }));
}

// Paletin lokerot: kaikille yhteiset palikat ja tämän maailman omat
function paletinLokerot() {
  const merkit = YHTEISET_PALIKAT + TEEMAT[muokattava.teema].palikat;
  return merkit.split("").map((merkki, i) => ({
    merkki: merkki,
    x: 2 + (i % 2) * LOKERO,
    y: 18 + Math.floor(i / 2) * LOKERO,
    leveys: LOKERO,
    korkeus: LOKERO,
  }));
}

function osuuNappiin(lista, x, y) {
  return lista.find((n) => x >= n.x && x < n.x + n.leveys && y >= n.y && y < n.y + n.korkeus) || null;
}

function muokkausToiminto(id) {
  if (id === "testi") {
    aanet.laskuri();
    aloitaOmaKentta(muokattava, "testi", muokattavaNro);
  } else if (id === "kumoa") kumoa();
  else if (id === "valmis") {
    aanet.laskuri();
    suljeMuokkaus();
  } else if (id === "kasi" || id === "kumi") {
    tyokalu = id;
    aanet.laskuri();
  }
}

// Kokeilun aikana ruudulla on nappi, josta pääsee takaisin muokkaamaan
const TESTIN_NAPPI = { x: 305, y: 62, leveys: 190, korkeus: 32 };
// Kun oma kenttä hävitään, tästä napista pääsee takaisin saarelle
const HAVION_NAPPI = { x: 290, y: 408, leveys: 220, korkeus: 34 };

// ---------- HIIRI JA SORMI ----------
// tapahtuma: "alas" (painetaan), "liike" tai "ylos" (nostetaan). x ja y ovat pelin koordinaatteja.
// Palauttaa true, jos paja käsitteli painalluksen.
function pajaOsoitin(tapahtuma, x, y) {
  if (omaPeli && tila === "havio") {
    if (tapahtuma === "alas" && osuuNappiin([HAVION_NAPPI], x, y)) {
      poistuOmastaKentasta();
      return true;
    }
    return false;
  }
  if (tila === "peli" && omaPeli && omaPeli.tyyppi === "testi") {
    if (tapahtuma === "alas" && osuuNappiin([TESTIN_NAPPI], x, y)) {
      poistuOmastaKentasta();
      return true;
    }
    return false;
  }
  if (!pajassa()) return false;
  osoitin.x = x;
  osoitin.y = y;

  if (tila === "paja") {
    if (tapahtuma === "alas") {
      osoitin.nappi = osuuNappiin(pajanNapit(), x, y);
      // Kentän paikan napautus valitsee sen
      if (!osoitin.nappi && !teemanValinta) {
        const paikkoja = Math.min(OMIA_KENTTIA_MAX, omatKentat.length + 1);
        for (let i = 0; i < paikkoja; i++) {
          const p = omanKentanPaikka(i);
          if (Math.hypot(x - p.x, y - p.y) < 34) {
            pajaValinta = i;
            poistoVahvistus = false;
            aanet.laskuri();
          }
        }
      }
    } else if (tapahtuma === "ylos") {
      // Nappi toimii, kun sormi nostetaan saman napin päältä
      const nappi = osuuNappiin(pajanNapit(), x, y);
      if (nappi && osoitin.nappi && nappi.id === osoitin.nappi.id) pajaToiminto(nappi.id);
      osoitin.nappi = null;
    }
    return true;
  }

  // Muokkaus
  if (tapahtuma === "alas") {
    osoitin.alas = true;
    osoitin.muutti = false;
    osoitin.viimeRuutu = "";
    osoitin.nappi = osuuNappiin(muokkausNapit(), x, y);
    const lokero = osuuNappiin(paletinLokerot(), x, y);
    if (lokero) {
      tyokalu = lokero.merkki;
      osoitin.nappi = lokero; // ettei veto paletista piirrä kenttään
      aanet.laskuri();
    } else if (!osoitin.nappi && x > PALETIN_LEVEYS && x < canvas.width - TYOKALUJEN_LEVEYS) {
      osoitin.vetoX = x;
      osoitin.vetoKamera = pajaKamera;
      kaytaTyokalua(true);
    } else if (!osoitin.nappi) osoitin.nappi = { id: "reuna" }; // paletin tyhjä kohta
  } else if (tapahtuma === "liike") {
    if (osoitin.alas && !osoitin.nappi) kaytaTyokalua(false);
  } else if (tapahtuma === "ylos") {
    const nappi = osuuNappiin(muokkausNapit(), x, y);
    if (osoitin.alas && nappi && osoitin.nappi && nappi.id === osoitin.nappi.id) muokkausToiminto(nappi.id);
    osoitin.alas = false;
    osoitin.nappi = null;
  }
  return true;
}

// Hiiri (tietokone)
canvas.addEventListener("mousedown", (e) => {
  if (kosketusOhjaus) return;
  const kohta = pelinKohta(e.clientX, e.clientY);
  if (pajaOsoitin("alas", kohta.x, kohta.y)) e.preventDefault();
});
addEventListener("mousemove", (e) => {
  if (kosketusOhjaus || !pajassa()) return;
  const kohta = pelinKohta(e.clientX, e.clientY);
  pajaOsoitin("liike", kohta.x, kohta.y);
});
addEventListener("mouseup", (e) => {
  if (kosketusOhjaus || !pajassa()) return;
  const kohta = pelinKohta(e.clientX, e.clientY);
  pajaOsoitin("ylos", kohta.x, kohta.y);
});

// Sormi (kännykkä ja tabletti). Vain ensimmäinen sormi lasketaan.
for (const [nimi, tapahtuma] of [["touchstart", "alas"], ["touchmove", "liike"], ["touchend", "ylos"], ["touchcancel", "ylos"]]) {
  canvas.addEventListener(nimi, (e) => {
    const sormi = e.changedTouches && e.changedTouches[0];
    if (!sormi) return;
    const kohta = pelinKohta(sormi.clientX, sormi.clientY);
    pajaOsoitin(tapahtuma, kohta.x, kohta.y);
  });
}

// Näppäimistö. Palauttaa true, jos paja käsitteli napin (peli.js: keydown).
function pajaNappain(koodi) {
  if (koodi === "KeyM" || koodi === "F3") return false; // äänet ja FPS-mittari toimivat pajassakin
  const hyvaksy = koodi === "Space" || koodi === "Enter";
  // Omaa kenttää pelataan: Esc lopettaa
  if (omaPeli && koodi === "Escape" && (tila === "havio" || (tila === "peli" && omaPeli.tyyppi === "testi"))) {
    poistuOmastaKentasta();
    return true;
  }
  if (tila === "muokkaus") {
    if (koodi === "Escape") suljeMuokkaus();
    else if (hyvaksy) muokkausToiminto("testi");
    else if (koodi === "KeyZ") kumoa();
    return true;
  }
  if (tila !== "paja") return false;
  if (teemanValinta) {
    if (koodi === "Escape") teemanValinta = false;
    else if (["Digit1", "Digit2", "Digit3"].includes(koodi)) luoUusiKentta(Number(koodi.slice(5)) - 1);
    return true;
  }
  if (koodi === "ArrowRight" || koodi === "KeyD") siirraPajaValintaa(1);
  else if (koodi === "ArrowLeft" || koodi === "KeyA") siirraPajaValintaa(-1);
  else if (koodi === "Escape") suljePaja();
  else if (hyvaksy) pajaToiminto(valittuOmaKentta() ? "pelaa" : "uusi");
  else if (koodi === "KeyE") pajaToiminto("muokkaa");
  else if (koodi === "Delete") pajaToiminto("poista");
  return true;
}

// ---------- PÄIVITYS ----------
// Kutsutaan joka hetki (peli.js: paivita). Palauttaa true, kun ollaan pajassa
// (silloin itse peli ei liiku).
function paivitaPaja(dt) {
  if (pajaPaluu) {
    const paluu = pajaPaluu;
    pajaPaluu = null;
    palaaMuokkaukseen(paluu.viesti, paluu.x);
  }
  if (!pajassa()) return false;
  if (pajaViestiAika > 0) pajaViestiAika -= dt;
  if (kuvakkeetUudestaan > 0) kuvakkeetUudestaan -= dt;
  if (tila === "muokkaus") {
    // Kenttä vierii «- ja »-napeista sekä nuolinäppäimistä
    let suunta = 0;
    if (napit.ArrowLeft || napit.KeyA) suunta -= 1;
    if (napit.ArrowRight || napit.KeyD) suunta += 1;
    if (osoitin.alas && osoitin.nappi && osoitin.nappi.id === "vasen") suunta -= 1;
    if (osoitin.alas && osoitin.nappi && osoitin.nappi.id === "oikea") suunta += 1;
    if (suunta !== 0) pajaKamera = rajaaKamera(pajaKamera + suunta * VIERITYS * dt);
  }
  return true;
}

// ---------- PIIRTÄMINEN ----------

function piirraPajaNappi(n, pohjassa) {
  ctx.fillStyle = pohjassa ? "rgba(255, 215, 0, 0.45)" : "rgba(10, 20, 40, 0.8)";
  pyoreaLaatikko(n.x, n.y, n.leveys, n.korkeus, 10);
  ctx.fill();
  ctx.strokeStyle = n.vari || "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
  const koko = n.pieni ? 15 : n.teksti.length > 14 ? 18 : 20;
  reunaTeksti(n.teksti, n.x + n.leveys / 2, n.y + n.korkeus / 2 + koko * 0.36, koko, "center", n.vari || "white");
}

// Vihreä "oikein"-merkki ✔ (piirretään itse, koska kaikissa kännyköissä merkki ei näy samanlaisena)
function piirraOikein(x, y, koko) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [vari, paksuus] of [["black", koko * 0.42], ["#7be07b", koko * 0.22]]) {
    ctx.strokeStyle = vari;
    ctx.lineWidth = paksuus;
    ctx.beginPath();
    ctx.moveTo(x - koko * 0.45, y);
    ctx.lineTo(x - koko * 0.12, y + koko * 0.35);
    ctx.lineTo(x + koko * 0.5, y - koko * 0.4);
    ctx.stroke();
  }
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
}

function piirraPajaViesti(y) {
  if (pajaViestiAika <= 0) return;
  ctx.globalAlpha = Math.min(1, pajaViestiAika / 30);
  reunaTeksti(pajaViesti, canvas.width / 2, y, 20, "center", "gold");
  ctx.globalAlpha = 1;
}

// Oma saari: meri, saari ja kenttien paikat (sama tyyli kuin kartalla, kartta.js)
function piirraPaja(aika) {
  const varit = KARTAN_VARIT.nurmi;
  ctx.drawImage(taivasKuva(varit.meriYla, varit.meriAla), 0, 0);
  piirraAallot(aika);
  ctx.fillStyle = varit.ranta;
  ctx.beginPath();
  ctx.ellipse(400, 225, 380, 140, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = varit.maa;
  ctx.beginPath();
  ctx.ellipse(400, 225, 358, 122, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const puu of [{ x: 90, y: 200 }, { x: 250, y: 140 }, { x: 420, y: 300 }, { x: 560, y: 135 }, { x: 700, y: 250 }, { x: 330, y: 310 }]) {
    piirraPuu(puu.x, puu.y);
  }

  reunaTeksti("Oma saari", canvas.width / 2, 40, 30, "center");
  reunaTeksti("Kenttäpaja: rakenna omia kenttiä!", canvas.width / 2, 64, 15, "center", "#dff");

  // Polku paikkojen välillä
  const paikkoja = Math.min(OMIA_KENTTIA_MAX, omatKentat.length + 1);
  ctx.strokeStyle = "#a9793e";
  ctx.lineWidth = 5;
  ctx.setLineDash([4, 9]);
  ctx.beginPath();
  for (let i = 0; i < paikkoja; i++) {
    const p = omanKentanPaikka(i);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Kenttien pallot: väri kertoo maailman, ✔ = joku on päässyt kentän läpi
  for (let i = 0; i < paikkoja; i++) {
    const p = omanKentanPaikka(i);
    const tallenne = omatKentat[i];
    const valittu = i === pajaValinta;
    const sade = valittu ? 24 + Math.sin(aika / 200) * 2 : 21;
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 20, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tallenne ? TEEMAT[Number(tallenne.koodi[0])].vari : "#ddd";
    ctx.strokeStyle = valittu ? "gold" : "#333";
    ctx.lineWidth = valittu ? 5 : 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, sade, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    reunaTeksti(tallenne ? String(i + 1) : "+", p.x, p.y + 8, 22, "center");
    if (tallenne && tallenne.lapaisty) piirraOikein(p.x + 20, p.y - 16, 18);
    if (valittu) {
      // Ukko seisoo valitun kentän päällä
      piirraRuutu(kuvat.ukko, Math.floor(aika / 250) % 2, 32, 32, p.x - 32, p.y - 82, false);
    }
  }

  // Alareunan laatikko: valitun kentän tiedot ja napit
  ctx.fillStyle = "rgba(10, 20, 40, 0.78)";
  pyoreaLaatikko(40, 340, 720, 106, 14);
  ctx.fill();
  const tallenne = valittuOmaKentta();
  if (teemanValinta) {
    reunaTeksti("Mihin maailmaan kenttä rakennetaan?", canvas.width / 2, 358, 18, "center");
  } else if (tallenne) {
    const oma = puraKentta(tallenne.koodi);
    reunaTeksti(oma.nimi, canvas.width / 2, 366, 22, "center", "gold");
    let lisa = TEEMAT[oma.teema].nimi + "   •   ";
    if (tallenne.paras) lisa += "paras aika " + muotoileAika(tallenne.paras);
    else lisa += tallenne.lapaisty ? "kokeiltu: toimii!" : "ei vielä läpäisty";
    reunaTeksti(lisa, canvas.width / 2, 386, 14, "center", "#ccc");
  } else {
    reunaTeksti("Tässä on tilaa uudelle kentälle", canvas.width / 2, 370, 18, "center");
  }
  for (const n of pajanNapit()) piirraPajaNappi(n, osoitin.nappi && osoitin.nappi.id === n.id);
  piirraPajaViesti(100);
}

// Tekee paletin kuvakkeet: jokainen palikka laitetaan pikkukenttään, kenttä
// piirretään ja palikan kohta kopioidaan talteen. Näin kuvake on aina saman
// näköinen kuin palikka pelissä, eikä jokaiselle tarvitse tehdä omaa piirtäjää.
function teeKuvakkeet(aika) {
  const teema = muokattava.teema;
  const oikeaKentta = kentta;
  const oikeaKamera = kameraX;
  kuvakkeet = {};
  kameraX = 0;
  for (const merkki of YHTEISET_PALIKAT + TEEMAT[teema].palikat) {
    const mini = { nimi: "", teema: teema, ruudut: {} };
    for (const sarake of [0, 1, 2, 8, 9, 10, 11, 12, 39]) mini.ruudut[ruudunNimi(sarake, ALIN_RIVI)] = "M";
    // Roikkuvat palikat näytetään ilmassa, muut maan päällä
    let rivi = "tiq".includes(merkki) ? 4 : ALIN_RIVI - 1;
    if (PALIKAT[merkki].pohjalle) rivi = ALIN_RIVI;
    mini.ruudut[ruudunNimi(10, rivi)] = merkki;
    if (merkki === "b") mini.ruudut[ruudunNimi(10, ALIN_RIVI)] = "a";
    if (merkki === "h") mini.ruudut[ruudunNimi(10, ALIN_RIVI)] = "z";
    kentta = omaKentaksi(mini);
    valmisteleKentta(kentta);
    naytaPiilossaOlevat(kentta);
    // Ukko näkyy vain omassa kuvakkeessaan
    for (const pl of pelaajat) {
      pl.x = merkki === "A" ? kentta.alku.x : -500;
      pl.y = kentta.alku.y;
    }
    piirraMaailma(aika);
    const c = uusiPiilocanvas(KUVAKKEEN_KOKO, KUVAKKEEN_KOKO);
    const vali = (KUVAKKEEN_KOKO - RUUTU) / 2;
    const y = Math.min(rivinY(rivi) - vali, canvas.height - KUVAKKEEN_KOKO);
    c.getContext("2d").drawImage(canvas, 10 * RUUTU - vali, y, KUVAKKEEN_KOKO, KUVAKKEEN_KOKO, 0, 0, KUVAKKEEN_KOKO, KUVAKKEEN_KOKO);
    kuvakkeet[merkki] = c;
  }
  kentta = oikeaKentta;
  kameraX = oikeaKamera;
  for (const pl of pelaajat) {
    pelaaja = pl;
    siirraPelaajaAlkuun();
    pl.suunta = 1;
  }
  kuvakkeidenTeema = teema;
}

function piirraMuokkaus(aika) {
  // Kuvakkeet tehdään, kun muokkaus avataan (ja kerran uudestaan, jos kuvat olivat vielä latautumassa)
  if (kuvakkeidenTeema !== muokattava.teema) {
    teeKuvakkeet(aika);
    kuvakkeetUudestaan = 90;
  } else if (kuvakkeetUudestaan > 0 && kuvakkeetUudestaan < 2) {
    teeKuvakkeet(aika);
    kuvakkeetUudestaan = 0;
  }

  // Itse kenttä piirretään pelin omalla piirtäjällä
  kameraX = pajaKamera;
  piirraMaailma(aika);

  // Ruudukko ja kentän loppu
  ctx.save();
  ctx.translate(-Math.round(pajaKamera), 0);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const eka = Math.floor(pajaKamera / RUUTU);
  for (let sarake = eka; sarake <= eka + 21; sarake++) {
    ctx.moveTo(sarake * RUUTU + 0.5, RIVIN_YLA);
    ctx.lineTo(sarake * RUUTU + 0.5, canvas.height);
  }
  for (let rivi = 0; rivi < RIVEJA; rivi++) {
    ctx.moveTo(pajaKamera, rivinY(rivi) + 0.5);
    ctx.lineTo(pajaKamera + canvas.width, rivinY(rivi) + 0.5);
  }
  ctx.stroke();
  // Kentän ulkopuoli on tummempi
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(kentta.leveys, 0, canvas.width, canvas.height);
  reunaTeksti("kenttä loppuu", kentta.leveys + 8, 80, 13, "left", "#ddd");

  // Ruutu, jota hiiri osoittaa (tai johon sormi koskee)
  const kentanPaalla = osoitin.x > PALETIN_LEVEYS && osoitin.x < canvas.width - TYOKALUJEN_LEVEYS;
  if (kentanPaalla && tyokalu !== "kasi" && (!kosketusOhjaus || osoitin.alas)) {
    const ruutu = ruutuKohdassa(osoitin.x, osoitin.y);
    ctx.strokeStyle = tyokalu === "kumi" ? "#ff8080" : "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(ruutu.sarake * RUUTU + 1, rivinY(ruutu.rivi) + 1, RUUTU - 2, RUUTU - 2);
  }
  ctx.restore();

  // Paletti vasemmalla
  ctx.fillStyle = "rgba(10, 20, 40, 0.85)";
  ctx.fillRect(0, 0, PALETIN_LEVEYS, canvas.height);
  reunaTeksti("PALIKAT", PALETIN_LEVEYS / 2, 14, 11, "center", "#ccc");
  for (const lokero of paletinLokerot()) {
    const valittu = lokero.merkki === tyokalu;
    const kuva = kuvakkeet[lokero.merkki];
    if (kuva) ctx.drawImage(kuva, lokero.x + 3, lokero.y + 3, LOKERO - 6, LOKERO - 6);
    ctx.strokeStyle = valittu ? "gold" : "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = valittu ? 4 : 1;
    ctx.strokeRect(lokero.x + 3, lokero.y + 3, LOKERO - 6, LOKERO - 6);
  }

  // Työkalut oikealla
  ctx.fillStyle = "rgba(10, 20, 40, 0.85)";
  ctx.fillRect(canvas.width - TYOKALUJEN_LEVEYS, 0, TYOKALUJEN_LEVEYS, canvas.height);
  for (const n of muokkausNapit()) {
    const pohjassa = (osoitin.alas && osoitin.nappi && osoitin.nappi.id === n.id) || tyokalu === n.id;
    if (n.id === "kumi") {
      // Pyyhekumi piirretään itse: vino punavalkoinen palikka
      piirraPajaNappi(Object.assign({}, n, { teksti: "" }), pohjassa);
      ctx.save();
      ctx.translate(n.x + n.leveys / 2, n.y + n.korkeus / 2);
      ctx.rotate(-0.5);
      ctx.fillStyle = "#f4a0a8";
      ctx.fillRect(-15, -8, 20, 16);
      ctx.fillStyle = "#f4f4f4";
      ctx.fillRect(5, -8, 10, 16);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -8, 30, 16);
      ctx.restore();
    } else if (n.id === "valmis") {
      piirraPajaNappi(Object.assign({}, n, { teksti: "" }), pohjassa);
      piirraOikein(n.x + n.leveys / 2, n.y + n.korkeus / 2, 24);
    } else piirraPajaNappi(n, pohjassa);
  }

  // Ylhäällä lukee, mikä palikka on valittuna
  const keski = (PALETIN_LEVEYS + canvas.width - TYOKALUJEN_LEVEYS) / 2;
  let nimi = tyokalu === "kumi" ? "Pyyhekumi" : tyokalu === "kasi" ? "Käsi: vedä kenttää sivulle" : PALIKAT[tyokalu].nimi;
  reunaTeksti(nimi, keski, 26, 16, "center");
  piirraPajaViesti(60);
}

// Kun omaa kenttää pelataan, ruudulla on pari omaa asiaa (peli.js: piirra)
function piirraOmaPeli() {
  if (!omaPeli) return;
  if (tila === "havio") {
    piirraPajaNappi(Object.assign({ teksti: "Takaisin saarelle", vari: "#ffd75e", pieni: true }, HAVION_NAPPI), false);
  } else if (omaPeli.tyyppi === "testi" && tila === "peli") {
    piirraPajaNappi(Object.assign({ teksti: "Takaisin muokkaamaan", vari: "#ffd75e", pieni: true }, TESTIN_NAPPI), false);
  }
}

// Kännykän ohjausnapit piilotetaan pajassa, etteivät ne ole palikoiden tiellä
let pajaLuokka = false;
function paivitaPajaLuokka() {
  if (pajassa() === pajaLuokka || typeof document === "undefined" || !document.body) return;
  pajaLuokka = pajassa();
  document.body.classList.toggle("paja", pajaLuokka);
}

otaKenttaOsoitteesta();
