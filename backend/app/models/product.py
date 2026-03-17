from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base


class ProductType(str, enum.Enum):
    bnpl = "bnpl"
    crypto_exchange = "crypto_exchange"
    prepaid_card = "prepaid_card"
    money_transfer = "money_transfer"
    personal_lending = "personal_lending"
    payment_app = "payment_app"
    savings_deposit = "savings_deposit"
    foreign_remittance = "foreign_remittance"


class CustomerSegment(str, enum.Enum):
    consumer = "consumer"
    small_business = "small_business"
    enterprise = "enterprise"


class WorkflowStage(str, enum.Enum):
    intake = "intake"
    regulatory_assessment = "regulatory_assessment"
    legal_review = "legal_review"
    compliance_signoff = "compliance_signoff"
    approved = "approved"
    rejected = "rejected"


class RiskLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class RequirementStatus(str, enum.Enum):
    pending = "pending"
    complete = "complete"
    waived = "waived"
    blocked = "blocked"


class RequirementCategory(str, enum.Enum):
    federal_regulation = "federal_regulation"
    state_licensing = "state_licensing"
    consumer_disclosure = "consumer_disclosure"
    aml_bsa = "aml_bsa"
    data_privacy = "data_privacy"
    prohibited_practices = "prohibited_practices"


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    product_type = Column(SAEnum(ProductType), nullable=False)
    customer_segment = Column(SAEnum(CustomerSegment), nullable=False)
    target_states = Column(String, nullable=False)       # comma-separated state codes
    description = Column(Text, nullable=True)
    key_features = Column(Text, nullable=True)           # comma-separated

    # Workflow
    current_stage = Column(SAEnum(WorkflowStage), default=WorkflowStage.intake)
    risk_level = Column(SAEnum(RiskLevel), default=RiskLevel.medium)
    risk_score = Column(Float, default=0.0)              # 0-100

    # Tracking
    submitted_by = Column(String, nullable=False)
    stage_notes = Column(Text, nullable=True)            # JSON array of stage history
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    target_launch_date = Column(String, nullable=True)

    requirements = relationship("ComplianceRequirement", back_populates="product", cascade="all, delete-orphan")
    stage_history = relationship("StageEvent", back_populates="product", cascade="all, delete-orphan")


class ComplianceRequirement(Base):
    __tablename__ = "compliance_requirements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    category = Column(SAEnum(RequirementCategory), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    regulation_ref = Column(String, nullable=True)       # e.g. "15 U.S.C. § 1601" or "12 CFR Part 226"
    applies_to_states = Column(String, nullable=True)    # null = federal / all states
    status = Column(SAEnum(RequirementStatus), default=RequirementStatus.pending)
    is_blocking = Column(Boolean, default=True)          # must complete before advancing stage
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    completed_by = Column(String, nullable=True)

    product = relationship("Product", back_populates="requirements")


class StageEvent(Base):
    __tablename__ = "stage_events"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    from_stage = Column(SAEnum(WorkflowStage), nullable=True)
    to_stage = Column(SAEnum(WorkflowStage), nullable=False)
    actor = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="stage_history")
