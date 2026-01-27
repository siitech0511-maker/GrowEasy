from sqlalchemy import Column, String, Enum, ForeignKey, Numeric, Date, CHAR
from sqlalchemy.orm import relationship
from db_models.base import Base, UUIDMixin, TimestampMixin
import enum

class QuoteStatus(str, enum.Enum):
    DRAFT = "Draft"
    SENT = "Sent"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    EXPIRED = "Expired"

class SalesOrderStatus(str, enum.Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    SHIPPED = "Shipped"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"

class InvoiceStatus(str, enum.Enum):
    DRAFT = "Draft"
    ISSUED = "Issued"
    PAID = "Paid"
    PARTIALLY_PAID = "Partially Paid"
    OVERDUE = "Overdue"
    CANCELLED = "Cancelled"

class QuoteHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "quote_headers"
    customer_id = Column(CHAR(36), nullable=False)
    date = Column(Date, nullable=False)
    total_amount = Column(Numeric(20, 2), nullable=False)
    status = Column(Enum(QuoteStatus), default=QuoteStatus.DRAFT, nullable=False)
    expiry_date = Column(Date, nullable=True)
    notes = Column(String(500), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("QuoteDetail", back_populates="header", cascade="all, delete-orphan")

class QuoteDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "quote_details"
    quote_id = Column(ForeignKey("quote_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    unit_price = Column(Numeric(20, 2), nullable=False)
    subtotal = Column(Numeric(20, 2), nullable=False)
    discount = Column(Numeric(20, 2), default=0.00)
    tax_rate = Column(Numeric(5, 2), default=0.00)

    header = relationship("QuoteHeader", back_populates="lines")

class SalesOrderHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "sales_order_headers"
    customer_id = Column(CHAR(36), nullable=False)
    date = Column(Date, nullable=False)
    total = Column(Numeric(20, 2), nullable=False)
    quote_id = Column(ForeignKey("quote_headers.id"), nullable=True)
    delivery_date = Column(Date, nullable=True)
    status = Column(Enum(SalesOrderStatus), default=SalesOrderStatus.PENDING, nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("SalesOrderDetail", back_populates="header", cascade="all, delete-orphan")

class SalesOrderDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "sales_order_details"
    order_id = Column(ForeignKey("sales_order_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    unit_price = Column(Numeric(20, 2), nullable=False)
    subtotal = Column(Numeric(20, 2), nullable=False)
    tax_amount = Column(Numeric(20, 2), default=0.00)

    header = relationship("SalesOrderHeader", back_populates="lines")

class InvoiceHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "invoice_headers"
    order_id = Column(ForeignKey("sales_order_headers.id"), nullable=False)
    date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    subtotal = Column(Numeric(20, 2), nullable=False)
    tax_amount = Column(Numeric(20, 2), nullable=False)
    total = Column(Numeric(20, 2), nullable=False)
    discount = Column(Numeric(20, 2), default=0.00)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT, nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("InvoiceDetail", back_populates="header", cascade="all, delete-orphan")

class InvoiceDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "invoice_details"
    invoice_id = Column(ForeignKey("invoice_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    unit_price = Column(Numeric(20, 2), nullable=False)
    line_total = Column(Numeric(20, 2), nullable=False)
    hsn_sac = Column(String(20), nullable=True)
    tax_rate = Column(Numeric(5, 2), default=0.00)

    header = relationship("InvoiceHeader", back_populates="lines")

class SalesReturnHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "sales_return_headers"
    invoice_id = Column(ForeignKey("invoice_headers.id"), nullable=False)
    date = Column(Date, nullable=False)
    total_amount = Column(Numeric(20, 2), nullable=False)
    reason = Column(String(500), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("SalesReturnDetail", back_populates="header", cascade="all, delete-orphan")

class SalesReturnDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "sales_return_details"
    return_id = Column(ForeignKey("sales_return_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    condition = Column(String(100), nullable=True)

    header = relationship("SalesReturnHeader", back_populates="lines")

class DeliveryChallanHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "delivery_challan_headers"
    order_id = Column(ForeignKey("sales_order_headers.id"), nullable=False)
    date = Column(Date, nullable=False)
    transporter = Column(String(255), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("DeliveryChallanDetail", back_populates="header", cascade="all, delete-orphan")

class DeliveryChallanDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "delivery_challan_details"
    challan_id = Column(ForeignKey("delivery_challan_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    serial_no = Column(String(100), nullable=True)

    header = relationship("DeliveryChallanHeader", back_populates="lines")
