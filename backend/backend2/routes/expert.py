# backend/routes/expert.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
import logging

from utils.session import get_current_session
from config.settings import supabase, settings  # settings has SMTP config

logger = logging.getLogger(__name__)

router = APIRouter()

# ------------------------------------------------------------------
# Pydantic Models
# ------------------------------------------------------------------
class AppointmentRequestCreate(BaseModel):
    expert_id: UUID
    full_name: str
    mobile: str
    location: str
    crop_name: str
    issue: str
    reason: str

class AppointmentRequestAction(BaseModel):
    token: UUID
    action: str  # 'approve' or 'decline'
    decline_reason: Optional[str] = None

class NotificationFeedback(BaseModel):
    rating: int
    comment: Optional[str] = None

# ------------------------------------------------------------------
# GET /experts
# ------------------------------------------------------------------
@router.get("/experts")
async def get_experts():
    try:
        response = supabase.table("experts").select("*").execute()
        logger.info(f"Fetched {len(response.data)} experts")
        return response.data
    except Exception as e:
        logger.error(f"Error fetching experts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch experts")

# ------------------------------------------------------------------
# POST /appointment_requests
# ------------------------------------------------------------------
@router.post("/appointment_requests")
async def create_appointment_request(
    request_data: AppointmentRequestCreate,
    session: dict = Depends(get_current_session)
):
    try:
        # Verify expert exists
        expert = supabase.table("experts").select("id, name, email").eq("id", str(request_data.expert_id)).single().execute()
        if not expert.data:
            raise HTTPException(status_code=404, detail="Expert not found")

        # Create request
        token = uuid4()
        request_payload = {
            "farmer_id": session["user_id"],
            "expert_id": str(request_data.expert_id),
            "full_name": request_data.full_name,
            "mobile": request_data.mobile,
            "location": request_data.location,
            "crop_name": request_data.crop_name,
            "issue": request_data.issue,
            "reason": request_data.reason,
            "status": "pending",
            "token": str(token),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        response = supabase.table("appointment_requests").insert(request_payload).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create request")

        request_id = response.data[0]["id"]

        # Send email to expert
        approval_link = f"http://localhost:8080/expert/approve-decline/{token}"
        email_body = f"""
Dear {expert.data["name"]},

You have a new appointment request from {request_data.full_name}.

Crop: {request_data.crop_name}
Issue: {request_data.issue}
Reason: {request_data.reason}
Location: {request_data.location}

Please review:
{approval_link}

Regards,
AgriTech Team
        """.strip()

        if not send_email(
            to_email=expert.data["email"],
            subject="New Appointment Request",
            body=email_body
        ):
            logger.warning(f"Email failed to {expert.data['email']}, but request created")

        logger.info(f"Request {request_id} created by {session['email']} for expert {expert.data['name']}")
        return {"message": "Request submitted", "request_id": request_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Server error")

# ------------------------------------------------------------------
# POST /appointment_requests/action
# ------------------------------------------------------------------
@router.post("/appointment_requests/action")
async def handle_appointment_request_action(action_data: AppointmentRequestAction):
    try:
        request = supabase.table("appointment_requests").select("*").eq("token", str(action_data.token)).single().execute()
        if not request.data:
            raise HTTPException(status_code=404, detail="Invalid or expired token")
        if request.data["status"] != "pending":
            raise HTTPException(status_code=400, detail="Request already processed")

        # Validate action
        if action_data.action not in ["approve", "decline"]:
            raise HTTPException(status_code=400, detail="Action must be 'approve' or 'decline'")
        if action_data.action == "decline" and not action_data.decline_reason:
            raise HTTPException(status_code=400, detail="Decline reason required")

        # Update request
        update_data = {
            "status": action_data.action,
            "updated_at": datetime.utcnow().isoformat()
        }
        if action_data.action == "decline":
            update_data["decline_reason"] = action_data.decline_reason

        supabase.table("appointment_requests").update(update_data).eq("id", request.data["id"]).execute()

        # Create notification
        notif_status = "confirmed" if action_data.action == "approve" else "declined"
        notif_payload = {
            "id": str(uuid4()),
            "farmer_id": request.data["farmer_id"],
            "appointment_request_id": request.data["id"],
            "status": notif_status,
            "type": "appointment",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        supabase.table("notifications").insert(notif_payload).execute()

        # Notify farmer
        farmer = supabase.table("profiles").select("email, first_name").eq("id", request.data["farmer_id"]).single().execute()
        if farmer.data:
            farmer_body = f"""
Dear {farmer.data["first_name"]},

Your appointment request has been **{action_data.action.upper()}**.

Crop: {request.data["crop_name"]}
Issue: {request.data["issue"]}
{f"Decline Reason: {action_data.decline_reason}" if action_data.action == "decline" else ""}

Thank you,
AgriTech Team
            """.strip()
            send_email(
                to_email=farmer.data["email"],
                subject=f"Appointment {action_data.action.capitalize()}",
                body=farmer_body
            )

        logger.info(f"Request {request.data['id']} {action_data.action}d")
        return {"message": f"Request {action_data.action}d"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Action error: {str(e)}")
        raise HTTPException(status_code=500, detail="Action failed")

# ------------------------------------------------------------------
# GET /appointment_requests (by token)
# ------------------------------------------------------------------
@router.get("/appointment_requests")
async def get_appointment_request(token: str):
    try:
        response = supabase.table("appointment_requests").select("*").eq("token", token).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Invalid token")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fetch request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Server error")

# ------------------------------------------------------------------
# GET /notifications
# ------------------------------------------------------------------
@router.get("/notifications")
async def get_notifications(session: dict = Depends(get_current_session)):
    try:
        notifs = supabase.table("notifications").select("*").eq("farmer_id", session["user_id"]).execute()
        if not notifs.data:
            return []

        result = []
        for n in notifs.data:
            ar = supabase.table("appointment_requests").select("*").eq("id", n["appointment_request_id"]).single().execute()
            if not ar.data:
                continue
            expert = supabase.table("experts").select("name, email, phone").eq("id", ar.data["expert_id"]).single().execute()
            expert_data = expert.data or {"name": "Unknown", "email": None, "phone": None}

            result.append({
                "id": n["id"],
                "farmerName": ar.data["full_name"],
                "query": ar.data["reason"],
                "description": ar.data["issue"],
                "status": n["status"],
                "expertName": expert_data["name"],
                "expertEmail": expert_data["email"] if n["status"] == "confirmed" else None,
                "expertPhone": expert_data["phone"] if n["status"] == "confirmed" else None,
                "declineReason": ar.data.get("decline_reason"),
                "timestamp": n["created_at"],
                "type": n["type"],
                "feedback": {
                    "rating": n["feedback_rating"],
                    "comment": n["feedback_comment"]
                }
            })

        logger.info(f"Fetched {len(result)} notifications for {session['email']}")
        return result

    except Exception as e:
        logger.error(f"Notifications error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load notifications")

# ------------------------------------------------------------------
# POST /notifications/{notification_id}/feedback
# ------------------------------------------------------------------
@router.post("/notifications/{notification_id}/feedback")
async def submit_notification_feedback(
    notification_id: UUID,
    feedback: NotificationFeedback,
    session: dict = Depends(get_current_session)
):
    try:
        notif = supabase.table("notifications").select("*").eq("id", str(notification_id)).eq("farmer_id", session["user_id"]).single().execute()
        if not notif.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        if notif.data["status"] != "confirmed":
            raise HTTPException(status_code=400, detail="Feedback only for confirmed appointments")

        if feedback.rating < 1 or feedback.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be 1–5")

        update = {
            "feedback_rating": feedback.rating,
            "feedback_comment": feedback.comment,
            "status": "feedbackProvided",
            "updated_at": datetime.utcnow().isoformat()
        }
        supabase.table("notifications").update(update).eq("id", str(notification_id)).execute()

        logger.info(f"Feedback submitted for {notification_id}")
        return {"message": "Thank you for your feedback!"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Feedback error: {str(e)}")
        raise HTTPException(status_code=500, detail="Feedback failed")

# ------------------------------------------------------------------
# DELETE /notifications/{notification_id}
# ------------------------------------------------------------------
@router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: UUID, session: dict = Depends(get_current_session)):
    try:
        res = supabase.table("notifications").delete().eq("id", str(notification_id)).eq("farmer_id", session["user_id"]).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Not found or unauthorized")
        logger.info(f"Notification {notification_id} deleted")
        return {"message": "Deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete error: {str(e)}")
        raise HTTPException(status_code=500, detail="Delete failed")

# ------------------------------------------------------------------
# Helper: Send Email
# ------------------------------------------------------------------
def send_email(to_email: str, subject: str, body: str) -> bool:
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured. Printing email.")
        print(f"\n--- EMAIL TO {to_email} ---\nSubject: {subject}\n\n{body}\n---")
        return False

    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_USER
        msg['To'] = to_email

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Email failed to {to_email}: {str(e)}")
        print(f"\n--- EMAIL TO {to_email} ---\nSubject: {subject}\n\n{body}\n---")
        return False