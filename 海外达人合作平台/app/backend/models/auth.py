from models.base import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    # Primary identifier; for OIDC users this is the platform "sub", for local
    # email/phone users this can be a generated UUID string.
    id = Column(String(255), primary_key=True, index=True)

    # Email-based login (optional but recommended). For phone-only users this
    # may be empty.
    email = Column(String(255), nullable=True)

    # Optional mobile phone number for phone-based login.
    phone = Column(String(32), nullable=True)

    # Password hash for local accounts (bcrypt, etc.). For pure OIDC users this
    # can remain NULL.
    password_hash = Column(String(255), nullable=True)

    name = Column(String(255), nullable=True)
    role = Column(String(50), default="user", nullable=False)  # user/admin

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)


class OIDCState(Base):
    __tablename__ = "oidc_states"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(255), unique=True, index=True, nullable=False)
    nonce = Column(String(255), nullable=False)
    code_verifier = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
