import io
import datetime

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from app.database import get_db
from app import models, security

router = APIRouter(prefix="/api/surveillance", tags=["surveillance"])

# A trade is flagged as potentially suspicious if its notional value
# (quantity * price) crosses this threshold -- a simple, explainable
# stand-in for a real surveillance/pattern-detection engine.
NOTIONAL_THRESHOLD = 1_000_000


@router.get("/run-check")
def run_surveillance_check(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    demo_rows = db.query(models.WatchdogTrade).filter(models.WatchdogTrade.is_demo == True).all()  # noqa: E712
    own_rows = db.query(models.WatchdogTrade).filter(models.WatchdogTrade.owner_id == current_user.id).all()

    flagged = []
    for r in demo_rows + own_rows:
        notional = (r.quantity or 0) * (r.price or 0)
        if notional >= NOTIONAL_THRESHOLD:
            flagged.append((r, notional))

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, title="Suspicious Activity Report")
    styles = getSampleStyleSheet()
    elements = [
        Paragraph("BrokerVerse — Suspicious Activity Report", styles["Title"]),
        Paragraph(f"Generated: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]),
        Spacer(1, 16),
    ]

    if flagged:
        data = [["Client ID", "Stock", "Trade Type", "Quantity", "Price", "Notional Value"]]
        for r, notional in flagged:
            data.append([r.client_id, r.stock, r.trade_type, str(r.quantity), f"{r.price:,.2f}", f"{notional:,.2f}"])

        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#E2E8F0")]),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 16))
        elements.append(Paragraph(
            f"{len(flagged)} trade(s) exceeded the notional value threshold of "
            f"₹{NOTIONAL_THRESHOLD:,.0f} and were flagged for manual review.",
            styles["Normal"],
        ))
    else:
        elements.append(Paragraph("No suspicious trading activity was detected in this scan.", styles["Normal"]))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Suspicious_Activity_Report.pdf"},
    )
