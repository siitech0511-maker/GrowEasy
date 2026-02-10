from sqlalchemy import create_engine, text
from core.config import settings

def migrate_targets():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS crm_sales_targets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id CHAR(36),
                    period VARCHAR(20),
                    target_value FLOAT DEFAULT 0.0,
                    target_leads INT DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("Table crm_sales_targets created.")
        except Exception as e: print(f"Error targets: {e}")
        conn.commit()

if __name__ == "__main__":
    migrate_targets()
