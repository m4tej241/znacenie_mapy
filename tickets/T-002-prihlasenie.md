---
id: T-002
nazov: Prihlásenie cez Google a odhlásenie
stav: review
faza: 1
zavisi-od: []
vetva: claude/tender-mayer-pcm8qp
---

## Kontext

Používateľ potrebuje účet, aby sa jeho prejdené úseky dali ukladať (T-003). Rozhodnutie vlastníka projektu: **do appky sa dá dostať iba po prihlásení a jediný spôsob prihlásenia je Google účet.** Prihlásiť sa môže ktokoľvek s Google účtom, účet vznikne pri prvom prihlásení. Špecifikácia: `specifikacia.md` kap. 2 a 9.3 (upravené týmto tiketom).

## Rozsah

**Áno:**
- prihlasovacia obrazovka na `/app/` s jediným tlačidlom „Prihlásiť sa cez Google“ (vzhľad úvodnej stránky),
- mapa (MapLibre, dlaždice Mapy.com) sa načíta až po prihlásení,
- odhlásenie (dočasné tlačidlo v paneli nástrojov, kým nie je menu účtu z T-008),
- klient Supabase a premenné prostredia, vrátane buildu na GitHub Pages,
- zachovanie pozície mapy (`#zoom/lat/lon`) cez prihlásenie,
- návod na založenie Supabase projektu a Google prihlásenia (nižšie).

**Nie (mimo tohto tiketu):**
- prihlásenie e-mailom, heslom alebo magic linkom (nebude sa robiť),
- obmedzenie prístupu na pozvaných (zoznam povolených e-mailov),
- databázová schéma a ukladanie označení (T-001, T-003),
- stránka účtu a zmazanie účtu (T-006), menu účtu (T-008),
- úvodná stránka `/` zostáva verejná bez prihlásenia.

## Technické riešenie

### Súbory

- `apps/web/src/supabase.ts`: `export const supabase` = klient z `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY`, alebo `null`, ak premenné chýbajú. Používa `flowType: 'pkce'`: Supabase sa po prihlásení vráti s `?code=…`, nie s `#access_token=…`, takže sa nebije s pozíciou mapy v URL.
- `apps/web/src/auth.ts`:
  - `useSession()`: `undefined` = načítava sa, `null` = neprihlásený, inak relácia (`getSession` + `onAuthStateChange`),
  - `signInWithGoogle()`: uloží `location.hash` do `sessionStorage` (`mapHashBeforeLogin`) a zavolá `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } })`,
  - `signOut()`,
  - `restoreMapHash()`: po návrate z Google obnoví pozíciu mapy v URL,
  - `takeLoginError()`: zistí chybu z návratu (`?error=…`) a vyčistí URL.
- `apps/web/src/LoginScreen.tsx`: prihlasovacia obrazovka.
- `apps/web/src/AuthGate.tsx`: bez nastavenia Supabase chybová správa; počas načítania nič; bez relácie `LoginScreen`; s reláciou `App` (načítaný cez `React.lazy`, aby sa MapLibre pred prihlásením nesťahoval).
- `apps/web/src/main.tsx`: volá `restoreMapHash()` a vykresľuje `AuthGate`. Písma Archivo a Public Sans cez `@fontsource` (ako úvodná stránka).
- `apps/web/src/App.tsx`: nové props `userEmail`, `onSignOut`; v paneli nástrojov tlačidlo „Odhlásiť sa“ (e-mail v `title`). Import `maplibre-gl.css` presunutý sem z `main.tsx`.
- `apps/web/src/styles.css`: triedy `.login*`, `.signout`, premenné `--ink`, `--ink-muted`, `--paper`, `--line`, `--danger` (spoločné s T-008).
- `apps/web/.env.example`, `src/vite-env.d.ts`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- `.github/workflows/pages.yml`: build dostane `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` zo secrets `SUPABASE_URL` a `SUPABASE_ANON_KEY`.

### Texty v UI

- Prihlasovacia obrazovka: logo „Prejdené trasy“ (odkaz na `../`), nadpis „Prihlás sa a pokračuj na mapu“, text „Na mapu sa dostaneš po prihlásení. Prihlásiť sa dá iba cez Google účet.“, tlačidlo „Prihlásiť sa cez Google“ (po kliknutí „Presmerúvam na Google…“), chyba „Prihlásenie sa nepodarilo. Skús to znova.“, odkaz „Späť na úvodnú stránku“.
- Panel nástrojov: „Odhlásiť sa“.
- Chýbajúce nastavenie: „Chýba nastavenie Supabase. Doplň `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` do `apps/web/.env.local` a reštartuj dev server.“

### Návod: čo musí nastaviť vlastník projektu

Bez týchto krokov prihlásenie nefunguje. Kľúče a tajomstvá nikdy do gitu ani do chatu.

1. **Supabase projekt:** na supabase.com založ projekt (región EÚ, napr. Frankfurt). Z *Project Settings → API* si poznač **Project URL** a verejný kľúč **anon / publishable**. Adresa projektu má tvar `https://<ref>.supabase.co`.
2. **Google Cloud:** na console.cloud.google.com vytvor projekt, potom *APIs & Services → OAuth consent screen* (typ External, názov appky, tvoj e-mail). V *Credentials → Create credentials → OAuth client ID* zvoľ *Web application* a vyplň:
   - Authorized JavaScript origins: `http://localhost:5173` a `https://m4tej241.github.io`,
   - Authorized redirect URIs: `https://<ref>.supabase.co/auth/v1/callback`.
   
   Skopíruj **Client ID** a **Client secret**. Kým je súhlasná obrazovka v režime *Testing*, prihlásia sa len pridaní testovací používatelia. Pre všetkých treba *Publish app*.
3. **Supabase → Authentication → Providers:** zapni **Google** a vlož Client ID a Client secret. Poskytovateľa **Email vypni**, aby bol Google jediný spôsob.
4. **Supabase → Authentication → URL Configuration:**
   - Site URL: `https://m4tej241.github.io/znacenie_mapy/app/`,
   - Redirect URLs: `http://localhost:5173/app/` a `https://m4tej241.github.io/znacenie_mapy/app/`.
5. **Lokálne:** do `apps/web/.env.local` doplň `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY`.
6. **GitHub:** v repozitári *Settings → Secrets and variables → Actions* pridaj secrets `SUPABASE_URL` a `SUPABASE_ANON_KEY`.

## Akceptačné kritériá

- [x] `/app/` bez relácie zobrazí prihlasovaciu obrazovku, nie mapu. Nenačíta sa MapLibre, dlaždice Mapy.com ani `trails.pmtiles`.
- [x] Na obrazovke je jediný spôsob prihlásenia: tlačidlo „Prihlásiť sa cez Google“. Žiadne pole na e-mail ani heslo.
- [x] Klik na tlačidlo presmeruje na Supabase (`/auth/v1/authorize?provider=google`, PKCE) s návratom na `/app/`.
- [ ] Po prihlásení skutočným Google účtom sa zobrazí mapa. *(neoverené, čaká na Supabase projekt)*
- [x] S platnou reláciou sa zobrazí mapa a v paneli nástrojov „Odhlásiť sa“.
- [x] Pozícia mapy z URL sa po návrate z prihlásenia obnoví.
- [x] Chyba pri návrate (`?error=…`) zobrazí „Prihlásenie sa nepodarilo. Skús to znova.“ a URL sa vyčistí.
- [ ] „Odhlásiť sa“ odhlási a zobrazí prihlasovaciu obrazovku. *(neoverené, vyžaduje spojenie so Supabase)*
- [x] Bez premenných Supabase sa zobrazí zrozumiteľná chyba.
- [x] Prihlasovacia obrazovka nemá vodorovný posuvník pri 390 px a nenačítava písma z Google.
- [x] Úvodná stránka `/` funguje bez prihlásenia a jej bundle neobsahuje Supabase ani MapLibre.
- [x] `npx tsc -b && npm run build` prejde bez chýb.

## Overenie

```bash
cd apps/web && npx tsc -b && npm run build -- --base=/znacenie_mapy/
npm run dev    # s VITE_SUPABASE_URL a VITE_SUPABASE_ANON_KEY v .env.local
```

- `http://localhost:5173/app/` → prihlasovacia obrazovka, v sieťových požiadavkách nič z `api.mapy.com`.
- Klik na „Prihlásiť sa cez Google“ → výber Google účtu → návrat na mapu.
- Otvoriť `http://localhost:5173/app/#15/49.1208467/20.0605401` neprihlásený, prihlásiť sa → mapa je na Štrbskom plese.
- „Odhlásiť sa“ → prihlasovacia obrazovka; obnovenie stránky zostane na nej.
- V Supabase *Authentication → Users* pribudol používateľ s poskytovateľom Google.

## Otvorené otázky

žiadne

## Výsledok implementácie

Implementované na vetve `claude/tender-mayer-pcm8qp` (cloudová relácia, nie `tiket/T-002-…`).

**Zmenené súbory:** nové `src/supabase.ts`, `src/auth.ts`, `src/LoginScreen.tsx`, `src/AuthGate.tsx`; upravené `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/vite-env.d.ts`, `.env.example`, `package.json` (+ `@supabase/supabase-js`), `.github/workflows/pages.yml`, `CLAUDE.md`, `specifikacia.md` (kap. 2, 4, 9.3, 14.1, 14.6), `tickets/T-001-supabase-schema.md` (klient a založenie projektu presunuté sem).

**Overenie (headless Chrome, skúšobné hodnoty Supabase, bez skutočného projektu):**
- prihlasovacia obrazovka pri 1280×800 aj 390×844, bez posuvníka, žiadne požiadavky na MapLibre, Mapy.com, pmtiles ani Google Fonts,
- klik na tlačidlo smeruje na `https://<projekt>.supabase.co/auth/v1/authorize?provider=google&redirect_to=…/app/&code_challenge=…`,
- `?error=access_denied` zobrazí chybu a URL sa vyčistí na `/app/`,
- uložená pozícia mapy sa po návrate obnoví (`/app/?code=…#15/49.12/20.06`),
- s podvrhnutou reláciou v `localStorage` sa vykreslí mapa a tlačidlo „Odhlásiť sa“ s e-mailom v `title`,
- `tsc -b` a `npm run build -- --base=/znacenie_mapy/` prešli.

**Neoverené:** skutočné prihlásenie Google účtom a odhlásenie. Vyžadujú Supabase projekt a Google OAuth klienta podľa návodu vyššie.

**Odchýlky a poznámky:**
- Tiket už nezávisí od T-001: stačí Supabase projekt, schéma nie je potrebná.
- Tlačidlo „Odhlásiť sa“ v paneli nástrojov je dočasné, nahradí ho menu účtu (T-008).
- Po nasadení do `main` bez secrets `SUPABASE_URL` a `SUPABASE_ANON_KEY` ukáže `/app/` chybu „Chýba nastavenie Supabase“ namiesto mapy.
