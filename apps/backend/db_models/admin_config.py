from sqlalchemy import Column, String, Enum, ForeignKey, Boolean, CHAR, DateTime
from sqlalchemy.orm import relationship
from db_models.base import Base, UUIDMixin, TimestampMixin
import enum

class NotificationChannel(str, enum.Enum):
    EMAIL = "Email"
    SMS = "SMS"
    PUSH = "Push"

class IntegrationType(str, enum.Enum):
    BANK = "Bank"
    SMS_GATEWAY = "SMS Gateway"
    EMAIL_SERVICE = "Email Service"
    OTHER = "Other"

class MobileActionType(str, enum.Enum):
    INVOICE_CREATE = "InvoiceCreate"
    STOCK_CHECK = "StockCheck"
    AUTH_LOGIN = "AuthLogin"

class CompanySettings(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "company_settings"
    key = Column(String(100), unique=True, nullable=False)
    value = Column(String(500), nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

class NotificationConfigHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "notification_config_headers"
    type = Column(String(50), nullable=False)
    enabled = Column(Boolean, default=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("NotificationConfigDetail", back_populates="header", cascade="all, delete-orphan")

class NotificationConfigDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "notification_config_details"
    config_id = Column(ForeignKey("notification_config_headers.id"), nullable=False)
    channel = Column(Enum(NotificationChannel), nullable=False)
    template = Column(String(1000), nullable=False)
    recipient_role = Column(String(50), nullable=True)

    header = relationship("NotificationConfigHeader", back_populates="lines")

class IntegrationConfigHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "integration_config_headers"
    type = Column(Enum(IntegrationType), nullable=False)
    status = Column(String(20), default="Active")
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("IntegrationConfigDetail", back_populates="header", cascade="all, delete-orphan")

class IntegrationConfigDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "integration_config_details"
    integration_id = Column(ForeignKey("integration_config_headers.id"), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(String(500), nullable=False)
    encrypted = Column(Boolean, default=False)

    header = relationship("IntegrationConfigHeader", back_populates="lines")

class MobileSessionHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mobile_session_headers"
    user_id = Column(ForeignKey("users.id"), nullable=False)
    device_id = Column(String(255), nullable=False)
    start_time = Column(DateTime, nullable=False)
    last_sync = Column(DateTime, nullable=True)

    lines = relationship("MobileSessionDetail", back_populates="header", cascade="all, delete-orphan")

class MobileSessionDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mobile_session_details"
    session_id = Column(ForeignKey("mobile_session_headers.id"), nullable=False)
    action_type = Column(Enum(MobileActionType), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    gps_location = Column(String(255), nullable=True)

    header = relationship("MobileSessionHeader", back_populates="lines")
