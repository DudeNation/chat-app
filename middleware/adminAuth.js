// middleware/adminAuth.js

module.exports = (chatRooms) => {
  return (req, res, next) => {
    if (req.path !== '/admin/login' && !req.session.isAdmin) {
      return res.redirect('/admin/login');
    }
    res.locals.chatRooms = chatRooms ? Array.from(chatRooms) : [];
    next();
  };
};
