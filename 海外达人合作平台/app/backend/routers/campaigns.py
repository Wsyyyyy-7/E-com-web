import json
import logging
from typing import Any, List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.campaigns import CampaignsService
from services.translate import translate_campaign_to_english
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/campaigns", tags=["campaigns"])


# ---------- Pydantic Schemas ----------
class CampaignsData(BaseModel):
    """Entity data schema (for create/update)"""
    title: str
    description: str = None
    country: str = None
    platform: str = None
    category: str = None
    collab_type: str = None
    total_budget: float = None
    per_creator_min: float = None
    per_creator_max: float = None
    conditions: str = None
    threshold: int = None
    milestones: str = None
    deadline_apply: Optional[datetime] = None
    deadline_publish: Optional[datetime] = None
    retention_days: int = None
    keywords: str = None
    compliance_notes: str = None
    product_image_url: Optional[str] = None
    title_en: Optional[str] = None
    description_en: Optional[str] = None
    conditions_en: Optional[str] = None
    milestones_en: Optional[str] = None
    status: str
    applicant_count: int = None
    created_at: Optional[datetime] = None


class CampaignsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    title: Optional[str] = None
    description: Optional[str] = None
    country: Optional[str] = None
    platform: Optional[str] = None
    category: Optional[str] = None
    collab_type: Optional[str] = None
    total_budget: Optional[float] = None
    per_creator_min: Optional[float] = None
    per_creator_max: Optional[float] = None
    conditions: Optional[str] = None
    threshold: Optional[int] = None
    milestones: Optional[str] = None
    deadline_apply: Optional[datetime] = None
    deadline_publish: Optional[datetime] = None
    retention_days: Optional[int] = None
    keywords: Optional[str] = None
    compliance_notes: Optional[str] = None
    product_image_url: Optional[str] = None
    title_en: Optional[str] = None
    description_en: Optional[str] = None
    conditions_en: Optional[str] = None
    milestones_en: Optional[str] = None
    status: Optional[str] = None
    applicant_count: Optional[int] = None
    created_at: Optional[datetime] = None


class CampaignsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    title: str
    description: Optional[str] = None
    country: Optional[str] = None
    platform: Optional[str] = None
    category: Optional[str] = None
    collab_type: Optional[str] = None
    total_budget: Optional[float] = None
    per_creator_min: Optional[float] = None
    per_creator_max: Optional[float] = None
    conditions: Optional[str] = None
    threshold: Optional[int] = None
    milestones: Optional[str] = None
    deadline_apply: Optional[datetime] = None
    deadline_publish: Optional[datetime] = None
    retention_days: Optional[int] = None
    keywords: Optional[str] = None
    compliance_notes: Optional[str] = None
    product_image_url: Optional[str] = None
    title_en: Optional[str] = None
    description_en: Optional[str] = None
    conditions_en: Optional[str] = None
    milestones_en: Optional[str] = None
    status: str
    applicant_count: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CampaignsListResponse(BaseModel):
    """List response schema"""
    items: List[CampaignsResponse]
    total: int
    skip: int
    limit: int


class CampaignsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[CampaignsData]


class CampaignsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: CampaignsUpdateData


class CampaignsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[CampaignsBatchUpdateItem]


class CampaignsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=CampaignsListResponse)
async def query_campaignss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query campaignss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying campaignss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = CampaignsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} campaignss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying campaignss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=CampaignsListResponse)
async def query_campaignss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query campaignss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying campaignss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = CampaignsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )

        # Public marketplace endpoint: hide total_budget from response so only merchants
        # (who use the authenticated /api/v1/entities/campaigns endpoint) can see it.
        items = result.get("items", [])
        for item in items:
            try:
                # ORM model instance; setting attribute is enough for Pydantic response model
                setattr(item, "total_budget", None)
            except Exception:
                continue

        logger.debug(f"Found {result['total']} campaignss")
        return {**result, "items": items}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying campaignss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=CampaignsResponse)
async def get_campaigns(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single campaigns by ID (user can only see their own records)"""
    logger.debug(f"Fetching campaigns with id: {id}, fields={fields}")
    
    service = CampaignsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Campaigns with id {id} not found")
            raise HTTPException(status_code=404, detail="Campaigns not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching campaigns {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=CampaignsResponse, status_code=201)
async def create_campaigns(
    data: CampaignsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new campaigns. English versions (title_en, description_en, etc.) are auto-generated when content has CJK."""
    logger.debug(f"Creating new campaigns with data: {data}")
    
    payload = data.model_dump()
    en_fields = translate_campaign_to_english(
        title=payload.get("title") or "",
        description=payload.get("description"),
        conditions_json=payload.get("conditions"),
        milestones_json=payload.get("milestones"),
    )
    payload.update(en_fields)

    service = CampaignsService(db)
    try:
        result = await service.create(payload, user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create campaigns")
        
        logger.info(f"Campaigns created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating campaigns: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating campaigns: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[CampaignsResponse], status_code=201)
async def create_campaignss_batch(
    request: CampaignsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple campaignss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} campaignss")
    
    service = CampaignsService(db)
    results = []
    
    try:
        for item_data in request.items:
            payload = item_data.model_dump()
            en_fields = translate_campaign_to_english(
                title=payload.get("title") or "",
                description=payload.get("description"),
                conditions_json=payload.get("conditions"),
                milestones_json=payload.get("milestones"),
            )
            payload.update(en_fields)
            result = await service.create(payload, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} campaignss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[CampaignsResponse])
async def update_campaignss_batch(
    request: CampaignsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple campaignss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} campaignss")
    
    service = CampaignsService(db)
    results = []
    
    try:
        for item in request.items:
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            existing = await service.get_by_id(item.id, user_id=str(current_user.id))
            _ensure_en_fields_for_update(update_dict, existing)
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} campaignss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


def _ensure_en_fields_for_update(update_dict: dict, existing: Optional[Any]) -> None:
    """If update_dict touches title/description/conditions/milestones, recompute _en and merge."""
    need_title = "title" in update_dict
    need_desc = "description" in update_dict
    need_cond = "conditions" in update_dict
    need_mil = "milestones" in update_dict
    if not (need_title or need_desc or need_cond or need_mil):
        return
    title = update_dict.get("title") if need_title else (getattr(existing, "title", None) if existing else None)
    description = update_dict.get("description") if need_desc else (getattr(existing, "description", None) if existing else None)
    conditions_json = update_dict.get("conditions") if need_cond else (getattr(existing, "conditions", None) if existing else None)
    milestones_json = update_dict.get("milestones") if need_mil else (getattr(existing, "milestones", None) if existing else None)
    en_fields = translate_campaign_to_english(
        title=title or "",
        description=description,
        conditions_json=conditions_json,
        milestones_json=milestones_json,
    )
    update_dict.update(en_fields)


@router.put("/{id}", response_model=CampaignsResponse)
async def update_campaigns(
    id: int,
    data: CampaignsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing campaigns (requires ownership). English fields are refreshed when title/description/conditions/milestones change."""
    logger.debug(f"Updating campaigns {id} with data: {data}")

    service = CampaignsService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        existing = await service.get_by_id(id, user_id=str(current_user.id))
        _ensure_en_fields_for_update(update_dict, existing)
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Campaigns with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Campaigns not found")
        
        logger.info(f"Campaigns {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating campaigns {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating campaigns {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_campaignss_batch(
    request: CampaignsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple campaignss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} campaignss")
    
    service = CampaignsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} campaignss successfully")
        return {"message": f"Successfully deleted {deleted_count} campaignss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_campaigns(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single campaigns by ID (requires ownership)"""
    logger.debug(f"Deleting campaigns with id: {id}")
    
    service = CampaignsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Campaigns with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Campaigns not found")
        
        logger.info(f"Campaigns {id} deleted successfully")
        return {"message": "Campaigns deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting campaigns {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")