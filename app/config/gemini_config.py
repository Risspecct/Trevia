import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# 1. Configuration Constants
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.0-flash"              # 'flash' is faster for hackathons

# 2. API Setup
genai.configure(api_key=GEMINI_API_KEY)

# 3. Model Parameters (Generation Config)
generation_config = {
    "temperature": 0.2,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json", # Forces JSON output for frontend ease
}

# 4. Safety Settings (Optional but recommended to prevent blocking)
# Set to 'BLOCK_NONE' or 'BLOCK_ONLY_HIGH' so the AI doesn't refuse to talk about crime data
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
]

# 5. Initialize the Model instance
model = genai.GenerativeModel(
    model_name=MODEL_NAME,
    generation_config=generation_config,
    safety_settings=safety_settings,
    system_instruction="You are a Trevia AI. Analyze crime data and reviews to provide safe itineraries and local advice in structured JSON."
)