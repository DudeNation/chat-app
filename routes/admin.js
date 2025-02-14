// routes/admin.js

const express = require('express');
const multer = require('multer');
const path = require('path');

module.exports = (chatRooms) => {
  const router = express.Router();
  const adminAuth = require('../middleware/adminAuth')(chatRooms);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
      cb(null, 'background' + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: storage });

  router.get('/login', (req, res) => {
    res.render('adminLogin');
  });

  router.get('/', adminAuth, (req, res) => {
    res.render('admin', { chatRooms: Array.from(chatRooms) });
  });

  router.post('/update-background', adminAuth, upload.single('background'), async (req, res) => {
    try {
      if (req.file) {
        console.log('Background image updated successfully');
      }
      res.redirect('/admin');
    } catch (error) {
      console.error('Background update error:', error);
      res.status(500).send('Server Error');
    }
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).render('adminLogin', {
        error: 'Please provide username and password'
      });
    }

    // Hardcoded admin credentials
    const adminUsername = 'admin';
    const adminPassword = 'cEBzU3cwckQjOno0';

    if (username === adminUsername && password === adminPassword) {
      req.session.isAdmin = true;
      res.redirect('/admin');
    } else {
      res.status(401).render('adminLogin', {
        error: 'Invalid admin credentials',
      });
    }
  });

  return router;
};
