# Ukon seikkailu 🎮

Tasohyppelypeli, jossa on kolme maailmaa, yhteensä 17 kenttää ja kolme pomoa (Isäukko, Magmamörkö ja Pakkasukko).

| Maailma | Kentät | Mitä uutta |
|---|---|---|
| 1. Vihreä saari | 1–5 | hyppiminen, tulipallot, seinähypyt, pomo Isäukko |
| 2. Tulivuorisaari | 6–11 | laava, liekkisuihkut, tykit, pomo Magmamörkö |
| 3. Pakkassaari | 12–17 | liukas jää, sulavat jäälohkot, nuotiot, jääpuikot, hyinen vesi, tuulenpuuskat, pomo Pakkasukko |

## ★ Vaikea taso

Alkuvalikosta voi valita vaikeuden: **Normaali** tai **Vaikea**. Normaali on sama peli kuin ennenkin.
Vaikealla jokaisessa maailmassa on oma uusi juttunsa, ja jokaisella vihulla on uusi temppu.
Kun kentän pääsee läpi vaikealla, kartalle tulee tähti ★.

| Maailma | Vaikealla |
|---|---|
| 1. Vihreä saari | **liaanit**: hyppää liaaniin, heilu ◀ ▶ ja hyppää irti. Varo: tulipallo polttaa liaanin! |
| 2. Tulivuorisaari | **ruutitynnyrit** ja sytytyslangat (räjäytä seinät, tykit ja vihut) sekä **laavatulva**, joka nousee välillä |
| 3. Pakkassaari | **pakkanen puree**: tulimittari on ukon lämpö. Se hupenee koko ajan, ja lämpöä saa vain nuotiolta ja hyppäämällä vihujen päälle |

Vihujen temput on lueteltu tiedoston `vaikea.js` alussa, ja kenttien muutokset ovat tiedostossa `vaikeatkentat.js`.
Kokeile lisätä kenttään oma liaani tai tynnyri!

## ▶ Pelaa: https://umibear.github.io/ukon-seikkailu/

Toimii tietokoneella ja kännykän selaimessa.

## Ohjaus

| | Näppäimistö | Kännykkä |
|---|---|---|
| Liiku | ← → tai A D | ◀ ▶ |
| Hyppää (pidä pohjassa = korkeampi hyppy) | ↑, W tai välilyönti | ⬆ |
| Tulipallo | X | 🔥 |
| Tauko / maailma alusta (paina 2 kertaa) / äänet | Esc / R / M | ⚙️ → ⏸ / ↻ / 🔊 |
| FPS-mittari (ruutuja sekunnissa) | F3 | ⚙️ → 📊 |
| Nappien koko | – | ⚙️ → 🔍 |

**Kaksinpeli** (tietokoneella): valitse alkuvalikosta **Pelaajat: 2**.
Pelaaja 1: A D W + F, pelaaja 2: ← → ↑ + L tai Enter.

## Koodi

Peli on tehty tavallisella JavaScriptillä ilman kirjastoja. Kuvat on piirretty pikseli kerrallaan.
Jokaisella kentällä on oma kappale. Nuotit ovat tiedostossa `musiikki.js`, ja niitä voi muokata itse.
Musiikin saa pois taukovalikosta (Esc / ☰).

Pakkassaaren kuvat on piirretty suoraan koodiin kirjaimilla (yksi kirjain = yksi pikseli):
katso `pakkanen.js` ja `pakkasvihut.js` ja kokeile muuttaa niitä!

Hitaalla kännykällä peli siirtyy itse **kevyeen tilaan** (vähemmän hehkuja ja lumihiutaleita).
Sen saa päälle myös lisäämällä osoitteen loppuun `?kevyt`.

Nopeuden voi mitata: `node testit/suorituskyky.js`
Kansiossa `testit/` on botti, joka kokeilee, pääseekö kentät läpi: `node testit/botti.js 7`
(vaikealla: `VAIKEA=1 node testit/botti.js 7`)

## Lisenssi

MIT – katso [LICENSE](LICENSE). Saat käyttää, muokata ja jakaa peliä vapaasti, kunhan lisenssiteksti pysyy mukana.
