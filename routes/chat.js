const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');

router.get('/', auth, (req, res) => {
  res.render('chat', { 
    user: req.user,
    title: 'Chat Room'
  });
});

module.exports = router;

