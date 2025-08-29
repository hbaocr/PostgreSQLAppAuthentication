import pool from '../config/database.js';

export class AuthService {
  /**
   * Sign up a new user using PostgreSQL function
   * @param {number} userId - User ID
   * @param {string} email - User email
   * @param {string} password - Raw password
   * @returns {Promise<Object>} Result object
   */
  static async signup(userId, email, password) {
    try {
      const query = 'SELECT signup($1, $2, $3) as success';
      const result = await pool.query(query, [userId, email, password]);
      
      if (result.rows[0].success) {
        return {
          success: true,
          message: 'User signed up successfully',
          userId,
          email
        };
      } else {
        return {
          success: false,
          message: 'Signup failed'
        };
      }
    } catch (error) {
      console.error('Signup error:', error.message);
      return {
        success: false,
        message: error.message,
        error: error.code
      };
    }
  }

  /**
   * Authenticate a user using PostgreSQL function
   * @param {string} email - User email
   * @param {string} password - Raw password
   * @returns {Promise<Object>} Result object
   */
  static async authenticate(email, password) {
    try {
      const query = 'SELECT authenticate($1, $2) as success';
      const result = await pool.query(query, [email, password]);
      
      if (result.rows[0].success) {
        return {
          success: true,
          message: 'Authentication successful',
          email
        };
      } else {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      return {
        success: false,
        message: error.message,
        error: error.code
      };
    }
  }

  /**
   * Get user details using PostgreSQL function
   * @param {string} email - User email
   * @returns {Promise<Object>} Result object
   */
  static async getUserDetails(email) {
    try {
      const query = 'SELECT * FROM get_user_details($1)';
      const result = await pool.query(query, [email]);
      
      if (result.rows.length > 0) {
        return {
          success: true,
          user: result.rows[0]
        };
      } else {
        return {
          success: false,
          message: 'User not found'
        };
      }
    } catch (error) {
      console.error('Get user details error:', error.message);
      return {
        success: false,
        message: error.message,
        error: error.code
      };
    }
  }

  /**
   * Delete a user using PostgreSQL function
   * @param {string} email - User email
   * @returns {Promise<Object>} Result object
   */
  static async deleteUser(email) {
    try {
      const query = 'SELECT delete_user($1) as success';
      const result = await pool.query(query, [email]);
      
      if (result.rows[0].success) {
        return {
          success: true,
          message: 'User deleted successfully',
          email
        };
      } else {
        return {
          success: false,
          message: 'User deletion failed'
        };
      }
    } catch (error) {
      console.error('Delete user error:', error.message);
      return {
        success: false,
        message: error.message,
        error: error.code
      };
    }
  }

  /**
   * Change user password using PostgreSQL function
   * @param {string} email - User email
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result object
   */
  static async changePassword(email, oldPassword, newPassword) {
    try {
      const query = 'SELECT change_password($1, $2, $3) as success';
      const result = await pool.query(query, [email, oldPassword, newPassword]);
      
      if (result.rows[0].success) {
        return {
          success: true,
          message: 'Password changed successfully',
          email
        };
      } else {
        return {
          success: false,
          message: 'Password change failed'
        };
      }
    } catch (error) {
      console.error('Change password error:', error.message);
      return {
        success: false,
        message: error.message,
        error: error.code
      };
    }
  }

  /**
   * Change user email using PostgreSQL function
   * @param {string} oldEmail - Current email
   * @param {string} newEmail - New email
   * @param {string} password - User password for verification
   * @returns {Promise<Object>} Result object
   */
  static async changeEmail(oldEmail, newEmail, password) {
    try {
      const query = 'SELECT change_email($1, $2, $3) as success';
      const result = await pool.query(query, [oldEmail, newEmail, password]);
      
      if (result.rows[0].success) {
        return {
          success: true,
          message: 'Email changed successfully',
          oldEmail,
          newEmail
        };
      } else {
        return {
          success: false,
          message: 'Email change failed'
        };
      }
    } catch (error) {
      console.error('Change email error:', error.message);
      return {
        success: false,
        message: error.message,
        error: error.code
      };
    }
  }

  /**
   * Get all users using PostgreSQL function
   * @returns {Promise<Object>} Result object
   */
  static async getAllUsers() {
    try {
      const query = 'SELECT * FROM get_all_users()';
      const result = await pool.query(query);
      
      return {
        success: true,
        users: result.rows,
        count: result.rows.length
      };
    } catch (error) {
      console.error('Get all users error:', error.message);
      return {
        success: false,
        message: error.message,
        error: error.code
      };
    }
  }

  /**
   * Check if user exists using PostgreSQL function
   * @param {string} email - User email
   * @returns {Promise<Object>} Result object
   */
  static async userExists(email) {
    try {
      const query = 'SELECT user_exists($1) as exists';
      const result = await pool.query(query, [email]);
      
      return {
        success: true,
        exists: result.rows[0].exists,
        email
      };
    } catch (error) {
      console.error('User exists check error:', error.message);
      return {
        success: false,
        message: error.message,
        error: error.code
      };
    }
  }
}
