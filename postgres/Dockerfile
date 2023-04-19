ARG postgresql_major=15
ARG postgresql_release=${postgresql_major}.2-alpine

FROM postgres:${postgresql_release} as base
# Redeclare args for use in subsequent stages
ARG TARGETARCH
# Bump default build arg to build a package from source
# Bump vars.yml to specify runtime package version
ARG sfcgal_release=1.3.10
ARG postgis_release=3.3.2
ARG pgrouting_release=3.4.1
ARG pgtap_release=1.2.0
ARG pg_cron_release=1.5.1
ARG pgaudit_release=1.7.0
ARG pgjwt_release=9742dab1b2f297ad3811120db7b21451bca2d3c9
ARG pgsql_http_release=1.5.0
ARG plpgsql_check_release=2.2.5
ARG pg_safeupdate_release=1.4
ARG timescaledb_release=2.9.1
ARG wal2json_release=2_5
ARG plv8_release=3.1.5
ARG pg_plan_filter_release=5081a7b5cb890876e67d8e7486b6a64c38c9a492
ARG pg_net_release=0.7.2
ARG rum_release=1.3.13
ARG pg_hashids_release=cd0e1b31d52b394a0df64079406a14a4f7387cd6
ARG libsodium_release=1.0.18
ARG pgsodium_release=3.1.5
ARG pg_graphql_release=1.1.0
ARG pg_stat_monitor_release=1.1.1
ARG pg_jsonschema_release=0.1.4
ARG vault_release=0.2.8
ARG groonga_release=12.0.8
ARG pgroonga_release=2.4.0
ARG wrappers_release=0.1.9
ARG hypopg_release=1.3.1
ARG pg_repack_release=1.4.8
ARG pgvector_release=0.4.0
ARG pg_tle_release=1.0.1
ARG supautils_release=1.7.2

RUN apk --no-cache add curl-dev libsodium

FROM base as builder
RUN apk --no-cache add cmake clang make gcc g++ libc-dev linux-headers curl-dev

####################
# Build extension
####################
FROM builder as pg_cron
# Download and extract
ADD "https://github.com/citusdata/pg_cron/archive/refs/tags/v${pg_cron_release}.tar.gz" \
    /tmp/pg_cron.tar.gz
RUN tar -xvf /tmp/pg_cron.tar.gz -C /tmp && \
    rm -rf /tmp/pg_cron.tar.gz
# Build from source
WORKDIR /tmp/pg_cron-${pg_cron_release}
RUN --mount=type=cache,target=/ccache \
    make -j$(nproc)

FROM builder as pg_net
# Download and extract
ADD "https://github.com/supabase/pg_net/archive/refs/tags/v${pg_net_release}.tar.gz" \
    /tmp/pg_net.tar.gz
RUN tar -xvf /tmp/pg_net.tar.gz -C /tmp && \
    rm -rf /tmp/pg_net.tar.gz
# Build from source
WORKDIR /tmp/pg_net-${pg_net_release}
RUN --mount=type=cache,target=/ccache \
    make -j$(nproc)

FROM builder as pgsodium
# Download and extract
ADD "https://github.com/michelp/pgsodium/archive/refs/tags/v${pgsodium_release}.tar.gz" \
    /tmp/pgsodium.tar.gz
ADD "https://download.libsodium.org/libsodium/releases/libsodium-${libsodium_release}.tar.gz" \
    /tmp/libsodium.tar.gz
RUN tar -xvf /tmp/pgsodium.tar.gz -C /tmp && \
    rm -rf /tmp/pgsodium.tar.gz
RUN tar -xvf /tmp/libsodium.tar.gz -C /tmp && \
    rm -rf /tmp/libsodium.tar.gz
# Build from source
RUN  cd /tmp/libsodium-${libsodium_release} && ./configure && make -j$(nproc) && make install
WORKDIR /tmp/pgsodium-${pgsodium_release}
RUN --mount=type=cache,target=/ccache \
    make -j$(nproc)

FROM builder as pgjwt
# Download and extract
ADD "https://github.com/michelp/pgjwt/archive/master.tar.gz" \
    /tmp/pgjwt-master.tar.gz
RUN tar -xvf /tmp/pgjwt-master.tar.gz -C /tmp && \
    rm -rf /tmp/pgjwt-master.tar.gz
# Build from source
WORKDIR /tmp/pgjwt-master
RUN --mount=type=cache,target=/ccache \
    make -j$(nproc)

####################
# Build final image
####################
FROM base as production

# Setup extensions
COPY --from=pg_cron /tmp/pg_cron-${pg_cron_release}/pg_cron.so /usr/local/lib/postgresql/pg_cron.so
COPY --from=pg_cron /tmp/pg_cron-${pg_cron_release}/pg_cron.control /usr/local/share/postgresql/extension
COPY --from=pg_cron /tmp/pg_cron-${pg_cron_release}/pg_cron*.sql /usr/local/share/postgresql/extension

# COPY --from=pgjwt /tmp/pgjwt-master/pgjwt.so /usr/local/lib/postgresql/pgjwt.so
COPY --from=pgjwt /tmp/pgjwt-master/pgjwt.control /usr/local/share/postgresql/extension
COPY --from=pgjwt /tmp/pgjwt-master/pgjwt*.sql /usr/local/share/postgresql/extension

COPY --from=pg_net /tmp/pg_net-${pg_net_release}/pg_net.so /usr/local/lib/postgresql/pg_net.so
COPY --from=pg_net /tmp/pg_net-${pg_net_release}/pg_net.control /usr/local/share/postgresql/extension
COPY --from=pg_net /tmp/pg_net-${pg_net_release}/pg_net*.sql /usr/local/share/postgresql/extension

COPY --from=pgsodium /tmp/libsodium-${libsodium_release} /tmp
COPY --from=pgsodium /tmp/pgsodium-${pgsodium_release}/pgsodium.so /usr/local/lib/postgresql/pgsodium.so
COPY --from=pgsodium /tmp/pgsodium-${pgsodium_release}/pgsodium.control /usr/local/share/postgresql/extension
COPY --from=pgsodium /tmp/pgsodium-${pgsodium_release}/pgsodium*.sql /usr/local/share/postgresql/extension

# Initialise configs
COPY --chown=postgres:postgres config/postgresql.conf /etc/postgresql/postgresql.conf
COPY --chown=postgres:postgres config/pg_hba.conf /etc/postgresql/pg_hba.conf
COPY --chown=postgres:postgres config/pg_ident.conf /etc/postgresql/pg_ident.conf
COPY --chown=postgres:postgres config/postgresql-stdout-log.conf /etc/postgresql/logging.conf
COPY --chown=postgres:postgres config/supautils.conf /etc/postgresql-custom/supautils.conf
COPY --chown=postgres:postgres extension/scripts /etc/postgresql-custom/extension-custom-scripts
COPY --chown=postgres:postgres extension/pgsodium/getkey_urandom.sh /usr/local/share/postgresql/extension/pgsodium_getkey

# RUN sed -i "s/#unix_socket_directories = '\/tmp'/unix_socket_directories = '\/var\/run\/postgresql'/g" /etc/postgresql/postgresql.conf && \
#     sed -i "s/#session_preload_libraries = ''/session_preload_libraries = 'supautils'/g" /etc/postgresql/postgresql.conf && \
#     sed -i "s/#include = '\/etc\/postgresql-custom\/supautils.conf'/include = '\/etc\/postgresql-custom\/supautils.conf'/g" /etc/postgresql/postgresql.conf && \
#     echo "cron.database_name = 'postgres'" >> /etc/postgresql/postgresql.conf && \
#     echo "pgsodium.getkey_script= '/usr/lib/postgresql/${postgresql_major}/bin/pgsodium_getkey.sh'" >> /etc/postgresql/postgresql.conf && \
#     echo 'auto_explain.log_min_duration = 10s' >> /etc/postgresql/postgresql.conf && \
#     mkdir -p /etc/postgresql-custom && \
#     chown postgres:postgres /etc/postgresql-custom

# Include schema migrations
COPY init /docker-entrypoint-initdb.d/
COPY extension/scripts/pgbouncer/auth_schema.sql /docker-entrypoint-initdb.d/init-scripts/00-schema.sql
# COPY extension/scripts/webhooks.sql /docker-entrypoint-initdb.d/init-scripts/00-webhooks.sql
COPY extension/scripts/stat_extension.sql /docker-entrypoint-initdb.d/migrations/00-extension.sql

# Setup default host and locale
ENV POSTGRES_HOST=/var/run/postgresql
ENV POSTGRES_INITDB_ARGS=--lc-ctype=C.UTF-8