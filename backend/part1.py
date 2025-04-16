from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging
from typing import List
from datetime import datetime
from login import get_current_session, sessions, supabase
import base64
from PIL import Image
import io
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

PLANT_ID_API_KEY = os.getenv("PLANT_ID_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

async def detect_plant_disease(image_content: bytes):
    """Detect plant diseases with Plant.id API"""
    try:
        # Validate image
        try:
            Image.open(io.BytesIO(image_content))
        except Exception:
            logger.error("Invalid image format")
            raise ValueError("Invalid image format")

        img_base64 = base64.b64encode(image_content).decode("utf-8")
        headers = {"Content-Type": "application/json", "Api-Key": PLANT_ID_API_KEY}
        payload = {"images": [img_base64], "plant_details": ["diseases"], "language": "en"}

        # Health assessment
        response = requests.post(
            "https://api.plant.id/v2/health_assessment",
            headers=headers,
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        result = response.json()
        logger.debug(f"Plant.id response: {result}")

        # Validate response
        if not isinstance(result, dict) or "health_assessment" not in result:
            logger.error("Invalid response: missing health_assessment")
            return {"health_assessment": {"plant": {"name": null}, "is_healthy": False, "diseases": []}}

        assessment = result["health_assessment"]
        plant = assessment.get("plant", {})
        plant_name = plant.get("name", "Unknown") if isinstance(plant, dict) else "Unknown"

        # Try identification if Unknown
        if plant_name == "Unknown":
            logger.info("Unknown plant, attempting identification")
            id_payload = {"images": [img_base64], "plant_details": ["common_names"], "language": "en"}
            try:
                id_response = requests.post(
                    "https://api.plant.id/v2/identify",
                    headers=headers,
                    json=id_payload,
                    timeout=10
                )
                id_response.raise_for_status()
                id_result = id_response.json()
                if id_result.get("suggestions"):
                    plant_name = id_result["suggestions"][0].get("plant_details", {}).get("common_names", [None])[0]
                    if plant_name:
                        result["health_assessment"]["plant"] = {"name": plant_name}
                    else:
                        result["health_assessment"]["plant"] = {"name": null}
                else:
                    result["health_assessment"]["plant"] = {"name": null}
            except Exception as e:
                logger.warning(f"Identification failed: {str(e)}")
                result["health_assessment"]["plant"] = {"name": null}

        return result
    except Exception as e:
        logger.error(f"Disease detection error: {str(e)}")
        return {"health_assessment": {"plant": {"name": null}, "is_healthy": False, "diseases": []}}

async def get_prevention_methods(disease_name: str, plant_name: str = "plant"):
    """Get prevention methods using Groq API"""
    prompt = f"""Provide 4 prevention/treatment methods for {disease_name} in {plant_name}:
    - Organic treatment
    - Chemical solution
    - Cultural practice
    - Environmental adjustment
    Format as bullet points."""
    
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "messages": [{"role": "user", "content": prompt}],
        "model": "llama3-70b-8192",
        "temperature": 0.7,
        "max_tokens": 200
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        logger.error(f"Groq API error: {str(e)}")
        return "- No prevention data available"

@app.post("/detect-disease")
async def detect_disease(images: List[UploadFile] = File(...), session: dict = Depends(get_current_session)):
    try:
        if len(images) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 images allowed")

        results = []
        errors = []

        for image in images:
            if not image.content_type.startswith("image/"):
                errors.append(f"Invalid file: {image.filename}")
                continue

            try:
                content = await image.read()
                plant_result = await detect_plant_disease(content)
                assessment = plant_result.get("health_assessment", {})
                plant_name = assessment.get("plant", {}).get("name", None)

                is_healthy = assessment.get("is_healthy", False)
                healthy_prob = is_healthy.get("probability", 0) if isinstance(is_healthy, dict) else (1.0 if is_healthy else 0.0)

                diseases = []
                for disease in assessment.get("diseases", [])[:2]:
                    if disease["probability"] < 0.5:
                        continue
                    prevention = await get_prevention_methods(disease["name"], plant_name or "plant")
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
                errors.append(f"Failed to analyze {image.filename}: {str(e)}")

        if results:
            supabase.table("disease_scans").insert({
                "user_id": session["user_id"],
                "results": results,
                "created_at": datetime.utcnow().isoformat()
            }).execute()

        if not results and errors:
            raise HTTPException(status_code=400, detail={"message": "No valid results", "errors": errors})

        logger.info(f"Disease detection for {session['email']}: {len(results)} results, {len(errors)} errors")
        return {"results": results, "errors": errors}
    except Exception as e:
        logger.error(f"Disease detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/update-plant-name")
async def update_plant_name(data: dict, session: dict = Depends(get_current_session)):
    try:
        plant_name = data.get("plant_name")
        disease_name = data.get("disease_name")
        if not plant_name or not disease_name:
            raise HTTPException(status_code=400, detail="Plant name and disease name required")

        prevention = await get_prevention_methods(disease_name, plant_name)
        return {"prevention": prevention}
    except Exception as e:
        logger.error(f"Update plant name error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feedback")
async def submit_feedback(feedback: dict, session: dict = Depends(get_current_session)):
    try:
        supabase.table("feedback").insert({
            "user_id": session["user_id"],
            "rating": feedback.get("rating", 0),
            "comment": feedback.get("comment", ""),
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        logger.info(f"Feedback submitted for user {session['email']}")
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        logger.error(f"Feedback error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error submitting feedback: {str(e)}")