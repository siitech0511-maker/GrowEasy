"""Add missing columns to chart_of_accounts table."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text
from core.database import engine

alter_statements = [
    "ALTER TABLE chart_of_accounts ADD COLUMN alias VARCHAR(255) NULL",
    "ALTER TABLE chart_of_accounts ADD COLUMN category VARCHAR(255) NULL",
    "ALTER TABLE chart_of_accounts ADD COLUMN posting_type ENUM('Balance Sheet','Profit and Loss') NOT NULL DEFAULT 'Balance Sheet'",
    "ALTER TABLE chart_of_accounts ADD COLUMN typical_balance ENUM('Debit','Credit') NOT NULL DEFAULT 'Debit'",
    "ALTER TABLE chart_of_accounts ADD COLUMN is_inactive TINYINT(1) NOT NULL DEFAULT 0",
    "ALTER TABLE chart_of_accounts ADD COLUMN allow_account_entry TINYINT(1) NOT NULL DEFAULT 1",
    "ALTER TABLE chart_of_accounts ADD COLUMN posting_level_sales ENUM('Detail','Summary') DEFAULT 'Detail'",
    "ALTER TABLE chart_of_accounts ADD COLUMN posting_level_inventory ENUM('Detail','Summary') DEFAULT 'Detail'",
    "ALTER TABLE chart_of_accounts ADD COLUMN posting_level_purchasing ENUM('Detail','Summary') DEFAULT 'Detail'",
    "ALTER TABLE chart_of_accounts ADD COLUMN posting_level_payroll ENUM('Detail','Summary') DEFAULT 'Detail'",
    "ALTER TABLE chart_of_accounts ADD COLUMN include_in_lookup JSON NULL",
    "ALTER TABLE chart_of_accounts ADD COLUMN user_defined_1 VARCHAR(255) NULL",
    "ALTER TABLE chart_of_accounts ADD COLUMN user_defined_2 VARCHAR(255) NULL",
    "ALTER TABLE chart_of_accounts ADD COLUMN user_defined_3 VARCHAR(255) NULL",
    "ALTER TABLE chart_of_accounts ADD COLUMN user_defined_4 VARCHAR(255) NULL",
    "ALTER TABLE chart_of_accounts ADD COLUMN parent_account_id CHAR(36) NULL",
]

with engine.connect() as conn:
    for stmt in alter_statements:
        col_name = stmt.split("ADD COLUMN ")[1].split(" ")[0]
        try:
            conn.execute(text(stmt))
            print(f"Added column: {col_name}")
        except Exception as e:
            if "Duplicate column" in str(e):
                print(f"Column {col_name} already exists, skipping.")
            else:
                print(f"Error adding {col_name}: {e}")
    conn.commit()

print("Migration complete.")
