const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const linkPreviewGenerator = require('link-preview-generator');
var XSSFilter = require('xssfilter');
var xssFilter = new XSSFilter();
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const Message = require('./models/message'); // Assuming you have a Message model
const User = require('./models/user'); // Assuming you have a User model
const DEFAULT_AVATAR = '/images/default-avatar.png';

const session = require('express-session')({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
});
const sharedsession = require("express-socket.io-session");


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session);
app.use(flash());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.render('home', { title: 'CHAT-APP FOR EVERYONE' });
});

const activeUsers = new Set();
const chatRooms = new Set(['General']);

// Socket.io



const io = socketIo(server);
io.use(sharedsession(session));

const profileRoutes = require('./routes/profile')(io);
app.use('/profile', profileRoutes);

io.on('connection', async (socket) => {
  if (!socket.handshake.session.userId) {
    socket.emit('unauthorized', 'You are not authorized to join the chat');
    return socket.disconnect();
  }

  const user = await User.findById(socket.handshake.session.userId);
  if (user) {
    socket.userId = user._id;
    socket.username = user.username;
    socket.avatar = user.avatar || '/images/default-avatar.png';
    activeUsers.add(socket.username);
    socket.join('General');

    const recentMessages = await Message.find({ room: 'General' })
      .sort({ timestamp: -1 })
      .limit(1)
      .populate('sender', 'username avatar');
    socket.emit('chat history', recentMessages.reverse());

    io.to('General').emit('user joined', `${socket.username} joined the chat`);
    io.emit('update active users', Array.from(activeUsers).map(username => {
      const userObj = Array.from(activeUsers).find(user => user.username === username);
      return {
        username,
        avatar: userObj ? userObj.avatar : '/images/default-avatar.png',
        status: 'online'
      };
    }));
    io.emit('update chat rooms', Array.from(chatRooms));
    console.log(`${user.username} connected`);
  } else {
    socket.emit('unauthorized', 'You are not authorized to join the chat');
    return socket.disconnect();
  }

  socket.on('disconnect', () => {
    if (socket.username) {
      activeUsers.delete(socket.username);
      io.to('General').emit('user left', `${socket.username} left the chat`);
      io.emit('update active users', Array.from(activeUsers).map(username => {
        const userObj = Array.from(activeUsers).find(user => user.username === username);
        return {
          username,
          avatar: userObj ? userObj.avatar : '/images/default-avatar.png',
          status: username === socket.username ? 'offline' : 'online'
        };
      }));
      console.log(`${socket.username} disconnected`);
    }
  });

  socket.on('chat message', async (msg, room) => {
    // parse first link in message
    const urls = msg.text.match(/\bhttps?:\/\/\S+/gi);
    let url_info = {};
    if (urls) {
      try {
        const preview = await linkPreviewGenerator(urls[0]);
        url_info = {
          title: preview.title,
          description: preview.description,
          image: preview.img
        };
      } catch(e) {
        console.error('Error fetching link preview:', e);
      } 
    }

    let userMsg = xssFilter.filter(msg.text);

    const user = await User.findById(socket.userId);
    const message = new Message({
      sender: user._id,
      content: userMsg,
      room: room,
      timestamp: new Date(),
      url_info: url_info
    });
    await message.save();

    // Update the user's avatar in the activeUsers set
    const userObj = Array.from(activeUsers).find(u => u.username === socket.username);
    if (userObj) {
      userObj.avatar = user.avatar;
    }

    io.to(room).emit('chat message', { 
      username: socket.username, 
      text: userMsg, 
      avatar: user.avatar || '/images/default-avatar.png',
      timestamp: message.timestamp,
      url_info
    });

    // Emit the updated active users list
    io.emit('update active users', Array.from(activeUsers).map(username => {
      const user = Array.from(activeUsers).find(u => u.username === username);
      return {
        username: user ? user.username : username,
        avatar: user ? user.avatar : '/images/default-avatar.png',
        status: 'online'
      };
    }));

    console.log(`Message from ${socket.username}: ${msg.text}`);
  });

  socket.on('create room', (room) => {
    chatRooms.add(room);
    io.emit('update chat rooms', Array.from(chatRooms));
    socket.join(room);
    io.to(room).emit('user joined', { username: socket.username, room });
  });

  socket.on('join room', (room) => {
    socket.join(room);
    io.to(room).emit('user joined', socket.username, room);
  });

  socket.on('leave room', (room) => {
    socket.leave(room);
    io.to(room).emit('user left', socket.username, room);
  });

});

const PORT = process.env.PORT || 1212;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
