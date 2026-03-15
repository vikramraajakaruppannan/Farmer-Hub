import base64
from PIL import Image
import io
import httpx
import logging
from dotenv import load_dotenv
import os
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

PLANT_ID_API_KEY = os.getenv("PLANT_ID_API_KEY")
GROQ_API_KEY="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"

PLANT_HEALTH_URL = "https://api.plant.id/v2/health_assessment"
PLANT_IDENTIFY_URL = "https://api.plant.id/v2/identify"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


# ------------------------------------------------------------------
# Detect Plant Disease
# ------------------------------------------------------------------
async def detect_plant_disease(image_content: bytes):
    try:
        # Validate image
        try:
            Image.open(io.BytesIO(image_content))
        except Exception:
            raise ValueError("Invalid image format")

        img_base64 = base64.b64encode(image_content).decode("utf-8")

        headers = {
            "Content-Type": "application/json",
            "Api-Key": PLANT_ID_API_KEY
        }

        payload = {
            "images": [img_base64],
            "plant_details": ["diseases"],
            "language": "en"
        }

        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(PLANT_HEALTH_URL, headers=headers, json=payload)

            if response.status_code == 429:
                logger.warning("Plant.id rate limit exceeded")
                raise Exception("Plant API rate limit exceeded")

            response.raise_for_status()
            result = response.json()

        if "health_assessment" not in result:
            return {
                "health_assessment": {
                    "plant": {"name": None},
                    "is_healthy": False,
                    "diseases": []
                }
            }

        assessment = result["health_assessment"]
        plant = assessment.get("plant", {})
        plant_name = plant.get("name") if isinstance(plant, dict) else None

        # If plant unknown → try identify
        if not plant_name:
            logger.info("Unknown plant, attempting identification")

            id_payload = {
                "images": [img_base64],
                "plant_details": ["common_names"],
                "language": "en"
            }

            async with httpx.AsyncClient(timeout=15) as client:
                id_response = await client.post(
                    PLANT_IDENTIFY_URL,
                    headers=headers,
                    json=id_payload
                )

                if id_response.status_code == 429:
                    raise Exception("Plant Identify rate limit exceeded")

                id_response.raise_for_status()
                id_result = id_response.json()

            suggestions = id_result.get("suggestions", [])
            if suggestions:
                plant_name = suggestions[0].get("plant_details", {}).get("common_names", [None])[0]

            result["health_assessment"]["plant"] = {"name": plant_name}

        return result

    except Exception as e:
        logger.error(f"Disease detection error: {str(e)}")
        return {
            "health_assessment": {
                "plant": {"name": None},
                "is_healthy": False,
                "diseases": []
            }
        }


# ------------------------------------------------------------------
# Get Prevention Methods (Groq)
# ------------------------------------------------------------------
async def get_prevention_methods(disease_name: str, plant_name: str = "plant"):
    prompt = f"""Provide exactly 4 prevention/treatment methods for {disease_name} in {plant_name}. 
Use concise bullet points starting with a hyphen (-), one for each category:
organic treatment, chemical solution, cultural practice, environmental adjustment.
Do not include extra text."""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.6,
        "max_tokens": 300
    }


    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(GROQ_URL, headers=headers, json=payload)

            if response.status_code == 429:
                raise Exception("Groq rate limit exceeded")

            response.raise_for_status()
            content = response.json()['choices'][0]['message']['content']

        methods = [
            m.strip() for m in content.split("\n")
            if m.strip().startswith("-")
        ]

        if len(methods) < 4:
            methods = [
                "- Apply neem oil to affected areas.",
                "- Use an appropriate fungicide.",
                "- Remove infected leaves regularly.",
                "- Improve air circulation around the plant."
            ]

        return "\n".join(methods[:4])

    except Exception as e:
        logger.error(f"Groq API error: {str(e)}")
        return "\n".join([
            "- Apply neem oil to affected areas.",
            "- Use an appropriate fungicide.",
            "- Remove infected leaves regularly.",
            "- Improve air circulation around the plant."
        ])
