from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.itinerary_router import router as itinerary_router
from app.routers import place_analysis_router
from app.routers.review_router import router as review_router
from app.routers.guardian_router import router as guardian_router
from app.routers.crime_analysis_router import router as crime_router
from app.routers.translator_router import router as translator_router
from app.routers.tts_router import router as tts_router
from app.routers.transport_router import router as transport_router
from app.routers.places_router import router as places_router
from app.routers.nearby_router import router as nearby_router
import uvicorn


app = FastAPI(
    title="Trevia: Safety-First Travel AI",
    description="Backend API for generating safe travel itineraries and real-time risk analytics.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the Itinerary Router
app.include_router(itinerary_router)

# Include the Place Analysis Router
app.include_router(place_analysis_router.router)

# Include the Review Router
app.include_router(review_router)

# Include the Guardian Router
app.include_router(guardian_router)

# Include the Crime Analysis Router
app.include_router(crime_router)

# Include the Translator Router
app.include_router(translator_router)

# Include the Text-to-Speech Router
app.include_router(tts_router)

# Include the Transport Router
app.include_router(transport_router)

# Include the Places Autocomplete Router
app.include_router(places_router)

# Include the Nearby Emergency Services Router
app.include_router(nearby_router)


@app.get("/", tags=["Health Check"])
async def root():
    """
    Root endpoint to verify the server is running.
    """
    return {
        "project": "Trevia",
        "status": "Online",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    # Run the server on localhost:8000
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
