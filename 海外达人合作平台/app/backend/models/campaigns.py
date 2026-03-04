from core.database import Base
from sqlalchemy import Column, DateTime, Float, Integer, String


class Campaigns(Base):
    __tablename__ = "campaigns"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    country = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    category = Column(String, nullable=True)
    collab_type = Column(String, nullable=True)
    total_budget = Column(Float, nullable=True)
    per_creator_min = Column(Float, nullable=True)
    per_creator_max = Column(Float, nullable=True)
    conditions = Column(String, nullable=True)
    threshold = Column(Integer, nullable=True)
    milestones = Column(String, nullable=True)
    deadline_apply = Column(DateTime(timezone=True), nullable=True)
    deadline_publish = Column(DateTime(timezone=True), nullable=True)
    retention_days = Column(Integer, nullable=True)
    keywords = Column(String, nullable=True)
    compliance_notes = Column(String, nullable=True)
    status = Column(String, nullable=False)
    applicant_count = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)