from sqlalchemy import create_engine, text
from core.config import settings

def migrate_competitive():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        # Lead Table Updates
        cols_lead = [
            ("conversion_probability", "FLOAT DEFAULT 0.0"),
            ("best_time_to_call", "VARCHAR(50)"),
            ("latitude", "FLOAT"),
            ("longitude", "FLOAT"),
            ("whatsapp_consent", "BOOLEAN DEFAULT FALSE"),
            ("consent_recorded_at", "DATETIME")
        ]
        
        for col, typ in cols_lead:
            try:
                conn.execute(text(f"ALTER TABLE crm_leads ADD COLUMN {col} {typ}"))
                print(f"Added {col} to Leads.")
            except Exception as e: print(f"Column {col} might exist: {e}")

        # Activity Table Updates
        cols_activity = [
            ("check_in_lat", "FLOAT"),
            ("check_in_lng", "FLOAT"),
            ("check_in_at", "DATETIME")
        ]
        
        for col, typ in cols_activity:
            try:
                conn.execute(text(f"ALTER TABLE crm_activities ADD COLUMN {col} {typ}"))
                print(f"Added {col} to Activities.")
            except Exception as e: print(f"Column {col} might exist: {e}")
            
        conn.commit()

if __name__ == "__main__":
    migrate_competitive()
