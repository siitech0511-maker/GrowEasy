from sqlalchemy import create_engine, text
from core.config import settings

def migrate_enterprise():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS crm_audit_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    entity_type VARCHAR(50),
                    entity_id INT,
                    action VARCHAR(50),
                    field_name VARCHAR(50),
                    old_value TEXT,
                    new_value TEXT,
                    changed_by CHAR(36),
                    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("Table crm_audit_logs created.")
        except Exception as e: print(f"Error logs: {e}")

        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS crm_comms_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    direction VARCHAR(10),
                    channel VARCHAR(20),
                    reference_type VARCHAR(50),
                    reference_id INT,
                    subject VARCHAR(255),
                    content TEXT,
                    status VARCHAR(20),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("Table crm_comms_logs created.")
        except Exception as e: print(f"Error comms: {e}")

        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS crm_grid_views (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    view_name VARCHAR(100) NOT NULL,
                    role_target VARCHAR(50),
                    view_config TEXT,
                    created_by CHAR(36),
                    is_default BOOLEAN DEFAULT FALSE
                )
            """))
            print("Table crm_grid_views created.")
        except Exception as e: print(f"Error grid: {e}")
            
        conn.commit()

if __name__ == "__main__":
    migrate_enterprise()
