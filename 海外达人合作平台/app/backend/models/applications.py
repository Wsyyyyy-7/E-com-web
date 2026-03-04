from core.database import Base
from sqlalchemy import Column, DateTime, Float, Integer, String


class Applications(Base):
    __tablename__ = "applications"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    campaign_id = Column(Integer, nullable=False)
    proposed_rate = Column(Float, nullable=True)
    message = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=True)