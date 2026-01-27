from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from api import deps
from schemas import accounting as schemas
from services import accounting_service as service
from db_models.core import User

router = APIRouter()

@router.get("/chart-of-accounts", response_model=List[schemas.ChartOfAccount])
def read_chart_of_accounts(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return service.get_chart_of_accounts(db, company_id=current_user.company_id)

@router.post("/chart-of-accounts", response_model=schemas.ChartOfAccount)
def create_chart_of_account(
    account_in: schemas.ChartOfAccountCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Ensure they create account for their own company
    if account_in.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized to create account for another company")
    return service.create_chart_of_account(db, account_in=account_in, company_id=current_user.company_id)

@router.get("/journals", response_model=List[schemas.JournalHeader])
def read_journals(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return service.get_journals(db, company_id=current_user.company_id)

@router.get("/journals/{journal_id}", response_model=schemas.JournalHeader)
def read_journal(
    journal_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    journal = service.get_journal_by_id(db, journal_id=journal_id, company_id=current_user.company_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return journal

@router.post("/payments", response_model=schemas.PaymentHeader)
def create_payment(
    payment_in: schemas.PaymentHeaderCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if payment_in.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return service.create_payment(db, payment_in=payment_in, company_id=current_user.company_id)

@router.post("/budgets", response_model=schemas.BudgetHeader)
def create_budget(
    budget_in: schemas.BudgetHeaderCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if budget_in.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return service.create_budget(db, budget_in=budget_in, company_id=current_user.company_id)

@router.post("/debit-notes", response_model=schemas.DebitNoteHeader)
def create_debit_note(
    note_in: schemas.DebitNoteHeaderCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if note_in.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return service.create_debit_note(db, note_in=note_in, company_id=current_user.company_id)

@router.post("/credit-notes", response_model=schemas.CreditNoteHeader)
def create_credit_note(
    note_in: schemas.CreditNoteHeaderCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if note_in.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return service.create_credit_note(db, note_in=note_in, company_id=current_user.company_id)

@router.post("/fund-transfers", response_model=schemas.FundTransfer)
def create_fund_transfer(
    transfer_in: schemas.FundTransferCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if transfer_in.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return service.create_fund_transfer(db, transfer_in=transfer_in, company_id=current_user.company_id)

@router.post("/bank-reconciliation")
def create_bank_reconciliation(
    rec_in: schemas.BankReconciliationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if rec_in.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return service.create_bank_reconciliation(db, rec_in=rec_in, company_id=current_user.company_id)

@router.post("/cheque-deposits")
def create_cheque_deposit(
    deposit_in: schemas.ChequeDepositCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if deposit_in.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return service.create_cheque_deposit(db, deposit_in=deposit_in, company_id=current_user.company_id)

@router.get("/ledger-report")
def get_ledger_report(
    account_id: str,
    start_date: date,
    end_date: date,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return service.get_ledger_report(db, account_id=account_id, start_date=start_date, end_date=end_date, company_id=current_user.company_id)

@router.post("/journals", response_model=schemas.JournalHeader)
def create_journal_entry(
    journal_in: schemas.JournalHeaderCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if journal_in.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized to post for another company")
    return service.create_journal_entry(db, journal_in=journal_in, company_id=current_user.company_id)
