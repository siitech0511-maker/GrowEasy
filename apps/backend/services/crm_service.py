from sqlalchemy.orm import Session
from sqlalchemy import func
from db_models.crm import Lead, Account, Contact, Opportunity, Activity, LeadStatus
from db_models.accounting import JournalHeader # Example integration if needed later
from fastapi import HTTPException
from datetime import datetime

# --- LEAD SERVICES ---

def get_leads(db: Session, skip: int = 0, limit: int = 100, status: str = None):
    query = db.query(Lead)
    if status:
        query = query.filter(Lead.lead_status == status)
    return query.offset(skip).limit(limit).all()

def create_lead(db: Session, lead_data: dict, user_id: str):
    # Generate Lead Code (Simple Auto-Increment Logic or UUID)
    count = db.query(Lead).count()
    lead_code = f"LD-{datetime.now().year}-{count + 1:04d}"
    
    new_lead = Lead(
        lead_code=lead_code,
        name=lead_data["name"],
        company_name=lead_data.get("company_name"),
        email=lead_data.get("email"),
        phone=lead_data.get("phone"),
        lead_source=lead_data.get("lead_source"),
        assigned_to=user_id
    )
    db.add(new_lead)
    db.flush() # Get ID for AI service if needed
    
    # AI Predictive Insights
    from services import ai_service
    ai_insights = ai_service.predict_lead_conversion(new_lead)
    new_lead.conversion_probability = ai_insights["probability"]
    new_lead.best_time_to_call = ai_insights["best_time"]
    
    db.commit()
    db.refresh(new_lead)
    
    # Trigger Workflows
    from services import workflow_service
    workflow_service.trigger_workflows(db, "lead_created", new_lead)
    
    return new_lead

def update_lead(db: Session, lead_id: int, lead_data: dict, user_id: str = None):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    from db_models.crm import CRMAuditLog
    for key, value in lead_data.items():
        old_val = str(getattr(lead, key))
        new_val = str(value)
        
        if old_val != new_val:
            # Audit Log
            audit = CRMAuditLog(
                entity_type="Lead",
                entity_id=lead_id,
                action="update",
                field_name=key,
                old_value=old_val,
                new_value=new_val,
                changed_by=user_id
            )
            db.add(audit)
            setattr(lead, key, value)
    
    db.commit()
    db.refresh(lead)
    return lead

def log_communication(db: Session, comm_data: dict):
    from db_models.crm import CRMCommunicationLog
    log = CRMCommunicationLog(**comm_data)
    db.add(log)
    db.commit()
    return log

def convert_lead(db: Session, lead_id: int, user_id: str):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.lead_status == LeadStatus.CONVERTED:
        raise HTTPException(status_code=400, detail="Lead already converted")

    # 1. Create Account
    account = Account(
        account_name=lead.company_name or lead.name,
        account_owner=user_id,
        billing_address=None # Could map from lead if available
    )
    db.add(account)
    db.flush() # Get ID

    # 2. Create Contact
    contact = Contact(
        account_id=account.id,
        name=lead.name,
        email=lead.email,
        phone=lead.phone,
        val_primary_contact=True
    )
    db.add(contact)

    # 3. Create Opportunity
    opportunity = Opportunity(
        opportunity_name=f"{account.account_name} - New Deal",
        account_id=account.id,
        stage="Prospect",
        deal_value=0.0,
        probability=10,
        expected_close_date=datetime.utcnow()
    )
    db.add(opportunity)

    # 4. Update Lead Status
    lead.lead_status = LeadStatus.CONVERTED
    
    db.commit()
    return {"account_id": account.id, "opportunity_id": opportunity.id}

# --- OPPORTUNITY SERVICES ---

def get_opportunities(db: Session):
    return db.query(Opportunity).options(joinedload(Opportunity.account)).all()

def update_opportunity_stage(db: Session, opp_id: int, stage: str):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    opp.stage = stage
    db.commit()
    return opp

def get_pipeline_stats(db: Session):
    opportunities = db.query(Opportunity).all()
    
    total_value = sum(o.deal_value or 0 for o in opportunities)
    # Weighted Forecast = Sum(Value * Probability / 100)
    weighted_forecast = sum((o.deal_value or 0) * (o.probability or 0) / 100 for o in opportunities)
    open_deals = [o for o in opportunities if o.stage not in ["Won", "Lost"]]
    won_deals = [o for o in opportunities if o.stage == "Won"]
    
    win_rate = (len(won_deals) / len(opportunities) * 100) if opportunities else 0
    avg_deal_size = (total_value / len(opportunities)) if opportunities else 0
    
    return {
        "total_value": total_value,
        "weighted_forecast": weighted_forecast,
        "open_deals_count": len(open_deals),
        "win_rate": round(win_rate, 1),
        "avg_deal_size": round(avg_deal_size, 2)
    }

# --- ACCOUNT SERVICES ---

from sqlalchemy.orm import joinedload

def get_accounts(db: Session):
    return db.query(Account).options(joinedload(Account.contacts)).all()
