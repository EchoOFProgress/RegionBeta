# Pravidla pro tuto session

## 1. Modulární struktura — malé soubory

- Udržuj každý soubor pod **600 řádků kódu**
- Každý soubor dělá **jednu věc** — router, helpers, auth, atd. jsou samostatné moduly
- Pokud soubor přesáhne limit, **rozděl ho** na menší části před tím než začneš pracovat
- Nikdy nepřepisuj funkční kód jen proto že pracuješ na jiné části souboru

## 2. Před zahájením úkolu — analyzuj kontext

Před tím než začneš cokoliv psát nebo měnit:

1. **Projdi strukturu projektu** — jaké soubory existují, jak spolu souvisí
2. **Pochop zadání do hloubky** — zadání říká co chce uživatel, ale implicitně obsahuje i věci které nebyly napsány:
   - Pokud se mění UI → zkontroluj jestli to neovlivní responsivitu, dark mode, přístupnost
   - Pokud se mění API → zkontroluj všechna místa kde se volá
   - Pokud se přidává funkce → zkontroluj jestli už neexistuje podobná
   - Pokud se mění databázový model → zkontroluj migrace a validace
3. **Vyhledej na internetu** pokud narážíš na knihovnu, pattern nebo technologii kterou neznáš dostatečně dobře — použij aktuální dokumentaci, ne jen tréninkové znalosti
4. **Napiš krátké shrnutí** co uděláš a proč, než začneš — aby uživatel mohl opravit špatné pochopení dříve než ztratíš čas
6. **ptej se** ptej se mě dokud si nebudeš na 95% jistý že víš co chci