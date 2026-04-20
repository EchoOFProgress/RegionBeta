"use client";

import { useState } from "react";
import { InsightCard } from "@/lib/insight-cards-data";

interface InsightExpandableCardProps {
  data: InsightCard;
}

export default function InsightExpandableCard({ data }: InsightExpandableCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [primaryDone, setPrimaryDone] = useState(false);
  const [secondaryDone, setSecondaryDone] = useState(false);

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

  const relatedHTML = data.nextCards
    .map((nc) => `<li>${nc}</li>`)
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
          className="expand-btn"
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
                  <h3>Zdroje:</h3>
                  <ul dangerouslySetInnerHTML={{ __html: sourcesHTML }} />
                </div>
              )}

              {data.nextCards.length > 0 && (
                <div className="meta-section">
                  <h3>Navazující:</h3>
                  <ul dangerouslySetInnerHTML={{ __html: relatedHTML }} />
                </div>
              )}
            </div>

            <div className="card-actions">
              <button
                className="btn elite-btn-secondary primary-action"
                onClick={() => {
                  setPrimaryDone(true);
                  if (typeof window !== "undefined" && (window as any).confetti) {
                    (window as any).confetti({
                      particleCount: 150,
                      spread: 70,
                      origin: { y: 0.6 },
                      colors: ["#ffffff", "#000000", "#ffaa00"],
                    });
                  }
                }}
              >
                {data.primaryAction.text}
              </button>
              <button
                className="btn elite-btn-tertiary secondary-action"
                onClick={() => setSecondaryDone(true)}
              >
                {data.secondaryAction.text}
              </button>
              {(primaryDone || secondaryDone) && (
                <div
                  className="action-feedback fade-in"
                  style={{
                    color: primaryDone
                      ? "var(--accent-orange, var(--accent-primary))"
                      : "inherit",
                    opacity: secondaryDone && !primaryDone ? 0.7 : 1,
                  }}
                >
                  {primaryDone
                    ? data.primaryAction.feedback
                    : data.secondaryAction.feedback}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
