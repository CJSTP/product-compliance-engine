from sqlalchemy.orm import Session
from datetime import datetime
from app.models.product import (
    Product, ComplianceRequirement, StageEvent,
    WorkflowStage, RequirementStatus
)
from app.schemas.product import ProductCreate, RequirementUpdate, StageAdvance, StageReject
from app.services.regulatory_mapper import map_requirements, compute_risk_score
import uuid

STAGE_ORDER = [
    WorkflowStage.intake,
    WorkflowStage.regulatory_assessment,
    WorkflowStage.legal_review,
    WorkflowStage.compliance_signoff,
    WorkflowStage.approved,
]


def create_product(db: Session, data: ProductCreate) -> Product:
    states = [s.strip().upper() for s in data.target_states]
    features = [f.strip() for f in data.key_features]

    raw_reqs = map_requirements(
        data.product_type, data.customer_segment, states, features
    )
    risk_score, risk_level = compute_risk_score(
        data.product_type, data.customer_segment, states, features, raw_reqs
    )

    product = Product(
        product_id=f"PROD-{str(uuid.uuid4())[:8].upper()}",
        name=data.name,
        product_type=data.product_type,
        customer_segment=data.customer_segment,
        target_states=", ".join(states),
        description=data.description,
        key_features=", ".join(features),
        current_stage=WorkflowStage.intake,
        risk_level=risk_level,
        risk_score=risk_score,
        submitted_by=data.submitted_by,
        target_launch_date=data.target_launch_date,
    )
    db.add(product)
    db.flush()

    for r in raw_reqs:
        req = ComplianceRequirement(
            product_id=product.id,
            category=r["category"],
            title=r["title"],
            description=r["description"],
            regulation_ref=r.get("regulation_ref"),
            applies_to_states=r.get("applies_to_states"),
            is_blocking=r.get("is_blocking", True),
        )
        db.add(req)

    event = StageEvent(
        product_id=product.id,
        from_stage=None,
        to_stage=WorkflowStage.intake,
        actor=data.submitted_by,
        notes="Product submitted for compliance review.",
    )
    db.add(event)
    db.commit()
    db.refresh(product)
    return product


def get_product(db: Session, product_id: int) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()


def list_products(db: Session, stage: str | None = None) -> list[Product]:
    q = db.query(Product)
    if stage:
        q = q.filter(Product.current_stage == stage)
    return q.order_by(Product.created_at.desc()).all()


def advance_stage(db: Session, product_id: int, data: StageAdvance) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ValueError("Product not found")

    # Check blocking requirements are complete for current stage
    blocking_incomplete = db.query(ComplianceRequirement).filter(
        ComplianceRequirement.product_id == product_id,
        ComplianceRequirement.is_blocking == True,
        ComplianceRequirement.status == RequirementStatus.pending,
    ).count()

    if blocking_incomplete > 0 and product.current_stage not in (
        WorkflowStage.compliance_signoff,
    ):
        raise ValueError(
            f"{blocking_incomplete} blocking requirement(s) must be completed before advancing."
        )

    current_idx = STAGE_ORDER.index(product.current_stage)
    if current_idx >= len(STAGE_ORDER) - 1:
        raise ValueError("Product is already approved.")

    next_stage = STAGE_ORDER[current_idx + 1]
    old_stage = product.current_stage
    product.current_stage = next_stage

    event = StageEvent(
        product_id=product_id,
        from_stage=old_stage,
        to_stage=next_stage,
        actor=data.actor,
        notes=data.notes,
    )
    db.add(event)
    db.commit()
    db.refresh(product)
    return product


def reject_product(db: Session, product_id: int, data: StageReject) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ValueError("Product not found")

    old_stage = product.current_stage
    product.current_stage = WorkflowStage.rejected

    event = StageEvent(
        product_id=product_id,
        from_stage=old_stage,
        to_stage=WorkflowStage.rejected,
        actor=data.actor,
        notes=data.notes,
    )
    db.add(event)
    db.commit()
    db.refresh(product)
    return product


def update_requirement(
    db: Session, req_id: int, data: RequirementUpdate
) -> ComplianceRequirement:
    req = db.query(ComplianceRequirement).filter(ComplianceRequirement.id == req_id).first()
    if not req:
        raise ValueError("Requirement not found")

    req.status = data.status
    if data.notes:
        req.notes = data.notes
    if data.status == RequirementStatus.complete:
        req.completed_at = datetime.utcnow()
        req.completed_by = data.completed_by

    db.commit()
    db.refresh(req)
    return req


def get_dashboard_stats(db: Session) -> dict:
    products = db.query(Product).all()
    by_stage = {}
    by_risk = {}

    for p in products:
        by_stage[p.current_stage.value] = by_stage.get(p.current_stage.value, 0) + 1
        by_risk[p.risk_level.value] = by_risk.get(p.risk_level.value, 0) + 1

    recent = sorted(products, key=lambda x: x.created_at, reverse=True)[:5]
    return {
        "total": len(products),
        "by_stage": by_stage,
        "by_risk": by_risk,
        "recent_products": recent,
    }
