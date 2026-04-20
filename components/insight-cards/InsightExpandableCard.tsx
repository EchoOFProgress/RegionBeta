"use client";

import { useState } from "react";
import { InsightCard } from "@/lib/insight-cards-data";

interface InsightExpandableCardProps {
  data: InsightCard;
}

export default function InsightExpandableCard({ data }: InsightExpandableCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [primaryFeedback, setPrimaryFeedback] = useState(false);
  const [secondaryFeedback, setSecondaryFeedback] = useState(false);

  return (
    <div className="expandable-card">
      <div className="card-header">
        <span className="card-category">{data.category}</span>
        <h2 className="card-title">{data.title}</h2>
      </div>

      <div className="card-short-desc">
        <p>{data.shortDescription}</p>
      </div>

      {expanded && (
        <div className="card-long-desc">
          {data.longDescription.map((paragraph, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
          ))}

          {data.sources.length > 0 && (
            <div className="card-sources">
              <h4>Zdroje</h4>
              {data.sources.map((source, i) => (
                <div key={i} className="source-item">
                  <p>{source.name}</p>
                  <div className="source-links">
                    {source.links.map((link, j) => (
                      <a key={j} href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        className="expand-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Zobrazit méně ▲" : "Číst více ▼"}
      </button>

      <div className="card-actions">
        <button
          className="action-btn primary-action"
          onClick={() => setPrimaryFeedback(true)}
        >
          {primaryFeedback ? data.primaryAction.feedback : data.primaryAction.text}
        </button>
        <button
          className="action-btn secondary-action"
          onClick={() => setSecondaryFeedback(true)}
        >
          {secondaryFeedback ? data.secondaryAction.feedback : data.secondaryAction.text}
        </button>
      </div>
    </div>
  );
}
