# Security & Evidence Status

**RESEARCH / PROTOTYPE — NOT PRODUCTION-CERTIFIED**

## Current evidence

- GitHub repository initialized with secret-protection rules.
- CI workflow added for reproducible dependency installation, typecheck, and production build.
- Source import from the supplied local archive has not yet been completed in the GitHub repository; the local dependency-install attempt timed out in the execution environment.

## Required before production claims

- Clean reproducible `npm ci` from the committed lockfile.
- Passing typecheck and production build.
- Automated application tests.
- Secret scanning and dependency vulnerability review.
- Verification of external integrations (GitHub, Telegram, Gemini) using credentials stored only in secret managers.
- Evidence for any live data, blockchain settlement, third-party audit, certification, or production deployment claim.

## Rules

A simulation, placeholder, sample metric, or AI-generated response must never be presented as live activity, security proof, certification, endorsement, or production deployment.
