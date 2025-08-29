# PostgreSQL Authentication Security Model

## 🔒 Security Overview

This document outlines the comprehensive security model implemented in the PostgreSQL authentication system. The model follows the principle of **least privilege** and **defense in depth**.

## 👥 User Roles & Permissions

### 1. **postgres User (ADMIN)**
- **Role**: Database superuser and owner
- **Permissions**: Full access to everything
  - All tables: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, `TRIGGER`
  - All sequences: `USAGE`, `SELECT`, `UPDATE`
  - All functions: `EXECUTE`
  - Schema: `CREATE`, `USAGE`
- **Purpose**: Database administration, maintenance, and emergency access

### 2. **authuser (APPLICATION USER)**
- **Role**: Application authentication user
- **Permissions**: **ONLY** function execution
  - **NO direct table access**
  - **NO direct sequence access**
  - **NO schema modification rights**
- **Purpose**: Execute authentication functions through the application

## 🛡️ Security Architecture

### **SECURITY DEFINER Pattern**
All authentication functions use `SECURITY DEFINER`, which means:
- Functions execute with the **creator's privileges** (postgres user)
- `authuser` can execute functions but cannot access underlying data directly
- Functions act as a **security boundary** between the application and database

### **Function-Based Access Control**
- Application can only interact with data through predefined functions
- No direct SQL queries allowed from the application layer
- All data access is controlled and auditable

## 📊 Index Strategy for Performance

### **Critical Indexes**
1. **`idx_userauth_mail`** - Primary index on email column
   - **Purpose**: Optimize all email-based queries (authentication, user lookup, etc.)
   - **Type**: B-tree index (default, optimal for equality and range queries)
   - **Impact**: Dramatically improves performance of mail-based operations

2. **`idx_userauth_created_at`** - Timestamp index
   - **Purpose**: Optimize user listing and reporting queries
   - **Type**: B-tree index for chronological ordering

3. **`idx_userauth_updated_at`** - Timestamp index
   - **Purpose**: Optimize audit and maintenance queries
   - **Type**: B-tree index for chronological ordering

### **Index Performance Benefits**
- **Authentication queries**: Sub-millisecond response times
- **User existence checks**: Near-instantaneous results
- **Email change operations**: Fast duplicate detection
- **User listing**: Efficient sorting and pagination

## 🔐 Permission Matrix

| Resource | postgres | authuser | Notes |
|----------|----------|----------|-------|
| `userAuth` table | Full access | ❌ No access | authuser only via functions |
| `userauth_userid_seq` | Full access | ❌ No access | authuser only via functions |
| Authentication functions | ❌ No execute | ✅ Execute | SECURITY DEFINER |
| Index functions | ✅ Execute | ✅ Execute | For monitoring |
| Schema modification | ✅ Full access | ❌ No access | Admin only |

## 🚫 Security Restrictions

### **authuser Cannot:**
- Directly read from `userAuth` table
- Directly write to `userAuth` table
- Access database system catalogs
- Create or modify database objects
- Execute arbitrary SQL statements

### **authuser Can:**
- Execute predefined authentication functions
- Check index status and performance
- Perform user management operations through functions
- Access only the data returned by functions

## ✅ Security Benefits

1. **Data Protection**: Application users cannot directly access sensitive data
2. **Audit Trail**: All data access is logged through function execution
3. **SQL Injection Prevention**: No dynamic SQL execution from application
4. **Performance**: Optimized indexes ensure fast query execution
5. **Maintainability**: Centralized security logic in database functions
6. **Compliance**: Meets security requirements for sensitive applications

## 🔍 Security Verification

### **Testing Direct Access (Should Fail)**
```sql
-- Connect as authuser
\c authdb authuser

-- These should fail:
SELECT * FROM userAuth;  -- ❌ Permission denied
INSERT INTO userAuth VALUES (...);  -- ❌ Permission denied
UPDATE userAuth SET ...;  -- ❌ Permission denied
DELETE FROM userAuth;  -- ❌ Permission denied
```

### **Testing Function Access (Should Succeed)**
```sql
-- Connect as authuser
\c authdb authuser

-- These should succeed:
SELECT authenticate('user@example.com', 'password');  -- ✅ Works
SELECT get_user_details('user@example.com');  -- ✅ Works
SELECT user_exists('user@example.com');  -- ✅ Works
```

### **Testing Admin Access (Should Succeed)**
```sql
-- Connect as postgres
\c authdb postgres

-- These should succeed:
SELECT * FROM userAuth;  -- ✅ Works
INSERT INTO userAuth VALUES (...);  -- ✅ Works
SELECT ensure_indexes();  -- ✅ Works
```

## 🚨 Security Best Practices

1. **Regular Audits**: Monitor function execution logs
2. **Index Maintenance**: Regularly check index performance
3. **Password Policies**: Enforce strong password requirements
4. **Connection Security**: Use SSL/TLS for database connections
5. **Function Updates**: Regularly review and update security functions
6. **Backup Security**: Secure database backups with encryption

## 📈 Performance Monitoring

### **Index Health Checks**
```sql
-- Check index usage statistics
SELECT * FROM get_index_info();

-- Test index performance
SELECT * FROM test_index_performance('test@example.com');

-- Ensure indexes exist
SELECT ensure_indexes();
```

### **Performance Metrics**
- **Query Response Time**: Should be < 10ms for indexed queries
- **Index Hit Ratio**: Should be > 95% for mail-based queries
- **Function Execution Time**: Should be < 50ms for most operations

## 🔧 Troubleshooting

### **Common Issues**
1. **Permission Denied**: Check if authuser has execute permissions on functions
2. **Slow Queries**: Verify indexes exist and are being used
3. **Function Errors**: Check if SECURITY DEFINER is properly set
4. **Connection Issues**: Verify database connection parameters

### **Recovery Procedures**
1. **Recreate Indexes**: Run `SELECT ensure_indexes();`
2. **Fix Permissions**: Re-run permission grants
3. **Verify Functions**: Check function definitions and security settings

---

**Last Updated**: August 29, 2025  
**Version**: 2.0  
**Security Level**: Production Ready
