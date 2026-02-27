import json
from app.config.gemini_config import model 

def generate_safe_itinerary(city, days, people, style, start_date, budget, crime_data):
    """
    Args:
        city (str): Destination city
        days (int): Number of days
        people (int): Number of travelers
        style (str): Travel style (e.g., Adventure, Family, Solo)
        start_date (str): Starting date
        budget (str): Budget level (Budget, Mid-Range, Luxury)
        crime_data (dict/str): The filtered data from your Crime Dataset
    """

    # 1. Structure the Crime Data into a clear string for the AI
    crime_context = f"Safety Report for {city}: {json.dumps(crime_data)}"

    # 2. Build the detailed Prompt
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
        # response.text contains the raw JSON string
        itinerary_data = json.loads(response.text)
        
        return itinerary_data

    except Exception as e:
        print(f"Error generating itinerary: {e}")
        return {"error": "Failed to generate itinerary. Please check API keys or Crime Data format."}


#mock_crime_data = {"top_crimes": "Pickpocketing", "risky_areas": "Central Station at night", "safety_index": 65}
#result = generate_safe_itinerary("Paris", 3, 2, "Solo Traveler", "2024-12-01", "Budget", mock_crime_data)
#print(result)