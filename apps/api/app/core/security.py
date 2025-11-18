from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt, ExpiredSignatureError
from pathlib import Path
import structlog
import bcrypt
import os
import stat
import secrets

from app.core.config import settings

logger = structlog.get_logger(__name__)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception as e:
        logger.warning("Password verification failed", error=str(e))
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    # Generate salt and hash password
    salt = bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def load_jwt_keys() -> tuple[str, str]:
    """
    Load JWT private and public keys.

    Automatically generates RSA key pair if keys don't exist.
    Sets secure file permissions (600 for private, 644 for public key).
    """
    private_key_path = Path(settings.JWKS_PRIVATE_KEY_PATH)
    public_key_path = Path(settings.JWKS_PUBLIC_KEY_PATH)

    if not private_key_path.exists() or not public_key_path.exists():
        logger.info("JWT keys not found, generating new RSA key pair",
                   private_key_path=str(private_key_path),
                   public_key_path=str(public_key_path))
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization

        # Generate new keys
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        public_key = private_key.public_key()

        # Ensure keys directory exists
        private_key_path.parent.mkdir(parents=True, exist_ok=True)

        # Save private key with secure permissions (600)
        with open(private_key_path, "wb") as f:
            f.write(
                private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption(),
                )
            )
        # Set private key permissions to 600 (owner read/write only)
        os.chmod(private_key_path, stat.S_IRUSR | stat.S_IWUSR)

        # Save public key with readable permissions (644)
        with open(public_key_path, "wb") as f:
            f.write(
                public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo,
                )
            )
        # Set public key permissions to 644 (owner read/write, group/other read)
        os.chmod(public_key_path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)

        logger.info("JWT keys generated successfully with secure permissions")
    else:
        logger.debug("Loading existing JWT keys",
                    private_key_path=str(private_key_path),
                    public_key_path=str(public_key_path))

    with open(private_key_path, "rb") as f:
        private_key = f.read()

    with open(public_key_path, "rb") as f:
        public_key = f.read()

    return private_key.decode(), public_key.decode()


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT access token with timezone-aware timestamps."""
    to_encode = data.copy()
    # Always use UTC to avoid timezone issues
    now = datetime.utcnow()

    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(
            hours=settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS  # Changed from minutes to hours
        )

    to_encode.update({
        "exp": expire,
        "iat": now,
        "nbf": now,  # Not before time
        "jti": secrets.token_urlsafe(16)  # JWT ID for uniqueness
    })
    to_encode.update({"aud": settings.JWT_AUD, "iss": settings.JWT_ISS})

    private_key, _ = load_jwt_keys()
    encoded_jwt = jwt.encode(
        to_encode, private_key, algorithm=settings.JWT_ALGORITHM, headers={"kid": settings.JWKS_KID}
    )
    return encoded_jwt


def verify_token(token: str) -> tuple[bool, Optional[dict], Optional[str]]:
    """
    Verify and decode a JWT token.

    Returns:
        tuple: (is_valid, payload, error_message)
    """
    try:
        _, public_key = load_jwt_keys()
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.JWT_AUD,
            issuer=settings.JWT_ISS,
        )

        # Check if token is blacklisted (if implemented)
        jti = payload.get("jti")
        if jti and is_token_blacklisted(jti):
            logger.warning("JWT token is blacklisted", jti=jti)
            return False, None, "Token has been revoked"

        return True, payload, None

    except ExpiredSignatureError as e:
        logger.warning("JWT token expired", error=str(e))
        return False, None, "Token has expired"
    except JWTError as e:
        logger.warning("JWT verification failed", error=str(e))
        return False, None, "Token verification failed"
    except Exception as e:
        logger.error("Unexpected JWT verification error", error=str(e))
        return False, None, "Internal authentication error"


def create_refresh_token() -> str:
    """Create a random refresh token."""
    return secrets.token_urlsafe(32)


def hash_refresh_token(token: str) -> str:
    """Hash a refresh token for secure storage."""
    return bcrypt.hashpw(token.encode("utf-8"), bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)).decode("utf-8")


def verify_refresh_token(plain_token: str, hashed_token: str) -> bool:
    """Verify a refresh token against its hash."""
    try:
        return bcrypt.checkpw(plain_token.encode("utf-8"), hashed_token.encode("utf-8"))
    except Exception as e:
        logger.warning("Refresh token verification failed", error=str(e))
        return False


# Token Blacklisting (in-memory for now, should be moved to Redis/database in production)
_blacklisted_tokens = set()


def blacklist_token(jti: str) -> None:
    """Add a JWT token to the blacklist (logout functionality)."""
    _blacklisted_tokens.add(jti)
    logger.info("Token blacklisted", jti=jti)


def is_token_blacklisted(jti: str) -> bool:
    """Check if a JWT token is blacklisted."""
    return jti in _blacklisted_tokens


def clear_expired_blacklisted_tokens() -> None:
    """Clear expired tokens from blacklist (should be called periodically)."""
    # In a production system, this would check database/redis for expired tokens
    # For now, we'll keep all blacklisted tokens until restart
    pass

