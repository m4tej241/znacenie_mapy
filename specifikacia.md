# Technická špecifikácia – Mapa prejdených turistických trás

*Verzia 0.1 · 25. 9. 2026 · pracovný návrh*

## 1. Cieľ

Webová (neskôr natívna iOS) aplikácia s interaktívnou turistickou mapou v štýle mapy.com, na ktorej si používateľ ručne označí úseky turistických trás, ktoré už prešiel. Prejdené úseky sú na mape výrazne odlíšené, takže po otvorení mapy hôr je hneď vidieť, kde všade už bol.

## 2. Rozsah

### V rozsahu MVP (fáza 1)

- Webová aplikácia použiteľná na počítači aj v mobile.
- Podkladová turistická mapa z Mapy.com.
- Značené turistické trasy na Slovensku a v Česku, rozdelené na úseky medzi rozcestníkmi alebo križovatkami.
- Prihlásenie. Aplikácia je uzavretá, účty dostanú len pozvaní používatelia (autor a kamaráti).
- Ručné označenie a odznačenie úseku kliknutím.
- Zobrazenie všetkých prejdených úsekov prihláseného používateľa na každom priblížení mapy.

### Neskôr (mimo MVP)

- Natívna iOS aplikácia (fáza 2). Android sa neplánuje.
- Import GPX s automatickým označením prejdených úsekov (fáza 3).
- Ďalšie krajiny, ktoré pokrýva Mapy.com (fáza 4).

### Zatiaľ sa neimplementuje

- Dátum, poznámky a fotky k úsekom.
- Štatistiky (km, percentá pokrytia).
- Zdieľanie mapy s inými používateľmi.

Dátový model je navrhnutý tak, aby sa tieto funkcie dali doplniť bez prestavby.

### Nebude sa implementovať

- **Offline režim.** Aplikácia funguje iba online, na webe aj v iOS appke. Dôvodom sú podmienky Mapy.com, ktoré zakazujú ukladať dlaždice (kap. 5.1).

## 3. Kľúčové technické rozhodnutia

| Oblasť | Rozhodnutie | Dôvod |
|---|---|---|
| Podkladová mapa | Rastrové dlaždice Mapy.com REST API, mapová sada `outdoor` | Požiadavka „rovnaká mapa ako mapy.com“ |
| Dáta trás | OpenStreetMap: relácie `route=hiking` | Mapy.com neposkytuje priebeh trás ako vektorové dáta. OSM má slovenské aj české značenie vrátane farby (`osmc:symbol`). |
| Jednotka označovania | Úsek, teda fyzický kus chodníka medzi dvoma bodmi rezu (rozcestník, križovatka, koniec trasy) | Trasy sú dlhé a človek zvyčajne prejde len ich časť |
| Mapová knižnica | MapLibre GL JS (web), MapLibre Native iOS (iOS) | Open source, rovnaký štýl mapy (style JSON) aj dáta (PMTiles) na oboch platformách |
| Frontend | React + TypeScript (Vite) | Rýchly vývoj, overenie celého konceptu pred iOS appkou |
| iOS (fáza 2) | Swift + SwiftUI, MapLibre Native iOS, supabase-swift | Appka je len pre iOS, takže multiplatformový framework nemá výhodu a natívna appka je plynulejšia. Web a iOS spája spoločný backend (schéma, RPC), PMTiles a style JSON, nie zdieľaný kód. |
| Backend | Supabase: PostgreSQL + PostGIS, Auth, Row Level Security | Pre malú skupinu používateľov netreba vlastný server. Ponúka autentifikáciu aj priestorovú databázu. |
| Distribúcia siete trás | Statický súbor PMTiles (vektorové dlaždice) na hostingu s podporou HTTP Range, napr. Cloudflare R2 | Lacné, rýchle a škáluje aj pri rozšírení na celý svet |
| Dátová pipeline | Python + osmium/pyosmium, tippecanoe | Štandardné nástroje na spracovanie OSM |

## 4. Architektúra

```
                ┌──────────────────────────┐
                │  Mapy.com REST API       │  rastrové dlaždice (podklad)
                └────────────▲─────────────┘
                             │
┌────────────────────────────┴───────────────────────────┐
│  Klient (web: React + MapLibre GL JS)                  │
│   vrstva 1: podklad Mapy.com (raster)                  │
│   vrstva 2: sieť úsekov (vektor, PMTiles) – klikateľná │
│   vrstva 3: moje prejdené úseky (GeoJSON zo Supabase)  │
└───────┬─────────────────────────────────┬──────────────┘
        │ HTTP Range                      │ supabase-js (Auth, RPC, REST)
┌───────▼──────────┐             ┌────────▼──────────────────────┐
│ trails.pmtiles   │             │ Supabase                      │
│ (R2 / statický   │             │  Auth (len pozvaní)           │
│  hosting)        │             │  Postgres + PostGIS           │
└───────▲──────────┘             │   segments, user_segments     │
        │                        └────────▲──────────────────────┘
        │ generuje                        │ import úsekov
┌───────┴─────────────────────────────────┴──────────────┐
│  Dátová pipeline (offline, spúšťa sa ručne / periodicky)│
│  Geofabrik .osm.pbf → filter → segmentácia → PMTiles+DB │
└─────────────────────────────────────────────────────────┘
```

Prečo sú prejdené úseky samostatná GeoJSON vrstva a nie len zafarbené vektorové dlaždice: pri malom priblížení vektorové dlaždice vynechávajú drobné prvky, ale prehľad „kde všade som bol“ musí byť úplný aj pri pohľade na celú krajinu. Prejdených úsekov jedného používateľa je rádovo stovky až tisíce, takže ich načítanie naraz nie je problém.

## 5. Zdroje dát

### 5.1 Podkladová mapa – Mapy.com

- Endpoint dlaždíc: `https://api.mapy.com/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=…` (pre retina displeje variant `256@2x`).
- Potrebný je API kľúč z developer portálu Mapy.com. Kľúč treba obmedziť na doménu aplikácie. Podmienky zakazujú používať cudzí API kľúč.
- **Tarif: Basic** (automaticky po registrácii):
  - 250 000 kreditov mesačne zadarmo, 1 dlaždica = 1 kredit,
  - nad limit 1,60 Kč za 1 000 kreditov, platba cez Seznam Peněženka a len so súhlasom (bez neho sa nič nestrhne),
  - hrubý odhad: jedno otvorenie a prechádzanie mapy spotrebuje zhruba 200 – 500 dlaždíc, teda asi 500 – 1 000 relácií mesačne zadarmo. Pre skupinu kamarátov to stačí.
- **Tarif Extended (10 mil. kreditov zadarmo) pre nás nie je vhodný.** Podmienky zakazujú kombinovať mapové dáta Mapy.com s inými mapovými dátami, čo je naša OSM vrstva trás. Okrem toho vyžaduje verejne dostupnú aplikáciu.
- **Atribúcia** (povinná, [podmienky](https://developer.mapy.com/rest-api-mapy-cz/atribution/)):
  - logo Mapy.com nad mapou, výška min. 30 px, klikateľné na `https://mapy.com/`, nie menšie ako iné logá nad mapou,
  - text „Seznam.cz a.s. and others“ s odkazom na `https://api.mapy.com/copyright`,
  - v MapLibre: logo ako vlastný control a text cez `attribution` rastrového zdroja (spolu s „© OpenStreetMap contributors“ pre vrstvu trás).
- **Zákaz ukladania a cachovania dlaždíc** v aplikácii (ani pre-caching, ani export). Bežnú HTTP cache prehliadača to podľa nášho výkladu nezakazuje. Pre iOS appku to znamená, že offline mapa z dlaždíc Mapy.com nie je povolená (pozri kap. 12).
- Zdroje: [podmienky](https://developer.mapy.com/terms-and-conditions/), [cenník](https://developer.mapy.com/pricing/).

### 5.2 Turistické trasy – OpenStreetMap

- Zdroj: extrakty z Geofabrik (`slovakia-latest.osm.pbf`, `czech-republic-latest.osm.pbf`).
- Filter: relácie `type=route` + `route=hiking` (siete `iwn`, `nwn`, `rwn`, `lwn`) a ich členské cesty (ways). Voliteľne aj náučné chodníky.
- Z relácie sa berie: `name`, `ref`, `network`, `osmc:symbol` (farba značky: červená, modrá, zelená, žltá), `operator`.
- Rozcestníky: uzly `tourism=information` + `information=guidepost`.
- Licencia ODbL: v aplikácii musí byť atribúcia „© OpenStreetMap contributors“.

## 6. Segmentácia trás na úseky

Toto je najdôležitejšia časť dátovej prípravy.

1. **Graf siete.** Zo všetkých členských ciest turistických relácií sa zostaví graf. Uzly grafu sú OSM uzly, hrany sú úseky ciest medzi nimi. Každá hrana si pamätá množinu trás, ktoré po nej vedú.
2. **Body rezu.** Uzol je bodom rezu, ak:
   - jeho stupeň v sieti nie je 2 (križovatka alebo koniec trasy), alebo
   - sa na ňom mení množina trás (napr. modrá sa pripojí k červenej), alebo
   - je na ňom rozcestník (`information=guidepost`).
3. **Úsek** je maximálna reťaz hrán medzi dvoma bodmi rezu. Ide o fyzický kus chodníka. Ak po ňom vedie viac trás (červená aj modrá), existuje ako jeden úsek so zoznamom trás a jeho označením sa „prejde“ pre všetky trasy naraz.
4. **Veľmi krátke úseky** (napr. < 30 m medzi dvoma blízkymi križovatkami) sú na klikanie nepraktické. Prah a prípadné zlúčenie so susedom sa doladí vo fáze 0.
5. **Stabilné ID.** `id = hash(zoradený zoznam OSM uzlov úseku)`, skrátený a deterministický. Kým sa geometria v OSM nezmení, úsek má po každej aktualizácii dát rovnaké ID.
6. **Aktualizácia dát.** Pri novom behu pipeline sa úseky, ktoré zmizli, namapujú na nové podľa geometrického prekryvu (buffer + podiel spoločnej dĺžky) a označenia používateľov sa prenesú. Úseky bez náhrady sa zalogujú na ručnú kontrolu. Staré ID sa nemažú hneď, uložia sa do tabuľky `segment_remap`.

**Výstupy pipeline:**
- `trails.pmtiles`: vektorové dlaždice s vrstvou `segments` (atribúty: `id`, `colors`, `names`, `length_m`), zoom cca 10–16,
- import do tabuľky `segments` v Postgres (plná geometria).

**Skutočný objem (fáza 0, OSM dáta z 25. 9. 2026):**

| | SK | SK + CZ |
|---|---|---|
| Turistické relácie | 3 036 | 8 649 |
| Úseky | 12 563 | 41 270 |
| Dĺžka spolu | 19 606 km | 63 836 km |
| Medián dĺžky úseku | 809 m | 730 m |
| Úseky kratšie ako 30 m | 7,3 % | 6,7 % |

`trails.pmtiles` (zoom 9 – 14) má 44 MB. Segmentácia SK + CZ trvá asi 8 minút a potrebuje asi 3 GB RAM.

## 7. Dátový model (PostgreSQL + PostGIS)

```sql
create table segments (
  id            text primary key,               -- deterministický hash
  geom          geometry(LineString, 4326) not null,
  length_m      integer not null,
  routes        jsonb not null,                 -- [{osm_id, name, ref, color, network}]
  country       text[] not null,                -- {'SK'}, {'CZ'}, {'SK','CZ'}
  data_version  integer not null
);
create index on segments using gist (geom);

create table user_segments (
  user_id     uuid not null references auth.users on delete cascade,
  segment_id  text not null references segments(id),
  created_at  timestamptz not null default now(),
  primary key (user_id, segment_id)
);

create table segment_remap (
  old_id        text not null,
  new_id        text,                           -- null = bez náhrady
  data_version  integer not null
);
```

**Row Level Security:**
- `segments`: čítanie pre prihlásených, zápis iba pre service role (pipeline).
- `user_segments`: používateľ vidí, vkladá a maže len riadky, kde `user_id = auth.uid()`.

**Rozšíriteľnosť:** dátum, poznámka a fotky sa neskôr pridajú ako stĺpce alebo samostatná tabuľka naviazaná na `(user_id, segment_id)`. Štatistiky sa dajú počítať nad `segments.length_m` a `country`.

## 8. API (cez Supabase)

| Operácia | Implementácia |
|---|---|
| Moje prejdené úseky | RPC `my_walked_segments()` → GeoJSON FeatureCollection (geometria zjednodušená cez `ST_Simplify`) |
| Označiť úsek | `insert into user_segments` (upsert, idempotentné) |
| Odznačiť úsek | `delete from user_segments where segment_id = …` |
| Hromadné označenie | upsert viacerých riadkov naraz (pripravené pre GPX import) |
| Detail úseku | čítané priamo z atribútov vo vektorovej dlaždici, bez volania API |

## 9. Klient – funkcie a UI

### 9.1 Mapa

- Celoobrazovková mapa s ovládaním priblíženia, geolokáciou („kde som“) a vyhľadávaním miesta (Mapy.com Geocoding API, voliteľné v MVP).
- **Vrstvy (zdola nahor):**
  1. podklad Mapy.com `outdoor`,
  2. sieť úsekov: neviditeľná, cca 12 px široká „hit“ línia na kliknutie a tenké zvýraznenie pri prejdení myšou alebo výbere. Aktívna od zoomu cca 12.
  3. prejdené úseky: hrubá línia s bielym okrajom vo farbe, ktorá sa nedá zameniť so značením KST/KČT (napr. purpurová `#C2185B`, nepriehľadnosť 0,85). Viditeľné na všetkých zoomoch.
- Pri zoome < 12 sa zobrazí nápoveda „Priblíž mapu na označovanie trás“.

### 9.2 Označovanie

- **Klik na úsek** otvorí popup s farbami a názvami trás, dĺžkou a tlačidlom **Označiť ako prejdené** / **Zrušiť označenie**.
- **Rýchly režim** (prepínač): každý klik rovno prepne stav úseku bez popupu. Slúži na rýchle zadanie dlhšej túry po úsekoch.
- **Späť (undo)** posledných akcií v rámci relácie.
- Optimistický update: úsek sa zafarbí hneď. Pri chybe servera sa zmena vráti a zobrazí sa hláška.

### 9.3 Prihlásenie

- Supabase Auth: e-mail cez magic link (voliteľne Google).
- Verejná registrácia je vypnutá, používateľov pozýva administrátor cez Supabase dashboard.

### 9.4 Nefunkčné požiadavky

- Responzívne rozhranie s ovládaním dotykom.
- Prvé zobrazenie mapy do 2 s na bežnom pripojení.
- Označenie úseku sa prejaví okamžite (optimisticky).
- **Iba online:**
  - web nepoužíva service worker ani PWA cache na dlaždice alebo API odpovede,
  - v iOS appke sa vypne ambient cache MapLibre Native (je predvolene zapnutá) a nepoužívajú sa offline packy,
  - bez pripojenia appka zobrazí hlášku „Nie si pripojený k internetu“ a označovanie je zablokované (žiadna offline fronta zmien).
- API kľúče sa necommitujú. Kľúč Mapy.com je obmedzený na doménu, v iOS appke na bundle ID (ak to Mapy.com umožňuje, overiť v dashboarde).

## 10. Štruktúra repozitára

```
palo-mapy/
├─ apps/
│  ├─ web/            # React + Vite + MapLibre GL JS
│  └─ ios/            # (fáza 2) Xcode projekt, SwiftUI + MapLibre Native
├─ pipeline/          # Python: stiahnutie OSM, segmentácia, PMTiles, import do DB
└─ supabase/
   └─ migrations/     # SQL schéma, RLS, RPC funkcie
```

Hosting: web na Cloudflare Pages alebo Verceli, `trails.pmtiles` na Cloudflare R2, databáza a Auth na Supabase (free tier stačí pre malú skupinu).

## 11. Fázy vývoja

| Fáza | Obsah | Výsledok |
|---|---|---|
| **0 – Overenie dát** ✅ | Pipeline pre SK+CZ, segmentácia, PMTiles. Jednoduchá stránka s podkladom Mapy.com a úsekmi. | Overené, že OSM trasy lícujú s podkladom Mapy.com a úseky majú rozumnú dĺžku |
| **1 – MVP web** | Supabase schéma + RLS, prihlásenie, označovanie a odznačovanie, vrstva prejdených úsekov, rýchly režim, undo | Použiteľná appka pre teba a kamarátov |
| **2 – iOS appka** | SwiftUI + MapLibre Native iOS nad rovnakým backendom a PMTiles | Natívna appka pre iPhone |
| **3 – GPX import** | Nahratie GPX, map-matching trasy na úseky (buffer + podiel prekryvu), náhľad a potvrdenie, hromadné označenie | Automatické označenie z hodiniek alebo Stravy |
| **4 – Ďalšie krajiny** | Pipeline pre ďalšie extrakty, úprava segmentácie tam, kde nie sú rozcestníky v OSM | Pokrytie ako Mapy.com |
| Neskôr | Dátum, poznámky, fotky, štatistiky, zdieľanie | – |

## 12. Riziká a otvorené otázky

1. **Podmienky a limity Mapy.com API**: overené (kap. 5.1). Pri tarife Basic je použitie povolené vrátane prekrytia vlastnými dátami. Pri raste používateľov nad bezplatný limit sa platí 1,60 Kč za 1 000 dlaždíc. Spotrebu treba sledovať v dashboarde a zapnúť upozornenia.
2. **Lícovanie OSM s podkladom Mapy.com**: vo fáze 0 overené na vzorke (Tatry, Štrbské pleso), trasy sedia. Priebežne sledovať v ďalších oblastiach.
3. **Stabilita ID úsekov** pri aktualizácii OSM dát rieši remap (kap. 6). Treba ho otestovať na dvoch verziách extraktu.
4. **Kvalita OSM dát**: chýbajúce alebo prerušené relácie. Riešením je oprava priamo v OSM, čo pomôže aj ostatným.
5. **Frekvencia aktualizácie dát trás**: návrh je raz za štvrťrok, ručne.
6. **Offline režim**: rozhodnuté, aplikácia bude iba online (kap. 2). Keďže prejdené úseky sa zadávajú dodatočne, nie priamo na túre, slabý signál v horách funkčnosť neobmedzuje.
