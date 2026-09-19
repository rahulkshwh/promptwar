"use client";

import { useState } from "react";
import { Phone, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";

export default function FamilyHelp() {
  const [status, setStatus] = useState<string | null>(null);
  const { speak } = useSpeech();

  const handleAction = (action: string) => {
    setStatus(action);
    speak(`${action}. This is just a test, no actual message was sent.`);
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full space-y-8 py-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">Family Help</h1>
        <p className="text-xl text-muted-foreground">Quickly reach out to your trusted contacts.</p>
      </header>

      {status && (
        <div className="bg-success text-success-foreground p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={36} />
          <p className="text-2xl font-bold">{status} (Demo)</p>
        </div>
      )}

      <div className="space-y-6">
        <button 
          onClick={() => handleAction("Calling Family")}
          className="w-full flex items-center gap-6 bg-card border-4 border-border p-8 rounded-3xl hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="bg-primary/10 text-primary p-6 rounded-full group-hover:scale-110 transition-transform">
            <Phone size={48} />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold">Call Family</h2>
            <p className="text-xl text-muted-foreground mt-2">Start a voice call</p>
          </div>
        </button>

        <button 
          onClick={() => handleAction("Help Message Sent")}
          className="w-full flex items-center gap-6 bg-card border-4 border-border p-8 rounded-3xl hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="bg-primary/10 text-primary p-6 rounded-full group-hover:scale-110 transition-transform">
            <MessageSquare size={48} />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold">Send Message</h2>
            <p className="text-xl text-muted-foreground mt-2">"I need help with my phone"</p>
          </div>
        </button>

        <div className="pt-8">
          <button 
            onClick={() => handleAction("Emergency Alert Sent")}
            className="w-full flex justify-center items-center gap-4 bg-danger text-danger-foreground p-8 rounded-3xl hover:bg-danger/90 transition-all shadow-lg font-bold text-3xl"
          >
            <AlertCircle size={40} />
            I Need Help Now
          </button>
        </div>
      </div>
    </div>
  );
}

