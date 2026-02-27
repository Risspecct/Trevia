import os
from dotenv import load_dotenv
from google.cloud import texttospeech
from google.oauth2 import service_account


class GoogleTextToSpeech:
    def __init__(self):
        load_dotenv()

        credentials_path = os.getenv("GCP_SERVICE_ACCOUNT_JSON")

        if not credentials_path:
            raise ValueError("GCP_SERVICE_ACCOUNT_JSON not set in .env")

        if not os.path.exists(credentials_path):
            raise FileNotFoundError(f"Credentials file not found at: {credentials_path}")

        credentials = service_account.Credentials.from_service_account_file(
            credentials_path
        )

        self.client = texttospeech.TextToSpeechClient(credentials=credentials)

        # Ensure audio folder exists
        os.makedirs("audio", exist_ok=True)

    def generate_audio(self, text: str, language_code: str = "en-US"):
        if not text.strip():
            raise ValueError("Text cannot be empty")

        synthesis_input = texttospeech.SynthesisInput(text=text)

        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        output_path = "audio/output.mp3"

        with open(output_path, "wb") as f:
            f.write(response.audio_content)

        return output_path


if __name__ == "__main__":
    try:
        tts = GoogleTextToSpeech()

        # English
        file_path = tts.generate_audio(
            "Hello, welcome to Trevia! Enjoy your trip.",
            language_code="en-US"
        )

        print("✅ Audio saved at:", file_path)

        # Hindi example
        tts.generate_audio("नमस्ते, ट्रेविया में आपका स्वागत है!", "hi-IN")

    except Exception as e:
        print("❌ Error:", e)
