#!/usr/bin/env bash
# Rebuilds and restarts the frontend, then revalidates Next.js's tagged fetch
# cache. The revalidate step is required after every restart — the "properties"
# tag cache does not reliably clear on its own (see project memory / git log
# for the debugging session that found this), so it's folded in here instead
# of relying on a human to remember a separate curl call.
set -euo pipefail
cd "$(dirname "$0")"

npm install
npm run build

pm2 restart vf-frontend
sleep 3

SECRET=$(grep '^REVALIDATE_SECRET=' .env.local | cut -d= -f2-)
curl -sf -X POST http://127.0.0.1:3001/api/revalidate \
  -H 'Content-Type: application/json' \
  -d "{\"secret\":\"$SECRET\",\"tags\":[\"properties\"]}"
echo
echo "Deploy complete and revalidated."
