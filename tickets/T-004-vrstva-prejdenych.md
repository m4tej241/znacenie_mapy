---
id: T-004
nazov: Vrstva prejdených úsekov z databázy
stav: draft
faza: 1
zavisi-od: [T-003]
vetva:
---

## Kontext

Prejdené úseky musia byť viditeľné pri každom priblížení (kap. 4, 9.1). Dnešné riešenie cez feature-state na vektorových dlaždiciach funguje len tam, kde sú úseky v dlaždiciach.

## Rozsah

**Áno:**
- GeoJSON zdroj z RPC `my_walked_segments()`, vrstva s farbou trasy a bielym okrajom (rovnaký vzhľad ako dnes),
- aktualizácia vrstvy po označení/odznačení.

**Nie:** štatistiky (fáza 2).

## Technické riešenie

Doplní sa v diskusii.

## Akceptačné kritériá

Doplní sa v diskusii.

## Overenie

Doplní sa v diskusii.

## Otvorené otázky

- Načítať všetky prejdené úseky naraz, alebo podľa výrezu mapy? (Pri stovkách až tisícoch úsekov stačí naraz.)
- Miera zjednodušenia geometrie (`ST_Simplify`).

## Výsledok implementácie

