from sqlalchemy import Column, String, Enum, ForeignKey, Numeric, DateTime, CHAR, Boolean, Date
from sqlalchemy.orm import relationship
from db_models.base import Base, UUIDMixin, TimestampMixin
import enum

class PaymentMode(str, enum.Enum):
    CASH = "Cash"
    CARD = "Card"
    UPI = "UPI"
    OTHER = "Other"

class POSSaleHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "pos_sale_headers"
    date = Column(DateTime, nullable=False)
    total = Column(Numeric(20, 2), nullable=False)
    payment_mode = Column(Enum(PaymentMode), nullable=False)
    customer_id = Column(CHAR(36), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("POSSaleDetail", back_populates="header", cascade="all, delete-orphan")

class POSSaleDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "pos_sale_details"
    sale_id = Column(ForeignKey("pos_sale_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    unit_price = Column(Numeric(20, 2), nullable=False)
    subtotal = Column(Numeric(20, 2), nullable=False)
    discount = Column(Numeric(20, 2), default=0.00)

    header = relationship("POSSaleHeader", back_populates="lines")

class ShiftReportHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "shift_report_headers"
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    total_sales = Column(Numeric(20, 2), default=0.00)
    cashier_id = Column(CHAR(36), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("ShiftReportDetail", back_populates="header", cascade="all, delete-orphan")

class ShiftReportDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "shift_report_details"
    shift_id = Column(ForeignKey("shift_report_headers.id"), nullable=False)
    sale_id = Column(ForeignKey("pos_sale_headers.id"), nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    mode = Column(Enum(PaymentMode), nullable=False)

    header = relationship("ShiftReportHeader", back_populates="lines")

class LoyaltyProgram(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "loyalty_programs"
    customer_id = Column(CHAR(36), unique=True, nullable=False)
    points = Column(Numeric(20, 2), default=0.00)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

# Module 8: Payments & Banking
class BankTransactionHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bank_transaction_headers"
    date = Column(Date, nullable=False)
    total_amount = Column(Numeric(20, 2), nullable=False)
    reconciled = Column(Boolean, default=False)
    bank_account_id = Column(CHAR(36), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("BankTransactionDetail", back_populates="header", cascade="all, delete-orphan")

class BankTransactionDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bank_transaction_details"
    tx_id = Column(ForeignKey("bank_transaction_headers.id"), nullable=False)
    description = Column(String(500), nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    cheque_no = Column(String(50), nullable=True)
    match_id = Column(CHAR(36), nullable=True)  # Link to payment_headers or allocations

    header = relationship("BankTransactionHeader", back_populates="lines")
