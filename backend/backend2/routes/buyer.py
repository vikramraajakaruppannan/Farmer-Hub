# backend/routes/buyer.py
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from uuid import uuid4
import uuid
import random
import string
import smtplib
from email.mime.text import MIMEText
from datetime import datetime
import logging

from utils.session import get_current_session
from config.settings import supabase, settings

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory OTP store (use Redis in production)
otp_codes: Dict[str, str] = {}

# ------------------------------------------------------------------
# Pydantic Models
# ------------------------------------------------------------------
class LoginResponseBuyer(BaseModel):
    session_id: str
    first_name: str
    phoneNumber: str
    email: str
    profile_complete: Optional[bool] = None

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
    deliveryLocation: Optional[str] = None
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
    deliveryLocation: Optional[str] = None
    requiredDateTime: Optional[str] = None

class CompleteProfileRequest(BaseModel):
    full_name: str
    location: str
    email: str
    phoneNumber: str

class CompleteProfileResponse(BaseModel):
    message: str
    first_name: str
    phoneNumber: str
    email: str
    location: str

class AcceptRequest(BaseModel):
    farmer_contact: str

# ------------------------------------------------------------------
# Helper: Send OTP Email
# ------------------------------------------------------------------
def send_otp_email(email: str, code: str) -> bool:
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured. OTP printed to console.")
        print(f"OTP for {email}: {code}")
        return False

    try:
        msg = MIMEText(f"Your AgriTech login OTP is: {code}\n\nValid for 10 minutes.")
        msg['Subject'] = "AgriTech Login OTP"
        msg['From'] = settings.SMTP_USER
        msg['To'] = email

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"OTP email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP to {email}: {e}")
        print(f"OTP for {email}: {code}")
        return False

# ------------------------------------------------------------------
# POST /login-otp
# ------------------------------------------------------------------
@router.post("/login-otp")
async def login_otp(request: LoginOtpRequest):
    try:
        users = supabase.auth.admin.list_users()
        user = next((u for u in users if u.email == request.email), None)
        if not user:
            raise HTTPException(status_code=404, detail="Email not found")

        code = ''.join(random.choices(string.digits, k=6))
        otp_codes[request.email] = code

        email_sent = send_otp_email(request.email, code)
        return {"message": "OTP sent" if email_sent else "OTP generated (check console)"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"OTP login error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process OTP request")

# ------------------------------------------------------------------
# POST /verify-otp
# ------------------------------------------------------------------
@router.post("/verify-otp", response_model=LoginResponseBuyer)
async def verify_otp(request: VerifyOtpRequest):
    try:
        stored = otp_codes.get(request.email)
        if not stored or stored != request.otp:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        users = supabase.auth.admin.list_users()
        user = next((u for u in users if u.email == request.email), None)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        profile = supabase.table("buyers").select("first_name, phoneNumber, location").eq("id", user.id).execute()
        data = profile.data[0] if profile.data else {"first_name": "", "phoneNumber": "", "location": ""}
        data["email"] = request.email

        # ← FIX: Convert phoneNumber to string
        phone_str = str(data.get("phoneNumber", "")) if data.get("phoneNumber") is not None else ""

        session_id = str(uuid4())
        sessions[session_id] = {"user_id": user.id, "email": request.email}

        if request.email in otp_codes:
            del otp_codes[request.email]

        return LoginResponseBuyer(
            session_id=session_id,
            first_name=data["first_name"],
            phoneNumber=phone_str,  # ← Now always string
            email=data["email"],
            profile_complete=bool(data["first_name"] and data["location"])
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"OTP verify error: {e}")
        raise HTTPException(status_code=500, detail="OTP verification failed")

# ------------------------------------------------------------------
# POST /wanted-products
# ------------------------------------------------------------------
@router.post("/wanted-products", response_model=WantedProductResponse)
async def add_wanted_product(product: WantedProduct, session: dict = Depends(get_current_session)):
    try:
        if product.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        if len(product.product_name) > 100:
            raise HTTPException(status_code=400, detail="Product name too long")
        if product.notes and len(product.notes) > 500:
            raise HTTPException(status_code=400, detail="Notes too long")

        valid_categories = ["Vegetables", "Fruits", "Paddy"]
        valid_units = ["kg", "g", "L", "pcs"]
        if product.category not in valid_categories:
            raise HTTPException(status_code=400, detail="Invalid category")
        if product.unit not in valid_units:
            raise HTTPException(status_code=400, detail="Invalid unit")

        payload = {
            "id": str(uuid4()),
            "user_id": session["user_id"],
            "product_name": product.product_name,
            "category": product.category,
            "quantity": product.quantity,
            "unit": product.unit,
            "notes": product.notes,
            "deliveryLocation": product.deliveryLocation,
            "requiredDateTime": product.requiredDateTime,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        response = supabase.table("user_wanted_products").insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to add product")

        logger.info(f"Wanted product added: {payload['product_name']} by {session['email']}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Add wanted product error: {e}")
        raise HTTPException(status_code=500, detail="Server error")

# ------------------------------------------------------------------
# GET /wanted-products
# ------------------------------------------------------------------
@router.get("/wanted-products", response_model=List[WantedProductResponse])
async def get_wanted_products(session: dict = Depends(get_current_session)):
    try:
        response = supabase.table("user_wanted_products").select("*").eq("user_id", session["user_id"]).execute()
        logger.info(f"Fetched {len(response.data)} wanted products for {session['email']}")
        return response.data
    except Exception as e:
        logger.error(f"Fetch wanted products error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch")

# ------------------------------------------------------------------
# DELETE /wanted-products/{product_id}
# ------------------------------------------------------------------
@router.delete("/wanted-products/{product_id}")
async def delete_wanted_product(product_id: str, session: dict = Depends(get_current_session)):
    try:
        uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    try:
        response = supabase.table("user_wanted_products").delete().eq("id", product_id).eq("user_id", session["user_id"]).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Product not found")
        logger.info(f"Deleted wanted product {product_id}")
        return {"message": "Deleted"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail="Delete failed")

# ------------------------------------------------------------------
# POST /complete-profile
# ------------------------------------------------------------------
@router.post("/complete-profile", response_model=CompleteProfileResponse)
async def complete_profile(request: CompleteProfileRequest, session: dict = Depends(get_current_session)):
    try:
        if len(request.full_name.strip()) < 2:
            raise HTTPException(status_code=400, detail="Full name too short")
        if len(request.location.strip()) < 2:
            raise HTTPException(status_code=400, detail="Location too short")
        if request.email != session["email"]:
            raise HTTPException(status_code=400, detail="Email mismatch")

        update_data = {
            "first_name": request.full_name.strip(),
            "phoneNumber": request.phoneNumber,
            "location": request.location.strip(),
            "updated_at": datetime.utcnow().isoformat()
        }

        profile = supabase.table("buyers").select("id").eq("id", session["user_id"]).execute()
        if profile.data:
            supabase.table("buyers").update(update_data).eq("id", session["user_id"]).execute()
        else:
            update_data["id"] = session["user_id"]
            update_data["email"] = request.email
            supabase.table("buyers").insert(update_data).execute()

        logger.info(f"Profile completed for {request.email}")
        return CompleteProfileResponse(
            message="Profile completed",
            first_name=request.full_name.strip(),
            phoneNumber=request.phoneNumber,
            email=request.email,
            location=request.location.strip()
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Profile error: {e}")
        raise HTTPException(status_code=500, detail="Profile update failed")

# ------------------------------------------------------------------
# GET /farmer/wanted-products
# ------------------------------------------------------------------
@router.get("/farmer/wanted-products")
async def get_wanted_products_farmer(session: dict = Depends(get_current_session)):
    try:
        profile = supabase.table("profiles").select("category").eq("id", session["user_id"]).single().execute()
        if not profile.data or profile.data["category"] != "Farmer":
            raise HTTPException(status_code=403, detail="Farmers only")

        response = supabase.table("user_wanted_products").select(
            "*, buyers(first_name, email, phoneNumber, location)"
        ).execute()

        ignored = supabase.table("ignored_requests").select("wanted_product_id").eq("farmer_id", session["user_id"]).execute()
        ignored_ids = {i["wanted_product_id"] for i in ignored.data}

        filtered = [item for item in response.data if item["id"] not in ignored_ids]
        logger.info(f"Farmer {session['email']} sees {len(filtered)} wanted products")
        return filtered
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Farmer wanted products error: {e}")
        raise HTTPException(status_code=500, detail="Failed to load")

# ------------------------------------------------------------------
# POST /farmer/accept-request/{product_id}
# ------------------------------------------------------------------
@router.post("/farmer/accept-request/{product_id}")
async def accept_request(product_id: str, request: AcceptRequest, session: dict = Depends(get_current_session)):
    try:
        profile = supabase.table("profiles").select("category").eq("id", session["user_id"]).single().execute()
        if not profile.data or profile.data["category"] != "Farmer":
            raise HTTPException(status_code=403, detail="Farmers only")

        wanted = supabase.table("user_wanted_products").select("user_id").eq("id", product_id).single().execute()
        if not wanted.data:
            raise HTTPException(status_code=404, detail="Request not found")

        completed = supabase.table("accepted_requests").select("id").eq("wanted_product_id", product_id).eq("status", "Completed").execute()
        if completed.data:
            raise HTTPException(status_code=400, detail="Already completed")

        existing = supabase.table("accepted_requests").select("id").eq("wanted_product_id", product_id).eq("farmer_id", session["user_id"]).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Already accepted by you")

        supabase.table("accepted_requests").insert({
            "id": str(uuid4()),
            "wanted_product_id": product_id,
            "farmer_id": session["user_id"],
            "buyer_id": wanted.data["user_id"],
            "farmer_contact": request.farmer_contact,
            "created_at": datetime.utcnow().isoformat(),
            "status": "Pending"
        }).execute()

        logger.info(f"Request {product_id} accepted by {session['email']}")
        return {"message": "Accepted"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Accept error: {e}")
        raise HTTPException(status_code=500, detail="Accept failed")

# ------------------------------------------------------------------
# GET /buyer/accepted-requests
# ------------------------------------------------------------------
@router.get("/buyer/accepted-requests")
async def get_accepted_requests(session: dict = Depends(get_current_session)):
    try:
        response = supabase.table("accepted_requests").select(
            "id, wanted_product_id, farmer_id, farmer_contact, created_at, status, "
            "user_wanted_products!inner(product_name, quantity, unit, deliveryLocation, requiredDateTime), "
            "profiles!farmer_id(first_name, email)"
        ).eq("buyer_id", session["user_id"]).neq("status", "Completed").execute()

        result = [
            {
                "request_id": r["id"],
                "product_id": r["wanted_product_id"],
                "product_name": r["user_wanted_products"]["product_name"],
                "quantity": r["user_wanted_products"]["quantity"],
                "unit": r["user_wanted_products"]["unit"],
                "location": r["user_wanted_products"]["deliveryLocation"],
                "deadline": r["user_wanted_products"]["requiredDateTime"],
                "farmer_name": r["profiles"]["first_name"],
                "farmer_email": r["profiles"]["email"],
                "farmer_contact": r["farmer_contact"],
                "status": r["status"],
            }
            for r in response.data
        ]
        return result
    except Exception as e:
        logger.error(f"Buyer accepted requests error: {e}")
        raise HTTPException(status_code=500, detail="Failed to load")

# ------------------------------------------------------------------
# POST /buyer/mark-request-completed/{request_id}
# ------------------------------------------------------------------
@router.post("/buyer/mark-request-completed/{request_id}")
async def mark_request_completed(request_id: str, session: dict = Depends(get_current_session)):
    try:
        req = supabase.table("accepted_requests").select("buyer_id, status, wanted_product_id").eq("id", request_id).single().execute()
        if not req.data:
            raise HTTPException(status_code=404, detail="Request not found")
        if req.data["buyer_id"] != session["user_id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        if req.data["status"] == "Completed":
            raise HTTPException(status_code=400, detail="Already completed")

        supabase.table("accepted_requests").update({
            "status": "Completed",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", request_id).execute()

        supabase.table("user_wanted_products").delete().eq("id", req.data["wanted_product_id"]).eq("user_id", session["user_id"]).execute()

        logger.info(f"Request {request_id} completed by {session['email']}")
        return {"message": "Completed and removed"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Complete error: {e}")
        raise HTTPException(status_code=500, detail="Failed")

# ------------------------------------------------------------------
# POST /buyer/reject-request/{request_id}
# ------------------------------------------------------------------
@router.post("/buyer/reject-request/{request_id}")
async def reject_request(request_id: str, session: dict = Depends(get_current_session)):
    try:
        req = supabase.table("accepted_requests").select("buyer_id, status").eq("id", request_id).single().execute()
        if not req.data:
            raise HTTPException(status_code=404, detail="Not found")
        if req.data["buyer_id"] != session["user_id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        if req.data["status"] == "Completed":
            raise HTTPException(status_code=400, detail="Cannot reject completed")

        supabase.table("accepted_requests").delete().eq("id", request_id).execute()
        logger.info(f"Request {request_id} rejected by {session['email']}")
        return {"message": "Rejected"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Reject error: {e}")
        raise HTTPException(status_code=500, detail="Failed")

# ------------------------------------------------------------------
# DEBUG: Verify service_role key
# ------------------------------------------------------------------
@router.get("/debug-key")
async def debug_key():
    try:
        users = supabase.auth.admin.list_users()
        return {
            "status": "OK",
            "key_works": True,
            "user_count": len(users),
            "first_user_email": users[0].email if users else None
        }
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}
    
from utils.session import get_current_session, sessions  # ← FIXED
@router.post("/logout")
async def logout(x_session_id: Optional[str] = Header(None)):
    """
    Invalidate the session token.
    Returns 200 even if the header is missing – the client can always call it.
    """
    if x_session_id and x_session_id in sessions:
        del sessions[x_session_id]
        logger.info(f"Session {x_session_id} logged out")
    return {"message": "Logged out"}