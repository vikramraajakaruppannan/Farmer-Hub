# backend/routes/user.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from models.schemas import UserUpdate, UserResponse
from utils.session import get_current_session
from config.settings import supabase
import uuid

router = APIRouter()

@router.get("/user", response_model=UserResponse)
async def get_user(session: dict = Depends(get_current_session)):
    user_id = session["user_id"]
    profile = supabase.table("profiles").select("*").eq("id", user_id).single().execute().data
    farmer = supabase.table("farmer_details").select("*").eq("user_id", user_id).execute().data
    farmer = farmer[0] if farmer else {}

    return UserResponse(
        id=profile["id"],
        first_name=profile["first_name"],
        last_name=profile["last_name"],
        email=profile["email"],
        mobile=profile.get("mobile"),
        category=profile["category"],
        address=farmer.get("address"),
        farm_size=farmer.get("farm_size"),
        main_crops=farmer.get("main_crops"),
        experience=farmer.get("experience"),
        photo_url=farmer.get("photo_url")
    )

@router.put("/user", response_model=UserResponse)
async def update_user(update: UserUpdate, session: dict = Depends(get_current_session)):
    user_id = session["user_id"]

    if update.mobile:
        dup = supabase.table("profiles").select("id").eq("mobile", update.mobile).neq("id", user_id).execute()
        if dup.data:
            raise HTTPException(400, "Mobile already in use")

    supabase.table("profiles").update({
        "first_name": update.first_name,
        "last_name": update.last_name,
        "mobile": update.mobile or ""
    }).eq("id", user_id).execute()

    farmer_data = {
        "address": update.address or "",
        "farm_size": update.farm_size or "",
        "main_crops": update.main_crops or "",
        "experience": update.experience or "",
        "updated_at": __import__('datetime').datetime.utcnow().isoformat()
    }

    farmer_res = supabase.table("farmer_details").select("*").eq("user_id", user_id).execute()
    if farmer_res.data:
        supabase.table("farmer_details").update(farmer_data).eq("user_id", user_id).execute()
    else:
        farmer_data.update({
            "user_id": user_id,
            "created_at": __import__('datetime').datetime.utcnow().isoformat(),
            "photo_url": None
        })
        supabase.table("farmer_details").insert(farmer_data).execute()

    return await get_user(session)

@router.post("/user/photo")
async def upload_photo(file: UploadFile = File(...), session: dict = Depends(get_current_session)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Image only")

    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "gif"]:
        raise HTTPException(400, "Invalid format")

    path = f"{session['user_id']}/{uuid.uuid4()}.{ext}"
    content = await file.read()

    upload = supabase.storage.from_("profile-photos").upload(path, content, {"content-type": file.content_type})
    if upload.get("error"):
        raise HTTPException(500, "Upload failed")

    url = supabase.storage.from_("profile-photos").get_public_url(path)

    farmer_res = supabase.table("farmer_details").select("id").eq("user_id", session["user_id"]).execute()
    if not farmer_res.data:
        supabase.table("farmer_details").insert({
            "user_id": session["user_id"],
            "photo_url": url,
            "created_at": __import__('datetime').datetime.utcnow().isoformat(),
            "updated_at": __import__('datetime').datetime.utcnow().isoformat()
        }).execute()
    else:
        supabase.table("farmer_details").update({"photo_url": url}).eq("user_id", session["user_id"]).execute()

    return {"photo_url": url}

@router.delete("/user/photo")
async def delete_photo(session: dict = Depends(get_current_session)):
    farmer = supabase.table("farmer_details").select("photo_url").eq("user_id", session["user_id"]).single().execute()
    if not farmer.data or not farmer.data.get("photo_url"):
        raise HTTPException(404, "No photo")

    url = farmer.data["photo_url"]
    path = url.split("profile-photos/")[-1]
    supabase.storage.from_("profile-photos").remove([path])
    supabase.table("farmer_details").update({"photo_url": None}).eq("user_id", session["user_id"]).execute()
    return {"message": "Photo deleted"}