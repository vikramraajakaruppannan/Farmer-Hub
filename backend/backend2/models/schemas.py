# backend/models/schemas.py
from pydantic import BaseModel
from typing import Optional
from typing import List

class LoginRequest(BaseModel):
    email: str
    password: str
    category: str

class LoginResponse(BaseModel):
    session_id: str
    first_name: str
    last_name: str
    email: str
    mobile: Optional[str] = None

class SignupRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    mobile: str
    category: str

class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    mobile: Optional[str] = None
    address: Optional[str] = None
    farm_size: Optional[str] = None
    main_crops: Optional[str] = None
    experience: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    mobile: Optional[str] = None
    category: str
    address: Optional[str] = None
    farm_size: Optional[str] = None
    main_crops: Optional[str] = None
    experience: Optional[str] = None
    photo_url: Optional[str] = None
