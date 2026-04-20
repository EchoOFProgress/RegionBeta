# Pravidla promptování pro Claude Code

## Tip 1 – Udržuj modulární strukturu aplikace

- Dělej **malé, zaměřené soubory** – každý dělá jednu věc
- Maximálně **~600 řádků kódu** na soubor
- AI pracuje s kontextovým oknem – velké soubory způsobují halucinace a rozbíjení již opravených věcí
- Toto pravidlo přidej do souboru `CLAUDE.md`, aby se opakovalo automaticky při každé session

## Tip 2 – Rozuměj stavebním blokům aplikace před promptováním

- Než začneš psát prompty, **pochop, jak tvá aplikace funguje**
- AI tě neochrání před problémy, které sám neznáš (např. race conditions, bezpečnost, škálovatelnost)
- Tvůj úkol není napsat každý řádek kódu – tvůj úkol je **vědět, na co se zeptat**

## Tip 3 – Jeden úkol na session, pak test a push na GitHub

- Před zahájením práce si vytvoř **plán v Markdown souboru** – každá funkce rozbitá na malé úkoly
- Pracuj **postupně, úkol po úkolu**
- Po dokončení úkolu ho **ručně otestuj**
- Pokud vše funguje → **pushni na GitHub**
- Máš tak zálohu každého kroku – pokud AI něco pozdějí rozbije, snadno se vrátíš zpět
