from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import random
import string
import smtplib
from email.mime.text import MIMEText
import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_TIMEOUT = 15

otp_codes: dict = {}

class LoginOtpRequest(BaseModel):
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

class LoginResponse(BaseModel):
    session_id: str
    first_name: str
    last_name: str
    email: str
    profile_complete: bool

class WantedProduct(BaseModel):
    product_name: str
    category: str
    quantity: float
    unit: str
    notes: Optional[str] = None

class WantedProductResponse(BaseModel):
    id: str
    product_name: str
    category: str
    quantity: float
    unit: str
    notes: Optional[str] = None
    created_at: str
    updated_at: str

def send_otp_email(email: str, code: str) -> bool:
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured, falling back to console")
        print(f"OTP for {email}: {code}")
        return False

    try:
        msg = MIMEText(f"Your AgriTech login OTP is: {code}\n\nThis code expires in 10 minutes.")
        msg['Subject'] = "AgriTech Login OTP"
        msg['From'] = SMTP_USER
        msg['To'] = email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=SMTP_TIMEOUT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Successfully sent OTP to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP to {email}: {str(e)}")
        print(f"OTP for {email}: {code}")
        return False

async def get_current_session(x_session_id: Optional[str] = Header(None)):
    if not x_session_id:
        raise HTTPException(status_code=401, detail="Missing session ID")
    
    session = supabase.table("sessions").select("*").eq("session_id", x_session_id).single().execute()
    if not session.data:
        raise HTTPException(status_code=401, detail="Invalid session ID")
    
    if datetime.fromisoformat(session.data["expires_at"]) < datetime.utcnow():
        supabase.table("sessions").delete().eq("session_id", x_session_id).execute()
        raise HTTPException(status_code=401, detail="Session expired")
    
    return session.data

@app.on_event("startup")
async def startup_event():
    try:
        supabase.table("sessions").delete().lt("expires_at", datetime.utcnow().isoformat()).execute()
        logger.info("Cleaned up expired sessions")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")

@app.post("/login-otp")
async def login_otp(request: LoginOtpRequest):
    try:
        users = supabase.auth.admin.list_users()
        user = next((u for u in users if u.email == request.email), None)
        if not user:
            logger.warning(f"Email not found: {request.email}")
            raise HTTPException(status_code=404, detail="Email not found")

        profile = supabase.table("profiles").select("category").eq("id", user.id).single().execute()
        if not profile.data or profile.data["category"] != "Investor":
            logger.warning(f"User {request.email} is not an Investor")
            raise HTTPException(status_code=403, detail="Only Investors can use OTP login")

        code = ''.join(random.choices(string.digits, k=6))
        otp_codes[request.email] = code

        email_sent = send_otp_email(request.email, code)
        logger.info(f"OTP request processed for {request.email}, email sent: {email_sent}")
        return {
            "message": "OTP sent to your email" if email_sent else "OTP generated (check console)"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"OTP login error for {request.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing OTP request")

@app.post("/verify-otp", response_model=LoginResponse)
async def verify_otp(request: VerifyOtpRequest):
    try:
        # Validate OTP
        stored_code = otp_codes.get(request.email)
        if not stored_code or stored_code != request.otp:
            logger.warning(f"Invalid or expired OTP for {request.email}")
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        # Fetch users from Supabase
        try:
            users_response = supabase.auth.admin.list_users()
            logger.info(f"Fetched {len(users_response)} users from Supabase")
            user = next((u for u in users_response if u.email == request.email), None)
            if not user:
                logger.error(f"User not found for email: {request.email}")
                raise HTTPException(status_code=404, detail="User not found")
        except Exception as e:
            logger.error(f"Failed to list users from Supabase: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

        # Fetch user profile
        try:
            profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
            if not profile.data:
                logger.error(f"Profile not found for user ID {user.id}")
                raise HTTPException(status_code=404, detail="User profile not found")
            profile_data = profile.data
        except Exception as e:
            logger.error(f"Failed to fetch profile for user ID {user.id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")

        # Validate profile fields
        required_fields = ["first_name", "last_name", "email", "location"]
        missing_fields = [field for field in required_fields if field not in profile_data or profile_data[field] is None]
        if missing_fields:
            logger.warning(f"Profile for {request.email} missing fields: {missing_fields}")
            # Allow partial profiles, set defaults
            profile_data = {
                "first_name": profile_data.get("first_name", ""),
                "last_name": profile_data.get("last_name", ""),
                "email": profile_data.get("email", request.email),
                "location": profile_data.get("location", "")
            }

        # Create session
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "user_id": user.id,
            "email": request.email,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
        try:
            supabase.table("sessions").insert(session_data).execute()
            logger.info(f"Session created for {request.email}, session ID: {session_id}")
        except Exception as e:
            logger.error(f"Failed to create session for {request.email}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

        # Clear OTP
        if request.email in otp_codes:
            del otp_codes[request.email]

        # Return response
        return LoginResponse(
            session_id=session_id,
            first_name=profile_data["first_name"],
            last_name=profile_data["last_name"],
            email=profile_data["email"],
            profile_complete=bool(profile_data["first_name"] and profile_data["last_name"] and profile_data["location"])
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"OTP verification error for {request.email}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error verifying OTP: {str(e)}")

@app.post("/wanted-products", response_model=WantedProductResponse)
async def add_wanted_product(product: WantedProduct, session: dict = Depends(get_current_session)):
    try:
        if product.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        if len(product.product_name) > 100:
            raise HTTPException(status_code=400, detail="Product name must be under 100 characters")
        if product.notes and len(product.notes) > 500:
            raise HTTPException(status_code=400, detail="Notes must be under 500 characters")
        valid_categories = ["Seeds", "Fertilizers", "Pesticides", "Tools", "Crops"]
        valid_units = ["kg", "g", "L", "pcs"]
        if product.category not in valid_categories:
            raise HTTPException(status_code=400, detail="Invalid category")
        if product.unit not in valid_units:
            raise HTTPException(status_code=400, detail="Invalid unit")

        product_data = {
            "id": str(uuid.uuid4()),
            "user_id": session["user_id"],
            "product_name": product.product_name,
            "category": product.category,
            "quantity": product.quantity,
            "unit": product.unit,
            "notes": product.notes,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        response = supabase.table("user_wanted_products").insert(product_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to add wanted product")

        logger.info(f"Wanted product added by {session['email']}: {product_data['product_name']}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error adding wanted product for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error adding wanted product")

@app.get("/wanted-products", response_model=List[WantedProductResponse])
async def get_wanted_products(session: dict = Depends(get_current_session)):
    try:
        response = supabase.table("user_wanted_products").select("*").eq("user_id", session["user_id"]).execute()
        logger.info(f"Fetched {len(response.data)} wanted products for {session['email']}")
        return response.data
    except Exception as e:
        logger.error(f"Error fetching wanted products for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching wanted products")

@app.delete("/wanted-products/{product_id}")
async def delete_wanted_product(product_id: str, session: dict = Depends(get_current_session)):
    try:
        try:
            uuid.UUID(product_id)
        except ValueError:
            logger.error(f"Invalid product_id format: {product_id}")
            raise HTTPException(status_code=400, detail="Invalid product ID format")

        response = supabase.table("user_wanted_products").delete().eq("id", product_id).eq("user_id", session["user_id"]).execute()
        if not response.data:
            logger.error(f"Wanted product not found: {product_id}")
            raise HTTPException(status_code=404, detail="Wanted product not found")

        logger.info(f"Wanted product {product_id} deleted by {session['email']}")
        return {"message": "Wanted product deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting wanted product {product_id} for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting wanted product")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)