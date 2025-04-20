from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime, date
from bs4 import BeautifulSoup
import requests
import module1
from utils import supabase, get_current_session, logger

app = FastAPI()

DAILY_TIPS = [
    "Check soil moisture levels daily for optimal crop health and water conservation.",
    "Rotate crops seasonally to prevent soil depletion and reduce pest buildup.",
    "Use companion planting to naturally deter pests and boost crop yields.",
    "Apply mulch to retain soil moisture and suppress weeds effectively.",
    "Monitor weather forecasts to plan irrigation and protect crops from storms.",
    "Test soil pH regularly to ensure optimal nutrient availability for plants.",
    "Prune fruit trees in late winter to encourage healthy spring growth.",
    "Use organic compost to enrich soil and promote sustainable farming.",
    "Inspect crops weekly for early signs of disease or pest infestation.",
    "Harvest rainwater to reduce dependency on external water sources."
]

events_cache: Dict[str, List[dict]] = {"date": "", "events": []}

@app.get("/daily-tip")
async def get_daily_tip(session: dict = Depends(get_current_session)):
    try:
        day_of_year = datetime.now().timetuple().tm_yday
        tip_index = day_of_year % len(DAILY_TIPS)
        tip = DAILY_TIPS[tip_index]
        
        logger.info(f"Serving daily tip: {tip}")
        return {"tip": tip}
    except Exception as e:
        logger.error(f"Daily tip error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching daily tip: {str(e)}")

async def scrape_events():
    url = "https://www.eventbrite.com/d/online/agriculture--events/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        events = []
        event_items = (
            soup.select("div.search-event-card-wrapper") or
            soup.select("div.eds-event-card") or
            soup.select("section.eds-event-card--content")
        )
        logger.info(f"Found {len(event_items)} event items")

        for item in event_items[:3]:
            name_elem = (
                item.select_one("h2.eds-event-card__title") or
                item.select_one("h3.eds-event-card-content__title") or
                item.select_one("div.event-card-details h3")
            )
            date_elem = (
                item.select_one("p.eds-text-color--ui-600") or
                item.select_one("div.eds-text-color--ui-600") or
                item.select_one("div.event-card__date")
            )
            location_elem = (
                item.select_one("p.eds-event-card__sub-title") or
                item.select_one("div.eds-event-card__sub-content") or
                item.select_one("div.event-card__location")
            )

            name = name_elem.get_text(strip=True) if name_elem else "Unknown Event"
            date_text = date_elem.get_text(strip=True) if date_elem else "TBA"
            location = location_elem.get_text(strip=True) if location_elem else "Online"

            logger.debug(f"Parsed event: {name}, {date_text}, {location}")
            events.append({
                "name": name,
                "date": date_text,
                "location": location
            })

        if not events:
            logger.warning("No events parsed from Eventbrite")
        
        events_cache["date"] = date.today().isoformat()
        events_cache["events"] = events
        logger.info(f"Scraped {len(events)} events from Eventbrite")
        return events
    except Exception as e:
        logger.error(f"Scraping error: {str(e)}")
        return events_cache["events"]

@app.get("/events")
async def get_events(session: dict = Depends(get_current_session)):
    try:
        current_date = date.today().isoformat()
        if events_cache["date"] == current_date and events_cache["events"]:
            logger.info("Serving cached events")
            return {"events": events_cache["events"]}
        
        events = await scrape_events()
        if not events:
            logger.warning("No events found, returning fallback")
            return {"events": [
                {"name": "Sustainable Agriculture Summit", "date": "TBA", "location": "Online"},
                {"name": "Organic Farming Workshop", "date": "TBA", "location": "Online"}
            ]}
        
        return {"events": events}
    except Exception as e:
        logger.error(f"Events error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching events: {str(e)}")

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
                plant_result = await module1.detect_plant_disease(content)
                assessment = plant_result.get("health_assessment", {})
                plant_name = assessment.get("plant", {}).get("name", None)

                is_healthy = assessment.get("is_healthy", False)
                healthy_prob = is_healthy.get("probability", 0) if isinstance(is_healthy, dict) else (1.0 if is_healthy else 0.0)

                diseases = []
                for disease in assessment.get("diseases", [])[:2]:
                    if disease["probability"] < 0.5:
                        continue
                    prevention = await module1.get_prevention_methods(disease["name"], plant_name or "plant")
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

        prevention = await module1.get_prevention_methods(disease_name, plant_name)
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