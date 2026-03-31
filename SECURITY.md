# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in oxdoc, please report it responsibly.

### How to Report

1. **Do NOT open a public GitHub issue** for security vulnerabilities.
2. Send an email to the maintainer or use [GitHub's private vulnerability reporting](https://github.com/jiji-hoon96/oxdoc/security/advisories/new).
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment** within 48 hours
- **Assessment** within 1 week
- **Fix or mitigation** as soon as possible, depending on severity

### Scope

The following are in scope:
- Code execution vulnerabilities in the oxdoc CLI or library
- Dependency vulnerabilities in production dependencies
- Sensitive data exposure

The following are out of scope:
- Vulnerabilities in development-only dependencies
- Issues in the documentation website (docs/)

## Security Practices

- **Minimal dependencies**: oxdoc uses only 5 production dependencies, all well-vetted
- **No install scripts**: No code runs during `npm install`
- **Whitelist publishing**: Only `dist/`, `README.md`, and `LICENSE` are included in the npm package
- **Automated testing**: All changes are validated with tests before release
- **npm provenance**: Packages are published with provenance attestation from GitHub Actions
