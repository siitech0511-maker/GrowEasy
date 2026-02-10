from sqlalchemy.orm import Session
from core.database import SessionLocal
from db_models.crm import Opportunity, Account
import random
from datetime import datetime, timedelta

def seed_opportunities():
    db = SessionLocal()
    try:
        # Get existing accounts
        accounts = db.query(Account).all()
        if not accounts:
            print("No accounts found. Create some accounts first.")
            return

        stages = ["Prospect", "Proposal", "Negotiation", "Won", "Lost"]
        
        # Update existing opportunities with boring data
        existing_ops = db.query(Opportunity).all()
        for op in existing_ops:
            if op.deal_value == 0:
                op.deal_value = random.randint(10000, 500000)
                op.probability = random.choice([10, 30, 50, 70, 90])
                op.stage = random.choice(stages)
                op.expected_close_date = datetime.utcnow() + timedelta(days=random.randint(5, 60))
        
        db.commit()
        print(f"Updated {len(existing_ops)} existing opportunities with realistic data.")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_opportunities()
