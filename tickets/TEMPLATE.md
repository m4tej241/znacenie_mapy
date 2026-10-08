---
id: T-000
nazov: Krátky názov jednej konkrétnej veci
stav: draft            # draft | ready | in-progress | review | done
faza: 1                # fáza zo specifikacia.md, kap. 11
zavisi-od: []          # napr. [T-001, T-002]
vetva:                 # vyplní /implement, napr. tiket/T-003-ukladanie-oznaceni
---

## Kontext

Prečo to robíme a čo sa tým dosiahne. Odkaz na kapitolu špecifikácie (napr. `specifikacia.md` kap. 7).

## Rozsah

**Áno:**
- …

**Nie (mimo tohto tiketu):**
- …

## Technické riešenie

Presne čo a ako sa má urobiť, aby to implementujúci model nemusel domýšľať:
- súbory, ktoré sa vytvoria alebo zmenia,
- dátový model, SQL, API, názvy funkcií a komponentov,
- správanie UI vrátane textov, ktoré uvidí používateľ,
- existujúci kód, ktorý sa má použiť.

## Akceptačné kritériá

Overiteľné body, každý sa dá jednoznačne potvrdiť alebo vyvrátiť:
- [ ] …

## Overenie

Ako to otestovať: príkazy, scenáre v prehliadači, čo má byť na snímke.

## Otvorené otázky

Musí byť prázdne (alebo „žiadne“), kým je tiket `ready`.

## Výsledok implementácie

Vyplní `/implement`: čo sa zmenilo, výsledok overenia každého kritéria, odchýlky od tiketu.
