#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f /docker-entrypoint-initdb.d/db/noharm-public.sql
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f /docker-entrypoint-initdb.d/db/noharm-create.sql
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f /docker-entrypoint-initdb.d/db/noharm-newuser.sql
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f /docker-entrypoint-initdb.d/db/noharm-triggers.sql

# Correcao dinamica para evitar erro de FK no truncate da tabela usuario
sed 's/TRUNCATE TABLE public.usuario RESTART IDENTITY;/TRUNCATE TABLE public.usuario RESTART IDENTITY CASCADE;/g' /docker-entrypoint-initdb.d/db/noharm-insert.sql > /tmp/noharm-insert.sql

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f /tmp/noharm-insert.sql