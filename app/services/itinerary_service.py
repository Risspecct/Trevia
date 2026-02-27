import json
import re
import pandas as pd
from app.config.gemini_config import model


class ItineraryService:
    
    # Load crime dataset once at module startup
    crime_df = pd.read_csv('app/dataset/crime.csv')

    def get_crime_data_for_location(self, district, state):
        """
        Filter crime data by district and state.
        
        Args:
            district (str): District/City name (e.g., 'Lucknow')
            state (str): State name (e.g., 'Uttar Pradesh')
        
        Returns:
            list: Filtered crime records as dicts, or empty list if no match
        """
        filtered = self.crime_df[
            (self.crime_df['District'].str.lower() == district.lower()) & 
            (self.crime_df['State'].str.lower() == state.lower())
        ]
        
        if filtered.empty:
            return []
        
        # Convert to list of dicts and include summary stats
        records = filtered.to_dict('records')
        
        # Calculate summary for the AI
        summary = {
            "location": f"{district}, {state}",
            "years_covered": sorted(filtered['Year'].unique().tolist()),
            "crime_types": filtered['Crime_Type'].unique().tolist(),
            "avg_crime_rate_per_100k": round(filtered['Crime_Rate_per_100k'].mean(), 2),
            "detailed_records": records
        }
        
        return summary
    def generate_safe_itinerary(self, city, state, days, people, style, start_date, budget):
        """
        Args:
            city (str): Destination city/district
            state (str): State name
            days (int): Number of days
            people (int): Number of travelers
            style (str): Travel style (e.g., Adventure, Family, Solo)
            start_date (str): Starting date
            budget (str): Budget level (Budget, Mid-Range, Luxury)
        """

        # 1. Fetch and structure the Crime Data
        crime_data = self.get_crime_data_for_location(city, state)
        
        if not crime_data:
            return {"error": f"No crime data found for {city}, {state}. Please check the spelling."}
        
        crime_context = f"Safety Report for {city}, {state}:\n{json.dumps(crime_data, indent=2)}"

        # 2. Build the detailed Prompt
        prompt = f"""
        Create a highly personalized and SAFE travel itinerary for {city}, {state}.
        
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
        4. Provide a 'Safety Rationale' for every activity (Explain why it is safe for this specific group).
        5. Suggest the safest neighborhood for accommodation.

        RESPONSE STRUCTURE (Must be valid JSON):
        {{
            "trip_summary": "Short overview of the trip's safety strategy",
            "recommended_safe_neighborhood_for_stay": "Name",
            "overall_safety_score": 1-10,
            "daily_itinerary": [
                {{
                    "day": 1,
                    "activities": [
                        {{
                            "time": "HH:MM",
                            "place_name": "Name",
                            "latitude": float,
                            "longitude": float,
                            "description": "What to do",
                            "safety_rationale": "Why this place was chosen based on crime data",
                            "estimated_cost": "amount in local currency"
                        }}
                    ]
                }}
            ],
            "emergency_info": {{
                "nearest_hospital_area": "Name",
                "emergency_numbers": "Local police/medical"
            }}
        }}
        """

        try:
            # 3. Call Gemini
            response = model.generate_content(prompt)
            
            # 4. Extract and Parse the JSON
            itinerary_data = json.loads(response.text)
            
            return itinerary_data

        except Exception as e:
            print(f"Error generating itinerary: {e}")
            return {"error": "Failed to generate itinerary. Please check API keys or Crime Data format."}


if __name__ == "__main__":
    service = ItineraryService()
    result = service.generate_safe_itinerary("Lucknow", "Uttar Pradesh", 3, 2, "Solo Traveler", "2024-12-01", "Budget")
    print(result)