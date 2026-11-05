// Testaa kosketusohjausta oikeassa selaimessa, jossa on kännykän kokoinen ruutu.
// Käyttö: node testit/puhelin.js   (kuvat tallentuvat kansioon testit/puhelinkuvat)
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const KANSIO = path.join(__dirname, "..");
const KUVAT = path.join(__dirname, "puhelinkuvat");
const PROFIILI = path.join(__dirname, ".puhelin-profiili");
fs.mkdirSync(KUVAT, { recursive: true });
const odota = (ms) => new Promise((r) => setTimeout(r, ms));
let ok = 0, vika = 0;
const tarkista = (ehto, teksti) => { if (ehto) { ok++; console.log("✅", teksti); } else { vika++; console.log("❌", teksti); } };

(async () => {
  const selain = spawn("chromium", ["--headless", "--disable-gpu", "--remote-debugging-port=9333", "--allow-file-access-from-files", "--user-data-dir=" + PROFIILI, "about:blank"], { stdio: "ignore" });
  let sivu;
  for (let i = 0; i < 50 && !sivu; i++) {
    await odota(200);
    try { sivu = (await (await fetch("http://127.0.0.1:9333/json")).json()).find((t) => t.type === "page"); } catch (e) {}
  }
  const ws = new WebSocket(sivu.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const odottavat = {};
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (odottavat[d.id]) { odottavat[d.id](d); delete odottavat[d.id]; } };
  const komento = (method, params = {}) => new Promise((r) => { odottavat[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
  const arvo = async (lauseke) => (await komento("Runtime.evaluate", { expression: lauseke, returnByValue: true })).result.result.value;
  const kuva = async (nimi) => { const d = await komento("Page.captureScreenshot"); fs.writeFileSync(path.join(KUVAT, nimi + ".png"), Buffer.from(d.result.data, "base64")); };
  const kosketa = (tyyppi, pisteet) => komento("Input.dispatchTouchEvent", { type: tyyppi, touchPoints: pisteet });
  const napinKohta = async (nappi) => arvo(`(() => { const r = document.querySelector('[data-nappi="${nappi}"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, id: 0 }; })()`);
  const napauta = async (x, y) => { await kosketa("touchStart", [{ x, y }]); await odota(60); await kosketa("touchEnd", []); await odota(300); };

  await komento("Emulation.setDeviceMetricsOverride", { width: 844, height: 390, deviceScaleFactor: 1, mobile: true, screenOrientation: { type: "landscapePrimary", angle: 90 } });
  await komento("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await komento("Page.navigate", { url: "file://" + KANSIO + "/index.html" });
  await odota(1500);

  tarkista(await arvo("kosketusOhjaus"), "puhelin tunnistetaan kosketusnäytöksi");
  tarkista(await arvo("getComputedStyle(document.getElementById('kosketusnapit')).display") === "block", "kosketusnapit näkyvät");
  const koko = await arvo("(() => { const r = document.getElementById('peli').getBoundingClientRect(); return [r.width, r.height]; })()");
  tarkista(koko[0] === 844 && koko[1] === 390, "peli täyttää ruudun (" + koko + ")");
  tarkista(await arvo("document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight"), "sivu ei vierity");
  await kuva("1_alku");

  await napauta(422, 200);
  tarkista(await arvo("tila") === "kartta", "ruudun napautus aloittaa pelin (kartta)");
  tarkista(await arvo("kaksinpeli") === false, "kännykässä pelataan yksin");
  await odota(800);
  await kuva("2_kartta");
  await napauta(422, 200);
  tarkista(await arvo("tila") === "peli", "napautus kartalla aloittaa kentän");
  await odota(800);

  const oikea = await napinKohta("ArrowRight"), vasen = await napinKohta("ArrowLeft");
  const hyppy = { ...(await napinKohta("ArrowUp")), id: 1 }, ammu = { ...(await napinKohta("KeyX")), id: 1 };
  let x0 = await arvo("pelaaja1.x");
  await odota(1500); // odotetaan, että ruudun avautuminen on valmis
  await arvo("kentta.viholliset = []; kentta.lentovihut = []; kentta.kaikkiTasot = [{ x: -100, y: 410, leveys: 5000, korkeus: 40 }]; pelaaja1.x = 60; true"); // tyhjä kenttä testiä varten
  await kosketa("touchStart", [oikea]);
  await odota(700);
  tarkista(await arvo("napit.ArrowRight") === true, "▶-nappi pysyy pohjassa");
  tarkista(await arvo("pelaaja1.x") > x0 + 50, "▶ liikuttaa ukkoa oikealle");
  // toinen sormi hyppää samalla, kun ensimmäinen pitää ▶ pohjassa
  await kosketa("touchEnd", []);
  await odota(300);
  await arvo("pelaaja1.x = 150; true"); // hypätään tasaiselta maalta
  await odota(300);
  const y0 = await arvo("pelaaja1.y");
  await arvo("window.korkein = pelaaja1.y; setInterval(() => (korkein = Math.min(korkein, pelaaja1.y)), 5); window.loki = []; const alkup = paivita; paivita = (dt) => { alkup(dt); if (loki.length < 40) loki.push([+dt.toFixed(2), Math.round(pelaaja1.y), +pelaaja1.vy.toFixed(1), napit.ArrowUp, pelaaja1.maassa, tila]); }; true");
  await kosketa("touchStart", [oikea, hyppy]);
  await odota(150);
  tarkista(await arvo("napit.ArrowUp && napit.ArrowRight"), "kaksi sormea: ⬆ ja ▶ ovat yhtä aikaa pohjassa");
  for (let i = 0; i < 40 && !(await arvo("pelaaja1.maassa && korkein < " + (y0 - 5))); i++) await odota(100); // odotetaan laskeutumista
  const korkein = await arvo("korkein");
  if (korkein >= y0 - 60) console.log(JSON.stringify(await arvo("loki")));
  tarkista(korkein < y0 - 60, "ukko hyppää (nousi " + Math.round(y0 - korkein) + " px)");
  await kuva("3_peli_hyppy");
  await kosketa("touchEnd", [oikea]);
  await odota(400);
  // liu'utetaan sormi ▶:stä ◀:hen
  await kosketa("touchMove", [vasen]);
  await odota(100);
  tarkista(await arvo("napit.ArrowLeft === true && napit.ArrowRight === false"), "sormen voi liu'uttaa ▶:stä ◀:hen");
  await kosketa("touchEnd", []);
  await odota(100);
  tarkista(await arvo("!napit.ArrowLeft && !napit.ArrowRight && !napit.ArrowUp"), "sormien noston jälkeen mikään nappi ei ole pohjassa");
  await kosketa("touchStart", [{ ...ammu, id: 0 }]);
  await odota(50);
  tarkista(await arvo("tulipallot.length") > 0, "🔥 ampuu tulipallon " + JSON.stringify(await arvo("({ tila, tuli: pelaaja1.tuli, x: pelaaja1.x, y: pelaaja1.y, elamat: pelaaja1.elamat, haamu: pelaaja1.haamu })")));
  await kosketa("touchEnd", []);
  const aanet0 = await arvo("aanetPaalla");
  const aaniNappi = await napinKohta("KeyM");
  await napauta(aaniNappi.x, aaniNappi.y);
  tarkista(await arvo("aanetPaalla") !== aanet0, "🔊 vaihtaa äänet päälle/pois");
  await napauta(aaniNappi.x, aaniNappi.y);
  const kartalle = await napinKohta("Escape");
  await napauta(kartalle.x, kartalle.y);
  tarkista(await arvo("tila") === "kartta", "☰ vie kartalle");

  // Pystyasento
  await komento("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenOrientation: { type: "portraitPrimary", angle: 0 } });
  await odota(300);
  tarkista(await arvo("getComputedStyle(document.getElementById('kaanna')).display") === "flex", "pystyasennossa pyydetään kääntämään puhelin");
  await kuva("4_pysty");

  // Tietokoneella napit eivät näy
  await komento("Emulation.setTouchEmulationEnabled", { enabled: false });
  await komento("Emulation.setDeviceMetricsOverride", { width: 1200, height: 800, deviceScaleFactor: 1, mobile: false });
  await komento("Page.navigate", { url: "file://" + KANSIO + "/index.html" });
  await odota(1000);
  tarkista(await arvo("kosketusOhjaus") === false, "tietokoneella kosketusohjaus on pois päältä");
  tarkista(await arvo("getComputedStyle(document.getElementById('kosketusnapit')).display") === "none", "tietokoneella napit eivät näy");

  console.log("\n" + ok + " ok, " + vika + " vikaa   (kuvat: testit/puhelinkuvat)");
  ws.close(); selain.kill();
  await odota(300);
  fs.rmSync(PROFIILI, { recursive: true, force: true });
})();
