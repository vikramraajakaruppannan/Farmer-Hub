# backend/utils/email.py
import smtplib
from email.mime.text import MIMEText
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

def send_reset_email(email: str, code: str) -> bool:
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured. Code in console.")
        print(f"Reset code for {email}: {code}")
        return False

    try:
        msg = MIMEText(f"Your reset code: {code}\nExpires in 10 mins.")
        msg['Subject'] = 'AgriTech Reset Code'
        msg['From'] = settings.SMTP_USER
        msg['To'] = email

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Reset code email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Email failed: {e}")
        print(f"Code: {code}")
        return False