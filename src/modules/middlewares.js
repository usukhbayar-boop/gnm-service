// File: middleware/auth.middleware.js

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
}
  
  // Example admin middleware (you'd need to add an admin field to your user table)
function isAdmin(req, res, next) {
    if (req.user && req.user.is_admin) {
      return next();
    }
    res.status(403).json({ message: 'Forbidden: Admin access required' });
}
  
module.exports = {
    isAuthenticated,
    isAdmin
};