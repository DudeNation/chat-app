// server.js
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
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
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.render('home', { title: 'CHAT-APP FOR EVERYONE' });
});

const activeUsers = new Set();
const chatRooms = new Set(['General']);

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a chat room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log('User joined room:', roomId);
  });

  // Handle leaving a chat room
  socket.on('leaveRoom', () => {
    console.log('User left room:', socket.id);
    socket.leaveAll();
  });

  // Handle chat messages
  socket.on('chatMessage', (message) => {
    io.to(socket.roomId).emit('chatMessage', message);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 1212;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
