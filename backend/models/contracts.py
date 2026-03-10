from core.database import Base
from sqlalchemy import Column, DateTime, Float, Integer, String


class Contracts(Base):
    __tablename__ = "contracts"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    campaign_id = Column(Integer, nullable=False)
    merchant_user_id = Column(String, nullable=True)
    creator_user_id = Column(String, nullable=True)
    agreed_rate = Column(Float, nullable=True)
    conditions_met = Column(Integer, nullable=True)
    conditions_total = Column(Integer, nullable=True)
    threshold = Column(Integer, nullable=True)
    current_milestone = Column(Integer, nullable=True)
    milestone_data = Column(String, nullable=True)
    escrow_amount = Column(Float, nullable=True)
    released_amount = Column(Float, nullable=True)
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)