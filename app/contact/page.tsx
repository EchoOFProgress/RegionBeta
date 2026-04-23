"use client";

import React from "react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="viewport py-20 px-6 max-w-4xl mx-auto">
      <header className="mb-20 border-b border-primary/10 pb-10">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">
          Jsme v <span className="text-primary">kontaktu</span>
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">
          Máte dotaz nebo nápad na zlepšení?
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 text-lg">
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Obecné dotazy</h2>
            <p className="text-3xl font-black lowercase tracking-tighter">
              <a href="mailto:mvystavel@seznam.cz" className="hover:text-primary transition-colors">
                mvystavel@seznam.cz
              </a>
            </p>
            <p className="opacity-60">Jsme tu pro vás každý všední den od 9:00 do 17:00.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Podpora</h2>
            <p className="text-3xl font-black lowercase tracking-tighter">
              <a 
                href="mailto:mvystavel@seznam.cz"
                className="hover:text-primary transition-colors"
              >
                mvystavel@seznam.cz
              </a>
            </p>
            <p className="opacity-60">Technické problémy řešíme prioritně do 24 hodin.</p>
          </section>
        </div>

        <div className="bg-accent/20 p-10 rounded-2xl space-y-6 flex flex-col justify-center">
          <h2 className="text-2xl font-black uppercase tracking-tight">Kancelář</h2>
          <div className="space-y-2 opacity-80 italic leading-relaxed">
            <p>Region Beta Systems s.r.o.</p>
            <p>Technologická 152/4</p>
            <p>160 00 Praha 6</p>
            <p>Česká republika</p>
          </div>
          <div className="pt-6 border-t border-primary/10 text-xs font-bold uppercase opacity-40 tracking-widest">
            IČ: 12345678 • DIČ: CZ12345678
          </div>
        </div>
      </div>

      <footer className="mt-32 pt-10 border-t border-primary/10">
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
