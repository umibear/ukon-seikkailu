// BOTTI: kokeilee, pääseekö kentän läpi kuolematta.
// Se tallentaa pelin tilan ja kokeilee satunnaisia liikkeitä yhä uudestaan.
// Käyttö: node testit/botti.js <kentän numero, esim. 6> [yrityksiä]
const T = require("./peli_node.js")();
const n = +process.argv[2] - 1, MAX = +(process.argv[3] || 60000);
const LOHKO = 6; // montako ruutua sama liike kestää
T.kaksinpeli(false); T.aloitaKentta(n);
for (let i = 0; i < 5; i++) T.paivita(1);
const k0 = T.kentta;
const toiminnot = [];
const AMMU = process.env.AMMU !== "0"; // AMMU=0 = botti ei ammu
for (const h of [-1, 0, 1]) for (const j of [0, 1]) for (const s of AMMU ? [0, 1] : [0]) toiminnot.push({ h, j, s });
const satunnainen = () => toiminnot[Math.floor(Math.random() * toiminnot.length)];
function asetaNapit(a) {
  for (const key in T.napit) delete T.napit[key];
  if (a.h < 0) T.napit.ArrowLeft = true;
  if (a.h > 0) T.napit.ArrowRight = true;
  if (a.j) T.napit.ArrowUp = true;
  if (a.s) T.ammu();
}
const pomoE = () => (T.kentta.pomo ? T.kentta.pomo.elamat : 0);
const jaahtynyt = () => (T.kentta.pomo && T.kentta.pomo.jaahtynyt ? 1 : 0);
const avain = () => { const p = T.pelaaja1; return [Math.floor(p.x / 32), Math.floor(p.y / 32), pomoE(), jaahtynyt()].join(","); };
const pisteet = () => T.pelaaja1.x + (T.kentta.pomo ? (T.kentta.pomo.maxElamat - pomoE()) * 2000 : 0);
const solut = new Map();
solut.set(avain(), { tila: T.SNAP(), aika: 0, kayty: 0, x: T.pelaaja1.x, piste: pisteet() });
const syyt = {};
let ennenX = 0, ennenY = 0;
let valmis = null, parasX = 0, pieninPomo = pomoE();
for (let it = 0; it < MAX && !valmis; it++) {
  const lista = [...solut.values()].sort((a, b) => (b.piste - b.kayty * 25) - (a.piste - a.kayty * 25));
  const valittu = Math.random() < 0.7 ? lista[Math.floor(Math.random() * Math.min(8, lista.length))] : lista[Math.floor(Math.random() * lista.length)];
  valittu.kayty++;
  T.RESTORE(valittu.tila);
  const elamat0 = T.pelaaja1.elamat;
  let aika = valittu.aika, a = satunnainen();
  const kuoli = () => T.pelaaja1.elamat < elamat0 || T.tila !== "peli";
  for (let s = 0, askelia = 1 + Math.floor(Math.random() * 8); s < askelia; s++) {
    if (Math.random() < 0.5) a = satunnainen();
    asetaNapit(a);
    for (let f = 0; f < LOHKO && !kuoli(); f++) { ennenX = T.pelaaja1.x; ennenY = T.pelaaja1.y; T.paivita(1); }
    aika += LOHKO;
    if (T.tila === "kenttaValmis") { valmis = aika; break; }
    if (kuoli()) { if (process.env.SYYT) { const t = T.ev("tekstit.length ? tekstit[tekstit.length - 1].teksti : ''"); const k = Math.floor(ennenX / 50) * 50 + "," + Math.floor(ennenY / 50) * 50; syyt[k + " " + t] = (syyt[k + " " + t] || 0) + 1; } break; }
    const kk = avain(), vanha = solut.get(kk);
    if (!vanha || vanha.aika > aika) solut.set(kk, { tila: T.SNAP(), aika, kayty: vanha ? vanha.kayty : 0, x: T.pelaaja1.x, piste: pisteet() });
    parasX = Math.max(parasX, T.pelaaja1.x);
    pieninPomo = Math.min(pieninPomo, pomoE());
  }
}
if (valmis) console.log("✅ Botti pääsi läpi:", k0.nimi, "ajassa", (valmis / 60).toFixed(1), "s");
else console.log("❌ Botti jäi jumiin:", k0.nimi, "pisimmillään x =", parasX.toFixed(0), "/", k0.leveys, k0.pomo ? "(pomolla vähiten " + pieninPomo + " elämää)" : "");
if (process.env.SYYT) console.log(Object.entries(syyt).sort((a, b) => b[1] - a[1]).slice(0, 12));
