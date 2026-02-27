import json
import os


class GuardianService:
    def __init__(self):
        file_path = 'app/dataset/guardian_card.txt'

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Could not find file at {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)

    def get_guardian_info_by_state(self, search_state: str):
        """
        Search for state info in the local JSON.
        Handles both "state" and "state_metadata" structures.
        """
        search_state = search_state.strip().lower()

        for entry in self.data:
            # Check for "state" key
            if 'state' in entry and entry['state'].lower() == search_state:
                return self._format_response(entry)

            # Check for "state_metadata" -> "name" key
            if 'state_metadata' in entry and entry['state_metadata']['name'].lower() == search_state:
                return self._format_response(entry)

        return None

    def _format_response(self, entry):
        """
        Standardizes the output so the Frontend always gets the same keys
        regardless of which JSON structure was used in the source.
        """
        # Extract Content (handles different naming in your JSON)
        content = entry.get('guardian_content') or entry.get('guardian_info')

        # Extract Metadata
        metadata = entry.get('state_metadata', {})
        state_name = metadata.get('name') or entry.get('state')

        # Extract Phrases (handles local_phrases vs useful_phrases)
        phrases = content.get('local_phrases') or content.get('useful_phrases')

        return {
            "state_name": state_name,
            "emergency_contacts": metadata.get('emergency_contacts') or content.get('tourist_essentials', {}).get('emergency_numbers'),
            "dos": content.get('dos', []),
            "donts": content.get('donts', []),
            "phrases": phrases,
            "critical_alerts": content.get('critical_alerts') or content.get('tourist_essentials', {}).get('common_scams')
        }
