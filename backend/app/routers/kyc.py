import base64
import datetime
import json
import os
import urllib.error
import urllib.request
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app import models, schemas, security
from app.database import get_db

router = APIRouter(prefix="/api/kyc", tags=["kyc"])


@router.get("/expiring")
def get_expiring_clients(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(
        security.get_current_user_optional
    ),
):
    horizon = datetime.datetime.utcnow() + datetime.timedelta(days=30)

    clients = []

    # Demo data is visible only when there is no authenticated user.
    if not current_user:
        clients = (
            db.query(models.Client)
            .filter(
                models.Client.is_demo == True,  # noqa: E712
                models.Client.notified == False,  # noqa: E712
                models.Client.kyc_expiry_date <= horizon,
            )
            .all()
        )

    # Authenticated users only see their own clients.
    if current_user:
        own = (
            db.query(models.Client)
            .filter(
                models.Client.owner_id == current_user.id,
                models.Client.notified == False,  # noqa: E712
                models.Client.kyc_expiry_date <= horizon,
            )
            .all()
        )
        clients.extend(own)

    return {
        "expiring_clients": [
            {
                "client_id": c.client_code,
                "full_name": c.full_name,
                "kyc_expiry_date": (
                    c.kyc_expiry_date.isoformat()
                    if c.kyc_expiry_date
                    else None
                ),
            }
            for c in clients
        ]
    }


def _gemini_verify(
    name: str,
    pan_bytes: bytes,
    aadhaar_front_bytes: bytes,
    aadhaar_back_bytes: bytes,
    selfie_bytes: bytes,
):
    """
    Ask Gemini to inspect identity documents and compare the government-ID
    portrait with the submitted selfie.

    This is an AI-assisted verification step for the prototype and should
    not be treated as a standalone legally sufficient KYC decision.
    """

    api_key = os.environ.get("GEMINI_API_KEY")
    model = os.environ.get("GEMINI_MODEL", "gemini-flash-latest").strip()

    if not api_key:
        return (
            False,
            "KYC AI verification is not configured. "
            "Set GEMINI_API_KEY on the backend.",
            None,
        )

    prompt = f"""
You are an identity-document verification assistant.

You will receive:
1. A PAN card image.
2. The front of a government identity document.
3. The back of that government identity document.
4. A live selfie of the person being onboarded.

Your task is to assess whether the person in the selfie appears to be
the same person shown in the government identity document.

Also:
- Compare the entered name with readable identity-document text.
- Inspect whether the government ID images are sufficiently clear.
- Inspect whether the selfie is sufficiently clear for comparison.
- Extract information only when it is actually readable.
- Never invent or guess missing information.
- Do not treat unreadable information as verified.

Return ONLY valid JSON with exactly this structure:

{{
  "same_person": true,
  "face_match": true,
  "confidence": 0.0,
  "name_match": true,
  "document_quality": true,
  "selfie_quality": true,
  "reason": "brief explanation",
  "pan_masked": null,
  "dob": null,
  "address": null
}}

Rules:
- "confidence" must be a number from 0 to 1.
- "same_person" must be false when the face comparison is inconclusive.
- "face_match" must describe only the apparent face match.
- "name_match" must describe whether the entered name reasonably matches
  the readable document name.
- Set "document_quality" to false if the identity document cannot be
  meaningfully inspected.
- Set "selfie_quality" to false if the selfie is unsuitable for comparison.
- Do not infer identity from name alone.
- Do not invent PAN, DOB, or address.
- Use null for unreadable fields.

Entered name:
{name}
""".strip()

    parts = [{"text": prompt}]

    image_inputs = [
        ("PAN", pan_bytes),
        ("Government ID front", aadhaar_front_bytes),
        ("Government ID back", aadhaar_back_bytes),
        ("Live selfie", selfie_bytes),
    ]

    for label, image_bytes in image_inputs:
        parts.append({"text": label})

        parts.append(
            {
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": base64.b64encode(image_bytes).decode("utf-8"),
                }
            }
        )

    payload = json.dumps(
        {
            "contents": [
                {
                    "parts": parts,
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0,
            },
        }
    ).encode("utf-8")

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )

    try:
        request = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Content-Type": "application/json",
            },
            method="POST",
        )

        with urllib.request.urlopen(request, timeout=45) as response:
            raw = json.loads(response.read().decode("utf-8"))

        candidates = raw.get("candidates") or []

        if not candidates:
            return (
                False,
                "Gemini did not return a verification result.",
                None,
            )

        content = candidates[0].get("content") or {}
        response_parts = content.get("parts") or []

        if not response_parts:
            return (
                False,
                "Gemini returned an empty verification response.",
                None,
            )

        text = response_parts[0].get("text", "").strip()

        if not text:
            return (
                False,
                "Gemini returned an empty verification response.",
                None,
            )

        data = json.loads(text)

        confidence = float(data.get("confidence", 0))

        same_person = bool(data.get("same_person", False))
        face_match = bool(data.get("face_match", False))
        name_match = bool(data.get("name_match", False))
        document_quality = bool(data.get("document_quality", False))
        selfie_quality = bool(data.get("selfie_quality", False))

        # Conservative verification rule.
        verified = (
            same_person
            and face_match
            and name_match
            and document_quality
            and selfie_quality
            and confidence >= 0.75
        )

        if not verified:
            reason = (
                data.get("reason")
                or "The submitted documents and selfie could not be "
                   "confidently verified."
            )

            return False, reason, data

        return True, None, data

    except urllib.error.HTTPError as exc:
        try:
            error_body = exc.read().decode("utf-8", errors="ignore")
            error_json = json.loads(error_body)
            api_message = (
                error_json.get("error", {}).get("message")
                or "Gemini API request failed."
            )
        except Exception:
            api_message = "Gemini API request failed."

        print(f"Gemini HTTP error {exc.code}: {api_message}")

        return (
            False,
            "AI verification could not be completed. Please retry.",
            None,
        )

    except urllib.error.URLError as exc:
        print(f"Gemini connection error: {exc}")

        return (
            False,
            "Could not connect to the AI verification service. Please retry.",
            None,
        )

    except (ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"Gemini response parsing error: {exc}")

        return (
            False,
            "The AI verification service returned an invalid response. "
            "Please retry.",
            None,
        )

    except Exception as exc:
        print(f"Unexpected Gemini verification error: {exc}")

        return (
            False,
            "AI verification could not be completed. "
            "Please retry with clearer images.",
            None,
        )


@router.post("/onboard")
async def onboard_client(
    name: str = Form(...),
    pan: UploadFile = File(...),
    aadhaar_front: UploadFile = File(...),
    aadhaar_back: UploadFile = File(...),
    selfie: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    pan_bytes = await pan.read()
    front_bytes = await aadhaar_front.read()
    back_bytes = await aadhaar_back.read()
    selfie_bytes = await selfie.read()

    ok, reason, data = _gemini_verify(
        name=name,
        pan_bytes=pan_bytes,
        aadhaar_front_bytes=front_bytes,
        aadhaar_back_bytes=back_bytes,
        selfie_bytes=selfie_bytes,
    )

    if not ok:
        return {
            "status": "failed",
            "reason": reason,
        }

    if not data:
        return {
            "status": "failed",
            "reason": "No verification data was returned.",
        }

    existing_count = (
        db.query(models.Client)
        .filter(models.Client.owner_id == current_user.id)
        .count()
    )

    client_code = f"U{current_user.id}-{existing_count + 1:03d}"

    client = models.Client(
        owner_id=current_user.id,
        is_demo=False,
        client_code=client_code,
        full_name=name,
        pan_masked=data.get("pan_masked"),
        dob=data.get("dob"),
        address=data.get("address"),
        kyc_status="Verified",
        # Kept intentionally short so the expiry-notification workflow
        # becomes visible soon after onboarding.
        kyc_expiry_date=datetime.datetime.utcnow()
        + datetime.timedelta(days=25),
        notified=False,
        profit=0,
        status="Up",
    )

    db.add(client)
    db.commit()
    db.refresh(client)

    return {
        "status": "success",
        "message": f"{name} has been successfully onboarded and verified.",
        "data": {
            "Name": name,
            "PAN Number (Masked)": data.get("pan_masked"),
            "DOB": data.get("dob"),
            "Address": data.get("address"),
            "Client Code": client.client_code,
            "Verification Confidence": data.get("confidence"),
        },
    }