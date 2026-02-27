import json
import re
from app.config.gemini_config import model


class ItineraryService:
    async def process_request(self, data: dict):
        """
        Orchestrates the workflow: Logs the request, fetches context, 
        and triggers the safe itinerary generation.
        """
        print(f"Workflow Triggered: Generating {data['duration_days']} day trip for {data['city']}")

        # 1. Provide Context (Mocked for now, integrate your dataset here)
        mock_crime_data = {
            "top_crimes": "Pickpocketing, Tourist Scams",
            "risky_areas": "Sectors with poorly lit alleyways at night",
            "safety_index": 70
        }

        # 2. Trigger the generation
        itinerary = await self.generate_safe_itinerary(
            city=data['city'],
            days=data['duration_days'],
            people=data['num_people'],
            style=data['travel_style'],
            start_date=data['start_date'],
            budget=data['budget_level'],
            crime_data=mock_crime_data
        )

        return {
            "status": "success",
            "message": f"Safe itinerary for {data['city']} generated.",
            "data": itinerary
        }

    async def generate_safe_itinerary(self, city, days, people, style, start_date, budget, crime_data):
        """
        Core logic to communicate with Gemini and enforce safety constraints.
        """
        # Structure the context
        crime_context = f"Safety Report for {city}: {json.dumps(crime_data)}"

        # Build the Prompt
        prompt = f"""
        Create a highly personalized and SAFE travel itinerary for {city}.

        USER PROFILE:
        - Group Size: {people} people
        - Duration: {days} days
        - Travel Style: {style}
        - Start Date: {start_date}
        - Budget: {budget}

        SAFETY CONTEXT (Extracted from Dataset):
        {crime_context}

        STRICT INSTRUCTIONS:
        1. Cross-reference every location with the Safety Report.
        2. If an area has high crime rates, avoid it or schedule it only during the safest hours.
        3. Include Latitude and Longitude for every suggested stop.
        4. Provide a 'Safety Rationale' for every activity.
        5. Suggest the safest neighborhood for accommodation.

        RESPONSE STRUCTURE (Must be valid JSON):
        {{
            "trip_summary": "string",
            "recommended_safe_neighborhood_for_stay": "string",
            "overall_safety_score": 1-10,
            "daily_itinerary": [
                {{
                    "day": 1,
                    "activities": [
                        {{
                            "time": "HH:MM",
                            "place_name": "string",
                            "latitude": float,
                            "longitude": float,
                            "description": "string",
                            "safety_rationale": "string",
                            "estimated_cost": "string"
                        }}
                    ]
                }}
            ],
            "emergency_info": {{
                "nearest_hospital_area": "string",
                "emergency_numbers": "string"
            }}
        }}
        """

        try:
            # Call Gemini
            # If the SDK version is synchronous, it's fine as is; if it supports async, await it.
            response = model.generate_content(prompt)
            
            # Clean up Markdown formatting (```json ... ```) if Gemini adds it
            clean_text = self._clean_json_response(response.text)
            itinerary_data = json.loads(clean_text)

            return itinerary_data

        except Exception as e:
            print(f"Error generating itinerary: {e}")
            return {"error": "Failed to generate itinerary. Please check API keys or Crime Data format."}

    def _clean_json_response(self, text: str) -> str:
        """
        Removes Markdown code blocks and extra whitespace to ensure json.loads works.
        """
        # Remove ```json and ```
        text = re.sub(r'```json\s*|\s*```', '', text)
        return text.strip()
