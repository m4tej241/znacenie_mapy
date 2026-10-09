# Tikety

Každý tiket rieši jednu konkrétnu vec, ktorá sa dá urobiť v jednej konverzácii a skontrolovať v jednom diffe. Šablóna: [TEMPLATE.md](TEMPLATE.md).

## Postup

1. **Diskusia** o funkcii s Claude, potom `/ticket` zapíše tiket (stav `draft`).
2. **Kontrola:** keď je tiket úplný a nemá otvorené otázky, stav sa zmení na `ready`.
3. **Implementácia** v novej konverzácii: `/implement T-xxx` (vlastná vetva `tiket/T-xxx-…` z `dev`, stav `in-progress` → `review`).
4. **Revízia** vlastníkom projektu, merge vetvy tiketu do `dev`, stav `done`. Z `dev` sa do `main` (nasadenie) merguje samostatne, na výslovnú žiadosť.

Stavy: `draft` → `ready` → `in-progress` → `review` → `done`.

## Prehľad

| Tiket | Názov | Fáza | Stav | Závisí od |
|---|---|---|---|---|
| [T-001](T-001-supabase-schema.md) | Supabase projekt a databázová schéma | 1 | draft | – |
| [T-002](T-002-prihlasenie.md) | Prihlásenie, registrácia a odhlásenie | 1 | draft | T-001 |
| [T-003](T-003-ukladanie-oznaceni.md) | Ukladanie označení do databázy | 1 | draft | T-001, T-002 |
| [T-004](T-004-vrstva-prejdenych.md) | Vrstva prejdených úsekov z databázy | 1 | draft | T-003 |
| [T-005](T-005-undo-offline.md) | Undo a hlásenie pri výpadku internetu | 1 | draft | T-003 |
| [T-006](T-006-ucet-zmazanie.md) | Stránka účtu a zmazanie účtu | 1 | draft | T-002 |
| [T-007](T-007-uvodna-stranka.md) | Úvodná stránka s cenníkom (mesačné a ročné predplatné) | 4 | review | – |
