"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type TextSize = "normal" | "large" | "extralarge";
type Language = "en" | "hi";
type GuidanceMode = "step-by-step" | "detailed";

interface Settings {
  textSize: TextSize;
  language: Language;
  voiceOn: boolean;
  guidanceMode: GuidanceMode;
  highContrast: boolean;
}

interface SettingsContextType extends Settings {
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  textSize: "large", // Defaulting to large for seniors
  language: "en",
  voiceOn: true,
  guidanceMode: "step-by-step",
  highContrast: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from local storage
    const stored = localStorage.getItem("sahaara_settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {}
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sahaara_settings", JSON.stringify(settings));
      
      // Update data attributes on document element
      document.documentElement.setAttribute("data-text-size", settings.textSize);
      document.documentElement.setAttribute("data-high-contrast", String(settings.highContrast));
    }
  }, [settings, mounted]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Prevent hydration mismatch by only applying the document attributes after mount
  // but we still render children to avoid React Error #299

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

