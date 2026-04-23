"use client";

import React from "react";
import Link from "next/link";

export default function CookiesPage() {
  return (
    <main className="viewport py-20 px-6 max-w-4xl mx-auto">
      <header className="mb-16 border-b border-primary/10 pb-10">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">
          Zásady <span className="text-primary">Cookies</span>
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">
          Malé soubory, velký význam
        </p>
      </header>

      <div className="space-y-12 text-lg leading-relaxed opacity-80">
        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">Co jsou cookies?</h2>
          <p>
            Cookies jsou krátké textové soubory, které navštívená webová stránka odešle do prohlížeče. 
            Umožňují webu zaznamenat informace o vaší návštěvě, například preferovaný jazyk a další nastavení.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">Jak je využíváme?</h2>
          <p>
            V Region Beta používáme cookies primárně k udržení vašeho přihlášení a k zapamatování vašich 
            preferencí rozhraní (například vybrané téma nebo jazyk).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">Správa cookies</h2>
          <p>
            Většina prohlížečů cookies automaticky přijímá. Své nastavení můžete kdykoliv změnit v rámci 
            konfigurace svého prohlížeče, kde lze cookies zakázat nebo smazat.
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
