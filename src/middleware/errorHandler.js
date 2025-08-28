/**
 * Global error handling middleware
 * @param {Error} error - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error stack:', error.stack);
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};

/**
 * 404 handler for undefined routes
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};
