// ==========================================
//   KOSKETUSOHJAUS (kännykkä ja tabletti)
//   Ruudulla on napit, jotka "painavat näppäimistön nappeja" pelin puolesta.
//   Esimerkiksi ◀-nappi painaa vasenta nuolinäppäintä. Siksi pelin muuta
//   koodia ei tarvinnut muuttaa ollenkaan!
//   Napit ja niiden paikat ovat index.html-tiedostossa.
// ==========================================

// Pelataanko kosketusnäytöllä? "pointer: coarse" = sormi (ei hiiri).
// Tietokoneella voi kokeilla lisäämällä osoitteen loppuun ?kosketus
kosketusOhjaus =
  matchMedia("(pointer: coarse)").matches || location.search.includes("kosketus");

// Painaa (alas = true) tai päästää (alas = false) näppäimistön nappia
function painaNappia(koodi, alas) {
  dispatchEvent(new KeyboardEvent(alas ? "keydown" : "keyup", { code: koodi }));
}

// Koko ruudun tila ja vaakasuunta (toimii Androidissa, ei iPhonessa)
function koitaKokoRuutua() {
  const juuri = document.documentElement;
  if (document.fullscreenElement || !juuri.requestFullscreen) return;
  juuri
    .requestFullscreen()
    .then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock("landscape"))
    .catch(() => {}); // jos ei onnistu, ei haittaa
}

// Ruudun napautus. Valikoissa napautetaan riviä (peli.js: osoitaRuutua),
// muualla napautus on sama kuin välilyönti (jatkaa, valitsee kentän).
function napautaRuutua(sormi) {
  if (tila === "peli") return; // kesken pelin napautus ei tee mitään
  if (tila === "alku" || tila === "tauko" || tila === "ohjeet") {
    osoitaRuutua(sormi.clientX, sormi.clientY, true);
    return;
  }
  const koodi = tila === "havio" || tila === "voitto" ? "KeyR" : "Enter";
  painaNappia(koodi, true);
  painaNappia(koodi, false);
}

// Nappien koko: 🔍-nappi vaihtaa kokoa, ja valinta muistetaan
const NAPPIKOOT = [1, 1.2, 1.4, 0.85]; // normaali, iso, tosi iso, pieni
let nappikoko = 0; // monesko koko listasta on käytössä

function asetaNappikoko(numero) {
  nappikoko = numero % NAPPIKOOT.length;
  document.documentElement.style.setProperty("--koko", NAPPIKOOT[nappikoko]);
  try {
    localStorage.setItem("ukonSeikkailuNappikoko", String(nappikoko));
  } catch (virhe) {
    // ei haittaa, koko vain ei tallennu
  }
}

// ---------- ASETUKSET ⚙️ ----------
// Ruudulla näkyvät vain ohjausnapit ja ⚙️. Muut napit ovat ⚙️:n takana.
function avaaTaiSuljeAsetukset(auki) {
  document.body.classList.toggle("asetukset-auki", auki);
  paivitaAsetusnapit();
}

function asetuksetAuki() {
  return document.body.classList.contains("asetukset-auki");
}

// Napit näyttävät, mikä on päällä: 🔊 / 🔇 ja FPS keltaisena, kun mittari näkyy
function paivitaAsetusnapit() {
  const aani = document.getElementById("aanikuvake");
  if (aani) aani.textContent = aanetPaalla ? "🔊" : "🔇";
  const fps = document.querySelector('[data-toiminto="fps"]');
  if (fps) fps.classList.toggle("paalla", naytaFps);
}

if (kosketusOhjaus) {
  document.body.classList.add("kosketus");
  try {
    asetaNappikoko(Number(localStorage.getItem("ukonSeikkailuNappikoko")) || 0);
  } catch (virhe) {
    asetaNappikoko(0);
  }
  const napit = document.querySelectorAll("[data-nappi]");
  let pohjassa = new Set(); // napit, joiden päällä on nyt sormi

  // Käydään läpi kaikki sormet ruudulla ja katsotaan, minkä napin päällä ne ovat.
  // Näin sormen voi liu'uttaa ◀-napista ▶-nappiin nostamatta sitä.
  function paivitaSormet(e) {
    const nyt = new Set();
    for (const sormi of e.touches) {
      const kohta = document.elementFromPoint(sormi.clientX, sormi.clientY);
      const nappi = kohta && kohta.closest("[data-nappi]");
      if (nappi) nyt.add(nappi.dataset.nappi);
    }
    for (const koodi of nyt) if (!pohjassa.has(koodi)) painaNappia(koodi, true);
    for (const koodi of pohjassa) if (!nyt.has(koodi)) painaNappia(koodi, false);
    pohjassa = nyt;
    for (const nappi of napit) nappi.classList.toggle("pohjassa", nyt.has(nappi.dataset.nappi));
  }

  document.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault(); // estää zoomauksen ja sivun vierityksen
      kaynnistaAanet();
      koitaKokoRuutua();
      let suljeLopuksi = false;
      for (const sormi of e.changedTouches) {
        const kohde = sormi.target;
        if (kohde.id === "peli") {
          avaaTaiSuljeAsetukset(false); // napautus pelin päälle sulkee asetukset
          napautaRuutua(sormi);
        }
        if (kohde.closest("#asetusnappi")) avaaTaiSuljeAsetukset(!asetuksetAuki());
        const toiminto = kohde.closest("[data-toiminto]");
        if (toiminto && toiminto.dataset.toiminto === "koko") asetaNappikoko(nappikoko + 1);
        if (toiminto && toiminto.dataset.toiminto === "fps") vaihdaFps();
        if (kohde.closest('[data-nappi="Escape"]')) suljeLopuksi = true; // tauko: valikko tulee näkyviin
      }
      paivitaSormet(e);
      if (suljeLopuksi) avaaTaiSuljeAsetukset(false);
      paivitaAsetusnapit();
    },
    { passive: false },
  );
  for (const tapahtuma of ["touchmove", "touchend", "touchcancel"]) {
    document.addEventListener(
      tapahtuma,
      (e) => {
        e.preventDefault();
        if (tapahtuma === "touchend") kaynnistaAanet(); // iPhone sallii äänet vasta tästä
        paivitaSormet(e);
        paivitaAsetusnapit(); // esim. 🔊 vaihtuu 🔇:ksi heti
      },
      { passive: false },
    );
  }
}
