const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');
const Message = require('../models/message');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const messages = await Message.find({ room: 'General' }).populate('sender');
    res.render('chat', { title: 'Chat Room', user, messages });
  } catch (error) {
    console.error('Error retrieving chat messages:', error);
    res.status(500).send('Server Error');
  }
});

router.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.session.userId);
    const newMessage = new Message({
      sender: user._id,
      content: message,
      room: 'General',
    });
    await newMessage.save();
    res.redirect('/chat');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;