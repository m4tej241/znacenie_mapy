---
name: ticket
description: Zapíše výsledok diskusie o jednej funkcii do tiketu v tickets/ (nový tiket alebo úprava existujúceho, napr. "/ticket T-003"). Použi, keď používateľ chce zapísať, vytvoriť alebo doplniť tiket.
argument-hint: "[T-xxx | krátky názov]"
disable-model-invocation: true
---

# Zápis tiketu

Zapíš výsledok aktuálnej diskusie do tiketu tak, aby ho **iný model v novej konverzácii vedel implementovať bez akejkoľvek ďalšej informácie**. Implementujúci model uvidí iba tiket, `CLAUDE.md` a súbory repozitára, nie túto konverzáciu.

Argument: `$ARGUMENTS`

## Postup

1. **Urči tiket.**
   - Ak argument je ID (`T-003`), uprav existujúci súbor `tickets/T-003-*.md`.
   - Inak vytvor nový: ID = najvyššie číslo v `tickets/` + 1 (formát `T-007`), súbor `tickets/T-007-<kratky-slug-bez-diakritiky>.md` podľa `tickets/TEMPLATE.md`.
2. **Zhrň len finálne rozhodnutia** z diskusie. Zamietnuté alternatívy nepíš do technického riešenia. Ak je dôležité, že sa niečo robiť nemá, uveď to v časti „Nie (mimo tohto tiketu)“.
3. **Vyplň všetky časti šablóny:**
   - **Kontext:** prečo, s odkazom na kapitolu `specifikacia.md`.
   - **Rozsah:** áno / nie.
   - **Technické riešenie:** konkrétne súbory, dátové štruktúry, SQL, názvy funkcií, presné texty v UI (po slovensky), existujúci kód na znovupoužitie (s cestou). Over v repozitári, že spomínané súbory a funkcie existujú.
   - **Akceptačné kritériá:** overiteľné body ako zoznam `- [ ]`.
   - **Overenie:** konkrétne príkazy a scenáre.
   - **Otvorené otázky:** všetko, čo sa v diskusii nerozhodlo.
4. **Stav:**
   - `ready` iba ak nie sú otvorené otázky a používateľ súhlasí, že tiket je hotový,
   - inak `draft`.
   - Vyplň `zavisi-od` a `faza`.
5. **Rozsah tiketu:** jeden tiket = jedna vec na jednu konverzáciu a jeden diff. Ak je diskusia väčšia, navrhni rozdelenie na viac tiketov a opýtaj sa, či ich vytvoriť.
6. **Aktualizuj prehľad** v `tickets/README.md` (riadok tiketu: názov, fáza, stav, závislosti).
7. **Ak rozhodnutie mení špecifikáciu** (dátový model, fázy, rozsah), uprav aj `specifikacia.md` a povedz to.
8. **Nezačínaj implementáciu.** Tikety sa zapisujú na vetvu `dev`. Ak je iná vetva aktívna, upozorni na to. Nič necommituj, pokiaľ to používateľ výslovne nežiada.

## Odpoveď používateľovi

Krátko: cesta k tiketu, stav, 3 – 5 hlavných bodov riešenia a zoznam otvorených otázok (ak nejaké sú). Ak je `ready`, pripomeň: v novej konverzácii `/implement T-xxx`.
