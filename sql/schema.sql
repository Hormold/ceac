-- SQL DDL for the database schema

CREATE TABLE application (
    application_id text PRIMARY KEY,
    case_created text,
    notification_tg_id text,
    notification_type text DEFAULT 'telegram'::text,
    created_at timestamp with time zone DEFAULT now(),
    lang text,
    last_checked timestamp with time zone,
    last_error text
);

CREATE UNIQUE INDEX application_pkey ON application(application_id text_ops);


CREATE TABLE history (
    record_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id text REFERENCES application(application_id),
    status text,
    created_at timestamp with time zone DEFAULT now()
);


CREATE UNIQUE INDEX history_pkey ON history(record_id int4_ops);
CREATE UNIQUE INDEX history_application_id_status_idx ON history(application_id text_ops,status text_ops);


-- Visa bulletin -------------------------------------------------

CREATE TABLE bul_reports (
    month text,
    year text,
    result text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE bul_sub (
    tg_id integer PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    is_notified_monthly boolean DEFAULT false,
    lang text DEFAULT 'en'::text
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX bul_sub_pkey ON bul_sub(tg_id int4_ops);
