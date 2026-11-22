// Testaa salakuopat, aarrekammiot ja aarteet (aarteet.js)
// Käyttö: node testit/testi_aarteet.js
const lataa = require("./peli_node.js");
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
const data = {};
const muisti = { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => (data[k] = String(v)), removeItem: (k) => delete data[k] };
let T = lataa(muisti);
let p = T.pelaaja1;
const askel = (n) => { for (let i = 0; i < n; i++) T.paivita(1); };
const kammiossa = () => T.ev("kammiossa");
const kentat = T.ev("KENTAT.length");

// Pudottaa ukon kohtaan x kuopan suulle ja odottaa, mitä tapahtuu
const pudota = (x) => {
  p.x = x - 10; p.y = 372; p.vx = 0; p.vy = 0; p.suojaAika = 0;
  for (let i = 0; i < 40 && !kammiossa() && T.tila === "peli" && p.y > 200; i++) T.paivita(1);
};
// Kävelee kammion läpi oikealle. Hyppyä ei tarvita: pieninkin pelaaja pääsee ulos.
const kaveleUlos = () => {
  T.napit.ArrowRight = true;
  for (let i = 0; i < 600 && kammiossa(); i++) T.paivita(1);
  T.napit.ArrowRight = false;
};

tarkista(T.ev("SALAKUOPAT.length") === kentat, "jokaisessa kentässä (" + kentat + ") on salakuoppa");

// ---------- Jokainen kenttä, normaali ja vaikea ----------
for (const vaikea of [false, true]) {
  const viat = [];
  for (let n = 0; n < kentat; n++) {
    T.ev("vaikea = " + vaikea); T.kaksinpeli(false); T.aloitaKentta(n); T.ev("siirtyma = 0");
    const k = T.kentta, s = k.salakuoppa, nimi = (n + 1) + " " + k.nimi;
    if (!s) { viat.push(nimi + ": ei salakuoppaa"); continue; }
    // Salakuoppa on oikeasti kuoppa: sen kohdalla ei ole maata
    const maata = k.kaikkiTasot.some((t) => !t.eiKiintea && t.x < s.x + s.leveys && t.x + t.leveys > s.x && t.y < 450 && t.y + t.korkeus > 400);
    if (maata) viat.push(nimi + ": salakuopan kohdalla on maata");
    // Kuopassa ei asu laavapalloa eikä haukea
    if (k.viholliset.some((v) => (v.tyyppi === "laavapallo" || v.tyyppi === "jaahauki") && v.x + 30 > s.x && v.x < s.x + s.leveys)) viat.push(nimi + ": kuopassa asuu vihu");
    p.elamat = 3;
    const aikaEnnen = T.ev("kentanAika");
    pudota(s.x + s.leveys / 2);
    if (!kammiossa() || p.elamat !== 3 || T.tila !== "peli") { viat.push(nimi + ": putoaminen ei vienyt kammioon (elämät " + p.elamat + ")"); continue; }
    T.piirra(100);
    const vihu = k.viholliset.find((v) => v.elossa && v.nopeus > 0 && v.tyyppi === "vihu");
    const vihuX = vihu ? vihu.x : 0;
    p.elamat = 2; // sydän antaa elämän takaisin
    kaveleUlos();
    T.piirra(200);
    if (kammiossa()) { viat.push(nimi + ": kammiosta ei päässyt ulos"); continue; }
    if (!k.aarre.keratty) viat.push(nimi + ": aarre jäi keräämättä");
    if (p.elamat !== 3) viat.push(nimi + ": sydän jäi keräämättä");
    if (vihu && vihu.x !== vihuX) viat.push(nimi + ": vihu liikkui, vaikka oltiin kammiossa");
    if (!(T.ev("kentanAika") > aikaEnnen + 1)) viat.push(nimi + ": kello ei käynyt kammiossa");
    if (Math.abs(p.x - s.ulosX) > 1 || Math.abs(p.y - s.ulosY) > 1) viat.push(nimi + ": ukko ei palannut oikeaan paikkaan");
    // Ukko jää seisomaan tukevalle maalle eikä menetä elämää
    const sisalla = k.kaikkiTasot.some((t) => !t.eiKiintea && t.x < p.x + 20 && t.x + t.leveys > p.x && t.y < p.y + 40 && t.y + t.korkeus > p.y);
    if (sisalla) viat.push(nimi + ": ukko palasi seinän sisään");
    askel(50);
    if (!p.maassa || p.elamat !== 3 || T.tila !== "peli" || kammiossa()) viat.push(nimi + ": paluun jälkeen ukko ei seiso turvassa (y " + Math.round(p.y) + ", elämät " + p.elamat + ")");
    if (Math.abs(p.y - s.ulosY) > 1) viat.push(nimi + ": paluupaikan lattia on väärällä korkeudella (" + s.ulosY + " -> " + p.y + ")");
  }
  tarkista(viat.length === 0, (vaikea ? "vaikea" : "normaali") + ": jokaisen kentän salakuopasta pääsee kammioon, saa aarteen ja sydämen ja palaa turvaan" + (viat.length ? "\n   " + viat.join("\n   ") : ""));
}
T.ev("vaikea = false");

// ---------- Tavallinen kuoppa vie yhä elämän ----------
T = lataa(muisti); p = T.pelaaja1;
T.ev("aloitaPeli()"); T.aloitaKentta(0); T.ev("siirtyma = 0");
p.elamat = 3; pudota(1740); askel(40);
tarkista(p.elamat === 2 && !kammiossa(), "tavallinen kuoppa vie yhä elämän");
T.aloitaKentta(2); T.ev("siirtyma = 0");
p.elamat = 3; pudota(1620); askel(40);
tarkista(p.elamat === 2 && !kammiossa(), "leveässä kuopassa vain salainen kohta on turvallinen");
T.aloitaKentta(6); T.ev("siirtyma = 0");
p.elamat = 3; pudota(2405); askel(40);
tarkista(p.elamat === 2 && !kammiossa(), "tavallinen laava polttaa yhä");
T.aloitaKentta(11); T.ev("siirtyma = 0");
p.elamat = 3; pudota(1535); askel(40);
tarkista(p.elamat === 2 && !kammiossa(), "tavallinen avanto on yhä hyinen");

// ---------- Aarre, pisteet ja tallennus ----------
T.aloitaKentta(0); T.ev("siirtyma = 0");
tarkista(T.ev("aarteitaLoydetty()") === 0 && !T.ev("aarteet[0]"), "alussa aarteita ei ole löydetty");
const pisteetEnnen = T.ev("pisteet");
pudota(1040);
tarkista(kammiossa() && T.ev("kameraX") === T.ev("KAMMION_X"), "kammiossa kamera pysyy paikallaan");
tarkista(T.ev("nauhoitus[nauhoitus.length - 1]") === 900 || (askel(8), T.ev("nauhoitus[nauhoitus.length - 1]") === 900), "varjo on piilossa, kun ollaan kammiossa");
T.paina("Escape"); T.piirra(0); T.paina("Escape");
tarkista(T.tila === "peli" && kammiossa(), "tauko toimii kammiossa");
askel(3); // tauon jälkeen ukko odottaa, että napit ovat ylhäällä
kaveleUlos();
tarkista(T.ev("aarteet[0]") === true && T.ev("pisteet") >= pisteetEnnen + 1000, "aarre antaa 1000 pistettä ja jää muistiin");
tarkista(JSON.parse(data.ukonSeikkailuTallennus).aarteet[0] === true, "löytö tallentuu heti");
tarkista(p.odotaNostoa === true && p.suojaAika > 0, "paluun jälkeen ukko odottaa nappien nostoa ja on hetken suojassa");
askel(5);
p.x = T.kentta.maali.x; p.y = T.kentta.maali.lattia - 40; askel(2);
tarkista(T.tila === "kenttaValmis" && T.ev("tulos.some((r) => r[0] === 'Aarre löytyi!')"), "pistelaskelmassa on rivi aarteesta");
T.piirra(3000);

// Uudella kerralla aarre on taas kammiossa, mutta löytöjen määrä ei kasva
T.aloitaKentta(0); T.ev("siirtyma = 0");
pudota(1040); kaveleUlos();
tarkista(T.kentta.aarre.keratty && T.ev("aarteitaLoydetty()") === 1, "sama aarre lasketaan löydetyksi vain kerran");

// Kuolema kammion jälkeen: ukko palaa kenttään, ei kammioon
T.aloitaKentta(0); T.ev("siirtyma = 0");
pudota(1040);
T.ev("pelaaja = pelaaja1; menetaElama()");
tarkista(!kammiossa() && p.x >= 0, "jos elämä menee, ukko palaa kenttään");

// Sivun lataus ja Jatka
T = lataa(muisti); p = T.pelaaja1;
T.ev("jatkaPelia()");
tarkista(T.ev("aarteet[0]") === true && T.ev("aarteitaLoydetty()") === 1, "aarteet säilyvät, kun sivu ladataan uudestaan");
T.piirra(0);

// ---------- Kultainen Ukko ----------
tarkista(!T.ev("kaikkiAarteetLoydetty()"), "yksi aarre ei vielä riitä kultaiseen Ukkoon");
T.ev("for (let i = 0; i < SALAKUOPAT.length; i++) aarteet[i] = true");
tarkista(T.ev("kaikkiAarteetLoydetty()"), "kun kaikki aarteet on löydetty, Ukko on kultainen");
T.aloitaKentta(1); T.piirra(0); askel(5); T.piirra(100);
T.ev("aloitaPeli()");
tarkista(T.ev("aarteitaLoydetty()") === 0, "uusi peli aloittaa aarteet alusta");

// ---------- Kaksinpeli ----------
T.kaksinpeli(true); T.aloitaKentta(0); T.ev("siirtyma = 0");
const p2 = T.pelaaja2;
p2.x = 900; p2.y = 370;
pudota(1040);
tarkista(kammiossa() && p2.x < 0 && p.x < 0, "kaksinpelissä molemmat pääsevät kammioon");
T.piirra(0);
kaveleUlos();
tarkista(!kammiossa() && p.x > 1080 && p2.x > 1080 && Math.abs(p2.x - p.x) < 40, "ja molemmat palaavat kuopan reunalle");
askel(40);
tarkista(p.elamat > 0 && p2.elamat > 0 && p2.maassa, "kumpikaan ei putoa paluun jälkeen");
T.kaksinpeli(false);

// ---------- Vaikea Pakkassaari: kammiossa on lämmintä ----------
T.ev("vaikea = true"); T.aloitaKentta(11); T.ev("siirtyma = 0");
p.tuli = 40;
pudota(2950);
askel(60);
tarkista(kammiossa() && p.tuli > 40, "vaikealla Pakkassaarella kammiossa ukko lämpenee");
T.ev("vaikea = false");

// ---------- Oma kenttä ----------
T.ev("aloitaOmaKentta(uusiOmaKentta(0, 'Testi'), 'testi', 0)");
tarkista(!T.kentta.salakuoppa && !T.kentta.aarre, "omassa kentässä ei ole salakuoppaa");
T.piirra(0);

console.log("\n" + ok + " ok, " + vika + " vikaa");
process.exit(vika ? 1 : 0);
