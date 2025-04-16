from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import FastAPI apps from modules
try:
    from login import app as login_app
except ImportError as e:
    logger.error(f"Failed to import login_app: {str(e)}")
    raise

try:
    from dashboard import app as dashboard_app
except ImportError as e:
    logger.error(f"Failed to import dashboard_app: {str(e)}")
    raise

try:
    from profile import app as profile_app
except ImportError as e:
    logger.error(f"Failed to import profile_app: {str(e)}")
    raise

try:
    from part1 import app as module1_app
except ImportError as e:
    logger.error(f"Failed to import module1_app: {str(e)}")
    raise

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount sub-applications
app.mount("/auth", login_app)
app.mount("/dashboard", dashboard_app)
app.mount("/profile", profile_app)
app.mount("/disease", module1_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)