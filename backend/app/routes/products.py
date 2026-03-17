from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.product import (
    ProductCreate, ProductOut, RequirementUpdate, StageAdvance,
    StageReject, DashboardStats
)
from app.services import product_service

router = APIRouter(prefix="/api", tags=["products"])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    return product_service.get_dashboard_stats(db)


@router.get("/products", response_model=list[ProductOut])
def list_products(stage: str | None = None, db: Session = Depends(get_db)):
    return product_service.list_products(db, stage)


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    return product_service.create_product(db, data)


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = product_service.get_product(db, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@router.post("/products/{product_id}/advance", response_model=ProductOut)
def advance_stage(product_id: int, data: StageAdvance, db: Session = Depends(get_db)):
    try:
        return product_service.advance_stage(db, product_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/products/{product_id}/reject", response_model=ProductOut)
def reject_product(product_id: int, data: StageReject, db: Session = Depends(get_db)):
    try:
        return product_service.reject_product(db, product_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/requirements/{req_id}", response_model=dict)
def update_requirement(req_id: int, data: RequirementUpdate, db: Session = Depends(get_db)):
    try:
        req = product_service.update_requirement(db, req_id, data)
        return {"id": req.id, "status": req.status, "completed_at": str(req.completed_at)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
