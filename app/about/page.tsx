"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export default function AboutPage() {
  const { t, language } = useLanguage();

  return (
    <main className="viewport py-20 px-6 max-w-4xl mx-auto">
      <header className="mb-16 border-b border-primary/10 pb-10">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">
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

      <div className="space-y-16 text-lg leading-relaxed opacity-80">
        <section className="space-y-6">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground opacity-100">
            {t("about.who.title")}
          </h2>
          <p>{t("about.who.text")}</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-primary/10 py-16">
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-widest text-primary">
              {t("about.vision.title")}
            </h3>
            <p>{t("about.vision.text")}</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-widest text-primary">
              {t("about.approach.title")}
            </h3>
            <p>{t("about.approach.text")}</p>
          </div>
        </div>

        <section className="space-y-6 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground opacity-100 italic">
            "Master your destination, define your journey."
          </h2>
          <p className="max-w-2xl mx-auto">{t("about.team.text")}</p>
        </section>
      </div>

      <footer className="mt-20 pt-10 border-t border-primary/10 text-center md:text-left">
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
