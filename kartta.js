// ==========================================
//   MAAILMANKARTTA
//   Kentät ovat saarella pallukoina, ja niiden välillä kulkee polku.
//   Ukko kävelee kartalla nuolinäppäimillä, ja välilyönti aloittaa kentän.
//   Kenttien paikat kartalla ovat kentat.js-tiedostossa (KARTTA).
// ==========================================

let avattu = 0; // suurin kenttä, joka on auki (0 = vain ensimmäinen)
let kartanKohta = 0; // missä kentässä ukko seisoo kartalla
let kartanKohde = null; // mihin kenttään ukko kävelee (null = seisoo paikallaan)
let kartanEdistys = 0; // kuinka pitkällä kävely on (0 = alussa, 1 = perillä)
let kartanSuunta = 1; // 1 = ukko katsoo oikealle, -1 = vasemmalle
let uusiKentta = -1; // juuri avattu kenttä, joka sykkii kartalla
let karttaViesti = ""; // teksti, joka näkyy hetken kartan yläreunassa
let karttaViestiAika = 0;
let parhaatPisteet = []; // paras tulos jokaisesta kentästä
let parhaatKolikot = []; // eniten kerätyt kolikot jokaisesta kentästä

// Haetaan kenttien nimet ja värit kerran pelin alussa
const KENTTIEN_TIEDOT = KENTAT.map((teeKentta) => {
  const k = teeKentta();
  return {
    nimi: k.nimi,
    vari: k.varit.taivasYla,
    pomo: Boolean(k.pomo),
    pomonNimi: k.pomo ? (k.pomo.tyyppi === "magma" ? "MAGMAMÖRKÖ" : "ISÄUKKO") : "",
    pomoTyyppi: k.pomo ? k.pomo.tyyppi || "isaukko" : "",
  };
});

// Missä maailmassa kenttä i on? (0 = ensimmäinen maailma)
function maailmanNumero(i) {
  return MAAILMAT.findIndex((m) => i >= m.alku && i <= m.loppu);
}

// Nykyinen maailma: se, jossa ukko on kartalla
function nykyinenMaailma() {
  return MAAILMAT[maailmanNumero(kartanKohta)];
}

// Puut saarella (x, y). Tulivuorisaarella puiden paikalla on kiviä.
const PUUT = [
  { x: 85, y: 235 },
  { x: 225, y: 345 },
  { x: 330, y: 125 },
  { x: 470, y: 120 },
  { x: 605, y: 125 },
  { x: 410, y: 350 },
  { x: 320, y: 330 },
];

// ---------- KARTAN TOIMINTA ----------

// Kentän paikka kartalla. Jos paikkaa ei ole KARTTA-listassa, keksitään se.
function kentanPaikka(i) {
  return KARTTA[i] || { x: 120 + i * 200, y: 250 };
}

// Laskee pisteen kentän i ja kentän i+1 välisellä polulla.
// t = 0 on kentän i kohdalla, t = 1 on seuraavan kentän kohdalla.
// Polku kaartuu vuorotellen ylös ja alas (sitä kutsutaan Bezier-käyräksi).
function polunPiste(i, t) {
  const a = kentanPaikka(i);
  const b = kentanPaikka(i + 1);
  const mutka = i % 2 === 0 ? -60 : 60;
  const mx = (a.x + b.x) / 2; // mutkan kohta
  const my = (a.y + b.y) / 2 + mutka;
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * mx + t * t * b.x,
    y: u * u * a.y + 2 * u * t * my + t * t * b.y,
  };
}

function ukonPaikkaKartalla() {
  if (kartanKohde === null) return kentanPaikka(kartanKohta);
  if (kartanKohde > kartanKohta) return polunPiste(kartanKohta, kartanEdistys);
  return polunPiste(kartanKohde, 1 - kartanEdistys);
}

function naytaKarttaViesti(teksti) {
  karttaViesti = teksti;
  karttaViestiAika = 120;
}

// Siirrytään kartalle
function avaaKartta() {
  tila = "kartta";
  tallennaPeli(); // pelin eteneminen tallentuu aina kartalle tultaessa (peli.js)
  aloitaSiirtyma();
  kartanKohde = null;
  tulipallot = [];
}

// Ukko lähtee kävelemään seuraavaan (suunta = 1) tai edelliseen (suunta = -1) kenttään
function liikuKartalla(suunta) {
  if (tila !== "kartta" || kartanKohde !== null) return;
  const kohde = kartanKohta + suunta;
  if (kohde < 0 || kohde >= KENTAT.length) return;
  kartanSuunta = suunta;

  if (kohde > avattu) {
    naytaKarttaViesti("Lukossa! Läpäise ensin kenttä " + kohde);
    aanet.tyhja();
    return;
  }
  // Toiseen maailmaan siirrytään suoraan (ei kävellä meren yli)
  if (maailmanNumero(kohde) !== maailmanNumero(kartanKohta)) {
    kartanKohta = kohde;
    const m = nykyinenMaailma();
    naytaKarttaViesti("Maailma " + (maailmanNumero(kohde) + 1) + ": " + m.nimi);
    aloitaSiirtyma();
    aanet.valitallennus();
    return;
  }
  kartanKohde = kohde;
  kartanEdistys = 0;
}

// Välilyönti kartalla: aloitetaan kenttä, jonka kohdalla ukko seisoo
function valitseKartalta() {
  if (kartanKohde !== null) return; // ukko on vielä kävelemässä
  if (uusiKentta === kartanKohta) uusiKentta = -1;
  napit.Space = false; // ettei ukko hyppää heti, kun kenttä alkaa
  aloitaKentta(kartanKohta);
}

function paivitaKartta(dt) {
  if (karttaViestiAika > 0) karttaViestiAika -= dt;
  if (kartanKohde === null) return;

  kartanEdistys += 0.03 * dt; // kävelyn nopeus
  if (kartanEdistys >= 1) {
    kartanKohta = kartanKohde;
    kartanKohde = null;
    aanet.laskuri();
  }
}

// Laskee yhteen listan luvut, esim. [100, 200] -> 300
function summa(lista) {
  let yhteensa = 0;
  for (const luku of lista) yhteensa += luku || 0;
  return yhteensa;
}

// Muista kentistä saadut parhaat pisteet yhteensä
function muidenKenttienPisteet(numero) {
  let yhteensa = 0;
  for (let i = 0; i < parhaatPisteet.length; i++) {
    if (i !== numero) yhteensa += parhaatPisteet[i] || 0;
  }
  return yhteensa;
}

// ---------- KARTAN PIIRTÄMINEN ----------

function piirraKartta(aika) {
  const m = nykyinenMaailma();
  const tulivuori = m.tyyli === "tulivuori";

  // Meri
  const meri = ctx.createLinearGradient(0, 0, 0, canvas.height);
  meri.addColorStop(0, tulivuori ? "#2a1b3d" : "#2b7bc4");
  meri.addColorStop(1, tulivuori ? "#5a2a3a" : "#4fa8e0");
  ctx.fillStyle = meri;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  piirraAallot(aika);

  // Saari: ensin ranta, sitten maa sen päälle
  ctx.fillStyle = tulivuori ? "#6b5a50" : "#f2d98d";
  ctx.beginPath();
  ctx.ellipse(400, 235, 390, 152, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tulivuori ? "#3d302e" : "#7cc576";
  ctx.beginPath();
  ctx.ellipse(400, 235, 368, 134, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pomokentän taakse vuoret tai tulivuori
  for (let i = m.alku; i <= m.loppu; i++) {
    if (!KENTTIEN_TIEDOT[i].pomo) continue;
    if (tulivuori) piirraTulivuoriKartalla(kentanPaikka(i), aika);
    else piirraVuoret(kentanPaikka(i));
  }

  if (tulivuori) {
    piirraLaavajoet(aika);
    for (const kivi of m.kivet) piirraKarttaKivi(kivi.x, kivi.y);
  } else {
    for (const puu of PUUT) piirraPuu(puu.x, puu.y);
  }

  // Polut kenttien välillä. Lukittu polku on harmaa.
  for (let i = m.alku; i < m.loppu; i++) {
    piirraPolku(i, i + 1 <= avattu);
  }

  for (let i = m.alku; i <= m.loppu; i++) piirraKenttaPallo(i, aika);

  // Nuoli toiseen maailmaan
  const mNro = MAAILMAT.indexOf(m);
  if (mNro < MAAILMAT.length - 1 && avattu > m.loppu) {
    const p = kentanPaikka(m.loppu);
    reunaTeksti("→ Maailma " + (mNro + 2), p.x + 40, p.y + 50, 16, "left", "gold");
  }
  if (mNro > 0) {
    const p = kentanPaikka(m.alku);
    reunaTeksti("← Maailma " + mNro, p.x - 30, p.y + 50, 16, "left", "#ddd");
  }

  piirraUkkoKartalla(aika);
  piirraKartanTekstit(aika);
}

function piirraAallot(aika) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 24; i++) {
    const x = ((i * 137 + aika / 40) % 860) - 30;
    const y = 15 + ((i * 53) % 430);
    // Ei piirretä aaltoja saaren päälle
    const saarella = ((x - 400) / 400) ** 2 + ((y - 235) / 165) ** 2 < 1;
    if (saarella) continue;
    ctx.beginPath();
    ctx.arc(x, y, 7, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
}

// Laavajoet Tulivuorisaarella
function piirraLaavajoet(aika) {
  ctx.strokeStyle = "#ff6a00";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  const joet = [
    [[160, 120], [200, 170], [180, 240], [230, 300]],
    [[520, 110], [500, 170], [540, 240], [520, 330]],
  ];
  for (const joki of joet) {
    ctx.beginPath();
    joki.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
  }
  ctx.lineCap = "butt";
}

function piirraKarttaKivi(x, y) {
  ctx.fillStyle = "#5a4a48";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 8);
  ctx.lineTo(x - 8, y - 8);
  ctx.lineTo(x + 6, y - 10);
  ctx.lineTo(x + 14, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function piirraPuu(x, y) {
  ctx.fillStyle = "#8b5a2b"; // runko
  ctx.fillRect(x - 3, y, 6, 12);
  ctx.fillStyle = "#2f8f3a"; // latvus
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 6, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#4fbf5a"; // kiilto
  ctx.fillRect(x - 7, y - 13, 5, 5);
}

// Kolme vuorta kentän taakse. Vuorten huipuilla on lunta.
function piirraVuoret(paikka) {
  const vuoret = [
    { x: paikka.x - 55, korkeus: 95, leveys: 70 },
    { x: paikka.x + 50, korkeus: 85, leveys: 65 },
    { x: paikka.x, korkeus: 120, leveys: 80 },
  ];
  const pohja = paikka.y - 5;
  for (const v of vuoret) {
    const huippu = pohja - v.korkeus;
    ctx.fillStyle = "#6b5b8c";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(v.x - v.leveys, pohja);
    ctx.lineTo(v.x, huippu);
    ctx.lineTo(v.x + v.leveys, pohja);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Lumihuippu
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(v.x - v.leveys * 0.25, huippu + v.korkeus * 0.25);
    ctx.lineTo(v.x, huippu);
    ctx.lineTo(v.x + v.leveys * 0.25, huippu + v.korkeus * 0.25);
    ctx.closePath();
    ctx.fill();
  }
}

// Katkoviivapolku kahden kentän välillä
function piirraPolku(i, auki) {
  ctx.save();
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.setLineDash([2, 14]); // lyhyitä viivoja ja välejä = pisteitä
  ctx.strokeStyle = auki ? "#8b5a2b" : "rgba(80, 80, 80, 0.5)";
  ctx.beginPath();
  for (let t = 0; t <= 1.001; t += 0.05) {
    const p = polunPiste(i, t);
    if (t === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.restore();
}

function piirraKenttaPallo(i, aika) {
  const p = kentanPaikka(i);
  const valmis = parhaatPisteet[i] !== undefined;
  const auki = i <= avattu;
  const tiedot = KENTTIEN_TIEDOT[i];

  // Pomo nukkuu kenttänsä yläpuolella, kunnes se voitetaan
  if (tiedot.pomoTyyppi === "magma" && !valmis) {
    piirraMagmaKuvake(p.x, p.y - 50, aika);
    if (auki) {
      const z = Math.floor(aika / 400) % 3;
      reunaTeksti("z".repeat(z + 1), p.x - 40, p.y - 76 - z * 6, 16, "left");
    }
  } else if (tiedot.pomo && !valmis) {
    ctx.drawImage(kuvat.isaukko, 8 * 64, 0, 64, 64, p.x - 40, p.y - 92, 80, 80);
    if (auki) {
      const z = Math.floor(aika / 400) % 3;
      reunaTeksti("z".repeat(z + 1), p.x - 62, p.y - 66 - z * 6, 16, "left");
    }
  }

  // Juuri avattu kenttä sykkii
  if (i === uusiKentta) {
    const kasvu = (aika / 25) % 30;
    ctx.strokeStyle = "rgba(255, 215, 0, " + (1 - kasvu / 30) + ")";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 26 + kasvu, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Varjo
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 22, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Iso pallo: kultainen = läpäisty, punainen = auki, harmaa = lukossa
  ctx.fillStyle = valmis ? "gold" : auki ? "#e63946" : "#888";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pieni pallo kentän taivaan värillä
  ctx.fillStyle = auki ? tiedot.vari : "#666";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (auki) {
    reunaTeksti(String(i + 1), p.x, p.y + 8, 22, "center");
  } else {
    piirraLukko(p.x, p.y);
  }

  // Läpäistyn kentän vieressä liehuu lippu
  if (valmis) {
    const ruutu = Math.floor(aika / 300) % 2;
    ctx.drawImage(kuvat.lippu, ruutu * 16, 0, 16, 32, p.x + 12, p.y - 54, 24, 48);
  }
}

function piirraLukko(x, y) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y - 3, 6, Math.PI, 0); // lukon kaari
  ctx.stroke();
  ctx.fillStyle = "#ddd";
  ctx.fillRect(x - 9, y - 3, 18, 13);
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 9, y - 3, 18, 13);
  ctx.fillStyle = "black";
  ctx.fillRect(x - 1, y + 1, 2, 5); // avaimenreikä
}

function piirraUkkoKartalla(aika) {
  const p = ukonPaikkaKartalla();
  const kavelee = kartanKohde !== null;
  const ruutu = kavelee ? Math.floor(aika / 150) % 2 : 0;
  // Ukko seisoo pallon yläpuolella, ettei peitä kentän numeroa
  const jalat = kavelee ? p.y - 4 : p.y - 20;

  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(p.x, jalat, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Kuvassa ukon vartalon keskikohta on sarakkeessa 15, jalat rivillä 26
  piirraRuutu(kuvat.ukko, ruutu, 32, 32, p.x - 15 * ZOOM, jalat - 26 * ZOOM, kartanSuunta === 1);
}

function piirraKartanTekstit(aika) {
  const mNro = maailmanNumero(kartanKohta);
  reunaTeksti("Maailma " + (mNro + 1) + ": " + MAAILMAT[mNro].nimi, canvas.width / 2, 40, 28, "center");
  reunaTeksti("Pisteet: " + pisteet, 12, 30, 20, "left", "gold");
  for (const pl of pelaajat) piirraElamat(pl, (pl.numero - 1) * 40);

  if (karttaViestiAika > 0) {
    ctx.globalAlpha = Math.min(1, karttaViestiAika / 20);
    reunaTeksti(karttaViesti, canvas.width / 2, 75, 22, "center", "gold");
    ctx.globalAlpha = 1;
  }

  // Tietolaatikko alareunassa: kenttä, jonka kohdalla ukko on
  const i = kartanKohde !== null ? kartanKohde : kartanKohta;
  const tiedot = KENTTIEN_TIEDOT[i];
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(170, 372, 460, 72);
  reunaTeksti("Kenttä " + (i + 1) + ": " + tiedot.nimi, canvas.width / 2, 397, 22, "center");

  let alarivi = "Ei vielä läpäisty";
  if (parhaatPisteet[i] !== undefined) alarivi = "Paras: " + parhaatPisteet[i] + " pistettä";
  else if (tiedot.pomo) alarivi = "Varo: täällä nukkuu " + tiedot.pomonNimi + "!";
  reunaTeksti(alarivi, canvas.width / 2, 418, 16, "center", "gold");

  if (Math.floor(aika / 500) % 2 === 0) {
    reunaTeksti(ohje("← → liiku     VÄLILYÖNTI pelaa", "◀ ▶ liiku     NAPAUTA pelaa"), canvas.width / 2, 438, 15, "center");
  }
}
