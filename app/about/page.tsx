"use client";

import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="viewport py-20 px-6 max-w-4xl mx-auto">
      <header className="mb-16 border-b border-primary/10 pb-10">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">
          O nás / <span className="text-primary">Region Beta</span>
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">
          Vize, která nás pohání vpřed
        </p>
      </header>

      <div className="space-y-16 text-lg leading-relaxed opacity-80">
        <section className="space-y-6">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground opacity-100">Kdo jsme</h2>
          <p>
            Region Beta není jen aplikace. Je to filozofie přístupu k času a osobnímu rozvoji. 
            Vytvořili jsme prostor pro ty, kteří chtějí překonávat své limity, sledovat svůj pokrok 
            a využívat sílu moderních technologií k tomu, aby se stali svou nejlepší verzí.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-primary/10 py-16">
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-widest text-primary">Naše vize</h3>
            <p>
              Věříme v čistý design, efektivitu a transparentnost. Chceme, aby technologie sloužily 
              lidem, nikoliv lidé technologiím.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-widest text-primary">Náš přístup</h3>
            <p>
              Region Beta je v neustálém vývoji. Každá nová funkce je výsledkem dialogu s naší 
              komunitou a snahy o maximální přínos pro uživatele.
            </p>
          </div>
        </div>

        <section className="space-y-6 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground opacity-100 italic">"Master your destination, define your journey."</h2>
          <p className="max-w-2xl mx-auto">
            Jsme malý tým nadšenců do AI, produktivity a designu, který věří, že každý si zaslouží 
            mít k dispozici nástroje, které ho skutečně posunou vpřed.
          </p>
        </section>
      </div>

      <footer className="mt-20 pt-10 border-t border-primary/10 text-center md:text-left">
        <Link 
          href="/" 
          className="text-sm font-black uppercase tracking-widest hover:text-primary transition-colors"
        >
          Zpět na hlavní panel
        </Link>
      </footer>
    </main>
  );
}
