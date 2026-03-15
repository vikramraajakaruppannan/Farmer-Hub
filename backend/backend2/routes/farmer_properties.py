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
    is_leased: bool = False
    created_at: str
    updated_at: str

# ────────────────────────────────────────────────────────────────
# Helper: Upload file
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
# Public: List verified properties (hides leased ones)
# ────────────────────────────────────────────────────────────────
@router.get("/verified-properties")
async def get_verified_properties(session: dict = Depends(get_current_session)):
    farmer_id = session["user_id"]

    try:
        # Fetch verified properties (exclude leased)
        prop_response = supabase.table("properties") \
            .select("*") \
            .eq("status", "verified") \
            .eq("is_leased", False) \
            .order("created_at", desc=True) \
            .execute()

        if not prop_response or not hasattr(prop_response, 'data'):
            raise HTTPException(500, "Failed to fetch properties from database")

        properties = prop_response.data or []

        # For each property, check if farmer applied (safe handling)
        for prop in properties:
            try:
                existing_response = supabase.table("lease_applications") \
                    .select("id, status, investor_status") \
                    .eq("property_id", prop["id"]) \
                    .eq("farmer_id", farmer_id) \
                    .maybe_single() \
                    .execute()

                # Defensive check
                if existing_response is None or not hasattr(existing_response, 'data'):
                    prop["has_applied"] = False
                    prop["application_id"] = None
                    prop["application_status"] = None
                    prop["investor_status"] = None
                    continue

                existing = existing_response.data

                prop["has_applied"] = existing is not None

                if prop["has_applied"]:
                    prop["application_id"] = existing["id"]
                    prop["application_status"] = existing["status"]
                    prop["investor_status"] = existing.get("investor_status")
                else:
                    prop["application_id"] = None
                    prop["application_status"] = None
                    prop["investor_status"] = None

            except Exception as sub_e:
                print(f"Error checking application for property {prop['id']}: {sub_e}")
                prop["has_applied"] = False
                prop["application_id"] = None
                prop["application_status"] = None
                prop["investor_status"] = None

        return properties

    except Exception as e:
        print(f"Error in /verified-properties: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load properties: {str(e)}")

# ────────────────────────────────────────────────────────────────
# GET SINGLE VERIFIED PROPERTY DETAIL
# ────────────────────────────────────────────────────────────────
@router.get("/property/{property_id}")
async def get_verified_property_detail(property_id: str, session: dict = Depends(get_current_session)):
    farmer_id = session["user_id"]

    # Fetch property
    prop_response = supabase.table("properties") \
        .select("*") \
        .eq("id", property_id) \
        .eq("status", "verified") \
        .single() \
        .execute()

    if not prop_response or not hasattr(prop_response, "data") or not prop_response.data:
        raise HTTPException(404, "Property not found or not verified")

    property_data = prop_response.data

    # Check if farmer already applied (safe handling)
    try:
        existing_response = supabase.table("lease_applications") \
            .select("id, status, investor_status") \
            .eq("property_id", property_id) \
            .eq("farmer_id", farmer_id) \
            .maybe_single() \
            .execute()

        # Defensive: handle None or failed response
        if existing_response is None or not hasattr(existing_response, "data"):
            property_data["has_applied"] = False
            property_data["application_id"] = None
            property_data["application_status"] = None
            property_data["investor_status"] = None
            property_data["can_reapply"] = True
        else:
            existing = existing_response.data
            property_data["has_applied"] = existing is not None

            if property_data["has_applied"]:
                property_data["application_id"] = existing["id"]
                property_data["application_status"] = existing["status"]
                property_data["investor_status"] = existing.get("investor_status", None)
                property_data["can_reapply"] = existing.get("investor_status") != "rejected"
            else:
                property_data["application_id"] = None
                property_data["application_status"] = None
                property_data["investor_status"] = None
                property_data["can_reapply"] = True

    except Exception as sub_error:
        print(f"Sub-query error in property detail {property_id}: {sub_error}")
        # Fallback: treat as not applied
        property_data["has_applied"] = False
        property_data["application_id"] = None
        property_data["application_status"] = None
        property_data["investor_status"] = None
        property_data["can_reapply"] = True

    return property_data
# ────────────────────────────────────────────────────────────────
# Farmer: Submit lease application (with investor rejection block)
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

    prop = supabase.table("properties").select("id,status,is_leased").eq("id", property_id).single().execute()
    if not prop.data or prop.data["status"] != "verified" or prop.data["is_leased"]:
        raise HTTPException(400, "Property not available or not verified")

    # Block if investor previously rejected any application for this property
    rejected = supabase.table("lease_applications")\
        .select("id")\
        .eq("property_id", property_id)\
        .eq("farmer_id", farmer_id)\
        .eq("investor_status", "rejected")\
        .limit(1)\
        .execute()

    if rejected.data:
        raise HTTPException(403, "You cannot apply - investor previously rejected an application for this property.")

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
        "investor_status": "pending",  # ← Both start as pending
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
# ADMIN: Get all lease applications (with investor_status)
# ────────────────────────────────────────────────────────────────
async def require_admin(session: dict = Depends(get_current_session)):
    user_id = session["user_id"]
    try:
        profile = supabase.table("profiles").select("email").eq("id", user_id).single().execute().data
        if not profile or profile["email"] != "admin@farmerhub.com":
            raise HTTPException(403, "Admin access required")
        return session
    except Exception as e:
        raise HTTPException(403, "Invalid session or access denied")

@router.get("/admin/lease-applications")
async def get_admin_lease_applications(admin_session: dict = Depends(require_admin)):
    try:
        response = supabase.table("lease_applications")\
            .select("""
                id, proposed_rent, lease_duration_years, start_date, status, investor_status, rejected_reason,
                created_at, updated_at, message_to_owner,
                id_proof_url, income_proof_url, bank_statement_url, additional_docs_url,
                profiles!farmer_id (first_name, mobile, email),
                properties (title, location, district)
            """)\
            .order("created_at", desc=True)\
            .execute()
        return response.data or []
    except Exception as e:
        print(f"Error fetching admin lease applications: {str(e)}")
        raise HTTPException(500, "Failed to load applications")

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
    VALID_STATUSES = ["pending", "approved", "rejected"]

    if body.status not in VALID_STATUSES:
        raise HTTPException(400, f"Invalid status. Allowed: {', '.join(VALID_STATUSES)}")

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
            raise HTTPException(404, "Application not found")

        # If admin approves → check if investor also approved → mark property leased
        if body.status == "approved":
            app = supabase.table("lease_applications")\
                .select("investor_status, property_id")\
                .eq("id", application_id)\
                .single()\
                .execute()
            
            if app.data and app.data["investor_status"] == "approved":
                supabase.table("properties")\
                    .update({"is_leased": True})\
                    .eq("id", app.data["property_id"])\
                    .execute()

        return {"message": f"Application updated to {body.status}"}
    except Exception as e:
        print("Status update error:", str(e))
        raise HTTPException(500, "Failed to update application status")

# ────────────────────────────────────────────────────────────────
# INVESTOR: See fully approved lease requests on their property
# ────────────────────────────────────────────────────────────────
@router.get("/properties/{property_id}/approved-requests")
async def get_approved_lease_requests(
    property_id: str,
    session: dict = Depends(get_current_session)
):
    user_id = session["user_id"]

    prop = supabase.table("properties").select("owner_id").eq("id", property_id).single().execute()
    if not prop.data or prop.data["owner_id"] != user_id:
        raise HTTPException(403, "You do not own this property")

    response = supabase.table("lease_applications")\
        .select("""
            *,
            profiles!farmer_id(first_name, mobile, email)
        """)\
        .eq("property_id", property_id)\
        .eq("status", "approved")\
        .eq("investor_status", "approved")\
        .order("updated_at", desc=True)\
        .execute()

    return response.data or []

# ────────────────────────────────────────────────────────────────
# FARMER: My lease applications
# ────────────────────────────────────────────────────────────────
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

# ────────────────────────────────────────────────────────────────
# FARMER: Get single application detail
# ────────────────────────────────────────────────────────────────
@router.get("/lease-application/{application_id}")
async def get_lease_application_detail(application_id: str, session: dict = Depends(get_current_session)):
    farmer_id = session["user_id"]
    
    response = supabase.table("lease_applications").select("*").eq("id", application_id).single().execute()
    if not response.data:
        raise HTTPException(404, "Application not found")
    
    application = response.data
    if application["farmer_id"] != farmer_id:
        raise HTTPException(403, "Not authorized")
    
    prop_response = supabase.table("properties").select("*").eq("id", application["property_id"]).single().execute()
    application["property"] = prop_response.data
    
    return application

# ────────────────────────────────────────────────────────────────
# FARMER: Delete pending application
# ────────────────────────────────────────────────────────────────
@router.delete("/lease-application/{application_id}")
async def delete_lease_application(
    application_id: str,
    session: dict = Depends(get_current_session)
):
    farmer_id = session["user_id"]

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

    try:
        supabase.storage.from_("documents").remove([f"lease-apps/{farmer_id}/{application_id}/"])
    except:
        pass

    supabase.table("lease_applications").delete().eq("id", application_id).execute()
    return {"message": "Application deleted successfully"}

# ────────────────────────────────────────────────────────────────
# FARMER: Re-apply (reset to pending) - only if not investor-rejected
# ────────────────────────────────────────────────────────────────
@router.patch("/lease-applications/{application_id}/reapply")
async def reapply_application(application_id: str, session: dict = Depends(get_current_session)):
    farmer_id = session["user_id"]

    app = supabase.table("lease_applications")\
        .select("farmer_id, status, investor_status")\
        .eq("id", application_id)\
        .single()\
        .execute()

    if not app.data or app.data["farmer_id"] != farmer_id:
        raise HTTPException(403, "Not authorized")

    if app.data["investor_status"] == "rejected":
        raise HTTPException(403, "Cannot re-apply - investor previously rejected this application")

    supabase.table("lease_applications")\
        .update({
            "status": "pending",
            "rejected_reason": None,
            "updated_at": datetime.utcnow().isoformat()
        })\
        .eq("id", application_id)\
        .execute()

    return {"message": "Application reset to pending"}