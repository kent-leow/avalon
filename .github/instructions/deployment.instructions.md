---
applyTo: '**'
---
# Deployment Instructions (Vercel)

## General
- Deployments must be handled via Vercel, configured for automatic deploys from `main`.
- All environment variables must be set in the Vercel dashboard, not hardcoded.
- Ensure the build passes locally before pushing to `main`.
- Test all staging deployments before promoting to production.
- Monitor deployments for errors and roll back if needed.

## Checklist Before Deploying
- All code is merged to `main` via PR.
- All tests and lint checks pass.
- Environment variables are up to date in Vercel.
- No sensitive data is exposed in logs or client code.

## Rollback
- Use Vercel's rollback feature if a deployment causes issues.
- Document the reason for rollback and steps taken to resolve.
