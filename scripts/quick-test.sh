#!/bin/bash

# Quick Test Script for PostgreSQL Authentication System (Full Features)
# This script tests the complete authentication flow with all user management features

echo "🚀 PostgreSQL Authentication Quick Test (Full Features)"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_status $RED "❌ Node.js is not installed. Please install Node.js 22+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    print_status $RED "❌ Node.js version 22+ is required. Current version: $(node -v)"
    exit 1
fi

print_status $GREEN "✅ Node.js $(node -v) is installed"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status $YELLOW "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_status $RED "❌ Failed to install dependencies"
        exit 1
    fi
else
    print_status $GREEN "✅ Dependencies are already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_status $YELLOW "🔧 Creating .env file from template..."
    cp env.example .env
    print_status $GREEN "✅ .env file created. Please review and update if needed."
else
    print_status $GREEN "✅ .env file exists"
fi

# Check if PostgreSQL is running
print_status $BLUE "🔌 Checking PostgreSQL connection..."
if ! curl -s http://localhost:3000/health &> /dev/null; then
    print_status $YELLOW "⚠️  Node.js server is not running. Starting it..."
    
    # Start the server in background
    npm start &
    SERVER_PID=$!
    
    # Wait for server to start
    print_status $BLUE "⏳ Waiting for server to start..."
    sleep 5
    
    # Check if server started successfully
    if curl -s http://localhost:3000/health &> /dev/null; then
        print_status $GREEN "✅ Server started successfully"
    else
        print_status $RED "❌ Failed to start server"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
else
    print_status $GREEN "✅ Node.js server is already running"
fi

# Test the API endpoints
echo ""
print_status $BLUE "🧪 Testing API Endpoints (Full Features)..."

# Test 1: Health Check
print_status $BLUE "1️⃣ Testing Health Check..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
    print_status $GREEN "   ✅ Health check passed"
else
    print_status $RED "   ❌ Health check failed"
    echo "   Response: $HEALTH_RESPONSE"
fi

# Test 2: User Signup
print_status $BLUE "2️⃣ Testing User Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"userId": 999, "email": "test@example.com", "password": "testpass123"}')

if echo "$SIGNUP_RESPONSE" | grep -q "success.*true"; then
    print_status $GREEN "   ✅ User signup successful"
else
    print_status $RED "   ❌ User signup failed"
    echo "   Response: $SIGNUP_RESPONSE"
fi

# Test 3: User Login
print_status $BLUE "3️⃣ Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "testpass123"}')

if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
    print_status $GREEN "   ✅ User login successful"
else
    print_status $RED "   ❌ User login failed"
    echo "   Response: $LOGIN_RESPONSE"
fi

# Test 4: Get User Details
print_status $BLUE "4️⃣ Testing Get User Details..."
USER_RESPONSE=$(curl -s http://localhost:3000/api/auth/user/test@example.com)

if echo "$USER_RESPONSE" | grep -q "success.*true"; then
    print_status $GREEN "   ✅ Get user details successful"
else
    print_status $RED "   ❌ Get user details failed"
    echo "   Response: $USER_RESPONSE"
fi

# Test 5: Check User Exists
print_status $BLUE "5️⃣ Testing User Exists Check..."
EXISTS_RESPONSE=$(curl -s http://localhost:3000/api/auth/user/test@example.com/exists)

if echo "$EXISTS_RESPONSE" | grep -q "exists.*true"; then
    print_status $GREEN "   ✅ User exists check successful"
else
    print_status $RED "   ❌ User exists check failed"
    echo "   Response: $EXISTS_RESPONSE"
fi

# Test 6: Get All Users
print_status $BLUE "6️⃣ Testing Get All Users..."
USERS_RESPONSE=$(curl -s http://localhost:3000/api/auth/users)

if echo "$USERS_RESPONSE" | grep -q "success.*true"; then
    print_status $GREEN "   ✅ Get all users successful"
else
    print_status $RED "   ❌ Get all users failed"
    echo "   Response: $USERS_RESPONSE"
fi

# Test 7: Change Password
print_status $BLUE "7️⃣ Testing Change Password..."
CHANGE_PASS_RESPONSE=$(curl -s -X PUT http://localhost:3000/api/auth/user/password \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "oldPassword": "testpass123", "newPassword": "newpass456"}')

if echo "$CHANGE_PASS_RESPONSE" | grep -q "success.*true"; then
    print_status $GREEN "   ✅ Change password successful"
    
    # Test login with new password
    NEW_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email": "test@example.com", "password": "newpass456"}')
    
    if echo "$NEW_LOGIN_RESPONSE" | grep -q "success.*true"; then
        print_status $GREEN "   ✅ Login with new password successful"
    else
        print_status $RED "   ❌ Login with new password failed"
    fi
    
    # Change password back
    REVERT_PASS_RESPONSE=$(curl -s -X PUT http://localhost:3000/api/auth/user/password \
        -H "Content-Type: application/json" \
        -d '{"email": "test@example.com", "oldPassword": "newpass456", "newPassword": "testpass123"}')
    
    if echo "$REVERT_PASS_RESPONSE" | grep -q "success.*true"; then
        print_status $GREEN "   ✅ Password reverted successfully"
    else
        print_status $RED "   ❌ Password revert failed"
    fi
else
    print_status $RED "   ❌ Change password failed"
    echo "   Response: $CHANGE_PASS_RESPONSE"
fi

# Test 8: Change Email
print_status $BLUE "8️⃣ Testing Change Email..."
CHANGE_EMAIL_RESPONSE=$(curl -s -X PUT http://localhost:3000/api/auth/user/email \
    -H "Content-Type: application/json" \
    -d '{"oldEmail": "test@example.com", "newEmail": "test.updated@example.com", "password": "testpass123"}')

if echo "$CHANGE_EMAIL_RESPONSE" | grep -q "success.*true"; then
    print_status $GREEN "   ✅ Change email successful"
    
    # Test login with new email
    NEW_EMAIL_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email": "test.updated@example.com", "password": "testpass123"}')
    
    if echo "$NEW_EMAIL_LOGIN_RESPONSE" | grep -q "success.*true"; then
        print_status $GREEN "   ✅ Login with new email successful"
    else
        print_status $RED "   ❌ Login with new email failed"
    fi
    
    # Change email back
    REVERT_EMAIL_RESPONSE=$(curl -s -X PUT http://localhost:3000/api/auth/user/email \
        -H "Content-Type: application/json" \
        -d '{"oldEmail": "test.updated@example.com", "newEmail": "test@example.com", "password": "testpass123"}')
    
    if echo "$REVERT_EMAIL_RESPONSE" | grep -q "success.*true"; then
        print_status $GREEN "   ✅ Email reverted successfully"
    else
        print_status $RED "   ❌ Email revert failed"
    fi
else
    print_status $RED "   ❌ Change email failed"
    echo "   Response: $CHANGE_EMAIL_RESPONSE"
fi

# Test 9: Delete User
print_status $BLUE "9️⃣ Testing Delete User..."
DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:3000/api/auth/user/test@example.com)

if echo "$DELETE_RESPONSE" | grep -q "success.*true"; then
    print_status $GREEN "   ✅ Delete user successful"
    
    # Test that user no longer exists
    DELETE_EXISTS_RESPONSE=$(curl -s http://localhost:3000/api/auth/user/test@example.com/exists)
    
    if echo "$DELETE_EXISTS_RESPONSE" | grep -q "exists.*false"; then
        print_status $GREEN "   ✅ User no longer exists after deletion"
    else
        print_status $RED "   ❌ User still exists after deletion"
    fi
else
    print_status $RED "   ❌ Delete user failed"
    echo "   Response: $DELETE_RESPONSE"
fi

echo ""
print_status $GREEN "🎉 Quick test completed!"

echo ""
print_status $BLUE "📊 Test Results Summary:"
echo "   - Health Check: $(echo "$HEALTH_RESPONSE" | grep -q "OK" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - User Signup: $(echo "$SIGNUP_RESPONSE" | grep -q "success.*true" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - User Login: $(echo "$LOGIN_RESPONSE" | grep -q "success.*true" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - Get User: $(echo "$USER_RESPONSE" | grep -q "success.*true" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - User Exists: $(echo "$EXISTS_RESPONSE" | grep -q "exists.*true" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - Get All Users: $(echo "$USERS_RESPONSE" | grep -q "success.*true" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - Change Password: $(echo "$CHANGE_PASS_RESPONSE" | grep -q "success.*true" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - Change Email: $(echo "$CHANGE_EMAIL_RESPONSE" | grep -q "success.*true" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - Delete User: $(echo "$DELETE_RESPONSE" | grep -q "success.*true" && echo "✅ PASS" || echo "❌ FAIL")"

echo ""
print_status $YELLOW "🔒 Security Features:"
echo "   - Using dedicated 'authuser' with minimal privileges"
echo "   - Only authentication functions can access userAuth table"
echo "   - SECURITY DEFINER functions for secure database access"
echo "   - 32-byte salt generation for enhanced security"
echo "   - Password verification required for sensitive operations"

echo ""
print_status $YELLOW "💡 Next Steps:"
echo "   1. Run comprehensive tests: npm test"
echo "   2. Check the API documentation in docs/api/"
echo "   3. Use pgAdmin at http://localhost:8080 to view database (as postgres user)"
echo "   4. All user management operations are now available through the API"

# Stop the background server if we started it
if [ ! -z "$SERVER_PID" ]; then
    print_status $YELLOW "🛑 Stopping test server..."
    kill $SERVER_PID 2>/dev/null
    print_status $GREEN "✅ Test server stopped"
fi

echo ""
print_status $GREEN "✨ Quick test script completed successfully!"
