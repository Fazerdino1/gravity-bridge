# Security Standards

Comprehensive security rules for web application development. Every anti-pattern includes a severity classification, detection method, OWASP 2025 reference, and corrective code examples.

**Severity levels:**

- **CRITICAL** — Exploitable vulnerability. Must be fixed before merge.
- **IMPORTANT** — Significant risk. Should be fixed in the same sprint.
- **SUGGESTION** — Defense-in-depth improvement. Plan for a future iteration.

---

## OWASP Top 10 — 2025 Quick Reference

| # | Category | Key Mitigation |
|---|----------|----------------|
| A01 | Broken Access Control | Auth middleware on every endpoint, RBAC, ownership checks |
| A02 | Security Misconfiguration | Security headers, no debug in prod, no default credentials |
| A03 | Software Supply Chain Failures *(NEW)* | `npm audit`, lockfile integrity, SBOM, SLSA provenance |
| A04 | Cryptographic Failures | Argon2id/bcrypt for passwords, TLS everywhere, no secrets in code |
| A05 | Injection | Parameterized queries, input validation, no raw HTML with user input |
| A06 | Insecure Design | Threat modeling, secure design patterns, abuse case testing |
| A07 | Authentication Failures | Rate-limit login, secure session management, MFA |
| A08 | Software or Data Integrity Failures | SRI for CDN scripts, signed artifacts, no insecure deserialization |
| A09 | Security Logging and Alerting Failures | Log security events, no PII in logs, correlation IDs, active alerting |
| A10 | Mishandling of Exceptional Conditions *(NEW)* | Handle all errors, no stack traces in prod, fail-secure |

---

## Injection Anti-Patterns (I1-I8)

### I1: SQL Injection via String Concatenation

- **Severity**: CRITICAL
- **Detection**: `\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)`
- **OWASP**: A05

```typescript
// BAD
const unsafeResult = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// GOOD — parameterized query
const safeResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### I2: NoSQL Injection (MongoDB Operator Injection)

- **Severity**: CRITICAL
- **Detection**: `\{\s*\$(?:gt|gte|lt|lte|ne|in|nin|regex|where|exists)`
- **OWASP**: A05

```typescript
// BAD — attacker sends { "password": { "$gt": "" } }
const user = await User.findOne({ username: req.body.username, password: req.body.password });

// GOOD — validate and cast input types
const username = String(req.body.username);
const password = String(req.body.password);
const user = await User.findOne({ username });
const valid = user && await verifyPassword(user.passwordHash, password);
```

### I3: Command Injection (exec with User Input)

- **Severity**: CRITICAL
- **Detection**: `(?:exec|execSync|execFile|execFileSync)\s*\(.*(?:req\.|params\.|query\.|body\.)`
- **OWASP**: A05

```typescript
// BAD — shell interpolation, sync call blocks the event loop
import { execFileSync } from 'node:child_process';
const unsafeOutput = execFileSync('sh', ['-c', `ls -la ${req.query.dir}`]);

// GOOD — async execFile, arguments array, no shell, bounded time/output
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pExecFile = promisify(execFile);

const dir = String(req.query.dir ?? '');
if (!dir || dir.startsWith('-')) throw new Error('Invalid directory');
const { stdout: safeOutput } = await pExecFile('ls', ['-la', '--', dir], {
  timeout: 5_000,      // fail fast on hung processes
  maxBuffer: 1 << 20,  // 1 MiB cap to prevent memory exhaustion
});

// BEST — allowlist validation on top of the async, bounded call above
const allowedDirs = ['/data', '/public'];
if (!allowedDirs.includes(dir)) throw new Error('Invalid directory');
```

Prefer async `execFile`/`spawn` over `execFileSync` in server handlers: the sync variant blocks Node's event loop and can amplify DoS impact. Always pass a `timeout` and `maxBuffer` to bound execution.

### I4: XSS via Unsanitized HTML Rendering

- **Severity**: CRITICAL
- **Detection**: `(?:v-html|\[innerHTML\]|dangerouslySetInner|bypassSecurityTrust)`
- **OWASP**: A05

Applies to all frontend frameworks. Each has an API that bypasses default XSS protection:

- **React**: `dangerouslySetInnerHTML` prop with raw user content
- **Angular**: `[innerHTML]` binding or `bypassSecurityTrustHtml` with unsanitized input
- **Vue**: `v-html` directive with user-controlled content

```typescript
// GOOD — sanitize with DOMPurify before rendering any raw HTML
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userContent);

// BEST — use text interpolation when HTML is not needed
// React:   {userContent}
// Angular: {{ userContent }}
// Vue:     {{ userContent }}
```

### I5: SSRF via User-Controlled URLs

- **Severity**: CRITICAL
- **Detection**: `fetch\((?:req\.|params\.|query\.|body\.|url|href)`
- **OWASP**: A01

```typescript
// BAD
const data = await fetch(req.body.url);

// GOOD — scheme allowlist + hostname allowlist + DNS/IP validation (see TOCTOU note)
import { promises as dns } from 'node:dns';

function isPrivateIP(ip: string): boolean {
  // Normalize IPv4-mapped IPv6 (e.g., ::ffff:127.0.0.1 → 127.0.0.1)
  const normalized = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  // IPv4 private/reserved/loopback ranges
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|169\.254\.)/.test(normalized)) return true;
  // IPv6 loopback, link-local (fe80::/10), and unique-local
  if (/^(::1|fe[89ab]|fc|fd)/i.test(normalized)) return true;
  return false;
}

const parsed = new URL(req.body.url);
if (parsed.protocol !== 'https:') throw new Error('Only HTTPS allowed');
const allowedHosts = ['api.example.com', 'cdn.example.com'];
if (!allowedHosts.includes(parsed.hostname)) throw new Error('Host not allowed');
// Resolve all A/AAAA records to prevent DNS rebinding via multiple IPs
const resolved = await dns.lookup(parsed.hostname, { all: true });
if (resolved.length === 0 || resolved.some(({ address }) => isPrivateIP(address))) {
  throw new Error('Private or reserved IPs not allowed');
}
// Note: for production, pin the resolved IP in the HTTP client to prevent
// TOCTOU rebinding between this check and fetch(). See undici Agent docs.
const data = await fetch(parsed.toString(), { redirect: 'error' });
```

### I6: Path Traversal in File Operations

- **Severity**: CRITICAL
- **Detection**: `(?:readFile|readFileSync|createReadStream|path\.join)\s*\(.*(?:req\.|params\.|query\.|body\.)`
- **OWASP**: A01

```typescript
// BAD
const file = fs.readFileSync(`/data/${req.params.filename}`);

// GOOD — resolve and validate within allowed directory
import path from 'path';
const basePath = '/data';
const filePath = path.resolve(basePath, req.params.filename);
if (!filePath.startsWith(basePath + path.sep)) throw new Error('Path traversal detected');
const file = fs.readFileSync(filePath);
```

### I7: Template Injection

- **Severity**: CRITICAL
- **Detection**: `(?:render|compile|template)\s*\(.*(?:req\.|params\.|query\.|body\.)`
- **OWASP**: A05

```typescript
// BAD — user input as template source
const html = ejs.render(req.body.template, data);

// GOOD — predefined templates, user input only as data
const html = ejs.renderFile('./templates/page.ejs', { content: req.body.content });
```

### I8: XXE Injection (XML External Entity)

- **Severity**: CRITICAL
- **Detection**: `(?:parseXml|DOMParser|xml2js|libxmljs).*(?:req\.|body\.|file)`
- **OWASP**: A05

```typescript
// GOOD — disable external entities in XML parser
import { XMLParser } from 'fast-xml-parser';
const parser = new XMLParser({
  allowBooleanAttributes: true,
  processEntities: false,
  htmlEntities: false,
});
const result = parser.parse(req.body.xml);
```

---

## Authentication Anti-Patterns (AU1-AU8)

### AU1: JWT Algorithm Confusion (alg:none)

- **Severity**: CRITICAL
- **Detection**: `jwt\.verify\((?![^)]*\balgorithms\b)[^)]*\)`
- **OWASP**: A07

```typescript
// BAD — accepts any algorithm including "none"
const decoded = jwt.verify(token, secret);

// GOOD — enforce specific algorithm
const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
```

### AU2: JWT Without Expiration Check

- **Severity**: CRITICAL
- **Detection**: `jwt\.sign\((?![^)]*\b(?:expiresIn|exp)\b)[^)]*\)`
- **OWASP**: A07

```typescript
// BAD — token never expires
const token = jwt.sign({ userId: user.id }, secret);

// GOOD — short-lived token
const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '15m' });
```

### AU3: JWT Stored in localStorage

- **Severity**: IMPORTANT
- **Detection**: `localStorage\.setItem\(.*(?:token|jwt|auth|session)`
- **OWASP**: A07

```typescript
// BAD — accessible via XSS
localStorage.setItem('accessToken', token);

// GOOD — httpOnly cookie set by server
res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
```

### AU4: Plaintext / Fast Hash for Passwords (MD5/SHA-1/SHA-256)

- **Severity**: CRITICAL
- **Detection**: `(?:createHash|md5|sha1|sha256)\s*\(.*password`
- **OWASP**: A04

```typescript
// BAD — fast hash, no salt
const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');

// GOOD — Argon2id (OWASP recommended)
import { hash as argon2Hash, argon2id } from 'argon2';
const hashed = await argon2Hash(password, { type: argon2id, memoryCost: 65536, timeCost: 3 });
```

### AU5: Missing Brute-Force Protection on Login

- **Severity**: CRITICAL
- **Detection**: `(?:post|router\.post)\s*\(\s*['"]\/(?:login|signin|auth|register|reset)`
- **OWASP**: A07

```typescript
// BAD — no rate limiting
app.post('/api/auth/login', loginHandler);

// GOOD
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.post('/api/auth/login', authLimiter, loginHandler);

// GOOD — serverless / multi-instance: the default in-memory store is per process,
// so back the counter with shared storage (e.g. rate-limit-redis for Express,
// or a Redis-backed limiter such as @upstash/ratelimit in edge/serverless handlers)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
const loginLimiter = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, '15 m'), prefix: 'auth:login' });
const { success } = await loginLimiter.limit(`login:${clientIp}`);
if (!success) return new Response('Too Many Requests', { status: 429 });
```

### AU6: Missing Session Regeneration on Login (Session Fixation)

- **Severity**: IMPORTANT
- **Detection**: `(?:session|req\.session)\s*\.\s*(?:userId|user|authenticated)\s*=`
- **OWASP**: A07

```typescript
// GOOD — regenerate session ID on successful login to prevent fixation
req.session.regenerate((err) => {
  if (err) return next(err);
  req.session.userId = user.id;
  req.session.save(next);
});
```

Related: on password change or elevation, also invalidate all other active sessions for the user (e.g., by bumping a `tokenVersion` column and rejecting sessions with a stale version, or by iterating the session store and destroying entries keyed to that user).

### AU7: OAuth Without State Parameter

- **Severity**: CRITICAL
- **Detection**: `authorize\?(?![^\n#]*\bstate=)[^\n#]*`
- **OWASP**: A07

```typescript
// GOOD — include state parameter for CSRF protection
const state = crypto.randomBytes(32).toString('hex');
session.oauthState = state;
const authUrl = `https://provider.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
```

### AU8: Missing PKCE for Public OAuth Clients

- **Severity**: IMPORTANT
- **Detection**: `(?:authorization_code|code).*(?!.*code_challenge)`
- **OWASP**: A07

Use PKCE (Proof Key for Code Exchange) with S256 challenge method for all public clients (SPAs, mobile).

---

## Authorization Anti-Patterns (AZ1-AZ6)

### AZ1: Missing Auth Middleware on New Endpoints

- **Severity**: CRITICAL
- **Detection**: `(?:app|router)\.\w+\s*\(\s*['"]\/api\/(?:admin|users|settings)`
- **OWASP**: A01

```typescript
// BAD
router.delete('/api/users/:id', deleteUser);

// GOOD
router.delete('/api/users/:id', authenticate, authorize('admin'), deleteUser);
```

### AZ2: Client-Side Only Authorization

- **Severity**: CRITICAL
- **Detection**: Component guards without server-side checks
- **OWASP**: A01

Frontend guards are UX only. ALWAYS verify on server.

### AZ3: IDOR (Insecure Direct Object Reference)

- **Severity**: CRITICAL
- **Detection**: `params\.(?:id|userId|orderId)` without ownership check
- **OWASP**: A01

```typescript
// GOOD — verify ownership
router.get('/api/orders/:orderId', authenticate, async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(order);
});
```

### AZ4: Mass Assignment

- **Severity**: CRITICAL
- **Detection**: `(?:create|update|findOneAndUpdate)\s*\(\s*req\.body\s*\)`
- **OWASP**: A01

```typescript
// BAD
await User.findByIdAndUpdate(id, req.body);

// GOOD — explicitly pick allowed fields
const { name, email, avatar } = req.body;
await User.findByIdAndUpdate(id, { name, email, avatar });
```

### AZ5: Privilege Escalation via Role Parameter

- **Severity**: CRITICAL
- **Detection**: `req\.body\.role|req\.body\.isAdmin|req\.body\.permissions`
- **OWASP**: A01

```typescript
// GOOD — ignore role from input
const { name, email, password } = req.body;
const user = await User.create({ name, email, password, role: 'user' });
```

### AZ6: Missing Re-Authentication for Sensitive Operations

- **Severity**: IMPORTANT
- **Detection**: `(?:delete|destroy|remove).*(?:account|user|organization)` without re-auth
- **OWASP**: A01

Require current password before account deletion, email change, or other sensitive operations.

---

## Secrets Anti-Patterns (S1-S6)

### S1: Hardcoded API Keys / Tokens

- **Severity**: CRITICAL
- **Detection**: `(?:password|secret|api_key|token|apiKey)\s*[:=]\s*['"][A-Za-z0-9+/=]{8,}['"]`
- **OWASP**: A04

```typescript
// BAD
const API_KEY = 'sk_live_abc123def456';

// GOOD
const API_KEY = process.env.API_KEY;
```

### S2: .env Committed to Git

- **Severity**: CRITICAL
- **Detection**: `git ls-files .env` (should return empty)
- **OWASP**: A04

```gitignore
# .gitignore
.env
.env.local
.env.*.local
*.pem
*.key
```

### S3: Server Secrets Exposed to Client

- **Severity**: CRITICAL
- **Detection**: `NEXT_PUBLIC_.*(?:SECRET|PRIVATE|PASSWORD|KEY(?!.*PUBLIC))`
- **OWASP**: A02

```bash
# BAD
NEXT_PUBLIC_DATABASE_URL=postgresql://...

# GOOD
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.example.com
```

Angular: do not put secrets in `environment.ts` files bundled into the client.

### S4: Default Credentials in Config

- **Severity**: CRITICAL
- **Detection**: `(?:admin|root|default|test).*(?:password|pass|pwd)\s*[:=]\s*['"](?:admin|root|password|1234|test)`
- **OWASP**: A02

Use environment variables with validation (zod schema).

### S5: Secrets in CI/CD Pipeline Logs

- **Severity**: IMPORTANT
- **Detection**: `(?:echo|console\.log|print).*(?:\$SECRET|\$TOKEN|\$PASSWORD|process\.env)`
- **OWASP**: A09

Use masked secrets in CI. Never echo environment variables containing secrets.

### S6: Sensitive Data in Error Responses / Stack Traces

- **Severity**: IMPORTANT
- **Detection**: `(?:stack|trace|query|sql).*(?:res\.json|res\.send|c\.JSON)`
- **OWASP**: A10

```typescript
// GOOD — generic error to client, details only in logs
app.use((err, req, res, _next) => {
  logger.error({ err, path: req.path, method: req.method });
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    error: 'Internal Server Error',
    ...(isDev && { message: err.message }),
  });
});
```

---

## Headers Anti-Patterns (H1-H8)

### H1: Missing Content-Security-Policy

- **Severity**: IMPORTANT
- **Detection**: Absence of `Content-Security-Policy` header
- **OWASP**: A02

### H2: CSP with unsafe-inline and unsafe-eval

- **Severity**: IMPORTANT
- **Detection**: `Content-Security-Policy.*(?:'unsafe-inline'|'unsafe-eval')`
- **OWASP**: A02

Use nonce-based CSP: `script-src 'self' 'nonce-{SERVER_GENERATED}'`

### H3: Missing Strict-Transport-Security

- **Severity**: IMPORTANT
- **Detection**: Absence of `Strict-Transport-Security` header
- **OWASP**: A02

Value: `max-age=31536000; includeSubDomains; preload`

### H4: Missing X-Content-Type-Options

- **Severity**: IMPORTANT
- **Detection**: Absence of `X-Content-Type-Options: nosniff`
- **OWASP**: A02

### H5: Missing X-Frame-Options

- **Severity**: IMPORTANT
- **Detection**: Absence of `X-Frame-Options` header
- **OWASP**: A02

Value: `DENY`. Also set `Content-Security-Policy: frame-ancestors 'none'`.

### H6: Permissive Referrer-Policy

- **Severity**: SUGGESTION
- **Detection**: `Referrer-Policy.*(?:unsafe-url|no-referrer-when-downgrade)`
- **OWASP**: A02

Use: `strict-origin-when-cross-origin`

### H7: Missing Permissions-Policy

- **Severity**: SUGGESTION
- **Detection**: Absence of `Permissions-Policy` header
- **OWASP**: A02

Value: `camera=(), microphone=(), geolocation=(), payment=()`

### H8: CORS Wildcard with Credentials

- **Severity**: CRITICAL
- **Detection**: `(?:cors|Access-Control-Allow-Origin).*\*`
- **OWASP**: A02

```typescript
// GOOD
app.use(cors({
  origin: ['https://app.example.com', 'https://staging.example.com'],
  credentials: true,
}));
```

---

## Frontend Anti-Patterns (FE1-FE8)

### FE1: Unsanitized HTML Rendering

- **Severity**: CRITICAL
- **Detection**: `(?:innerHTML|v-html|dangerouslySetInner)` without DOMPurify
- **OWASP**: A05

Always sanitize with DOMPurify before rendering user-controlled HTML. See I4.

### FE2: Dynamic Code Evaluation with User Input

- **Severity**: CRITICAL
- **Detection**: `eval\s*\(`
- **OWASP**: A05

Use structured data parsers (JSON.parse) instead.

### FE3: postMessage Without Origin Validation

- **Severity**: IMPORTANT
- **Detection**: `addEventListener\s*\(\s*['"]message['"].*(?!.*origin)`
- **OWASP**: A01

```typescript
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://trusted.example.com') return;
  processData(event.data);
});
```

### FE4: Prototype Pollution

- **Severity**: IMPORTANT
- **Detection**: `(?:__proto__|constructor\.prototype|Object\.assign)\s*.*(?:req\.|body\.|query\.)`
- **OWASP**: A05

Validate and filter keys from user input before merging into objects.

### FE5: Open Redirect


---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/security-and-owasp-full.md](../docs/rule-references/security-and-owasp-full.md). Read that file on demand when deeper details are needed.
