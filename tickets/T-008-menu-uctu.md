---
id: T-008
nazov: Menu účtu vpravo hore na mape
stav: draft
faza: 1
zavisi-od: [T-002]
vetva:
---

## Kontext

Na obrazovke mapy chýba cesta k vlastnému účtu. Vpravo hore pribudne tlačidlo „Môj účet“, ktoré otvorí menu s profilom, nastaveniami, predplatným a odhlásením. Vzhľad je rovnaký ako úvodná stránka (T-007): tmavozelená `#17251c`, písma Archivo a Public Sans, zaoblené biele karty. Súvisí s `specifikacia.md` kap. 14.1 (stránka účtu, odhlásenie) a kap. 13 (predplatné).

Vizuálne návrhy (formát `.dc.html` z návrhového nástroja, nespúšťajú sa, slúžia ako presná predloha):
- počítač 1280×800: [`tickets/assets/T-008-menu-uctu-pocitac.html`](assets/T-008-menu-uctu-pocitac.html),
- mobil 390×844: [`tickets/assets/T-008-menu-uctu-mobil.html`](assets/T-008-menu-uctu-mobil.html).

Ilustrácia mapy, textové logo „Mapy.com“ a štýl panela nástrojov v návrhoch nie sú súčasťou tiketu, v appke zostáva skutočná mapa, logo a panel.

## Rozsah

**Áno:**
- komponent `AccountMenu`: tlačidlo vpravo hore a rozbaľovacie menu,
- hlavička menu s e-mailom prihláseného používateľa,
- položky Profil, Nastavenia, Predplatné a Odhlásiť sa,
- správanie: otvorenie/zatvorenie, klik mimo, Escape, ovládanie klávesnicou,
- mobilné rozloženie (do 640 px šírky),
- posun ovládacích prvkov MapLibre vpravo hore (priblíženie, poloha) pod tlačidlo účtu.

**Nie (mimo tohto tiketu):**
- samotné stránky Profil, Nastavenia a Predplatné (stránka účtu je T-006, predplatné samostatný tiket s Paddle),
- štítok predplatného v hlavičke („Ročné predplatné, do [dátum]“) z návrhu. Zobrazí sa až keď bude v databáze stav predplatného (tiket s Paddle),
- prihlásenie a odhlásenie samotné (T-002); tento tiket len volá funkciu odhlásenia z T-002,
- zmena štýlu panela nástrojov, výberového panela úseku alebo farby `--accent`.

## Technické riešenie

### Súbory

- `apps/web/src/AccountMenu.tsx` (nový): komponent
  ```ts
  type Props = { email: string; onSignOut: () => void }
  export function AccountMenu({ email, onSignOut }: Props)
  ```
  Stav `open` je v komponente. E-mail a odhlásenie dodá `App.tsx` zo stavu prihlásenia z T-002.
- `apps/web/src/App.tsx`: vykresliť `<AccountMenu … />` len pre prihláseného používateľa, vedľa `.toolbar`.
- `apps/web/src/styles.css`: triedy `.account-*` a nové premenné na `:root` (existujúce `--bg`, `--fg`, `--accent` sa nemenia):
  ```css
  --ink: #17251c;          /* text, tmavé tlačidlo, štítky */
  --ink-muted: #4a5a4f;    /* sekundárny text */
  --paper: #f4f6f1;        /* pozadie hlavičky menu */
  --line: #e1e6da;         /* okraje a oddeľovače */
  --danger: #b3261e;       /* Odhlásiť sa */
  ```
- Fonty: Archivo a Public Sans lokálne cez `@fontsource-variable/archivo` a `@fontsource/public-sans` (rovnako ako T-007, nie Google Fonts). Ak T-007 ešte nie je hotový, nainštaluj ich v tomto tikete a importuj v `src/main.tsx`. Public Sans sa použije v celom menu.
- Ikony: inline SVG v `AccountMenu.tsx` (obrys, `stroke-width` 2, 20 px), presne z návrhu: postava (tlačidlo, Profil), posuvníky (Nastavenia), karta (Predplatné), dvere so šípkou (Odhlásiť sa), šípka dole (tlačidlo na počítači). Žiadne emoji ani knižnica ikon.

### Tlačidlo

- Pozícia: `position: absolute; top: 12px; right: 12px; z-index: 4`.
- **Počítač (≥ 640 px):** biela „pilulka“, výška min. 44 px, okraj `1px solid var(--line)`, tieň `0 8px 24px -12px rgba(23,37,28,0.45)`. Vľavo tmavý kruh 36 px (`--ink`) s bielou ikonou postavy, text „Môj účet“ (15 px, 600), šípka dole.
- **Mobil (< 640 px):** len tmavý kruh 44 px s bielou ikonou postavy a bielym okrajom 3 px, bez textu.
- Atribúty: `type="button"`, `aria-label="Môj účet"`, `aria-haspopup="menu"`, `aria-expanded={open}`, `aria-controls` na id menu.

### Menu

- **Počítač:** karta šírky 300 px pod tlačidlom (`top: 66px; right: 12px`), zaoblenie 18 px, okraj `--line`, tieň `0 24px 48px -20px rgba(23,37,28,0.45)`.
- **Mobil:** karta cez celú šírku (`top: 62px; left: 12px; right: 12px`) a pod ňou polopriehľadné stmavenie mapy `rgba(23,37,28,0.25)` od 60 px nižšie. Klik na stmavenie menu zavrie.
- **Hlavička** (pozadie `--paper`, spodný okraj `--line`, padding 18 px): malý text „Prihlásený ako“ (13 px, `--ink-muted`), pod ním e-mail (15 px, 700, `overflow-wrap: anywhere`).
- **Položky** (`role="menuitem"`, výška min. 44 px na počítači a 48 px na mobile, ikona + text 15 px/600, zaoblenie 10 px, pri hover/focus pozadie `--paper`):
  1. „Profil“
  2. „Nastavenia“
  3. „Predplatné“
  4. oddeľovač, „Odhlásiť sa“ farbou `--danger`, volá `onSignOut()`.
- Ciele položiek Profil, Nastavenia a Predplatné: pozri Otvorené otázky.

### Správanie

- Klik na tlačidlo menu otvorí alebo zavrie.
- Menu zavrie: klik mimo menu a tlačidla, kláves Escape (fokus sa vráti na tlačidlo), výber položky.
- Po otvorení dostane fokus prvá položka; šípky hore/dole presúvajú fokus medzi položkami, Tab menu opustí a zavrie.
- Kým je menu otvorené, kliky na mapu (výber úseku) sa nevykonajú: klik mimo len zavrie menu.
- Poslucháč klávesu Escape sa pridáva len keď je menu otvorené a odstraňuje sa pri zatvorení.

### Ovládacie prvky MapLibre

`NavigationControl` a `GeolocateControl` sú v `App.tsx` umiestnené `'top-right'` a prekrývali by sa s tlačidlom. V `styles.css` posuň ich kontajner: `.maplibregl-ctrl-top-right { top: 56px; }`. Umiestnenie v `App.tsx` sa nemení.

## Akceptačné kritériá

- [ ] Prihlásený používateľ vidí vpravo hore tlačidlo „Môj účet“, neprihlásený nie.
- [ ] Na šírke ≥ 640 px má tlačidlo kruh s ikonou, text „Môj účet“ a šípku; pod 640 px len kruh 44 px.
- [ ] Klik otvorí menu s hlavičkou „Prihlásený ako“ + e-mail a položkami Profil, Nastavenia, Predplatné, Odhlásiť sa (v tomto poradí, Odhlásiť sa červenou a oddelené čiarou).
- [ ] Menu sa zavrie klikom na tlačidlo, klikom mimo, Escape a výberom položky; po Escape je fokus na tlačidle.
- [ ] Klik mimo pri otvorenom menu nevyberie úsek na mape.
- [ ] „Odhlásiť sa“ odhlási používateľa (funkcia z T-002) a tlačidlo zmizne.
- [ ] Na mobile je menu cez celú šírku so stmavením mapy pod ním.
- [ ] `aria-expanded` sa mení podľa stavu, menu sa dá ovládať len klávesnicou (Tab na tlačidlo, Enter, šípky, Escape).
- [ ] Ovládacie prvky MapLibre vpravo hore sú pod tlačidlom a nič sa neprekrýva (1280×800 aj 390×844).
- [ ] Menu sa vizuálne zhoduje s návrhmi v `tickets/assets/T-008-*` (farby, písmo, rozmery, ikony).
- [ ] Písma sa nenačítavajú z `fonts.googleapis.com`.
- [ ] `npx tsc -b && npm run build` prejde bez chýb.

## Overenie

```bash
cd apps/web && npx tsc -b && npm run build && npm run dev
```

V headless Chrome (puppeteer-core, pozri `CLAUDE.md`), prihlásený testovací používateľ (T-002), skúšobné miesto Štrbské pleso:
- okno 1280×800: snímka so zatvoreným a otvoreným menu, porovnať s `tickets/assets/T-008-menu-uctu-pocitac.html`,
- okno 390×844: to isté, porovnať s `tickets/assets/T-008-menu-uctu-mobil.html`,
- otvoriť menu, kliknúť na (640,400): menu sa zavrie a výberový panel úseku sa **nezobrazí**; druhý klik na (640,400) úsek vyberie,
- otvoriť menu, stlačiť Escape: `document.activeElement` je tlačidlo účtu,
- klik na „Odhlásiť sa“: tlačidlo účtu zmizne.

## Otvorené otázky

- **Kam vedú Profil, Nastavenia a Predplatné?** Appka zatiaľ nemá smerovanie (router) a stránky neexistujú. Návrh: Profil = stránka účtu z T-006 (e-mail, heslo, zmazanie účtu); Predplatné = zákaznícky portál Paddle (neskôr); Nastavenia = zatiaľ nie je jasné čo obsahujú. Do rozhodnutia skryť položky bez cieľa, alebo ich zobraziť neaktívne?
- **Čo budú obsahovať Nastavenia** (napr. predvolený rýchly režim, sieť úsekov, jednotky)? Ak nič, položku vynechať.
- **Spojiť Profil a Nastavenia** do jednej položky „Účet a nastavenia“?
- Čaká na rozhodnutia v T-002 (spôsob prihlásenia, či neprihlásený vidí mapu).

## Výsledok implementácie

