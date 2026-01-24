# backend/config/settings.py
from pydantic_settings import BaseSettings
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Initialize Supabase
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)