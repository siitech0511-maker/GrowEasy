from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from api import deps
from schemas.gst import (
    GSTCategory, GSTCategoryCreate, HSNMaster, HSNMasterCreate, 
    TaxCalculationRequest, TaxCalculationResponse, GSTConfiguration
)
from services import gst_service as service
from db_models.core import User

router = APIRouter()

@router.get("/categories", response_model=List[GSTCategory])
def get_gst_categories(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    return service.get_gst_categories(db)

@router.post("/categories", response_model=GSTCategory)
def create_gst_category(
    category_in: GSTCategoryCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Only Admin can manage tax rates
    if current_user.role.name != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to manage tax categories")
    return service.create_gst_category(db, category_in=category_in)

@router.get("/hsn", response_model=List[HSNMaster])
def get_hsn_masters(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    return service.get_hsn_masters(db)

@router.post("/hsn", response_model=HSNMaster)
def create_hsn_master(
    hsn_in: HSNMasterCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role.name != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to manage HSN codes")
    return service.create_hsn_master(db, hsn_in=hsn_in)

@router.post("/calculate-tax", response_model=TaxCalculationResponse)
def calculate_tax(
    req: TaxCalculationRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if req.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return service.calculate_taxes(db, req=req)

@router.get("/config", response_model=GSTConfiguration)
def get_gst_config(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    config = service.get_gst_configuration(db, company_id=current_user.company_id)
    if not config:
        raise HTTPException(status_code=404, detail="GST configuration not found")
    return config
