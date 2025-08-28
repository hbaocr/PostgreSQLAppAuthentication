# Security Model Documentation

This document explains the security architecture of the PostgreSQL Authentication System.

## 🔐 Security Overview

The system implements a **principle of least privilege** security model with dedicated users and restricted access patterns.

## 👥 User Roles

### 1. `postgres` (Database Administrator)
- **Purpose**: Database administration and management
- **Privileges**: Full database access
- **Usage**: pgAdmin access, database maintenance, schema changes
- **Credentials**: 
  - Username: `postgres`
  - Password: `postgres123`

### 2. `authuser` (Application User)
- **Purpose**: Application authentication operations only
- **Privileges**: Minimal - only execute authentication functions
- **Usage**: Node.js application connections
- **Credentials**:
  - Username: `authuser`
  - Password: `authuser123`

## 🛡️ Security Features

### 1. Function-Level Security
All authentication functions use `SECURITY DEFINER`:
```sql
CREATE OR REPLACE FUNCTION signup(...)
RETURNS BOOLEAN 
SECURITY DEFINER
AS $$
-- Function body
$$ LANGUAGE plpgsql;
```

**Benefits:**
- Functions run with creator's privileges (postgres)
- `authuser` can execute functions but cannot directly access tables
- Prevents privilege escalation attacks

### 2. Minimal Privilege Model
```sql
-- authuser has NO direct table access
REVOKE ALL PRIVILEGES ON TABLE userAuth FROM postgres;
REVOKE ALL PRIVILEGES ON SEQUENCE userauth_userid_seq FROM postgres;

-- Only function execution privileges
GRANT EXECUTE ON FUNCTION signup(...) TO authuser;
GRANT EXECUTE ON FUNCTION authenticate(...) TO authuser;
GRANT EXECUTE ON FUNCTION get_user_details(...) TO authuser;
```

### 3. Restricted Operations
The `authuser` can only:
- ✅ Execute `signup()` function
- ✅ Execute `authenticate()` function  
- ✅ Execute `get_user_details()` function
- ❌ Direct table access (SELECT, INSERT, UPDATE, DELETE)
- ❌ Schema modifications
- ❌ User management operations

## 🔒 Access Control Matrix

| Operation | postgres | authuser | Notes |
|-----------|----------|----------|-------|
| Database Administration | ✅ Full | ❌ None | Schema changes, user management |
| Direct Table Access | ❌ Revoked | ❌ None | No direct table operations |
| Authentication Functions | ✅ Execute | ✅ Execute | Only through functions |
| User Management | ✅ Full | ❌ None | List, delete users |
| pgAdmin Access | ✅ Full | ❌ None | Web interface access |

## 🚨 Security Best Practices Implemented

### 1. Separation of Concerns
- **Administrative operations**: Use `postgres` user
- **Application operations**: Use `authuser` user
- **No shared credentials** between admin and app

### 2. Function-Based Access
- All data access through controlled functions
- No direct SQL queries from application
- Input validation and sanitization in functions

### 3. Password Security
- SHA256 hashing with random salts
- Salt generation using `gen_random_bytes()`
- No plaintext password storage

### 4. Error Handling
- Generic error messages to prevent information leakage
- Detailed logging for administrators only
- Graceful failure handling

## 🔧 Database Administration

### Accessing as Administrator
```bash
# Connect as postgres user
docker exec -it postgres_auth psql -U postgres -d authdb

# Or via pgAdmin at http://localhost:8080
# Login: admin@example.com / admin123
# Add server with postgres credentials
```

### Administrative Operations
```sql
-- List all users (admin only)
SELECT * FROM userAuth;

-- Delete user (admin only)
DELETE FROM userAuth WHERE mail = 'user@example.com';

-- Check function permissions
SELECT routine_name, routine_type, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

## 🚀 Application Security

### Node.js Application
- Connects using `authuser` credentials
- Cannot perform administrative operations
- All operations go through PostgreSQL functions
- Input validation at application level

### API Security
- Input sanitization and validation
- CORS configuration for cross-origin requests
- Error handling without sensitive data exposure
- Request logging for monitoring

## 🔍 Security Monitoring

### Audit Trail
- All authentication attempts logged
- Function execution tracking
- Error logging for security events
- Database connection monitoring

### Health Checks
```bash
# Check application health
curl http://localhost:3000/health

# Check database connectivity
docker exec -it postgres_auth pg_isready -U authuser
```

## 🛠️ Security Configuration

### Environment Variables
```env
# Application user (minimal privileges)
DB_USER=authuser
DB_PASSWORD=authuser123

# Admin user (full privileges) - for pgAdmin
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
```

### Function Permissions
```sql
-- Verify function permissions
SELECT 
    routine_name,
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('signup', 'authenticate', 'get_user_details');
```

## 🚨 Incident Response

### Security Breach Response
1. **Immediate Actions**:
   - Disconnect affected connections
   - Review access logs
   - Check for unauthorized function executions

2. **Investigation**:
   - Audit function execution logs
   - Review user authentication attempts
   - Check for privilege escalation attempts

3. **Recovery**:
   - Reset affected user passwords
   - Review and update function permissions
   - Implement additional security measures

## 📋 Security Checklist

- [ ] `authuser` has no direct table access
- [ ] All functions use `SECURITY DEFINER`
- [ ] `postgres` user privileges revoked from userAuth table
- [ ] Application connects with `authuser` credentials
- [ ] pgAdmin uses `postgres` credentials
- [ ] No plaintext passwords in logs
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive data
- [ ] CORS properly configured
- [ ] Health checks implemented

## 🔗 Related Documentation

- [Docker Setup Guide](SETUP.md)
- [Node.js API Documentation](README-NODEJS.md)
- [PostgreSQL Functions](auth_functions.sql)
- [Database Schema](init.sql)

---

**Security is a continuous process. Regularly review and update security measures.**
