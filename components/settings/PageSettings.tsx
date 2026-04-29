"use client";

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

export default function PageSettings({
  themes,
  currentThemeFile,
  onSelectTheme,
}: PageSettingsProps) {
  return (
    <div className="page-settings">
      <div className="page-settings-grid">
        {themes.map((theme) => (
          <button
            key={theme.file}
            className={`page-theme-card${
              currentThemeFile === theme.file ? " active" : ""
            }`}
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
