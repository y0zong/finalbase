-- If anything goes wrong in the following statements, all changes will be rolled back,
-- including definitions of new tables, newly set up roles etc. This is a valuable 
-- feature of PostgreSQL not available in most other relational databases.
-- 
-- Set access role
-- 
-- CREATE role authenticated WITH PASSWORD :'PASSWORD' login noinherit superuser createdb createrole replication bypassrls;
CREATE role authenticator WITH PASSWORD :'PASSWORD' login noinherit;
CREATE role anon nologin noinherit;
comment on role anon is 'Role that PostgREST will switch to for not authenticated users';
CREATE role webuser nologin noinherit;
comment on role webuser is 'Role that PostgREST will switch to for authenticated users';
-- 
-- Set short statement/query timeouts for API roles
-- 
ALTER role anon
SET statement_timeout = '3s';
ALTER role webuser
SET statement_timeout = '8s';
-- 
-- set schema role
-- 
CREATE role auth nologin;
comment on role auth is 'Role that owns the auth schema and its objects.';
CREATE role extension nologin;
comment on role extension is 'Role that owns the extension schema and its objects.';
-- allow the authenticator role to switch to the other roles
GRANT anon,
  webuser,
  extension,
  auth to authenticator;
-- 
-- Set schema public
--
-- By default, all database users (identified by the role PUBLIC, which is 
-- granted to all roles by default) have privileges to execute any function that we define
ALTER default privileges revoke execute on functions
from public;
-- ALTER default privileges in schema public
-- GRANT SELECT on tables to anon;
-- ALTER default privileges for role user in schema public
-- GRANT EXECUTE on functions to anon;
-- ALTER default privileges for role user in schema public
-- GRANT ALL on tables to user;
-- ALTER default privileges for role user in schema public
-- GRANT ALL on functions to user;
-- ALTER default privileges for role user in schema public
-- GRANT ALL on sequences to user;
-- search path
-- SET search_path TO public,
--   extensions;