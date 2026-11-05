// Testaa tulivuoren uudet vihut: kekäle, kipinät, laavaetana ja salamanteri
// Käyttö: node testit/testi_tulivihut.js
const T = require("./peli_node.js")();
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
const p = T.pelaaja1;
// Testikenttä: pelkkä lattia ja yksi vihu
function testikentta(vihu) {
  T.ev("aloitaKentta(5)");
  T.ev(`kentta.viholliset = [${JSON.stringify(vihu)}]; for (const v of kentta.viholliset) { v.elossa = true; v.kuolinAika = 0; v.vy = 0; valmisteleTulivihu(v); }
        kentta.laavat = []; kentta.tulisuihkut = []; kentta.tykit = []; kentta.laavajaljet = []; kentta.syljet = [];`);
  p.elamat = 3; p.suojaAika = 0; p.x = 40; p.y = 370; p.vy = 0;
  return T.kentta.viholliset[0];
}
function hyppaaPaalle(v) {
  p.suojaAika = 0; p.x = v.x + v.leveys / 2 - 10; p.y = v.y - 44; p.edellinenY = p.y - 4; p.vy = 5; p.alusta = null;
  for (let i = 0; i < 4; i++) T.paivita(1);
}
function ammu(v) {
  T.ev(`tulipallot.push({ x: ${v.x - 30}, y: ${v.lattia - 28}, leveys: 16, korkeus: 16, suunta: 1, matka: 0, elossa: true, omistaja: pelaaja1 })`);
  for (let i = 0; i < 12; i++) T.paivita(1);
}

// --- Kekäle ---
let v = testikentta({ tyyppi: "kekale", x: 300, lattia: 410, vasen: 200, oikea: 400 });
const x0 = v.x; for (let i = 0; i < 20; i++) T.paivita(1);
tarkista(v.x !== x0, "kekäle kävelee");
ammu(v);
tarkista(v.elossa, "tulipallo ei tehoa kekäleeseen");
const vihut0 = T.ev("kentanVihut");
hyppaaPaalle(v);
tarkista(!v.elossa && p.elamat === 3 && p.vy < 0, "päälle hyppy tuhoaa kekäleen ja ukko pomppaa");
const kipinat = T.kentta.viholliset.filter((k) => k.tyyppi === "kipina");
tarkista(kipinat.length === 2 && kipinat[0].suunta !== kipinat[1].suunta, "kekäle hajoaa kahdeksi kipinäksi eri suuntiin");
tarkista(T.ev("kentanVihut") === vihut0 + 1, "kekäle lasketaan tuhotuksi vihuksi");
for (let i = 0; i < 30; i++) { T.paivita(1); p.x = 40; }
tarkista(Math.abs(kipinat[0].x - kipinat[1].x) > 80, "kipinät juoksevat erilleen");
tarkista(kipinat.every((k) => k.x >= k.vasen && k.x <= k.oikea), "kipinät pysyvät kekäleen alueella");
for (let i = 0; i < 300; i++) { T.paivita(1); p.x = 40; p.y = 370; p.suojaAika = 999; }
tarkista(kipinat.every((k) => !k.elossa), "kipinät sammuvat itsestään");
v = testikentta({ tyyppi: "kipina", x: 200, lattia: 410, vasen: 0, oikea: 600, suunta: -1 });
p.x = 150; p.suojaAika = 0;
for (let i = 0; i < 40; i++) T.paivita(1);
tarkista(p.elamat === 2, "kipinään koskeminen vie elämän");
T.ev("aloitaKentta(5)");
const lask = T.ev("kentta.viholliset.filter(v => !v.eiLasketa).length");
tarkista(lask === T.kentta.viholliset.filter((v) => v.tyyppi !== "laavapallo").length, "bonukseen lasketaan kekäleet mutta ei laavapalloja");

// --- Laavaetana ---
v = testikentta({ tyyppi: "laavaetana", x: 300, lattia: 410, vasen: 200, oikea: 500 });
for (let i = 0; i < 100; i++) { T.paivita(1); p.x = 40; }
tarkista(T.kentta.laavajaljet.length >= 3, "laavaetana jättää laavajälkeä (" + T.kentta.laavajaljet.length + ")");
const jalki = T.kentta.laavajaljet[T.kentta.laavajaljet.length - 1];
p.suojaAika = 0; p.x = jalki.x - 3; p.y = 370; p.vy = 0;
T.paivita(1);
tarkista(p.elamat === 2, "laavajälki polttaa");
for (let i = 0; i < 400; i++) { T.paivita(1); p.x = 40; p.y = 370; p.suojaAika = 999; }
tarkista(!T.kentta.laavajaljet.includes(jalki), "vanha laavajälki sammuu");
const jalkiPituus = Math.max(...T.kentta.laavajaljet.map((j) => j.x)) - Math.min(...T.kentta.laavajaljet.map((j) => j.x)) + 14;
tarkista(jalkiPituus + 30 < 110, "etana + jälki on lyhyempi kuin hyppy (" + jalkiPituus + " + 30 px)");
v = testikentta({ tyyppi: "laavaetana", x: 300, lattia: 410, vasen: 200, oikea: 500 });
hyppaaPaalle(v);
tarkista(v.elossa && p.elamat === 2, "laavaetanan päälle hyppy sattuu (kuuma kuori)");
p.suojaAika = 0;
ammu(v);
tarkista(!v.elossa && v.palanut, "tulipallo tuhoaa laavaetanan");

// --- Salamanteri ---
v = testikentta({ tyyppi: "salamanteri", x: 400, lattia: 410, vasen: 300, oikea: 600, vaihe: 10 });
let sylki = false, suuntaOk = false;
for (let i = 0; i < 80; i++) { T.paivita(1); p.x = 150; p.y = 370; if (T.kentta.syljet.length) { sylki = true; suuntaOk = T.kentta.syljet[0].vx < 0; } }
tarkista(sylki, "salamanteri sylkee tulta, kun ukko on lähellä");
tarkista(suuntaOk && v.suunta === -1, "salamanteri sylkee ukkoa kohti");
for (let i = 0; i < 80; i++) { T.paivita(1); p.x = 150; p.y = 370; }
tarkista(p.elamat === 2, "tulisylky osuu seisovaan ukkoon");
v = testikentta({ tyyppi: "salamanteri", x: 400, lattia: 410, vasen: 300, oikea: 600, vaihe: 9999 });
p.x = 1200;
for (let i = 0; i < 200; i++) T.paivita(1);
tarkista(T.kentta.syljet.length === 0 && v.tila === "kavelee", "salamanteri ei sylje, kun ukko on kaukana");
hyppaaPaalle(v);
tarkista(!v.elossa && p.elamat === 3, "salamanterin päälle voi hypätä");
v = testikentta({ tyyppi: "salamanteri", x: 400, lattia: 410, vasen: 300, oikea: 600, vaihe: 9999 });
ammu(v);
tarkista(!v.elossa, "tulipallo tuhoaa salamanterin");
v = testikentta({ tyyppi: "salamanteri", x: 400, lattia: 410, vasen: 300, oikea: 600, vaihe: 9999 });
T.ev("kentta.syljet.push({ x: 300, y: 384, leveys: 14, korkeus: 14, vx: -4, matka: 0, elossa: true })");
T.ev("tulipallot.push({ x: 240, y: 384, leveys: 16, korkeus: 16, suunta: 1, matka: 0, elossa: true, omistaja: pelaaja1 })");
for (let i = 0; i < 12; i++) T.paivita(1);
tarkista(T.kentta.syljet.length === 0 && T.ev("tulipallot.length") === 0, "tulipallo ja tulisylky sammuttavat toisensa");

// --- Kentät ---
const vanhat = ["vihu", "piikkis", "pomppija", "tippuja", "ryomija"];
let vanhoja = 0; const uusia = new Set();
for (let n = 5; n <= 10; n++) {
  T.ev(`aloitaKentta(${n})`);
  vanhoja += T.kentta.viholliset.filter((v) => vanhat.includes(v.tyyppi)).length + T.kentta.lentovihut.length;
  T.kentta.viholliset.forEach((v) => uusia.add(v.tyyppi));
}
tarkista(vanhoja === 0, "tulivuorikentissä ei ole vanhoja vihuja");
tarkista(["kekale", "laavaetana", "salamanteri"].every((t) => uusia.has(t)), "kaikki kolme uutta vihua ovat kentissä");
let virhe = null;
try {
  for (const kaksi of [false, true]) {
    T.kaksinpeli(kaksi);
    for (let n = 0; n < T.KENTAT.length; n++) { T.ev(`aloitaKentta(${n})`); for (let i = 0; i < 600; i++) { T.paivita(1); if (i % 60 === 0) T.piirra(i * 16); } }
  }
} catch (e) { virhe = e; }
tarkista(!virhe, "kaikki 11 kenttää pyörivät ja piirtyvät (1P ja 2P) " + (virhe ? virhe.stack : ""));

console.log("\n" + ok + " ok, " + vika + " vikaa");
