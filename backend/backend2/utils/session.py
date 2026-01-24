# backend/utils/session.py
from fastapi import Header, HTTPException, Depends
import uuid
from typing import Dict

# In-memory session store (use Redis in production)
sessions: Dict[str, dict] = {}

async def get_current_session(
    x_session_id: str = Header(..., alias="x-session-id")
):
    if x_session_id not in sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return sessions[x_session_id]

def create_session(user_id: str, email: str) -> str:
    session_id = str(uuid.uuid4())
    sessions[session_id] = {"user_id": user_id, "email": email}
    return session_id

def delete_session(session_id: str):
    sessions.pop(session_id, None)