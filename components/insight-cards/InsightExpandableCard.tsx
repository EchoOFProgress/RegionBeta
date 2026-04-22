"use client";

import { useState } from "react";
import { InsightCard } from "@/lib/insight-cards-data";
import { useLanguage } from "@/lib/language-context";

interface InsightExpandableCardProps {
  data: InsightCard;
  onNavigate?: (title: string) => void;
}

export default function InsightExpandableCard({
  data,
  onNavigate,
}: InsightExpandableCardProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const sourcesHTML = data.sources
    .map((source) => {
      const links = source.links
        .map(
          (l) =>
            `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`
        )
        .join(" | ");
      return `<li>${source.type} <strong>${source.name}</strong>${links ? ` [${links}]` : ""}</li>`;
    })
    .join("");

  return (
    <article
      className={`expandable-card detail-mode${expanded ? " is-expanded" : ""}`}
      id={`card-${data.id}`}
    >
      <div className="card-header">
        <div className="card-info">
          <span className="card-category">{data.category}</span>
          <h2 className="card-title">{data.title}</h2>
        </div>
        <button
          className={`expand-btn simple-icon-btn shrink-0 flex items-center justify-center rounded-md border transition-colors${expanded ? " is-expanded" : ""}`}
          aria-label="Toggle Details"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="icon">{expanded ? "▲" : "▼"}</span>
        </button>
      </div>

      <div className="card-content">
        <p className="short-description">{data.shortDescription}</p>

        <div className="long-description-wrapper">
          <div className="long-description">
            <div className="card-main-content">
              {data.longDescription.map((paragraph, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
              ))}
            </div>

            <div className="card-meta-block">
              {data.sources.length > 0 && (
                <div className="meta-section">
                  <h3>{t("Zdroje:")}</h3>
                  <ul dangerouslySetInnerHTML={{ __html: sourcesHTML }} />
                </div>
              )}

              {data.nextCards.length > 0 && (
                <div className="meta-section">
                  <h3>{t("Navazující:")}</h3>
                  <ul className="related-cards-list">
                    {data.nextCards.map((nc, index) => (
                      <li key={index}>
                        <button
                          className="next-card-link"
                          onClick={() => onNavigate?.(nc)}
                        >
                          {nc}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
