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

export function Footer() {
  const { t } = useLanguage();
  const [isDonoOpen, setIsDonoOpen] = useState(false);

  const footerLinks = [
    { label: t("footer.tos"), icon: FileText, href: "/terms" },
    { label: t("footer.privacy"), icon: ShieldCheck, href: "/privacy" },
    { label: t("footer.cookies"), icon: Cookie, href: "/cookies" },
    { label: t("footer.about"), icon: Info, href: "/about" },
    { label: t("footer.contact"), icon: Mail, href: "/contact" },
    { 
      label: t("footer.support"), 
      icon: Banknote, 
      onClick: () => setIsDonoOpen(true),
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
              Master your destination, define your journey.
            </p>
            
            {/* Socials and Links Moved Here */}
            <div className="flex flex-col gap-6 mt-6">
              <div className="footer-socials">
                <a href="#" className="social-link" aria-label="Github">
                  <Github size={18} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
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
                    ) : (
                      <a 
                        href={link.href} 
                        className={`footer-nav-link group flex items-center gap-2 ${link.label.includes("Podpořit") || link.label.includes("Support") ? "support-link" : ""}`}
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

      {/* Decorative elements */}
      <div className="footer-blur-blob"></div>
    </footer>
  );
}
