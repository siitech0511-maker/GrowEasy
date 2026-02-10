from sqlalchemy import create_engine, text
from core.config import settings

def migrate_opportunities():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        try:
            # Check if column exists is hard in generic SQL, so we just try/except or inspect
            # This is a hacky migration for dev.
            conn.execute(text("ALTER TABLE crm_opportunities ADD COLUMN priority VARCHAR(20) DEFAULT 'Medium'"))
            print("Added priority column")
        except Exception as e:
            print(f"Priority column might exist: {e}")

        try:
            conn.execute(text("ALTER TABLE crm_opportunities ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
            print("Added created_at column")
        except Exception as e:
            print(f"created_at column might exist: {e}")
            
        try:
            conn.execute(text("ALTER TABLE crm_opportunities ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
            print("Added updated_at column")
        except Exception as e:
            print(f"updated_at column might exist: {e}")
            
        conn.commit()

if __name__ == "__main__":
    migrate_opportunities()
