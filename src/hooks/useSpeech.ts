"use client";

import { useState, useEffect, useCallback } from "react";
import { useSettings } from "@/context/SettingsContext";

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const { language, voiceOn } = useSettings();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSpeechSupported("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.9; // Slightly slower for seniors
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [language, voiceOn]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const listen = useCallback((onResult: (text: string) => void, onError: (err: string) => void) => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        onError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
      onError("Microphone is already in use or permission denied.");
    }
  }, [language]);

  return {
    isListening,
    isSpeaking,
    speechSupported,
    speak,
    stopSpeaking,
    listen
  };
}

