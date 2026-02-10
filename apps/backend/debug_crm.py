from sqlalchemy import create_engine, text, inspect
from core.config import settings
from db_models.base import Base
import sys

# Mocking the UUID for testing if we can't get a real one easily, 
# but usually we want to see if the table exists first.
TEST_USER_ID = "00000000-0000-0000-0000-000000000000" # Dummy UUID if used, but we might check existing users.

def debug_crm():
    print(f"Connecting to {settings.DATABASE_URL}...")
    engine = create_engine(settings.DATABASE_URL)
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Existing tables:", tables)
    
    if "crm_leads" not in tables:
        print("CRITICAL: crm_leads table DOES NOT EXIST. Migration failed.")
        try:
            print("Attempting to create tables again...")
            Base.metadata.create_all(bind=engine)
            print("Table creation command executed.")
        except Exception as e:
            print(f"ERROR creating tables: {e}")
            return
    else:
        print("crm_leads table exists.")
        columns = inspector.get_columns("crm_leads")
        for col in columns:
            if col["name"] == "assigned_to":
                print(f"Column 'assigned_to': {col}")
    
    # Try inserting a dummy lead
    try:
        with engine.connect() as conn:
            # Get a valid user id first
            result = conn.execute(text("SELECT id FROM users LIMIT 1"))
            user = result.fetchone()
            if not user:
                print("No users found in DB. Cannot test FK.")
                return
            user_id = user[0]
            print(f"Found user_id: {user_id}")
            
            print("Attempting to insert test lead...")
            stmt = text("""
                INSERT INTO crm_leads (
                    lead_code, name, company_name, email, phone, 
                    lead_source, lead_status, assigned_to, created_at, updated_at
                ) VALUES (
                    'TEST-001', 'Debug User', 'Debug Corp', 'debug@example.com', '1234567890', 
                    'Website', 'New', :user_id, NOW(), NOW()
                )
            """)
            conn.execute(stmt, {"user_id": user_id})
            conn.commit()
            print("SUCCESS: Test lead inserted.")
            
            # Clean up
            conn.execute(text("DELETE FROM crm_leads WHERE lead_code = 'TEST-001'"))
            conn.commit()
            print("Test lead cleaned up.")
            
    except Exception as e:
        print(f"INSERT ERROR: {e}")

if __name__ == "__main__":
    import db_models.crm # Ensure models are loaded
    debug_crm()
