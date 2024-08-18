const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('profile', { title: 'Profile', user });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

router.post('/update', upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (req.file) {
      user.avatar = req.file.filename;
      await user.save();
    }
    res.redirect('/profile');
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

