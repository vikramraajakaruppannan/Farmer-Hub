from fastapi import FastAPI, HTTPException, Depends, Header, File, UploadFile
from pydantic import BaseModel
from supabase import Client
import logging
import uuid
from typing import Optional, Dict
from datetime import datetime
from .utils import supabase, sessions, send_reset_email, reset_codes, get_current_session, get_session, logger, SMTP_USER, SMTP_PASSWORD

app = FastAPI()

class LoginRequest(BaseModel):
    email: str
    password: str
    category: str

class LoginResponse(BaseModel):
    session_id: str
    first_name: str
    last_name: str
    email: str

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