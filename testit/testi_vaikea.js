// Testaa vaikean tason: vaikeuden valinta, liaanit, ruutitynnyrit, laavatulva,
// pakkasen purema ja vihujen uudet temput
// Käyttö: node testit/testi_vaikea.js
const lataa = require("./peli_node.js");
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
const data = {};
const muisti = { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => (data[k] = String(v)), removeItem: (k) => delete data[k] };
let T = lataa(muisti);
let p = T.pelaaja1;
const askel = (n) => { for (let i = 0; i < n; i++) T.paivita(1); };
const napit = (lista) => { for (const k in T.napit) delete T.napit[k]; for (const k of lista) T.napit[k] = true; };
// Ukko seisomaan kohtaan x lattialle (lattia = tason yläreuna)
const seiso = (x, lattia) => { p.x = x; p.y = (lattia || 410) - 40; p.vx = 0; p.vy = 0; p.suojaAika = 0; p.liaani = -1; p.odotaNostoa = false; };
const tulipallo = (x, y, suunta) => T.ev(`tulipallot.push({ x: ${x}, y: ${y}, leveys: 16, korkeus: 16, suunta: ${suunta || 1}, matka: 0, elossa: true, omistaja: pelaaja1 })`);
const aloita = (n) => { T.kaksinpeli(false); T.aloitaKentta(n); T.ev("siirtyma = 0"); p.elamat = 3; napit([]); };

// ---------- Normaali pysyy ennallaan ----------
tarkista(T.ev("vaikea") === false, "peli alkaa normaalilla vaikeudella");
aloita(0);
tarkista(T.kentta.liaanit.length === 0 && T.kentta.putoavatTasot.length === 4, "normaalilla kentässä 1 ei ole liaaneja ja tasot ovat paikallaan");
aloita(6);
tarkista(!T.kentta.tulva && T.kentta.tynnyrit.length === 0, "normaalilla kentässä 7 ei ole tulvaa eikä tynnyreitä");
aloita(11);
const tuli0 = (p.tuli = 50);
askel(100);
tarkista(p.tuli > tuli0, "normaalilla tulimittari täyttyy Pakkassaarellakin itsestään");

// ---------- Vaikeuden valinta ----------
T.ev("vaihdaVaikeus()");
tarkista(T.ev("vaikea") === true && data.ukonSeikkailuVaikeus === "vaikea", "vaikeus vaihtuu ja tallentuu selaimen muistiin");
T = lataa(muisti);
p = T.pelaaja1;
tarkista(T.ev("vaikea") === true, "valinta säilyy, kun sivu ladataan uudestaan");
T.ev("nollaaPeli()");

// ---------- Liaanit ----------
aloita(0);
const liaani = T.kentta.liaanit[0];
tarkista(T.kentta.liaanit.length === 3 && T.kentta.putoavatTasot.length === 0, "vaikealla kentässä 1 on kolme liaania ja putoavat tasot ovat poissa");
tarkista(T.kentta.kolikot.length === T.KENTAT[0]().kolikot.length, "kolikoita on yhtä monta kuin normaalilla");
// Hypätään kuilun reunalta liaaniin
seiso(1960);
askel(2);
napit(["ArrowRight", "ArrowUp"]);
let tarttui = false;
for (let i = 0; i < 60 && !tarttui; i++) { askel(1); tarttui = p.liaani === 0; }
tarkista(tarttui, "hyppy kuilun reunalta osuu liaaniin ja ukko tarttuu siihen");
napit(["ArrowRight"]);
let suurin = 0;
for (let i = 0; i < 120; i++) { askel(1); suurin = Math.max(suurin, liaani.kulma); }
tarkista(p.liaani === 0 && suurin > 0.4, "liaani heiluu ukon kanssa (suurin kulma " + suurin.toFixed(2) + ")");
tarkista(Math.abs(liaani.kulma) <= 1.15 && suurin <= 1.15, "liaani ei heilahda liian vinoon");
tarkista(p.elamat === 3 && p.y < 330, "ukko ei putoa kuiluun roikkuessaan");
// Odotetaan heilahdusta oikealle ja hypätään
for (let i = 0; i < 200 && !(liaani.kulma > 0.3 && liaani.vauhti > 0); i++) askel(1);
napit(["ArrowRight", "ArrowUp"]);
askel(1);
tarkista(p.liaani === -1 && p.vy < 0, "hyppynappi irrottaa liaanista ja ukko hyppää");
for (let i = 0; i < 80 && !p.maassa; i++) askel(1);
tarkista(p.maassa && p.x > 2250 && p.elamat === 3, "ukko laskeutuu kuilun toiselle puolelle (x " + Math.round(p.x) + ")");
// Tulipallo polttaa liaanin
napit([]);
seiso(1900);
askel(200); // odotetaan, että tyhjä liaani rauhoittuu
seiso(1900);
tulipallo(liaani.x - 40, liaani.y + 120, 1);
askel(8);
tarkista(liaani.poissa > 0, "tulipallo polttaa liaanin");
askel(310);
tarkista(liaani.poissa <= 0, "liaani kasvaa takaisin");
// Piirtäminen ei kaadu
T.piirra(1000);

// ---------- Ruutitynnyrit, murtuvat seinät ja sytytyslangat ----------
aloita(5);
let tynnyri = T.kentta.tynnyrit[0];
const seina = T.kentta.murtuvat[0];
const kekale = T.kentta.viholliset.find((v) => v.tyyppi === "kekale");
kekale.x = 660; kekale.vasen = 660; kekale.oikea = 660; // kekäle pois tieltä
seiso(800);
napit(["ArrowRight", "ArrowUp"]);
for (let i = 0; i < 90; i++) { p.suojaAika = 99; askel(1); }
napit([]);
tarkista(p.x + p.leveys <= seina.x && p.x > 880, "murtuva seinä pysäyttää ukon (x " + Math.round(p.x) + ")");
seiso(700);
kekale.x = 850; kekale.vasen = 850; kekale.oikea = 850; // nyt kekäle seisoo tynnyrin vieressä
tulipallo(tynnyri.x - 20, 385, 1);
askel(10);
tarkista(tynnyri.tila === "sihisee", "tulipallo sytyttää tynnyrin: se sihisee");
tarkista(!seina.eiKiintea, "tynnyri ei räjähdä heti");
askel(45);
tarkista(tynnyri.tila === "poissa" && seina.eiKiintea, "tynnyri räjähtää ja murtuva seinä hajoaa");
tarkista(!kekale.elossa, "räjähdys tuhoaa kekäleen, johon tulipallo ei tehoa");
tarkista(p.elamat === 3, "kaukana seisova ukko ei saa osumaa");
// Sytytyslanka
const lanka = T.kentta.langat[0];
const hylly = T.kentta.tynnyrit[1];
const seina2 = T.kentta.murtuvat[1];
T.kentta.viholliset.forEach((v) => (v.elossa = false));
seiso(1660);
tulipallo(lanka.pisteet[0][0] - 50, 384, 1);
askel(10);
tarkista(lanka.palanut >= 0, "tulipallo sytyttää langan pään");
tarkista(hylly.tila === "ehja", "tynnyri odottaa, kunnes liekki ehtii perille");
askel(Math.ceil(lanka.pituus / 1.6) + 5);
tarkista(hylly.tila === "poissa" && seina2.eiKiintea, "liekki ryömii lankaa pitkin ja räjäyttää tynnyrin");
// Ukko liian lähellä räjähdystä
aloita(5);
tynnyri = T.kentta.tynnyrit[0];
T.kentta.viholliset.forEach((v) => (v.elossa = false));
seiso(tynnyri.x - 50);
T.ev("sytytaTynnyri(kentta.tynnyrit[0])");
for (let i = 0; i < 45; i++) { p.x = tynnyri.x - 50; p.y = 370; askel(1); }
tarkista(p.elamat === 2, "räjähdys vie elämän, jos ukko on liian lähellä");
// Tykki menee rikki
aloita(7);
const tykki = T.kentta.tykit[0];
seiso(300);
T.ev("sytytaTynnyri(kentta.tynnyrit[0])");
askel(45);
tarkista(tykki.rikki === true, "tykin päällä oleva tynnyri rikkoo tykin");
T.ev("kentta.kuulat = []");
for (let i = 0; i < 300; i++) { seiso(600); askel(1); }
tarkista(T.kentta.kuulat.every((k) => k.x > 1000), "rikkinäinen tykki ei enää ammu");
T.piirra(2000);

// ---------- Laavatulva ----------
aloita(6);
const tulva = T.kentta.tulva;
tarkista(tulva.laava.y === 470, "tulva alkaa alhaalta (laava ei näy)");
let kuoli = false;
for (let i = 0; i < 780 && !kuoli; i++) { p.x = 60; if (p.y > 370) p.y = 370; askel(1); kuoli = p.elamat < 3; }
tarkista(kuoli, "kun laava nousee, maassa seisova ukko menettää elämän");
tarkista(tulva.laava.y === 470 && tulva.tila === "alhaalla", "elämän menetyksen jälkeen laava on taas alhaalla");
aloita(6);
let ylin = 500;
for (let i = 0; i < 780; i++) { seiso(190, 330); askel(1); ylin = Math.min(ylin, T.kentta.tulva.laava.y); }
tarkista(ylin === 372, "laava nousee korkeimmillaan kohtaan 372");
tarkista(p.elamat === 3, "turvatasolla seisova ukko selviää tulvasta");
T.piirra(3000);

// ---------- Pakkanen puree ----------
aloita(11);
p.tuli = 50;
seiso(300);
askel(100);
tarkista(p.tuli < 50, "vaikealla Pakkassaarella lämpö hupenee eikä täyty itsestään");
p.tuli = 0.1;
askel(10);
tarkista(p.kohmeessa === true, "kun lämpö loppuu, ukko on kohmeessa");
napit(["ArrowRight"]);
const x1 = p.x;
askel(10);
tarkista(Math.abs(p.x - x1 - 24) < 1, "kohmeinen ukko liikkuu hitaammin (" + (p.x - x1).toFixed(0) + " pikseliä, tavallisesti 40)");
napit([]);
const nuotio = T.kentta.nuotiot[0];
seiso(nuotio.x);
askel(30);
tarkista(p.tuli > 50 && !p.kohmeessa, "nuotio lämmittää ukon taas");
p.tuli = 0;
for (let i = 0; i < 620 && p.elamat === 3; i++) { seiso(300); askel(1); }
tarkista(p.elamat === 2 && p.tuli === 100, "liian kauan kohmeessa: ukko jäätyy, menettää elämän ja herää lämpimänä");
T.piirra(4000);
// Pakkasukon viima sammuttaa nuotion
aloita(16);
const pomo = T.kentta.pomo;
const n1 = T.kentta.nuotiot[0];
p.x = 1600; p.y = 370;
askel(5);
pomo.x = pomo.vasen; pomo.suunta = -1; pomo.tila = "hengittaa"; pomo.ajastin = 1;
p.y = 100; askel(3);
tarkista(n1.sammunut > 0, "Pakkasukon viima sammuttaa nuotion");
tulipallo(n1.x + 60, n1.y + 8, -1);
p.y = 100; askel(8);
tarkista(n1.sammunut <= 0, "tulipallo sytyttää nuotion uudestaan");

// ---------- Vihujen temput ----------
// Vihu ryntää
aloita(0);
let v = T.kentta.viholliset[1]; // vihu alueella 610-750
seiso(790);
v.x = 620; v.suunta = -1;
askel(30);
const vx0 = v.x;
askel(10);
tarkista(v.raivo === "ryntaa" && v.x - vx0 > 20, "vihu huomaa ukon ja ryntää päin");
// Piikkis ampuu piikkejä
v = T.kentta.viholliset.find((a) => a.tyyppi === "piikkis");
T.kentta.viholliset.forEach((a) => { if (a !== v) a.elossa = false; });
seiso(v.x - 150);
let piikkeja = 0;
for (let i = 0; i < 60; i++) { seiso(v.x - 150); askel(1); piikkeja = Math.max(piikkeja, T.kentta.lumipallot.filter((l) => l.laji === "piikki").length); }
tarkista(piikkeja === 3, "piikkis ampuu kolme piikkiä");
T.piirra(5000);
// Lentovihu pudottaa kävyn
const lento = T.kentta.lentovihut[0];
T.ev("kentta.lumipallot = []");
seiso(lento.x);
let kapyja = 0;
for (let i = 0; i < 30; i++) { seiso(lento.x + 10); p.suojaAika = 99; askel(1); kapyja = Math.max(kapyja, T.kentta.lumipallot.filter((l) => l.laji === "kapy").length); }
tarkista(kapyja === 1, "lentovihu pudottaa kävyn ukon päälle");
// Laavaetanan kuori ja kekäleen leimahdus
aloita(5);
const etana = T.kentta.viholliset.find((a) => a.tyyppi === "laavaetana");
seiso(etana.x - 150);
tulipallo(etana.x - 30, 384, 1);
askel(10);
tarkista(etana.elossa && etana.kilpi === 0, "laavaetanan kuori kestää ensimmäisen tulipallon");
tulipallo(etana.x - 30, 384, 1);
askel(10);
tarkista(!etana.elossa, "toinen tulipallo tuhoaa laavaetanan");
const kek = T.kentta.viholliset.filter((a) => a.tyyppi === "kekale")[1];
kek.kuuma = false; kek.leimuAika = 0;
for (let i = 0; i < 200 && !kek.kuuma; i++) { seiso(100); askel(1); }
tarkista(kek.kuuma === true, "kekäle leimahtaa välillä liekkeihin");
p.suojaAika = 0; p.x = kek.x + 3; p.y = kek.y - 44; p.edellinenY = p.y - 4; p.vy = 5;
askel(4);
tarkista(kek.elossa && p.elamat === 2, "liekeissä olevan kekäleen päälle ei voi hypätä");
// Lumiukkeli heittää kolme palloa
aloita(11);
const ukkeli = T.kentta.viholliset.find((a) => a.tyyppi === "lumiukkeli");
T.kentta.viholliset.forEach((a) => { if (a !== ukkeli) a.elossa = false; });
let palloja = 0;
for (let i = 0; i < 260; i++) { seiso(ukkeli.x - 200); p.tuli = 100; p.suojaAika = 99; askel(1); palloja = Math.max(palloja, T.kentta.lumipallot.length); }
tarkista(palloja === 3, "lumiukkeli heittää kolme lumipalloa kerralla");

// ---------- Tähti ja bonus ----------
aloita(0);
T.ev("kentanAika = 10; tila = 'kenttaValmis'; laskeKentanTulos()");
tarkista(T.ev("vaikeatLapaisty[0]") === true, "vaikealla läpäisty kenttä saa tähden");
tarkista(T.ev("tulos.some((rivi) => rivi[0].includes('Vaikea'))"), "pistelaskelmassa on vaikean tason bonus");
T.piirra(6000);
T.ev("avaaKartta()");
T.piirra(7000);
tarkista(JSON.parse(data.ukonSeikkailuTallennus).vaikeatLapaisty[0] === true, "tähti tallentuu");
T = lataa(muisti);
T.paina("Enter"); // Jatka peliä
tarkista(T.ev("vaikeatLapaisty[0]") === true && T.ev("vaikeitaLapaisty()") === 1, "tähti säilyy, kun sivu ladataan uudestaan");

// ---------- Kaikki kentät pyörivät vaikealla ----------
let virhe = null;
try {
  for (const kaksi of [false, true]) for (let n = 0; n < T.KENTAT.length; n++) {
    T.kaksinpeli(kaksi); T.aloitaKentta(n);
    for (let i = 0; i < 400; i++) {
      napit(i % 100 < 60 ? ["ArrowRight"] : []);
      if (i % 37 === 0) T.napit.Space = true;
      if (i % 50 === 0) T.ammu();
      T.paivita(1);
      if (i % 20 === 0) T.piirra(i * 16);
      if (T.tila !== "peli") T.aloitaKentta(n);
    }
  }
} catch (e) { virhe = e; }
tarkista(virhe === null, "kaikki " + T.KENTAT.length + " kenttää pyörivät ja piirtyvät vaikealla (1P ja 2P)" + (virhe ? " " + virhe.stack : ""));

// ---------- Pääseekö liaanikuilut yli "tavallinen pelaaja"? ----------
// Se juoksee oikealle, hyppää reunalta, roikkuu ja päästää irti, kun liaani on heilahtanut eteen.
// Kokeillaan eri hyppykohdilla (montako pikseliä ennen reunaa) ja eri irrotuskulmilla.
T = lataa(muisti); // puhdas peli (vaikeus säilyy selaimen muistissa)
p = T.pelaaja1;
function ylitaKuilu(n, alkuX, lattia, reuna, tavoite, ennenReunaa, irrotusKulma) {
  aloita(n);
  T.ev("kentta.viholliset.forEach((v) => (v.elossa = false)); kentta.lentovihut.forEach((v) => (v.elossa = false))");
  seiso(alkuX, lattia);
  let edVauhti = 0, tarttui = false;
  for (let i = 0; i < 900; i++) {
    napit(["ArrowRight"]);
    if (p.liaani >= 0) {
      const l = T.kentta.liaanit[p.liaani];
      tarttui = true;
      if ((l.kulma > irrotusKulma && l.vauhti >= 0) || (edVauhti > 0 && l.vauhti <= 0 && l.kulma > 0.1)) T.napit.ArrowUp = true;
      edVauhti = l.vauhti;
    } else if (p.maassa && p.x + 20 >= reuna - ennenReunaa && p.x < reuna) T.napit.ArrowUp = true;
    else if (!p.maassa && p.vy < 0 && !tarttui) T.napit.ArrowUp = true; // täysi hyppy
    askel(1);
    if (p.elamat < 3) return false;
    if (p.maassa && p.x > tavoite) return true;
  }
  return false;
}
const kuilut = [
  ["kenttä 1, kuilu 1", 0, 1900, 410, 2000, 2250],
  ["kenttä 1, kuilu 2", 0, 3150, 410, 3250, 3480],
  ["kenttä 1, loppu", 0, 3680, 170, 3780, 4020],
  ["kenttä 2, kuilu 1", 1, 300, 410, 400, 650],
  ["kenttä 2, kolme liaania", 1, 2000, 410, 2100, 2600],
  ["kenttä 3, pilvet 1", 2, 760, 180, 860, 1280],
  ["kenttä 3, pilvet 2", 2, 2450, 170, 2540, 3200],
  ["kenttä 4, kuilu", 3, 1850, 410, 1950, 2250],
];
for (const [nimi, n, alkuX, lattia, reuna, tavoite] of kuilut) {
  let onnistui = 0, kaikki = 0;
  for (const ennen of [0, 10, 25, 40]) for (const kulma of [0.25, 0.4, 0.55]) { kaikki++; if (ylitaKuilu(n, alkuX, lattia, reuna, tavoite, ennen, kulma)) onnistui++; }
  tarkista(onnistui >= kaikki - 1, "tavallinen pelaaja pääsee liaaneilla yli: " + nimi + " (" + onnistui + "/" + kaikki + " tavalla)");
}

console.log("\n" + ok + " ok, " + vika + " vikaa");
process.exit(vika ? 1 : 0);
