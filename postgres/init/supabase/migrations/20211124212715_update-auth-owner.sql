-- migrate:up

-- update owner for auth.uid, auth.role and auth.email functions
ALTER FUNCTION auth.uid owner to app_admin;
ALTER FUNCTION auth.role owner to app_admin;
ALTER FUNCTION auth.email owner to app_admin;

-- migrate:down
