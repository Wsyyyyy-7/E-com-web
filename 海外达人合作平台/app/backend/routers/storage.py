import logging
import os
import re
import tempfile
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse, RedirectResponse

from core.config import settings
from dependencies.auth import get_admin_user, get_current_user
from schemas.auth import UserResponse
from schemas.storage import (
    BucketListResponse,
    BucketRequest,
    BucketResponse,
    DeleteResponse,
    FileUpDownRequest,
    FileUpDownResponse,
    ObjectInfo,
    ObjectListResponse,
    ObjectRequest,
    OSSBaseModel,
    RenameRequest,
    RenameResponse,
)
from services.storage import StorageService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/storage", tags=["storage"])

# Local upload: no OSS required. Product images saved under backend/uploads/campaigns/
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_UPLOAD_DIR = _BACKEND_ROOT / getattr(settings, "upload_dir", "uploads")
_CAMPAIGNS_UPLOAD = _UPLOAD_DIR / "campaigns"
_ALLOWED_EXT = frozenset({"jpg", "jpeg", "png", "gif", "webp"})
_SAFE_FILENAME = re.compile(r"^[a-zA-Z0-9_.-]+$")


def _ensure_upload_dirs():
    _CAMPAIGNS_UPLOAD.mkdir(parents=True, exist_ok=True)


_SUPABASE_BUCKET = "campaign-assets"


def _upload_to_supabase(file_data: bytes, path: str, content_type: str) -> str:
    """Upload bytes to Supabase Storage; return public URL. Raises on error."""
    from supabase import create_client
    url = getattr(settings, "supabase_url", None)
    key = getattr(settings, "supabase_service_role_key", None)
    if not url or not key:
        raise ValueError("Supabase Storage not configured")
    client = create_client(url, key)
    try:
        client.storage.create_bucket(_SUPABASE_BUCKET, options={"public": True})
    except Exception:
        pass  # bucket may already exist
    # storage3 upload() expects a file path, not BytesIO
    tmp = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(path).suffix) as f:
            tmp = f.name
            f.write(file_data)
        client.storage.from_(_SUPABASE_BUCKET).upload(
            path,
            tmp,
            file_options={"content-type": content_type, "upsert": "true"},
        )
        base = url.rstrip("/")
        return f"{base}/storage/v1/object/public/{_SUPABASE_BUCKET}/{path}"
    finally:
        if tmp and os.path.exists(tmp):
            try:
                os.unlink(tmp)
            except OSError:
                pass


@router.post("/upload")
async def upload_product_image(
    file: UploadFile = File(...),
    _current_user: UserResponse = Depends(get_current_user),
):
    """
    Upload a product image (multipart). Prefer Supabase Storage when configured (for public deployment);
    otherwise save locally. Used by merchants when creating a campaign.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file")
    ext = (Path(file.filename).suffix or "").lstrip(".").lower()
    if ext not in _ALLOWED_EXT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Allowed types: {', '.join(_ALLOWED_EXT)}",
        )
    max_size = 5 * 1024 * 1024  # 5MB
    file_data = await file.read()
    if len(file_data) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large (max 5MB)",
        )
    content_type = file.content_type or "application/octet-stream"
    if not content_type.startswith("image/"):
        content_type = f"image/{ext}" if ext in ("jpg", "jpeg", "png", "gif", "webp") else "image/jpeg"
    name = f"{uuid.uuid4().hex}.{ext}"
    path = f"campaigns/{name}"

    # Prefer Supabase Storage (for public deployment)
    if getattr(settings, "supabase_url", None) and getattr(settings, "supabase_service_role_key", None):
        try:
            url = _upload_to_supabase(file_data, path, content_type)
            return {"url": url, "filename": name}
        except Exception as e:
            logger.exception("Supabase Storage upload failed: %s", e)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Storage upload failed. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in supabase.env.",
            )

    # Fallback: local disk (e.g. dev without Supabase Storage)
    _ensure_upload_dirs()
    local_path = _CAMPAIGNS_UPLOAD / name
    try:
        local_path.write_bytes(file_data)
    except Exception as e:
        logger.exception("Local upload failed: %s", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Upload failed")
    base = settings.backend_url.rstrip("/")
    url = f"{base}/api/v1/storage/files/campaigns/{name}"
    return {"url": url, "filename": name}


@router.get("/files/campaigns/{filename}")
async def serve_campaign_file(filename: str):
    """
    Serve an uploaded campaign product image. No auth so marketplace can show images.
    """
    if not _SAFE_FILENAME.match(filename):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename")
    ext = (Path(filename).suffix or "").lstrip(".").lower()
    if ext not in _ALLOWED_EXT:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    path = _CAMPAIGNS_UPLOAD / filename
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return FileResponse(path)


@router.post("/create-bucket", response_model=BucketResponse)
async def create_bucket(request: BucketRequest, _current_user: UserResponse = Depends(get_admin_user)):
    """
    Create a new bucket
    """
    try:
        service = StorageService()
        return await service.create_bucket(request)
    except ValueError as e:
        logger.error(f"Invalid create bucket request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create bucket: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")


@router.get("/list-buckets", response_model=BucketListResponse)
async def list_buckets(_current_user: UserResponse = Depends(get_current_user)):
    """
    List buckets of the user
    """
    try:
        service = StorageService()
        return await service.list_buckets()
    except ValueError as e:
        logger.error(f"Invalid list buckets request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to list buckets: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")


@router.get("/list-objects", response_model=ObjectListResponse)
async def list_objects(request: OSSBaseModel = Depends(), _current_user: UserResponse = Depends(get_current_user)):
    """
    List objects under the bucket
    """
    try:
        service = StorageService()
        return await service.list_objects(request)
    except ValueError as e:
        logger.error(f"Invalid list objects request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to list objects: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")


@router.get("/get-object-info", response_model=ObjectInfo)
async def get_object_info(request: ObjectRequest = Depends(), _current_user: UserResponse = Depends(get_current_user)):
    """
    Get object metadata from the bucket
    """
    try:
        service = StorageService()
        return await service.get_object_info(request)
    except ValueError as e:
        logger.error(f"Invalid get object metadata request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get object metadata: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")


@router.post("/rename-object", response_model=RenameResponse)
async def rename_object(request: RenameRequest, _current_user: UserResponse = Depends(get_current_user)):
    """
    Rename object inside the bucket
    """
    try:
        service = StorageService()
        return await service.rename_object(request)
    except ValueError as e:
        logger.error(f"Invalid rename object: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to rename object: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")


@router.delete("/delete-object", response_model=DeleteResponse)
async def delete_object(request: ObjectRequest, _current_user: UserResponse = Depends(get_current_user)):
    """
    Delete object inside the bucket
    """
    try:
        service = StorageService()
        return await service.delete_object(request)
    except ValueError as e:
        logger.error(f"Invalid delete object: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to delete object: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")


@router.post("/upload-url", response_model=FileUpDownResponse)
async def upload_file(request: FileUpDownRequest, _current_user: UserResponse = Depends(get_current_user)):
    """
    Get a presigned URL for uploading a file to StorageService.

    Steps:
    1. Client calls this endpoint with file details
    2. Server validates and calls OSS service
    3. Returns presigned URL and access_url from OSS service
    4. Client uploads file directly to ObjectStorage using the presigned URL
    5. File is accessible at the returned access_url
    """
    try:
        service = StorageService()
        return await service.create_upload_url(request)
    except ValueError as e:
        err_msg = str(e)
        if "not configured" in err_msg.lower() or "OSS" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Storage not configured. Please use an image URL instead.",
            )
        logger.error(f"Invalid upload request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)
    except Exception as e:
        logger.error(f"Failed to generate upload URL: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/download-url", response_model=FileUpDownResponse)
async def download_file(request: FileUpDownRequest, _current_user: UserResponse = Depends(get_current_user)):
    """
    Get a presigned URL for downloading a file to StorageService.
    """
    try:
        service = StorageService()
        return await service.create_download_url(request)
    except ValueError as e:
        logger.error(f"Invalid download request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate download URL: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")


@router.get("/serve")
async def serve_object(
    bucket_name: str = Query(..., alias="bucket_name"),
    object_key: str = Query(..., alias="object_key"),
):
    """
    Public redirect to the file in OSS. Used for product images so <img src="..."> works.
    No auth required so campaign images can be shown on marketplace.
    """
    try:
        service = StorageService()
        request = FileUpDownRequest(bucket_name=bucket_name, object_key=object_key)
        result = await service.create_download_url(request)
        if not result.download_url:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Object not found")
        return RedirectResponse(url=result.download_url, status_code=302)
    except ValueError as e:
        err_msg = str(e)
        if "not configured" in err_msg.lower() or "OSS" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Storage not configured.",
            )
        logger.error(f"Invalid serve request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get serve URL: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Storage unavailable")
