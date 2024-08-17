// middleware/auth.js
module.exports = (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }
    next();
  };
  
  // middleware/adminAuth.js
  module.exports = (req, res, next) => {
    if (!req.session.isAdmin) {
      return res.redirect('/admin/login');
    }
    next();
  };
  