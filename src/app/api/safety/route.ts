import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

function getFallbackSafety(message: string) {
  const m = message.toLowerCase();
  const isUrgent = m.includes("immediately") || m.includes("urgent") || m.includes("now") || m.includes("within 24");
  const hasPrize = m.includes("prize") || m.includes("won") || m.includes("lakh") || m.includes("crore") || m.includes("free");
  const asksMoney = m.includes("otp") || m.includes("pin") || m.includes("password") || m.includes("bank") || m.includes("transfer");

  const reasons = [];
  if (hasPrize) reasons.push("Offers an unexpected reward or prize");
  if (isUrgent) reasons.push("Uses urgent or threatening language to rush you");
  if (asksMoney) reasons.push("Mentions confidential details like OTP, PIN, or money");
  if (reasons.length === 0) reasons.push("Unverified sender or unfamiliar links");

  return {
    risk_level: (hasPrize || asksMoney || isUrgent) ? "high" : "caution",
    reasons,
    safe_actions: [
      "Ask a trusted family member before taking any action.",
      "Call your official bank or service provider using the number on your physical card or paper bill."
    ],
    unsafe_actions: [
      "Never share OTP, PIN, or banking passwords.",
      "Do not tap any links or download any files attached to this message.",
      "Do not send money to unverified accounts."
    ]
  };
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "demo" || apiKey.trim().length === 0) {
      return NextResponse.json(getFallbackSafety(message));
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a scam-detection assistant for senior citizens.
Analyze the provided text message or email for common scam indicators (urgency, prizes, OTP requests, unknown links, threats).
IMPORTANT RULES:
1. Do not claim 100% certainty. Say things like "Warning signs present".
2. Keep the reasons simple, clear, and reassuring.
3. Be overly cautious. If in doubt, flag it as 'caution'.
4. Output EXACTLY matching the JSON schema provided.`;

    const candidateModels = [
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.8-flash"
    ];

    let textResponse = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                risk_level: { type: Type.STRING, description: "Must be 'low', 'caution', or 'high'" },
                reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                safe_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                unsafe_actions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["risk_level", "reasons", "safe_actions", "unsafe_actions"]
            }
          }
        });

        if (response.text && response.text.trim().length > 0) {
          textResponse = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Safety model ${model} failed: ${err.message?.slice(0, 60)}`);
      }
    }

    if (!textResponse) {
      return NextResponse.json(getFallbackSafety(message));
    }

    const parsed = JSON.parse(textResponse);
    if (!["low", "caution", "high"].includes(parsed.risk_level)) {
      parsed.risk_level = "caution";
    }

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("Gemini Safety API Error:", error);
    return NextResponse.json(getFallbackSafety(""));
  }
}
