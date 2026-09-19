"use client";

import { useState } from "react";
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Search, Loader2 } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";

interface SafetyAnalysis {
  risk_level: "low" | "caution" | "high";
  reasons: string[];
  safe_actions: string[];
  unsafe_actions: string[];
}

export default function SafetyCheck() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SafetyAnalysis | null>(null);
  const { speak, stopSpeaking } = useSpeech();

  const handleCheck = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    setAnalysis(null);
    stopSpeaking();

    try {
      const res = await fetch("/api/safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setAnalysis(data);
      
      // Auto-read summary
      let summary = "Safety Check Complete. ";
      if (data.risk_level === "high") summary += "Warning, this looks like a scam. Be very careful. ";
      if (data.risk_level === "caution") summary += "This message has some warning signs. Proceed with caution. ";
      if (data.risk_level === "low") summary += "This message looks generally safe, but always trust your instincts. ";
      speak(summary);

    } catch (err) {
      setAnalysis({
        risk_level: "caution",
        reasons: ["Unable to analyze fully without internet.", "Unexpected message."],
        safe_actions: ["Ask a family member for help."],
        unsafe_actions: ["Do not click links or share information."]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case "high": return "text-danger bg-danger/10 border-danger/30";
      case "caution": return "text-yellow-600 bg-yellow-100 border-yellow-300";
      case "low": return "text-success bg-success/10 border-success/30";
      default: return "text-foreground bg-card";
    }
  };

  const getRiskIcon = (level: string) => {
    switch(level) {
      case "high": return <XCircle size={64} className="text-danger" />;
      case "caution": return <AlertTriangle size={64} className="text-yellow-600" />;
      case "low": return <CheckCircle2 size={64} className="text-success" />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full space-y-8 py-8">
      <header className="text-center space-y-4">
        <div className="mx-auto w-28 h-28 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <ShieldAlert size={64} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold">Is this message safe?</h1>
        <p className="text-2xl text-muted-foreground font-medium">Paste a message here, and I will check it for you.</p>
      </header>

      {!analysis && (
        <div className="space-y-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., Congratulations! You have won a prize. Click here..."
            className="w-full text-2xl p-6 rounded-2xl border-4 border-border focus:border-primary outline-none shadow-sm min-h-[200px] resize-y"
            disabled={isLoading}
          />
          <button
            onClick={handleCheck}
            disabled={isLoading || !message.trim()}
            className="w-full py-6 bg-primary text-primary-foreground rounded-2xl text-3xl font-bold flex justify-center items-center gap-4 disabled:opacity-50 hover:bg-primary/90 transition-transform hover:scale-[1.02]"
          >
            {isLoading ? <Loader2 size={36} className="animate-spin" /> : <Search size={36} />}
            Check if safe
          </button>
        </div>
      )}

      {analysis && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className={`p-8 rounded-3xl border-4 text-center space-y-4 ${getRiskColor(analysis.risk_level)}`}>
            <div className="flex justify-center">{getRiskIcon(analysis.risk_level)}</div>
            <h2 className="text-4xl font-bold capitalize">
              {analysis.risk_level === "high" ? "⚠️ Warning! Be Careful." : 
               analysis.risk_level === "caution" ? "Proceed With Caution." : 
               "Looks Generally Safe."}
            </h2>
            <p className="text-2xl font-medium">
              {analysis.risk_level === "high" && "This message looks very suspicious and could be a scam."}
              {analysis.risk_level === "caution" && "There are a few suspicious things in this message."}
              {analysis.risk_level === "low" && "We did not find major warning signs, but always trust your instincts."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card border-4 border-border p-6 rounded-2xl space-y-4">
              <h3 className="text-3xl font-bold flex items-center gap-2"><AlertTriangle size={32}/> Warning Signs</h3>
              <ul className="space-y-4">
                {analysis.reasons.map((r, i) => (
                  <li key={i} className="flex gap-4 text-xl">
                    <span className="text-yellow-600 font-bold shrink-0">✓</span> {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border-4 border-border p-6 rounded-2xl space-y-4">
              <h3 className="text-3xl font-bold flex items-center gap-2 text-danger"><XCircle size={32}/> Do Not:</h3>
              <ul className="space-y-4">
                {analysis.unsafe_actions.map((a, i) => (
                  <li key={i} className="flex gap-4 text-xl font-medium text-danger">
                    <span className="shrink-0">❌</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button 
              onClick={() => {setAnalysis(null); setMessage("");}}
              className="flex-1 py-6 bg-card border-4 border-border rounded-2xl text-2xl font-bold hover:bg-muted"
            >
              Check another
            </button>
            <button 
              className="flex-1 py-6 bg-secondary text-secondary-foreground rounded-2xl text-2xl font-bold shadow hover:bg-secondary/90"
            >
              Ask family for help
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

