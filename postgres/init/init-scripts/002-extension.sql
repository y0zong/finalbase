CREATE schema if not exists extensions AUTHORIZATION extension;
CREATE extension if not exists "uuid-ossp" with schema extensions;
CREATE extension if not exists pgcrypto with schema extensions;
-- case-insensitive text type
CREATE extension if not exists citext with schema extensions;
CREATE extension if not exists pgjwt with schema extensions;