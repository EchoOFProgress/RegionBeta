"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { ArrowLeft, Cookie, Info, ShieldCheck, Settings } from "lucide-react";

export default function CookiePolicy() {
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
            {isCZ ? "Používání Cookies" : "Cookie Policy"}
          </h1>
          <p className="opacity-60 font-mono text-sm">
            {isCZ ? "Poslední aktualizace: 23. dubna 2026" : "Last updated: April 23, 2026"}
          </p>
        </header>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                1. {isCZ ? "Co jsou cookies?" : "What are cookies?"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ 
                  ? "Cookies jsou malé textové soubory, které se ukládají do vašeho prohlížeče při návštěvě naší aplikace. Pomáhají nám zajistit základní funkce a pamatovat si vaše nastavení."
                  : "Cookies are small text files stored in your browser when you visit our application. They help us ensure basic functionality and remember your settings."}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                2. {isCZ ? "Jaké cookies používáme?" : "What cookies do we use?"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{isCZ ? "Nezbytné cookies" : "Essential cookies"}:</strong> 
                  {isCZ ? " Nutné pro technický chod aplikace a uložení vašich preferencí (např. jazyk, téma)." : " Necessary for the technical operation of the app and saving your preferences (e.g., language, theme)."}
                </li>
                <li>
                  <strong>{isCZ ? "Analytické cookies" : "Analytical cookies"}:</strong> 
                  {isCZ ? " Pomáhají nám pochopit, jak uživatelé aplikaci používají, abychom ji mohli neustále vylepšovat." : " Help us understand how users use the app so we can constantly improve it."}
                </li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                3. {isCZ ? "Správa cookies" : "Managing cookies"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ 
                  ? "Většina prohlížečů umožňuje správu cookies v nastavení. Můžete je kdykoliv smazat nebo zakázat, ale některé funkce aplikace pak nemusí fungovat správně."
                  : "Most browsers allow you to manage cookies in your settings. You can delete or disable them at any time, but some app features may not work correctly."}
              </p>
            </div>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-border/20 text-center">
          <p className="opacity-40 text-sm italic">
            {isCZ 
              ? "Respektujeme vaši volbu a soukromí." 
              : "We respect your choice and privacy."}
          </p>
        </footer>
      </div>
    </main>
  );
}
