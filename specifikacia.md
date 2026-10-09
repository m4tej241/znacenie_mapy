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

- Import GPX s automatickým označením prejdených úsekov a štatistiky (fáza 2).
- Produkčná infraštruktúra a komerčné spustenie (fázy 3 a 4, kap. 13 a 14).
- Rozšírenie o cyklotrasy, náučné chodníky a neoznačené cesty (fáza 5).
- Ďalšie krajiny, ktoré pokrýva Mapy.com (fáza 6).
- Natívna iOS aplikácia: voliteľne, neskôr. Hlavným produktom je web. Android sa neplánuje.

### Zatiaľ sa neimplementuje

- Dátum, poznámky a fotky k úsekom.
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
| iOS (voliteľne, neskôr) | Swift + SwiftUI, MapLibre Native iOS, supabase-swift | Appka je len pre iOS, takže multiplatformový framework nemá výhodu a natívna appka je plynulejšia. Web a iOS spája spoločný backend (schéma, RPC), PMTiles a style JSON, nie zdieľaný kód. |
| Backend | Supabase: PostgreSQL + PostGIS, Auth, Row Level Security | Pre malú skupinu používateľov netreba vlastný server. Ponúka autentifikáciu aj priestorovú databázu. |
| Distribúcia siete trás | Statický súbor PMTiles (vektorové dlaždice) na hostingu s podporou HTTP Range, napr. Cloudflare R2 | Lacné, rýchle a škáluje aj pri rozšírení na celý svet |
| Dátová pipeline | Python + osmium/pyosmium, tippecanoe | Štandardné nástroje na spracovanie OSM |
| Platby (komerčná verzia) | Merchant of record: Paddle (alternatíva Lemon Squeezy) | Predajcom voči zákazníkovi je Paddle, ktorý rieši DPH vo všetkých krajinách, faktúry a refundy. Menej administratívy za vyšší poplatok (kap. 13). |

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
│  Dátová pipeline (offline, spúšťa sa len ručne)         │
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
6. **Aktualizácia dát.** Pipeline sa **nikdy nespúšťa automaticky** (žiadny cron ani CI), len na výslovnú požiadavku vlastníka projektu. Pri novom behu pipeline sa úseky, ktoré zmizli, namapujú na nové podľa geometrického prekryvu (buffer + podiel spoločnej dĺžky) a označenia používateľov sa prenesú. Úseky bez náhrady sa zalogujú na ručnú kontrolu. Staré ID sa nemažú hneď, uložia sa do tabuľky `segment_remap`.

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
  3. prejdené úseky: hrubá línia s bielym okrajom **vo farbe svojej trasy**, nepriehľadnosť 0,9. Ak po úseku vedie viac trás, použije sa priorita červená → modrá → zelená → žltá → iná. Viditeľné na všetkých zoomoch.
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
│  └─ ios/            # (voliteľne) Xcode projekt, SwiftUI + MapLibre Native
├─ pipeline/          # Python: stiahnutie OSM, segmentácia, PMTiles, import do DB
└─ supabase/
   └─ migrations/     # SQL schéma, RLS, RPC funkcie
```

Hosting: web na Cloudflare Pages alebo Verceli, `trails.pmtiles` na Cloudflare R2, databáza a Auth na Supabase (free tier stačí pre malú skupinu).

## 11. Fázy vývoja

| Fáza | Obsah | Výsledok |
|---|---|---|
| **0 – Overenie dát** ✅ | Pipeline pre SK+CZ, segmentácia, PMTiles. Jednoduchá stránka s podkladom Mapy.com a úsekmi. | Overené, že OSM trasy lícujú s podkladom Mapy.com a úseky majú rozumnú dĺžku |
| **1 – MVP: účty a ukladanie** | Supabase schéma + RLS, prihlásenie, ukladanie označení, vrstva prejdených úsekov, rýchly režim, undo, stránka účtu so zmazaním účtu | Použiteľná appka pre teba a kamarátov, spätná väzba |
| **2 – Platené funkcie** | GPX import (map-matching na úseky, náhľad, hromadné označenie), štatistiky (km, % pokrytia pohorí), prípadne výber „od – do“ | Funkcie, za ktoré budú ľudia platiť |
| **3 – Produkčná infraštruktúra** | Vlastná doména, súkromný repozitár, Cloudflare Pages + R2, transakčné e-maily, Supabase Pro, sledovanie chýb a analytika, produkčný kľúč Mapy.com | Appka pripravená na verejnú prevádzku |
| **4 – Komerčné spustenie** | Živnosť/firma, účtovník, právne dokumenty, Paddle (schválenie, cenník, predplatné), zamknutie platených funkcií, úvodná stránka, otvorená registrácia | Platená verejná appka (kap. 13, 14) |
| **5 – Rozšírenie ciest** | Cyklotrasy, náučné chodníky, neoznačené cesty a chodníky podľa záujmu zákazníkov | Hustejšia sieť na označovanie |
| **6 – Ďalšie krajiny** | Pipeline pre ďalšie extrakty, úprava segmentácie tam, kde nie sú rozcestníky v OSM | Pokrytie ako Mapy.com |
| Voliteľne neskôr | iOS appka, dátum, poznámky a fotky k úsekom, zdieľanie | – |

## 12. Riziká a otvorené otázky

1. **Podmienky a limity Mapy.com API**: overené (kap. 5.1). Pri tarife Basic je použitie povolené vrátane prekrytia vlastnými dátami. Pri raste používateľov nad bezplatný limit sa platí 1,60 Kč za 1 000 dlaždíc. Spotrebu treba sledovať v dashboarde a zapnúť upozornenia.
2. **Lícovanie OSM s podkladom Mapy.com**: vo fáze 0 overené na vzorke (Tatry, Štrbské pleso), trasy sedia. Priebežne sledovať v ďalších oblastiach.
3. **Stabilita ID úsekov** pri aktualizácii OSM dát rieši remap (kap. 6). Treba ho otestovať na dvoch verziách extraktu.
4. **Kvalita OSM dát**: chýbajúce alebo prerušené relácie. Riešením je oprava priamo v OSM, čo pomôže aj ostatným.
5. **Frekvencia aktualizácie dát trás**: rozhodnuté, bez pravidelného plánu. Dáta sa aktualizujú len vtedy, keď si to vlastník projektu vyžiada. Nič sa nespúšťa automaticky.
6. **Offline režim**: rozhodnuté, aplikácia bude iba online (kap. 2). Keďže prejdené úseky sa zadávajú dodatočne, nie priamo na túre, slabý signál v horách funkčnosť neobmedzuje.
7. **Závislosť od Mapy.com pri komerčnom použití**: náklady rastú s počtom aktívnych používateľov a zmena cien alebo podmienok Mapy.com sa priamo dotkne marže. Pred spustením predaja potvrdiť s Mapy.com, že plánované použitie je v súlade s podmienkami.
8. **Schválenie u Paddle**: Paddle predajcu pred spustením overuje (web, cenník, podmienky). Schválenie nie je zaručené, záloha je Lemon Squeezy. Účtovanie výplat a daň z príjmu prekonzultovať s účtovníkom (kap. 13.3).

## 13. Komerčné nasadenie a platby

Appka sa bude neskôr predávať. Táto kapitola popisuje platby a podmienky, ktoré musia byť splnené pred spustením predaja (fáza 4).

### 13.1 Platobná služba: merchant of record (Paddle)

- **Merchant of record** znamená, že zákazník technicky kupuje od Paddle a Paddle predáva vlastníkovi projektu. Paddle preto za nás:
  - vypočíta, vyberie a odvedie **DPH vo všetkých krajinách** (SK 23 %, CZ 21 %…),
  - vystavuje faktúry zákazníkom,
  - rieši refundy, spory o platby (chargebacky) a podvody.
- Vlastník projektu dostáva **jednu výplatu mesačne** na bankový účet a v účtovníctve má jeden doklad namiesto stoviek platieb.
- **Paddle Billing**: predplatné (mesačné a/alebo ročné), automatické obnovovanie, skúšobné obdobie.
- **Paddle Checkout** (overlay cez Paddle.js): platobné okno priamo na našej stránke, údaje o karte nikdy neprechádzajú našimi servermi.
- **Zákaznícky portál Paddle**: zmena spôsobu platby, faktúry, zrušenie predplatného.
- **Spôsoby platby**: karty, Apple Pay, Google Pay, PayPal. **Meny**: EUR, CZK (lokalizované ceny).
- **Poplatok** (orientačne, overiť v aktuálnom cenníku): **5 % + 0,50 USD** za transakciu, zahŕňa DPH servis aj spracovanie platby.
- **Alternatíva:** Lemon Squeezy (tiež merchant of record, podobné poplatky), ak by Paddle predajcu neschválil.

### 13.2 Technická integrácia

```
Klient (Paddle.js) ──(1) otvor checkout s price_id + user_id v custom_data──▶ Paddle
Paddle ──(2) webhook: transaction.completed, subscription.created/updated/canceled──▶ Supabase Edge Function
Edge Function ──(3) overenie podpisu, zápis stavu predplatného──▶ tabuľka subscriptions
Klient ──(4) načíta stav predplatného zo Supabase──▶ odomknuté platené funkcie
```

- **Client-side token** Paddle je verejný (v klientovi). **API kľúč** a **tajomstvo webhookov** sú **iba** v secrets Supabase Edge Functions, nikdy v klientovi ani v gite.
- Webhooky sa overujú hlavičkou `Paddle-Signature` a spracúvajú idempotentne (podľa ID udalosti).
- Prepojenie s účtom: `user_id` zo Supabase sa posiela v `custom_data` checkoutu a vracia sa vo webhooku.
- Platené funkcie sa strážia na strane databázy (RLS / RPC podľa stavu predplatného), nie len v UI.

```sql
create table subscriptions (
  user_id                  uuid primary key references auth.users on delete cascade,
  paddle_customer_id       text not null unique,
  paddle_subscription_id   text unique,
  status                   text not null,      -- active, trialing, past_due, paused, canceled
  price_id                 text,
  current_period_end       timestamptz,
  updated_at               timestamptz not null default now()
);
-- RLS: používateľ číta len svoj riadok, zapisuje iba Edge Function (service role).
```

### 13.3 DPH a účtovníctvo

- DPH voči zákazníkom rieši **Paddle**. Vlastník projektu nemusí registrovať OSS ani sledovať sadzby jednotlivých krajín.
- Vlastník projektu fakturuje (alebo prijíma vyúčtovanie od) Paddle ako jedného obchodného partnera.
- Daň z príjmu a spôsob účtovania výplat: **pred spustením predaja konzultácia s účtovníkom** (forma podnikania, platiteľ DPH).

### 13.4 Cenový model

- Náklady na Mapy.com sa opakujú každý mesiac za každého aktívneho používateľa, preto **predplatné**, nie jednorazová platba.
- Pevný poplatok 0,50 USD je pri nízkych cenách citeľný (pri 1,50 € mesačne asi tretina platby). Preto **uprednostniť ročné predplatné** (napr. 12 € ročne, poplatok ~9 %) alebo mesačnú cenu aspoň 3 – 4 €.
- **Rozhodnutá cena:** **3 € mesačne** alebo **25 € ročne** (vychádza na 2,08 € mesačne, o 30 % menej). Pri ročnom pláne tvorí poplatok Paddle asi 7 %, pri mesačnom asi 20 %. Úvodná stránka s cenníkom: tiket T-007.

### 13.5 Predpoklady spustenia predaja

- Živnosť alebo firma, bankový účet pre výplaty.
- **Schválenie predajcu u Paddle**: hotový web s cenníkom, obchodnými podmienkami, zásadami ochrany súkromia a pravidlami refundácie, overená doména.
- Zásady ochrany súkromia (GDPR) a možnosť zmazania účtu v appke.
- **Súkromný repozitár** a hosting, ktorý povoľuje komerčné použitie (napr. Cloudflare Pages + R2 namiesto GitHub Pages).
- Supabase Pro (zálohy, projekt sa neuspáva).
- Potvrdenie podmienok použitia s Mapy.com (riziko 7).

### 13.6 Prevádzkové náklady (orientačne)

| Položka | Cena |
|---|---|
| Paddle | 5 % + 0,50 USD za transakciu (vrátane DPH servisu) |
| Supabase Pro | 25 USD mesačne |
| Mapy.com | 1,60 Kč za 1 000 dlaždíc nad 250 000 mesačne zadarmo, cca 5 Kč mesačne za aktívneho používateľa |
| Hosting (Cloudflare) | 0 – pár eur mesačne |

## 14. Cesta ku komerčnému spusteniu

Kontrolný zoznam všetkého, čo treba doplniť od prototypu (fáza 0) po platenú webovú appku. Hlavným produktom je **web**, iOS appka je voliteľná.

### 14.1 Základ appky (fáza 1)

- [ ] Účty: registrácia a prihlásenie e-mailom (prípadne Google), obnova hesla, odhlásenie
- [ ] Ukladanie označení do databázy
- [ ] Vrstva prejdených úsekov z databázy, viditeľná na každom zoome
- [ ] Undo a hlásenie pri výpadku internetu
- [ ] Stránka účtu: e-mail, zmena hesla, **zmazanie účtu aj s dátami** (GDPR)
- [ ] Supabase projekt: schéma, RLS, Edge Functions

### 14.2 Platené funkcie (fáza 2)

- [ ] GPX import s automatickým označením úsekov
- [ ] Štatistiky: prejdené km, % trás v pohorí / regióne
- [ ] Výber „od – do“ na rýchle označenie dlhšej túry (voliteľne)
- [ ] Rozhodnutie, čo je zadarmo a čo platené

### 14.3 Produkčná infraštruktúra (fáza 3)

- [ ] Vlastná doména (vyžaduje ju aj Paddle)
- [ ] Súkromný repozitár, hosting Cloudflare Pages + dáta trás na Cloudflare R2
- [ ] Transakčné e-maily z vlastnej domény (overenie účtu, reset hesla), napr. Resend alebo Postmark
- [ ] Supabase Pro (zálohy, projekt sa neuspáva)
- [ ] Sledovanie chýb (napr. Sentry) a analytika bez cookies (napr. Plausible)
- [ ] Oddelený vývojový a produkčný API kľúč Mapy.com, obmedzenie na doménu, upozornenia na spotrebu
- [ ] Aktualizácia dát trás ako ručne spúšťaný workflow (nikdy automaticky)

### 14.4 Právne a administratívne (fáza 4)

- [ ] Živnosť alebo firma, bankový účet
- [ ] Konzultácia s účtovníkom (daň z príjmu, účtovanie výplat od Paddle)
- [ ] Obchodné podmienky, zásady ochrany súkromia, pravidlá refundácie
- [ ] Cookie lišta, ak sa použijú cookies (pri analytike bez cookies netreba)
- [ ] Potvrdenie podmienok s Mapy.com pre platenú appku
- [ ] Pätička: zdroje (Mapy.com, © OpenStreetMap), prevádzkovateľ, kontakt

### 14.5 Platby (fáza 4)

- [ ] Účet a schválenie u Paddle
- [ ] Cenník a predplatné (mesačné / ročné), prípadne skúšobné obdobie
- [ ] Checkout v appke, webhooky, tabuľka `subscriptions` (kap. 13.2)
- [ ] Zamknutie platených funkcií na strane databázy
- [ ] Odkaz na zákaznícky portál Paddle

### 14.6 Web pre zákazníkov (fáza 4)

- [ ] Úvodná stránka: čo appka robí, snímky, cenník, „Vyskúšať“
- [ ] Návod pri prvom spustení (ako označiť úsek)
- [ ] Mobilné rozhranie a ikonka na plochu (PWA bez offline režimu)
- [ ] Otázky a odpovede, kontakt na podporu
- [ ] Otvorenie registrácie (doteraz len pozvaní)

### 14.7 Otvorené rozhodnutia

- Čo bude zadarmo a čo platené
- Cena a pomer mesačného a ročného predplatného
- Názov appky a doména
