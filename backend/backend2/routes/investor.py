# backend/routes/investor_profile.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from models.schemas import UserUpdate, UserResponse
from utils.session import get_current_session
from config.settings import supabase
from datetime import datetime

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_investor_profile(session: dict = Depends(get_current_session)):
    user_id = session["user_id"]
    
    try:
        # Get core profile
        profile = supabase.table("profiles").select("*").eq("id", user_id).single().execute().data
        print(f"Profile fetched: {profile}")  # Debug
        if profile["category"].lower() != "investor":  # ← Fixed: case-insensitive
            raise HTTPException(403, "Access denied")

        # Get investor details (may not exist yet)
        details_res = supabase.table("investor_details").select("*").eq("user_id", user_id).execute()
        details = details_res.data[0] if details_res.data else {}
        print(f"Investor details: {details}")  # Debug

        return UserResponse(
            id=profile["id"],
            first_name=profile["first_name"],
            last_name=profile["last_name"],
            email=profile["email"],
            mobile=profile.get("mobile"),
            category=profile["category"],
            address=details.get("address"),
            photo_url=details.get("photo_url")
        )
    except Exception as e:
        print(f"Get profile error: {str(e)}")  # Debug
        raise HTTPException(500, f"Failed to fetch profile: {str(e)}")


@router.put("/profile", response_model=UserResponse)
async def update_investor_profile(
    update: UserUpdate,
    session: dict = Depends(get_current_session)
):
    user_id = session["user_id"]
    try:
        # Check category
        profile = supabase.table("profiles").select("category").eq("id", user_id).single().execute().data
        print(f"Profile category: {profile['category']}")  # Debug
        if profile["category"].lower() != "investor":
            raise HTTPException(403, "Access denied")

        # Update profiles table
        core_update = {
            "first_name": update.first_name,
            "last_name": update.last_name,
            "mobile": update.mobile or None,
        }
        core_update = {k: v for k, v in core_update.items() if v is not None}
        print(f"Updating profiles with: {core_update}")  # Debug
        supabase.table("profiles").update(core_update).eq("id", user_id).execute()

        # Update investor_details
        details_payload = {
            "address": update.address or None,
            "updated_at": datetime.utcnow().isoformat()
        }
        details_payload = {k: v for k, v in details_payload.items() if v is not None}
        print(f"Investor details payload: {details_payload}")  # Debug
        existing = supabase.table("investor_details").select("id").eq("user_id", user_id).execute()
        if existing.data:
            print("Updating existing investor_details")
            supabase.table("investor_details").update(details_payload).eq("user_id", user_id).execute()
        else:
            print("Inserting new investor_details")
            details_payload.update({
                "user_id": user_id,
                "created_at": datetime.utcnow().isoformat()
            })
            supabase.table("investor_details").insert(details_payload).execute()

        return await get_investor_profile(session)

    except Exception as e:
        print(f"Update profile error: {str(e)}")  # Debug
        raise HTTPException(500, f"Update failed: {str(e)}")


@router.post("/profile/photo")
async def upload_photo(
    file: UploadFile = File(...),
    session: dict = Depends(get_current_session)
):
    user_id = session["user_id"]
    
    print(f"Photo upload - Category: {session.get('category', 'Unknown')}")

    # Category check
    profile = supabase.table("profiles").select("category").eq("id", user_id).single().execute().data
    if profile["category"].lower() != "investor":
        raise HTTPException(403, "Access denied")

    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files allowed")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    path = f"{user_id}/profile.{ext}"
    print(f"Uploading photo to path: {path}")

    content = await file.read()

    try:
        response = supabase.storage.from_("profile-photos").upload(
            path=path,
            file=content,
            file_options={
                "content-type": file.content_type,
                "upsert": "true"
            }
        )

        print("Storage response (dict):", response)  # For debugging

        # ← CORRECT: Check status_code or just assume success if no exception
        # The upload succeeded if we reach here (200 OK already logged)

    except Exception as e:
        print("Storage upload error:", str(e))
        raise HTTPException(500, f"Failed to upload photo: {str(e)}")

    url = supabase.storage.from_("profile-photos").get_public_url(path)

    # Save to investor_details
    existing = supabase.table("investor_details").select("id").eq("user_id", user_id).execute()
    update_data = {"photo_url": url, "updated_at": datetime.utcnow().isoformat()}
    
    if existing.data:
        supabase.table("investor_details").update(update_data).eq("user_id", user_id).execute()
    else:
        update_data.update({
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat()
        })
        supabase.table("investor_details").insert(update_data).execute()

    return {"photo_url": url}


@router.delete("/profile/photo")
async def delete_photo(session: dict = Depends(get_current_session)):
    user_id = session["user_id"]
    
    # Category check
    profile = supabase.table("profiles").select("category").eq("id", user_id).single().execute().data
    if profile["category"].lower() != "investor":
        raise HTTPException(403, "Access denied")

    # Get current photo URL
    details_res = supabase.table("investor_details").select("photo_url").eq("user_id", user_id).execute()
    if not details_res.data or not details_res.data[0].get("photo_url"):
        raise HTTPException(404, "No photo to delete")

    photo_url = details_res.data[0]["photo_url"]
    
    # Extract path from public URL
    try:
        path = photo_url.split(f"/profile-photos/")[-1]
    except:
        raise HTTPException(500, "Invalid photo URL format")

    try:
        # Delete from storage
        supabase.storage.from_("profile-photos").remove([path])
    except Exception as e:
        print("Storage delete error:", str(e))
        # Continue anyway — file might already be gone

    # Clear from database
    supabase.table("investor_details").update({
        "photo_url": None,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("user_id", user_id).execute()

    return {"message": "Photo deleted successfully"}