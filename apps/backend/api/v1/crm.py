from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from services import crm_service, reporting_service, integrations_service
from api import deps
from schemas import crm as schemas

router = APIRouter()

@router.get("/analytics")
def get_crm_reports(db: Session = Depends(get_db)):
    return reporting_service.get_crm_analytics(db)

@router.get("/accounts/{account_id}/360")
def get_account_360_view(account_id: int, db: Session = Depends(get_db)):
    data = integrations_service.get_customer_360(db, account_id)
    if not data:
        raise HTTPException(status_code=404, detail="Account not found")
    return data

# --- Endpoints ---

@router.get("/leads", response_model=List[schemas.Lead])
def list_leads(skip: int = 0, limit: int = 100, status: str = None, db: Session = Depends(get_db)):
    return crm_service.get_leads(db, skip, limit, status)

@router.post("/leads", response_model=schemas.Lead)
def create_new_lead(
    lead: schemas.LeadCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    return crm_service.create_lead(db, lead.dict(), user_id=current_user.id) 

@router.put("/leads/{lead_id}", response_model=schemas.Lead)
def update_lead_endpoint(lead_id: int, lead_data: dict, db: Session = Depends(deps.get_db), current_user = Depends(deps.get_current_user)):
    return crm_service.update_lead(db, lead_id, lead_data, user_id=current_user.id)

@router.post("/comms/log")
def log_crm_communication(comm_data: dict, db: Session = Depends(deps.get_db)):
    return crm_service.log_communication(db, comm_data)

@router.post("/leads/{lead_id}/convert")
def convert_lead_to_customer(
    lead_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    return crm_service.convert_lead(db, lead_id, user_id=current_user.id)

@router.get("/opportunities", response_model=List[schemas.Opportunity])
def list_opportunities(db: Session = Depends(get_db)):
    return crm_service.get_opportunities(db)

@router.put("/opportunities/{opp_id}/stage", response_model=schemas.Opportunity)
def update_stage(opp_id: int, update: schemas.OpportunityUpdate, db: Session = Depends(get_db)):
    return crm_service.update_opportunity_stage(db, opp_id, update.stage)

@router.get("/opportunities/stats")
def get_pipeline_stats(db: Session = Depends(get_db)):
    return crm_service.get_pipeline_stats(db)



@router.get("/accounts", response_model=List[schemas.Account])
def list_accounts(db: Session = Depends(get_db)):
    return crm_service.get_accounts(db)
