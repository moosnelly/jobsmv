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

#### Environment Variable Configuration

Use environment variables to specify secure key locations:

```bash
# Set environment variables for key paths
export JWKS_PRIVATE_KEY_PATH="/secure/path/to/private-key.pem"
export JWKS_PUBLIC_KEY_PATH="/secure/path/to/public-key.pem"

# Or for Docker/Replit deployments:
JWKS_PRIVATE_KEY_PATH: "/app/secure-keys/jwt-private.pem"
JWKS_PUBLIC_KEY_PATH: "/app/secure-keys/jwt-public.pem"
```

#### Production Security Best Practices

1. **Use secure key management services:**
   - AWS Key Management Service (KMS)
   - HashiCorp Vault
   - Azure Key Vault
   - Google Cloud KMS

2. **Store keys outside the application directory:**
   - Mount secure volumes in Docker containers
   - Use environment variables pointing to secure locations
   - Never store keys in the same directory as application code

3. **Rotate keys regularly:**
   - Generate new key pairs periodically
   - Update JWKS_KID when rotating keys
   - Maintain backward compatibility during transition periods

4. **Use Replit Secrets for cloud deployments:**
   - Store key paths or key material in Replit Secrets
   - Never commit secrets to version control

### Verification

After cleanup, verify no keys are in your working directory:
```bash
ls -la apps/api/keys/
# Should only show the directory, no .pem files until regenerated
```

The .gitignore file has been updated to prevent this in the future, but **historical commits may still contain the keys**.

### Git History Cleanup (IMPORTANT)

Even after deleting keys from the working directory, they may still exist in your git history. **Keys in git history remain compromised and should be considered permanently exposed.**

#### Option 1: BFG Repo-Cleaner (Recommended)

```bash
# Install BFG (https://rtyley.github.io/bfg-repo-cleaner/)
# Remove all .pem files from git history
bfg --delete-files "*.pem" --no-blob-protection

# Remove all .key, .p12, .pfx files as well
bfg --delete-files "*.key" --delete-files "*.p12" --delete-files "*.pfx" --no-blob-protection

# Clean and optimize repository
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

#### Option 2: git filter-branch (Alternative)

```bash
# Remove specific file patterns from all commits
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch apps/api/keys/*.pem apps/api/keys/*.key apps/api/keys/*.p12 apps/api/keys/*.pfx' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (CAUTION: This will rewrite history for all collaborators)
git push origin --force --all
git push origin --force --tags

# Clean up
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now
```

**⚠️ WARNING:** Rewriting git history will affect all repository collaborators. Coordinate with your team before proceeding.

### Repository Security Assessment

After cleanup, consider these additional security measures:

1. **Audit git history:** Check for any other sensitive files that may have been committed
2. **Rotate all secrets:** Change any credentials that may have been exposed
3. **Update deployment scripts:** Ensure new deployments use secure key management
4. **Enable branch protection:** Prevent force pushes to protected branches

---

## Additional Security Checklist

- [ ] Delete any JWT keys found in apps/api/keys/
- [ ] Change the SECRET_KEY environment variable (see README_REPLIT.md)
- [ ] Update CORS_ORIGINS for your Replit domain
- [ ] Review and rotate any other API keys or secrets
- [ ] If deploying to production, consider using a managed Redis service

**Read README_REPLIT.md for complete setup instructions.**
