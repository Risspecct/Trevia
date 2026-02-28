# 🗺️ TREVIA – Premium Tourism Intelligence Platform

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react\&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite\&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript\&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?logo=tailwind-css\&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi\&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python\&logoColor=white)
![Google Gemini](https://img.shields.io/badge/AI-Gemini_2.0_Flash-4285F4?logo=google\&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

TREVIA is an advanced, AI-powered **Tourism Intelligence Platform** designed to provide real-time safety analytics, intelligent travel itineraries, and location-specific guardian insights.

Built for modern travelers, it combines deep data analysis with generative AI to ensure every journey is safe, informed, and culturally enriched.

🔗 **Live Application:** [https://trevia-zeta.vercel.app](https://trevia-zeta.vercel.app)

---

## 🌟 Core Features

### 🛡️ Crime Analysis Engine

* Real-time visualization of incident hotspots
* 6-month crime trend analytics
* Regional dataset-driven risk assessment before travel

### 🤖 AI-Powered Itinerary Generator

* Personalized travel plans
* Safety-aware routing using local crime insights
* Powered by Gemini 2.0 Flash

### 🎴 State Guardian Cards

* Safety “Do’s & Don’ts”
* Emergency contacts
* Local cultural intelligence for Indian states

### 📊 Review Intelligence

* Sentiment analysis of Google Maps reviews
* Extracts objective “Best” and “Worst” user experiences
* Landmark-level intelligence insights

### 🗣️ Real-Time Translation & TTS

* Multi-language translation
* Text-To-Speech for instant communication bridging

### 🚗 Transport Route Intelligence

* Real-time comparison:

  * Driving
  * Transit
  * Walking
  * Cycling
* Deep-link integration with ride-sharing services (Uber/Ola)

---

## 🛠 Technology Stack

### Frontend

* **Framework:** React 18 with Vite
* **Styling:** Tailwind CSS, Shadcn-UI
* **Animations:** Framer Motion
* **Visualization:** Leaflet (OpenStreetMap), Recharts
* **Language:** TypeScript

### Backend

* **Framework:** FastAPI (Python 3.11)
* **AI Orchestration:** Google Generative AI (Gemini 2.0 Flash API)
* **Data Science:** Pandas, VADER Sentiment Analysis
* **Third-Party APIs:**

  * SerpAPI (Google Maps Intelligence)
  * Google Cloud Translation
  * Google Cloud Text-To-Speech

---

## 📁 Project Structure

```bash
Trevia/
├── app/                        # FastAPI Backend logic
│   ├── config/                 # Gemini & AI engine settings
│   ├── dataset/                # Regional Crime CSVs & Guardian text data
│   ├── models/                 # Pydantic Schemas for data validation
│   ├── routers/                # Modular API Endpoints (Itinerary, Transport, etc.)
│   └── services/               # Core business logic & AI integration layers
├── frontend/                   # React + TypeScript Web App
│   ├── src/
│   │   ├── components/         # Reusable UI (Bento Grids, Interactive Maps)
│   │   ├── pages/              # Module-specific views (Dashboard, Planner)
│   │   └── test/               # Vitest unit testing suite
└── city_pairs.json             # Pre-mapped route intelligence data
```

---

## ⚙️ Local Development Setup

### 1️⃣ Backend Setup

```bash
cd Trevia
pip install -r requirements.txt
```

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_key_here
SERP_API_KEY=your_key_here
```

Run the backend server:

```bash
uvicorn app.main:app --reload
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:

```
http://localhost:8080/
```

---

## 🎯 Hackathon Highlights

* ✅ Safety-Centric UX: Risk analysis integrated into the planning workflow
* ⚡ Edge Intelligence: Gemini 2.0 Flash for ultra-low latency AI reasoning
* 🌍 Cultural Context: Guardian Card system for respectful and informed travel

---

## 🚀 Vision

TREVIA redefines travel planning by merging:

* Preventive intelligence
* AI reasoning
* Cultural awareness
* Real-time analytics

Unlike traditional travel platforms, TREVIA prioritizes **informed safety over passive discovery**.
