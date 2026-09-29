const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  module: {
    type: String,
    enum: ['Infrastructure', 'Energy', 'Logistics', 'Environment'],
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  message: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
