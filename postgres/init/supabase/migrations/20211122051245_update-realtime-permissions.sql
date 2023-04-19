-- migrate:up

-- update realtime schema permissions
GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA realtime TO postgres, app_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA realtime TO postgres, app_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA realtime TO postgres, app_admin;

-- migrate:down
