#!/bin/bash
# Security cleanup script - removes potentially compromised JWT keys

echo "======================================"
echo "Security Cleanup Script"
echo "======================================"
echo ""

KEYS_DIR="apps/api/keys"

if [ -f "$KEYS_DIR/jwt-private.pem" ] || [ -f "$KEYS_DIR/jwt-public.pem" ]; then
    echo "⚠️  WARNING: JWT keys found in $KEYS_DIR"
    echo ""
    echo "These keys may have been committed to version control and should"
    echo "be considered COMPROMISED. They will be deleted and new keys will"
    echo "be generated on the next application startup."
    echo ""
    read -p "Delete compromised keys? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$KEYS_DIR/jwt-private.pem" "$KEYS_DIR/jwt-public.pem"
        echo "✓ Keys deleted successfully"
        echo ""
        echo "New keys will be automatically generated on next startup."
        echo "Run: bash apps/api/scripts/generate_keys.sh"
    else
        echo "⚠️  Keys NOT deleted - your application may be using compromised keys!"
    fi
else
    echo "✓ No JWT keys found - keys will be generated on startup"
fi

echo ""
echo "======================================"
echo "Next steps:"
echo "1. Update SECRET_KEY in Replit Secrets"
echo "2. Restart the backend workflow"
echo "3. Review SECURITY_WARNING.md for more details"
echo "======================================"
