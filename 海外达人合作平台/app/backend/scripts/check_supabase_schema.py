#!/usr/bin/env python3
"""
Check Supabase (PostgreSQL) schema: list tables and columns in public schema,
and compare with backend models. Run from app/backend: python scripts/check_supabase_schema.py
"""
import asyncio
import os
import sys

# Ensure backend root is on path and supabase.env is loadable
_BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)
os.chdir(_BACKEND_ROOT)

# Load DATABASE_URL from supabase.env (same as core.config)
_db_url = None
_supabase_env = os.path.join(_BACKEND_ROOT, "supabase.env")
if not os.path.exists(_supabase_env):
    print("ERROR: supabase.env not found in app/backend")
    sys.exit(1)
with open(_supabase_env, encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, _, val = line.partition("=")
            key, val = key.strip(), val.strip().strip("'\"").strip()
            if key == "DATABASE_URL":
                _db_url = val
        if line.startswith("postgresql://") or line.startswith("postgres://"):
            _db_url = line.strip("'\"").strip()
if not _db_url or "postgresql" not in _db_url:
    print("ERROR: DATABASE_URL not set or not PostgreSQL in supabase.env")
    sys.exit(1)
if _db_url.startswith("postgres://"):
    _db_url = "postgresql://" + _db_url[9:]


async def fetch_db_schema():
    import asyncpg
    conn = await asyncpg.connect(_db_url)
    try:
        rows = await conn.fetch("""
            SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position
        """)
        return rows
    finally:
        await conn.close()


def get_expected_schema():
    """Expected tables/columns from backend models (must import all models)."""
    from core.database import Base
    # Import all models so they register with Base.metadata
    from models import campaigns, auth, contracts, messages, user_profiles
    from models import applications, disputes
    expected = {}
    for name, table in Base.metadata.tables.items():
        expected[name] = [c.name for c in table.columns]
    return expected


def main():
    print("=" * 60)
    print("Supabase schema check (public schema)")
    print("=" * 60)

    # 1) Expected from code
    try:
        expected = get_expected_schema()
        print("\n[Expected] Tables and columns from backend models:")
        for table in sorted(expected.keys()):
            print(f"  {table}: {', '.join(expected[table])}")
    except Exception as e:
        print(f"\n[Expected] Failed to load models: {e}")
        expected = {}

    # 2) Actual from DB
    try:
        rows = asyncio.run(fetch_db_schema())
    except Exception as e:
        print(f"\n[Actual] Failed to connect to Supabase: {e}")
        print("  Check DATABASE_URL in supabase.env and network.")
        return

    actual = {}
    for r in rows:
        t, c = r["table_name"], r["column_name"]
        if t not in actual:
            actual[t] = []
        actual[t].append(c)

    print("\n[Actual] Tables and columns in Supabase (public):")
    for table in sorted(actual.keys()):
        print(f"  {table}: {', '.join(actual[table])}")

    # 3) Compare
    print("\n[Compare]")
    all_ok = True
    for table in sorted(expected.keys()):
        if table not in actual:
            print(f"  MISSING TABLE: {table}")
            all_ok = False
            continue
        exp_cols = set(expected[table])
        act_cols = set(actual[table])
        missing = exp_cols - act_cols
        extra = act_cols - exp_cols
        if missing:
            print(f"  {table}: missing columns: {', '.join(sorted(missing))}")
            all_ok = False
        if extra:
            print(f"  {table}: extra columns (OK): {', '.join(sorted(extra))}")
    for table in sorted(actual.keys()):
        if table not in expected:
            print(f"  Extra table in DB (not in models): {table}")

    if all_ok and expected:
        print("  OK: All expected tables and columns exist.")
    print("=" * 60)


if __name__ == "__main__":
    main()
