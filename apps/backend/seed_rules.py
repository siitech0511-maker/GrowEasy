import json
from db_models.crm import AutomationRule
from core.database import SessionLocal

def seed_rules():
    db = SessionLocal()
    rules = [
        {
            "name": "Quick Response - New Lead",
            "description": "Create a callback task 10 minutes after a lead is created.",
            "event_type": "lead_created",
            "trigger_condition": "{}", # Always trigger for new leads
            "action_type": "create_activity",
            "action_config": json.dumps({
                "activity_type": "Call",
                "offset_minutes": 10,
                "remarks": "SLA: First response required within 10 mins."
            })
        },
        {
            "name": "High Value Opportunity Alert",
            "description": "Create a review task for deals over ₹5,00,000.",
            "event_type": "opportunity_updated", # For demo, we can trigger on create too
            "trigger_condition": json.dumps({"deal_value": {">": 500000}}),
            "action_type": "create_activity",
            "action_config": json.dumps({
                "activity_type": "Meeting",
                "remarks": "High Value Deal Alert! Management review required."
            })
        }
    ]
    
    for r_data in rules:
        if not db.query(AutomationRule).filter(AutomationRule.name == r_data["name"]).first():
            db.add(AutomationRule(**r_data))
    
    db.commit()
    db.close()
    print("Seeded automation rules.")

if __name__ == "__main__":
    seed_rules()
