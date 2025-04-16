from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
import logging
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app early to ensure it's always defined
app = FastAPI()

# Load environment variables
try:
    load_dotenv()
except Exception as e:
    logger.error(f"Failed to load .env file: {str(e)}")
    raise

# Validate environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables")
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

# Initialize Supabase client
try:
    from supabase import create_client, Client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")
    raise

# Import dependencies
try:
    from models import UserUpdate, UserResponse
    from login import get_current_session, sessions
except ImportError as e:
    logger.error(f"Failed to import models or login: {str(e)}")
    raise

@app.get("/user", response_model=UserResponse)
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

@app.put("/user", response_model=UserResponse)
async def update_user(update_data: UserUpdate, session: dict = Depends(get_current_session)):
    try:
        # Validate required fields
        if not update_data.first_name or not update_data.last_name:
            logger.warning(f"Invalid input for {session['email']}: first_name and last_name are required")
            raise HTTPException(status_code=400, detail="First name and last name are required")

        # Check for mobile uniqueness if provided
        if update_data.mobile:
            mobile_check = supabase.table("profiles").select("id").eq("mobile", update_data.mobile).neq("id", session["user_id"]).execute()
            if mobile_check.data:
                logger.warning(f"Mobile {update_data.mobile} already in use by another user")
                raise HTTPException(status_code=400, detail="Mobile number already in use")

        # Update profile data
        profile_update = {
            "first_name": update_data.first_name.strip(),
            "last_name": update_data.last_name.strip(),
            "mobile": update_data.mobile.strip() if update_data.mobile else None,
            "updated_at": datetime.utcnow().isoformat()
        }
        logger.info(f"Updating profile for {session['email']}: {profile_update}")
        profile_response = supabase.table("profiles").update(profile_update).eq("id", session["user_id"]).execute()

        if not profile_response.data:
            logger.error(f"Failed to update profile for user ID {session['user_id']}: {profile_response}")
            raise HTTPException(status_code=500, detail="Failed to update profile in database")

        # Update or insert farmer details
        farmer_details = supabase.table("farmer_details").select("*").eq("user_id", session["user_id"]).execute()
        farmer_update = {
            "user_id": session["user_id"],
            "address": update_data.address.strip() if update_data.address else "",
            "farm_size": update_data.farm_size.strip() if update_data.farm_size else "",
            "main_crops": update_data.main_crops.strip() if update_data.main_crops else "",
            "experience": update_data.experience.strip() if update_data.experience else "",
            "updated_at": datetime.utcnow().isoformat()
        }

        if farmer_details.data:
            # Preserve existing photo_url
            farmer_update["photo_url"] = farmer_details.data[0].get("photo_url", "") or ""
            logger.info(f"Updating farmer_details for {session['email']}: {farmer_update}")
            farmer_response = supabase.table("farmer_details").update(farmer_update).eq("user_id", session["user_id"]).execute()
            if not farmer_response.data:
                logger.error(f"Failed to update farmer_details for user ID {session['user_id']}: {farmer_response}")
                raise HTTPException(status_code=500, detail="Failed to update farmer details")
        else:
            farmer_update["photo_url"] = ""
            farmer_update["created_at"] = datetime.utcnow().isoformat()
            logger.info(f"Inserting farmer_details for {session['email']}: {farmer_update}")
            farmer_response = supabase.table("farmer_details").insert(farmer_update).execute()
            if not farmer_response.data:
                logger.error(f"Failed to insert farmer_details for user ID {session['user_id']}: {farmer_response}")
                raise HTTPException(status_code=500, detail="Failed to insert farmer details")

        # Fetch updated profile
        updated_profile = supabase.table("profiles").select("*").eq("id", session["user_id"]).single().execute()
        if not updated_profile.data:
            logger.error(f"Updated profile not found for user ID {session['user_id']}")
            raise HTTPException(status_code=404, detail="Updated profile not found")

        logger.info(f"Profile updated successfully for {session['email']}, farmer_details={farmer_update}")
        return UserResponse(
            first_name=updated_profile.data["first_name"],
            last_name=updated_profile.data["last_name"],
            email=session["email"],
            mobile=updated_profile.data.get("mobile", ""),
            category=updated_profile.data["category"],
            address=farmer_update["address"],
            farm_size=farmer_update["farm_size"],
            main_crops=farmer_update["main_crops"],
            experience=farmer_update["experience"],
            photo_url=farmer_update["photo_url"] or None
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating user profile for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@app.post("/user/photo")
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
            raise HTTPException(status_code=500, detail=f"Error verifying file: {str(e)}")

        farmer_details = supabase.table("farmer_details").select("*").eq("user_id", session["user_id"]).execute()
        if farmer_details.data:
            update_data = {
                "photo_url": public_url,
                "updated_at": datetime.utcnow().isoformat()
            }
            logger.info(f"Updating farmer_details for {session['email']} with: {update_data}")
            supabase.table("farmer_details").update(update_data).eq("user_id", session["user_id"]).execute()
        else:
            insert_data = {
                "user_id": session["user_id"],
                "address": "",
                "farm_size": "",
                "main_crops": "",
                "experience": "",
                "photo_url": public_url,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            logger.info(f"Inserting farmer_details for {session['email']} with: {insert_data}")
            supabase.table("farmer_details").insert(insert_data).execute()

        logger.info(f"Profile photo uploaded successfully for {session['email']}, stored URL: {public_url}")
        return {"photo_url": public_url}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error uploading photo for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading photo: {str(e)}")