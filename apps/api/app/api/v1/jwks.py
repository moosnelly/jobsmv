from fastapi import APIRouter
from pathlib import Path
from app.core.config import settings

router = APIRouter()


@router.get("/.well-known/jwks.json")
async def get_jwks():
    """Return JWKS (JSON Web Key Set) for JWT verification."""
    public_key_path = Path(settings.JWKS_PUBLIC_KEY_PATH)
    
    if not public_key_path.exists():
        return {"keys": []}
    
    # In a production system, you'd parse the PEM and convert to JWK format
    # For now, return a simple response indicating the key exists
    return {
        "keys": [
            {
                "kty": "RSA",
                "kid": settings.JWKS_KID,
                "use": "sig",
                "alg": settings.JWT_ALGORITHM,
                # In production, include n, e values from the public key
            }
        ]
    }

