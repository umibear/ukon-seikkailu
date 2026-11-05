// Lataa pelin monta kertaa uudestaan (kuin F5) ja tarkistaa, että peli käynnistyy joka kerta.
// Käyttö: node testit/lataus.js [osoite] [kertoja]
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const OSOITE = process.argv[2] || "file://" + path.join(__dirname, "..", "index.html");
const KERTOJA = +(process.argv[3] || 25);
const PROFIILI = path.join(__dirname, ".lataus-profiili");
const odota = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const selain = spawn("chromium", ["--headless", "--disable-gpu", "--remote-debugging-port=9334", "--allow-file-access-from-files", "--user-data-dir=" + PROFIILI, "about:blank"], { stdio: "ignore" });
  let sivu;
  for (let i = 0; i < 50 && !sivu; i++) {
    await odota(200);
    try { sivu = (await (await fetch("http://127.0.0.1:9334/json")).json()).find((t) => t.type === "page"); } catch (e) {}
  }
  const ws = new WebSocket(sivu.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const odottavat = {}; let virheet = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.method === "Runtime.exceptionThrown") { const e = d.params.exceptionDetails; virheet.push((e.exception && e.exception.description || e.text).split("\n").slice(0, 3).join(" | ") + " @" + e.url + ":" + e.lineNumber); }
    if (odottavat[d.id]) { odottavat[d.id](d); delete odottavat[d.id]; }
  };
  const komento = (method, params = {}) => new Promise((r) => { odottavat[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
  const arvo = async (lauseke) => (await komento("Runtime.evaluate", { expression: lauseke, returnByValue: true })).result.result.value;
  await komento("Runtime.enable");
  await komento("Page.enable");
  let hyvat = 0;
  for (let k = 1; k <= KERTOJA; k++) {
    virheet = [];
    await komento("Page.navigate", { url: OSOITE });
    await odota(700 + Math.random() * 600);
    const a1 = await arvo("typeof edellinenAika === 'number' ? edellinenAika : -1");
    await odota(400);
    const a2 = await arvo("typeof edellinenAika === 'number' ? edellinenAika : -1");
    const pyorii = a2 > a1;
    if (pyorii && !virheet.length) hyvat++;
    else console.log("❌ lataus " + k + ": silmukka " + (pyorii ? "pyörii" : "PYSÄHTYI") + "  " + virheet.join("  ||  "));
  }
  console.log(hyvat + " / " + KERTOJA + " latausta onnistui");
  ws.close(); selain.kill(); await odota(300);
  fs.rmSync(PROFIILI, { recursive: true, force: true });
})();
