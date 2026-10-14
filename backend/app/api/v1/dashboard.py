from fastapi import APIRouter, Depends, HTTPException, Query
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional
from app.services.cache import get_revenue_summary, get_properties
from app.core.auth import authenticate_request as get_current_user

router = APIRouter()

@router.get("/dashboard/properties")
async def get_dashboard_properties(
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    tenant_id = getattr(current_user, "tenant_id", None)
    if not tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated with this user")

    try:
        properties = await get_properties(tenant_id)
    except Exception:
        raise HTTPException(status_code=503, detail="Properties are temporarily unavailable")

    return {"properties": properties}

@router.get("/dashboard/summary")
async def get_dashboard_summary(
    property_id: str,
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    
    if (month is None) != (year is None):
        raise HTTPException(status_code=422, detail="month and year must be provided together")
    
    tenant_id = getattr(current_user, "tenant_id", None)
    if not tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated with this user")
    
    try:
        revenue_data = await get_revenue_summary(property_id, tenant_id, month, year)
    except Exception:
        raise HTTPException(status_code=503, detail="Revenue data is temporarily unavailable")
    
    total_revenue = Decimal(str(revenue_data['total'])).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    
    return {
        "property_id": revenue_data['property_id'],
        "total_revenue": str(total_revenue),
        "currency": revenue_data['currency'],
        "reservations_count": revenue_data['count']
    }
