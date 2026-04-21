"use client";

import { InsightCard } from "@/lib/insight-cards-data";
import InsightExpandableCard from "./InsightExpandableCard";
import { useLanguage } from "@/lib/language-context";

interface InsightCardDetailProps {
  data: InsightCard;
  onBack: () => void;
  onNavigate: (title: string) => void;
}

export default function InsightCardDetail({
  data,
  onBack,
  onNavigate,
}: InsightCardDetailProps) {
  const { t } = useLanguage();

  return (
    <>
      <div className="back-wrapper">
        <button className="back-to-gallery" onClick={onBack}>
          {t("← Zpět do galerie")}
        </button>
      </div>
      <div className="detail-container">
        <InsightExpandableCard data={data} onNavigate={onNavigate} />
      </div>
    </>
  );
}
