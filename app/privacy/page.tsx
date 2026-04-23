"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="viewport py-20 px-6 max-w-4xl mx-auto">
      <header className="mb-16 border-b border-primary/10 pb-10">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">
          Ochrana <span className="text-primary">soukromí</span>
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">
          Zásady nakládání s daty
        </p>
      </header>

      <div className="space-y-12 text-lg leading-relaxed opacity-80">
        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">Soukromí je naší prioritou</h2>
          <p>
            V Region Beta věříme, že vaše data patří vám. Tato stránka vysvětluje, jaké informace sbíráme a jak s nimi nakládáme. 
            Naším cílem je být maximálně transparentní.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">Sběr informací</h2>
          <p>
            Sbíráme pouze nezbytné informace potřebné pro fungování aplikace: 
            e-mailovou adresu pro autentizaci a data o vašich úkolech, návycích a cílech, 
            která jsou uložena v rámci vašeho profilu.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">Zabezpečení</h2>
          <p>
            Využíváme moderní šifrovací protokoly a bezpečné cloudové služby, abychom zajistili, 
            že vaše data jsou v bezpečí před neoprávněným přístupem.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">Vaše práva</h2>
          <p>
            Máte právo kdykoliv požádat o export svých dat nebo o smazání svého účtu. 
            Všechny vaše záznamy budou v takovém případě trvale odstraněny z našich serverů.
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
