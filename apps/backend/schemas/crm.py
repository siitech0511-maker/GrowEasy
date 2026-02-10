from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# --- LEAD SCHEMAS ---
class LeadBase(BaseModel):
    name: str
    company_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    lead_source: Optional[str] = "Website"
    lead_status: Optional[str] = "New"
    lead_score: Optional[int] = 0
    
    # Advanced Features
    whatsapp_consent: Optional[bool] = False
    conversion_probability: Optional[float] = 0.0
    best_time_to_call: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    lead_source: Optional[str] = None
    lead_status: Optional[str] = None
    lead_score: Optional[int] = None
    assigned_to: Optional[str] = None

class Lead(LeadBase):
    id: int
    lead_code: str
    assigned_to: Optional[str] = None
    first_response_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# --- CONTACT SCHEMAS ---
class ContactBase(BaseModel):
    name: str
    designation: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    val_primary_contact: Optional[bool] = False

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: int
    account_id: int

    class Config:
        orm_mode = True

# --- ACCOUNT SCHEMAS ---
class AccountBase(BaseModel):
    account_name: str
    gst_number: Optional[str] = None
    industry: Optional[str] = None
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None
    credit_limit: Optional[float] = 0.0
    payment_terms: Optional[str] = None

class AccountCreate(AccountBase):
    account_owner: Optional[str] = None

class Account(AccountBase):
    id: int
    account_owner: Optional[str] = None
    contacts: List[Contact] = [] # Include contacts

    class Config:
        orm_mode = True

# --- OPPORTUNITY SCHEMAS ---
class OpportunityBase(BaseModel):
    opportunity_name: str
    stage: str
    deal_value: Optional[float] = 0.0
    probability: Optional[int] = 0
    expected_close_date: Optional[datetime] = None
    priority: Optional[str] = "Medium"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class OpportunityCreate(OpportunityBase):
    account_id: int

class OpportunityUpdate(BaseModel):
    opportunity_name: Optional[str] = None
    stage: Optional[str] = None
    deal_value: Optional[float] = None
    probability: Optional[int] = None
    expected_close_date: Optional[datetime] = None
    priority: Optional[str] = None

class Opportunity(OpportunityBase):
    id: int
    account_id: int
    account: Optional[Account] = None # Include full account details

    class Config:
        orm_mode = True
