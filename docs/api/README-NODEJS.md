# Node.js 22 PostgreSQL Authentication API

A complete Node.js 22 application that tests the PostgreSQL authentication functions with a RESTful API.

## 🚀 Features

- **Node.js 22** with ES modules
- **Express.js** web framework
- **PostgreSQL** database integration
- **RESTful API** endpoints for authentication
- **Input validation** and error handling
- **Comprehensive testing** suite
- **Health check** endpoints
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

- **Node.js 22+** installed
- **PostgreSQL 13** running (via Docker Compose from the main setup)
- **npm** or **yarn** package manager

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=authdb
   DB_USER=postgres
   DB_PASSWORD=postgres123
   PORT=3000
   NODE_ENV=development
   ```

## 🚀 Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Run Tests
```bash
npm test
```

## 📡 API Endpoints

### Health Check
- **GET** `/health` - Check server and database status

### Authentication
- **POST** `/api/auth/signup` - User registration
- **POST** `/api/auth/login` - User authentication
- **GET** `/api/auth/user/:email` - Get user details
- **GET** `/api/auth/users` - Get all users
- **DELETE** `/api/auth/user/:email` - Delete user

## 🔧 API Usage Examples

### 1. User Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "email": "user@example.com",
    "password": "mypassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User signed up successfully",
  "userId": 1,
  "email": "user@example.com"
}
```

### 2. User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "mypassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "email": "user@example.com"
}
```

### 3. Get User Details
```bash
curl http://localhost:3000/api/auth/user/user@example.com
```

**Response:**
```json
{
  "success": true,
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Get All Users
```bash
curl http://localhost:3000/api/auth/users
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "userid": 1,
      "mail": "user@example.com",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

### 5. Delete User
```bash
curl -X DELETE http://localhost:3000/api/auth/user/user@example.com
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "deletedUserId": 1
}
```

## 🧪 Testing

### Automated Test Suite
Run the comprehensive test suite:
```bash
npm test
```

The test suite includes:
- ✅ Database connection testing
- ✅ User signup functionality
- ✅ User authentication (correct and wrong passwords)
- ✅ User details retrieval
- ✅ All users listing
- ✅ Duplicate signup prevention
- ✅ Invalid input validation
- ✅ Data cleanup

### Manual Testing with cURL
You can also test manually using the cURL examples above or use tools like:
- **Postman**
- **Insomnia**
- **Thunder Client** (VS Code extension)

## 🏗️ Project Structure

```
├── config/
│   └── database.js          # Database connection and configuration
├── services/
│   └── authService.js       # Business logic for authentication
├── routes/
│   └── authRoutes.js        # API route definitions
├── server.js                # Main Express server
├── test-auth.js             # Standalone test suite
├── package.json             # Dependencies and scripts
├── env.example              # Environment variables template
└── README-NODEJS.md         # This file
```

## 🔍 Database Integration

The application integrates with your PostgreSQL database using:
- **pg** library for PostgreSQL connections
- **Connection pooling** for optimal performance
- **Prepared statements** for security
- **Error handling** for database operations

## 🚨 Error Handling

The API includes comprehensive error handling:
- **Input validation** for all endpoints
- **Database error** handling
- **HTTP status codes** for different error types
- **Detailed error messages** in development mode
- **Graceful fallbacks** for unexpected errors

## 🔒 Security Features

- **Input sanitization** and validation
- **SQL injection prevention** with parameterized queries
- **CORS configuration** for cross-origin requests
- **Environment variable** management
- **No sensitive data** in error responses (production mode)

## 🐳 Docker Integration

This Node.js application works seamlessly with the Docker setup:
1. Start PostgreSQL with `docker-compose up -d`
2. Run the Node.js app with `npm start`
3. Test the complete authentication flow

## 📊 Monitoring

### Health Check Endpoint
Monitor your application health:
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "Connected",
  "uptime": 123.45
}
```

### Logging
The application includes comprehensive logging:
- Request logging with timestamps
- Database connection events
- Error logging with stack traces
- Authentication attempts

## 🚀 Performance Features

- **Connection pooling** for database efficiency
- **Async/await** for non-blocking operations
- **Request logging** for monitoring
- **Graceful shutdown** handling
- **Memory-efficient** operations

## 🔧 Customization

### Adding New Endpoints
1. Create new routes in `routes/authRoutes.js`
2. Add corresponding service methods in `services/authService.js`
3. Update the main server file if needed

### Database Schema Changes
1. Modify the PostgreSQL functions in `auth_functions.sql`
2. Update the Docker setup
3. Adjust the Node.js service layer accordingly

### Environment Configuration
- Modify `.env` file for different environments
- Add new environment variables as needed
- Update `config/database.js` for new database settings

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running: `docker-compose ps`
   - Check database credentials in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes: `lsof -ti:3000 | xargs kill`

3. **Module Import Errors**
   - Ensure Node.js 22+ is installed
   - Check `"type": "module"` in package.json
   - Use `.js` extensions in imports

4. **Authentication Failures**
   - Verify PostgreSQL functions are created
   - Check database logs: `docker-compose logs postgres`
   - Test functions directly in database

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Node.js PostgreSQL](https://node-postgres.com/)
- [PostgreSQL Functions](https://www.postgresql.org/docs/13/sql-createfunction.html)
- [Docker Compose](https://docs.docker.com/compose/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy coding! 🎉**
