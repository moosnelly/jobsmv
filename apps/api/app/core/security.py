from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pathlib import Path
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def load_jwt_keys() -> tuple[str, str]:
    """Load JWT private and public keys."""
    private_key_path = Path(settings.JWKS_PRIVATE_KEY_PATH)
    public_key_path = Path(settings.JWKS_PUBLIC_KEY_PATH)

    if not private_key_path.exists() or not public_key_path.exists():
        logger.warning("JWT keys not found, generating new keys")
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization

        # Generate new keys
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        public_key = private_key.public_key()

        # Save private key
        private_key_path.parent.mkdir(parents=True, exist_ok=True)
        with open(private_key_path, "wb") as f:
            f.write(
                private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption(),
                )
            )

        # Save public key
        with open(public_key_path, "wb") as f:
            f.write(
                public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo,
                )
            )

    with open(private_key_path, "rb") as f:
        private_key = f.read()

    with open(public_key_path, "rb") as f:
        public_key = f.read()

    return private_key.decode(), public_key.decode()


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    to_encode.update({"aud": settings.JWT_AUD, "iss": settings.JWT_ISS})

    private_key, _ = load_jwt_keys()
    encoded_jwt = jwt.encode(
        to_encode, private_key, algorithm=settings.JWT_ALGORITHM, headers={"kid": settings.JWKS_KID}
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        _, public_key = load_jwt_keys()
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.JWT_AUD,
            issuer=settings.JWT_ISS,
        )
        return payload
    except JWTError as e:
        logger.warning("JWT verification failed", error=str(e))
        return None

