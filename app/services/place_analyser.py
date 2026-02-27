import json
import pandas as pd
from app.config.gemini_config import model


class PlaceAnalysisService:

    # Load crime dataset once
    crime_df = pd.read_csv('app/dataset/crime.csv')

    def get_crime_context(self, city, state):
        """Internal helper to get crime data from CSV"""
        filtered = self.crime_df[
            (self.crime_df['District'].str.lower() == city.lower()) & (self.crime_df['State'].str.lower() == state.lower())
        ]

        if filtered.empty:
            return "No specific crime records found for this district. Advise general caution."

        # Create a summary string for the AI to process
        avg_rate = round(filtered['Crime_Rate_per_100k'].mean(), 2)
        crime_types = filtered['Crime_Type'].unique().tolist()

        return f"Crime Stats for {city}: Average rate of {avg_rate} per 100k. Common reported issues: {', '.join(crime_types[:5])}."

    def generate_place_summary(self, place_name, city, state):
        """
        Feature: Quick Analysis of a specific place.
        Input: Name of the place (e.g., 'Bara Imambara'), City, and State.
        """

        # 1. Fetch crime data context
        crime_context = self.get_crime_context(city, state)

        # 2. Construct the prompt for Quick Analysis
        prompt = f"""
        Analyze the following place: "{place_name}" located in {city}, {state}.

        CRIME DATA FOR {city}:
        {crime_context}

        INSTRUCTIONS:
        1. Provide a detailed summary of what the place is.
        2. List 3-4 Pros (Why people visit).
        3. List 3-4 Cons (Crowds, costs, or hygiene).
        4. Provide a 'Safety Alert' section specifically based on the provided crime context and the nature of the place (e.g., if it's a crowded market, mention pickpocketing).
        5. Include 'Important Information' such as best time to visit and any entry requirements.

        RESPONSE STRUCTURE (Must be valid JSON):
        {{
            "place_name": "{place_name}",
            "summary": "Full description of the place",
            "pros": ["pro1", "pro2", "pro3"],
            "cons": ["con1", "con2", "con3"],
            "safety_details": {{
                "risk_level": "Low/Medium/High",
                "crime_context": "How the city's crime affects this specific spot",
                "safety_tips": ["tip1", "tip2"]
            }},
            "important_info": {{
                "best_time": "...",
                "needs_to_know": ["point1", "point2"]
            }}
        }}
        """

        try:
            # 3. Call Gemini
            response = model.generate_content(prompt)

            # 4. Parse and return the JSON
            analysis_data = json.loads(response.text)
            return analysis_data

        except Exception as e:
            return {
                "error": "Failed to analyze the place.",
                "details": str(e)
            }


# --- Example Usage ---
if __name__ == "__main__":
    service = PlaceAnalysisService()
    result = service.generate_place_summary("Bara Imambara", "Lucknow", "Uttar Pradesh")
    print(json.dumps(result, indent=4))
