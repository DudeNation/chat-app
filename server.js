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
const io = require('socket.io')(server);
const socketSession = require('express-socket.io-session');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
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
  // Get the user ID from the session
  const userId = socket.handshake.session.userId;
  console.log('User connected:', socket.user.username);

  // Retrieve the user information from the database
  User.findById(userId)
    .then((user) => {
      if (user) {
        // Attach the user object to the socket
        socket.user = user;
        console.log('User connected:', socket.user.username);
        // Handle joining a chat room
        socket.on('join room', (room) => {
          socket.join(room);
          io.to(room).emit('user joined', socket.user.username, room);
        });

        // Handle leaving a chat room
        socket.on('leave room', (room) => {
          socket.leave(room);
          io.to(room).emit('user left', socket.user.username, room);
        });

        // Handle chat messages
        socket.on('chat message', (data, room) => {
          io.to(room).emit('chat message', {
            username: socket.user.username,
            text: data.text,
            file: data.file,
            avatar: socket.user.avatar
          });
        });  

        // Handle user disconnection
        socket.on('disconnect', () => {
          console.log('User disconnected:', socket.user.username);
        });

        socket.on('create room', (roomName, isPrivate) => {
          const pinCode = isPrivate ? generatePinCode() : null;
          const room = { name: roomName, isPrivate, pinCode };
          // Add the room to the list of rooms
          socket.emit('room created', room);
        });
      } else {
        console.log('User not found');
        socket.disconnect();
      }
    })
    .catch((error) => {
      console.error('Error retrieving user:', error);
      socket.disconnect();
    });

  
});

const PORT = process.env.PORT || 1212;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
