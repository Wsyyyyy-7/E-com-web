from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String


class Disputes(Base):
    __tablename__ = "disputes"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    contract_id = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    evidence = Column(String, nullable=True)
    status = Column(String, nullable=False)
    resolution = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)