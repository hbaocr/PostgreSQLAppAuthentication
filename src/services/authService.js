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
}
