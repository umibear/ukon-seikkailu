# Ukon seikkailu 🎮

Tasohyppelypeli, jossa on kaksi maailmaa, yhteensä 11 kenttää ja kaksi pomoa (Isäukko ja Magmamörkö).

## ▶ Pelaa: https://umibear.github.io/ukon-seikkailu/

Toimii tietokoneella ja kännykän selaimessa.

## Ohjaus

| | Näppäimistö | Kännykkä |
|---|---|---|
| Liiku | ← → tai A D | ◀ ▶ |
| Hyppää (pidä pohjassa = korkeampi hyppy) | ↑, W tai välilyönti | ⬆ |
| Tulipallo | X | 🔥 |
| Kartalle / kenttä alusta / äänet | Esc / R / M | ☰ / ↻ / 🔊 |

**Kaksinpeli** (tietokoneella): valitse alkuruudussa nuolilla 2 pelaajaa.
Pelaaja 1: A D W + F, pelaaja 2: ← → ↑ + L tai Enter.

## Koodi

Peli on tehty tavallisella JavaScriptillä ilman kirjastoja. Kuvat on piirretty pikseli kerrallaan.
Kansiossa `testit/` on botti, joka kokeilee, pääseekö kentät läpi: `node testit/botti.js 7`
