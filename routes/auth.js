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

    // Convert username and email to lowercase
    const lowerCaseUsername = username.toLowerCase();
    const lowerCaseEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username: lowerCaseUsername }, { email: lowerCaseEmail }] });
    if (existingUser) {
      return res.status(400).render('register', { 
        title: 'Register', 
        error: 'Username or email already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username: lowerCaseUsername, email: lowerCaseEmail, password: hashedPassword, isAdmin: lowerCaseUsername === 'admin' });
    await user.save();

    // req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/auth/login?username=' + user.username + '&message=Registration successful');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('register', { 
      title: 'Register', 
      error: 'Registration failed. Please try again.' 
    });
  }
});

router.get('/login', (req, res) => {
  const data = JSON.stringify(req.query);
  let BLACK_LIST = [
    "outputFunctionName",
    "escapeFunction",
    "localsName",
    "destructuredLocals"
  ];

  if (BLACK_LIST.find((item) => data.includes(item))) {
    return res.redirect('/auth/login');
  }

  res.render('login', {...JSON.parse(data), cache: false });
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password, remember } = req.body;

  try {
    // Convert the username to lowercase for case-insensitive comparison
    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
    if (!user) {
      // return res.status(400).json({ error: 'Invalid email or password.' });
      return res.render('login', { username, message: 'Invalid username or password' });
    }

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { username, message: 'Invalid username or password' });
    }

    // If login is successful, you can set up a session or JWT token here
    req.session.userId = user._id;
    req.session.remember = remember;

    res.redirect('/chat');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { username, message: 'Internal Server Error' });
  }
});

router.get('/logout', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    user.status = 'offline';
    await user.save();
    req.session.destroy();
    res.redirect('/auth/login?username=' + user.username);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

