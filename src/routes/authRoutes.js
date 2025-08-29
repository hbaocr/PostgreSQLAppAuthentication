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

/**
 * @route DELETE /api/auth/user/:email
 * @desc Delete a user
 * @access Public (for testing)
 */
router.delete('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const result = await AuthService.deleteUser(email);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Delete user route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/auth/user/password
 * @desc Change user password
 * @access Public (for testing)
 */
router.put('/user/password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validation
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, oldPassword, newPassword'
      });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const result = await AuthService.changePassword(email, oldPassword, newPassword);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Change password route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/auth/user/email
 * @desc Change user email
 * @access Public (for testing)
 */
router.put('/user/email', async (req, res) => {
  try {
    const { oldEmail, newEmail, password } = req.body;

    // Validation
    if (!oldEmail || !newEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: oldEmail, newEmail, password'
      });
    }

    if (typeof newEmail !== 'string' || !newEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid new email format'
      });
    }

    const result = await AuthService.changeEmail(oldEmail, newEmail, password);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Change email route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/auth/users
 * @desc Get all users
 * @access Public (for testing)
 */
router.get('/users', async (req, res) => {
  try {
    const result = await AuthService.getAllUsers();
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Get all users route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/auth/user/:email/exists
 * @desc Check if user exists
 * @access Public (for testing)
 */
router.get('/user/:email/exists', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const result = await AuthService.userExists(email);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('User exists route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
