const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

router.get('/', adminAuth, (req, res) => {
  res.render('admin');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Hardcoded admin credentials
  const adminUsername = 'admin';
  const adminPassword = 'password';

  if (username === adminUsername && password === adminPassword) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.status(401).render('adminLogin', {
      error: 'Invalid admin credentials',
    });
  }
});

module.exports = router;
