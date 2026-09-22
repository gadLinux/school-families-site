#!/usr/bin/env bash
# Arranca el backend en local: PocketBase en 127.0.0.1:8090 y Mailpit (buzón
# falso para ver los códigos de acceso) en http://127.0.0.1:8025.
set -euo pipefail
cd "$(dirname "$0")"

VERSION=0.40.4
if [[ ! -x bin/pocketbase ]]; then
  mkdir -p bin
  curl -sL -o bin/pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_linux_amd64.zip"
  unzip -o -q bin/pb.zip pocketbase -d bin && rm bin/pb.zip
fi

if ! docker ps --format '{{.Names}}' | grep -qx fdv-mailpit; then
  docker rm -f fdv-mailpit >/dev/null 2>&1 || true
  docker run -d --name fdv-mailpit -p 127.0.0.1:1025:1025 -p 127.0.0.1:8025:8025 axllent/mailpit >/dev/null
fi

# Configuración de pb/.env (ver .env.example), si existe.
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# En local, los correos van a Mailpit salvo que se pida lo contrario
# (PB_DEV_REAL_SMTP=1 ./pb/dev.sh envía de verdad con la cuenta de .env).
if [[ "${PB_DEV_REAL_SMTP:-0}" != "1" ]]; then
  export PB_SMTP_HOST=127.0.0.1 PB_SMTP_PORT=1025 PB_SMTP_USER= PB_SMTP_PASS=
fi
export PB_APP_URL=http://127.0.0.1:4321 PB_WEB_URL=http://127.0.0.1:4321 PB_PUBLIC_URL=http://127.0.0.1:8090
exec bin/pocketbase serve --http 127.0.0.1:8090 --dir pb_data \
  --migrationsDir pb_migrations --hooksDir pb_hooks "$@"
