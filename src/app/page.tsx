import Link from "next/link";
import { Mic, HelpCircle } from "lucide-react";

export default function Welcome() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 py-8">
      <div className="space-y-6">
        <h1 className="text-6xl font-bold text-primary">Hello 👋</h1>
        <h2 className="text-4xl font-semibold">I am Sahaara.</h2>
        <p className="text-2xl text-muted-foreground max-w-lg mx-auto leading-relaxed font-medium">
          Your friendly helper. I can help you use your phone and the internet step-by-step.
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <Link 
          href="/ask" 
          className="w-full flex items-center justify-center gap-4 bg-primary text-primary-foreground py-6 px-8 rounded-2xl text-3xl font-bold shadow-lg hover:bg-primary/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Mic size={40} />
          Tap here to speak
        </Link>
        
        <div className="space-y-4 pt-4">
          <p className="text-2xl font-bold text-muted-foreground">Or try tapping one of these:</p>
          <div className="flex flex-col gap-3">
            {[
              "How do I send a photo?",
              "Is this message safe?",
              "How do I pay my electricity bill?"
            ].map((q) => (
              <Link 
                key={q}
                href={`/ask?q=${encodeURIComponent(q)}`}
                className="bg-card text-card-foreground border-2 border-border py-4 px-6 rounded-xl text-xl font-medium shadow-sm hover:border-primary hover:shadow-md transition-all text-left flex items-center justify-between"
              >
                <span>{q}</span>
                <HelpCircle className="text-primary" size={24} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
