const bcrypt = require('bcryptjs');
const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input fields
    if (!username || !email || !password) {
      return res.status(400).render('register', {
        error: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).render('register', {
        error: 'Username or email already exists',
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    req.flash('success', 'Registration successful. Please login.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('register', {
      error: 'An error occurred. Please try again.',
    });
  }
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input fields
    if (!username || !email || !password) {
      return res.status(400).render('register', {
        error: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).render('register', {
        error: 'Username or email already exists',
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    req.flash('success', 'Registration successful. Please login.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('register', {
      error: 'An error occurred. Please try again.',
    });
  }
});


router.get('/logout', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    user.status = 'offline';
    await user.save();
    req.session.destroy();
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

