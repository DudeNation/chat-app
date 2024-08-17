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

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/profile', profileRoutes);

// Root route
app.get('/', (req, res) => {
  res.render('home', { title: 'CHAT-APP FOR EVERYONE' });
});

const activeUsers = new Set();
const chatRooms = new Set(['General']);

// Socket.io
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('user connected', (userData) => {
    socket.username = userData.username;
    socket.avatar = userData.avatar;
    activeUsers.add(socket.username);
    io.emit('update active users', Array.from(activeUsers));
    io.emit('update chat rooms', Array.from(chatRooms));
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

  socket.on('chat message', (msg, room) => {
    io.to(room).emit('chat message', { username: socket.username, message: msg });
  });

  socket.on('disconnect', () => {
    activeUsers.delete(socket.username);
    io.emit('update active users', Array.from(activeUsers));
    io.emit('user offline', socket.username);
  });
});

const PORT = process.env.PORT || 1212;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
