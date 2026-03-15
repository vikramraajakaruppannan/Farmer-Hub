# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, user, misc, disease, marketplace, expert, buyer, investor, investor_properties, admin, farmer_properties
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="AgriTech API")

# CORRECTED: allow_origins (not allow_origitions)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Fixed typo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# No prefix
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(misc.router)
app.include_router(disease.router)
app.include_router(marketplace.router)
app.include_router(expert.router)
app.include_router(buyer.router)
app.include_router(investor.router)
app.include_router(investor_properties.router)
app.include_router(admin.router)
                
app.include_router(farmer_properties.router) 
@app.get("/")
def root():
    return {"message": "AgriTech API Running"}