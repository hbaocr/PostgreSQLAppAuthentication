# Project Structure Documentation

This document explains the organized folder structure of the PostgreSQL Authentication System.

## 📁 Root Directory Structure

```
PostgresqlAuth/
├── 📄 README.md                    # Main project documentation
├── 📄 .gitignore                   # Git ignore rules
├── 📄 package.json                 # Node.js dependencies and scripts
├── 📄 env.example                  # Environment variables template
├── 📄 server.js                    # Main Express server entry point
├── 📄 docker-compose.yml           # Docker services configuration
│
├── 📁 src/                         # Source code directory
│   ├── 📁 config/                  # Configuration files
│   │   └── 📄 database.js          # Database connection configuration
│   ├── 📁 services/                # Business logic layer
│   │   └── 📄 authService.js       # Authentication service
│   ├── 📁 routes/                  # API route definitions
│   │   └── 📄 authRoutes.js        # Authentication routes
│   ├── 📁 middleware/              # Express middleware
│   │   ├── 📄 errorHandler.js      # Global error handling
│   │   └── 📄 requestLogger.js     # Request logging middleware
│   └── 📁 utils/                   # Utility functions
│       └── 📄 validation.js        # Input validation utilities
│
├── 📁 docs/                        # Documentation directory
│   ├── 📁 api/                     # API documentation
│   │   └── 📄 README-NODEJS.md     # Node.js API documentation
│   ├── 📁 security/                # Security documentation
│   │   └── 📄 SECURITY.md          # Security architecture
│   ├── 📁 setup/                   # Setup documentation
│   │   └── 📄 SETUP.md             # Setup guide
│   └── 📄 PROJECT_STRUCTURE.md     # This file
│
├── 📁 tests/                       # Test files
│   ├── 📁 unit/                    # Unit tests (future)
│   └── 📁 integration/             # Integration tests
│       └── 📄 test-auth.js         # Authentication integration tests
│
├── 📁 scripts/                     # Utility scripts
│   └── 📄 quick-test.sh            # Quick API testing script
│
└── 📁 docker/                      # Docker-related files
    ├── 📁 postgres/                # PostgreSQL Docker files
    │   ├── 📄 Dockerfile           # PostgreSQL custom image
    │   ├── 📄 .dockerignore        # Docker ignore rules
    │   ├── 📄 init.sql             # Database initialization
    │   └── 📄 auth_functions.sql   # Authentication functions
    └── 📁 nodejs/                  # Node.js Docker files (future)
```

## 🏗️ Architecture Overview

### **Source Code (`src/`)**
The `src/` directory contains all the application source code organized by concern:

#### **Configuration (`src/config/`)**
- Database connection settings
- Environment-specific configurations
- Third-party service configurations

#### **Services (`src/services/`)**
- Business logic layer
- Database operations
- External API integrations
- Authentication logic

#### **Routes (`src/routes/`)**
- API endpoint definitions
- Request/response handling
- Input validation
- Route-specific middleware

#### **Middleware (`src/middleware/`)**
- Express middleware functions
- Request processing
- Error handling
- Authentication/authorization

#### **Utils (`src/utils/`)**
- Helper functions
- Validation utilities
- Common utilities
- Shared constants

### **Documentation (`docs/`)**
Organized documentation by topic:

#### **API Documentation (`docs/api/`)**
- API endpoint documentation
- Request/response examples
- Integration guides

#### **Security Documentation (`docs/security/`)**
- Security architecture
- Best practices
- Threat models
- Compliance information

#### **Setup Documentation (`docs/setup/`)**
- Installation guides
- Configuration instructions
- Deployment procedures

### **Testing (`tests/`)**
Organized by test type:

#### **Unit Tests (`tests/unit/`)**
- Individual function tests
- Service layer tests
- Utility function tests

#### **Integration Tests (`tests/integration/`)**
- End-to-end tests
- API endpoint tests
- Database integration tests

### **Scripts (`scripts/`)**
Utility scripts for development and deployment:
- Testing scripts
- Build scripts
- Deployment scripts
- Database management scripts

### **Docker (`docker/`)**
Container-related files organized by service:

#### **PostgreSQL (`docker/postgres/`)**
- Database Dockerfile
- Initialization scripts
- Database functions
- Configuration files

#### **Node.js (`docker/nodejs/`)**
- Application Dockerfile (future)
- Build configurations
- Runtime configurations

## 🔄 File Movement Summary

### **Moved Files:**
- `config/database.js` → `src/config/database.js`
- `services/authService.js` → `src/services/authService.js`
- `routes/authRoutes.js` → `src/routes/authRoutes.js`
- `SECURITY.md` → `docs/security/SECURITY.md`
- `README-NODEJS.md` → `docs/api/README-NODEJS.md`
- `SETUP.md` → `docs/setup/SETUP.md`
- `test-auth.js` → `tests/integration/test-auth.js`
- `quick-test.sh` → `scripts/quick-test.sh`
- `init.sql` → `docker/postgres/init.sql`
- `auth_functions.sql` → `docker/postgres/auth_functions.sql`
- `Dockerfile` → `docker/postgres/Dockerfile`
- `.dockerignore` → `docker/postgres/.dockerignore`

### **New Files Created:**
- `src/middleware/errorHandler.js` - Centralized error handling
- `src/middleware/requestLogger.js` - Request logging middleware
- `src/utils/validation.js` - Input validation utilities
- `docs/PROJECT_STRUCTURE.md` - This documentation file

## 📝 Benefits of This Structure

### **1. Separation of Concerns**
- Clear separation between different types of code
- Easy to locate specific functionality
- Reduced coupling between components

### **2. Scalability**
- Easy to add new features without affecting existing code
- Clear structure for new developers
- Modular architecture supports growth

### **3. Maintainability**
- Organized documentation by topic
- Clear file naming conventions
- Logical grouping of related files

### **4. Testing**
- Dedicated test directories
- Clear separation between unit and integration tests
- Easy to run specific test suites

### **5. Deployment**
- Docker files organized by service
- Clear separation of concerns for containerization
- Easy to manage different environments

## 🚀 Usage Guidelines

### **Adding New Features:**
1. **Services**: Add business logic to `src/services/`
2. **Routes**: Add API endpoints to `src/routes/`
3. **Middleware**: Add Express middleware to `src/middleware/`
4. **Utils**: Add helper functions to `src/utils/`
5. **Tests**: Add corresponding tests to `tests/`

### **Adding New Documentation:**
1. **API**: Add to `docs/api/`
2. **Security**: Add to `docs/security/`
3. **Setup**: Add to `docs/setup/`

### **Adding New Scripts:**
1. **Development**: Add to `scripts/`
2. **Docker**: Add to appropriate `docker/` subdirectory

## 🔧 Configuration Updates

### **Import Paths:**
All import paths have been updated to reflect the new structure:
- `./config/database.js` → `./src/config/database.js`
- `./services/authService.js` → `./src/services/authService.js`
- `./routes/authRoutes.js` → `./src/routes/authRoutes.js`

### **Docker Configuration:**
- Updated `docker-compose.yml` to use new file paths
- PostgreSQL initialization script moved to `docker/postgres/`

### **Package.json:**
- Updated test script path to `tests/integration/test-auth.js`

This structure provides a clean, maintainable, and scalable foundation for the PostgreSQL Authentication System.
