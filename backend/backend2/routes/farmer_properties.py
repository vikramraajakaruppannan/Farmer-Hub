# backend/routes/farmer_properties.py
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from pydantic import BaseModel
from typing import List, Optional
from utils.session import get_current_session
from config.settings import supabase
from datetime import datetime
import uuid

router = APIRouter(prefix="/farmer", tags=["farmer-properties", "admin"])

class PropertyResponse(BaseModel):
    id: str
    title: str
    location: str
    district: str
    area: float
    price: float
    soil_type: str
    water_source: str
    description: str
    boundaries: Optional[str] = ""
    document_urls: List[str] = []
    status: str
    created_at: str
    updated_at: str

# ────────────────────────────────────────────────────────────────
# Helper: Upload file (unchanged)
# ────────────────────────────────────────────────────────────────
async def upload_file(file: UploadFile, farmer_id: str, app_id: str, prefix: str) -> Optional[str]:
    if not file or not file.filename:
        return None
    try:
        content_type = file.content_type or "application/octet-stream"
        ext = file.filename.rsplit(".", 1)[-1].lower()
        path = f"lease-apps/{farmer_id}/{app_id}/{prefix}.{ext}"
        content = await file.read()
        supabase.storage.from_("documents").upload(path, content, file_options={"content-type": content_type, "upsert": "true"})
        return supabase.storage.from_("documents").get_public_url(path)
    except Exception as e:
        print(f"Upload failed {prefix}: {e}")
        return None

# ────────────────────────────────────────────────────────────────
# Public: List verified properties (unchanged)
# ────────────────────────────────────────────────────────────────
@router.get("/verified-properties")
async def get_verified_properties(session: dict = Depends(get_current_session)):
    farmer_id = session["user_id"]

    try:
        # Fetch all verified properties
        response = supabase.table("properties")\
            .select("*")\
            .eq("status", "verified")\
            .order("created_at", desc=True)\
            .execute()

        properties = response.data or []

        # Add has_applied for each property
        for prop in properties:
            existing = supabase.table("lease_applications")\
                .select("id, status")\
                .eq("property_id", prop["id"])\
                .eq("farmer_id", farmer_id)\
                .execute()

            has_applied = bool(existing.data)
            prop["has_applied"] = has_applied

            if has_applied:
                application = existing.data[0]   # first row
                prop["application_id"] = application["id"]
                prop["application_status"] = application["status"]
            else:
                prop["application_id"] = None
                prop["application_status"] = None

        return properties

    except Exception as e:
        print(f"Error in /verified-properties: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load properties: {str(e)}")

@router.get("/property/{property_id}", response_model=PropertyResponse)
async def get_verified_property_detail(
    property_id: str,
    session: dict = Depends(get_current_session)
):
    farmer_id = session["user_id"]

    # Get property
    prop_response = supabase.table("properties")\
        .select("*")\
        .eq("id", property_id)\
        .eq("status", "verified")\
        .single()\
        .execute()
    
    if not prop_response.data:
        raise HTTPException(404, "Property not found or not verified")
    
    property_data = prop_response.data

    # Check if this farmer already applied
    existing_app = supabase.table("lease_applications")\
        .select("id, status")\
        .eq("property_id", property_id)\
        .eq("farmer_id", farmer_id)\
        .execute()
    
    has_applied = bool(existing_app.data)
    current_app_status = existing_app.data[0]["status"] if existing_app.data else None

    # Add these fields to the response
    property_data["has_applied"] = has_applied
    property_data["application_status"] = current_app_status

    return property_data

# ────────────────────────────────────────────────────────────────
# Farmer: Submit lease application (unchanged)
# ────────────────────────────────────────────────────────────────
@router.post("/lease-applications")
async def submit_lease_application(
    property_id: str = Form(...),
    proposed_rent: float = Form(...),
    lease_duration_years: int = Form(...),
    start_date: str = Form(...),
    planned_crops: Optional[str] = Form(None),
    farming_experience_years: Optional[int] = Form(None),
    equipment: Optional[str] = Form(None),
    workers_count: Optional[int] = Form(None),
    investment_budget: Optional[float] = Form(None),
    monthly_income: Optional[float] = Form(None),
    bank_name: Optional[str] = Form(None),
    account_number: Optional[str] = Form(None),
    ifsc_code: Optional[str] = Form(None),
    message_to_owner: Optional[str] = Form(None),
    id_proof: UploadFile = File(None),
    income_proof: UploadFile = File(None),
    bank_statement: UploadFile = File(None),
    additional_docs: List[UploadFile] = File([]),
    session: dict = Depends(get_current_session)
):
    farmer_id = session["user_id"]

    prop = supabase.table("properties").select("id,status").eq("id", property_id).single().execute()
    if not prop.data or prop.data["status"] != "verified":
        raise HTTPException(400, "Invalid or unverified property")

    application_id = str(uuid.uuid4())

    id_proof_url = await upload_file(id_proof, farmer_id, application_id, "id-proof")
    income_proof_url = await upload_file(income_proof, farmer_id, application_id, "income-proof")
    bank_statement_url = await upload_file(bank_statement, farmer_id, application_id, "bank-statement")

    additional_urls = []
    for i, file in enumerate(additional_docs):
        url = await upload_file(file, farmer_id, application_id, f"additional-{i}")
        if url: additional_urls.append(url)

    data = {
        "id": application_id,
        "property_id": property_id,
        "farmer_id": farmer_id,
        "proposed_rent": proposed_rent,
        "lease_duration_years": lease_duration_years,
        "start_date": start_date,
        "planned_crops": planned_crops,
        "farming_experience_years": farming_experience_years,
        "equipment": equipment,
        "workers_count": workers_count,
        "investment_budget": investment_budget,
        "monthly_income": monthly_income,
        "bank_name": bank_name,
        "account_number": account_number,
        "ifsc_code": ifsc_code,
        "message_to_owner": message_to_owner,
        "id_proof_url": id_proof_url,
        "income_proof_url": income_proof_url,
        "bank_statement_url": bank_statement_url,
        "additional_docs_url": additional_urls,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    try:
        supabase.table("lease_applications").insert(data).execute()
        return {"message": "Lease application submitted successfully!", "application_id": application_id}
    except Exception as e:
        print(f"Insert failed: {e}")
        raise HTTPException(500, "Failed to submit application")



# ────────────────────────────────────────────────────────────────
# ADMIN: Get pending lease applications
# ────────────────────────────────────────────────────────────────
async def require_admin(session: dict = Depends(get_current_session)):
    user_id = session["user_id"]
    
    try:
        profile_response = supabase.table("profiles")\
            .select("email")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        if not profile_response.data:
            raise HTTPException(status_code=403, detail="Profile not found")
        
        profile_email = profile_response.data["email"]
        
        if profile_email != "admin@farmerhub.com":
            raise HTTPException(status_code=403, detail="Admin access required")
            
        return session
    except Exception as e:
        print("Admin check error:", str(e))
        raise HTTPException(status_code=403, detail="Invalid session or access denied")

@router.get("/admin/lease-applications")
async def get_admin_lease_applications(admin_session: dict = Depends(require_admin)):
    try:
        response = supabase.table("lease_applications")\
            .select("""
                *,
                profiles!farmer_id (
                    first_name,
                    mobile,
                    email
                ),
                properties (
                    title,
                    location,
                    district
                )
            """)\
            .order("created_at", desc=True)\
            .execute()

        return response.data or []
    except Exception as e:
        print(f"Error fetching admin lease applications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load applications")

# ────────────────────────────────────────────────────────────────
# ADMIN: Update application status (Approve / Reject)
# ────────────────────────────────────────────────────────────────
class ApplicationStatusUpdate(BaseModel):
    status: str  # "approved" or "rejected"
    rejected_reason: Optional[str] = None

@router.patch("/admin/lease-applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    body: ApplicationStatusUpdate,
    admin_session: dict = Depends(require_admin)
):
    # Define allowed statuses EXACTLY as in your CHECK constraint
    VALID_STATUSES = ["pending", "approved", "rejected"]   # ← CHANGE THIS if your DB uses 'Approved'

    if body.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status value. Allowed: {', '.join(VALID_STATUSES)}"
        )

    update_data = {
        "status": body.status,
        "updated_at": datetime.utcnow().isoformat()
    }
    if body.status == "rejected" and body.rejected_reason:
        update_data["rejected_reason"] = body.rejected_reason

    try:
        response = supabase.table("lease_applications")\
            .update(update_data)\
            .eq("id", application_id)\
            .execute()
        
        if response.count == 0:
            raise HTTPException(404, "Application not found or not authorized")
            
        return {"message": f"Application {body.status}"}
    except Exception as e:
        print("Status update error:", str(e))
        if "violates check constraint" in str(e):
            raise HTTPException(400, "Invalid status value - does not match database constraint")
        raise HTTPException(500, "Failed to update application status")

# ────────────────────────────────────────────────────────────────
# INVESTOR: See approved lease requests on their property
# ────────────────────────────────────────────────────────────────
@router.get("/properties/{property_id}/approved-requests")
async def get_approved_lease_requests(
    property_id: str,
    session: dict = Depends(get_current_session)
):
    user_id = session["user_id"]

    # Verify property ownership
    prop = supabase.table("properties").select("owner_id").eq("id", property_id).single().execute()
    if not prop.data or prop.data["owner_id"] != user_id:
        raise HTTPException(403, "You do not own this property")

    response = supabase.table("lease_applications")\
        .select("""
            *,
            profiles!farmer_id(name, phone, email)
        """)\
        .eq("property_id", property_id)\
        .eq("status", "approved")\
        .order("updated_at", desc=True)\
        .execute()

    return response.data or []

# Add this endpoint for farmers to see their own applications
@router.get("/my-lease-applications")
async def get_my_lease_applications(session: dict = Depends(get_current_session)):
    farmer_id = session["user_id"]
    
    response = supabase.table("lease_applications")\
        .select("""
            *,
            properties(title, location, area, price, district)
        """)\
        .eq("farmer_id", farmer_id)\
        .order("created_at", desc=True)\
        .execute()
    
    return response.data or []

@router.get("/lease-application/{application_id}")
async def get_lease_application_detail(application_id: str, session: dict = Depends(get_current_session)):
    farmer_id = session["user_id"]
    
    response = supabase.table("lease_applications").select("*").eq("id", application_id).single().execute()
    if not response.data:
        raise HTTPException(404, "Application not found")
    application = response.data
    if application["farmer_id"] != farmer_id:
        raise HTTPException(403, "Not authorized")
    
    # Get property details
    prop_response = supabase.table("properties").select("*").eq("id", application["property_id"]).single().execute()
    application["property"] = prop_response.data
    return application

@router.delete("/lease-application/{application_id}")
async def delete_lease_application(
    application_id: str,
    session: dict = Depends(get_current_session)
):
    farmer_id = session["user_id"]

    # Fetch to verify ownership & status
    app = supabase.table("lease_applications")\
        .select("farmer_id, status")\
        .eq("id", application_id)\
        .single()\
        .execute()

    if not app.data:
        raise HTTPException(404, "Application not found")

    if app.data["farmer_id"] != farmer_id:
        raise HTTPException(403, "Not your application")

    if app.data["status"] != "pending":
        raise HTTPException(400, "Only pending applications can be deleted")

    # Optional: clean up storage files
    try:
        supabase.storage.from_("documents").remove([f"lease-apps/{farmer_id}/{application_id}/"])
    except:
        pass

    # Delete row
    supabase.table("lease_applications").delete().eq("id", application_id).execute()

    return {"message": "Application deleted successfully"}

@router.patch("/admin/lease-applications/{application_id}/investor-reject")
async def investor_reject_application(
    application_id: str,
    session: dict = Depends(get_current_session)
):
    # Verify ownership or investor role (add your auth check)
    app = supabase.table("lease_applications")\
        .select("property_id")\
        .eq("id", application_id)\
        .single()\
        .execute()

    if not app.data:
        raise HTTPException(404, "Application not found")

    # Check property ownership if needed
    prop = supabase.table("properties")\
        .select("owner_id")\
        .eq("id", app.data["property_id"])\
        .single()\
        .execute()

    if prop.data["owner_id"] != session["user_id"]:
        raise HTTPException(403, "Not authorized")

    supabase.table("lease_applications")\
        .update({"investor_rejected": True, "updated_at": datetime.utcnow().isoformat()})\
        .eq("id", application_id)\
        .execute()

    return {"message": "Investor rejected application"}

@router.patch("/lease-applications/{application_id}/reapply")
async def reapply_application(application_id: str, session: dict = Depends(get_current_session)):
    farmer_id = session["user_id"]

    app = supabase.table("lease_applications")\
        .select("farmer_id, status")\
        .eq("id", application_id)\
        .single()\
        .execute()

    if not app.data or app.data["farmer_id"] != farmer_id:
        raise HTTPException(403, "Not authorized")

    # Reset to pending
    supabase.table("lease_applications")\
        .update({
            "status": "pending",
            "rejected_reason": None,
            "updated_at": datetime.utcnow().isoformat()
        })\
        .eq("id", application_id)\
        .execute()

    return {"message": "Application reset to pending"}