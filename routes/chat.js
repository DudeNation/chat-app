const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');

router.get('/', auth, async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  try {
    const user = await User.findById(req.session.userId);
    res.render('chat', { title: 'Chat', user });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
