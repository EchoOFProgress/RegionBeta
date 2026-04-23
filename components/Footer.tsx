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
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="Github">
                <Github size={18} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-nav-group">
              <h3 className="footer-nav-title">Platform</h3>
              <ul className="footer-nav-list">
                {footerLinks.map((link, idx) => (
                  <li key={idx}>
                    {link.isButton ? (
                      <button 
                        onClick={link.onClick}
                        className="footer-nav-link group support-link bg-transparent border-none p-0 cursor-pointer text-left"
                      >
                        <link.icon size={14} className="link-icon" />
                        <span>{link.label}</span>
                        <ExternalLink size={10} className="external-icon" />
                      </button>
                    ) : (
                      <a 
                        href={link.href} 
                        className={`footer-nav-link group ${link.label.includes("Podpořit") || link.label.includes("Support") ? "support-link" : ""}`}
                      >
                        <link.icon size={14} className="link-icon" />
                        <span>{link.label}</span>
                        <ExternalLink size={10} className="external-icon" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-legal">
            <p className="copyright-text">{t("footer.copyright")}</p>
            <div className="legal-links">
              <span className="version-tag">v0.8.2-stable</span>
              <span className="dot-separator">•</span>
              <span className="system-status">System Operational</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Donation Modal */}
      <DonationModal isOpen={isDonoOpen} onClose={() => setIsDonoOpen(false)} />

      {/* Decorative elements */}
      <div className="footer-blur-blob"></div>
      <div className="footer-line-accent"></div>
    </footer>
  );
}
