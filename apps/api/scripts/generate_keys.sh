#!/bin/bash
# Generate JWT RSA keys if they don't exist

KEYS_DIR="apps/api/keys"
PRIVATE_KEY="$KEYS_DIR/jwt-private.pem"
PUBLIC_KEY="$KEYS_DIR/jwt-public.pem"

# Create keys directory if it doesn't exist
mkdir -p "$KEYS_DIR"

# Generate keys if they don't exist
if [ ! -f "$PRIVATE_KEY" ] || [ ! -f "$PUBLIC_KEY" ]; then
    echo "Generating JWT RSA key pair..."
    openssl genrsa -out "$PRIVATE_KEY" 2048 2>/dev/null
    openssl rsa -in "$PRIVATE_KEY" -pubout -out "$PUBLIC_KEY" 2>/dev/null
    chmod 600 "$PRIVATE_KEY"
    chmod 644 "$PUBLIC_KEY"
    echo "JWT keys generated successfully!"
else
    echo "JWT keys already exist, skipping generation."
fi
