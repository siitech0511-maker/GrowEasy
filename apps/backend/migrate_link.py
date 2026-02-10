from sqlalchemy import create_engine, text
from core.config import settings

def migrate_integration_link():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE crm_accounts ADD COLUMN master_uuid CHAR(36) UNIQUE"))
            print("Added master_uuid to CRM Accounts.")
        except Exception as e: print(f"Column might exist: {e}")
        conn.commit()

if __name__ == "__main__":
    migrate_integration_link()
