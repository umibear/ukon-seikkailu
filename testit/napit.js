// Tarkistaa kännykän napit monen kokoisilla ruuduilla ja kaikilla 🔍-ko'oilla
// (⚙️-asetukset kiinni ja auki):
// mikään nappi ei saa mennä toisen päälle eikä ruudun ulkopuolelle.
// Käyttö: node testit/napit.js
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const PROFIILI = path.join(__dirname, ".napit-profiili");
const odota = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const selain = spawn("chromium", ["--headless", "--disable-gpu", "--remote-debugging-port=9338", "--allow-file-access-from-files", "--user-data-dir=" + PROFIILI, "about:blank"], { stdio: "ignore" });
  let sivu;
  for (let i = 0; i < 50 && !sivu; i++) {
    await odota(200);
    try { sivu = (await (await fetch("http://127.0.0.1:9338/json")).json()).find((t) => t.type === "page"); } catch (e) {}
  }
  const ws = new WebSocket(sivu.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const odottavat = {};
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (odottavat[d.id]) { odottavat[d.id](d); delete odottavat[d.id]; } };
  const komento = (method, params = {}) => new Promise((r) => { odottavat[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
  const arvo = async (lauseke) => (await komento("Runtime.evaluate", { expression: lauseke, returnByValue: true })).result.result.value;
  await komento("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });

  let vikoja = 0, kokeiltu = 0;
  // Pieniä ja isoja puhelimia sekä tabletteja vaakatasossa
  for (const [w, h] of [[640, 360], [740, 360], [832, 384], [915, 412], [1150, 530], [1024, 768], [1366, 1024]]) {
    await komento("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: true });
    await komento("Page.navigate", { url: "file://" + path.join(__dirname, "..", "index.html") });
    await odota(500);
    for (let kokeilu = 0; kokeilu < 8; kokeilu++) {
      const koko = kokeilu % 4, auki = kokeilu >= 4; // ⚙️-asetukset kiinni ja auki
      const viat = await arvo(`(() => {
        asetaNappikoko(${koko});
        document.body.classList.toggle("asetukset-auki", ${auki});
        // Näkyvät napit. Kun asetukset ovat auki, asetusrivi tarkistetaan yhtenä laatikkona.
        const napit = [...document.querySelectorAll("#kosketusnapit > .nappi")].map((n) => [n.className, n.getBoundingClientRect()]);
        if (${auki}) napit.push(["asetukset", document.getElementById("asetukset").getBoundingClientRect()]);
        const viat = [];
        for (const [nimi, a] of napit)
          if (a.left < 0 || a.top < 0 || a.right > innerWidth || a.bottom > innerHeight) viat.push(nimi + " on ruudun ulkopuolella");
        for (let i = 0; i < napit.length; i++)
          for (let j = i + 1; j < napit.length; j++) {
            const a = napit[i][1], b = napit[j][1];
            if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) viat.push(napit[i][0] + " + " + napit[j][0]);
          }
        return viat;
      })()`);
      kokeiltu++;
      if (viat.length) { vikoja++; console.log("❌", w + "x" + h, "koko", koko, auki ? "(asetukset auki)" : "", viat.join(", ")); }
    }
  }
  console.log(kokeiltu - vikoja + " / " + kokeiltu + " ruutu- ja kokoyhdistelmää ok");
  ws.close(); selain.kill(); await odota(300);
  fs.rmSync(PROFIILI, { recursive: true, force: true });
})();
