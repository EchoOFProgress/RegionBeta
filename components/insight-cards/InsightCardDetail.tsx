"use client";

import { InsightCard } from "@/lib/insight-cards-data";
import InsightExpandableCard from "./InsightExpandableCard";

interface InsightCardDetailProps {
  data: InsightCard;
  onBack: () => void;
}

export default function InsightCardDetail({ data, onBack }: InsightCardDetailProps) {
  return (
    <>
      <div className="back-wrapper">
        <button className="back-to-gallery" onClick={onBack}>
          ← Zpět do galerie
        </button>
      </div>
      <div className="detail-container">
        <InsightExpandableCard data={data} />
      </div>
    </>
  );
}
