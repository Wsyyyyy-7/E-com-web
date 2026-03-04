from core.database import Base
from sqlalchemy import Column, DateTime, Float, Integer, String


class User_profiles(Base):
    __tablename__ = "user_profiles"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    role = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    country = Column(String, nullable=True)
    categories = Column(String, nullable=True)
    tiktok_handle = Column(String, nullable=True)
    portfolio_links = Column(String, nullable=True)
    rate_min = Column(Float, nullable=True)
    rate_max = Column(Float, nullable=True)
    completion_rate = Column(Float, nullable=True)
    ontime_rate = Column(Float, nullable=True)
    dispute_rate = Column(Float, nullable=True)
    trust_tier = Column(String, nullable=True)
    subscription_plan = Column(String, nullable=True)
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    balance_frozen = Column(Float, nullable=True)
    balance_available = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)