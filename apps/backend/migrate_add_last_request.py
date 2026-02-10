"""
Add last_request_at column to marketing_source_configs table
"""

from sqlalchemy import create_engine, text
from db_models.core import get_db_url

def add_last_request_at_column():
    """Add last_request_at column for daily quota reset tracking"""
    engine = create_engine(get_db_url())
    
    with engine.connect() as conn:
        try:
            # Check if column exists
            result = conn.execute(text("""
                SELECT COUNT(*) as count
                FROM information_schema.COLUMNS 
                WHERE TABLE_NAME = 'marketing_source_configs' 
                AND COLUMN_NAME = 'last_request_at'
            """))
            
            exists = result.fetchone()[0] > 0
            
            if not exists:
                # Add column
                conn.execute(text("""
                    ALTER TABLE marketing_source_configs 
                    ADD COLUMN last_request_at DATETIME
                """))
                conn.commit()
                print("✅ Column 'last_request_at' added successfully")
            else:
                print("ℹ️  Column 'last_request_at' already exists")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            conn.rollback()

if __name__ == "__main__":
    add_last_request_at_column()
