import os
from dotenv import load_dotenv
from google.cloud import translate_v2 as translate
from google.oauth2 import service_account


class GoogleTranslator:
    def __init__(self):
        load_dotenv()

        credentials_path = os.getenv("GCP_SERVICE_ACCOUNT_JSON")

        if not credentials_path:
            raise ValueError("GCP_SERVICE_ACCOUNT_JSON not set in .env")

        if not os.path.exists(credentials_path):
            raise FileNotFoundError(f"Credentials file not found at: {credentials_path}")

        # Load credentials
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path
        )

        # Create translate client
        self.client = translate.Client(credentials=credentials)

    def translate_text(self, text: str, target_language: str = "en"):
        if not text.strip():
            raise ValueError("Text cannot be empty")

        result = self.client.translate(
            text,
            target_language=target_language
        )

        return {
            "original_text": text,
            "translated_text": result["translatedText"],
            "detected_source_language": result["detectedSourceLanguage"],
            "target_language": target_language
        }


# -------------------------
# Run Directly
# -------------------------
if __name__ == "__main__":
    try:
        translator = GoogleTranslator()

        # Example 1: Hindi → English
        result = translator.translate_text(
            "नमस्ते, ट्रेविया में आपका स्वागत है!",
            target_language="en"
        )

        print("✅ Translation Result:")
        print(result)

        # Example 2: English → French
        result2 = translator.translate_text(
            "Welcome to Trevia!",
            target_language="fr"
        )

        print("\n✅ Translation Result 2:")
        print(result2)

    except Exception as e:
        print("❌ Error:", e)
