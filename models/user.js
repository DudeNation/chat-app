const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  isAdmin: { type: Boolean, default: false },
  avatar: { type: String, default: '/images/default-avatar.png' },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' }
});

module.exports = mongoose.model('User', UserSchema);
