const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  isAdmin: { type: Boolean, default: false },
  avatar: { type: String, default: 'default-avatar.jpg' },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' }
});

// // Hash the password before saving the user model
// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   const hashedPassword = await bcrypt.hash(this.password, 10);
//   this.password = hashedPassword;
//   next();
// });

module.exports = mongoose.model('User', UserSchema);
