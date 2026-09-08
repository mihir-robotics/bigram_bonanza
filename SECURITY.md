# Security — Bigram Bonanza

This app is a **static, client-only** site: no backend, no authentication, no data sent to your servers.

## Threat model (summary)

| Risk | Level | Notes |
|------|--------|--------|
| Network exfiltration of corpus | Low | No API calls; text stays in browser memory |
| XSS from user corpus/input | Low | UI uses `textContent`; avoid `innerHTML` with user strings |
| Malicious file upload | Low | Files are read locally as text only; 5 MB limit in `src/util/fileReader.ts` |
| Denial of service (browser tab) | Medium | Very large pastes can slow or freeze the tab; 5 MB upload cap helps |
| Supply chain (npm) | Medium | Run `npm audit`; commit lockfile; update dependencies periodically |
| Third-party fonts | Low | Google Fonts in `index.html` may see referrer; self-host fonts to avoid |

## Developer guidelines

- Do not use `eval`, `new Function`, or `innerHTML` with corpus or prediction strings.
- Keep secrets out of the frontend (no API keys in repo).
- After `vite build`, serve `dist/` with sensible headers on your host.

## Recommended production headers (example)

Adjust for your host and Vite asset hashes:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
```

## Reporting

This is a personal/demo project. For serious deployments, review CSP and dependency updates before go-live.
