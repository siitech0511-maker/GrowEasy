from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from db_models.base import Base, UUIDMixin, TimestampMixin
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    BUYER = "buyer"
    SELLER = "seller"

class Company(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "companies"
    name = Column(String(255), nullable=False)
    gstin = Column(String(15), nullable=False)
    address = Column(String(500), nullable=True)
    logo_url = Column(String(255), nullable=True)

    users = relationship("User", back_populates="company")

class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.BUYER, nullable=False)
    full_name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    mfa_secret = Column(String(255), nullable=True)
    
    company_id = Column(ForeignKey("companies.id"), nullable=False)
    company = relationship("Company", back_populates="users")
