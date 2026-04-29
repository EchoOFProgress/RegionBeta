"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export default function AboutPage() {
  const { t, language } = useLanguage();

  return (
    <main className="viewport py-10 px-4 sm:py-20 sm:px-6 max-w-4xl mx-auto">
      <header className="mb-10 sm:mb-16 border-b border-primary/10 pb-6 sm:pb-10">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 break-words">
          {language === "EN" ? (
            <>About / <span className="text-primary">Region Beta</span></>
          ) : (
            <>O nás / <span className="text-primary">Region Beta</span></>
          )}
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">
          {t("about.subtitle")}
        </p>
      </header>

      <div className="space-y-10 sm:space-y-16 text-base sm:text-lg leading-relaxed opacity-80">
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-foreground opacity-100">
            {t("about.who.title")}
          </h2>
          <p>{t("about.who.text")}</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 border-y border-primary/10 py-10 sm:py-16">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-xl font-black uppercase tracking-widest text-primary">
              {t("about.vision.title")}
            </h3>
            <p>{t("about.vision.text")}</p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-xl font-black uppercase tracking-widest text-primary">
              {t("about.approach.title")}
            </h3>
            <p>{t("about.approach.text")}</p>
          </div>
        </div>

        <section className="space-y-4 sm:space-y-6 text-center">
          <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-foreground opacity-100 italic">
            "Master your destination, define your journey."
          </h2>
          <p className="max-w-2xl mx-auto">{t("about.team.text")}</p>
        </section>
      </div>

      <footer className="mt-12 sm:mt-20 pt-6 sm:pt-10 border-t border-primary/10 text-center md:text-left">
        <Link
          href="/"
          className="text-sm font-black uppercase tracking-widest hover:text-primary transition-colors"
        >
          {t("nav.back")}
        </Link>
      </footer>
    </main>
  );
}
