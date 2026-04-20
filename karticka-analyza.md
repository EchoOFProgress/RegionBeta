# Analýza: Co dělá kartičku dobrou — a co ji zabíjí

> Interní prompt pro tvorbu karet. Vychází z porovnání dvou verzí karty „Čtyři zákony dobrého návyku."

---

## Proč byla první verze špatná

### 1. AI věty — okamžitě poznatelné, okamžitě odpuzující

První verze otevírala větou:
> *„Proč některé návyky vydrží a jiné se rozpadnou po prvním týdnu?"*

Toto je typický AI pattern: rétoricka otázka jako úvod, která nevypovídá nic, nezaujme nikoho a zní jako každý druhý motivační článek na internetu. Čtenář to podvědomě rozpozná a přestane číst.

**Pravidlo:** Nikdy nezačínat rétorickými otázkami. Nikdy nezačínat obecným kontextem. Rovnou k věci.

---

### 2. Krátký popis neobsahoval obsah

První verze krátkého popisu říkala *že* existují čtyři zákony, ale neříkala *jaké* jsou. Uživatel si musel přečíst celý dlouhý text, aby se dozvěděl základní informaci.

Druhá verze naopak všechny čtyři zákony pojmenovala přímo v krátkém popisu — s jejich klíčovými mechanikami. Uživatel, který přečte jen první odstavec, dostane kompletní informaci. Ten, kdo čte dál, dostane hloubku.

**Pravidlo:** Krátký popis = komprimovaná verze celé karty. Má obsahovat všechny klíčové informace, ne jen příslib, že jsou někde dole.

---

### 3. Dlouhý text byl zředěný — „AI slop"

První verze měla věty jako:
> *„Mozek nevyhodnocuje, jak náročné cvičení bude. Vyhodnocuje, jak náročné bude začít."*

Zní chytře, ale neříká nic konkrétního. Je to vysvětlování věcí, které si čtenář dokáže odvodit sám. Každá taková věta zabírá místo, které mohla obsadit skutečná informace.

**Pravidlo:** Každá věta musí přinášet buď konkrétní informaci, konkrétní techniku, nebo konkrétní příklad. Pokud věta pouze parafrázuje to, co bylo řečeno větou předtím — smazat.

---

### 4. Název zněl genericky

> *„Čtyři zákony dobrého návyku"*

Toto je název, který by vygenerovala jakákoliv AI na světě. Popisuje obsah, ale nepřitahuje pozornost. Chybí mu specifičnost, hlas, záměr.

> *„Pravidla pro budování návyků"*

Kratší, přímočařejší, méně nadutý.

**Pravidlo:** Název nesmí znít jako nadpis Wikipedie ani jako podtitul knihy pro seberozvojový podcast. Má být konkrétní, přímý, bez zbytečných adjektiv.

---

## Proč byla druhá verze lepší

### 1. Hustota informací

Druhá verze obsahuje ve stejném prostoru výrazně více použitelných informací. Každý zákon má: název, mechanismus, konkrétní techniku, konkrétní příklad. Žádná věta není jen „výplň".

### 2. Konkrétní příklady místo abstrakcí

Místo „spojte návyk s odměnou" → „oblíbený podcast jen při chůzi, seriál jen při cvičení na rotopedu."
Místo „buďte konkrétní" → „každé pondělí v 7:00 si obléknu sportovní oblečení a půjdu do posilovny."

Příklad je vždy silnější než definice.

### 3. Odborný hlas bez přednáškového tónu

Druhá verze zní jako autor, který věc opravdu zná — ne jako někdo, kdo ji čtenáři vysvětluje. Rozdíl je v tónu: první verze „učila", druhá verze „sdílela."

---

## Logika karet — jak správně strukturovat obsah

### Hierarchie textů: každá vrstva rozšiřuje tu předchozí

Karta má tři vrstvy obsahu. Každá vrstva musí fungovat samostatně — a zároveň každá další musí přinášet něco navíc, ne jen opakovat to, co bylo řečeno výše.

```
NÁZEV
  └── zaujme, pojmenuje situaci nebo myšlenku
        │
KRÁTKÝ POPIS
  └── komprimovaná verze celé karty — klíčové informace, ne jen příslib obsahu
        │
DLOUHÝ POPIS
  └── rozšiřuje krátký popis o mechanismy, techniky a příklady
      nepřepisuje ho, nepřepráví ho — jde do hloubky
```

**Konkrétně:** Pokud krátký popis řekne „návyk musí být zřejmý, přitažlivý, snadný a uspokojivý", dlouhý popis k tomu přidá techniky (habit stacking, temptation bundling, pravidlo dvou minut) a konkrétní příklady. Ne znovu vysvětlí, co znamená „zřejmý."

---

### Situační cílení — karta je odpověď, ne článek

Každá karta se zobrazuje v konkrétní situaci — a musí na tuto situaci reagovat od první věty. Spouštěč (trigger) není jen technická metadata. Je to kontext, ve kterém se text čte.

**Příklad — karta „14 pádů. A přesto v cíli."**

Spouštěč: uživatel právě ztratil streak delší než 10 dní.

V tuto chvíli uživatel:
- se cítí provinile nebo demotivovaně
- zvažuje, jestli má smysl pokračovat
- potřebuje ujištění, že to co zažívá je normální — ne diagnózu svých chyb

Karta proto nesmí začínat obecnou informací o behaviorální psychologii. Musí začít přímo tam, kde uživatel stojí — a okamžitě mu nabídnout relevantní perspektivu.

✅ Správně: *„Ztráta streaku bolí — ale pravděpodobně ne z důvodu, který si myslíte."*
❌ Špatně: *„Věda o behaviorální změně bourá jeden z největších mýtů osobního rozvoje."*

Druhá věta je zajímavá. Ale pro člověka, který se právě cítí jako selhání, není relevantní — mluví o vědě, ne o něm.

---

### Jak psát pro konkrétní situaci

Před psaním karty si odpovědět na tři otázky:

1. **Co uživatel právě zažívá?**
   Ztratil streak? Nastavuje nový cíl? Selhal podruhé za sebou? Chce začít s návykem, ale prokrastinuje?

2. **Co potřebuje slyšet jako první?**
   Ujištění (jsi v pořádku, tohle je normální)? Konkrétní instrukci (udělej toto teď)? Novou perspektivu (tady děláš chybu)?

3. **Jaký je nejdůležitější posun, který má karta vyvolat?**
   Od pocitu selhání k akci? Od vágního záměru ke konkrétnímu plánu? Od perfekcionismu k „stačí začít"?

Odpovědi na tyto tři otázky určují jak název, tak první větu krátkého popisu, tak celkový tón karty.

---

### Tónový rozdíl podle situace

| Situace uživatele | Správný tón | Špatný tón |
|---|---|---|
| Právě selhal / ztratil streak | Uklidňující, normalizující, akční | Motivační, přednáškový |
| Nastavuje nový návyk | Instruktivní, konkrétní, bez patosu | Inspirativní, obecný |
| Opakovaně selhává ve stejném místě | Analytický, bez souzení, s řešením | Empatický bez obsahu |
| Nezačal vůbec | Odstraňující bariéry, minimalistický | Velké cíle, velká energie |

---

## Obecná pravidla pro psaní karet

### Název
- Žádné rétoricke otázky jako název
- Žádné generické „Jak X" nebo „Proč Y"
- Konkrétní, přímý, s hlasem
- Ideálně reaguje na situaci uživatele, ne jen popisuje obsah

### Krátký popis
- Obsahuje VŠECHNY klíčové informace karty — komprimovaně
- Uživatel, který přečte jen krátký popis, musí odejít s hodnotou
- První věta reaguje na situaci uživatele — ne na téma karty obecně
- Délka: 3–5 vět, každá nabytá obsahem

### Dlouhý popis
- Rozšiřuje krátký popis — nepřepisuje ho, nepřepráví ho
- Žádné úvodní věty, které „rozbíhají" téma — rovnou do první techniky nebo mechanismu
- Každá věta = konkrétní informace, technika nebo příklad
- Pokud odstraním větu a nic se neztratí → věta tam nepatří
- Příklady jsou povinné u každé techniky
- Žádné dvojité vysvětlování (říct něco jednou jasně > říct to dvakrát opakovaně)

### Tón a hlas
- Psát jako profesionální autor, ne jako AI asistent
- Žádné rétoricke otázky
- Žádné „možná jste to zažili" / „pravděpodobně víte" / „jistě jste slyšeli"
- Přímá řeč, aktivní slovesa, bez nadutých abstrakcí
- Odbornost se projevuje konkrétností, ne složitostí vět
- Tón se přizpůsobuje situaci uživatele — ne jen tématu karty

---

## Vzorový test kvality před odevzdáním

Před dokončením karty projít tento checklist:

1. **Situace** — vím přesně, kde uživatel stojí, když kartu uvidí? Reaguje na to první věta?
2. **Název** — zní jako člověk, nebo jako AI?
3. **Krátký popis** — pokud přečtu jen tohle, odejdu s hodnotou? Jsou tam všechny klíčové informace?
4. **Hierarchie** — rozšiřuje dlouhý text krátký popis, nebo ho jen přeříkává jinými slovy?
5. **Každá věta v dlouhém textu** — přináší konkrétní informaci, techniku nebo příklad?
6. **Příklady** — jsou u každé techniky konkrétní příklady?
7. **Tón** — odpovídá tón situaci uživatele? Je tam alespoň jedna rétoricka otázka nebo „AI fráze"? Smazat.
8. **Hustota** — dá se zkrátit o 20 % bez ztráty obsahu? Zkrátit.
