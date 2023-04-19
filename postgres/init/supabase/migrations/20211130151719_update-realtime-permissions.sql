-- migrate:up

-- Update future objects' permissions
ALTER DEFAULT PRIVILEGES FOR ROLE app_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres, app_admin;
ALTER DEFAULT PRIVILEGES FOR ROLE app_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres, app_admin;
ALTER DEFAULT PRIVILEGES FOR ROLE app_admin IN SCHEMA realtime GRANT ALL ON ROUTINES TO postgres, app_admin;

-- migrate:down
