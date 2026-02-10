from pydantic import BaseModel, condecimal
from typing import Optional, List
from datetime import date
from schemas.core import UserRole
from db_models.accounting import AccountType, JournalStatus

class ChartOfAccountBase(BaseModel):
    code: str
    name: str
    alias: Optional[str] = None
    type: AccountType
    sub_type: str
    description: Optional[str] = None
    category: Optional[str] = None
    posting_type: str = "Balance Sheet"
    typical_balance: str = "Debit"
    is_inactive: bool = False
    allow_account_entry: bool = True
    opening_balance: condecimal(max_digits=20, decimal_places=2) = 0.00
    posting_level_sales: Optional[str] = "Detail"
    posting_level_inventory: Optional[str] = "Detail"
    posting_level_purchasing: Optional[str] = "Detail"
    posting_level_payroll: Optional[str] = "Detail"
    include_in_lookup: Optional[List[str]] = None
    user_defined_1: Optional[str] = None
    user_defined_2: Optional[str] = None
    user_defined_3: Optional[str] = None
    user_defined_4: Optional[str] = None
    parent_account_id: Optional[str] = None

class ChartOfAccountCreate(ChartOfAccountBase):
    company_id: Optional[str] = None

class ChartOfAccountUpdate(BaseModel):
    name: Optional[str] = None
    alias: Optional[str] = None
    type: Optional[AccountType] = None
    sub_type: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    posting_type: Optional[str] = None
    typical_balance: Optional[str] = None
    is_inactive: Optional[bool] = None
    allow_account_entry: Optional[bool] = None
    posting_level_sales: Optional[str] = None
    posting_level_inventory: Optional[str] = None
    posting_level_purchasing: Optional[str] = None
    posting_level_payroll: Optional[str] = None
    include_in_lookup: Optional[List[str]] = None
    user_defined_1: Optional[str] = None
    user_defined_2: Optional[str] = None
    user_defined_3: Optional[str] = None
    user_defined_4: Optional[str] = None
    parent_account_id: Optional[str] = None

class ChartOfAccount(ChartOfAccountBase):
    id: str
    company_id: str
    current_balance: Optional[condecimal(max_digits=20, decimal_places=2)] = 0.00
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
    batch_id: Optional[str] = None

class JournalHeaderCreate(JournalHeaderBase):
    company_id: Optional[str] = None
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
    company_id: Optional[str] = None
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
    company_id: Optional[str] = None
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

class DebitNoteDetail(DebitNoteDetailBase):
    id: str
    debit_note_id: str
    class Config:
        from_attributes = True

class DebitNoteHeaderCreate(DebitNoteHeaderBase):
    company_id: Optional[str] = None
    total_amount: condecimal(max_digits=20, decimal_places=2)
    lines: List[DebitNoteDetailCreate]

class DebitNoteHeader(DebitNoteHeaderBase):
    id: str
    company_id: str
    total_amount: condecimal(max_digits=20, decimal_places=2)
    status: str
    lines: List[DebitNoteDetail]
    class Config:
        from_attributes = True

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

class CreditNoteDetail(CreditNoteDetailBase):
    id: str
    credit_note_id: str
    class Config:
        from_attributes = True

class CreditNoteHeaderCreate(CreditNoteHeaderBase):
    company_id: Optional[str] = None
    total_amount: condecimal(max_digits=20, decimal_places=2)
    lines: List[CreditNoteDetailCreate]

class CreditNoteHeader(CreditNoteHeaderBase):
    id: str
    company_id: str
    total_amount: condecimal(max_digits=20, decimal_places=2)
    status: str
    lines: List[CreditNoteDetail]
    class Config:
        from_attributes = True

class FundTransferCreate(BaseModel):
    from_account_id: str
    to_account_id: str
    amount: condecimal(max_digits=20, decimal_places=2)
    date: date
    reference: str
    notes: Optional[str] = None
    company_id: Optional[str] = None

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
    company_id: Optional[str] = None
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
    company_id: Optional[str] = None
    cheques: List[ChequeDepositDetail]
