#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL environment variable is required" >&2
  exit 1
fi

echo "🧹 Cleaning duplicate migrations…"

psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
DELETE FROM supabase_migrations.schema_migrations
WHERE version NOT IN (
  SELECT regexp_replace(filename, E'\\.sql$', '')
  FROM pg_ls_dir('supabase/migrations') AS t(filename)
);
SQL

supabase db push
