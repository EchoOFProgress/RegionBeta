/**
 * ELITE INSIGHT DATABASE
 * Přeneseno z Insight_Cards_React/src/data/cards.js
 */

export interface InsightCardSource {
  type: string;
  name: string;
  links: { label: string; url: string }[];
}

export interface InsightCardAction {
  text: string;
  feedback: string;
}

export interface InsightCard {
  id: string;
  category: string;
  title: string;
  shortDescription: string;
  longDescription: string[];
  sources: InsightCardSource[];
  triggers: string[];
  nextCards: string[];
  primaryAction: InsightCardAction;
  secondaryAction: InsightCardAction;
}

const INSIGHT_CARDS: InsightCard[] = [
  {
    id: "card-streak",
    category: "Recovery · Psychologie",
    title: "Jeden den nevadí. Nepřidávejte druhý.",
    shortDescription:
      "Ztráta streaku bolí — ale pravděpodobně ne z důvodu, který si myslíte. Věda o behaviorální změně ukazuje, že lidé, kteří úspěšně udrželi nový návyk po dobu dvou let, selhali v průměru čtrnáctkrát. Jedno vynechání vás tedy neodlišuje od těch, kteří vzdali. Odlišilo by vás to druhé. Nejdůležitější věc, kterou teď můžete udělat, je zítra prostě pokračovat.",
    longDescription: [
      "To, co právě cítíte, má jméno — a není to selhání. Je to součást procesu, kterou prochází prakticky každý, kdo se o skutečnou změnu pokusí. Možná vás překvapí, že výzkumníci, kteří sledovali lidi po dobu dvou let, zjistili něco nečekaného: ti, kteří nakonec uspěli, neselhávali méně než ostatní. Selhávali stejně. Průměrně čtrnáctkrát. Jediný rozdíl byl v tom, co udělali hned po pádu.",
      'A tady přichází pravidlo, které stojí za to znát: <strong>nikdy nevynechejte dvakrát za sebou</strong>. Jedno vynechání je náhoda. Dvě vynechání jsou začátek nového vzorce. Jakmile vynecháte podruhé, už neřešíte selhání v návyku, ale začínáte budovat návyk nový — návyk vynechávání. Čím rychleji se vrátíte, tím méně práce máte s opravou své identity. Stačí jedna otázka: „Co zítra udělám jinak?" A pak ji zodpovědět činem, ne přemýšlením.',
    ],
    sources: [
      {
        type: "",
        name: "NORCROSS, John C., VANGARELLI, Dominic J. The resolution solution: longitudinal examination of New Year's change attempts. Journal of Substance Abuse, 1988.",
        links: [
          { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/2980864/" },
          {
            label: "ScienceDirect",
            url: "https://www.sciencedirect.com/science/article/abs/pii/S0899328988800166",
          },
        ],
      },
      {
        type: "",
        name: "Dr. K (HealthyGamerGG) – Why New Year's Resolutions Don't Work (podcast, leden 2022)",
        links: [
          {
            label: "Spotify",
            url: "https://open.spotify.com/episode/0VELmAsJ9ULbQDu5HGFlo0",
          },
        ],
      },
    ],
    triggers: [
      "Uživatel právě ztratil svůj streak",
      "Propad v aktivitě u sledovaného návyku",
    ],
    nextCards: [
      "Pravidla pro budování návyků",
      "Zabere to dvě minuty. Udělejte to teď.",
      "Lež, která motivuje miliony. A co funguje doopravdy.",
    ],
    primaryAction: {
      text: "Zítra pokračuji",
      feedback:
        "Skvělé! Zítřek je váš nový začátek. Streak je jen číslo, důležité je nevzdat se.",
    },
    secondaryAction: {
      text: "Více informací",
      feedback: "Načítám podrobné vědecké podklady...",
    },
  },
  {
    id: "card-goals",
    category: "Psychologie · Produktivita · Mýty",
    title: "Lež, která motivuje miliony. A co funguje doopravdy.",
    shortDescription:
      "Možná jste to někdy slyšeli: studie z Harvardu nebo Yale prý prokázala, že 3 % studentů, kteří si zapsali své cíle, vydělávala po dvaceti letech více než zbývajících 97 % dohromady. Je to silný příběh. Problém je, že se nikdy nestal. Rozsáhlé přehledy odborné literatury i investigativní žurnalistika magazínu Fast Company odhalily, že žádná taková studie nikdy neproběhla. Dominican University of California Ale to neznamená, že zapisování cílů nefunguje — znamená to jen, že realita je složitější a zajímavější než motivační slogan.",
    longDescription: [
      "Příběh o 3 % studentech koluje desetiletí. Šířili ho Tony Robbins, Zig Ziglar, Brian Tracy a desítky dalších autorů knih o osobním rozvoji. Nikdo z nich si však nedal práci ověřit zdroj — a když to konečně někdo udělal, knihovna Yale oficiálně potvrdila, že žádná taková studie třídy roku 1953 (ani 1954) nikdy neproběhla. Harvard má stejnou zkušenost.",
      "Ale tady přichází zajímavá část: mýtus byl tak přesvědčivý, že inspiroval psycholožku Dr. Gail Matthews z Dominican University k tomu, aby studii skutečně provedla. Do výzkumu zapojila 267 účastníků z různých profesních prostředí. Výsledky byly nečekané — ne proto, že zapisování nefunguje, ale proto, že samo o sobě nestačí. Skupina, která si cíle pouze zapsala, dosáhla průměrného skóre 6,08 (na stupni 1-10). Skupina, která si cíle nezapsala vůbec, skončila na 4,28. Zapisování tedy prokazatelně pomáhá — ale největší rozdíl nastal u skupiny, která k zapsaným cílům přidala i pravidelné hlášení o pokroku příteli. Tato skupina dosáhla skóre 7,64. Více než 70 % účastníků, kteří svůj pokrok pravidelně sdíleli (accountability), úspěšně dosáhlo svého cíle. Ve skupině, která jen přemýšlela, to bylo jen 35 %.",
      "Zapisování cíle tedy není magická zkratka — je to první krok v systému, který funguje nejlépe tehdy, když k němu přidáte konkrétní kroky a sociální závazek.",
    ],
    sources: [
      {
        type: "",
        name: "MATTHEWS, Gail. The Impact of Commitment, Accountability, and Written Goals on Goal Achievement. Dominican University of California, 2007.",
        links: [
          {
            label: "Originální výzkum (PDF)",
            url: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf",
          },
          {
            label: "Dominican University (abstrakt)",
            url: "https://scholar.dominican.edu/psychology-faculty-conference-presentations/3/",
          },
        ],
      },
      {
        type: "",
        name: "Yale/Harvard Libraries – Oficiální vyjádření k neexistenci původní studie.",
        links: [
          {
            label: "Yale FAQ",
            url: "https://ask.library.harvard.edu/faq/82314",
          },
        ],
      },
      {
        type: "",
        name: "RapidBI – Fact or fiction? The written goals study.",
        links: [
          {
            label: "Investigace",
            url: "https://rapidbi.com/harvard-yale-written-goals-study-fact-or-fiction/",
          },
        ],
      },
      {
        type: "",
        name: "Sid Savara – Harvard Study: Truth revealed.",
        links: [
          {
            label: "Ověření článku",
            url: "https://sidsavara.com/fact-or-fiction-the-truth-about-the-harvard-written-goal-study/",
          },
        ],
      },
    ],
    triggers: [
      "Uživatel si právě nastavuje nový cíl",
      "Uživatel poprvé používá funkci zapisování cílů",
    ],
    nextCards: [
      "Implementační záměr — Kdy, kde a jak přesně?",
      "SMART cíle — Jak formulovat cíl tak",
      "Accountability bez závislosti",
    ],
    primaryAction: {
      text: "Zapsat si cíl",
      feedback:
        "Dobrý začátek. Teď přidejte konkrétní den, čas a místo — to je místo, kde většina lidí přestane a vy nepřestanete.",
    },
    secondaryAction: {
      text: "Zjistit více",
      feedback: "Jak z cíle na papíře udělat cíl v životě.",
    },
  },
  {
    id: "card-twominute",
    category: "Produktivita · Prokrastinace · Správa úkolů",
    title: "Zabere to dvě minuty. Udělejte to teď.",
    shortDescription:
      "Váš seznam úkolů pravděpodobně nebrzdí velké projekty. Brzdí ho desítky drobností, které jste odložili — a které teď tiše vybíjejí vaši energii. Existuje jednoduchý filtr: pokud úkol zabere méně než dvě minuty, udělejte ho okamžitě. Ne proto, že máte čas. Ale proto, že veškerá administrativa kolem odkládání trvá déle než samotný úkol.",
    longDescription: [
      'Proč váš seznam roste, i když pracujete? Pravděpodobně ne proto, že nestíháte velké věci. Ale proto, že malé věci se hromadí rychleji, než je stíháte odbavovat. Pravidlo dvou minut říká: pokud akci dokončíte do dvou minut tam, kde právě jste, udělejte ji hned — protože znovu si ji prohlédnout, zařadit ji a přemýšlet o ní příště trvá déle než samotný úkol.',
      'Getting Things Done® E-mail s jednoduchou odpovědí, který leží v inboxu tři dny, není malý úkol. Je to malý úkol s velkým kognitivním dluhem. Pokaždé, když ho vidíte, váš mozek musí zpracovat informaci: „Tohle ještě není hotové." Za tím stojí Zeigarnikův efekt: nedokončené úkoly zůstávají aktivní v pracovní paměti. Nezmizí jen proto, že je ignorujete — zůstávají jako „otevřené smyčky", které tiše vybíjejí vaše soustředění a zvyšují úroveň stresu. Odpor k úkolu často pramení z jeho neurčitosti. Dvě minuty vás nutí definovat první krok.',
      'Jedna praktická výhrada: pravidlo platí při zpracování podnětů — ne jako pozvánka k přerušení hluboké práce. Pokud jste uprostřed důležitého projektu, nenechte se vyrušit emailem jen proto, že „trvá dvě minuty." V tu chvíli je nejdůležitější ochrana vašeho flow.',
    ],
    sources: [
      {
        type: "",
        name: "ALLEN, David. Getting Things Done: The Art of Stress-Free Productivity.",
        links: [
          {
            label: "Pravidlo dvou minut (James Clear)",
            url: "https://jamesclear.com/how-to-stop-procrastinating",
          },
          {
            label: "Web autora",
            url: "https://gettingthingsdone.com/2020/05/the-two-minute-rule-2/",
          },
        ],
      },
    ],
    triggers: [
      "Počet nesplněných úkolů přesáhl práh (10+)",
      "Uživatel opakovaně odkládá stejný malý úkol",
      "Uživatel neoznachil žádný úkol jako splněný déle než X dní",
    ],
    nextCards: [
      "James Clear a pravidlo dvou minut pro budování návyků",
      "Implementační záměr — Kdy, kde a jak přesně?",
    ],
    primaryAction: {
      text: "Najít úkol do 2 minut",
      feedback:
        "Podívejte se na svůj seznam. Co zaberete méně než dvě minuty? Udělejte to teď — ještě před tím, než budete číst dál.",
    },
    secondaryAction: {
      text: "Zjistit více",
      feedback:
        "Mistrovství v GTD vyžaduje praxi, ale začíná vteřinovým rozhodnutím.",
    },
  },
  {
    id: "card-habits",
    category: "Návyky · Psychologie · Produktivita",
    title: "Pravidla pro budování návyků",
    shortDescription:
      "James Clear v Atomic Habits tvrdí, že návyky neselhávají kvůli nedostatku disciplíny — selhávají kvůli špatnému návrhu. Každý návyk prochází čtyřmi fázemi: podnět, touha, reakce, odměna. Z toho vychází čtyři zákony: udělej ho zřejmým — konkrétní čas, místo a signál v prostředí. Udělej ho přitažlivým — spoj ho s něčím, co chceš dělat. Udělej ho snadným — odstraň tření a začni verzí, která trvá dvě minuty. Udělej ho uspokojivým — přidej okamžitou odměnu, protože mozek opakuje to, co přináší okamžité potěšení, ne to, co je správné.",
    longDescription: [
      '<strong>Zákon 1 — Udělej ho zřejmým</strong>: Návyk, který nevidíte, neuděláte. Nestačí mít záměr — mozek potřebuje konkrétní signál. Dvě techniky, které fungují: Implementační záměr: Místo „budu cvičit" si stanovte „každé pondělí v 7:00 si obléknu sportovní oblečení a půjdu do posilovny." Studie ukazují, že samotné určení konkrétního času a místa dramaticky zvyšuje pravděpodobnost akce — protože odstraňuje rozhodování v momentě, kdy na to máte nejméně energie. Habit stacking: Připojte nový návyk ke stávajícímu pomocí vzorce: „Po [STÁVAJÍCÍM NÁVYKU] udělám [NOVÝ NÁVYK]." Například: „Po ranní kávě si otevřu poznámky a napíšu jednu větu." Stávající návyk se stane automatickým spouštěčem nového.',
      '<strong>Zákon 2 — Udělej ho přitažlivým</strong>: Mozek neopakuje to, co je zdravé nebo správné. Opakuje to, co je spojené s odměnou — a tuto asociaci si vytváří ještě před samotnou akcí, v momentě touhy. Proto je potřeba návyk k odměně vědomě připojit. Temptation bundling: Spojte něco, co dělat musíte, s něčím, co dělat chcete. Oblíbený podcast jen při chůzi. Seriál jen při cvičení na rotopedu. Tím mozek začne anticipovat příjemný zážitek jako součást návyku — a touha udělat ho roste sama od sebe. Funguje i přerámování: místo „musím jít cvičit" zkuste „mám možnost jít cvičit." Není to motivační slogan — je to vědomá změna kontextu, která mění emocionální valenci akce.',
      '<strong>Zákon 3 — Udělej ho snadným</strong>: Tření rozhoduje více než motivace. Každá překážka mezi vámi a akcí snižuje pravděpodobnost, že ji uděláte. Chcete číst více? Položte knihu na polštář, ne do police. Chcete méně sledovat telefon? Dejte ho do jiné místnosti — ne jen na tichý režim. Zde přichází pravidlo dvou minut: když začínáte nový návyk, zmenšete ho na verzi, která trvá méně než dvě minuty. „Číst před spaním" se stane „přečíst jednu stránku." „Cvičit jógu" se stane „rozložit podložku." Cílem není dělat dvě minuty navždy — cílem je překonat odpor ke startu. Návyk musí nejprve existovat, než může být zlepšen. Konzistence před intenzitou.',
      '<strong>Zákon 4 — Udělej ho uspokojivým</strong>: Mozek funguje na principu okamžité zpětné vazby — přirozeně upřednostňuje odměny, které přicházejí teď, před těmi, které přijdou za měsíce. To je fundamentální problém zdravých návyků: jejich výsledky jsou vzdálené. Řešením je přidat okamžitou odměnu hned po splnění návyku — něco malého, co přináší okamžité potěšení a posiluje asociaci „návyk = dobrý pocit." Sledování návyku v aplikaci nebo záškrt v kalendáři funguje jako právě taková odměna — vidíte narůstající streak a mozek chce řetězec neporušit. Jedno pravidlo k tomu: nikdy nevynechejte dvakrát. Jedno vynechání je náhoda. Dvě jsou začátek nového, špatného vzorce.',
    ],
    sources: [
      {
        type: "",
        name: "CLEAR, James. Atomic Habits. Avery, 2018.",
        links: [
          {
            label: "Shrnutí autorových zákonů",
            url: "https://jamesclear.com/atomic-habits-summary",
          },
          {
            label: "Jak přestat prokrastinovat",
            url: "https://jamesclear.com/how-to-stop-procrastinating",
          },
        ],
      },
    ],
    triggers: [
      "Uživatel si nastavuje nový návyk poprvé",
      "Uživatel opakovaně přerušil stejný návyk",
      "Uživatel nastavil příliš ambiciózní frekvenci nebo délku návyku",
    ],
    nextCards: [
      "Zabere to dvě minuty. Udělejte to teď — David Allen a produktivita",
      "Jeden den nevadí. Nepřidávejte druhý — pravidlo dvou vynechání",
      "Implementační záměr — Kdy, kde a jak přesně?",
    ],
    primaryAction: {
      text: "Navrhnout návyk",
      feedback:
        "Pojďme projít čtyři zákony pro váš konkrétní návyk — a najít, kde se láme.",
    },
    secondaryAction: {
      text: "Zmenšit návyk",
      feedback:
        "Jaká je dvě minutová verze toho, co chcete dělat? Začněme tam.",
    },
  },
  {
    id: "card-discipline-equation",
    category: "Disciplína · Psychologie · Návyky",
    title: "Rovnice disciplíny",
    shortDescription:
      "Když rozložíme disciplínu na její základní části, dostaneme tři proměnné: jak moc vám na cíli záleží, jak moc vás baví samotný proces, a kolik odporu musíte překonat, abyste vůbec začali. Bartlett to zapsal jako rovnici: Důležitost + Potěšení − Friction. Podcast: 10 + 9 − 4 = +15 → děláte ho. Meditace: 3 + 2 − 6 = −1 → neděláte ji. Pokud něco nefunguje, není to otázka charakteru — je to záporná rovnice. A každou z těch tří proměnných lze vědomě změnit.",
    longDescription: [
      "<strong>Důležitost — jak ji posílit</strong><br>Důležitost není pevná — mění se podle toho, jak o cíli přemýšlíte. Bartlett popisuje, jak mu v covidu přestalo cvičení připadat jako estetická záležitost a začalo jako základ přežití. Nic jiného se nezměnilo, jen rámec — a chování, které roky nefungovalo, nastalo okamžitě.<br>Konkrétní technika: napište si, co se stane za 5 let, pokud tento cíl nesplníte. Ne co získáte — co ztratíte. Ztráta je psychologicky konkrétnější než zisk, a důležitost cíle roste úměrně tomu, jak reálná ztráta vypadá.",
      "<strong>Potěšení — jak ho posílit</strong><br>Potěšení z procesu lze vědomě konstruovat — není to něco, co buď cítíte přirozeně, nebo nikdy. Tři způsoby:<br><br>Temptation bundling: oblíbený podcast jen při cvičení, audiokniha jen při chůzi. Mozek začne anticipovat příjemný zážitek jako součást návyku — a touha ho udělat roste sama od sebe.<br>Viditelný pokrok: záškrty v kalendáři, čísla, streaky. Mozek odměňuje pohyb vpřed samotný — bez viditelného pokroku potěšení rychle vyprchá bez ohledu na to, jak moc vám na cíli záleží.<br>Sociální složka: cvičit s někým, studovat ve skupině, sdílet výsledky. Sociální odměna je jeden z nejsilnějších motivátorů, který máme k dispozici.",
      "<strong>Friction — jak ho snížit</strong><br>Bartlett přestal chodit do posilovny, kde ho všichni znali — trávil čas povídáním místo cvičením. Friction vzrostl natolik, že rovnice se stala zápornou. Podscripts Friction přitom nemusí být fyzická námaha — je to cokoliv, co stojí mezi vámi a začátkem. Dojezdová vzdálenost, nutnost hledat věci, rozhodování v momentě, kdy na to nemáte energii.<br>Řešení je vždy stejné: odstraňte rozhodovací kroky předem. Sportovní oblečení připravené večer, aplikace na první obrazovce, cvičební taška u dveří. Každý krok navíc tiše odčerpává z rovnice.",
      "<strong>Jak rovnici použít</strong><br>Vezměte návyk, který nefunguje. Ohodnoťte každou proměnnou od 1 do 10. Pokud je výsledek záporný — máte diagnózu. Nepotřebujete více vůle. Potřebujete opravit konkrétní proměnnou, která to táhne dolů.",
    ],
    sources: [
      {
        type: "",
        name: "BARTLETT, Steven — Modern Wisdom Podcast s Chrisem Williamsonem, ep. #688",
        links: [
          {
            label: "YouTube",
            url: "https://www.youtube.com/watch?v=JBgwF8aHByI",
          },
        ],
      },
      {
        type: "",
        name: "BARTLETT, Steven. The Diary of a CEO: 33 Laws of Business and Life. 2023.",
        links: [],
      },
    ],
    triggers: [
      "Uživatel opakovaně selhává u stejného návyku nebo cíle",
      'Uživatel říká, že mu „chybí motivace" nebo „není disciplinovaný"',
      "Uživatel nastavil cíl, ale po prvním týdnu přestal",
    ],
    nextCards: [
      "Pravidla pro budování návyků — čtyři zákony Atomic Habits",
      "Approach vs. Avoidance — proč záleží na tom, k čemu míříte",
      "Jeden den nevadí. Nepřidávejte druhý — pravidlo dvou vynechání",
    ],
    primaryAction: {
      text: "Spočítat svou rovnici",
      feedback:
        "Vezměte návyk, který nefunguje. Ohodnoťte Důležitost, Potěšení a Friction od 1 do 10. Kde je výsledek záporný?",
    },
    secondaryAction: {
      text: "Snížit friction",
      feedback:
        "Co je největší překážka mezi vámi a tímto návykem? Pojďme ji odstranit.",
    },
  },
  {
    id: "card-compounding",
    category: "Motivace · Produktivita · Psychologie",
    title: "„Cítili jsme, že někam jdeme\"",
    shortDescription:
      "Malé věci se nejen sčítají — skládají se. Warren Buffett nazývá složené úroky osmým divem světa, a stejný mechanismus funguje v každé oblasti života: ve zdraví, vztazích, penězích i práci. Jeff Olsen v knize The Slight Edge to ilustruje takhle: když si dneska nečistíte zuby, nikdo to nepozná. Týden? Možná. Pět let? Zuby vypadají. Stejné rozhodnutí — snadné udělat, snadné neudělat — se skládalo neviditelně celou dobu. Harvard Business Review se zeptal tisíců lidí na jejich nejlepší pracovní den — nikdo nejmenoval den, kdy byli pochváleni nebo dostali přidáno. Všichni ukázali na den, kdy cítili, že někam jdou. I kdyby šlo jen o maličkost.",
    longDescription: [
      "Brailsford říká, že to, za co mu nikdo nedává kredit, není olympijské zlato. Je to to, co udělal jako první: převzal tým psychicky na dně a začal hledat co nejmenší věci, které lze zlepšit hned. Polštář. Lahev. Úprava podložky. Věci bez výroční zprávy. Tým, který měsíce nechtěl nic, najednou cítil pohyb — a lidé zůstávali do dvou ráno dobrovolně. Protože pocit jdeme někam je silnější motivátor než jakýkoliv bonus nebo pochvala.\nBartlett říká, že v každé své firmě tenhle pocit okamžitě pozná — a kde chybí, výsledky to potvrdí za 6 až 24 měsíců.",
      "Compounding funguje oběma směry. Každá oblast života — zdraví, vztah, finance, práce — se neviditelně skládá na základě malých rozhodnutí, která děláte nebo neděláte dnes. Bartlett to ilustruje na vztahu: ráno si všiml, že on a přítelkyně přestali ráno komunikovat. Zavolal ji zpět. Dvacet minut objetí. To je ten jeden stupeň odchylky v letectví — pro každých 100 km letu znamená minutí cíle o 1,7 km.",
      "Fascinujícím příkladem z historie jsou rakety Apollo. Ty letěly na Měsíc mimo přesný kurz 97 % času — na správné dráze byly jen 2 až 3 % celé cesty. Přesto přistály. Celou cestu totiž neustále opravovaly odchylky prostřednictvím malých a průběžných korekcí od startu až po přistání. Stejně tak v životě: korekce musí být malá a průběžná, ne velká a pozdní.",
      "Charlie Munger to shrnul jednou větou: první pravidlo složeného úroku je nikdy ho zbytečně nepřerušovat.",
    ],
    sources: [
      {
        type: "",
        name: "AMABILE, Teresa; KRAMER, Steven. The Progress Principle. Harvard Business Review, 2011.",
        links: [
          {
            label: "HBR",
            url: "https://hbr.org/2011/05/the-power-of-small-wins",
          },
        ],
      },
      {
        type: "",
        name: "OLSEN, Jeff. The Slight Edge. Success Books, 2005. (zdroj příběhu o raketě Apollo)",
        links: [],
      },
      {
        type: "",
        name: "Modern Wisdom Podcast — Steven Bartlett, ep. #688",
        links: [
          {
            label: "YouTube",
            url: "https://www.youtube.com/watch?v=JBgwF8aHByI",
          },
        ],
      },
    ],
    triggers: [
      "Uživatel dlouhodobě neoznačil žádný úkol jako splněný",
      "Uživatel se vrátil po delší pauze",
      "Uživatel vykazuje pokles aktivity v aplikaci",
    ],
    nextCards: [
      "Zabere to dvě minuty. Udělejte to teď — jak rychle uzavřít otevřené smyčky",
      "Rovnice disciplíny — proč pocit pokroku přímo snižuje friction",
      "Jeden den nevadí. Nepřidávejte druhý — jak navázat po výpadku",
    ],
    primaryAction: {
      text: "Najít malé vítězství",
      feedback:
        "Co je jedna věc, kterou můžete dokončit nebo posunout dnes? Ne ta nejdůležitější — ta nejdosažitelnější.",
    },
    secondaryAction: {
      text: "Označit jako splněné",
      feedback:
        "Dokončili jste něco nedávno a nepočítali jste to? Počítejte to.",
    },
  },
  {
    id: "card-reference-group",
    category: "Psychologie · Rozhodování · Vztahy · Osobní rozvoj",
    title: "Pět lidí, se kterými trávíte čas? Nesprávná otázka.",
    shortDescription:
      "Známý citát Jima Rohna říká, že „jste průměrem pěti lidí, se kterými trávíte nejvíce času.\" Skutečný prediktor toho, kam se váš život posune, ale není kdo sedí vedle vás — je to kdo je ve vaší hlavě, když se rozhodujete. Tomu říkají sociologové referenční skupina, a klíčové je, že s ní nemusíte trávit ani minutu. Nemusí být ve vašem městě. Nemusí o vaší existenci vůbec vědět.",
    longDescription: [
      "Koncept referenční skupiny nevymyslel Jim Rohn. Přišel s ním v roce 1942 sociolog Herbert Hyman v práci The Psychology of Status a rozlišil v ní dvě věci, které lidé pravidelně zaměňují: skupinu, do které patříte (rodina, kolegové, sousedé) a skupinu, podle které se hodnotíte. Tyhle dvě skupiny se často vůbec nepřekrývají.",
      "Klasickou ilustraci přinesla Stoufferova studie The American Soldier (1949). Výzkumníci se ptali vojáků, jak jsou spokojení se svými šancemi na povýšení. Vojenská policie, která měla pomalá povýšení, byla výrazně spokojenější než letectvo, kde se povyšovalo rychle. Paradox se vysvětlil jednoduše: každá jednotka se srovnávala sama se sebou. Policisté viděli kolem sebe málo povýšení, nic nečekali, a tak byli s realitou spokojení. Letci viděli rychlá povýšení všude kolem, čekali to samé pro sebe, a když přišlo s malým zpožděním, cítili se podvedení. Referenční skupina určovala pocit — ne objektivní podmínky.",
      "Pozdější výzkum ukázal, že nejde jen o pocity, ale o chování. Christakis a Fowler analyzovali 32 let dat z Framingham Heart Study u 12 067 lidí a zjistili, že když váš blízký přítel začne trpět obezitou, vaše šance stát se obézním stoupne o 57 %. U sourozenců o 40 %, u partnera o 37 %. Co je ale klíčové: geografická vzdálenost na tom nic neměnila. Přítel bydlící stovky kilometrů daleko měl stejný vliv jako soused odvedle. Šíří se vzorec a norma — ne vzduch, ne jídlo, ne gauč.",
      "Co z toho plyne prakticky? Referenční skupinu si můžete vybírat vědomě místo toho, aby se vám přiřadila podle toho, kdo zrovna sedí u vedlejšího stolu nebo kdo vás kdysi učil na střední. Test je jednoduchý: když stojíte před velkým rozhodnutím — změnit práci, pustit se do podnikání, opustit vztah, investovat úspory — zastavte se a poslouchejte. Čí hlas vám v hlavě zvažuje vaše možnosti? Čí reakci se (vědomě nebo ne) snažíte nezklamat? To jsou vaši skuteční referenční lidé. Můžou to být rodiče, spolužáci ze základky, bývalý šéf — nebo někdo, koho znáte jen z knihy, podcastu, Twitteru.",
      "Technika imaginární rady: před důležitým rozhodnutím si sepište tři až pět lidí, kterých si nejvíc vážíte — ne za to, že jsou k vám milí, ale za to, jak žijí a co dokázali. Ti lidé nemusí být ve vašem životě. Položte si otázku: „Co by s tímhle rozhodnutím udělali oni?\" A pak otočte směr: „Koho v hlavě slyším protestovat proti tomu, co opravdu chci? A zasloužil si ten hlas takovou moc nad mým životem?\"",
      "Poslední vrstva, kterou většina lidí přeskočí: vaše referenční skupina se musí měnit, jak se měníte vy. Nejbohatší lidé světa tráví čas většinou s lidmi chudšími než oni, ale srovnávají se s verzí sebe samých v budoucnosti. Na začátku jsou to reálné osoby kolem vás. Později je to stále častěji abstrakce: ideál, který jste si sestavili z desítek zdrojů. To je signál, že jste přerostli původní skupinu — a potřebujete si najít novou.",
    ],
    sources: [
      {
        type: "Sociologie",
        name: "HYMAN, Herbert H. The Psychology of Status. Archives of Psychology, No. 269, 1942.",
        links: [
          {
            label: "SimplyPsychology",
            url: "https://www.simplypsychology.org/social-comparison-theory.html",
          },
        ],
      },
      {
        type: "Studie",
        name: "STOUFFER, Samuel A. et al. The American Soldier (1949). — analýza Pettigrew 2015, ASA",
        links: [
          {
            label: "ASA Journal",
            url: "https://journals.sagepub.com/doi/full/10.1177/0190272514562150",
          },
        ],
      },
      {
        type: "Teorie",
        name: "MERTON, Robert K.; KITT, Alice S. Contributions to the Theory of Reference Group Behavior (1950).",
        links: [],
      },
      {
        type: "Výzkum",
        name: "CHRISTAKIS, Nicholas A.; FOWLER, James H. The Spread of Obesity in a Large Social Network over 32 Years. NEJM, 2007.",
        links: [
          {
            label: "Plný text NEJM",
            url: "https://www.nejm.org/doi/full/10.1056/NEJMsa066082",
          },
        ],
      },
      {
        type: "Citát",
        name: "ROHN, Jim — Citát popularizován v CANFIELD, Jack. The Success Principles (2005).",
        links: [
          {
            label: "Quote Investigator",
            url: "https://quoteinvestigator.com/2022/08/21/average-five/",
          },
        ],
      },
    ],
    triggers: [
      "Uživatel stojí před velkým životním rozhodnutím",
      "Uživatel si stěžuje na vliv okolí",
      "Uživatel pracuje na změně návyku a cítí odpor od lidí kolem",
      "Uživatel mluví o tom, že „není dost dobrý\" ve srovnání s někým konkrétním",
    ],
    nextCards: [
      "Winners focus on winning, losers focus on winners",
      "Implementační záměr pro vztahy",
      "Mentor, hrdina, referenční bod",
    ],
    primaryAction: {
      text: "Sepsat svou referenční skupinu",
      feedback:
        "Pět lidí, jejichž soud vás v rozhodování nejvíc tíží. Pak si vedle každého napište, jestli jste si ho vybrali vědomě — nebo je tam jen proto, že tam vždycky byl.",
    },
    secondaryAction: {
      text: "Zjistit více",
      feedback:
        "Jak vědomě vyměnit referenční skupinu bez toho, abyste se odřízli od lidí, které máte rádi.",
    },
  },
  {
    id: "card-regret-minimization",
    category: "Rozhodování · Produktivita · Psychologie · Osobní rozvoj",
    title: "Budete si pamatovat toto rozhodnutí, nebo to, že stojíte na stejném místě?",
    shortDescription:
      "Alex Hormozi přestal každou neděli sledovat fotbal ne proto, že ho přestal bavit, ale proto, že si položil jednu otázku: „Za rok si budu pamatovat tenhle zápas, nebo si budu pamatovat, že jsem pořád tam, kde jsem dnes?\" Ta otázka je zmenšená verze rozhodovacího nástroje, který Jeff Bezos použil v roce 1994, když opouštěl Wall Street — a ukotvená v psychologickém výzkumu, který zjistil něco nepříjemného: lítost nad tím, co jste neudělali, s roky bolí víc, ne míň.",
    longDescription: [
      "Víkend, Huntington Beach, nikoho tam neznal — na stole nevyřízená billingová práce pro jeho posilovnu, příprava cvičení, oslovení zákazníků, a chtěl si zapnout zápas Baltimore Ravens, tým ze svého rodného města. „Za rok mi bude ten jeden zápas jedno. Ale za rok si budu pamatovat, že jsem se nikam neposunul.\"",
      "Bezos formuloval tentýž nástroj s delším horizontem v interview z roku 1997: „Chtěl jsem se přenést do osmdesáti let a říct si: ohlížím se teď zpátky. Věděl jsem, že nebudu litovat, že jsem to zkusil. Věděl jsem ale, že jedna věc, kterou budu litovat, je, že jsem to nikdy nezkusil. To by mě pronásledovalo každý den.\" Bezos tomu říká <strong>Regret Minimization Framework</strong> a říká, že posun z „co získám\" na „čeho budu litovat\" mu rozhodnutí opustit Wall Street výrazně usnadnil. (Fast Company)",
      "Thomas Gilovich a Victoria Medvec z Cornell University v sérii studií (1994, 1995) ukázali, proč tenhle rámec funguje. V krátkém horizontu lidé litují akcí (udělal jsem to a neměl jsem), v dlouhém horizontu litují neakcí (neudělal jsem to, co jsem měl). Při dotazování 720 lidí ze stanfordského Termanova archivu (průměrný věk 74 let) jmenovalo 74 % z nich jako svoji největší životní lítost něco, co neudělali. U vysokoškolských studentů to bylo 61 % — efekt se s věkem prohluboval. Replikace z roku 2022 (N = 988) ho potvrdila. (Gilovich & Medvec 1995, Psychological Review · Yeung & Feldman 2022, Collabra: Psychology)",
      "Mechanismus: bolest z akce s časem klesá, protože aktivně kompenzujete, omlouváte se, poučíte se. <strong>Bolest z neakce roste</strong>, protože si čím dál víc idealizujete „cestu, kterou jste nevyšli\" a ztrácíte vzpomínku na důvody, které vás tehdy zastavily.",
      "Poctivá námitka: Gilbert a Wilson ukázali, že lidé systematicky přeceňují emocionální dopad budoucích událostí (impact bias) — psychologický imunitní systém zotavení z neúspěchů urychluje. Tato námitka se ale týká diskrétních událostí (rozchod, ztráta práce). Chronický pocit, že stojíte na stejném místě jako před rokem, není událost — je to pozadí, se kterým každé ráno vstáváte, a proti němu psychologický imunitní systém pracuje výrazně hůř. (Wilson & Gilbert 2005, Current Directions in Psychological Science)",
      "<strong>Dvě otázky vedle sebe:</strong><br>1. „Budu si tohle za rok pamatovat?\" — Jeden zápas, jeden večer, jedno pivo s kolegy se v paměti neuchytí.<br>2. „Budu si za rok pamatovat, že stojím pořád tam, kde jsem dnes?\" — Ano, a čím víc času uplyne, tím intenzivněji.",
      "Framework funguje i obráceně: před rozhodnutím, kterého se bojíte (podat výpověď, oslovit někoho, začít projekt), se zeptejte: „Čeho budu za dvacet let litovat víc — že jsem to zkusil a nevyšlo to, nebo že jsem to nikdy nezkusil?\" Podle Gilovichových dat druhá varianta bolí v naprosté většině případů víc.",
    ],
    sources: [
      {
        type: "Framework",
        name: "BEZOS, Jeff — Regret Minimization Framework. Interview pro 60 Minutes (1997).",
        links: [
          {
            label: "Fast Company",
            url: "https://www.fastcompany.com/90369804/bezos-regret-minimization-framework",
          },
        ],
      },
      {
        type: "Studie",
        name: "GILOVICH, Thomas; MEDVEC, Victoria H. The Temporal Pattern to the Experience of Regret (1994).",
        links: [
          {
            label: "APA PsycNet",
            url: "https://doi.org/10.1037/0033-2909.67.3.357",
          },
        ],
      },
      {
        type: "Psychologie",
        name: "GILOVICH, Thomas; MEDVEC, Victoria H. The Experience of Regret: What, When, and Why (1995).",
        links: [
          {
            label: "Plný text PDF",
            url: "https://doi.org/10.1037/0033-295X.102.2.379",
          },
        ],
      },
      {
        type: "Replikace",
        name: "YEUNG, Siu Kit; FELDMAN, Gilad. Revisiting the Temporal Pattern of Regret (2022).",
        links: [
          {
            label: "Collabra: Psychology",
            url: "https://doi.org/10.1525/collabra.37122",
          },
        ],
      },
      {
        type: "Výzkum",
        name: "WILSON, Timothy D.; GILBERT, Daniel T. Affective Forecasting: Knowing What to Want (2005).",
        links: [
          {
            label: "WJH Harvard (PDF)",
            url: "https://wjh.harvard.edu/~dtg/Wilson%20&%20Gilbert%20(Current%20Directions).pdf",
          },
        ],
      },
    ],
    triggers: [
      "Uživatel stojí před konfliktem krátkodobého potěšení a dlouhodobého cíle",
      "Uživatel prokrastinuje rozhodnutí, kterého se bojí",
      "Uživatel si stěžuje, že je stále na stejném místě jako před rokem",
    ],
    nextCards: [
      "Pět lidí, se kterými trávíte čas? Nesprávná otázka.",
      "Implementační záměr — jak z „budu si pamatovat\" udělat konkrétní plán",
      "Hot-cold empathy gap — proč se vaše rozhodnutí v klidu liší od rozhodnutí v pokušení",
    ],
    primaryAction: {
      text: "Použít filtr teď",
      feedback:
        "Sepište si dvě věci, které dnes váháte udělat. U každé si odpovězte: Budu si to za rok pamatovat? a Budu za rok litovat, že jsem to (ne)udělal?",
    },
    secondaryAction: {
      text: "Zjistit více",
      feedback:
        "Jak sestavit vlastní rozhodovací filtr pro týdenní i životní volby.",
    },
  },
];

export default INSIGHT_CARDS;
