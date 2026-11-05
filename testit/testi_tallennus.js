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
const valittu = () => T.ev("valittuRivi().id");
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
tarkista(T.ev("tallennus") !== null && valittu() === "jatka", "uudelleenlatauksen jälkeen tallennus löytyy ja JATKA on valittuna");
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
tarkista(valittu() === "uusi", "↓ valitsee Uusi peli");
T.paina("Enter");
tarkista(T.tila === "alku" && T.ev("uusiVahvistus") === true, "ensimmäinen painallus vain kysyy vahvistusta");
T.piirra(0);
T.paina("ArrowUp");
tarkista(valittu() === "jatka" && T.ev("uusiVahvistus") === false, "↑ peruu ja valitsee Jatka peliä");
T.paina("ArrowDown"); T.paina("Enter"); T.paina("Enter");
tarkista(T.tila === "kartta" && T.ev("avattu") === 0, "toinen painallus aloittaa uuden pelin");
tarkista(JSON.parse(data.ukonSeikkailuTallennus).avattu === 0, "uusi peli korvaa vanhan tallennuksen");

// --- Pelaajat-rivi: ← → vaihtaa pelaajamäärää ---
T.ev("avattu = 6; avaaKartta()");
T = lataa(muisti);
T.paina("ArrowRight");
tarkista(T.ev("kaksinpeli") === false && valittu() === "jatka", "← → ei tee mitään Jatka-rivillä");
T.paina("ArrowDown"); T.paina("ArrowDown");
tarkista(valittu() === "pelaajat", "↓ ↓ valitsee Pelaajat-rivin");
T.paina("ArrowRight");
tarkista(T.ev("kaksinpeli") === true, "→ Pelaajat-rivillä valitsee 2 pelaajaa");
T.paina("Enter");
tarkista(T.ev("kaksinpeli") === false, "Enter Pelaajat-rivillä vaihtaa takaisin 1 pelaajaan");
T.paina("ArrowDown"); T.paina("ArrowDown");
tarkista(valittu() === "jatka", "alimmasta rivistä ↓ hyppää ylimpään");
T.paina("ArrowUp");
tarkista(valittu() === "ohjeet", "ylimmästä rivistä ↑ hyppää alimpaan (Ohjeet)");
T.paina("Enter");
tarkista(T.tila === "ohjeet", "Ohjeet avautuu");
T.piirra(0);
T.paina("Escape");
tarkista(T.tila === "alku" && valittu() === "ohjeet", "Esc palaa ohjeista valikkoon");
T.paina("Space"); T.paina("Enter");
tarkista(T.tila === "alku", "Enter palaa ohjeista valikkoon");

// --- Ilman tallennusta: Aloita peli on ylimpänä ---
const vanha = data.ukonSeikkailuTallennus;
delete data.ukonSeikkailuTallennus;
T = lataa(muisti);
tarkista(valittu() === "uusi" && T.ev("valikonRivit()[0].teksti") === "Aloita peli", "ilman tallennusta ylin rivi on Aloita peli");
data.ukonSeikkailuTallennus = vanha;

// --- Kännykkä: ◀ ▶ liikuttaa valintaa, Pelaajat-riviä ei ole ---
T = lataa(muisti);
T.ev("kosketusOhjaus = true");
tarkista(!T.ev("valikonRivit().some((r) => r.id === 'pelaajat')"), "kännykässä ei ole Pelaajat-riviä");
T.paina("ArrowRight");
tarkista(valittu() === "uusi" && T.ev("kaksinpeli") === false, "kännykässä ▶ siirtää valintaa");
T.piirra(0);

// --- Taukovalikko ---
T = lataa(muisti);
T.paina("Enter");
T.ev("aloitaKentta(kartanKohta)");
T.ev("tila = 'peli'");
T.paivita(1);
const aikaEnnen = T.ev("kentanAika");
const xEnnen = T.pelaaja1.x;
T.paina("Escape");
tarkista(T.tila === "tauko" && valittu() === "jatkaTaukoa", "Esc kesken kentän avaa tauon (Jatka peliä valittuna)");
T.napit.ArrowRight = true;
for (let i = 0; i < 60; i++) T.paivita(1);
tarkista(T.ev("kentanAika") === aikaEnnen && T.pelaaja1.x === xEnnen, "tauolla kello ja ukko ovat pysähdyksissä");
T.napit.ArrowRight = false;
T.piirra(0);
T.paina("Escape");
tarkista(T.tila === "peli", "Esc tauolla jatkaa peliä");
T.paina("Escape"); T.paina("Enter");
tarkista(T.tila === "peli", "Enter Jatka peliä -rivillä jatkaa peliä");
T.napit.Space = true;
T.paina("Escape"); T.paina("Space", { }); T.napit.Space = true;
const yEnnen = T.pelaaja1.y;
for (let i = 0; i < 10; i++) T.paivita(1);
tarkista(T.tila === "peli" && T.pelaaja1.y >= yEnnen, "välilyönnillä jatkaminen ei hypäytä ukkoa");
T.napit.Space = false;
T.paina("Escape"); T.paina("ArrowDown"); T.paina("Enter");
tarkista(T.tila === "kartta", "Palaa kartalle vie kartalle");
T.ev("aloitaKentta(kartanKohta); tila = 'peli'");
T.paina("Escape"); T.paina("ArrowUp"); 
tarkista(valittu() === "poistu", "↑ Jatka peliä -riviltä hyppää Poistu pelistä -riviin");
T.ev("avattu = 9; kartanKohta = 9");
T.paina("Enter");
tarkista(T.tila === "alku" && valittu() === "jatka", "Poistu pelistä vie alkuvalikkoon, Jatka peliä valittuna");
tarkista(JSON.parse(data.ukonSeikkailuTallennus).avattu === 9, "poistuessa peli tallentuu");
T.paina("Enter");
tarkista(T.tila === "kartta" && T.ev("kartanKohta") === 9, "Jatka peliä jatkaa samasta kohdasta");
T.paina("Escape");
tarkista(T.tila === "alku", "Esc kartalla palaa alkuvalikkoon");

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
