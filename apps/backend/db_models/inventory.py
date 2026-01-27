from sqlalchemy import Column, String, Enum, ForeignKey, Numeric, Date, CHAR
from sqlalchemy.orm import relationship
from db_models.base import Base, UUIDMixin, TimestampMixin
import enum

class MovementType(str, enum.Enum):
    IN = "In"
    OUT = "Out"
    TRANSFER = "Transfer"
    ADJUSTMENT = "Adjustment"

class ItemMaster(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "item_masters"
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    uom = Column(String(20), nullable=False)  # Unit of Measure
    category_id = Column(String(36), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

class Warehouse(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "warehouses"
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

class StockMovementHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "stock_movement_headers"
    type = Column(Enum(MovementType), nullable=False)
    date = Column(Date, nullable=False)
    warehouse_id = Column(ForeignKey("warehouses.id"), nullable=False)
    reference = Column(String(100), nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("StockMovementDetail", back_populates="header", cascade="all, delete-orphan")

class StockMovementDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "stock_movement_details"
    move_id = Column(ForeignKey("stock_movement_headers.id"), nullable=False)
    item_id = Column(ForeignKey("item_masters.id"), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    batch_no = Column(String(50), nullable=True)
    cost = Column(Numeric(20, 2), nullable=True)

    header = relationship("StockMovementHeader", back_populates="lines")

class WarehouseTransferHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "warehouse_transfer_headers"
    from_warehouse_id = Column(ForeignKey("warehouses.id"), nullable=False)
    to_warehouse_id = Column(ForeignKey("warehouses.id"), nullable=False)
    date = Column(Date, nullable=False)
    ewb_id = Column(CHAR(36), nullable=True)  # Optional link to EWayBill
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("WarehouseTransferDetail", back_populates="header", cascade="all, delete-orphan")

class WarehouseTransferDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "warehouse_transfer_details"
    transfer_id = Column(ForeignKey("warehouse_transfer_headers.id"), nullable=False)
    item_id = Column(ForeignKey("item_masters.id"), nullable=False)
    quantity = Column(Numeric(20, 4), nullable=False)
    serial_no = Column(String(100), nullable=True)

    header = relationship("WarehouseTransferHeader", back_populates="lines")
