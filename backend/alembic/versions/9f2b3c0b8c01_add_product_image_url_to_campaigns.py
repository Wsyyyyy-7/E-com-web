"""add product_image_url to campaigns

Revision ID: 9f2b3c0b8c01
Revises: 8147cee4de74
Create Date: 2026-03-04
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9f2b3c0b8c01"
down_revision = "8147cee4de74"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("campaigns", sa.Column("product_image_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("campaigns", "product_image_url")

