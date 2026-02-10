from sqlalchemy import create_engine, text
from core.config import settings

def migrate_automation():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS crm_automation_rules (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description VARCHAR(500),
                    event_type VARCHAR(50),
                    trigger_condition TEXT,
                    action_type VARCHAR(50),
                    action_config TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("Table crm_automation_rules created/verified.")
        except Exception as e:
            print(f"Error creating table: {e}")

        try:
            conn.execute(text("ALTER TABLE crm_leads ADD COLUMN first_response_at DATETIME"))
            print("Added first_response_at to Leads.")
        except Exception as e:
            print(f"Column first_response_at might exist: {e}")
            
        conn.commit()

if __name__ == "__main__":
    migrate_automation()
