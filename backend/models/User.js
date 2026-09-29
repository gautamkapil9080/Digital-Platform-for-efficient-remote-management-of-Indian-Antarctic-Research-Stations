const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  // operator: station staff, can log data / resolve alerts / restock
  // hq: NCPOR HQ, read-only oversight across both stations
  role: { type: String, enum: ['operator', 'hq'], default: 'hq' },
  name: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
