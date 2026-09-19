"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mic, Send, Loader2 } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import { GuidedSteps, AssistantResponse } from "@/components/GuidedSteps";

function AskSahaara() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState("");
  
  const { isListening, listen, speechSupported } = useSpeech();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery && !response && !isLoading) {
      handleSubmit(new Event('submit') as any);
    }
  }, [initialQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResponse(data);
    } catch (err: any) {
      console.error(err);
      setError("Sorry, I couldn't reach the server. Please check your connection or try again.");
      
      // Demo Fallback
      setResponse({
        simple_answer: "This is a demo response because the connection failed.",
        steps: [
          { text: "Open the application." },
          { text: "Tap on the button." },
          { text: "Wait for the confirmation." }
        ],
        safety_notes: ["This is a fallback demo mode."]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) return;
    listen(
      (text) => setQuery(text),
      (err) => setError(err)
    );
  };

  if (response) {
    return <GuidedSteps response={response} onStartAgain={() => setResponse(null)} />;
  }

  return (
    <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">Ask a Question</h1>
        <p className="text-2xl text-muted-foreground font-medium">Tap the microphone to speak, or type your question below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="w-full text-2xl p-6 pr-40 rounded-2xl border-4 border-border focus:border-primary outline-none shadow-sm transition-colors"
            disabled={isLoading}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3">
            {speechSupported && (
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-4 rounded-xl transition-all flex items-center gap-2 ${isListening ? 'bg-danger text-danger-foreground animate-pulse' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                disabled={isLoading}
                aria-label="Tap to speak"
              >
                <Mic size={32} />
                <span className="hidden sm:inline font-bold">{isListening ? "Listening..." : "Speak"}</span>
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="p-4 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-colors"
              aria-label="Send question"
            >
              {isLoading ? <Loader2 size={32} className="animate-spin" /> : <Send size={32} />}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="p-6 bg-danger/10 text-danger border-2 border-danger rounded-2xl text-2xl font-medium">
            {error}
          </div>
        )}
      </form>

      {!isLoading && (
        <div className="space-y-6">
          <p className="text-2xl font-bold text-center text-muted-foreground">Try asking:</p>
          <div className="flex flex-col gap-4">
            {["How do I connect to Wi-Fi?", "Is this email a scam?", "Set an alarm for 8 AM"].map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="py-5 px-6 bg-card border-4 border-border rounded-2xl text-2xl font-bold hover:border-primary transition-colors text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in">
          <Loader2 size={80} className="text-primary animate-spin" />
          <p className="text-3xl font-bold text-muted-foreground animate-pulse">Please wait a moment. I am finding the answer...</p>
        </div>
      )}
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 size={48} className="animate-spin text-primary" /></div>}>
      <AskSahaara />
    </Suspense>
  );
}

