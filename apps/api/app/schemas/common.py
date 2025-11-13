from typing import Generic, TypeVar, Optional
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ProblemDetail(BaseModel):
    """Problem+JSON error response schema."""

    type: str
    title: str
    status: int
    code: Optional[str] = None
    detail: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class CursorPage(BaseModel, Generic[T]):
    """Cursor-based pagination response."""

    items: list[T]
    next_cursor: Optional[str] = None

    model_config = ConfigDict(extra="forbid")

