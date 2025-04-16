from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LoginRequest(BaseModel):
    email: str
    password: str
    category: str

class LoginResponse(BaseModel):
    session_id: str
    first_name: str
    last_name: str
    email: str

class SignupRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    mobile: str
    category: str

class SignupResponse(BaseModel):
    message: str
    email: str

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

class LogoutRequest(BaseModel):
    session_id: str

class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    mobile: Optional[str] = None
    address: Optional[str] = None
    farm_size: Optional[str] = None
    main_crops: Optional[str] = None
    experience: Optional[str] = None

class UserResponse(BaseModel):
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