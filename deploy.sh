#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

DEPLOY_HOST="${DEPLOY_HOST:-kylebing.cn}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/html/tools/pixel-icon-editor}"

DEST="${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "── build ──"
npm run build

echo "── mkdir ──"
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}'"

echo "── upload ──"
echo "  → ${DEST}"
rsync -avz --delete \
  --exclude '.DS_Store' \
  dist/ "${DEST}"

echo "── done ──"
echo "  https://${DEPLOY_HOST}/tools/pixel-icon-editor/"
