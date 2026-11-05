// Testaa, ettei ukko juokse heti uudestaan kuolemaan, jos nappi jää pohjaan
// Käyttö: node testit/testi_kuolema.js
const T = require("./peli_node.js")();
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };
const p = T.pelaaja1;
const tyhjenna = () => { for (const k in T.napit) delete T.napit[k]; };

for (const [kuvaus, kentta, x, nappi] of [["laavaan (kenttä 6)", 5, 470, "ArrowRight"], ["kuoppaan (kenttä 1)", 0, null, "ArrowRight"]]) {
  T.kaksinpeli(false);
  T.ev(`aloitaKentta(${kentta})`);
  p.elamat = 3;
  for (let i = 0; i < 30; i++) T.paivita(1);
  tyhjenna();
  T.napit[nappi] = true;
  if (x !== null) p.x = x;
  // juostaan oikealle, kunnes kuollaan
  let kuoli = false;
  for (let i = 0; i < 1500 && !kuoli; i++) { T.paivita(1); if (p.elamat < 3) kuoli = true; }
  tarkista(kuoli, kuvaus + ": ukko kuolee, kun juoksee nappi pohjassa");
  const alkuX = p.x;
  for (let i = 0; i < 120; i++) T.paivita(1); // nappi on yhä pohjassa
  tarkista(p.elamat === 2 && Math.abs(p.x - alkuX) < 1, kuvaus + ": nappi pohjassa -> ukko seisoo paikallaan (elämiä " + p.elamat + ")");
  T.napit.ArrowUp = true;
  for (let i = 0; i < 20; i++) T.paivita(1);
  tarkista(p.maassa && Math.abs(p.x - alkuX) < 1, kuvaus + ": hyppynappi ei myöskään toimi ennen nostoa");
  tyhjenna();
  T.paivita(1);
  T.napit.ArrowRight = true;
  for (let i = 0; i < 10; i++) T.paivita(1);
  tarkista(p.x > alkuX + 20, kuvaus + ": nappien noston jälkeen ukko liikkuu taas");
  tyhjenna();
}
// Kaksinpeli: kaveri liikkuu normaalisti, vaikka toinen odottaa
T.kaksinpeli(true);
T.ev("aloitaKentta(0)");
for (let i = 0; i < 30; i++) T.paivita(1);
T.ev("pelaaja = pelaaja1; menetaElama()");
tyhjenna(); T.napit.KeyD = true; T.napit.ArrowRight = true;
const x1 = p.x, x2 = T.pelaaja2.x;
for (let i = 0; i < 10; i++) T.paivita(1);
tarkista(Math.abs(p.x - x1) < 1 && T.pelaaja2.x > x2 + 20, "kaksinpeli: kuollut odottaa nostoa, kaveri liikkuu normaalisti");
T.kaksinpeli(false); tyhjenna();
console.log("\n" + ok + " ok, " + vika + " vikaa");
