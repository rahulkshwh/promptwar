import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

// Fallback contextual knowledge base for when AI models are slow, rate-limited, or unavailable
function getContextualFallback(query: string) {
  const q = (query || "").toLowerCase();

  if (q.includes("photo") || q.includes("whatsapp") || q.includes("picture") || q.includes("image")) {
    return {
      intent: "HOW_TO_TASK",
      simple_answer: "Here is how you can send a photo on WhatsApp:",
      steps: [
        { text: "Open the WhatsApp app on your phone." },
        { text: "Tap on the contact or chat you want to send the photo to." },
        { text: "Tap the paperclip or camera icon at the bottom of the screen." },
        { text: "Select your photo from the gallery and tap the green Send arrow." }
      ],
      safety_notes: ["Only send photos to family and people you know and trust."]
    };
  }

  if (q.includes("bill") || q.includes("electricity") || q.includes("pay") || q.includes("payment")) {
    return {
      intent: "HOW_TO_TASK",
      simple_answer: "Here is how you can safely pay your electricity bill:",
      steps: [
        { text: "Open your trusted payment app like Google Pay, PhonePe, or Paytm." },
        { text: "Tap on 'Bills' or 'Electricity'." },
        { text: "Choose your electricity provider from the list." },
        { text: "Enter your Consumer or Account Number from your paper bill." },
        { text: "Verify the amount and your name on screen, then tap Pay." }
      ],
      safety_notes: ["Never share your UPI PIN or bank OTP with anyone claiming to help you."]
    };
  }

  if (q.includes("font") || q.includes("text") || q.includes("size") || q.includes("large") || q.includes("read")) {
    return {
      intent: "HOW_TO_TASK",
      simple_answer: "Here is how you can make the text bigger on your phone:",
      steps: [
        { text: "Open your phone's 'Settings' app (the gear icon)." },
        { text: "Tap on 'Display'." },
        { text: "Tap on 'Font size' or 'Text size'." },
        { text: "Slide the circle to the right to make the letters larger and easier to read." }
      ],
      safety_notes: []
    };
  }

  if (q.includes("wifi") || q.includes("wi-fi") || q.includes("internet") || q.includes("connect")) {
    return {
      intent: "HOW_TO_TASK",
      simple_answer: "Here is how you can connect to Wi-Fi:",
      steps: [
        { text: "Swipe down from the top edge of your screen." },
        { text: "Press and hold the Wi-Fi icon for two seconds." },
        { text: "Tap your home Wi-Fi name in the list." },
        { text: "Type your Wi-Fi password and tap 'Connect'." }
      ],
      safety_notes: ["Avoid entering personal passwords when connected to free public Wi-Fi."]
    };
  }

  if (q.includes("alarm") || q.includes("clock") || q.includes("wake")) {
    return {
      intent: "HOW_TO_TASK",
      simple_answer: "Here is how you can set an alarm on your phone:",
      steps: [
        { text: "Open the 'Clock' app on your phone." },
        { text: "Tap the '+' plus sign to add a new alarm." },
        { text: "Scroll the numbers to choose the hour and minute (e.g. 8:00 AM)." },
        { text: "Tap 'Save' or 'Done' at the top right." }
      ],
      safety_notes: ["Make sure your phone volume is turned up so you can hear it."]
    };
  }

  if (q.includes("safe") || q.includes("scam") || q.includes("prize") || q.includes("won") || q.includes("link") || q.includes("otp") || q.includes("bank")) {
    return {
      intent: "SAFETY_CHECK",
      simple_answer: "Warning: Please be cautious. This message shows common signs of a scam.",
      steps: [
        { text: "Do not tap any links or phone numbers inside the message." },
        { text: "Never share any OTP, PIN, or password with anyone." },
        { text: "Ask a trusted family member to verify before doing anything." }
      ],
      safety_notes: ["Banks and government agencies will never ask for your passwords or OTP over SMS."]
    };
  }

  return {
    intent: "GENERAL_QUESTION",
    simple_answer: "I am Sahaara, your digital companion. I can help guide you through using your phone, apps, and the internet.",
    steps: [
      { text: "Tap on any of the suggested questions below to see how I help." },
      { text: "You can ask how to send photos, make text larger, or pay bills." },
      { text: "Use the Safety Check screen anytime you receive a suspicious message." }
    ],
    safety_notes: []
  };
}

async function callWithTimeout(promise: Promise<any>, timeoutMs: number) {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(getContextualFallback(""));
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "demo" || apiKey.trim().length === 0) {
      return NextResponse.json(getContextualFallback(query));
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are Sahaara, a trustworthy digital companion for senior citizens.
Your job is to help users complete everyday digital tasks.
First, determine the user's intent:
- GENERAL_QUESTION
- HOW_TO_TASK
- SAFETY_CHECK
- TRANSLATION
- SIMPLIFY
- DAILY_GUIDE
- FAMILY_HELP
- MEDICAL_GENERAL
- FINANCIAL_GENERAL

RULES:
1. Speak patiently and use very simple everyday language. No jargon.
2. Explain one concept at a time using short, clear sentences.
3. For HOW_TO_TASK: provide 3 to 5 clear, numbered step-by-step instructions.
4. Output the response EXACTLY matching the provided JSON schema.`;

    const candidateModels = [
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.7-flash"
    ];

    let textResponse: string | null = null;

    for (const model of candidateModels) {
      try {
        const generatePromise = ai.models.generateContent({
          model,
          contents: query,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                intent: { type: Type.STRING },
                simple_answer: { type: Type.STRING },
                short_answer: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { text: { type: Type.STRING } },
                    required: ["text"]
                  }
                },
                warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
                completion_message: { type: Type.STRING },
                risk_level: { type: Type.STRING },
                warning_signs: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommended_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                avoid_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                simple_explanation: { type: Type.STRING },
                what_this_means: { type: Type.STRING },
                what_user_should_do: { type: Type.STRING }
              },
              required: ["intent"]
            }
          }
        });

        // 4 second timeout per model attempt
        const response: any = await callWithTimeout(generatePromise, 4000);

        if (response?.text && response.text.trim().length > 0) {
          textResponse = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} timed out or failed: ${err.message}. Trying next...`);
      }
    }

    if (!textResponse) {
      return NextResponse.json(getContextualFallback(query));
    }

    let parsed: any;
    try {
      parsed = JSON.parse(textResponse);
    } catch {
      return NextResponse.json(getContextualFallback(query));
    }

    const normalized = {
      intent: parsed.intent || "GENERAL_QUESTION",
      simple_answer: "",
      steps: [] as { text: string }[],
      safety_notes: [] as string[]
    };

    switch (parsed.intent) {
      case "HOW_TO_TASK":
        normalized.simple_answer = parsed.short_answer || parsed.simple_answer || "Here is how you can do that:";
        normalized.steps = parsed.steps || [];
        normalized.safety_notes = parsed.warnings || [];
        if (parsed.completion_message && (!normalized.steps.length || normalized.steps[normalized.steps.length - 1].text !== parsed.completion_message)) {
          normalized.steps.push({ text: parsed.completion_message });
        }
        break;

      case "SAFETY_CHECK":
        normalized.simple_answer = `Safety Analysis: ${parsed.risk_level ? parsed.risk_level.toUpperCase() : 'CAUTION'}.`;
        if (parsed.warning_signs && parsed.warning_signs.length > 0) {
          normalized.simple_answer += ` Warning signs: ${parsed.warning_signs.join(", ")}.`;
        }
        if (parsed.recommended_actions && parsed.recommended_actions.length > 0) {
          normalized.steps = parsed.recommended_actions.map((act: string) => ({ text: act }));
        }
        normalized.safety_notes = parsed.avoid_actions || [];
        break;

      case "SIMPLIFY":
        normalized.simple_answer = parsed.simple_explanation || parsed.simple_answer || "Let me explain simply:";
        if (parsed.what_this_means) {
          normalized.steps.push({ text: `What this means: ${parsed.what_this_means}` });
        }
        if (parsed.what_user_should_do) {
          normalized.steps.push({ text: `What you should do: ${parsed.what_user_should_do}` });
        }
        break;

      default:
        normalized.simple_answer = parsed.simple_answer || parsed.short_answer || "Here is the information you requested:";
        normalized.steps = parsed.steps || [];
        normalized.safety_notes = parsed.warnings || parsed.safety_notes || [];
        break;
    }

    if (!normalized.simple_answer || normalized.simple_answer.trim().length === 0) {
      normalized.simple_answer = "Here are the steps to follow:";
    }

    if (!normalized.steps || normalized.steps.length === 0) {
      const fallback = getContextualFallback(query);
      normalized.steps = fallback.steps;
      if (!normalized.simple_answer) {
        normalized.simple_answer = fallback.simple_answer;
      }
    }

    return NextResponse.json(normalized);

  } catch (error: any) {
    console.error("General API Error:", error);
    return NextResponse.json(getContextualFallback(""));
  }
}
