import { InsightCard } from "./insight-cards-data";

export const INSIGHT_CARDS_EN: InsightCard[] = [
  {
    id: "card-streak",
    category: "Recovery · Psychology",
    title: "Missing one day is fine. Don't miss a second one.",
    shortDescription:
      "Losing a streak hurts — but probably not for the reason you think. The science of behavioral change shows that people who successfully maintained a new habit for two years failed on average fourteen times. So one skip doesn't separate you from those who gave up. The second one would. The most important thing you can do now is just continue tomorrow.",
    longDescription: [
      "What you are feeling right now has a name — and it's not a failure. It's part of the process that practically everyone who attempts real change goes through. You might be surprised that researchers who tracked people for two years found something unexpected: those who ultimately succeeded didn't fail less than others. They failed just as much. On average, fourteen times. The only difference was what they did immediately after falling.",
      "And here comes a rule worth knowing: <strong>never skip twice in a row</strong>. One skip is an accident. Two skips are the beginning of a new pattern. As soon as you skip the second time, you are no longer dealing with a habit failure, but you are starting to build a new habit — the habit of skipping. The faster you get back, the less work you have to repair your identity. Just one question is enough: 'What will I do differently tomorrow?' And then answer it with action, not thinking.",
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
        name: "Dr. K (HealthyGamerGG) – Why New Year's Resolutions Don't Work (podcast, January 2022)",
        links: [
          {
            label: "Spotify",
            url: "https://open.spotify.com/episode/0VELmAsJ9ULbQDu5HGFlo0",
          },
        ],
      },
    ],
    triggers: [
      "User just lost their streak",
      "Drop in activity for tracked habit",
    ],
    nextCards: [
      "Rules for building habits — how to systematically change behavior",
      "It takes two minutes. Do it now. — how to instantly clear small tasks",
      "The lie that motivates millions. And what really works. — the myth of writing down goals",
    ],
    primaryAction: {
      text: "I continue tomorrow",
      feedback:
        "Great! Tomorrow is your fresh start. A streak is just a number, the important thing is not to give up.",
    },
    secondaryAction: {
      text: "More information",
      feedback: "Loading detailed scientific background...",
    },
  },
  {
    id: "card-goals",
    category: "Psychology · Productivity · Myths",
    title: "The lie that motivates millions. And what really works.",
    shortDescription:
      "You may have heard this: a Harvard or Yale study supposedly proved that 3% of students who wrote down their goals earned more twenty years later than the remaining 97% combined. It’s a powerful story. The problem is, it never happened. Extensive reviews of academic literature and investigative journalism by Fast Company revealed that no such study ever took place. But that doesn’t mean writing down goals doesn’t work — it just means reality is more complex and interesting than a motivational slogan.",
    longDescription: [
      "The story of the 3% of students has been circulating for decades. It was spread by Tony Robbins, Zig Ziglar, Brian Tracy, and dozens of other personal development authors. However, none of them bothered to verify the source — and when someone finally did, the Yale library officially confirmed that no such study of the class of 1953 (nor 1954) ever took place. Harvard has the same experience.",
      "But here comes the interesting part: the myth was so convincing that it inspired psychologist Dr. Gail Matthews from Dominican University to actually conduct the study. She involved 267 participants from various professional backgrounds in the research. The results were unexpected — not because writing it down doesn't work, but because it's not enough on its own. The group that only wrote down their goals achieved an average score of 6.08 (on a scale of 1-10). The group that didn't write down their goals at all ended up at 4.28. Writing obviously helps — but the biggest difference occurred in the group that added regular progress reports to a friend to the written goals. This group achieved a score of 7.64. More than 70% of participants who regularly shared their progress (accountability) successfully achieved their goal. In the group that just thought about it, it was only 35%.",
      "So writing down a goal is not a magical shortcut — it is the first step in a system that works best when you add concrete steps and a social commitment to it.",
    ],
    sources: [
      {
        type: "",
        name: "MATTHEWS, Gail. The Impact of Commitment, Accountability, and Written Goals on Goal Achievement. Dominican University of California, 2007.",
        links: [
          {
            label: "Original Research (PDF)",
            url: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf",
          },
          {
            label: "Dominican University (abstract)",
            url: "https://scholar.dominican.edu/psychology-faculty-conference-presentations/3/",
          },
        ],
      },
      {
        type: "",
        name: "Yale/Harvard Libraries – Official statement on the non-existence of the original study.",
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
            label: "Investigation",
            url: "https://rapidbi.com/harvard-yale-written-goals-study-fact-or-fiction/",
          },
        ],
      },
      {
        type: "",
        name: "Sid Savara – Harvard Study: Truth revealed.",
        links: [
          {
            label: "Article verification",
            url: "https://sidsavara.com/fact-or-fiction-the-truth-about-the-harvard-written-goal-study/",
          },
        ],
      },
    ],
    triggers: [
      "User is currently setting a new goal",
      "User is using the goal setting function for the first time",
    ],
    nextCards: [
      "Does this move me closer to the goal, or further away? — Hormozi's filter",
      "The Discipline Equation — how to overcome friction and begin",
      "Rules for building habits — how to systematically change behavior",
    ],
    primaryAction: {
      text: "Write down the goal",
      feedback:
        "Good start. Now add a specific day, time, and place — this is where most people stop, and you will not.",
    },
    secondaryAction: {
      text: "Find out more",
      feedback: "How to turn a goal on paper into a goal in life.",
    },
  },
  {
    id: "card-twominute",
    category: "Productivity · Procrastination · Task Management",
    title: "It takes two minutes. Do it now.",
    shortDescription:
      "Your to-do list is probably not slowed down by large projects. It’s slowed down by dozens of small things you postponed — and that are now quietly draining your energy. There is a simple filter: if a task takes less than two minutes, do it immediately. Not because you have the time, but because all the administration around postponing takes longer than the task itself.",
    longDescription: [
      "Why is your list growing even though you are working? Probably not because you can't keep up with the big things. But because small things pile up faster than you can handle them. The Two-Minute Rule says: if you can complete an action within two minutes where you are right now, do it immediately — because reviewing it again, categorizing it, and thinking about it next time takes longer than the actual task.",
      "An email with a simple reply sitting in your inbox for three days is not a small task. It's a small task with a huge cognitive debt. Every time you see it, your brain has to process the info: „This is not done yet.\" Behind this is the Zeigarnik effect: unfinished tasks remain active in working memory. They don't just disappear because you ignore them — they remain as „open loops\" that silently drain your focus and increase your stress level. Resistance to a task often stems from its vagueness. Two minutes force you to define the first step.",
      "One practical caveat: the rule applies when processing inputs — not as an invitation to interrupt deep work. If you are in the middle of an important project, do not let an email distract you just because it „takes two minutes.\" Protecting your flow is the most important thing at that moment.",
    ],
    sources: [
      {
        type: "",
        name: "ALLEN, David. Getting Things Done: The Art of Stress-Free Productivity.",
        links: [
          {
            label: "Two-Minute Rule (James Clear)",
            url: "https://jamesclear.com/how-to-stop-procrastinating",
          },
          {
            label: "Author's website",
            url: "https://gettingthingsdone.com/2020/05/the-two-minute-rule-2/",
          },
        ],
      },
    ],
    triggers: [
      "Number of uncompleted tasks crossed the threshold (10+)",
      "User repeatedly delays the same small task",
      "User hasn't marked any task as done for X days",
    ],
    nextCards: [
      "Rules for building habits — how to systematically change behavior",
      "Missing one day is fine. Don't miss a second one. — the rule of two skips",
      "The Discipline Equation — how to overcome friction and begin",
    ],
    primaryAction: {
      text: "Find task taking < 2 mins",
      feedback:
        "Look at your list. What takes less than two minutes? Do it now — before you read further.",
    },
    secondaryAction: {
      text: "Find out more",
      feedback:
        "Mastery in GTD requires practice, but begins with a split-second decision.",
    },
  },
  {
    id: "card-habits",
    category: "Habits · Psychology · Productivity",
    title: "Rules for building habits",
    shortDescription:
      "James Clear in Atomic Habits argues that habits do not fail due to a lack of discipline — they fail due to bad design. Every habit goes through four stages: cue, craving, response, reward. From this stems four laws: make it obvious — specific time, place, and signal in the environment. Make it attractive — pair it with something you want to do. Make it easy — remove friction and start with a version that takes two minutes. Make it satisfying — add immediate reward, because the brain repeats what brings immediate pleasure, not what is right.",
    longDescription: [
      "<strong>Law 1 — Make it obvious</strong>: A habit you don't see, you won't do. Intention is not enough — the brain needs a specific signal. Two techniques that work: Implementation Intention: Instead of „I will exercise,\" establish „every Monday at 7:00 I will put on my gym clothes and go to the gym.\" Studies show that simply defining a specific time and place dramatically increases the probability of action — because it removes decision-making at the moment you have the least energy. Habit stacking: Attach a new habit to an existing one using the formula: „After [CURRENT HABIT] I will do [NEW HABIT].\" The existing habit becomes an automatic trigger.",
      "<strong>Law 2 — Make it attractive</strong>: The brain doesn't repeat what is healthy or right. It repeats what is associated with reward — and forms this association even before the action, at the moment of craving. Temptation bundling: Pair something you need to do with something you want to do. Favorite podcast only while walking. Netflix only while on a stationary bike. The brain begins to anticipate the pleasant experience as a part of the habit.",
      "<strong>Law 3 — Make it easy</strong>: Friction decides more than motivation. Any obstacle between you and the action lowers the probability you'll do it. Want to read more? Put the book on your pillow, not the shelf. This is where the two-minute rule shines: when starting a new habit, downscale it to a version lasting under two minutes. „Read before bed\" becomes „read one page.\" The goal is not to do two minutes forever — the goal is to overcome the resistance to start.",
      "<strong>Law 4 — Make it satisfying</strong>: The brain works on instant feedback. The solution is adding an immediate reward right after the habit completion — something small that brings immediate pleasure and reinforces „habit = good feeling.\" Tracking habits in the app or a check in a calendar acts as this exact reward — you see the growing streak and don't want to break the chain. One rule: never miss twice.",
    ],
    sources: [
      {
        type: "",
        name: "CLEAR, James. Atomic Habits. Avery, 2018.",
        links: [
          {
            label: "Summary of author's laws",
            url: "https://jamesclear.com/atomic-habits-summary",
          },
          {
            label: "How to stop procrastinating",
            url: "https://jamesclear.com/how-to-stop-procrastinating",
          },
        ],
      },
    ],
    triggers: [
      "User sets up a new habit for the first time",
      "User repeatedly interrupted the same habit",
      "User set too ambitious frequency or length",
    ],
    nextCards: [
      "It takes two minutes. Do it now. — how to instantly clear small tasks",
      "Missing one day is fine. Don't miss a second one. — the rule of two skips",
      "The Discipline Equation — how to overcome friction and begin",
    ],
    primaryAction: {
      text: "Design a habit",
      feedback:
        "Let's go through the four laws for your specific habit — and find where it breaks.",
    },
    secondaryAction: {
      text: "Scale down the habit",
      feedback:
        "What's the two-minute version of what you want to do? Let's start there.",
    },
  },
  {
    id: "card-discipline-equation",
    category: "Discipline · Psychology · Habits",
    title: "The Discipline Equation",
    shortDescription:
      "When we break down discipline into its base parts, we get three variables: how much you care about the goal, how much you enjoy the process, and how much resistance you have to overcome to even start. Steven Bartlett noted this as an equation: Importance + Enjoyment − Friction. Podcast: 10 + 9 − 4 = +15 → you do it. Meditation: 3 + 2 − 6 = −1 → you don't. If something isn't working, it’s not a question of character — it’s a negative equation. And each of these three variables can be consciously changed.",
    longDescription: [
      "<strong>Importance — how to strengthen it</strong><br>Importance isn't fixed — it changes based on how you think about the goal. Bartlett describes how he stopped seeing gym as an aesthetic issue and started seeing it as basic survival during Covid. The framework changed — and behavior happened instantly.<br>Specific technique: write down what happens in 5 years if you don't achieve this goal. Not what you gain — what you lose. Loss is psychologically more concrete.",
      "<strong>Enjoyment — how to strengthen it</strong><br>Enjoyment of the process can be consciously engineered. <br>Temptation bundling: favorite podcast only while working out. <br>Visible progress: checks in calendar, streaks. The brain rewards forward movement.<br>Social component: working out with someone, study groups. Social reward is a very strong motivator.",
      "<strong>Friction — how to decrease it</strong><br>Bartlett stopped going to a gym where everyone knew him — he spent time talking instead of exercising. Friction grew so much that the equation became negative. Friction doesn't have to be physical exertion — it's anything standing between you and the start. The solution is always the same: remove decision steps beforehand. Gym clothes prepared in the evening, app on the first screen.",
      "<strong>How to use the equation</strong><br>Take a habit that isn't working. Rate every variable from 1 to 10. If the result is negative — you have the diagnosis. You don't need more willpower. You need to fix the specific variable pulling it down.",
    ],
    sources: [
      {
        type: "",
        name: "BARTLETT, Steven — Modern Wisdom Podcast with Chris Williamson, ep. #688",
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
      "User repeatedly fails the same habit or goal",
      "User says they lacks motivation or discipline",
      "User set a goal but stopped after week 1",
    ],
    nextCards: [
      "Rules for building habits — how to systematically change behavior",
      "Missing one day is fine. Don't miss a second one. — the rule of two skips",
      "We felt we were getting somewhere — the power of small progress",
    ],
    primaryAction: {
      text: "Calculate my equation",
      feedback:
        "Take a habit that isn't working. Rate Importance, Enjoyment, and Friction from 1 to 10. Which result is negative?",
    },
    secondaryAction: {
      text: "Reduce friction",
      feedback:
        "What is the biggest obstacle between you and this habit? Let's remove it.",
    },
  },
  {
    id: "card-compounding",
    category: "Motivation · Productivity · Psychology",
    title: "We felt we were getting somewhere",
    shortDescription:
      "Small things don't just add up — they compound. Warren Buffett calls compound interest the eighth wonder of the world, and the same mechanism works in every area of life: health, relationships, money, work. Jeff Olsen in The Slight Edge illustrates it like this: if you don't brush your teeth today, no one will know. In a week? Maybe. Five years? Teeth fall out. The same decision compounded invisibly. Harvard Business Review asked thousands of people about their best work day — no one named the day they got praised or a raise. Everyone pointed to the day they felt they were getting somewhere, even if it was just a tiny detail.",
    longDescription: [
      "Brailsford says that what nobody gives him credit for isn't Olympic golds. It's what he did first: he took a team that was psychologically at the bottom and started looking for the tiniest things that could be improved right away. A pillow. A bottle. Adjusting a mat. Things with no annual report. The team that hadn't wanted anything for months suddenly felt movement — and people stayed until 2 AM voluntarily. Because the feeling of getting somewhere is a stronger motivator than any bonus.",
      "Compounding works both ways. Every area of life compounds invisibly based on the small decisions you make or don't make today. Bartlett illustrates it on a relationship: he noticed he and his girlfriend stopped communicating in the morning. He called her back. Twenty minutes of hugging. That is that one degree of deviation in aviation — for every 100 km of flight, you miss the target by 1.7 km.",
      "A fascinating example from history is the Apollo rockets. They flew to the Moon off their exact course 97% of the time — they were on the correct trajectory only 2 to 3% of the entire journey. Yet they landed. The whole trip they continually corrected deviations via small ongoing corrections from launch to landing. Likewise in life: corrections must be small and ongoing, not massive and late.",
      "Charlie Munger summed it up in one sentence: the first rule of compounding is to never interrupt it unnecessarily.",
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
        name: "OLSEN, Jeff. The Slight Edge. Success Books, 2005.",
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
      "User hasn't marked a task completed for a long time",
      "User returned after a long break",
      "User shows a drop in activity",
    ],
    nextCards: [
      "It takes two minutes. Do it now. — how to instantly clear small tasks",
      "The Discipline Equation — how to overcome friction and begin",
      "Missing one day is fine. Don't miss a second one. — the rule of two skips",
    ],
    primaryAction: {
      text: "Find a little win",
      feedback:
        "What is one thing you can complete or push forward today? Not the most important — the most achievable.",
    },
    secondaryAction: {
      text: "Mark as done",
      feedback:
        "Have you finished something recently and didn't check it off? Check it off now.",
    },
  },
  {
    id: "card-reference-group",
    category: "Psychology · Decision-making · Relationships · Personal Development",
    title: "Who are the five people you spend time with? Wrong question.",
    shortDescription:
      "A famous quote by Jim Rohn says that „you are the average of the five people you spend the most time with.\" But the real predictor of where your life will head is not who sits next to you — it's who is in your head when you make decisions. Sociologists call this the reference group, and the key is that you don't even have to spend a minute with them.",
    longDescription: [
      "The concept of the reference group was not invented by Jim Rohn. It was introduced in 1942 by sociologist Herbert Hyman in The Psychology of Status. He distinguished between two things: the group you belong to (family, colleagues, neighbors) and the group you evaluate yourself against.",
      "Later research showed it's not just about feelings, but behavior. Christakis and Fowler analyzed 32 years of data from the Framingham Heart Study on 12,067 people and found that when a close friend becomes obese, your chances of becoming obese rise by 57%. What is key: geographic distance didn't change anything. A friend living hundreds of miles away had the same influence as a next-door neighbor. The pattern and norm spread — not the physical air or couch.",
      "So what does this mean in practice? You can consciously choose your reference group. The test is simple: when you face a major decision — changing a job, starting a business, leaving a relationship — stop and listen. Whose voice in your head is weighing your options? Whose reaction are you trying not to disappoint? Those are your true reference people. They could be parents, high school classmates, an ex-boss — or someone you only know from a book, podcast, or Twitter.",
      "The imaginary board of directors technique: before an important decision, write down three to five people you respect the most — not for being nice to you, but for how they live and what they accomplished. You can ask: „What would they do with this decision?\" And then reverse the direction: „Who in my head is protesting against what I really want?\"",
    ],
    sources: [
      {
        type: "Sociology",
        name: "HYMAN, Herbert H. The Psychology of Status. Archives of Psychology, No. 269, 1942.",
        links: [
          {
            label: "SimplyPsychology",
            url: "https://www.simplypsychology.org/social-comparison-theory.html",
          },
        ],
      },
      {
        type: "Research",
        name: "CHRISTAKIS, Nicholas A.; FOWLER, James H. The Spread of Obesity in a Large Social Network over 32 Years. NEJM, 2007.",
        links: [
          {
            label: "Full text NEJM",
            url: "https://www.nejm.org/doi/full/10.1056/NEJMsa066082",
          },
        ],
      },
    ],
    triggers: [
      "User faces a major life decision",
      "User complains about the influence of their surroundings",
      "User works on a habit change and feels resistance from people around",
    ],
    nextCards: [
      "Will you remember this decision, or that you're standing in the same place? — Bezos's framework",
      "Does this move me closer to the goal, or further away? — Hormozi's filter",
      "The Discipline Equation — how to overcome friction and begin",
    ],
    primaryAction: {
      text: "Write my reference group",
      feedback:
        "List the five people whose judgment weighs the most on your decisions. Did you consciously choose them?",
    },
    secondaryAction: {
      text: "Find out more",
      feedback:
        "How to consciously swap your reference group without cutting off people you love.",
    },
  },
  {
    id: "card-regret-minimization",
    category: "Decision Making · Productivity · Psychology",
    title: "Will you remember this decision, or that you're standing in the same place?",
    shortDescription:
      "Alex Hormozi stopped watching football every Sunday not because he stopped enjoying it, but because he asked himself one question: 'In a year, will I remember this game, or will I remember that I'm still where I am today?' That question is a scaled-down version of the decision tool Jeff Bezos used in 1994 when leaving Wall Street — known as the Regret Minimization Framework.",
    longDescription: [
      "Bezos formulated this tool with a longer horizon in a 1997 interview: 'I wanted to project myself forward to age 80 and say, okay, I'm looking back on my life... I knew I would not regret having tried... I knew that if I failed I wouldn't regret that, but I knew the one thing I might regret is not ever having tried.'",
      "Thomas Gilovich and Victoria Medvec from Cornell University showed why this framework works in a series of studies (1994, 1995). In the short term, people regret actions (I did it and shouldn't have). In the long term, they regret inactions (I didn't do what I should have).",
      "Mechanism: the pain of action declines with time because you actively compensate, apologize, and learn. The pain of inaction grows because you increasingly idealize 'the road not taken'.",
      "Two questions side by side:<br>1. 'Will I remember this in a year?' — One match, one evening, one beer with colleagues won't stick in memory.<br>2. 'Will I remember a year from now that I'm still standing exactly where I am today?' — Yes, and the more time passes, the more intensely.",
    ],
    sources: [
      {
        type: "Framework",
        name: "BEZOS, Jeff — Regret Minimization Framework. Interview for 60 Minutes (1997).",
        links: [
          {
            label: "Fast Company",
            url: "https://www.fastcompany.com/90369804/bezos-regret-minimization-framework",
          },
        ],
      },
      {
        type: "Psychology",
        name: "GILOVICH, Thomas; MEDVEC, Victoria H. The Experience of Regret: What, When, and Why (1995).",
        links: [
          {
            label: "Full text PDF",
            url: "https://doi.org/10.1037/0033-295X.102.2.379",
          },
        ],
      },
    ],
    triggers: [
      "User faces a conflict of short-term pleasure and a long-term goal",
      "User procrastinates a decision they fear",
      "User complains about being in the exact same place as a year ago",
    ],
    nextCards: [
      "Who are the five people you spend time with? Wrong question. — reference group",
      "Does this move me closer to the goal, or further away? — Hormozi's filter",
      "We felt we were getting somewhere — the power of small progress",
    ],
    primaryAction: {
      text: "Apply the framework now",
      feedback:
        "List two things you hesitate to do today. Ask yourself: Will I regret not doing this in a year?",
    },
    secondaryAction: {
      text: "Find out more",
      feedback:
        "How to build your own decision filter for weekly and life choices.",
    },
  },
  {
    id: "card-goal-filter",
    category: "Decision Making · Productivity · Psychology",
    title: "Does this move me closer to the goal, or further away?",
    shortDescription:
      "Alex Hormozi uses one decision filter for everything — friends, activities, habits, beliefs: 'Does this increase or decrease the probability that I hit my goal?' Two answers, no middle ground. Psychology confirms this intuition: a clear goal changes what we even see as relevant.",
    longDescription: [
      "Hormozi applies the filter without exception: directly towards his goals. 'Does this person increase or decrease the probability of me hitting my goal?' The output is binary on purpose: no gray zone leaves any room for rationalization.",
      "Edwin Locke and Gary Latham, after four decades of research, formalized why a specific goal changes performance. It's the directive function of a goal: the goal redirects attention and effort toward relevant activities and away from irrelevant ones.",
      "James Shah and Arie Kruglanski described 'goal shielding' — when strongly committed to a goal, the brain automatically suppresses the cognitive accessibility of alternative goals.",
      "Binary output is intentional. If the answer isn't firmly 'increases', the default is 'decreases'.",
    ],
    sources: [
      {
        type: "",
        name: "LOCKE, Edwin A.; LATHAM, Gary P. Building a Practically Useful Theory of Goal Setting and Task Motivation. American Psychologist, 2002.",
        links: [
          { label: "APA PsycNet", url: "https://psycnet.apa.org/record/2002-17185-001" },
        ],
      },
      {
        type: "",
        name: "SHAH, James Y.; FRIEDMAN, Ronald; KRUGLANSKI, Arie W. Goal Shielding.",
        links: [
          { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/12500810/" },
        ],
      },
    ],
    triggers: [
      "User decides how to spend their time",
      "User decides to cut a friendship or limit contact",
      "User procrastinates on what distracts them",
    ],
    nextCards: [
      "Who are the five people you spend time with? Wrong question. — reference group",
      "Will you remember this decision, or that you're standing in the same place? — Bezos's framework",
      "The lie that motivates millions. And what really works. — the myth of writing down goals",
    ],
    primaryAction: {
      text: "Apply filter now",
      feedback:
        "Write three things you spend time on today. For each: does it increase or decrease the probability of your goal?",
    },
    secondaryAction: {
      text: "Find out more",
      feedback:
        "How to set up implementation intentions for the most common distractions in your week.",
    },
  },
];
