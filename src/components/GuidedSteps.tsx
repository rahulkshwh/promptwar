"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useSpeech } from "@/hooks/useSpeech";
import { Volume2, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, MessageCircle } from "lucide-react";
import Link from "next/link";

export interface Step {
  text: string;
}

export interface AssistantResponse {
  intent?: string;
  simple_answer: string;
  steps?: Step[];
  safety_notes?: string[];
  requires_confirmation?: boolean;
  suggested_next_action?: string;
}

interface GuidedStepsProps {
  response: AssistantResponse;
  onStartAgain: () => void;
}

export function GuidedSteps({ response, onStartAgain }: GuidedStepsProps) {
  const { guidanceMode, updateSettings } = useSettings();
  const { speak, stopSpeaking } = useSpeech();
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 means intro/simple answer

  const isDetailed = guidanceMode === "detailed";
  const hasSteps = response.steps && response.steps.length > 0;
  const totalSteps = hasSteps ? response.steps!.length : 0;
  
  const isFinished = currentStepIndex >= totalSteps;

  // Auto-read on step change
  useEffect(() => {
    stopSpeaking();
    if (currentStepIndex === -1) {
      speak(response.simple_answer);
    } else if (currentStepIndex >= 0 && currentStepIndex < totalSteps) {
      speak(response.steps![currentStepIndex].text);
    } else if (isFinished) {
      speak("You're all done!");
    }
  }, [currentStepIndex, response, speak, stopSpeaking, isFinished, totalSteps]);

  const toggleMode = () => {
    updateSettings({ guidanceMode: isDetailed ? "step-by-step" : "detailed" });
  };

  const nextStep = () => setCurrentStepIndex(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStepIndex(prev => Math.max(prev - 1, -1));

  const renderIntro = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-2xl">
        <p className="text-2xl font-medium leading-relaxed">{response.simple_answer}</p>
        <button 
          onClick={() => {stopSpeaking(); speak(response.simple_answer);}}
          className="mt-4 flex items-center gap-2 text-primary font-bold text-lg hover:underline"
        >
          <Volume2 size={24} /> Listen
        </button>
      </div>

      {response.safety_notes && response.safety_notes.length > 0 && (
        <div className="bg-danger/10 border-2 border-danger/20 p-6 rounded-2xl space-y-3">
          <h3 className="text-xl font-bold text-danger">Safety Note</h3>
          <ul className="list-disc pl-6 space-y-2 text-lg">
            {response.safety_notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {hasSteps && (
        <button 
          onClick={nextStep}
          className="w-full bg-primary text-primary-foreground py-6 px-6 rounded-2xl text-3xl font-bold shadow-lg flex justify-center items-center gap-4 hover:bg-primary/90 transition-transform hover:scale-[1.02]"
        >
          Show me how <ChevronRight size={36} />
        </button>
      )}
    </div>
  );

  const renderStepByStep = () => (
    <div className="space-y-8 flex flex-col h-full justify-center animate-in fade-in slide-in-from-right-4">
      <div className="text-center space-y-4">
        <span className="text-2xl font-bold text-muted-foreground uppercase tracking-widest">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <div className="w-full bg-muted h-4 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500" 
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-card border-4 border-border p-10 rounded-3xl shadow-sm text-center min-h-[300px] flex flex-col justify-center items-center space-y-8">
        <p className="text-4xl font-bold leading-relaxed">
          {response.steps![currentStepIndex].text}
        </p>
        <button 
          onClick={() => {stopSpeaking(); speak(response.steps![currentStepIndex].text);}}
          className="p-6 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors flex flex-col items-center gap-2"
          aria-label="Listen to step"
        >
          <Volume2 size={48} />
          <span className="text-xl font-bold">Listen</span>
        </button>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={prevStep}
          className="flex-1 py-6 px-4 bg-muted text-muted-foreground rounded-2xl text-2xl font-bold flex justify-center items-center gap-2 hover:bg-muted/80"
        >
          <ChevronLeft size={32} /> Back
        </button>
        <button 
          onClick={nextStep}
          className="flex-1 py-6 px-4 bg-primary text-primary-foreground rounded-2xl text-2xl font-bold flex justify-center items-center gap-2 shadow hover:bg-primary/90"
        >
          Next <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );

  const renderDetailed = () => (
    <div className="space-y-6 animate-in fade-in">
      {renderIntro()}
      {hasSteps && (
        <div className="space-y-6">
          <h3 className="text-3xl font-bold">All Steps:</h3>
          {response.steps!.map((step, i) => (
            <div key={i} className="bg-card border-4 border-border p-6 rounded-2xl flex gap-6 items-start">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
                {i + 1}
              </div>
              <p className="text-2xl pt-1 font-medium">{step.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFinished = () => (
    <div className="text-center space-y-8 animate-in zoom-in duration-500 py-12">
      <div className="mx-auto w-40 h-40 bg-success/20 text-success rounded-full flex items-center justify-center">
        <CheckCircle2 size={96} />
      </div>
      <h2 className="text-5xl font-bold">You are all done!</h2>
      
      <div className="flex flex-col gap-6 max-w-md mx-auto pt-8">
        <Link 
          href="/home"
          className="py-6 px-6 bg-success text-success-foreground rounded-2xl text-3xl font-bold shadow-lg hover:bg-success/90 transition-transform hover:scale-[1.02]"
        >
          Finish
        </Link>
        <button 
          onClick={() => setCurrentStepIndex(-1)}
          className="py-6 px-6 bg-muted text-muted-foreground rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 hover:bg-muted/80"
        >
          <RotateCcw size={32} /> Read again
        </button>
        <button 
          onClick={onStartAgain}
          className="py-6 px-6 bg-card border-4 border-border text-card-foreground rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 hover:border-primary"
        >
          <MessageCircle size={32} /> Ask another question
        </button>
      </div>
    </div>
  );

  if (isFinished) return renderFinished();

  return (
    <div className="space-y-6 flex-1 flex flex-col pb-8">
      <div className="flex justify-end">
        {hasSteps && (
          <button 
            onClick={toggleMode}
            className="bg-secondary text-secondary-foreground font-bold p-4 rounded-xl text-xl shadow-sm hover:bg-secondary/80 flex items-center gap-2"
          >
            {isDetailed ? "Switch to: Show one by one" : "Switch to: Show all at once"}
          </button>
        )}
      </div>
      
      {currentStepIndex === -1 
        ? renderIntro() 
        : (isDetailed ? renderDetailed() : renderStepByStep())}
    </div>
  );
}

