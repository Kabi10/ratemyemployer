# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Measures

### Authentication
- Firebase Authentication for user management
- Secure session handling
- Multi-factor authentication support
- Secure password policies

### Data Protection
- Supabase PostgreSQL with RLS (Row Level Security)
- End-to-end data encryption
- Secure API endpoints
- Input sanitization and validation using Zod

### Infrastructure
- Vercel deployment with security headers
- CORS policy implementation
- Rate limiting on API routes
- DDoS protection

### Code Security
- TypeScript strict mode enabled
- ESLint security rules
- Automated security scanning in CI/CD
- Regular dependency updates

### Image Security
- Strict remote patterns for allowed image domains
- Image optimization and sanitization
- Content security policy headers

## Reporting a Vulnerability

If you discover a security vulnerability within RateMyEmployer, please follow these steps:

1. **Do Not** disclose the vulnerability publicly
2. Send a detailed report to [security@ratemyemployer.com](mailto:security@ratemyemployer.com)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect
- Acknowledgment within 24 hours
- Regular updates on progress
- Credit for responsible disclosure
- Notification when the vulnerability is fixed

## Security Best Practices

### For Contributors
1. Never commit sensitive information
2. Use environment variables for secrets
3. Follow the principle of least privilege
4. Keep dependencies updated
5. Write secure code following OWASP guidelines

### For Users
1. Use strong passwords
2. Enable two-factor authentication
3. Keep your access tokens secure
4. Report suspicious activities
5. Follow security guidelines in documentation

## Compliance

- GDPR compliance for EU users
- CCPA compliance for California residents
- Regular security audits
- Data protection impact assessments

## Contact

For security-related inquiries, contact:
- Security Team: [security@ratemyemployer.com](mailto:security@ratemyemployer.com)
- Lead Security Engineer: [security-lead@ratemyemployer.com](mailto:security-lead@ratemyemployer.com)

## Acknowledgments

We appreciate the security research community's efforts in keeping RateMyEmployer secure. Responsible disclosure of vulnerabilities helps us maintain a secure platform for all users.

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