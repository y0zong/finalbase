-- migrate:up
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION app_admin;
-- auth.users definition
CREATE TABLE auth.users (
  instance_id uuid NULL,
  id uuid NOT NULL UNIQUE,
  aud varchar(255) NULL,
  "role" varchar(255) NULL,
  email varchar(255) NULL UNIQUE,
  encrypted_password varchar(255) NULL,
  confirmed_at timestamptz NULL,
  confirmation_token varchar(255) NULL,
  confirmation_sent_at timestamptz NULL,
  recovery_token varchar(255) NULL,
  recovery_sent_at timestamptz NULL,
  email_change_token varchar(255) NULL,
  email_change varchar(255) NULL,
  email_change_sent_at timestamptz NULL,
  last_sign_in_at timestamptz NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, email);
CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);
comment on table auth.users is 'Auth: Stores user login data within a secure schema.';
-- auth.refresh_tokens definition
CREATE TABLE auth.refresh_tokens (
  instance_id uuid NULL,
  id bigserial NOT NULL,
  "token" varchar(255) NULL,
  user_id varchar(255) NULL,
  revoked bool NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id)
);
CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);
CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);
CREATE INDEX refresh_tokens_token_idx ON auth.refresh_tokens USING btree (token);
comment on table auth.refresh_tokens is 'Auth: Store of tokens used to refresh JWT tokens once they expire.';
-- auth.instances definition
CREATE TABLE auth.instances (
  id uuid NOT NULL,
  uuid uuid NULL,
  raw_base_config text NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  CONSTRAINT instances_pkey PRIMARY KEY (id)
);
comment on table auth.instances is 'Auth: Manages users across multiple sites.';
-- auth.audit_log_entries definition
CREATE TABLE auth.audit_log_entries (
  instance_id uuid NULL,
  id uuid NOT NULL,
  payload json NULL,
  created_at timestamptz NULL,
  CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id)
);
CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);
comment on table auth.audit_log_entries is 'Auth: Audit trail for user actions.';
-- auth.schema_migrations definition
CREATE TABLE auth.schema_migrations (
  "version" varchar(255) NOT NULL,
  CONSTRAINT schema_migrations_pkey PRIMARY KEY ("version")
);
comment on table auth.schema_migrations is 'Auth: Manages updates to the auth system.';
INSERT INTO auth.schema_migrations (version)
VALUES ('20171026211738'),
  ('20171026211808'),
  ('20171026211834'),
  ('20180103212743'),
  ('20180108183307'),
  ('20180119214651'),
  ('20180125194653');
-- Gets the User ID from the request cookie
create or replace function auth.uid() returns uuid as $$
select nullif(
    current_setting('request.jwt.claim.sub', true),
    ''
  )::uuid;
$$ language sql stable;
-- Gets the User ID from the request cookie
create or replace function auth.role() returns text as $$
select nullif(
    current_setting('request.jwt.claim.role', true),
    ''
  )::text;
$$ language sql stable;
-- Gets the User email
create or replace function auth.email() returns text as $$
select nullif(
    current_setting('request.jwt.claim.email', true),
    ''
  )::text;
$$ language sql stable;
-- User management
create or replace function auth.check_role_exists() returns trigger as $$ begin if not exists (
    select 1
    from pg_roles as r
    where r.rolname = new.role
  ) then raise foreign_key_violation using message = 'unknown database role: ' || new.role;
return null;
end if;
return new;
end $$ language plpgsql;
drop trigger if exists ensure_user_role_exists on auth.users;
create constraint trigger ensure_user_role_exists
after
insert
  or
update on auth.users for each row execute procedure auth.check_role_exists();
-- create encrypted password
create or replace function auth.encrypt_pass() returns trigger as $$ begin if tg_op = 'INSERT'
  or new.encrypted_password <> old.encrypted_password then new.encrypted_password = crypt(new.encrypted_password, gen_salt('bf'));
end if;
return new;
end $$ language plpgsql;
drop trigger if exists encrypt_pass on auth.users;
create trigger encrypt_pass before
insert
  or
update on auth.users for each row execute procedure auth.encrypt_pass();
-- return role if user and pass is verify
create or replace function auth.user_role(email text, pass text) returns name language plpgsql as $$ begin return (
    select role
    from auth.users
    where users.email = user_role.email
      and users.encrypted_password = crypt(user_role.pass, users.encrypted_password)
  );
end;
$$;
-- add type
CREATE TYPE auth.jwt_token AS (
  token text
);

-- login should be on your exposed schema
create or replace function
login(email text, pass text) returns auth.jwt_token as $$
declare
  _role name;
  result auth.jwt_token;
begin
  -- check email and password
  select auth.user_role(email, pass) into _role;
  if _role is null then
    raise invalid_password using message = 'invalid user or password';
  end if;

  select sign(
      row_to_json(r), 'reallyreallyreallyreallyverysafe'
    ) as token
    from (
      select _role as role, login.email as email,
         extract(epoch from now())::integer + 60*60 as exp
    ) r
    into result;
  return result;
end;
$$ language plpgsql security definer;

grant execute on function login(text,text) to anon;

-- usage on auth functions to API roles
GRANT USAGE ON SCHEMA auth TO anon,
  authenticated,
  service_role;
-- Supabase super admin
-- CREATE USER app_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
GRANT ALL PRIVILEGES ON SCHEMA auth TO app_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO app_admin;
ALTER USER app_admin
SET search_path = "auth";
ALTER table "auth".users OWNER TO app_admin;
ALTER table "auth".refresh_tokens OWNER TO app_admin;
ALTER table "auth".audit_log_entries OWNER TO app_admin;
ALTER table "auth".instances OWNER TO app_admin;
ALTER table "auth".schema_migrations OWNER TO app_admin;
ALTER table "auth".login(text, text) OWNER TO app_admin;
ALTER table "auth".check_role_exists OWNER TO app_admin;
ALTER table "auth".encrypt_pass OWNER TO app_admin;
ALTER table "auth".user_role OWNER TO app_admin;
-- migrate:down