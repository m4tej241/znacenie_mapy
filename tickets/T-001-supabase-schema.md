---
id: T-001
nazov: Supabase projekt a databázová schéma
stav: draft
faza: 1
zavisi-od: []
vetva:
---

## Kontext

Základ fázy 1: databáza na účty a prejdené úseky. Návrh je v `specifikacia.md` kap. 7 (dátový model) a kap. 8 (API).

## Rozsah

**Áno:**
- založenie Supabase projektu (región EÚ), PostGIS,
- SQL migrácie v `supabase/migrations/`: tabuľky, indexy, RLS politiky,
- RPC `my_walked_segments()` (kap. 8),
- napojenie klienta: `@supabase/supabase-js`, premenné `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` v `.env.example`.

**Nie:** prihlasovanie v UI (T-002), ukladanie označení z mapy (T-003).

## Technické riešenie

Doplní sa v diskusii.

## Akceptačné kritériá

Doplní sa v diskusii.

## Overenie

Doplní sa v diskusii.

## Otvorené otázky

- **Ukladať do DB celú sieť úsekov, alebo len prejdené úseky s geometriou?** Kap. 7 počíta s tabuľkou `segments` (41 000 úsekov sa zmestí). Pri budúcom rozšírení ciest (fáza 5, ~1,45 mil. úsekov) by sa nezmestila do bezplatného Supabase. Alternatíva: `user_segments` ukladá aj geometriu a atribúty úseku z momentu označenia.
- Kto založí Supabase účet a projekt (vlastník projektu ručne, alebo cez Supabase CLI)?
- Lokálny vývoj: Supabase CLI s lokálnou DB (Docker), alebo priamo vzdialený projekt?

## Výsledok implementácie

