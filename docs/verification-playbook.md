# Verification playbook

The exact commands to prove a change is good — gates first, then runtime.
Run the runtime section against a REAL production build; `next dev` hides
CSP, caching, and status-code behavior.

## Gates (fast, run always)

```bash
pnpm check          # lint + stylelint + prettier + typecheck (+tests) + vitest
pnpm knip           # unused files/exports/deps
pnpm check:i18n     # locale key parity
pnpm build          # includes scripts/check-public-env.mjs afterwards
```

Hooks cover the same ground incrementally: pre-commit = lint-staged
(+ i18n parity when messages changed), commit-msg = commitlint,
pre-push = typecheck + typecheck:test + test.

## Production runtime

```bash
# 0. Kill zombies first — a stale next-server means you test an old build.
lsof -nP -iTCP:3100 -sTCP:LISTEN
pkill -f next-server

PORT=3100 pnpm start &
```

**Status codes** (404 must be a real 404, metadata routes must not bounce
through the locale redirect):

```bash
for p / /ru /template /nonexistent /manifest.webmanifest /sitemap.xml /robots.txt /api/health; do
  curl -s -o /dev/null -w "%{http_code} $p\n" "http://localhost:3100$p"
done
```

**CSP nonce contract** — the nonce in the CSP header must equal the nonce
on the inline scripts in the HTML:

```bash
csp=$(curl -s -D- -o /tmp/page.html localhost:3100/ | grep -i '^content-security-policy:' | grep -o 'nonce-[^ ;]*' | head -1)
html=$(grep -o 'nonce="[^"]*"' /tmp/page.html | head -1)
echo "$csp vs $html"
```

**Rate limiting** — exhaust the echo budget and check the 429 carries the
headers (identity comes from x-real-ip here; without it prod SKIPS
limiting by design):

```bash
for i in $(seq 1 21); do
  curl -s -o /dev/null -D /tmp/h.txt -X POST localhost:3100/api/echo \
    -H 'content-type: application/json' -H 'x-real-ip: 7.7.7.7' -d '{"message":"hi"}'
done
grep -i 'HTTP/\|retry-after\|x-ratelimit' /tmp/h.txt   # expect 429 + full header set
```

**Revalidate webhook** — unset secret must answer 501 (abuse-proof clone):

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST 'localhost:3100/api/revalidate?tag=posts'          # 501 (no secret configured)
# with REVALIDATE_SECRET set: wrong secret → 403, correct + no targets → 400, correct + tag → 200
```

**Error envelope** — validation errors nest details:

```bash
curl -s -X POST localhost:3100/api/echo -H 'content-type: application/json' -d '{"message":""}'
# {"error":{"code":"VALIDATION","message":"…","details":{"field":"message"}}}
```

**Contact form (browser)** — submit the demo form and expect the success
toast; the Server Action POST must survive the middleware's NextRequest
clone. A submit faster than 3s after load is treated as a bot: the UI
still shows success, but the server log prints `[contact] bot rejected`.

**Streaming under CSP** — when touching CSP or enabling `cacheComponents`:
temporarily add `await new Promise((r) => setTimeout(r, 3000))` to a page
with a `loading.tsx`, open it in a browser, and confirm the skeleton is
REPLACED by content with zero CSP violations in the console. Remove the
delay afterwards.

**OG tags** — per-page titles must reach the share cards:

```bash
curl -s localhost:3100/template | grep -o '<meta property="og:title"[^>]*>'
```

## Template integrity

`clean:demo` must leave a working skeleton — always test on a copy:

```bash
cp -R . /tmp/clean-test && cd /tmp/clean-test
pnpm clean:demo --force && pnpm typecheck && pnpm test && pnpm build
```
