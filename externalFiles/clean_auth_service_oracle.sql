-- ============================================================================
-- Clean Script for Auth-Service (Oracle)
-- ============================================================================
-- Drops ALL database objects used by auth-service.
-- Run this to completely remove auth-service schema objects.
--
-- Schemas affected:
--   AP_APPLICATIONS - Main auth tables
--   AP_LOG          - Logging tables
--
-- WARNING: This script is DESTRUCTIVE and IRREVERSIBLE.
--          All data in these tables will be lost.
-- ============================================================================

SET SERVEROUTPUT ON;

-- ============================================================================
-- Helper: Drop object only if it exists (suppresses ORA errors)
-- ============================================================================
CREATE OR REPLACE PROCEDURE drop_if_exists(
    p_type  IN VARCHAR2,
    p_name  IN VARCHAR2,
    p_owner IN VARCHAR2 DEFAULT NULL
) IS
    v_sql VARCHAR2(500);
    v_owner VARCHAR2(100) := NVL(p_owner, USER);
    v_count NUMBER;
BEGIN
    IF UPPER(p_type) = 'TABLE' THEN
        SELECT COUNT(*) INTO v_count
        FROM all_tables WHERE owner = UPPER(v_owner) AND table_name = UPPER(p_name);
    ELSIF UPPER(p_type) = 'SEQUENCE' THEN
        SELECT COUNT(*) INTO v_count
        FROM all_sequences WHERE sequence_owner = UPPER(v_owner) AND sequence_name = UPPER(p_name);
    ELSIF UPPER(p_type) = 'TRIGGER' THEN
        SELECT COUNT(*) INTO v_count
        FROM all_triggers WHERE owner = UPPER(v_owner) AND trigger_name = UPPER(p_name);
    ELSIF UPPER(p_type) = 'INDEX' THEN
        SELECT COUNT(*) INTO v_count
        FROM all_indexes WHERE owner = UPPER(v_owner) AND index_name = UPPER(p_name);
    ELSE
        v_count := 0;
    END IF;

    IF v_count > 0 THEN
        IF UPPER(p_type) = 'TABLE' THEN
            v_sql := 'DROP TABLE ' || v_owner || '.' || p_name || ' CASCADE CONSTRAINTS PURGE';
        ELSE
            v_sql := 'DROP ' || p_type || ' ' || v_owner || '.' || p_name;
        END IF;
        EXECUTE IMMEDIATE v_sql;
        DBMS_OUTPUT.PUT_LINE('Dropped ' || p_type || ': ' || v_owner || '.' || p_name);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Skip (not found) ' || p_type || ': ' || v_owner || '.' || p_name);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error dropping ' || p_type || ' ' || v_owner || '.' || p_name || ': ' || SQLERRM);
END;
/

-- ============================================================================
-- 1. Drop Triggers (AP_APPLICATIONS)
-- ============================================================================
EXEC drop_if_exists('TRIGGER', 'D_ENTITIES_BIFER', 'AP_APPLICATIONS');
EXEC drop_if_exists('TRIGGER', 'TRG_D_REFRESH_TOKENS_ID', 'AP_APPLICATIONS');
EXEC drop_if_exists('TRIGGER', 'TRG_D_REFRESH_TOKENS_DATE', 'AP_APPLICATIONS');
EXEC drop_if_exists('TRIGGER', 'T_MAILING_TRG', 'AP_APPLICATIONS');

-- ============================================================================
-- 2. Drop Triggers (AP_LOG)
-- ============================================================================
EXEC drop_if_exists('TRIGGER', 'T_APP_LOG_BIFER', 'AP_LOG');

-- ============================================================================
-- 3. Drop Indexes (non-PK, AP_APPLICATIONS - D_REFRESH_TOKENS)
-- ============================================================================
EXEC drop_if_exists('INDEX', 'IDX_D_REFRESH_TOKENS_ACTIVE', 'AP_APPLICATIONS');
EXEC drop_if_exists('INDEX', 'IDX_D_REFRESH_TOKENS_ENTITY', 'AP_APPLICATIONS');
EXEC drop_if_exists('INDEX', 'IDX_D_REFRESH_TOKENS_EXPIRES', 'AP_APPLICATIONS');
EXEC drop_if_exists('INDEX', 'IDX_D_REFRESH_TOKENS_REVOKED', 'AP_APPLICATIONS');
EXEC drop_if_exists('INDEX', 'IDX_D_REFRESH_TOKENS_USERNAME', 'AP_APPLICATIONS');

-- ============================================================================
-- 4. Drop Tables (AP_APPLICATIONS) - child tables first, then parent tables
-- ============================================================================

-- Child tables (have FK references)
EXEC drop_if_exists('TABLE', 'D_MAILING_LIST_USERS', 'AP_APPLICATIONS');
EXEC drop_if_exists('TABLE', 'D_USER_ROLES', 'AP_APPLICATIONS');
EXEC drop_if_exists('TABLE', 'D_ENTITY_ATTRIBUTES', 'AP_APPLICATIONS');
EXEC drop_if_exists('TABLE', 'D_REFRESH_TOKENS', 'AP_APPLICATIONS');
EXEC drop_if_exists('TABLE', 'T_MAILING', 'AP_APPLICATIONS');

-- Parent tables (referenced by child tables)
EXEC drop_if_exists('TABLE', 'D_MAILING_LISTS', 'AP_APPLICATIONS');
EXEC drop_if_exists('TABLE', 'D_ROLES', 'AP_APPLICATIONS');
EXEC drop_if_exists('TABLE', 'D_USERS', 'AP_APPLICATIONS');
EXEC drop_if_exists('TABLE', 'D_ENTITIES', 'AP_APPLICATIONS');
EXEC drop_if_exists('TABLE', 'D_ENTITY_TYPES', 'AP_APPLICATIONS');
EXEC drop_if_exists('TABLE', 'D_USER_STATUS', 'AP_APPLICATIONS');

-- ============================================================================
-- 5. Drop Tables (AP_LOG) - child tables first
-- ============================================================================
EXEC drop_if_exists('TABLE', 'T_APP_LOG', 'AP_LOG');
EXEC drop_if_exists('TABLE', 'D_LOG_STATUS', 'AP_LOG');

-- ============================================================================
-- 6. Drop Sequences (AP_APPLICATIONS)
-- ============================================================================
EXEC drop_if_exists('SEQUENCE', 'D_ENTITIES_SEQ01', 'AP_APPLICATIONS');
EXEC drop_if_exists('SEQUENCE', 'D_REFRESH_TOKENS_SEQ', 'AP_APPLICATIONS');
EXEC drop_if_exists('SEQUENCE', 'T_MAILING_SEQ', 'AP_APPLICATIONS');

-- ============================================================================
-- 7. Drop Sequences (AP_LOG)
-- ============================================================================
EXEC drop_if_exists('SEQUENCE', 'T_APP_LOG_SEQ01', 'AP_LOG');

-- ============================================================================
-- 8. Cleanup: Drop the helper procedure
-- ============================================================================
DROP PROCEDURE drop_if_exists;

COMMIT;

DBMS_OUTPUT.PUT_LINE('');
DBMS_OUTPUT.PUT_LINE('============================================');
DBMS_OUTPUT.PUT_LINE('Auth-service Oracle cleanup complete.');
DBMS_OUTPUT.PUT_LINE('============================================');
