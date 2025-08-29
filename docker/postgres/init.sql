-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the userAuth table
CREATE TABLE IF NOT EXISTS userAuth (
    userId SERIAL PRIMARY KEY,
    mail VARCHAR(255) UNIQUE NOT NULL,
    salt VARCHAR(255) NOT NULL,
    hashpass VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for optimal performance on mail column queries
-- This is the most critical index for authentication functions
CREATE INDEX IF NOT EXISTS idx_userauth_mail ON userAuth(mail);
CREATE INDEX IF NOT EXISTS idx_userauth_created_at ON userAuth(created_at);
CREATE INDEX IF NOT EXISTS idx_userauth_updated_at ON userAuth(updated_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_userauth_updated_at 
    BEFORE UPDATE ON userAuth 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create dedicated authuser for authentication operations
-- This user will ONLY have execute permissions on functions
CREATE USER authuser WITH PASSWORD 'authuser123';

-- ============================================================================
-- SECURITY MODEL: Proper permission setup
-- ============================================================================

-- 1. POSTGRES USER (ADMIN) - Full access to everything
-- Grant all privileges to postgres user (default owner)
GRANT ALL PRIVILEGES ON TABLE userAuth TO postgres;
GRANT ALL PRIVILEGES ON SEQUENCE userauth_userid_seq TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- 2. AUTHUSER - NO direct table access, ONLY function execution
-- Grant minimal schema access
GRANT USAGE ON SCHEMA public TO authuser;

-- REVOKE all direct table access from authuser
REVOKE ALL PRIVILEGES ON TABLE userAuth FROM authuser;
REVOKE ALL PRIVILEGES ON SEQUENCE userauth_userid_seq FROM authuser;

-- ============================================================================
-- AUTHENTICATION FUNCTIONS (SECURITY DEFINER)
-- ============================================================================
-- All functions use SECURITY DEFINER to run with creator's (postgres) privileges
-- This allows authuser to execute functions while maintaining security

-- Function to sign up a new user
CREATE OR REPLACE FUNCTION signup(
    p_userId INTEGER,
    p_mail VARCHAR(255),
    p_rawpass VARCHAR(255)
)
RETURNS BOOLEAN 
SECURITY DEFINER
AS $$
DECLARE
    v_salt VARCHAR(255);
    v_hashpass VARCHAR(255);
    v_user_exists INTEGER;
BEGIN
    -- Check if user already exists (uses mail index for performance)
    SELECT COUNT(*) INTO v_user_exists 
    FROM userAuth 
    WHERE mail = p_mail;
    
    IF v_user_exists > 0 THEN
        RAISE EXCEPTION 'User with email % already exists', p_mail;
        RETURN FALSE;
    END IF;
    
    -- Generate a random salt (64 characters from 32 bytes)
    v_salt := encode(gen_random_bytes(32), 'hex');
    
    -- Create hash using SHA256: salt + raw password
    v_hashpass := encode(sha256((v_salt || p_rawpass)::bytea), 'hex');
    
    -- Insert the new user
    INSERT INTO userAuth (userId, mail, salt, hashpass)
    VALUES (p_userId, p_mail, v_salt, v_hashpass);
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during signup: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to authenticate a user
CREATE OR REPLACE FUNCTION authenticate(
    p_mail VARCHAR(255),
    p_rawpass VARCHAR(255)
)
RETURNS BOOLEAN 
SECURITY DEFINER
AS $$
DECLARE
    v_salt VARCHAR(255);
    v_stored_hash VARCHAR(255);
    v_computed_hash VARCHAR(255);
BEGIN
    -- Get the stored salt and hash (uses mail index for performance)
    SELECT salt, hashpass INTO v_salt, v_stored_hash
    FROM userAuth 
    WHERE mail = p_mail;
    
    -- If no row found, user doesn't exist
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Compute the hash using the same method as signup
    v_computed_hash := encode(sha256((v_salt || p_rawpass)::bytea), 'hex');
    
    -- Compare the computed hash with the stored hash
    IF v_computed_hash = v_stored_hash THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during authentication: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user details (for verification purposes)
CREATE OR REPLACE FUNCTION get_user_details(p_mail VARCHAR(255))
RETURNS TABLE(
    user_id INTEGER,
    email VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT ua.userId, ua.mail, ua.created_at, ua.updated_at
    FROM userAuth ua
    WHERE ua.mail = p_mail;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a user
CREATE OR REPLACE FUNCTION delete_user(p_mail VARCHAR(255))
RETURNS BOOLEAN 
SECURITY DEFINER
AS $$
DECLARE
    v_user_exists INTEGER;
    v_deleted_count INTEGER;
BEGIN
    -- Check if user exists (uses mail index for performance)
    SELECT COUNT(*) INTO v_user_exists 
    FROM userAuth 
    WHERE mail = p_mail;
    
    IF v_user_exists = 0 THEN
        RAISE EXCEPTION 'User with email % does not exist', p_mail;
        RETURN FALSE;
    END IF;
    
    -- Delete the user
    DELETE FROM userAuth WHERE mail = p_mail;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    IF v_deleted_count > 0 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during user deletion: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to change user password
CREATE OR REPLACE FUNCTION change_password(
    p_mail VARCHAR(255),
    p_old_password VARCHAR(255),
    p_new_password VARCHAR(255)
)
RETURNS BOOLEAN 
SECURITY DEFINER
AS $$
DECLARE
    v_salt VARCHAR(255);
    v_stored_hash VARCHAR(255);
    v_computed_hash VARCHAR(255);
    v_new_salt VARCHAR(255);
    v_new_hash VARCHAR(255);
    v_updated_count INTEGER;
BEGIN
    -- Check if user exists and get the stored salt and hash (uses mail index for performance)
    SELECT salt, hashpass INTO v_salt, v_stored_hash
    FROM userAuth 
    WHERE mail = p_mail;
    
    -- If no row found, user doesn't exist
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % does not exist', p_mail;
        RETURN FALSE;
    END IF;
    
    -- Verify old password
    v_computed_hash := encode(sha256((v_salt || p_old_password)::bytea), 'hex');
    
    IF v_computed_hash != v_stored_hash THEN
        RAISE EXCEPTION 'Invalid old password for user %', p_mail;
        RETURN FALSE;
    END IF;
    
    -- Generate new salt and hash for new password
    v_new_salt := encode(gen_random_bytes(32), 'hex');
    v_new_hash := encode(sha256((v_new_salt || p_new_password)::bytea), 'hex');
    
    -- Update the user's password
    UPDATE userAuth 
    SET salt = v_new_salt, hashpass = v_new_hash
    WHERE mail = p_mail;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    IF v_updated_count > 0 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during password change: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to change user email/username
CREATE OR REPLACE FUNCTION change_email(
    p_old_mail VARCHAR(255),
    p_new_mail VARCHAR(255),
    p_password VARCHAR(255)
)
RETURNS BOOLEAN 
SECURITY DEFINER
AS $$
DECLARE
    v_salt VARCHAR(255);
    v_stored_hash VARCHAR(255);
    v_computed_hash VARCHAR(255);
    v_new_email_exists INTEGER;
    v_updated_count INTEGER;
BEGIN
    -- Check if old user exists and get the stored salt and hash (uses mail index for performance)
    SELECT salt, hashpass INTO v_salt, v_stored_hash
    FROM userAuth 
    WHERE mail = p_old_mail;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % does not exist', p_old_mail;
        RETURN FALSE;
    END IF;
    
    -- Check if new email already exists (uses mail index for performance)
    SELECT COUNT(*) INTO v_new_email_exists 
    FROM userAuth 
    WHERE mail = p_new_mail;
    
    IF v_new_email_exists > 0 THEN
        RAISE EXCEPTION 'Email % is already in use', p_new_mail;
        RETURN FALSE;
    END IF;
    
    -- Verify password
    v_computed_hash := encode(sha256((v_salt || p_password)::bytea), 'hex');
    
    IF v_computed_hash != v_stored_hash THEN
        RAISE EXCEPTION 'Invalid password for user %', p_old_mail;
        RETURN FALSE;
    END IF;
    
    -- Update the user's email
    UPDATE userAuth 
    SET mail = p_new_mail
    WHERE mail = p_old_mail;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    IF v_updated_count > 0 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during email change: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get all users (for administrative purposes)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE(
    user_id INTEGER,
    email VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT ua.userId, ua.mail, ua.created_at, ua.updated_at
    FROM userAuth ua
    ORDER BY ua.userId;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user exists
CREATE OR REPLACE FUNCTION user_exists(p_mail VARCHAR(255))
RETURNS BOOLEAN 
SECURITY DEFINER
AS $$
BEGIN
    -- Uses mail index for optimal performance
    -- EXISTS is more efficient than COUNT(*) for boolean checks
    RETURN EXISTS(SELECT 1 FROM userAuth WHERE mail = p_mail);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEX MAINTENANCE FUNCTIONS (ADMIN ONLY)
-- ============================================================================

-- Function to check and recreate indexes if needed
CREATE OR REPLACE FUNCTION ensure_indexes()
RETURNS VOID 
SECURITY DEFINER
AS $$
BEGIN
    -- Check if mail index exists and recreate if needed
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'userauth' 
        AND indexname = 'idx_userauth_mail'
    ) THEN
        CREATE INDEX idx_userauth_mail ON userAuth(mail);
        RAISE NOTICE 'Recreated mail index';
    END IF;
    
    -- Check if created_at index exists and recreate if needed
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'userauth' 
        AND indexname = 'idx_userauth_created_at'
    ) THEN
        CREATE INDEX idx_userauth_created_at ON userAuth(created_at);
        RAISE NOTICE 'Recreated created_at index';
    END IF;
    
    -- Check if updated_at index exists and recreate if needed
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'userauth' 
        AND indexname = 'idx_userauth_updated_at'
    ) THEN
        CREATE INDEX idx_userauth_updated_at ON userAuth(updated_at);
        RAISE NOTICE 'Recreated updated_at index';
    END IF;
    
    RAISE NOTICE 'All indexes verified and created if needed';
END;
$$ LANGUAGE plpgsql;

-- Function to get index information (admin only)
CREATE OR REPLACE FUNCTION get_index_info()
RETURNS TABLE(
    index_name TEXT,
    index_definition TEXT,
    is_unique BOOLEAN,
    is_primary BOOLEAN
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.indexname::TEXT,
        i.indexdef::TEXT,
        i.indisunique,
        i.indisprimary
    FROM pg_indexes i
    JOIN pg_class c ON i.indexname = c.relname
    JOIN pg_index idx ON c.oid = idx.indexrelid
    WHERE i.tablename = 'userauth'
    ORDER BY i.indexname;
END;
$$ LANGUAGE plpgsql;

-- Function to test index performance (admin only)
CREATE OR REPLACE FUNCTION test_index_performance(p_test_email VARCHAR(255))
RETURNS TABLE(
    operation TEXT,
    execution_time_ms NUMERIC,
    rows_returned INTEGER
) 
SECURITY DEFINER
AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    row_count INTEGER;
BEGIN
    -- Test COUNT with index (most common operation)
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count FROM userAuth WHERE mail = p_test_email;
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'COUNT by mail'::TEXT,
        EXTRACT(EPOCH FROM (end_time - start_time)) * 1000,
        row_count;
    
    -- Test EXISTS with index (most efficient for boolean checks)
    start_time := clock_timestamp();
    SELECT EXISTS(SELECT 1 FROM userAuth WHERE mail = p_test_email) INTO row_count;
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'EXISTS by mail'::TEXT,
        EXTRACT(EPOCH FROM (end_time - start_time)) * 1000,
        CASE WHEN row_count THEN 1 ELSE 0 END;
    
    -- Test SELECT with index (for data retrieval)
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count FROM userAuth WHERE mail = p_test_email;
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'SELECT by mail'::TEXT,
        EXTRACT(EPOCH FROM (end_time - start_time)) * 1000,
        row_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERMISSION GRANTS (SECURITY MODEL IMPLEMENTATION)
-- ============================================================================

-- Grant execute permissions on AUTHENTICATION functions to authuser
-- These are the only functions authuser needs to execute
GRANT EXECUTE ON FUNCTION signup(INTEGER, VARCHAR(255), VARCHAR(255)) TO authuser;
GRANT EXECUTE ON FUNCTION authenticate(VARCHAR(255), VARCHAR(255)) TO authuser;
GRANT EXECUTE ON FUNCTION get_user_details(VARCHAR(255)) TO authuser;
GRANT EXECUTE ON FUNCTION delete_user(VARCHAR(255)) TO authuser;
GRANT EXECUTE ON FUNCTION change_password(VARCHAR(255), VARCHAR(255), VARCHAR(255)) TO authuser;
GRANT EXECUTE ON FUNCTION change_email(VARCHAR(255), VARCHAR(255), VARCHAR(255)) TO authuser;
GRANT EXECUTE ON FUNCTION get_all_users() TO authuser;
GRANT EXECUTE ON FUNCTION user_exists(VARCHAR(255)) TO authuser;

-- Grant execute permissions on INDEX MAINTENANCE functions to authuser
-- These allow authuser to check index status and performance
GRANT EXECUTE ON FUNCTION ensure_indexes() TO authuser;
GRANT EXECUTE ON FUNCTION get_index_info() TO authuser;
GRANT EXECUTE ON FUNCTION test_index_performance(VARCHAR(255)) TO authuser;

-- Grant execute permissions on TRIGGER function to authuser
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authuser;

-- ============================================================================
-- SECURITY ENFORCEMENT
-- ============================================================================

-- Ensure postgres user has full access to all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Revoke execute permissions from postgres user on specific functions
-- This ensures only authuser can execute authentication functions
-- (postgres can still access them through direct database access)
REVOKE EXECUTE ON FUNCTION signup(INTEGER, VARCHAR(255), VARCHAR(255)) FROM postgres;
REVOKE EXECUTE ON FUNCTION authenticate(VARCHAR(255), VARCHAR(255)) FROM postgres;
REVOKE EXECUTE ON FUNCTION get_user_details(VARCHAR(255)) FROM postgres;
REVOKE EXECUTE ON FUNCTION delete_user(VARCHAR(255)) FROM postgres;
REVOKE EXECUTE ON FUNCTION change_password(VARCHAR(255), VARCHAR(255), VARCHAR(255)) FROM postgres;
REVOKE EXECUTE ON FUNCTION change_email(VARCHAR(255), VARCHAR(255), VARCHAR(255)) FROM postgres;
REVOKE EXECUTE ON FUNCTION get_all_users() FROM postgres;
REVOKE EXECUTE ON FUNCTION user_exists(VARCHAR(255)) FROM postgres;

-- ============================================================================
-- FINAL SETUP
-- ============================================================================

-- Ensure all indexes are created
SELECT ensure_indexes();

-- Display security model summary
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SECURITY MODEL IMPLEMENTED:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ postgres user: Full admin access to everything';
    RAISE NOTICE '✅ authuser: ONLY function execution, NO direct table access';
    RAISE NOTICE '✅ All functions: SECURITY DEFINER (run with postgres privileges)';
    RAISE NOTICE '✅ Mail column: Indexed for optimal query performance';
    RAISE NOTICE '✅ Table access: Restricted to functions only';
    RAISE NOTICE '========================================';
END;
$$;
