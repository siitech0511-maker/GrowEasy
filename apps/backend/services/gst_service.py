from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from db_models.compliance import GSTCategory, HSNMaster, GSTConfiguration
from schemas.gst import GSTCategoryCreate, HSNMasterCreate, TaxCalculationRequest
from decimal import Decimal

def get_gst_categories(db: Session):
    return db.query(GSTCategory).filter(GSTCategory.is_active == True).all()

def create_gst_category(db: Session, category_in: GSTCategoryCreate):
    db_cat = GSTCategory(**category_in.dict())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

def get_hsn_masters(db: Session):
    return db.query(HSNMaster).all()

def create_hsn_master(db: Session, hsn_in: HSNMasterCreate):
    db_hsn = HSNMaster(**hsn_in.dict())
    db.add(db_hsn)
    db.commit()
    db.refresh(db_hsn)
    return db_hsn

def calculate_taxes(db: Session, req: TaxCalculationRequest):
    # 1. Get Company Configuration (to find state)
    config = db.query(GSTConfiguration).filter(
        GSTConfiguration.company_id == req.company_id
    ).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="GST Configuration not found for company")
    
    # 2. Get HSN and its Category
    hsn = db.query(HSNMaster).filter(HSNMaster.id == req.hsn_id).first()
    if not hsn:
        raise HTTPException(status_code=404, detail="HSN code not found")
    
    cat = db.query(GSTCategory).filter(GSTCategory.id == hsn.gst_category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="GST Category for HSN not found")
    
    # 3. Logic: Same state = CGST + SGST. Different state = IGST.
    is_interstate = config.state_code != req.shipping_state_code
    
    amount = Decimal(str(req.amount))
    cgst = Decimal("0.00")
    sgst = Decimal("0.00")
    igst = Decimal("0.00")
    
    if is_interstate:
        igst = (amount * Decimal(str(cat.igst_rate))) / Decimal("100")
    else:
        cgst = (amount * Decimal(str(cat.cgst_rate))) / Decimal("100")
        sgst = (amount * Decimal(str(cat.sgst_rate))) / Decimal("100")
        
    total_tax = cgst + sgst + igst
    return {
        "base_amount": amount,
        "cgst": cgst,
        "sgst": sgst,
        "igst": igst,
        "total_tax": total_tax,
        "grand_total": amount + total_tax
    }

def get_gst_configuration(db: Session, company_id: str):
    return db.query(GSTConfiguration).filter(GSTConfiguration.company_id == company_id).first()
