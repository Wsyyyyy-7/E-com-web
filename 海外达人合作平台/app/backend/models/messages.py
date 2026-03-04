from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Messages(Base):
    __tablename__ = "messages"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    contract_id = Column(Integer, nullable=True)
    receiver_id = Column(String, nullable=True)
    content = Column(String, nullable=False)
    msg_type = Column(String, nullable=True)
    is_read = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)