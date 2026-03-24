# PolicyPilot: Apni Yojana, Apna Haq
> **Bridging the accessibility gap for 900+ Million rural citizens using Generative AI.**

[![Hackathon Ready](https://img.shields.io/badge/Hackathon-Winner_Ready-orange.svg)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-FastAPI_%7C_React_%7C_Gemini_1.5-blue.svg)](#)
[![PWA](https://img.shields.io/badge/Offline-PWA_Enabled-green.svg)](#)

---

## The "Last Mile" Problem
Every year, the Government of India allocates over **₹40 Lakh Crore** for welfare schemes. Yet, millions of eligible citizens in rural areas remain "invisible" to these benefits because:
1. **Language Barriers**: Official gazettes are often in complex bureaucratese.
2. **The "Search" Trap**: Existing portals require users to know the *name* of the scheme before they can find it.
3. **Paperwork Friction**: Even if found, filling out forms is a massive hurdle for the semi-literate.

## The PolicyPilot Solution
PolicyPilot is an AI-first, accessibility-driven platform designed for the **Common Service Centre (CSC)** operators and rural citizens. It transforms complex government data into actionable guidance through natural conversation.

### Key Features

*   **Multilingual Voice Interface**: Explain your situation in your native tongue (Hindi, Gujarati, Marathi, English).
*   **Aadhaar AI Extractor**: Upload a photo of your ID; Gemini Vision OCR auto-fills your profile in seconds.
*   **RAG Matching Engine**: Uses a Vector Database (ChromaDB) to perform semantic matching against official government documents—matching needs, not just keywords.
*   **Smart Fraud Detection**: Automatically flags profile/scheme discrepancies (e.g., income limits or state mismatches) to build trust and accuracy.
*   **Auto-filled Application Gen**: Generates a pre-filled, printable PDF application form instantly from user data.
*   **100% Offline Mode (PWA)**: Built for "Dead Zones." The app caches UI and stores critical scheme data locally via Service Workers.
*   **CSC Locator**: Automatically shows the nearest physical Common Service Centre on Google Maps for last-mile submission.

---

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion (for premium UI/UX).
- **Backend**: FastAPI (Python), SlowAPI (Rate Limiting), Pydantic (Strict Security).
- **AI/ML**: Google Gemini 1.5 Flash (for RAG & Vision), ChromaDB (Vector Search).
- **Offline**: Vite PWA Plugin (Service Workers).
- **Security**: Strict CORS, Security Headers, and Payload Validation.

---

## Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Create .env and add GEMINI_API_KEY=your_key
python ingest.py  # Initialize the Vector DB
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Cybersecurity & Production Readiness
Unlike basic wrappers, PolicyPilot is built with security as a priority:
- **Rate Limiting**: Protects against API exhaustion and DDOS.
- **Input Sanitization**: Strict Pydantic validators prevent Large Context injection attacks.
- **Data Privacy**: No user documents are permanently stored; only transiently processed for extraction.

---

## Impact
PolicyPilot democratizes access to welfare, ensuring that **Apna Haq** (Your Right) is no longer a privilege of the digital elite, but a reality for every Indian citizen.

---
*Built for the [IAR UDAAN HACKATHON] | 2026*
