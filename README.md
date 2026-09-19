# SAHAARA — Your Digital Companion

> **"Simple help for everyday digital life."**

Sahaara is an accessible, GenAI-powered digital companion built specifically for senior citizens (60+). It transforms everyday digital confusion into simple, calm, step-by-step guidance.

---

## 🌟 Key Features

- **Ask Sahaara**: Natural voice and text interface providing bite-sized, step-by-step guidance without confusing jargon.
- **Guided Step Mode**: Displays one large action at a time with progress tracking, text-to-speech, and back/forward controls.
- **Is this safe? (Scam Checker)**: Evaluates suspicious SMS or WhatsApp messages for urgency, prizes, or credential theft and provides clear safe/unsafe recommendations.
- **Today's Guide**: Personalized daily task checklist (morning, afternoon, evening) with persistent completion tracking.
- **Family Help**: Quick, simulated cards to call or message trusted family members for help.
- **Senior-Friendly Accessibility**:
  - High contrast mode (high-visibility black & yellow)
  - Scalable typography (Normal, Large, Extra Large)
  - Generous 52px+ touch targets and high-visibility focus indicators
  - Browser Speech Recognition & Speech Synthesis (Voice Read Aloud)
  - English & Hindi language support

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) & React
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom accessibility CSS custom properties
- **AI SDK**: Official Google GenAI SDK (`@google/genai`)
- **Speech**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Persistence**: `localStorage` for local state and user preferences

---

## 🚀 Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Visit `http://localhost:3000` to interact with Sahaara.
