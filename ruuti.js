// ==========================================
//   RUUTI JA LAAVATULVA
//   Tulivuorisaaren vaikeissa kentissä (vaikeatkentat.js) on:
//   - RUUTITYNNYREITÄ: tulipallo sytyttää tynnyrin. Se sihisee hetken ja
//     RÄJÄHTÄÄ! Räjähdys tuhoaa vihut (myös ne, joihin tuli ei tehoa),
//     tykit ja murtuvat seinät. Pysy itse kaukana!
//   - SYTYTYSLANKOJA: ammu langan päätä, niin liekki ryömii lankaa pitkin
//     tynnyrille. Näin saa räjäytettyä tynnyrin, johon tulipallo ei yllä.
//     Myös vihujen tuli sytyttää tynnyrit ja langat!
//   - MURTUVIA SEINIÄ: halkeillut seinä hajoaa vain räjähdyksestä.
//   - LAAVATULVA: laava nousee välillä ja peittää matalat paikat.
//     Kun ruutu tärisee ja lukee "LAAVA NOUSEE!", kiipeä korkealle!
//   Kentässä annetaan:
//     tynnyrit = x ja lattia
//     langat   = pisteet (lista [x, y] -kohtia, ensimmäinen on sytytyspää)
//                ja tynnyri (monesko tynnyri langan päässä on, 0 = ensimmäinen)
//     murtuvat = x, y, leveys, korkeus
//     tulva    = ala ja yla (laavan pinta alhaalla ja ylhäällä) ja jakso
// ==========================================

const RAJAHDYS_SADE = 85; // kuinka kauas räjähdys yltää (pikseleitä)
const TYNNYRIN_SIHINA = 40; // kuinka kauan tynnyri sihisee ennen räjähdystä (60 = 1 s)
const LANGAN_NOPEUS = 1.6; // kuinka nopeasti liekki ryömii lankaa pitkin
const RAJAHDYS_VAHINKO = 4; // paljonko räjähdys vie pomolta elämää
const PISTEET_TYKKI = 200; // tykin räjäyttämisestä
const PISTEET_SEINA = 100; // murtuvan seinän räjäyttämisestä
const TULVAN_JAKSO = 780; // kuinka usein laava nousee (60 = 1 s)

function valmisteleRuuti(k) {
  if (!k.tynnyrit) k.tynnyrit = [];
  if (!k.langat) k.langat = [];
  if (!k.murtuvat) k.murtuvat = [];
  k.rajahdykset = []; // räjähdysten välähdykset (näkyvät hetken)

  // Tynnyri on kiinteä: sen päällä voi seistä (kuten tykin)
  for (const t of k.tynnyrit) {
    t.leveys = 28;
    t.korkeus = 32;
    t.y = t.lattia - t.korkeus;
    t.tila = "ehja"; // "ehja", "sihisee" tai "poissa"
    t.ajastin = 0;
    t.tynnyri = true;
    t.eiPiirreta = true; // tynnyri piirretään itse, ei laattoina
    k.tasot.push(t);
  }

  // Sytytyslanka kulkee pisteestä toiseen ja päättyy tynnyrin päälle
  for (const l of k.langat) {
    const t = k.tynnyrit[l.tynnyri];
    l.pisteet.push([t.x + t.leveys / 2, t.y]);
    l.pituus = 0;
    for (let i = 1; i < l.pisteet.length; i++) {
      l.pituus += Math.hypot(l.pisteet[i][0] - l.pisteet[i - 1][0], l.pisteet[i][1] - l.pisteet[i - 1][1]);
    }
    l.palanut = -1; // -1 = ei vielä sytytetty, muuten kuinka pitkälle liekki on ehtinyt
  }

  // Murtuva seinä on tavallinen taso, jonka räjähdys voi hajottaa
  for (const m of k.murtuvat) {
    m.murtuva = true;
    k.tasot.push(m);
  }

  // Laavatulva: koko kentän levyinen laava, jonka pinta nousee ja laskee
  if (k.tulva) {
    const t = k.tulva;
    if (!t.jakso) t.jakso = TULVAN_JAKSO;
    t.aika = t.vaihe || 0;
    t.tila = "alhaalla"; // "alhaalla", "varoitus", "nousee", "ylhaalla" tai "laskee"
    t.laava = { x: t.x || 0, y: t.ala, leveys: t.leveys || k.leveys, korkeus: 500 - t.ala, tulva: true };
    k.laavat.push(t.laava);
  }
}

// ---------- PÄIVITYS ----------

// Tynnyrit, langat ja tulva. Palauttaa true, jos peli loppui.
function paivitaRuuti(dt) {
  if (kentta.tulva) paivitaTulva(kentta.tulva, dt);

  for (const r of kentta.rajahdykset) r.ika += dt;
  if (kentta.rajahdykset.length > 0) kentta.rajahdykset = kentta.rajahdykset.filter((r) => r.ika < 24);

  // Sytytyslangat: syttyykö pää, ja kuinka pitkälle liekki on ehtinyt?
  for (const l of kentta.langat) {
    if (l.palanut < 0) {
      const paa = { x: l.pisteet[0][0] - 12, y: l.pisteet[0][1] - 14, leveys: 24, korkeus: 28 };
      // Kun ukko tulee ensimmäisen kerran langan pään lähelle, neuvotaan mitä tehdä
      if (!kentta.lankaVihje && elavatPelaajat().some((pl) => Math.abs(pl.x - paa.x) < 200)) {
        kentta.lankaVihje = true;
        lisaaTeksti(paa.x + 12, paa.y - 16, "AMMU LANGAN PÄÄTÄ!");
      }
      for (const t of tulipallot) {
        if (t.elossa && osuu(t, paa)) {
          t.elossa = false;
          sytytaLanka(l);
        }
      }
      if (l.palanut < 0 && tuliKoskee(paa)) sytytaLanka(l);
      continue;
    }
    if (l.palanut >= l.pituus) continue; // palanut jo loppuun
    l.palanut += LANGAN_NOPEUS * dt;
    const liekki = langanKohta(l, l.palanut);
    if (Math.random() < 0.5 * dt) lisaaHiukkasia(liekki.x, liekki.y, 1, ["#ffd23c", "#ff7b00", "white"], 2);
    if (l.palanut >= l.pituus) {
      // Liekki ehti tynnyrille: se räjähtää heti
      const t = kentta.tynnyrit[l.tynnyri];
      if (t.tila !== "poissa") {
        t.tila = "sihisee";
        t.ajastin = 0;
      }
    }
  }

  // Tynnyrit
  for (const t of kentta.tynnyrit) {
    if (t.tila === "ehja") {
      // Kun ukko tulee ensimmäisen kerran tynnyrin lähelle, neuvotaan mitä tehdä
      // (ei niille tynnyreille, joihin johtaa lanka: niistä on oma neuvonsa)
      const lankaTynnyri = kentta.langat.some((l) => kentta.tynnyrit[l.tynnyri] === t);
      if (!kentta.ruutiVihje && !lankaTynnyri && elavatPelaajat().some((pl) => Math.abs(pl.x - t.x) < 230)) {
        kentta.ruutiVihje = true;
        lisaaTeksti(t.x + 14, t.y - 26, "AMMU TYNNYRIÄ JA PYSY KAUKANA!");
      }
      // Vihujen tuli, tykinkuulat ja nouseva laava sytyttävät tynnyrin
      const iso = { x: t.x - 3, y: t.y - 3, leveys: t.leveys + 6, korkeus: t.korkeus + 6 };
      if (tuliKoskee(iso)) sytytaTynnyri(t);
    } else if (t.tila === "sihisee") {
      t.ajastin -= dt;
      if (Math.random() < 0.6 * dt) lisaaHiukkasia(t.x + 14, t.y - 2, 1, ["#ffd23c", "#ff7b00", "white"], 2.5);
      if (t.ajastin <= 0) {
        t.tila = "poissa";
        t.eiKiintea = true; // tynnyriä ei enää ole
        rajahdys(t.x + t.leveys / 2, t.y + t.korkeus / 2);
        if (tila !== "peli") return true;
      }
    }
  }
  return false;
}

// Tulipallo osui tynnyriin (peli.js kutsuu) tai jokin muu sytytti sen
function sytytaTynnyri(t) {
  if (t.tila !== "ehja") return;
  t.tila = "sihisee";
  t.ajastin = TYNNYRIN_SIHINA;
  lisaaTeksti(t.x + 14, t.y - 12, "SIHISEE!");
  if (lahellaRuutua(t.x)) aanet.sihina();
}

function sytytaLanka(l) {
  l.palanut = 0;
  lisaaTeksti(l.pisteet[0][0], l.pisteet[0][1] - 20, "LANKA SYTTYI!");
  if (lahellaRuutua(l.pisteet[0][0])) aanet.sihina();
}

// Koskeeko laatikkoon jokin tulinen? (vihujen sylky, kipinä, laavajälki,
// tykinkuula, liekkisuihku tai laava)
function tuliKoskee(laatikko) {
  for (const s of kentta.syljet) if (osuu(s, laatikko)) return true;
  for (const j of kentta.laavajaljet) if (osuu(j, laatikko)) return true;
  for (const k of kentta.kuulat) if (!k.tuhottu && osuu(k, laatikko)) return true;
  for (const s of kentta.tulisuihkut) if (s.tila === "paalla" && osuu(suihkunAlue(s), laatikko)) return true;
  for (const l of kentta.laavat) if (laatikko.y + laatikko.korkeus > l.y + 8 && osuu(l, laatikko)) return true;
  for (const v of kentta.viholliset) {
    if (v.elossa && v.tyyppi === "kipina" && osuu(v, laatikko)) return true;
  }
  return false;
}

// Missä langan kohta on, kun kuljetaan "matka" pikseliä sytytyspäästä?
function langanKohta(l, matka) {
  for (let i = 1; i < l.pisteet.length; i++) {
    const [x1, y1] = l.pisteet[i - 1];
    const [x2, y2] = l.pisteet[i];
    const pala = Math.hypot(x2 - x1, y2 - y1);
    if (matka <= pala || i === l.pisteet.length - 1) {
      const osa = pala > 0 ? Math.min(1, matka / pala) : 1;
      return { x: x1 + (x2 - x1) * osa, y: y1 + (y2 - y1) * osa };
    }
    matka -= pala;
  }
  return { x: l.pisteet[0][0], y: l.pisteet[0][1] };
}

// PAM! Räjähdys kohdassa x, y.
function rajahdys(x, y) {
  kentta.rajahdykset.push({ x: x, y: y, ika: 0 });
  tarina = 18;
  if (lahellaRuutua(x)) aanet.rajahdys();
  lisaaHiukkasia(x, y, 40, ["#fff3a0", "#ffb000", "#ff3c00", "#555", "#333"], 8);

  // Onko asia räjähdyksen sisällä? Lasketaan matka asian lähimpään reunaan.
  const lahella = (asia) => {
    const dx = Math.max(asia.x - x, 0, x - (asia.x + asia.leveys));
    const dy = Math.max(asia.y - y, 0, y - (asia.y + asia.korkeus));
    return Math.hypot(dx, dy) <= RAJAHDYS_SADE;
  };

  // Vihut: räjähdys tuhoaa nekin, joihin tulipallo ei tehoa
  for (const v of kentta.viholliset.concat(kentta.lentovihut)) {
    if (v.elossa && !v.piilossa && lahella(v)) tuhoaVihu(v, true);
  }
  for (const k of kentta.kuulat) {
    if (lahella(k)) k.elossa = false;
  }
  // Tykit menevät rikki eivätkä enää ammu
  for (const t of kentta.tykit) {
    if (!t.rikki && lahella(t)) {
      t.rikki = true;
      pisteet += PISTEET_TYKKI;
      lisaaTeksti(t.x + 16, t.y - 10, "TYKKI RIKKI! +" + PISTEET_TYKKI);
    }
  }
  // Murtuvat seinät hajoavat
  for (const m of kentta.murtuvat) {
    if (m.eiKiintea || !lahella(m)) continue;
    m.eiKiintea = true;
    m.eiPiirreta = true;
    pisteet += PISTEET_SEINA;
    lisaaTeksti(m.x + m.leveys / 2, m.y - 10, "SEINÄ HAJOSI!");
    for (let py = m.y + 10; py < m.y + m.korkeus; py += 30) {
      lisaaHiukkasia(m.x + m.leveys / 2, py, 10, ["#555", "#777", "#333"], 6);
    }
  }
  // Muut tynnyrit syttyvät: ketjureaktio!
  for (const t of kentta.tynnyrit) {
    if (t.tila === "ehja" && lahella(t)) {
      t.tila = "sihisee";
      t.ajastin = 10;
    }
  }
  // Pomo (Magmamörkö) saa räjähdyksestä kunnon tällin
  const p = kentta.pomo;
  if (p && p.elossa && p.herannyt && porttiKiinni() && lahella(p)) osuPomoon(RAJAHDYS_VAHINKO);

  // Ja ukot, jos ne ovat liian lähellä
  for (const pl of elavatPelaajat().slice()) {
    if (pl.suojaAika > 0 || !lahella(pl)) continue;
    pelaaja = pl;
    lisaaTeksti(pl.x + 10, pl.y - 10, "PAM!");
    menetaElama();
    if (tila !== "peli") return;
  }
}

// ---------- LAAVATULVA ----------

// Tulvan vaiheet: mihin kohtaan jaksoa (0-1) kukin vaihe loppuu
const TULVA_ALHAALLA = 0.4;
const TULVA_VAROITUS = 0.52;
const TULVA_NOUSEE = 0.66;
const TULVA_YLHAALLA = 0.86;

function paivitaTulva(t, dt) {
  t.aika += dt;
  const kohta = (t.aika % t.jakso) / t.jakso;
  const ennen = t.tila;
  let nousu = 0; // 0 = alhaalla, 1 = ylhäällä
  if (kohta < TULVA_ALHAALLA) {
    t.tila = "alhaalla";
  } else if (kohta < TULVA_VAROITUS) {
    t.tila = "varoitus";
  } else if (kohta < TULVA_NOUSEE) {
    t.tila = "nousee";
    nousu = (kohta - TULVA_VAROITUS) / (TULVA_NOUSEE - TULVA_VAROITUS);
  } else if (kohta < TULVA_YLHAALLA) {
    t.tila = "ylhaalla";
    nousu = 1;
  } else {
    t.tila = "laskee";
    nousu = 1 - (kohta - TULVA_YLHAALLA) / (1 - TULVA_YLHAALLA);
  }
  // Pehmeä liike: hidas alussa ja lopussa, nopea keskellä
  nousu = nousu * nousu * (3 - 2 * nousu);
  t.laava.y = t.ala + (t.yla - t.ala) * nousu;
  t.laava.korkeus = 500 - t.laava.y;

  if (t.tila === "varoitus") {
    tarina = Math.max(tarina, 3); // maa tärisee: kohta laava nousee!
    if (ennen !== "varoitus") aanet.tulva();
  }
}

// Kun ukko menettää elämän, tulva alkaa alusta (laava on alhaalla),
// ettei ukko synny suoraan laavaan
function nollaaTulva() {
  const t = kentta.tulva;
  if (!t) return;
  t.aika = 0;
  t.tila = "alhaalla";
  t.laava.y = t.ala;
  t.laava.korkeus = 500 - t.ala;
}

// ---------- PIIRTÄMINEN ----------

function piirraRuuti(aika) {
  // Murtuvien seinien halkeamat (itse seinä on piirretty jo laattoina)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
  ctx.lineWidth = 2;
  for (const m of kentta.murtuvat) {
    if (m.eiKiintea || !naytolla(m.x, m.leveys)) continue;
    for (let y = m.y + 6; y < m.y + m.korkeus - 24; y += 44) {
      const x = m.x + m.leveys / 2;
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x + 3, y + 12);
      ctx.lineTo(x - 5, y + 22);
      ctx.lineTo(x + 8, y + 36);
      ctx.moveTo(x + 3, y + 12);
      ctx.lineTo(x + 13, y + 16);
      ctx.moveTo(x - 5, y + 22);
      ctx.lineTo(x - 14, y + 28);
      ctx.stroke();
    }
  }

  // Sytytyslangat: palanut osa on jo poissa
  for (const l of kentta.langat) {
    if (l.palanut >= l.pituus) continue;
    const alku = Math.max(0, l.palanut);
    ctx.lineCap = "round";
    for (const [vari, paksuus] of [["#2b1a0e", 5], ["#c9a36a", 2]]) {
      ctx.strokeStyle = vari;
      ctx.lineWidth = paksuus;
      ctx.beginPath();
      const p0 = langanKohta(l, alku);
      ctx.moveTo(p0.x, p0.y);
      let matka = 0;
      for (let i = 1; i < l.pisteet.length; i++) {
        matka += Math.hypot(l.pisteet[i][0] - l.pisteet[i - 1][0], l.pisteet[i][1] - l.pisteet[i - 1][1]);
        if (matka > alku) ctx.lineTo(l.pisteet[i][0], l.pisteet[i][1]);
      }
      ctx.stroke();
    }
    ctx.lineCap = "butt";
    const paa = langanKohta(l, alku);
    if (l.palanut < 0) {
      // Sytytyspää: pieni keppi, jonka päässä lanka odottaa. Rengas näyttää, mihin ampua.
      ctx.fillStyle = "#5a3a1a";
      ctx.fillRect(paa.x - 3, paa.y, 6, 24);
      ctx.strokeStyle = "rgba(255, 210, 60, " + (0.5 + Math.sin(aika / 200) * 0.3) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(paa.x, paa.y, 9 + Math.sin(aika / 200) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffd23c";
      ctx.fillRect(paa.x - 2, paa.y - 2, 4, 4);
    } else {
      // Liekki ryömii lankaa pitkin
      hehku(paa.x, paa.y, 26, "255, 200, 60", 0.8);
      ctx.fillStyle = "#fff3a0";
      ctx.beginPath();
      ctx.arc(paa.x, paa.y, 4 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Tynnyrit
  for (const t of kentta.tynnyrit) {
    if (t.tila === "poissa" || !naytolla(t.x, t.leveys)) continue;
    // Sihisevä tynnyri vilkkuu punaisena ja pullistelee
    const vilkku = t.tila === "sihisee" && Math.floor(aika / 70) % 2 === 0;
    const pullistus = t.tila === "sihisee" ? 2 : 0;
    const x = t.x - pullistus;
    const leveys = t.leveys + pullistus * 2;
    ctx.fillStyle = "black";
    ctx.fillRect(x - 1, t.y, leveys + 2, t.korkeus);
    ctx.fillRect(x + 1, t.y - 2, leveys - 2, t.korkeus + 2);
    ctx.fillStyle = vilkku ? "#ff5a3c" : "#8a4b1f";
    ctx.fillRect(x + 1, t.y + 2, leveys - 2, t.korkeus - 4);
    ctx.fillStyle = vilkku ? "#ffb09a" : "#b06a2e"; // vaalea raita: tynnyri näyttää pyöreältä
    ctx.fillRect(x + 5, t.y + 2, 5, t.korkeus - 4);
    ctx.fillStyle = "#3a3a3a"; // rautavanteet
    ctx.fillRect(x, t.y + 6, leveys, 4);
    ctx.fillRect(x, t.y + t.korkeus - 10, leveys, 4);
    // Varoitusmerkki: liekki
    ctx.fillStyle = "#ffd23c";
    ctx.beginPath();
    ctx.moveTo(t.x + 14, t.y + 11);
    ctx.lineTo(t.x + 19, t.y + 21);
    ctx.lineTo(t.x + 9, t.y + 21);
    ctx.fill();
  }

  // Räjähdyksen välähdys: kirkas pallo, joka kasvaa ja haalenee
  for (const r of kentta.rajahdykset) {
    const osa = r.ika / 24; // 0 = juuri räjähti, 1 = ohi
    ctx.globalAlpha = 1 - osa;
    ctx.fillStyle = osa < 0.3 ? "#fff8d0" : "#ffb000";
    ctx.beginPath();
    ctx.arc(r.x, r.y, RAJAHDYS_SADE * (0.4 + osa * 0.6), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ff3c00";
    ctx.lineWidth = 6 * (1 - osa);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

let tulvanLiuku = null; // tulvan liukuväri tehdään vain kerran

// Tulva piirretään kaiken muun päälle: se peittää alleen jäävät paikat
function piirraTulva(aika) {
  const t = kentta.tulva;
  if (!t) return;
  const l = t.laava;
  const alku = Math.max(l.x, kameraX - 20);
  const loppu = Math.min(l.x + l.leveys, kameraX + canvas.width + 20);
  if (l.y < canvas.height + 10 && loppu > alku) {
    if (!tulvanLiuku) {
      tulvanLiuku = ctx.createLinearGradient(0, 0, 0, 120);
      tulvanLiuku.addColorStop(0, "#ffb000");
      tulvanLiuku.addColorStop(0.25, "#ff5a00");
      tulvanLiuku.addColorStop(1, "#8a1500");
    }
    ctx.save();
    ctx.translate(0, l.y); // liukuväri alkaa aina laavan pinnasta
    ctx.globalAlpha = 0.94;
    ctx.fillStyle = tulvanLiuku;
    ctx.beginPath();
    ctx.moveTo(alku, 200);
    for (let x = alku; x <= loppu; x += 8) {
      ctx.lineTo(x, Math.sin(x / 30 + aika / 400) * 3 + Math.sin(x / 13 - aika / 250) * 1.5);
    }
    ctx.lineTo(loppu, 200);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    // Kirkas viiva pinnassa
    ctx.strokeStyle = "#ffe066";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = alku; x <= loppu; x += 8) {
      const y = Math.sin(x / 30 + aika / 400) * 3 + Math.sin(x / 13 - aika / 250) * 1.5;
      if (x === alku) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
    for (let x = alku + 30; x < loppu; x += 160) hehku(x, l.y, 70, "255, 120, 0", 0.25);
  }
}

// Varoitusteksti ruudun keskellä (piirretään pistetietojen kanssa, ei liiku kameran mukana)
function piirraTulvaVaroitus() {
  const t = kentta.tulva;
  if (!t || tila !== "peli") return;
  const vilkkuu = Math.floor(performance.now() / 180) % 2 === 0;
  if ((t.tila === "varoitus" || t.tila === "nousee") && vilkkuu) {
    reunaTeksti("▲ LAAVA NOUSEE! ▲", canvas.width / 2, 120, 26, "center", "#ffb000");
  }
}

// Valot pimeissä kentissä (tehosteet.js kutsuu tätä)
function ruutiValot(valo) {
  for (const l of kentta.langat) {
    if (l.palanut < 0 || l.palanut >= l.pituus) continue;
    const p = langanKohta(l, l.palanut);
    valo(p.x, p.y, 70);
  }
  for (const t of kentta.tynnyrit) if (t.tila === "sihisee") valo(t.x + 14, t.y + 10, 80);
  for (const r of kentta.rajahdykset) valo(r.x, r.y, 220);
}
