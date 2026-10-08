---
name: implement
description: Implementuje jeden tiket z tickets/ (napr. "/implement T-003") na vlastnej vetve, overí akceptačné kritériá a zapíše výsledok do tiketu.
argument-hint: "T-xxx"
disable-model-invocation: true
---

# Implementácia tiketu

Implementuj tiket `$ARGUMENTS`. Tiket je jediné zadanie: neopieraj sa o predpoklady mimo tiketu, `CLAUDE.md`, `specifikacia.md` a kód v repozitári.

## 1. Kontrola pred začatím

- Nájdi `tickets/$ARGUMENTS-*.md`. Ak neexistuje, zastav a povedz to.
- Stav musí byť `ready`. Ak je `draft` alebo tiket má otvorené otázky, **zastav**. Vypíš, čo chýba, a odporuč dokončiť tiket cez `/ticket`.
- Všetky tikety v `zavisi-od` musia mať stav `done`. Ak nie, zastav a vypíš ktoré.
- `git status` musí byť čistý. Ak nie je, zastav a opýtaj sa, čo so zmenami.
- Vetva `dev` musí existovať. Ak nie, zastav.

## 2. Príprava

- Vytvor vetvu z aktuálneho `dev`: `git switch dev && git switch -c tiket/<ID>-<slug>`.
- V tikete nastav `stav: in-progress` a `vetva: tiket/<ID>-<slug>`. Rovnako aktualizuj riadok v `tickets/README.md`.
- Prečítaj `CLAUDE.md`, kapitoly špecifikácie, na ktoré tiket odkazuje, a všetky súbory z časti „Technické riešenie“.

## 3. Implementácia

- Rob **len to, čo je v rozsahu tiketu**. Čo je pod „Nie“, nerob, ani keď sa to ponúka.
- Ak tiket v niečom zásadnom nestačí (chýba rozhodnutie, ktoré mení správanie, dátový model alebo UI):
  - **nehádaj,**
  - zapíš otázku do „Otvorené otázky“ v tikete, nastav `stav: ready` späť,
  - zastav a povedz používateľovi, čo treba rozhodnúť.
- Drobnosti, ktoré tiket nerieši a nemenia správanie (názov premennej, poradie importov), rozhodni sám a uveď ich v odchýlkach.
- Dodržuj konvencie z `CLAUDE.md` a štýl okolitého kódu.

## 4. Overenie

- Over **každé akceptačné kritérium** a postupuj podľa časti „Overenie“ v tikete.
- Vždy spusti aspoň `cd apps/web && npx tsc -b && npm run build`.
- Pri zmenách UI spusti appku a over správanie v prehliadači (postup je v `CLAUDE.md`). Pozri sa na snímku obrazovky, nestačí, že kód prešiel kompiláciou.
- Kritérium, ktoré sa nepodarilo overiť, nezaškrtávaj a uveď prečo.

## 5. Zápis výsledku a odovzdanie

- Do časti „Výsledok implementácie“ v tikete zapíš:
  - zoznam zmenených súborov a čo sa v nich zmenilo (stručne),
  - výsledok overenia každého kritéria,
  - odchýlky od tiketu a dôvod.
- V kritériách zaškrtni splnené `- [x]`.
- Nastav `stav: review` v tikete aj v `tickets/README.md`.
- Commitni na vetve tiketu so správou `<ID>: <názov tiketu>`. **Nemerguj (ani do `dev`, ani do `main`) a nepushuj**, revíziu a merge do `dev` robí vlastník projektu.

## Odpoveď používateľovi

Krátko: čo je hotové, výsledok overenia (čo prešlo, čo nie), odchýlky a ako si to môže pozrieť (vetva, príkaz na spustenie).
