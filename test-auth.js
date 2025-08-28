import { AuthService } from './services/authService.js';
import { testConnection } from './config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test data
const testUsers = [
  { userId: 1, email: 'john.doe@example.com', password: 'password123' },
  { userId: 2, email: 'jane.smith@example.com', password: 'securepass456' },
  { userId: 3, email: 'bob.wilson@example.com', password: 'mypassword789' }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to print colored output
const print = (color, text) => {
  console.log(`${color}${text}${colors.reset}`);
};

// Helper function to print test results
const printResult = (testName, success, details = '') => {
  const status = success ? '✅ PASS' : '❌ FAIL';
  const color = success ? colors.green : colors.red;
  print(color, `${status} - ${testName}`);
  if (details) {
    print(colors.cyan, `   ${details}`);
  }
};

// Test functions
const testDatabaseConnection = async () => {
  print(colors.blue, '\n🔌 Testing Database Connection...');
  try {
    const connected = await testConnection();
    printResult('Database Connection', connected, connected ? 'Successfully connected to PostgreSQL as authuser' : 'Failed to connect');
    return connected;
  } catch (error) {
    printResult('Database Connection', false, error.message);
    return false;
  }
};

const testUserSignup = async () => {
  print(colors.blue, '\n📝 Testing User Signup...');
  
  for (const user of testUsers) {
    try {
      const result = await AuthService.signup(user.userId, user.email, user.password);
      printResult(
        `Signup User ${user.userId}`,
        result.success,
        result.success ? `User ${user.email} created successfully` : result.message
      );
    } catch (error) {
      printResult(`Signup User ${user.userId}`, false, error.message);
    }
  }
};

const testUserAuthentication = async () => {
  print(colors.blue, '\n🔐 Testing User Authentication...');
  
  for (const user of testUsers) {
    try {
      // Test correct password
      const authResult = await AuthService.authenticate(user.email, user.password);
      printResult(
        `Authenticate ${user.email} (correct password)`,
        authResult.success,
        authResult.success ? 'Authentication successful' : authResult.message
      );
      
      // Test wrong password
      const wrongAuthResult = await AuthService.authenticate(user.email, 'wrongpassword');
      printResult(
        `Authenticate ${user.email} (wrong password)`,
        !wrongAuthResult.success,
        wrongAuthResult.success ? 'Unexpectedly authenticated with wrong password' : 'Correctly rejected wrong password'
      );
    } catch (error) {
      printResult(`Authenticate ${user.email}`, false, error.message);
    }
  }
};

const testGetUserDetails = async () => {
  print(colors.blue, '\n👤 Testing Get User Details...');
  
  for (const user of testUsers) {
    try {
      const result = await AuthService.getUserDetails(user.email);
      printResult(
        `Get Details for ${user.email}`,
        result.success,
        result.success ? `User ID: ${result.user.user_id}, Created: ${result.user.created_at}` : result.message
      );
    } catch (error) {
      printResult(`Get Details for ${user.email}`, false, error.message);
    }
  }
};

const testDuplicateSignup = async () => {
  print(colors.blue, '\n🚫 Testing Duplicate Signup Prevention...');
  
  try {
    const duplicateUser = testUsers[0]; // Use first user
    const result = await AuthService.signup(999, duplicateUser.email, 'newpassword');
    printResult(
      'Duplicate Signup Prevention',
      !result.success,
      result.success ? 'Unexpectedly allowed duplicate email' : 'Correctly prevented duplicate email'
    );
  } catch (error) {
    printResult('Duplicate Signup Prevention', false, error.message);
  }
};

const testInvalidInputs = async () => {
  print(colors.blue, '\n⚠️  Testing Invalid Inputs...');
  
  try {
    // Test with empty email
    const result1 = await AuthService.authenticate('', 'password');
    printResult('Empty Email Validation', !result1.success, 'Correctly rejected empty email');
    
    // Test with non-existent email
    const result2 = await AuthService.authenticate('nonexistent@example.com', 'password');
    printResult('Non-existent Email', !result2.success, 'Correctly rejected non-existent email');
    
  } catch (error) {
    printResult('Invalid Inputs Test', false, error.message);
  }
};

// Main test runner
const runAllTests = async () => {
  print(colors.bright + colors.magenta, '🚀 PostgreSQL Authentication Test Suite (Secure Mode)');
  print(colors.cyan, '==============================================================');
  
  try {
    // Test database connection first
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      print(colors.red, '\n❌ Cannot proceed with tests. Database connection failed.');
      return;
    }
    
    // Run all tests
    await testUserSignup();
    await testUserAuthentication();
    await testGetUserDetails();
    await testDuplicateSignup();
    await testInvalidInputs();
    
    print(colors.bright + colors.green, '\n🎉 All tests completed!');
    print(colors.yellow, '💡 Note: User management operations (list/delete) are restricted to database administrators only.');
    
  } catch (error) {
    print(colors.red, `\n💥 Test suite failed with error: ${error.message}`);
  } finally {
    // Exit the process
    process.exit(0);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}
