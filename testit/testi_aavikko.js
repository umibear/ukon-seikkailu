// Testaa Aavikkosaaren (maailma 4) uudet asiat: juoksuhiekka, paahde ja varjo,
// kangastukset, uudet vihut, Hiekkamato ja kuusi uutta kenttää.
// Käyttö: node testit/testi_aavikko.js
const lataa = require("./peli_node.js");
let T = lataa();
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
let p = T.pelaaja1;
const askel = (n) => { for (let i = 0; i < n; i++) T.paivita(1); };
const napit = (lista) => { for (const k in T.napit) delete T.napit[k]; for (const k of lista) T.napit[k] = true; };
const viimeTeksti = () => T.ev("tekstit.map((t) => t.teksti).join('|')");

// Testikenttä: pitkä hiekkalattia eikä mitään muuta (lisaa = mitä kenttään lisätään)
function testikentta(lisaa) {
  T.ev("aloitaKentta(17)");
  T.ev(`Object.assign(kentta, { leveys: 3000, paahde: 0, paahdeVihje: true, salakuoppa: null, aarre: null, viholliset: [], kolikot: [], sydamet: [], lumipallot: [],
        juoksuhiekat: [], palmut: [], varjopilvet: [], kangastukset: [], soihdut: [],
        tasot: [{ x: 0, y: 410, leveys: 3000, korkeus: 40 }], liikkuvatTasot: [], putoavatTasot: [] }, ${JSON.stringify(lisaa || {})});
        valmisteleAavikko(kentta); for (const v of kentta.viholliset) { v.elossa = true; v.kuolinAika = 0; v.vy = 0; valmisteleAavikkovihu(v); }
        kentta.kaikkiTasot = kentta.tasot.concat(kentta.liikkuvatTasot, kentta.putoavatTasot); tulipallot = []; tekstit = [];`);
  napit([]);
  Object.assign(p, { elamat: 3, suojaAika: 0, x: 100, y: 370, vy: 0, vx: 0, potkuAika: 0, odotaNostoa: false, tuli: 100, maassa: true, paahde: 0, poyrryksissa: false, hiekka: null, hiekkaHypyt: 0 });
  askel(2);
}
// Lattia, jossa on juoksuhiekkaa välillä 500..500+leveys
const hiekkakentta = (leveys) => testikentta({ tasot: [{ x: 0, y: 410, leveys: 500, korkeus: 40 }, { x: 500 + leveys, y: 410, leveys: 2000, korkeus: 40 }], juoksuhiekat: [{ x: 500, leveys }] });
const ammu = (x, y) => T.ev(`tulipallot.push({ x: ${x}, y: ${y}, leveys: 16, korkeus: 16, suunta: 1, matka: 0, elossa: true, omistaja: pelaaja1 })`);
function hyppaaPaalle(v) {
  p.suojaAika = 0; p.x = v.x + v.leveys / 2 - 10; p.y = v.y - 44; p.edellinenY = p.y - 4; p.vy = 5; p.alusta = null;
  askel(3);
}

// --- Kuvat ---
{
  let viat = [];
  for (const taulu of ["AAVIKKOPIKSELIT", "AAVIKKOVIHUPIKSELIT"]) {
    const kuvat = T.ev(taulu), varit = T.ev("AAVIKKOVARIT");
    for (const nimi in kuvat) {
      const leveys = kuvat[nimi][0][0].length, korkeus = kuvat[nimi][0].length;
      for (const ruutu of kuvat[nimi]) {
        if (ruutu.length !== korkeus) viat.push(nimi + ": eri korkuiset ruudut");
        for (const rivi of ruutu) {
          if (rivi.length !== leveys) viat.push(nimi + ": rivi '" + rivi + "' on eri levyinen");
          for (const kirjain of rivi) if (kirjain !== "." && kirjain !== " " && !varit[kirjain]) viat.push(nimi + ": tuntematon väri " + kirjain);
        }
      }
    }
  }
  tarkista(viat.length === 0, "pikselikuvien rivit ovat yhtä pitkiä ja värit löytyvät " + [...new Set(viat)].slice(0, 5).join("; "));
}

// --- Juoksuhiekka ---
hiekkakentta(140);
p.x = 560; p.y = 372; askel(20);
tarkista(p.hiekka && p.y > 372 && p.y < 390, "juoksuhiekkaan upotaan hitaasti (y " + p.y.toFixed(0) + ")");
let x0 = p.x; napit(["ArrowRight"]); askel(5);
tarkista(Math.abs(p.x - x0 - 10) < 0.01, "juoksuhiekassa ukko liikkuu puolet hitaammin");
napit([]);
let hetkia = 0;
while (p.elamat === 3 && hetkia < 400) { askel(1); hetkia++; }
tarkista(p.elamat === 2 && hetkia > 50 && viimeTeksti().includes("HIEKKA NIELAISI"), "paikallaan seisova ukko uppoaa ja menettää elämän (aikaa oli " + ((hetkia + 25) / 60).toFixed(1) + " s)");

hiekkakentta(140);
p.x = 470; napit(["ArrowRight", "ArrowUp"]);
for (let i = 0; i < 200 && p.x < 700; i++) askel(1);
tarkista(p.elamat === 3 && p.x >= 700, "pienen juoksuhiekan yli pääsee, kun pitää hypyn pohjassa");
hiekkakentta(140);
p.x = 470; napit(["ArrowRight"]);
for (let i = 0; i < 75; i++) askel(1);
tarkista(p.elamat === 3 && T.kentta.hiekkaVihje, "kävelemällä ehtii hiekan toiseen reunaan, ja peli neuvoo hyppimään");
napit(["ArrowRight", "ArrowUp"]);
for (let i = 0; i < 100 && p.x < 700; i++) askel(1);
tarkista(p.elamat === 3 && p.x >= 700, "reunalta pääsee vielä hyppäämällä ylös");

// Hypyt heikkenevät: leveästä hiekasta ei pääse yli ilman kiviä
hiekkakentta(800);
p.x = 470; napit(["ArrowRight", "ArrowUp"]);
for (let i = 0; i < 900 && p.x < 1300 && p.elamat === 3; i++) askel(1);
tarkista(p.elamat === 2, "leveässä juoksuhiekassa voimat loppuvat kesken");
hiekkakentta(800);
p.x = 560; p.y = 380; askel(2); napit(["ArrowUp"]); askel(1);
const eka = -p.vy;
tarkista(eka > 8 && eka < 16, "hyppy hiekasta on tavallista hyppyä heikompi (" + eka.toFixed(1) + ")");
p.x = 300; p.y = 370; p.vy = 0; napit([]); askel(5);
tarkista(p.hiekkaHypyt === 0, "kiinteällä maalla hyppyvoimat palaavat");

// Vaikealla hiekka on pahempi
T.ev("vaikea = true");
hiekkakentta(800);
p.x = 560; p.y = 372; napit([]); askel(10);
tarkista(p.y > 378, "vaikealla hiekka upottaa nopeammin");
napit(["ArrowUp"]); askel(1);
tarkista(p.vy < -8, "vaikealla tuore painallus hyppää");
for (let i = 0; i < 60; i++) askel(1);
tarkista(p.hiekkaHypyt === 1, "vaikealla nappia ei voi pitää pohjassa: pitää näpytellä");
T.ev("vaikea = false");

// --- Paahde ja varjo ---
testikentta({ paahde: 1, palmut: [{ x: 600, lattia: 410 }], varjopilvet: [{ x: 1000, matka: 0 }], tasot: [{ x: 0, y: 410, leveys: 3000, korkeus: 40 }, { x: 1400, y: 300, leveys: 120, korkeus: 20 }] });
p.x = 200; askel(100);
tarkista(p.paahde > 20 && p.paahde < 30, "auringossa paahdemittari nousee (" + p.paahde.toFixed(0) + ")");
p.x = 590; askel(10);
tarkista(p.paahde < 20, "palmun alla mittari laskee");
p.x = 200; p.paahde = 50; askel(2);
p.x = 1080; const ennen = p.paahde; askel(10);
tarkista(p.paahde < ennen, "pilven varjossa mittari laskee");
p.x = 200; p.paahde = 50; askel(2);
p.x = 1450; askel(10);
tarkista(p.paahde < 50, "tason alla on varjoa");
p.x = 1450; p.y = 250; p.vy = 0; p.paahde = 50; askel(10);
tarkista(p.paahde > 50, "tason päällä aurinko paahtaa");
p.x = 200; p.y = 370; p.paahde = 99; askel(10);
tarkista(p.poyrryksissa && p.elamat === 3, "normaalilla liika paahde vain pyörryttää: elämää ei mene");
x0 = p.x; napit(["ArrowRight"]); askel(10); napit([]);
tarkista(Math.abs(p.x - x0 - 22) < 0.01, "pyörryksissä ukko on hidas");
p.x = 590; askel(30);
tarkista(p.poyrryksissa, "pyörrytys ei lopu heti varjossa");
askel(40);
tarkista(!p.poyrryksissa && p.paahde < 50, "varjossa levännyt ukko toipuu");
// Täysi mittari kestää normaalilla noin 7 sekuntia
p.x = 200; p.paahde = 0; hetkia = 0;
while (p.paahde < 100 && hetkia < 2000) { askel(1); hetkia++; }
tarkista(hetkia > 360 && hetkia < 500, "mittari täyttyy noin 7 sekunnissa (" + (hetkia / 60).toFixed(1) + " s)");

testikentta({ paahde: 0 });
p.x = 200; askel(100);
tarkista(p.paahde === 0, "kentässä, jossa ei ole paahdetta, mittari ei nouse");

T.ev("vaikea = true");
testikentta({ paahde: 1 });
p.x = 200; p.paahde = 99; askel(10);
tarkista(p.elamat === 2 && viimeTeksti().includes("AURINKO POLTTI"), "vaikealla aurinko polttaa ja vie elämän");
T.ev("vaikea = false");

// Liikkuva pilvi
testikentta({ paahde: 1, varjopilvet: [{ x: 1000, matka: 200, nopeus: 0.02 }] });
const pilvi = T.kentta.varjopilvet[0];
let pienin = 9999, suurin = 0;
for (let i = 0; i < 400; i++) { askel(1); const x = T.ev("pilvenX(kentta.varjopilvet[0])"); pienin = Math.min(pienin, x); suurin = Math.max(suurin, x); }
tarkista(pienin < 820 && suurin > 1180 && pilvi.leveys > 100, "pilven varjo liikkuu edestakaisin");

// --- Kangastus ---
testikentta({ kangastukset: [{ x: 600, y: 330, leveys: 100 }] });
const m = T.kentta.kangastukset[0];
p.x = 200; askel(5);
tarkista(m.nakyvyys === 1, "kaukaa kangastus näyttää oikealta tasolta");
p.x = 520; askel(30);
tarkista(m.nakyvyys === 0 && viimeTeksti().includes("KANGASTUS"), "lähellä kangastus haihtuu");
p.x = 640; p.y = 250; p.vy = 0; askel(40);
tarkista(p.y === 370, "kangastuksen päällä ei voi seistä");
p.x = 1500; askel(80);
tarkista(m.nakyvyys === 1, "kun ukko menee kauas, kangastus palaa");
T.piirra(1000);

// --- Kaktus ---
testikentta({ viholliset: [{ tyyppi: "kaktus", x: 600, lattia: 410 }] });
let v = T.kentta.viholliset[0];
hyppaaPaalle(v);
tarkista(p.elamat === 2 && v.elossa, "kaktuksen päälle ei voi hypätä: piikit pistävät");
testikentta({ viholliset: [{ tyyppi: "kaktus", x: 600, lattia: 410 }] });
v = T.kentta.viholliset[0];
ammu(540, 380); askel(15);
tarkista(!v.elossa, "tulipallo polttaa kaktuksen");
testikentta({ viholliset: [{ tyyppi: "kaktus", x: 600, lattia: 410 }] });
p.x = 450; askel(300);
tarkista(T.kentta.lumipallot.length === 0, "normaalilla kaktus ei ammu");
T.ev("vaikea = true");
testikentta({ viholliset: [{ tyyppi: "kaktus", x: 600, lattia: 410 }] });
p.x = 450; let piikkeja = 0;
for (let i = 0; i < 100; i++) { askel(1); piikkeja = Math.max(piikkeja, T.kentta.lumipallot.length); p.suojaAika = 50; }
tarkista(piikkeja === 2, "vaikealla kaktus ampuu kaksi piikkiä");
T.ev("vaikea = false");

// --- Skorpioni ---
testikentta({ viholliset: [{ tyyppi: "skorpioni", x: 600, lattia: 410, vasen: 400, oikea: 900 }] });
v = T.kentta.viholliset[0];
p.x = 100; askel(60);
tarkista(v.tila === "piilossa" && v.piilossa, "skorpioni piileskelee hiekassa, kun ukko on kaukana");
ammu(540, 395); askel(15);
tarkista(v.elossa, "tulipallo ei osu hiekan alla olevaan skorpioniin");
p.x = 500; askel(5);
tarkista(v.tila === "nousee" && v.piilossa, "kun ukko tulee lähelle, hiekka pöllyää ensin varoitukseksi");
p.x = 605; askel(5);
tarkista(p.elamat === 3, "piilossa oleva skorpioni ei satuta");
p.x = 480; askel(40);
tarkista(v.tila === "jahtaa" && !v.piilossa, "sitten skorpioni nousee ja jahtaa");
x0 = v.x; askel(10);
tarkista(v.x < x0, "skorpioni juoksee ukkoa kohti");
p.x = 100; askel(200);
tarkista(v.tila === "piilossa" || v.tila === "kaivautuu", "jahdin jälkeen skorpioni kaivautuu takaisin");
tarkista(v.x >= 400, "skorpioni pysyy omalla alueellaan");
// Päälle hyppy
testikentta({ viholliset: [{ tyyppi: "skorpioni", x: 600, lattia: 410, vasen: 400, oikea: 900 }] });
v = T.kentta.viholliset[0];
Object.assign(v, { tila: "jahtaa", piilossa: false, ajastin: 100 });
hyppaaPaalle(v);
tarkista(!v.elossa && p.elamat === 3 && p.vy < 0, "skorpionin voi litistää hyppäämällä päälle");
testikentta({ viholliset: [{ tyyppi: "skorpioni", x: 600, lattia: 410, vasen: 400, oikea: 900 }] });
v = T.kentta.viholliset[0];
Object.assign(v, { tila: "jahtaa", piilossa: false, ajastin: 100 });
p.x = 590; askel(3);
tarkista(p.elamat === 2, "sivusta skorpioni pistää");

// --- Pyörre ---
testikentta({ viholliset: [{ tyyppi: "pyorre", x: 600, lattia: 410, vasen: 500, oikea: 800 }] });
v = T.kentta.viholliset[0];
ammu(540, 380); askel(20);
tarkista(v.elossa, "tulipallo lentää pyörteen läpi");
p.x = v.x + 8; askel(2);
tarkista(p.elamat === 3 && p.vy < -14, "pyörre ei satuta vaan heittää ukon ilmaan");
let korkein = 370;
for (let i = 0; i < 60; i++) { askel(1); korkein = Math.min(korkein, p.y); }
tarkista(korkein < 370 - 140, "pyörteen heitto on tavallista hyppyä korkeampi (" + (370 - korkein).toFixed(0) + " px)");
x0 = v.x; askel(30);
tarkista(v.x !== x0 && v.x >= 500 && v.x <= 800, "pyörre kulkee edestakaisin");

// --- Muumio ---
testikentta({ viholliset: [{ tyyppi: "muumio", x: 600, lattia: 410, vasen: 300, oikea: 900 }] });
v = T.kentta.viholliset[0];
p.x = 450; x0 = v.x; askel(20);
tarkista(v.x < x0 && v.suunta === -1, "muumio kävelee ukkoa kohti");
hyppaaPaalle(v);
tarkista(v.elossa && v.tila === "kasassa" && p.elamat === 3, "hyppy hajottaa muumion kasaksi mutta ei tuhoa sitä");
p.x = v.x; p.y = 370; p.vy = 0; askel(5);
tarkista(p.elamat === 3, "kasassa oleva muumio ei satuta");
p.x = 100; askel(200);
tarkista(v.tila === "kavelee", "muumio nousee taas");
ammu(v.x - 60, 380); askel(15);
tarkista(!v.elossa, "tulipallo tuhoaa muumion");
testikentta({ viholliset: [{ tyyppi: "muumio", x: 600, lattia: 410, vasen: 300, oikea: 900 }] });
v = T.kentta.viholliset[0];
p.x = v.x - 10; askel(3);
tarkista(p.elamat === 2, "kävelevä muumio satuttaa sivusta");

// --- Hiekkamato ---
T = lataa(); p = T.pelaaja1;
T.ev("aloitaKentta(22)");
const pomo = T.kentta.pomo;
const pida = (x, y) => { p.x = x; p.y = y === undefined ? 370 : y; p.vy = 0; p.vx = 0; p.suojaAika = 0; };
const odota = (tila, enintaan) => { for (let i = 0; i < (enintaan || 600) && pomo.tila !== tila; i++) { pida(pomo.x > 1900 ? 1500 : 2400); p.suojaAika = 99; askel(1); } return pomo.tila === tila; };
tarkista(pomo.nimi === "HIEKKAMATO" && pomo.elamat === 6 && !pomo.herannyt, "Hiekkamato nukkuu aluksi ja sillä on 6 elämää");
T.piirra(1000);
pida(1600); askel(3);
tarkista(pomo.herannyt && T.ev("porttiKiinni()"), "Hiekkamato herää ja portti sulkeutuu");
tarkista(pomo.korkeus === 0 && pomo.tila === "kaivaa", "aluksi mato on maan alla");
pida(1600); p.suojaAika = 99; x0 = pomo.x; for (let i = 0; i < 30; i++) { pida(1600); p.suojaAika = 99; askel(1); }
tarkista(pomo.x < x0, "kumpu seuraa ukkoa");
pida(pomo.x + 20); askel(2);
tarkista(p.elamat === 3, "maan alla oleva mato ei satuta");
tarkista(odota("varoittaa"), "ennen syöksyä kumpu pysähtyy ja varoittaa");
x0 = pomo.x; for (let i = 0; i < 10; i++) { pida(1500); p.suojaAika = 99; askel(1); }
tarkista(pomo.x === x0, "varoittava kumpu ei liiku: nyt ehtii juosta pois");
T.piirra(1200);
tarkista(odota("nousee"), "sitten mato syöksyy ylös");
pida(pomo.x + 20); askel(3);
tarkista(p.elamat === 2, "nouseva mato satuttaa");
pomo.elamat = 6; p.elamat = 3; // (yksinpelissä elämän menetys nollaa madon)
T.ev("kentta.pomo.herannyt = true; kentta.pomo.tila = 'nousee'");
tarkista(odota("ylhaalla"), "mato jää hetkeksi ylös");
tarkista(pomo.korkeus === 190 && pomo.y === 220, "ylhäällä mato on 190 pikseliä korkea");
T.piirra(1400);
// Tulipallo vartaloon ei tehoa
ammu(pomo.x - 60, 380); for (let i = 0; i < 12; i++) { pida(1500); p.suojaAika = 99; askel(1); }
tarkista(pomo.elamat === 6 && viimeTeksti().includes("TÄHTÄÄ PÄÄHÄN"), "tulipallo vartaloon ei tehoa: peli neuvoo tähtäämään päähän");
// Tulipallo päähän tehoaa
pomo.tila = "ylhaalla"; pomo.nousu = 1; pomo.ajastin = 60; pomo.kipu = 0;
ammu(pomo.x - 60, 240); for (let i = 0; i < 12; i++) { pida(1500); p.suojaAika = 99; askel(1); }
tarkista(pomo.elamat === 5 && pomo.tila === "vetaytyy", "tulipallo päähän vie elämän ja mato vetäytyy");
// Hyppy pään päälle
tarkista(odota("ylhaalla", 900), "mato nousee uudestaan");
pomo.kipu = 0; pomo.ajastin = 60;
p.suojaAika = 0; p.x = pomo.x + 20; p.y = pomo.y - 44; p.edellinenY = p.y - 4; p.vy = 5; p.alusta = null; askel(3);
tarkista(pomo.elamat === 4 && p.elamat === 3 && p.vy < 0, "hyppy pään päälle vie elämän ja ukko pomppaa");
// Vaihe 2: mato sylkee hiekkaa
tarkista(T.ev("madonVaihe(kentta.pomo)") === 2, "kun elämiä on 4/6, alkaa vaihe 2");
tarkista(odota("ylhaalla", 900), "mato nousee taas");
let palloja = 0;
for (let i = 0; i < 60; i++) { pida(1500); p.suojaAika = 99; askel(1); palloja = Math.max(palloja, T.kentta.lumipallot.length); }
tarkista(palloja === 2, "vaiheessa 2 mato sylkee kaksi hiekkapalloa");
// Vaihe 3: loikka
pomo.elamat = 2; pomo.kipu = 0;
let loikkia = 0, sylkia = 0, virhe = null;
try {
  for (let i = 0; i < 3000; i++) {
    pida(pomo.x > 1900 ? 1500 : 2400); p.suojaAika = 99; askel(1);
    if (pomo.tila === "loikka" && pomo.loikka && pomo.loikka.aika < 1.5) loikkia++;
    sylkia = Math.max(sylkia, T.kentta.lumipallot.length);
    if (i % 7 === 0) T.piirra(i * 16);
  }
} catch (e) { virhe = e; }
tarkista(!virhe && loikkia >= 3 && sylkia === 3, "vaiheessa 3 mato loikkaa ja sylkee kolme palloa (" + loikkia + " loikkaa) " + (virhe ? virhe.stack : ""));
tarkista(pomo.x >= pomo.vasen && pomo.x <= pomo.oikea, "mato pysyy areenalla");
// Loikkaava mato satuttaa
odota("kaivaa", 900);
pomo.tila = "loikka"; pomo.loikka = { alku: 1700, loppu: 2120, aika: 30 }; pomo.nousu = 0;
const pala = T.ev("loikanPala(kentta.pomo, 0)");
p.elamat = 3; pida(pala.x - 10, pala.y - 20); askel(1);
tarkista(p.elamat === 2, "loikkaava mato satuttaa");
// Elämän menetys nollaa madon mutta osumat pysyvät
tarkista(!pomo.herannyt && pomo.elamat === 2 && pomo.x === pomo.alkuX && !T.ev("porttiKiinni()"), "kun elämä menee, mato palaa nukkumaan, portti aukeaa ja osumat pysyvät");
// Voitto
pida(1600); askel(3);
for (let k = 0; k < 2; k++) {
  odota("ylhaalla", 1500);
  pomo.kipu = 0; pomo.ajastin = 60;
  p.suojaAika = 0; p.x = pomo.x + 20; p.y = pomo.y - 44; p.edellinenY = p.y - 4; p.vy = 5; p.alusta = null; askel(3);
}
tarkista(!pomo.elossa && pomo.elamat === 0 && T.kentta.lumipallot.length === 0, "kuuden osuman jälkeen Hiekkamato on voitettu");
for (let i = 0; i < 150; i++) { pida(1700); askel(1); if (i % 10 === 0) T.piirra(i * 16); }
tarkista(!T.ev("porttiKiinni()"), "voiton jälkeen portti aukeaa");
pida(2380); for (let i = 0; i < 30 && T.tila === "peli"; i++) askel(1);
tarkista(T.tila === "kenttaValmis", "ja maaliin pääsee");

// Vaikealla madolla on 8 elämää
T = lataa(); p = T.pelaaja1;
T.ev("vaikea = true; aloitaKentta(22)");
tarkista(T.kentta.pomo.elamat === 8, "vaikealla Hiekkamadolla on 8 elämää");

// Kaksinpeli: pitkä taistelu pyörii ja piirtyy
virhe = null;
try {
  T = lataa(); T.kaksinpeli(true); T.ev("aloitaKentta(22)");
  for (let i = 0; i < 4000; i++) {
    for (const pl of [T.pelaaja1, T.pelaaja2]) { pl.suojaAika = 99; if (pl.x < 1500) { pl.x = 1700 + (pl === T.pelaaja2 ? 400 : 0); pl.y = 370; } }
    if (i === 1500) T.kentta.pomo.elamat = 4;
    if (i === 2500) T.kentta.pomo.elamat = 2;
    T.paivita(1);
    if (i % 5 === 0) T.piirra(i * 16);
  }
} catch (e) { virhe = e; }
tarkista(!virhe, "pitkä pomotaistelu pyörii ja piirtyy kaksinpelissä " + (virhe ? virhe.stack : ""));

// --- Kentät ---
T = lataa(); p = T.pelaaja1;
tarkista(T.KENTAT.length === 23 && T.ev("MAAILMAT.length") === 4 && T.ev("MAAILMAT[3].nimi") === "Aavikkosaari" && T.ev("MAAILMAT[3].loppu") === 22, "Aavikkosaari on neljäs maailma (kentät 18-23)");
tarkista(T.ev("KAPPALEET.length") === T.KENTAT.length && T.ev("KARTTA.length") >= T.KENTAT.length, "jokaisella kentällä on kappale ja paikka kartalla");
{
  const tyypit = new Set(), viat = [];
  for (let n = 17; n <= 22; n++) {
    T.ev(`aloitaKentta(${n})`);
    const k = T.kentta;
    k.viholliset.forEach((x) => tyypit.add(x.tyyppi));
    if (k.laatat !== "hiekka") viat.push(k.nimi + ": laatat eivät ole hiekkaa");
    // Juoksuhiekan alla ei saa olla lattiaa, ja salakuopan pitää olla juoksuhiekassa
    for (const h of k.juoksuhiekat) {
      const tukossa = k.tasot.some((t) => t.y === 410 && t.x < h.x + h.leveys - 1 && t.x + t.leveys > h.x + 1);
      if (tukossa) viat.push(k.nimi + ": juoksuhiekan " + h.x + " kohdalla on lattiaa");
      // Kivien välit: normaalilla hiekasta jaksaa hyppiä noin 200 px
      const kivet = k.tasot.concat(k.putoavatTasot).filter((t) => t.y > 340 && t.y < 410 && t.x >= h.x && t.x + t.leveys <= h.x + h.leveys).sort((a, b) => a.x - b.x);
      let reuna = h.x;
      for (const kivi of kivet.concat([{ x: h.x + h.leveys, leveys: 0 }])) {
        if (kivi.x - reuna > 190) viat.push(k.nimi + ": juoksuhiekassa " + h.x + " on " + (kivi.x - reuna) + " px väli");
        reuna = kivi.x + kivi.leveys;
      }
    }
    const s = k.salakuoppa;
    if (!k.juoksuhiekat.some((h) => s.x >= h.x && s.x + s.leveys <= h.x + h.leveys)) viat.push(k.nimi + ": salakuoppa ei ole juoksuhiekassa");
    if (k.tasot.some((t) => t.x > 0 && t.y < 460 && t.y + t.korkeus > 400 && t.x < s.x + s.leveys && t.x + t.leveys > s.x)) viat.push(k.nimi + ": salakuopan kohdalla on kivi");
    // Kolikot eivät saa olla kangastusten päällä (niitä ei voisi kerätä turvallisesti)
    for (const m of k.kangastukset) if (k.kolikot.some((c) => c.x > m.x - 10 && c.x < m.x + m.leveys && c.y < m.y && c.y > m.y - 60)) viat.push(k.nimi + ": kolikko kangastuksen päällä");
    // Paahdekentissä pitää olla varjoa säännöllisesti
    if (k.paahde && k.palmut.length + k.varjopilvet.length < 4) viat.push(k.nimi + ": liian vähän varjoa");
  }
  tarkista(viat.length === 0, "aavikon kentät ovat kunnossa " + viat.join("; "));
  tarkista(["kaktus", "skorpioni", "pyorre", "muumio"].every((t) => tyypit.has(t)), "kaikki neljä uutta vihua ovat kentissä");
}
// Aarrekammiossa ei paahda
T.ev("aloitaKentta(17)");
p.x = T.kentta.salakuoppa.x + 30; p.y = 380; p.vy = 0; p.paahde = 60;
for (let i = 0; i < 200 && !T.ev("kammiossa"); i++) askel(1);
const kammiossa = T.ev("kammiossa"); askel(120);
tarkista(kammiossa && p.paahde === 0 && p.elamat === 3, "juoksuhiekan salakuoppa vie hautakammioon, ja siellä on viileää");

// Kaikki kentät pyörivät ja piirtyvät: 1P, 2P ja vaikea
for (const [nimi, kaksin, vaikea] of [["yksinpeli", false, false], ["kaksinpeli", true, false], ["vaikea", false, true]]) {
  virhe = null;
  try {
    T = lataa(); T.kaksinpeli(kaksin); T.ev("vaikea = " + vaikea);
    for (let n = 17; n <= 22; n++) {
      T.ev(`aloitaKentta(${n})`);
      const leveys = T.kentta.leveys;
      for (let i = 0; i < 700; i++) {
        // Ukot kulkevat kentän läpi "liitäen", jotta kaikki tulee näkyviin
        for (const pl of kaksin ? [T.pelaaja1, T.pelaaja2] : [T.pelaaja1]) { pl.suojaAika = 99; if (i % 20 === 0) { pl.x = Math.min(leveys - 150, 40 + (i / 700) * leveys); pl.y = 300; pl.vy = 0; } }
        T.napit.ArrowRight = i % 40 < 30; T.napit.ArrowUp = i % 50 < 10;
        T.paivita(1);
        if (i % 6 === 0) T.piirra(i * 16);
        if (T.tila !== "peli") break;
      }
    }
    T.ev("tila = 'kartta'; kartanKohta = 22; avattu = 22"); T.piirra(1000); T.piirra(5000);
  } catch (e) { virhe = e; }
  tarkista(!virhe, "kentät 18-23 pyörivät ja piirtyvät: " + nimi + " " + (virhe ? virhe.stack : ""));
}

// --- Vanha tallennus (17 kenttää läpäisty) avaa uuden maailman ---
{
  const data = { ukonSeikkailuTallennus: JSON.stringify({ avattu: 16, kartanKohta: 16, parhaatPisteet: Array(17).fill(500), parhaatKolikot: Array(17).fill(5), elamat: [3, 3] }) };
  const muisti = { getItem: (k) => (k in data ? data[k] : null), setItem: (k, x) => (data[k] = String(x)), removeItem: (k) => delete data[k] };
  T = lataa(muisti);
  T.ev("jatkaPelia()");
  tarkista(T.ev("avattu") === 17 && T.ev("karttaViesti").includes("UUSI MAAILMA"), "vanha tallennus, jossa Pakkasukko on voitettu: kenttä 18 aukeaa");
  T.paina("ArrowRight");
  tarkista(T.ev("kartanKohta") === 17 && T.ev("nykyinenMaailma().nimi") === "Aavikkosaari", "nuoli oikealle vie Aavikkosaarelle");
  T.piirra(1000);
}

console.log(`\n${ok} ok, ${vika} vikaa`);
process.exit(vika ? 1 : 0);
