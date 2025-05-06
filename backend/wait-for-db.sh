#!/bin/bash
# A script to wait for DB service
set -e

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; do
  >&2 echo "Postgres ainda não está pronto - aguardando..."
  sleep 3
done

python manage.py migrate
exec "$@"

