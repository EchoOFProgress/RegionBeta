"use client";

import { InsightCard } from "@/lib/insight-cards-data";

interface InsightCardThumbnailProps {
  data: InsightCard;
  onClick: () => void;
}

export default function InsightCardThumbnail({
  data,
  onClick,
}: InsightCardThumbnailProps) {
  const snippet = data.shortDescription.substring(0, 120) + "...";

  return (
    <div className="card-thumbnail" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}>
      <span className="thumb-category">{data.category}</span>
      <h3 className="thumb-title">{data.title}</h3>
      <p className="thumb-snippet">{snippet}</p>
      <div className="thumb-action">Otevřít kartu ➔</div>
    </div>
  );
}
