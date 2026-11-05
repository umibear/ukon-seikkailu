// ==========================================
//   VALMIIKSI PIIRRETYT KUVAT (nopeuttaa peliä)
//   Osa asioista on raskaita piirtää: liukuvärit, hehkut, laattatasot ja
//   kuvien värisuotimet (esim. palanut vihu tummaksi). Kännykkä hidastuu,
//   jos ne piirretään joka ruudulla alusta asti uudestaan.
//
//   Siksi ne piirretään KERRAN "piilocanvasille", joka muistetaan.
//   Sen jälkeen piilocanvas vain kopioidaan ruudulle, mikä on tosi nopeaa.
//   Ruudulla näyttää täsmälleen samalta kuin ennenkin!
// ==========================================

function uusiPiilocanvas(leveys, korkeus) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(leveys));
  c.height = Math.max(1, Math.ceil(korkeus));
  return c;
}

// Onko kuva jo ladattu? (Ladattavaa kuvaa ei voi vielä piirtää valmiiksi.)
function kuvaValmis(kuva) {
  return kuva && kuva.width > 0 && kuva.complete !== false;
}

// ---------- SUODATETUT KUVAT ----------
// Esim. suodatettu(kuvat.vihu, "brightness(0.2)") = melkein musta vihu.
// Suodin lasketaan vain kerran jokaiselle kuvalle.
const suodatetutKuvat = new Map();

function suodatettu(kuva, suodin) {
  if (!kuvaValmis(kuva)) return kuva;
  let valmiit = suodatetutKuvat.get(kuva);
  if (!valmiit) {
    valmiit = {};
    suodatetutKuvat.set(kuva, valmiit);
  }
  if (!valmiit[suodin]) {
    const c = uusiPiilocanvas(kuva.width, kuva.height);
    const cc = c.getContext("2d");
    if ("filter" in cc) {
      cc.filter = suodin;
      cc.drawImage(kuva, 0, 0);
    } else {
      // Selain ei osaa suotimia (esim. vanha iPhone): lasketaan värit itse
      cc.drawImage(kuva, 0, 0);
      suodataItse(cc, suodin);
    }
    valmiit[suodin] = c;
  }
  return valmiit[suodin];
}

// Harmaa (grayscale) ja kirkkaus (brightness) pikseli kerrallaan
function suodataItse(cc, suodin) {
  try {
    const data = cc.getImageData(0, 0, cc.canvas.width, cc.canvas.height);
    const p = data.data;
    const harmaa = suodin.includes("grayscale");
    const kirkkaus = suodin.match(/brightness\(([\d.]+)\)/);
    const kerroin = kirkkaus ? Number(kirkkaus[1]) : 1;
    for (let i = 0; i < p.length; i += 4) {
      let r = p[i], g = p[i + 1], b = p[i + 2];
      if (harmaa) r = g = b = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      p[i] = Math.min(255, r * kerroin);
      p[i + 1] = Math.min(255, g * kerroin);
      p[i + 2] = Math.min(255, b * kerroin);
    }
    cc.putImageData(data, 0, 0);
  } catch (virhe) {
    // ei onnistunut: kuva näkyy ilman suodinta
  }
}

// ---------- HEHKU ----------
// Pehmeä valopallo piirretään kerran jokaiselle värille ja koolle
const hehkuKuvat = new Map();

function hehkuKuva(vari, sade, voimakkuus) {
  const avain = vari + "|" + sade + "|" + voimakkuus;
  let c = hehkuKuvat.get(avain);
  if (!c) {
    if (hehkuKuvat.size > 300) hehkuKuvat.clear(); // ettei muisti täyty
    c = uusiPiilocanvas(sade * 2, sade * 2);
    const cc = c.getContext("2d");
    const liuku = cc.createRadialGradient(sade, sade, 0, sade, sade, sade);
    liuku.addColorStop(0, "rgba(" + vari + ", " + voimakkuus + ")");
    liuku.addColorStop(1, "rgba(" + vari + ", 0)");
    cc.fillStyle = liuku;
    cc.fillRect(0, 0, sade * 2, sade * 2);
    hehkuKuvat.set(avain, c);
  }
  return c;
}

// ---------- VALON LEIMA ----------
// Pimeissä kentissä valot "pyyhkivät" pimeyttä pois. Leima on musta
// pehmeä pallo, jota venytetään valon kokoiseksi.
const LEIMAN_SADE = 128;
let valoLeima = null;

function haeValoLeima() {
  if (!valoLeima) {
    valoLeima = uusiPiilocanvas(LEIMAN_SADE * 2, LEIMAN_SADE * 2);
    const cc = valoLeima.getContext("2d");
    const s = LEIMAN_SADE;
    const liuku = cc.createRadialGradient(s, s, 0, s, s, s);
    liuku.addColorStop(0, "rgba(0, 0, 0, 1)");
    liuku.addColorStop(1, "rgba(0, 0, 0, 0)");
    cc.fillStyle = liuku;
    cc.fillRect(0, 0, s * 2, s * 2);
  }
  return valoLeima;
}

// ---------- TASOT ----------
// Laatoista tehty taso piirretään kerran. Samankokoiset tasot käyttävät samaa kuvaa.
const tasoKuvat = new Map();

// Kännyköissä piilocanvas saa olla korkeintaan 4096 pikseliä leveä
const SUURIN_KUVA = 4096;

function tasonKuva(t) {
  if (t.leveys > SUURIN_KUVA || t.korkeus > SUURIN_KUVA) return null; // liian iso: piirretään laatoista
  const ylin = laattaKuva(true);
  const alempi = laattaKuva(false);
  if (!kuvaValmis(ylin) || !kuvaValmis(alempi)) return null;
  const avain = t.leveys + "x" + t.korkeus + "|" + ylin.src;
  let c = tasoKuvat.get(avain);
  if (!c) {
    if (tasoKuvat.size > 300) tasoKuvat.clear();
    c = uusiPiilocanvas(t.leveys, t.korkeus);
    const cc = c.getContext("2d");
    cc.imageSmoothingEnabled = false;
    const laatta = 16 * ZOOM;
    for (let y = 0; y < t.korkeus; y += laatta) {
      for (let x = 0; x < t.leveys; x += laatta) {
        cc.drawImage(y === 0 ? ylin : alempi, x, y, laatta, laatta);
      }
    }
    // Musta reunaviiva tason ympärille
    cc.strokeStyle = "black";
    cc.lineWidth = 2;
    cc.strokeRect(1, 1, t.leveys - 2, t.korkeus - 2);
    tasoKuvat.set(avain, c);
  }
  return c;
}

// ---------- TAIVAS ----------
// Liukuväri tehdään 1 pikselin levyisenä ja venytetään koko ruudun levyiseksi
const taivasKuvat = new Map();

function taivasKuva(yla, ala) {
  const avain = yla + "|" + ala;
  let c = taivasKuvat.get(avain);
  if (!c) {
    c = uusiPiilocanvas(1, canvas.height);
    const cc = c.getContext("2d");
    const liuku = cc.createLinearGradient(0, 0, 0, canvas.height);
    liuku.addColorStop(0, yla);
    liuku.addColorStop(1, ala);
    cc.fillStyle = liuku;
    cc.fillRect(0, 0, 1, canvas.height);
    taivasKuvat.set(avain, c);
  }
  return c;
}

// ---------- MÄET ----------
// Mäkirivi toistuu samanlaisena (mäkien väli on aina sama), joten
// piirretään kerran tarpeeksi pitkä rivi ja siirretään sitä.
const maetKuvat = new Map();

function maetKuva(vari, leveys, korkeus, vali) {
  const avain = vari + "|" + leveys + "|" + korkeus;
  let c = maetKuvat.get(avain);
  if (!c) {
    const maara = Math.ceil(canvas.width / vali) + 3; // montako mäkeä rivissä
    c = uusiPiilocanvas(leveys * 2 + (maara - 1) * vali, korkeus);
    const cc = c.getContext("2d");
    cc.fillStyle = vari;
    for (let i = 0; i < maara; i++) {
      cc.beginPath();
      cc.ellipse(leveys + i * vali, korkeus, leveys, korkeus, 0, 0, Math.PI * 2);
      cc.fill();
    }
    maetKuvat.set(avain, c);
  }
  return c;
}

// ---------- KAUKAISET KUUSET ----------
// Jokainen kuusi on eri korkuinen, joten piirretään kerralla pitkä pätkä kuusirivistä.
// Kun kamera menee pätkän ohi, piirretään uusi pätkä.
const KUUSIEN_VALI = 70;
const KUUSIEN_POHJA = 415;
const KUUSIEN_KORKEUS = 125; // korkein kuusi mahtuu tähän
const KUUSIA_KERRALLA = 56; // montako kuusta yhteen pätkään (58 * 70 = 4060 pikseliä)
let kuusiKuva = null; // { vari, alku, loppu, canvas }

function kuusenKoko(i) {
  // Math.sin antaa "satunnaisen" luvun, joka on samalle kuuselle aina sama
  const korkeus = 60 + Math.abs(Math.sin(i * 12.9898)) * 60;
  return { korkeus: korkeus, leveys: korkeus * 0.4 };
}

// Piirtää kuusen kohtaan x. pohja = kuusen alareuna.
function piirraKuusi(c, x, pohja, koko) {
  // Kuusi tehdään kolmesta päällekkäisestä kolmiosta
  for (let kerros = 0; kerros < 3; kerros++) {
    const alaosa = pohja - kerros * koko.korkeus * 0.28;
    const huippu = alaosa - koko.korkeus * 0.45;
    const l = koko.leveys * (1 - kerros * 0.25);
    c.beginPath();
    c.moveTo(x - l, alaosa);
    c.lineTo(x, huippu);
    c.lineTo(x + l, alaosa);
    c.closePath();
    c.fill();
  }
}

// Palauttaa kuusirivin, jossa ovat kuuset numeroista alku...loppu
function kuusetKuva(vari, alku, loppu) {
  const k = kuusiKuva;
  if (k && k.vari === vari && k.alku <= alku && k.loppu >= loppu) return k;
  // Tehdään uusi pätkä, joka alkaa vähän ennen ruudun vasenta reunaa
  const uusiAlku = alku - 5;
  const uusiLoppu = Math.max(loppu, uusiAlku + KUUSIA_KERRALLA);
  const c = uusiPiilocanvas((uusiLoppu - uusiAlku + 2) * KUUSIEN_VALI, KUUSIEN_KORKEUS);
  const cc = c.getContext("2d");
  cc.fillStyle = vari;
  for (let i = uusiAlku; i <= uusiLoppu; i++) {
    const x = (i - uusiAlku + 1) * KUUSIEN_VALI;
    piirraKuusi(cc, x, KUUSIEN_KORKEUS, kuusenKoko(i));
  }
  kuusiKuva = { vari: vari, alku: uusiAlku, loppu: uusiLoppu, canvas: c };
  return kuusiKuva;
}

// ---------- KENTÄN ALUSSA ----------
// Kun uusi valmiskuva tehdään ensimmäistä kertaa, selain joutuu siirtämään sen
// näytönohjaimelle, ja peli nykäisee hetken. Siksi kentän kaikki valmiskuvat
// tehdään heti kentän alussa, kun ruutu on vielä musta (ruudun vaihto).
function valmisteleKentanKuvat() {
  const valmiit = [];
  for (const t of kentta.tasot) if (!t.eiPiirreta) valmiit.push(tasonKuva(t));
  if (kentta.pomo && kentta.pomo.portti) valmiit.push(tasonKuva(kentta.pomo.portti));

  // Tausta (samat luvut kuin piirraTausta-funktiossa, peli.js)
  const varit = kentta.varit;
  valmiit.push(taivasKuva(varit.taivasYla, varit.taivasAla));
  valmiit.push(maetKuva(varit.maetKauka, 200, 160, 300));
  valmiit.push(maetKuva(varit.maetLahi, 170, 110, 300));
  if (varit.puut) valmiit.push(kuusetKuva(varit.puut, -1, -1).canvas);

  // Suodatetut kuvat: harmaa lippu, haamu ja palaneet vihut
  valmiit.push(suodatettu(kuvat.lippu, "grayscale(1)"));
  for (const kuva of [kuvat.ukko, kuvat.ukko2]) valmiit.push(suodatettu(kuva, "grayscale(1) brightness(1.8)"));
  const vihut = [kuvat.vihu, kuvat.lentovihu, kuvat.piikkis, kuvat.pomppija, kuvat.tippuja, kuvat.ryomija];
  for (const kuva of vihut.concat(Object.values(tulivihuKuvat))) valmiit.push(suodatettu(kuva, "brightness(0.2)"));
  if (kentta.pomo) valmiit.push(suodatettu(kuvat.isaukko, "brightness(2.5)"));

  // Myös pelin kuvatiedostot (ukko, vihut, kolikot...): selain avaa kuvan
  // vasta, kun sitä piirretään ensimmäisen kerran.
  for (const kokoelma of [kuvat, tulikuvat, tulivihuKuvat]) {
    for (const kuva of Object.values(kokoelma)) if (kuvaValmis(kuva)) valmiit.push(kuva);
  }

  // Piirretään jokaisesta yksi pikseli: silloin selain siirtää kuvan näytönohjaimelle jo nyt.
  // (Seuraava ruutu piirtyy tämän päälle, joten pikseliä ei koskaan näe.)
  for (const c of valmiit) if (c && c.width) ctx.drawImage(c, 0, 0, 1, 1, 0, 0, 1, 1);
}
