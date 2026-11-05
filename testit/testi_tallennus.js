// Testaa tallennuksen, "Jatka / Uusi peli" -valinnan ja maailman alusta aloittamisen
// Käyttö: node testit/testi_tallennus.js
const lataa = require("./peli_node.js");
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
// Selaimen muisti, joka säilyy "sivun uudelleenlatauksen" yli
const data = {};
const muisti = { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => (data[k] = String(v)), removeItem: (k) => delete data[k] };

// --- Ensimmäinen kerta: ei tallennusta ---
let T = lataa(muisti);
tarkista(T.ev("tallennus") === null, "ensimmäisellä kerralla tallennusta ei ole");
T.piirra(0);
T.paina("Enter");
tarkista(T.tila === "kartta" && T.ev("avattu") === 0, "Enter aloittaa uuden pelin");
tarkista(data.ukonSeikkailuTallennus !== undefined, "peli tallentuu kartalle tultaessa");

// Pelataan pitkälle: maailma 1 läpi ja kenttä 7 auki
T.ev("avattu = 6; kartanKohta = 6; for (let i = 0; i < 6; i++) parhaatPisteet[i] = 1000 * (i + 1); parhaatKolikot[0] = 5; pelaaja1.elamat = 2; pisteet = summa(parhaatPisteet); avaaKartta()");
const pisteetEnnen = T.ev("pisteet");

// --- Sivu ladataan uudestaan ---
T = lataa(muisti);
tarkista(T.ev("tallennus") !== null && T.ev("alkuValinta") === "jatka", "uudelleenlatauksen jälkeen tallennus löytyy ja JATKA on valittuna");
T.piirra(0);
T.paina("Enter");
tarkista(T.tila === "kartta" && T.ev("avattu") === 6 && T.ev("kartanKohta") === 6, "JATKA palauttaa avatut kentät ja paikan kartalla");
tarkista(T.ev("pisteet") === pisteetEnnen && T.ev("parhaatKolikot[0]") === 5, "JATKA palauttaa pisteet (" + T.ev("pisteet") + ") ja kolikot");
tarkista(T.pelaaja1.elamat === 2, "JATKA palauttaa elämät");
tarkista(T.ev("parhaatPisteet[5] === 6000 && parhaatPisteet[6] === undefined"), "läpäisemätön kenttä ei näy läpäistynä");

// --- Häviö maailmassa 2: maailma 2 alkaa alusta ---
T.ev("aloitaKentta(7); parhaatPisteet[6] = 500; tila = 'havio'");
T.paina("KeyR");
tarkista(T.tila === "kartta" && T.ev("avattu") === 5 && T.ev("kartanKohta") === 5, "häviön jälkeen maailma 2 alkaa kentästä 6");
tarkista(T.ev("parhaatPisteet[4]") === 5000 && T.ev("parhaatPisteet[5] === undefined && parhaatPisteet[6] === undefined"), "maailman 1 pisteet säilyvät, maailman 2 pisteet nollautuvat");
tarkista(T.ev("pisteet") === 15000, "kokonaispisteet = maailman 1 pisteet (" + T.ev("pisteet") + ")");
tarkista(T.pelaaja1.elamat === T.ev("ELAMIA_ALUSSA"), "häviön jälkeen elämät ovat täynnä");
tarkista(T.ev("liikuKartalla(-1), kartanKohta") === 4, "maailman 1 kentät ovat yhä auki (kartalla pääsee kenttään 5)");
T = lataa(muisti);
tarkista(T.ev("tallennus.avattu") === 5, "maailman nollaus tallentuu");

// --- Häviö maailmassa 1 ---
T.ev("jatkaPelia(); avattu = 3; aloitaKentta(2); tila = 'havio'");
T.paina("KeyR");
tarkista(T.ev("avattu") === 0 && T.ev("pisteet") === 0, "häviö maailmassa 1 aloittaa kentästä 1");

// --- Uusi peli vaatii vahvistuksen ---
T.ev("avattu = 6; kartanKohta = 6; avaaKartta()");
T = lataa(muisti);
T.paina("ArrowDown");
tarkista(T.ev("alkuValinta") === "uusi", "↓ valitsee UUSI PELI");
T.paina("Enter");
tarkista(T.tila === "alku" && T.ev("uusiVahvistus") === true, "ensimmäinen painallus vain kysyy vahvistusta");
T.piirra(0);
T.paina("ArrowUp");
tarkista(T.ev("alkuValinta") === "jatka" && T.ev("uusiVahvistus") === false, "↑ peruu ja valitsee JATKA");
T.paina("ArrowDown"); T.paina("Enter"); T.paina("Enter");
tarkista(T.tila === "kartta" && T.ev("avattu") === 0, "toinen painallus aloittaa uuden pelin");
tarkista(JSON.parse(data.ukonSeikkailuTallennus).avattu === 0, "uusi peli korvaa vanhan tallennuksen");

// --- ← → valitsee edelleen pelaajamäärän ---
T.ev("avattu = 6; avaaKartta()");
T = lataa(muisti);
T.paina("ArrowRight");
tarkista(T.ev("kaksinpeli") === true && T.ev("alkuValinta") === "jatka", "← → vaihtaa pelaajamäärää, ei valintaa");

// --- Kännykkä: ◀ ▶ valitsee jatka/uusi ---
T = lataa(muisti);
T.ev("kosketusOhjaus = true");
T.paina("ArrowRight");
tarkista(T.ev("alkuValinta") === "uusi" && T.ev("kaksinpeli") === false, "kännykässä ◀ ▶ valitsee JATKA / UUSI PELI");
T.piirra(0);

// --- Testitila ei tallenna ---
T = lataa(muisti);
const ennen = data.ukonSeikkailuTallennus;
try { T.ev("(() => { tila = 'alku'; testiPeli = true; aloitaPeli(); avattu = KENTAT.length - 1; aloitaKentta(7); avaaKartta(); })()"); } catch (e) {}
tarkista(data.ukonSeikkailuTallennus === ennen, "testitilassa aloitettu peli ei muuta tallennusta");

// --- R kesken kentän: maailma alusta (kaksi painallusta) ---
T = lataa(muisti);
T.ev("jatkaPelia(); avattu = 7; parhaatPisteet[5] = 800; parhaatPisteet[6] = 900; pelaaja1.elamat = 1; aloitaKentta(7)");
for (let i = 0; i < 30; i++) T.paivita(1);
T.paina("KeyR");
tarkista(T.tila === "peli" && T.ev("alustaVahvistus") > 0, "R kerran: peli jatkuu ja varoitus näkyy");
T.piirra(0);
for (let i = 0; i < 200; i++) T.paivita(1);
T.paina("KeyR");
tarkista(T.tila === "peli", "varoitus vanhenee: myöhempi yksittäinen R ei aloita alusta");
T.paina("KeyR");
tarkista(T.tila === "kartta" && T.ev("avattu") === 5 && T.ev("kartanKohta") === 5, "R kaksi kertaa: maailma 2 alkaa kentästä 6");
tarkista(T.pelaaja1.elamat === T.ev("ELAMIA_ALUSSA") && T.ev("parhaatPisteet[5] === undefined"), "R:n jälkeen elämät täynnä ja maailman pisteet nollattu");
T.ev("aloitaKentta(5)");
T.paina("KeyR");
T.ev("avaaKartta(); aloitaKentta(5)");
T.paina("KeyR");
tarkista(T.tila === "peli", "uusi kenttä nollaa varoituksen");

console.log("\n" + ok + " ok, " + vika + " vikaa");
