"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ArrowLeft, Settings, HelpCircle, Volume2, VolumeX } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { voiceOn, updateSettings } = useSettings();

  const isHome = pathname === "/" || pathname === "/home";

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary text-primary-foreground p-4 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-4">
        {!isHome && (
          <button 
            onClick={() => router.back()}
            className="p-3 bg-primary-foreground/20 rounded-lg hover:bg-primary-foreground/30 transition-colors focus-visible:ring-4 ring-white focus:outline-none flex items-center gap-2"
            aria-label="Go back"
          >
            <ArrowLeft size={28} />
            <span className="hidden sm:inline font-bold">Back</span>
          </button>
        )}
        <Link 
          href="/home" 
          className="p-3 bg-primary-foreground/20 rounded-lg hover:bg-primary-foreground/30 transition-colors focus-visible:ring-4 ring-white focus:outline-none flex items-center gap-2"
          aria-label="Go to home screen"
        >
          <Home size={28} />
          <span className="hidden sm:inline font-bold">Home</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-wide">SAHAARA</h1>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={() => updateSettings({ voiceOn: !voiceOn })}
          className="px-4 py-3 bg-primary-foreground/20 rounded-lg hover:bg-primary-foreground/30 transition-colors focus-visible:ring-4 ring-white focus:outline-none flex items-center gap-2"
          aria-label={voiceOn ? "Turn off voice" : "Turn on voice"}
        >
          {voiceOn ? <Volume2 size={28} /> : <VolumeX size={28} />}
          <span className="hidden sm:inline font-bold">
            {voiceOn ? "Sound: On" : "Sound: Off"}
          </span>
        </button>
        <Link 
          href="/settings"
          className="px-4 py-3 bg-primary-foreground/20 rounded-lg hover:bg-primary-foreground/30 transition-colors focus-visible:ring-4 ring-white focus:outline-none flex items-center gap-2"
          aria-label="Settings"
        >
          <Settings size={28} />
          <span className="hidden sm:inline font-bold">Settings</span>
        </Link>
      </div>
    </nav>
  );
}

