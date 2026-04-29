"use client";

import { InsightCard } from "@/lib/insight-cards-data";
import { useLanguage } from "@/lib/language-context";

function extractTwoSentences(text: string): string {
  const matches = text.match(/[^.!?]+[.!?]+/g) || [text];
  return matches.slice(0, 2).join("").trim();
}

interface InsightCardThumbnailProps {
  data: InsightCard;
  onClick: () => void;
}

export default function InsightCardThumbnail({
  data,
  onClick,
}: InsightCardThumbnailProps) {
  const { t } = useLanguage();
  const snippet = extractTwoSentences(data.shortDescription);

  return (
    <div
      className="card-thumbnail"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={data.title}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <span className="thumb-category">{data.category}</span>
      <h3 className="thumb-title">{data.title}</h3>
      <p className="thumb-snippet">{snippet}</p>
      <div className="thumb-action">{t("Otevřít kartu")} →</div>
    </div>
  );
}
