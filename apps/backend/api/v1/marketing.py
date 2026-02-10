from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from services import marketing_service
from api import deps
from schemas import marketing as schemas
from datetime import datetime

import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ===== Lead Management Endpoints =====

@router.get("/leads", response_model=schemas.BusinessLeadList)
def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = None,
    source: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    min_score: Optional[int] = None,
    max_score: Optional[int] = None,
    assigned_to: Optional[str] = None,
    has_website: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of business leads with filtering and pagination"""
    filters = {
        'status': status,
        'source': source,
        'city': city,
        'category': category,
        'min_score': min_score,
        'max_score': max_score,
        'assigned_to': assigned_to,
        'has_website': has_website,
        'search': search
    }
    # Remove None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    leads = marketing_service.get_leads(db, skip=skip, limit=limit, filters=filters)
    
    # Get total count for pagination
    from db_models.marketing import BusinessLead
    total = db.query(BusinessLead).count()
    
    return {
        'total': total,
        'leads': leads,
        'page': skip // limit + 1,
        'page_size': limit
    }


@router.get("/leads/{lead_id}", response_model=schemas.BusinessLead)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    """Get single lead by ID"""
    lead = marketing_service.get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/leads", response_model=schemas.BusinessLead)
def create_lead(
    lead: schemas.BusinessLeadCreate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Create a new business lead"""
    lead_data = lead.dict()
    return marketing_service.create_lead(db, lead_data, user_id=current_user.id)


@router.put("/leads/{lead_id}", response_model=schemas.BusinessLead)
def update_lead(
    lead_id: int,
    lead_data: schemas.BusinessLeadUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Update a business lead"""
    lead = marketing_service.update_lead(
        db, lead_id, lead_data.dict(exclude_unset=True), user_id=current_user.id
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.delete("/leads/{lead_id}")
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Delete a business lead"""
    success = marketing_service.delete_lead(db, lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}


@router.post("/leads/{lead_id}/assign", response_model=schemas.BusinessLead)
def assign_lead(
    lead_id: int,
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Assign lead to a sales rep"""
    lead = marketing_service.assign_lead(db, lead_id, user_id, assigned_by=current_user.id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/leads/{lead_id}/activity", response_model=schemas.LeadActivity)
def log_activity(
    lead_id: int,
    activity: schemas.LeadActivityCreate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Log an activity for a lead"""
    activity_data = activity.dict()
    activity_data['lead_id'] = lead_id
    activity_data['created_by'] = current_user.id
    return marketing_service.log_activity(db, activity_data)


@router.get("/leads/{lead_id}/activities", response_model=List[schemas.LeadActivity])
def get_lead_activities(lead_id: int, db: Session = Depends(get_db)):
    """Get all activities for a lead"""
    return marketing_service.get_lead_activities(db, lead_id)


# ===== Analytics Endpoints =====

@router.get("/analytics", response_model=schemas.LeadAnalytics)
def get_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get lead analytics for dashboard"""
    filters = {}
    if start_date:
        filters['start_date'] = start_date
    if end_date:
        filters['end_date'] = end_date
    
    return marketing_service.get_lead_analytics(db, filters)


@router.get("/analytics/funnel")
def get_funnel(db: Session = Depends(get_db)):
    """Get conversion funnel data"""
    stages = marketing_service.get_conversion_funnel(db)
    return {"stages": stages}


@router.get("/analytics/performance", response_model=List[schemas.SourcePerformance])
def get_performance(db: Session = Depends(get_db)):
    """Get source performance metrics"""
    return marketing_service.get_source_performance(db)


# ===== Configuration Endpoints =====

@router.get("/rules", response_model=List[schemas.QualificationRule])
def get_qualification_rules(db: Session = Depends(get_db)):
    """Get all qualification rules"""
    from db_models.marketing import LeadQualificationRule
    return db.query(LeadQualificationRule).all()


@router.post("/rules", response_model=schemas.QualificationRule)
def create_qualification_rule(
    rule: schemas.QualificationRuleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Create a new qualification rule (admin only)"""
    from db_models.marketing import LeadQualificationRule
    db_rule = LeadQualificationRule(**rule.dict())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.put("/rules/{rule_id}", response_model=schemas.QualificationRule)
def update_qualification_rule(
    rule_id: int,
    rule_data: schemas.QualificationRuleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Update a qualification rule (admin only)"""
    from db_models.marketing import LeadQualificationRule
    db_rule = db.query(LeadQualificationRule).filter(LeadQualificationRule.id == rule_id).first()
    if not db_rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    for key, value in rule_data.dict(exclude_unset=True).items():
        setattr(db_rule, key, value)
    
    db_rule.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.get("/categories", response_model=List[schemas.CategoryWeight])
def get_category_weights(db: Session = Depends(get_db)):
    """Get all category weights"""
    from db_models.marketing import CategoryWeight
    return db.query(CategoryWeight).filter(CategoryWeight.is_active == True).all()


@router.post("/categories", response_model=schemas.CategoryWeight)
def create_category_weight(
    category: schemas.CategoryWeightCreate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Create a new category weight (admin only)"""
    from db_models.marketing import CategoryWeight
    db_category = CategoryWeight(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/categories/{category_id}", response_model=schemas.CategoryWeight)
def update_category_weight(
    category_id: int,
    category_data: schemas.CategoryWeightUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Update a category weight (admin only)"""
    from db_models.marketing import CategoryWeight
    db_category = db.query(CategoryWeight).filter(CategoryWeight.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category_data.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    
    db_category.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_category)
    return db_category


@router.get("/sources", response_model=List[schemas.LeadSourceConfig])
def get_source_configs(db: Session = Depends(get_db)):
    """Get all lead source configurations"""
    from db_models.marketing import LeadSourceConfig
    return db.query(LeadSourceConfig).all()


@router.post("/sources", response_model=schemas.LeadSourceConfig)
def create_source_config(
    source: schemas.LeadSourceConfigCreate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Create a new source configuration (admin only)"""
    from db_models.marketing import LeadSourceConfig
    db_source = LeadSourceConfig(**source.dict())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source


@router.put("/sources/{source_id}", response_model=schemas.LeadSourceConfig)
def update_source_config(
    source_id: int,
    source_data: schemas.LeadSourceConfigUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """Update a source configuration (admin only)"""
    from db_models.marketing import LeadSourceConfig
    db_source = db.query(LeadSourceConfig).filter(LeadSourceConfig.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    for key, value in source_data.dict(exclude_unset=True).items():
        setattr(db_source, key, value)
    
    db_source.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_source)
    return db_source


# ===== Discovery Endpoint =====

@router.post("/discover", response_model=schemas.LeadDiscoveryStatus)
def discover_leads(
    request: schemas.LeadDiscoveryRequest,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Trigger lead discovery from external sources
    Supports: Google Maps, Justdial, IndiaMART, Facebook
    """
    from services import lead_aggregator_service
    
    results = {
        "job_id": None,
        "status": "completed",
        "total_found": 0,
        "total_qualified": 0,
        "total_created": 0,
        "leads": [],
        "message": ""
    }
    
    messages = []
    
    # Process each selected source
    try:
        logger.info(f"Discovery request sources inputs: {request.sources}")
        
        for source in request.sources:
            # Normalize source string
            source_key = source.lower().replace(" ", "")
            logger.info(f"Processing normalized source: '{source_key}'")
            
            if source_key == "googlemaps":
                result = lead_aggregator_service.discover_google_maps_leads(
                    db, 
                    city=request.city,
                    category=request.category,
                    radius=request.radius,
                    max_results=request.max_results
                )
            elif source_key == "openstreetmap":
                result = lead_aggregator_service.discover_openstreetmap_leads(
                    db,
                    city=request.city,
                    category=request.category,
                    max_results=request.max_results
                )
            elif source_key == "justdial":
                result = lead_aggregator_service.discover_justdial_leads(
                    db,
                    city=request.city,
                    category=request.category
                )
            elif source_key == "indiamart":
                result = lead_aggregator_service.discover_indiamart_leads(
                    db,
                    category=request.category,
                    city=request.city
                )
            elif source_key == "facebook":
                result = lead_aggregator_service.discover_facebook_leads(
                    db,
                    location=request.city,
                    category=request.category
                )
            else:
                logger.warning(f"Unknown source ignored: {source}")
                continue
            
            # Aggregate results
            results["total_found"] += result.get("total_found", 0)
            results["total_qualified"] += result.get("total_qualified", 0)
            results["total_created"] += result.get("total_created", 0)
            if result.get("leads"):
                results["leads"].extend(result.get("leads"))
                
        results["status"] = "completed"
        results["message"] = f"Successfully discovered {results['total_created']} leads"
        
    except Exception as e:
        logger.error(f"Discovery Loop Error: {str(e)}")
        import traceback
        traceback.print_exc()
        results["status"] = "failed"
        results["message"] = f"Discovery Error: {str(e)}"
        
    return results


# ===== Export Endpoint (Placeholder) =====

@router.post("/export")
def export_leads(
    request: schemas.LeadExportRequest,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Export leads to Excel or CSV
    NOTE: This is a placeholder. Actual implementation requires export library.
    """
    # TODO: Implement actual export logic
    return {
        "message": "Export feature coming soon",
        "format": request.format
    }
