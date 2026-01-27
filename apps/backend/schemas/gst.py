from pydantic import BaseModel, condecimal
from typing import Optional, List
from datetime import date

class GSTCategoryBase(BaseModel):
    name: str
    cgst_rate: condecimal(max_digits=5, decimal_places=2) = 0.00
    sgst_rate: condecimal(max_digits=5, decimal_places=2) = 0.00
    igst_rate: condecimal(max_digits=5, decimal_places=2) = 0.00
    is_active: bool = True

class GSTCategoryCreate(GSTCategoryBase):
    pass

class GSTCategory(GSTCategoryBase):
    id: str
    class Config:
        from_attributes = True

class HSNMasterBase(BaseModel):
    code: str
    description: Optional[str] = None
    gst_category_id: str
    type: str = "Goods"

class HSNMasterCreate(HSNMasterBase):
    pass

class HSNMaster(HSNMasterBase):
    id: str
    category: Optional[GSTCategory] = None
    class Config:
        from_attributes = True

class GSTConfigurationBase(BaseModel):
    gstin: str
    state_code: str
    registration_type: str

class GSTConfigurationCreate(GSTConfigurationBase):
    company_id: str

class GSTConfiguration(GSTConfigurationBase):
    id: str
    company_id: str
    class Config:
        from_attributes = True

class TaxCalculationRequest(BaseModel):
    amount: condecimal(max_digits=20, decimal_places=2)
    hsn_id: str
    shipping_state_code: str # To determine IGST vs CGST/SGST
    company_id: str

class TaxCalculationResponse(BaseModel):
    base_amount: condecimal(max_digits=20, decimal_places=2)
    cgst: condecimal(max_digits=10, decimal_places=2)
    sgst: condecimal(max_digits=10, decimal_places=2)
    igst: condecimal(max_digits=10, decimal_places=2)
    total_tax: condecimal(max_digits=20, decimal_places=2)
    grand_total: condecimal(max_digits=20, decimal_places=2)
