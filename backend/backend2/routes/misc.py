# backend/routes/misc.py
from fastapi import APIRouter, Depends, HTTPException
from utils.session import get_current_session
from config.settings import supabase
from utils.scraper import scrape_events, events_cache
from datetime import date

router = APIRouter()

DAILY_TIPS = [
    "Check soil moisture daily.", "Rotate crops seasonally.", "Use mulch to retain moisture.",
    "Test soil pH regularly.", "Harvest rainwater.", "Prune in late winter.",
    "Use organic compost.", "Inspect for pests weekly.", "Monitor weather.",
    "Use companion planting."
]

@router.get("/dashboard")
async def dashboard(session: dict = Depends(get_current_session)):
    profile = supabase.table("profiles").select("category").eq("id", session["user_id"]).single().execute()
    if profile.data["category"] != "Farmer":
        raise HTTPException(403, "Farmers only")
    return {"message": f"Welcome, {session['email']}"}

@router.get("/invest")
async def invest(session: dict = Depends(get_current_session)):
    profile = supabase.table("profiles").select("category").eq("id", session["user_id"]).single().execute()
    if profile.data["category"] != "Investor":
        raise HTTPException(403, "Investors only")
    return {"message": f"Investment hub, {session['email']}"}

@router.get("/daily-tip")
async def daily_tip(session: dict = Depends(get_current_session)):
    tip = DAILY_TIPS[date.today().timetuple().tm_yday % len(DAILY_TIPS)]
    return {"tip": tip}

@router.get("/events")
async def get_events(session: dict = Depends(get_current_session)):
    if events_cache["date"] == date.today().isoformat():
        return {"events": events_cache["events"]}
    return {"events": scrape_events()}