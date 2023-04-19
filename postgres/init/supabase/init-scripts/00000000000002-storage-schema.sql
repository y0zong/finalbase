-- migrate:up
CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION app_admin;
grant usage on schema storage to postgres,
    anon,
    authenticated,
    service_role;
alter default privileges in schema storage
grant all on tables to postgres,
    anon,
    authenticated,
    service_role;
alter default privileges in schema storage
grant all on functions to postgres,
    anon,
    authenticated,
    service_role;
alter default privileges in schema storage
grant all on sequences to postgres,
    anon,
    authenticated,
    service_role;
CREATE TABLE "storage"."buckets" (
    "id" text not NULL,
    "name" text NOT NULL,
    "owner" uuid,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "buckets_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users"("id"),
    PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "bname" ON "storage"."buckets" USING BTREE ("name");
CREATE TABLE "storage"."objects" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "bucket_id" text,
    "name" text,
    "owner" uuid,
    "data" bytea,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    "last_accessed_at" timestamptz DEFAULT now(),
    "type" text,
    "metadata" jsonb,
    CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id"),
    CONSTRAINT "objects_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users"("id"),
    PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "bucketid_objname" ON "storage"."objects" USING BTREE ("bucket_id", "name");
CREATE INDEX name_prefix_search ON storage.objects(name text_pattern_ops);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION storage.foldername(name text) RETURNS text [] LANGUAGE plpgsql AS $function$
DECLARE _parts text [];
BEGIN
select string_to_array(name, '/') into _parts;
return _parts [1:array_length(_parts,1)-1];
END $function$;
CREATE FUNCTION storage.filename(name text) RETURNS text LANGUAGE plpgsql AS $function$
DECLARE _parts text [];
BEGIN
select string_to_array(name, '/') into _parts;
return _parts [array_length(_parts,1)];
END $function$;
CREATE FUNCTION storage.extension(name text) RETURNS text LANGUAGE plpgsql AS $function$
DECLARE _parts text [];
_filename text;
BEGIN
select string_to_array(name, '/') into _parts;
select _parts [array_length(_parts,1)] into _filename;
-- @todo return the last part instead of 2
return split_part(_filename, '.', 2);
END $function$;
CREATE FUNCTION storage.search(
    prefix text,
    bucketname text,
    limits int DEFAULT 100,
    levels int DEFAULT 1,
    offsets int DEFAULT 0
) RETURNS TABLE (
    name text,
    id uuid,
    updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    metadata jsonb
) LANGUAGE plpgsql AS $function$
DECLARE _bucketId text;
BEGIN -- will be replaced by migrations when server starts
-- saving space for cloud-init
END $function$;
CREATE FUNCTION storage.file(name text) RETURNS bytea as $$
DECLARE headers text;
DECLARE data bytea;
BEGIN
select format(
        '[{"Content-Type": "%s"}, {"Content-Disposition": "inline; filename=\"%s\""}, {"Cache-Control": "max-age=259200"}]',
        objects.type,
        objects.name
    )
from objects
where objects.name = file.name into headers;
perform set_config('response.headers', headers, true);
select objects.data
from objects
where objects.name = file.name into data;
if found then return(data);
else raise sqlstate 'PT404' using message = 'NOT FOUND',
detail = 'File not found',
hint = format('%s seems to be an invalid file name', file.name);
end if;
END $$ language plpgsql;
-- CREATE USER app_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
GRANT ALL PRIVILEGES ON SCHEMA storage TO app_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO app_admin;
ALTER USER app_admin
SET search_path = "storage";
ALTER table "storage".objects owner to app_admin;
ALTER table "storage".buckets owner to app_admin;
ALTER function "storage".file(text) owner to app_admin;
ALTER function "storage".foldername(text) owner to app_admin;
ALTER function "storage".filename(text) owner to app_admin;
ALTER function "storage".extension(text) owner to app_admin;
ALTER function "storage".search(text, text, int, int, int) owner to app_admin;
-- migrate:down