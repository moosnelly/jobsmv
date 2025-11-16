import base64
import json
from typing import Optional, Any
from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute
import uuid
import structlog

logger = structlog.get_logger(__name__)


def encode_cursor(data: dict[str, Any]) -> str:
    """Encode cursor data to base64url string."""
    json_str = json.dumps(data, sort_keys=True)
    encoded = base64.urlsafe_b64encode(json_str.encode()).decode()
    return encoded.rstrip("=")


def decode_cursor(cursor: str) -> Optional[dict[str, Any]]:
    """Decode cursor from base64url string."""
    try:
        # Add padding if needed
        padding = 4 - len(cursor) % 4
        if padding != 4:
            cursor += "=" * padding
        decoded = base64.urlsafe_b64decode(cursor.encode())
        return json.loads(decoded.decode())
    except Exception as e:
        logger.warning("Failed to decode cursor", error=str(e))
        return None


def apply_cursor_pagination(
    query: Select,
    cursor: Optional[str] = None,
    id_field: Optional[InstrumentedAttribute] = None,
) -> Select:
    """
    Apply cursor pagination filter to a query.
    
    Args:
        query: SQLAlchemy select query
        cursor: Optional cursor string from previous request
        id_field: Field to use for cursor comparison (must be provided)
    
    Returns:
        Modified query with cursor filter applied
    """
    if cursor and id_field:
        cursor_data = decode_cursor(cursor)
        if cursor_data and "last_id" in cursor_data:
            try:
                last_id = uuid.UUID(cursor_data["last_id"])
                query = query.where(id_field > last_id)
            except (ValueError, TypeError) as e:
                logger.warning("Invalid cursor format", error=str(e))
                # Continue without cursor filter
    
    return query


async def get_cursor_paginated_results(
    db: AsyncSession,
    query: Select,
    cursor: Optional[str] = None,
    page_size: int = 20,
    id_field: Optional[InstrumentedAttribute] = None,
) -> tuple[list[Any], Optional[str]]:
    """
    Execute a cursor-paginated query and return results with next cursor.
    
    Args:
        db: Database session
        query: SQLAlchemy select query (should already have ordering applied)
        cursor: Optional cursor string from previous request
        page_size: Number of items per page (default: 20)
        id_field: Field to use for cursor comparison (must be provided)
    
    Returns:
        Tuple of (items, next_cursor)
    """
    # Apply cursor filter
    if cursor and id_field:
        query = apply_cursor_pagination(query, cursor, id_field)
    
    # Fetch one extra to check if there are more results
    query = query.limit(page_size + 1)
    
    result = await db.execute(query)
    items = result.scalars().all()
    
    # Check if there are more results
    has_more = len(items) > page_size
    items = items[:page_size]
    
    # Generate next cursor
    next_cursor = None
    if has_more and items:
        # Use the last item's id for the cursor
        last_item = items[-1]
        last_id = getattr(last_item, "id", None)
        if last_id:
            next_cursor = encode_cursor({"last_id": str(last_id)})
    
    return items, next_cursor

