from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.mysql import CHAR
import uuid

Base = declarative_base()

class UUIDMixin:
    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))

class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
