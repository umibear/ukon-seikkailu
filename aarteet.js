// ==========================================
//   AARTEET JA SALAKUOPAT
//   Jokaisessa kentässä on yksi SALAKUOPPA. Se näyttää aivan tavalliselta
//   kuopalta, laavalta tai hyiseltä vedeltä. Mutta kun siihen putoaa, ei
//   menetäkään elämää, vaan putoaa salaiseen AARREKAMMIOON!
//   - Kammiossa odottaa aarre (timantti) ja sydän. Ulos pääsee oikean reunan aukosta.
//   - Pieni vihje: salakuopan suulla välähtää silloin tällöin tähti.
//   - Aavikolla salakuoppa on juoksuhiekkaa: siihen pitää upota kokonaan!
//   - Kun kaikkien kenttien aarteet on löydetty, Ukosta tulee KULTAINEN.
//   Kokeile itse: siirrä salakuoppa toiseen kuoppaan muuttamalla lukuja listassa SALAKUOPAT.
// ==========================================

const PISTEET_AARRE = 1000;
const KAMMION_X = -1600; // kammio on kaukana kentän vasemmalla puolella, missä sitä ei muuten näe
const KAMMION_LEVEYS = 800; // tasan yhden ruudun levyinen
const KUOPAN_SYVYYS = 422; // kun ukon jalat ovat tätä alempana, se on pudonnut kuoppaan
const VIHJEEN_VALI = 2800; // kuinka usein tähti välähtää salakuopassa (1000 = 1 s)

// Jokaisen kentän salakuoppa. Järjestys on sama kuin KENTAT-listassa.
//   x ja leveys = mikä kohta kuopasta on salainen (leveässä kuopassa vain pieni osa!)
//   ulos        = (vapaaehtoinen) mihin ukko palaa kammiosta. Jos sitä ei ole,
//                 ukko palaa kuopan oikealle reunalle.
const SALAKUOPAT = [
  // Maailma 1: Vihreä saari
  { x: 1000, leveys: 80 },
  { x: 3000, leveys: 80 },
  { x: 1725, leveys: 80, ulos: { x: 1530, y: 370 } }, // liikkuvien tasojen välissä
  { x: 2080, leveys: 80, ulos: { x: 1900, y: 370 } }, // keskellä isoa kuilua
  { x: 680, leveys: 80 },
  // Maailma 2: Tulivuorisaari (laavan alla!)
  { x: 1270, leveys: 70 },
  { x: 2730, leveys: 70 },
  { x: 2840, leveys: 60, ulos: { x: 2780, y: 250 } }, // kahden tason välissä
  { x: 1700, leveys: 60 },
  { x: 540, leveys: 60, ulos: { x: 250, y: 370 } }, // putoavien tasojen välissä
  { x: 570, leveys: 60 },
  // Maailma 3: Pakkassaari (avannossa!)
  { x: 2900, leveys: 100 },
  { x: 2120, leveys: 100 },
  { x: 1830, leveys: 70 },
  { x: 1300, leveys: 180 },
  { x: 2500, leveys: 180 },
  { x: 830, leveys: 60 },
  // Maailma 4: Aavikkosaari (juoksuhiekassa! syvyys = kuinka syvälle pitää upota)
  { x: 2472, leveys: 80, syvyys: 452 },
  { x: 952, leveys: 80, syvyys: 452 },
  { x: 2300, leveys: 78, syvyys: 452, ulos: { x: 2395, y: 350 } }, // kangastussillan alla
  { x: 2932, leveys: 66, syvyys: 452 },
  { x: 3440, leveys: 72, syvyys: 452 },
  { x: 580, leveys: 70, syvyys: 452 },
];

// Kammion värit maailman mukaan: tausta, takaseinän kivet ja seinässä tuikkivat kiteet
const KAMMION_VARIT = [
  { tausta: "#241a12", kivi: "#30231a", kide: "#7be36f" }, // Vihreä saari: multaluola
  { tausta: "#260f0b", kivi: "#3a1711", kide: "#ff9a3c" }, // Tulivuorisaari: laavaluola
  { tausta: "#0e1d30", kivi: "#16304a", kide: "#9fe8ff" }, // Pakkassaari: jääluola
  { tausta: "#2b1e0c", kivi: "#3d2b12", kide: "#ffd23c" }, // Aavikkosaari: hautakammio
];

let aarteet = []; // aarteet[kentän numero] = true, kun sen aarre on löydetty (tallennetaan, peli.js)
let kammiossa = false; // true = ukko on juuri nyt aarrekammiossa
let kammioAika = 0; // kuinka kauan kammiossa on oltu (60 = 1 s)

function aarteitaLoydetty() {
  return aarteet.filter((loydetty) => loydetty).length;
}

function kaikkiAarteetLoydetty() {
  return aarteitaLoydetty() >= SALAKUOPAT.length;
}

// Laittaa kenttään salakuopan ja rakentaa aarrekammion (vaikea.js: luoKentta)
function lisaaAarre(k, numero) {
  const kuoppa = SALAKUOPAT[numero];
  if (!kuoppa) return;

  // Mihin kammiosta palataan? Kuopan oikealle reunalle, sen maan päälle.
  let ulos = kuoppa.ulos;
  if (!ulos) {
    const ulosX = kuoppa.x + kuoppa.leveys + 8;
    let lattia = 410;
    for (const t of k.tasot) {
      const alla = t.x <= ulosX && t.x + t.leveys >= ulosX + 20 && t.y + t.korkeus >= 449;
      if (alla && t.y < lattia) lattia = t.y;
    }
    ulos = { x: ulosX, y: lattia - 40 };
  }
  // Kivi, jolle kammiosta palataan, ei saa vajota ukon alta (vaikealla, aavikko.js)
  for (const t of k.tasot) {
    if (t.vajoaa && ulos.x + 10 > t.x && ulos.x + 10 < t.x + t.leveys) t.vajoaa = false;
  }
  k.salakuoppa = {
    x: kuoppa.x,
    leveys: kuoppa.leveys,
    syvyys: kuoppa.syvyys || KUOPAN_SYVYYS, // kun ukon jalat ovat tätä alempana, se on pudonnut
    ulosX: ulos.x,
    ulosY: ulos.y,
  };

  // Kammio on huone: lattia, katto ja seinät. Oikeassa seinässä on alhaalla
  // aukko, josta pääsee ulos. Aarteen saa, kun vain kävelee sen läpi.
  const x = KAMMION_X;
  k.tasot.push({ x: x, y: 410, leveys: KAMMION_LEVEYS, korkeus: 40 }); // lattia
  k.tasot.push({ x: x, y: -32, leveys: KAMMION_LEVEYS, korkeus: 72 }); // katto
  k.tasot.push({ x: x, y: -32, leveys: 40, korkeus: 442 }); // vasen seinä
  k.tasot.push({ x: x + 760, y: -32, leveys: 40, korkeus: 322 }); // oikea seinä (aukko alla)
  if (!k.sydamet) k.sydamet = [];
  k.sydamet.push({ x: x + 590, y: 372 });
  k.aarre = { x: x + 398, y: 366, leveys: 24, korkeus: 24, keratty: false };
}

// ---------- KAMMIOON JA TAKAISIN ----------

// Kutsutaan, kun ukko on liikkunut (peli.js: paivitaPelaaja). pelaaja = se, jota käsitellään.
// Palauttaa true, jos ukko putosi salakuoppaan. Silloin se EI menetä elämää.
function putosiSalakuoppaan() {
  const s = kentta.salakuoppa;
  if (!s || kammiossa) return false;
  const keski = pelaaja.x + pelaaja.leveys / 2;
  if (keski < s.x || keski > s.x + s.leveys) return false; // ei salaisessa kohdassa
  if (pelaaja.y + pelaaja.korkeus < s.syvyys) return false; // ei vielä tarpeeksi syvällä

  kammiossa = true;
  kammioAika = 0;
  // Kaikki pelaajat (myös haamu) putoavat kammioon katon aukosta
  let paikka = KAMMION_X + 140;
  for (const pl of pelaajat) {
    nollaaLiike(pl);
    pl.x = paikka;
    pl.y = 45;
    pl.turvaX = paikka;
    pl.turvaY = 370;
    paikka += 30;
  }
  tulipallot = [];
  kameraX = KAMMION_X;
  aloitaSiirtyma(); // ruutu aukeaa mustasta (tehosteet.js)
  aanet.salaisuus();
  return true;
}

function poistuKammiosta() {
  const s = kentta.salakuoppa;
  kammiossa = false;
  let paikka = s.ulosX;
  for (const pl of pelaajat) {
    nollaaLiike(pl);
    pl.x = paikka;
    pl.y = s.ulosY;
    pl.turvaX = paikka;
    pl.turvaY = s.ulosY;
    if (!pl.haamu) pl.suojaAika = Math.max(pl.suojaAika, 90); // hetki suojaa, jos vihu sattuu olemaan vieressä
    // Ukko seisoo paikallaan, kunnes napit nostetaan ylös. Muuten se juoksisi
    // suoraan seuraavaan kuoppaan, koska oikea nappi on vielä pohjassa.
    pl.odotaNostoa = true;
    paikka += 24;
  }
  tulipallot = [];
  kameraHyppaa = true;
  aloitaSiirtyma();
}

// Kammiossa kenttä odottaa ylhäällä paikallaan: vain pelaajat liikkuvat (peli.js: paivita)
function paivitaKammio(dt) {
  kammioAika += dt;
  for (const pl of pelaajat) {
    pelaaja = pl;
    if (pl.haamu) paivitaHaamu(dt);
    else paivitaPelaaja(dt);
  }
  paivitaTulipallot(dt);
  for (const pl of elavatPelaajat()) {
    pelaaja = pl;
    keraaAsiat(); // sydän
    keraaAarre();
    if (pl.x > KAMMION_X + KAMMION_LEVEYS - 30) {
      poistuKammiosta(); // käveltiin ulos oikean reunan aukosta
      return;
    }
  }
}

function keraaAarre() {
  const a = kentta.aarre;
  if (!a || a.keratty || !osuu(pelaaja, a)) return;
  a.keratty = true;
  const uusi = !aarteet[kenttaNumero];
  aarteet[kenttaNumero] = true;
  pisteet += PISTEET_AARRE;
  aanet.ennatys();
  lisaaHiukkasia(a.x + 12, a.y + 12, 40, ["#9ff5ff", "white", "#ffe98a", "#5ad1e6"], 5);
  lisaaTeksti(a.x + 12, a.y - 8, "AARRE! +" + PISTEET_AARRE);
  if (uusi) {
    tallennaPeli(); // löytö jää muistiin heti, vaikka kenttä jäisi kesken
    const puuttuu = SALAKUOPAT.length - aarteitaLoydetty();
    const viesti = puuttuu > 0 ? "VIELÄ " + puuttuu + " AARRETTA PIILOSSA" : "KAIKKI AARTEET! UKKO ON KULTAINEN!";
    lisaaTeksti(a.x + 12, a.y - 36, viesti);
  }
}

// ---------- PIIRTÄMINEN ----------

// Timantti: kärki alaspäin, vaalea kiilto
function piirraTimantti(x, y, koko, vari, kiilto) {
  ctx.fillStyle = vari;
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + koko * 0.22, y);
  ctx.lineTo(x + koko * 0.78, y);
  ctx.lineTo(x + koko, y + koko * 0.35);
  ctx.lineTo(x + koko * 0.5, y + koko);
  ctx.lineTo(x, y + koko * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (kiilto) {
    ctx.fillStyle = kiilto;
    ctx.beginPath();
    ctx.moveTo(x + koko * 0.26, y + 2);
    ctx.lineTo(x + koko * 0.5, y + 2);
    ctx.lineTo(x + koko * 0.36, y + koko * 0.35);
    ctx.lineTo(x + koko * 0.1, y + koko * 0.35);
    ctx.closePath();
    ctx.fill();
  }
  ctx.lineJoin = "miter";
}

// Nelisakarainen tähti, joka välähtää (koko = sakaran pituus)
function piirraValahdys(x, y, koko) {
  if (koko <= 0) return;
  const kapea = koko * 0.22;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(x, y - koko);
  ctx.lineTo(x + kapea, y - kapea);
  ctx.lineTo(x + koko, y);
  ctx.lineTo(x + kapea, y + kapea);
  ctx.lineTo(x, y + koko);
  ctx.lineTo(x - kapea, y + kapea);
  ctx.lineTo(x - koko, y);
  ctx.lineTo(x - kapea, y - kapea);
  ctx.closePath();
  ctx.fill();
}

// Kammion takaseinä piirretään taivaan ja mäkien tilalle (peli.js: piirraMaailma)
function piirraKammionTausta(aika) {
  const varit = KAMMION_VARIT[maailmanNumero(kenttaNumero)] || KAMMION_VARIT[0];
  ctx.fillStyle = varit.tausta;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Kiviä takaseinässä. Paikat lasketaan kaavalla, joten ne ovat joka kerta samat.
  ctx.fillStyle = varit.kivi;
  for (let i = 0; i < 26; i++) {
    const x = (i * 137) % 800;
    const y = 50 + ((i * 89) % 340);
    const koko = 18 + ((i * 53) % 30);
    ctx.beginPath();
    ctx.ellipse(x, y, koko, koko * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Valokeila aukosta, josta pudottiin
  ctx.fillStyle = "rgba(255, 245, 200, 0.1)";
  ctx.beginPath();
  ctx.moveTo(120, 40);
  ctx.lineTo(190, 40);
  ctx.lineTo(270, 410);
  ctx.lineTo(50, 410);
  ctx.closePath();
  ctx.fill();

  // Kiteet tuikkivat seinässä
  for (let i = 0; i < 9; i++) {
    const x = 70 + ((i * 211) % 660);
    const y = 70 + ((i * 131) % 250);
    ctx.globalAlpha = 0.4 + Math.sin(aika / 400 + i * 2) * 0.3;
    piirraTimantti(x, y, 10 + (i % 3) * 3, varit.kide, null);
  }
  ctx.globalAlpha = 1;
}

// Piirtää salakuopan vihjeen ja kammion sisällön (peli.js: piirraMaailma)
function piirraAarre(aika) {
  const s = kentta.salakuoppa;
  if (!s) return;

  if (!kammiossa) {
    // Vihje: salakuopan suulla välähtää tähti, joka kerta vähän eri kohdassa
    const kohta = aika % VIHJEEN_VALI;
    if (kohta < 500 && naytolla(s.x, s.leveys)) {
      const kerta = Math.floor(aika / VIHJEEN_VALI);
      const x = s.x + s.leveys * (0.25 + 0.5 * ((kerta * 0.618) % 1));
      // Juoksuhiekassa tähti välähtää hiekan pinnalla, muuten vähän kuopan sisällä
      const y = s.syvyys > KUOPAN_SYVYYS ? 403 : 420 + (kerta % 3) * 5;
      piirraValahdys(x, y, Math.sin((kohta / 500) * Math.PI) * 8);
    }
    return;
  }

  // Uloskäynti: aukosta loistaa päivänvalo, ja nuoli näyttää tien
  const x = KAMMION_X;
  ctx.fillStyle = "rgba(255, 240, 180, 0.3)";
  ctx.fillRect(x + 760, 290, 40, 120);
  hehku(x + 785, 350, 80, "255, 240, 180", 0.5);
  reunaTeksti("ULOS →", x + 745 + Math.sin(aika / 200) * 4, 280, 16, "right", "#ffe98a");

  // Aarre keinuu pienen kivijalustan päällä (jalusta on vain koriste)
  const a = kentta.aarre;
  ctx.fillStyle = "#6b6157";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(a.x - 14, 410);
  ctx.lineTo(a.x - 6, 398);
  ctx.lineTo(a.x + 30, 398);
  ctx.lineTo(a.x + 38, 410);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (!a.keratty) {
    const keinunta = Math.sin(aika / 350) * 3;
    hehku(a.x + 12, a.y + 12 + keinunta, 34, "140, 240, 255", 0.6);
    piirraTimantti(a.x, a.y + keinunta, 24, "#5ad1e6", "#d9fbff");
    const tuike = (aika % 1200) / 1200;
    if (tuike < 0.3) piirraValahdys(a.x + 19, a.y + 4 + keinunta, Math.sin((tuike / 0.3) * Math.PI) * 6);
  }

  // Otsikko näkyy hetken, kun kammioon on pudottu
  if (kammioAika < 200) {
    ctx.globalAlpha = Math.min(1, (200 - kammioAika) / 40);
    reunaTeksti("SALAINEN AARREKAMMIO!", x + 400, 120, 30, "center", "#ffe98a");
    ctx.globalAlpha = 1;
  }
}

// Pieni timantti ruudun yläreunassa kolikoiden vieressä: harmaa = ei vielä löydetty
function piirraAarreTieto(x, y) {
  if (!kentta.aarre) return;
  const loydetty = aarteet[kenttaNumero] || kentta.aarre.keratty;
  if (loydetty) piirraTimantti(x, y, 20, "#5ad1e6", "#d9fbff");
  else piirraTimantti(x, y, 20, "rgba(120, 130, 140, 0.55)", null);
}

// ---------- KULTAINEN UKKO ----------
// Palkinto kaikista aarteista: ukon vihreät vaatteet muuttuvat kultaisiksi.
// Kuva tehdään kerran: jokainen vihreä pikseli vaihdetaan kullanväriseksi.
let kultaUkko = null;

function kultainenUkko() {
  if (kultaUkko) return kultaUkko;
  if (!kuvaValmis(kuvat.ukko)) return kuvat.ukko;
  kultaUkko = kuvat.ukko; // jos värien vaihto ei onnistu, käytetään tavallista kuvaa
  try {
    const c = uusiPiilocanvas(kuvat.ukko.width, kuvat.ukko.height);
    const cc = c.getContext("2d");
    cc.drawImage(kuvat.ukko, 0, 0);
    const data = cc.getImageData(0, 0, c.width, c.height);
    const p = data.data; // jokaisesta pikselistä neljä lukua: punainen, vihreä, sininen ja näkyvyys
    for (let i = 0; i < p.length; i += 4) {
      const vihrea = p[i + 1] > p[i] * 1.25 && p[i + 1] > p[i + 2] * 1.25;
      if (!vihrea) continue;
      const kirkkaus = p[i + 1];
      p[i] = Math.min(255, kirkkaus * 1.15);
      p[i + 1] = Math.min(255, kirkkaus * 0.95);
      p[i + 2] = kirkkaus * 0.15;
    }
    cc.putImageData(data, 0, 0);
    kultaUkko = c;
  } catch (virhe) {
    // Selain ei antanut lukea kuvaa (näin käy, jos peli avataan suoraan tiedostosta)
  }
  return kultaUkko;
}
