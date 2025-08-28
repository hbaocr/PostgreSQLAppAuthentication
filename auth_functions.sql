-- Authentication functions using SHA256 (not PostgreSQL crypt)
-- These functions handle user signup and authentication
-- SECURITY DEFINER ensures functions run with creator's privileges

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
    -- Check if user already exists
    SELECT COUNT(*) INTO v_user_exists 
    FROM userAuth 
    WHERE mail = p_mail;
    
    IF v_user_exists > 0 THEN
        RAISE EXCEPTION 'User with email % already exists', p_mail;
        RETURN FALSE;
    END IF;
    
    -- Generate a random salt (32 characters)
    v_salt := encode(gen_random_bytes(16), 'hex');
    
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
    v_user_exists INTEGER;
BEGIN
    -- Check if user exists
    SELECT COUNT(*) INTO v_user_exists 
    FROM userAuth 
    WHERE mail = p_mail;
    
    IF v_user_exists = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Get the stored salt and hash
    SELECT salt, hashpass INTO v_salt, v_stored_hash
    FROM userAuth 
    WHERE mail = p_mail;
    
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

-- Grant execute permissions on functions to authuser only
GRANT EXECUTE ON FUNCTION signup(INTEGER, VARCHAR(255), VARCHAR(255)) TO authuser;
GRANT EXECUTE ON FUNCTION authenticate(VARCHAR(255), VARCHAR(255)) TO authuser;
GRANT EXECUTE ON FUNCTION get_user_details(VARCHAR(255)) TO authuser;

-- Revoke execute permissions from postgres user
REVOKE EXECUTE ON FUNCTION signup(INTEGER, VARCHAR(255), VARCHAR(255)) FROM postgres;
REVOKE EXECUTE ON FUNCTION authenticate(VARCHAR(255), VARCHAR(255)) FROM postgres;
REVOKE EXECUTE ON FUNCTION get_user_details(VARCHAR(255)) FROM postgres;
