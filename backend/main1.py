from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import app as auth_app
from disease_detection import app as disease_detection_app
from ecommerce import app as ecommerce_app
from utils import supabase, logger

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount sub-applications
app.mount("/auth", auth_app)
app.mount("/disease", disease_detection_app)
app.mount("/ecommerce", ecommerce_app)

@app.on_event("startup")
async def startup_event():
    try:
        buckets = supabase.storage.list_buckets()
        logger.info(f"Available buckets: {[b['id'] for b in buckets]}")
    except Exception as e:
        logger.error(f"Error listing buckets on startup: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)