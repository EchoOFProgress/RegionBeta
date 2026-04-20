"use client";

import { useState } from "react";

interface Theme {
  name: string;
  file: string;
  icon: string;
}

interface PageSettingsProps {
  themes: Theme[];
  currentThemeFile: string;
  onSelectTheme: (file: string) => void;
}

type GridLayout = "2x6" | "3x4" | "4x3";

const GRID_OPTIONS: { label: string; value: GridLayout; cols: number }[] = [
  { label: "2×6", value: "2x6", cols: 2 },
  { label: "3×4", value: "3x4", cols: 3 },
  { label: "4×3", value: "4x3", cols: 4 },
];

export default function PageSettings({ themes, currentThemeFile, onSelectTheme }: PageSettingsProps) {
  const [gridLayout, setGridLayout] = useState<GridLayout>("3x4");

  const currentCols = GRID_OPTIONS.find((o) => o.value === gridLayout)?.cols ?? 3;

  return (
    <div className="page-settings">
      <div className="page-settings-header">
        <span className="page-settings-label">Rozložení mřížky</span>
        <div className="grid-toggle">
          {GRID_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`grid-toggle-btn${gridLayout === opt.value ? " active" : ""}`}
              onClick={() => setGridLayout(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="page-settings-grid"
        style={{ gridTemplateColumns: `repeat(${currentCols}, 1fr)` }}
      >
        {themes.map((theme) => (
          <button
            key={theme.file}
            className={`page-theme-card${currentThemeFile === theme.file ? " active" : ""}`}
            onClick={() => onSelectTheme(theme.file)}
          >
            <span className="page-theme-icon">{theme.icon}</span>
            <span className="page-theme-name">{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
