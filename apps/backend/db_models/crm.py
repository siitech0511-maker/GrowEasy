from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum, Text, CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from db_models.base import Base

class LeadSource(str, enum.Enum):
    WEBSITE = "Website"
    WHATSAPP = "WhatsApp"
    CALL = "Call"
    REFERRAL = "Referral"
    ADS = "Ads"
    IMPORT = "Import"

class LeadStatus(str, enum.Enum):
    NEW = "New"
    CONTACTED = "Contacted"
    QUALIFIED = "Qualified"
    LOST = "Lost"
    CONVERTED = "Converted"

class ActivityType(str, enum.Enum):
    CALL = "Call"
    MEETING = "Meeting"
    EMAIL = "Email"
    WHATSAPP = "WhatsApp"
    TASK = "Task"

class Lead(Base):
    __tablename__ = "crm_leads"

    id = Column(Integer, primary_key=True, index=True)
    lead_code = Column(String(50), unique=True, index=True) # Auto-generated
    name = Column(String(255), nullable=False)
    company_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    whatsapp_number = Column(String(50))
    lead_source = Column(String(50), default=LeadSource.WEBSITE) # Stored as string for flexibility
    lead_status = Column(String(50), default=LeadStatus.NEW)
    lead_score = Column(Integer, default=0)
    assigned_to = Column(CHAR(36), ForeignKey("users.id"), nullable=True) # UUID
    lost_reason = Column(String(255))
    
    first_response_at = Column(DateTime)
    
    # AI Assisted Features
    conversion_probability = Column(Float, default=0.0) # 0.0 - 1.0 (AI Predicted)
    best_time_to_call = Column(String(50)) # e.g. "Tuesday 2 PM"
    
    # Geo-Tracking (Field Sales)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Compliance
    whatsapp_consent = Column(Boolean, default=False)
    consent_recorded_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ... (rest of the file remains, adding at the end)

class AutomationRule(Base):
    __tablename__ = "crm_automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500))
    event_type = Column(String(50)) # lead_created, opportunity_updated, no_activity
    trigger_condition = Column(Text) # JSON logic
    action_type = Column(String(50)) # create_activity, notify_manager, assign_owner
    action_config = Column(Text) # JSON config
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

# ... (New Enterprise Models)

class CRMAuditLog(Base):
    __tablename__ = "crm_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50)) # Lead, Opportunity, Account
    entity_id = Column(Integer)
    action = Column(String(50)) # update, delete, convert
    field_name = Column(String(50))
    old_value = Column(Text)
    new_value = Column(Text)
    changed_by = Column(CHAR(36), ForeignKey("users.id"))
    changed_at = Column(DateTime, default=datetime.utcnow)

class CRMCommunicationLog(Base):
    __tablename__ = "crm_comms_logs"

    id = Column(Integer, primary_key=True, index=True)
    direction = Column(String(10)) # Inbound, Outbound
    channel = Column(String(20)) # WhatsApp, Email
    reference_type = Column(String(50)) # Lead, Opp, Account
    reference_id = Column(Integer)
    subject = Column(String(255))
    content = Column(Text)
    status = Column(String(20)) # Sent, Delivered, Read, Failed
    created_at = Column(DateTime, default=datetime.utcnow)

class CRMSalesTarget(Base):
    __tablename__ = "crm_sales_targets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(CHAR(36), ForeignKey("users.id"))
    period = Column(String(20)) # e.g. "January 2026", "Q1-2026"
    target_value = Column(Float, default=0.0)
    target_leads = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class Account(Base):
    __tablename__ = "crm_accounts"

    id = Column(Integer, primary_key=True, index=True)
    master_uuid = Column(CHAR(36), unique=True, index=True) # Bridge to Sales/Accounting
    account_name = Column(String(255), nullable=False)
    gst_number = Column(String(50))
    industry = Column(String(100))
    billing_address = Column(Text)
    shipping_address = Column(String(500)) # Simple string for now or Text
    credit_limit = Column(Float, default=0.0)
    payment_terms = Column(String(100))
    account_owner = Column(CHAR(36), ForeignKey("users.id"), nullable=True) # UUID
    
    contacts = relationship("Contact", back_populates="account")
    opportunities = relationship("Opportunity", back_populates="account")

class Contact(Base):
    __tablename__ = "crm_contacts"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("crm_accounts.id"))
    name = Column(String(255), nullable=False)
    designation = Column(String(100))
    email = Column(String(255))
    phone = Column(String(50))
    whatsapp = Column(String(50))
    val_primary_contact = Column(Boolean, default=False) # 'primary_contact' might be reserved? using val_ prefix just in case or standard name

    account = relationship("Account", back_populates="contacts")

class Opportunity(Base):
    __tablename__ = "crm_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_name = Column(String(255), nullable=False)
    account_id = Column(Integer, ForeignKey("crm_accounts.id"))
    pipeline_id = Column(String(50), default="default") # Future support for multiple pipelines
    stage = Column(String(50), default="Prospect")
    deal_value = Column(Float, default=0.0)
    probability = Column(Integer, default=10) # 0-100
    expected_close_date = Column(DateTime)
    priority = Column(String(20), default="Medium") # Low, Medium, High
    lost_reason = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    account = relationship("Account", back_populates="opportunities")

class Activity(Base):
    __tablename__ = "crm_activities"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String(50)) # Call, Meeting, etc.
    reference_type = Column(String(50)) # Lead, Opportunity, Account
    reference_id = Column(Integer)
    due_date = Column(DateTime)
    status = Column(String(50), default="Pending")
    remarks = Column(Text)
    
    # Field Visit / Geo-Checkin
    check_in_lat = Column(Float)
    check_in_lng = Column(Float)
    check_in_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
