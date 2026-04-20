"use client";

interface InsightTheme {
  name: string;
  file: string;
  icon: string;
}

interface InsightThemeModalProps {
  themes: InsightTheme[];
  currentThemeFile: string;
  onSelect: (file: string) => void;
  onClose: () => void;
  onBackdropClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function InsightThemeModal({
  themes,
  currentThemeFile,
  onSelect,
  onClose,
  onBackdropClick,
}: InsightThemeModalProps) {
  return (
    <div id="insight-settings-modal" className="modal" onClick={onBackdropClick}>
      <div className="modal-content">
        <header className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>SYSTEM_THEME_SELECTOR</h3>
          <button id="insight-close-modal" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </header>
        <div className="theme-grid">
          {themes.map((theme) => (
            <div
              key={theme.file}
              className={`theme-option${currentThemeFile === theme.file ? " active" : ""}`}
              onClick={() => onSelect(theme.file)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(theme.file)}
            >
              <span className="theme-icon">{theme.icon}</span>
              <span className="theme-name">{theme.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
