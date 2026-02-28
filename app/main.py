from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
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
import time
from app.core.logger import setup_logger

logger = setup_logger()

app = FastAPI(
    title="Trevia: Safety-First Travel AI",
    description="Backend API for generating safe travel itineraries and real-time risk analytics.",
    version="1.0.0"
)

logger.info("Trevia backend starting...")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    logger.info(f"Incoming request: {request.method} {request.url}")

    try:
        response = await call_next(request)
        duration = round((time.time() - start_time) * 1000, 2)

        logger.info(
            f"Completed {request.method} {request.url} "
            f"Status: {response.status_code} "
            f"Duration: {duration}ms"
        )

        return response

    except Exception as e:
        logger.exception(f"Unhandled error during request: {str(e)}")
        raise


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception at {request.url}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
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
