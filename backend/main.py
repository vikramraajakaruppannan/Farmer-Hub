from fastapi import FastAPI, HTTPException
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
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Must be service_role key
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_TIMEOUT = 15

reset_codes = {}

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    first_name: str
    last_name: str
    email: str

class SignupRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str

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

@app.post("/signup", response_model=SignupResponse)
async def signup(signup_data: SignupRequest):
    try:
        logger.info(f"Attempting signup for {signup_data.email}")
        auth_response = supabase.auth.sign_up({
            "email": signup_data.email,
            "password": signup_data.password,
            "options": {
                "data": {
                    "first_name": signup_data.first_name,
                    "last_name": signup_data.last_name
                }
            }
        })

        if auth_response.user is None:
            logger.error(f"Signup failed for {signup_data.email}: No user returned from Supabase")
            raise HTTPException(status_code=400, detail="Signup failed. Email might already be in use.")

        user_data = {
            "id": auth_response.user.id,
            "email": signup_data.email,
            "first_name": signup_data.first_name,
            "last_name": signup_data.last_name
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

        profile_response = supabase.table("profiles").select("*").eq("id", auth_response.user.id).single().execute()

        if not profile_response.data:
            logger.error(f"Profile not found for user ID {auth_response.user.id}")
            raise HTTPException(status_code=404, detail="User profile not found")

        profile = profile_response.data
        logger.info(f"Login successful for {login_data.email}")

        return LoginResponse(
            access_token=auth_response.session.access_token,
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

        del reset_codes[request.email]

        return {"message": "Password reset successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        error_message = str(e).lower()
        if "403" in error_message or "forbidden" in error_message:
            raise HTTPException(status_code=403, detail="Admin access denied. Ensure SUPABASE_KEY is a service role key.")
        raise HTTPException(status_code=500, detail=f"Error: {error_message}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)