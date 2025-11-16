#!/bin/bash
# Generate JWT RSA keys with safety checks
# SECURITY: This script will prompt before overwriting existing keys

KEYS_DIR="apps/api/keys"
PRIVATE_KEY="$KEYS_DIR/jwt-private.pem"
PUBLIC_KEY="$KEYS_DIR/jwt-public.pem"

# Create keys directory if it doesn't exist
mkdir -p "$KEYS_DIR"

# Check if keys already exist
if [ -f "$PRIVATE_KEY" ] && [ -f "$PUBLIC_KEY" ]; then
    echo "⚠️  WARNING: JWT keys already exist at:"
    echo "   Private key: $PRIVATE_KEY"
    echo "   Public key:  $PUBLIC_KEY"
    echo ""
    echo "Existing keys may be in use by running applications."
    echo "Overwriting them will invalidate all current JWT tokens."
    echo ""

    # Prompt for confirmation (default: no)
    read -p "Do you want to regenerate the keys? (y/N): " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "✓ Key generation cancelled. Existing keys preserved."
        exit 0
    fi

    echo "🔄 Regenerating JWT keys..."
fi

# Generate new keys
echo "Generating JWT RSA key pair (2048-bit)..."
if ! openssl genrsa -out "$PRIVATE_KEY" 2048 2>/dev/null; then
    echo "❌ ERROR: Failed to generate private key"
    exit 1
fi

if ! openssl rsa -in "$PRIVATE_KEY" -pubout -out "$PUBLIC_KEY" 2>/dev/null; then
    echo "❌ ERROR: Failed to generate public key"
    # Clean up partial generation
    rm -f "$PRIVATE_KEY"
    exit 1
fi

# Set secure permissions
chmod 600 "$PRIVATE_KEY"
chmod 644 "$PUBLIC_KEY"

echo "✅ JWT keys generated successfully!"
echo "   Private key: $PRIVATE_KEY (permissions: 600)"
echo "   Public key:  $PUBLIC_KEY (permissions: 644)"
echo ""
echo "⚠️  SECURITY REMINDER:"
echo "   - Never commit these keys to version control"
echo "   - Rotate keys regularly in production"
echo "   - Use secure key management services for production deployments"
