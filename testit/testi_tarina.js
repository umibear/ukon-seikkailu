// Testaa tarinan kohtaukset: alku, pomojen jälkeen, loppu, ohitus ja tallennus.
// Käyttö: node testit/testi_tarina.js
const lataa = require("./peli_node.js");
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
const data = {};
const muisti = { getItem: (k) => (k in data ? data[k] : null), setItem: (k, x) => (data[k] = String(x)), removeItem: (k) => delete data[k] };
let T = lataa(muisti);
const askel = (n) => { for (let i = 0; i < n; i++) { T.paivita(1); T.piirra(i * 16); } };
const tallennettu = () => JSON.parse(data.ukonSeikkailuTallennus);

// --- Tekstit ---
{
  const kohtaukset = T.ev("KOHTAUKSET");
  const viat = [];
  for (const k of kohtaukset) {
    if (T.ev(`typeof KOHTAUSTEN_KUVAT["${k.id}"]`) !== "function") viat.push(k.id + ": kuva puuttuu");
    for (const sivu of k.sivut) {
      const rivit = T.ev(`rivita(${JSON.stringify(sivu)})`);
      if (rivit.length > 3) viat.push(k.id + ": teksti ei mahdu kolmelle riville (" + rivit.length + ")");
      if (rivit.some((r) => r.length > T.ev("RIVIN_PITUUS"))) viat.push(k.id + ": liian pitkä rivi");
      if (rivit.join(" ") !== sivu) viat.push(k.id + ": rivitys hukkasi tekstiä");
    }
  }
  tarkista(viat.length === 0, "jokaisen kohtauksen teksti mahtuu laatikkoon " + viat.join("; "));
  const pomot = new Set(T.ev("KENTTIEN_TIEDOT.map((t) => t.pomoTyyppi).filter(Boolean)"));
  tarkista(pomot.size === 4 && [...pomot].every((p) => kohtaukset.some((k) => k.pomo === p) && T.ev(`typeof POMOJEN_KUVAT["${p}"]`) === "function"), "jokaisella neljällä pomolla on oma kohtaus ja kuva");
}

// --- Alkukohtaus ---
T.paina("Enter");
tarkista(T.tila === "kohtaus" && T.ev("kohtaus.lista[0]") === "alku", "uusi peli alkaa alkukohtauksella");
askel(3);
T.paina("ArrowRight");
tarkista(T.tila === "kohtaus" && T.ev("kohtaus.sivu") === 0, "muut napit eivät tee kohtauksessa mitään");
T.paina("Space");
tarkista(T.ev("kohtaus.sivu") === 0 && T.ev("kohtaus.aika") > 50, "ensimmäinen painallus näyttää keskeneräisen tekstin kokonaan");
T.paina("Space");
tarkista(T.ev("kohtaus.sivu") === 1, "toinen painallus vaihtaa sivua");
askel(200);
T.paina("Enter");
tarkista(T.tila === "kartta" && T.ev("kartanKohta") === 0, "kohtauksen jälkeen ollaan kartalla");
askel(3);
T.paina("Enter");
tarkista(T.tila === "peli", "ja kartalta pääsee kenttään tavallisesti");
tarkista(tallennettu().tarinat.alku === true, "nähty kohtaus tallentuu");

// Jatka peliä ei näytä alkua uudestaan
T = lataa(muisti);
T.paina("Enter");
tarkista(T.tila === "kartta", "Jatka peliä ei näytä alkukohtausta toista kertaa");

// --- Kohtaus pomon jälkeen ---
function lapaise(numero) {
  T.ev(`avattu = Math.max(avattu, ${numero}); kartanKohta = ${numero}; aloitaKentta(${numero})`);
  T.ev("if (kentta.pomo) { kentta.pomo.elossa = false; kentta.pomo.elamat = 0; kentta.pomo.kuolinAika = 0; }");
  for (const p of [T.pelaaja1, T.pelaaja2]) { p.x = T.kentta.maali.x; p.y = T.kentta.maali.lattia - 40; p.vy = 0; p.suojaAika = 99; }
  for (let i = 0; i < 30 && T.tila === "peli"; i++) T.paivita(1);
  for (let i = 0; i < 600; i++) T.paivita(1); // pistelaskelma
  T.paina("Enter");
}
lapaise(0);
tarkista(T.tila === "kartta", "tavallisen kentän jälkeen ei ole kohtausta");
tarkista(T.ev("valokiviaLoydetty()") === 0, "aluksi valokiviä ei ole");
lapaise(4);
tarkista(T.tila === "kohtaus" && T.ev("kohtaus.lista.join()") === "isaukko", "Isäukon jälkeen näytetään sen kohtaus");
askel(5);
T.paina("Space"); T.paina("Space");
tarkista(T.tila === "kartta" && T.ev("avattu") === 5 && T.ev("karttaViesti").includes("UUSI MAAILMA"), "kohtauksen jälkeen uusi maailma aukeaa kuten ennenkin");
tarkista(T.ev("valokiviaLoydetty()") === 1 && tallennettu().tarinat.isaukko === true, "ensimmäinen valokivi on tallessa ja kohtaus muistissa");
askel(3);
lapaise(4);
tarkista(T.tila === "kartta", "saman pomon kohtausta ei näytetä toista kertaa");
lapaise(10);
tarkista(T.tila === "kohtaus" && T.ev("kohtaus.lista.join()") === "magma", "Magmamörkön jälkeen näytetään sen kohtaus");
askel(5);
T.paina("Escape");
tarkista(T.tila === "kartta" && T.ev("avattu") === 11, "Esc ohittaa kohtauksen ja peli jatkuu");
lapaise(16);
tarkista(T.ev("kohtaus.lista.join()") === "pakkas", "Pakkasukon jälkeen näytetään sen kohtaus");
askel(5);
T.paina("Escape");

// --- Loppu ---
lapaise(22);
tarkista(T.tila === "kohtaus" && T.ev("kohtaus.lista.join()") === "mato,loppu", "viimeisen pomon jälkeen tulevat madon kohtaus ja loppukohtaus");
askel(5);
T.paina("Space"); T.paina("Space");
tarkista(T.tila === "kohtaus" && T.ev("kohtaus.kohta") === 1, "madon kohtauksen jälkeen alkaa loppukohtaus");
askel(5);
T.paina("Space"); T.paina("Space");
askel(5);
T.paina("Space"); T.paina("Space");
tarkista(T.tila === "voitto", "loppukohtauksen jälkeen tulee voittoruutu");
T.piirra(1000);
tarkista(T.ev("valokiviaLoydetty()") === 4, "kaikki neljä valokiveä on löydetty");
T.paina("KeyR");
tarkista(T.tila === "kartta", "voittoruudusta pääsee kartalle");
T.piirra(1000);
lapaise(22);
tarkista(T.tila === "kohtaus" && T.ev("kohtaus.lista.join()") === "loppu", "kun peli läpäistään uudestaan, näytetään vain loppukohtaus");
T.paina("Escape");
tarkista(T.tila === "voitto", "senkin voi ohittaa");

// --- Uusi peli aloittaa tarinan alusta ---
T = lataa(muisti);
T.paina("ArrowDown"); T.paina("Enter"); T.paina("Enter");
tarkista(T.tila === "kohtaus" && T.ev("kohtaus.lista[0]") === "alku" && T.ev("Object.keys(nahdytKohtaukset).length") === 0, "uusi peli aloittaa tarinan alusta");
T.paina("Escape");

// --- Vanha tallennus (ennen tarinaa) näkee alun kerran ---
data.ukonSeikkailuTallennus = JSON.stringify({ avattu: 6, kartanKohta: 6, parhaatPisteet: Array(6).fill(500), parhaatKolikot: [], elamat: [3, 3] });
T = lataa(muisti);
T.paina("Enter");
tarkista(T.tila === "kohtaus" && T.ev("avattu") === 6, "vanha tallennus: Jatka peliä näyttää alkukohtauksen kerran");
T.paina("Escape");
tarkista(T.tila === "kartta" && T.ev("kartanKohta") === 6 && T.ev("valokiviaLoydetty()") === 1, "sen jälkeen jatketaan kartalta, ja voitetun pomon valokivi näkyy");

// --- Kaksinpelissä ja omassa kentässä ---
T = lataa(); T.kaksinpeli(true);
lapaise(4);
tarkista(T.tila === "kohtaus", "kohtaus näytetään myös kaksinpelissä");

console.log(`\n${ok} ok, ${vika} vikaa`);
process.exit(vika ? 1 : 0);
