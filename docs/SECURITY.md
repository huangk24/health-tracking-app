# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

We take the security of the Health Tracking App seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Publicly Disclose

- Do not open a public issue
- Do not post in discussions or social media
- Do not share details with others until the issue is resolved

### 2. Report Privately

Send a detailed report to: **[security@example.com]**

Include in your report:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Location** (file path, endpoint, component)
- **Steps to reproduce** the vulnerability
- **Proof of concept** (if possible, but do not exploit the vulnerability)
- **Impact assessment** (what an attacker could potentially do)
- **Suggested fix** (if you have one)
- **Your contact information** (for follow-up questions)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - **Critical**: Within 7 days
  - **High**: Within 30 days
  - **Medium**: Within 90 days
  - **Low**: Next regular release

### 4. Disclosure Process

Once the vulnerability is fixed:

1. We will release a security patch
2. We will publish a security advisory
3. We will credit you (if you wish) in the advisory
4. You may publicly disclose after the patch is released

## Security Best Practices

### For Users

#### Authentication

- **Use strong passwords**: Minimum 8 characters with mixed case, numbers, and symbols
- **Change default credentials**: If you're self-hosting, change all default passwords
- **Enable HTTPS**: Always access the app over HTTPS in production
- **Secure your API key**: Keep your USDA API key private (for self-hosted instances)

#### Data Protection

- **Regular backups**: Backup your data regularly
- **Secure storage**: Store backups securely and encrypted
- **Access control**: Limit who has access to your instance
- **Review logs**: Check access logs for suspicious activity

### For Developers

#### Code Security

- **Input validation**: Always validate and sanitize user input
- **Parameterized queries**: Use SQLAlchemy ORM (never raw SQL with string interpolation)
- **Password hashing**: Use bcrypt with appropriate cost factor (12+)
- **Token security**: Store JWT secret key securely, never commit to Git
- **Dependency updates**: Keep dependencies up to date
- **Security scanning**: Run security scanners before committing

#### Environment Variables

Never commit sensitive data to Git:

```bash
# backend/.env (NEVER commit this file)
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key-here
USDA_API_KEY=your-usda-api-key
```

Add to `.gitignore`:
```
.env
.env.local
.env.*.local
*.db
```

#### CORS Configuration

Restrict CORS to known origins:

```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",  # Production
        "http://localhost:5173"              # Development only
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Rate Limiting

Implement rate limiting to prevent abuse:

```python
# Future implementation
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute
async def login(...):
    ...
```

## Known Security Considerations

### Current Implementation

#### ✅ Implemented Protections

1. **Password Hashing**: bcrypt with 12 rounds
2. **JWT Tokens**: HS256 signature with expiration
3. **Input Validation**: Pydantic schemas with strict validation
4. **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
5. **XSS Prevention**: React auto-escapes rendered content
6. **User Isolation**: All queries filtered by user_id
7. **HTTPS**: Enforced in production (Render.com)

#### ⚠️ Pending Improvements

1. **Rate Limiting**: Not yet implemented
   - Risk: Brute force attacks on login/registration
   - Mitigation: Plan to add slowapi rate limiter

2. **API Versioning**: No versioning yet
   - Risk: Breaking changes could break clients
   - Mitigation: Plan to implement `/api/v1/` prefix

3. **Email Verification**: Not implemented
   - Risk: Fake email addresses
   - Mitigation: Consider adding email verification

4. **Password Reset**: Not implemented
   - Risk: Users locked out if they forget password
   - Mitigation: Plan to add password reset flow

5. **2FA/MFA**: Not implemented
   - Risk: Account takeover if password compromised
   - Mitigation: Consider adding 2FA in future

6. **Audit Logging**: Basic logging only
   - Risk: Limited forensic capabilities
   - Mitigation: Plan to add comprehensive audit logs

## Threat Model

### Assets to Protect

1. **User Credentials**: Usernames, hashed passwords
2. **Personal Data**: Health metrics (weight, age, height, sex)
3. **Nutrition Data**: Food entries, custom foods, exercise logs
4. **API Access**: USDA API key
5. **JWT Secret**: Used for token signing

### Potential Threats

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| SQL Injection | Low | High | SQLAlchemy ORM |
| XSS | Low | Medium | React escaping |
| CSRF | Low | Medium | JWT tokens (not cookies) |
| Brute Force Login | Medium | Medium | Planned rate limiting |
| Password Leakage | Medium | High | bcrypt hashing |
| Token Theft | Medium | High | HTTPS, short expiration |
| DDoS | Medium | High | Render.com protections |
| API Key Exposure | Low | Low | Environment variables |
| Data Breach | Low | High | User isolation, backups |

### Attack Scenarios

#### Scenario 1: Credential Stuffing

**Attack**: Attacker uses leaked credentials from other sites to try logging in.

**Defense**:
- Bcrypt makes password verification slow (prevents rapid attempts)
- Planned rate limiting will block after 5 failed attempts
- Encourage strong, unique passwords

#### Scenario 2: Session Hijacking

**Attack**: Attacker intercepts JWT token to impersonate user.

**Defense**:
- HTTPS encryption prevents token interception
- Token expiration limits window of opportunity
- Store tokens securely in localStorage (not cookies to avoid CSRF)

#### Scenario 3: Data Exfiltration

**Attack**: Attacker with valid credentials tries to access other users' data.

**Defense**:
- User isolation: All queries filter by `user_id`
- No API endpoints expose other users' data
- Authentication required for all data access

## Dependency Security

### Automatic Scanning

We use automated tools to scan for vulnerabilities:

- **Dependabot** (GitHub): Automated dependency updates
- **npm audit**: JavaScript dependency scanning
- **Safety** (Python): Python dependency scanning

### Manual Review

Before deploying:

```bash
# Backend: Check for vulnerable dependencies
cd backend
uv run pip-audit

# Frontend: Check for vulnerable dependencies
cd frontend
npm audit

# Fix vulnerabilities
npm audit fix
```

## Incident Response Plan

### In Case of Security Breach

1. **Identify**: Determine scope and impact
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove the threat
4. **Recover**: Restore services safely
5. **Lessons Learned**: Document and improve

### Communication

- **Users**: Notify affected users within 72 hours
- **Public**: Publish security advisory after fix
- **Authorities**: Report to relevant authorities if required by law

## Compliance

### Data Privacy

- **GDPR**: User data can be exported/deleted on request
- **CCPA**: California users can request data deletion
- **HIPAA**: Not HIPAA compliant (not a medical device)

**Note**: This app is for personal health tracking only, not medical diagnosis or treatment.

### Data Retention

- **Active Users**: Data retained indefinitely
- **Inactive Users**: Consider deletion after 2 years
- **Deleted Accounts**: Data permanently deleted within 30 days
- **Backups**: Retained for 30 days, then purged

## Bug Bounty

Currently, we do not offer a bug bounty program. However, we greatly appreciate security researchers who responsibly disclose vulnerabilities. We will:

- **Acknowledge** your contribution
- **Credit** you in our security advisories (if you wish)
- **Provide updates** on the fix progress

We may introduce a bug bounty program in the future as the project grows.

## Security Checklist

### For Deployment

- [ ] Change default SECRET_KEY
- [ ] Enable HTTPS
- [ ] Set strong database password
- [ ] Restrict CORS origins
- [ ] Set JWT expiration appropriately
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Review and restrict network access
- [ ] Enable firewall rules
- [ ] Update all dependencies
- [ ] Run security scanner
- [ ] Test authentication flows
- [ ] Verify user isolation
- [ ] Check error messages (no sensitive info leaked)
- [ ] Set up logging
- [ ] Document security measures

### For Development

- [ ] Never commit .env files
- [ ] Never commit API keys or passwords
- [ ] Use environment variables for secrets
- [ ] Review code before committing
- [ ] Run security linters
- [ ] Validate all user input
- [ ] Use parameterized queries
- [ ] Hash passwords before storage
- [ ] Set secure cookie flags (if using cookies)
- [ ] Implement CSRF protection (if using cookies)
- [ ] Log security events
- [ ] Test authentication edge cases
- [ ] Verify authorization checks
- [ ] Check for information disclosure
- [ ] Test with malicious input

## Resources

### Security Tools

- **OWASP ZAP**: Web application security scanner
- **Bandit**: Python security linter
- **ESLint Security Plugin**: JavaScript security linter
- **Snyk**: Dependency vulnerability scanner
- **SonarQube**: Code quality and security analysis

### Security References

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **CWE Top 25**: https://cwe.mitre.org/top25/
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **FastAPI Security**: https://fastapi.tiangolo.com/tutorial/security/
- **React Security**: https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml

## Questions?

If you have security questions or concerns that are not vulnerability reports, please:

- Open a GitHub Discussion
- Email: [security-questions@example.com]

---

**Last Updated**: March 6, 2026
**Version**: 1.0.0
