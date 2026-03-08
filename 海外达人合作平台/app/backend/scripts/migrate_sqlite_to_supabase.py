#!/usr/bin/env python3
"""
One-off script: copy data from local SQLite (app.db) to Supabase (PostgreSQL).
Run from app/backend with DATABASE_URL pointing to Supabase (e.g. from supabase.env).

  cd app/backend
  # ensure supabase.env (or .env) has DATABASE_URL=postgresql://...
  python scripts/migrate_sqlite_to_supabase.py

Supabase tables must already exist (start backend once with Supabase DATABASE_URL to create them).
"""
import asyncio
import os
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

# Load .env and supabase.env from backend root
backend_root = Path(__file__).resolve().parent.parent
os.chdir(backend_root)
if (backend_root / "supabase.env").exists():
    with open(backend_root / "supabase.env") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
if (backend_root / ".env").exists():
    with open(backend_root / ".env") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL or "postgresql" not in DATABASE_URL:
    print("Error: DATABASE_URL (PostgreSQL/Supabase) not set. Set it in supabase.env or .env")
    sys.exit(1)

# asyncpg uses postgresql:// (not postgresql+asyncpg)
PG_DSN = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)
# SQLAlchemy async engine needs postgresql+asyncpg
ALCHEMY_PG_URL = DATABASE_URL if "postgresql+asyncpg" in DATABASE_URL else DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
SQLITE_PATH = backend_root / "app.db"

# Add backend to path so we can import app modules
sys.path.insert(0, str(backend_root))

TABLES_ORDER = [
    "users",
    "oidc_states",
    "user_profiles",
    "campaigns",
    "applications",
    "contracts",
    "messages",
    "disputes",
]


def read_sqlite_table(path: Path, table: str):
    """Read all rows and column names from a SQLite table."""
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    cur = conn.execute(f'SELECT * FROM "{table}"')
    rows = cur.fetchall()
    cols = [d[0] for d in cur.description] if rows else []
    conn.close()
    return cols, rows


# Columns that are boolean in PostgreSQL (SQLite stores as 0/1)
BOOLEAN_COLUMNS = {"is_active", "is_read"}
# Columns that are datetime in PostgreSQL (SQLite returns as str)
DATETIME_COLUMNS = {
    "created_at", "last_login", "expires_at", "subscription_expires_at",
    "deadline_apply", "deadline_publish", "completed_at", "resolved_at",
    "updated_at", "resolved_at",
}


def _parse_datetime(val):
    if val is None or isinstance(val, datetime):
        return val
    s = str(val).strip()
    if not s:
        return None
    # SQLite often returns "2026-03-04 21:09:58"; fromisoformat needs "T"
    s = s.replace(" ", "T", 1).replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        pass
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f"):
        try:
            return datetime.strptime(s[:26], fmt[:19] if ".%f" in fmt else fmt)
        except ValueError:
            continue
    return val


def row_to_dict(cols, row):
    """Convert sqlite3.Row to dict, normalizing types for PostgreSQL."""
    d = {}
    for i, c in enumerate(cols):
        val = row[i]
        if val is None:
            d[c] = None
        elif c in BOOLEAN_COLUMNS and isinstance(val, (int,)):
            d[c] = bool(val)
        elif c in DATETIME_COLUMNS and isinstance(val, str):
            d[c] = _parse_datetime(val)
        elif isinstance(val, (bytes,)):
            d[c] = val.decode("utf-8", errors="replace")
        elif isinstance(val, (bool, int, float, str)):
            d[c] = val
        else:
            d[c] = str(val)
    return d


async def main():
    try:
        import asyncpg
    except ImportError:
        print("Install asyncpg: pip install asyncpg")
        sys.exit(1)

    if not SQLITE_PATH.exists():
        print(f"Error: SQLite DB not found at {SQLITE_PATH}")
        sys.exit(1)

    print(f"Source: SQLite {SQLITE_PATH}")
    print(f"Target: Supabase (PostgreSQL)")
    print()

    # Ensure Supabase has tables (create from SQLAlchemy models)
    from sqlalchemy.ext.asyncio import create_async_engine
    from core.database import Base
    import models.auth  # noqa: F401
    import models.user_profiles  # noqa: F401
    import models.campaigns  # noqa: F401
    import models.applications  # noqa: F401
    import models.contracts  # noqa: F401
    import models.messages  # noqa: F401
    import models.disputes  # noqa: F401

    engine = create_async_engine(ALCHEMY_PG_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("Supabase: tables created or already exist.")
    print()

    conn_pg = await asyncpg.connect(PG_DSN)

    try:
        for table in TABLES_ORDER:
            cols, rows = read_sqlite_table(SQLITE_PATH, table)
            if not cols:
                cur = sqlite3.connect(SQLITE_PATH).execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,)
                )
                if cur.fetchone():
                    cols, rows = read_sqlite_table(SQLITE_PATH, table)
                if not cols:
                    print(f"  Skip {table} (not in SQLite)")
                    continue

            if not rows:
                print(f"  {table}: 0 rows")
                continue

            columns = ", ".join(f'"{c}"' for c in cols)
            placeholders = ", ".join(f"${i+1}" for i in range(len(cols)))
            insert_sql = f'INSERT INTO "{table}" ({columns}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING'

            inserted = 0
            for row in rows:
                d = row_to_dict(cols, row)
                vals = [d.get(c) for c in cols]
                try:
                    await conn_pg.execute(insert_sql, *vals)
                    inserted += 1
                except Exception as e:
                    print(f"  {table} row error: {e}")
                    raise

            print(f"  {table}: {inserted} rows")

        # Reset PostgreSQL sequences so next inserts get correct IDs
        for table in TABLES_ORDER:
            try:
                await conn_pg.execute(
                    f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE((SELECT MAX(id) FROM \"{table}\"), 1))"
                )
            except Exception:
                pass  # Table may not have serial id

        print()
        print("Done. Data copied to Supabase.")
    finally:
        await conn_pg.close()


if __name__ == "__main__":
    asyncio.run(main())
