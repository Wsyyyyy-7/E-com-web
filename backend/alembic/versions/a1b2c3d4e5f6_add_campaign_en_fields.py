"""add campaign English fields (title_en, description_en, conditions_en, milestones_en)

Revision ID: a1b2c3d4e5f6
Revises: 9f2b3c0b8c01
Create Date: 2026-03-04

"""
from alembic import op
import sqlalchemy as sa


revision = "a1b2c3d4e5f6"
down_revision = "9f2b3c0b8c01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("campaigns", sa.Column("title_en", sa.String(), nullable=True))
    op.add_column("campaigns", sa.Column("description_en", sa.String(), nullable=True))
    op.add_column("campaigns", sa.Column("conditions_en", sa.String(), nullable=True))
    op.add_column("campaigns", sa.Column("milestones_en", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("campaigns", "milestones_en")
    op.drop_column("campaigns", "conditions_en")
    op.drop_column("campaigns", "description_en")
    op.drop_column("campaigns", "title_en")
