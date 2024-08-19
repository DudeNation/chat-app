const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = function(io) {
  // Profile routes
  router.get('/', auth, async (req, res) => {
    try {
      const user = await User.findById(req.session.userId);
      res.render('profile', { user });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });

  router.post('/update', upload.single('avatar'), async (req, res) => {
    try {
      const user = await User.findById(req.session.userId);
      user.username = req.body.username;
      user.email = req.body.email;
      if (req.file) {
        user.avatar = '/uploads/' + req.file.filename;
      }
      await user.save();

      // Emit the 'user avatar updated' event with user information
      io.emit('user avatar updated', {
        userId: user._id,
        avatar: user.avatar
      });

      res.redirect('/chat');
    } catch (error) {
      console.error('Update failed:', error);
      res.status(500).send('Update failed');
    }
  });

  return router;
};
