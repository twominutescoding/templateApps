-- ============================================================================
-- Clean Script for Auth-Service (PostgreSQL)
-- ============================================================================
-- Drops ALL database objects used by auth-service.
-- Run this to completely remove auth-service schema objects.
--
-- Schemas affected:
--   ap_applications - Main auth tables
--   ap_log          - Logging tables
--
-- WARNING: This script is DESTRUCTIVE and IRREVERSIBLE.
--          All data in these tables will be lost.
-- ============================================================================

-- ============================================================================
-- 1. Drop Tables (ap_applications) - CASCADE drops dependent FKs/indexes
-- ============================================================================

-- Child tables (have FK references)
DROP TABLE IF EXISTS ap_applications.d_mailing_list_users CASCADE;
DROP TABLE IF EXISTS ap_applications.d_user_roles CASCADE;
DROP TABLE IF EXISTS ap_applications.d_entity_attributes CASCADE;
DROP TABLE IF EXISTS ap_applications.d_refresh_tokens CASCADE;
DROP TABLE IF EXISTS ap_applications.t_mailing CASCADE;

-- Parent tables
DROP TABLE IF EXISTS ap_applications.d_mailing_lists CASCADE;
DROP TABLE IF EXISTS ap_applications.d_roles CASCADE;
DROP TABLE IF EXISTS ap_applications.d_users CASCADE;
DROP TABLE IF EXISTS ap_applications.d_entities CASCADE;
DROP TABLE IF EXISTS ap_applications.d_entity_types CASCADE;
DROP TABLE IF EXISTS ap_applications.d_user_status CASCADE;

-- ============================================================================
-- 2. Drop Tables (ap_log)
-- ============================================================================

DROP TABLE IF EXISTS ap_log.t_app_log CASCADE;
DROP TABLE IF EXISTS ap_log.d_log_status CASCADE;

-- ============================================================================
-- 3. Drop Sequences (ap_applications)
-- ============================================================================

DROP SEQUENCE IF EXISTS ap_applications.d_entities_seq01;
DROP SEQUENCE IF EXISTS ap_applications.d_refresh_tokens_seq;
DROP SEQUENCE IF EXISTS ap_applications.t_mailing_seq;

-- ============================================================================
-- 4. Drop Sequences (ap_log)
-- ============================================================================

DROP SEQUENCE IF EXISTS ap_log.t_app_log_seq01;

-- ============================================================================
-- 5. Drop Functions/Triggers
-- ============================================================================
-- PostgreSQL triggers are automatically dropped with their tables (CASCADE),
-- but trigger functions may remain. Drop them if they exist.

DROP FUNCTION IF EXISTS ap_applications.d_entities_bifer() CASCADE;
DROP FUNCTION IF EXISTS ap_applications.trg_d_refresh_tokens_id() CASCADE;
DROP FUNCTION IF EXISTS ap_applications.trg_d_refresh_tokens_date() CASCADE;
DROP FUNCTION IF EXISTS ap_applications.t_mailing_trg() CASCADE;
DROP FUNCTION IF EXISTS ap_log.t_app_log_bifer() CASCADE;

-- ============================================================================
-- Done
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Auth-service PostgreSQL cleanup complete.';
    RAISE NOTICE '============================================';
END $$;
