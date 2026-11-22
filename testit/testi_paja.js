// Testaa Kenttäpajan: omien kenttien pakkaus, rakentaminen, kokeilu, pelaaminen ja jakolinkki
// Käyttö: node testit/testi_paja.js
const lataa = require("./peli_node.js");
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
const data = {};
const muisti = { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => (data[k] = String(v)), removeItem: (k) => delete data[k] };
let T = lataa(muisti);
let p = T.pelaaja1;
const askel = (n) => { for (let i = 0; i < n; i++) T.paivita(1); };
const napit = (lista) => { for (const k in T.napit) delete T.napit[k]; for (const k of lista) T.napit[k] = true; };
const valittu = () => T.ev("valittuRivi().id");
// Napautus pelin koordinaateissa (alas ja ylös samassa kohdassa)
const napauta = (x, y) => { T.ev(`pajaOsoitin("alas", ${x}, ${y})`); T.ev(`pajaOsoitin("ylos", ${x}, ${y})`); };
// Napauttaa nappia, jonka id on annettu (Oma saari tai muokkaus)
const painaNappia = (id) => { const n = T.ev(`(tila === "paja" ? pajanNapit() : muokkausNapit()).find((n) => n.id === "${id}")`); napauta(n.x + 5, n.y + 5); };
// Napauttaa kentän ruutua muokkauksessa (kenttä vieritetään ensin niin, että ruutu on näkyvissä)
const ruutu = (sarake, rivi) => { T.ev(`pajaKamera = rajaaKamera(${sarake} * 40 - 400)`); napauta(sarake * 40 + 20 - T.ev("pajaKamera"), 10 + rivi * 40 + 20); };
const tyokalu = (merkki) => { const l = T.ev(`paletinLokerot().find((l) => l.merkki === "${merkki}")`); napauta(l.x + 5, l.y + 5); };
const palikka = (sarake, rivi) => T.ev(`muokattava.ruudut["${sarake},${rivi}"]`);

// ---------- Pakkaus ----------
const koodi0 = T.ev("pakkaaKentta(uusiOmaKentta(0, 'Testi'))");
tarkista(koodi0 === "0~Testi~A019L119-14M00a", "uusi kenttä pakkautuu lyhyeksi tekstiksi (" + koodi0 + ")");
tarkista(T.ev(`pakkaaKentta(puraKentta("${koodi0}"))`) === koodi0, "purettu ja uudestaan pakattu kenttä on sama");
tarkista(T.ev("puraKentta('roskaa')") === null && T.ev("puraKentta('9~x~M00a')") === null, "rikkinäinen teksti ei kelpaa kentäksi");
tarkista(T.ev("pakkaaKentta(puraKentta('1~Ilman ukkoa~M00a'))").includes("A019") , "kenttään lisätään ukko ja maali, jos ne puuttuvat");
tarkista(T.ev("puraKentta('0~~M00a').nimi") === "Oma kenttä", "tyhjä nimi korvataan");
tarkista(T.ev("kentanLinkki === undefined") === false && T.ev("kenttaOsoitteesta()") === null, "ilman linkkiä osoitteesta ei tule kenttää");

// ---------- Jokainen palikka toimii jokaisessa maailmassa ----------
for (const [vaikea, kaksin] of [[false, false], [true, true]]) for (let teema = 0; teema < 3; teema++) {
  let virhe = null;
  T.ev("vaikea = " + vaikea);
  T.kaksinpeli(kaksin);
  try {
    T.ev(`(() => {
      const oma = uusiOmaKentta(${teema}, "Kaikki palikat");
      const merkit = (YHTEISET_PALIKAT + TEEMAT[${teema}].palikat).split("").filter((m) => !PALIKAT[m].ainoa);
      merkit.forEach((m, i) => {
        const s = 4 + i * 2;
        let rivi = "tiqlwSK".includes(m) ? 4 : 9;
        if (PALIKAT[m].pohjalle) rivi = 10;
        oma.ruudut[s + "," + rivi] = m;
        if (m === "b") oma.ruudut[s + ",10"] = "a";
        if (m === "h") oma.ruudut[s + ",10"] = "z";
      });
      aloitaOmaKentta(oma, "oma", 0);
    })()`);
    T.ev("omatKentat = [{ koodi: pakkaaKentta(omaPeli.kentta), lapaisty: false, paras: 0 }]");
    for (let i = 0; i < 400; i++) { p.suojaAika = 99; T.pelaaja2.suojaAika = 99; p.tuli = 100; T.paivita(1); if (i % 40 === 0) T.piirra(i * 16); }
  } catch (e) { virhe = e; }
  const miten = vaikea ? " (vaikea, 2 pelaajaa)" : "";
  tarkista(virhe === null && T.tila === "peli", "maailman " + (teema + 1) + " kaikki palikat pyörivät ja piirtyvät kentässä" + miten + (virhe ? " " + virhe.stack : ""));
}
T.ev("lopetaOmaPeli(); omatKentat = []; tila = 'alku'; vaikea = false");
T.kaksinpeli(false);

// ---------- Alkuvalikko ja Oma saari ----------
T.ev("valikonValinta = valikonRivit().findIndex((r) => r.id === 'paja')");
tarkista(valittu() === "paja", "alkuvalikossa on rivi Rakenna kenttä");
T.paina("Enter");
tarkista(T.tila === "paja", "Enter avaa Oman saaren");
T.piirra(0);
painaNappia("uusi");
tarkista(T.ev("teemanValinta") === true, "Rakenna uusi kenttä kysyy maailman");
T.piirra(0);
painaNappia("teema1");
tarkista(T.tila === "muokkaus" && T.ev("muokattava.teema") === 1 && T.ev("omatKentat.length") === 1, "maailman valinta avaa muokkauksen ja kenttä on tallessa");
tarkista(JSON.parse(data.ukonSeikkailuOmatKentat).length === 1, "uusi kenttä tallentuu selaimen muistiin");
T.piirra(0);
T.paina("Escape");
tarkista(T.tila === "paja", "Esc palaa muokkauksesta Omalle saarelle");
painaNappia("poista");
tarkista(T.ev("omatKentat.length") === 1 && T.ev("poistoVahvistus") === true, "Poista kysyy ensin varmistuksen");
painaNappia("poista");
tarkista(T.ev("omatKentat.length") === 0, "toinen painallus poistaa kentän");

// ---------- Muokkaus ----------
painaNappia("uusi"); painaNappia("teema0");
tarkista(T.ev("tyokalu") === "M" && palikka(1, 9) === "A" && palikka(37, 9) === "L" && palikka(20, 10) === "M", "uudessa kentässä on maa, ukko ja maali");
ruutu(5, 7);
tarkista(palikka(5, 7) === "M", "napautus laittaa maapalikan ruutuun");
ruutu(5, 7);
tarkista(palikka(5, 7) === undefined, "saman palikan napautus uudestaan ottaa sen pois");
// Veto: maalataan kolme tasoa peräkkäin
tyokalu("T");
T.ev("pajaOsoitin('alas', 6 * 40 + 20 - pajaKamera, 290); pajaOsoitin('liike', 7 * 40 + 20 - pajaKamera, 290); pajaOsoitin('liike', 8 * 40 + 20 - pajaKamera, 290); pajaOsoitin('ylos', 8 * 40 + 20 - pajaKamera, 290)");
tarkista(palikka(6, 7) === "T" && palikka(7, 7) === "T" && palikka(8, 7) === "T", "sormea vetämällä tulee monta tasoa peräkkäin");
tarkista(T.kentta.tasot.some((t) => t.x === 240 && t.leveys === 120 && t.korkeus === 20), "vierekkäiset tasot yhdistyvät yhdeksi pitkäksi tasoksi");
painaNappia("kumoa");
tarkista(palikka(6, 7) === undefined && palikka(8, 7) === undefined, "↩ kumoaa koko vedon kerralla");
// Lattialle putoavat palikat
tyokalu("v");
ruutu(10, 3);
tarkista(palikka(10, 9) === "v" && palikka(10, 3) === undefined, "ilmaan napautettu vihu putoaa maan päälle");
const vihu = T.kentta.viholliset[0];
tarkista(vihu && vihu.lattia === 410 && vihu.vasen < vihu.x && vihu.oikea > vihu.x, "vihu seisoo maassa ja saa kävelyalueen (" + (vihu && vihu.vasen + "–" + vihu.oikea) + ")");
ruutu(10, 3);
tarkista(T.kentta.viholliset.length === 1, "vetämällä tai uudestaan napauttamalla ei tule kahta vihua samaan ruutuun");
tyokalu("J");
ruutu(12, 10);
tarkista(palikka(12, 9) === "J", "maahan napautettu jousi nousee maan päälle");
// Kuoppa: pyyhitään maata
painaNappia("kumi");
ruutu(15, 10); ruutu(16, 10);
tarkista(palikka(15, 10) === undefined && palikka(16, 10) === undefined, "pyyhekumi tekee kuopan");
tyokalu("p");
ruutu(15, 5);
tarkista(palikka(15, 9) === undefined && T.ev("pajaViestiAika") > 0, "kuopan päälle ei voi laittaa vihua (tulee viesti)");
// Ukko ja maali
painaNappia("kumi");
ruutu(1, 9);
tarkista(palikka(1, 9) === "A", "ukkoa ei voi pyyhkiä pois");
tyokalu("A");
ruutu(3, 9);
tarkista(palikka(3, 9) === "A" && palikka(1, 9) === undefined && T.kentta.alku.x === 130, "ukon voi siirtää: vanha lähtee pois");
tyokalu("L");
ruutu(22, 9);
tarkista(palikka(22, 9) === "L" && palikka(37, 9) === undefined, "maalin voi siirtää");
tyokalu("K");
ruutu(22, 9);
tarkista(palikka(22, 9) === "L", "maalin päälle ei voi laittaa muuta");
ruutu(8, 9); ruutu(9, 9);
tarkista(T.kentta.kolikot.length === 2, "kolikot tulevat kenttään");
// Liaani kuopan yläpuolelle
tyokalu("i");
ruutu(16, 3);
tarkista(T.kentta.liaanit.length === 1 && T.kentta.liaanit[0].x === 660, "liaani roikkuu napautetusta ruudusta");
const tallennettu = JSON.parse(data.ukonSeikkailuOmatKentat)[0].koodi;
tarkista(tallennettu.includes("i0g3") && tallennettu.includes("A039"), "jokainen muutos tallentuu heti (" + tallennettu + ")");
// Vieritys
const kamera0 = T.ev("pajaKamera");
napit(["ArrowRight"]); askel(30); napit([]);
tarkista(T.ev("pajaKamera") > kamera0 + 200, "nuolinäppäin vierittää kenttää");
T.ev("tyokalu = 'kasi'; pajaOsoitin('alas', 400, 200); pajaOsoitin('liike', 500, 200); pajaOsoitin('ylos', 500, 200)");
tarkista(Math.abs(T.ev("pajaKamera") - (kamera0 + 270 - 100)) < 2, "käsi-työkalulla kenttää voi vetää sivulle");
T.piirra(0);

// ---------- Kokeilu ----------
const elamatEnnen = (p.elamat = 2);
painaNappia("testi");
tarkista(T.tila === "peli" && T.ev("omaPeli.tyyppi") === "testi" && p.elamat === 3 && p.x === 130, "▶ aloittaa kokeilun ukon paikalta täysillä elämillä");
T.piirra(0);
// Juostaan kuoppaan
napit(["ArrowRight"]);
for (let i = 0; i < 400 && T.tila === "peli"; i++) { T.ev("kentta.viholliset.forEach((v) => (v.elossa = false))"); askel(1); }
napit([]);
tarkista(T.tila === "muokkaus" && p.elamat === elamatEnnen, "kokeilussa kuolema vie takaisin muokkaukseen eikä vie elämää");
tarkista(Math.abs(T.ev("pajaKamera") + 400 - 600) < 120, "muokkaus aukeaa kuolinpaikan kohdalta");
tarkista(T.ev("omatKentat[0].lapaisty") === false, "kesken jäänyt kokeilu ei merkitse kenttää läpäistyksi");
// Korjataan kuoppa ja kokeillaan uudestaan
tyokalu("M");
ruutu(15, 10); ruutu(16, 10);
painaNappia("testi");
T.paina("Escape");
tarkista(T.tila === "muokkaus", "Esc kesken kokeilun palaa muokkaukseen (ei taukovalikkoa)");
painaNappia("testi");
T.ev("pajaOsoitin('alas', TESTIN_NAPPI.x + 10, TESTIN_NAPPI.y + 10)");
tarkista(T.tila === "muokkaus", "ruudun nappi Takaisin muokkaamaan toimii");
painaNappia("testi");
T.ev("kentta.viholliset.forEach((v) => (v.elossa = false))");
napit(["ArrowRight"]);
for (let i = 0; i < 600 && T.tila === "peli"; i++) askel(1);
askel(2);
napit([]);
tarkista(T.tila === "muokkaus" && T.ev("omatKentat[0].lapaisty") === true, "maaliin pääsy palaa muokkaukseen ja merkitsee kentän toimivaksi");
tyokalu("K");
ruutu(11, 6);
tarkista(T.ev("omatKentat[0].lapaisty") === false, "muutoksen jälkeen kenttä pitää kokeilla uudestaan");

// ---------- Valmiin kentän pelaaminen ----------
painaNappia("valmis");
tarkista(T.tila === "paja", "valmis-nappi palaa Omalle saarelle");
const tallennusEnnen = data.ukonSeikkailuTallennus;
const pisteetEnnen = T.ev("pisteet");
painaNappia("pelaa");
tarkista(T.tila === "peli" && T.ev("omaPeli.tyyppi") === "oma" && T.ev("kentta.nimi") === "Oma kenttä 1", "Pelaa aloittaa oman kentän");
T.ev("kentta.viholliset.forEach((v) => (v.elossa = false))");
napit(["ArrowRight"]);
for (let i = 0; i < 600 && T.tila === "peli"; i++) askel(1);
napit([]);
tarkista(T.tila === "kenttaValmis" && T.ev("omatKentat[0].lapaisty && omatKentat[0].paras > 0"), "maalissa tulee pistelaskelma ja paras aika jää muistiin (" + T.ev("omatKentat[0].paras") + " s)");
T.piirra(0);
askel(200);
T.paina("Enter");
tarkista(T.tila === "paja" && p.elamat === elamatEnnen && T.ev("pisteet") === pisteetEnnen, "laskelman jälkeen palataan saarelle, ja seikkailun elämät ja pisteet ovat ennallaan");
tarkista(data.ukonSeikkailuTallennus === tallennusEnnen && T.ev("ennatys") === 0, "oma kenttä ei muuta seikkailun tallennusta eikä ennätystä");
// Häviö omassa kentässä
painaNappia("pelaa");
for (let i = 0; i < 3; i++) { T.ev("pelaaja = pelaaja1; pelaaja1.suojaAika = 0; menetaElama()"); }
tarkista(T.tila === "havio", "kolme osumaa omassa kentässä = häviö");
T.piirra(0);
T.ev("pajaOsoitin('alas', HAVION_NAPPI.x + 10, HAVION_NAPPI.y + 10)");
tarkista(T.tila === "paja" && p.elamat === elamatEnnen, "häviöruudun nappi vie takaisin saarelle");
painaNappia("pelaa");
for (let i = 0; i < 3; i++) { T.ev("pelaaja = pelaaja1; pelaaja1.suojaAika = 0; menetaElama()"); }
T.paina("KeyR");
tarkista(T.tila === "peli" && p.elamat === 3 && T.ev("omaPeli.tyyppi") === "oma", "R aloittaa saman oman kentän alusta");
T.paina("Escape");
tarkista(T.tila === "tauko" && T.ev("valikonRivit()[1].teksti") === "Palaa pajaan", "tauolla lukee Palaa pajaan");
T.paina("ArrowDown"); T.paina("Enter");
tarkista(T.tila === "paja" && p.elamat === elamatEnnen, "Palaa pajaan vie saarelle ja palauttaa elämät");
painaNappia("takaisin");
tarkista(T.tila === "alku" && valittu() === "paja", "Takaisin palaa alkuvalikkoon");
// Seikkailu toimii yhä tavallisesti
T.ev("valikonValinta = 0");
T.paina("Enter");
T.paina("Escape"); // ohitetaan tarinan alkukohtaus (tarina.js)
T.paina("Enter");
tarkista(T.tila === "peli" && T.ev("omaPeli") === null && T.ev("kentta.nimi") === "Vihreät kukkulat", "oman kentän jälkeen seikkailun kenttä 1 alkaa tavallisesti");

// ---------- Jakolinkki ----------
const jaettu = "2~Mummon kenttä~K057A019L0c9-0eM00a";
const T2 = (() => {
  const fs = require("fs"), path = require("path");
  // Sama lataus, mutta osoitteessa on kenttä
  const alkup = fs.readFileSync(path.join(__dirname, "peli_node.js"), "utf8");
  const muokattu = alkup.replace('location: { search: "" }', 'location: { search: "", hash: "#k=' + encodeURIComponent(jaettu) + '", pathname: "/", origin: "https://esimerkki" }');
  const m = { exports: {} };
  new Function("module", "require", "__dirname", muokattu)(m, require, __dirname);
  return m.exports(muisti);
})();
tarkista(T2.tila === "paja" && T2.ev("omatKentat.length") === 2 && T2.ev("omatKentat[1].koodi") === jaettu, "jakolinkistä avattu kenttä tulee Omalle saarelle");
tarkista(T2.ev("pajaValinta") === 1 && T2.ev("puraKentta(omatKentat[1].koodi).nimi") === "Mummon kenttä", "saatu kenttä on valittuna oikealla nimellä");
tarkista(T2.ev("kentanLinkki(omatKentat[1].koodi)") === "https://esimerkki/#k=" + encodeURIComponent(jaettu), "kentästä tehty linkki on sama kuin se, josta kenttä tuli");
T2.paina("Enter");
tarkista(T2.tila === "peli" && T2.ev("kentta.laatat") === "lumi" && T2.ev("kentta.kolikot.length") === 1, "saatua kenttää voi pelata heti");

console.log("\n" + ok + " ok, " + vika + " vikaa");
process.exit(vika ? 1 : 0);
