# backend/routes/admin.py - FULL UPDATED FILE

from fastapi import APIRouter, Depends, HTTPException
from utils.session import get_current_session
from config.settings import supabase
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])

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
        
        if profile_email != "admin@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
            
        return session
    except Exception as e:
        print("Admin check error:", str(e))
        raise HTTPException(status_code=403, detail="Invalid session or access denied")

@router.get("/properties/pending")
async def get_pending_properties(admin_session: dict = Depends(require_admin)):
    try:
        # First get pending properties
        properties_response = (
            supabase.table("properties")
            .select("*")
            .eq("status", "pending")
            .order("created_at", desc=True)
            .execute()
        )
        
        properties = properties_response.data
        
        if not properties:
            return []
        
        # Get owner_ids
        owner_ids = [p["owner_id"] for p in properties]
        
        # Fetch profiles separately
        profiles_response = (
            supabase.table("profiles")
            .select("id, first_name, last_name, email, mobile")
            .in_("id", owner_ids)
            .execute()
        )
        
        profiles = profiles_response.data
        profile_map = {p["id"]: p for p in profiles}
        
        # Combine data
        result = []
        for prop in properties:
            owner = profile_map.get(prop["owner_id"], {})
            result.append({
                **prop,
                "investor_name": f"{owner.get('first_name', '')} {owner.get('last_name', '')}".strip() or "Unknown",
                "investor_email": owner.get("email", "N/A"),
                "investor_mobile": owner.get("mobile", "N/A"),
            })
        
        return result
        
    except Exception as e:
        print("Error fetching pending properties:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch pending properties")

@router.post("/properties/{property_id}/verify")
async def verify_property(property_id: str, admin_session: dict = Depends(require_admin)):
    try:
        supabase.table("properties")\
            .update({"status": "verified", "updated_at": datetime.utcnow().isoformat()})\
            .eq("id", property_id)\
            .execute()
        return {"message": "Property verified successfully!"}
    except Exception as e:
        print("Verify error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to verify property")

@router.post("/properties/{property_id}/reject")
async def reject_property(property_id: str, admin_session: dict = Depends(require_admin)):
    try:
        supabase.table("properties")\
            .update({"status": "rejected", "updated_at": datetime.utcnow().isoformat()})\
            .eq("id", property_id)\
            .execute()
        return {"message": "Property rejected"}
    except Exception as e:
        print("Reject error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to reject property")
    
# backend/routes/admin.py - UPDATE THESE
@router.get("/dashboard-data")
async def get_admin_dashboard(admin_session: dict = Depends(require_admin)):
    try:
        all_props = supabase.table("properties").select("*").execute().data
        
        # Pending verification (new submissions)
        pending_verification = [p for p in all_props if p["status"] == "pending"]
        
        # Change requests (verified properties with pending change)
        change_requests = [p for p in all_props if p.get("change_status") == "pending"]
        
        # Add investor info to both lists
        def enrich_with_investor(props):
            if not props:
                return []
            owner_ids = [p["owner_id"] for p in props]
            profiles = supabase.table("profiles")\
                .select("id, first_name, last_name, email, mobile")\
                .in_("id", owner_ids)\
                .execute().data
            profile_map = {p["id"]: p for p in profiles}
            for p in props:
                owner = profile_map.get(p["owner_id"], {})
                p["investor_name"] = f"{owner.get('first_name','')} {owner.get('last_name','')}".strip() or "Unknown"
                p["investor_email"] = owner.get("email", "N/A")
                p["investor_mobile"] = owner.get("mobile", "N/A")
            return props

        return {
            "pending_verification": enrich_with_investor(pending_verification),
            "change_requests": enrich_with_investor(change_requests),
        }

    except Exception as e:
        print("Admin dashboard error:", str(e))
        raise HTTPException(500, "Failed to load dashboard")

@router.post("/properties/{property_id}/approve-change")
async def approve_change(property_id: str, admin_session: dict = Depends(require_admin)):
    try:
        prop = supabase.table("properties")\
            .select("change_status, change_request")\
            .eq("id", property_id)\
            .single()\
            .execute().data

        if prop["change_status"] != "pending":
            raise HTTPException(400, "No pending change request")

        change_type = prop["change_request"]["type"]

        if change_type == "delete":
            # Delete files
            for url in prop.get("document_urls", []):
                try:
                    path = url.split("/property-docs/")[-1]
                    supabase.storage.from_("property-docs").remove([path])
                except:
                    pass
            supabase.table("properties").delete().eq("id", property_id).execute()
            return {"message": "Property deleted after approval"}
        else:  # edit
            supabase.table("properties")\
                .update({
                    "change_status": "approved",
                    "change_request": None
                })\
                .eq("id", property_id)\
                .execute()
            return {"message": "Edit request approved. Investor can now update."}

    except Exception as e:
        print("Approve change error:", str(e))
        raise HTTPException(500, "Failed to approve change")

@router.post("/properties/{property_id}/reject-change")
async def reject_change(property_id: str, admin_session: dict = Depends(require_admin)):
    try:
        supabase.table("properties")\
            .update({
                "change_status": "rejected",
                "change_request": None
            })\
            .eq("id", property_id)\
            .execute()
        return {"message": "Change request rejected"}
    except Exception as e:
        print("Reject change error:", str(e))
        raise HTTPException(500, "Failed to reject change")