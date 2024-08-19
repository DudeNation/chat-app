const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  room: { type: String, required: true },
  url_info: { type: Object, default: {} },
});

module.exports = mongoose.model('Message', messageSchema);
