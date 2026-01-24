# backend/routes/disease.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from typing import List, Dict, Any
from utils.session import get_current_session
from config.settings import supabase
import logging
from datetime import datetime

# Import your AI module (adjust path if needed)
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from . import module1  # ← Your plant disease AI module

logger = logging.getLogger(__name__)

router = APIRouter()

# ------------------------------------------------------------------
# POST /detect-disease
# ------------------------------------------------------------------
@router.post("/detect-disease")
async def detect_disease(
    images: List[UploadFile] = File(...),
    session: dict = Depends(get_current_session)
):
    user_id = session["user_id"]
    email = session["email"]

    try:
        if len(images) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 images allowed")

        results = []
        errors = []

        for image in images:
            if not image.content_type.startswith("image/"):
                errors.append(f"Invalid file type: {image.filename}")
                continue

            try:
                content = await image.read()
                plant_result = await module1.detect_plant_disease(content)
                assessment = plant_result.get("health_assessment", {})

                plant_name = assessment.get("plant", {}).get("name")
                is_healthy = assessment.get("is_healthy", False)
                healthy_prob = (
                    is_healthy.get("probability", 0)
                    if isinstance(is_healthy, dict)
                    else (1.0 if is_healthy else 0.0)
                )

                diseases = []
                for disease in assessment.get("diseases", [])[:2]:
                    if disease.get("probability", 0) < 0.5:
                        continue
                    prevention = await module1.get_prevention_methods(
                        disease["name"], plant_name or "plant"
                    )
                    diseases.append({
                        "name": disease["name"],
                        "probability": disease["probability"],
                        "prevention": prevention
                    })

                results.append({
                    "plant_name": plant_name,
                    "healthy": healthy_prob > 0.5,
                    "healthy_probability": healthy_prob,
                    "diseases": diseases
                })

            except Exception as e:
                error_msg = f"Analysis failed for {image.filename}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)

        # Save scan history if any result
        if results:
            supabase.table("disease_scans").insert({
                "user_id": user_id,
                "results": results,
                "created_at": datetime.utcnow().isoformat()
            }).execute()

        if not results and errors:
            raise HTTPException(
                status_code=400,
                detail={"message": "No valid images processed", "errors": errors}
            )

        logger.info(f"Disease scan: {len(results)} results, {len(errors)} errors for {email}")
        return {"results": results, "errors": errors}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Disease detection failed for {email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ------------------------------------------------------------------
# POST /update-plant-name
# ------------------------------------------------------------------
@router.post("/update-plant-name")
async def update_plant_name(
    data: Dict[str, str],
    session: dict = Depends(get_current_session)
):
    try:
        plant_name = data.get("plant_name")
        disease_name = data.get("disease_name")

        if not plant_name or not disease_name:
            raise HTTPException(
                status_code=400,
                detail="Both 'plant_name' and 'disease_name' are required"
            )

        prevention = await module1.get_prevention_methods(disease_name, plant_name)
        return {"prevention": prevention}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update plant name failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get prevention methods")

# ------------------------------------------------------------------
# POST /feedback
# ------------------------------------------------------------------
@router.post("/feedback")
async def submit_feedback(
    feedback: Dict[str, Any],
    session: dict = Depends(get_current_session)
):
    try:
        rating = feedback.get("rating", 0)
        comment = feedback.get("comment", "")

        if not isinstance(rating, int) or rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be 1–5")

        supabase.table("feedback").insert({
            "user_id": session["user_id"],
            "rating": rating,
            "comment": comment,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        logger.info(f"Feedback from {session['email']}: {rating}/5")
        return {"message": "Thank you! Feedback submitted."}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Feedback error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")