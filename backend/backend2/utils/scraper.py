# backend/utils/scraper.py
import requests
from bs4 import BeautifulSoup
from datetime import date

events_cache = {"date": "", "events": []}

def scrape_events():
    url = "https://www.eventbrite.com/d/online/agriculture--events/"
    try:
        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        events = []
        for item in soup.select("div.search-event-card-wrapper")[:3]:
            name = item.select_one("h3") or item.select_one("h2")
            date_elem = item.select_one("p.eds-text-color--ui-600")
            events.append({
                "name": name.get_text(strip=True) if name else "Event",
                "date": date_elem.get_text(strip=True) if date_elem else "TBA",
                "location": "Online"
            })
        events_cache["date"] = date.today().isoformat()
        events_cache["events"] = events
        return events
    except:
        return [{"name": "Agri Summit", "date": "TBA", "location": "Online"}]