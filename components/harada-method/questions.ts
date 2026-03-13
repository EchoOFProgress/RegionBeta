// Self-Reliance Assessment Questions - 33 questions across 4 categories

export interface Question {
  id: number
  category: "mentalAttitude" | "healthManagement" | "livingAttitude" | "skills"
  text: string
  description?: string
}

export const CATEGORIES = {
  mentalAttitude: {
    name: "Mentální postoj",
    description: "Vaše myšlení, motivace a přístup k životu",
    color: "#3B82F6",
  },
  healthManagement: {
    name: "Péče o zdraví",
    description: "Fyzické a duševní zdraví, životospráva",
    color: "#10B981",
  },
  livingAttitude: {
    name: "Životní postoj",
    description: "Vztahy, komunikace a společenské chování",
    color: "#F59E0B",
  },
  skills: {
    name: "Dovednosti",
    description: "Praktické schopnosti a znalosti",
    color: "#8B5CF6",
  },
}

export const QUESTIONS: Question[] = [
  // Mental Attitude (8 questions)
  {
    id: 1,
    category: "mentalAttitude",
    text: "Mám jasnou představu o tom, čeho chci v životě dosáhnout",
    description: "Dlouhodobé cíle a vize",
  },
  {
    id: 2,
    category: "mentalAttitude",
    text: "Dokážu se motivovat i v obtížných situacích",
    description: "Vnitřní motivace",
  },
  {
    id: 3,
    category: "mentalAttitude",
    text: "Přijímám odpovědnost za své činy a jejich důsledky",
    description: "Osobní odpovědnost",
  },
  {
    id: 4,
    category: "mentalAttitude",
    text: "Věřím ve své schopnosti dosáhnout stanovených cílů",
    description: "Sebedůvěra",
  },
  {
    id: 5,
    category: "mentalAttitude",
    text: "Dokážu se poučit ze svých chyb a neúspěchů",
    description: "Růstové myšlení",
  },
  {
    id: 6,
    category: "mentalAttitude",
    text: "Mám pozitivní přístup k výzvám a překážkám",
    description: "Optimismus",
  },
  {
    id: 7,
    category: "mentalAttitude",
    text: "Pravidelně přemýšlím o svém pokroku a rozvoji",
    description: "Sebereflexe",
  },
  {
    id: 8,
    category: "mentalAttitude",
    text: "Jsem odhodlaný/á dotáhnout věci do konce",
    description: "Vytrvalost",
  },

  // Health Management (8 questions)
  {
    id: 9,
    category: "healthManagement",
    text: "Pravidelně sportuji nebo se věnuji fyzické aktivitě",
    description: "Pohyb a cvičení",
  },
  {
    id: 10,
    category: "healthManagement",
    text: "Dbám na vyváženou stravu a zdravé stravovací návyky",
    description: "Výživa",
  },
  {
    id: 11,
    category: "healthManagement",
    text: "Spím dostatečně dlouho a kvalitně",
    description: "Spánek",
  },
  {
    id: 12,
    category: "healthManagement",
    text: "Umím efektivně zvládat stres",
    description: "Stres management",
  },
  {
    id: 13,
    category: "healthManagement",
    text: "Pravidelně si dopřávám odpočinek a relaxaci",
    description: "Regenerace",
  },
  {
    id: 14,
    category: "healthManagement",
    text: "Vyhýbám se návykovým látkám a nezdravým zvykům",
    description: "Zdravé návyky",
  },
  {
    id: 15,
    category: "healthManagement",
    text: "Pravidelně chodím na preventivní prohlídky",
    description: "Prevence",
  },
  {
    id: 16,
    category: "healthManagement",
    text: "Pečuji o své duševní zdraví a pohodu",
    description: "Mentální zdraví",
  },

  // Living Attitude (9 questions)
  {
    id: 17,
    category: "livingAttitude",
    text: "Udržuji dobré vztahy s rodinou a blízkými",
    description: "Rodinné vztahy",
  },
  {
    id: 18,
    category: "livingAttitude",
    text: "Jsem spolehlivý/á a dodržuji své sliby",
    description: "Spolehlivost",
  },
  {
    id: 19,
    category: "livingAttitude",
    text: "Aktivně naslouchám druhým a respektuji jejich názory",
    description: "Komunikace",
  },
  {
    id: 20,
    category: "livingAttitude",
    text: "Pomáhám ostatním bez očekávání odměny",
    description: "Altruismus",
  },
  {
    id: 21,
    category: "livingAttitude",
    text: "Dokážu přiznat chybu a omluvit se",
    description: "Pokora",
  },
  {
    id: 22,
    category: "livingAttitude",
    text: "Udržuji pořádek ve svém okolí a věcech",
    description: "Organizovanost",
  },
  {
    id: 23,
    category: "livingAttitude",
    text: "Chovám se eticky a čestně",
    description: "Integrita",
  },
  {
    id: 24,
    category: "livingAttitude",
    text: "Jsem vděčný/á za to, co mám",
    description: "Vděčnost",
  },
  {
    id: 25,
    category: "livingAttitude",
    text: "Přispívám pozitivně ke své komunitě",
    description: "Společenská angažovanost",
  },

  // Skills (8 questions)
  {
    id: 26,
    category: "skills",
    text: "Efektivně si organizuji čas a priority",
    description: "Time management",
  },
  {
    id: 27,
    category: "skills",
    text: "Neustále se učím nové věci a rozvíjím se",
    description: "Celoživotní učení",
  },
  {
    id: 28,
    category: "skills",
    text: "Dokážu efektivně komunikovat své myšlenky",
    description: "Prezentační dovednosti",
  },
  {
    id: 29,
    category: "skills",
    text: "Umím řešit problémy kreativně a systematicky",
    description: "Řešení problémů",
  },
  {
    id: 30,
    category: "skills",
    text: "Zvládám pracovat s moderními technologiemi",
    description: "Digitální gramotnost",
  },
  {
    id: 31,
    category: "skills",
    text: "Dokážu hospodařit s financemi a plánovat rozpočet",
    description: "Finanční gramotnost",
  },
  {
    id: 32,
    category: "skills",
    text: "Umím pracovat v týmu a spolupracovat s ostatními",
    description: "Týmová práce",
  },
  {
    id: 33,
    category: "skills",
    text: "Dokážu se přizpůsobit změnám a novým situacím",
    description: "Adaptabilita",
  },
]

export function getQuestionsByCategory(category: keyof typeof CATEGORIES): Question[] {
  return QUESTIONS.filter((q) => q.category === category)
}

export function calculateCategoryScore(
  answers: { questionId: number; score: number }[],
  category: keyof typeof CATEGORIES,
): number {
  const categoryQuestions = getQuestionsByCategory(category)
  const categoryAnswers = answers.filter((a) => categoryQuestions.some((q) => q.id === a.questionId))
  if (categoryAnswers.length === 0) return 0
  const sum = categoryAnswers.reduce((acc, a) => acc + a.score, 0)
  return Math.round((sum / (categoryAnswers.length * 5)) * 100)
}