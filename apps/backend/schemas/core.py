from pydantic import BaseModel, EmailStr
from typing import Optional, List
from db_models.core import UserRole

class CompanyBase(BaseModel):
    name: str
    gstin: str
    address: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    name: Optional[str] = None
    gstin: Optional[str] = None

class Company(CompanyBase):
    id: str
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.BUYER

class UserCreate(UserBase):
    password: str
    company_id: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: str
    company_id: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
