import datetime
from sqlalchemy.orm import Session
from app import models


def seed_demo_data(db: Session) -> None:
    """Populate the database with global demo data (owner_id=None) the very
    first time the app runs, so first-time visitors always see a populated
    BrokerVerse dashboard even before creating an account."""

    if db.query(models.Client).filter(models.Client.is_demo == True).first():  # noqa: E712
        return  # already seeded

    now = datetime.datetime.utcnow()

    demo_clients = [
        {"client_code": "CL1001", "full_name": "Ashok Kumar", "profit": 520345.78, "status": "Up",
         "kyc_expiry_date": now + datetime.timedelta(days=180), "pan_masked": "XXXXX1234A"},
        {"client_code": "CL1002", "full_name": "Priya Sharma", "profit": 480912.45, "status": "Up",
         "kyc_expiry_date": now + datetime.timedelta(days=210), "pan_masked": "XXXXX5678B"},
        {"client_code": "CL1003", "full_name": "Rahul Verma", "profit": 450123.90, "status": "Down",
         "kyc_expiry_date": now + datetime.timedelta(days=12), "pan_masked": "XXXXX9012C"},
        {"client_code": "CL1004", "full_name": "Sunita Singh", "profit": 399876.12, "status": "Up",
         "kyc_expiry_date": now + datetime.timedelta(days=300), "pan_masked": "XXXXX3456D"},
        {"client_code": "CL1005", "full_name": "Vikram Mehta", "profit": 350654.32, "status": "Down",
         "kyc_expiry_date": now + datetime.timedelta(days=20), "pan_masked": "XXXXX7890E"},
        {"client_code": "CL1006", "full_name": "Neha Kapoor", "profit": 210044.00, "status": "Up",
         "kyc_expiry_date": now + datetime.timedelta(days=365), "pan_masked": "XXXXX2468F"},
    ]

    for c in demo_clients:
        db.add(models.Client(
            owner_id=None,
            is_demo=True,
            client_code=c["client_code"],
            full_name=c["full_name"],
            pan_masked=c["pan_masked"],
            dob="1990-01-01",
            address="Mumbai, Maharashtra",
            kyc_status="Verified",
            kyc_expiry_date=c["kyc_expiry_date"],
            notified=False,
            profit=c["profit"],
            status=c["status"],
        ))

    demo_margin = [
        ("CL1001", "RELIANCE", "BUY", 250000, 300000, "OK"),
        ("CL1002", "TCS", "SELL", 180000, 120000, "issue"),
        ("CL1003", "INFY", "BUY", 90000, 95000, "OK"),
        ("CL1004", "HDFCBANK", "BUY", 310000, 280000, "issue"),
        ("CL1005", "ICICIBANK", "SELL", 150000, 200000, "OK"),
        ("CL1006", "SBIN", "BUY", 75000, 60000, "issue"),
        ("CL1001", "TATAMOTORS", "SELL", 60000, 80000, "OK"),
        ("CL1002", "WIPRO", "BUY", 45000, 42000, "issue"),
    ]
    for client_id, stock, trade_type, req, avail, status_ in demo_margin:
        db.add(models.MarginTrade(
            owner_id=None,
            is_demo=True,
            client_id=client_id,
            stock=stock,
            trade_type=trade_type,
            margin_required=req,
            margin_available=avail,
            margin_status=status_,
        ))

    demo_watchdog = [
        ("CL1001", "RELIANCE", "BUY", 5000, 2800),
        ("CL1002", "TCS", "SELL", 8000, 3900),
        ("CL1003", "INFY", "BUY", 200, 1500),
        ("CL1005", "ICICIBANK", "SELL", 12000, 950),
        ("CL1006", "SBIN", "BUY", 150, 600),
    ]
    for client_id, stock, trade_type, qty, price in demo_watchdog:
        db.add(models.WatchdogTrade(
            owner_id=None,
            is_demo=True,
            client_id=client_id,
            stock=stock,
            trade_type=trade_type,
            quantity=qty,
            price=price,
        ))

    db.commit()
