import { AuthService } from '../../src/services/authService.js';
import { testConnection } from '../../src/config/database.js';
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

const testUserExists = async () => {
  print(colors.blue, '\n🔍 Testing User Exists Check...');
  
  for (const user of testUsers) {
    try {
      const result = await AuthService.userExists(user.email);
      printResult(
        `User Exists Check for ${user.email}`,
        result.success && result.exists,
        result.success ? `User exists: ${result.exists}` : result.message
      );
    } catch (error) {
      printResult(`User Exists Check for ${user.email}`, false, error.message);
    }
  }
  
  // Test non-existent user
  try {
    const result = await AuthService.userExists('nonexistent@example.com');
    printResult(
      'User Exists Check for non-existent user',
      result.success && !result.exists,
      result.success ? `User exists: ${result.exists}` : result.message
    );
  } catch (error) {
    printResult('User Exists Check for non-existent user', false, error.message);
  }
};

const testGetAllUsers = async () => {
  print(colors.blue, '\n📋 Testing Get All Users...');
  
  try {
    const result = await AuthService.getAllUsers();
    printResult(
      'Get All Users',
      result.success,
      result.success ? `Found ${result.count} users` : result.message
    );
    
    if (result.success && result.users.length > 0) {
      print(colors.cyan, '   Users found:');
      result.users.forEach(user => {
        print(colors.cyan, `   - ${user.email} (ID: ${user.user_id})`);
      });
    }
  } catch (error) {
    printResult('Get All Users', false, error.message);
  }
};

const testChangePassword = async () => {
  print(colors.blue, '\n🔑 Testing Change Password...');
  
  const testUser = testUsers[0]; // Use first user
  const newPassword = 'newpassword123';
  
  try {
    // Change password
    const changeResult = await AuthService.changePassword(testUser.email, testUser.password, newPassword);
    printResult(
      `Change Password for ${testUser.email}`,
      changeResult.success,
      changeResult.success ? 'Password changed successfully' : changeResult.message
    );
    
    if (changeResult.success) {
      // Test authentication with new password
      const authResult = await AuthService.authenticate(testUser.email, newPassword);
      printResult(
        `Authenticate with new password for ${testUser.email}`,
        authResult.success,
        authResult.success ? 'Authentication successful with new password' : 'Failed to authenticate with new password'
      );
      
      // Test authentication with old password (should fail)
      const oldAuthResult = await AuthService.authenticate(testUser.email, testUser.password);
      printResult(
        `Authenticate with old password for ${testUser.email}`,
        !oldAuthResult.success,
        oldAuthResult.success ? 'Unexpectedly authenticated with old password' : 'Correctly rejected old password'
      );
      
      // Change password back to original
      const revertResult = await AuthService.changePassword(testUser.email, newPassword, testUser.password);
      printResult(
        `Revert Password for ${testUser.email}`,
        revertResult.success,
        revertResult.success ? 'Password reverted successfully' : revertResult.message
      );
    }
  } catch (error) {
    printResult(`Change Password for ${testUser.email}`, false, error.message);
  }
};

const testChangeEmail = async () => {
  print(colors.blue, '\n📧 Testing Change Email...');
  
  const testUser = testUsers[1]; // Use second user
  const newEmail = 'jane.updated@example.com';
  
  try {
    // Change email
    const changeResult = await AuthService.changeEmail(testUser.email, newEmail, testUser.password);
    printResult(
      `Change Email for ${testUser.email}`,
      changeResult.success,
      changeResult.success ? `Email changed to ${newEmail}` : changeResult.message
    );
    
    if (changeResult.success) {
      // Test authentication with new email
      const authResult = await AuthService.authenticate(newEmail, testUser.password);
      printResult(
        `Authenticate with new email ${newEmail}`,
        authResult.success,
        authResult.success ? 'Authentication successful with new email' : 'Failed to authenticate with new email'
      );
      
      // Test authentication with old email (should fail)
      const oldAuthResult = await AuthService.authenticate(testUser.email, testUser.password);
      printResult(
        `Authenticate with old email ${testUser.email}`,
        !oldAuthResult.success,
        oldAuthResult.success ? 'Unexpectedly authenticated with old email' : 'Correctly rejected old email'
      );
      
      // Change email back to original
      const revertResult = await AuthService.changeEmail(newEmail, testUser.email, testUser.password);
      printResult(
        `Revert Email for ${newEmail}`,
        revertResult.success,
        revertResult.success ? `Email reverted to ${testUser.email}` : revertResult.message
      );
    }
  } catch (error) {
    printResult(`Change Email for ${testUser.email}`, false, error.message);
  }
};

const testDeleteUser = async () => {
  print(colors.blue, '\n🗑️  Testing Delete User...');
  
  const testUser = testUsers[2]; // Use third user
  
  try {
    // Delete user
    const deleteResult = await AuthService.deleteUser(testUser.email);
    printResult(
      `Delete User ${testUser.email}`,
      deleteResult.success,
      deleteResult.success ? 'User deleted successfully' : deleteResult.message
    );
    
    if (deleteResult.success) {
      // Test that user no longer exists
      const existsResult = await AuthService.userExists(testUser.email);
      printResult(
        `User Exists Check after deletion for ${testUser.email}`,
        existsResult.success && !existsResult.exists,
        existsResult.success ? `User exists: ${existsResult.exists}` : existsResult.message
      );
      
      // Test authentication with deleted user (should fail)
      const authResult = await AuthService.authenticate(testUser.email, testUser.password);
      printResult(
        `Authenticate deleted user ${testUser.email}`,
        !authResult.success,
        authResult.success ? 'Unexpectedly authenticated deleted user' : 'Correctly rejected deleted user'
      );
      
      // Recreate the user for future tests
      const recreateResult = await AuthService.signup(testUser.userId, testUser.email, testUser.password);
      printResult(
        `Recreate User ${testUser.email}`,
        recreateResult.success,
        recreateResult.success ? 'User recreated successfully' : recreateResult.message
      );
    }
  } catch (error) {
    printResult(`Delete User ${testUser.email}`, false, error.message);
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
  print(colors.bright + colors.magenta, '🚀 PostgreSQL Authentication Test Suite (Full Features)');
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
    await testUserExists();
    await testGetAllUsers();
    await testChangePassword();
    await testChangeEmail();
    await testDeleteUser();
    await testDuplicateSignup();
    await testInvalidInputs();
    
    print(colors.bright + colors.green, '\n🎉 All tests completed!');
    print(colors.yellow, '💡 All user management operations are now available through the API.');
    
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
