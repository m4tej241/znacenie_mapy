---
id: T-002
nazov: Prihlásenie, registrácia a odhlásenie
stav: draft
faza: 1
zavisi-od: [T-001]
vetva:
---

## Kontext

Používateľ potrebuje účet, aby sa jeho prejdené úseky ukladali. Kap. 9.3: uzavretá appka, účty len pre pozvaných. Pri komerčnom spustení (fáza 4) sa registrácia otvorí.

## Rozsah

**Áno:**
- prihlásenie, odhlásenie, obnova hesla,
- stav prihlásenia v appke (kto je prihlásený), mapa sa dá pozerať aj bez prihlásenia?

**Nie:** stránka účtu a zmazanie účtu (T-006), Google prihlásenie (ak sa nerozhodne inak).

## Technické riešenie

Doplní sa v diskusii.

## Akceptačné kritériá

Doplní sa v diskusii.

## Overenie

Doplní sa v diskusii.

## Otvorené otázky

- Spôsob prihlásenia: magic link e-mailom (kap. 9.3), alebo e-mail + heslo?
- Uvidí neprihlásený používateľ mapu (len bez označovania), alebo najprv prihlasovaciu obrazovku?
- Ako sa budú pozývať kamaráti (Supabase dashboard, pozývacie odkazy)?
- Vzhľad a texty prihlasovacej obrazovky.

## Výsledok implementácie

