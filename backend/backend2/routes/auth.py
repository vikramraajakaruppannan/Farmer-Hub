from fastapi import APIRouter, HTTPException
from models.schemas import LoginRequest, LoginResponse, SignupRequest
from utils.session import create_session, delete_session, get_current_session
from config.settings import supabase
from utils.email import send_reset_email
import random
import string
from models.schemas import LoginResponse
from fastapi import Request

router = APIRouter()
reset_codes = {}

@router.post("/signup")
async def signup(data: SignupRequest):
    try:
        # Create user in Supabase Auth
        auth = supabase.auth.sign_up({"email": data.email, "password": data.password})
        if not auth.user:
            raise HTTPException(400, "Email already registered")

        # Insert user profile
        profile = {
            "id": auth.user.id,
            "email": data.email,
            "first_name": data.first_name,
            "last_name": data.last_name,
            "mobile": data.mobile,
            "category": data.category
        }

        supabase.table("profiles").insert(profile).execute()

        return {"message": f"Welcome {data.first_name}!", "email": data.email}

    except Exception as e:
        raise HTTPException(400, str(e))


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    try:
        # Authenticate user
        auth = supabase.auth.sign_in_with_password(
            {"email": data.email, "password": data.password}
        )

        if not auth.user:
            raise HTTPException(401, "Invalid credentials")

        # Fetch profile
        profile_data = (
            supabase.table("profiles")
            .select("*")
            .eq("id", auth.user.id)
            .single()
            .execute()
            .data
        )

        if profile_data["category"] != data.category:
            raise HTTPException(403, "Category mismatch")

        # Create session
        session_id = create_session(auth.user.id, data.email)

        return LoginResponse(
            session_id=session_id,
            first_name=profile_data["first_name"],
            last_name=profile_data["last_name"],
            email=profile_data["email"],
            mobile=profile_data.get("mobile")
        )

    except Exception as e:
        print("Login error:", e)
        raise HTTPException(401, "Invalid credentials")


@router.post("/logout")
async def logout(request: Request):
    try:
        body = await request.json()
        session_id = body.get("session_id")
    except:
        session_id = None

    if session_id:
        delete_session(session_id)
    
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(email: str):
    code = ''.join(random.choices(string.digits, k=6))
    reset_codes[email] = code
    send_reset_email(email, code)
    return {"message": "Verification code sent"}


@router.post("/verify-code")
async def verify_code(email: str, code: str):
    if reset_codes.get(email) != code:
        raise HTTPException(400, "Invalid code")
    return {"message": "Verified"}


@router.post("/reset-password")
async def reset_password(email: str, code: str, new_password: str):
    if reset_codes.get(email) != code:
        raise HTTPException(400, "Invalid code")

    users = supabase.auth.admin.list_users()

    user = next((u for u in users if u.email == email), None)
    if not user:
        raise HTTPException(404, "User not found")

    supabase.auth.admin.update_user_by_id(user.id, {"password": new_password})

    # Remove reset code
    del reset_codes[email]

    # Log out all sessions
    from utils.session import sessions
    for sid, s in list(sessions.items()):
        if s["email"] == email:
            del sessions[sid]

    return {"message": "Password reset successful"}
