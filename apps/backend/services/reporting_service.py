from sqlalchemy.orm import Session
from sqlalchemy import func
from db_models.crm import Lead, Opportunity, CRMSalesTarget
from datetime import datetime, timedelta

def get_crm_analytics(db: Session):
    # 1. Lead Source ROI (Count by Source)
    source_stats = db.query(
        Lead.lead_source, 
        func.count(Lead.id).label("count")
    ).group_by(Lead.lead_source).all()
    
    # 2. Conversion Funnel
    total_leads = db.query(func.count(Lead.id)).scalar() or 0
    converted_leads = db.query(func.count(Lead.id)).filter(Lead.lead_status == "Converted").scalar() or 0
    funnel = {
        "leads": total_leads,
        "converted": converted_leads,
        "conversion_rate": round((converted_leads / total_leads * 100), 2) if total_leads > 0 else 0
    }
    
    # 3. Win/Loss Analysis
    won_opps = db.query(func.count(Opportunity.id)).filter(Opportunity.stage == "Won").scalar() or 0
    lost_opps = db.query(func.count(Opportunity.id)).filter(Opportunity.stage == "Lost").scalar() or 0
    
    # 4. Sales Velocity (Simplified: Total Won Value / Avg Days to Close)
    # This usually requires tracking close dates. Let's provide a mock for now.
    velocity = {
        "avg_deal_size": db.query(func.avg(Opportunity.deal_value)).filter(Opportunity.stage == "Won").scalar() or 0,
        "win_rate": round((won_opps / (won_opps + lost_opps) * 100), 2) if (won_opps + lost_opps) > 0 else 0
    }
    
    # 5. Target vs Achievement
    targets = db.query(CRMSalesTarget).all()
    won_value = db.query(func.sum(Opportunity.deal_value)).filter(Opportunity.stage == "Won").scalar() or 0
    
    return {
        "source_roi": [{"source": s[0], "count": s[1]} for s in source_stats],
        "funnel": funnel,
        "win_loss": {"won": won_opps, "lost": lost_opps},
        "velocity": velocity,
        "achievement": {
            "actual": won_value,
            "target": sum(t.target_value for t in targets) or 1000000, # Default target for demo
            "percent": round((won_value / sum(t.target_value for t in targets) * 100), 2) if sum(t.target_value for t in targets) > 0 else 0
        }
    }
