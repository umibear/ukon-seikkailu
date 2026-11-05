// Mittaa, kuinka kauan yhden ruudun piirtäminen kestää jokaisessa kentässä.
// Prosessori hidastetaan (kuin halpa kännykkä), ja ukko kulkee kentän alusta loppuun.
// Käyttö: node testit/suorituskyky.js [hidastus, oletus 4] [kentät, esim. 1,7,11]
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const KANSIO = process.env.KANSIO || path.join(__dirname, ".."); // KANSIO=... mittaa toista versiota
// GPU=1: piirretään (ohjelmallisella) näytönohjaimella, kuten kännykässä
const GPU = process.env.GPU === "1";
const PROFIILI = path.join(__dirname, ".suorituskyky-profiili");
fs.rmSync(PROFIILI, { recursive: true, force: true });
const odota = (ms) => new Promise((r) => setTimeout(r, ms));
const HIDASTUS = Number(process.argv[2] || 4);
const VALITUT = process.argv[3] ? process.argv[3].split(",").map(Number) : null;

(async () => {
  const selain = spawn("chromium", ["--headless", ...(GPU ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] : ["--disable-gpu"]), "--remote-debugging-port=9345", "--allow-file-access-from-files", "--user-data-dir=" + PROFIILI, "about:blank"], { stdio: "ignore" });
  process.on("exit", () => { selain.kill(); try { fs.rmSync(PROFIILI, { recursive: true, force: true }); } catch (e) {} });
  process.on("uncaughtException", (virhe) => { console.log(virhe); process.exit(1); });
  let sivu;
  for (let i = 0; i < 50 && !sivu; i++) { await odota(200); try { sivu = (await (await fetch("http://127.0.0.1:9345/json")).json()).find((t) => t.type === "page"); } catch (e) {} }
  const ws = new WebSocket(sivu.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const odottavat = {};
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (odottavat[d.id]) { odottavat[d.id](d); delete odottavat[d.id]; } };
  const komento = (method, params = {}) => new Promise((r) => { odottavat[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
  const arvo = async (lauseke) => { const v = await komento("Runtime.evaluate", { expression: lauseke, returnByValue: true, awaitPromise: true }); if (v.result.exceptionDetails) console.log(v.result.exceptionDetails.exception.description); return v.result.result.value; };
  await komento("Emulation.setDeviceMetricsOverride", { width: 844, height: 390, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: "landscapePrimary", angle: 90 } });
  await komento("Page.navigate", { url: "file://" + KANSIO + "/index.html?kosketus" });
  await odota(1500);
  // FPS=1: peli pyörii omalla silmukallaan ja lasketaan oikeat ruudut sekunnissa.
  // Muuten mittari ajaa ruudut itse ja mittaa jokaisen ruudun piirtoajan.
  const FPS = process.env.FPS === "1";
  if (!FPS) await arvo("window.requestAnimationFrame = () => {}; true"); // pelin oma silmukka pysähtyy
  await odota(200);
  if (process.env.KOKEILU) await arvo(process.env.KOKEILU + "; true"); // esim. jonkin piirron poisto vertailua varten
  await komento("Emulation.setCPUThrottlingRate", { rate: HIDASTUS });

  const kentat = VALITUT || Array.from({ length: await arvo("KENTAT.length") }, (_, i) => i + 1);
  const yhteensa = [];
  if (FPS) {
    console.log("Kenttä                     ruutuja/s   hitain ruutu   (" + (GPU ? "GPU" : "ohjelmallinen") + ", hidastus " + HIDASTUS + "x)");
    for (const numero of kentat) {
      // Ukko kulkee kentän läpi 5 sekunnissa, ja lasketaan montako ruutua ehditään piirtää
      await arvo(`(() => {
        aloitaPeli(); aloitaKentta(${numero - 1}); tila = "peli"; siirtyma = 0;
        window.mittaus = { alku: performance.now(), ruudut: 0, hitain: 0, edellinen: performance.now() };
        if (!window.alkupPaivita) window.alkupPaivita = paivita;
        paivita = (dt) => {
          const nyt = performance.now(), m = mittaus;
          m.ruudut++; m.hitain = Math.max(m.hitain, nyt - m.edellinen);
          if (nyt - m.edellinen > 40 && window.hitaat) hitaat.push(Math.round(nyt - m.edellinen) + "ms@x" + Math.round(kameraX) + (window.uusia ? " uusia:" + uusia : ""));
          m.edellinen = nyt;
          const osuus = Math.min(1, (nyt - m.alku) / 5000);
          pelaaja1.suojaAika = 99999; pelaaja1.elamat = 3;
          pelaaja1.x = 50 + (kentta.leveys - 200) * osuus; pelaaja1.y = 200; pelaaja1.vy = 0;
          alkupPaivita(dt); tila = "peli"; kameraHyppaa = true;
        };
        return true;
      })()`);
      await odota(1000);
      await arvo("mittaus.ruudut = 0; mittaus.hitain = 0; mittaus.alku2 = performance.now(); true"); // ensimmäinen sekunti on lämmittelyä
      await odota(4000);
      const t = await arvo("({ nimi: kentta.nimi, fps: mittaus.ruudut / ((performance.now() - mittaus.alku2) / 1000), hitain: mittaus.hitain })");
      yhteensa.push(t.fps);
      if (process.env.HITAAT) { console.log("    hitaat:", JSON.stringify(await arvo("hitaat"))); await arvo("hitaat = []; true"); }
      console.log((numero + " " + t.nimi).padEnd(26), t.fps.toFixed(1).padStart(9), (t.hitain.toFixed(0) + " ms").padStart(14));
    }
    console.log("Keskimäärin", (yhteensa.reduce((a, b) => a + b, 0) / yhteensa.length).toFixed(1), "ruutua sekunnissa");
    ws.close();
    process.exit(0);
  }
  console.log("Kenttä                     keskim.   hitain 5%   (ms / ruutu, hidastus " + HIDASTUS + "x)");
  for (const numero of kentat) {
    const tulos = await arvo(`(() => {
      aloitaPeli(); aloitaKentta(${numero - 1}); tila = "peli"; siirtyma = 0;
      const ajat = [];
      const RUUTUJA = 240;
      for (let i = 0; i < RUUTUJA; i++) {
        pelaaja1.suojaAika = 99999; pelaaja1.elamat = 3;
        pelaaja1.x = 50 + (kentta.leveys - 200) * i / RUUTUJA; pelaaja1.y = 200; pelaaja1.vy = 0;
        paivita(1); tila = "peli";
        kameraHyppaa = true; paivitaKamera(1);
        const alku = performance.now();
        piirra(i * 16);
        ctx.getImageData(0, 0, 1, 1); // pakottaa selaimen piirtämään oikeasti heti
        ajat.push(performance.now() - alku);
      }
      ajat.sort((a, b) => a - b);
      const keskim = ajat.reduce((a, b) => a + b, 0) / ajat.length;
      return { nimi: kentta.nimi, keskim, hidas: ajat[Math.floor(ajat.length * 0.95)] };
    })()`);
    yhteensa.push(tulos.keskim);
    console.log((numero + " " + tulos.nimi).padEnd(26), tulos.keskim.toFixed(1).padStart(7), tulos.hidas.toFixed(1).padStart(11));
    if (process.env.OSAT) { console.log("   ", await arvo("JSON.stringify(Object.entries(osat).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, t]) => n + ' ' + (t / 240).toFixed(1)))")); await arvo("osat = {}; true"); }
  }
  console.log("Kaikki kentät keskimäärin:", (yhteensa.reduce((a, b) => a + b, 0) / yhteensa.length).toFixed(1), "ms  (60 fps = 16.7 ms)");
  ws.close();
  process.exit(0);
})();
