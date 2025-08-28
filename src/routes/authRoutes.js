import express from 'express';
import { AuthService } from '../services/authService.js';

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Sign up a new user
 * @access Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { userId, email, password } = req.body;

    // Validation
    if (!userId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, email, password'
      });
    }

    if (typeof userId !== 'number' || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'userId must be a positive number'
      });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const result = await AuthService.signup(userId, email, password);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Signup route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate a user
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password'
      });
    }

    const result = await AuthService.authenticate(email, password);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/auth/user/:email
 * @desc Get user details
 * @access Public (for testing)
 */
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const result = await AuthService.getUserDetails(email);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get user details route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
