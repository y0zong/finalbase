-- migrate:up

-- update auth schema permissions
GRANT ALL PRIVILEGES ON SCHEMA auth TO app_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO app_admin;

ALTER table IF EXISTS "auth".users OWNER TO app_admin;
ALTER table IF EXISTS "auth".refresh_tokens OWNER TO app_admin;
ALTER table IF EXISTS "auth".audit_log_entries OWNER TO app_admin;
ALTER table IF EXISTS "auth".instances OWNER TO app_admin;
ALTER table IF EXISTS "auth".schema_migrations OWNER TO app_admin;

GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, app_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, app_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, app_admin;
ALTER DEFAULT PRIVILEGES FOR ROLE app_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres, app_admin;
ALTER DEFAULT PRIVILEGES FOR ROLE app_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres, app_admin;
ALTER DEFAULT PRIVILEGES FOR ROLE app_admin IN SCHEMA auth GRANT ALL ON ROUTINES TO postgres, app_admin;

-- migrate:down
