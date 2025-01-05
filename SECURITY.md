# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report (suspected) security vulnerabilities to **[security@ratemyemployer.com](mailto:security@ratemyemployer.com)**. You will receive a response from us within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity but historically within a few days.

## Security Measures

### Data Protection
- All user data is encrypted at rest
- Sensitive data is never logged
- Regular security audits
- Strict access control policies

### Authentication
- Secure password hashing
- Two-factor authentication support
- Session management
- Rate limiting on auth endpoints

### API Security
- Input validation
- Output sanitization
- Rate limiting
- CORS policies
- API key rotation

### Database
- Row Level Security (RLS)
- Prepared statements
- Regular backups
- Access logging

## Best Practices

### For Contributors
1. Never commit sensitive information
2. Use environment variables for secrets
3. Keep dependencies updated
4. Follow secure coding guidelines
5. Run security checks before PRs

### For Users
1. Use strong passwords
2. Enable 2FA when available
3. Keep your API keys secure
4. Report suspicious activity
5. Keep your account information updated

## Security Updates

We use various tools to scan for security vulnerabilities:
- GitHub's Dependabot
- Snyk
- OWASP Dependency Check
- Regular manual audits

## Incident Response

1. **Discovery & Alert**
   - Vulnerability identified
   - Initial assessment made
   - Key personnel notified

2. **Assessment & Triage**
   - Impact evaluation
   - Risk assessment
   - Priority assignment

3. **Response & Remediation**
   - Patch development
   - Testing in staging
   - Deployment to production

4. **Disclosure**
   - User notification if required
   - Public disclosure if necessary
   - Documentation update

## Contact

Security-related issues should be reported to:
- Email: security@ratemyemployer.com
- Bug Bounty Program: [Link to program]
- Security Team: [Link to team] 