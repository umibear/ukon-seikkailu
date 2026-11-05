// ==========================================
//   TULIVUORI
//   Maailma 2:n jutut:
//   - laava (kuuma! siihen ei saa pudota)
//   - liekkisuihkut, jotka syttyvät ja sammuvat vuorotellen
//   - tykit, jotka ampuvat kuulia
//   - laavapallot, jotka hyppäävät ylös laavasta
//   - pomo Magmamörkö
// ==========================================

const LAAVAPALLON_JAKSO = 130; // kuinka usein laavapallo hyppää (60 = 1 s)
const TYKIN_JAKSO = 150; // kuinka usein tykki ampuu
const KUULAN_NOPEUS = 3.5; // kuinka nopeasti tykinkuula lentää
const PISTEET_KUULA = 100; // tykinkuulan päälle hyppäämisestä
const SUIHKUN_JAKSO = 180; // kuinka usein liekkisuihku syttyy
const MAGMAN_ELAMAT = 24; // montako osumaa Magmamörkö kestää
const MAGMAN_JAAHTYMINEN = 210; // kuinka kauan Magmamörkö on jäähtynyt hyökkäyksen jälkeen
const MAGMAN_KUUMENEMINEN = 40; // kuinka kauan kuumeneminen kestää (silloin mörkö ei vielä polta)
const MAGMAN_POTKU = 28; // kuinka kauan ukko lentää sivuun mörön päältä hypättyään

// Tämä tiedosto ladataan ennen peli.js:ää, joten kuvat ladataan tässä itse
function lataaTulikuva(tiedosto) {
  const kuva = new Image();
  kuva.src = "kuvat/" + tiedosto;
  return kuva;
}

const tulikuvat = {
  laavapallo: lataaTulikuva("laavapallo.png"), // 2 ruutua 16 x 16
  tykki: lataaTulikuva("tykki.png"), // 16 x 16, piippu osoittaa vasemmalle
  kuula: lataaTulikuva("kuula.png"), // 16 x 16
  kivi: lataaTulikuva("kivi.png"), // 16 x 16 laatta, tulivuoren pinta
  kivimulta: lataaTulikuva("kivimulta.png"), // 16 x 16 laatta, tulivuoren sisus
};

// ---------- KENTÄN VALMISTELU ----------
// Kutsutaan valmisteleKentta-funktiosta (peli.js)
function valmisteleTulivuori(k) {
  // Laava: x, y (laavan pinta) ja leveys. Laava ulottuu ruudun alareunaan asti.
  if (!k.laavat) k.laavat = [];
  k.laavajaljet = []; // laavaetanan jäljet (tulivihut.js)
  k.syljet = []; // salamanterin tulisylyt (tulivihut.js)
  for (const l of k.laavat) {
    l.korkeus = 500 - l.y;
  }

  // Liekkisuihku: x ja lattia (suihku nousee ylös) TAI katto (suihku tulee alas).
  if (!k.tulisuihkut) k.tulisuihkut = [];
  for (const s of k.tulisuihkut) {
    s.leveys = 24;
    if (!s.korkeus) s.korkeus = 130;
    if (!s.jakso) s.jakso = SUIHKUN_JAKSO;
    s.aika = s.vaihe || 0;
    s.tila = "pois"; // "pois", "varoitus" tai "paalla"
  }

  // Tykki: x, lattia ja suunta (-1 = ampuu vasemmalle, 1 = oikealle).
  // Tykki on kiinteä: sen päällä voi seistä.
  if (!k.tykit) k.tykit = [];
  for (const t of k.tykit) {
    t.leveys = 32;
    t.korkeus = 32;
    t.y = t.lattia - t.korkeus;
    if (!t.suunta) t.suunta = -1;
    if (!t.jakso) t.jakso = TYKIN_JAKSO;
    t.ajastin = t.vaihe !== undefined ? t.vaihe : 60;
    t.eiPiirreta = true; // tykki piirretään omalla kuvallaan, ei laattoina
    k.tasot.push(t);
  }
  k.kuulat = [];
}

// Laavapallo: x, lattia (laavan pinta), hyppy (kuinka korkealle), jakso ja vaihe
function valmisteleLaavapallo(v) {
  v.leveys = 26;
  v.korkeus = 26;
  if (!v.hyppy) v.hyppy = 180;
  if (!v.jakso) v.jakso = LAAVAPALLON_JAKSO;
  v.y = v.lattia + 10;
  v.vy = 0;
  v.piilossa = true; // laavan alla
  v.ajastin = v.vaihe || 0;
  v.tulenkestava = true; // tulipallo ei tehoa
  v.eiLasketa = true; // laavapalloa ei voi tuhota, joten sitä ei lasketa bonukseen
  v.suunta = 1;
}

function laattaKuva(ylin) {
  if (kentta.laatat === "kivi")
    return ylin ? tulikuvat.kivi : tulikuvat.kivimulta;
  return ylin ? kuvat.maa : kuvat.multa;
}

// ---------- PÄIVITYS ----------

// Laavapallo hyppää laavasta, putoaa takaisin ja odottaa hetken
function paivitaLaavapallo(v, dt) {
  if (v.piilossa) {
    v.ajastin -= dt;
    if (v.ajastin <= 0) {
      v.piilossa = false;
      v.y = v.lattia;
      // Hyppy tarpeeksi kovaa, että pallo nousee "hyppy" pikseliä
      v.vy = -Math.sqrt(2 * 0.35 * v.hyppy);
      lisaaHiukkasia(v.x + 13, v.lattia, 6, ["#ff7b00", "#ffd23c"], 3);
    }
    return;
  }
  v.vy += 0.35 * dt;
  v.y += v.vy * dt;
  if (v.vy > 0 && v.y > v.lattia + 10) {
    v.piilossa = true;
    v.ajastin = v.jakso;
    lisaaHiukkasia(v.x + 13, v.lattia, 6, ["#ff7b00", "#ffd23c"], 3);
  }
}

// Laava, liekkisuihkut, tykit ja kuulat. Palauttaa true, jos peli loppui.
function paivitaTulivuori(dt) {
  // Liekkisuihkut syttyvät ja sammuvat
  for (const s of kentta.tulisuihkut) {
    s.aika += dt;
    const kohta = s.aika % s.jakso;
    const ennen = s.tila;
    if (kohta < s.jakso * 0.45) s.tila = "pois";
    else if (kohta < s.jakso * 0.62) s.tila = "varoitus";
    else s.tila = "paalla";
    if (s.tila === "paalla" && ennen !== "paalla" && lahellaRuutua(s.x))
      aanet.liekki();
  }

  // Tykit ampuvat, kun joku pelaaja on lähellä
  for (const t of kentta.tykit) {
    t.ajastin -= dt;
    if (t.ajastin > 0) continue;
    t.ajastin = t.jakso;
    if (!elavatPelaajat().some((pl) => Math.abs(pl.x - t.x) < 650)) continue;
    kentta.kuulat.push({
      x: t.suunta < 0 ? t.x - 18 : t.x + t.leveys + 2,
      y: t.y + 6,
      leveys: 16,
      korkeus: 16,
      vx: t.suunta * KUULAN_NOPEUS,
      matka: 0,
      elossa: true,
      vy: 0,
      tuhottu: false,
    });
    lisaaHiukkasia(
      t.suunta < 0 ? t.x - 4 : t.x + t.leveys + 4,
      t.y + 14,
      8,
      ["#ddd", "#999", "orange"],
      2,
    );
    if (lahellaRuutua(t.x)) aanet.tykki();
  }

  // Kuulat lentävät suoraan, kunnes ne osuvat seinään
  for (const k of kentta.kuulat) {
    if (k.tuhottu) {
      // Litistetty kuula putoaa alas
      k.vy += 0.5 * dt;
      k.y += k.vy * dt;
      if (k.y > 500) k.elossa = false;
      continue;
    }
    k.x += k.vx * dt;
    k.matka += Math.abs(k.vx) * dt;
    if (k.matka > 900) k.elossa = false;
    for (const t of kentta.kaikkiTasot) {
      if (!t.eiKiintea && osuu(k, t)) {
        k.elossa = false;
        lisaaHiukkasia(k.x + 8, k.y + 8, 8, ["#888", "#bbb"], 2);
        break;
      }
    }
    // Pelaajan tulipallo rikkoo kuulan
    for (const tp of tulipallot) {
      if (tp.elossa && k.elossa && osuu(tp, k)) {
        tp.elossa = false;
        k.elossa = false;
        lisaaHiukkasia(k.x + 8, k.y + 8, 12, ["#888", "orange", "#bbb"], 3);
      }
    }
  }
  kentta.kuulat = kentta.kuulat.filter((k) => k.elossa);
  paivitaTulivihujenAmmukset(dt); // laavajäljet ja tulisylyt (tulivihut.js)

  // Osuuko jokin vaara pelaajiin?
  for (const pl of elavatPelaajat()) {
    pelaaja = pl;
    tarkistaTulivuoriVaarat();
    if (tila !== "peli") return true;
  }
  return false;
}

// Onko kohta x ruudulla tai lähellä sitä? (ettei kaukaisista tykeistä kuulu ääntä)
function lahellaRuutua(x) {
  return x > kameraX - 100 && x < kameraX + canvas.width + 100;
}

// Laava, liekit ja kuulat (pelaaja = se, jota käsitellään)
function tarkistaTulivuoriVaarat() {
  // Laava polttaa aina, vaikka ukko olisi suojassa
  for (const l of kentta.laavat) {
    const pinta = { x: l.x, y: l.y + 8, leveys: l.leveys, korkeus: l.korkeus };
    if (osuu(pelaaja, pinta)) {
      lisaaHiukkasia(
        pelaaja.x + 10,
        l.y,
        20,
        ["#ff7b00", "#ffd23c", "#333"],
        5,
      );
      lisaaTeksti(pelaaja.x + 10, l.y - 20, "KUUMAA!");
      menetaElama();
      return;
    }
  }
  if (pelaaja.suojaAika > 0) return;
  if (tarkistaTulivihujenVaarat()) return; // tulivihut.js

  for (const s of kentta.tulisuihkut) {
    if (s.tila === "paalla" && osuu(pelaaja, suihkunAlue(s))) {
      lisaaTeksti(pelaaja.x + 10, pelaaja.y - 10, "AUTS!");
      menetaElama();
      return;
    }
  }

  for (const k of kentta.kuulat) {
    if (k.tuhottu || !osuu(pelaaja, k)) continue;
    const edellisetJalat = pelaaja.edellinenY + pelaaja.korkeus;
    if (pelaaja.vy > 0 && edellisetJalat <= k.y + 8) {
      // Hyppy kuulan päälle: kuula putoaa ja ukko pomppaa
      k.tuhottu = true;
      k.vy = 0;
      pisteet += PISTEET_KUULA;
      lisaaTeksti(k.x + 8, k.y - 10, "+" + PISTEET_KUULA);
      aanet.litistys();
      pelaaja.vy = hyppyNappiPohjassa() ? -HYPPYVOIMA : -HYPPYVOIMA / 2;
      pelaaja.hyppaa = hyppyNappiPohjassa();
      pelaaja.venytys = 0.35;
      continue;
    }
    menetaElama();
    return;
  }
}

// Liekkisuihkun liekin alue
function suihkunAlue(s) {
  if (s.katto !== undefined) {
    return { x: s.x, y: s.katto, leveys: s.leveys, korkeus: s.korkeus };
  }
  return {
    x: s.x,
    y: s.lattia - s.korkeus,
    leveys: s.leveys,
    korkeus: s.korkeus,
  };
}

// ---------- PIIRTÄMINEN ----------

const laavanLiukuvarit = new Map(); // valmiit liukuvärit laavan korkeuden mukaan

// Laava piirretään ennen tasoja, jotta tasot näyttävät olevan laavan päällä
function piirraLaavat(aika) {
  for (const l of kentta.laavat) {
    // Piirretään vain ruudulla näkyvä osa
    const alku = Math.max(l.x, kameraX - 20);
    const loppu = Math.min(l.x + l.leveys, kameraX + canvas.width + 20);
    if (loppu <= alku) continue;

    // Laavan liukuväri tehdään vain kerran jokaiselle laavan korkeudelle
    let liuku = laavanLiukuvarit.get(l.y);
    if (!liuku) {
      liuku = ctx.createLinearGradient(0, l.y, 0, canvas.height);
      liuku.addColorStop(0, "#ffb000");
      liuku.addColorStop(0.15, "#ff5a00");
      liuku.addColorStop(1, "#8a1500");
      laavanLiukuvarit.set(l.y, liuku);
    }
    ctx.fillStyle = liuku;
    ctx.beginPath();
    ctx.moveTo(alku, canvas.height + 10);
    // Laavan pinta aaltoilee
    for (let x = alku; x <= loppu; x += 8) {
      const aalto =
        Math.sin(x / 30 + aika / 400) * 3 + Math.sin(x / 13 - aika / 250) * 1.5;
      ctx.lineTo(x, l.y + aalto);
    }
    ctx.lineTo(loppu, canvas.height + 10);
    ctx.closePath();
    ctx.fill();

    // Kirkas viiva pinnassa
    ctx.strokeStyle = "#ffe066";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = alku; x <= loppu; x += 8) {
      const aalto =
        Math.sin(x / 30 + aika / 400) * 3 + Math.sin(x / 13 - aika / 250) * 1.5;
      if (x === alku) ctx.moveTo(x, l.y + aalto);
      else ctx.lineTo(x, l.y + aalto);
    }
    ctx.stroke();

    // Kuplia
    for (let i = 0; i < l.leveys / 70; i++) {
      const bx = l.x + ((i * 97 + 31) % l.leveys);
      if (bx < alku || bx > loppu) continue;
      const vaihe = (aika / 900 + i * 0.37) % 1;
      ctx.fillStyle = "rgba(255, 230, 120, " + (1 - vaihe) + ")";
      ctx.beginPath();
      ctx.arc(bx, l.y + 12 - vaihe * 10, 2 + vaihe * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Hehku laavan yllä
    for (let x = alku + 30; x < loppu; x += 120) {
      hehku(x, l.y, 70, "255, 120, 0", 0.25);
    }
  }
}

function piirraTulisuihkut(aika) {
  for (const s of kentta.tulisuihkut) {
    const alas = s.katto !== undefined;
    const suuY = alas ? s.katto : s.lattia; // missä suutin on
    // Suutin: tumma metallinen ritilä
    ctx.fillStyle = "#333";
    ctx.fillRect(s.x - 4, alas ? suuY : suuY - 8, s.leveys + 8, 8);
    ctx.fillStyle = "#666";
    for (let i = 0; i < 4; i++)
      ctx.fillRect(s.x - 2 + i * 8, alas ? suuY + 2 : suuY - 6, 4, 4);

    const keskiX = s.x + s.leveys / 2;
    if (s.tila === "varoitus") {
      // Pieniä liekkejä ja kipinöitä: kohta syttyy!
      const lepatus = Math.random() * 10;
      ctx.fillStyle = "rgba(255, 140, 0, 0.8)";
      const y0 = alas ? suuY + 8 : suuY - 8 - 10 - lepatus;
      ctx.fillRect(keskiX - 5, y0, 10, 10 + lepatus);
      if (Math.random() < 0.3)
        lisaaHiukkasia(
          keskiX,
          alas ? suuY + 10 : suuY - 10,
          1,
          ["#ffd23c", "#ff7b00"],
          2,
        );
    } else if (s.tila === "paalla") {
      const alue = suihkunAlue(s);
      const liuku = ctx.createLinearGradient(
        0,
        suuY,
        0,
        alas ? suuY + s.korkeus : suuY - s.korkeus,
      );
      liuku.addColorStop(0, "#fff3a0");
      liuku.addColorStop(0.4, "#ffb000");
      liuku.addColorStop(1, "rgba(255, 60, 0, 0.3)");
      ctx.fillStyle = liuku;
      // Liekki lepattaa: leveys vaihtelee
      const leveys = s.leveys + Math.sin(aika / 40 + s.x) * 4;
      ctx.fillRect(keskiX - leveys / 2, alue.y, leveys, alue.korkeus);
      ctx.fillStyle = "rgba(255, 255, 220, 0.8)";
      ctx.fillRect(keskiX - 4, alue.y, 8, alue.korkeus);
      hehku(keskiX, alue.y + alue.korkeus / 2, 80, "255, 120, 0", 0.5);
    }
  }
}

function piirraTykitJaKuulat(aika) {
  for (const t of kentta.tykit) {
    // Kuvan piippu osoittaa vasemmalle: oikealle ampuva tykki peilataan
    piirraRuutu(tulikuvat.tykki, 0, 16, 16, t.x, t.y, t.suunta === 1);
  }
  for (const k of kentta.kuulat) {
    ctx.save();
    if (k.tuhottu) {
      ctx.translate(0, k.y * 2 + 16);
      ctx.scale(1, -1);
    }
    ctx.drawImage(tulikuvat.kuula, 0, 0, 16, 16, k.x - 8, k.y - 8, 32, 32);
    ctx.restore();
  }
}

function piirraLaavapallo(v, aika) {
  if (v.piilossa) return;
  const ruutu = Math.floor(aika / 100) % 2;
  hehku(v.x + 13, v.y + 13, 40, "255, 140, 0", 0.5);
  ctx.save();
  // Alas pudotessa pallo on ylösalaisin
  if (v.vy > 0) {
    ctx.translate(0, (v.y - 3) * 2 + 32);
    ctx.scale(1, -1);
  }
  piirraRuutu(tulikuvat.laavapallo, ruutu, 16, 16, v.x - 3, v.y - 3, false);
  ctx.restore();
  // Tulinen häntä
  if (Math.random() < 0.4)
    lisaaHiukkasia(
      v.x + 13,
      v.y + (v.vy < 0 ? 26 : 0),
      1,
      ["#ff7b00", "#ffd23c"],
      1,
    );
}

// Valot pimeissä kentissä (tehosteet.js kutsuu tätä)
function tulivuoriValot(valo) {
  for (const l of kentta.laavat) {
    for (
      let x = Math.max(l.x, kameraX - 60);
      x < Math.min(l.x + l.leveys, kameraX + canvas.width + 60);
      x += 60
    ) {
      valo(x, l.y + 10, 90);
    }
  }
  for (const s of kentta.tulisuihkut) {
    if (s.tila === "paalla") {
      const a = suihkunAlue(s);
      valo(s.x + 12, a.y + a.korkeus / 2, 140);
    } else if (s.tila === "varoitus") {
      valo(s.x + 12, s.katto !== undefined ? s.katto + 10 : s.lattia - 10, 50);
    }
  }
  for (const v of kentta.viholliset) {
    if (v.tyyppi === "laavapallo" && !v.piilossa) valo(v.x + 13, v.y + 13, 90);
  }
  const p = kentta.pomo;
  if (p && p.tyyppi === "magma" && p.elossa) {
    if (!p.jaahtynyt) valo(p.x + p.leveys / 2, p.y + 50, 160);
    for (const m of p.meteorit) valo(m.x + 13, m.y + 13, 80);
    for (const g of p.geysirit)
      valo(g.x + g.leveys / 2, p.lattia - 20, g.aika > g.varoitus ? 160 : 70);
    for (const k of p.tulikuulat) valo(k.x + 9, k.y + 9, 70);
  }
  tulivihujenValot(valo); // tulivihut.js
}

// Tulivuori taustalla: iso savuava vuori kaukana
function piirraTulivuoriTausta(aika) {
  const x = 560 - kameraX * 0.08;
  ctx.fillStyle = "#3a1d1d";
  ctx.beginPath();
  ctx.moveTo(x - 260, 360);
  ctx.lineTo(x - 50, 150);
  ctx.lineTo(x + 50, 150);
  ctx.lineTo(x + 260, 360);
  ctx.closePath();
  ctx.fill();
  // Hehkuva kraatteri ja laavavana
  hehku(x, 150, 90, "255, 90, 0", 0.6);
  ctx.fillStyle = "#ff6a00";
  ctx.fillRect(x - 50, 148, 100, 5);
  ctx.beginPath();
  ctx.moveTo(x - 10, 152);
  ctx.lineTo(x + 6, 152);
  ctx.lineTo(x + 30 + Math.sin(aika / 900) * 4, 300);
  ctx.lineTo(x + 18, 300);
  ctx.closePath();
  ctx.fill();
  // Savupilvet nousevat
  for (let i = 0; i < 5; i++) {
    const vaihe = (aika / 4000 + i / 5) % 1;
    ctx.fillStyle = "rgba(60, 50, 50, " + 0.5 * (1 - vaihe) + ")";
    ctx.beginPath();
    ctx.arc(
      x + Math.sin(i * 2 + vaihe * 3) * 20,
      140 - vaihe * 130,
      20 + vaihe * 40,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

// ==========================================
//   POMO: MAGMAMÖRKÖ
//   Kuuma laavahirviö. Kun se hehkuu, siihen ei saa koskea, eikä
//   tulipallo tehoa siihen ollenkaan. Jokaisen hyökkäyksen jälkeen
//   se jäähtyy harmaaksi hetkeksi: silloin sen päälle voi hypätä!
//   Hyökkäykset:
//   1. METEORISADE: kiviä sataa taivaalta (punainen merkki näyttää, mihin)
//   2. GEYSIRIT: lattia hehkuu ja purkautuu (pakene tasoille!)
//   3. TULIKUULAT: pomppivia tulipalloja
// ==========================================

function valmisteleMagma(p) {
  p.nimi = "MAGMAMÖRKÖ";
  p.leveys = 84;
  p.korkeus = 110;
  p.y = p.lattia - p.korkeus;
  p.alkuX = p.x;
  p.maxElamat = MAGMAN_ELAMAT;
  p.elamat = MAGMAN_ELAMAT;
  p.elossa = true;
  p.kipu = 0;
  p.kuolinAika = 0;
  p.heratysTeksti = false;
  nollaaMagma(p);
}

// Magmamörkö palaa alkuun (kun yksinpelissä menetetään elämä)
function nollaaMagma(p) {
  p.herannyt = false;
  p.x = p.alkuX;
  p.suunta = -1;
  p.tila = "kavelee";
  p.ajastin = 100;
  p.jaahtynyt = false;
  p.kivet = [];
  p.aallot = [];
  p.meteorit = [];
  p.geysirit = [];
  p.tulikuulat = [];
  p.edellinenHyokkays = "";
}

function paivitaMagma(p, dt, elavat) {
  const vihainen = p.elamat <= p.maxElamat / 3; // vihaisena nopeampi
  p.ajastin -= dt;

  if (p.tila === "kavelee") {
    p.jaahtynyt = false;
    p.suunta = pelaaja.x + 10 < p.x + p.leveys / 2 ? -1 : 1;
    p.x += (vihainen ? 1.3 : 0.8) * p.suunta * dt;
    if (p.ajastin <= 0) valitseMagmanHyokkays(p, vihainen);
  } else if (p.tila === "nostaa") {
    // Kädet ylös: kohta sataa kiviä
    if (p.ajastin <= 0) {
      teeMeteorit(p, vihainen ? 7 : 5);
      aloitaJaahtyminen(p, vihainen, 70);
    }
  } else if (p.tila === "lyo") {
    // Lyö maahan: lattia alkaa hehkua
    if (p.ajastin <= 0) {
      teeGeysirit(p, vihainen);
      tarina = 12;
      aanet.maanjaristys();
      aloitaJaahtyminen(p, vihainen, 110);
    }
  } else if (p.tila === "sylkee") {
    // Sylkee kolme pomppivaa tulikuulaa
    const hetket = vihainen ? [50, 38, 26, 14] : [44, 30, 16];
    for (const h of hetket) {
      if (p.ajastin <= h && p.ajastin + dt > h) syljeTulikuula(p);
    }
    if (p.ajastin <= 0) aloitaJaahtyminen(p, vihainen, 0);
  } else if (p.tila === "odottaa") {
    // Hyökkäys on vielä käynnissä (kivet putoavat): odotetaan
    if (p.ajastin <= 0) {
      p.tila = "jaahtyy";
      p.jaahtynyt = true;
      p.ajastin = vihainen ? MAGMAN_JAAHTYMINEN * 0.7 : MAGMAN_JAAHTYMINEN;
      aanet.sammuu();
      lisaaTeksti(p.x + p.leveys / 2, p.y - 20, "JÄÄHTYI!");
    }
  } else if (p.tila === "jaahtyy") {
    if (Math.random() < 0.2 * dt) {
      lisaaHiukkasia(
        p.x + 20 + Math.random() * 44,
        p.y + 10,
        1,
        ["#888", "#aaa"],
        1,
      );
    }
    if (p.ajastin <= 0) kuumene(p);
  } else if (p.tila === "kuumenee") {
    if (p.ajastin <= 0) {
      p.tila = "kavelee";
      p.ajastin = vihainen ? 50 : 90;
    }
  }

  // Areenan reunat
  if (p.x < p.vasen) p.x = p.vasen;
  if (p.x > p.oikea) p.x = p.oikea;

  paivitaMeteorit(p, dt);
  paivitaGeysirit(p, dt);
  paivitaTulikuulat(p, dt);

  for (const pl of elavat) {
    pelaaja = pl;
    magmaOsuuPelaajaan(p);
    if (tila !== "peli") return true;
  }
  return false;
}

function valitseMagmanHyokkays(p, vihainen) {
  // Ei sama hyökkäys kahdesti peräkkäin
  const vaihtoehdot = ["nostaa", "lyo", "sylkee"].filter(
    (h) => h !== p.edellinenHyokkays,
  );
  const valinta = vaihtoehdot[Math.floor(Math.random() * vaihtoehdot.length)];
  p.edellinenHyokkays = valinta;
  p.tila = valinta;
  if (valinta === "nostaa") p.ajastin = vihainen ? 30 : 45;
  if (valinta === "lyo") p.ajastin = vihainen ? 25 : 35;
  if (valinta === "sylkee") p.ajastin = vihainen ? 60 : 55;
  aanet.ryntays();
}

// Hyökkäyksen jälkeen Magmamörkö odottaa, että hyökkäys loppuu, ja jäähtyy
function aloitaJaahtyminen(p, vihainen, odotus) {
  p.tila = "odottaa";
  p.ajastin = odotus;
}

function kuumene(p) {
  p.tila = "kuumenee";
  p.jaahtynyt = false;
  p.ajastin = MAGMAN_KUUMENEMINEN;
  lisaaHiukkasia(p.x + p.leveys / 2, p.y + 50, 20, ["#ff7b00", "#ffd23c"], 4);
}

// Mihin korkeuteen kivi putoaa kohdassa x? (ylin taso sen alla)
function laskeutumisKorkeus(x, p) {
  let y = p.lattia;
  for (const t of kentta.tasot) {
    if (t === p.portti) continue;
    if (x + 13 > t.x && x + 13 < t.x + t.leveys && t.y < y) y = t.y;
  }
  return y;
}

function teeMeteorit(p, maara) {
  const leveys = p.oikea + p.leveys - p.vasen;
  for (let i = 0; i < maara; i++) {
    // Ensimmäinen kivi putoaa suoraan pelaajan kohdalle, muut ympärille
    let x = i === 0 ? pelaaja.x - 3 : pelaaja.x + (Math.random() - 0.5) * 500;
    x = Math.max(p.vasen - 20, Math.min(p.vasen + leveys, x));
    p.meteorit.push({
      x: x,
      y: -40,
      leveys: 26,
      korkeus: 26,
      vy: 0,
      viive: 30 + i * 14, // kuinka kauan merkki näkyy ennen kuin kivi putoaa
      kohdeY: laskeutumisKorkeus(x, p),
      elossa: true,
    });
  }
  aanet.heitto();
}

function paivitaMeteorit(p, dt) {
  for (const m of p.meteorit) {
    if (m.viive > 0) {
      m.viive -= dt;
      continue;
    }
    m.vy = Math.min(12, m.vy + 0.5 * dt);
    m.y += m.vy * dt;
    if (m.y + m.korkeus >= m.kohdeY) {
      m.elossa = false;
      lisaaHiukkasia(m.x + 13, m.kohdeY, 15, ["#ff7b00", "#555", "#ffd23c"], 4);
      tarina = Math.max(tarina, 5);
    }
  }
  p.meteorit = p.meteorit.filter((m) => m.elossa);
}

function teeGeysirit(p, vihainen) {
  // Areenan lattia jaetaan neljään osaan. Kaksi (vihaisena kolme) purkautuu.
  const alku = p.vasen - 30;
  const loppu = p.oikea + p.leveys + 30;
  const osa = (loppu - alku) / 4;
  const osat = [0, 1, 2, 3];
  // Pelaajan kohdalla oleva osa purkautuu aina
  const pelaajanOsa = Math.max(
    0,
    Math.min(3, Math.floor((pelaaja.x + 10 - alku) / osa)),
  );
  const valitut = [pelaajanOsa];
  const muut = osat
    .filter((o) => o !== pelaajanOsa)
    .sort(() => Math.random() - 0.5);
  valitut.push(muut[0]);
  if (vihainen) valitut.push(muut[1]);
  for (const o of valitut) {
    p.geysirit.push({
      x: alku + o * osa,
      leveys: osa,
      aika: 0,
      varoitus: vihainen ? 50 : 65, // kuinka kauan lattia hehkuu ennen purkausta
      kesto: 50,
      korkeus: 110,
    });
  }
}

function paivitaGeysirit(p, dt) {
  for (const g of p.geysirit) {
    const ennen = g.aika;
    g.aika += dt;
    if (ennen < g.varoitus && g.aika >= g.varoitus) {
      aanet.liekki();
      tarina = Math.max(tarina, 8);
    }
  }
  p.geysirit = p.geysirit.filter((g) => g.aika < g.varoitus + g.kesto);
}

function geysirinAlue(g, p) {
  return {
    x: g.x + 6,
    y: p.lattia - g.korkeus,
    leveys: g.leveys - 12,
    korkeus: g.korkeus,
  };
}

function syljeTulikuula(p) {
  const suuX = p.x + p.leveys / 2 + p.suunta * 30;
  p.tulikuulat.push({
    x: suuX - 9,
    y: p.y + 30,
    leveys: 18,
    korkeus: 18,
    vx: p.suunta * (2.5 + Math.random() * 1.5),
    vy: -6,
    elossa: true,
    aika: 0,
  });
  aanet.tulipallo();
}

function paivitaTulikuulat(p, dt) {
  for (const k of p.tulikuulat) {
    k.aika += dt;
    k.x += k.vx * dt;
    k.vy += 0.35 * dt;
    k.y += k.vy * dt;
    // Pomppii lattiasta ja tasoista
    if (k.vy > 0) {
      for (const t of kentta.kaikkiTasot) {
        if (osuu(k, t) && k.y + k.korkeus - k.vy * dt <= t.y + 2) {
          k.y = t.y - k.korkeus;
          k.vy = -7.5;
        }
      }
    }
    // Areenan seinästä se kimpoaa takaisin
    if (k.x < p.vasen - 40 || k.x > p.oikea + p.leveys + 40) k.vx = -k.vx;
    if (k.aika > 420) k.elossa = false;
    // Pelaajan tulipallo sammuttaa sen
    for (const t of tulipallot) {
      if (t.elossa && k.elossa && osuu(t, k)) {
        t.elossa = false;
        k.elossa = false;
        lisaaHiukkasia(k.x + 9, k.y + 9, 10, ["orange", "#ffd23c", "#666"], 3);
      }
    }
  }
  p.tulikuulat = p.tulikuulat.filter((k) => k.elossa);
}

// Osuuko Magmamörkö tai sen hyökkäys pelaajaan? (pelaaja = se, jota käsitellään)
function magmaOsuuPelaajaan(p) {
  if (pelaaja.suojaAika <= 0) {
    for (const m of p.meteorit) {
      if (m.viive <= 0 && osuu(pelaaja, m)) return menetaElama();
    }
    for (const k of p.tulikuulat) {
      if (osuu(pelaaja, k)) return menetaElama();
    }
    for (const g of p.geysirit) {
      if (g.aika >= g.varoitus && osuu(pelaaja, geysirinAlue(g, p)))
        return menetaElama();
    }
  }
  if (!osuu(pelaaja, p)) return;

  const edellisetJalat = pelaaja.edellinenY + pelaaja.korkeus;
  const ylhaalta = pelaaja.vy > 0 && edellisetJalat <= p.y + 25;

  if (p.jaahtynyt) {
    if (ylhaalta) {
      // Osuma! Magmamörkö suuttuu ja kuumenee heti
      osuPomoon(VAHINKO_LITISTYS);
      lataaTulta();
      pelaaja.vy = -HYPPYVOIMA;
      pelaaja.hyppaa = hyppyNappiPohjassa();
      pelaaja.venytys = 0.35;
      // Ukko lentää sivuun mörön päältä (lähimmän reunan puolelle),
      // ettei se putoa takaisin kuuman mörön päälle
      const ukonKeski = pelaaja.x + pelaaja.leveys / 2;
      pelaaja.suunta = ukonKeski < p.x + p.leveys / 2 ? -1 : 1;
      // Jos mörkö on areenan seinän vieressä, lennetään toiseen suuntaan
      if (pelaaja.suunta === -1 && p.x <= p.vasen + 20) pelaaja.suunta = 1;
      if (pelaaja.suunta === 1 && p.x >= p.oikea - 20) pelaaja.suunta = -1;
      pelaaja.potkuAika = MAGMAN_POTKU;
      if (p.elossa) kuumene(p);
    }
    return; // jäähtynyt mörkö ei satuta
  }
  if (p.tila === "kuumenee") return; // kuumeneva mörkö vilkkuu, mutta ei vielä polta

  // Kuuma mörkö polttaa, vaikka hyppäisi päälle
  if (pelaaja.suojaAika <= 0) {
    lisaaTeksti(
      pelaaja.x + 10,
      pelaaja.y - 10,
      ylhaalta ? "KUUMA PÄÄ!" : "AUTS!",
    );
    menetaElama();
  } else if (ylhaalta) {
    pelaaja.vy = -HYPPYVOIMA * 0.7; // suojassa pomppaa pois
  }
}

// ---------- MAGMAMÖRKÖ: PIIRTÄMINEN ----------

function piirraMagma(p, aika) {
  piirraMagmanHyokkaykset(p, aika);
  if (!p.elossa && p.kuolinAika <= 0) return;

  ctx.save();
  let x = p.x;
  let y = p.y;
  if (!p.elossa) {
    // Kuollessaan mörkö vajoaa maahan ja haalenee
    y += (120 - p.kuolinAika) * 0.8;
    ctx.globalAlpha = Math.max(0, p.kuolinAika / 120);
    ctx.beginPath();
    ctx.rect(x - 60, 0, p.leveys + 120, p.lattia);
    ctx.clip();
  }
  // Tärisee ennen hyökkäystä
  if (["nostaa", "lyo", "sylkee", "kuumenee"].includes(p.tila))
    x += Math.sin(aika / 20) * 2;
  // Keinuu kävellessä
  const askel = p.tila === "kavelee" ? Math.sin(aika / 150) : 0;
  y += Math.abs(askel) * -3;

  // Kuumetessaan mörkö vilkkuu harmaana ja punaisena: nyt pitää lähteä pois!
  const kuuma = !p.jaahtynyt && !(p.tila === "kuumenee" && Math.floor(aika / 90) % 2 === 0);
  const valkoinen = p.kipu > 0 && Math.floor(p.kipu / 4) % 2 === 0;
  const kivi = valkoinen ? "#fff" : kuuma ? "#4a2418" : "#5c5c5c";
  const kiviVaalea = valkoinen ? "#fff" : kuuma ? "#6b3522" : "#7a7a7a";
  const halkeama = kuuma ? "#ff8c1a" : "#333";

  if (kuuma && p.elossa)
    hehku(x + p.leveys / 2, y + 60, 110, "255, 100, 0", 0.35);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  const laatikko = (lx, ly, lw, lh, vari) => {
    ctx.fillStyle = vari;
    ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeRect(lx, ly, lw, lh);
  };

  // Jalat
  laatikko(x + 12, y + 92 + askel * 3, 22, 18 - askel * 3, kivi);
  laatikko(x + 50, y + 92 - askel * 3, 22, 18 + askel * 3, kivi);
  // Kädet: ylhäällä, kun nostaa kiviä tai lyö
  const kadetYlos = p.tila === "nostaa" || (p.tila === "lyo" && p.ajastin > 12);
  if (kadetYlos) {
    laatikko(x - 14, y - 20, 20, 62, kiviVaalea);
    laatikko(x + p.leveys - 6, y - 20, 20, 62, kiviVaalea);
  } else {
    laatikko(x - 14, y + 40, 20, 52, kiviVaalea);
    laatikko(x + p.leveys - 6, y + 40, 20, 52, kiviVaalea);
  }
  // Vartalo
  laatikko(x, y + 30, p.leveys, 66, kivi);
  // Pää
  laatikko(x + 14, y, 56, 38, kiviVaalea);

  // Hehkuvat halkeamat vartalossa
  ctx.strokeStyle = halkeama;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 40);
  ctx.lineTo(x + 32, y + 58);
  ctx.lineTo(x + 26, y + 80);
  ctx.moveTo(x + 62, y + 36);
  ctx.lineTo(x + 54, y + 60);
  ctx.lineTo(x + 66, y + 86);
  ctx.moveTo(x + 40, y + 70);
  ctx.lineTo(x + 46, y + 92);
  ctx.stroke();

  // Silmät katsovat pelaajaa kohti
  const katse = p.suunta * 4;
  if (kuuma) {
    ctx.fillStyle = valkoinen ? "#fff" : "#ffe066";
    ctx.fillRect(x + 24 + katse, y + 10, 12, 8);
    ctx.fillRect(x + 48 + katse, y + 10, 12, 8);
    ctx.fillStyle = "#c00";
    ctx.fillRect(x + 28 + katse, y + 12, 4, 4);
    ctx.fillRect(x + 52 + katse, y + 12, 4, 4);
    // Vihaiset kulmakarvat
    ctx.fillStyle = "black";
    ctx.fillRect(x + 22 + katse, y + 6, 16, 3);
    ctx.fillRect(x + 46 + katse, y + 6, 16, 3);
  } else {
    // Jäähtynyt: silmät kiinni ja huimaa
    ctx.fillStyle = "#222";
    ctx.fillRect(x + 24, y + 14, 12, 3);
    ctx.fillRect(x + 48, y + 14, 12, 3);
    reunaTeksti(
      "@",
      x + p.leveys / 2,
      y - 6 + Math.sin(aika / 200) * 3,
      16,
      "center",
      "#ccc",
    );
  }
  // Suu: auki, kun sylkee
  ctx.fillStyle = p.tila === "sylkee" ? "#ff6a00" : "#1a0d08";
  ctx.fillRect(x + 30, y + 26, 24, p.tila === "sylkee" ? 9 : 4);
  ctx.restore();
}

function piirraMagmanHyokkaykset(p, aika) {
  // Geysirit: ensin lattia hehkuu, sitten laava purkautuu
  for (const g of p.geysirit) {
    if (g.aika < g.varoitus) {
      const vilkku = Math.floor(aika / 100) % 2 === 0 ? 0.55 : 0.3;
      ctx.fillStyle = "rgba(255, 80, 0, " + vilkku + ")";
      ctx.fillRect(g.x + 6, p.lattia - 6, g.leveys - 12, 6);
      if (Math.random() < 0.3)
        lisaaHiukkasia(
          g.x + Math.random() * g.leveys,
          p.lattia - 2,
          1,
          ["#ffd23c", "#ff7b00"],
          2,
        );
    } else {
      const a = geysirinAlue(g, p);
      const nousu = Math.min(1, (g.aika - g.varoitus) / 8); // purkaus nousee nopeasti
      const korkeus = a.korkeus * nousu;
      const liuku = ctx.createLinearGradient(
        0,
        p.lattia,
        0,
        p.lattia - korkeus,
      );
      liuku.addColorStop(0, "#ffb000");
      liuku.addColorStop(1, "rgba(255, 60, 0, 0.6)");
      ctx.fillStyle = liuku;
      for (let x = a.x; x < a.x + a.leveys; x += 12) {
        const h = korkeus * (0.8 + Math.sin(x / 7 + aika / 50) * 0.2);
        ctx.fillRect(x, p.lattia - h, 12, h);
      }
      hehku(a.x + a.leveys / 2, p.lattia - 50, 120, "255, 120, 0", 0.4);
    }
  }
  // Meteorit: punainen merkki maassa, sitten tulinen kivi putoaa
  for (const m of p.meteorit) {
    const koko = m.viive > 0 ? 1 - Math.min(1, m.viive / 60) : 1;
    ctx.fillStyle = "rgba(255, 0, 0, " + (0.25 + koko * 0.35) + ")";
    ctx.beginPath();
    ctx.ellipse(
      m.x + 13,
      m.kohdeY - 3,
      10 + koko * 10,
      4 + koko * 2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (m.viive > 0) continue;
    hehku(m.x + 13, m.y + 13, 40, "255, 120, 0", 0.6);
    ctx.fillStyle = "#4a2418";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(m.x + 13, m.y + 13, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ff8c1a";
    ctx.fillRect(m.x + 8, m.y + 8, 5, 5);
    ctx.fillRect(m.x + 15, m.y + 14, 4, 4);
    if (Math.random() < 0.5)
      lisaaHiukkasia(m.x + 13, m.y, 1, ["#ff7b00", "#ffd23c"], 1);
  }
  // Tulikuulat
  for (const k of p.tulikuulat) {
    hehku(k.x + 9, k.y + 9, 30, "255, 140, 0", 0.6);
    ctx.fillStyle = "#ff6a00";
    ctx.strokeStyle = "#7a1a00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(k.x + 9, k.y + 9, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffe066";
    ctx.fillRect(k.x + 5, k.y + 5, 6, 6);
  }
}

// Pieni nukkuva Magmamörkö kartalle
function piirraMagmaKuvake(x, y, aika) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.55, 0.55);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 4;
  ctx.fillStyle = "#4a2418";
  ctx.fillRect(-42, -10, 84, 50);
  ctx.strokeRect(-42, -10, 84, 50);
  ctx.fillStyle = "#6b3522";
  ctx.fillRect(-28, -42, 56, 36);
  ctx.strokeRect(-28, -42, 56, 36);
  ctx.fillStyle = "#222";
  ctx.fillRect(-18, -28, 12, 4);
  ctx.fillRect(6, -28, 12, 4);
  ctx.strokeStyle = "#ff8c1a";
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-20, 20);
  ctx.moveTo(25, -2);
  ctx.lineTo(18, 25);
  ctx.stroke();
  ctx.restore();
}

// Tulivuori kartalle Magmamörkön kentän taakse
function piirraTulivuoriKartalla(paikka, aika) {
  const pohja = paikka.y - 5;
  ctx.fillStyle = "#3a2a2a";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(paikka.x - 110, pohja);
  ctx.lineTo(paikka.x - 25, pohja - 130);
  ctx.lineTo(paikka.x + 25, pohja - 130);
  ctx.lineTo(paikka.x + 110, pohja);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Laava valuu kraatterista
  ctx.fillStyle = "#ff6a00";
  ctx.fillRect(paikka.x - 25, pohja - 132, 50, 6);
  ctx.beginPath();
  ctx.moveTo(paikka.x - 8, pohja - 128);
  ctx.lineTo(paikka.x + 4, pohja - 128);
  ctx.lineTo(paikka.x + 34, pohja - 40);
  ctx.lineTo(paikka.x + 22, pohja - 40);
  ctx.closePath();
  ctx.fill();
  // Savu
  for (let i = 0; i < 3; i++) {
    const vaihe = (aika / 3000 + i / 3) % 1;
    ctx.fillStyle = "rgba(70, 60, 60, " + 0.6 * (1 - vaihe) + ")";
    ctx.beginPath();
    ctx.arc(
      paikka.x + Math.sin(vaihe * 4 + i) * 10,
      pohja - 140 - vaihe * 70,
      10 + vaihe * 18,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
