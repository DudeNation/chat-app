const User = require('../models/user');

module.exports = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/auth/login');
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).send(error);
  }
};

