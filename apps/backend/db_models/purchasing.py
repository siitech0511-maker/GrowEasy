from sqlalchemy import Column, String, Enum, ForeignKey, Numeric, Date, CHAR
from sqlalchemy.orm import relationship
from db_models.base import Base, UUIDMixin, TimestampMixin
import enum

class PurchaseRequestStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class RFQStatus(str, enum.Enum):
    DRAFT = "Draft"
    SENT = "Sent"
    RECEIVED = "Received"
    CLOSED = "Closed"

class PurchaseOrderStatus(str, enum.Enum):
    PENDING = "Pending"
    ORDERED = "Ordered"
    RECEIVED = "Received"
    CANCELLED = "Cancelled"

class BillStatus(str, enum.Enum):
    DRAFT = "Draft"
    OPEN = "Open"
    PAID = "Paid"
    PARTIALLY_PAID = "Partially Paid"
    VOID = "Void"

class PurchaseRequestHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "purchase_request_headers"
    requester_id = Column(CHAR(36), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(PurchaseRequestStatus), default=PurchaseRequestStatus.PENDING, nullable=False)
    department = Column(String(100), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("PurchaseRequestDetail", back_populates="header", cascade="all, delete-orphan")

class PurchaseRequestDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "purchase_request_details"
    pr_id = Column(ForeignKey("purchase_request_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    estimated_price = Column(Numeric(20, 2), nullable=True)
    notes = Column(String(500), nullable=True)

    header = relationship("PurchaseRequestHeader", back_populates="lines")

class RFQHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "rfq_headers"
    date = Column(Date, nullable=False)
    status = Column(Enum(RFQStatus), default=RFQStatus.DRAFT, nullable=False)
    pr_id = Column(ForeignKey("purchase_request_headers.id"), nullable=True)
    deadline = Column(Date, nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("RFQDetail", back_populates="header", cascade="all, delete-orphan")

class RFQDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "rfq_details"
    rfq_id = Column(ForeignKey("rfq_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    vendor_id = Column(CHAR(36), nullable=True)
    quoted_price = Column(Numeric(20, 2), nullable=True)

    header = relationship("RFQHeader", back_populates="lines")

class PurchaseOrderHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "purchase_order_headers"
    vendor_id = Column(CHAR(36), nullable=False)
    date = Column(Date, nullable=False)
    total = Column(Numeric(20, 2), nullable=False)
    rfq_id = Column(ForeignKey("rfq_headers.id"), nullable=True)
    delivery_date = Column(Date, nullable=True)
    status = Column(Enum(PurchaseOrderStatus), default=PurchaseOrderStatus.PENDING, nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("PurchaseOrderDetail", back_populates="header", cascade="all, delete-orphan")

class PurchaseOrderDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "purchase_order_details"
    po_id = Column(ForeignKey("purchase_order_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    unit_price = Column(Numeric(20, 2), nullable=False)
    subtotal = Column(Numeric(20, 2), nullable=False)
    tax_amount = Column(Numeric(20, 2), default=0.00)

    header = relationship("PurchaseOrderHeader", back_populates="lines")

class BillHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bill_headers"
    vendor_id = Column(CHAR(36), nullable=False)
    date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)
    amount = Column(Numeric(20, 2), nullable=False)
    tds_deducted = Column(Numeric(20, 2), default=0.00)
    po_id = Column(ForeignKey("purchase_order_headers.id"), nullable=True)
    status = Column(Enum(BillStatus), default=BillStatus.DRAFT, nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("BillDetail", back_populates="header", cascade="all, delete-orphan")

class BillDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bill_details"
    bill_id = Column(ForeignKey("bill_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    unit_price = Column(Numeric(20, 2), nullable=False)
    line_total = Column(Numeric(20, 2), nullable=False)
    hsn_sac = Column(String(20), nullable=True)

    header = relationship("BillHeader", back_populates="lines")

class ExpenseHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "expense_headers"
    date = Column(Date, nullable=False)
    total_amount = Column(Numeric(20, 2), nullable=False)
    category = Column(String(100), nullable=False)
    approver_id = Column(CHAR(36), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("ExpenseDetail", back_populates="header", cascade="all, delete-orphan")

class ExpenseDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "expense_details"
    expense_id = Column(ForeignKey("expense_headers.id"), nullable=False)
    description = Column(String(500), nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    receipt_url = Column(String(255), nullable=True)

    header = relationship("ExpenseHeader", back_populates="lines")

class VendorCreditHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "vendor_credit_headers"
    vendor_id = Column(CHAR(36), nullable=False)
    date = Column(Date, nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    reason = Column(String(500), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("VendorCreditDetail", back_populates="header", cascade="all, delete-orphan")

class VendorCreditDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "vendor_credit_details"
    credit_id = Column(ForeignKey("vendor_credit_headers.id"), nullable=False)
    bill_id = Column(ForeignKey("bill_headers.id"), nullable=False)
    allocated_amount = Column(Numeric(20, 2), nullable=False)
    notes = Column(String(500), nullable=True)

    header = relationship("VendorCreditHeader", back_populates="lines")
