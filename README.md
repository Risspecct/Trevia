# TREVIA - Premium Tourism Intelligence Platform

**TREVIA** is an advanced, AI-powered Tourism Intelligence Platform designed to provide real-time safety analytics, intelligent travel itineraries, and location-specific guardian insights. Built with a modern, responsive UI and a robust Python backend, TREVIA ensures travelers make informed, data-driven decisions.

---

## Core Features

- **Crime Analysis Engine:** Real-time visualization of incident hotspots, 6-month crime trends, and time-of-day risk heatmaps.
- **AI-Powered Itinerary Generator:** Creates personalized, safety-aware travel plans based on local crime data and user preferences.
- **State Guardian Cards:** Delivers essential safety "Do's & Don'ts", emergency contacts, and critical local alerts tailored to specific states.
- **Smart Place Analysis:** Evaluates specific locations by cross-referencing local crime data to provide pros, cons, and safety warnings.
- **Review Intelligence:** Analyzes Google Maps reviews using Sentiment Analysis to extract the most accurate "Best" and "Worst" experiences.
- **Real-Time Translation & TTS:** Built-in multi-language translation and Text-To-Speech (TTS) to bridge communication gaps for tourists.

---

## App Flow (Summarised)

1. **User Input & Parameters:** The user inputs their destination, travel duration, budget, and group style into the React frontend via the interactive Dashboard suite.
2. **Data Aggregation (Backend):** The FastAPI backend intercepts the requests and queries regional safety parameters from the local `crime.csv` dataset, Google Maps review sentiment via SerpAPI, and localized cultural parameters from `guardian_card.txt`.
3. **AI Synthesization (Gemini):** This highly contextualized data is fed directly into Google Gemini Flash. The AI synthesizes personalized, dynamically safe itineraries, analyzing and routing tourists away from high-risk hotspot areas.
4. **Interactive Visualization:** The React frontend dynamically renders structured intelligence. Incident hotspots are plotted onto interactive radar map components, and crime trend tracking is visualized seamlessly using Recharts.
5. **Real-time Accessibility:** Users interact with the localized Guardian modules to quickly access local phrases and play back AI voice translations utilizing Google Cloud TTS and Translation capabilities.

---

## Architecture & Technology Stack

TREVIA is built on a decoupled architecture featuring a seamless React frontend and a FastAPI backend.

### Frontend
- **Framework:** React 18, Vite
- **Styling:** Tailwind CSS, Shadcn-UI, Framer Motion, GSAP
- **Data Visualization:** Recharts, custom SVG nodes
- **Routing:** React Router v6
- **Language:** TypeScript

### Backend
- **Framework:** FastAPI (Python 3.11)
- **AI Integration:** Google Generative AI (Gemini 2.0 Flash)
- **Data Processing:** Pandas 
- **Sentiment Analysis:** VADER Sentiment (vaderSentiment)
- **External Services:** SerpAPI (Google Maps Reviews), Google Cloud Translation API, Google Cloud Text-To-Speech API

---

## 📁 Repository Structure

```text
risspecct-trevia/
├── app/                        # FastAPI Backend Application
│   ├── config/                 # AI & Environment Configurations
│   ├── core/                   # Core utilities (Logging)
│   ├── dataset/                # Local data files (crime.csv, guardian_card.txt)
│   ├── models/                 # Pydantic validation models
│   ├── routers/                # API Endpoints (Crime, Itinerary, Guardian, etc.)
│   └── services/               # Business logic & AI integrations
├── frontend/                   # React Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI components & Layouts (Dock, Bento)
│   │   ├── components/ui/      # Shadcn-UI design system components
│   │   ├── data/               # Mock data and constants
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   └── pages/              # Application views (Dashboard, CrimeAnalysis, etc.)
│   └── vite.config.ts          # Vite bundler configuration
├── requirements.txt            # Python dependencies
└── Dockerfile                  # Containerization setup
```

---

##  Local Development Setup

### 1. Backend Setup

Ensure you have Python 3.11+ installed.

```bash
# Navigate to the root folder
cd risspecct-trevia

# Install required Python packages
pip install -r requirements.txt

# Create a .env file based on the example
cp .env.example .env

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Note: Make sure to fill in your API keys in the `.env` file for Gemini, SerpAPI, and GCP services.*

### 2. Frontend Setup

Ensure you have Node.js and npm installed.

```bash
# Navigate to the frontend folder
cd risspecct-trevia/frontend

# Install node modules
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at `https://trevia-zeta.vercel.app/` (or as specified by Vite), and the API documentation (Swagger) will be accessible at `https://trevia-hrnw.onrender.com/`.

---

##  Docker Deployment

TREVIA includes a multi-stage Dockerfile for optimized backend deployment.

```bash
# Build the Docker image
docker build -t trevia-backend .

# Run the container
docker run -p 8000:8000 --env-file .env trevia-backend
```




Copyright © 2026 TREVIA. All rights reserved. 
Data generated by the AI models is for analytical and educational purposes. Always verify critical safety information with local authorities.
