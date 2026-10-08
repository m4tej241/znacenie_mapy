---
id: T-003
nazov: Ukladanie označení do databázy
stav: draft
faza: 1
zavisi-od: [T-001, T-002]
vetva:
---

## Kontext

Dnes sa označenia držia len v pamäti prehliadača a po obnovení stránky zmiznú (`apps/web/src/App.tsx`, stav `walked`). Majú sa ukladať do `user_segments` (kap. 7, 8).

## Rozsah

**Áno:**
- označenie a odznačenie úseku zapíše/zmaže riadok v DB,
- optimistický update a vrátenie pri chybe s hláškou (kap. 9.2),
- načítanie mojich označení po prihlásení,
- prechod z dočasných numerických `id` vo feature-state na stabilné `sid` úseku.

**Nie:** vykresľovanie prejdených úsekov z GeoJSON (T-004), undo (T-005).

## Technické riešenie

Doplní sa v diskusii.

## Akceptačné kritériá

Doplní sa v diskusii.

## Overenie

Doplní sa v diskusii.

## Otvorené otázky

- Čo s označeniami urobenými pred prihlásením (zahodiť, alebo uložiť po prihlásení)?
- Závisí od rozhodnutia v T-001 (ukladá sa aj geometria úseku?).

## Výsledok implementácie

