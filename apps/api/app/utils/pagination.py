import base64
import json
from typing import Optional, Any
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

