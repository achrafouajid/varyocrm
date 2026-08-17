#!/usr/bin/env bash
# Deploy script for bento-crm, invoked over SSH by the GitHub Actions deploy key.
# Fast-forwards the checkout (so compose changes and this script stay in sync),
# pulls the image tag GHCR just pushed, recreates the container, then health-checks
# it. Non-zero exit fails the Actions job (no silent failures).
set -euo pipefail

APP_DIR="/srv/bento/apps/crm"
SERVICE="crm"
CONTAINER="bento-crm"
HEALTH_PORT=4000
IMAGE_TAG="${1:?usage: deploy.sh <image-tag> (reads GHCR_LOGIN_TOKEN from env)}"

cd "$APP_DIR"

# Keep docker-compose.yml and this script current. --ff-only fails loudly rather
# than clobbering anything edited by hand on the server.
git fetch --quiet origin main
git pull --ff-only --quiet origin main

if [ -n "${GHCR_LOGIN_TOKEN:-}" ]; then
  echo "$GHCR_LOGIN_TOKEN" | docker login ghcr.io -u "${GHCR_LOGIN_USER:-github-actions}" --password-stdin
fi

export CRM_IMAGE_TAG="$IMAGE_TAG"
docker compose pull "$SERVICE"
docker compose up -d "$SERVICE"

echo "Waiting for $CONTAINER to become healthy..."
for i in $(seq 1 30); do
  if docker exec "$CONTAINER" node -e "require('http').get('http://127.0.0.1:${HEALTH_PORT}/', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))" 2>/dev/null; then
    echo "$CONTAINER is responding after ${i}s"
    docker image prune -f >/dev/null 2>&1 || true
    exit 0
  fi
  sleep 1
done

echo "ERROR: $CONTAINER did not respond within 30s after deploy" >&2
docker logs "$CONTAINER" --tail 50 >&2
exit 1
