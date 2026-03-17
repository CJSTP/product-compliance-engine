from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.product import (
    ProductType, CustomerSegment, WorkflowStage, RiskLevel,
    RequirementCategory, RequirementStatus
)


class ProductCreate(BaseModel):
    name: str
    product_type: ProductType
    customer_segment: CustomerSegment
    target_states: list[str]
    description: Optional[str] = None
    key_features: list[str] = []
    submitted_by: str
    target_launch_date: Optional[str] = None


class RequirementUpdate(BaseModel):
    status: RequirementStatus
    notes: Optional[str] = None
    completed_by: Optional[str] = None


class StageAdvance(BaseModel):
    actor: str
    notes: Optional[str] = None


class StageReject(BaseModel):
    actor: str
    notes: str


class RequirementOut(BaseModel):
    id: int
    category: RequirementCategory
    title: str
    description: str
    regulation_ref: Optional[str]
    applies_to_states: Optional[str]
    status: RequirementStatus
    is_blocking: bool
    notes: Optional[str]
    completed_at: Optional[datetime]
    completed_by: Optional[str]

    class Config:
        from_attributes = True


class StageEventOut(BaseModel):
    id: int
    from_stage: Optional[WorkflowStage]
    to_stage: WorkflowStage
    actor: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ProductOut(BaseModel):
    id: int
    product_id: str
    name: str
    product_type: ProductType
    customer_segment: CustomerSegment
    target_states: str
    description: Optional[str]
    key_features: Optional[str]
    current_stage: WorkflowStage
    risk_level: RiskLevel
    risk_score: float
    submitted_by: str
    target_launch_date: Optional[str]
    created_at: datetime
    updated_at: datetime
    requirements: list[RequirementOut] = []
    stage_history: list[StageEventOut] = []

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total: int
    by_stage: dict[str, int]
    by_risk: dict[str, int]
    recent_products: list[ProductOut]
