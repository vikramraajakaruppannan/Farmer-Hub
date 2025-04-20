import base64
from PIL import Image
import io
import requests
import logging
from dotenv import load_dotenv
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

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
    prompt = f"""Provide exactly 4 prevention/treatment methods for {disease_name} in {plant_name}. Use concise bullet points starting with a hyphen (-), one for each category: organic treatment, chemical solution, cultural practice, environmental adjustment. Do not include headers, introductions, or extra text."""
    
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "messages": [{"role": "user", "content": prompt}],
        "model": "llama3-70b-8192",
        "temperature": 0.7,
        "max_tokens": 400  # Increased to ensure complete output
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content']
        # Validate exactly 4 methods
        methods = [m.strip() for m in content.split('\n') if m.strip().startswith('-')]
        if len(methods) < 4:
            logger.warning(f"Only {len(methods)} methods returned for {disease_name}")
            # Fallback to generic methods
            methods = [
                "- Apply neem oil to affected areas as an organic treatment.",
                "- Use a fungicide like chlorothalonil for chemical control.",
                "- Prune infected branches to improve cultural practices.",
                "- Ensure good air circulation around the plant."
            ]
        return '\n'.join(methods[:4])
    except Exception as e:
        logger.error(f"Groq API error: {str(e)}")
        return "\n".join([
            "- Apply neem oil to affected areas as an organic treatment.",
            "- Use a fungicide like chlorothalonil for chemical control.",
            "- Prune infected branches to improve cultural practices.",
            "- Ensure good air circulation around the plant."
        ])