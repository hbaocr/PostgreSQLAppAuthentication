#!/bin/bash

# Quick Test Script for PostgreSQL Authentication System (Secure Mode)
# This script tests the complete authentication flow with authuser

echo "🚀 PostgreSQL Authentication Quick Test (Secure Mode)"
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
print_status $BLUE "🧪 Testing API Endpoints (Secure Mode)..."

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

echo ""
print_status $GREEN "🎉 Quick test completed!"
echo ""
print_status $BLUE "📊 Test Results Summary:"
echo "   - Health Check: $(echo "$HEALTH_RESPONSE" | grep -q "OK" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - User Signup: $(echo "$SIGNUP_RESPONSE" | grep -q "success.*true" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - User Login: $(echo "$LOGIN_RESPONSE" | grep -q "success.*true" && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - Get User: $(echo "$USER_RESPONSE" | grep -q "success.*true" && echo "✅ PASS" || echo "❌ FAIL")"

echo ""
print_status $YELLOW "🔒 Security Features:"
echo "   - Using dedicated 'authuser' with minimal privileges"
echo "   - Only authentication functions can access userAuth table"
echo "   - User management operations restricted to database administrators"
echo "   - SECURITY DEFINER functions for secure database access"

echo ""
print_status $YELLOW "💡 Next Steps:"
echo "   1. Run comprehensive tests: npm test"
echo "   2. Check the API documentation in README-NODEJS.md"
echo "   3. Use pgAdmin at http://localhost:8080 to view database (as postgres user)"
echo "   4. Database administration requires postgres user credentials"

# Stop the background server if we started it
if [ ! -z "$SERVER_PID" ]; then
    print_status $YELLOW "🛑 Stopping test server..."
    kill $SERVER_PID 2>/dev/null
    print_status $GREEN "✅ Test server stopped"
fi

echo ""
print_status $GREEN "✨ Quick test script completed successfully!"
