---
id: T-006
nazov: Stránka účtu a zmazanie účtu
stav: draft
faza: 1
zavisi-od: [T-002]
vetva:
---

## Kontext

GDPR a neskôr podmienka predaja (kap. 13.5, 14.1): používateľ si musí vedieť zmazať účet aj so všetkými dátami.

## Rozsah

**Áno:**
- stránka/panel účtu: e-mail, zmena hesla (ak sa použije heslo), odhlásenie,
- zmazanie účtu s potvrdením: zmaže používateľa aj jeho `user_segments` (cez Edge Function, lebo klient nemôže mazať v `auth.users`).

**Nie:** export dát (zatiaľ).

## Technické riešenie

Doplní sa v diskusii.

## Akceptačné kritériá

Doplní sa v diskusii.

## Overenie

Doplní sa v diskusii.

## Otvorené otázky

- Potvrdenie zmazania: zadaním e-mailu, textom „ZMAZAŤ“, alebo dvojitým potvrdením?
- Má sa poslať potvrdzujúci e-mail po zmazaní?

## Výsledok implementácie

