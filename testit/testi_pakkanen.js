// Testaa Pakkassaaren (maailma 3) uudet asiat: jää, jäälohkot, nuotio, jääpuikot,
// vesi, tuuli, uudet vihut, Pakkasukko ja vanhan tallennuksen päivitys.
// Käyttö: node testit/testi_pakkanen.js
const lataa = require("./peli_node.js");
let T = lataa();
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
let p = T.pelaaja1;
const askel = (n) => { for (let i = 0; i < n; i++) T.paivita(1); };
const napit = (lista) => { for (const k in T.napit) delete T.napit[k]; for (const k of lista) T.napit[k] = true; };

// Testikenttä: pitkä lattia (lunta 0..1000, jäätä 1000..2000) eikä mitään muuta
function testikentta(lisaa) {
  T.ev("aloitaKentta(11)");
  T.ev(`Object.assign(kentta, { leveys: 3000, viholliset: [], kolikot: [], sydamet: [], vedet: [], nuotiot: [], jaalohkot: [], jaapuikot: [], tuulet: [], lumipallot: [],
        tasot: [{ x: 0, y: 410, leveys: 1000, korkeus: 40 }, { x: 1000, y: 410, leveys: 1000, korkeus: 40, jaa: true }], liikkuvatTasot: [], putoavatTasot: [] }, ${JSON.stringify(lisaa || {})});
        valmistelePakkanen(kentta); for (const v of kentta.viholliset) { v.elossa = true; v.kuolinAika = 0; v.vy = 0; valmistelePakkasvihu(v); }
        kentta.kaikkiTasot = kentta.tasot.concat(kentta.liikkuvatTasot, kentta.putoavatTasot); tulipallot = [];`);
  napit([]);
  Object.assign(p, { elamat: 3, suojaAika: 0, x: 100, y: 370, vy: 0, vx: 0, jaaVauhti: 0, potkuAika: 0, odotaNostoa: false, tuli: 100, maassa: true });
  askel(2);
}
const ammu = (x, y) => T.ev(`tulipallot.push({ x: ${x}, y: ${y}, leveys: 16, korkeus: 16, suunta: 1, matka: 0, elossa: true, omistaja: pelaaja1 })`);
function hyppaaPaalle(v) {
  p.suojaAika = 0; p.x = v.x + v.leveys / 2 - 10; p.y = v.y - 44; p.edellinenY = p.y - 4; p.vy = 5; p.alusta = null;
  askel(3);
}

// --- Liukas jää ---
testikentta();
napit(["ArrowRight"]); askel(30); napit([]);
let x0 = p.x; askel(10);
tarkista(p.x === x0, "lumella ukko pysähtyy heti, kun napin päästää");
p.x = 1200; askel(2);
napit(["ArrowRight"]); askel(4);
tarkista(p.vx > 0 && p.vx < 4, "jäällä ukko kiihtyy vähitellen (vauhti " + p.vx.toFixed(2) + ")");
askel(40);
tarkista(p.vx === 4, "jäällä pääsee lopulta täyteen vauhtiin");
napit([]); x0 = p.x; askel(15);
tarkista(p.x > x0 + 20, "jäällä ukko liukuu vielä, kun napin päästää (" + (p.x - x0).toFixed(0) + " px)");
askel(60); x0 = p.x; askel(5);
tarkista(p.x === x0, "liuku loppuu aikanaan");

// --- Jäälohko ja nuotio ---
testikentta({ jaalohkot: [{ x: 300, lattia: 410, leveys: 40, korkeus: 170 }], kolikot: [{ x: 310, y: 380 }], nuotiot: [{ x: 600, lattia: 410 }] });
T.ev("for (const k of kentta.kolikot) { k.leveys = 20; k.korkeus = 20; k.keratty = false; }");
p.x = 200; napit(["ArrowRight"]); askel(60);
tarkista(p.x === 280, "jäälohko pysäyttää ukon (x " + p.x + ")");
tarkista(!T.kentta.kolikot[0].keratty, "jäälohkon sisällä olevaa kolikkoa ei saa");
napit([]); ammu(240, 382); askel(10);
tarkista(T.kentta.jaalohkot[0].eiKiintea, "tulipallo sulattaa jäälohkon");
napit(["ArrowRight"]); askel(30);
tarkista(p.x > 320 && T.kentta.kolikot[0].keratty, "sulaneen lohkon läpi pääsee ja kolikon saa");
napit([]); p.x = 900; p.tuli = 0; askel(30);
tarkista(p.tuli < 5, "tulimittari täyttyy itsestään hitaasti");
p.x = 600; askel(30);
tarkista(p.tuli > 60, "nuotion vieressä tulimittari täyttyy nopeasti (" + p.tuli.toFixed(0) + ")");

// --- Jääpuikko ---
testikentta({ jaapuikot: [{ x: 500, y: 200 }, { x: 700, y: 200, uusiutuu: true }, { x: 900, y: 200 }] });
askel(60);
tarkista(T.kentta.jaapuikot[0].tila === "roikkuu", "jääpuikko roikkuu, kun ukko on kaukana");
p.x = 495; askel(10);
tarkista(T.kentta.jaapuikot[0].tila === "tarisee", "jääpuikko tärisee, kun ukko tulee alle");
askel(60);
tarkista(p.elamat === 2, "putoava jääpuikko vie elämän");
p.x = 620; p.y = 370; p.suojaAika = 0; askel(10); p.x = 100; askel(90);
tarkista(T.kentta.jaapuikot.some((j) => j.tila === "kasvaa") && p.elamat === 2, "väistetty puikko hajoaa lattiaan, ja uusiutuva kasvaa takaisin");
const pisteet0 = T.ev("pisteet");
ammu(860, 205); askel(8);
tarkista(!T.kentta.jaapuikot.some((j) => j.x === 900) && T.ev("pisteet") > pisteet0, "tulipallo sulattaa jääpuikon ja siitä saa pisteitä");

// --- Vesi ---
testikentta({ vedet: [{ x: 2000, y: 425, leveys: 600 }] });
p.x = 2100; p.y = 300; p.suojaAika = 100; askel(40);
tarkista(p.elamat === 2, "hyinen vesi vie elämän, vaikka ukko olisi suojassa");

// --- Tuuli ---
testikentta({ tuulet: [{ x: 300, leveys: 400, voima: 2.5, jakso: 0 }] });
p.x = 400; p.y = 200; p.vy = 0; askel(10);
tarkista(p.x > 420 && p.x <= 425, "myötätuuli työntää ilmassa olevaa ukkoa (x " + p.x.toFixed(1) + ")");
askel(60); x0 = p.x; askel(10);
tarkista(p.x > x0 && p.x - x0 < 10, "maassa tuuli työntää vain vähän");
testikentta({ tuulet: [{ x: 300, leveys: 400, voima: 2.5, jakso: 240 }] });
const tilat = new Set();
for (let i = 0; i < 240; i++) { askel(1); tilat.add(T.kentta.tuulet[0].tila); }
tarkista(["pois", "varoitus", "paalla"].every((t) => tilat.has(t)), "puuska: ensin tyyntä, sitten varoitus, sitten tuulee");
T.ev("kentta.tasot.push({ x: 500, y: 100, leveys: 40, korkeus: 310 }); kentta.kaikkiTasot = kentta.tasot.slice(); kentta.tuulet[0].jakso = 0; kentta.tuulet[0].tila = 'paalla'");
p.x = 420; p.y = 250; p.vy = 0; askel(40);
tarkista(p.x <= 480, "tuuli ei työnnä ukkoa seinän läpi (x " + p.x.toFixed(0) + ")");

// --- Pingviini ---
testikentta({ viholliset: [{ tyyppi: "pingviini", x: 500, lattia: 410, vasen: 300, oikea: 700 }] });
let v = T.kentta.viholliset[0];
p.x = 320; let liukui = false, huusi = false;
for (let i = 0; i < 200 && p.elamat === 3; i++) { askel(1); p.x = 320; p.suojaAika = 999; if (v.tila === "valmistautuu") huusi = true; if (v.tila === "liukuu") liukui = true; }
tarkista(huusi && liukui, "pingviini huomaa ukon, varoittaa ja liukuu sitä kohti");
tarkista(v.x >= v.vasen && v.x <= v.oikea, "pingviini pysyy omalla alueellaan");
p.tuli = 0; hyppaaPaalle(v);
tarkista(!v.elossa && p.elamat === 3 && p.vy < 0 && p.tuli > 0, "pingviinin päälle voi hypätä (ja siitä saa tulta)");
testikentta({ viholliset: [{ tyyppi: "pingviini", x: 300, lattia: 410, vasen: 200, oikea: 700 }] });
p.x = 300; askel(5);
tarkista(p.elamat === 2, "pingviiniin törmääminen vie elämän");

// --- Lumiukkeli ---
testikentta({ viholliset: [{ tyyppi: "lumiukkeli", x: 500, lattia: 410 }] });
v = T.kentta.viholliset[0];
p.x = 250; let palloja = 0;
for (let i = 0; i < 200 && p.elamat === 3; i++) { askel(1); palloja = Math.max(palloja, T.kentta.lumipallot.length); }
tarkista(palloja > 0, "lumiukkeli heittää lumipalloja");
tarkista(p.elamat === 2, "lumipallo osuu paikallaan seisovaan ukkoon");
p.suojaAika = 0; p.x = 100; ammu(460, 384); askel(10);
tarkista(!v.elossa && v.palanut, "tulipallo sulattaa lumiukkelin");

// --- Jäähauki ---
testikentta({ vedet: [{ x: 2000, y: 425, leveys: 600 }], viholliset: [{ tyyppi: "jaahauki", x: 2200, lattia: 425, hyppy: 180, jakso: 60 }] });
v = T.kentta.viholliset[0];
let ylin = 999, nakyvissa = 0;
for (let i = 0; i < 200; i++) { askel(1); if (!v.piilossa) { nakyvissa++; ylin = Math.min(ylin, v.y); } }
tarkista(nakyvissa > 0 && ylin < 425 - 150, "jäähauki hyppää vedestä korkealle (" + (425 - ylin).toFixed(0) + " px)");
for (let i = 0; i < 300 && (v.piilossa || v.vy > -2 || v.y > 380); i++) askel(1);
hyppaaPaalle(v);
tarkista(!v.elossa && p.elamat === 3, "hauen päältä voi pompata");

// --- Tunturipöllö ---
testikentta({ viholliset: [{ tyyppi: "pollo", x: 500, y: 180, vasen: 300, oikea: 700 }] });
v = T.kentta.viholliset[0];
p.x = 520; let alin = 0, osui = false;
for (let i = 0; i < 300; i++) { askel(1); alin = Math.max(alin, v.y); if (p.elamat < 3) osui = true; }
tarkista(alin > 300, "pöllö syöksyy alas ukon korkeudelle (y " + alin.toFixed(0) + ")");
tarkista(osui, "syöksyvä pöllö osuu paikallaan seisovaan ukkoon");
tarkista(v.elossa && v.y < 260, "syöksyn jälkeen pöllö palaa ylös");

// --- Pakkasukko ---
T.ev("aloitaKentta(16)");
p.elamat = 3;
const pomo = T.kentta.pomo;
tarkista(pomo.elamat === pomo.maxElamat && pomo.koko === 3, "Pakkasukolla on aluksi kolme palloa ja täysi elämäpalkki");
p.x = 1700; p.y = 370; askel(5);
tarkista(pomo.herannyt && T.ev("porttiKiinni()"), "Pakkasukko herää ja portti sulkeutuu");
const pidaPaikallaan = () => { p.x = 1700; p.y = 370; p.vy = 0; p.suojaAika = 999; };
const ammuPomoa = () => { T.ev(`tulipallot.push({ x: ${pomo.x - 40}, y: ${pomo.y + pomo.korkeus - 30}, leveys: 16, korkeus: 16, suunta: 1, matka: 0, elossa: true, omistaja: pelaaja1 })`); for (let i = 0; i < 12; i++) { pidaPaikallaan(); askel(1); } };
hyppaaPaalle(pomo);
tarkista(pomo.koko === 3 && p.elamat === 3 && p.vy < 0, "panssaroidun Pakkasukon päältä vain kimpoaa");
const e0 = pomo.elamat;
ammuPomoa();
tarkista(pomo.panssari === 2 && pomo.elamat === e0 - 1, "tulipallo sulattaa panssaria");
ammuPomoa(); ammuPomoa();
tarkista(pomo.tila === "sulanut", "kolmen tulipallon jälkeen Pakkasukko on sulanut");
hyppaaPaalle(pomo);
tarkista(pomo.koko === 2 && pomo.panssari === 3, "päälle hyppy vie yhden pallon ja panssari palaa");
tarkista(pomo.y + pomo.korkeus === pomo.lattia, "pienentynyt Pakkasukko seisoo lattialla");
for (let i = 0; i < 80; i++) { pidaPaikallaan(); askel(1); }
ammuPomoa(); ammuPomoa(); ammuPomoa();
tarkista(pomo.tila === "sulanut", "toinen panssari sulaa");
for (let i = 0; i < 400; i++) { pidaPaikallaan(); p.x = 1500; askel(1); }
tarkista(pomo.tila !== "sulanut" && pomo.panssari === 3, "jos ei ehdi hypätä, panssari jäätyy kokonaan takaisin");
for (let kierros = 0; kierros < 2; kierros++) {
  for (let i = 0; i < 80; i++) { pidaPaikallaan(); askel(1); }
  for (let i = 0; i < 40 && pomo.tila !== "sulanut"; i++) ammuPomoa(); // pomppivaan päähän ei osu joka kerta
  for (let i = 0; i < 60 && pomo.y + pomo.korkeus < pomo.lattia; i++) { pidaPaikallaan(); askel(1); } // pää laskeutuu
  hyppaaPaalle(pomo);
}
tarkista(!pomo.elossa && pomo.elamat === 0, "kolmannen hypyn jälkeen Pakkasukko on voitettu");
tarkista(T.ev("maaliAuki()") && !T.ev("porttiKiinni()"), "maali ja portti aukeavat");
tarkista(!T.kentta.viholliset.some((x) => x.kutsuttu) && !T.kentta.tasot.some((t) => t.jaa), "apurit katoavat ja lattia sulaa");

// Pakkasukon hyökkäykset eivät kaada peliä (pitkä taistelu, 1P ja 2P)
let virhe = null;
try {
  for (const kaksi of [false, true]) {
    T.kaksinpeli(kaksi);
    T.ev("aloitaKentta(16)");
    const hyokkaykset = new Set();
    for (let i = 0; i < 6000; i++) {
      for (const pl of [T.pelaaja1, T.pelaaja2]) { pl.x = 1700 + (i % 500); pl.y = 250; pl.vy = 0; pl.suojaAika = 999; }
      if (i === 2500) T.kentta.pomo.koko = 2;
      if (i === 4000) { T.kentta.pomo.koko = 1; T.ev("asetaUkonKoko(kentta.pomo)"); }
      askel(1);
      hyokkaykset.add(T.kentta.pomo.tila);
      if (i % 50 === 0) T.piirra(i * 16);
    }
    if (!kaksi) tarkista(["heittaa", "vierittaa", "hengittaa", "puhaltaa", "kutsuu", "loikkaa"].every((h) => hyokkaykset.has(h)), "Pakkasukko käyttää kaikkia hyökkäyksiään: " + [...hyokkaykset].join(", "));
  }
} catch (e) { virhe = e; }
T.kaksinpeli(false);
tarkista(!virhe, "pitkä pomotaistelu pyörii ja piirtyy (1P ja 2P) " + (virhe ? virhe.stack : ""));

// --- Kentät ---
const uusia = new Set();
for (let n = 11; n <= 16; n++) { T.ev(`aloitaKentta(${n})`); T.kentta.viholliset.forEach((x) => uusia.add(x.tyyppi)); }
tarkista(["pingviini", "lumiukkeli", "jaahauki", "pollo"].every((t) => uusia.has(t)), "kaikki neljä uutta vihua ovat kentissä");
tarkista(T.ev("MAAILMAT.length") >= 3 && T.ev("MAAILMAT[2].nimi") === "Pakkassaari" && T.ev("MAAILMAT[2].loppu") === 16, "Pakkassaari on kolmas maailma (kentät 12-17)");
tarkista(T.ev("KAPPALEET.length") === T.KENTAT.length, "jokaisella kentällä on oma kappale");
tarkista(T.ev("KARTTA.length") >= T.KENTAT.length, "jokaisella kentällä on paikka kartalla");
// Jäälohkon sisällä olevat kolikot ja sydämet ovat oikeasti lohkon sisällä
let ulkona = 0, lohkoja = 0;
for (let n = 11; n <= 16; n++) {
  T.ev(`aloitaKentta(${n})`);
  for (const l of T.kentta.jaalohkot) {
    if (l.korkeus > 40) continue; // jääseinä
    lohkoja++;
    const sisalla = (a) => a.x >= l.x && a.x + a.leveys <= l.x + l.leveys && a.y >= l.y && a.y + a.korkeus <= l.y + l.korkeus;
    if (!T.kentta.kolikot.some(sisalla) && !T.kentta.sydamet.some(sisalla)) ulkona++;
  }
}
tarkista(lohkoja > 5 && ulkona === 0, "jokaisen pienen jäälohkon sisällä on kolikko tai sydän (" + lohkoja + " lohkoa)");

// --- Vanha tallennus (11 kenttää läpäisty) avaa uuden maailman ---
{
  const data = { ukonSeikkailuTallennus: JSON.stringify({ avattu: 10, kartanKohta: 10, parhaatPisteet: Array(11).fill(500), parhaatKolikot: Array(11).fill(5), elamat: [3, 3] }) };
  const muisti = { getItem: (k) => (k in data ? data[k] : null), setItem: (k, x) => (data[k] = String(x)), removeItem: (k) => delete data[k] };
  T = lataa(muisti);
  T.ev("jatkaPelia()");
  tarkista(T.ev("avattu") === 11 && T.ev("uusiKentta") === 11, "vanha tallennus, jossa peli on läpäisty: kenttä 12 aukeaa");
  tarkista(T.ev("kartanKohta") === 10 && T.ev("karttaViesti").includes("UUSI MAAILMA"), "kartta kertoo uudesta maailmasta");
  T.paina("ArrowRight");
  tarkista(T.ev("kartanKohta") === 11 && T.ev("nykyinenMaailma().nimi") === "Pakkassaari", "nuoli oikealle vie Pakkassaarelle");
  T.ev("piirra(1000)");
  data.ukonSeikkailuTallennus = JSON.stringify({ avattu: 10, kartanKohta: 10, parhaatPisteet: Array(10).fill(500), parhaatKolikot: [], elamat: [3, 3] });
  T = lataa(muisti);
  T.ev("jatkaPelia()");
  tarkista(T.ev("avattu") === 10, "jos Magmamörkö on vielä voittamatta, uusi maailma pysyy lukossa");
}

console.log("\n" + ok + " ok, " + vika + " vikaa");
