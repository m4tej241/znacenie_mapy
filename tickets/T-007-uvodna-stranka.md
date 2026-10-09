---
id: T-007
nazov: Úvodná stránka s cenníkom (mesačné a ročné predplatné)
stav: draft
faza: 4
zavisi-od: []
vetva:
---

## Kontext

Na komerčné spustenie treba verejnú úvodnú stránku, ktorá vysvetlí appku a ukáže cenník. Paddle bez hotového webu s cenníkom predajcu neschváli (`specifikacia.md` kap. 13.5, 14, fáza 4 v kap. 11). Cena je rozhodnutá (kap. 13.4): **3 € mesačne, 25 € ročne**.

Hotový vizuálny návrh je v [`tickets/assets/T-007-landing-navrh.html`](assets/T-007-landing-navrh.html). Je to súbor z návrhového nástroja (formát `.dc.html`), nespúšťa sa. Slúži ako presná predloha textov, farieb, rozmerov a SVG ilustrácie, ktorá sa prepíše do React komponentov.

## Rozsah

**Áno:**
- nová statická úvodná stránka na koreni webu (`/`), samostatný vstupný bod Vite,
- presun mapovej appky na `/app/`,
- presmerovanie starých odkazov s pozíciou mapy (`/#15/49.12/20.06` → `app/#15/49.12/20.06`),
- sekcie: navigácia, úvod s ilustráciou mapy, Ako to funguje, Funkcie, Cenník, Časté otázky, záverečná výzva, pätička s atribúciou,
- cenník s dvoma plánmi: mesačné 3 €, ročné 25 €,
- responzívne rozloženie (od 360 px šírky),
- úprava `CLAUDE.md` (štruktúra, nová URL skúšobného miesta).

**Nie (mimo tohto tiketu):**
- Paddle Checkout a stav predplatného. Tlačidlá plánov zatiaľ vedú do appky (`app/`), napojenie na checkout je samostatný tiket.
- Obchodné podmienky, ochrana súkromia, refundácie, kontakt. Kým tieto stránky neexistujú, odkazy na ne sa v pätičke **nezobrazujú**.
- Registrácia a prihlásenie (T-002). „Prihlásiť sa“ zatiaľ vedie na `app/`.
- Prepínač mesačné/ročné. Oba plány sa zobrazujú vedľa seba.
- Žiadne nové externé služby (analytika, sledovanie, Google Fonts zo serverov Google).

## Technické riešenie

### Viac vstupných bodov Vite

- `apps/web/app/index.html`: nový súbor, kópia súčasného `apps/web/index.html` (skript `/src/main.tsx`). Appka sa nemení, len beží na inej adrese.
- `apps/web/index.html`: prepíše sa na úvodnú stránku. `<title>Prejdené trasy – mapa prejdených turistických trás</title>`, `<meta name="description" content="Turistická mapa Slovenska a Česka, na ktorej si označíš prejdené úseky trás.">`, skript `/src/landing/main.tsx`.
- `apps/web/vite.config.ts`: `build.rollupOptions.input` = `{ main: resolve(__dirname, 'index.html'), app: resolve(__dirname, 'app/index.html') }` (`resolve` z `node:path`; ak `__dirname` v ESM chýba, `fileURLToPath(new URL('.', import.meta.url))`).
- Build v `.github/workflows/pages.yml` sa nemení (`--base=/<repo>/` funguje pre oba vstupy). Všetky odkazy z úvodnej stránky do appky sú **relatívne** (`app/`), nikdy `/app/`, aby fungovali pod base cestou GitHub Pages.
- Úvodná stránka **neimportuje** `maplibre-gl` ani `pmtiles` (nesmú byť v jej bundli).

### Presmerovanie starých odkazov

V `src/landing/main.tsx` ešte pred vykreslením: ak `location.hash` zodpovedá `/^#\d+(\.\d+)?\/-?\d+(\.\d+)?\/-?\d+(\.\d+)?/`, zavolaj `location.replace('app/' + location.hash)`. Kotvy sekcií (`#cennik` a pod.) sa tým nepresmerujú.

### Súbory úvodnej stránky

- `src/landing/main.tsx`: presmerovanie, import fontov a `landing.css`, `createRoot(...).render(<Landing />)`.
- `src/landing/Landing.tsx`: celá stránka, sekcie ako malé komponenty v tom istom súbore (`Hero`, `HowItWorks`, `Features`, `Pricing`, `Faq`, `Footer`).
- `src/landing/HeroMap.tsx`: inline SVG ilustrácia mapy, prevzatá z návrhu (blok `<svg viewBox="0 0 600 460">`), atribúty prepísané do JSX (`stroke-width` → `strokeWidth` atď.). Farby trás importuj z `src/mapStyle.ts`, ak sú tam exportované, inak použi rovnaké hodnoty (`#d32f2f`, `#1565c0`, `#2e7d32`, `#f9a825`).
- `src/landing/plans.ts`: ceny ako dáta.
  ```ts
  export const PRICE_MONTHLY_EUR = 3
  export const PRICE_YEARLY_EUR = 25
  export const yearlyPerMonth = PRICE_YEARLY_EUR / 12                    // 2,08 €
  export const yearlySavingPct = Math.floor((1 - PRICE_YEARLY_EUR / (12 * PRICE_MONTHLY_EUR)) * 100) // 30 %
  export const formatEur = (v: number) =>
    new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR',
      minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v)
  ```
- `src/landing/landing.css`: štýly stránky (CSS premenné na `:root`, triedy po anglicky, napr. `.plan`, `.plan--featured`). Nepoužívať inline štýly z návrhu doslova, prepísať do tried.
- Fonty lokálne cez npm (nie Google Fonts kvôli GDPR): `@fontsource-variable/archivo` (nadpisy, `font-stretch: 85%`, váha 800–850) a `@fontsource/public-sans` (400, 500, 600, 700) na text. Obe musia obsahovať latin-ext (ľ, ť, ô, ä).

### Vzhľad (podľa návrhu)

| Token | Hodnota |
|---|---|
| Pozadie | `#f4f6f1` |
| Text, tmavé sekcie, hlavné tlačidlo | `#17251c` |
| Sekundárny text | `#4a5a4f` (na tmavom `#c3cfc6`) |
| Pozadie cenníka | `#e4eadc` |
| Okraje | `#d3dbc9`, karty `#e1e6da` |
| Zvýraznenie („už bol.“, štítok Výhodnejšie) | `#d32f2f` |

Obsah do šírky 1200 px, bočný okraj 24 px. Tlačidlá a odkazy v navigácii majú výšku min. 44 px. Ikony sú inline SVG (obrys, `stroke-width` 2), žiadne emoji.

### Texty (presne, po slovensky)

**Navigácia:** logo „Prejdené trasy“, odkazy „Ako to funguje“ (`#ako`), „Funkcie“ (`#funkcie`), „Cenník“ (`#cennik`), „Otázky“ (`#otazky`), tlačidlo „Prihlásiť sa“ (`app/`). Na mobile (< 640 px) sa skryjú kotvy a zostane logo a „Prihlásiť sa“.

**Úvod:** štítok „Značené trasy Slovenska a Česka“, nadpis „Uvidíš, kde všade si už bol.“ (časť „už bol.“ červenou), text „Turistická mapa, na ktorej si jedným klikom označíš prejdené úseky trás. Otvoríš hory a hneď vidíš, ktoré chodníky máš za sebou a ktoré ešte čakajú.“, tlačidlá „Pozrieť cenník“ (`#cennik`) a „Ako to funguje“ (`#ako`). Vpravo `HeroMap` s plávajúcou kartičkou „Úsek označený ako prejdený / Sedlo → Pleso“.

**Ako to funguje** (tmavá sekcia): nadpis „Tri kroky od túry k vyfarbenej mape“, kroky:
1. „Nájdi trasu na mape“: „Podkladom je podrobná turistická mapa Mapy.com so všetkými značenými trasami.“
2. „Klikni na úsek“: „Trasy sú rozdelené na úseky medzi rozcestníkmi. Označíš presne to, čo si prešiel, nie celú magistrálu.“
3. „Sleduj, ako mapa rastie“: „Prejdené úseky svietia vo farbe svojej trasy hrubou čiarou. Pri každom priblížení vidíš, kde si už bol.“

**Funkcie:** nadpis „Všetko, čo potrebuješ na zbieranie kilometrov“, karty:
- „Mapa Mapy.com“: „Rovnaká turistická mapa, akú poznáš z mapy.com: vrstevnice, chaty, rozcestníky.“
- „Úseky medzi rozcestníkmi“: „Každá značená trasa je rozdelená na kúsky, takže označíš aj polovicu hrebeňovky.“
- „Farby trás“ (so štyrmi farebnými pásikmi): „Prejdený úsek sa vyfarbí farbou svojej značky: červená, modrá, zelená, žltá.“
- „Počítač aj mobil“: „Funguje v prehliadači. Doma plánuješ na veľkej obrazovke, na chate označuješ v mobile.“
- „Slovensko a Česko“: „Všetky značené turistické trasy oboch krajín, z dát OpenStreetMap.“
- „Import GPX a štatistiky“ + štítok „Pripravujeme“ (prerušovaný okraj): „Nahráš záznam z hodiniek a prejdené úseky sa označia samy.“

**Cenník:** nadpis „Jednoduchý cenník“, podnadpis „Rovnaké funkcie v oboch plánoch. Vyber si, ako chceš platiť.“
- Karta **Mesačné** (biela): „Pre tých, čo chodia hlavne v sezóne.“, cena `formatEur(PRICE_MONTHLY_EUR)` + „/ mesiac“, body „Všetky značené trasy SK a CZ“, „Neobmedzené označovanie úsekov“, „Na počítači aj v mobile“, „Zrušíš kedykoľvek“, tlačidlo „Zvoliť mesačné“ (obrys).
- Karta **Ročné** (tmavá, štítok „Výhodnejšie“): „Celý rok hôr, zima aj leto.“, cena `formatEur(PRICE_YEARLY_EUR)` + „/ rok“, riadok „vychádza na {formatEur(yearlyPerMonth)} mesačne, ušetríš {yearlySavingPct} %“, body „Všetko z mesačného plánu“, „Jedna platba ročne“, „Nižšia cena za mesiac“, „Zrušíš kedykoľvek“, tlačidlo „Zvoliť ročné“ (svetlé).
- Obe tlačidlá zatiaľ vedú na `app/`.
- Pod kartami: „Platby bezpečne spracúva Paddle: karta, Apple Pay, Google Pay alebo PayPal. Paddle vystaví faktúru a postará sa o DPH. Predplatné zrušíš alebo zmeníš v zákazníckom portáli.“
- Karty vedľa seba, pod 700 px pod sebou (ročná prvá).

**Časté otázky:**
- „Funguje appka aj bez signálu?“: „Nie, appka funguje iba online. Podmienky Mapy.com nedovoľujú ukladať mapu do zariadenia. Úseky si môžeš označiť aj doma po túre.“
- „Ktoré krajiny pokrýva?“: „Slovensko a Česko, všetky značené turistické trasy. Ďalšie krajiny plánujeme neskôr.“
- „Môžem predplatné zrušiť?“: „Áno, kedykoľvek v zákazníckom portáli. Prístup ti zostane do konca zaplateného obdobia.“
- „Môžem prejsť z mesačného na ročné?“: „Áno, plán zmeníš v zákazníckom portáli.“

**Záverečná výzva:** „Vyfarbi si hory, ktoré už poznáš.“ + tlačidlo „Vybrať plán“ (`#cennik`).

**Pätička:** „Prejdené trasy“ a „Mapové podklady: Mapy.com · © Seznam.cz a.s. and others · © OpenStreetMap contributors“ („Mapy.com“ je odkaz na `https://mapy.com`). Odkazy na právne dokumenty zatiaľ nie (pozri Rozsah).

### Úpravy dokumentácie

- `CLAUDE.md`: v časti Štruktúra doplniť `index.html` + `src/landing/` (úvodná stránka) a `app/index.html` (appka). Skúšobné miesto zmeniť na `http://localhost:5173/app/#15/49.1208467/20.0605401`.

## Akceptačné kritériá

- [ ] `http://localhost:5173/` zobrazí úvodnú stránku, `http://localhost:5173/app/` mapovú appku, ktorá funguje ako doteraz (výber úseku klikom na Štrbskom plese).
- [ ] `http://localhost:5173/#15/49.1208467/20.0605401` presmeruje na `/app/#15/49.1208467/20.0605401`; `/#cennik` nepresmeruje a posunie na cenník.
- [ ] Cenník ukazuje „3 €“ / mesiac a „25 €“ / rok a riadok „vychádza na 2,08 € mesačne, ušetríš 30 %“. Hodnoty sa počítajú z `plans.ts`.
- [ ] Všetky texty sa zhodujú s tiketom, diakritika sa vykresľuje správnym fontom (Archivo, Public Sans), fonty sa nenačítavajú z `fonts.googleapis.com`.
- [ ] Pri šírke 390 px nie je vodorovný posuvník, karty cenníka sú pod sebou a navigácia sa zmestí na jeden riadok.
- [ ] Odkazy do appky sú relatívne (`app/`); `npm run build -- --base=/znacenie_mapy/` vytvorí `dist/index.html` aj `dist/app/index.html` a odkazy v nich obsahujú base cestu.
- [ ] Bundle úvodnej stránky neobsahuje `maplibre-gl` (v `dist/assets` je JS úvodnej stránky výrazne menší ako appky).
- [ ] Pätička obsahuje atribúciu Mapy.com, Seznam.cz a OpenStreetMap, nie sú v nej odkazy na neexistujúce stránky.
- [ ] `npx tsc -b && npm run build` prejde bez chýb.
- [ ] `CLAUDE.md` je aktualizovaný.

## Overenie

```bash
cd apps/web && npm install && npx tsc -b && npm run build -- --base=/znacenie_mapy/
ls dist dist/app && grep -o 'src="[^"]*"' dist/index.html dist/app/index.html
grep -l maplibre dist/assets/*.js        # nesmie zahŕňať súbor úvodnej stránky
npm run dev
```

V headless Chrome (puppeteer-core, pozri `CLAUDE.md`):
- snímka `http://localhost:5173/` pri 1280×800 (celá stránka, `fullPage: true`) a pri 390×844, porovnať s návrhom v `tickets/assets/T-007-landing-navrh.html`,
- otvoriť `http://localhost:5173/#15/49.1208467/20.0605401`, overiť, že `location.pathname` končí na `/app/` a mapa je na Štrbskom plese,
- v `/app/` klik na (640,400) vyberie úsek magistrály,
- v sieťových požiadavkách úvodnej stránky nie je `fonts.googleapis.com` ani `fonts.gstatic.com`.

## Otvorené otázky

- **Kedy stránku nasadiť do `main`?** Po merge do `main` sa nasadí na GitHub Pages a verejne ukáže ceny, hoci sa predplatné ešte nedá kúpiť. Možnosti: nechať tiket na `dev` až do fázy 4, alebo nasadiť skôr a tlačidlá plánov dočasne nahradiť textom (napr. „Čoskoro“).
- **Zostane prístup do konca zaplateného obdobia aj po zrušení?** Odpoveď v Častých otázkach to sľubuje, musí to sedieť s nastavením Paddle.
- **Skúšobné obdobie a refundácie:** stránka ich zatiaľ nespomína. Ak sa zavedú, treba doplniť text do cenníka.

## Výsledok implementácie

