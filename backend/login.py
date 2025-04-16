from fastapi import FastAPI, HTTPException, Depends, Request, Header
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import random
import string
import smtplib
from email.mime.text import MIMEText
import logging
import uuid
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Optional
from models import (
    LoginRequest, LoginResponse, SignupRequest, SignupResponse,
    ForgotPasswordRequest, VerifyCodeRequest, ResetPasswordRequest, LogoutRequest
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Must be service_role key
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_TIMEOUT = 15

sessions: Dict[str, dict] = {}  # In-memory session store
reset_codes = {}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Utility Functions
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

async def get_current_session(x_session_id: Optional[str] = Header(None)):
    if not x_session_id or x_session_id not in sessions:
        raise HTTPException(status_code=401, detail="Invalid or missing session ID")
    return sessions[x_session_id]

# Endpoints
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