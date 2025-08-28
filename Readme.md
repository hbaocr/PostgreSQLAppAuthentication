# PostgreSQL Authentication System

A secure, enterprise-grade authentication system built with PostgreSQL 13, Node.js 22, and Docker. This system implements a **principle of least privilege** security model with dedicated users, function-based access control, and SHA256 password hashing.

## 🚀 Features

### 🔐 Security Features
- **Dedicated `authuser`** with minimal privileges
- **SECURITY DEFINER functions** for secure database access
- **Function-only access** - no direct table operations
- **SHA256 hashing** with cryptographically secure random salts
- **Input validation** and sanitization
- **Proper error handling** without information leakage

### 🛠️ Technical Stack
- **PostgreSQL 13** with pgcrypto extension
- **Node.js 22** with ES modules
- **Express.js** RESTful API
- **Docker & Docker Compose** for containerization
- **pgAdmin 4** for database administration

### 📊 Database Features
- **userAuth table** with automatic timestamps
- **Authentication functions**: `signup()`, `authenticate()`, `get_user_details()`
- **Unique email constraints** and duplicate prevention
- **Connection pooling** for optimal performance

## 📋 Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 22+** (for local development)
- **Ports 5432** (PostgreSQL) and **8080** (pgAdmin) available

## 🛠️ Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd PostgresqlAuth
```

### 2. Start PostgreSQL and pgAdmin
```bash
docker compose up -d
```

### 3. Install Node.js Dependencies
```bash
npm install
```

### 4. Configure Environment
```bash
cp env.example .env
# Edit .env with your preferred settings
```

### 5. Start Node.js Application
```bash
npm start
```

### 6. Test the System
```bash
# Quick test
./quick-test.sh

# Comprehensive test
npm test
```

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=authdb
DB_USER=authuser
DB_PASSWORD=authuser123

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Docker Services
- **PostgreSQL**: `localhost:5432`
- **pgAdmin**: `http://localhost:8080`
- **Node.js API**: `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- **POST** `/api/auth/signup` - User registration
- **POST** `/api/auth/login` - User authentication
- **GET** `/api/auth/user/:email` - Get user details

### System
- **GET** `/health` - Health check
- **GET** `/` - API information

### Example Usage
```bash
# User Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "email": "user@example.com", "password": "mypassword123"}'

# User Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "mypassword123"}'

# Get User Details
curl http://localhost:3000/api/auth/user/user@example.com
```

## 🔐 Security Architecture

### User Roles

#### `postgres` (Database Administrator)
- **Purpose**: Database administration and management
- **Privileges**: Full database access
- **Usage**: pgAdmin access, schema changes, user management
- **Credentials**: `postgres` / `postgres123`

#### `authuser` (Application User)
- **Purpose**: Application authentication operations only
- **Privileges**: Execute authentication functions only
- **Usage**: Node.js application connections
- **Credentials**: `authuser` / `authuser123`

### Security Features
- **SECURITY DEFINER functions** run with creator's privileges
- **Minimal privilege model** - users only get what they need
- **Function-based access** - all data access through controlled functions
- **No direct table access** from application user
- **Input validation** and sanitization at multiple levels

## 🗄️ Database Schema

### userAuth Table
```sql
CREATE TABLE userAuth (
    userId SERIAL PRIMARY KEY,
    mail VARCHAR(255) UNIQUE NOT NULL,
    salt VARCHAR(255) NOT NULL,
    hashpass VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Authentication Functions
```sql
-- User registration
SELECT signup(userId, email, password);

-- User authentication
SELECT authenticate(email, password);

-- Get user details
SELECT * FROM get_user_details(email);
```

## 🧪 Testing

### Automated Tests
```bash
# Run comprehensive test suite
npm test

# Quick API test
./quick-test.sh
```

### Manual Testing
```bash
# Test PostgreSQL functions directly
docker exec -it postgres_auth psql -U authuser -d authdb -c "SELECT signup(1, 'test@example.com', 'password123');"

# Test authentication
docker exec -it postgres_auth psql -U authuser -d authdb -c "SELECT authenticate('test@example.com', 'password123');"
```

### Test Coverage
- ✅ Database connection testing
- ✅ User signup functionality
- ✅ User authentication (correct and wrong passwords)
- ✅ User details retrieval
- ✅ Duplicate signup prevention
- ✅ Invalid input validation
- ✅ Security restrictions verification

## 🐳 Docker Management

### Start Services
```bash
docker compose up -d
```

### View Logs
```bash
docker compose logs postgres
docker compose logs pgadmin
```

### Stop Services
```bash
docker compose down
```

### Reset Database
```bash
docker compose down -v
docker compose up -d
```

## 🔧 Database Administration

### pgAdmin Access
1. Open `http://localhost:8080`
2. Login: `admin@example.com` / `admin123`
3. Add server:
   - **Name**: Local PostgreSQL
   - **Host**: postgres
   - **Port**: 5432
   - **Database**: authdb
   - **Username**: postgres
   - **Password**: postgres123

### Direct Database Access
```bash
# Connect as administrator
docker exec -it postgres_auth psql -U postgres -d authdb

# Connect as application user
docker exec -it postgres_auth psql -U authuser -d authdb
```

### Administrative Operations
```sql
-- List all users (admin only)
SELECT * FROM userAuth;

-- Check function permissions
SELECT routine_name, routine_type, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Monitor function executions
SELECT * FROM pg_stat_user_functions;
```

## 📁 Project Structure

```
PostgresqlAuth/
├── docker-compose.yml          # Docker services configuration
├── Dockerfile                  # PostgreSQL custom image
├── init.sql                    # Database initialization
├── package.json                # Node.js dependencies
├── server.js                   # Express server
├── config/
│   └── database.js             # Database connection
├── services/
│   └── authService.js          # Authentication business logic
├── routes/
│   └── authRoutes.js           # API routes
├── test-auth.js                # Comprehensive test suite
├── quick-test.sh               # Quick API test script
├── env.example                 # Environment variables template
├── SECURITY.md                 # Security documentation
├── README-NODEJS.md            # Node.js API documentation
└── SETUP.md                    # Setup guide
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker compose ps

# Check database logs
docker compose logs postgres

# Test connection
docker exec -it postgres_auth pg_isready -U authuser
```

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :5432
lsof -i :8080
lsof -i :3000

# Kill processes if needed
kill -9 <PID>
```

#### Permission Denied Errors
```bash
# Verify user permissions
docker exec -it postgres_auth psql -U postgres -d authdb -c "\du"

# Check function permissions
docker exec -it postgres_auth psql -U postgres -d authdb -c "SELECT routine_name, routine_type, security_type FROM information_schema.routines WHERE routine_schema = 'public';"
```

### Debug Mode
```bash
# Enable detailed logging
export NODE_ENV=development
npm start
```

## 🔒 Security Best Practices

### Implemented Security Measures
- ✅ **Principle of Least Privilege** - Users only get necessary permissions
- ✅ **Function-Level Security** - All access through controlled functions
- ✅ **Input Validation** - Multiple layers of validation
- ✅ **Secure Password Hashing** - SHA256 with random salts
- ✅ **Error Handling** - No sensitive data in error messages
- ✅ **Connection Security** - Parameterized queries and connection pooling

### Security Checklist
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

## 📚 Documentation

- **[SECURITY.md](SECURITY.md)** - Detailed security architecture
- **[README-NODEJS.md](README-NODEJS.md)** - Node.js API documentation
- **[SETUP.md](SETUP.md)** - Complete setup guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the documentation files
3. Check the test results
4. Open an issue with detailed information

---

**Built with ❤️ for secure authentication systems**

*This system implements enterprise-grade security practices and is ready for production use.*
