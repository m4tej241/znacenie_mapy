# Prejdené trasy

Webová appka: interaktívna turistická mapa (podklad Mapy.com), na ktorej si používateľ označuje prejdené úseky trás. Hlavný produkt je web, neskôr sa bude predávať (predplatné cez Paddle). Celý návrh je v [specifikacia.md](specifikacia.md), aktuálne fázy v kap. 11, cesta k spusteniu v kap. 14.

## Štruktúra

- `apps/web/`: React 18 + TypeScript + Vite 5 + MapLibre GL JS 4 + pmtiles
  - `index.html` + `src/landing/`: úvodná stránka s cenníkom (`/`), bez MapLibre v bundli
  - `app/index.html`: vstup mapovej appky (`/app/`)
  - `src/mapStyle.ts`: zdroje a vrstvy mapy, farby trás
  - `src/App.tsx`: mapa, výber a označovanie úsekov, UI
  - `public/trails.pmtiles`: vektorové dlaždice úsekov (generuje pipeline)
- `pipeline/`: Python (pyosmium) + tippecanoe. `segment.py` delí OSM trasy na úseky, `run.sh` celý beh.
- `tickets/`: tikety (pozri nižšie)
- `.github/workflows/pages.yml`: build a deploy webu na GitHub Pages pri pushi do `main`

## Príkazy

```bash
cd apps/web && npm run dev             # http://localhost:5173, pozícia mapy v URL: #zoom/lat/lon
cd apps/web && npx tsc -b && npm run build
cd pipeline && ./run.sh                # IBA na výslovnú žiadosť vlastníka projektu
```

## Pravidlá projektu

- **Dátová pipeline sa nikdy nespúšťa automaticky** (žiadny cron, žiadny CI trigger). Len keď o to vlastník projektu výslovne požiada.
- **Appka je iba online.** Nijako necachovať dlaždice Mapy.com ani odpovede API (žiadny service worker cache, žiadne offline packy). Zakazujú to podmienky Mapy.com.
- **API kľúče nikdy do gitu.** Lokálne sú v `apps/web/.env.local`, v CI sú v GitHub secrets. `.env.example` obsahuje len názvy premenných bez hodnôt.
- Povinná atribúcia na mape: logo Mapy.com (min. 30 px, odkaz na mapy.com), „© Seznam.cz a.s. and others“, „© OpenStreetMap contributors“.
- **Texty v UI a komentáre v kóde sú po slovensky**, identifikátory v kóde po anglicky.
- Prejdené úseky sa kreslia vo farbe svojej trasy (priorita červená → modrá → zelená → žltá) hrubou čiarou s bielym okrajom.
- **Pokrytie je zatiaľ iba Slovensko a Česko.** Dáta trás sú len pre SK + CZ, ďalšie krajiny až neskôr (fáza 6). Vo funkciách, textoch a marketingu nesľubuj viac.
- Neprepisuj veci mimo rozsahu úlohy. Ak niečo treba rozhodnúť, opýtaj sa.

## Tikety

- Každá väčšia funkcia má tiket v `tickets/T-xxx-*.md` podľa šablóny `tickets/TEMPLATE.md`, prehľad je v `tickets/README.md`.
- Stavy: `draft` → `ready` → `in-progress` → `review` → `done`.
- `/ticket`: zapíše výsledok diskusie do tiketu.
- `/implement T-xxx`: implementuje tiket na vetve `tiket/T-xxx-…` založenej z `dev`. Nemerguje ani nepushuje.
- Pri zmene stavu tiketu aktualizuj aj `tickets/README.md`.

## Git

- `main` je nasadená verzia: pri každom pushi sa nasadzuje na GitHub Pages. Do `main` sa nič nepridáva priamo, len merge z `dev` na výslovnú žiadosť vlastníka projektu.
- `dev` je pracovná vetva: tu vznikajú a spravujú sa tikety (`/ticket`) a sem sa merguje hotová práca z vetiev tiketov.
- Vetvy tiketov: `tiket/T-xxx-slug`, zakladajú sa z `dev` a po revízii sa mergujú späť do `dev`.
- Commit správa pri tikete: `T-xxx: názov tiketu`.

## Overenie UI v prehliadači

Headless Chrome je na `/usr/bin/google-chrome`. Na klikanie a snímky použi `puppeteer-core` nainštalovaný v dočasnom priečinku (nie v projekte):

```js
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] })
```

- Skúšobné miesto s trasou: `http://localhost:5173/app/#15/49.1208467/20.0605401` (Štrbské pleso). Klik na stred (640,400) pri okne 1280×800 vyberie úsek magistrály.
- Úseky sú klikateľné od zoomu 12.
- Prostredie: Node 18 (preto Vite 5), Python 3.12, venv v `pipeline/.venv`.
