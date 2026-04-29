"use client";

import { InsightCard } from "@/lib/insight-cards-data";
import { useLanguage } from "@/lib/language-context";

function extractTwoSentences(text: string): string {
  const matches = text.match(/[^.!?]+[.!?]+/g) || [text];
  return matches.slice(0, 2).join("").trim();
}

interface InsightCardPreviewProps {
  data: InsightCard;
  onOpen: () => void;
}

export default function InsightCardPreview({ data, onOpen }: InsightCardPreviewProps) {
  const { t } = useLanguage();
  const snippet = extractTwoSentences(data.shortDescription);

  return (
    <div className="insight-preview-card">
      <span className="insight-preview-category">{data.category}</span>
      <h4 className="insight-preview-title">{data.title}</h4>
      <p className="insight-preview-snippet">{snippet}</p>
      <button className="insight-preview-btn" onClick={onOpen}>
        {t("Přejít na kartu")} →
      </button>
    </div>
  );
}
