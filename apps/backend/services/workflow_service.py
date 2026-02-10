import json
from sqlalchemy.orm import Session
from db_models.crm import AutomationRule, Activity, Lead, Opportunity
from datetime import datetime, timedelta

def trigger_workflows(db: Session, event_type: str, entity: any):
    """
    Evaluates and executes active automation rules for a given event.
    """
    rules = db.query(AutomationRule).filter(AutomationRule.is_active == True, AutomationRule.event_type == event_type).all()
    
    for rule in rules:
        try:
            # 1. Evaluate Condition (Simplified JSON check)
            conditions = json.loads(rule.trigger_condition) if rule.trigger_condition else {}
            if not evaluate_condition(entity, conditions):
                continue
            
            # 2. Execute Action
            config = json.loads(rule.action_config) if rule.action_config else {}
            execute_action(db, rule.action_type, config, entity)
            
        except Exception as e:
            print(f"Error executing rule {rule.id}: {e}")

def evaluate_condition(entity, conditions):
    # Extremely basic evaluation for demo: check if fields match
    # e.g., {"deal_value": {">": 100000}}
    for field, rule in conditions.items():
        if not hasattr(entity, field):
            continue
        val = getattr(entity, field)
        if isinstance(rule, dict):
            if ">" in rule and not (val > rule[">"]): return False
            if "<" in rule and not (val < rule["<"]): return False
            if "==" in rule and not (val == rule["=="]): return False
    return True

def execute_action(db: Session, action_type: str, config: dict, entity: any):
    if action_type == "create_activity":
        # Determine reference
        ref_type = entity.__class__.__name__
        ref_id = entity.id
        
        due_date = datetime.utcnow()
        if "offset_minutes" in config:
            due_date += timedelta(minutes=config["offset_minutes"])
        
        new_activity = Activity(
            activity_type=config.get("activity_type", "Task"),
            reference_type=ref_type,
            reference_id=ref_id,
            due_date=due_date,
            remarks=config.get("remarks", f"Auto-generated action from rule"),
            status="Pending"
        )
        db.add(new_activity)
        db.commit()
        print(f"Workflow: Created activity for {ref_type} #{ref_id}")
