import csv
import io
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, security

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

DEFAULT_REQUIRED_FUNDS = 500_000.0


@router.post("/check-funds")
async def check_funds(
    bank_statement: UploadFile = File(...),
    required_funds: Optional[float] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    raw = await bank_statement.read()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Could not read the uploaded file as text/CSV.")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="The CSV file appears to be empty.")

    normalized_fields = {f.strip().lower(): f for f in reader.fieldnames}

    def col(row, *names):
        for n in names:
            key = normalized_fields.get(n)
            if key and row.get(key):
                return row.get(key)
        return None

    balance = 0.0
    rows_seen = 0
    for row in reader:
        rows_seen += 1
        credit_raw = col(row, "credit", "credit_amount", "deposit")
        debit_raw = col(row, "debit", "debit_amount", "withdrawal")
        amount_raw = col(row, "amount")
        type_raw = (col(row, "type", "transaction_type") or "").strip().lower()

        def to_float(v):
            try:
                return float(str(v).replace(",", "").strip())
            except (TypeError, ValueError):
                return 0.0

        if credit_raw or debit_raw:
            balance += to_float(credit_raw) - to_float(debit_raw)
        elif amount_raw:
            amt = to_float(amount_raw)
            if type_raw in ("debit", "withdrawal"):
                balance -= abs(amt)
            else:
                balance += amt if type_raw in ("credit", "deposit", "") else amt

    if rows_seen == 0:
        raise HTTPException(status_code=400, detail="No transaction rows were found in the CSV file.")

    required = required_funds if required_funds and required_funds > 0 else DEFAULT_REQUIRED_FUNDS
    surplus = round(balance - required, 2)
    status_ = "PASS" if surplus >= 0 else "FAIL"

    db.add(models.FundsCheckLog(
        owner_id=current_user.id,
        actual_balance=round(balance, 2),
        required_funds=required,
        surplus=surplus,
        status=status_,
    ))
    db.commit()

    return {
        "status": status_,
        "surplus": f"{surplus}",
        "actual_balance": f"{round(balance, 2)}",
        "required_funds": f"{required}",
    }
