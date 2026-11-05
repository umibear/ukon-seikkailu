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

// Ruudun napautus: sama kuin välilyönti (aloittaa, jatkaa, valitsee kentän)
function napautaRuutua() {
  if (tila === "peli") return; // kesken pelin napautus ei tee mitään
  const koodi = tila === "havio" || tila === "voitto" ? "KeyR" : "Enter";
  painaNappia(koodi, true);
  painaNappia(koodi, false);
}

if (kosketusOhjaus) {
  document.body.classList.add("kosketus");
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
      for (const sormi of e.changedTouches) {
        if (sormi.target.id === "peli") napautaRuutua();
      }
      paivitaSormet(e);
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
      },
      { passive: false },
    );
  }
}
