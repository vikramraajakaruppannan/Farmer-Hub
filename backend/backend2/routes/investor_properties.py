# backend/routes/investor_properties.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
from typing import List, Optional
from utils.session import get_current_session
from config.settings import supabase
from datetime import datetime
import uuid

router = APIRouter(prefix="/properties", tags=["properties"])

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
    boundaries: str = ""
    document_urls: List[str] = []
    status: str
    created_at: str
    updated_at: str
    change_request: Optional[dict] = None
    change_status: str = "none"

class ChangeRequestModel(BaseModel):
    type: str
    reason: str

# FIXED UPLOAD FUNCTION
async def upload_documents(files: List[UploadFile], owner_id: str, property_id: str) -> List[str]:
    urls = []
    for file in files:
        if not file.filename:
            continue

        content_type = file.content_type or "application/octet-stream"
        if not (content_type.startswith("image/") or content_type == "application/pdf"):
            print(f"Skipped unsupported file type: {file.filename} ({content_type})")
            continue

        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "bin"
        path = f"{owner_id}/{property_id}/{uuid.uuid4()}.{ext}"

        try:
            content = await file.read()
            if len(content) == 0:
                print(f"Empty file skipped: {file.filename}")
                continue

            supabase.storage.from_("property-docs").upload(
                path=path,
                file=content,
                file_options={
                    "content-type": content_type,
                    "upsert": "true"  # ← CRITICAL FIX: string "true", not boolean True
                }
            )

            url = supabase.storage.from_("property-docs").get_public_url(path)
            urls.append(url)
            print(f"Uploaded: {file.filename}")

        except Exception as e:
            print(f"Upload failed for {file.filename}: {str(e)}")

    return urls

# CREATE PROPERTY
@router.post("/", response_model=dict)
async def create_property(
    title: str = Form(...),
    location: str = Form(...),
    district: str = Form(...),
    area: float = Form(...),
    price: float = Form(...),
    soil_type: str = Form(...),
    water_source: str = Form(...),
    description: str = Form(...),
    boundaries: str = Form(""),
    rtc: List[UploadFile] = File([]),
    mutation: List[UploadFile] = File([]),
    survey_sketch: List[UploadFile] = File([]),
    tax_receipt: List[UploadFile] = File([]),
    id_proof: List[UploadFile] = File([]),
    photos: List[UploadFile] = File([]),
    session: dict = Depends(get_current_session)
):
    user_id = session["user_id"]

    profile = supabase.table("profiles").select("category").eq("id", user_id).single().execute().data
    if profile["category"].lower() != "investor":
        raise HTTPException(403, "Only investors can register properties")

    property_id = str(uuid.uuid4())
    all_files = rtc + mutation + survey_sketch + tax_receipt + id_proof + photos
    document_urls = await upload_documents(all_files, user_id, property_id)

    property_data = {
        "id": property_id,
        "owner_id": user_id,
        "title": title,
        "location": location,
        "district": district,
        "area": area,
        "price": price,
        "soil_type": soil_type,
        "water_source": water_source,
        "description": description,
        "boundaries": boundaries,
        "document_urls": document_urls,
        "status": "pending",
        "change_status": "none",
        "change_request": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    supabase.table("properties").insert(property_data).execute()
    return {"message": "Property submitted successfully!"}

# LIST MY PROPERTIES
@router.get("/", response_model=List[PropertyResponse])
async def get_my_properties(session: dict = Depends(get_current_session)):
    user_id = session["user_id"]
    response = supabase.table("properties")\
        .select("*")\
        .eq("owner_id", user_id)\
        .order("created_at", desc=True)\
        .execute()
    return response.data

# GET SINGLE
@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: str, session: dict = Depends(get_current_session)):
    user_id = session["user_id"]
    response = supabase.table("properties")\
        .select("*")\
        .eq("id", property_id)\
        .eq("owner_id", user_id)\
        .single()\
        .execute()
    if not response.data:
        raise HTTPException(404, "Property not found")
    return response.data

# REQUEST CHANGE
@router.post("/{property_id}/request-change")
async def request_change(
    property_id: str,
    request: ChangeRequestModel,
    session: dict = Depends(get_current_session)
):
    user_id = session["user_id"]

    try:
        prop = supabase.table("properties")\
            .select("owner_id, status, change_status")\
            .eq("id", property_id)\
            .single()\
            .execute().data

        if not prop or prop["owner_id"] != user_id:
            raise HTTPException(404, "Property not found or not yours")
        if prop["status"] != "verified":
            raise HTTPException(400, "Only verified properties can request changes")

        if prop["change_status"] == "pending":
            raise HTTPException(400, "You already have a pending change request. Wait for admin response.")
        if prop["change_status"] == "approved":
            raise HTTPException(400, "Your previous request was approved. You can now edit the property.")
        if prop["change_status"] == "rejected":
            # Allow new request after rejection
            pass

        change_data = {
            "type": request.type,
            "reason": request.reason.strip(),
            "requested_at": datetime.utcnow().isoformat()
        }

        supabase.table("properties")\
            .update({
                "change_status": "pending",
                "change_request": change_data
            })\
            .eq("id", property_id)\
            .execute()

        return {"message": "Change request submitted successfully!"}

    except Exception as e:
        print("Request change error:", str(e))
        raise HTTPException(500, "Failed to submit request")

# UPDATE PROPERTY
@router.put("/{property_id}")
async def update_property(
    property_id: str,
    title: str = Form(...),
    location: str = Form(...),
    district: str = Form(...),
    area: float = Form(...),
    price: float = Form(...),
    soil_type: str = Form(...),
    water_source: str = Form(...),
    description: str = Form(...),
    boundaries: str = Form(""),
    rtc: List[UploadFile] = File([]),
    mutation: List[UploadFile] = File([]),
    survey_sketch: List[UploadFile] = File([]),
    tax_receipt: List[UploadFile] = File([]),
    id_proof: List[UploadFile] = File([]),
    photos: List[UploadFile] = File([]),
    session: dict = Depends(get_current_session)
):
    user_id = session["user_id"]

    prop = supabase.table("properties")\
        .select("owner_id, status, change_status, document_urls")\
        .eq("id", property_id)\
        .single()\
        .execute().data

    if not prop or prop["owner_id"] != user_id:
        raise HTTPException(404, "Property not found")

    if prop["status"] == "verified" and prop["change_status"] != "approved":
        raise HTTPException(403, "Need admin approval to edit verified property")

    all_new_files = rtc + mutation + survey_sketch + tax_receipt + id_proof + photos
    new_urls = await upload_documents(all_new_files, user_id, property_id)
    updated_urls = prop.get("document_urls", []) + new_urls

    update_data = {
        "title": title,
        "location": location,
        "district": district,
        "area": area,
        "price": price,
        "soil_type": soil_type,
        "water_source": water_source,
        "description": description,
        "boundaries": boundaries,
        "document_urls": updated_urls,
        "updated_at": datetime.utcnow().isoformat(),
        "status": "pending",  # Goes back to pending after edit
        "change_status": "none",
        "change_request": None
    }

    supabase.table("properties").update(update_data).eq("id", property_id).execute()
    return {"message": "Property updated and sent for re-verification!"}

# DELETE PROPERTY
@router.delete("/{property_id}")
async def delete_property(property_id: str, session: dict = Depends(get_current_session)):
    user_id = session["user_id"]

    prop = supabase.table("properties")\
        .select("owner_id, status, change_status, document_urls")\
        .eq("id", property_id)\
        .single()\
        .execute().data

    if not prop or prop["owner_id"] != user_id:
        raise HTTPException(404, "Property not found")

    if prop["status"] == "verified" and prop["change_status"] != "approved":
        raise HTTPException(403, "Need admin approval to delete verified property")

    for url in prop.get("document_urls", []):
        try:
            path = url.split("/property-docs/")[-1]
            supabase.storage.from_("property-docs").remove([path])
        except:
            pass

    supabase.table("properties").delete().eq("id", property_id).execute()
    return {"message": "Property deleted successfully"}