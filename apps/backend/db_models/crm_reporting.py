from sqlalchemy import Column, String, Enum, ForeignKey, Numeric, Date, CHAR, DateTime
from sqlalchemy.orm import relationship
from db_models.base import Base, UUIDMixin, TimestampMixin
import enum

class DealStage(str, enum.Enum):
    PROSPECTING = "Prospecting"
    QUALIFICATION = "Qualification"
    PROPOSAL = "Proposal"
    NEGOTIATION = "Negotiation"
    CLOSED_WON = "Closed Won"
    CLOSED_LOST = "Closed Lost"

class ActivityType(str, enum.Enum):
    CALL = "Call"
    EMAIL = "Email"
    MEETING = "Meeting"
    TASK = "Task"

class CampaignResponse(str, enum.Enum):
    OPENED = "Opened"
    CLICKED = "Clicked"
    CONVERTED = "Converted"
    NONE = "None"

class Lead(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "leads"
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    status = Column(String(50), default="New")
    company_id = Column(ForeignKey("companies.id"), nullable=False)

class DealHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "deal_headers"
    lead_id = Column(ForeignKey("leads.id"), nullable=False)
    value = Column(Numeric(20, 2), nullable=False)
    stage = Column(Enum(DealStage), default=DealStage.PROSPECTING, nullable=False)
    close_date = Column(Date, nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("DealDetail", back_populates="header", cascade="all, delete-orphan")

class DealDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "deal_details"
    deal_id = Column(ForeignKey("deal_headers.id"), nullable=False)
    activity_type = Column(Enum(ActivityType), nullable=False)
    date = Column(Date, nullable=False)
    notes = Column(String(500), nullable=True)

    header = relationship("DealHeader", back_populates="lines")

class Activity(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "activities"
    deal_id = Column(ForeignKey("deal_headers.id"), nullable=True)
    lead_id = Column(ForeignKey("leads.id"), nullable=True)
    type = Column(Enum(ActivityType), nullable=False)
    description = Column(String(500), nullable=True)
    scheduled_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)

class CampaignHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "campaign_headers"
    name = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    budget = Column(Numeric(20, 2), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("CampaignDetail", back_populates="header", cascade="all, delete-orphan")

class CampaignDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "campaign_details"
    campaign_id = Column(ForeignKey("campaign_headers.id"), nullable=False)
    lead_id = Column(ForeignKey("leads.id"), nullable=False)
    response = Column(Enum(CampaignResponse), default=CampaignResponse.NONE, nullable=False)
    sent_date = Column(Date, nullable=True)

    header = relationship("CampaignHeader", back_populates="lines")

# Module 10: Reporting & Analytics
class CustomReportHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "custom_report_headers"
    name = Column(String(255), nullable=False)
    schedule = Column(String(50), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("CustomReportDetail", back_populates="header", cascade="all, delete-orphan")

class CustomReportDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "custom_report_details"
    report_id = Column(ForeignKey("custom_report_headers.id"), nullable=False)
    filter_type = Column(String(50), nullable=False)  # Date, Account, etc.
    value = Column(String(255), nullable=False)
    metric = Column(String(50), nullable=True)  # Sum, Avg

    header = relationship("CustomReportHeader", back_populates="lines")
