# Ukon seikkailu 🎮

Tasohyppelypeli, jossa on neljä maailmaa, yhteensä 23 kenttää ja neljä pomoa (Isäukko, Magmamörkö, Pakkasukko ja Hiekkamato).

**Tarina.** Ukon kotisaaren majakasta ovat kadonneet neljä valokiveä, eivätkä veneet enää löydä kotiin.
Jokaisella pomolla on yksi kivi. Tarina kerrotaan lyhyinä kuvakohtauksina pelin alussa, jokaisen pomon
jälkeen ja lopussa (VÄLILYÖNTI vie eteenpäin, ESC ohittaa). Tekstit ovat tiedoston `tarina.js` alussa: kokeile kirjoittaa oma tarina!

| Maailma | Kentät | Mitä uutta |
|---|---|---|
| 1. Vihreä saari | 1–5 | hyppiminen, tulipallot, seinähypyt, pomo Isäukko |
| 2. Tulivuorisaari | 6–11 | laava, liekkisuihkut, tykit, pomo Magmamörkö |
| 3. Pakkassaari | 12–17 | liukas jää, sulavat jäälohkot, nuotiot, jääpuikot, hyinen vesi, tuulenpuuskat, pomo Pakkasukko |
| 4. Aavikkosaari | 18–23 | paahtava aurinko ja varjot, juoksuhiekka, kangastukset, pölypyörteet, pimeä pyramidi, pomo Hiekkamato |

**Aavikkosaari lyhyesti.** Auringossa ukon päällä oleva paahdemittari nousee: lepää välillä palmun,
tason tai pilven varjossa. **Juoksuhiekkaan** uppoaa hitaasti: pidä hyppy pohjassa, niin ukko hyppii ulos
(hypyt heikkenevät, joten leveässä hiekassa pitää kulkea kiviä pitkin). **Kangastus** näyttää tasolta mutta
haihtuu, kun tulet lähelle. Kaktukseen ei saa koskea, skorpioni piileskelee hiekassa, pölypyörre heittää
ukon korkealle ja muumion voi tuhota vain tulipallolla. Koodi: `aavikko.js`, `aavikkovihut.js`,
`hiekkamato.js` ja kentät `kentat4.js`.

## ★ Vaikea taso

Alkuvalikosta voi valita vaikeuden: **Normaali** tai **Vaikea**. Normaali on sama peli kuin ennenkin.
Vaikealla jokaisessa maailmassa on oma uusi juttunsa, ja jokaisella vihulla on uusi temppu.
Kun kentän pääsee läpi vaikealla, kartalle tulee tähti ★.

| Maailma | Vaikealla |
|---|---|
| 1. Vihreä saari | **liaanit**: hyppää liaaniin, heilu ◀ ▶ ja hyppää irti. Varo: tulipallo polttaa liaanin! |
| 2. Tulivuorisaari | **ruutitynnyrit** ja sytytyslangat (räjäytä seinät, tykit ja vihut) sekä **laavatulva**, joka nousee välillä |
| 3. Pakkassaari | **pakkanen puree**: tulimittari on ukon lämpö. Se hupenee koko ajan, ja lämpöä saa vain nuotiolta ja hyppäämällä vihujen päälle |
| 4. Aavikkosaari | **aurinko polttaa**: täysi paahdemittari vie elämän (normaalilla se vain pyörryttää). Juoksuhiekka upottaa nopeammin ja hyppyä pitää näpytellä, **kivet vajoavat** hiekkaan, kun niiden päällä seistään, ja kaktukset ampuvat piikkejä |

Vihujen temput on lueteltu tiedoston `vaikea.js` alussa, ja kenttien muutokset ovat tiedostossa `vaikeatkentat.js`.
Kokeile lisätä kenttään oma liaani tai tynnyri!

## 💎 Salakuopat, aarteet ja varjo

**Salakuopat.** Jokaisessa kentässä on yksi kuoppa, joka ei olekaan vaarallinen. Se näyttää aivan
tavalliselta kuopalta, laavalta, avannolta tai juoksuhiekalta, mutta kun siihen putoaa (tai uppoaa), päätyy salaiseen
**aarrekammioon**! Siellä odottaa timantti (+1000 pistettä) ja sydän. Ulos pääsee kävelemällä oikealle.
Pieni vihje: salakuopan suulla välähtää silloin tällöin tähti. Löydetyt aarteet näkyvät kartalla,
ja kun kaikki on löydetty, Ukosta tulee **kultainen**.

**Varjo.** Peli muistaa jokaisen kentän parhaan ajan. Kun pelaat kentän uudestaan, rinnallasi juoksee
tumma varjo, joka kulkee täsmälleen niin kuin sinä kuljit parhaalla kerrallasi. Ehditkö maaliin ennen sitä?
Varjon saa pois taukovalikosta.

Salakuoppien paikat ovat tiedostossa `aarteet.js` (lista `SALAKUOPAT`): kokeile siirtää salakuoppa toiseen kuoppaan!
Varjon koodi on tiedostossa `varjo.js`.

## 🔨 Kenttäpaja: rakenna omia kenttiä

Alkuvalikosta **Rakenna kenttä** vie Omalle saarelle. Sinne mahtuu 8 omaa kenttää.

1. Paina **+ Rakenna uusi kenttä** ja valitse maailma (se päättää, miltä kenttä näyttää ja mitä vihuja siinä on).
2. Valitse palikka vasemmalta ja napauta kenttää. Sormea tai hiirtä vetämällä tulee monta peräkkäin.
   Saman palikan napautus uudestaan ottaa sen pois.
3. Oikealla ovat työkalut: **▶** kokeilee kenttää heti, ✋ siirtää kenttää, pyyhekumi, ↩ kumoa, « » vieritys ja ✔ valmis.
4. Kokeilussa kuolema ei haittaa: pääset takaisin muokkaamaan siihen kohtaan, missä kävi huonosti.

Valmiin kentän voi **jakaa linkkinä** (Jaa-nappi). Kun kaveri avaa linkin, kenttä ilmestyy hänen Omalle saarelleen.
Koko kenttä on itse linkissä, joten mitään ei tallenneta nettiin.

Tietokoneella: nuolet tai A D vierittävät, Z kumoaa, Enter kokeilee ja Esc palaa takaisin.
Palikat ovat tiedostossa `omatkentat.js` ja paja tiedostossa `paja.js`.

## ▶ Pelaa: https://umibear.github.io/ukon-seikkailu/

Toimii tietokoneella ja kännykän selaimessa.
Kännykässä pelin saa aloitusnäytölle kuin sovelluksen: selaimen valikosta **Lisää aloitusnäytölle**.
Se aukeaa koko ruudulle ja päivittyy itsestään, koska peli ladataan aina netistä.

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

Pakkassaaren ja Aavikkosaaren kuvat on piirretty suoraan koodiin kirjaimilla (yksi kirjain = yksi pikseli):
katso `pakkanen.js`, `pakkasvihut.js`, `aavikko.js` ja `aavikkovihut.js` ja kokeile muuttaa niitä!

Hitaalla kännykällä peli siirtyy itse **kevyeen tilaan** (vähemmän hehkuja ja lumihiutaleita).
Sen saa päälle myös lisäämällä osoitteen loppuun `?kevyt`.

Nopeuden voi mitata: `node testit/suorituskyky.js`
Kansiossa `testit/` on botti, joka kokeilee, pääseekö kentät läpi: `node testit/botti.js 7`
(vaikealla: `VAIKEA=1 node testit/botti.js 7`)

## Lisenssi

MIT – katso [LICENSE](LICENSE). Saat käyttää, muokata ja jakaa peliä vapaasti, kunhan lisenssiteksti pysyy mukana.
