from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, security

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/generate-margin-report")
def generate_margin_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    demo_rows = db.query(models.MarginTrade).filter(models.MarginTrade.is_demo == True).all()  # noqa: E712
    own_rows = db.query(models.MarginTrade).filter(models.MarginTrade.owner_id == current_user.id).all()

    lines = ["client_id,stock,trade_type,margin_required,margin_available,margin_status"]
    for r in demo_rows + own_rows:
        lines.append(
            f"{r.client_id},{r.stock},{r.trade_type},{r.margin_required},{r.margin_available},{r.margin_status}"
        )

    csv_text = "\n".join(lines) + "\n"
    return PlainTextResponse(content=csv_text, media_type="text/csv")
