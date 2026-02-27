from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.itinerary_router import router as itinerary_router
from app.routers import place_analysis_router
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
