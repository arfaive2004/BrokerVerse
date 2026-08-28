from sqlalchemy import (
    Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey,
    CheckConstraint, Index, func, text,
)
from sqlalchemy.sql import false as sa_false
from sqlalchemy.orm import relationship
from app.database import Base

# Monetary columns use Numeric(14, 2) rather than Float. Floats use binary
# fractions internally, so amounts like 0.1 + 0.2 don't land on exactly 0.3 --
# a real (if usually small) source of rounding drift that has no place in a
# brokerage ledger. Numeric stores an exact decimal value instead.
MONEY = Numeric(14, 2)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    broker_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    clients = relationship("Client", back_populates="owner", cascade="all, delete-orphan")
    margin_trades = relationship("MarginTrade", back_populates="owner", cascade="all, delete-orphan")
    watchdog_trades = relationship("WatchdogTrade", back_populates="owner", cascade="all, delete-orphan")
    funds_check_logs = relationship("FundsCheckLog", back_populates="owner", cascade="all, delete-orphan")


class Client(Base):
    __tablename__ = "clients"
    __table_args__ = (
        CheckConstraint("status IN ('Up', 'Down')", name="ck_clients_status"),
        Index("ix_clients_owner_is_demo", "owner_id", "is_demo"),
    )

    id = Column(Integer, primary_key=True, index=True)
    # owner_id is nullable on purpose: NULL + is_demo=True marks the global
    # seed data every visitor sees before signing in. A real signed-up user's
    # clients always have owner_id set and is_demo=False.
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    is_demo = Column(Boolean, nullable=False, default=False, server_default=sa_false())

    client_code = Column(String, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    pan_masked = Column(String, nullable=True)
    dob = Column(String, nullable=True)
    address = Column(String, nullable=True)
    kyc_status = Column(String, nullable=False, default="Verified", server_default=text("'Verified'"))
    kyc_expiry_date = Column(DateTime(timezone=True), nullable=True)
    notified = Column(Boolean, nullable=False, default=False, server_default=sa_false())
    profit = Column(MONEY, nullable=False, default=0, server_default=text("0"))
    status = Column(String, nullable=False, default="Up", server_default=text("'Up'"))  # Up / Down for the dashboard badge
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="clients")


class MarginTrade(Base):
    __tablename__ = "margin_trades"
    __table_args__ = (
        CheckConstraint("trade_type IN ('BUY', 'SELL')", name="ck_margin_trades_trade_type"),
        CheckConstraint("margin_status IN ('OK', 'issue')", name="ck_margin_trades_margin_status"),
        Index("ix_margin_trades_owner_is_demo", "owner_id", "is_demo"),
    )

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    is_demo = Column(Boolean, nullable=False, default=False, server_default=sa_false())

    client_id = Column(String, nullable=False, index=True)
    stock = Column(String, nullable=False)
    trade_type = Column(String, nullable=False)  # BUY / SELL
    margin_required = Column(MONEY, nullable=False)
    margin_available = Column(MONEY, nullable=False)
    margin_status = Column(String, nullable=False)  # OK / issue
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    owner = relationship("User", back_populates="margin_trades")


class WatchdogTrade(Base):
    __tablename__ = "watchdog_trades"
    __table_args__ = (
        CheckConstraint("trade_type IN ('BUY', 'SELL')", name="ck_watchdog_trades_trade_type"),
        Index("ix_watchdog_trades_owner_is_demo", "owner_id", "is_demo"),
    )

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    is_demo = Column(Boolean, nullable=False, default=False, server_default=sa_false())

    client_id = Column(String, nullable=False, index=True)
    stock = Column(String, nullable=False)
    trade_type = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(MONEY, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    owner = relationship("User", back_populates="watchdog_trades")


class FundsCheckLog(Base):
    __tablename__ = "funds_check_logs"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    actual_balance = Column(MONEY, nullable=False)
    required_funds = Column(MONEY, nullable=False)
    surplus = Column(MONEY, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    owner = relationship("User", back_populates="funds_check_logs")
