-- 
-- Set schema auth
--
-- SET role auth;
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION auth;
-- All following tables and functions should be owned by the auth role
-- We will be able to return to the superuser role later with reset role;
-- auth role to create auth schema
-- CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION authenticated;
GRANT usage on schema extensions to auth;
GRANT execute on All functions in SCHEMA extensions to auth;
grant usage on schema auth to anon,
  webuser;
SET role auth;
CREATE TABLE auth.users (
  "id" uuid NOT NULL UNIQUE DEFAULT extensions.uuid_generate_v4(),
  "role" varchar(255) NOT NULL DEFAULT 'webuser',
  "meta" json NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "password" varchar(255) NOT NULL,
  "session_token" varchar(255) NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'base64'),
  "confirmed_at" timestamptz NULL,
  "confirmation_token" varchar(255) NULL,
  "confirmation_sent_at" timestamptz NULL,
  "recovery_token" varchar(255) NULL,
  "recovery_sent_at" timestamptz NULL,
  "email_change_token" varchar(255) NULL,
  "email_change" varchar(255) NULL,
  "email_change_sent_at" timestamptz NULL,
  "last_sign_in_at" timestamptz NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
comment on table auth.users is 'Auth: Stores user login data within a secure schema.';
CREATE TABLE auth.sessions (
  "token" text NOT NULL PRIMARY KEY DEFAULT encode(extensions.gen_random_bytes(32), 'base64'),
  "user_id" uuid NOT NULL references auth.users,
  "expires" timestamptz NOT NULL DEFAULT clock_timestamp() + '60min'::interval,
  "created_at" timestamptz NOT NULL DEFAULT clock_timestamp(),
  check (expires > created_at)
);
comment on table auth.sessions is 'User sessions, both active and expired ones.';
CREATE view auth.active_sessions as
SELECT token,
  user_id,
  created_at,
  expires
from auth.sessions
where expires > clock_timestamp() WITH local check option;
CREATE index on auth.sessions(expires);
-- clean up expired sessions
CREATE function auth.clean_sessions() returns void language sql security definer as $$
DELETE from auth.sessions
where expires < clock_timestamp() - '1day'::interval;
$$;
comment on function auth.clean_sessions is 'Cleans up sessions that have expired longer than a day ago.';
-- -- Gets the User ID from the request cookie
CREATE or replace function auth.role() returns text as $$
SELECT nullif(
    current_setting('request.jwt.claims', true)::json->>'role',
    ''
  )::text;
$$ language sql stable;
-- Gets the User email
CREATE or replace function auth.email() returns text as $$
SELECT nullif(
    current_setting('request.jwt.claims', true)::json->>'email',
    ''
  )::text;
$$ language sql stable;
-- Gets the User session
CREATE or replace function auth.session() returns text as $$
SELECT nullif(
    current_setting('request.jwt.claims', true)::json->>'session',
    ''
  )::text;
$$ language sql stable;
-- User management
CREATE or replace function auth.if_role_exists() returns trigger as $$ begin if not exists (
    SELECT 1
    from pg_roles as r
    where r.rolname = new.role
  ) then raise foreign_key_violation using message = 'unknown database role: ' || new.role;
return null;
end if;
return new;
end $$ language plpgsql;
drop trigger if exists ensure_user_role_exists on auth.users;
CREATE constraint trigger ensure_user_role_exists
after
insert
  or
update on auth.users for each row execute procedure auth.if_role_exists();
-- get user_id from current session
create function auth.user_id_from_active_session(session_token text) returns uuid language sql security definer as $$
select user_id
from auth.active_sessions
where token = session_token;
$$;
comment on function auth.user_id_from_active_session is 'Returns the id of the user currently authenticated, given a session token';
GRANT execute on function auth.user_id_from_active_session to anon;
-- 
create function auth.add_active_session(email text, pass text) returns text language sql security definer as $$
insert into auth.active_sessions(user_id)
select id as user_id
from auth.users
where email = add_active_session.email
  and password = extensions.crypt(add_active_session.pass, password)
returning token;
$$;
comment on function auth.add_active_session is 'Returns the token for a newly created session or null on failure.';
-- 
-- Authentication hook
-- 
create function auth.check_session() returns void language plpgsql as $$
declare request text;
query_schema text;
update_schema text;
session_token text;
session_user_id uuid;
begin
SELECT current_setting('request.headers', true)::json->>'Accept-Profile' into query_schema;
SELECT current_setting('request.headers', true)::json->>'Content-Profile' into update_schema;
SELECT current_setting('request.path', true) into request;
session_token := auth.session();
session_user_id := auth.user_id_from_active_session(session_token);
if query_schema is not null
or update_schema is not null then if request <> '/rpc/register'
and request <> '/rpc/login' then if session_user_id is not null then
set local role to webuser;
perform set_config('auth.session.id', session_user_id::text, true);
else
set local role to anon;
perform set_config('auth.session.id', '', true);
raise insufficient_privilege using detail = 'invalid credentials';
end if;
end if;
end if;
end;
$$;
comment on function auth.check_session is 'Sets the role and user_id based on the session token given as a cookie.';
grant execute on function auth.check_session to webuser;
-- encrypt password
CREATE or replace function auth.encrypt_pass() returns trigger as $$ begin if tg_op = 'INSERT'
  or new.password <> old.password then new.password = extensions.crypt(new.password, extensions.gen_salt('bf'));
end if;
return new;
end $$ language plpgsql;
drop trigger if exists encrypt_pass on auth.users;
CREATE trigger encrypt_pass before
insert
  or
update on auth.users for each row execute procedure auth.encrypt_pass();
-- return role if user and pass is verify
CREATE or replace function auth.get_role(email text, pass text) returns name language plpgsql as $$ begin return (
    SELECT role
    from auth.users
    where users.email = get_role.email
      and users.password = extensions.crypt(get_role.pass, users.password)
  );
end;
$$;
-- -- add type
CREATE TYPE auth.jwt_token AS (token text);
CREATE or replace function auth.create_jwt_token_by(email text, role text, session text) returns auth.jwt_token as $$
declare result auth.jwt_token;
begin
SELECT extensions.sign(
    json_build_object(
      'email',
      email,
      'role',
      role,
      'session',
      session,
      'exp',
      extract(
        epoch
        from now()
      )::integer + 3600
    ),
    'your-super-secret-jwt-token-with-at-least-32-characters-long'
  ) as token into result;
return result;
end;
$$ language plpgsql security definer;
-- -- 
-- -- login should be on your exposed schema
-- -- 
CREATE or replace function auth.login(email text, pass text) returns auth.jwt_token as $$
declare _session text;
_headers json;
_token auth.jwt_token;
begin -- check email and password
SELECT auth.add_active_session(email, pass) into _session;
if _session is null then raise invalid_password using message = 'invalid user or password';
end if;
_token := auth.create_jwt_token_by(login.email, 'webuser', _session);
-- _headers := json_build_array(
--   json_build_object(
--     'Set-Cookie',
--     FORMAT(
--       'token=%s; Path=/; Max-Age=3600; HttpOnly',
--       _token
--     )
--   )
-- );
-- perform set_config('response.headers', _headers::text, true);
return _token;
end;
$$ language plpgsql security definer;
GRANT execute on function extensions.crypt,
  extensions.uuid_generate_v4,
  extensions.sign,
  extensions.gen_salt(text) to anon;
GRANT execute on function auth.login to anon;
-- logout
CREATE or replace function auth.logout() returns void as $$ begin
UPDATE auth.sessions
set expires = clock_timestamp()
WHERE token = auth.session();
end;
$$ language plpgsql security definer;
GRANT execute on function auth.logout to webuser;
-- -- 
-- -- register should be on your exposed schema
-- -- 
CREATE or replace function auth.register(email text, pass text, meta json) returns auth.jwt_token as $$ begin
INSERT into auth.users (email, password, meta)
values ($1, $2, $3);
return auth.login(email, pass);
end;
$$ language plpgsql security definer;
GRANT execute on function auth.register to anon;
-- test
CREATE or replace function auth.islogin() returns void as $$ begin
end;
$$ language plpgsql security definer;
GRANT execute on function auth.islogin to webuser;
reset role;