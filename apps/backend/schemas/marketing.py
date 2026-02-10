from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ===== Lead Schemas =====

class BusinessLeadBase(BaseModel):
    business_name: str
    category: Optional[str] = None
    source: Optional[str] = "Manual"
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    has_website: Optional[bool] = False
    website_url: Optional[str] = None
    contact_person: Optional[str] = None
    product_category: Optional[str] = None
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BusinessLeadCreate(BusinessLeadBase):
    # Source-specific fields
    google_maps_url: Optional[str] = None
    google_place_id: Optional[str] = None
    justdial_rating: Optional[float] = None
    indiamart_company_type: Optional[str] = None
    facebook_page_id: Optional[str] = None


class BusinessLeadUpdate(BaseModel):
    business_name: Optional[str] = None
    category: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    lead_status: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    lost_reason: Optional[str] = None
    contact_person: Optional[str] = None


class BusinessLead(BusinessLeadBase):
    id: int
    lead_score: int
    lead_status: str
    assigned_to: Optional[str] = None
    assigned_at: Optional[datetime] = None
    duplicate_hash: Optional[str] = None
    google_maps_url: Optional[str] = None
    google_place_id: Optional[str] = None
    justdial_rating: Optional[float] = None
    indiamart_company_type: Optional[str] = None
    facebook_page_id: Optional[str] = None
    lost_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_contacted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BusinessLeadList(BaseModel):
    total: int
    leads: List[BusinessLead]
    page: int
    page_size: int


# ===== Activity Schemas =====

class LeadActivityCreate(BaseModel):
    lead_id: int
    activity_type: str
    subject: Optional[str] = None
    notes: Optional[str] = None
    call_duration: Optional[int] = None
    call_outcome: Optional[str] = None
    meeting_date: Optional[datetime] = None
    meeting_location: Optional[str] = None
    created_by: Optional[str] = None


class LeadActivity(BaseModel):
    id: int
    lead_id: int
    activity_type: str
    subject: Optional[str] = None
    notes: Optional[str] = None
    call_duration: Optional[int] = None
    call_outcome: Optional[str] = None
    meeting_date: Optional[datetime] = None
    meeting_location: Optional[str] = None
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Discovery Schemas =====

class LeadDiscoveryRequest(BaseModel):
    city: str
    category: Optional[str] = None
    sources: List[str] = Field(default=["Google Maps"])  # Google Maps, Justdial, IndiaMART, Facebook
    radius: Optional[int] = 5000  # in meters for Google Maps
    max_results: Optional[int] = 100


class LeadDiscoveryStatus(BaseModel):
    job_id: Optional[str] = None
    status: str  # pending, running, completed, failed
    total_found: int = 0
    total_qualified: int = 0
    total_created: int = 0
    message: Optional[str] = None


# ===== Analytics Schemas =====

class LeadAnalytics(BaseModel):
    total_leads: int
    by_status: dict
    by_source: dict
    conversion_rate: float
    average_score: float
    won_leads: int


class ConversionFunnelStage(BaseModel):
    stage: str
    count: int


class ConversionFunnel(BaseModel):
    stages: List[ConversionFunnelStage]


class SourcePerformance(BaseModel):
    source: str
    total_leads: int
    won_leads: int
    conversion_rate: float


# ===== Configuration Schemas =====

class QualificationRuleBase(BaseModel):
    rule_name: str
    min_rating: Optional[float] = 4.0
    min_reviews: Optional[int] = 50
    website_required: Optional[bool] = False
    phone_required: Optional[bool] = True
    excluded_categories: Optional[str] = None
    min_lead_score: Optional[int] = 0


class QualificationRuleCreate(QualificationRuleBase):
    pass


class QualificationRuleUpdate(BaseModel):
    rule_name: Optional[str] = None
    min_rating: Optional[float] = None
    min_reviews: Optional[int] = None
    website_required: Optional[bool] = None
    phone_required: Optional[bool] = None
    excluded_categories: Optional[str] = None
    min_lead_score: Optional[int] = None
    is_active: Optional[bool] = None


class QualificationRule(QualificationRuleBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryWeightBase(BaseModel):
    category: str
    weight: int = 10
    description: Optional[str] = None


class CategoryWeightCreate(CategoryWeightBase):
    pass


class CategoryWeightUpdate(BaseModel):
    weight: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryWeight(CategoryWeightBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeadSourceConfigBase(BaseModel):
    source_name: str
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    api_endpoint: Optional[str] = None
    daily_quota: Optional[int] = 1000
    source_weight: Optional[int] = 5
    config_json: Optional[str] = None


class LeadSourceConfigCreate(LeadSourceConfigBase):
    pass


class LeadSourceConfigUpdate(BaseModel):
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    api_endpoint: Optional[str] = None
    daily_quota: Optional[int] = None
    source_weight: Optional[int] = None
    is_active: Optional[bool] = None
    config_json: Optional[str] = None


class LeadSourceConfig(LeadSourceConfigBase):
    id: int
    requests_today: int
    last_request_at: Optional[datetime] = None
    is_active: bool
    last_sync_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== Filter Schemas =====

class LeadFilters(BaseModel):
    status: Optional[str] = None
    source: Optional[str] = None
    city: Optional[str] = None
    category: Optional[str] = None
    min_score: Optional[int] = None
    max_score: Optional[int] = None
    assigned_to: Optional[str] = None
    has_website: Optional[bool] = None
    search: Optional[str] = None


# ===== Export Schema =====

class LeadExportRequest(BaseModel):
    format: str = "excel"  # excel or csv
    filters: Optional[LeadFilters] = None
    fields: Optional[List[str]] = None  # Specific fields to export
