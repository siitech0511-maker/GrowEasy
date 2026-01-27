from sqlalchemy import Column, String, Enum, ForeignKey, Numeric, Date, Integer, DateTime, CHAR
from sqlalchemy.orm import relationship
from db_models.base import Base, UUIDMixin, TimestampMixin
import enum

class AttendanceStatus(str, enum.Enum):
    PRESENT = "Present"
    ABSENT = "Absent"
    LEAVE = "Leave"
    HALFDAY = "Half Day"

class Employee(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "employees"
    employee_code = Column(String(50), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    department = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    joining_date = Column(Date, nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

class AttendanceHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "attendance_headers"
    emp_id = Column(ForeignKey("employees.id"), nullable=False)
    month = Column(Date, nullable=False)  # Usually start of month
    total_days = Column(Integer, default=0)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("AttendanceDetail", back_populates="header", cascade="all, delete-orphan")

class AttendanceDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "attendance_details"
    att_id = Column(ForeignKey("attendance_headers.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)

    header = relationship("AttendanceHeader", back_populates="lines")

class PayrollRunHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "payroll_run_headers"
    period = Column(Date, nullable=False)
    total_net_pay = Column(Numeric(20, 2), nullable=False)
    run_date = Column(Date, nullable=True)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("PayrollRunDetail", back_populates="header", cascade="all, delete-orphan")

class PayrollRunDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "payroll_run_details"
    payroll_id = Column(ForeignKey("payroll_run_headers.id"), nullable=False)
    emp_id = Column(ForeignKey("employees.id"), nullable=False)
    gross_salary = Column(Numeric(20, 2), nullable=False)
    deductions = Column(Numeric(20, 2), nullable=False)
    net_pay = Column(Numeric(20, 2), nullable=False)
    pf_amount = Column(Numeric(20, 2), default=0.00)
    esi_amount = Column(Numeric(20, 2), default=0.00)

    header = relationship("PayrollRunHeader", back_populates="lines")

# Module 15: Projects & Cost Centers
class ProjectHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "project_headers"
    name = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    budget = Column(Numeric(20, 2), nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("ProjectDetail", back_populates="header", cascade="all, delete-orphan")

class ProjectDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "project_details"
    project_id = Column(ForeignKey("project_headers.id"), nullable=False)
    milestone_name = Column(String(255), nullable=False)
    due_date = Column(Date, nullable=False)
    cost = Column(Numeric(20, 2), nullable=True)

    header = relationship("ProjectHeader", back_populates="lines")

class CostCenter(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "cost_centers"
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

class TimesheetHeader(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "timesheet_headers"
    emp_id = Column(ForeignKey("employees.id"), nullable=False)
    week_start = Column(Date, nullable=False)
    total_hours = Column(Numeric(10, 2), default=0.00)
    company_id = Column(ForeignKey("companies.id"), nullable=False)

    lines = relationship("TimesheetDetail", back_populates="header", cascade="all, delete-orphan")

class TimesheetDetail(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "timesheet_details"
    ts_id = Column(ForeignKey("timesheet_headers.id"), nullable=False)
    project_id = Column(ForeignKey("project_headers.id"), nullable=False)
    date = Column(Date, nullable=False)
    hours = Column(Numeric(10, 2), nullable=False)
    task = Column(String(500), nullable=True)

    header = relationship("TimesheetHeader", back_populates="lines")
