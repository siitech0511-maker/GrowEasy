import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy.orm import Session
from core.database import SessionLocal
from db_models.marketing import LeadSourceConfig, LeadSourceType

def update_key():
    db = SessionLocal()
    try:
        # Check if config exists
        config = db.query(LeadSourceConfig).filter(
            LeadSourceConfig.source_name == "OpenStreetMap"
        ).first()
        
        if not config:
            print("Creating new config for OpenStreetMap...")
            config = LeadSourceConfig(
                source_name="OpenStreetMap",
                is_active=True,
                api_key="88620f1d64b64dd8b4bb33aa34c2859e" # The key user provided
            )
            db.add(config)
        else:
            print("Updating existing config...")
            config.api_key = "88620f1d64b64dd8b4bb33aa34c2859e"
            config.is_active = True
            
        db.commit()
        print("Successfully updated OpenStreetMap API Key in Database!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_key()
