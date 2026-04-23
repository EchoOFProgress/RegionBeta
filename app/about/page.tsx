"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { ArrowLeft, Users, Target, Rocket, Heart } from "lucide-react";

export default function AboutUs() {
  const router = useRouter();
  const { language } = useLanguage();

  const isCZ = language === "CZ";

  return (
    <main className="viewport dashboard-viewport py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 mb-8 opacity-60 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={16} />
          <span>{isCZ ? "Zpět na hlavní panel" : "Back to Dashboard"}</span>
        </button>

        <header className="mb-12 border-l-4 border-primary pl-6">
          <h1 className="text-4xl font-black uppercase mb-4 leading-none">
            {isCZ ? "O Nás" : "About Us"}
          </h1>
          <p className="opacity-60 font-mono text-sm">
            {isCZ ? "Příběh Region Beta" : "The Region Beta Story"}
          </p>
        </header>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                {isCZ ? "Naše Vize" : "Our Vision"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ 
                  ? "Region Beta vznikl jako projekt zaměřený na efektivní dosahování cílů a budování lepších návyků. Věříme, že s těmi správnými nástroji může každý ovládnout svůj čas a směřovat k tomu, co je pro něj skutečně důležité."
                  : "Region Beta was born as a project focused on efficient goal achievement and building better habits. We believe that with the right tools, anyone can master their time and move towards what truly matters to them."}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                {isCZ ? "Metodika" : "Methodology"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ 
                  ? "Naše aplikace kombinuje moderní psychologii, techniky produktivity a taktické kartičky (Insight Cards), které vám pomohou překonat překážky a udržet si motivaci v dlouhodobém horizontu."
                  : "Our app combines modern psychology, productivity techniques, and tactical cards (Insight Cards) to help you overcome obstacles and stay motivated in the long run."}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Heart className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                {isCZ ? "Náš Tým" : "Our Team"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ 
                  ? "Jsme malý tým nadšenců do osobního rozvoje a technologií, kteří věří v sílu malých, konzistentních kroků."
                  : "We are a small team of personal development and technology enthusiasts who believe in the power of small, consistent steps."}
              </p>
            </div>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-border/20 text-center">
          <p className="opacity-40 text-sm italic">
            {isCZ 
              ? "Děkujeme, že jste součástí naší cesty." 
              : "Thank you for being part of our journey."}
          </p>
        </footer>
      </div>
    </main>
  );
}
