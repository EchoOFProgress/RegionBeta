"use client";

import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="viewport py-20 px-6 max-w-4xl mx-auto">
      <header className="mb-16 border-b border-primary/10 pb-10">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">
          Obchodní <span className="text-primary">podmínky</span>
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">
          Poslední aktualizace: 23. dubna 2026
        </p>
      </header>

      <div className="space-y-12 text-lg leading-relaxed opacity-80">
        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">1. Úvodní ustanovení</h2>
          <p>
            Vítejte v Region Beta. Používáním naší aplikace souhlasíte s těmito obchodními podmínkami. 
            Naše platforma je navržena pro osobní růst a sledování produktivity. Prosíme, přečtěte si tyto podmínky pečlivě.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">2. Uživatelský účet</h2>
          <p>
            Uživatel je zodpovědný za bezpečnost svého účtu a za veškerou aktivitu, která pod jeho účtem probíhá. 
            Region Beta si vyhrazuje právo omezit přístup ke službám v případě porušení těchto podmínek.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">3. Podpora a dary</h2>
          <p>
            Veškeré finanční příspěvky (dary) poskytnuté prostřednictvím platformy jsou dobrovolné a slouží k podpoře 
            provozu a dalšího vývoje aplikace. Tyto příspěvky jsou nevratné.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">4. Omezení odpovědnosti</h2>
          <p>
            Aplikace je poskytována "tak, jak je". Region Beta nenese odpovědnost za jakékoli přímé či nepřímé škody 
            vzniklé používáním nebo nemožností používat služby platformy.
          </p>
        </section>
      </div>

      <footer className="mt-20 pt-10 border-t border-primary/10">
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
