-- ============================================================================
-- Refresh Tokens Table for Session Management
-- ============================================================================
-- This table stores refresh tokens for JWT-based authentication with session tracking.
-- Each record represents an active user session with device and location metadata.
-- ============================================================================

-- Drop table if exists (for development only - remove in production)
-- DROP TABLE D_REFRESH_TOKENS CASCADE CONSTRAINTS;

-- Create sequence for primary key
CREATE SEQUENCE D_REFRESH_TOKENS_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Create refresh tokens table
CREATE TABLE D_REFRESH_TOKENS (
    -- Primary Key
    ID NUMBER(19) NOT NULL,

    -- Token Information (stored as SHA-256 hash for security)
    TOKEN_HASH VARCHAR2(64) NOT NULL,

    -- User Reference
    USERNAME VARCHAR2(100) NOT NULL,

    -- Application Reference (which app this session is for)
    ENTITY VARCHAR2(100) NOT NULL,

    -- Lifecycle Timestamps
    CREATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    EXPIRES_AT TIMESTAMP NOT NULL,
    LAST_USED_AT TIMESTAMP,
    REVOKED NUMBER(1) DEFAULT 0 NOT NULL, -- 0 = false, 1 = true
    REVOKED_AT TIMESTAMP,

    -- Session Metadata for Security Monitoring
    IP_ADDRESS VARCHAR2(45), -- IPv4: 15 chars max, IPv6: 45 chars max
    USER_AGENT VARCHAR2(500), -- Browser/Device information
    DEVICE_NAME VARCHAR2(255), -- User-friendly device name (optional)
    LOCATION VARCHAR2(255), -- Geographic location (optional)

    -- Audit Fields
    CREATE_USER VARCHAR2(100),
	CREATION_TYPE VARCHAR2(20),

    -- Primary Key Constraint
    CONSTRAINT PK_D_REFRESH_TOKENS PRIMARY KEY (ID),

    -- Unique Constraint on token hash
    CONSTRAINT UK_D_REFRESH_TOKENS_TOKEN UNIQUE (TOKEN_HASH),

    -- Foreign Key to Users table
    CONSTRAINT FK_D_REFRESH_TOKENS_USER FOREIGN KEY (USERNAME)
        REFERENCES D_USERS(USERNAME)
        ON DELETE CASCADE,

    -- Check constraint for REVOKED boolean
    CONSTRAINT CK_D_REFRESH_TOKENS_REVOKED CHECK (REVOKED IN (0, 1))
);

-- Create indexes for performance
CREATE INDEX IDX_D_REFRESH_TOKENS_USERNAME ON D_REFRESH_TOKENS(USERNAME);
CREATE INDEX IDX_D_REFRESH_TOKENS_TOKEN ON D_REFRESH_TOKENS(TOKEN_HASH);
CREATE INDEX IDX_D_REFRESH_TOKENS_EXPIRES ON D_REFRESH_TOKENS(EXPIRES_AT);
CREATE INDEX IDX_D_REFRESH_TOKENS_ENTITY ON D_REFRESH_TOKENS(ENTITY);
CREATE INDEX IDX_D_REFRESH_TOKENS_REVOKED ON D_REFRESH_TOKENS(REVOKED);

-- Composite index for common queries (active sessions for user)
CREATE INDEX IDX_D_REFRESH_TOKENS_ACTIVE ON D_REFRESH_TOKENS(USERNAME, REVOKED, EXPIRES_AT);

-- Create trigger for auto-increment ID
CREATE OR REPLACE TRIGGER TRG_D_REFRESH_TOKENS_ID
    BEFORE INSERT ON D_REFRESH_TOKENS
    FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT D_REFRESH_TOKENS_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

-- Create trigger to automatically set CREATE_DATE if not provided
CREATE OR REPLACE TRIGGER TRG_D_REFRESH_TOKENS_DATE
    BEFORE INSERT ON D_REFRESH_TOKENS
    FOR EACH ROW
BEGIN
    IF :NEW.CREATE_DATE IS NULL THEN
        :NEW.CREATE_DATE := CURRENT_TIMESTAMP;
    END IF;
END;
/

-- Add comments to table and columns for documentation
COMMENT ON TABLE D_REFRESH_TOKENS IS 'Stores refresh tokens for JWT authentication with session management and security monitoring';
COMMENT ON COLUMN D_REFRESH_TOKENS.ID IS 'Primary key - auto-generated';
COMMENT ON COLUMN D_REFRESH_TOKENS.TOKEN_HASH IS 'SHA-256 hash of the refresh token (never store plain token)';
COMMENT ON COLUMN D_REFRESH_TOKENS.USERNAME IS 'Reference to D_USERS table';
COMMENT ON COLUMN D_REFRESH_TOKENS.ENTITY IS 'Application code (e.g., APP001, APP002)';
COMMENT ON COLUMN D_REFRESH_TOKENS.CREATE_DATE IS 'When the session was created';
COMMENT ON COLUMN D_REFRESH_TOKENS.EXPIRES_AT IS 'When the refresh token expires';
COMMENT ON COLUMN D_REFRESH_TOKENS.LAST_USED_AT IS 'Last time this token was used to refresh access token';
COMMENT ON COLUMN D_REFRESH_TOKENS.REVOKED IS 'Whether token has been revoked (0=active, 1=revoked)';
COMMENT ON COLUMN D_REFRESH_TOKENS.REVOKED_AT IS 'When the token was revoked';
COMMENT ON COLUMN D_REFRESH_TOKENS.IP_ADDRESS IS 'IP address of the client (IPv4 or IPv6)';
COMMENT ON COLUMN D_REFRESH_TOKENS.USER_AGENT IS 'Browser/Device user agent string';
COMMENT ON COLUMN D_REFRESH_TOKENS.DEVICE_NAME IS 'User-friendly device name (e.g., "John iPhone")';
COMMENT ON COLUMN D_REFRESH_TOKENS.LOCATION IS 'Geographic location (e.g., "New York, USA")';
COMMENT ON COLUMN D_REFRESH_TOKENS.CREATE_USER IS 'Username who created this session (usually same as USERNAME)';

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON D_REFRESH_TOKENS TO YOUR_APP_USER;
-- GRANT SELECT ON D_REFRESH_TOKENS_SEQ TO YOUR_APP_USER;

COMMIT;
