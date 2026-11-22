// ==========================================
//   TEHOSTEET
//   Asioita, jotka eivät muuta pelaamista, mutta tekevät pelistä
//   hienomman näköisen:
//   - ruudun vaihto (musta ympyrä sulkeutuu ja aukeaa)
//   - sää: lumi, sade ja tähdet
//   - pimeys ja valot
//   - hehku tulipalloille ja kolikoille
//   - kaukaiset kuuset taustalla
//   Ukon venyminen ja pehmeä kamera ovat peli.js-tiedostossa.
// ==========================================

const KAMERAN_ENNAKKO = 80; // kuinka paljon kamera katsoo eteenpäin juoksusuuntaan
const KAMERAN_PEHMEYS = 0.08; // kuinka nopeasti kamera seuraa (1 = heti, pieni = pehmeästi)

// ---------- RUUDUN VAIHTO ----------
// Kun kenttä alkaa tai siirrytään kartalle, ruutu on ensin musta, ja
// keskeltä aukeaa kasvava ympyrä (vähän kuin kameran linssi).
let siirtyma = 0; // 1 = ruutu on kokonaan musta, 0 = ympyrä on kokonaan auki

function aloitaSiirtyma() {
  siirtyma = 1;
}

// Missä kohtaa ruutua ympyrän keskikohta on
function siirtymanKeskus() {
  if (tila === "kartta") return ukonPaikkaKartalla();
  if (tila === "peli") {
    const p = elavatPelaajat()[0] || pelaaja1;
    return { x: p.x + p.leveys / 2 - kameraX, y: p.y + 20 };
  }
  return { x: canvas.width / 2, y: canvas.height / 2 };
}

function piirraSiirtyma() {
  if (siirtyma <= 0) return;
  const keskus = siirtymanKeskus();
  // (1 - siirtyma) kasvaa 0:sta 1:een. Kertomalla sen itsellään
  // ympyrä aukeaa ensin hitaasti ja sitten nopeasti.
  const auki = 1 - siirtyma;
  const sade = auki * auki * 900;

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.arc(keskus.x, keskus.y, sade, 0, Math.PI * 2);
  ctx.fill("evenodd"); // "evenodd" jättää ympyrän kohdalle reiän
}

// ---------- SÄÄ ----------
let saaHiukkaset = []; // lumihiutaleet ja sadepisarat
let tahdet = []; // tähdet taivaalla

function onSaata(nimi) {
  return Boolean(kentta && kentta.saa && kentta.saa.includes(nimi));
}

// Tehdään kentän alussa uudet hiutaleet, pisarat ja tähdet
function aloitaSaa() {
  saaHiukkaset = [];
  tahdet = [];

  if (onSaata("lumi")) {
    for (let i = 0; i < 80; i++) {
      saaHiukkaset.push({
        tyyppi: "lumi",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        nopeus: 0.4 + Math.random() * 1.2,
        koko: 2 + Math.floor(Math.random() * 3),
        vaihe: Math.random() * 100, // hiutaleet heiluvat eri tahdissa
      });
    }
  }
  if (onSaata("sade")) {
    for (let i = 0; i < 120; i++) {
      saaHiukkaset.push({
        tyyppi: "sade",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        nopeus: 8 + Math.random() * 4,
      });
    }
  }
  if (onSaata("kipinat")) {
    // Tulivuoren kipinät nousevat ylöspäin
    for (let i = 0; i < 50; i++) {
      saaHiukkaset.push({
        tyyppi: "kipina",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        nopeus: 0.4 + Math.random() * 1,
        koko: 2 + Math.floor(Math.random() * 2),
        vaihe: Math.random() * 100,
      });
    }
  }
  if (onSaata("tahdet")) {
    for (let i = 0; i < 70; i++) {
      tahdet.push({
        x: Math.random() * canvas.width * 2,
        y: Math.random() * 260,
        koko: Math.random() < 0.2 ? 3 : 2,
        vaihe: Math.random() * 100, // tähdet tuikkivat eri tahdissa
      });
    }
  }
}

function paivitaSaa(dt) {
  for (const h of saaHiukkaset) {
    if (h.tyyppi === "kipina") {
      h.y -= h.nopeus * dt;
      h.vaihe += 0.05 * dt;
      h.x += Math.sin(h.vaihe) * 0.6 * dt;
      if (h.y < -10) {
        h.y = canvas.height + 5;
        h.x = Math.random() * canvas.width;
      }
      continue;
    }
    if (h.tyyppi === "lumi") {
      h.y += h.nopeus * dt;
      h.vaihe += 0.03 * dt;
      h.x += Math.sin(h.vaihe) * 0.5 * dt; // lumi leijailee sivuttain
    } else {
      h.y += h.nopeus * dt;
      h.x += 1.5 * dt; // sade tulee vähän vinosti
    }
    // Ruudun alareunasta takaisin yläreunaan
    if (h.y > canvas.height) {
      h.y = -10;
      h.x = Math.random() * canvas.width;
    }
  }
}

// Tähdet piirretään taivaalle, ennen aurinkoa ja mäkiä
function piirraTahdet(aika) {
  for (const t of tahdet) {
    // Tähdet liikkuvat kameran mukana tosi vähän, koska ne ovat kaukana
    let x = (t.x - kameraX * 0.05) % (canvas.width * 2);
    if (x < 0) x += canvas.width * 2;
    if (x > canvas.width) continue;
    ctx.globalAlpha = 0.5 + Math.sin(aika / 300 + t.vaihe) * 0.5; // tuikkii
    ctx.fillStyle = "white";
    ctx.fillRect(x, t.y, t.koko, t.koko);
  }
  ctx.globalAlpha = 1;
}

const KIPINAN_VARIT = [
  "rgba(255, 80, 0, 0.8)",
  "rgba(255, 110, 0, 0.8)",
  "rgba(255, 140, 0, 0.8)",
  "rgba(255, 170, 0, 0.8)",
  "rgba(255, 200, 0, 0.8)",
];

// Lumi ja sade piirretään kaiken päälle
function piirraSaa() {
  if (kammiossa) return; // aarrekammioon ei sada (aarteet.js)
  // Kaikki sadepisarat piirretään yhdellä kertaa (nopeampaa kuin yksi kerrallaan)
  let sataa = false;
  ctx.beginPath();
  for (let i = 0; i < saaHiukkaset.length; i++) {
    if (kevytTila && i % 2 === 1) continue; // hidas kännykkä: joka toinen hiutale riittää
    const h = saaHiukkaset[i];
    // Lähellä oleva lumi liikkuu kameran mukana vähän (parallaksi)
    let x = (h.x - kameraX * 0.6) % canvas.width;
    if (x < 0) x += canvas.width;

    if (h.tyyppi === "kipina") {
      // Kipinä hehkuu keltaisen ja punaisen välillä (värit ovat valmiina listassa)
      ctx.fillStyle = KIPINAN_VARIT[Math.floor((Math.sin(h.vaihe) + 1) * 2.49)];
      ctx.fillRect(x, h.y, h.koko, h.koko);
    } else if (h.tyyppi === "lumi") {
      ctx.fillStyle = "white";
      ctx.fillRect(x, h.y, h.koko, h.koko);
    } else {
      ctx.moveTo(x, h.y);
      ctx.lineTo(x - 3, h.y - 12);
      sataa = true;
    }
  }
  if (sataa) {
    ctx.strokeStyle = "rgba(170, 200, 255, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ---------- KAUKAISET KUUSET ----------
// Rivi kuusia mäkien edessä. Ne liikkuvat hitaammin kuin kenttä,
// joten ne näyttävät olevan kaukana.
function piirraKuuset(vari) {
  if (!vari) return;
  const vali = KUUSIEN_VALI;
  const nopeus = 0.7;
  const siirto = kameraX * nopeus;
  const ensimmainen = Math.floor(siirto / vali) - 1;
  const viimeinen = ensimmainen + Math.ceil(canvas.width / vali) + 3;

  // Kuusirivi on piirretty valmiiksi (valmiskuvat.js). Kopioidaan siitä
  // ruudun levyinen pala oikeasta kohdasta.
  const rivi = kuusetKuva(vari, ensimmainen, viimeinen);
  let kohta = siirto - (rivi.alku - 1) * vali; // missä kohtaa riviä ruudun vasen reuna on
  if (kevytTila) kohta = Math.round(kohta); // hidas kännykkä: kokonaisin pikselein (nopeampaa)
  ctx.imageSmoothingEnabled = !kevytTila; // kuuset liukuvat pehmeästi
  ctx.drawImage(
    rivi.canvas,
    kohta, 0, canvas.width, KUUSIEN_KORKEUS, // mistä kohtaa riviä
    0, KUUSIEN_POHJA - KUUSIEN_KORKEUS, canvas.width, KUUSIEN_KORKEUS, // mihin ruudulle
  );
  ctx.imageSmoothingEnabled = false;
}

// ---------- HEHKU ----------
// Piirtää pehmeän valopallon. vari on muotoa "255, 140, 0" (punainen, vihreä, sininen).
// Valopallo on piirretty valmiiksi (valmiskuvat.js), joten se vain kopioidaan.
function hehku(x, y, sade, vari, voimakkuus) {
  if (sade <= 0 || voimakkuus <= 0 || kevytTila) return; // hitaalla kännykällä hehkut jätetään pois
  // Jokaisesta väristä on yksi valmis kuva. Koko tulee venyttämällä ja
  // voimakkuus läpinäkyvyydellä, joten uusia kuvia ei tarvitse tehdä kesken pelin.
  const valmis = hehkuKuva(vari);
  const vanha = ctx.globalCompositeOperation;
  const vanhaAlpha = ctx.globalAlpha;
  ctx.globalCompositeOperation = "lighter"; // valot lisätään päälle, eivät peitä
  ctx.globalAlpha = vanhaAlpha * Math.min(1, voimakkuus);
  ctx.drawImage(valmis, x - sade, y - sade, sade * 2, sade * 2);
  ctx.globalAlpha = vanhaAlpha;
  ctx.globalCompositeOperation = vanha;
}

// ---------- PIMEYS JA VALOT ----------
// Pimeys piirretään erilliselle "piilocanvasille". Siihen leikataan
// reikiä valojen kohdalle, ja lopuksi se piirretään pelin päälle.
// Pimeys lasketaan puolella tarkkuudella ja venytetään ruudun kokoiseksi.
// Valot ovat pehmeitä, joten eroa ei näe, mutta kännykällä se on 4 kertaa nopeampaa.
const PIMEYDEN_TARKKUUS = 0.5;
let pimeysCanvas = null;

function piirraPimeys(aika) {
  if (!kentta.pimeys || kammiossa) return; // aarrekammiossa on oma valonsa (aarteet.js)
  if (!pimeysCanvas) {
    pimeysCanvas = document.createElement("canvas");
    pimeysCanvas.width = canvas.width * PIMEYDEN_TARKKUUS;
    pimeysCanvas.height = canvas.height * PIMEYDEN_TARKKUUS;
  }
  const pc = pimeysCanvas.getContext("2d");
  // Piirretään samoilla koordinaateilla kuin isolle ruudulle, pienennettynä
  pc.setTransform(PIMEYDEN_TARKKUUS, 0, 0, PIMEYDEN_TARKKUUS, 0, 0);
  pc.globalCompositeOperation = "copy"; // "copy" korvaa vanhan kuvan kokonaan
  pc.fillStyle = "rgba(5, 0, 25, " + kentta.pimeys + ")";
  pc.fillRect(0, 0, canvas.width, canvas.height);

  // "destination-out" pyyhkii pimeyttä pois valojen kohdalta
  pc.globalCompositeOperation = "destination-out";
  // Valo on valmiiksi piirretty pehmeä pallo (valmiskuvat.js), joka venytetään oikean kokoiseksi
  const leima = haeValoLeima();
  // Leima on jo valmiiksi pehmeä, joten sitä ei tarvitse pehmentää uudestaan (nopeampaa)
  pc.imageSmoothingEnabled = false;
  const valo = (x, y, sade) => {
    const ruutuX = x - kameraX;
    if (ruutuX + sade < 0 || ruutuX - sade > canvas.width || sade <= 0) return; // ei näy ruudulla
    pc.drawImage(leima, ruutuX - sade, y - sade, sade * 2, sade * 2);
  };

  for (const pl of pelaajat) {
    valo(pl.x + pl.leveys / 2, pl.y + 20, pl.haamu ? 60 : 170); // haamu hohtaa vähän
  }
  for (const t of tulipallot) {
    const lepatus = Math.sin(aika / 40 + t.x) * 8; // tulen valo lepattaa
    valo(t.x + 8, t.y + 8, 110 + lepatus);
  }
  for (const k of kentta.kolikot) {
    if (!k.keratty && !piilossaLuolassa(k)) valo(k.x + 10, k.y + 10, 40);
  }
  for (const sydan of kentta.sydamet) {
    if (!sydan.keratty && !piilossaLuolassa(sydan)) valo(sydan.x + 13, sydan.y + 12, 50);
  }
  tulivuoriValot(valo); // laava ja liekit valaisevat (tulivuori.js)
  ruutiValot(valo); // palavat langat ja räjähdykset (ruuti.js)
  pakkasValot(valo); // nuotiot ja jää (pakkanen.js)
  if (kentta.valitallennus.aktiivinen) {
    valo(kentta.valitallennus.x + 10, kentta.valitallennus.y + 20, 90);
  }

  // Venytetään ruudun kokoiseksi ilman pehmennystä. Pimeyden "pikselit" ovat
  // samankokoisia kuin pelin muutkin pikselit (ZOOM), ja valot ovat niin pehmeitä,
  // ettei eroa huomaa. Tämä oli pimeiden kenttien raskain piirto: nyt kolme kertaa nopeampi.
  ctx.drawImage(pimeysCanvas, 0, 0, canvas.width, canvas.height);
}

// ---------- PÄIVITYS ----------
function paivitaTehosteet(dt) {
  if (siirtyma > 0) siirtyma = Math.max(0, siirtyma - 0.03 * dt);
  paivitaSaa(dt);

  // Ukon venytys palautuu pikkuhiljaa normaaliksi
  for (const pl of pelaajat) pl.venytys -= pl.venytys * Math.min(1, 0.2 * dt);
}
