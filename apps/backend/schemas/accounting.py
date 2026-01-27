from pydantic import BaseModel, condecimal
from typing import Optional, List
from datetime import date
from .core import UserRole
from ..db_models.accounting import AccountType, JournalStatus

class ChartOfAccountBase(BaseModel):
    code: str
    name: str
    type: AccountType
    sub_type: str
    description: Optional[str] = None
    opening_balance: condecimal(max_digits=20, decimal_places=2) = 0.00
    parent_account_id: Optional[str] = None

class ChartOfAccountCreate(ChartOfAccountBase):
    company_id: str

class ChartOfAccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[AccountType] = None
    sub_type: Optional[str] = None
    description: Optional[str] = None
    parent_account_id: Optional[str] = None

class ChartOfAccount(ChartOfAccountBase):
    id: str
    company_id: str
    class Config:
        from_attributes = True

class JournalDetailBase(BaseModel):
    account_id: str
    debit: condecimal(max_digits=20, decimal_places=2) = 0.00
    credit: condecimal(max_digits=20, decimal_places=2) = 0.00
    description: Optional[str] = None
    tax_amount: condecimal(max_digits=20, decimal_places=2) = 0.00

class JournalDetailCreate(JournalDetailBase):
    pass

class JournalDetail(JournalDetailBase):
    id: str
    journal_id: str
    class Config:
        from_attributes = True

class JournalHeaderBase(BaseModel):
    date: date
    reference: str
    notes: Optional[str] = None

class JournalHeaderCreate(JournalHeaderBase):
    company_id: str
    lines: List[JournalDetailCreate]

class JournalHeader(JournalHeaderBase):
    id: str
    company_id: str
    status: JournalStatus
    total_debit: condecimal(max_digits=20, decimal_places=2)
    total_credit: condecimal(max_digits=20, decimal_places=2)
    lines: List[JournalDetail]
    class Config:
        from_attributes = True

class PaymentDetailBase(BaseModel):
    invoice_id: str
    amount_allocated: condecimal(max_digits=20, decimal_places=2)
    notes: Optional[str] = None

class PaymentDetailCreate(PaymentDetailBase):
    pass

class PaymentDetail(PaymentDetailBase):
    id: str
    payment_id: str
    class Config:
        from_attributes = True

class PaymentHeaderBase(BaseModel):
    date: date
    amount: condecimal(max_digits=20, decimal_places=2)
    payee_id: str
    account_id: str
    mode: Optional[str] = None

class PaymentHeaderCreate(PaymentHeaderBase):
    company_id: str
    allocations: List[PaymentDetailCreate]

class PaymentHeader(PaymentHeaderBase):
    id: str
    company_id: str
    allocations: List[PaymentDetail]
    class Config:
        from_attributes = True

class BudgetDetailBase(BaseModel):
    account_id: str
    budgeted_amount: condecimal(max_digits=20, decimal_places=2)
    actual_amount: condecimal(max_digits=20, decimal_places=2) = 0.00

class BudgetDetailCreate(BudgetDetailBase):
    pass

class BudgetDetail(BudgetDetailBase):
    id: str
    budget_id: str
    class Config:
        from_attributes = True

class BudgetHeaderBase(BaseModel):
    period_start: date
    period_end: date
    description: Optional[str] = None

class BudgetHeaderCreate(BudgetHeaderBase):
    company_id: str
    lines: List[BudgetDetailCreate]

class BudgetHeader(BudgetHeaderBase):
    id: str
    company_id: str
    lines: List[BudgetDetail]
    class Config:
        from_attributes = True

class DebitNoteDetailBase(BaseModel):
    description: str
    amount: condecimal(max_digits=20, decimal_places=2)
    tax_amount: condecimal(max_digits=20, decimal_places=2) = 0.00
    item_id: Optional[str] = None
    quantity: Optional[condecimal(max_digits=20, decimal_places=4)] = None

class DebitNoteDetailCreate(DebitNoteDetailBase):
    pass

class DebitNoteHeaderBase(BaseModel):
    vendor_id: str
    date: date
    reason: str # Map to Enum in service
    reference_bill_id: Optional[str] = None
    notes: Optional[str] = None

class DebitNoteHeaderCreate(DebitNoteHeaderBase):
    company_id: str
    total_amount: condecimal(max_digits=20, decimal_places=2)
    lines: List[DebitNoteDetailCreate]

class CreditNoteDetailBase(BaseModel):
    description: str
    amount: condecimal(max_digits=20, decimal_places=2)
    tax_amount: condecimal(max_digits=20, decimal_places=2) = 0.00
    item_id: Optional[str] = None
    quantity: Optional[condecimal(max_digits=20, decimal_places=4)] = None

class CreditNoteDetailCreate(CreditNoteDetailBase):
    pass

class CreditNoteHeaderBase(BaseModel):
    customer_id: str
    date: date
    reason: str # Map to Enum in service
    reference_invoice_id: Optional[str] = None
    notes: Optional[str] = None

class CreditNoteHeaderCreate(CreditNoteHeaderBase):
    company_id: str
    total_amount: condecimal(max_digits=20, decimal_places=2)
    lines: List[CreditNoteDetailCreate]

class FundTransferCreate(BaseModel):
    from_account_id: str
    to_account_id: str
    amount: condecimal(max_digits=20, decimal_places=2)
    date: date
    reference: str
    notes: Optional[str] = None
    company_id: str

class FundTransfer(FundTransferCreate):
    id: str
    class Config:
        from_attributes = True

class BankReconciliationDetail(BaseModel):
    transaction_id: str # Link to BankTransactionDetail
    is_cleared: bool
    cleared_date: Optional[date] = None

class BankReconciliationCreate(BaseModel):
    bank_account_id: str
    statement_date: date
    closing_balance_as_per_bank: condecimal(max_digits=20, decimal_places=2)
    company_id: str
    items: List[BankReconciliationDetail]

class ChequeDepositDetail(BaseModel):
    cheque_number: str
    bank_name: str
    amount: condecimal(max_digits=20, decimal_places=2)
    date_on_cheque: date
    received_from: str # Entity name or ID

class ChequeDepositCreate(BaseModel):
    bank_account_id: str
    deposit_date: date
    reference: Optional[str] = None
    company_id: str
    cheques: List[ChequeDepositDetail]
