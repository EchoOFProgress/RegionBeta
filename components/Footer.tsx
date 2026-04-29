"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  ShieldCheck,
  FileText,
  Cookie,
  Mail,
  Info,
  Github,
  Twitter,
  ExternalLink,
  Banknote
} from "lucide-react";
import { DonationModal } from "./DonationModal";
import { FeedbackModal } from "./FeedbackModal";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const { t, language } = useLanguage();
  const [isDonoOpen, setIsDonoOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { toast } = useToast();

  const devToast = () => {
    toast({
      title: language === "EN" ? "In development" : "Ve vývoji",
      description: language === "EN"
        ? "This feature is not available yet."
        : "Tato funkce ještě není dostupná.",
    });
  };

  const footerLinks = [
    { label: t("footer.tos"), icon: FileText, href: "/terms", devOnly: true },
    { label: t("footer.privacy"), icon: ShieldCheck, href: "/privacy", devOnly: true },
    { label: t("footer.cookies"), icon: Cookie, href: "/cookies", devOnly: true },
    { label: t("footer.about"), icon: Info, href: "/about", devOnly: true },
    { label: t("footer.contact"), icon: Mail, href: "/contact" },
    {
      label: t("footer.support"),
      icon: Banknote,
      onClick: () => setIsDonoOpen(true),
      isButton: true
    },
    {
      label: t("footer.feedback"),
      icon: MessageSquare,
      onClick: () => setIsFeedbackOpen(true),
      isButton: true
    },
  ];

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-logo">
              Region <span className="text-primary">Beta</span>
            </h2>
            <p className="footer-tagline">
              {t("footer.tagline")}
            </p>
            
            {/* Socials and Links Moved Here */}
            <div className="flex flex-col gap-6 mt-6">
              <div className="footer-socials">
                <span className="social-link opacity-50 cursor-default select-none flex flex-col items-center gap-0.5" title={language === "EN" ? "In development" : "Ve vývoji"}>
                  <Github size={18} className="line-through" />
                  <span className="text-[9px] opacity-70">{language === "EN" ? "soon" : "brzy"}</span>
                </span>
                <span className="social-link opacity-50 cursor-default select-none flex flex-col items-center gap-0.5" title={language === "EN" ? "In development" : "Ve vývoji"}>
                  <Twitter size={18} />
                  <span className="text-[9px] opacity-70">{language === "EN" ? "soon" : "brzy"}</span>
                </span>
              </div>

              <ul className="footer-nav-list flex flex-wrap gap-x-6 gap-y-2">
                {footerLinks.map((link, idx) => (
                  <li key={idx}>
                    {link.isButton ? (
                      <button
                        onClick={link.onClick}
                        className="footer-nav-link group support-link bg-transparent border-none p-0 cursor-pointer text-left flex items-center gap-2"
                      >
                        <link.icon size={14} className="link-icon" />
                        <span>{link.label}</span>
                      </button>
                    ) : link.devOnly ? (
                      <span className="footer-nav-link group flex items-center gap-2 opacity-50 cursor-default select-none">
                        <link.icon size={14} className="link-icon" />
                        <span className="flex flex-col leading-tight">
                          <span className="line-through">{link.label}</span>
                          <span className="text-[10px] opacity-70 no-underline">
                            {language === "EN" ? "In development" : "Ve vývoji"}
                          </span>
                        </span>
                      </span>
                    ) : (
                      <a
                        href={link.href}
                        className="footer-nav-link group flex items-center gap-2"
                      >
                        <link.icon size={14} className="link-icon" />
                        <span>{link.label}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Empty right side as everything is moved to the brand column */}
          <div className="footer-links-grid hidden md:block">
          </div>
        </div>
      </div>
      
      {/* Donation Modal */}
      <DonationModal isOpen={isDonoOpen} onClose={() => setIsDonoOpen(false)} />

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* Decorative elements */}
      <div className="footer-blur-blob"></div>
    </footer>
  );
}
