import logging
import os
from pathlib import Path
from typing import Any, Optional

from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

# Backend root (app/backend) so env files are found no matter where uvicorn is started
_BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # Application
    app_name: str = "FastAPI Modular Template"
    debug: bool = False
    version: str = "1.0.0"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # AWS Lambda Configuration
    is_lambda: bool = False
    lambda_function_name: str = "fastapi-backend"
    aws_region: str = "us-east-1"

    # Database: 仅从 supabase.env 读取，必须为 Supabase (PostgreSQL)；本地 app.db 仅作临时/迁移用
    database_url: Optional[str] = None

    # OSS / Storage (optional): for product image upload. Env: OSS_SERVICE_URL, OSS_API_KEY
    oss_service_url: Optional[str] = None
    oss_api_key: Optional[str] = None

    # Local upload dir for merchant product images (fallback when Supabase Storage not set). Relative to backend root.
    upload_dir: str = "uploads"

    # Supabase Storage: for product images (public deployment). Read from supabase.env.
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None

    @property
    def backend_url(self) -> str:
        """Generate backend URL from host and port."""
        if self.is_lambda:
            # In Lambda environment, return the API Gateway URL
            return os.environ.get(
                "PYTHON_BACKEND_URL", f"https://{self.lambda_function_name}.execute-api.{self.aws_region}.amazonaws.com"
            )
        else:
            # Use localhost for external callbacks instead of 0.0.0.0
            display_host = "127.0.0.1" if self.host == "0.0.0.0" else self.host
            return os.environ.get("PYTHON_BACKEND_URL", f"http://{display_host}:{self.port}")

    class Config:
        case_sensitive = False
        extra = "ignore"
        # 仅 .env（JWT 等）；DATABASE_URL 只从 supabase.env 读，见下方
        env_file = [str(_BACKEND_ROOT / ".env")]
        env_file_encoding = "utf-8"

    def __getattr__(self, name: str) -> Any:
        """
        Dynamically read attributes from environment variables.
        For example: settings.opapi_key reads from OPAPI_KEY environment variable.

        Args:
            name: Attribute name (e.g., 'opapi_key')

        Returns:
            Value from environment variable

        Raises:
            AttributeError: If attribute doesn't exist and not found in environment variables
        """
        # Convert attribute name to environment variable name (snake_case -> UPPER_CASE)
        env_var_name = name.upper()

        # Check if environment variable exists
        if env_var_name in os.environ:
            value = os.environ[env_var_name]
            # Cache the value in instance dict to avoid repeated lookups
            self.__dict__[name] = value
            logger.debug(f"Read dynamic attribute {name} from environment variable {env_var_name}")
            return value

        # If not found, raise AttributeError to maintain normal Python behavior
        raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{name}'")


# Global settings instance
settings = Settings()

# 数据库只使用 Supabase：仅从 supabase.env 读取 DATABASE_URL，且必须为 PostgreSQL
# 本地 app.db 仅作临时/迁移用，运行态后端不连本地 SQLite
_supabase_env = _BACKEND_ROOT / "supabase.env"
if not _supabase_env.exists():
    raise ValueError(
        "缺少 supabase.env。请在 app/backend 下创建 supabase.env，并配置 DATABASE_URL=postgresql://..."
    )
_db_url: Optional[str] = None
_supabase_url: Optional[str] = None
_supabase_key: Optional[str] = None
with open(_supabase_env, encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip().strip("'\"").strip()
            if key == "DATABASE_URL":
                _db_url = val
            elif key == "SUPABASE_URL":
                _supabase_url = val
            elif key == "SUPABASE_SERVICE_ROLE_KEY":
                _supabase_key = val
        if line.startswith("postgresql://") or line.startswith("postgres://"):
            _db_url = line.strip("'\"").strip()
# 接受 postgresql:// 或 postgres://（均为 PostgreSQL）
if not _db_url:
    raise ValueError(
        "supabase.env 中未找到 DATABASE_URL。请在该文件写一行：DATABASE_URL=postgresql://postgres.项目ref:密码@aws-0-区域.pooler.supabase.com:5432/postgres"
    )
if "postgresql" not in _db_url and "postgres://" not in _db_url:
    raise ValueError(
        "supabase.env 的 DATABASE_URL 必须是 PostgreSQL 连接串（以 postgresql:// 或 postgres:// 开头）。"
        " 当前值开头：%s" % (_db_url[:50] + "..." if len(_db_url) > 50 else _db_url)
    )
# 统一为 postgresql:// 便于 SQLAlchemy 识别
if _db_url and _db_url.startswith("postgres://"):
    _db_url = "postgresql://" + _db_url[len("postgres://"):]
settings.database_url = _db_url
settings.supabase_url = _supabase_url
settings.supabase_service_role_key = _supabase_key
# 打印连接目标（便于排查 Connection refused）
try:
    from urllib.parse import urlparse
    _parsed = urlparse(_db_url)
    _host = _parsed.hostname or _parsed.netloc.split("@")[-1].split(":")[0]
    _port = _parsed.port or 5432
    logger.info("Supabase target: %s:%s (from supabase.env)", _host, _port)
    if _host and _host.startswith("db.") and _host.endswith(".supabase.co"):
        logger.warning(
            "你当前使用的是 Direct 连接 (db.xxx.supabase.co)。若出现 Connection refused，"
            "请改用 Session mode：Supabase 控制台 → Project Settings → Database → Connection string → 选 Session mode → 复制 URI 到 supabase.env"
        )
except Exception:
    pass
