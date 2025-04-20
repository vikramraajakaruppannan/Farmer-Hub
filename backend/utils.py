from fastapi import HTTPException, Header
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import random
import string
import smtplib
from email.mime.text import MIMEText
import logging
from typing import Dict, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_TIMEOUT = 15

sessions: Dict[str, dict] = {}
reset_codes = {}

def send_reset_email(email: str, code: str) -> bool:
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured, falling back to console")
        print(f"Reset code for {email}: {code}")
        return False

    try:
        msg = MIMEText(f"Your AgriTech verification code is: {code}\n\nThis code expires in 10 minutes.")
        msg['Subject'] = 'AgriTech Password Reset Code'
        msg['From'] = SMTP_USER
        msg['To'] = email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=SMTP_TIMEOUT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Successfully sent reset code to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        print(f"Reset code for {email}: {code}")
        return False

async def get_current_session(x_session_id: Optional[str] = Header(None)):
    if not x_session_id or x_session_id not in sessions:
        raise HTTPException(status_code=401, detail="Invalid or missing session ID")
    return sessions[x_session_id]

async def get_session(x_session_id: str = Header(...)):
    if not x_session_id or x_session_id not in sessions:
        raise HTTPException(status_code=401, detail="Invalid or missing session ID")
    return sessions[x_session_id]