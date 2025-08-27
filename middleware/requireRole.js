export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists in request (set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions. Required roles: ' + allowedRoles.join(', ')
        });
      }

      next();
    } catch (error) {
      console.error('Error in requireRole middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};









