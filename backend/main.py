from fastapi import FastAPI, HTTPException, Depends, Header, File, UploadFile
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
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Optional, List
from datetime import datetime, date
from bs4 import BeautifulSoup
import requests
import module1
import traceback

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

sessions: Dict[str, dict] = {}
reset_codes: Dict[str, str] = {}
otp_codes: Dict[str, str] = {}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Existing models (unchanged)
class LoginRequest(BaseModel):
    email: str
    password: str
    category: str

class LoginResponse(BaseModel):
    session_id: str
    first_name: str
    phoneNumber: int  # Add phoneNumber, optional since it may not always be set
    email: str
    profile_complete: Optional[bool] = None

class SignupRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    mobile: str
    category: str

class SignupResponse(BaseModel):
    message: str
    email: str

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

class LogoutRequest(BaseModel):
    session_id: str

class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    mobile: Optional[str] = None
    address: Optional[str] = None
    farm_size: Optional[str] = None
    main_crops: Optional[str] = None
    experience: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    mobile: Optional[str] = None
    category: str
    address: Optional[str] = None
    farm_size: Optional[str] = None
    main_crops: Optional[str] = None
    experience: Optional[str] = None
    photo_url: Optional[str] = None

class Product(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str
    price: float
    description: Optional[str] = None
    image: Optional[str] = None

class OrderItem(BaseModel):
    id: str
    name: str
    quantity: float
    price: float
    seller_id: Optional[str] = None

class Order(BaseModel):
    products: List[OrderItem]
    total: float
    delivery: dict
    delivery_method: str
    payment_method: str
    pickup_time: Optional[datetime] = None
    tracking_link: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str

class LoginOtpRequest(BaseModel):
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

class WantedProduct(BaseModel):
    product_name: str
    category: str
    quantity: float
    unit: str
    notes: Optional[str] = None
    deliveryLocation: Optional[str] = None  # Added delivery location
    requiredDateTime: Optional[str] = None

class WantedProductResponse(BaseModel):
    id: str
    product_name: str
    category: str
    quantity: float
    unit: str
    notes: Optional[str] = None
    created_at: str
    updated_at: str
    deliveryLocation: Optional[str] = None  # Added delivery location
    requiredDateTime: Optional[str] = None

# Model for /complete-profile
class CompleteProfileRequest(BaseModel):
    full_name: str
    location: str
    email: str
    phoneNumber : str

class CompleteProfileResponse(BaseModel):
    message: str
    first_name: str
    phoneNumber: str
    email: str
    location: str

def send_reset_email(email: str, code: str) -> bool:
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured, falling back to console")
        print(f"Reset code for {email}: {code}")
        return False

    try:
        msg = MIMEText(f"Your AgriTech verification code is: {code}\n\nThis code expires in 10 minutes.")
        msg['Subject'] = 'AgriTech Password Reset Code'
        msg['From'] = SMTP_USER
        msg['To'] = email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=SMTP_TIMEOUT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Successfully sent reset code to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        print(f"Reset code for {email}: {code}")
        return False

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
    if not x_session_id or x_session_id not in sessions:
        raise HTTPException(status_code=401, detail="Invalid or missing session ID")
    return sessions[x_session_id]

async def get_session(x_session_id: str = Header(...)):
    if not x_session_id or x_session_id not in sessions:
        raise HTTPException(status_code=401, detail="Invalid or missing session ID")
    return sessions[x_session_id]

@app.on_event("startup")
async def startup_event():
    try:
        buckets = supabase.storage.list_buckets()
        logger.info(f"Available buckets: {[b['id'] for b in buckets]}")
    except Exception as e:
        logger.error(f"Error listing buckets on startup: {str(e)}")

@app.post("/signup", response_model=SignupResponse)
async def signup(signup_data: SignupRequest):
    try:
        logger.info(f"Attempting signup for {signup_data.email}")
        auth_response = supabase.auth.sign_up({
            "email": signup_data.email,
            "password": signup_data.password
        })

        if auth_response.user is None:
            logger.error(f"Signup failed for {signup_data.email}: No user returned from Supabase")
            raise HTTPException(status_code=400, detail="Signup failed. Email might already be in use.")

        user_data = {
            "id": auth_response.user.id,
            "email": signup_data.email,
            "first_name": signup_data.first_name,
            "last_name": signup_data.last_name,
            "mobile": signup_data.mobile,
            "category": signup_data.category
        }

        profile_response = supabase.table("profiles").insert(user_data).execute()

        if not profile_response.data:
            logger.error(f"Failed to insert profile for {signup_data.email}, cleaning up user")
            supabase.auth.admin.delete_user(auth_response.user.id)
            raise HTTPException(status_code=500, detail="Failed to create user profile")

        logger.info(f"Signup successful for {signup_data.email}")
        return SignupResponse(
            message=f"Welcome aboard, {signup_data.first_name}! Regards from the AgriTech team.",
            email=signup_data.email
        )
    except Exception as e:
        error_message = str(e).lower()
        logger.error(f"Signup error for {signup_data.email}: {error_message}")
        if "already registered" in error_message:
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail=f"Signup failed: {error_message}")

@app.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    try:
        logger.info(f"Attempting login for {login_data.email}")
        auth_response = supabase.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password
        })

        if auth_response.user is None:
            logger.error(f"Login failed for {login_data.email}: No user returned from Supabase")
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user_id = auth_response.user.id
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()

        if not profile_response.data:
            logger.error(f"Profile not found for user ID {user_id}")
            raise HTTPException(status_code=404, detail="User profile not found")

        profile = profile_response.data

        if profile["category"] != login_data.category:
            if login_data.category == "Farmer":
                logger.warning(f"Category mismatch for {login_data.email}: expected Farmer, found {profile['category']}")
                raise HTTPException(status_code=403, detail="You are not a Farmer")
            elif login_data.category == "Investor":
                logger.warning(f"Category mismatch for {login_data.email}: expected Investor, found {profile['category']}")
                raise HTTPException(status_code=403, detail="You are not an Investor")

        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            "user_id": user_id,
            "email": login_data.email
        }
        logger.info(f"Login successful for {login_data.email}, session ID: {session_id}")

        return LoginResponse(
            session_id=session_id,
            first_name=profile["first_name"],
            last_name=profile["last_name"],
            email=profile["email"]
        )
    except Exception as e:
        error_message = str(e).lower()
        logger.error(f"Login error for {login_data.email}: {error_message}")
        if "invalid" in error_message or "credentials" in error_message or "email not confirmed" in error_message:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        raise HTTPException(status_code=500, detail=f"Login error: {error_message}")

@app.post("/logout")
async def logout(logout_data: LogoutRequest):
    try:
        session_id = logout_data.session_id
        if session_id in sessions:
            del sessions[session_id]
            logger.info(f"Session {session_id} logged out successfully")
            return {"message": "Logged out successfully"}
        else:
            raise HTTPException(status_code=400, detail="Invalid session ID")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout error: {str(e)}")

@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    try:
        logger.info(f"Checking user existence for {request.email}")
        users = supabase.auth.admin.list_users()
        user_exists = any(user.email == request.email for user in users)
        if not user_exists:
            logger.warning(f"Email not found: {request.email}")
            raise HTTPException(status_code=404, detail="Email not found")

        code = ''.join(random.choices(string.digits, k=6))
        reset_codes[request.email] = code

        email_sent = send_reset_email(request.email, code)
        logger.info(f"Forgot password request processed for {request.email}, email sent: {email_sent}")
        return {
            "message": "Reset code sent to your email" if email_sent else "Reset code generated (check server console due to email issue)"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        error_message = str(e).lower()
        logger.error(f"Forgot password error for {request.email}: {error_message}")
        if "403" in error_message or "forbidden" in error_message:
            raise HTTPException(status_code=403, detail="Admin access denied. Ensure SUPABASE_KEY is a service role key.")
        raise HTTPException(status_code=500, detail=f"Error processing reset request: {error_message}")

@app.post("/verify-code")
async def verify_code(request: VerifyCodeRequest):
    try:
        stored_code = reset_codes.get(request.email)
        if not stored_code or stored_code != request.code:
            raise HTTPException(status_code=400, detail="Invalid or expired code")
        return {"message": "Code verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        stored_code = reset_codes.get(request.email)
        if not stored_code or stored_code != request.code:
            raise HTTPException(status_code=400, detail="Invalid or expired code")

        users = supabase.auth.admin.list_users()
        user_id = None
        for user in users:
            if user.email == request.email:
                user_id = user.id
                break
        
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")

        supabase.auth.admin.update_user_by_id(
            user_id,
            {"password": request.new_password}
        )

        for session_id, session_data in list(sessions.items()):
            if session_data["email"] == request.email:
                del sessions[session_id]
                logger.info(f"Invalidated session {session_id} for {request.email} after password reset")

        del reset_codes[request.email]

        return {"message": "Password reset successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        error_message = str(e).lower()
        if "403" in error_message or "forbidden" in error_message:
            raise HTTPException(status_code=403, detail="Admin access denied. Ensure SUPABASE_KEY is a service role key.")
        raise HTTPException(status_code=500, detail=f"Error: {error_message}")

@app.get("/dashboard", dependencies=[Depends(get_current_session)])
async def get_dashboard(session: dict = Depends(get_current_session)):
    profile = supabase.table("profiles").select("*").eq("id", session["user_id"]).single().execute()
    if profile.data["category"] != "Farmer":
        raise HTTPException(status_code=403, detail="Access denied: Farmers only")
    return {"message": f"Welcome to the dashboard, {session['email']}"}

@app.get("/invest", dependencies=[Depends(get_current_session)])
async def get_invest(session: dict = Depends(get_current_session)):
    profile = supabase.table("profiles").select("*").eq("id", session["user_id"]).single().execute()
    if profile.data["category"] != "Investor":
        raise HTTPException(status_code=403, detail="Access denied: Investors only")
    return {"message": f"Welcome to the investment hub, {session['email']}"}

@app.get("/user", response_model=UserResponse, dependencies=[Depends(get_current_session)])
async def get_user(session: dict = Depends(get_current_session)):
    try:
        profile = supabase.table("profiles").select("*").eq("id", session["user_id"]).single().execute()
        if not profile.data:
            logger.error(f"Profile not found for user ID {session['user_id']}")
            raise HTTPException(status_code=404, detail="User profile not found")

        farmer_details = supabase.table("farmer_details").select("*").eq("user_id", session["user_id"]).execute()
        farmer_data = farmer_details.data[0] if farmer_details.data else {
            "address": "",
            "farm_size": "",
            "main_crops": "",
            "experience": "",
            "photo_url": ""
        }

        logger.info(f"Fetched user data for {session['email']}: profile={profile.data}, farmer_details={farmer_data}")

        profile_data = profile.data
        return UserResponse(
            id=profile_data["id"],
            first_name=profile_data["first_name"],
            last_name=profile_data["last_name"],
            email=profile_data["email"],
            mobile=profile_data.get("mobile", ""),
            category=profile_data["category"],
            address=farmer_data["address"],
            farm_size=farmer_data["farm_size"],
            main_crops=farmer_data["main_crops"],
            experience=farmer_data["experience"],
            photo_url=farmer_data["photo_url"] or None
        )
    except Exception as e:
        logger.error(f"Error fetching user profile for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@app.put("/user", response_model=UserResponse, dependencies=[Depends(get_current_session)])
async def update_user(update_data: UserUpdate, session: dict = Depends(get_current_session)):
    try:
        if update_data.mobile:
            mobile_check = supabase.table("profiles").select("id").eq("mobile", update_data.mobile).neq("id", session["user_id"]).execute()
            if mobile_check.data:
                logger.warning(f"Mobile {update_data.mobile} already in use by another user")
                raise HTTPException(status_code=400, detail="Mobile number already in use")

        profile_update = {
            "first_name": update_data.first_name,
            "last_name": update_data.last_name,
            "mobile": update_data.mobile
        }
        profile_response = supabase.table("profiles").update(profile_update).eq("id", session["user_id"]).execute()
        if not profile_response.data:
            logger.error(f"Failed to update profile for user ID {session['user_id']}")
            raise HTTPException(status_code=500, detail="Failed to update profile")

        farmer_details = supabase.table("farmer_details").select("*").eq("user_id", session["user_id"]).execute()
        farmer_update = {
            "user_id": session["user_id"],
            "address": update_data.address or "",
            "farm_size": update_data.farm_size or "",
            "main_crops": update_data.main_crops or "",
            "experience": update_data.experience or "",
            "updated_at": datetime.utcnow().isoformat()
        }
        if farmer_details.data:
            farmer_update["photo_url"] = farmer_details.data[0]["photo_url"] or ""
            supabase.table("farmer_details").update(farmer_update).eq("user_id", session["user_id"]).execute()
        else:
            farmer_update["photo_url"] = ""
            supabase.table("farmer_details").insert(farmer_update).execute()

        logger.info(f"Profile updated successfully for {session['email']}, farmer_details={farmer_update}")
        return UserResponse(
            id=session["user_id"],
            first_name=update_data.first_name,
            last_name=update_data.last_name,
            email=session["email"],
            mobile=update_data.mobile or "",
            category=profile_response.data[0]["category"],
            address=update_data.address or "",
            farm_size=update_data.farm_size or "",
            main_crops=update_data.main_crops or "",
            experience=update_data.experience or "",
            photo_url=farmer_update["photo_url"] or None
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating user profile for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@app.post("/user/photo", dependencies=[Depends(get_current_session)])
async def upload_profile_photo(file: UploadFile = File(...), session: dict = Depends(get_current_session)):
    try:
        if not file.content_type.startswith("image/"):
            logger.error(f"Invalid file type for {session['email']}: {file.content_type}")
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ['jpg', 'jpeg', 'png', 'gif']:
            logger.error(f"Unsupported file extension for {session['email']}: {file_extension}")
            raise HTTPException(status_code=400, detail="Unsupported image format")
        
        file_path = f"{session['user_id']}/{uuid.uuid4()}.{file_extension}"
        logger.info(f"Generated file path for {session['email']}: {file_path}")

        file_content = await file.read()
        storage_response = supabase.storage.from_("profile-photos").upload(
            file_path,
            file_content,
            {"content-type": file.content_type}
        )

        if not storage_response:
            logger.error(f"Failed to upload photo for {session['email']} to path: {file_path}")
            raise HTTPException(status_code=500, detail="Failed to upload photo")

        public_url = supabase.storage.from_("profile-photos").get_public_url(file_path)
        logger.info(f"Generated public URL for {session['email']}: {public_url}")

        try:
            file_list = supabase.storage.from_("profile-photos").list(f"{session['user_id']}")
            file_exists = any(f['name'] == file_path.split('/')[-1] for f in file_list)
            if not file_exists:
                logger.error(f"Uploaded file not found in storage for {session['email']}: {file_path}")
                raise HTTPException(status_code=500, detail="File upload verification failed")
        except Exception as e:
            logger.error(f"Error verifying file existence for {session['email']}: {str(e)}")

        farmer_details = supabase.table("farmer_details").select("*").eq("user_id", session["user_id"]).execute()
        if farmer_details.data:
            supabase.table("farmer_details").update({
                "photo_url": public_url,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("user_id", session["user_id"]).execute()
            logger.info(f"Updated farmer_details for {session['email']} with photo_url: {public_url}")
        else:
            supabase.table("farmer_details").insert({
                "user_id": session["user_id"],
                "address": "",
                "farm_size": "",
                "main_crops": "",
                "experience": "",
                "photo_url": public_url,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).execute()
            logger.info(f"Inserted farmer_details for {session['email']} with photo_url: {public_url}")

        logger.info(f"Profile photo uploaded successfully for {session['email']}, stored URL: {public_url}")
        return {"photo_url": public_url}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error uploading photo for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading photo: {str(e)}")
    
@app.delete("/user/photo", dependencies=[Depends(get_current_session)])
async def delete_profile_photo(session: dict = Depends(get_current_session)):
    try:
        farmer_details = supabase.table("farmer_details").select("photo_url").eq("user_id", session["user_id"]).execute()
        if not farmer_details.data or not farmer_details.data[0]["photo_url"]:
            logger.info(f"No photo found to delete for {session['email']}")
            raise HTTPException(status_code=404, detail="No profile photo found")

        photo_url = farmer_details.data[0]["photo_url"]
        file_path = photo_url.split("profile-photos/")[-1].lstrip("public/")
        logger.info(f"Attempting to delete photo for {session['email']}: {file_path}")

        files = supabase.storage.from_("profile-photos").list(session["user_id"])
        file_exists = any(f['name'] == file_path.split('/')[-1] for f in files)
        if not file_exists:
            logger.warning(f"File not found in storage for {session['email']}: {file_path}")
        else:
            storage_response = supabase.storage.from_("profile-photos").remove([file_path])
            logger.info(f"Storage response: {storage_response}")
            if not storage_response:
                logger.error(f"Failed to delete photo for {session['email']}: {file_path}")
                raise HTTPException(status_code=500, detail="Failed to delete photo from storage")

        update_response = supabase.table("farmer_details").update({
            "photo_url": None,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", session["user_id"]).execute()

        if not update_response.data:
            logger.error(f"Failed to update farmer_details for {session['email']} after photo deletion")
            raise HTTPException(status_code=500, detail="Failed to update profile after photo deletion")

        logger.info(f"Profile photo deleted successfully for {session['email']}")
        return {"message": "Profile photo deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting photo for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting photo: {str(e)}")

DAILY_TIPS = [
    "Check soil moisture levels daily for optimal crop health and water conservation.",
    "Rotate crops seasonally to prevent soil depletion and reduce pest buildup.",
    "Use companion planting to naturally deter pests and boost crop yields.",
    "Apply mulch to retain soil moisture and suppress weeds effectively.",
    "Monitor weather forecasts to plan irrigation and protect crops from storms.",
    "Test soil pH regularly to ensure optimal nutrient availability for plants.",
    "Prune fruit trees in late winter to encourage healthy spring growth.",
    "Use organic compost to enrich soil and promote sustainable farming.",
    "Inspect crops weekly for early signs of disease or pest infestation.",
    "Harvest rainwater to reduce dependency on external water sources."
]

@app.get("/daily-tip")
async def get_daily_tip(session: dict = Depends(get_current_session)):
    try:
        day_of_year = datetime.now().timetuple().tm_yday
        tip_index = day_of_year % len(DAILY_TIPS)
        tip = DAILY_TIPS[tip_index]
        
        logger.info(f"Serving daily tip: {tip}")
        return {"tip": tip}
    except Exception as e:
        logger.error(f"Daily tip error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching daily tip: {str(e)}")

events_cache: Dict[str, List[dict]] = {"date": "", "events": []}

async def scrape_events():
    url = "https://www.eventbrite.com/d/online/agriculture--events/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        events = []
        event_items = (
            soup.select("div.search-event-card-wrapper") or
            soup.select("div.eds-event-card") or
            soup.select("section.eds-event-card--content")
        )
        logger.info(f"Found {len(event_items)} event items")

        for item in event_items[:3]:
            name_elem = (
                item.select_one("h2.eds-event-card__title") or
                item.select_one("h3.eds-event-card-content__title") or
                item.select_one("div.event-card-details h3")
            )
            date_elem = (
                item.select_one("p.eds-text-color--ui-600") or
                item.select_one("div.eds-text-color--ui-600") or
                item.select_one("div.event-card__date")
            )
            location_elem = (
                item.select_one("p.eds-event-card__sub-title") or
                item.select_one("div.eds-event-card__sub-content") or
                item.select_one("div.event-card__location")
            )

            name = name_elem.get_text(strip=True) if name_elem else "Unknown Event"
            date_text = date_elem.get_text(strip=True) if date_elem else "TBA"
            location = location_elem.get_text(strip=True) if location_elem else "Online"

            logger.debug(f"Parsed event: {name}, {date_text}, {location}")
            events.append({
                "name": name,
                "date": date_text,
                "location": location
            })

        if not events:
            logger.warning("No events parsed from Eventbrite")
        
        events_cache["date"] = date.today().isoformat()
        events_cache["events"] = events
        logger.info(f"Scraped {len(events)} events from Eventbrite")
        return events
    except Exception as e:
        logger.error(f"Scrping error: {str(e)}")
        return events_cache["events"]

@app.get("/events")
async def get_events(session: dict = Depends(get_current_session)):
    try:
        current_date = date.today().isoformat()
        if events_cache["date"] == current_date and events_cache["events"]:
            logger.info("Serving cached events")
            return {"events": events_cache["events"]}
        
        events = await scrape_events()
        if not events:
            logger.warning("No events found, returning fallback")
            return {"events": [
                {"name": "Sustainable Agriculture Summit", "date": "TBA", "location": "Online"},
                {"name": "Organic Farming Workshop", "date": "TBA", "location": "Online"}
            ]}
        
        return {"events": events}
    except Exception as e:
        logger.error(f"Events error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching events: {str(e)}")

@app.post("/detect-disease")
async def detect_disease(images: List[UploadFile] = File(...), session: dict = Depends(get_current_session)):
    try:
        if len(images) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 images allowed")

        results = []
        errors = []

        for image in images:
            if not image.content_type.startswith("image/"):
                errors.append(f"Invalid file: {image.filename}")
                continue

            try:
                content = await image.read()
                plant_result = await module1.detect_plant_disease(content)
                assessment = plant_result.get("health_assessment", {})
                plant_name = assessment.get("plant", {}).get("name", None)

                is_healthy = assessment.get("is_healthy", False)
                healthy_prob = is_healthy.get("probability", 0) if isinstance(is_healthy, dict) else (1.0 if is_healthy else 0.0)

                diseases = []
                for disease in assessment.get("diseases", [])[:2]:
                    if disease["probability"] < 0.5:
                        continue
                    prevention = await module1.get_prevention_methods(disease["name"], plant_name or "plant")
                    diseases.append({
                        "name": disease["name"],
                        "probability": disease["probability"],
                        "prevention": prevention
                    })

                results.append({
                    "plant_name": plant_name,
                    "healthy": healthy_prob > 0.5,
                    "healthy_probability": healthy_prob,
                    "diseases": diseases
                })
            except Exception as e:
                errors.append(f"Failed to analyze {image.filename}: {str(e)}")

        if results:
            supabase.table("disease_scans").insert({
                "user_id": session["user_id"],
                "results": results,
                "created_at": datetime.utcnow().isoformat()
            }).execute()

        if not results and errors:
            raise HTTPException(status_code=400, detail={"message": "No valid results", "errors": errors})

        logger.info(f"Disease detection for {session['email']}: {len(results)} results, {len(errors)} errors")
        return {"results": results, "errors": errors}
    except Exception as e:
        logger.error(f"Disease detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/update-plant-name")
async def update_plant_name(data: dict, session: dict = Depends(get_current_session)):
    try:
        plant_name = data.get("plant_name")
        disease_name = data.get("disease_name")
        if not plant_name or not disease_name:
            raise HTTPException(status_code=400, detail="Plant name and disease name required")

        prevention = await module1.get_prevention_methods(disease_name, plant_name)
        return {"prevention": prevention}
    except Exception as e:
        logger.error(f"Update plant name error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feedback")
async def submit_feedback(feedback: dict, session: dict = Depends(get_current_session)):
    try:
        supabase.table("feedback").insert({
            "user_id": session["user_id"],
            "rating": feedback.get("rating", 0),
            "comment": feedback.get("comment", ""),
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        logger.info(f"Feedback submitted for user {session['email']}")
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        logger.error(f"Feedback error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error submitting feedback: {str(e)}")

@app.post("/products", response_model=Product)
async def add_product(product: Product, session: dict = Depends(get_session)):
    try:
        if product.quantity <= 0 or product.price <= 0:
            raise HTTPException(status_code=400, detail="Quantity and price must be positive")
        if len(product.name) > 100:
            raise HTTPException(status_code=400, detail="Name must be under 100 characters")
        if product.description and len(product.description) > 500:
            raise HTTPException(status_code=400, detail="Description must be under 500 characters")
        valid_categories = ["Seeds", "Fertilizers", "Pesticides", "Tools"]
        valid_units = ["kg", "g", "L", "pcs"]
        if product.category not in valid_categories:
            raise HTTPException(status_code=400, detail="Invalid category")
        if product.unit not in valid_units:
            raise HTTPException(status_code=400, detail="Invalid unit")
        product_data = {
            "id": str(uuid.uuid4()),
            "name": product.name,
            "category": product.category,
            "quantity": product.quantity,
            "unit": product.unit,
            "price": product.price,
            "description": product.description,
            "image": product.image or "/lovable-Uploads/dfae19bc-0068-4451-9902-2b41432ac120.png",
            "seller_id": session["user_id"],
            "created_at": "now()"
        }
        response = supabase.table("products").insert(product_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to add product")
        logger.info(f"Product added by {session['email']}: {product_data['name']}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error adding product for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding product: {str(e)}")

@app.post("/products/upload-image")
async def upload_product_image(file: UploadFile = File(...), session: dict = Depends(get_session)):
    try:
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ['jpg', 'jpeg', 'png']:
            logger.error(f"Unsupported file extension: {file_extension} by {session['email']}")
            raise HTTPException(status_code=400, detail="Unsupported image format")
        file_path = f"products/{session['user_id']}/{uuid.uuid4()}.{file_extension}"
        file_content = await file.read()
        storage_response = supabase.storage.from_("product-images").upload(file_path, file_content, {"content-type": file.content_type})
        if not storage_response:
            logger.error(f"Storage upload failed for {session['email']}: {file_path}")
            raise HTTPException(status_code=500, detail="Failed to upload image to storage")
        public_url = supabase.storage.from_("product-images").get_public_url(file_path)
        logger.info(f"Product image uploaded by {session['email']}: {public_url}")
        return {"image_url": public_url}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error uploading product image for {session['email']}: {str(e)}")
        if 'Bucket not found' in str(e):
            raise HTTPException(status_code=404, detail="Storage bucket 'product-images' not found")
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

@app.get("/products")
async def get_products(
    seller_id: Optional[str] = None,
    q: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
    session: dict = Depends(get_session)
):
    try:
        query = supabase.table("products").select("*")
        if seller_id:
            query = query.eq("seller_id", seller_id)
        if q:
            query = query.ilike("name", f"%{q}%")
        if category and category in ["Seeds", "Fertilizers", "Pesticides", "Tools"]:
            query = query.eq("category", category)
        query = query.range(offset, offset + limit - 1)
        response = query.execute()
        logger.info(f"Fetched {len(response.data)} products for seller_id: {seller_id}, query: {q}, category: {category}, limit: {limit}, offset: {offset}")
        return response.data
    except Exception as e:
        logger.error(f"Error fetching products for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str, session: dict = Depends(get_session)):
    try:
        try:
            uuid.UUID(product_id)
        except ValueError:
            logger.error(f"Invalid product_id format: {product_id}")
            raise HTTPException(status_code=400, detail="Invalid product ID format")

        response = supabase.table("products").select("*").eq("id", product_id).single().execute()
        if not response.data:
            logger.error(f"Product not found: {product_id}")
            raise HTTPException(status_code=404, detail="Product not found")
        logger.info(f"Fetched product {product_id} for {session['email']}")
        return response.data
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching product {product_id} for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching product: {str(e)}")

@app.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: Product, session: dict = Depends(get_session)):
    try:
        if product.quantity <= 0 or product.price <= 0:
            raise HTTPException(status_code=400, detail="Quantity and price must be positive")
        if len(product.name) > 100:
            raise HTTPException(status_code=400, detail="Name must be under 100 characters")
        if product.description and len(product.description) > 500:
            raise HTTPException(status_code=400, detail="Description must be under 500 characters")
        valid_categories = ["Seeds", "Fertilizers", "Pesticides", "Tools"]
        valid_units = ["kg", "g", "L", "pcs"]
        if product.category not in valid_categories:
            raise HTTPException(status_code=400, detail="Invalid category")
        if product.unit not in valid_units:
            raise HTTPException(status_code=400, detail="Invalid unit")
        try:
            uuid.UUID(product_id)
        except ValueError:
            logger.error(f"Invalid product_id format: {product_id}")
            raise HTTPException(status_code=400, detail="Invalid product ID format")
        existing_product = supabase.table("products").select("*").eq("id", product_id).eq("seller_id", session["user_id"]).single().execute()
        if not existing_product.data:
            raise HTTPException(status_code=404, detail="Product not found or you don't have permission to edit it")
        
        product_data = {
            "name": product.name,
            "category": product.category,
            "quantity": product.quantity,
            "unit": product.unit,
            "price": product.price,
            "description": product.description,
            "image": product.image or existing_product.data["image"],
            "updated_at": datetime.utcnow().isoformat()
        }
        response = supabase.table("products").update(product_data).eq("id", product_id).eq("seller_id", session["user_id"]).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update product")
        logger.info(f"Product updated by {session['email']}: {product_id}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating product {product_id} for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")

@app.delete("/products/{product_id}")
async def delete_product(product_id: str, session: dict = Depends(get_session)):
    try:
        try:
            uuid.UUID(product_id)
        except ValueError:
            logger.error(f"Invalid product_id format: {product_id}")
            raise HTTPException(status_code=400, detail="Invalid product ID format")

        existing_product = supabase.table("products").select("*").eq("id", product_id).eq("seller_id", session["user_id"]).single().execute()
        if not existing_product.data:
            raise HTTPException(status_code=404, detail="Product not found or you don't have permission to delete it")
        
        response = supabase.table("products").delete().eq("id", product_id).eq("seller_id", session["user_id"]).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to delete product")
        logger.info(f"Product deleted by {session['email']}: {product_id}")
        return {"message": "Product deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting product {product_id} for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting product: {str(e)}")

@app.post("/orders")
async def create_order(order: Order, session: dict = Depends(get_session)):
    try:
        required_delivery_fields = ["full_name", "phone_number", "address", "city", "state", "pin_code"]
        for field in required_delivery_fields:
            if field not in order.delivery or not order.delivery[field]:
                raise HTTPException(status_code=400, detail=f"Missing or empty delivery field: {field}")

        valid_delivery_methods = ["self_pickup", "parcel"]
        if order.delivery_method not in valid_delivery_methods:
            raise HTTPException(status_code=400, detail=f"Invalid delivery method. Must be one of {valid_delivery_methods}")

        valid_payment_methods = ["pay_on_delivery", "upi"]
        if order.payment_method not in valid_payment_methods:
            raise HTTPException(status_code=400, detail=f"Invalid payment method. Must be one of {valid_payment_methods}")

        if not order.products:
            raise HTTPException(status_code=400, detail="No products in order")
        
        product_ids = [item.id for item in order.products]
        products = supabase.table("products").select("id, name, quantity, price, seller_id").in_("id", product_ids).execute()
        product_dict = {p["id"]: p for p in products.data}

        for item in order.products:
            try:
                uuid.UUID(item.id)
            except ValueError:
                logger.error(f"Invalid product_id format: {item.id}")
                raise HTTPException(status_code=400, detail=f"Invalid product ID format: {item.id}")
            
            if item.id not in product_dict:
                raise HTTPException(status_code=404, detail=f"Product not found: {item.id}")
            
            db_product = product_dict[item.id]
            if item.quantity <= 0:
                raise HTTPException(status_code=400, detail=f"Invalid quantity for {item.name}")
            if item.quantity > db_product["quantity"]:
                raise HTTPException(status_code=400, detail=f"Insufficient quantity for {item.name}. Available: {db_product['quantity']}")
            if abs(item.price - db_product["price"]) > 0.01:
                raise HTTPException(status_code=400, detail=f"Price mismatch for {item.name}. Current price: {db_product['price']}")

        order_products = []
        for item in order.products:
            db_product = product_dict[item.id]
            new_quantity = db_product["quantity"] - item.quantity
            supabase.table("products").update({"quantity": new_quantity}).eq("id", item.id).execute()
            logger.info(f"Updated quantity for product {item.id}: {new_quantity}")
            order_products.append({
                "id": item.id,
                "name": item.name,
                "quantity": item.quantity,
                "price": item.price,
                "seller_id": db_product["seller_id"]
            })

        items_total = sum(item.price * item.quantity for item in order.products)
        delivery_fee = 40 if order.delivery_method == "parcel" else 0
        calculated_total = items_total + delivery_fee
        if abs(order.total - calculated_total) > 0.01:
            raise HTTPException(status_code=400, detail=f"Total mismatch. Expected: {calculated_total}, Provided: {order.total}")

        order_data = {
            "id": str(uuid.uuid4()),
            "buyer_id": session["user_id"],
            "products": order_products,
            "total_price": order.total,
            "delivery": order.delivery,
            "status": "Pending",
            "delivery_method": order.delivery_method,
            "payment_method": order.payment_method,
            "pickup_time": order.pickup_time.isoformat() if order.pickup_time else None,
            "tracking_link": order.tracking_link,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "delivery_fee": delivery_fee
        }
        response = supabase.table("orders").insert(order_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create order")

        logger.info(f"Order created by {session['email']}: {order_data['id']}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating order for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")

@app.get("/orders/{order_id}")
async def get_order(order_id: str, session: dict = Depends(get_session)):
    try:
        try:
            uuid.UUID(order_id)
        except ValueError:
            logger.error(f"Invalid order_id format: {order_id}")
            raise HTTPException(status_code=400, detail="Invalid order ID format")

        response = supabase.table("orders").select("*").eq("id", order_id).eq("buyer_id", session["user_id"]).single().execute()
        if not response.data:
            logger.error(f"Order not found: {order_id}")
            raise HTTPException(status_code=404, detail="Order not found or you don't have permission to view it")

        logger.info(f"Fetched order {order_id} for {session['email']}")
        return response.data
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching order {order_id} for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching order: {str(e)}")

@app.get("/orders")
async def get_user_orders(session: dict = Depends(get_session)):
    try:
        response = supabase.table("orders").select("*").eq("buyer_id", session["user_id"]).execute()
        logger.info(f"Fetched {len(response.data)} orders for {session['email']}")
        return response.data
    except Exception as e:
        logger.error(f"Error fetching orders for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")

@app.get("/seller/orders")
async def get_seller_orders(session: dict = Depends(get_session)):
    try:
        orders = supabase.table("orders").select("*").execute().data
        seller_orders = []
        for order in orders:
            seller_products = [p for p in order["products"] if p.get("seller_id") == session["user_id"]]
            if seller_products:
                order_copy = order.copy()
                order_copy["products"] = seller_products
                seller_orders.append(order_copy)
        logger.info(f"Fetched {len(seller_orders)} orders for seller {session['email']}")
        return seller_orders
    except Exception as e:
        logger.error(f"Error fetching seller orders for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching seller orders: {str(e)}")

@app.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, session: dict = Depends(get_session)):
    try:
        try:
            uuid.UUID(order_id)
        except ValueError:
            logger.error(f"Invalid order_id format: {order_id}")
            raise HTTPException(status_code=400, detail="Invalid order ID format")

        order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
        if not order.data:
            logger.error(f"Order not found: {order_id}")
            raise HTTPException(status_code=404, detail="Order not found")

        is_buyer = order.data["buyer_id"] == session["user_id"]
        seller_products = [p for p in order.data["products"] if p.get("seller_id") == session["user_id"]]
        is_seller = bool(seller_products)

        if not (is_buyer or is_seller):
            logger.error(f"User {session['email']} is neither buyer nor seller for order {order_id}")
            raise HTTPException(status_code=403, detail="You don't have permission to update this order")

        valid_statuses = {
            "self_pickup": ["Pending", "Ready for Pickup", "Delivered", "Cancelled"],
            "parcel": ["Pending", "Packed", "Shipped", "Delivered", "Cancelled"]
        }
        if order.data["delivery_method"] not in valid_statuses:
            raise HTTPException(status_code=400, detail="Invalid delivery method in order")

        if status_update.status not in valid_statuses[order.data["delivery_method"]]:
            raise HTTPException(status_code=400, detail=f"Invalid status for {order.data['delivery_method']}. Must be one of {valid_statuses[order.data['delivery_method']]}")

        if is_buyer and status_update.status == "Cancelled":
            if order.data["status"] not in ["Pending", "Processing"]:
                raise HTTPException(status_code=403, detail="Order cannot be cancelled at this stage")
            
            for item in order.data["products"]:
                product = supabase.table("products").select("quantity").eq("id", item["id"]).single().execute()
                if product.data:
                    new_quantity = product.data["quantity"] + item["quantity"]
                    supabase.table("products").update({"quantity": new_quantity}).eq("id", item["id"]).execute()
                    logger.info(f"Restocked product {item['id']}: new quantity {new_quantity}")
                else:
                    logger.warning(f"Product {item['id']} not found for restocking")

        elif is_seller:
            valid_transitions = {
                "self_pickup": {
                    "Pending": ["Ready for Pickup"],
                    "Ready for Pickup": ["Delivered"],
                    "Delivered": [],
                    "Cancelled": []
                },
                "parcel": {
                    "Pending": ["Packed"],
                    "Packed": ["Shipped"],
                    "Shipped": ["Delivered"],
                    "Delivered": [],
                    "Cancelled": []
                }
            }
            current_status = order.data["status"]
            if current_status not in valid_transitions[order.data["delivery_method"]]:
                raise HTTPException(status_code=400, detail=f"Current status {current_status} is invalid")
            if status_update.status not in valid_transitions[order.data["delivery_method"]][current_status]:
                raise HTTPException(status_code=400, detail=f"Cannot transition from {current_status} to {status_update.status} for {order.data['delivery_method']}")
        else:
            raise HTTPException(status_code=403, detail="Invalid status update request")

        update_data = {
            "status": status_update.status,
            "updated_at": datetime.utcnow().isoformat()
        }
        response = supabase.table("orders").update(update_data).eq("id", order_id).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update order status")

        logger.info(f"Order {order_id} status updated to {status_update.status} by {session['email']}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating order {order_id} status for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating order status: {str(e)}")

@app.put("/orders/{order_id}/details")
async def update_order_details(
    order_id: str,
    details: dict,
    session: dict = Depends(get_session)
):
    try:
        try:
            uuid.UUID(order_id)
        except ValueError:
            logger.error(f"Invalid order_id format: {order_id}")
            raise HTTPException(status_code=400, detail="Invalid order ID format")

        order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
        if not order.data:
            logger.error(f"Order not found: {order_id}")
            raise HTTPException(status_code=404, detail="Order not found")

        seller_products = [p for p in order.data["products"] if p.get("seller_id") == session["user_id"]]
        if not seller_products:
            logger.error(f"Seller {session['email']} has no products in order {order_id}")
            raise HTTPException(status_code=403, detail="You don't have permission to update this order")

        update_data = {
            "updated_at": datetime.utcnow().isoformat()
        }
        if "pickup_time" in details:
            if order.data["delivery_method"] != "self_pickup":
                raise HTTPException(status_code=400, detail="Pickup time only applicable for Self Pickup")
            try:
                pickup_time = datetime.fromisoformat(details["pickup_time"].replace("Z", "+00:00"))
                update_data["pickup_time"] = pickup_time.isoformat()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid pickup time format")
        if "tracking_link" in details:
            if order.data["delivery_method"] != "parcel":
                raise HTTPException(status_code=400, detail="Tracking link only applicable for Parcel")
            if not isinstance(details["tracking_link"], str) or len(details["tracking_link"]) > 500:
                raise HTTPException(status_code=400, detail="Invalid tracking link")
            update_data["tracking_link"] = details["tracking_link"]

        response = supabase.table("orders").update(update_data).eq("id", order_id).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update order details")

        logger.info(f"Order {order_id} details updated by {session['email']}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating order {order_id} details for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating order details: {str(e)}")

@app.post("/login-otp")
async def login_otp(request: LoginOtpRequest):
    try:
        users = supabase.auth.admin.list_users()
        user = next((u for u in users if u.email == request.email), None)
        if not user:
            logger.warning(f"Email not found: {request.email}")
            raise HTTPException(status_code=404, detail="Email not found")

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
        logger.error(f"Full exception: {traceback.format_exc()}")
        error_detail = str(e) if str(e) else "Unknown error during OTP generation"
        raise HTTPException(status_code=500, detail=f"Error processing OTP request: {error_detail}")

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
            logger.error(f"Full exception: {traceback.format_exc()}")
            error_detail = str(e) if str(e) else "Unknown error fetching users"
            raise HTTPException(status_code=500, detail=f"Failed to fetch users: {error_detail}")

        # Fetch user profile from buyers table
        try:
            buyer_response = supabase.table("buyers").select("first_name, phoneNumber, location").eq("id", user.id).execute()
            logger.info(f"Buyer profile query response: {buyer_response.data}")
            profile_data = buyer_response.data[0] if buyer_response.data else {
                "first_name": "",
                "location": "",
                "phoneNumber":"",
            }
            profile_data["email"] = request.email
        except Exception as e:
            logger.error(f"Failed to fetch buyer profile for user ID {user.id}: {str(e)}")
            logger.error(f"Full exception: {traceback.format_exc()}")
            error_detail = str(e) if str(e) else "Unknown error fetching profile"
            raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {error_detail}")

        # Create session in memory
        session_id = str(uuid.uuid4())
        try:
            sessions[session_id] = {
                "user_id": user.id,
                "email": request.email
            }
            logger.info(f"Session created for {request.email}, session ID: {session_id}")
        except Exception as e:
            logger.error(f"Failed to create session for {request.email}: {str(e)}")
            logger.error(f"Full exception: {traceback.format_exc()}")
            error_detail = str(e) if str(e) else "Unknown error creating session"
            raise HTTPException(status_code=500, detail=f"Failed to create session: {error_detail}")

        # Clear OTP
        if request.email in otp_codes:
            del otp_codes[request.email]

        # Return response
        return LoginResponse(
            session_id=session_id,
            first_name=profile_data["first_name"],
            phoneNumber=profile_data["phoneNumber"],
            email=profile_data["email"],
            profile_complete=bool(profile_data["first_name"]  and profile_data["location"])
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"OTP verification error for {request.email}: {str(e)}")
        logger.error(f"Full exception: {traceback.format_exc()}")
        error_detail = str(e) if str(e) else "Unknown error during OTP verification"
        raise HTTPException(status_code=500, detail=f"Error verifying OTP: {error_detail}")

@app.post("/wanted-products", response_model=WantedProductResponse)
async def add_wanted_product(product: WantedProduct, session: dict = Depends(get_current_session)):
    try:
        if product.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        if len(product.product_name) > 100:
            raise HTTPException(status_code=400, detail="Product name must be under 100 characters")
        if product.notes and len(product.notes) > 500:
            raise HTTPException(status_code=400, detail="Notes must be under 500 characters")
        valid_categories = ["Vegetables","Fruits","Paddy"]
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
            "deliveryLocation": product.deliveryLocation,  # Store delivery location
            "requiredDateTime": product.requiredDateTime,
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

@app.post("/complete-profile", response_model=CompleteProfileResponse)
async def complete_profile(request: CompleteProfileRequest, session: dict = Depends(get_current_session)):
    try:
        logger.info(f"Completing profile for email: {request.email}")
        
        # Validate input
        if not request.full_name or len(request.full_name.strip()) < 2:
            logger.warning(f"Invalid full_name for {request.email}: {request.full_name}")
            raise HTTPException(status_code=400, detail="Full name is required and must be at least 2 characters")
        if not request.location or len(request.location.strip()) < 2:
            logger.warning(f"Invalid location for {request.email}: {request.location}")
            raise HTTPException(status_code=400, detail="Location is required and must be at least 2 characters")
        if request.email != session["email"]:
            logger.warning(f"Email mismatch for session {session['email']}: provided {request.email}")
            raise HTTPException(status_code=400, detail="Email does not match session")

        

        # Log session data for debugging
        logger.info(f"Session data: {session}")

        # Check if buyer record exists
        buyer_response = supabase.table("buyers").select("*").eq("id", session["user_id"]).execute()
        logger.info(f"Buyer query response: {buyer_response.data}")
        
        buyer_data = {
            "id": session["user_id"],
            "email": request.email,
            "first_name": request.full_name,
            "phoneNumber": request.phoneNumber,
            "location": request.location.strip(),
            "updated_at": datetime.utcnow().isoformat()
        }

        if buyer_response.data and len(buyer_response.data) > 0:
            # Update existing buyer record
            update_response = supabase.table("buyers").update({
                "first_name": request.full_name,
                "phoneNumber": request.phoneNumber,
                "location": request.location.strip(),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", session["user_id"]).execute()
            if not update_response.data:
                logger.error(f"Failed to update buyer record for user ID {session['user_id']}")
                raise HTTPException(status_code=500, detail="Failed to update buyer profile")
        else:
            # Insert new buyer record
            insert_response = supabase.table("buyers").insert(buyer_data).execute()
            if not insert_response.data:
                logger.error(f"Failed to insert buyer record for user ID {session['user_id']}")
                raise HTTPException(status_code=500, detail="Failed to create buyer profile")

        logger.info(f"Buyer profile completed successfully for {request.email}")
        return CompleteProfileResponse(
            message="Profile completed successfully",
            first_name=request.full_name,
            phoneNumber=request.phoneNumber,
            email=request.email,
            location=request.location
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error completing profile for {request.email}: {str(e)}")
        logger.error(f"Full exception: {traceback.format_exc()}")
        error_detail = str(e) if str(e) else "Unknown error during profile completion"
        raise HTTPException(status_code=500, detail=f"Error completing profile: {error_detail}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)