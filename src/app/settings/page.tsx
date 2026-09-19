"use client";

import { useSettings } from "@/context/SettingsContext";
import { Check } from "lucide-react";

export default function Settings() {
  const { textSize, language, voiceOn, guidanceMode, highContrast, updateSettings } = useSettings();

  const renderOption = (
    label: string, 
    isActive: boolean, 
    onClick: () => void, 
    description?: string
  ) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-6 rounded-2xl border-4 transition-all text-left ${
        isActive 
          ? "border-primary bg-primary/5" 
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-2xl font-bold">{label}</span>
        {isActive && <Check className="text-primary" size={32} />}
      </div>
      {description && <span className="text-lg text-muted-foreground mt-2">{description}</span>}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto w-full space-y-12 py-8">
      <header>
        <h1 className="text-4xl sm:text-5xl font-bold">Settings</h1>
      </header>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold border-b-2 border-border pb-4">Text Size</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {renderOption("Normal", textSize === "normal", () => updateSettings({ textSize: "normal" }))}
          {renderOption("Large", textSize === "large", () => updateSettings({ textSize: "large" }))}
          {renderOption("Extra Large", textSize === "extralarge", () => updateSettings({ textSize: "extralarge" }))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold border-b-2 border-border pb-4">Language</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {renderOption("English", language === "en", () => updateSettings({ language: "en" }))}
          {renderOption("हिंदी (Hindi)", language === "hi", () => updateSettings({ language: "hi" }))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold border-b-2 border-border pb-4">How to show instructions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {renderOption(
            "One step at a time", 
            guidanceMode === "step-by-step", 
            () => updateSettings({ guidanceMode: "step-by-step" }),
            "Shows one large instruction at a time"
          )}
          {renderOption(
            "Show all steps at once", 
            guidanceMode === "detailed", 
            () => updateSettings({ guidanceMode: "detailed" }),
            "Shows the full list of instructions together"
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold border-b-2 border-border pb-4">Display & Sound</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {renderOption(
            "Read Aloud", 
            voiceOn, 
            () => updateSettings({ voiceOn: !voiceOn }),
            voiceOn ? "On: Phone reads text aloud" : "Off: Silent"
          )}
          {renderOption(
            "High Contrast", 
            highContrast, 
            () => updateSettings({ highContrast: !highContrast }),
            highContrast ? "On: High visibility colors (Black/Yellow)" : "Off: Standard colors"
          )}
        </div>
      </section>
    </div>
  );
}

