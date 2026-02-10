from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, CHAR, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from db_models.base import Base

class LeadSourceType(str, enum.Enum):
    GOOGLE_MAPS = "Google Maps"
    JUSTDIAL = "Justdial"
    INDIAMART = "IndiaMART"
    FACEBOOK = "Facebook"
    OPENSTREETMAP = "OpenStreetMap"
    MANUAL = "Manual"

class LeadStatusType(str, enum.Enum):
    NEW = "New"
    CONTACTED = "Contacted"
    INTERESTED = "Interested"
    PROPOSAL_SENT = "Proposal Sent"
    WON = "Won"
    LOST = "Lost"

class ActivityType(str, enum.Enum):
    CALL = "Call"
    MEETING = "Meeting"
    EMAIL = "Email"
    WHATSAPP = "WhatsApp"
    NOTE = "Note"
    STATUS_CHANGE = "Status Change"

class BusinessLead(Base):
    __tablename__ = "marketing_business_leads"

    id = Column(Integer, primary_key=True, index=True)
    
    # Business Information
    business_name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), index=True)
    source = Column(String(50), default=LeadSourceType.MANUAL, index=True)
    
    # Contact Information
    phone = Column(String(50), index=True)
    email = Column(String(255))
    address = Column(Text)
    city = Column(String(100), index=True)
    state = Column(String(100))
    pincode = Column(String(20))
    
    # Business Metrics
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    
    # Website Detection
    has_website = Column(Boolean, default=False, index=True)
    website_url = Column(String(500))
    
    # Lead Scoring & Status
    lead_score = Column(Integer, default=0, index=True)
    lead_status = Column(String(50), default=LeadStatusType.NEW, index=True)
    
    # Assignment
    assigned_to = Column(CHAR(36), ForeignKey("users.id"), nullable=True, index=True)
    assigned_at = Column(DateTime)
    
    # Source-specific Data
    google_maps_url = Column(String(500))
    google_place_id = Column(String(255))
    justdial_rating = Column(Float)
    indiamart_company_type = Column(String(100))  # Manufacturer, Wholesaler, Trader
    facebook_page_id = Column(String(255))
    
    # Duplicate Detection
    duplicate_hash = Column(String(64), unique=True, index=True)  # Hash of name + phone
    
    # Additional Fields
    contact_person = Column(String(255))
    product_category = Column(String(255))  # For IndiaMART B2B leads
    notes = Column(Text)
    lost_reason = Column(String(255))
    
    # Geo Location
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_contacted_at = Column(DateTime)
    
    # Relationships
    activities = relationship("LeadActivity", back_populates="lead", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_score_status', 'lead_score', 'lead_status'),
        Index('idx_city_category', 'city', 'category'),
    )


class LeadActivity(Base):
    __tablename__ = "marketing_lead_activities"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("marketing_business_leads.id"), nullable=False, index=True)
    
    activity_type = Column(String(50), nullable=False)  # Call, Meeting, Email, WhatsApp, Note
    subject = Column(String(255))
    notes = Column(Text)
    
    # Call-specific
    call_duration = Column(Integer)  # in seconds
    call_outcome = Column(String(100))  # Connected, No Answer, Busy, etc.
    
    # Meeting-specific
    meeting_date = Column(DateTime)
    meeting_location = Column(String(255))
    
    # Status tracking
    old_status = Column(String(50))
    new_status = Column(String(50))
    
    created_by = Column(CHAR(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    lead = relationship("BusinessLead", back_populates="activities")


class LeadQualificationRule(Base):
    __tablename__ = "marketing_qualification_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String(100), nullable=False)
    
    # Qualification Criteria
    min_rating = Column(Float, default=4.0)
    min_reviews = Column(Integer, default=50)
    website_required = Column(Boolean, default=False)  # True = must NOT have website
    phone_required = Column(Boolean, default=True)
    
    # Additional Filters
    excluded_categories = Column(Text)  # JSON array of categories to exclude
    min_lead_score = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CategoryWeight(Base):
    __tablename__ = "marketing_category_weights"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), unique=True, nullable=False, index=True)
    weight = Column(Integer, default=10)  # Score bonus for this category
    description = Column(String(255))
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LeadSourceConfig(Base):
    """Configuration for external lead sources (Google Maps, Justdial, etc.)"""
    __tablename__ = "marketing_source_configs"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), unique=True, nullable=False, index=True)
    
    # API Configuration
    api_key = Column(String(500))
    api_secret = Column(String(500))
    api_endpoint = Column(String(500))
    
    # Rate Limiting
    daily_quota = Column(Integer, default=1000)
    requests_today = Column(Integer, default=0)
    last_request_at = Column(DateTime)  # Track last request for daily reset
    
    # Scoring
    source_weight = Column(Integer, default=10)  # Weight for lead scoring
    
    # Configuration
    config_json = Column(Text)  # JSON for source-specific settings
    is_active = Column(Boolean, default=True, index=True)
    
    # Sync Tracking
    last_sync_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
