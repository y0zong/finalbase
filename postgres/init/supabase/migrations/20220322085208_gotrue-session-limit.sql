-- migrate:up
ALTER ROLE app_admin SET idle_in_transaction_session_timeout TO 60000;

-- migrate:down
