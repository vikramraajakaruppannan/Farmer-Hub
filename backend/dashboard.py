from fastapi import FastAPI, HTTPException, Depends, Header
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging
from typing import Dict, List
from datetime import datetime, date
from bs4 import BeautifulSoup
import requests
from login import get_current_session, sessions, supabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Sample tips list
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

@app.get("/dashboard")
async def get_dashboard(session: dict = Depends(get_current_session)):
    profile = supabase.table("profiles").select("*").eq("id", session["user_id"]).single().execute()
    if profile.data["category"] != "Farmer":
        raise HTTPException(status_code=403, detail="Access denied: Farmers only")
    return {"message": f"Welcome to the dashboard, {session['email']}"}

@app.get("/invest")
async def get_invest(session: dict = Depends(get_current_session)):
    profile = supabase.table("profiles").select("*").eq("id", session["user_id"]).single().execute()
    if profile.data["category"] != "Investor":
        raise HTTPException(status_code=403, detail="Access denied: Investors only")
    return {"message": f"Welcome to the investment hub, {session['email']}"}

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

events_cache: Dict[str, List[dict]] = {"date": "", "events": []}

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