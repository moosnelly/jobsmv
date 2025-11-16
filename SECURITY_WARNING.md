# ⚠️ CRITICAL SECURITY WARNING ⚠️

## JWT Keys May Be Compromised

If you cloned this project and found JWT key files in `apps/api/keys/`, **THESE KEYS ARE COMPROMISED** because they may have been committed to version control.

### Immediate Action Required

Run the following command to clean up and regenerate secure keys:

```bash
# Delete compromised keys
rm -f apps/api/keys/jwt-private.pem apps/api/keys/jwt-public.pem

# Keys will be automatically regenerated on next startup
# Or run manually:
bash apps/api/scripts/generate_keys.sh
```

### Why This Matters

JWT keys that have been committed to version control are publicly accessible in the git history, even if they're later removed. Anyone with access to the repository history can extract these keys and potentially:
- Impersonate users
- Generate fraudulent authentication tokens
- Compromise your authentication system

### For Production Deployments

**NEVER use JWT keys that have been in version control**

Instead:
1. Use environment variables to provide key paths
2. Store keys in a secure key management service (e.g., AWS KMS, HashiCorp Vault)
3. Rotate keys regularly
4. Use Replit Secrets to store key material securely

### Verification

After cleanup, verify no keys are in your working directory:
```bash
ls -la apps/api/keys/
# Should only show the directory, no .pem files until regenerated
```

The .gitignore file has been updated to prevent this in the future, but **historical commits may still contain the keys**.

---

## Additional Security Checklist

- [ ] Delete any JWT keys found in apps/api/keys/
- [ ] Change the SECRET_KEY environment variable (see README_REPLIT.md)
- [ ] Update CORS_ORIGINS for your Replit domain
- [ ] Review and rotate any other API keys or secrets
- [ ] If deploying to production, consider using a managed Redis service

**Read README_REPLIT.md for complete setup instructions.**
