---
id: T-005
nazov: Undo a hlásenie pri výpadku internetu
stav: draft
faza: 1
zavisi-od: [T-003]
vetva:
---

## Kontext

Kap. 9.2 (undo posledných akcií v relácii) a kap. 9.4 (appka je iba online, bez pripojenia zablokuje označovanie).

## Rozsah

**Áno:**
- tlačidlo Späť pre posledné označenia/odznačenia v rámci relácie,
- detekcia výpadku pripojenia, hláška „Nie si pripojený k internetu“, zablokované označovanie,
- žiadna offline fronta zmien.

**Nie:** ukladanie histórie zmien do DB.

## Technické riešenie

Doplní sa v diskusii.

## Akceptačné kritériá

Doplní sa v diskusii.

## Overenie

Doplní sa v diskusii.

## Otvorené otázky

- Koľko krokov späť (napr. 20)? Aj klávesová skratka Ctrl+Z?
- Umiestnenie tlačidla a hlášky v UI.

## Výsledok implementácie

