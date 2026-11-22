// Testaa parhaat ajat ja varjon (varjo.js)
// Käyttö: node testit/testi_varjo.js
const lataa = require("./peli_node.js");
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
const data = {};
const muisti = { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => (data[k] = String(v)), removeItem: (k) => delete data[k] };
let T = lataa(muisti);
let p = T.pelaaja1;
const askel = (n) => { for (let i = 0; i < n; i++) T.paivita(1); };
// Pelaa kentän 1: kävellään hetki ja siirretään ukko sitten maaliin
const pelaa = (ruutuja) => {
  T.kaksinpeli(false); T.aloitaKentta(0); T.ev("siirtyma = 0"); p.elamat = 3;
  T.napit.ArrowRight = true; askel(ruutuja); T.napit.ArrowRight = false;
  p.x = T.kentta.maali.x; p.y = T.kentta.maali.lattia - 40; p.suojaAika = 0;
  askel(2);
};

tarkista(T.ev("pakkaaReitti([40, 360, 4125, -80, 0, 500])") === "014ic36l64000m8", "reitti pakkautuu tekstiksi");
tarkista(T.ev("puraReitti(pakkaaReitti([40, 360, 4125, -80, 0, 500])).join()") === "40,360,4125,-80,0,500", "ja purkautuu takaisin samaksi");
tarkista(T.ev("muotoileTarkkaAika(83.44)") === "1:23.4" && T.ev("muotoileTarkkaAika(59.96)") === "1:00.0", "aika näytetään kymmenesosan tarkkuudella");

// Ensimmäinen läpäisy
T.aloitaKentta(0);
tarkista(T.ev("varjo") === null && T.ev("parasAika(0)") === 0, "ensimmäisellä kerralla ei ole varjoa eikä parasta aikaa");
pelaa(90);
tarkista(T.tila === "kenttaValmis" && Math.abs(T.ev("parasAika(0)") - 1.5) < 0.2, "maalissa aika jää parhaaksi ajaksi (" + T.ev("parasAika(0)") + " s)");
tarkista(T.ev("tulos.some((r) => r[0] === 'Paras aika' && r[1].includes('UUSI!'))"), "pistelaskelmassa lukee UUSI!");
tarkista(JSON.parse(data.ukonSeikkailuVarjot).n0.reitti.length >= 15 * 5, "aika ja reitti tallentuvat selaimen muistiin");

// Toinen kerta: varjo juoksee mukana
T.aloitaKentta(0); T.ev("siirtyma = 0");
tarkista(T.ev("varjo.length") >= 30 && T.ev("varjo[0]") === 40, "uudella kerralla varjo on mukana ja lähtee ukon alkupaikasta");
T.piirra(0); askel(30); T.piirra(500);
// Hitaampi kerta ei korvaa parasta aikaa
pelaa(200);
tarkista(Math.abs(T.ev("parasAika(0)") - 1.5) < 0.2 && T.ev("tulos.some((r) => r[0] === 'Paras aika' && !r[1].includes('UUSI!'))"), "hitaampi kerta ei korvaa parasta aikaa");
// Nopeampi korvaa
pelaa(30);
tarkista(Math.abs(T.ev("parasAika(0)") - 0.5) < 0.2, "nopeampi kerta on uusi paras aika (" + T.ev("parasAika(0)") + " s)");

// Vaikealla on omat aikansa
T.ev("vaikea = true");
T.aloitaKentta(0);
tarkista(T.ev("varjo") === null && T.ev("parasAika(0)") === 0, "vaikealla on oma paras aikansa (normaalin varjo ei näy)");
pelaa(60);
tarkista(T.ev("parhaat.v0.aika") > 0 && T.ev("parhaat.n0.aika") < T.ev("parhaat.v0.aika"), "vaikean aika tallentuu erikseen");
T.ev("vaikea = false");

// Taukovalikon rivi
T.aloitaKentta(0);
T.paina("Escape");
T.ev("valikonValinta = valikonRivit().findIndex((r) => r.id === 'varjo')");
T.paina("Enter");
tarkista(T.ev("varjoPaalla") === false && data.ukonSeikkailuVarjo === "pois", "taukovalikosta varjon saa pois, ja valinta tallentuu");
T.piirra(0);
T.paina("Enter");
tarkista(T.ev("varjoPaalla") === true, "ja takaisin päälle");

// Sivun lataus: ajat säilyvät. Uusi peli ei poista niitä (ne ovat ennätyksiä).
T = lataa(muisti); p = T.pelaaja1;
tarkista(Math.abs(T.ev("parasAika(0)") - 0.5) < 0.2, "paras aika säilyy, kun sivu ladataan uudestaan");
T.ev("aloitaPeli()");
tarkista(T.ev("parasAika(0)") > 0, "uusi peli ei poista parhaita aikoja");
T.piirra(0);

// Omissa kentissä ei ole varjoa
T.ev("aloitaOmaKentta(uusiOmaKentta(0, 'Testi'), 'testi', 0)");
tarkista(T.ev("varjo") === null, "omassa kentässä ei ole varjoa");
askel(30);
tarkista(T.ev("nauhoitus.length") === 0, "eikä omaa kenttää nauhoiteta");

console.log("\n" + ok + " ok, " + vika + " vikaa");
process.exit(vika ? 1 : 0);
