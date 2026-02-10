from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from db_models.accounting import (
    JournalHeader, JournalDetail, ChartOfAccount, JournalStatus,
    PaymentHeader, PaymentDetail, BudgetHeader, BudgetDetail,
    DebitNoteHeader, DebitNoteDetail, CreditNoteHeader, CreditNoteDetail,
    DebitReason, CreditReason,
    FundTransfer
)
from db_models.pos_banking import (
    BankTransactionHeader, BankTransactionDetail
)
from schemas.accounting import (
    JournalHeaderCreate, PaymentHeaderCreate, BudgetHeaderCreate, 
    DebitNoteHeaderCreate, CreditNoteHeaderCreate,
    FundTransferCreate, BankReconciliationCreate, ChequeDepositCreate
)
from decimal import Decimal
from datetime import date
from sqlalchemy import func, or_

def calculate_account_balance(db: Session, account_id: str, company_id: str) -> Decimal:
    account = db.query(ChartOfAccount).filter(
        ChartOfAccount.id == account_id,
        ChartOfAccount.company_id == company_id
    ).first()
    
    if not account:
        return Decimal(0)

    # Sum all posted journal details for this account
    result = db.query(
        func.sum(JournalDetail.debit).label("total_debit"),
        func.sum(JournalDetail.credit).label("total_credit")
    ).join(JournalHeader).filter(
        JournalDetail.account_id == account_id,
        JournalHeader.company_id == company_id,
        JournalHeader.status == JournalStatus.POSTED
    ).first()

    total_debit = result.total_debit or Decimal(0)
    total_credit = result.total_credit or Decimal(0)
    
    opening = account.opening_balance or Decimal(0)
    
    if account.typical_balance == "Debit":
        return opening + total_debit - total_credit
    else:
        return opening + total_credit - total_debit


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
        status=JournalStatus.DRAFT if journal_in.batch_id else JournalStatus.POSTED,
        company_id=company_id,
        batch_id=journal_in.batch_id
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
    accounts = db.query(ChartOfAccount).filter(ChartOfAccount.company_id == company_id).all()
    # Populate current balance for each account
    for acc in accounts:
        # We assign it to the Pydantic model field (it won't persist to DB, just for response)
        acc.current_balance = calculate_account_balance(db, acc.id, company_id)
    return accounts

    return accounts

def get_batches(db: Session, company_id: str):
    # Aggregate journals by batch_id where status is DRAFT
    # This requires a more complex query or returning raw list
    # For simplicity, distinct batch IDs
    batches = db.query(JournalHeader.batch_id, func.count(JournalHeader.id).label("count"), func.sum(JournalHeader.total_debit).label("total"))\
        .filter(JournalHeader.company_id == company_id, JournalHeader.batch_id != None, JournalHeader.status == JournalStatus.DRAFT)\
        .group_by(JournalHeader.batch_id).all()
    
    return [{"id": b.batch_id, "count": b.count, "total": b.total} for b in batches]

def post_batch(db: Session, batch_id: str, company_id: str):
    journals = db.query(JournalHeader).filter(
        JournalHeader.company_id == company_id,
        JournalHeader.batch_id == batch_id,
        JournalHeader.status == JournalStatus.DRAFT
    ).all()
    
    if not journals:
        raise HTTPException(status_code=404, detail="Batch not found or already posted")
        
    for j in journals:
        j.status = JournalStatus.POSTED
        
    db.commit()
    return {"message": f"Successfully posted {len(journals)} journals in batch {batch_id}"}

def create_chart_of_account(db: Session, account_in, company_id: str):
    data = account_in.dict(exclude={"company_id"})
    db_account = ChartOfAccount(
        **data,
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

    db.commit()
    db.refresh(db_header)
    return db_header

def create_fund_transfer(db: Session, transfer_in: FundTransferCreate, company_id: str):
    # Verify both accounts exist and belong to this company
    for acct_id in [transfer_in.from_account_id, transfer_in.to_account_id]:
        account = db.query(ChartOfAccount).filter(
            ChartOfAccount.id == acct_id,
            ChartOfAccount.company_id == company_id
        ).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Account with ID {acct_id} not found"
            )

    # Check sufficient funds in source account
    from_balance = calculate_account_balance(db, transfer_in.from_account_id, company_id)
    if from_balance < transfer_in.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient funds in source account. Available: {from_balance}, Requested: {transfer_in.amount}"
        )

    if transfer_in.from_account_id == transfer_in.to_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="From and To accounts must be different"
        )

    # Create automatic double-entry journal
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

    db.add(JournalDetail(journal_id=db_journal.id, account_id=transfer_in.to_account_id, debit=transfer_in.amount, credit=0))
    db.add(JournalDetail(journal_id=db_journal.id, account_id=transfer_in.from_account_id, debit=0, credit=transfer_in.amount))

    db_transfer = FundTransfer(
        from_account_id=transfer_in.from_account_id,
        to_account_id=transfer_in.to_account_id,
        amount=transfer_in.amount,
        date=transfer_in.date,
        reference=transfer_in.reference,
        notes=transfer_in.notes,
        status="Posted",
        company_id=company_id,
        journal_id=db_journal.id
    )
    db.add(db_transfer)

    db.commit()
    db.refresh(db_transfer)
    return db_transfer


def create_bank_reconciliation(db: Session, rec_in: BankReconciliationCreate, company_id: str):
    for item in rec_in.items:
        db_transaction = db.query(BankTransactionDetail).filter(
            BankTransactionDetail.id == item.transaction_id
        ).join(BankTransactionHeader, BankTransactionDetail.tx_id == BankTransactionHeader.id).filter(
            BankTransactionHeader.company_id == company_id,
            BankTransactionHeader.bank_account_id == rec_in.bank_account_id
        ).first()
        if db_transaction:
            # Mark parent header as reconciled if all items cleared
            header = db.query(BankTransactionHeader).filter(
                BankTransactionHeader.id == db_transaction.tx_id
            ).first()
            if header and item.is_cleared:
                header.reconciled = True

    db.commit()
    return {"status": "Reconciliation updated", "bank_account_id": rec_in.bank_account_id, "statement_date": str(rec_in.statement_date)}


def create_cheque_deposit(db: Session, deposit_in: ChequeDepositCreate, company_id: str):
    db_header = BankTransactionHeader(
        bank_account_id=deposit_in.bank_account_id,
        date=deposit_in.deposit_date,
        total_amount=sum(c.amount for c in deposit_in.cheques),
        reconciled=False,
        company_id=company_id
    )
    db.add(db_header)
    db.flush()

    for cheque in deposit_in.cheques:
        db_detail = BankTransactionDetail(
            tx_id=db_header.id,
            description=f"Cheque Deposit: {cheque.cheque_number} from {cheque.received_from}",
            amount=cheque.amount,
            cheque_no=cheque.cheque_number
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

def get_payments(db: Session, company_id: str):
    return db.query(PaymentHeader).filter(PaymentHeader.company_id == company_id).all()

def get_budgets(db: Session, company_id: str):
    return db.query(BudgetHeader).filter(BudgetHeader.company_id == company_id).all()

def get_debit_notes(db: Session, company_id: str):
    return db.query(DebitNoteHeader).filter(DebitNoteHeader.company_id == company_id).all()

def get_credit_notes(db: Session, company_id: str):
    return db.query(CreditNoteHeader).filter(CreditNoteHeader.company_id == company_id).all()

def get_fund_transfers(db: Session, company_id: str):
    return db.query(FundTransfer).filter(FundTransfer.company_id == company_id).all()

def get_cheque_deposits(db: Session, company_id: str):
    return db.query(BankTransactionHeader).filter(
        BankTransactionHeader.company_id == company_id,
        BankTransactionHeader.transaction_type == "Deposit"
    ).all()
