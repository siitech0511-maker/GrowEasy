"""Seed script: Insert 10 sample Chart of Accounts records."""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text
from core.database import SessionLocal, engine
from db_models.base import Base
from db_models.core import Company, User, UserRole
from db_models.accounting import (
    ChartOfAccount, AccountType, PostingType, TypicalBalance, PostingLevel
)
import hashlib

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Ensure a company exists
company = db.query(Company).first()
if not company:
    company = Company(name="GrowEasy Demo Co.", gstin="29AABCU9603R1ZJ", address="Bangalore, India")
    db.add(company)
    db.flush()
    # Create a default admin user
    user = User(
        email="admin@groweasy.in",
        password_hash=hashlib.sha256("admin123".encode()).hexdigest(),
        role=UserRole.ADMIN,
        full_name="Admin User",
        company_id=company.id,
    )
    db.add(user)
    db.commit()
    print(f"Created company: {company.name} (ID: {company.id})")
    print(f"Created user: admin@groweasy.in / admin123")
else:
    print(f"Using existing company: {company.name} (ID: {company.id})")

# Check if COA already seeded
existing = db.query(ChartOfAccount).filter(ChartOfAccount.company_id == company.id).count()
if existing >= 10:
    print(f"Already have {existing} accounts. Skipping seed.")
    db.close()
    sys.exit(0)

accounts = [
    ("1000", "Cash in Hand", "Asset", "Current Asset", "Balance Sheet", "Debit", 50000),
    ("1010", "HDFC Bank - Current A/c", "Asset", "Bank", "Balance Sheet", "Debit", 425000),
    ("1200", "Accounts Receivable", "Asset", "Current Asset", "Balance Sheet", "Debit", 180000),
    ("1500", "Office Equipment", "Asset", "Fixed Asset", "Balance Sheet", "Debit", 320000),
    ("2000", "Accounts Payable", "Liability", "Current Liability", "Balance Sheet", "Credit", 95000),
    ("2100", "GST Payable", "Liability", "Current Liability", "Balance Sheet", "Credit", 42000),
    ("3000", "Owner's Equity", "Equity", "Capital", "Balance Sheet", "Credit", 500000),
    ("4000", "Sales Revenue", "Revenue", "Operating Revenue", "Profit and Loss", "Credit", 0),
    ("5000", "Cost of Goods Sold", "Expense", "Direct Expense", "Profit and Loss", "Debit", 0),
    ("5100", "Rent Expense", "Expense", "Operating Expense", "Profit and Loss", "Debit", 0),
]

import uuid
from datetime import datetime
for code, name, acct_type, sub_type, posting, balance, opening in accounts:
    db.execute(text(
        "INSERT INTO chart_of_accounts (id, created_at, updated_at, code, name, type, sub_type, category, "
        "posting_type, typical_balance, is_inactive, allow_account_entry, opening_balance, "
        "posting_level_sales, posting_level_inventory, posting_level_purchasing, posting_level_payroll, company_id) "
        "VALUES (:id, :now, :now, :code, :name, :type, :sub_type, :category, "
        ":posting_type, :typical_balance, 0, 1, :opening, 'Detail', 'Detail', 'Detail', 'Detail', :company_id)"
    ), {
        "id": str(uuid.uuid4()), "now": datetime.utcnow(),
        "code": code, "name": name, "type": acct_type, "sub_type": sub_type, "category": sub_type,
        "posting_type": posting, "typical_balance": balance, "opening": opening, "company_id": company.id,
    })

db.commit()
print(f"Seeded {len(accounts)} chart of accounts for '{company.name}'.")
db.close()
