// Testaa musiikkia oikeassa selaimessa: soiko kappale, pysähtyykö tauolla,
// ja eivätkö kappaleet ole liian kovia (äänitehosteiden pitää kuulua päältä).
// Käyttö: node testit/musiikki.js
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const KANSIO = path.join(__dirname, "..");
const PROFIILI = path.join(__dirname, ".musiikki-profiili");
fs.rmSync(PROFIILI, { recursive: true, force: true });
const odota = (ms) => new Promise((r) => setTimeout(r, ms));
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };

(async () => {
  const selain = spawn("chromium", ["--headless", "--disable-gpu", "--remote-debugging-port=9343", "--autoplay-policy=no-user-gesture-required", "--allow-file-access-from-files", "--user-data-dir=" + PROFIILI, "about:blank"], { stdio: "ignore" });
  process.on("exit", () => selain.kill());
  process.on("uncaughtException", (virhe) => { console.log(virhe); process.exit(1); });
  let sivu;
  for (let i = 0; i < 50 && !sivu; i++) { await odota(200); try { sivu = (await (await fetch("http://127.0.0.1:9343/json")).json()).find((t) => t.type === "page"); } catch (e) {} }
  const ws = new WebSocket(sivu.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const odottavat = {}; const virheet = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.method === "Runtime.exceptionThrown") virheet.push(d.params.exceptionDetails.exception.description); if (odottavat[d.id]) { odottavat[d.id](d); delete odottavat[d.id]; } };
  const komento = (method, params = {}) => new Promise((r) => { odottavat[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
  const arvo = async (lauseke) => { const v = await komento("Runtime.evaluate", { expression: lauseke, returnByValue: true, awaitPromise: true }); if (v.result.exceptionDetails) console.log(v.result.exceptionDetails); return v.result.result.value; };
  await komento("Runtime.enable");
  await komento("Page.navigate", { url: "file://" + KANSIO + "/index.html" });
  await odota(1000);
  const paina = (koodi) => arvo(`dispatchEvent(new KeyboardEvent("keydown", { code: "${koodi}" })); dispatchEvent(new KeyboardEvent("keyup", { code: "${koodi}" })); true`);

  await paina("Enter"); // Aloita peli -> kartta
  await odota(600);
  await paina("Enter"); // kenttä 1 alkaa
  await odota(1500);
  tarkista(await arvo("aaniKonteksti.state") === "running", "äänet ovat päällä");
  const a1 = await arvo("musiikki.askel");
  await odota(1000);
  const a2 = await arvo("musiikki.askel");
  tarkista(await arvo("musiikki.kappale.nimi") === "Vihreät kukkulat", "kentässä 1 soi oma kappale");
  tarkista(a2 - a1 >= 4 && a2 - a1 <= 7, "musiikki etenee oikeaa tahtia (" + (a2 - a1) + " askelta sekunnissa)");

  await paina("Escape");
  await odota(300);
  const t1 = await arvo("musiikki.askel");
  await odota(800);
  tarkista(await arvo("tila") === "tauko" && (await arvo("musiikki.askel")) === t1 && (await arvo("musiikki.vahvistin")) === null, "tauolla musiikki on hiljaa");
  await paina("Escape");
  await odota(500);
  tarkista((await arvo("musiikki.askel")) > t1 && (await arvo("musiikki.askel")) < t1 + 8, "tauon jälkeen kappale jatkuu samasta kohdasta");

  // Musiikki pois taukovalikosta
  await paina("Escape"); await paina("ArrowDown"); await paina("ArrowDown");
  tarkista(await arvo("valittuRivi().id") === "musiikki", "taukovalikossa on Musiikki-rivi");
  await paina("Enter");
  tarkista(await arvo("musiikkiPaalla") === false && (await arvo("valittuRivi().lisa")) === "pois", "Enter laittaa musiikin pois");
  await paina("Escape"); await odota(500);
  tarkista(await arvo("musiikki.vahvistin") === null, "musiikki ei soi, kun se on pois päältä");
  tarkista(await arvo("localStorage.getItem('ukonSeikkailuMusiikki')") === "0", "valinta muistetaan");
  await arvo("vaihdaMusiikki(); true");
  await paina("KeyM"); await odota(400);
  tarkista(await arvo("musiikki.vahvistin") === null, "M (kaikki äänet pois) hiljentää myös musiikin");
  await paina("KeyM"); await odota(400);
  tarkista(await arvo("musiikki.vahvistin") !== null, "M uudestaan: musiikki soi taas");

  // Kartalle -> hiljaa, uusi kenttä -> uusi kappale alusta
  await arvo("avaaKartta(); true"); await odota(400);
  tarkista(await arvo("musiikki.vahvistin") === null, "kartalla musiikki on hiljaa");
  await arvo("aloitaKentta(6); true"); await odota(1500);
  tarkista(await arvo("musiikki.kappale.nimi") === "Laavajoki" && (await arvo("musiikki.askel")) < 20, "uusi kenttä aloittaa oman kappaleensa alusta");

  // Jokainen kappale renderöidään hiljaa ja mitataan voimakkuus
  const tulokset = await arvo(`(async () => {
    const tulos = [];
    hiljennaMusiikki(); const paivitaAlkup = paivitaMusiikki; paivitaMusiikki = () => {}; // peli ei saa koskea musiikkiin mittauksen aikana
    const oikea = aaniKonteksti, oikeaVahvistin = musiikki.vahvistin;
    for (const kappale of KAPPALEET) {
      const kesto = Math.min(12, kappale.melodiaNuotit.length * 30 / kappale.tempo);
      const ok = new OfflineAudioContext(1, Math.ceil(44100 * kesto), 44100);
      aaniKonteksti = ok; luoMusiikinVahvistin(); musiikki.kohina = null;
      const pituus = 30 / kappale.tempo;
      for (let i = 0; i * pituus < kesto - 0.3; i++) soitaAskel(kappale, i, i * pituus, pituus);
      const data = (await ok.startRendering()).getChannelData(0);
      let huippu = 0, summa = 0;
      for (const x of data) { huippu = Math.max(huippu, Math.abs(x)); summa += x * x; }
      tulos.push({ nimi: kappale.nimi, huippu: +huippu.toFixed(3), rms: +Math.sqrt(summa / data.length).toFixed(3) });
    }
    // vertailuksi kolikon ääni
    const ok = new OfflineAudioContext(1, 44100, 44100);
    aaniKonteksti = ok; const paalla = aanetPaalla; aanetPaalla = true;
    const alkup = ok.destination; aanet.kolikko(); aanetPaalla = paalla;
    const data = (await ok.startRendering()).getChannelData(0);
    let huippu = 0; for (const x of data) huippu = Math.max(huippu, Math.abs(x));
    tulos.push({ nimi: "(kolikon ääni)", huippu: +huippu.toFixed(3) });
    aaniKonteksti = oikea; musiikki.vahvistin = null; musiikki.kohina = null; paivitaMusiikki = paivitaAlkup;
    return tulos;
  })()`);
  for (const t of tulokset) console.log("   ", t.nimi.padEnd(24), "huippu", t.huippu, t.rms !== undefined ? "  keskim. " + t.rms : "");
  const kolikko = tulokset.pop().huippu;
  tarkista(tulokset.every((t) => t.huippu < 0.35 && t.rms > 0.01), "kappaleet eivät ole liian kovia eivätkä hiljaisia");
  tarkista(tulokset.every((t) => t.rms < kolikko * 0.6), "äänitehosteet kuuluvat musiikin päältä");
  tarkista(virheet.length === 0, "ei virheitä selaimessa " + virheet.join(" "));

  console.log("\n" + ok + " ok, " + vika + " vikaa");
  ws.close(); selain.kill();
  await odota(300);
  fs.rmSync(PROFIILI, { recursive: true, force: true });
})();
