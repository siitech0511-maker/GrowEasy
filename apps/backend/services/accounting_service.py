from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from db_models.accounting import (
    JournalHeader, JournalDetail, ChartOfAccount, JournalStatus, 
    PaymentHeader, PaymentDetail, BudgetHeader, BudgetDetail,
    DebitNoteHeader, DebitNoteDetail, CreditNoteHeader, CreditNoteDetail,
    DebitReason, CreditReason,
    BankTransactionHeader, BankTransactionDetail, FundTransfer as DBFundTransfer
)
from schemas.accounting import (
    JournalHeaderCreate, PaymentHeaderCreate, BudgetHeaderCreate, 
    DebitNoteHeaderCreate, CreditNoteHeaderCreate,
    FundTransferCreate, BankReconciliationCreate, ChequeDepositCreate
)
from decimal import Decimal

def create_journal_entry(db: Session, journal_in: JournalHeaderCreate, company_id: str):
    # Calculate totals
    total_debit = sum(line.debit for line in journal_in.lines)
    total_credit = sum(line.credit for line in journal_in.lines)
    
    # Check balance
    if total_debit != total_credit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Journal entry is not balanced. Total Debit: {total_debit}, Total Credit: {total_credit}"
        )
    
    if total_debit <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Journal entry must have a non-zero total"
        )

    # Create Header
    db_header = JournalHeader(
        date=journal_in.date,
        reference=journal_in.reference,
        notes=journal_in.notes,
        total_debit=total_debit,
        total_credit=total_credit,
        status=JournalStatus.POSTED,  # Assuming auto-post for now
        company_id=company_id
    )
    db.add(db_header)
    db.flush()  # To get header ID
    
    # Create Details
    for line in journal_in.lines:
        # Verify account exists
        account = db.query(ChartOfAccount).filter(
            ChartOfAccount.id == line.account_id,
            ChartOfAccount.company_id == company_id
        ).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Account with ID {line.account_id} not found"
            )
            
        db_line = JournalDetail(
            journal_id=db_header.id,
            account_id=line.account_id,
            debit=line.debit,
            credit=line.credit,
            description=line.description,
            tax_amount=line.tax_amount
        )
        db.add(db_line)
    
    db.commit()
    db.refresh(db_header)
    return db_header

def get_chart_of_accounts(db: Session, company_id: str):
    return db.query(ChartOfAccount).filter(ChartOfAccount.company_id == company_id).all()

def create_chart_of_account(db: Session, account_in: ChartOfAccount, company_id: str):
    db_account = ChartOfAccount(
        **account_in.dict(),
        company_id=company_id
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def get_journals(db: Session, company_id: str):
    return db.query(JournalHeader).filter(JournalHeader.company_id == company_id).all()

def get_journal_by_id(db: Session, journal_id: str, company_id: str):
    return db.query(JournalHeader).filter(
        JournalHeader.id == journal_id,
        JournalHeader.company_id == company_id
    ).first()

def create_payment(db: Session, payment_in: PaymentHeaderCreate, company_id: str):
    db_header = PaymentHeader(
        date=payment_in.date,
        amount=payment_in.amount,
        payee_id=payment_in.payee_id,
        account_id=payment_in.account_id,
        mode=payment_in.mode,
        company_id=company_id
    )
    db.add(db_header)
    db.flush()
    
    for allocation in payment_in.allocations:
        db_detail = PaymentDetail(
            payment_id=db_header.id,
            invoice_id=allocation.invoice_id,
            amount_allocated=allocation.amount_allocated,
            notes=allocation.notes
        )
        db.add(db_detail)
    
    db.commit()
    db.refresh(db_header)
    return db_header

def create_budget(db: Session, budget_in: BudgetHeaderCreate, company_id: str):
    db_header = BudgetHeader(
        period_start=budget_in.period_start,
        period_end=budget_in.period_end,
        description=budget_in.description,
        company_id=company_id
    )
    db.add(db_header)
    db.flush()
    
    for line in budget_in.lines:
        db_detail = BudgetDetail(
            budget_id=db_header.id,
            account_id=line.account_id,
            budgeted_amount=line.budgeted_amount,
            actual_amount=line.actual_amount
        )
        db.add(db_detail)
        
    db.commit()
    db.refresh(db_header)
    return db_header

def create_debit_note(db: Session, note_in: DebitNoteHeaderCreate, company_id: str):
    db_header = DebitNoteHeader(
        vendor_id=note_in.vendor_id,
        date=note_in.date,
        total_amount=note_in.total_amount,
        reason=DebitReason(note_in.reason),
        status="Posted",
        reference_bill_id=note_in.reference_bill_id,
        notes=note_in.notes,
        company_id=company_id
    )
    db.add(db_header)
    db.flush()
    
    for line in note_in.lines:
        db_detail = DebitNoteDetail(
            debit_note_id=db_header.id,
            item_id=line.item_id,
            description=line.description,
            amount=line.amount,
            tax_amount=line.tax_amount,
            quantity=line.quantity
        )
        db.add(db_detail)
        
    db.commit()
    db.refresh(db_header)
    return db_header

def create_credit_note(db: Session, note_in: CreditNoteHeaderCreate, company_id: str):
    db_header = CreditNoteHeader(
        customer_id=note_in.customer_id,
        date=note_in.date,
        total_amount=note_in.total_amount,
        reason=CreditReason(note_in.reason),
        status="Posted",
        reference_invoice_id=note_in.reference_invoice_id,
        notes=note_in.notes,
        company_id=company_id
    )
    db.add(db_header)
    db.flush()
    
    for line in note_in.lines:
        db_detail = CreditNoteDetail(
            credit_note_id=db_header.id,
            item_id=line.item_id,
            description=line.description,
            amount=line.amount,
            tax_amount=line.tax_amount,
            quantity=line.quantity
        )
        db.add(db_detail)
        
    db.refresh(db_header)
    return db_header

def create_fund_transfer(db: Session, transfer_in: FundTransferCreate, company_id: str):
    db_transfer = DBFundTransfer(
        from_account_id=transfer_in.from_account_id,
        to_account_id=transfer_in.to_account_id,
        amount=transfer_in.amount,
        date=transfer_in.date,
        reference=transfer_in.reference,
        notes=transfer_in.notes,
        status="Posted",
        company_id=company_id
    )
    db.add(db_transfer)
    
    # Automatic double-entry for fund transfer
    db_journal = JournalHeader(
        date=transfer_in.date,
        reference=f"FT-{transfer_in.reference}",
        notes=f"Internal Fund Transfer: {transfer_in.notes or ''}",
        total_debit=transfer_in.amount,
        total_credit=transfer_in.amount,
        status=JournalStatus.POSTED,
        company_id=company_id
    )
    db.add(db_journal)
    db.flush()
    
    # Debit To Account, Credit From Account
    db.add(JournalDetail(journal_id=db_journal.id, account_id=transfer_in.to_account_id, debit=transfer_in.amount, credit=0))
    db.add(JournalDetail(journal_id=db_journal.id, account_id=transfer_in.from_account_id, debit=0, credit=transfer_in.amount))
    
    db.commit()
    db.refresh(db_transfer)
    return db_transfer

def create_bank_reconciliation(db: Session, rec_in: BankReconciliationCreate, company_id: str):
    # This logic would typically update BankTransactionDetail.is_cleared
    for item in rec_in.items:
        db_transaction = db.query(BankTransactionDetail).filter(
            BankTransactionDetail.id == item.transaction_id,
            # Ensure it belongs to the right bank account via header
        ).first()
        if db_transaction:
            db_transaction.is_reconciled = item.is_cleared
            db_transaction.cleared_date = item.cleared_date
            
    db.commit()
    return {"status": "Reconciliation updated"}

def create_cheque_deposit(db: Session, deposit_in: ChequeDepositCreate, company_id: str):
    db_header = BankTransactionHeader(
        bank_account_id=deposit_in.bank_account_id,
        transaction_date=deposit_in.deposit_date,
        reference_number=deposit_in.reference,
        transaction_type="Deposit",
        total_amount=sum(c.amount for c in deposit_in.cheques),
        status="Cleared",
        company_id=company_id
    )
    db.add(db_header)
    db.flush()
    
    for cheque in deposit_in.cheques:
        db_detail = BankTransactionDetail(
            header_id=db_header.id,
            date=deposit_in.deposit_date,
            description=f"Cheque Deposit: {cheque.cheque_number} from {cheque.received_from}",
            debit=cheque.amount,
            credit=0,
            is_reconciled=False
        )
        db.add(db_detail)
        
    db.commit()
    db.refresh(db_header)
    return db_header

def get_ledger_report(db: Session, account_id: str, start_date: date, end_date: date, company_id: str):
    # Fetch all journal lines for this account within range
    lines = db.query(JournalDetail).join(JournalHeader).filter(
        JournalDetail.account_id == account_id,
        JournalHeader.company_id == company_id,
        JournalHeader.date >= start_date,
        JournalHeader.date <= end_date
    ).all()
    return lines
