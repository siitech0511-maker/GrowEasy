from sqlalchemy import Column, String, Enum, ForeignKey, Numeric, Date, Integer, CHAR, Boolean
from sqlalchemy.orm import relationship
from db_models.base import Base, UUIDMixin, TimestampMixin
import enum

class GSTReturnStatus(str, enum.Enum):
    PENDING = "Pending"
    FILED = "Filed"

class TDSStatus(str, enum.Enum):
    PENDING = "Pending"
    PAID = "Paid"

class GSTCategory(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "gst_categories"
    name = Column(String(50), nullable=False)  # e.g., "Standard Rate", "Nill Rated"
    cgst_rate = Column(Numeric(5, 2), default=0.00)
    sgst_rate = Column(Numeric(5, 2), default=0.00)
    igst_rate = Column(Numeric(5, 2), default=0.00)
    is_active = Column(Boolean, default=True)

class HSNMaster(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "hsn_masters"
    code = Column(String(20), unique=True, index=True, nullable=False)
    description = Column(String(500), nullable=True)
    gst_category_id = Column(ForeignKey("gst_categories.id"), nullable=False)
    type = Column(String(10), default="Goods") # Goods or Services

class GSTConfiguration(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "gst_configurations"
    gstin = Column(String(15), nullable=False)
    state_code = Column(String(2), nullable=False)
    registration_type = Column(String(50), nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

class EInvoiceHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "einvoice_headers"
    invoice_id = Column(CHAR(36), nullable=False)
    irn = Column(String(100), unique=True, index=True, nullable=False)
    qr_code = Column(String(1000), nullable=False)
    generation_date = Column(Date, nullable=False)
    amendment_reason = Column(String(500), nullable=True)

    lines = relationship("EInvoiceDetail", back_populates="header", cascade="all, delete-orphan")

class EInvoiceDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "einvoice_details"
    einvoice_id = Column(ForeignKey("einvoice_headers.id"), nullable=False)
    change_type = Column(String(50), nullable=False)
    field_name = Column(String(100), nullable=False)
    new_value = Column(String(500), nullable=False)
    old_value = Column(String(500), nullable=True)

    header = relationship("EInvoiceHeader", back_populates="lines")

class EWayBillHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "eway_bill_headers"
    ewb_id = Column(String(50), unique=True, index=True, nullable=False)
    invoice_id = Column(CHAR(36), nullable=False)
    transporter_id = Column(String(50), nullable=False)
    validity_date = Column(Date, nullable=False)
    distance = Column(Integer, nullable=False)
    vehicle_no = Column(String(20), nullable=True)

    lines = relationship("EWayBillDetail", back_populates="header", cascade="all, delete-orphan")

class EWayBillDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "eway_bill_details"
    ewb_id = Column(ForeignKey("eway_bill_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    value = Column(Numeric(20, 2), nullable=True)

    header = relationship("EWayBillHeader", back_populates="lines")

class GSTReturnHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "gst_return_headers"
    period = Column(Date, nullable=False)
    type = Column(String(50), nullable=False)
    status = Column(Enum(GSTReturnStatus), default=GSTReturnStatus.PENDING, nullable=False)
    filed_date = Column(Date, nullable=True)
    total_tax = Column(Numeric(20, 2), nullable=True)

    lines = relationship("GSTReturnDetail", back_populates="header", cascade="all, delete-orphan")

class GSTReturnDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "gst_return_details"
    return_id = Column(ForeignKey("gst_return_headers.id"), nullable=False)
    section = Column(String(50), nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    tax = Column(Numeric(20, 2), nullable=False)
    notes = Column(String(500), nullable=True)

    header = relationship("GSTReturnHeader", back_populates="lines")

class TDSHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "tds_headers"
    vendor_id = Column(CHAR(36), nullable=False)
    date = Column(Date, nullable=False)
    total_amount = Column(Numeric(20, 2), nullable=False)
    tds_rate = Column(Numeric(5, 2), nullable=False)
    certificate_no = Column(String(50), nullable=True)

    lines = relationship("TDSDetail", back_populates="header", cascade="all, delete-orphan")

class TDSDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "tds_details"
    tds_id = Column(ForeignKey("tds_headers.id"), nullable=False)
    bill_id = Column(CHAR(36), nullable=False)
    deducted_amount = Column(Numeric(20, 2), nullable=False)
    pan = Column(String(10), nullable=True)

    header = relationship("TDSHeader", back_populates="lines")

class ITCReconciliationHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "itc_reconciliation_headers"
    period = Column(Date, nullable=False)
    status = Column(String(50), nullable=False)
    total_itc = Column(Numeric(20, 2), nullable=False)
    mismatch_amount = Column(Numeric(20, 2), nullable=True)

    lines = relationship("ITCReconciliationDetail", back_populates="header", cascade="all, delete-orphan")

class ITCReconciliationDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "itc_reconciliation_details"
    recon_id = Column(ForeignKey("itc_reconciliation_headers.id"), nullable=False)
    supplier_gstin = Column(String(15), nullable=False)
    invoice_no = Column(String(50), nullable=False)
    claimed_itc = Column(Numeric(20, 2), nullable=False)
    available_itc = Column(Numeric(20, 2), nullable=False)
    reason = Column(String(500), nullable=True)

    header = relationship("ITCReconciliationHeader", back_populates="lines")
