--
-- PostgreSQL database dump
--

\restrict pDGhzLTKfgzWodAhInqxWDYTNd8GgqqEuzFKj7CtEpCd6yKRDffU3HzqeAgWvG5

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: application_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.application_status AS ENUM (
    'Applied',
    'Interviewed',
    'Hired',
    'Not Selected'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id bigint NOT NULL,
    job_id bigint NOT NULL,
    seeker_id bigint NOT NULL,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    rejection_reason text,
    applied_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    match_score smallint,
    matched_skills json,
    missing_skills json,
    education_match boolean,
    match_provider character varying(30)
);


--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: job_fair_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_fair_participants (
    id bigint NOT NULL,
    job_fair_id bigint NOT NULL,
    user_id bigint NOT NULL,
    registered_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: job_fair_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_fair_participants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_fair_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_fair_participants_id_seq OWNED BY public.job_fair_participants.id;


--
-- Name: job_fairs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_fairs (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    event_date date,
    "time" character varying(255),
    organizer character varying(255),
    description text,
    image character varying(255),
    highlights json,
    companies json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: job_fairs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_fairs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_fairs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_fairs_id_seq OWNED BY public.job_fairs.id;


--
-- Name: job_matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_matches (
    id bigint NOT NULL,
    job_id bigint NOT NULL,
    user_id bigint NOT NULL,
    match_score integer NOT NULL,
    match_reasons text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: job_matches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_matches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_matches_id_seq OWNED BY public.job_matches.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_catalog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs_catalog (
    id bigint NOT NULL,
    employer_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    company character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    salary_min integer,
    salary_max integer,
    employment_type character varying(255) DEFAULT 'Full-time'::character varying NOT NULL,
    industry character varying(255),
    required_skills json,
    description text,
    status character varying(255) DEFAULT 'Open'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    educational_attainment_required character varying(255)
);


--
-- Name: jobs_catalog_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_catalog_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_catalog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_catalog_id_seq OWNED BY public.jobs_catalog.id;


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    from_user_id bigint NOT NULL,
    to_user_id bigint NOT NULL,
    content text NOT NULL,
    read_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    to_user_id bigint NOT NULL,
    content text NOT NULL,
    read_at timestamp(0) without time zone,
    meta json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: training_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_registrations (
    id bigint NOT NULL,
    training_id bigint NOT NULL,
    user_id bigint NOT NULL,
    registered_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: training_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.training_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: training_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.training_registrations_id_seq OWNED BY public.training_registrations.id;


--
-- Name: trainings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trainings (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    provider character varying(255) NOT NULL,
    start_date date,
    end_date date,
    slots integer DEFAULT 0 NOT NULL,
    type character varying(255),
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: trainings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trainings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trainings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trainings_id_seq OWNED BY public.trainings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    otp character varying(255),
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    role character varying(255) DEFAULT 'Seeker'::character varying NOT NULL,
    company_name character varying(255),
    is_verified boolean DEFAULT false NOT NULL,
    uploaded_docs boolean DEFAULT false NOT NULL,
    qc_id character varying(255),
    bday_month character varying(255),
    bday_day smallint,
    bday_year smallint,
    gender character varying(255),
    is_qc_resident boolean DEFAULT true NOT NULL,
    resume_path character varying(255),
    resume_text text,
    parsed_skill json,
    verification_doc_path character varying(255),
    educational_attainment character varying(255),
    address character varying(255),
    industry character varying(255)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: job_fair_participants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_fair_participants ALTER COLUMN id SET DEFAULT nextval('public.job_fair_participants_id_seq'::regclass);


--
-- Name: job_fairs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_fairs ALTER COLUMN id SET DEFAULT nextval('public.job_fairs_id_seq'::regclass);


--
-- Name: job_matches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_matches ALTER COLUMN id SET DEFAULT nextval('public.job_matches_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: jobs_catalog id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs_catalog ALTER COLUMN id SET DEFAULT nextval('public.jobs_catalog_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: training_registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_registrations ALTER COLUMN id SET DEFAULT nextval('public.training_registrations_id_seq'::regclass);


--
-- Name: trainings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainings ALTER COLUMN id SET DEFAULT nextval('public.trainings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: applications applications_job_id_seeker_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_seeker_id_unique UNIQUE (job_id, seeker_id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: job_fair_participants job_fair_participants_job_fair_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_fair_participants
    ADD CONSTRAINT job_fair_participants_job_fair_id_user_id_unique UNIQUE (job_fair_id, user_id);


--
-- Name: job_fair_participants job_fair_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_fair_participants
    ADD CONSTRAINT job_fair_participants_pkey PRIMARY KEY (id);


--
-- Name: job_fairs job_fairs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_fairs
    ADD CONSTRAINT job_fairs_pkey PRIMARY KEY (id);


--
-- Name: job_matches job_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_pkey PRIMARY KEY (id);


--
-- Name: jobs_catalog jobs_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs_catalog
    ADD CONSTRAINT jobs_catalog_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: training_registrations training_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_registrations
    ADD CONSTRAINT training_registrations_pkey PRIMARY KEY (id);


--
-- Name: training_registrations training_registrations_training_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_registrations
    ADD CONSTRAINT training_registrations_training_id_user_id_unique UNIQUE (training_id, user_id);


--
-- Name: trainings trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: applications_seeker_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_seeker_id_status_index ON public.applications USING btree (seeker_id, status);


--
-- Name: applications_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_status_index ON public.applications USING btree (status);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: jobs_catalog_employer_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_catalog_employer_id_status_index ON public.jobs_catalog USING btree (employer_id, status);


--
-- Name: jobs_catalog_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_catalog_status_index ON public.jobs_catalog USING btree (status);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: messages_from_user_id_to_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_from_user_id_to_user_id_index ON public.messages USING btree (from_user_id, to_user_id);


--
-- Name: messages_to_user_id_read_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_to_user_id_read_at_index ON public.messages USING btree (to_user_id, read_at);


--
-- Name: notifications_to_user_id_read_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_to_user_id_read_at_index ON public.notifications USING btree (to_user_id, read_at);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: users_is_verified_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_is_verified_index ON public.users USING btree (is_verified);


--
-- Name: users_role_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_index ON public.users USING btree (role);


--
-- Name: applications applications_job_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_foreign FOREIGN KEY (job_id) REFERENCES public.jobs_catalog(id) ON DELETE CASCADE;


--
-- Name: applications applications_seeker_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_seeker_id_foreign FOREIGN KEY (seeker_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_fair_participants job_fair_participants_job_fair_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_fair_participants
    ADD CONSTRAINT job_fair_participants_job_fair_id_foreign FOREIGN KEY (job_fair_id) REFERENCES public.job_fairs(id) ON DELETE CASCADE;


--
-- Name: job_fair_participants job_fair_participants_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_fair_participants
    ADD CONSTRAINT job_fair_participants_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_matches job_matches_job_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_job_id_foreign FOREIGN KEY (job_id) REFERENCES public.jobs_catalog(id) ON DELETE CASCADE;


--
-- Name: job_matches job_matches_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: jobs_catalog jobs_catalog_employer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs_catalog
    ADD CONSTRAINT jobs_catalog_employer_id_foreign FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_from_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_from_user_id_foreign FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_to_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_to_user_id_foreign FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_to_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_to_user_id_foreign FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: training_registrations training_registrations_training_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_registrations
    ADD CONSTRAINT training_registrations_training_id_foreign FOREIGN KEY (training_id) REFERENCES public.trainings(id) ON DELETE CASCADE;


--
-- Name: training_registrations training_registrations_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_registrations
    ADD CONSTRAINT training_registrations_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict pDGhzLTKfgzWodAhInqxWDYTNd8GgqqEuzFKj7CtEpCd6yKRDffU3HzqeAgWvG5

