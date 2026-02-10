from sqlalchemy import Column, String, Enum, ForeignKey, Numeric, Date, CHAR, Boolean, JSON
from sqlalchemy.orm import relationship
from db_models.base import Base, UUIDMixin, TimestampMixin
import enum

class AccountType(str, enum.Enum):
    ASSET = "Asset"
    LIABILITY = "Liability"
    EQUITY = "Equity"
    REVENUE = "Revenue"
    EXPENSE = "Expense"

class JournalStatus(str, enum.Enum):
    DRAFT = "Draft"
    POSTED = "Posted"

class DebitReason(str, enum.Enum):
    OVERCHARGE = "Overcharge"
    RETURN = "Return"
    SHORTAGE = "Shortage"

class CreditReason(str, enum.Enum):
    RETURN = "Return"
    DISCOUNT = "Discount"
    OVERBILL = "Overbill"

class PostingType(str, enum.Enum):
    BALANCE_SHEET = "Balance Sheet"
    PROFIT_AND_LOSS = "Profit and Loss"

class TypicalBalance(str, enum.Enum):
    DEBIT = "Debit"
    CREDIT = "Credit"

class PostingLevel(str, enum.Enum):
    DETAIL = "Detail"
    SUMMARY = "Summary"

class ChartOfAccount(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "chart_of_accounts"
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    alias = Column(String(255), nullable=True)
    type = Column(Enum(AccountType), nullable=False)
    sub_type = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    category = Column(String(255), nullable=True)
    posting_type = Column(String(50), default="Balance Sheet", nullable=False)
    typical_balance = Column(String(50), default="Debit", nullable=False)
    is_inactive = Column(Boolean, default=False, nullable=False)
    allow_account_entry = Column(Boolean, default=True, nullable=False)
    opening_balance = Column(Numeric(20, 2), default=0.00)

    # Level of Posting from Series
    posting_level_sales = Column(String(50), default="Detail")
    posting_level_inventory = Column(String(50), default="Detail")
    posting_level_purchasing = Column(String(50), default="Detail")
    posting_level_payroll = Column(String(50), default="Detail")

    # Include in Lookup (stored as JSON array of series names)
    include_in_lookup = Column(JSON, nullable=True)

    # User-Defined fields
    user_defined_1 = Column(String(255), nullable=True)
    user_defined_2 = Column(String(255), nullable=True)
    user_defined_3 = Column(String(255), nullable=True)
    user_defined_4 = Column(String(255), nullable=True)

    company_id = Column(ForeignKey("companies.id"), nullable=False)
    parent_account_id = Column(ForeignKey("chart_of_accounts.id"), nullable=True)

class JournalHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "journal_headers"
    date = Column(Date, nullable=False)
    reference = Column(String(100), nullable=False)
    status = Column(Enum(JournalStatus), default=JournalStatus.DRAFT, nullable=False)
    total_debit = Column(Numeric(20, 2), nullable=False)
    total_credit = Column(Numeric(20, 2), nullable=False)
    notes = Column(String(500), nullable=True)
    
    company_id = Column(ForeignKey("companies.id"), nullable=False)
    batch_id = Column(String(50), nullable=True)
    lines = relationship("JournalDetail", back_populates="header", cascade="all, delete-orphan")

class JournalDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "journal_details"
    journal_id = Column(ForeignKey("journal_headers.id"), nullable=False)
    account_id = Column(ForeignKey("chart_of_accounts.id"), nullable=False)
    debit = Column(Numeric(20, 2), default=0.00, nullable=False)
    credit = Column(Numeric(20, 2), default=0.00, nullable=False)
    description = Column(String(500), nullable=True)
    tax_amount = Column(Numeric(20, 2), default=0.00)

    header = relationship("JournalHeader", back_populates="lines")

class PaymentHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "payment_headers"
    date = Column(Date, nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    payee_id = Column(CHAR(36), nullable=False)  # Generic ID for payee
    account_id = Column(ForeignKey("chart_of_accounts.id"), nullable=False)
    mode = Column(String(50), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    allocations = relationship("PaymentDetail", back_populates="header", cascade="all, delete-orphan")

class PaymentDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "payment_details"
    payment_id = Column(ForeignKey("payment_headers.id"), nullable=False)
    invoice_id = Column(CHAR(36), nullable=False)  # Link to sales/purchase invoice
    amount_allocated = Column(Numeric(20, 2), nullable=False)
    notes = Column(String(500), nullable=True)

    header = relationship("PaymentHeader", back_populates="allocations")

class BudgetHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "budget_headers"
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    description = Column(String(500), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("BudgetDetail", back_populates="header", cascade="all, delete-orphan")

class BudgetDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "budget_details"
    budget_id = Column(ForeignKey("budget_headers.id"), nullable=False)
    account_id = Column(ForeignKey("chart_of_accounts.id"), nullable=False)
    budgeted_amount = Column(Numeric(20, 2), nullable=False)
    actual_amount = Column(Numeric(20, 2), default=0.00)

    header = relationship("BudgetHeader", back_populates="lines")

class DebitNoteHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "debit_note_headers"
    vendor_id = Column(CHAR(36), nullable=False)
    date = Column(Date, nullable=False)
    total_amount = Column(Numeric(20, 2), nullable=False)
    reason = Column(Enum(DebitReason), nullable=False)
    status = Column(String(50), default="Draft")
    reference_bill_id = Column(CHAR(36), nullable=True)
    notes = Column(String(500), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("DebitNoteDetail", back_populates="header", cascade="all, delete-orphan")

class DebitNoteDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "debit_note_details"
    debit_note_id = Column(ForeignKey("debit_note_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=True)
    description = Column(String(500), nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    tax_amount = Column(Numeric(20, 2), default=0.00)
    quantity = Column(Numeric(20, 4), nullable=True)

    header = relationship("DebitNoteHeader", back_populates="lines")

class CreditNoteHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "credit_note_headers"
    customer_id = Column(CHAR(36), nullable=False)
    date = Column(Date, nullable=False)
    total_amount = Column(Numeric(20, 2), nullable=False)
    reason = Column(Enum(CreditReason), nullable=False)
    status = Column(String(50), default="Draft")
    reference_invoice_id = Column(CHAR(36), nullable=True)
    notes = Column(String(500), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("CreditNoteDetail", back_populates="header", cascade="all, delete-orphan")

class CreditNoteDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "credit_note_details"
    credit_note_id = Column(ForeignKey("credit_note_headers.id"), nullable=False)
    item_id = Column(CHAR(36), nullable=True)
    description = Column(String(500), nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    tax_amount = Column(Numeric(20, 2), default=0.00)
    quantity = Column(Numeric(20, 4), nullable=True)

    header = relationship("CreditNoteHeader", back_populates="lines")

class FundTransfer(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "fund_transfers"
    from_account_id = Column(ForeignKey("chart_of_accounts.id"), nullable=False)
    to_account_id = Column(ForeignKey("chart_of_accounts.id"), nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    date = Column(Date, nullable=False)
    reference = Column(String(100), nullable=False)
    notes = Column(String(500), nullable=True)
    status = Column(String(50), default="Posted")
    company_id = Column(ForeignKey("companies.id"), nullable=False)
    journal_id = Column(ForeignKey("journal_headers.id"), nullable=True)

