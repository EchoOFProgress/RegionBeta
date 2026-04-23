"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { ArrowLeft, Mail, MessageSquare, Globe, MapPin } from "lucide-react";

export default function Contact() {
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
            {isCZ ? "Kontakt" : "Contact"}
          </h1>
          <p className="opacity-60 font-mono text-sm">
            {isCZ ? "Jsme tu pro vás" : "We are here for you"}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-primary" size={20} />
                <h2 className="text-lg font-bold uppercase tracking-tight">Email</h2>
              </div>
              <p className="opacity-80">support@regionbeta.com</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="text-primary" size={20} />
                <h2 className="text-lg font-bold uppercase tracking-tight">Web</h2>
              </div>
              <p className="opacity-80">www.regionbeta.com</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-primary" size={20} />
                <h2 className="text-lg font-bold uppercase tracking-tight">
                  {isCZ ? "Sídlo" : "Headquarters"}
                </h2>
              </div>
              <p className="opacity-80">
                {isCZ 
                  ? "Praha, Česká republika" 
                  : "Prague, Czech Republic"}
              </p>
            </div>
          </section>

          <section className="bg-card/5 border border-border/20 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-primary" size={24} />
              <h2 className="text-xl font-bold uppercase tracking-tight">
                {isCZ ? "Rychlá zpráva" : "Quick Message"}
              </h2>
            </div>
            <p className="opacity-70 text-sm">
              {isCZ 
                ? "Máte dotaz nebo zpětnou vazbu? Pošlete nám zprávu a my se vám co nejdříve ozveme." 
                : "Have a question or feedback? Send us a message and we'll get back to you as soon as possible."}
            </p>
            <div className="space-y-4 pt-4">
              <input 
                type="text" 
                placeholder={isCZ ? "Vaše jméno" : "Your name"} 
                className="w-full bg-background/50 border border-border/30 p-3 text-sm outline-none focus:border-primary transition-colors"
              />
              <textarea 
                placeholder={isCZ ? "Vaše zpráva..." : "Your message..."} 
                rows={4}
                className="w-full bg-background/50 border border-border/30 p-3 text-sm outline-none focus:border-primary transition-colors resize-none"
              />
              <button className="w-full bg-primary text-primary-fg font-black uppercase py-3 text-xs tracking-widest hover:brightness-110 transition-all">
                {isCZ ? "Odeslat zprávu" : "Send Message"}
              </button>
            </div>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-border/20 text-center">
          <p className="opacity-40 text-sm italic">
            {isCZ 
              ? "Těšíme se na vaše podněty." 
              : "We look forward to your feedback."}
          </p>
        </footer>
      </div>
    </main>
  );
}
